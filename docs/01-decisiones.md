# Decisiones que necesito que tomes

Sin estas cinco no arranco a codear. Las demás se pueden ir resolviendo en el camino.

---

## D1 · Plan de Vercel y frecuencia de sincronización 🔴 bloqueante

El plan **Hobby (gratis) solo permite un cron por día.** Para correr cada hora hace
falta **Pro (US$ 20/mes)**. Además el timeout por defecto de una función es de 10
segundos y hay que subirlo para que entre la sincronización completa.

| Opción | Costo | Qué obtenés |
|--------|-------|-------------|
| **A. Hobby + webhooks de ML** ✅ recomendada | US$ 0 | ML **avisa** cada vez que cambia una publicación → el espejo queda al día casi en tiempo real. El cron diario queda solo como red de seguridad, y el botón manual siempre está |
| B. Pro + cron horario | US$ 20/mes | Hasta 1 hora de desfasaje. Más simple de implementar, más caro y peor |
| C. Hobby a secas | US$ 0 | Una sync por día + botón manual. Suficiente si el panel es de consulta |

Recomiendo **A**: las notificaciones de ML son gratis y dan mejor resultado que
cualquier cron. Requiere una URL pública que reciba los avisos (la misma app).

---

## D2 · Dominio 🔴 bloqueante

Define el `redirect_uri` que vas a cargar en el devcenter, y **una vez creada la
aplicación conviene no cambiarlo**.

- **Opción A:** subdominio propio, ej. `nucleo.warnesherramientas.com.ar`
  → redirect: `https://nucleo.warnesherramientas.com.ar/api/ml/callback`
- **Opción B:** dominio gratis de Vercel, ej. `tu-nucleo-wh.vercel.app`
  → redirect: `https://tu-nucleo-wh.vercel.app/api/ml/callback`

Se puede arrancar con B y migrar a A después, pero hay que reconectar ML.
Si ya tenés el dominio de la ferretería, arrancá directo con A.

---

## D3 · ¿Comisión y neto a recibir en Fase 1?

No vienen en la publicación: hay que calcularlos aparte, por combinación de
precio + categoría + tipo de publicación.

Y hay una trampa: el "neto a recibir" real es **precio − comisión − costo de envío
gratis**, y ese costo de envío depende del peso y del destino. Si mostramos solo
precio − comisión, el número va a estar inflado en todas las publicaciones con
envío gratis.

- **A.** Mostrar comisión y un neto **estimado**, aclarando en pantalla que no
  descuenta el envío. Se implementa en Fase 1.
- **B.** Dejarlo para Fase 3, junto con rentabilidad, y hacerlo bien de una.
  ✅ recomendada — un número de plata mal calculado es peor que no tenerlo.

---

## D4 · ¿Visitas en Fase 1?

Son un endpoint aparte y una ventana de fechas a definir (típicamente 30 días).
Suma llamadas y tiempo a cada sincronización.

- **A.** Sí, visitas de los últimos 30 días, actualizadas una vez por día.
- **B.** No, queda para después. ✅ recomendada si querés la Fase 1 andando rápido.

---

## D5 · ¿Usan Mercado Envíos Full?

Cambia el diseño de la tabla de stock. Si tenés mercadería en Full, el stock de la
publicación y el stock en el depósito de ML son dos números distintos que hay que
mostrar por separado.

- ¿Cuántas de las ~920 publicaciones están en Full, más o menos?

---

## Preguntas que no bloquean, pero necesito la respuesta antes de la primera sync

6. **¿Las publicaciones tienen SKU cargado?** ¿En el atributo "SKU" del formulario
   de ML, o lo usan como código propio en otro lado? De esto depende que el filtro
   "sin SKU" sirva para algo. (Si no sabés, lo vemos en la primera sincronización:
   el panel te va a decir cuántas tienen y cuántas no.)
7. ¿Hay publicaciones con **variantes** (medidas, colores, kits)? Cambia cómo se
   muestra el stock: una publicación con variantes tiene un stock por variante.
8. ¿Querés ver también las **pausadas y finalizadas**, o solo las activas?
9. ¿Alguien más va a entrar al panel además de vos, aunque sea a mirar?
