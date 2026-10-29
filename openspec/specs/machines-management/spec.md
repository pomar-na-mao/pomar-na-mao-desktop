# Machines Management Capability

## Purpose

Permite aos operadores e administradores cadastrar, gerenciar, visualizar, editar e excluir o parque de máquinas, tratores e implementos agrícolas da fazenda no módulo desktop.

## Requirements

### Requirement: Navegação e Acesso à Tela de Máquinas
O sistema DEVE disponibilizar o módulo de Máquinas através da rota `/cadastro/maquinas` e integrá-lo ao menu lateral de navegação no grupo "Cadastro", mantendo o padrão visual e de rotas existente.

#### Scenario: Acesso pela rota de máquinas
- **WHEN** o usuário autenticado acessa a rota `/cadastro/maquinas` diretamente ou pelo menu lateral
- **THEN** o sistema SHALL renderizar a interface de gerenciamento de máquinas com listagem tabular, cabeçalho de ações e layout padronizado idêntico ao de variedades.

### Requirement: Listagem Tabular de Máquinas
A interface DEVE exibir uma tabela com os registros de máquinas cadastrados na base de dados, espelhando a apresentação, busca textual global, contadores e ações do projeto.

#### Scenario: Visualização dos registros cadastrados
- **WHEN** a tela de máquinas for carregada
- **THEN** o sistema SHALL exibir colunas com: caixa de seleção para múltiplos itens, nome, marca, data de aquisição formatada (`dd/MM/yyyy`), ano de fabricação, quantidade existente com badge numérico, data de criação, data de alteração e coluna de ações (editar e excluir).

#### Scenario: Busca textual global
- **WHEN** o usuário digita no campo de filtro textual
- **THEN** a tabela SHALL filtrar em tempo real os registros correspondentes por nome, marca ou observações.

### Requirement: Cadastro de Nova Máquina
O sistema DEVE permitir a inclusão de uma nova máquina por meio de um diálogo modal, onde apenas o campo "Nome" é de preenchimento obrigatório pelo usuário.

#### Scenario: Inclusão bem-sucedida de máquina com dados mínimos
- **WHEN** o usuário clica em "Adicionar Máquina", preenche apenas o campo "Nome" e clica em "Salvar"
- **THEN** o sistema SHALL gravar o novo registro na tabela `public.machines` definindo a quantidade como 1 por padrão, campos opcionais como nulos, preenchendo automaticamente `created_at` e `updated_at`, atualizando a tabela e exibindo mensagem de sucesso.

#### Scenario: Inclusão completa com campos opcionais
- **WHEN** o usuário informa nome, marca, data de aquisição, ano de fabricação, quantidade (ex: 3 unidades) e observações gerais
- **THEN** o sistema SHALL persistir todos os dados informados e fechar o diálogo modal.

#### Scenario: Validação de campo obrigatório
- **WHEN** o usuário submete o formulário com o campo "Nome" em branco
- **THEN** o sistema SHALL bloquear o salvamento e exibir a mensagem indicativa de campo obrigatório.

### Requirement: Edição de Máquina Existente
O sistema DEVE permitir a edição de todos os atributos editáveis de uma máquina previamente cadastrada.

#### Scenario: Atualização de máquina
- **WHEN** o usuário clica na ação de edição de uma linha da tabela, modifica dados (ex: altera a quantidade ou adiciona observações) e confirma
- **THEN** o sistema SHALL atualizar os dados no banco de dados, atualizar automaticamente `updated_at` e refletir as alterações imediatamente na listagem.

### Requirement: Exclusão Individual e em Lote
O sistema DEVE permitir a exclusão de um único registro ou a exclusão em lote de múltiplos registros selecionados, exigindo confirmação prévia explícita antes de efetivar a remoção.

#### Scenario: Exclusão individual com confirmação
- **WHEN** o usuário aciona o botão de exclusão em uma linha e confirma na caixa de diálogo de confirmação
- **THEN** o sistema SHALL excluir a máquina correspondente da base de dados e exibir mensagem de confirmação.

#### Scenario: Exclusão múltipla de máquinas selecionadas
- **WHEN** o usuário marca um ou mais registros através das caixas de seleção da tabela, clica no botão "Excluir selecionados" e confirma a operação
- **THEN** o sistema SHALL excluir simultaneamente todas as máquinas selecionadas e desmarcar a seleção.

### Requirement: Persistência de Dados e Migração Supabase
Os dados de máquinas DEVEM ser armazenados na tabela relacional `public.machines` no Supabase com tipos de dados adequados, chave primária UUID gerada automaticamente, trigger para sincronizar `updated_at`, políticas RLS para usuários autenticados e documentação atualizada no arquivo `database.md`.

#### Scenario: Execução da migração no banco de dados
- **WHEN** a migration SQL for aplicada
- **THEN** a tabela `public.machines` SHALL ser criada contendo `id`, `name`, `brand`, `acquisition_date`, `manufacturing_year`, `quantity`, `observations`, `created_at`, `updated_at`, com restrição `check (quantity >= 1)`.
