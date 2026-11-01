## MODIFIED Requirements

### Requirement: Listagem Tabular de Máquinas
A interface SHALL exibir uma tabela com os registros de máquinas cadastrados na base de dados, espelhando a apresentação, busca textual global, contadores e ações do projeto.

#### Scenario: Visualização dos registros cadastrados
- **WHEN** a tela de máquinas for carregada
- **THEN** o sistema SHALL exibir colunas com: caixa de seleção para múltiplos itens, nome, marca, volume do tanque em Litros (quando informado), data de aquisição formatada (`dd/MM/yyyy`), ano de fabricação, quantidade existente com badge numérico, data de criação, data de alteração e coluna de ações (editar e excluir).

#### Scenario: Busca textual global
- **WHEN** o usuário digita no campo de filtro textual
- **THEN** a tabela SHALL filtrar em tempo real os registros correspondentes por nome, marca ou observações.

### Requirement: Cadastro de Nova Máquina
O sistema SHALL permitir a inclusão de uma nova máquina por meio de um diálogo modal, onde apenas o campo "Nome" é de preenchimento obrigatório pelo usuário.

#### Scenario: Inclusão bem-sucedida de máquina com dados mínimos
- **WHEN** o usuário clica em "Adicionar Máquina", preenche apenas o campo "Nome" e clica em "Salvar"
- **THEN** o sistema SHALL gravar o novo registro na tabela `public.machines` definindo a quantidade como 1 por padrão, campos opcionais como nulos, preenchendo automaticamente `created_at` e `updated_at`, atualizando a tabela e exibindo mensagem de sucesso.

#### Scenario: Inclusão completa com campos opcionais
- **WHEN** o usuário informa nome, marca, volume do tanque (em Litros), data de aquisição, ano de fabricação, quantidade (ex: 3 unidades) e observações gerais
- **THEN** o sistema SHALL persistir todos os dados informados (incluindo `tank_volume_liters`) e fechar o diálogo modal.

#### Scenario: Validação de campo obrigatório
- **WHEN** o usuário submete o formulário com o campo "Nome" em branco
- **THEN** o sistema SHALL bloquear o salvamento e exibir a mensagem indicativa de campo obrigatório.

### Requirement: Persistência de Dados e Migração Supabase
Os dados de máquinas MUST ser armazenados na tabela relacional `public.machines` no Supabase com tipos de dados adequados, chave primária UUID gerada automaticamente, trigger para sincronizar `updated_at`, políticas RLS para usuários autenticados e documentação atualizada no arquivo `database.md`.

#### Scenario: Execução da migração no banco de dados
- **WHEN** a migration SQL for aplicada
- **THEN** a tabela `public.machines` SHALL conter as colunas `id`, `name`, `brand`, `tank_volume_liters`, `acquisition_date`, `manufacturing_year`, `quantity`, `observations`, `created_at`, `updated_at`, com restrições de validação e integridade.
