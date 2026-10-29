# Caldas Management Capability

## Purpose

Permite que os operadores e agrônomos cadastrem, gerenciem, visualizem e configurem receitas de caldas agrícolas compostas por um ou mais insumos com dosagens personalizadas, auditando autoria e status ativo no pomar.

## Requirements

### Requirement: Navegação e Acesso ao Módulo de Caldas
O sistema DEVE disponibilizar o acesso ao módulo de Caldas por meio da rota `/cadastro/caldas` e exibir um item no menu de navegação lateral dentro do grupo "Cadastro", posicionado imediatamente abaixo do item "Insumos".

#### Scenario: Acesso pelo menu lateral
- **WHEN** o usuário autenticado navega pelo menu lateral e clica no item "Caldas" sob "Cadastro"
- **THEN** o sistema SHALL navegar para a URL `/cadastro/caldas` e renderizar a tela de gerenciamento de caldas com a mesma estrutura visual da tela de Insumos.

### Requirement: Listagem e Estrutura Tabular de Caldas
A tela de Caldas DEVE exibir uma listagem tabular contendo todas as caldas cadastradas, espelhando os padrões de layout, filtros, busca e ações em lote presentes na tela de Insumos.

#### Scenario: Visualização da lista de caldas
- **WHEN** a tela `/cadastro/caldas` for carregada com sucesso
- **THEN** o sistema SHALL exibir as caldas em uma tabela PrimeNG contendo: nome da calda, status de ativação (badge ativo/inativo), quantidade/resumo dos insumos vinculados, nome e e-mail do autor, data de criação e data de alteração.

#### Scenario: Busca e filtragem
- **WHEN** o usuário digita um termo no campo de busca textual
- **THEN** a tabela SHALL filtrar em tempo real os registros correspondentes por nome da calda, autor ou observações.

### Requirement: Composição da Calda com Insumos e Dosagem Customizável
O cadastro e a edição de uma calda DEVEM permitir a seleção de 1 ou mais insumos ativos oriundos da tabela `inputs`, carregando por padrão a dose recomendada da bula (`label_dose`) do insumo e permitindo que o usuário edite o valor da dose e sua unidade para a calda específica.

#### Scenario: Adição de insumo com dose de bula padrão
- **WHEN** o usuário abre o modal de cadastro de calda e seleciona um insumo da lista suspensa
- **THEN** o sistema SHALL adicionar o insumo à lista de composição da calda com a dose preenchida inicialmente com o valor de `label_dose` e unidade de bula do insumo selecionado.

#### Scenario: Alteração da dose do insumo na calda
- **WHEN** o usuário altera o campo numérico/texto de dose para um insumo inserido na composição da calda
- **THEN** o sistema SHALL validar o novo valor informado e associar essa dose customizada àquele item da calda sem alterar o cadastro original do insumo na tabela `inputs`.

#### Scenario: Tentativa de salvar calda sem nenhum insumo
- **WHEN** o usuário tenta submeter o formulário de calda sem adicionar ao menos 1 insumo
- **THEN** o sistema SHALL bloquear o salvamento e exibir uma mensagem de validação exigindo pelo menos um insumo na calda.

### Requirement: Auditoria de Autoria e Metadados do Usuário Logado
Ao criar uma nova calda, o sistema DEVE preencher automaticamente o nome da pessoa e o e-mail do usuário autenticado no sistema, persistindo tais dados e as datas de auditoria (`created_at`, `updated_at`).

#### Scenario: Registro automático do autor logado
- **WHEN** um usuário autenticado salva uma nova calda
- **THEN** o sistema SHALL extrair o nome e o e-mail do perfil ou sessão do usuário logado e gravar esses valores nos campos correspondentes da calda.

### Requirement: Controle de Ativação e Observações Gerais
A calda DEVE conter uma flag booleana indicando se está ativa ou inativa e um campo de observações gerais para orientações técnicas e recomendações de pulverização.

#### Scenario: Alternância do status ativo/inativo
- **WHEN** o usuário altera o controle de status de uma calda para inativo e confirma a gravação
- **THEN** o sistema SHALL persistir a calda com o estado inativo e refletir visualmente na tabela através de um badge indicativo.

### Requirement: Edição e Exclusão de Caldas
O sistema DEVE permitir a edição completa de uma calda existente (nome, status, observações e insumos associados) bem como a exclusão individual ou em lote de caldas selecionadas, solicitando confirmação prévia do usuário.

#### Scenario: Exclusão individual de calda com itens
- **WHEN** o usuário aciona a ação de exclusão em uma linha da tabela e confirma a caixa de diálogo
- **THEN** o sistema SHALL remover o registro da calda e todos os seus vínculos de insumos de forma atômica no banco de dados e atualizar a listagem.

#### Scenario: Exclusão múltipla de caldas
- **WHEN** o usuário seleciona múltiplas caldas via checkbox e clica em "Excluir selecionados"
- **THEN** o sistema SHALL solicitar confirmação e, após o aceite, remover todos os registros selecionados simultaneamente.

### Requirement: Persistência Relacional e Migração de Banco de Dados
A modelagem de dados DEVE ser composta por tabelas relacionais dedicadas no Supabase com integridade referencial para `inputs(id)`, políticas RLS para operações autenticadas, arquivo de migration SQL executável e documentação técnica detalhada no arquivo `database.md` nos itens 20 e 25.

#### Scenario: Execução do script de migration
- **WHEN** a migration SQL for aplicada no banco de dados
- **THEN** as tabelas de caldas e seus itens associativos SHALL ser criadas com chaves estrangeiras apropriadas, triggers para atualização de `updated_at` e índices em campos de busca frequente.
