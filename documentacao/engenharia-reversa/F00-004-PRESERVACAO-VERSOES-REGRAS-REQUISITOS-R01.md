# TERPORT — F00-004 · Política obrigatória de preservação das versões e conhecimento legado (R01)

**Decisão do responsável PROCEIT em 23/11/2026.** Documento **metodológico**, sem aprovar desenvolvimento, exclusão de regra, migração, descarte ou equivalência entre modelos.

## 1. Objetivo inequívoco

**F00 = analisar e documentar o sistema existente e todo o histórico disponível; não reconstruir nem decidir quais funcionalidades adotar.** A PROCEIT desenvolverá um **sistema novo**, somente **depois** da auditoria completa e da análise dos **50 requisitos RF-01…RF-50 do Linear**, em comparação com o protótipo aprovado e as regras preservadas do PHP/SQL.

Uma tela riscada, rota sem rótulo, código comentado, catálogo antigo, arquivo .bak/.orig ou implementação sobreposta por versão mais recente **continua sendo evidência histórica**. NÃO pode ser eliminado do inventário só por não parecer ativo. Ao mesmo tempo, presença de arquivo antigo não prova uso atual: distinguir claramente **histórico**, **versão em produção confirmada**, **referenciado no código ativo**, **inativo comprovado** e **estado desconhecido**.

Nenhuma redação das fichas F00 deve sugerir que o resultado da auditoria já determinou quais tabelas, cadastros, regras ou funcionalidades serão reproduzidos, substituídos ou descartados na V2. Essas são decisões posteriores, justificadas e aprovadas pelo responsável.

## 2. Inventário e preservação das versões

Para cada versão ou variante fornecida, registrar:
- Origem, responsável, data informada e ambiente (se conhecidos).
- Nome e caminho original do pacote/arquivo, extensão, tamanho e SHA-256; referência ao ZIP de origem.
- Comparação de duplicidade por hash **sem apagar exemplares de origem nem deduzir que cópias são inúteis**.
- Estado documental: código ativo comprovado, backup histórico, variante, arquivo de alteração, execução desconhecida, artefato operacional ou dado sensível.
- Diferenças entre versões nos menus, telas, rotas, APIs, relatórios, permissões, cálculos e SQL; identificar inclusões, supressões, regras alteradas e fluxos substituídos.
- Para cada mudança de regra, vínculo com arquivos/linhas/objeto SQL, versão e grau de evidência.

**Fontes disponíveis neste corte:** terport.zip e terport(1).zip possuem o mesmo SHA256 `3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6`; são duplicatas integrais, **não duas versões distintas**. Há variantes de código no ZIP (.bak, .orig e semelhantes) e auditorias históricas R14/R15; seu conteúdo precisa ser inventariado/comparado sem executar nada. Outras versões anteriores só serão consideradas recebidas quando houver evidência do pacote, repositório, backup ou release correspondente.

**Preservação segura:** guardar originais sem modificação e com hashes em armazenamento autorizado e restrito. Como `proceit-tech/terport` permanece público por decisão temporária do responsável, publicar nele **somente documentação não confidencial**, não código com senhas, configurações, logs, bases, backups nem dados pessoais. Não colocar documentação interna em `terportV2` (destinado somente à aplicação que o cliente acessará). As referências aos originais e seus hashes permitem rastrear o material sem expô-lo.

## 3. Cobertura por menu e versão

Cada ficha **LEG-MEN-###** deve registrar:
1. Rota, nome e papel do menu em cada versão conhecida, inclusive quando movido, sem rótulo ou riscado;
2. Arquivos ativos e variantes históricas, linhas/SHA, diferenças de código e data;
3. Todas as ações UI, APIs, notificações, alertas, logs, jobs e integrações (inclusive sem tela);
4. Tabelas/colunas SQL e R/I/U/D, regras de cálculo, validações e efeitos externos;
5. Condições de sessão, perfil/negócio, permissões e controle de concorrência;
6. Diferenças de comportamento entre versões e impacto de mudanças no fluxo de negócio;
7. Relação com outros menus, tabelas e fases;
8. Estado de verificação **OBSERVADO, INFERIDO, PENDENTE ou CONFIRMADO** por fonte/versão;
9. **Matriz de preservação histórica:** funcionalidade identificada, versões em que aparece, evidência de uso, compatibilidade/regra e pergunta em aberto;
10. **Nenhuma decisão de eliminar/refazer/implementar** embutida na ficha F00.

**Escopo da decisão sobre Usuarios:** o responsável dispensou a engenharia reversa **detalhada do cadastro/configuração administrativa de Usuarios**, porque será redesenhado da forma da PROCEIT. Isso **não remove** a entrada do inventário histórico, nem dispensa examinar permissões ou efeitos de usuários/roles sobre funções de negócio. A exclusão de um cadastro técnico não autoriza descartar regras funcionais antigas.

## 4. Etapas, sem saltos

- **F00/PRO-356:** inventariar versões, funcionalidades e SQL de **todo o escopo de negócio**; documentar cada menu e APIs sem interface, com diferenças históricas e dependências. Corrigir lacunas e apresentar fichas ao responsável.
- **F01/PRO-358:** somente depois de F00 revisada, mapear **funcionalidades documentadas de TODAS as versões** × protótipo visual aprovado × **RF-01 a RF-50**. Cada requisito e cada funcionalidade legada precisa de referência de evidência, cobertura, divergência e decisão pendente.
- **F02/PRO-359:** projetar um **novo esquema SQL Server** para DB1, baseado nas funções e requisitos já aprovados. Mapear fontes antigas para o destino sem apagar a rastreabilidade; plano de migração e histórico são decisões específicas.
- **F03/PRO-360:** arquitetura React/Node/SQL Server e backlog; ordens para Claude só após aprovação expressa. Não programar na F00.

## 5. Controles de perda de conhecimento

Não autorizar conclusão “não serve”, “obsoleto portanto descartar”, “reproduzir o sistema antigo”, “migrar apenas a versão atual” ou “função ausente da V2” sem conciliar a versão de origem, variantes históricas, consultas de outras telas e todos os RF. Cada resultado deve indicar **o que foi analisado, o que não foi analisado e o que ainda está pendente**.

Cada corte de auditoria deve preservar o ZIP original, hashes, PR Draft (sem merge) e referências no Linear. Não executar PHP/SQL/DDL, não alterar cliente nem `terportV2`. GitHub é o **índice e local de documentação não secreta** enquanto público; originais sensíveis ficam em armazenamento restrito.

**Status:** política definida pelo responsável; auditorias LEG-MEN-001/002/003 são fichas de leitura estática e **não equivalem a inventário de todas as variantes históricas**. A inspeção de backups/versões e o confronto com os RF ainda estão pendentes.
