# TERPORT — V2 — Módulos faltantes formatados

Este pacote foi recriado do zero.

Todos os arquivos estão formatados de forma legível, com indentação normal e blocos separados.

## NÃO substitui os módulos já existentes

- Dashboard
- Cálculo de Tasas
- Clientes
- Tarifas
- Servicios y Artículos
- Matriz de Servicios
- Pedidos
- Proformas

## Inclui

### COMERCIAL

- Grupos Comerciales
- Despachantes
- Agenda Comercial
- Reportes de Contacto
- Nuevo Reporte de Contacto
- Detalle de Reporte
- Cartera Comercial
- Alertas Comerciales

### REPORTES

- Reportes

### ADMINISTRACIÓN

- Integraciones

## Arquivos compartilhados

- components/prototype/PrototypeUi.tsx
- components/prototype/prototype-ui.module.css
- lib/auth/menu.ts

## Instalação

1. Extrair o ZIP.
2. Copiar o conteúdo para a raiz do projeto.
3. Permitir substituição apenas dos arquivos presentes no ZIP.
4. Parar o Next.js.
5. Apagar a pasta `.next`.
6. Rodar novamente:

   npm run dev

## Observação

As telas são de protótipo e usam dados mock.

Nenhuma integração real com PostgreSQL, Waldbott ou NAVIS é executada nesta fase.
