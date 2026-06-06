## Context

O dashboard web já possui os controles `Período`, `Zona`, `Ocorrência`, `Variedade` e `Operação`, mas a carga principal ainda vem de `get_home_dashboard_snapshot()` sem parâmetros. Na prática, `filterStartDate` e `filterEndDate` vivem apenas no `DashboardViewModel`, e `filterOperation` hoje altera apenas o modo visual de `colheita`, sem redefinir o conjunto de plantas retornado do backend.

Ao mesmo tempo, a modelagem do banco já contempla `plants.planting_date`, inclusive com suporte nas rotinas de inclusão em massa e documentação em `database-and-features-organization.md`. O gap atual não é de schema, e sim de contrato entre UI, serviço Supabase e RPC do dashboard.

## Goals / Non-Goals

**Goals:**
- Fazer o filtro `Período` deixar de ser apenas estado local e passar a recortar os dados do dashboard quando aplicável.
- Adicionar um filtro independente de `Data de plantio` usando `plants.planting_date`.
- Garantir que os filtros de data tenham semântica explícita, opcional e previsível, sem quebrar a carga inicial do mapa.
- Versionar a mudança da RPC do dashboard e refletir o novo contrato na documentação técnica do banco.

**Non-Goals:**
- Redesenhar o layout do dashboard ou alterar filtros já existentes de zona, ocorrência e variedade além do necessário para composição com o novo recorte.
- Mudar a lógica visual da camada de `colheita`, exceto no que depender do novo recorte retornado pelo backend.
- Reestruturar outras RPCs de mapa fora do fluxo de snapshot do dashboard.

## Decisions

### 1. Tornar os filtros de data parte do contrato do snapshot
O dashboard passará a montar um objeto de filtros para `HomeDashboardRepository` e `HomeDashboardService`, e a RPC `public.get_home_dashboard_snapshot()` receberá parâmetros opcionais para:
- intervalo de `Período`
- intervalo de `Data de plantio`
- operação selecionada

Rationale:
- O filtro `Período` não pode ser resolvido corretamente apenas no cliente porque depende de joins com eventos datados.
- O filtro de `planting_date` até poderia ser local, mas isso deixaria metade da semântica no backend e metade no frontend, o que tende a gerar divergência.

Alternativa considerada:
- Filtrar `planting_date` no cliente e manter `Período` no backend.
  Rejeitada porque aumenta a inconsistência do contrato e mantém a UI dependente de campos que hoje nem entram no snapshot.

### 2. `Período` será opcional e só terá efeito temporal quando houver operação selecionada
O dashboard deixará os campos de `Período` vazios por padrão. O recorte temporal só será enviado para a RPC quando existir ao menos um limite informado e uma operação selecionada. Sem operação, o filtro de `Período` não reduz o conjunto retornado.

Rationale:
- O filtro atual nasce preenchido com “hoje”; se ele passar a ser efetivo sem revisão, o dashboard quase sempre abrirá vazio ou excessivamente restrito.
- A própria UI já associa `Período` a `Operação`, então o comportamento precisa seguir essa relação e não inventar uma data genérica sem fonte de verdade.

Alternativa considerada:
- Aplicar `Período` sempre, mesmo sem operação, usando um “último evento” derivado por planta.
  Rejeitada porque adiciona ambiguidade funcional e uma consulta substancialmente mais cara sem necessidade explícita do usuário.

### 3. Mapear cada operação para a sua fonte de data no backend
Na implementação, os valores da UI serão normalizados para códigos coerentes com o banco:
- `pulverizacao` -> `spraying`
- `inspecao` -> `manual_inspection`
- `anotacao` -> `annotation`
- `colheita` -> `harvest`

O filtro `Período` usará a fonte de data compatível com a operação:
- operações baseadas em `field_operations` e `plant_operation_history` usarão a data da operação
- anotações/ocorrências usarão a data observada compatível com o contrato do dashboard

Rationale:
- O frontend já expõe nomes em português, enquanto o banco trabalha com `code` em inglês.
- Fixar esse mapeamento no design evita uma implementação com condicionais espalhadas entre view-model, serviço e SQL.

### 4. `Data de plantio` será um intervalo independente e aberto
O novo filtro de `Data de plantio` também começará vazio e aceitará:
- apenas data inicial
- apenas data final
- intervalo fechado

Quando algum limite de `planting_date` estiver ativo, plantas com `planting_date` nulo ficarão fora do resultado.

Rationale:
- Isso torna o comportamento previsível para o usuário e simples de validar em testes.
- Evita trazer plantas “sem data” para um recorte temporal que o usuário explicitamente pediu.

Alternativa considerada:
- Incluir plantas com `planting_date` nulo mesmo com filtro ativo.
  Rejeitada porque mistura “sem informação” com “dentro do período”, o que enfraquece a utilidade do filtro.

### 5. Normalizar comparação por datas para evitar erro de timezone
Os campos da UI entregam datas sem horário, enquanto `plants.planting_date` e várias datas operacionais são `timestamptz`. A implementação deve comparar o intervalo de forma inclusiva e estável:
- para `planting_date`, comparar por componente de data
- para `Período`, usar início inclusivo e fim inclusivo no dia selecionado

Rationale:
- Sem essa normalização, o filtro pode excluir registros no limite por deslocamento de timezone entre navegador, app e banco.

### 6. Atualizar a RPC por migration nova e refletir o contrato na documentação
A mudança será entregue por uma nova migration versionada que substitui `public.get_home_dashboard_snapshot()` sem editar migrations antigas. `database-and-features-organization.md` será ajustado para documentar a nova assinatura, o significado do filtro `Período` e o uso de `plants.planting_date` no dashboard.

## Risks / Trade-offs

- [Filtro temporal continuar ambíguo para o usuário] -> Mitigação: deixar `Período` opcional, acoplado à operação e documentado no spec.
- [Erro de borda por timezone] -> Mitigação: comparar datas normalizadas e testar cenários de início/fim inclusivos.
- [Consulta da RPC ficar mais pesada] -> Mitigação: usar filtros opcionais com `exists`/joins direcionados e preservar o snapshot como ponto único de carga.
- [Recorte por `planting_date` esconder plantas sem valor] -> Mitigação: assumir explicitamente essa regra no contrato e cobri-la com testes.

## Migration Plan

1. Criar uma nova migration SQL para `get_home_dashboard_snapshot()` com os novos parâmetros opcionais.
2. Validar a RPC no Supabase via MCP antes de ajustar o frontend.
3. Atualizar serviço, repositório, modelos e view-model para enviar/consumir o novo contrato.
4. Atualizar `database-and-features-organization.md` com assinatura, semântica e exemplos.
