# Definiciones pendientes con el cliente

Ninguna de estas frena el arranque técnico, pero todas cambian decisiones de diseño.

## Datos (bloquea la Fase 0)
1. ¿Los ~5.000 productos tienen **SKU / código interno** consistente, o el identificador
   real hoy es el título de la publicación de ML?
2. ¿Existe un Excel maestro, o el catálogo vive solamente dentro de MercadoLibre?
3. ¿Hay productos con variantes (medidas, voltaje, kits) o cada uno es un ítem suelto?
4. ¿Un solo depósito, o local + depósito separados?

## Operación
5. ¿Venden también por mostrador? Si sí, ¿con qué registran esa venta hoy?
   (define si hace falta módulo POS y si el stock de mostrador compite con el online)
6. ¿Quién carga stock y cuántas personas van a usar el sistema? (roles y permisos)
7. ¿Cómo llega la mercadería: remito del proveedor en papel, Excel, PDF?

## Fiscal
8. Condición frente al IVA de Warnes Herramientas (Responsable Inscripto / Monotributo).
9. ¿Qué comprobantes emiten hoy y con qué herramienta?
10. ¿Tienen certificado digital ARCA y punto de venta habilitado para web services?
11. ¿Facturan las ventas de ML manualmente hoy? (volumen mensual aproximado)

## Cuentas y accesos
12. Cuenta de **MercadoLibre**: hace falta crear una aplicación en devcenter y
    autorizar OAuth con el usuario vendedor.
13. **Tienda Nube**: ¿plan contratado? La API está disponible en todos los planes,
    pero conviene definir plan y dominio antes de publicar.
14. Dominio para Tu Núcleo (ej. `nucleo.warnesherramientas.com.ar`).

## Producto
15. ¿Presupuesto/infra: preferencia por servicios administrados (Vercel + Neon,
    arranque rápido, costo mensual en USD) o VPS propio (más barato, más mantenimiento)?
16. ¿Hay urgencia por alguna fase en particular? (ej. si el dolor de hoy es la
    sobreventa, la Fase 2 se adelanta)
