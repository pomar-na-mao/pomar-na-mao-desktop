## Context

Veja `proposal.md` para a motivação e `specs/orchard-occurrence-management/spec.md` para o contrato observável. A rota filha `/pomar/ocorrencias` e seu item de menu já existem, mas `src/app/ui/views/occurrences/occurrences.ts` é um componente vazio. A tela de Variedades já oferece o padrão solicitado de tabela PrimeNG, busca, paginação, seleção, confirmação, diálogo, Excel, toast e loading, distribuído entre modelo, serviço Supabase, repositório com signal, view-model e componente.

`public.occurrence_types` possui `id uuid`, `name`, `code` único, `category`, `created_at` e `updated_at`; a definição aparece na seção conceitual e no script consolidado de `database.md`. `category` precisa ser formalizada como enum, inclusive quando já existir como texto no Supabase. O catálogo é consumido também pela inclusão em massa, dashboard e por tabelas que possuem chaves estrangeiras com comportamentos de exclusão distintos. A biblioteca `write-excel-file` e os serviços globais de cache, loading e mensagens já fazem parte do projeto.

## Goals / Non-Goals

**Goals:**

- Replicar a arquitetura e a experiência comprovadas em Variedades, mantendo a UI fina e testável.
- Fazer mutações retornarem o registro persistido e invalidarem todas as leituras compartilhadas afetadas.
- Preservar UUIDs e timestamps como valores técnicos, formatando datas apenas na apresentação e exportação.
- Documentar uma migração segura para `updated_at`, inclusive para registros existentes.
- Cobrir modelo, dados, estado, exportação e componente com testes unitários.

**Non-Goals:**

- Alterar rota, menu, políticas RLS, RPCs ou relacionamentos que apontam para `occurrence_types`.
- Modificar a semântica dos códigos existentes ou sincronizar automaticamente o mapa legado de ocorrências em `shared/utils/occurrences.ts`.
- Criar exclusão em cascata, contornar chaves estrangeiras ou remover dados dependentes.
- Aplicar automaticamente a alteração no Supabase; o usuário executará manualmente o SQL documentado.

## Decisions

### 1. Espelhar as camadas usadas em Variedades

Será criado um modelo `OccurrenceType` com `id: string`, `name`, `code`, `category`, `created_at` e `updated_at`, além de rascunho e payloads persistidos. `category` será uma união TypeScript equivalente ao enum PostgreSQL e aceitará `null` apenas na leitura de registros legados. Um serviço fará leitura ordenada, inserção e atualização com retorno da linha persistida e exclusão em lote por UUIDs. Um repositório manterá o signal da coleção; um view-model coordenará formulário, diálogo, seleção, loading e mensagens; o componente integrará a tabela, confirmação e exportação.

A leitura usará o namespace de dados de referência do cache. Mutações bem-sucedidas invalidarão ao menos `referenceData` e `dashboard`, além dos namespaces operacionais que reutilizam opções de ocorrência, conforme a lista disponível em `SUPABASE_CACHE_NAMESPACES`. O signal local só será alterado após sucesso confirmado pelo Supabase.

Alternativa considerada: adaptar diretamente o serviço de inclusão em massa. Foi rejeitada porque ele expõe apenas opções resumidas e não possui o contrato CRUD nem o estado necessários para uma tela administrativa.

### 2. Usar um único formulário reativo para criação e edição

O diálogo compartilhado terá `name` obrigatório após `trim` e um select PrimeNG obrigatório para `category`; ID, código e timestamps permanecerão internos. Abrir para inclusão criará um formulário limpo, abrir para edição copiará nome e categoria e cancelar descartará o rascunho. Registros legados com categoria nula exigirão seleção antes de salvar. O botão de confirmação ficará indisponível para formulário inválido ou mutação em andamento. Na criação, o código será derivado do nome normalizado com `trim`, caixa baixa em `pt-BR` e sequências de espaços convertidas em `_`; na edição, o código persistido será preservado mesmo quando o nome mudar. A restrição `UNIQUE` do banco continuará sendo a fonte de verdade para duplicidade.

Para manter compatibilidade com consumidores existentes, a normalização automática vale somente para novos registros; editar uma ocorrência não renomeia seu identificador técnico.

### 3. Interpretar seleção múltipla como checkboxes

Embora o pedido mencione “radio button”, radio buttons não permitem selecionar vários registros. A primeira coluna usará seleção PrimeNG por checkbox, com checkbox no cabeçalho, exatamente como Variedades. A coluna Ações terá edição e exclusão individual, e a toolbar terá exclusão da seleção.

Cada exclusão abrirá confirmação. A exclusão em lote será uma única operação `.in('id', ids)`. Chaves estrangeiras com `ON DELETE SET NULL` serão respeitadas pelo banco; referências sem ação de exclusão configurada poderão impedir toda a chamada, caso em que o estado local será preservado e o erro será informado.

Alternativa considerada: excluir sequencialmente. Foi rejeitada por aumentar requisições e permitir sucesso parcial difícil de reconciliar.

### 4. Ocultar o ID da tabela e preservá-lo na exportação

A tabela exibirá `name`, `category`, `created_at` e `updated_at`, mais seleção e ações. `id` e `code` continuarão no estado e nas operações, mas não terão colunas visuais. Categorias receberão rótulos em português, incluindo “Não classificada” para registros legados nulos, e uma paleta fixa escolhida para diferenciar as quatro categorias com fundo, borda e brilho sutil. Manter o rótulo textual evita que a cor seja o único indicador. A busca global abrangerá apenas o nome. Datas serão formatadas em `pt-BR`, mas ordenação e estado conservarão os valores ISO originais.

O serviço de Excel seguirá o padrão de `VarietyExcelService`, reutilizando `write-excel-file` por import dinâmico. O arquivo terá ID, Nome, Código, Categoria, Criado em e Atualizado em; seleção e ações serão omitidas. A fonte será `Table.filteredValue` quando houver filtro ativo e a coleção completa caso contrário, independentemente da página visível. O arquivo terá nome datado e planilha identificada como “Ocorrências”.

Alternativa considerada: exportar CSV pela API da tabela. Foi rejeitada porque o requisito pede Excel e a dependência adequada já está instalada.

### 5. Reutilizar loading e toast globais

Criação, edição e exclusão usarão o `LoadingService` global com liberação em `finally`, evitando envios concorrentes e garantindo desbloqueio também em erro. O serviço de mensagens existente emitirá toasts específicos de sucesso ou erro. A consulta inicial usará o loading da própria tabela, para não bloquear toda a aplicação apenas durante leitura.

Alternativa considerada: adicionar `p-blockUI` e um toast local. Foi rejeitada para evitar sobreposição com a infraestrutura global já utilizada por Variedades.

### 6. Enviar timestamps explicitamente pelo aplicativo

As duas definições de `public.occurrence_types` em `database.md` receberão `updated_at timestamptz not null default now()`. Não será criado trigger. O default continuará como proteção para inserções externas, mas o aplicativo gerará um único instante ISO para `created_at` e `updated_at` na criação e enviará apenas um novo `updated_at` na edição.

A migração incremental documentada adicionará a coluna inicialmente anulável, copiará `created_at` para linhas existentes e então aplicará `DEFAULT now()` e `NOT NULL`. O SQL deverá ser idempotente para permitir aplicação manual segura pelo usuário.

Alternativa considerada: trigger PostgreSQL. Foi rejeitada para manter o mesmo contrato explícito já adotado pela tela de Variedades e solicitado para o cliente.

### 7. Preservar responsividade, acessibilidade e convenções do template

A toolbar e a tabela seguirão a composição responsiva de Variedades. Botões somente com ícone terão tooltip e nome acessível; estados vazio, sem resultados, carregando e erro serão distintos. Componentes PrimeNG sem conteúdo filho usarão tags autocontidas no HTML, conforme a convenção do projeto.

### 8. Modelar categorias com enum PostgreSQL e compatibilidade legada

`database.md` definirá `public.occurrence_category` com `STRUCTURAL`, `ENVIRONMENTAL`, `PEST_DISEASE` e `ANTHROPIC`. A coluna será nullable para permitir que registros antigos sejam classificados gradualmente, mas o formulário exigirá categoria em toda criação ou edição. A migração documentada criará o enum idempotentemente, adicionará a coluna quando ausente e converterá uma coluna textual existente, falhando de forma explícita se houver valores fora do domínio.

Alternativa considerada: usar `text` com check constraint. Foi rejeitada porque o usuário solicitou enum e o tipo nomeado mantém o domínio reutilizável e explícito no Supabase.

## Risks / Trade-offs

- [A coluna pode não existir quando o frontend for publicado] → Documentar a ordem de implantação e propagar falhas de schema na carga e nas mutações.
- [Editar `code` pode afetar consumidores que tratam códigos como identificadores estáveis] → Não transformar o valor silenciosamente, manter confirmação explícita de edição e invalidar caches relacionados após sucesso.
- [Excluir um tipo referenciado pode falhar ou remover a associação quando a FK usa `SET NULL`] → Informar esse impacto na confirmação, deixar o banco aplicar suas restrições e preservar o estado local em erro.
- [Um código duplicado pode passar pela validação local] → Manter a restrição única do banco como autoridade e apresentar erro sem perder o rascunho.
- [UUIDs são necessários para mutações, mas não são úteis na tabela operacional] → Mantê-los no estado e na exportação, omitindo a coluna visual.
- [Cache pode servir opções antigas em outros fluxos] → Invalidar os namespaces de dados de referência, dashboard e operações afetadas após cada mutação bem-sucedida.
- [O relógio do dispositivo pode estar incorreto] → Gerar ambos os timestamps de criação a partir do mesmo instante; sincronização de relógio fica fora do escopo.
- [A coluna textual já existente pode conter valores inválidos] → Documentar que os dados devem ser normalizados para os quatro literais antes da conversão para enum; a migração falhará sem perda silenciosa.

## Migration Plan

1. Atualizar as duas definições de `occurrence_types` em `database.md` e adicionar o SQL incremental idempotente, sem trigger.
2. O usuário executar manualmente no Supabase a migração documentada, preenchendo registros existentes antes de impor `NOT NULL`.
3. Implementar e testar modelo, serviço, repositório, view-model, exportação e UI, reutilizando a tela de Variedades como baseline.
4. Verificar que criação envia timestamps iguais, edição preserva `created_at` e todas as mutações bem-sucedidas invalidam caches relevantes.
5. Executar testes focados, suíte completa, análise estática e build antes da entrega.
6. Em rollback do frontend, a coluna adicional permanece retrocompatível. Removê-la do banco somente se indispensável, reconhecendo a perda do histórico de atualização.
