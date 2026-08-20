# Tu Núcleo — WH · Plan de trabajo

Panel propio para administrar las publicaciones de **Warnes Herramientas** en
MercadoLibre (~920 activas) sin depender del panel de ML ni del Editor masivo.

Proyecto standalone: Next.js (App Router) en Vercel + Supabase (Postgres + Auth).
Todas las llamadas a la API de ML salen del servidor, nunca del navegador.

---

## Estado: esperando confirmación. No hay código escrito todavía.

---

## 1. Qué se verificó de la API de ML (y qué falta)

La documentación oficial de MercadoLibre está bloqueada por la política de red del
entorno donde se armó este plan. Lo siguiente se contrastó con fuentes secundarias
y **debe reconfirmarse contra el devsite oficial antes de escribir el código**:

| Punto | Dato | Confianza |
|-------|------|-----------|
| Vida del `access_token` | 6 horas | Alta |
| `refresh_token` | De un solo uso, rota en cada refresco | Alta |
| PKCE | Opcional, solo si se habilita en la aplicación | Media |
| Rate limit | ~1.500 requests/minuto por vendedor; 429 al excederlo | Media |
| Listado de ítems | `/users/{id}/items/search`, `offset`/`limit`, tope de 1.000 con offset; `search_type=scan` + `scroll_id` (expira a los 5 min) para más | Alta |
| SKU | El campo correcto es el atributo **`SELLER_SKU`**; `seller_custom_field` es un campo aparte, de uso interno, sin relación entre ambos | Alta |
| Multiget de ítems | `/items?ids=...&attributes=...` por lotes | Alta (falta confirmar el tope exacto de IDs por llamada) |

**A confirmar sí o sí antes de codear:**
1. Tope exacto de IDs por llamada al multiget (el valor que se maneja habitualmente es 20).
2. Cómo se lee hoy el **stock en Full**: `available_quantity` es el total de la
   publicación; el stock de fulfillment se resuelve aparte (`inventory_id` /
   endpoints de fulfillment), y hay cuentas migradas al modelo de `user_products`.
   Esto cambió más de una vez y define el diseño de la tabla.
3. Endpoint vigente de **visitas** por lote y ventana de fechas.
4. Cómo se obtiene la **comisión**: no viene en el ítem. Se calcula con
   `/sites/MLA/listing_prices` según precio + categoría + tipo de publicación.
5. Scopes exactos a pedir en el OAuth (`offline_access` es el que habilita el refresh).

## 2. Arquitectura en criollo

```
   Navegador  ──login──►  Next.js en Vercel  ──►  Supabase (Postgres)
   (solo ve                    │  guarda el espejo local de las publicaciones
    HTML/JSON                  │
    de Next)                   └──►  API de MercadoLibre
                                     (tokens y llamadas: solo del lado servidor)
```

**Espejo local.** El panel no le pregunta a ML cada vez que mirás una pantalla:
trabaja contra una copia de las publicaciones guardada en Supabase. Por eso la
grilla vuela con 920 filas y el Excel sale al instante. La copia se refresca con
el botón "Sincronizar" y automáticamente.

**Los tokens nunca salen del servidor.** Viven en una tabla de Supabase a la que
el navegador no tiene acceso. El front pide datos a Next, y Next habla con ML.

## 3. Fase 1 — Conexión y lectura

### 1.1 Login del panel
Supabase Auth con un solo usuario (vos). Registro público **deshabilitado**: el
usuario se crea a mano desde el panel de Supabase. Queda una tabla `app_users`
con un campo de rol, sin usar por ahora, para poder sumar gente después sin migrar nada.

### 1.2 Conexión con MercadoLibre (OAuth)
- Pantalla "Conexión" con un botón **Conectar con MercadoLibre**.
- Flujo authorization code: ML te devuelve a nuestro `redirect_uri` con un código,
  el servidor lo canjea por `access_token` + `refresh_token` y los guarda.
- **Renovación con candado.** Como el refresh es de un solo uso, si dos procesos
  intentan renovar a la vez, uno de los dos quema el token y la conexión se cae.
  Se resuelve con un bloqueo de fila en Postgres (`SELECT ... FOR UPDATE`): el
  segundo proceso espera y reutiliza el token que consiguió el primero.
- Si el refresh se pierde igual, la conexión pasa a estado `needs_reconnect` y el
  panel muestra un cartel rojo pidiendo reconectar. Nunca falla en silencio.

### 1.3 Sincronización
1. Se piden todos los IDs de ítems del vendedor, paginando.
2. Se traen los datos en lotes con el multiget, pidiendo solo los campos necesarios.
3. Se hace *upsert* en la tabla espejo y se registra la corrida en `sync_runs`
   (cuándo, cuántos ítems, cuántas llamadas, errores).
4. Reintentos con backoff exponencial ante 429 o error de red.

Con ~920 ítems y lotes de 20, son unas 50 llamadas: muy lejos del rate limit.

**Cuándo corre:** botón manual + programada. Ver decisión D1 más abajo.

### 1.4 La grilla
- Buscador por título / SKU / ID.
- Filtros: estado, categoría, sin stock, sin SKU, tipo de envío, rango de precio.
- Orden por cualquier columna, paginado del lado del servidor.
- **Exportar a Excel** lo que quedó filtrado, con las columnas visibles.
- Diseño blanco y negro, sobrio. Tipografía chica, densidad alta, cero adornos:
  es una herramienta de trabajo, no una landing.

## 4. Fase 2 — Escritura (recién cuando la Fase 1 esté andando)

- Edición de precio, stock y estado (activar/pausar), de a uno y en masa.
- En masa: selección múltiple + aplicar porcentaje o monto fijo.
- **Confirmación previa obligatoria**: pantalla con el detalle exacto de cada
  cambio (valor viejo → valor nuevo) antes de tocar nada.
- **Sin auditoría no se escribe**: cada cambio se registra con fecha, usuario,
  valor anterior, valor nuevo y respuesta de ML.
- Si ML rechaza un ítem, el lote sigue; al final se muestra el listado de fallidos
  con el motivo.
- **Detección de conflictos**: se guarda el `last_updated` que ML informa de cada
  publicación. Antes de escribir se compara; si cambió respecto de nuestra copia,
  el sistema **no pisa nada**, marca el conflicto y decidís vos.

## 5. Fase 3 — Relevar más adelante
Preguntas sin responder, ventas y envíos, rentabilidad por publicación cruzando
con costo de compra. No se implementa ahora, pero el modelo de datos no lo estorba.

## 6. Decisiones pendientes

Ver `docs/01-decisiones.md`.

## 7. Base de datos

Ver `docs/02-esquema.sql` — listo para copiar y pegar en el editor SQL de Supabase.
