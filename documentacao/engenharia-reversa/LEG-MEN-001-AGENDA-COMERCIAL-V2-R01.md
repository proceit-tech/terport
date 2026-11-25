# LEG-MEN-001 · Agenda Comercial V2 — ficha técnica F00/R01

**Data:** 2026-11-23 · **Estado:** DOCUMENTADO por leitura estática; **NÃO HOMOLOGADO** pelo responsável.
**Fonte:** terport.zip, SHA256 3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6.
**Regra:** documentação do PHP legado REAL; não confundir com o protótipo React. Nenhum PHP/SQL executado; nenhum arquivo de produção alterado; nenhum segredo publicado.
**Issue:** PRO-356. ID LEG-MEN-001 atribuído por ordem de auditoria, não pela posição na sidebar.

## 1. Identificação, telas, permissões
- Entrada declarada em **Comercial > Agenda Comercial V2**: configs/modules.edu.php, chave comercial/submenues/agenda_comercial_v2, etiqueta Agenda Comercial V2; papéis declarados ADMINISTRADOR e COMERCIAL.
- Rotas HTML especiais observadas em index.php L125–190:
  - adm/comercial/agenda_comercial_v2 — GET, template templates/agenda_comercial_v2.edu.php.
  - adm/comercial/agenda_comercial_detalle_v2 — POST, template templates/agenda_comercial_detalle_v2.edu.php; acesso à vista via POST de agenda_id.
- A entrada agenda_comercial_detalle_v2 também consta na matriz como página com etiqueta vazia; não aparece como submenu normal. Acesso é feito por formulário, não por menu visível.
- Autenticação: index.php verifica sessão+rol; comercial_v2/seguridad.php L7–38 também valida sessão e papéis do módulo para API/reporte. Expiração de 24h no legado.
- Tela principal: templates/agenda_comercial_v2.edu.php L41–79: tabela semanal; ano/semana inicial/final, total histórico, agregar contacto, buscar cliente, tipo Visita/Llamada, data/motivo, recalendarizar, abertura do detalhe por formulário.
- Tela detalhe: templates/agenda_comercial_detalle_v2.edu.php L1–147: dados do cliente, histórico, ficha/Excel, editor de contato, Emails, Cotizaciones, tarifas e indicadores; validação de role e agenda_id.
- JavaScript da tela: assets/js/comercial_v2/agenda.js (54 linhas); detalhe.js (226 linhas), ambos chamam comercial_v2/api.php. O CSS é assets/css/comercial_v2.css.
- Exportação: comercial_v2/reporte.php via GET com agenda_id, formato imprimir/excel e contato opcional; usa PHPExcel e HTML de impressão (não PDF gerado no servidor).

## 2. Mapa de chamadas e dependências (observado)
- comercial_v2/api.php L26–32 inclui seguridad.php, conexion.php, agenda_servicio.php, catalogos_servicio.php, agenda_escritura.php, cotizaciones_servicio.php e cierre_servicio.php.
- comercial_v2/api.php L35–63 aceita só POST. Primeiro v2InicioSeguro(); para ação de escrita, v2ValidarCSRF(); em seguida v2Conectar() e despacho para função; sqlsrv_close após execução.
- **16 ações de leitura**: agenda.listar, agenda.total, agenda.detalle, agenda.historial, agenda.contactos, agenda.clientes, agenda.motivos, agenda.contacto, agenda.email.leer, agenda.cotizaciones, agenda.catalogos, agenda.indicadores, agenda.permisos.aprobacion, agenda.cotizaciones.catalogo, agenda.articulos, agenda.tarifas.
- **8 ações de escrita**: agenda.crear, agenda.recalendarizar, agenda.contacto.guardar, agenda.email.guardar, agenda.contacto.cerrar, agenda.cotizacion.guardar, agenda.cotizacion.rechazar, agenda.cotizacion.aprobar.
- A função v2Conectar() / v2Consultar() / v2Ejecutar() em conexion.php usa driver sqlsrv parametrizado e timeout por consulta de 18s. Credenciais e endpoint da conexão **não são transcritos** neste documento.

## 3. Fluxo funcional completo por operação

| Grupo / função | Fonte e linhas | Ação | SQL principal |
|---|---|---|---|
| Listar agenda semanal — v2ListarAgenda | agenda_servicio.php L6–66 | Filtrar ISO ano e semana, usuário, busca, paginação até 28 registros; estados derivados Vencido/Vence Hoy | AGENDA_COMERCIAL R + CLIENTES R + DETALLE_AGENDA_COMERCIAL R |
| Total histórico — v2TotalHistorico | L67–72 | Contagem por usuário | AGENDA_COMERCIAL R |
| Detalhe cliente — v2DetalleCliente | L73–84 | Validar propriedade do agendamento e ler cliente | AGENDA_COMERCIAL R + CLIENTES R |
| Histórico — v2Historial | L85–115 | Contatos de todos os agendamentos do cliente, filtro/paginação | DETALLE_AGENDA_COMERCIAL R + AGENDA_COMERCIAL R |
| Contatos vinculados — v2Contactos | L116–128 | Pessoas e contatos do cliente | CLTESENTREGA R |
| Pesquisar clientes — v2BuscarClientes | agenda_escritura.php L40–48 | Busca por número ou razão social (até 20) | CLIENTES R |
| Criar agenda — v2CrearAgenda | L49–74 | Validar futuro, tipo Visita/Llamada, cliente; bloquear usuário, prevenir duplicidade em 60 s; INSERT transacional | CLIENTES R, SYS_USUARIO R, AGENDA_COMERCIAL R/I |
| Recalendarizar — v2RecalendarizarAgenda | L75–93 | Somente pendentes e do usuário, data mínima na segunda-feira seguinte; transação/concorrência | AGENDA_COMERCIAL R/U |
| Motivos e contato — v2Motivos / v2ObtenerContacto | L94–116 | Catálogo de motivos; detalhe histórico read-only quando contato pertence a outro agendamento | AGENDA_MOTIVOS_CONTACTO R, DETALLE_AGENDA_COMERCIAL R, AGENDA_COMERCIAL R |
| Salvar contato — v2GuardarContacto | L117–164 | Draft S, campos validados, segmento/linha permitidos, criar sequência por cliente ou editar somente rascunho | DETALLE_AGENDA_COMERCIAL R/I/U, AGENDA_COMERCIAL R, AGENCIAS_MARTIMAS R, SEGMENTOS_USUARIOS R |
| Ler/salvar emails — v2LeerEmail / v2GuardarEmail | L165–211 | Conversação HTML do cliente; hash de versão contra sobrescrita; edição proibida se agenda/contato fechado | AGENDA_COMERCIAL_EMAILS R/I/U, AGENDA_COMERCIAL R, DETALLE_AGENDA_COMERCIAL R |
| Catálogos / segmentos / linhas — v2CatalogosComerciales | catalogos_servicio.php L3–34 | Segmentos por usuário, linhas marítimas, valida artigo/porto | SEGMENTOS R, SEGMENTOS_USUARIOS R, AGENCIAS_MARTIMAS R, ARTICULO R |
| Indicadores e permissão — v2IndicadoresCliente / v2PermisoAprobacion | L35–60 | Saldo, faturamento e autorização de gerência | CTACLI R, CM R, MIEMBROS_COMERCIAL R |
| Catálogo de cotizações — v2CatalogoCotizaciones / v2CotizacionesLista | cotizaciones_servicio.php L3–76 | Artigos facturables por segmento/porto, preços/estado cotizados | ARTICULO R, SEGMENTOS_USUARIOS R, DETALLE_AGENDA_COMERCIAL_COTIZACION R |
| Salvar cotização — v2GuardarCotizacion | L77–131 | L/E, preço/importe mínimo, vencimento, operação/CIF, itens elegíveis; transação | DETALLE_AGENDA_COMERCIAL_COTIZACION R/I/U, ARTICULO R, SEGMENTOS_USUARIOS R |
| Rejeitar cotização — v2RechazarCotizacion | L132–151 | Somente gerente autorizado, estado NO APLICADO, exige justificativa | MIEMBROS_COMERCIAL R, DETALLE_AGENDA_COMERCIAL_COTIZACION R/U |
| Tarifas cliente — v2TarifasCliente | L152–188 | Exibe vigentes APROBADO ou pendentes PROVISORIO; filtros por segmento | TARIFA_CLIENTES_ARTICULOS R, TARIFA_CLIENTES_ARTICULOS_ESTADO R, ARTICULO R |
| Aprovar cotização — v2AprobarCotizacion | L189–229 | Gerência, cotização NO APLICADO; cria tarifa e histórico/estado, marca cotização APLICADO, uma transação | DETALLE_AGENDA_COMERCIAL_COTIZACION R/U; TARIFA_CLIENTES_ARTICULOS I; TARIFA_CLIENTES_ARTICULOS_HISTORICO I; TARIFA_CLIENTES_ARTICULOS_ESTADO I; TARIFA_CLIENTES_ARTICULOS_ESTADO_HISTORICO I |
| Cerrar contacto — v2CerrarContacto | cierre_servicio.php L65–107 | Fecha draft N, completa agenda, cria agendamento de seguimento e envia email após commit | DETALLE_AGENDA_COMERCIAL R/U; DETALLE_AGENDA_COMERCIAL_COTIZACION U; AGENDA_COMERCIAL R/I/U; CLTESENTREGA R; MIEMBROS_COMERCIAL R; SYS_USUARIO R |
| Ficha/impressão/Excel | reporte.php L7–63 | Até TOP 5000 contatos, exportação PHPExcel ou impressão HTML, sem escrita SQL | AGENDA_COMERCIAL R; CLIENTES R; DETALLE_AGENDA_COMERCIAL R |

R = leitura; I = inserção; U = atualização. Nenhum DELETE observado nesses serviços V2. A rotina de fechar contato **pode enviar email após commit**, então falha SMTP não desfaz automaticamente o fechamento já gravado (L101–105).

## 4. Dicionário de objetos e campos efetivamente mencionados

**Fonte dos campos:** consultas e comandos nos serviços PHP acima. **Tipos SQL de referência**, quando conhecidos, vêm de SCRIPTS-BBDD/estructura-tablas-comercial.sql e SCRIPTS-BBDD/BBDD-Limpio.sql **do ZIP**, não de metadados ao vivo de DB1.

| Objeto | Campos principais lidos/escritos detectados | Evidência DDL no ZIP |
|---|---|---|
| AGENDA_COMERCIAL | ID, USUARIO_ID, CLIENTE_NUMERO, FECHA_CONTACTO, FECHA_ALTA, FECHA_COMPLETADO, MOTIVO_CONTACTO, TIPO_CONTACTO, ESTADO | CREATE TABLE em estructura-tablas-comercial.sql L1–14 |
| DETALLE_AGENDA_COMERCIAL | ID, ID_AGENDA, ID_SECUENCIA_CONTACTO, FECHA_ALTA, FECHA_PROXIMA_LLAMADA, MOTIVO_CONTACTO, NIVEL_CONTACTO, COMENTARIOS, VENDEDOR, MERCADERIA, ORIGEN, SEGMENTO_ID, LINEA, VOLUMEN, AGENCIA, VALORES, PUERTO_DESC, PASOS_SEGUIR, PROPUESTA, DECISOR, TRABAJA_CON_TERPORT, CAUSA_CONFIRMACION, CAUSA_RECHAZO, BORRADOR, FECHA_GUARDADO, EMAILS_ADICIONALES | L16–45 |
| AGENDA_COMERCIAL_EMAILS | ID, CLIENTE_NUMERO, TEXTO_EMAIL | L134–139 |
| AGENDA_MOTIVOS_CONTACTO | ID, MOTIVO | L141–145 |
| DETALLE_AGENDA_COMERCIAL_COTIZACION | ID, ID_DETALLE_AGENDA, CLIENTE_NUMERO, ARTICULO_NUMERO, MONEDA, PRECIO, IMPORTEMINIMO, FecVcto, LISTA, OBSERVACION, [CIF/BOX], OPERACION, GRUPO, COMPARTIDO_CIP, VALOR, ESTADIA, ENERGIAG, ENERGIA, INICIAL, FINAL, FECHACT, FECALTA, USUARIO, ESTADO_APLICACION, FECHA_APLICACION, OBSERVACION_APLICACION, ID_TARIFA_CLIENTE_ARTICULO | L56–89 |
| MIEMBROS_COMERCIAL | id, usuario, rol | L47–53 |
| SEGMENTOS / SEGMENTOS_USUARIOS | SEGMENTOS.segmento_id/descripcion; SEGMENTOS_USUARIOS.segmento_id/usuario_id | BBDD-Limpio.sql L29–39 |
| AGENCIAS_MARTIMAS | ID, DESCRIPCION | BBDD-Limpio.sql L517–521 |
| CLIENTES | NUMERO, RAZONSOC, TELEFONOS, EMAIL | **Sem DDL integral confirmado neste ZIP** |
| CLTESENTREGA | CLIENTE, RENGLON, TIPO, CONTACTO, DIRECCION, TELEFONOS | Sem DDL integral confirmado |
| SYS_USUARIO | id, usuario, email | Sem DDL integral confirmado |
| ARTICULO | NUMERO, DESCRIP, FACTURABLE, AUXILIAR1, AUXILIAR3 | Sem DDL integral confirmado |
| CTACLI | MONEDAORIG, SALDOML, SALDOME, TOTALML, TOTALME, FECULTVTA, CODCABEZA, CODAPLICAD, CLIENTE, FECANULACION | Sem DDL integral confirmado |
| CM | CodMov, Codigo | Sem DDL integral confirmado |
| TARIFA_CLIENTES_ARTICULOS | ID, CLIENTE_NUMERO, ARTICULO_NUMERO, MONEDA, PRECIO, IMPORTEMINIMO, FecVcto, OBSERVACION, GRUPO, COMPARTIDO_CIP e campos de geração de tarifa | DDL parcial BBDD-Limpio.sql L54–91 |
| TARIFA_CLIENTES_ARTICULOS_ESTADO | ID, ID_TARIFA_CLIENTE_ARTICULO, estado, ARTICULO_NUMERO, CLIENTE_NUMERO, IMPORTEMINIMO, FECVCTO | DDL parcial BBDD-Limpio.sql L92–103 |
| TARIFA_CLIENTES_ARTICULOS_HISTORICO | ID, FECHA_MODIFICACION, ID_USUARIO_MODIFICACION e campos de tarifa copiados | DDL parcial BBDD-Limpio.sql L222–256 |
| TARIFA_CLIENTES_ARTICULOS_ESTADO_HISTORICO | id, ID_TARIFA_CLIENTE_ARTICULO, estado, FECHA_MODIFICACION, ID_USUARIO_MODIFICACION e referências da tarifa | DDL parcial BBDD-Limpio.sql L257–... |

**Total: 19 objetos SQL distintos identificados diretamente para esta Agenda V2.** Tabelas adicionais podem ser acessadas por triggers ou dependências não entregues; não se presume a inexistência delas.

### Tipos e vínculos do DDL histórico (não homologados)
- AGENDA_COMERCIAL.ID = int identity PK; USUARIO_ID = int FK de SYS_USUARIO; CLIENTE_NUMERO = varchar(7) FK de CLIENTES; FECHA_CONTACTO = date; ESTADO = varchar(10).
- DETALLE_AGENDA_COMERCIAL.ID = int identity PK; ID_AGENDA = int FK; COMENTARIOS/VALORES/PASOS_SEGUIR = text; SEGMENTO_ID = nvarchar(40); BORRADOR = varchar(1); FECHA_PROXIMA_LLAMADA = date.
- DETALLE_AGENDA_COMERCIAL_COTIZACION usa campos monetários float, ID_DETALLE_AGENDA com FK, ARTICULO_NUMERO e CLIENTE_NUMERO com FKs conforme DDL histórico; **não inferir precisão decimal adequada** a partir de float.
- AGENDA_COMERCIAL_EMAILS.TEXTO_EMAIL = text, com FK CLIENTE_NUMERO; AGENCIAS_MARTIMAS.ID = varchar(10).
- Ausência de FK declarada entre SEGMENTO_ID do detalhe e SEGMENTOS, ou entre LINEA e AGENCIAS_MARTIMAS, no DDL apresentado: **não prova ausência na base atual**.

## 5. Regras de negócio a preservar na comparação futura
1. Listagem por usuário, ISO ano/semana, filtro de vencimentos automáticos e paginação controlada (máximo 28 por página, não bloqueio de altas).
2. Datas DD/MM/AAAA e recalendarização apenas de agendamento PENDIENTE, com trava concorrente.
3. Agenda vinculada a CLIENTES e SYS_USUARIO; prevenção de duplicidade recente na criação.
4. Histórico por CLIENTE_NUMERO ultrapassa o agendamento atual; contato de outro agendamento é consultável mas marcado read-only.
5. Contato em BORRADOR = S editável, BORRADOR = N não editável; FECHA_PROXIMA_LLAMADA obrigatória para fechamento.
6. Segmento permitido por usuário e linha marítima em catálogo; artigo FACTURABLE e prefixo por porto.
7. Cotização por moeda L/E, grupo/CIP, operação, vencimento, limites; gerente autorizada pelo rol em MIEMBROS_COMERCIAL.
8. Ao **aprovar cotização**, o código cria tarifa com estado **PROVISORIO** (não APROBADO) e registra histórico em tabelas separadas.
9. Fechamento de contato conclui agenda, finaliza cotizações não aplicadas, insere novo seguimento PENDIENTE, só depois tenta SMTP; notificação falhada não significa rollback.
10. Email de cliente controla revisão por hash do texto, com conflito se outra sessão alterou o conteúdo.

## 6. Hallazgos e riscos observados — NÃO modificar ainda
| ID | Evidência | Achado / impacto | Estado |
|---|---|---|---|
| AGV2-01 | agenda_escritura.php L50–55; DDL L5 | Campo cliente validado até 30 caracteres em PHP, mas DDL histórico define CLIENTE_NUMERO varchar(7). Validar formato real e truncamento antes de modelar V2 | OBSERVADO, impacto a validar |
| AGV2-02 | BBDD-Limpio.sql L431 e L500–502 | OBSERVACION_APLICACION já consta em CREATE TABLE e é adicionada novamente por ALTER: o script de referência NÃO deve ser executado integralmente como migração idempotente | OBSERVADO |
| AGV2-03 | cotizaciones_servicio.php L189–227 | A ação denominada aprobar gera estado PROVISORIO; distinguir aprovação de cotização e aprovação final de tarifa | OBSERVADO |
| AGV2-04 | DDL cotização L62–80; cotizaciones_servicio.php L77–102 | Valores de preço/quantidade apoiam-se em FLOAT; precisão e arredondamento precisam de análise para novo modelo SQL | OBSERVADO |
| AGV2-05 | cierre_servicio.php L89–105 | Após commit, SMTP pode falhar; resposta deve distinguir fechamento gravado de comunicação não enviada | OBSERVADO |
| AGV2-06 | seguridad.php L68–77 | CSRF deriva da sessão e de uma configuração interna sensível do sistema; avaliar separação de segredos no projeto novo, sem publicar valores | OBSERVADO |
| AGV2-07 | reporte.php L19–48 | Exportação limita a TOP (5000) registros e depende de PHPExcel; não declarar cobertura de todo histórico sem analisar limite | OBSERVADO |
| AGV2-08 | SQL histórico vs metadados atuais | Não há catálogo DDL integral verificado para CLIENTES, ARTICULO, CLTESENTREGA, CTACLI, CM e SYS_USUARIO; validar antes de homologar campos e tipos | PENDENTE |
| AGV2-09 | agenda_escritura.php L132–135 e DDL AGENCIAS_MARTIMAS | LINEA é validada por ID de agência marítima, mas detalhe usa campo varchar(100) sem FK visível; preservar o comportamento e analisar integridade | OBSERVADO |
| AGV2-10 | Auditoria apenas estática | Rotas, permissões, inserções, SMTP e consultas NÃO testados em servidor real; versão do ZIP pode divergir da produção | PENDENTE |

## 7. Critério de fechamento da ficha
**Leitura do código V2:** documentada. **Leitura de objetos SQL:** referenciada ao DDL histórico do ZIP. **Testes SQL/funcionais:** não executados. **Aprovação do responsável:** PENDENTE.

Antes de declarar LEG-MEN-001 VALIDADO: reconciliar com DDL/metadados atuais, confirmar fluxos de tela e comportamento no sistema existente, revisar detalhes de permissões e efeitos de notificações, registrar discrepâncias e aceite. Nenhuma implementação React/Node/SQL até F01–F03.
