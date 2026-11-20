# harvest-forecast-desktop-view Specification

## Purpose

Permitir que usuários do desktop consultem espacialmente as classificações de safra coletadas no campo e obtenham uma estimativa em quilogramas a partir de cenários de peso ajustáveis.

## Requirements

### Requirement: Apresentar a tela no padrão cartográfico do Meu Pomar

O aplicativo SHALL apresentar a tela **Previsão de Safra** com as mesmas proporções, superfícies, espaçamentos e comportamento responsivo de `/meu-pomar`, mantendo o painel de controles à esquerda e o mapa à direita em viewports desktop.

#### Scenario: Abrir a tela em viewport desktop

- **WHEN** o usuário autenticado acessa `/previsao-de-safra` em uma viewport desktop
- **THEN** o painel de filtros MUST aparecer à esquerda e o mapa MUST ocupar o espaço restante à direita
- **AND** os inputs e dropdowns MUST seguir o padrão visual dos controles de `/meu-pomar`.

#### Scenario: Abrir a tela em viewport estreita

- **WHEN** a largura disponível não comporta as duas áreas lado a lado
- **THEN** o painel e o mapa MUST se reorganizar sem rolagem horizontal nem perda de acesso aos controles.

### Requirement: Iniciar o mapa sem marcadores de plantas

O mapa SHALL carregar o perímetro da fazenda e os polígonos válidos de todas as zonas independentemente dos resultados de previsão, sem plotar plantas antes de uma interação de filtro.

#### Scenario: Carregamento inicial com geometrias disponíveis

- **WHEN** a tela termina de carregar e o usuário ainda não alterou filtros
- **THEN** o perímetro da fazenda e os polígonos válidos das zonas MUST estar visíveis
- **AND** nenhum marcador de planta MUST estar plotado.

#### Scenario: Não há polígono válido

- **WHEN** o perímetro da fazenda ou uma zona possui menos de três coordenadas válidas
- **THEN** o mapa MUST permanecer utilizável
- **AND** a geometria inválida MUST NOT ser desenhada.

### Requirement: Filtrar previsões consolidadas

O painel SHALL oferecer **Período de coleta** com datas inicial e final, **Classificação** em dropdown com `Todas` como opção padrão e as opções `N`, `P`, `M`, `G` e `GG`, e **Zona** com as zonas disponíveis, compondo os valores ativos na mesma consulta.

#### Scenario: Alterar um filtro válido

- **WHEN** o usuário altera o período, a classificação ou a zona
- **THEN** o aplicativo MUST consultar novamente as previsões com a combinação atual de filtros
- **AND** o período informado MUST ser comparado com `harvest_forecasts.created_at` de forma inclusiva no fuso `America/Sao_Paulo`.

#### Scenario: Consultar com Todas as classificações

- **GIVEN** o dropdown de classificação está na opção padrão **Todas**
- **WHEN** uma interação no período ou na zona dispara a consulta
- **THEN** o aplicativo MUST omitir a restrição por classificação
- **AND** o mapa MUST poder exibir registros `N`, `P`, `M`, `G` e `GG` retornados pelos demais filtros.

#### Scenario: Informar intervalo invertido

- **WHEN** a data inicial é posterior à data final
- **THEN** o aplicativo MUST indicar o erro junto aos campos
- **AND** MUST NOT executar uma consulta com o intervalo inválido.

#### Scenario: Limpar todos os filtros

- **WHEN** o usuário aciona a limpeza dos filtros
- **THEN** período e zona MUST voltar ao estado inicial e a classificação MUST voltar para **Todas**
- **AND** todos os marcadores de previsão e valores calculados MUST ser removidos
- **AND** os polígonos territoriais MUST permanecer visíveis.

#### Scenario: Resposta antiga chega depois da atual

- **WHEN** uma consulta anterior termina depois da consulta correspondente aos filtros atuais
- **THEN** somente a resposta dos filtros atuais MUST atualizar o mapa e o estado de cálculo.

#### Scenario: Trocar a classificação preserva a visualização atual

- **GIVEN** o usuário ajustou manualmente o zoom ou a posição do mapa
- **WHEN** a classificação é alterada e os marcadores filtrados são atualizados
- **THEN** o mapa MUST preservar o centro e o nível de zoom atuais
- **AND** MUST NOT reenquadrar automaticamente a fazenda, as zonas ou os marcadores.

### Requirement: Representar a classificação de cada planta no mapa

O mapa SHALL exibir no máximo um marcador por `plant_id` retornado, nas coordenadas atuais da planta, usando cinza para `N`, azul para `P`, amarelo para `M`, laranja para `G` e vermelho para `GG`.

#### Scenario: Consulta retorna previsões

- **WHEN** uma consulta filtrada retorna registros válidos
- **THEN** cada planta correspondente MUST ser plotada uma única vez na cor de sua classificação
- **AND** o mapa MUST manter o perímetro da fazenda e todas as zonas visíveis.

#### Scenario: Usuário identifica uma classificação

- **WHEN** os marcadores estão visíveis
- **THEN** uma legenda e o conteúdo acessível de cada marcador MUST associar cor, código e nome da classificação
- **AND** a identificação MUST NOT depender somente da percepção da cor.

#### Scenario: Consulta não retorna registros

- **WHEN** nenhum registro corresponde aos filtros
- **THEN** nenhum marcador de planta MUST ser exibido
- **AND** o painel MUST comunicar o estado vazio sem ocultar o mapa territorial.

### Requirement: Parametrizar pesos por cenário

O painel SHALL oferecer os cenários **Otimista**, **Realista** e **Pessimista** e uma tabela editável, em kg/pé, com linhas `P`, `M`, `G` e `GG`. Os valores iniciais SHALL ser `6, 17, 28, 40` no Otimista, `5, 15, 25, 35` no Realista e `4, 13, 22, 30` no Pessimista.

#### Scenario: Abrir a parametrização

- **WHEN** a tela é carregada
- **THEN** a tabela MUST apresentar as quatro classificações produtivas e os três cenários com os valores iniciais definidos
- **AND** um cenário MUST estar selecionado para o cálculo.

#### Scenario: Editar um peso

- **WHEN** o usuário ativa uma célula de peso e informa um número válido maior ou igual a zero
- **THEN** o novo valor MUST substituir o parâmetro daquela classificação e daquele cenário durante a sessão atual
- **AND** o campo numérico MUST ocultar os controles nativos de incremento e decremento.

#### Scenario: Informar peso inválido

- **WHEN** uma célula contém valor vazio, não numérico, infinito ou negativo
- **THEN** a célula MUST indicar o erro de forma acessível
- **AND** o botão **Previsão** MUST permanecer desabilitado até a correção.

### Requirement: Calcular a previsão do conjunto filtrado

O aplicativo SHALL calcular a produção usando as contagens atuais de `P`, `M`, `G` e `GG`, multiplicadas pelos respectivos pesos do cenário selecionado, e SHALL somar os quatro subtotais no total em quilogramas. Registros `N` SHALL contribuir com zero quilograma.

#### Scenario: Exibir card antes do primeiro cálculo

- **WHEN** a tela está aberta e o usuário ainda não acionou **Previsão**
- **THEN** o card MUST mostrar os rótulos do total e dos subtotais `P`, `M`, `G` e `GG`
- **AND** cada subtotal MUST associar o indicador colorido ao nome textual da classificação, sem repetir seu código
- **AND** MUST manter os valores numéricos em estado vazio.

#### Scenario: Calcular cenário selecionado

- **WHEN** existem resultados filtrados, todos os pesos são válidos e o usuário aciona **Previsão**
- **THEN** o card MUST mostrar cada subtotal como `quantidade da classificação × peso selecionado`
- **AND** o total MUST ser a soma exata dos quatro subtotais, apresentado em kg.

#### Scenario: Calcular conjunto sem classificações produtivas

- **WHEN** o resultado está vazio ou contém somente registros `N` e o usuário aciona **Previsão**
- **THEN** os subtotais produtivos e o total MUST ser exibidos como `0 kg`.

#### Scenario: Alterar uma entrada após o cálculo

- **WHEN** o usuário altera um filtro, o cenário selecionado ou qualquer peso depois de calcular
- **THEN** os valores do card MUST voltar ao estado vazio
- **AND** um novo clique em **Previsão** MUST ser exigido para apresentar valores atualizados.

### Requirement: Comunicar estados de interação e consulta

A tela SHALL fornecer labels, foco visível, feedback de interação, estados de carregamento, vazio e erro com contraste suficiente nos temas suportados.

#### Scenario: Navegar por teclado

- **WHEN** o usuário percorre filtros, células editáveis, cenário e botão por teclado
- **THEN** a ordem de foco MUST acompanhar a ordem visual
- **AND** cada controle interativo MUST apresentar foco visível e nome acessível.

#### Scenario: Consulta falha

- **WHEN** a consulta de previsões falha
- **THEN** o aplicativo MUST informar o erro sem manter marcadores ou valores de uma consulta anterior
- **AND** o usuário MUST poder tentar novamente alterando ou reaplicando os filtros.
