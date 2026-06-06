## Why

O dashboard já expõe o filtro `Período`, mas hoje esse estado não altera o snapshot carregado do backend e acaba funcionando como um controle visual sem efeito real sobre os dados do mapa. Ao mesmo tempo, a base já mantém `plants.planting_date` e o fluxo de inclusão em massa já escreve esse campo, mas o dashboard ainda não permite recortar o mapa por essa dimensão temporal.

## What Changes

- Redefinir o filtro `Período` do dashboard para que ele afete de fato a carga de dados exibida no mapa, em vez de permanecer apenas como estado local da UI.
- Incluir um filtro independente de `Data de plantio`, baseado na coluna `plants.planting_date`, com comportamento consistente para plantas sem data informada.
- Estender o contrato de dados do dashboard entre view-model, repositório, serviço e RPC para aceitar parâmetros temporais opcionais e devolver somente o recorte compatível com os filtros aplicados.
- Atualizar a documentação técnica em `database-and-features-organization.md` para refletir a nova assinatura da RPC e a semântica dos filtros do dashboard.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `home-map-dashboard`: adicionar filtros temporais efetivos no dashboard para `Período` e `Data de plantio`, com recarga reativa do snapshot e contrato explícito com o backend.

## Impact

- Código afetado:
  - `src/app/ui/views/dashboard/components/dashboard-filters-panel.ts`
  - `src/app/ui/view-models/dashboard/dashboard.view-model.ts`
  - `src/app/domain/models/home-dashboard.model.ts`
  - `src/app/data/repositories/home-dashboard/home-dashboard-repository.ts`
  - `src/app/data/services/home-dashboard/home-dashboard-service.ts`
  - testes do dashboard, repositório e serviço
- Banco e APIs:
  - RPC `public.get_home_dashboard_snapshot()`
  - possível nova migration versionada em `supabase/migrations/`
- Documentação:
  - `database-and-features-organization.md`
