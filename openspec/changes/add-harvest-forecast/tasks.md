# Tasks

## 1. Banco e documentação

- [x] 1.1 Entregar a migration de criação condicional de `harvest_forecasts` e das RPCs de consulta e edição, com rollback manual. Validar em PostgreSQL local a base vazia, a tabela mobile preexistente, a preservação de dados e dependências, o cálculo por cenário, pesos decimais, os filtros, RLS, acesso anônimo e conflitos de versão.
- [x] 1.2 Atualizar os itens 20 e 25 de `database.md`. Conferir o fluxo desktop, as assinaturas das RPCs, os campos de resposta, as políticas e permissões da tabela nova e os caminhos de aplicação e rollback.

## 2. Navegação, dados e filtros

- [x] 2.1 Adicionar `/previsao-de-safra` ao layout autenticado e ao menu lateral. Cobrir carregamento da rota e presença da entrada em testes unitários de roteamento e menu.
- [x] 2.2 Tipar o snapshot e os argumentos das RPCs no serviço do projeto selecionado. Cobrir chamadas e erros em testes unitários, incluindo os parâmetros opcionais e o repasse de `updated_at` sem perda de precisão.
- [x] 2.3 Criar o painel lateral com o padrão de `/meu-pomar` e os seletores. Cobrir em testes unitários os valores padrão, a lista de anos e zonas e o descarte de respostas de filtros ou projetos anteriores.

## 3. Cenários, mapa e edição

- [x] 3.1 Construir a tabela **Cenários**, a edição por duplo clique e teclado e o resumo do botão **Previsão**. Cobrir em testes unitários as doze células padrão, o cancelamento, pesos inválidos, zero, decimais e a invalidação de resumos após mudanças de parâmetros.
- [x] 3.2 Plotar as plantas e mostrar as cinco contagens e o comparativo geral. Cobrir em testes unitários a sincronização do mapa e contadores com o recorte, inclusive quando a consulta retorna vazia.
- [x] 3.3 Implementar o editor por marcador, confirmação de salvamento e recarga do recorte e do resumo ativo. Cobrir em testes unitários os estados de sucesso, erro, conflito de versão e marcador que sai do recorte após a edição.

## 4. Verificação integrada

- [x] 4.1 Executar os testes e o build do desktop. Comparar com `/meu-pomar` nos temas claro e escuro e em janelas de desktop e estreitas. Fazer o percurso completo com um recorte sem marcações e outro com volume representativo, conferindo edição, contagens e previsão com a migration em ambiente local.
