# mipd-desktop-view Specification

## Purpose

Permitir que usuários do desktop localizem e auditem no mapa as marcações MIPD sincronizadas pelo aplicativo mobile, incluindo a evidência e o contexto fitossanitário de cada planta.

## Requirements

### Requirement: Apresentar uma tela MIPD coerente com Operações

O aplicativo SHALL apresentar a tela MIPD com painel de filtros à esquerda e mapa à direita, reutilizando o padrão visual observável da tela de Operações para contêiner, dimensões, espaçamentos, cores, bordas, sombras, responsividade, modo escuro e controle de tela cheia.

#### Scenario: Abrir MIPD em viewport desktop
- **WHEN** o usuário autenticado acessa `/visao-das-operacoes/mipd` em uma viewport desktop
- **THEN** o painel de filtros MUST aparecer à esquerda e o mapa MUST ocupar a área restante à direita
- **AND** a composição visual MUST corresponder à tela de Operações.

#### Scenario: Abrir MIPD em viewport estreita
- **WHEN** a largura disponível não comporta as duas colunas
- **THEN** o painel e o mapa MUST seguir a mesma adaptação responsiva usada pela tela de Operações sem provocar overflow horizontal.

#### Scenario: Alternar o mapa em tela cheia
- **WHEN** o usuário aciona ou encerra a tela cheia
- **THEN** o mapa MIPD MUST adotar o mesmo enquadramento, controle e restauração de layout da tela de Operações.

### Requirement: Filtrar marcações MIPD

O painel lateral SHALL oferecer data inicial, data final, um dropdown de zona e um dropdown de praga ou doença. O dropdown de zona MUST iniciar com `Todas as zonas` e listar o catálogo de zonas. O dropdown fitossanitário MUST iniciar com a opção `Todos` e, além dela, listar somente tipos ativos no catálogo cuja categoria seja `PEST_DISEASE`, exibindo o nome ao usuário e usando o identificador do tipo como valor do filtro.

#### Scenario: Carregar filtros iniciais
- **WHEN** a tela MIPD é aberta
- **THEN** as datas MUST iniciar no dia atual, como em Operações
- **AND** o dropdown de zona MUST iniciar com `Todas as zonas` selecionado
- **AND** o dropdown MUST iniciar com a opção `Todos` selecionada
- **AND** o dropdown MUST conter somente tipos com categoria `PEST_DISEASE`.

#### Scenario: Consultar todas as pragas e doenças pelo período
- **WHEN** o usuário mantém `Todos` selecionado e informa um período válido
- **THEN** o sistema MUST consultar e mostrar as marcações de todos os tipos `PEST_DISEASE` cujas operações estejam no período inclusivo selecionado.

#### Scenario: Selecionar uma praga ou doença
- **WHEN** o usuário seleciona um tipo de ocorrência e há um período válido
- **THEN** o sistema MUST consultar e mostrar apenas marcações daquele tipo cujas operações estejam no período inclusivo selecionado.

#### Scenario: Selecionar uma zona
- **WHEN** o usuário seleciona uma zona e há um período válido
- **THEN** o sistema MUST consultar e mostrar apenas marcações de plantas vinculadas àquela zona, combinando o filtro com a praga ou doença selecionada.
- **AND** o mapa MUST enquadrar imediatamente o polígono da zona selecionada
- **AND** o resultado da consulta MUST preservar esse enquadramento ao renderizar os marcadores.

#### Scenario: Voltar para todas as zonas
- **WHEN** o usuário seleciona `Todas as zonas`
- **THEN** o mapa MUST voltar ao enquadramento geral da fazenda, das zonas e dos marcadores atuais.

#### Scenario: Alterar rapidamente os filtros
- **WHEN** respostas de consultas anteriores chegam depois da consulta dos filtros atuais
- **THEN** somente a resposta correspondente aos filtros atuais MUST atualizar o mapa.

#### Scenario: Limpar filtros
- **WHEN** o usuário aciona Limpar Filtros
- **THEN** a zona, o tipo selecionado e o período MUST ser limpos
- **AND** os marcadores e os detalhes selecionados MUST desaparecer.

### Requirement: Exibir plantas MIPD no mapa

O mapa SHALL renderizar um marcador interativo por planta presente no resultado filtrado, mantendo o mapa-base, o perímetro da fazenda, o estilo de marcador, as regras de enquadramento e os estados de carregamento, vazio e erro coerentes com Operações.

#### Scenario: Manter os polígonos territoriais visíveis
- **WHEN** o mapa MIPD é exibido, com ou sem filtros e marcadores
- **THEN** o perímetro da fazenda e os polígonos de todas as zonas MUST permanecer desenhados
- **AND** o enquadramento MUST incluir esses polígonos junto com as plantas filtradas.

#### Scenario: Exibir resultados do filtro
- **WHEN** a consulta retorna uma ou mais marcações válidas
- **THEN** cada planta distinta MUST aparecer uma única vez no mapa
- **AND** o mapa MUST enquadrar os marcadores sem ocultar o perímetro da fazenda.

#### Scenario: Agrupar histórico da mesma planta
- **WHEN** mais de uma marcação do filtro corresponde à mesma planta
- **THEN** o marcador MUST representar o conjunto de marcações daquela planta
- **AND** as marcações MUST ficar ordenadas da mais recente para a mais antiga nos detalhes.

#### Scenario: Consulta sem resultados
- **WHEN** não há marcações para os filtros selecionados
- **THEN** o mapa MUST permanecer utilizável sem marcadores MIPD
- **AND** a tela MUST comunicar que nenhum registro foi encontrado.

#### Scenario: Falha na consulta
- **WHEN** a consulta de marcações falha
- **THEN** a tela MUST remover resultados obsoletos e apresentar um erro recuperável sem quebrar o mapa.

### Requirement: Mostrar os detalhes da planta marcada

Ao selecionar um marcador, o aplicativo SHALL abrir sobre a lateral direita do mapa um card de detalhes visualmente equivalente ao usado para inspeção e pulverização. O card MUST exibir a identificação e as coordenadas da planta, data e hora da observação, nome da praga ou doença, partes afetadas traduzidas para Folha, Ramo, Tronco, Raiz e Fruto, e a foto quando registrada.

#### Scenario: Selecionar uma planta com foto
- **WHEN** o usuário clica em uma planta cuja marcação possui foto acessível
- **THEN** o card MUST apresentar os dados da marcação e a imagem preservando sua proporção
- **AND** a imagem MUST ser obtida por acesso temporário ao bucket privado, sem tornar o objeto público.

#### Scenario: Selecionar uma planta sem foto
- **WHEN** a marcação selecionada não possui foto
- **THEN** o card MUST apresentar os demais dados e um estado explícito de foto não informada.

#### Scenario: Foto privada indisponível
- **WHEN** não for possível gerar ou carregar a imagem temporária
- **THEN** o card MUST continuar apresentando os demais dados e indicar que a foto está indisponível.

#### Scenario: Navegar pelo histórico da planta
- **WHEN** a planta selecionada possui mais de uma marcação no resultado filtrado
- **THEN** o card MUST permitir navegar entre elas
- **AND** MUST indicar a posição atual, preservando a ordem da mais recente para a mais antiga.

#### Scenario: Fechar os detalhes
- **WHEN** o usuário aciona Fechar
- **THEN** o card MUST desaparecer sem limpar os filtros nem os marcadores atuais.
