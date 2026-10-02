# TERPORT — Sistema Tarifario

Base técnica del prototipo funcional.

## Estándar del proyecto

- Interfaz visible: español.
- Código interno: inglés.
- Stack: Next.js + React + TypeScript + Node.js.
- Sin base de datos en esta etapa.
- Datos temporales: `mock-data/`.
- Integraciones preparadas para Waldbott, NAVIS, API saliente y webhooks.
- Roles internos previstos:
  - `ADMIN`
  - `COMMERCIAL`
  - `TARIFF_OPERATOR`

## Inicio

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Arquitectura

- `app/`: páginas y endpoints HTTP.
- `components/`: UI reutilizable.
- `lib/`: utilidades compartidas.
- `server/`: lógica de negocio, integraciones, jobs, repositorios y auditoría.
- `types/`: tipos compartidos.
- `mock-data/`: datos temporales del prototipo.
- `docs/`: arquitectura, alcance y cobertura de requerimientos.
