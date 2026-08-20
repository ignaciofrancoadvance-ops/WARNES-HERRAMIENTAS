-- ============================================================
--  TU NÚCLEO - WH  ·  Esquema Fase 1
--  Pegar completo en Supabase → SQL Editor → Run
--  Es idempotente: se puede volver a correr sin romper nada.
-- ============================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- búsqueda por texto en títulos


-- ------------------------------------------------------------
-- 1. Usuarios del panel
--    Hoy uno solo (vos). La columna rol queda para más adelante.
-- ------------------------------------------------------------
create table if not exists app_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  rol        text not null default 'owner' check (rol in ('owner','operador','lectura')),
  creado_en  timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 2. Conexión con MercadoLibre
--    Los tokens viven acá. El navegador NUNCA los ve.
--    Una fila por cuenta de ML (hoy: una sola).
-- ------------------------------------------------------------
create table if not exists ml_accounts (
  id                 uuid primary key default gen_random_uuid(),
  ml_user_id         bigint unique,
  nickname           text,
  access_token       text,
  refresh_token      text,
  access_expires_at  timestamptz,
  scopes             text,
  status             text not null default 'disconnected'
                     check (status in ('disconnected','connected','needs_reconnect')),
  last_error         text,
  connected_at       timestamptz,
  updated_at         timestamptz not null default now()
);

comment on table ml_accounts is
  'Credenciales OAuth de ML. El refresh_token es de un solo uso: para renovarlo
   el servidor toma un bloqueo de fila (SELECT ... FOR UPDATE) y así dos procesos
   simultáneos no lo queman.';


-- ------------------------------------------------------------
-- 3. Espejo local de las publicaciones
--    Copia de lo que hay en ML. Contra esta tabla trabaja la grilla.
-- ------------------------------------------------------------
create table if not exists ml_items (
  item_id               text primary key,                   -- MLA1234567890
  account_id            uuid references ml_accounts(id) on delete cascade,

  title                 text,
  sku                   text,          -- atributo SELLER_SKU
  seller_custom_field   text,          -- campo interno, distinto del SKU

  status                text,          -- active / paused / closed / under_review
  sub_status            text[],        -- ej. {out_of_stock}

  price                 numeric(14,2),
  original_price        numeric(14,2),
  currency_id           text,

  available_quantity    integer,       -- stock publicado
  fulfillment_quantity  integer,       -- stock en Full (null si no aplica)
  sold_quantity         integer,

  listing_type_id       text,          -- gold_special = clásica, gold_pro = premium
  category_id           text,
  category_name         text,
  condition             text,          -- new / used

  logistic_type         text,          -- fulfillment / self_service (Flex) / drop_off / ...
  free_shipping         boolean,

  catalog_listing       boolean,
  catalog_product_id    text,

  permalink             text,
  thumbnail             text,
  health                numeric,
  visits_30d            integer,

  sale_fee_amount       numeric(14,2), -- comisión (ver decisión D3)
  net_amount            numeric(14,2), -- neto estimado (ver decisión D3)

  ml_last_updated       timestamptz,   -- last_updated de ML → detección de conflictos
  date_created          timestamptz,

  raw                   jsonb,         -- respuesta cruda, por si mañana falta un campo
  synced_at             timestamptz not null default now()
);

create index if not exists ml_items_status_idx    on ml_items (status);
create index if not exists ml_items_category_idx  on ml_items (category_id);
create index if not exists ml_items_price_idx     on ml_items (price);
create index if not exists ml_items_sku_idx       on ml_items (sku);
create index if not exists ml_items_logistic_idx  on ml_items (logistic_type);
create index if not exists ml_items_stock_idx     on ml_items (available_quantity);
create index if not exists ml_items_title_trgm_idx on ml_items using gin (title gin_trgm_ops);


-- ------------------------------------------------------------
-- 4. Registro de sincronizaciones
--    Para saber qué pasó en cada corrida sin adivinar.
-- ------------------------------------------------------------
create table if not exists sync_runs (
  id              bigserial primary key,
  account_id      uuid references ml_accounts(id) on delete cascade,
  origen          text check (origen in ('manual','cron','webhook')),
  status          text not null default 'running' check (status in ('running','ok','error')),
  items_encontrados integer default 0,
  items_guardados   integer default 0,
  items_fallidos    integer default 0,
  llamadas_api      integer default 0,
  error           text,
  iniciado_en     timestamptz not null default now(),
  terminado_en    timestamptz
);

create index if not exists sync_runs_iniciado_idx on sync_runs (iniciado_en desc);


-- ------------------------------------------------------------
-- 5. SEGURIDAD — importante
--    Se activa RLS y NO se crean políticas: eso bloquea todo acceso
--    desde el navegador. Solo el servidor de Next (que usa la
--    service_role key, la cual saltea RLS) puede leer y escribir.
-- ------------------------------------------------------------
alter table app_users   enable row level security;
alter table ml_accounts enable row level security;
alter table ml_items    enable row level security;
alter table sync_runs   enable row level security;

-- (Fase 2 agrega la tabla de auditoría de cambios. No va todavía.)
