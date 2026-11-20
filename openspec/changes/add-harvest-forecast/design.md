# Design

## Context

O layout de `/meu-pomar` fica em `src/app/ui/views/my-orchard` e usa um painel de filtros rolável, controles compartilhados e mapa Leaflet. O item 25.26 de `database.md` documenta a tabela mobile `public.harvest_forecasts`, com uma marcação consolidada por `plant_id`, e a RPC mobile `sync_harvest_forecasts`.

## Goals / Non-Goals

**Goals**

- Manter filtros, mapa, contagens e resumo consistentes com a base do projeto selecionado.
- Permitir edição de classe com controle de concorrência e cálculo em kg com os pesos da tela.
- Entregar aplicação e reversão manuais do SQL para bases com ou sem a tabela documentada.

**Non-Goals**

- Histórico anual independente por planta, persistência de cenários e mudanças no sincronizador mobile.

## Decisions

1. **Reusar a estrutura visual de Meu Pomar.** Adicionar a rota no layout protegido e a entrada no menu ativo. Espelhar o contêiner arredondado, os breakpoints, as larguras laterais, o cabeçalho, os espaçamentos, o estilo do subtítulo e as superfícies de mapa nos dois temas. Usar `app-select`, os controles e as convenções de Leaflet já presentes no projeto. O subtítulo proposto é “Classificação das plantas e estimativa de produção”. Usar um view-model próprio para os estados da previsão, o que mantém o fluxo de operações de Meu Pomar independente.
2. **Consultar um snapshot por recorte.** `public.get_harvest_forecast(integer, text, uuid, text, jsonb)` usa o cliente Supabase do projeto atual, é `STABLE SECURITY INVOKER` e respeita as políticas existentes. Recebe `p_year`, `p_classification`, `p_zone_id`, `p_scenario` e `p_weights`. Cada resposta retorna `year`, `years`, `zones`, `matched_count`, `total_plants`, `class_counts`, `forecast_kg` e `markers`. Uma consulta conjunta elimina a possibilidade de o mapa e as contagens refletirem leituras de momentos diferentes. O intervalo de ano usa limites em `America/Sao_Paulo` e predicados sobre `created_at`, aproveitando o índice quando disponível.
3. **Usar o cadastro atual como referência geográfica.** A relação `harvest_forecasts.plant_id → plants.id` fornece as coordenadas da planta e `plants.zone_id → zones.id` determina seu talhão atual. A zona da marcação é a registrada no momento da coleta. O denominador inclui todas as linhas de `plants` que o usuário pode ler, inclusive plantas sem marcações, mortas ou inexistentes. A contagem filtrada inclui marcações vinculadas a plantas visíveis. O recorte é definido pelo ano do `created_at` da marcação disponível hoje.
4. **Enviar os pesos em memória.** A matriz aceita as chaves dos cenários com as quatro classes de peso em cada uma. A RPC usa valores numéricos exatos, valida todos os pesos e atribui contribuição zero à classe `N`. O mapa e suas contagens carregam na abertura e após mudanças de ano, classe ou zona. O botão solicita um novo snapshot com a matriz editada e revela o resumo. Mudanças nos parâmetros invalidam o resumo anterior. O view-model descarta respostas atrasadas de recortes ou projetos que deixaram de estar ativos.
5. **Atualizar a marcação pelo seu identificador e versão.** `public.update_harvest_forecast_classification(uuid, text, timestamptz)` recebe `p_id`, `p_classification` e `p_expected_updated_at`, e retorna `id`, `classification` e `updated_at`. A comparação e a atualização ocorrem no mesmo comando sob RLS. O frontend repassa o timestamp original como string, preservando a precisão do PostgreSQL. O servidor gera a próxima versão. A RPC retorna `P0002` quando nenhuma linha editável coincide com a versão enviada, e a UI atualiza o recorte antes de uma nova tentativa.
6. **Usar a tabela canônica nos ambientes existentes e novos.** A migration verifica a existência de `public.harvest_forecasts` e cria a estrutura compatível somente quando necessário. Nesse caso aplica RLS, leitura e atualização restrita às colunas de edição do desktop para autenticados, além de um identificador de procedência no comentário da tabela. Uma tabela preexistente conserva suas permissões e políticas. As duas RPCs passam a oferecer execução a `authenticated` e `service_role`.

## Risks / Trade-offs

- **Uma marcação por planta.** Quando o mobile sincroniza uma nova avaliação da mesma planta, o registro anterior é substituído e pode mudar de ano. Os filtros consultam a data da avaliação disponível por planta. Um histórico de safras completo exigiria mudar o contrato mobile.
- **Volume do mapa.** O snapshot evita paginação do objeto retornado e o frontend deve renderizar os pontos em lote, usando a estratégia de mapas densos do projeto. A verificação local deve incluir um recorte representativo de um pomar grande.
- **Rollback depois de começar a coletar.** Se a tabela criada contiver dados, estiver vinculada à RPC mobile ou tiver dependências, o rollback remove as RPCs desktop e preserva a tabela. O script avisa quando preserva a tabela criada pela migration.

## Migration Plan

1. Verificar se o ambiente segue o contrato de `plants`, `zones` e, onde estiver disponível, `harvest_forecasts` descrito no `database.md`.
2. Aplicar manualmente `supabase/migrations/20261120120000_add_desktop_harvest_forecast.sql` no projeto alvo antes de habilitar a tela. O item 25.26 continua sendo a referência para instalar a sincronização mobile em bases que precisem dela.
3. Para reverter, retirar a versão desktop que usa as RPCs e rodar manualmente `supabase/rollbacks/20261120120000_add_desktop_harvest_forecast_rollback.sql`. A pasta de rollback fica fora da fila de migrations.
4. Manter a seção 20.22 como referência do fluxo desktop e a seção 25.27 como referência dos parâmetros, permissões e implantação.
