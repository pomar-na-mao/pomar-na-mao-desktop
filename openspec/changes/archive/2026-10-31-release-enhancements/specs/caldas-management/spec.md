## MODIFIED Requirements

### Requirement: Composição da Calda com Insumos e Dosagem Customizável
O cadastro e a edição de uma calda SHALL permitir a seleção de 1 ou mais insumos ativos oriundos da tabela `inputs`, carregando por padrão a dose recomendada da bula (`label_dose`) do insumo e permitindo que o usuário edite o valor da dose e sua unidade para a calda específica, além de opcionalmente informar o volume ou massa e a respectiva unidade de medida (kg ou L).

#### Scenario: Adição de insumo com dose de bula padrão
- **WHEN** o usuário abre o modal de cadastro de calda e seleciona um insumo da lista suspensa
- **THEN** o sistema SHALL adicionar o insumo à lista de composição da calda com a dose preenchida inicialmente com o valor de `label_dose` e unidade de bula do insumo selecionado.

#### Scenario: Alteração da dose do insumo na calda
- **WHEN** o usuário altera o campo numérico/texto de dose para um insumo inserido na composição da calda
- **THEN** o sistema SHALL validar o novo valor informado e associar essa dose customizada àquele item da calda sem alterar o cadastro original do insumo na tabela `inputs`.

#### Scenario: Informação opcional de volume ou massa e unidade do insumo na calda
- **WHEN** o usuário informa o valor numérico de volume/massa (ex: 2.5) e seleciona a unidade de medida ("kg" ou "L") para um insumo na calda
- **THEN** o sistema SHALL associar esses dados ao respectivo item de insumo da calda e persisti-los como opcionais.

#### Scenario: Tentativa de salvar calda sem nenhum insumo
- **WHEN** o usuário tenta submeter o formulário de calda sem adicionar ao menos 1 insumo
- **THEN** o sistema SHALL bloquear o salvamento e exibir uma mensagem de validação exigindo pelo menos um insumo na calda.

### Requirement: Persistência Relacional e Migração de Banco de Dados
A modelagem de dados MUST ser composta por tabelas relacionais dedicadas no Supabase com integridade referencial para `inputs(id)`, políticas RLS para operações autenticadas, arquivo de migration SQL executável e documentação técnica detalhada no arquivo `database.md` nos itens 20 e 25.

#### Scenario: Execução do script de migration
- **WHEN** a migration SQL for aplicada no banco de dados
- **THEN** as tabelas de caldas e seus itens associativos SHALL ser criadas/atualizadas, contendo na tabela `mixture_inputs` as colunas `volume_or_mass` (numérica) e `unit` (texto, restrita ou padronizada para `kg` ou `L`), com chaves estrangeiras apropriadas, triggers de auditoria e índices.
