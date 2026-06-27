# Carpeta de medios (`/public/media`)

Subí acá las fotos y videos de la landing. Los nombres que la config espera por defecto
(podés cambiarlos en `lib/site.config.ts`):

## Hero (opcional)
- `hero.mp4` — video de fondo del hero (mudo, en loop). Recomendado 1920×1080, < 8 MB.
- `hero-poster.jpg` — imagen que se muestra mientras carga el video / si no hay video.

> Por defecto el hero usa un **gradiente** de marca y funciona sin assets.
> Para usar imagen o video, cambiá `hero.media.type` a `"image"` o `"video"` en `lib/site.config.ts`.

## Galería
- `gallery-1.jpg` … `gallery-5.jpg` — fotos (recomendado 1200×900).
- `gallery-video-1.mp4` — video de la galería (usa `gallery-2.jpg` como poster por defecto).

Formatos sugeridos: imágenes `.jpg`/`.webp`, videos `.mp4` (H.264).
Si falta un archivo, la galería muestra un fondo degradado en lugar de romperse.
