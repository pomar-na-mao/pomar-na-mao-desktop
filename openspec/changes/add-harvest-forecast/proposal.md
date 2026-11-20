# Proposal

## Why

A equipe registra a classificação de safra em campo pelo mobile. O desktop precisa reunir essas marcações no mapa e transformar a distribuição por classe em uma estimativa em quilos para o planejamento da colheita.

## What Changes

- Adicionar a tela autenticada **Previsão de Safra** em `/previsao-de-safra`, com entrada no menu e o mesmo padrão visual de `/meu-pomar`.
- Mostrar na lateral esquerda os filtros de ano, classificação, zona e cenário, a tabela editável de pesos por pé e o resultado acionado pelo botão **Previsão**.
- Plotar à direita as plantas associadas às marcações filtradas, mostrar a quantidade encontrada, o total geral e os contadores por classe, e permitir editar a classificação de uma marcação pelo mapa.
- Entregar uma migration de aplicação e um script de rollback manual. A migration reutiliza `public.harvest_forecasts` quando ela já existe e cria a tabela compatível com o mobile quando estiver ausente. A RPC de cálculo consulta os dados e retorna a estimativa sem gravar resultados.
- Atualizar os itens 20 e 25 de `database.md` com o fluxo desktop, os contratos SQL e a ordem de aplicação e reversão.

## Capabilities

### New Capabilities

- `harvest-forecast` — Filtros, cenários, cálculo, mapa e edição de marcações de previsão de safra no desktop.

### Modified Capabilities

- `desktop-route-surface` — Entrada autenticada para `/previsao-de-safra` e acesso pelo menu lateral.

## Impact

- Roteamento Angular, menu do layout autenticado e nova tela baseada na interface cartográfica de `/meu-pomar`.
- Banco PostgreSQL/Supabase por projeto selecionado, com RPCs para consulta e alteração da classe, além da criação condicional da tabela canônica. Os scripts são entregues localmente para aplicação e rollback manuais.
