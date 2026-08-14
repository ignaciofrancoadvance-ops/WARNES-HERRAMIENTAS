# 🎬 WEDIT — Editor de video de WARNES HERRAMIENTAS

Sistema de edición de video automático manejado por Claude Code.
Vos grabás, dejás el video en `input/`, y el sistema hace microcortes,
subtítulos con tu tipografía, inserta imágenes por palabra, reencuadra
a vertical y le pone el logo. Todo configurable.

## Instalación (una vez por entorno)

```bash
pip install -r video/requirements.txt
```

En Claude Code web esto ya se corre solo con el hook de `.claude/`.

## Flujo de trabajo

1. Poné tu video en `video/input/` (ej: `input/mi_video.mp4`).
2. (Opcional) Poné su transcripción `input/mi_video.srt` al lado, con el
   mismo nombre. Necesaria para subtítulos y b-roll automático mientras el
   entorno no pueda usar el modelo de transcripción (ver más abajo).
3. Corré el pipeline completo:

```bash
cd video
python3 scripts/wedit.py editar input/mi_video.mp4
```

El resultado queda en `video/output/mi_video__FINAL.mp4`.

### Comandos sueltos

```bash
python3 scripts/wedit.py microcorte  input/x.mp4   # saca silencios
python3 scripts/wedit.py subtitulos  input/x.mp4   # subtítulos con tu estilo
python3 scripts/wedit.py broll       input/x.mp4   # inserta imágenes por palabra
python3 scripts/wedit.py vertical    input/x.mp4   # reencuadra 9:16
python3 scripts/wedit.py transcribir input/x.mp4   # genera .srt (si hay modelo)
```

## Configuración

- **`config/style.yaml`** — colores de marca, formato (9:16 / 16:9 / 1:1),
  estilo de subtítulos (fuente, tamaño, color, karaoke), microcorte
  (sensibilidad de silencio), logo, música.
- **`config/keywords.yaml`** — mapa *palabra → imagen/clip*. Cuando en el
  audio se diga esa palabra, se inserta ese archivo.

### Tu tipografía

Poné el archivo `.ttf` o `.otf` en `video/fonts/` y escribí su nombre
(sin extensión) en `style.yaml → subtitulos.fuente`.

### Tus imágenes de B-roll

Poné las imágenes/clips en `video/assets/broll/` y mapealas en
`config/keywords.yaml`. Ejemplo:

```yaml
palabras:
  avion:
    archivo: "assets/broll/avion.png"
    duracion: 2.0
    modo: "overlay"        # overlay | fullscreen
```

## Transcripción automática (voz → texto por palabra)

El microcorte NO necesita transcripción (usa detección de silencios).
Los **subtítulos** y el **b-roll automático** sí necesitan saber qué palabra
se dice en cada momento. Hay tres formas:

1. **Modelo local (ideal, elegido):** `faster-whisper` ya está instalado, pero
   este entorno bloquea la descarga del modelo. Para activarlo, un admin debe
   **habilitar estos dominios** en la política de red del entorno:
   - `huggingface.co`
   - `cdn-lfs.huggingface.co` (y/o `*.hf.co`)

   Una vez habilitados, la transcripción es 100% automática:
   ```bash
   python3 scripts/wedit.py transcribir input/mi_video.mp4   # descarga el modelo la 1ª vez
   python3 scripts/wedit.py editar      input/mi_video.mp4   # ya usa la transcripción sola
   ```
   El modelo por defecto es `small` (buen balance en español). Se puede cambiar
   con la variable de entorno `WHISPER_MODEL` (`tiny`, `base`, `small`, `medium`).
2. **Archivo `.srt`:** exportá los subtítulos desde tu app de grabación y
   dejalos al lado del video con el mismo nombre.
3. **Manual:** escribí vos el `.srt` (formato estándar).

## Estructura

```
video/
  config/     style.yaml, keywords.yaml   ← acá configurás todo
  fonts/      tus tipografías (.ttf/.otf)
  assets/
    broll/    imágenes/clips para palabras clave
    music/    música de fondo
  input/      tus videos crudos
  output/     videos editados
  scripts/    wedit.py (motor)
```
