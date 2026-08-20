# Tu Núcleo — WH

Panel web propio para administrar las publicaciones de **Warnes Herramientas**
en MercadoLibre Argentina (~920 activas, rubro herramientas/automotor) sin
depender del panel de ML ni del Editor masivo.

Proyecto standalone. No se integra con ningún otro sistema del cliente ni
comparte base de datos con nada.

---

## Con quién estás hablando

El dueño del proyecto **no es técnico**. Reglas de comunicación, no negociables:

- Explicá en criollo qué hace cada parte. Nada de jerga sin traducir.
- **El SQL va siempre al final del mensaje**, en un bloque listo para copiar y
  pegar en el editor de Supabase.
- Decile **paso a paso qué tiene que hacer él fuera de la terminal**: crear la
  app en el devcenter de ML, cargar variables en Vercel, correr SQL en Supabase.
- Antes de implementar algo grande, pasale el plan y esperá confirmación.
- Si algo se rompe, decilo derecho. Nada de "debería funcionar".

## Stack (ya decidido, no re-discutir)

- **Next.js (App Router) + TypeScript**, desplegado en **Vercel**
- **Supabase** (Postgres + Auth) — proyecto propio
- **Tailwind + shadcn/ui** — paleta neutral/zinc
- **TanStack Table** para la grilla
- **exceljs** para exportar a Excel (no sheetjs)

## Reglas duras del proyecto

1. **Ninguna llamada a la API de ML sale del navegador.** Todo del lado servidor.
2. **Los tokens nunca llegan al front.** Viven en Supabase, los lee solo el server.
3. **Nunca hardcodear `ML_APP_ID` ni `ML_CLIENT_SECRET`**, ni imprimirlos en logs,
   en pantalla, ni en mensajes de error. Van por variables de entorno.
4. **El `refresh_token` de ML es de un solo uso y rota en cada refresco.** Si dos
   requests renuevan a la vez, la conexión se cae. Siempre con lock (ver abajo).
5. Si el refresh se pierde: estado `needs_reconnect` + cartel visible en el panel
   pidiendo reconectar. **Nunca fallar en silencio.**
6. **Las notificaciones de ML no vienen firmadas.** Nunca confiar en el contenido
   del webhook: usar solo el `resource` para volver a pedirle el dato a la API.
7. **Fase 2: sin auditoría no se escribe.** Ningún cambio va a ML sin quedar
   registrado con valor anterior, valor nuevo y respuesta de ML.
8. **Fase 2: ante conflicto, no se pisa nada.** Si el `last_updated` de ML difiere
   del de nuestra copia, se marca el conflicto y decide el dueño.
9. Diseño **blanco y negro**, sobrio, denso. Es una herramienta de trabajo.
   Color solo para errores. Sin gradientes, sin emojis en la UI, sin adornos.

## Antes de escribir código sobre la API de ML

La API de MercadoLibre cambió varias veces. **Verificá contra el devsite oficial
vigente** (`developers.mercadolibre.com.ar`) y no asumas nada de memoria.

Hay cinco puntos abiertos, listados en `docs/03-brief-implementacion.md` §0.
Resolvelos leyendo la documentación **antes** de tocar el código de sincronización.

## Documentos del proyecto

| Archivo | Qué contiene |
|---------|--------------|
| `docs/00-plan-fase-1.md` | Alcance, fases y hallazgos de la API |
| `docs/01-decisiones.md` | Decisiones del dueño y preguntas de relevamiento |
| `docs/02-esquema.sql` | Esquema de base, listo para pegar en Supabase |
| `docs/03-brief-implementacion.md` | **Especificación técnica de la Fase 1** |

## Estado actual

Fase 1 sin empezar. El repo solo tiene documentación.
Arrancar por `docs/03-brief-implementacion.md`.
