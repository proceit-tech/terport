# TERPORT — V2 — somente módulos faltantes

Este pacote NÃO substitui os módulos que já estavam prontos:

- Dashboard
- Cálculo de Tasas
- Clientes
- Tarifas
- Servicios y Artículos
- Matriz de Servicios
- Pedidos
- Proformas

Também não substitui AppShell, Sidebar, autenticação ou layouts.

## Módulos incluídos

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

O `menu.ts` mantém os menus antigos e acrescenta os novos.

## Instalação
Copiar o conteúdo sobre a raiz do projeto, aceitando substituir apenas os arquivos presentes neste pacote.
Depois:
1. parar o Next;
2. apagar `.next`;
3. executar `npm run dev`.
