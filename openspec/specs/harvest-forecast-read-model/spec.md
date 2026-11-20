# harvest-forecast-read-model Specification

## Purpose

Definir um contrato de leitura seguro e determinístico para o desktop consultar previsões de safra consolidadas, já associadas às coordenadas atuais de suas plantas.

## Requirements

### Requirement: Consultar previsões por período, classificação e zona
O banco SHALL fornecer uma RPC de leitura que aceite datas inicial e final opcionais, uma lista opcional de classificações e uma zona opcional, compondo todos os filtros informados sobre `public.harvest_forecasts`.

#### Scenario: Consultar sem um limite opcional
- **WHEN** uma data, lista de classificações ou zona é omitida
- **THEN** a RPC MUST deixar de restringir o resultado por esse parâmetro
- **AND** MUST preservar os demais filtros informados.

#### Scenario: Consultar por período
- **WHEN** uma ou ambas as datas são informadas
- **THEN** a RPC MUST comparar `harvest_forecasts.created_at` com os dias locais inclusivos em `America/Sao_Paulo`
- **AND** a data final MUST abranger todo o dia local informado.

#### Scenario: Consultar classificações selecionadas
- **WHEN** a lista contém uma ou mais opções entre `N`, `P`, `M`, `G` e `GG`
- **THEN** a RPC MUST retornar somente registros cujas classificações pertencem à lista.

#### Scenario: Receber classificação inválida
- **WHEN** a lista contém um valor diferente de `N`, `P`, `M`, `G` ou `GG`
- **THEN** a RPC MUST rejeitar a solicitação sem retornar um resultado parcial.

#### Scenario: Consultar uma zona
- **WHEN** uma zona é informada
- **THEN** a RPC MUST retornar somente registros cujo `harvest_forecasts.zone_id` corresponde à zona solicitada.

### Requirement: Retornar uma linha consolidada por planta
A RPC SHALL associar `harvest_forecasts.plant_id` a `plants.id` e retornar identificadores da previsão, planta e zona, classificação, instante de coleta e coordenadas atuais válidas da planta, com ordenação determinística.

#### Scenario: Previsão possui planta válida
- **WHEN** um registro corresponde aos filtros e sua planta possui latitude e longitude válidas
- **THEN** a RPC MUST retornar exatamente uma linha para esse `plant_id`
- **AND** MUST usar as coordenadas atuais de `public.plants` para a plotagem.

#### Scenario: Planta não possui coordenadas válidas
- **WHEN** uma previsão corresponde aos filtros, mas sua planta não possui latitude ou longitude válida
- **THEN** a linha MUST ser omitida do resultado cartográfico.

#### Scenario: Ordenar o resultado
- **WHEN** mais de uma previsão corresponde aos filtros
- **THEN** a RPC MUST ordenar primeiro pelo instante de coleta mais recente e usar o identificador da planta como desempate estável.

### Requirement: Restringir a leitura ao desktop autenticado
A migration SHALL criar a RPC com referências totalmente qualificadas, caminho de busca endurecido e execução limitada a papéis autorizados, sem modificar a tabela nem a RPC móvel de sincronização.

#### Scenario: Usuário autenticado consulta previsões
- **WHEN** uma sessão autenticada executa a RPC com parâmetros válidos
- **THEN** a função MUST retornar somente o contrato de leitura definido.

#### Scenario: Papel público ou anônimo tenta executar
- **WHEN** `PUBLIC` ou `anon` tenta executar a RPC
- **THEN** a execução MUST ser negada.

#### Scenario: Implantar a migration
- **WHEN** o arquivo SQL versionado é aplicado ao banco
- **THEN** a criação ou substituição da RPC, os `REVOKE`, os `GRANT` e a recarga de schema MUST ocorrer de forma transacional
- **AND** nenhuma alteração MUST ser feita em `harvest_forecasts`, `sync_harvest_forecasts` ou em seus dados.

### Requirement: Entregar e documentar a mudança sem aplicação remota automática
O repositório SHALL conter a migration executável e documentação equivalente em `database.md`, mas a implementação SHALL NOT aplicar a mudança ao projeto Supabase por MCP.

#### Scenario: Preparar a entrega de banco
- **WHEN** a implementação é concluída
- **THEN** o SQL da RPC MUST existir em `supabase/migrations`
- **AND** os itens 20 e 25 de `database.md` MUST documentar o processo desktop, o contrato, a segurança, a implantação e o rollback.
