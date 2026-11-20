# Spec Delta

## Purpose

Consolidar as marcações de safra em um mapa do desktop e estimar a produção em quilos com pesos por classe e cenário.

## ADDED Requirements

### Requirement: Tela de previsão segue o layout do Meu Pomar

A tela SHALL usar o padrão de cabeçalho, tipografia, espaçamento, superfícies e controles de `/meu-pomar`, com painel de filtros e previsão à esquerda e mapa interativo à direita no desktop.

#### Scenario: Usuário abre a tela

- **WHEN** o usuário acessa Previsão de Safra
- **THEN** o painel MUST exibir o título **Previsão de Safra**, um subtítulo no estilo de **Meu Pomar**, os filtros, a seção **Cenários** e o botão **Previsão**, nessa ordem.
- **THEN** o mapa MUST ocupar a área principal e seus controles MUST permanecer acessíveis quando a janela for estreita.

### Requirement: Filtros selecionam as marcações de safra

A tela SHALL filtrar por ano de criação da marcação, classificação e zona atual da planta, com um seletor separado para o cenário de cálculo.

#### Scenario: Usuário abre os filtros

- **WHEN** os catálogos carregam
- **THEN** o ano MUST listar os anos de `created_at` disponíveis em ordem decrescente, calculados em `America/Sao_Paulo`, com o mais recente selecionado por padrão.
- **THEN** a classificação MUST oferecer `TODAS` por padrão e as opções `N`, `P`, `M`, `G` e `GG`.
- **THEN** a zona MUST listar as zonas cadastradas, com opção de todas as zonas por padrão.
- **THEN** o seletor **Cenário Base** MUST oferecer `OTIMISTA`, `REALISTA` e `PESSIMISTA`, com `REALISTA` por padrão.

#### Scenario: Usuário combina filtros

- **WHEN** o ano, a classe ou a zona selecionada muda
- **THEN** o mapa e seus contadores MUST refletir a interseção dos filtros.
- **THEN** a lista de anos e zonas MUST continuar disponível para mudar de recorte.

### Requirement: Pesos dos cenários são editáveis

A tabela **Cenários** SHALL mostrar as classes `GG`, `G`, `M` e `P`, com pesos em kg/pé para as colunas **Otimista**, **Realista** e **Pessimista**, nessa ordem.

#### Scenario: A tabela é exibida pela primeira vez

- **WHEN** a tela carrega
- **THEN** os pesos MUST ser `40 / 35 / 30` para `GG`, `28 / 25 / 22` para `G`, `17 / 15 / 13` para `M` e `6 / 5 / 4` para `P`.

#### Scenario: Usuário edita um peso

- **WHEN** o usuário dá duplo clique numa célula de peso ou aciona sua edição pelo teclado
- **THEN** a célula MUST aceitar números finitos e não negativos, incluindo valores decimais e zero.
- **THEN** ao confirmar um valor válido, o próximo cálculo MUST usar o valor editado na classe e no cenário correspondentes.
- **THEN** ao cancelar ou informar valor inválido, o valor confirmado anteriormente MUST ser preservado.

### Requirement: Mapa e contadores usam as mesmas marcações

O mapa SHALL plotar as coordenadas das plantas vinculadas às marcações filtradas e exibir as quantidades encontradas, a base geral de plantas do pomar e os totais das cinco classes.

#### Scenario: Existem marcações no recorte

- **WHEN** a consulta retorna marcações que correspondem aos filtros
- **THEN** cada marcação MUST identificar sua classe, e os contadores de `N`, `P`, `M`, `G` e `GG` MUST somar a quantidade encontrada.
- **THEN** o denominador MUST ser o total de plantas visíveis no pomar do projeto selecionado, independente dos filtros.

#### Scenario: Nenhuma marcação corresponde aos filtros

- **WHEN** a consulta retorna um recorte vazio
- **THEN** o mapa MUST exibir nenhum marcador de previsão, com quantidade encontrada igual a zero e os cinco contadores zerados.

### Requirement: Ação Previsão calcula o total em quilos

Ao acionar **Previsão**, a tela SHALL consultar a RPC de leitura com os filtros, o cenário e os pesos atuais e apresentar o resultado abaixo do botão.

#### Scenario: Usuário calcula a previsão

- **WHEN** a resposta é recebida para os parâmetros atuais
- **THEN** o resumo MUST exibir ano, totais de Pequeno, Médio, Grande e Muito Grande e a estimativa em kg.
- **THEN** o backend MUST somar a quantidade de cada classe multiplicada pelo peso da classe no cenário selecionado.
- **THEN** a classe `N` MUST ser contabilizada no mapa com contribuição de zero kg.

#### Scenario: Usuário calcula um recorte sem marcações

- **WHEN** a RPC conclui e encontra zero registros
- **THEN** o resumo MUST indicar as classes vazias com `-` e a previsão de `0 kg`, mostrando o ano selecionado ou `-` quando ainda não houver ano disponível.

#### Scenario: Parâmetros mudam ou a consulta falha

- **WHEN** filtros, cenário ou pesos são alterados após um cálculo
- **THEN** o resultado anterior MUST ser invalidado até o próximo cálculo.
- **WHEN** a consulta falha
- **THEN** a tela MUST apresentar uma mensagem e permitir tentar novamente.

### Requirement: Usuário edita a classe pelo mapa

A interação com o marcador SHALL permitir editar a classificação da marcação existente e salvar a alteração explicitamente.

#### Scenario: Usuário confirma uma mudança

- **WHEN** uma classe válida é salva no marcador selecionado
- **THEN** apenas a classe e a data de atualização do registro MUST mudar.
- **THEN** o mapa e os contadores MUST ser consultados novamente, e um resumo ainda válido para aqueles parâmetros MUST ser atualizado.

#### Scenario: A versão da marcação mudou

- **WHEN** uma sincronização ou edição concorrente alterou ou removeu o registro desde a consulta
- **THEN** a edição MUST sinalizar o conflito, atualizar os dados disponíveis e preservar a alteração mais recente.

### Requirement: Consulta é somente leitura e respeita o acesso do projeto

A consulta SHALL calcular a estimativa usando as marcações, plantas e zonas visíveis para o usuário autenticado no projeto selecionado.

#### Scenario: RPC calcula uma previsão

- **WHEN** um usuário autorizado solicita a previsão
- **THEN** a RPC MUST devolver os anos disponíveis, as zonas, os marcadores do recorte, as contagens e o total em kg, sem alterar os dados persistidos.

#### Scenario: RPC recebe parâmetros inválidos ou acesso anônimo

- **WHEN** o ano, a classe, o cenário ou a matriz de pesos são inválidos, ou a chamada é anônima
- **THEN** a requisição MUST ser rejeitada.
