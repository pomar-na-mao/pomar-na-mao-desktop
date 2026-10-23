## Purpose

Definir um contrato de leitura seguro e eficiente para que o desktop consulte operações e marcações MIPD já persistidas pelo fluxo mobile, sem modificar o histórico operacional.

## ADDED Requirements

### Requirement: Consultar marcações MIPD por período, ocorrência e zona

O banco SHALL disponibilizar `get_mipd_operations(p_start_date date DEFAULT NULL, p_end_date date DEFAULT NULL, p_occurrence_type_id uuid DEFAULT NULL, p_zone_id uuid DEFAULT NULL)` para retornar marcações vinculadas a operações cujo tipo seja `mipd` e cuja origem persistida seja `mpid`.

#### Scenario: Filtrar por período inclusivo
- **WHEN** a RPC recebe data inicial e data final
- **THEN** MUST retornar somente operações cuja data em `America/Sao_Paulo` esteja dentro do período inclusivo.

#### Scenario: Filtrar por praga ou doença
- **WHEN** a RPC recebe `p_occurrence_type_id`
- **THEN** MUST retornar somente marcações desse tipo
- **AND** o tipo MUST pertencer à categoria `PEST_DISEASE`.

#### Scenario: Filtrar por zona
- **WHEN** a RPC recebe `p_zone_id`
- **THEN** MUST retornar somente marcações cuja planta esteja vinculada à zona informada.

#### Scenario: Ignorar registros que não são MIPD
- **WHEN** existem operações de inspeção, anotação, pulverização ou outro tipo no mesmo período
- **THEN** a RPC MUST excluir esses registros do resultado.

### Requirement: Retornar o read model completo da marcação

Cada linha retornada SHALL identificar a operação e a marcação e incluir `operation_id`, `marking_id`, `started_at`, `observed_at`, `plant_id`, `latitude`, `longitude`, `zone_name`, `occurrence_type_id`, `occurrence_type_name`, `plant_parts` e `photo_object_path`. Os resultados MUST ser ordenados do mais recente para o mais antigo.

#### Scenario: Consultar uma marcação completa
- **WHEN** uma marcação MIPD válida corresponde aos filtros
- **THEN** a resposta MUST conter os dados necessários para posicionar a planta e preencher o card de detalhes sem consultas adicionais às tabelas operacionais.

#### Scenario: Marcação sem foto
- **WHEN** `photo_object_path` não foi registrado
- **THEN** a RPC MUST retornar o campo como nulo sem excluir a marcação.

### Requirement: Preservar a privacidade das fotos

A RPC SHALL retornar somente o caminho do objeto associado à marcação e MUST NOT retornar URL pública, URL assinada persistente nem conteúdo binário. O bucket `mipd-plant-photos` MUST permanecer privado, e o acesso temporário à foto MUST respeitar a sessão autenticada e as políticas de Storage.

#### Scenario: Usuário autenticado consulta marcações
- **WHEN** o papel `authenticated` executa a RPC
- **THEN** a execução MUST ser permitida e os caminhos correspondentes aos resultados filtrados MUST ser retornados.

#### Scenario: Cliente anônimo tenta consultar marcações
- **WHEN** o papel `anon` tenta executar a RPC
- **THEN** a execução MUST ser negada.

#### Scenario: Auditor autenticado abre foto enviada por outro fluxo
- **WHEN** um usuário autenticado solicita acesso temporário a uma foto referenciada por uma marcação MIPD, inclusive uma foto enviada pelo fluxo mobile anônimo
- **THEN** a política de Storage MUST permitir a leitura do objeto no bucket privado
- **AND** o papel `anon` MUST continuar sem permissão de leitura.

### Requirement: Entregar a migração e a documentação canônica

A criação da RPC e seus privilégios SHALL ser fornecida em `migration.sql` na raiz, e sua evolução com filtro de zona em `migration_mipd_zone_filter.sql`, ambas incorporadas à definição consolidada de `database.md`, incluindo o catálogo de RPCs, o processo desktop MIPD e a query do item 25.

#### Scenario: Preparar implantação pelo SQL Editor
- **WHEN** a mudança estiver pronta para implementação
- **THEN** `migration.sql` MUST poder ser executado no SQL Editor para criar ou substituir a RPC e aplicar seus grants
- **AND** `database.md` MUST descrever a mesma assinatura, retorno, filtros, segurança e SQL consolidado.

#### Scenario: Atualizar um ambiente com a RPC MIPD anterior
- **WHEN** o ambiente já possui a assinatura de três argumentos
- **THEN** `migration_mipd_zone_filter.sql` MUST remover essa assinatura e criar a versão de quatro argumentos com os mesmos privilégios restritos.
