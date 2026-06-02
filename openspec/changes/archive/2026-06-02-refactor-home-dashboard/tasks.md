## 1. Fontes de Dados do Dashboard

- [x] 1.1 Analisar a integração do view-model com o repositório `HomeDashboardRepository` para garantir o carregamento correto dos totais.
- [x] 1.2 Validar se a chamada para buscar o snapshot inicial do dashboard retorna os totais corretos de plantas, zonas, tipos de ocorrência e variedades na inicialização.
- [x] 1.3 Assegurar que os dados agregados das variedades forneçam a lista necessária para construir a legenda visual.

## 2. Lógica e Estados do View-Model

- [x] 2.1 Verificar no `DashboardViewModel` se o carregamento inicial dispara a plotagem imediata de todas as plantas com coordenadas válidas.
- [x] 2.2 Validar o mapeamento de cores determinístico baseado no índice da variedade e a cor padrão fallback para plantas sem variedade.
- [x] 2.3 Garantir que o sincronismo entre os estados dos cards e a renderização do mapa ocorra de forma reativa por meio dos Signals do Angular.

## 3. Estruturação do Layout e Cards Visuais

- [x] 3.1 Validar o grid de layout de três colunas no arquivo `dashboard.html` e verificar o alinhamento em diferentes tamanhos de tela.
- [x] 3.2 Confirmar que a legenda de variedades é renderizada corretamente dentro do quarto card da esquerda.
- [x] 3.3 Confirmar que os cards da direita (`Pulverizações`, `Anotações`, `Inspeções`, `Colheita`) exibem os valores fixos especificados de forma mockada.
- [x] 3.4 Verificar se os componentes ou cabeçalhos antigos não utilizados foram completamente limpos da interface do dashboard.

## 4. Validação e Testes do Sistema

- [x] 4.1 Rodar a validação do TypeScript no projeto para assegurar que não há erros de tipagem.
- [x] 4.2 Executar os testes automatizados com o Vitest (`npm run test`) para verificar se todos os testes do dashboard estão passando.
- [x] 4.3 Executar o build de desenvolvimento do frontend (`npm run web:dev`) para garantir que o empacotamento do Angular e do Tauri conclui com sucesso.
