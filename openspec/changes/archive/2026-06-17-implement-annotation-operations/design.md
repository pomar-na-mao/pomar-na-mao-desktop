## Context

Atualmente, a tela de operações (`/operations`) exibe rotas de pulverizações (quando selecionado o tipo "Pulverização") ou os marcadores de plantas que sofreram alterações com suas respectivas ocorrências (quando selecionado o tipo "Inspeção"). No entanto, quando o usuário seleciona o tipo de operação "Anotação", nada é buscado ou exibido no mapa.
Para exibir as anotações, precisamos:
1. Buscar no Supabase as operações de campo com origem manual (`fo.source = 'manual'`), filtrando por data e zona.
2. Identificar quais plantas sofreram alteração (adição de ocorrências) em cada operação manual.
3. Renderizar marcadores correspondentes no mapa do Leaflet.
4. Mostrar o card de detalhes com as ocorrências no canto inferior direito ao clicar na planta.

## Goals / Non-Goals

**Goals:**
- Criar a RPC `get_annotation_operations` no banco de dados Supabase via migração e atualizar o `database.md`.
- Buscar e exibir as operações manuais (anotações) na tela de operações quando o tipo de operação selecionado for "Anotação".
- Apresentar os marcadores das plantas no mapa correspondentes às anotações encontradas.
- Exibir no card de detalhes inferior direito as ocorrências que foram adicionadas à planta durante a anotação manual ao clicar em um marcador.
- Manter o comportamento e layout idênticos ao detalhe das inspeções, garantindo consistência visual e de UX.

**Non-Goals:**
- Criar novas telas ou modais adicionais de visualização.
- Permitir edição de anotações a partir da tela de operações (somente visualização).

## Decisions

### 1. Criação de Nova RPC `get_annotation_operations`
Para evitar sobrecarregar o cliente e manter a lógica consistente com as inspeções, criaremos uma função `get_annotation_operations` idêntica à `get_inspection_operations`, porém filtrando por `fo.source = 'manual'` ao invés de `fo.source = 'inspection'`.

*Alternativa considerada:* Fazer a busca de forma ad-hoc via queries diretas na tabela `field_operations` a partir do repositório JS/TS.
*Racional:* A RPC já calcula as plantas e agrupa as ocorrências adicionadas em formato JSON, o que reduz drasticamente o tráfego de rede e simplifica o código do frontend. Além disso, segue exatamente o padrão das outras operações.

### 2. Reaproveitamento do Fluxo de Detalhes no Frontend
O `OperationsViewModel` possui signals e métodos estruturados especificamente para as inspeções (ex.: `selectedInspectionDetails`, `selectedInspectionPlant`, `inspectionEntriesForPlant`).
Propomos reutilizar ou mapear o estado de "Anotações" para esses mesmos signals de inspeção na UI, ou estender de forma limpa para que o card de detalhes renderize ambos sem duplicação de lógica visual.
Para manter a consistência extrema solicitada ("Seguir exatamente o modelo usado no detalhe das inspeções"), as anotações manuais serão expostas de forma análoga às inspeções no `OperationsViewModel`:
- No `OperationsViewModel`, se o tipo de operação selecionado for `anotacao`, chamaremos `get_annotation_operations` e alimentaremos o repositório de anotações.
- Mapearemos/desenharemos os marcadores com a mesma lógica de agrupamento de planta das inspeções.
- O card de detalhes flutuante irá ler os dados da planta selecionada de forma idêntica.

## Risks / Trade-offs

- **[Risco]** Ausência de `zone_id` em operações manuais antigas ou inconsistentes.
  - *Mitigação:* A RPC `create_occurrence_annotation` garante que `zone_id` seja preenchido a partir da planta mais próxima caso não seja fornecido. Para segurança total, a consulta utiliza `left join public.zones z on z.id = fo.zone_id` e a filtragem de zona `(p_zone_id is null or fo.zone_id = p_zone_id)` atende perfeitamente.
