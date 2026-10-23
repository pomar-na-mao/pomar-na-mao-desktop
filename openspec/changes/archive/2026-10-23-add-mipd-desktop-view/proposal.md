## Why

As marcações de Manejo Integrado de Pragas e Doenças (MIPD) já são coletadas e sincronizadas pelo aplicativo mobile, mas o desktop ainda não oferece uma forma de localizar, filtrar e auditar esses registros no mapa. O novo módulo permite que a equipe consulte as plantas afetadas, as partes registradas e a evidência fotográfica usando a mesma experiência visual já conhecida em Operações.

## What Changes

- Adicionar o item **Mipd** no sidebar, imediatamente abaixo de **Operações**, com uma rota desktop própria.
- Criar uma tela MIPD com o mesmo contêiner, painel lateral, mapa, espaçamentos, cores, comportamento responsivo, tela cheia e card de detalhes usados pela tela de Operações.
- Permitir filtrar as marcações pelo intervalo de datas da operação, pela zona da planta e por um tipo de ocorrência cuja categoria seja `PEST_DISEASE`.
- Renderizar no mapa as plantas com marcações correspondentes e abrir, ao selecionar uma planta, um card lateral/direito com coordenadas, praga ou doença, partes afetadas, data e foto.
- Manter os polígonos da fazenda e de todas as zonas fixos e sempre visíveis no mapa, independentemente dos filtros MIPD.
- Adicionar a RPC de leitura `get_mipd_operations(p_start_date, p_end_date, p_occurrence_type_id, p_zone_id)` para retornar o read model necessário ao mapa a partir de `field_operations`, `mipd_markings`, plantas e tipos de ocorrência. O filtro usará o contrato persistido pelo mobile: tipo `mipd` e `field_operations.source = 'mpid'`.
- Resolver fotos privadas no cliente por URL assinada temporária do bucket `mipd-plant-photos`, permitindo leitura a usuários autenticados inclusive para uploads mobile anônimos, sem tornar o bucket público nem conceder leitura a `anon`.
- Entregar a criação da RPC em `migration.sql`, sua evolução de filtro por zona em `migration_mipd_zone_filter.sql` e atualizar `database.md`, incluindo o catálogo da RPC, o processo desktop e principalmente o item 25.
- Cobrir rota/sidebar, filtros, serviço/repositório, mapa, seleção e detalhes com testes unitários.

## Capabilities

### New Capabilities

- `mipd-desktop-view`: Consulta visual dos registros MIPD no desktop, com filtros, marcadores no mapa e detalhes da marcação/foto.
- `mipd-operation-read-model`: Contrato de leitura Supabase para consultar operações MIPD e seus dados fitossanitários sem alterar os registros sincronizados pelo mobile.

### Modified Capabilities

- `desktop-route-surface`: Acrescenta a rota MIPD autenticada e sua entrada imediatamente abaixo de Operações no sidebar.

## Impact

- **UI Angular:** rota principal, sidebar, nova view MIPD e componentes equivalentes aos filtros, mapa e card de detalhes de Operações.
- **Estado e domínio:** novos modelos, view model, repositório e serviço de consulta; uso do catálogo existente de `occurrence_types` filtrado por `PEST_DISEASE`.
- **Supabase:** nova RPC de leitura com permissão para o papel autenticado e geração de URL assinada no bucket privado existente; nenhuma mudança no fluxo de escrita mobile.
- **Documentação e implantação:** `migration.sql`, `migration_mipd_zone_filter.sql` e seções 18, 20 e 25 de `database.md`.
- **Compatibilidade:** nenhuma alteração destrutiva; o valor histórico `source = 'mpid'` permanece como contrato de persistência, enquanto “MIPD” continua sendo o nome funcional.
