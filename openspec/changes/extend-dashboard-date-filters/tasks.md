## 1. Contrato e estado dos filtros no dashboard

- [x] 1.1 Definir o contrato de filtros temporais do dashboard nos modelos, repositório e serviço (`Período`, `Data de plantio` e operação).
- [x] 1.2 Ajustar o `DashboardViewModel` para iniciar os filtros de data vazios, mapear a operação da UI para o backend e recarregar o snapshot quando os filtros temporais mudarem.
- [x] 1.3 Atualizar `dashboard-filters-panel.ts` para manter o filtro `Período` opcional e incluir a nova seção de `Data de plantio`.

## 2. RPC e documentação do banco

- [x] 2.1 Criar uma nova migration versionada para expandir `public.get_home_dashboard_snapshot()` com parâmetros opcionais de período, data de plantio e operação.
- [x] 2.2 Implementar na RPC o recorte por operação/período e por `plants.planting_date`, incluindo intervalos abertos, limites inclusivos e exclusão de `planting_date` nulo quando o filtro estiver ativo.
- [ ] 2.3 Validar a RPC via MCP do Supabase e atualizar `database-and-features-organization.md` com a nova assinatura e a semântica dos filtros do dashboard.

## 3. Integração e testes automatizados

- [x] 3.1 Atualizar o mapeamento do snapshot no frontend para consumir o novo contrato sem quebrar zona, ocorrência, variedade e modo de colheita.
- [x] 3.2 Cobrir no serviço, repositório e view-model os cenários de período opcional, data de plantio, composição entre filtros e comportamento sem operação selecionada.
- [x] 3.3 Garantir que o dashboard continue exibindo todas as plantas na carga inicial quando nenhum filtro temporal estiver preenchido.

## 4. Verificação final

- [x] 4.1 Executar os testes automatizados afetados pelo dashboard e pelo serviço Supabase.
- [ ] 4.2 Validar manualmente o dashboard com combinações de `Período`, `Data de plantio` e `Operação` para confirmar que o mapa reflete o recorte esperado.
