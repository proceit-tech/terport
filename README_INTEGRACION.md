# TERPORT — Prototipo de módulos faltantes

Este ZIP fue preparado para **sumarse** al proyecto existente sin reemplazar archivos actuales.

## Objetivo
Completar visualmente los puntos del relevamiento v2.0 que no aparecen cubiertos de forma explícita en el árbol actual mostrado:

- Reportes de contacto comercial (CRM)
- Historial y reasignación de cartera
- Alertas de clientes sin contacto reciente
- Seguimiento básico de integraciones Waldbott / NAVIS
- Formulario inicial de nuevo reporte de contacto
- Vista de detalle de reporte y comentarios de supervisión/dirección

## Rutas nuevas

- `/contact-reports`
- `/contact-reports/new`
- `/contact-reports/[id]`
- `/portfolio`
- `/commercial-alerts`
- `/integrations`

## API mock incluida

- `/api/contact-reports`
- `/api/portfolio`
- `/api/commercial-alerts`
- `/api/integrations`

Las APIs son solamente datos de prototipo. No conectan PostgreSQL ni Waldbott/NAVIS todavía.

## Archivos compartidos

- `lib/prototype-data.ts`
- `lib/prototype-menu-additions.ts`
- `components/prototype/PrototypeUi.tsx`
- `components/prototype/prototype-ui.module.css`

## Integración con el menú actual

No se reemplaza `app/(app)/layout.tsx`, porque el archivo real del proyecto no fue suministrado y no conviene sobrescribirlo a ciegas.

Use `lib/prototype-menu-additions.ts` como referencia para agregar estas opciones al menú existente.

Sugerencia de agrupación:

### COMERCIAL
- Agenda → ya existe `/appointments`
- Reportes de contacto → `/contact-reports`
- Cartera comercial → `/portfolio`
- Alertas comerciales → `/commercial-alerts`

### ADMINISTRACIÓN
- Integraciones → `/integrations`
- Auditoría → ya existe `/audit`

## Criterio visual

Los nuevos módulos siguen el estilo observado en el prototipo actual:
- fondo gris muy claro;
- tarjetas blancas con borde suave;
- títulos azul oscuro;
- acentos azul/celeste;
- badges de estado;
- tablas compactas;
- botones redondeados;
- bloques de resumen superiores.

## Próximo paso recomendado

Revisar pantalla por pantalla, empezando por:
1. Reportes de contacto
2. Nuevo reporte de contacto
3. Cartera comercial
4. Alertas comerciales
5. Integraciones

Después de validar el diseño, conectamos cada pantalla con la estructura real de datos y APIs del proyecto.
