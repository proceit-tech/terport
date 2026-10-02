# Cobertura de Requerimientos

Estructura prevista para los requerimientos RF-01 a RF-20 del documento de relevamiento.

| Requerimiento | Cobertura técnica prevista |
|---|---|
| RF-01 | `server/calculation-engine/containerValidator.ts` |
| RF-02 | `server/calculation-engine/containerCountValidator.ts` |
| RF-03 | `components/calculations/ContainerCard.tsx` + `types/container.ts` |
| RF-04 | `server/calculation-engine/exemptionResolver.ts` |
| RF-05 | `server/calculation-engine/additionalServiceResolver.ts` |
| RF-06 | `server/calculation-engine/demurrageCalculator.ts` |
| RF-07 | `server/calculation-engine/demurrageCalculator.ts` |
| RF-08 | `types/commercialCondition.ts` + catálogo de tipo de carga |
| RF-09 | `types/commercialCondition.ts` + validación comercial |
| RF-10 | `types/commercialCondition.ts` + `commercialRuleEngine.ts` |
| RF-11 | catálogo `storage-units.json` + tarifas |
| RF-12 | campos estructurados del cliente; observación solo para comentario |
| RF-13 | `server/services/orderService.ts` |
| RF-14 | `types/order.ts` + sincronización Waldbott |
| RF-15 | `app/(app)/orders/page.tsx` |
| RF-16 | `WaldbottSyncService.ts` + `clientSyncJob.ts` |
| RF-17 | `NavisSyncService.ts` + `NavisMapper.ts` |
| RF-18 | ficha de cliente y condiciones comerciales |
| RF-19 | `service-matrix/` + `serviceMatrixService.ts` |
| RF-20 | flujo por etapas + tarjetas de contenedores |

## Requerimientos no funcionales

- Trazabilidad: `server/audit/`.
- Auditabilidad: datos estructurados y `types/audit.ts`.
- Rendimiento: integraciones desacopladas y jobs.
- Consistencia entre sistemas: adapters y sincronizaciones Waldbott/NAVIS.
