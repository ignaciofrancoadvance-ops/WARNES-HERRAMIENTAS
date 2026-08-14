# 🤝 Traspaso — Editor de video de Advance (WEDIT)

Documento para que Claude (en VS Code / local) tome este proyecto con todo el
contexto y lo siga mejorando. Escrito en base a una primera versión ya
funcionando de punta a punta.

---

## Qué es
Un editor de video automático manejado por Claude Code. Flujo:
**link de Drive (o archivo local) → video final vertical listo para redes**, sin
edición manual. Pensado para producir MUCHOS reels de forma consistente y para
que lo use todo un equipo (el código vive en un repo compartido).

## Qué hace hoy (todo funcionando y verificado con material real)
1. **Descarga** el video (de Google Drive o local).
2. **Normaliza**: HDR 10-bit → SDR, 4K → 1080p, 60→30fps, elige la pista de
   audio correcta (los iPhone traen audio espacial APAC que ffmpeg no decodifica).
3. **Microcorte**: saca silencios (jump cuts) por detección de silencios.
4. **Vertical 9:16** (reencuadre centrado).
5. **Transcribe** en español (faster-whisper) con timestamps por palabra.
6. **Corrige** nombres propios mal escuchados (diccionario de marca).
7. **Subtítulos karaoke** con la tipografía Halagar (resalta palabra por palabra).
8. **B-roll por palabra**: al decir X se inserta una imagen o **video corto**.
9. (Opcional) **logo/marca de agua** y **música de fondo**.

## Stack técnico y por qué
- **ffmpeg** vía el paquete pip `imageio-ffmpeg` (binario estático 7.0.2, no hay
  que instalar ffmpeg del sistema). Trae libx264, aac, libass, zscale, tonemap.
- **faster-whisper** para transcripción offline (modelo `small` por defecto;
  subir a `medium` con la env var `WHISPER_MODEL=medium` mejora nombres propios).
- **Subtítulos por ASS + libass** (no drawtext): permite karaoke real (`\k`),
  colores, borde, fuente propia. La fuente va en `fonts/` y se referencia por su
  **nombre interno** (ej. la Halagar es "Halagar ExtBd"), no por el nombre de archivo.
- **HDR→SDR** con `zscale=t=linear,tonemap=hable,zscale=t=bt709,...`. Importante:
  escalar/bajar fps ANTES del tonemap (el tonemap en 4K@60 es carísimo en CPU).
- Config en **YAML**; sin dependencias pesadas.

## Estructura
```
video/
  scripts/wedit.py          # motor (CLI con subcomandos)
  config/style.yaml         # marca, formato, subtítulos, microcorte, logo, música
  config/keywords.yaml      # palabra -> imagen/clip (b-roll)
  config/correcciones.yaml  # nombres mal escuchados -> correctos
  fonts/Halagar.otf         # tipografía (versionada)
  assets/broll/             # imágenes/clips de b-roll (no versionado)
  input/ output/            # videos crudos / editados (no versionado)
  requirements.txt
```

## Cómo se usa
```bash
pip install -r video/requirements.txt          # una vez
cd video
python3 scripts/wedit.py editar input/mi.mp4   # pipeline completo
# o pasos sueltos: normalizar | microcorte | vertical | subtitulos | broll | transcribir
```
Para bajar de Drive (link con "anyone with link"):
`curl -sL -o input/x.mov "https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t"`

## Decisiones / trucos aprendidos (no repetir errores)
- **Audio de iPhone**: mapear `0:a:0?` (la pista AAC), NO todas — la pista APAC
  rompe si se intenta decodificar.
- **HDR**: si no se hace tonemap, el video sale lavado/oscuro. Detectar por
  `bt2020|arib-std-b67|smpte2084` en el `ffmpeg -i`.
- **ASS fuente**: el `Fontname` debe ser el nombre de familia interno del .otf
  (leer con fontTools). Usar `-fontsdir` apuntando a `fonts/`.
- **Timestamps**: transcribir SIEMPRE después del microcorte, si no los
  subtítulos quedan corridos.
- **B-roll video vs imagen**: para clips usar `trim=0:dur,setpts=PTS-STARTPTS+{t}/TB`
  para que arranque en el momento justo; para imágenes `-loop 1 -t dur`.

## Limitaciones conocidas / ideas para mejorar ("crearlo mejor")
- **Precisión de nombres**: pasar a `WHISPER_MODEL=medium` o `large-v3`.
- **Correcciones solo de 1 palabra**: falta soporte de frases (ej. "Adorn's
  Techno" → "Adorama" que caen en 2 tokens). Agregar match de n-gramas.
- **Reencuadre vertical**: hoy es crop centrado; se podría seguir la cara
  (face-tracking) para que el sujeto quede siempre en cuadro.
- **B-roll automático desde stock**: buscar imagen/clip por la palabra si no está
  en la librería local.
- **Presets por tipo de video** (venta, tip, testimonial) con estilos distintos.
- **Batch**: procesar una carpeta entera de Drive de una.
- **Música con ducking**: bajar la música automáticamente cuando hay voz.
- **Intro/outro** de marca y transiciones entre cortes.

## Estado del branding
Logo desactivado por defecto (`style.yaml → logo.activado: false`). Cuando esté
el logo de Advance, ponerlo en `assets/logo-advance.png` y activarlo.

---

### Prompt corto para arrancar en VS Code
> "Tengo un editor de video automático en la carpeta `video/` (motor
> `scripts/wedit.py`, configs en `config/`, fuente en `fonts/`). Leé
> `video/HANDOFF.md` para el contexto completo. Instalá dependencias con
> `pip install -r video/requirements.txt` y confirmá que
> `python3 video/scripts/wedit.py --help` corre. Después quiero que edites el
> video de este link de Drive: <LINK>."
