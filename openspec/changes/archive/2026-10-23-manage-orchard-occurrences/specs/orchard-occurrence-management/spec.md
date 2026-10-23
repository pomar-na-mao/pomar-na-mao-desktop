## Purpose

Permitir que usuários autenticados consultem e mantenham o catálogo de tipos de ocorrência do pomar com operações seguras, feedback claro, busca e exportação.

## ADDED Requirements

### Requirement: Listagem de tipos de ocorrência

O sistema SHALL carregar os registros de `occurrence_types` ao acessar `/pomar/ocorrencias` e SHALL exibi-los em uma tabela com seleção, `name`, `category`, `created_at`, `updated_at` e ações, sem apresentar os campos técnicos `id` e `code` como colunas.

#### Scenario: Tipos de ocorrência disponíveis

- **WHEN** a consulta inicial termina com sucesso
- **THEN** a tabela exibe nome, categoria, criação e atualização de cada registro retornado, além dos botões de editar e excluir

#### Scenario: Identificação visual da categoria

- **WHEN** uma ocorrência possui uma categoria conhecida
- **THEN** a tabela apresenta seu rótulo com a cor estável reservada à categoria e um brilho sutil, sem depender somente da cor para comunicar o valor

#### Scenario: Registro antigo sem categoria

- **WHEN** um tipo de ocorrência carregado possui `category` nula
- **THEN** a tabela o identifica como não classificado sem impedir as demais ações

#### Scenario: Nenhum tipo de ocorrência disponível

- **WHEN** a consulta retorna uma lista vazia
- **THEN** a tabela exibe um estado vazio informando que nenhuma ocorrência foi encontrada

#### Scenario: Falha no carregamento

- **WHEN** a consulta inicial falha
- **THEN** o sistema informa o erro ao usuário e não apresenta dados desatualizados como se fossem atuais

### Requirement: Exploração da tabela

O sistema SHALL oferecer busca global, ordenação e paginação sobre os tipos de ocorrência carregados, seguindo a apresentação responsiva da tabela de Variedades.

#### Scenario: Busca por conteúdo identificador

- **WHEN** o usuário informa um termo no campo de busca
- **THEN** a tabela mantém somente registros compatíveis por nome, sem diferenciar maiúsculas de minúsculas

#### Scenario: Busca sem resultados

- **WHEN** nenhum registro corresponde ao termo informado
- **THEN** a tabela exibe seu estado vazio de busca

#### Scenario: Navegação e ordenação

- **WHEN** o usuário altera a página, a quantidade por página ou a ordenação de uma coluna suportada
- **THEN** a tabela atualiza a apresentação sem realizar uma mutação no catálogo

### Requirement: Exportação para Excel

O sistema SHALL disponibilizar no cabeçalho da tabela um botão de download que gere um arquivo `.xlsx` com os tipos de ocorrência que atendem ao filtro atual.

#### Scenario: Exportação sem filtro

- **WHEN** o usuário aciona o download sem uma busca ativa
- **THEN** o arquivo Excel contém todos os registros carregados e as colunas ID, Nome, Código, Categoria, Criado em e Atualizado em

#### Scenario: Exportação com filtro

- **WHEN** o usuário aciona o download com uma busca ativa
- **THEN** o arquivo Excel contém todos os registros filtrados, independentemente da página visível, e não contém colunas de seleção ou ações

### Requirement: Criação de tipo de ocorrência

O sistema SHALL abrir um diálogo de inclusão pelo botão Adicionar, SHALL exigir nome não vazio e uma categoria válida e SHALL gerar o código internamente a partir do nome, em minúsculas e com sequências de espaços substituídas por `_`.

#### Scenario: Inclusão válida

- **WHEN** o usuário confirma nome e categoria válidos e a persistência é concluída
- **THEN** o diálogo fecha, o novo registro aparece na tabela e um toast de sucesso é exibido

#### Scenario: Geração automática do código

- **WHEN** o usuário adiciona uma ocorrência chamada `Galho Quebrado`
- **THEN** o payload de criação usa o nome `Galho Quebrado` e o código `galho_quebrado`, sem mostrar um campo de código no diálogo

#### Scenario: Inclusão inválida

- **WHEN** o usuário tenta confirmar sem nome ou categoria após a remoção de espaços excedentes
- **THEN** o formulário indica os campos obrigatórios e nenhuma requisição de criação é enviada

#### Scenario: Código duplicado

- **WHEN** a criação viola a unicidade de `code`
- **THEN** o diálogo conserva os dados informados e um toast de erro é exibido

#### Scenario: Falha na inclusão

- **WHEN** a persistência do novo registro falha por outro motivo
- **THEN** o diálogo conserva os dados informados e um toast de erro é exibido

### Requirement: Edição de tipo de ocorrência

O sistema SHALL permitir abrir o diálogo de edição a partir da ação da linha, preenchido com o nome e a categoria atuais, sem exibir o código e preservando seu valor persistido mesmo quando o nome for alterado.

#### Scenario: Edição válida

- **WHEN** o usuário confirma dados válidos e a atualização é concluída
- **THEN** o diálogo fecha, a linha reflete os valores e a data de atualização persistidos e um toast de sucesso é exibido

#### Scenario: Edição inválida

- **WHEN** o usuário remove o nome ou a categoria e tenta confirmar
- **THEN** o formulário indica os campos obrigatórios e nenhuma requisição de atualização é enviada

#### Scenario: Código duplicado na edição

- **WHEN** a edição viola a unicidade de `code`
- **THEN** o diálogo conserva os dados informados, a linha permanece inalterada e um toast de erro é exibido

#### Scenario: Falha na edição

- **WHEN** a atualização falha por outro motivo
- **THEN** o diálogo conserva os dados informados, a linha permanece inalterada e um toast de erro é exibido

### Requirement: Seleção e exclusão de tipos de ocorrência

O sistema SHALL permitir selecionar um ou vários registros por checkboxes na primeira coluna e SHALL oferecer exclusão individual e exclusão da seleção.

#### Scenario: Seleção individual ou múltipla

- **WHEN** o usuário marca um checkbox de linha ou o checkbox do cabeçalho
- **THEN** a seleção passa a conter respectivamente o registro marcado ou os registros elegíveis exibidos pela tabela

#### Scenario: Confirmação de exclusão individual

- **WHEN** o usuário aciona Excluir em uma linha
- **THEN** o sistema apresenta uma confirmação identificando o tipo de ocorrência e só solicita a exclusão após aceite explícito

#### Scenario: Confirmação de exclusão em lote

- **WHEN** o usuário aciona Excluir selecionadas com um ou mais registros marcados
- **THEN** o sistema apresenta uma confirmação com a quantidade selecionada e só solicita a exclusão do conjunto após aceite explícito

#### Scenario: Cancelamento da exclusão

- **WHEN** o usuário rejeita ou fecha a confirmação
- **THEN** nenhum registro é excluído

#### Scenario: Exclusão concluída

- **WHEN** a exclusão individual ou em lote é concluída
- **THEN** os registros removidos deixam a tabela, a seleção correspondente é limpa e um toast de sucesso é exibido

#### Scenario: Exclusão impedida por referência

- **WHEN** um registro selecionado é referenciado por outro dado e o banco rejeita sua exclusão
- **THEN** a tabela e a seleção permanecem recuperáveis e um toast de erro informa que a exclusão não foi concluída

#### Scenario: Outra falha na exclusão

- **WHEN** a exclusão individual ou em lote falha por outro motivo
- **THEN** a tabela e a seleção permanecem recuperáveis e um toast de erro é exibido

### Requirement: Bloqueio durante mutações

O sistema SHALL bloquear a interação com a tela durante criação, edição e exclusão e SHALL restaurá-la ao término da operação, inclusive em caso de erro.

#### Scenario: Mutação em andamento

- **WHEN** uma requisição de criação, edição ou exclusão está pendente
- **THEN** um indicador de carregamento bloqueia novas interações que poderiam repetir ou conflitar com a operação

#### Scenario: Mutação finalizada

- **WHEN** a requisição pendente resolve com sucesso ou erro
- **THEN** o bloqueio e o indicador de carregamento são removidos

### Requirement: Auditoria temporal dos tipos de ocorrência

A tabela `public.occurrence_types` SHALL possuir `updated_at` não nulo; o aplicativo SHALL enviar os timestamps no payload, usando o mesmo instante para `created_at` e `updated_at` na criação e renovando `updated_at` em cada edição.

#### Scenario: Novo tipo de ocorrência persistido

- **WHEN** o aplicativo envia a criação de um registro
- **THEN** o payload contém `created_at` e `updated_at` com o mesmo instante ISO

#### Scenario: Tipo de ocorrência alterado

- **WHEN** o aplicativo envia a edição de um registro existente
- **THEN** o payload contém um novo `updated_at` e não contém alteração de `created_at`

#### Scenario: Registros existentes recebem a nova coluna

- **WHEN** a alteração de esquema é aplicada a tipos de ocorrência já persistidos
- **THEN** cada registro existente recebe inicialmente em `updated_at` o valor do seu `created_at`

### Requirement: Categorias controladas de ocorrência

A tabela `public.occurrence_types` SHALL usar o enum `public.occurrence_category` para a coluna `category`, aceitando somente `STRUCTURAL`, `ENVIRONMENTAL`, `PEST_DISEASE` e `ANTHROPIC` quando o valor não for nulo.

#### Scenario: Nova ocorrência categorizada

- **WHEN** o aplicativo cria um tipo de ocorrência
- **THEN** o payload contém exatamente uma das quatro categorias permitidas pelo enum

#### Scenario: Edição de registro antigo sem categoria

- **WHEN** o usuário edita um registro cuja categoria ainda é nula
- **THEN** o formulário exige a seleção de uma categoria válida antes de salvar

#### Scenario: Valor fora do domínio

- **WHEN** uma gravação tenta enviar uma categoria diferente dos valores do enum
- **THEN** o banco rejeita a gravação
