# Arquitectura

## Principio general

La interfaz visible al usuario estará en español. Todo el código interno se mantiene en inglés.

## Capas

### `app/`
Rutas visuales y endpoints HTTP de Next.js.

### `components/`
Componentes visuales reutilizables.

### `server/services/`
Casos de uso y coordinación de la lógica de negocio.

### `server/calculation-engine/`
Reglas de cálculo tarifario independientes de la interfaz y de las integraciones.

### `server/repositories/`
Acceso a datos. Durante el prototipo usará archivos de `mock-data/`. La implementación podrá sustituirse por PostgreSQL posteriormente.

### `server/integrations/`
Adaptadores para Waldbott, NAVIS, APIs externas, reintentos e idempotencia.

### `server/jobs/`
Procesos de sincronización y tareas automáticas.

### `server/audit/`
Trazabilidad de cambios.

## Roles

- `ADMIN` → Administrador
- `COMMERCIAL` → Comercial
- `TARIFF_OPERATOR` → Operador de Tarifas

## Estado actual

Prototipo sin base de datos y sin conexiones reales con sistemas externos.
