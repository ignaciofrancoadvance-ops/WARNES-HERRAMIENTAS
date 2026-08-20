# Fase 1 — Especificación de implementación

Objetivo: **conectar la cuenta de ML, traer las ~920 publicaciones a una copia
local, y poder verlas, filtrarlas y exportarlas a Excel.** Sin escritura todavía.

---

## §0 · Verificar contra la documentación oficial ANTES de codear

Estos cinco puntos no se pudieron confirmar y condicionan el diseño. Leelos en
`developers.mercadolibre.com.ar` y dejá anotado en este archivo qué encontraste:

1. **Tope de IDs por llamada al multiget** `/items?ids=...` (se maneja 20 — confirmar).
2. **Stock en Full.** `available_quantity` es el total de la publicación. El stock
   de fulfillment se resuelve aparte (`inventory_id`, endpoints de fulfillment) y
   hay cuentas migradas al modelo de `user_products`. Confirmar cómo se lee hoy.
3. **Visitas** — endpoint vigente por lote y ventana de fechas.
4. **Comisión** — no viene en el ítem. Se calcula con `/sites/MLA/listing_prices`
   (precio + `category_id` + `listing_type_id`). *Ver D3: en Fase 1 no se implementa.*
5. **Scopes** exactos del OAuth. `offline_access` es el que habilita el refresh.

Confirmado y ya asumido como cierto:
- `access_token`: 6 horas. `refresh_token`: **de un solo uso, rota en cada refresco**.
- Rate limit ~1.500 req/min por vendedor → con 920 ítems y lotes de 20 son ~50
  llamadas por sync. No es un problema en este proyecto.
- SKU: atributo **`SELLER_SKU`**. `seller_custom_field` es un campo distinto, de
  uso interno del vendedor, sin relación con el anterior. Leer **los dos**.
- PKCE: opcional, solo si se habilita en la aplicación.

## §1 · Decisiones ya tomadas (por defecto — el dueño puede cambiarlas)

| # | Decisión | Elegido |
|---|----------|---------|
| D1 | Frecuencia de sync | **Vercel Hobby (gratis) + webhooks de ML** + cron diario de respaldo + botón manual. El plan gratis solo admite **un cron por día** |
| D2 | Dominio | A definir por el dueño. Todo lee `APP_URL`, nada hardcodeado |
| D3 | Comisión y neto | **No en Fase 1.** El neto real descuenta el envío gratis; sin eso el número queda inflado. Va a Fase 3 con rentabilidad |
| D4 | Visitas | **No en Fase 1** |
| D5 | Full | Detectar en la primera sync cuántas publicaciones son `fulfillment` y mostrar el dato. Columna `fulfillment_quantity` ya prevista |

## §2 · Variables de entorno

```
APP_URL=https://<dominio-de-produccion>
ML_APP_ID=...
ML_CLIENT_SECRET=...
ML_REDIRECT_URI=https://<dominio-de-produccion>/api/ml/callback
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=<string random largo>
```

`SUPABASE_SERVICE_ROLE_KEY` **jamás** con prefijo `NEXT_PUBLIC_`: ese prefijo la
publicaría en el navegador y daría acceso total a la base.

## §3 · Estructura

```
app/
  login/page.tsx                    login con Supabase Auth
  (panel)/layout.tsx                sidebar + guard de sesión
  (panel)/publicaciones/page.tsx    la grilla (pantalla principal)
  (panel)/conexion/page.tsx         estado de la conexión + historial de syncs
  api/
    ml/auth/route.ts                arranca el OAuth
    ml/callback/route.ts            recibe el code y guarda los tokens
    ml/sync/route.ts                sync manual (POST, requiere sesión)
    ml/notifications/route.ts       webhook de ML (POST, público)
    cron/sync/route.ts              sync programada (GET, header CRON_SECRET)
    export/route.ts                 genera el .xlsx
lib/
  supabase/admin.ts                 cliente service_role (solo servidor)
  supabase/server.ts                cliente de sesión (cookies)
  ml/client.ts                      fetch a ML con retry/backoff y contador
  ml/tokens.ts                      obtener access_token válido, con lock
  ml/sync.ts                        orquestador de la sincronización
  ml/mappers.ts                     respuesta de ML → fila de ml_items
vercel.json                         cron diario
```

## §4 · OAuth

**Ida** — `/api/ml/auth`: genera un `state` aleatorio, lo guarda en cookie
httpOnly, y redirige a la URL de autorización de ML de Argentina con
`response_type=code`, `client_id`, `redirect_uri` y `state`.

**Vuelta** — `/api/ml/callback`: valida que el `state` coincida (si no, cortar),
canjea el `code` por tokens contra `/oauth/token`, y hace *upsert* en
`ml_accounts` con `status='connected'`, `access_expires_at = now() + expires_in`.

**Renovación con lock** — `lib/ml/tokens.ts`:

```
1. Leer la cuenta. Si el access_token vence en más de 5 minutos → usarlo y listo.
2. Tomar el lease:
     update ml_accounts
        set refresh_lock_until = now() + interval '30 seconds'
      where id = $1
        and (refresh_lock_until is null or refresh_lock_until < now())
      returning *
3. Si devolvió 0 filas → otro proceso está renovando.
     Esperar 500 ms, releer, reintentar hasta 5 veces.
     Si al releer el token ya está fresco → usarlo.
4. Si obtuvo el lease → llamar a /oauth/token con grant_type=refresh_token.
   GUARDAR EL REFRESH NUEVO INMEDIATAMENTE, en el mismo update que el access.
   Liberar el lease (refresh_lock_until = null).
5. Si ML rechaza el refresh → status='needs_reconnect', guardar last_error,
   liberar el lease, y que el panel muestre el cartel de reconexión.
```

Este paso es el que más rompe integraciones con ML. Escribirlo con cuidado.

## §5 · Sincronización — `lib/ml/sync.ts`

1. Crear fila en `sync_runs` con `status='running'` y el `origen`.
2. Traer todos los IDs: `/users/{ml_user_id}/items/search` con
   **`search_type=scan`** y `scroll_id` (el scroll expira a los 5 minutos).
   Con offset el tope es 1.000 y hay 920 publicaciones: demasiado al límite.
3. Traer los datos por lotes con el multiget, pidiendo solo los `attributes`
   necesarios (no traer el ítem completo).
4. *Upsert* en `ml_items` por `item_id`. Guardar la respuesta cruda en `raw`.
5. Los ítems que existían y no vinieron en una corrida completa → `stale = true`.
6. Cerrar `sync_runs` con contadores y `status='ok'` o `'error'`.

**Cliente HTTP** — `lib/ml/client.ts`: reintentos con backoff exponencial
(1s, 2s, 4s, 8s) ante 429 y errores de red; respetar `Retry-After` si viene;
contar llamadas para el registro; **nunca loguear tokens ni el client secret**.

**Timeout de Vercel:** el default es 10 segundos. Poner `export const maxDuration = 60`
en las rutas de sync. Si igual no entra, partir la corrida en tandas.

## §6 · Webhooks de ML

`/api/ml/notifications` — público, sin sesión.

- **Responder 200 en menos de 500 ms.** Procesar después, con `waitUntil()` de
  `@vercel/functions`, no antes de responder. Si ML no recibe el 200 a tiempo,
  reintenta y termina dando de baja la suscripción.
- **El payload no viene firmado.** Tomar solo el `resource` (ej. `/items/MLA123`)
  y **volver a pedirle el ítem a la API** para actualizar la copia. Nunca guardar
  lo que trae el webhook.
- Ignorar notificaciones cuyo `user_id` no sea la cuenta conectada.
- Los topics a suscribir se configuran en el devcenter, en la misma aplicación.

## §7 · Cron

`vercel.json`:

```json
{ "crons": [ { "path": "/api/cron/sync", "schedule": "0 9 * * *" } ] }
```

Los crons de Vercel corren en **UTC**: `0 9 * * *` son las 06:00 de Argentina.
La ruta se protege comparando el header `Authorization` contra `CRON_SECRET`;
sin eso, cualquiera puede disparar sincronizaciones.

## §8 · La grilla

- Paginado, filtrado y ordenado **del lado del servidor** (no traer 920 filas al
  navegador para filtrarlas ahí). 50 por página.
- Buscador por título / SKU / item_id. El título usa el índice trigram.
- Filtros: estado, categoría, **sin stock**, **sin SKU**, tipo de envío, rango de precio.
- Columnas: foto, título, SKU, ID, estado, precio, stock, Full, tipo de publicación,
  envío, categoría, catálogo, link a ML, última sincronización.
- Arriba, una barra con: total, activas, pausadas, **sin stock**, **sin SKU**.
  Ese resumen es la respuesta a "qué tengo que arreglar hoy".
- **Exportar a Excel** respeta los filtros aplicados y exporta las columnas
  visibles. Se genera en el servidor con `exceljs`.

## §9 · Orden de trabajo sugerido

1. Proyecto Next + Tailwind + shadcn, deploy vacío a Vercel (que ande el dominio).
2. SQL en Supabase + login + guard de sesión.
3. OAuth completo y pantalla de Conexión. **Verificar que el refresco funcione**
   dejándolo pasar las 6 horas antes de seguir.
4. Sincronización + registro de corridas + botón manual.
5. Grilla con filtros y buscador.
6. Exportar a Excel.
7. Cron diario y webhooks.

No pasar al punto siguiente sin que el anterior ande de verdad contra la cuenta real.
