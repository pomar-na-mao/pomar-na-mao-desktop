## Context

A rota `home` carrega o componente `Dashboard`, que deve priorizar o mapa no centro, carregar todas as plantas na inicialização e exibir indicadores nas colunas laterais da tela diretamente relacionados às tabelas do banco de dados: `plants`, `zones`, `occurrence_types` e `varieties` (à esquerda) e atalhos mockados (à direita).

O repositório e o view-model do dashboard já possuem uma estrutura madura em Angular e Leaflet (em `src/app/ui/views/dashboard/` e `src/app/ui/view-models/dashboard/`). Esta mudança visa formalizar as decisões arquiteturais adotadas nessa refatoração da home, estabelecendo a infraestrutura estável para os contadores e garantindo a consistência na colorização e plotagem das plantas por variedade.

## Goals / Non-Goals

**Goals:**
- Centralizar o mapa no layout da tela `home`, dividindo a área de visualização com duas colunas simétricas de cards (botões).
- Plotar todas as plantas na inicialização do componente diretamente no mapa.
- Obter e renderizar na tela os totais consolidados das quatro tabelas operacionais da esquerda.
- Exibir a legenda de variedades dentro do card correspondente e colorir os marcadores do mapa de acordo com o mapeamento de cores da legenda.
- Renderizar os quatro cards da direita com títulos e valores fixados/mockados de forma limpa.

**Non-Goals:**
- Implementar novas lógicas de filtros complexos ou interações não detalhadas para os cards.
- Desenvolver lógica real ou endpoints de backend para os cards operacionais da direita (`Pulverizações`, `Anotações`, `Inspeções`, `Colheita`).
- Modificar o fluxo de inclusão em massa ou outras views da aplicação.

## Decisions

### 1. Reuso do View Model e Rota Existentes
A rota `home` continuará utilizando o componente `Dashboard`, mas seu arquivo de template `dashboard.html` será simplificado para focar unicamente na grade de 3 colunas (Left Cards -> Map -> Right Cards). Isso elimina complexidade de roteamento e evita código duplicado.

### 2. Separação de Dados: Estatísticas vs. Coordenadas de Plantas
Para otimizar o tempo de resposta e o tráfego de dados, o backend e o repositório devem expor dois fluxos lógicos na carga inicial:
- Um snapshot de metadados contendo os totais agregados e o catálogo de variedades com seus identificadores.
- Um array com todas as plantas contendo apenas os dados essenciais para plotagem no mapa (`latitude`, `longitude`, `varietyId`, `varietyName`, `id`).

### 3. Mapeamento Determinístico de Cores de Variedades
Para garantir consistência visual no mapa e na legenda:
- As variedades cadastradas receberão cores com base em uma paleta predefinida indexada.
- Plantas com valor `varietyId` ou `varietyName` nulos receberão uma cor fallback constante ("Sem variedade").
- A legenda exibirá apenas as cores correspondentes, que serão as mesmas usadas para pintar as bolinhas das plantas correspondentes no mapa Canvas do Leaflet.

## Risks / Trade-offs

- [Desempenho com grande volume de plantas] → Mitigação: O Leaflet é configurado para usar renderização baseada em Canvas (`preferCanvas: true`), permitindo desenhar milhares de marcadores de círculo leves e popup sob demanda sem degradação perceptível de performance.
- [Mocking de dados da direita] → Mitigação: Manter as propriedades dos cards da direita isoladas no array do view-model como valores fixos, facilitando sua posterior substituição por lógica dinâmica quando o backend correspondente for desenvolvido.
