## Why

Aprimorar os fluxos cadastrais da release para garantir maior precisão operacional no campo e no desktop:
1. Facilitar o fluxo de desenho de talhões/zonas centralizando e aproximando o mapa diretamente no perímetro da fazenda (tabela `farm`) ao invés da geolocalização do dispositivo ou centro fixo genérico.
2. Permitir o registro da capacidade volumétrica do tanque das máquinas agrícolas (em litros), dado essencial para planejamento de caldas e pulverização.
3. Permitir a especificação de volume/massa e unidade física de medida (kg ou L) para cada insumo que compõe uma receita de calda, oferecendo precisão quantitativa adicional além da dosagem de bula.

## What Changes

- **Início do mapa de zonas na fazenda**: Na tela `/cadastro/zonas`, carregar e centralizar o mapa com zoom apropriado nas coordenadas do ponto de menor ordem (`order = 1`) da tabela `farm`.
- **Capacidade do tanque em máquinas**:
  - Nova coluna opcional no banco de dados (`tank_volume_liters` do tipo `numeric`) na tabela `public.machines`.
  - Atualização do modelo TypeScript `MachineItem` / `MachineDraft`.
  - Inclusão do campo opcional no formulário modal de cadastro/edição e coluna na tabela de visualização em `/cadastro/maquinas`.
  - Atualização do documento de arquitetura `database.md` (descrição funcional e query unificada no item 25).
- **Volume/Massa e Unidade nos insumos de caldas**:
  - Novas colunas opcionais no banco de dados (`volume_or_mass` do tipo `numeric` e `unit` do tipo `text` com valores restritos a `'kg'` e `'L'`) na tabela `public.mixture_inputs`.
  - Atualização do modelo TypeScript `MixtureInputItem` / `MixtureInputDraft`.
  - Inclusão dos campos opcionais na linha de composição de cada insumo no modal de cadastro/edição de calda em `/cadastro/caldas`.
  - Atualização do documento de arquitetura `database.md` (descrição funcional e query unificada no item 25).
- **Migration SQL consolidada**:
  - Criação de um arquivo SQL de migração único para aplicar com segurança as alterações estruturais (`ALTER TABLE`) no Supabase.

## Capabilities

### New Capabilities

<!-- Nenhuma nova capability criada -->

### Modified Capabilities

- `zone-polygon-management`: Inicialização do mapa da tela de cadastro de zonas centralizando no ponto de menor ordem (`order = 1`) do perímetro da fazenda cadastrado na tabela `farm`.
- `machines-management`: Inclusão do atributo opcional de volume do tanque (em Litros) na entidade, persistência, formulário e tabela de máquinas.
- `caldas-management`: Inclusão dos atributos opcionais de volume/massa (numérico) e unidade de medida (`kg`, `L`) para cada insumo que integra a receita da calda.

## Impact

- **Frontend / UI**:
  - `src/app/ui/views/zone-map-management`: Ajuste dos inputs e do ViewModel para centralizar o mapa na fazenda usando o ponto de menor ordem.
  - `src/app/ui/views/machines` e componentes associados: Inclusão do campo "Volume do Tanque (L)" no formulário reativo e visualização na tabela.
  - `src/app/ui/views/mixtures` e componentes associados: Inclusão de campos de "Volume / Massa" e "Unidade (kg, L)" em cada insumo adicionado à calda.
- **Domínio e Dados**:
  - Modelos em `src/app/domain/models/machine.model.ts` e `src/app/domain/models/mixture.model.ts`.
  - Repositórios e serviços Supabase correspondentes.
- **Banco de Dados & Documentação**:
  - Arquivo `database.md` atualizado com as novas colunas e queries consolidadas.
  - Arquivo único de migração SQL em `supabase/migrations/` contendo as instruções DDL necessárias.
