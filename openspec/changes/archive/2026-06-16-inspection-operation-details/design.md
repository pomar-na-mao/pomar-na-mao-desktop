## Context

A tela de operações (`/operations`) no aplicativo desktop permite filtrar e visualizar atividades agrícolas. Atualmente, apenas operações de pulverização são suportadas e plotadas como rotas no mapa do Leaflet, exibindo detalhes em um card no canto inferior direito. O objetivo desta mudança é estender a tela para suportar a busca e visualização de operações de inspeção (inspeções manuais), exibindo no mapa as plantas alteradas e suas respectivas alterações de ocorrências em um card similar de detalhes.

## Goals / Non-Goals

**Goals:**
- Criar a RPC `get_inspection_operations` no Supabase para buscar as inspeções, as plantas afetadas e o histórico de alterações das ocorrências.
- Atualizar o arquivo `database.md` com a definição da nova RPC.
- Implementar os métodos de busca correspondentes na camada de dados (`OperationsService` e `OperationsRepository`).
- Adicionar o suporte a tipo de operação "Inspeção" no `OperationsViewModel`, chamando o repositório correto.
- Renderizar as plantas inspecionadas no mapa Leaflet como marcadores circulares usando o renderizador canvas.
- Exibir os detalhes das ocorrências adicionadas ou removidas da planta selecionada em um card flutuante no canto inferior direito.

**Non-Goals:**
- Criação ou edição de novas inspeções/ocorrências nesta tela (a visualização é somente leitura).
- Exibição de trajetórias GPS para inspeções (inspeções não possuem rotas lineares associadas, apenas plantas pontuais na tabela de histórico).

## Decisions

### 1. Criação de RPC Unificada `get_inspection_operations`
Para evitar múltiplos requests (N+1) no frontend para buscar os detalhes de cada planta e suas ocorrências, utilizaremos uma única RPC que retorna as operações de inspeção estruturadas em formato JSON hierárquico:
- Nível superior: Detalhes da operação (`operation_id`, `started_at`, `finished_at`, `notes`, `zone_name`).
- Filhos: Array de plantas (`plants`) com `plant_id`, `latitude`, `longitude`.
- Netos: Para cada planta, as ocorrências modificadas (`occurrences`) com `occurrence_type_name`, `status`, `severity`, `notes` e `resolved_at`.

*Alternativas consideradas:*
- Fazer consultas diretas via cliente Supabase JS (Select) com múltiplos joins. *Rejeitado*: Dificulta a formatação exata do JSON e expõe detalhes de queries complexas no frontend.

### 2. Extensão do Details Card Existente
Em vez de criar um componente inteiramente novo, estenderemos `OperationsMapDetailsCard` para que ele renderize condicionalmente os detalhes dependendo se a operação selecionada é uma pulverização ou uma inspeção.
- No caso de inspeção, o card exibirá:
  - Título: "Detalhes da Planta"
  - Subtítulo: "Inspeção Manual"
  - Identificação da Planta (Coordenadas ou ID resumido)
  - Bloco de ocorrências adicionadas (ícones ou badges verdes de "Adicionado")
  - Bloco de ocorrências removidas (badges vermelhos de "Removido")

### 3. Modelo de Dados Unificado no View-Model
Para gerenciar o estado da operação selecionada e evitar conflitos de fluxo, usaremos propriedades/sinais específicos no `OperationsViewModel`:
- `selectedInspectionOperation` e `selectedInspectionPlant` sinalizando qual planta de qual inspeção está em detalhamento, preenchendo o card de detalhes.

## Risks / Trade-offs

- **[Risk]** Alta quantidade de plantas inspecionadas em períodos muito longos sobrecarregando o mapa.
  - **Mitigation** Limitar o filtro de período por padrão no frontend e utilizar o renderizador `L.canvas` do Leaflet (que já está configurado na aplicação desktop como `plantRenderer` para as plantas normais) para garantir performance com milhares de marcadores.
