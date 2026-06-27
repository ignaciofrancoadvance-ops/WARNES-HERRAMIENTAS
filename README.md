# Advance Group · Servicio Integral de Importación

Landing page one-page construida con **Next.js 14 + Tailwind CSS**.

Incluye: hero con fondo (gradiente/imagen/video), sección de servicio, galería
de fotos y videos con lightbox, testimonios, FAQ desplegable, botón flotante de
WhatsApp e integración de Calendly para coordinar llamadas.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completá WhatsApp, Calendly y contacto
npm run dev                  # http://localhost:3000
```

## Configuración

- **Contenido:** `lib/site.config.ts` (textos, testimonios, FAQ, galería).
- **Integraciones:** variables `NEXT_PUBLIC_*` en `.env.local` (ver `.env.example`).
- **Medios:** subí fotos/videos a `public/media/` (ver `public/media/README.md`).
- **Marca:** paleta en `tailwind.config.ts`; ver `CLAUDE.md` para detalles.

## Build

```bash
npm run build && npm run start
```

Más detalle de arquitectura y convenciones en [`CLAUDE.md`](./CLAUDE.md).
