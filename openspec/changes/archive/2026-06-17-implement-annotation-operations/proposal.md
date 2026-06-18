## Why

O sistema atualmente permite o registro de anotações manuais em campo pelo aplicativo mobile (com `source = 'manual'`), mas o painel web/desktop na rota `/operations` não exibe essas operações ou as ocorrências e plantas afetadas por elas. É necessário permitir que o usuário selecione o tipo de operação "Anotação" para filtrar e visualizar no mapa as plantas com ocorrências anotadas manualmente dentro do período e zona selecionados, seguindo o padrão de UI já consolidado nas inspeções.

## What Changes

- Adicionar suporte oficial ao tipo de operação "Anotação" na tela de operações.
- Implementar uma nova RPC `get_annotation_operations` no Supabase para buscar as operações de campo manuais (`source = 'manual'`), filtrando por período e zona, e retornando as plantas e ocorrências criadas nelas.
- Integrar a busca e exibição de anotações no frontend:
  - Desenhar as plantas com ocorrências anotadas como marcadores interativos no mapa.
  - Ao clicar em uma planta, abrir o card de detalhes no canto inferior direito listando as ocorrências adicionadas por aquela anotação.
- Registrar as mudanças na arquitetura do banco de dados no arquivo `database.md`.

## Capabilities

### New Capabilities
- `annotation-operation-details`: Exibição de plantas e ocorrências geradas em operações de anotação manual na tela de operações do painel desktop.

### Modified Capabilities
- `operations-screen-ui`: Inclusão do tipo de operação "Anotação" no painel de filtros e controle de visualização correspondente.

## Impact

- **Database**: Criação da RPC `get_annotation_operations` via migração do Supabase e documentação em `database.md`.
- **Frontend/Services**: `OperationsService` e `OperationsRepository` para incluir métodos de busca de anotações.
- **Frontend/ViewModels**: `OperationsViewModel` para controlar o estado, carregamento e desenho das plantas e rotas no mapa para anotações.
- **Frontend/Views**: Componentes do mapa e painéis de detalhes para exibir os dados e alternar corretamente o card de detalhes da planta.
