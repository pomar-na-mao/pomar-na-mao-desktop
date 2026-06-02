## Context

A rota `home` hoje carrega o componente `Dashboard`, que está estruturado em torno de um dashboard genérico com header, métricas, mapa com filtros e lista de atividades recentes. Esse desenho não corresponde ao fluxo operacional desejado para a home, que precisa priorizar o mapa no centro, carregar todas as plantas na inicialização e exibir indicadores laterais diretamente relacionados às tabelas `plants`, `zones`, `occurrence_types` e `varieties`.

O código atual já possui infraestrutura útil para a refatoração: `PlantsRepository` para consulta ao Supabase, `HomeStatsService` para métricas agregadas e um componente Leaflet para exibição de plantas. Ao mesmo tempo, o modelo atual ainda depende de conceitos antigos como `regions`, métricas não solicitadas pelo novo layout e filtros manuais para acionar a plotagem de plantas. A refatoração precisa simplificar a tela sem quebrar a rota `home` nem introduzir uma segunda implementação concorrente de dashboard.

## Goals / Non-Goals

**Goals:**
- Transformar a `home` em uma tela centrada no mapa, com cards laterais simétricos e sem os blocos atuais de header, métricas antigas e atividades recentes.
- Garantir que todas as plantas sejam plotadas no mapa assim que a tela abrir.
- Carregar logo na inicialização os totais de plantas, zonas, tipos de ocorrência e variedades.
- Exibir uma legenda de cores por variedade e reutilizar essa legenda para colorir os marcadores do mapa.
- Deixar os quatro cards da direita visualmente prontos com valores mockados, sem dependência de backend.
- Manter a implementação alinhada ao stack atual em Angular + Supabase, reutilizando o que já existe quando fizer sentido.

**Non-Goals:**
- Implementar filtros interativos novos para a home nesta mudança.
- Adicionar lógica real para `Pulverizações`, `Anotações`, `Inspeções` e `Colheita`.
- Alterar o fluxo de inclusão em massa, autenticação ou outras rotas do layout principal.
- Resolver inconsistências históricas de modelagem entre `regions` e `zones` fora do escopo necessário para a tela home.

## Decisions

### 1. Reaproveitar a rota e o shell atuais, substituindo a composição interna da tela

A rota `home` continuará apontando para `Dashboard`, mas o conteúdo do componente será reestruturado para a nova experiência. Isso reduz risco de navegação, preserva a superfície de rotas e evita churn desnecessário em `app.routes.ts` e no menu lateral.

Alternativas consideradas:
- Criar uma nova view `home` e redirecionar a rota para ela.
  Foi descartado porque adicionaria duplicação transitória e pouca vantagem prática para uma refatoração de superfície.

### 2. Separar a carga inicial em duas responsabilidades: métricas agregadas e plantas plotáveis

Os cards da esquerda exigem totais simples e a legenda por variedade, enquanto o mapa exige a lista completa de plantas com latitude, longitude e variedade. O design vai manter essas responsabilidades separadas:
- uma carga agregada para contadores e legenda;
- uma carga de plantas para plotagem inicial.

Isso permite otimizar cada consulta e evita acoplar a resposta de mapa a um payload de métricas que mudará com frequência. Se o backend atual já não oferecer a carga agregada necessária, a solução preferida é criar uma RPC ou endpoint consolidado apenas para os totais e a legenda da home.

Alternativas consideradas:
- Buscar cada total em uma consulta independente do frontend.
  Foi descartado como caminho principal porque aumenta latência, espalha regras de agregação e dificulta evolução posterior da home.
- Criar uma única RPC que também devolva todas as plantas.
  Foi evitado no design base porque mistura agregação com listagem volumosa e tende a crescer demais.

### 3. Derivar a legenda e as cores a partir das variedades do banco

O card de variedades deve refletir o banco atual, então a legenda será baseada em `varieties`. Cada variedade receberá uma cor estável a partir de uma paleta fixa aplicada por índice ordenado. As plantas sem variedade receberão uma cor fallback explícita.

Essa decisão evita tabela auxiliar de cores no banco neste primeiro momento e torna o comportamento previsível entre cards e mapa.

Alternativas consideradas:
- Persistir cores por variedade no banco.
  Foi descartado por aumentar escopo de schema e exigir governança visual que não foi pedida.
- Gerar cor aleatória por render.
  Foi descartado porque quebraria consistência visual entre sessões.

### 4. Remover da home os blocos não pedidos e a dependência de filtros como gatilho de plotagem

O comportamento atual só plota plantas quando algum filtro é acionado. A nova home deve carregar o mapa já preenchido. O design assume remoção dos componentes e estados relacionados a métricas legadas, atividades recentes e filtros da home, mantendo o view model focado em:
- estado de métricas laterais;
- legenda de variedades;
- plantas plotadas;
- ações visuais dos cards mockados da direita.

Alternativas consideradas:
- Manter os filtros ocultos e só adaptar o layout.
  Foi descartado porque deixaria lógica morta e aumentaria complexidade do view model.

## Risks / Trade-offs

- [Carga inicial de plantas pode ficar pesada] → Mitigação: limitar a consulta aos campos mínimos para plotagem e validar desempenho com a base atual antes de expandir a carga.
- [A RPC agregada da home pode sobrepor o `HomeStatsService` atual] → Mitigação: definir claramente se o serviço antigo será substituído ou adaptado, evitando dois contratos para a mesma tela.
- [Paleta fixa por índice pode mudar quando variedades forem adicionadas ou reordenadas] → Mitigação: ordenar as variedades de forma determinística e documentar a regra de cor para manter previsibilidade.
- [Código legado de `dashboard` pode continuar acoplado a componentes não usados] → Mitigação: remover ou descontinuar explicitamente componentes, sinais e métodos antigos na mesma refatoração.

## Migration Plan

1. Criar ou adaptar a fonte de dados agregados da home para retornar totais e a legenda por variedade.
2. Refatorar o `DashboardViewModel` para carregar métricas e plantas na inicialização, sem depender de filtros.
3. Substituir a composição da view e dos subcomponentes para o layout com mapa central e cards laterais.
4. Validar visualmente a home em desktop e garantir que a rota `home` continue funcional.
5. Executar testes automatizados e build da aplicação.

Rollback:
- Reverter a mudança para a estrutura anterior do `Dashboard` e restaurar a composição antiga caso o novo layout apresente problemas de usabilidade ou desempenho.

## Open Questions

- O total de `ocorrências` na home deve usar estritamente `occurrence_types` ou há expectativa futura de mostrar ocorrências registradas em `plant_occurrences`?
- Os cards da direita terão navegação ao clique nesta primeira entrega ou devem ser apenas botões visuais sem ação?
- A legenda de variedades deve exibir apenas variedades com plantas cadastradas ou todas as variedades existentes na tabela `varieties`?
