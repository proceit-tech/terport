# TERPORT · F00-003 — Matriz inicial de cobertura de menus (R01)

**Fonte:** terport.zip SHA256 3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6; matriz configs/modules.edu.php interpretada como dados, sem executar PHP. **Data:** 23/11/2026.
**Estado:** inspeção de nomes/tipos e existência física de templates no ZIP. Não representa teste de navegação, API, banco ou permissões em produção.

## Páginas raiz
- **Dashboard:** tipo page, template `templates/dashboard.edu.php` presente; ficha funcional `LEG-MEN-002-DASHBOARD-R01.md` **DOCUMENTADA POR LEITURA ESTÁTICA**, homologação do responsável pendente (Linear PRO-367).
- **Facturación:** tipo page, template templates/facturacion.edu.php presente. Ficha funcional ainda PENDENTE.

## 37 entradas declaradas em submenus
| Módulo | ID da rota | Rótulo | Tipo | Template físico | F00 |
|---|---|---|---|---|---|
| Sistema | usuarios | Usuarios | page | presente | DISPENSADO da reversa detalhada — novo desenho PROCEIT |
| Sistema | roles | Roles | page | presente | PENDENTE |
| Sistema | aprobadores | Usuarios aprobadores | page | presente | PENDENTE |
| Sistema | auditoria | Log de auditoría | page | presente | PENDENTE |
| Sistema | tarifasaprobadas | Tarifas aprobadas | page | presente | PENDENTE |
| Sistema | tarifasparaaprobar | Tarifas para aprobar | page | presente | PENDENTE |
| Sistema | tarifaseliminadas | Tarifas eliminadas | page | presente | PENDENTE |
| Sistema | tarifasavencer | Tarifas a vencer | page | presente | PENDENTE |
| Sistema | clientescip | Clientes/CIP | page | presente | PENDENTE |
| Sistema | limpiarcache | Limpiar caché | page | presente | PENDENTE |
| Sistema | segmentos | Segmentos | page | presente | PENDENTE |
| Sistema | tasa_servicio | Tasas/Servicios | page | presente | PENDENTE |
| Sistema | plantilla_tasa_servicio | Plantilla de Tasas/Servicios | page | presente | PENDENTE |
| Sistema | plantilla_tasa | (sem rótulo) | indefinido | não identificado no ZIP | PENDENTE |
| Sistema | agenda_comercial | Agenda Comercial | page | presente | PENDENTE |
| Sistema | comercial_miembros | Miembros Comercial | page | presente | PENDENTE |
| Sistema | contratos | Contratos | page | presente | PENDENTE |
| Sistema | agenda_comercial_detalle | (sem rótulo) | page | presente | PENDENTE |
| Sistema | agenda_comercial_cotizaciones | (sem rótulo) | page | presente | PENDENTE |
| Comercial | tarifario | Cliente Tasa | page | presente | PENDENTE |
| Comercial | tarifas | Tarifas | page | presente | PENDENTE |
| Comercial | tarifa_minima | Tarifa mínima | list | templates/list.edu.php | PENDENTE |
| Comercial | clientes_grupos | Grupos de clientes | page | presente | PENDENTE |
| Comercial | equivalencias | Equivalencias | list | templates/list.edu.php | PENDENTE |
| Comercial | tarifa | (sem rótulo) | indefinido | não identificado no ZIP | PENDENTE |
| Comercial | clientes | (sem rótulo) | indefinido | não identificado no ZIP | PENDENTE |
| Comercial | cliente_tasa | Cliente Tasas | page | presente | PENDENTE |
| Comercial | ocit_clientes | OCIT | page | presente | PENDENTE |
| Comercial | agenda_comercial_v2 | Agenda Comercial V2 | page | presente | LEG-MEN-001 documentado; revisão pendente |
| Comercial | agenda_comercial_detalle_v2 | (sem rótulo) | page | presente | PENDENTE |
| Reportes | rccne | Clientes con negociación especial | page | presente | PENDENTE |
| Reportes | rtv | Tarifas vigentes | page | presente | PENDENTE |
| Reportes | rudlt | Utilización de las tarifas | page | presente | PENDENTE |
| Reportes | rtf | Tarifas facturadas | page | presente | PENDENTE |
| Reportes | rpdfpu | Promedio de facturación por usuario | page | presente | PENDENTE |
| Reportes | reporte_cumplimiento_ac | R. Cumplimiento Semanal | page | presente | PENDENTE |
| Reportes | reporte_cumplimiento_ac_mensual | R. Cumplimiento Mensual | page | presente | PENDENTE |

## Decisão de escopo — 23/11/2026 (responsável PROCEIT)

- **Sistema / Usuarios:** excluir da engenharia reversa detalhada F00. O novo cadastro e gestão de usuários serão desenhados pela PROCEIT, sem replicar o PHP antigo. Esta exclusão **não implica eliminar a autenticação, auditoria ou controle de acesso no produto V2**.
- O ID **LEG-MEN-003** não será atribuído a Usuarios. O próximo menu funcional a estudar será **Comercial / Tarifas**, com o ID LEG-MEN-003, após verificação de fontes.
- **Roles, Usuarios aprobadores e outros cadastros técnicos:** a abordagem proposta é de novo desenho; eventual exclusão detalhada de cada um deve seguir a decisão de escopo do responsável, sem presumir que regras de aprovação de negócios sejam descartadas.
- Manter levantamento pontual de autorizações necessárias a tarifas, contratos, negociações, aprovações e faturação. Um cadastro administrativo novo não dispensa identificar quem pode executar operações sensíveis.
- **Estado da matriz:** a entrada Usuarios segue existindo no legado, mas fica **FORA DO ESCOPO DE REVERSA DETALHADA** por decisão expressa, não `inexistente` nem `documentada`.

## Pontos de controle
- **5 módulos raiz; 37 entradas filhas declaradas.** Destas, 31 têm rótulo não vazio e 6 não têm; o número de entradas exibidas depende de perfil, ambiente e remanejamentos no sidebar.
- **3 entradas sem tipo de página nem template específico** na matriz: Sistema/plantilla_tasa; Comercial/tarifa e Comercial/clientes. Não tratá-las como tela operacional confirmada.
- **2 entradas do tipo list** usam o template genérico templates/list.edu.php: Comercial/tarifa_minima e Comercial/equivalencias. Exigem investigação dos módulos/queries para saber funções reais.
- **3 páginas deslocadas visualmente** de Sistema para Comercial pelo sidebar: agenda_comercial, comercial_miembros e contratos; as URLs reais continuam sob Sistema.
- **2 telas sem rótulo** do Sistema (agenda_comercial_detalle e agenda_comercial_cotizaciones) e 1 tela sem rótulo Comercial (agenda_comercial_detalle_v2) possuem templates próprios e podem ser acessadas por fluxos de outras telas; a ausência de link não significa inatividade.
- **Agenda Comercial V2 documentada** em LEG-MEN-001, com 24 ações API e 19 objetos SQL. Não validada funcionalmente.
- Para as demais, rastrear em ordem: template -> JS -> API -> PHP de negócio -> SQL direto/dinâmico -> DDL -> permissões -> efeitos colaterais. Não criar RF/funcionalidade a partir só de rótulo.

**Relação Linear:** F00 PRO-356, primeira subtarefa PRO-366. **GitHub:** PR draft #2, nenhum merge/autorização para Claude.