## Context

Veja `proposal.md` para a motivação e `specs/orchard-variety-management/spec.md` para o contrato observável. A rota filha `/pomar/variedades` e seu item de menu já existem, mas `src/app/ui/views/varieties/varieties.ts` é um componente vazio. A tela de Usuários já estabelece o padrão visual de toolbar, busca, tabela PrimeNG, paginação, seleção por checkbox e ações com ícones, embora use dados estáticos e exporte CSV.

O projeto separa modelos de domínio, serviços Supabase, repositórios com signals e view-models para orquestração de telas. Já existem `LoadingService` global, serviço de mensagens/toast, cache de requisições Supabase e políticas RLS CRUD para `public.varieties`. O esquema atual da tabela possui `id`, `name`, `description` e `created_at`, e é repetido tanto na seção conceitual quanto no script consolidado de `database.md`.

## Goals / Non-Goals

**Goals:**

- Manter a UI fina e testável, isolando acesso Supabase e fluxo assíncrono em camadas próprias.
- Reutilizar os padrões visuais, responsivos e de acessibilidade da tela de Usuários.
- Fazer mutações retornarem o registro persistido, mantendo a tabela sincronizada com timestamps enviados pelo aplicativo.
- Invalidar leituras compartilhadas de variedades após qualquer mutação.
- Documentar uma migração segura para registros existentes e para novas inserções.

**Non-Goals:**

- Alterar a rota, o menu, as políticas RLS ou a relação `plants.variety_id`.
- Impor unicidade de nome, pois o esquema e o pedido atual não estabelecem essa regra.
- Migrar a tela de Usuários ou substituir o toast global existente.
- Aplicar automaticamente a mudança no projeto Supabase; o SQL documentado será aplicado manualmente pelo usuário.

## Decisions

### 1. Seguir as camadas de domínio, serviço, repositório e view-model

Será criado um modelo `Variety` com `id: number`, `name`, `description: string | null`, `created_at` e `updated_at`, além de um tipo de rascunho sem campos técnicos e tipos de payload persistido com os timestamps exigidos. Um `VarietiesService` fará `select`, `insert(...).select().single()`, `update(...).eq(...).select().single()` e exclusão em lote por `.in('id', ids)`. O serviço acrescentará os timestamps ao payload antes de chamar o Supabase. Um repositório manterá um signal da coleção e aplicará os resultados retornados pelo serviço. Um view-model coordenará formulário, diálogo, seleção, loading e mensagens; o componente ficará responsável pela integração direta com a tabela e confirmação PrimeNG.

A leitura será ordenada por nome e usará o namespace de dados de referência do cache. Mutações bem-sucedidas invalidarão ao menos `referenceData`, `dashboard` e `plants`, pois variedades aparecem em seletores, resumos e relações de plantas.

Alternativa considerada: concentrar Supabase e estado no componente, como a tela atual de Usuários. Foi rejeitada porque o novo fluxo possui CRUD real, tratamento de erro, cache e testes de comportamento, justificando a arquitetura já usada nas telas funcionais.

### 2. Usar formulário reativo em um único diálogo PrimeNG para criar e editar

O mesmo diálogo alternará título, ação primária e registro-alvo. `name` será obrigatório após `trim`; `description` será opcional, normalizada para `null` quando vazia. Abrir para inclusão cria um formulário limpo; abrir para edição copia os dados da linha; cancelar descarta o rascunho. O botão de confirmação ficará indisponível enquanto o formulário for inválido ou uma mutação estiver em curso.

Alternativa considerada: diálogos/componentes separados. Foi rejeitada por duplicar campos, validação e testes sem diferença de contrato.

### 3. Interpretar a seleção múltipla como checkboxes

Embora o pedido mencione “radio button”, radio buttons só permitem uma escolha. Para cumprir explicitamente a exclusão de um ou vários registros e seguir a tela de Usuários, a primeira coluna usará `p-tableCheckbox` e `p-tableHeaderCheckbox`. Haverá exclusão individual na coluna Ações e um botão “Excluir selecionadas”, habilitado apenas quando a seleção não estiver vazia.

Cada caminho abrirá uma confirmação PrimeNG. A exclusão em lote será uma única chamada Supabase com os IDs selecionados, evitando sucesso parcial no cliente. A chave estrangeira existente `plants.variety_id ... on delete set null` continuará determinando o efeito em plantas associadas.

Alternativa considerada: exclusões sequenciais. Foi rejeitada porque aumenta round-trips e pode deixar a coleção parcialmente removida.

### 4. Exportar um arquivo Excel real com o conjunto filtrado

A implementação adicionará a biblioteca `write-excel-file` e montará uma planilha `.xlsx` com cabeçalhos em português. A escolha substitui a biblioteca `xlsx`, descartada durante a implementação após a auditoria do npm identificar vulnerabilidades altas sem correção disponível. Serão exportados nome, descrição e timestamps formatados; seleção, ID técnico e ações ficam de fora. A fonte será `Table.filteredValue` quando houver filtro ativo e a coleção completa caso contrário, de modo que a paginação não limite o download. O nome do arquivo incluirá a data local.

Alternativa considerada: `Table.exportCSV()`, já usado em Usuários. Foi rejeitada porque o requisito pede Excel, não CSV.

### 5. Reutilizar os serviços globais de loading e toast

Criação, edição e exclusão envolverão `LoadingService.show()`/`hide()` com `try/finally`, garantindo desbloqueio também em falhas. O `MessageService` existente exibirá mensagens de sucesso ou erro. A consulta inicial terá estado de carregamento próprio na tabela para não bloquear toda a aplicação; o bloqueio global fica reservado às mutações solicitadas.

Alternativa considerada: introduzir `p-blockUI` e um segundo sistema de toast local. Foi rejeitada porque o shell já possui overlay global e toast compartilhado, e duplicá-los criaria camadas concorrentes. A tabela, os diálogos, confirmações, campos, botões e ícones permanecem PrimeNG.

### 6. Enviar `created_at` e `updated_at` pelo aplicativo

`database.md` será atualizado nos dois pontos que definem `public.varieties`: a descrição da tabela e o script consolidado. A tabela final terá `updated_at timestamptz not null default now()`, sem trigger de atualização automática. O default permanecerá como fallback para inserções externas.

Para a migração incremental documentada, a coluna será criada inicialmente de forma anulável, os registros existentes receberão `updated_at = created_at`, e só então serão aplicados `DEFAULT now()` e `NOT NULL`. Na criação, o serviço Angular gerará uma única data ISO e a enviará nos campos `created_at` e `updated_at`. Na edição, gerará e enviará apenas um novo `updated_at`, preservando `created_at`.

Alternativa considerada: usar um trigger no PostgreSQL. Foi rejeitada por decisão de arquitetura: esta funcionalidade deve explicitar os timestamps no payload enviado pelo aplicativo.

### 7. Preservar responsividade e acessibilidade do modelo de Usuários

A toolbar adaptará busca e ações para telas estreitas; a tabela manterá paginação, ordenação, row hover e apresentação responsiva. Botões somente com ícone terão tooltip e nome acessível. Datas serão apresentadas no locale `pt-BR`, e valores de descrição ausentes terão marcador visual compreensível. Componentes usados diretamente no HTML seguirão a convenção de tags autocontidas quando não tiverem conteúdo filho.

## Risks / Trade-offs

- [A migração manual pode não ser aplicada antes da nova UI] → Documentar claramente a ordem de implantação e validar/propagar erros de coluna ausente na carga e nas mutações.
- [Excluir uma variedade usada por plantas remove sua classificação] → Conservar o `ON DELETE SET NULL` existente e tornar a confirmação explícita; não ampliar o escopo com bloqueios ou contagens de dependências.
- [A biblioteca de Excel aumenta o bundle] → Usar `write-excel-file`, que possui uma dependência pequena e sem alertas próprios na auditoria, carregá-la dinamicamente apenas quando o usuário exportar e limitar a planilha aos campos exigidos.
- [Cache pode servir variedades antigas em outras telas] → Invalidar namespaces relacionados após cada mutação bem-sucedida e atualizar imediatamente o signal local com a resposta do banco.
- [Datas do banco podem ter fusos diferentes] → Manter ISO/timestamptz no domínio e formatar somente na apresentação e exportação.
- [O relógio do dispositivo pode estar incorreto] → Gerar os dois valores de criação a partir do mesmo instante e manter o contrato explícito; correções de sincronização de relógio ficam fora deste escopo.
- [Seleção e filtro podem tornar a exclusão em lote ambígua] → O contador da confirmação usará exatamente `selectedVarieties`; filtrar a tabela não adiciona nem remove silenciosamente itens já selecionados.

## Migration Plan

1. Atualizar `database.md` com o contrato final da tabela, sem trigger, e um bloco incremental idempotente para a coluna.
2. O usuário executa manualmente no Supabase o SQL incremental documentado: adicionar a coluna, copiar `created_at` para linhas existentes e impor default/not-null.
3. Verificar que o aplicativo envia timestamps iguais na inserção e renova somente `updated_at` na edição.
4. Adicionar modelos, serviço, repositório/view-model, UI e dependência de exportação; executar testes e análise estática antes da entrega.
5. Em rollback da aplicação, reverter apenas o frontend; a coluna é retrocompatível. Se for indispensável reverter o banco, remover a coluna, reconhecendo a perda dos timestamps de atualização.
