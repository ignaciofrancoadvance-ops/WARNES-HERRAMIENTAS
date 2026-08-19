# Tu Núcleo — Arquitectura base

Plataforma central de gestión para **Warnes Herramientas** (~5.000 SKUs).
Objetivo: que el negocio deje de depender de MercadoLibre y que todos los canales
(ML, Tienda Nube, mostrador) cuelguen de un único núcleo de datos.

---

## 1. La idea rectora

> **Tu Núcleo es el dueño de la verdad. Los canales son espejos.**

Todo lo demás (facturación, documentos, reportes, reposición) se apoya sobre eso.
Si esta regla se rompe una sola vez, el sistema se convierte en tres inventarios
distintos peleándose entre sí.

```
                        ┌──────────────────────────┐
                        │        TU NÚCLEO         │
                        │  PIM + Stock + Órdenes   │
                        └────────────┬─────────────┘
             push precio/stock       │        ingesta ventas (webhooks)
        ┌───────────────┬────────────┼────────────┬───────────────┐
        ▼               ▼            ▼            ▼               ▼
  MercadoLibre     Tienda Nube    Mostrador   Facturación     Documentos
   (API + WH)       (API + WH)     (POS)      ARCA/AFIP        (S3/R2)
```

## 2. Módulos (en orden de dependencia)

| # | Módulo | Qué resuelve |
|---|--------|--------------|
| 1 | **PIM / Maestro de artículos** | SKU interno único, nombre, marca, categoría, atributos, EAN, fotos, costo, precios, alícuota IVA |
| 2 | **Stock** | Existencias por depósito/ubicación, disponible vs reservado, **kardex** (todo movimiento queda registrado) |
| 3 | **Canales y publicaciones** | Mapeo `producto ↔ publicación` por canal (MLA…, id TN), precio y stock publicado, estado de sync |
| 4 | **Órdenes unificadas** | Ventas de todos los canales en una sola bandeja, descuento automático de stock |
| 5 | **Facturación** | Factura A/B/C, NC/ND, CAE, punto de venta, PDF, envío por mail |
| 6 | **Documentos** | Remitos, facturas de proveedor, órdenes de compra, garantías — archivados y buscables |
| 7 | **Compras / reposición** | Proveedores, listas de precios, alertas de sin stock y de quiebre |
| 8 | **Reportes** | Margen por producto/canal, rotación, capital inmovilizado |

## 3. Modelo de datos — el corazón

Estas 8 tablas son el 80% del sistema. Vale la pena discutirlas antes de escribir código.

```
Product        id, sku (único), nombre, marca_id, categoria_id, ean,
               costo, precio_lista, iva, activo, atributos(jsonb)

Warehouse      id, nombre  (depósito, local, tránsito)

Stock          product_id, warehouse_id, cantidad, reservado
               → disponible = cantidad - reservado

StockMovement  id, product_id, warehouse_id, tipo(compra|venta|ajuste|
               devolución|transferencia), cantidad, ref(order_id/doc_id),
               user_id, fecha        ← KARDEX: append-only, nunca se edita

Channel        id, tipo(meli|tiendanube|pos), nombre, credenciales(cifradas)

Listing        id, product_id, channel_id, external_id (MLA123…),
               precio_canal, stock_publicado, estado, last_synced_at,
               sync_error        ← la pieza clave del multicanal

Order          id, channel_id, external_id, comprador, estado, total,
               fecha, envio, factura_id

OrderItem      order_id, listing_id, product_id, cantidad, precio_unit
```

Complementarias: `Supplier`, `PurchaseOrder`, `Document` (comprobantes con CAE +
archivo en storage), `User` + `Role`, `AuditLog`, `SyncJob`.

**Reglas no negociables**
- El stock **nunca** se modifica con un `UPDATE` suelto: se inserta un `StockMovement`
  y el saldo se deriva. Es la única forma de auditar diferencias después.
- Un producto puede tener N publicaciones (misma herramienta publicada dos veces en
  ML, más TN). Por eso `Listing` es una tabla aparte y no columnas en `Product`.
- Cada cambio guarda su **origen** (`source: nucleo | meli | tiendanube`) para no
  entrar en loop infinito de webhooks (ML avisa un cambio que hicimos nosotros → se ignora).

## 4. Stack propuesto

| Capa | Elección | Por qué |
|------|----------|---------|
| App | **Next.js 15 (App Router) + TypeScript** | Un solo repo para UI y API, deploy simple, buen ecosistema |
| DB | **PostgreSQL** (Neon o Supabase) | Relacional obligatorio para stock/contabilidad. `jsonb` para atributos variables de ferretería |
| ORM | **Prisma** o **Drizzle** | Migraciones versionadas desde el día 1 |
| UI | Tailwind + shadcn/ui + TanStack Table | Tablas de 5.000 filas con filtros, que es el 70% de las pantallas |
| Jobs/colas | **Inngest** o BullMQ+Redis | Sync con ML *tiene* que ser asincrónico: rate limits, reintentos, idempotencia |
| Auth | Auth.js / Better-auth con roles | admin, depósito, ventas, contable |
| Archivos | Cloudflare R2 o S3 | Facturas, remitos, fotos de producto |
| Deploy | Vercel + Neon (rápido) o VPS + Docker (más barato a escala) | |

## 5. Integraciones — lo que hay que saber antes

**MercadoLibre**
- OAuth2; el `access_token` dura 6 hs → refresh automático guardado en DB.
- Notificaciones (webhooks): `orders_v2`, `items`, `questions`, `shipments`.
  Hay que responder 200 en < 500 ms y procesar en cola.
- Rate limits reales: nada de sincronizar 5.000 ítems en un `for`.
- **El catálogo de ML es hoy el mejor punto de partida**: se importa completo para
  sembrar el maestro (`seller_custom_field` suele traer el SKU si lo cargaron).

**Tienda Nube**
- API REST + OAuth, webhooks `order/created`, `product/updated`.
- Campos multi-idioma (`name: {es: "..."}`), ojo al mapear.
- La tienda se crea desde el maestro: publicación masiva, no carga manual.

**Facturación ARCA (ex AFIP)**
- **No implementar WSAA/WSFEv1 a mano.** Usar un proveedor con API
  (TusFacturasAPP, Facturante, AFIP SDK) o `afip.ts`/`afip.js` con certificado propio.
- Homologación primero, producción después. Requiere certificado digital y
  punto de venta habilitado para web services.
- Definir de entrada: condición frente al IVA de Warnes (RI o Monotributo) y qué
  comprobantes emite (A/B/C).

## 6. Sincronización — evitar la sobreventa

1. Venta entra por webhook → se crea `Order` → se genera `StockMovement` de salida.
2. El nuevo saldo dispara push de stock a **todos** los demás canales.
3. Se aplica un **buffer por canal** (ej. publicar `disponible - 1`) para absorber
   la latencia entre canales.
4. Todo job es **idempotente** (misma orden dos veces = un solo descuento) y se
   reintenta con backoff. Los errores quedan visibles en un panel de "Salud de sync",
   no en un log que nadie mira.

## 7. Roadmap por fases

**Fase 0 — Relevamiento (1 semana, sin código)**
Exportar el catálogo de ML, ver con qué facturan hoy, cómo cargan stock, si hay
Excel maestro. **Definir el criterio de SKU interno y normalizar.** Este es el
verdadero riesgo del proyecto: 5.000 productos sin SKU consistente hunden
cualquier plataforma, por buena que sea.

**Fase 1 — Núcleo + espejo de ML (2–3 semanas)**
Auth, maestro de artículos, importador de ML. Todavía read-only: el valor es
"ver todo el negocio en una pantalla".

**Fase 2 — Stock como fuente de verdad (2–3 semanas)**
Kardex, ajustes, carga por lote/Excel, push de stock y precio a ML. Acá el
sistema ya deja plata: se corta la sobreventa y los precios desactualizados.

**Fase 3 — Tienda Nube (2 semanas)**
Alta de la tienda y publicación masiva desde el maestro. Ya no dependen de ML.

**Fase 4 — Órdenes unificadas (2 semanas)**
Bandeja única de ventas, descuento automático, estados de envío.

**Fase 5 — Facturación (2–3 semanas)**
ARCA, CAE, PDF, envío automático al comprador.

**Fase 6 — Documentos, compras y reportes (3–4 semanas)**
Archivo de comprobantes, proveedores, alertas de quiebre, márgenes.

## 8. Build vs. buy (honesto)

Lo que **conviene comprar/integrar**, no construir:
- Facturación electrónica → proveedor con API.
- Envío de mails transaccionales → Resend/Postmark.
- La tienda pública → Tienda Nube, tal como quieren. Tu Núcleo es el back-office, no el front.

Lo que **sí conviene construir**: el núcleo (PIM + stock + multicanal + documentos),
porque es donde está la lógica propia del negocio y donde las soluciones de mercado
(Astroselling, Real Trends, Multivende) cobran por producto y no cubren facturación
ni documentos en un mismo lugar.

## 9. Definiciones pendientes

Ver `docs/01-preguntas-abiertas.md`.
