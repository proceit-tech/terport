# LEG-MEN-004 — Índice de integridade e variantes históricas (R01)
**Corte:** 25/11/2026. **Origem:** ZIP TERPORT recebido, SHA256 `3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6`. **Nenhum fonte/credencial foi publicado.**
**Uso:** recuperar exatamente uma cópia de código a partir do ZIP original, comparar diferenças de funções e regras e **não perder nenhuma versão presente no pacote**. O nome .bak não comprova que foi instalado nem estabelece data de implantação.

## Matriz de integridade por arquivo

| Arquivo relativo em `terport/` | SHA-256 (prefixo de 20 caracteres) | Linhas | Observação de versão |
|---|---|---:|---|
| templates/tarifario.edu.php | 2f03a35e07158f0bf2ee | 1126 | Template principal da entrada Cliente Tasa |
| templates/tarifario.edu.php.bak | d75fe7dcf9722be6efdf | 1126 | Variante de rótulos I/E e seletor JS de linha |
| api/getTarifas.edu.php | 29c0ee0ed3a69c637475 | 95 | Listagem |
| api/getTarifasRowData.edu.php | 7839d2d37158b7419e66 | 50 | Consulta por quatro componentes |
| api/getTarifasRowData.edu.php.bak | a653fe6dc21c841ca9bd | 50 | Consulta por três componentes |
| api/getTarifasSendData.edu.php | 2fc077b00957ea8ac206 | 144 | Inclusão/edição + estado; quatro componentes |
| api/getTarifasSendData.edu.php.bak | 5c51060fef298f0890c5 | 140 | Estado por três componentes; variantes de email |
| api/getTarifasSendData.edu.php.bak2 | 68aaabda04a99d336187 | 140 | Variante de transporte/destinatários |
| api/getTarifasSendData.edu.php.bak3 | faaf54b0c83535371247 | 140 | Variante de seleção de destinatários/transporte |
| api/getTarifasSendData.edu.php.bak4 | 2eebc508e0b468da0817 | 140 | Variante de envio |
| api/getTarifasSendData_NE.edu | a971dc1712acc5b1f937 | 144 | Variante de transporte; extensão diferente da rota regular |
| api/getTarifasDelete.edu.php | ee47dbba739561893ef8 | 21 | Marca excluído por quatro componentes |
| api/getTarifasDelete.edu.php.bak | 20562c721695e122a2e8 | 21 | Marca excluído por três componentes |
| api/getTarifasArticulos.edu.php | 8a03c056a81498536cfc | 26 | Consulta `LISTAS` por cliente |
| api/getTarifasArticulosAgregar.edu.php | 5d4b619b9a1bde8c88e | 24 | INSERT `LISTAS` |
| api/getTarifasArticulosDelete.edu.php | 8c2188c6ccd0d09fbfdb | 19 | DELETE `LISTAS` |
| templates/cliente_tasa.edu.php | ae5c80e1270e30858304 | 1244 | **Outro menu** Cliente Tasas / ARTICULO |
| templates/cliente_tasa.edu.vprod06012020.php | a46dd38986a57c4748d4 | 1222 | Variante histórica nomeada de outro menu |

## Diferenças objetivas com impacto potencial
1. **Consulta e exclusão de tarifa:** variantes `.bak` dos endpoints usam 3 atributos no WHERE; principal usa CLIENTE, TARIFA, TASAMINIMO e IMPORTEMINIMO. **Não inferir alteração de PK SQL**.
2. **Envio de dados:** variante `.bak` da API usa estado sem IMPORTEMINIMO, enquanto a principal escreve o quarto atributo no registro de estado. Isso muda a correspondência lógica de preços mínimos.
3. **Transporte de email:** variantes `.bak2/.bak3/.bak4/_NE` diferem de maneira concentrada na seleção de destinatários e configuração SMTP. **Credenciais embutidas detectadas, valores deliberadamente não documentados**.
4. **Interface:** `tarifario.edu.php.bak` conserva nomes anteriores de modalidades (I/E/L/T) e um seletor JavaScript antigo de linha; os códigos não devem ser perdidos.
5. **Modelo por ARTICULO:** a variante `cliente_tasa.edu.vprod06012020.php` pertence a `Cliente Tasas`, uma entrada distinta; deve receber própria ficha F00.

Os hashes acima são **prefixos para leitura humana**. Para provar integridade, usar o SHA-256 **completo** do ZIP e, quando necessário, calcular SHA-256 completo do membro original extraído. Os ZIPs `terport.zip` e `terport(1).zip` têm hash integral idêntico: não fornecem duas releases distintas.

## Pendências e proibições
- Datas, sequência de produção, alterações de esquema e instalações reais não verificadas.
- Confrontar com metadados de DB1 sem fazer comandos SQL nem executar scripts antigos até autorização.
- Receber e comparar outras versões que possam existir fora deste ZIP.
- Manter originais sensíveis em armazenamento restrito; o repositório `terport` permanece público por decisão temporária do responsável.
- Não copiar código sensível para `terportV2`, não iniciar Claude, não concluir desenho V2 antes dos 50 requisitos.

**Ficha mãe:** [LEG-MEN-004 — Comercial Cliente Tasa](LEG-MEN-004-COMERCIAL-CLIENTE-TASA-R01.md).