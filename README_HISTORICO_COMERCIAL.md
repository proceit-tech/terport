# TERPORT V2 — Histórico Comercial Completo

Este pacote cobre dois requisitos centrais:

1. Histórico compartilhado de contatos.
2. Histórico de atribuição da carteira.

## Cartera Comercial

Agora possui três visões:

- Asignación actual
- Historial de cartera
- Acciones por representante

O histórico de carteira registra:

- cliente
- representante
- período de responsabilidade
- representante anterior
- motivo da mudança
- usuário que realizou a alteração
- data/hora da alteração

## Historial Compartido de Contactos

Mostra todas as ações comerciais, independentemente do representante atual.

Permite filtrar por:

- cliente
- representante

Exibe:

- data/hora
- cliente
- representante
- ação
- motivo
- resultado
- próxima ação
- compromisso
- estado
- origem

Isso garante continuidade quando existe:

- ausência
- férias
- mudança de carteira
- troca de representante

## Arquivos

- app/(app)/portfolio/page.tsx
- app/(app)/contact-reports/page.tsx
- lib/prototype-commercial-history.ts
