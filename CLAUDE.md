# CLAUDE.md

Guía para trabajar en este repositorio con Claude Code.

## Proyecto

Landing page de **Advance Group — Servicio Integral de Importación** (comercio
exterior). Sitio de una sola página (one-pager) con captación de leads vía
WhatsApp y Calendly.

- **Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS 3
- **Idioma del contenido:** español (Argentina)
- **Despliegue objetivo:** Vercel (o cualquier host de Next.js)

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo en http://localhost:3000
npm run build    # build de producción
npm run start    # servir el build
npm run lint     # linter de Next
```

> Antes de correr el proyecto: copiá `.env.example` a `.env.local` y completá
> las variables (WhatsApp, Calendly, contacto).

## Arquitectura

```
app/
  layout.tsx        # fuentes (Montserrat), metadata/SEO, <html lang="es">
  page.tsx          # ensambla las secciones en orden
  globals.css       # Tailwind + clases utilitarias (.btn, .section, etc.)
components/
  Navbar.tsx        # nav sticky, transparente sobre el hero (client)
  Hero.tsx          # hero con fondo gradient/imagen/video + CTAs + stats
  Service.tsx       # pasos del servicio integral
  Gallery.tsx       # grilla de fotos y videos con lightbox (client)
  Testimonials.tsx  # testimonios de clientes
  Faq.tsx           # acordeón desplegable (client)
  CalendlySection.tsx # widget inline de Calendly (client)
  WhatsAppFloat.tsx # botón flotante a wa.me
  Footer.tsx        # contacto + navegación
  Logo.tsx          # logo SVG (pirámide + wordmark)
lib/
  site.config.ts    # ÚNICA fuente de contenido y configuración
public/
  favicon.svg
  media/            # fotos y videos (ver public/media/README.md)
```

### Principio clave: contenido centralizado

**Todo el texto, links e items viven en `lib/site.config.ts`.** Los componentes
no llevan copy hardcodeado: leen de `siteConfig`. Para cambiar textos,
testimonios, FAQ, pasos del servicio o ítems de galería, editá ese archivo.

### Integraciones (variables de entorno)

Se leen como `NEXT_PUBLIC_*` (inlined en build) desde `lib/site.config.ts`:

- `NEXT_PUBLIC_WHATSAPP_NUMBER` — formato internacional sin `+` (AR: `549...`)
- `NEXT_PUBLIC_WHATSAPP_MESSAGE` — mensaje precargado
- `NEXT_PUBLIC_CALENDLY_URL` — URL del evento de Calendly
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` — footer

El widget de Calendly se carga por script externo en `CalendlySection.tsx`
(no requiere paquete npm).

## Branding (Advance Group)

- **Paleta** (definida en `tailwind.config.ts` como `brand.*`):
  - `navy #15294B` (primario) · `navyDark #0E1C36` · `steel #4A5E7E`
  - `slate #7C8BA1` · `mist #B7C1D1` · `ink #0A0A0A` · `paper #F5F7FA`
- **Tipografía:** la de marca es **Gotham** (Hoefler, paga). En web usamos
  **Montserrat** (geométrica equivalente) vía `next/font`. Si se adquiere la
  licencia de Gotham, reemplazar en `app/layout.tsx` y `tailwind.config.ts`.
- **Logo:** pirámide wireframe reconstruida en SVG (`components/Logo.tsx`,
  `public/favicon.svg`). Acepta `variant="light" | "dark"`.

## Convenciones

- Componentes en **PascalCase**, un componente por archivo en `components/`.
- Marcar `"use client"` solo cuando hay estado/efectos (Navbar, Gallery, Faq,
  CalendlySection). El resto son Server Components.
- Estilos con Tailwind; usar las clases utilitarias de `globals.css`
  (`.btn-primary`, `.section`, `.section-title`, `.eyebrow`, `.container-page`).
- Import alias: `@/*` apunta a la raíz del proyecto.
- IDs de sección para el scroll del navbar: `#servicio`, `#galeria`,
  `#testimonios`, `#faq`, `#agendar`.
- Las imágenes usan `<img>` (no `next/image`) para tolerar assets faltantes con
  fallback; si se migra a `next/image`, configurar dominios en `next.config.mjs`.

## Pendientes / cómo extender

- Subir fotos y videos reales a `public/media/` (ver su README).
- Activar fondo de video del hero: `hero.media.type = "video"` en la config.
- Completar `.env.local` con el número de WhatsApp y la URL de Calendly reales.
