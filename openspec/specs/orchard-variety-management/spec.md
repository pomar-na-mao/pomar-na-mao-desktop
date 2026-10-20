# orchard-variety-management Specification

## Purpose

Permitir que usuários autenticados consultem e mantenham o catálogo de variedades do pomar com operações seguras, feedback claro e ferramentas de busca e exportação.

## Requirements

### Requirement: Listagem de variedades
O sistema SHALL carregar as variedades persistidas ao acessar `/pomar/variedades` e SHALL exibi-las em uma tabela com colunas de seleção, nome, descrição, criação, atualização e ações.

#### Scenario: Variedades disponíveis
- **WHEN** a rota termina de carregar dados com sucesso
- **THEN** a tabela exibe cada variedade retornada com `name`, `description`, `created_at`, `updated_at` e botões de editar e excluir

#### Scenario: Nenhuma variedade disponível
- **WHEN** a consulta retorna uma lista vazia
- **THEN** a tabela exibe um estado vazio informando que nenhuma variedade foi encontrada

#### Scenario: Falha no carregamento
- **WHEN** a consulta inicial falha
- **THEN** o sistema informa o erro ao usuário e não apresenta dados desatualizados como se fossem atuais

### Requirement: Exploração da tabela
O sistema SHALL oferecer busca global, ordenação e paginação sobre as variedades carregadas, seguindo a apresentação responsiva da tabela de Usuários.

#### Scenario: Busca por conteúdo textual
- **WHEN** o usuário informa um termo no campo de busca
- **THEN** a tabela mantém somente registros compatíveis por nome ou descrição, sem diferenciar maiúsculas de minúsculas

#### Scenario: Busca sem resultados
- **WHEN** nenhum registro corresponde ao termo informado
- **THEN** a tabela exibe seu estado vazio de busca

#### Scenario: Navegação e ordenação
- **WHEN** o usuário altera a página, a quantidade por página ou a ordenação de uma coluna suportada
- **THEN** a tabela atualiza a apresentação sem realizar uma mutação no catálogo

### Requirement: Exportação para Excel
O sistema SHALL disponibilizar no cabeçalho da tabela um botão de download que gere um arquivo `.xlsx` com as variedades que atendem ao filtro atual.

#### Scenario: Exportação sem filtro
- **WHEN** o usuário aciona o download sem uma busca ativa
- **THEN** o arquivo Excel contém todas as variedades carregadas e as colunas Nome, Descrição, Criado em e Atualizado em

#### Scenario: Exportação com filtro
- **WHEN** o usuário aciona o download com uma busca ativa
- **THEN** o arquivo Excel contém todos os registros filtrados, independentemente da página visível, e não contém colunas de seleção ou ações

### Requirement: Criação de variedade
O sistema SHALL abrir um diálogo de inclusão pelo botão Adicionar, exigir um nome não vazio e permitir uma descrição opcional.

#### Scenario: Inclusão válida
- **WHEN** o usuário confirma um formulário válido e a persistência é concluída
- **THEN** o diálogo fecha, a nova variedade aparece na tabela e um toast de sucesso é exibido

#### Scenario: Inclusão inválida
- **WHEN** o usuário tenta confirmar sem um nome após a remoção de espaços excedentes
- **THEN** o formulário indica o campo obrigatório e nenhuma requisição de criação é enviada

#### Scenario: Falha na inclusão
- **WHEN** a persistência da nova variedade falha
- **THEN** o diálogo permanece disponível com seus dados e um toast de erro é exibido

### Requirement: Edição de variedade
O sistema SHALL permitir abrir o diálogo de edição a partir da ação da linha, preenchido com o nome e a descrição atuais.

#### Scenario: Edição válida
- **WHEN** o usuário confirma dados válidos e a atualização é concluída
- **THEN** o diálogo fecha, a linha reflete os valores e a data de atualização persistidos e um toast de sucesso é exibido

#### Scenario: Edição inválida
- **WHEN** o usuário remove o nome e tenta confirmar
- **THEN** o formulário indica o campo obrigatório e nenhuma requisição de atualização é enviada

#### Scenario: Falha na edição
- **WHEN** a atualização falha
- **THEN** o diálogo permanece disponível com seus dados e um toast de erro é exibido

### Requirement: Seleção e exclusão de variedades
O sistema SHALL permitir selecionar um ou vários registros por checkboxes na primeira coluna e SHALL oferecer exclusão individual e exclusão da seleção.

#### Scenario: Seleção individual ou múltipla
- **WHEN** o usuário marca um checkbox de linha ou o checkbox do cabeçalho
- **THEN** a seleção passa a conter respectivamente o registro marcado ou os registros elegíveis exibidos pela tabela

#### Scenario: Confirmação de exclusão individual
- **WHEN** o usuário aciona Excluir em uma linha
- **THEN** o sistema apresenta uma confirmação identificando a variedade e só exclui após aceite explícito

#### Scenario: Confirmação de exclusão em lote
- **WHEN** o usuário aciona Excluir selecionadas com uma ou mais variedades marcadas
- **THEN** o sistema apresenta uma confirmação com a quantidade selecionada e só exclui o conjunto após aceite explícito

#### Scenario: Cancelamento da exclusão
- **WHEN** o usuário rejeita ou fecha a confirmação
- **THEN** nenhum registro é excluído

#### Scenario: Exclusão concluída
- **WHEN** a exclusão individual ou em lote é concluída
- **THEN** os registros removidos deixam a tabela, a seleção correspondente é limpa e um toast de sucesso é exibido

#### Scenario: Falha na exclusão
- **WHEN** a exclusão individual ou em lote falha
- **THEN** a tabela conserva os registros, a seleção permanece recuperável e um toast de erro é exibido

### Requirement: Bloqueio durante mutações
O sistema SHALL bloquear a interação com a tela durante criação, edição e exclusão e SHALL restaurá-la ao término da operação, inclusive em caso de erro.

#### Scenario: Mutação em andamento
- **WHEN** uma requisição de criação, edição ou exclusão está pendente
- **THEN** um indicador de carregamento bloqueia novas interações que poderiam repetir ou conflitar com a operação

#### Scenario: Mutação finalizada
- **WHEN** a requisição pendente resolve com sucesso ou erro
- **THEN** o bloqueio e o indicador de carregamento são removidos

### Requirement: Auditoria temporal das variedades
A tabela `public.varieties` SHALL possuir `updated_at` não nulo; o aplicativo SHALL enviar os timestamps no payload, usando o mesmo instante para `created_at` e `updated_at` na criação e renovando `updated_at` em cada edição.

#### Scenario: Nova variedade persistida
- **WHEN** o aplicativo envia a criação de um registro
- **THEN** o payload contém `created_at` e `updated_at` com o mesmo instante ISO

#### Scenario: Variedade alterada
- **WHEN** o aplicativo envia a edição de um registro existente
- **THEN** o payload contém um novo `updated_at` e não contém alteração de `created_at`

#### Scenario: Registros existentes recebem a nova coluna
- **WHEN** a alteração de esquema é aplicada a variedades já persistidas
- **THEN** cada registro existente recebe inicialmente em `updated_at` o valor do seu `created_at`
