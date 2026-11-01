## 1. Banco de Dados e Documentação de Arquitetura

- [x] 1.1 Criar o arquivo de migração SQL único `supabase/migrations/20261031200000_release_enhancements_zonas_maquinas_caldas.sql` contendo `ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS tank_volume_liters numeric` e `ALTER TABLE public.mixture_inputs ADD COLUMN IF NOT EXISTS volume_or_mass numeric, ADD COLUMN IF NOT EXISTS unit text`, verificando a sintaxe SQL e as restrições de validação.
- [x] 1.2 Atualizar a documentação de arquitetura no arquivo `database.md` incluindo as novas colunas nas seções descritivas das entidades (15.7 `machines`, 15.8 `mixture_inputs`), fluxos das telas (20.13 `caldas`, 20.15 `maquinas`) e na query consolidada única (item 25), verificando que todas as descrições e scripts DDL estão consistentes.

## 2. Inicialização do Mapa na Fazenda (/cadastro/zonas)

- [x] 2.1 Ajustar o componente `MapPolygonSelector` (`src/app/ui/components/basic-data/map-polygon-selector/map-polygon-selector.ts`) para observar mudanças no input `center` via `ngOnChanges` e atualizar a visão do mapa via `setView`, verificando o comportamento responsivo ao carregar dados assíncronos.
- [x] 2.2 Atualizar `ZoneMapManagementViewModel` e `zone-map-management.html` para calcular as coordenadas do ponto de menor ordem (`order = 1`) retornado por `FarmBoundaryService`, passá-lo como `[center]` inicial do mapa e desativar `locateUserOnInit`, verificando que o mapa foca na fazenda.

## 3. Campo de Volume do Tanque em Máquinas (/cadastro/maquinas)

- [x] 3.1 Atualizar a interface de domínio em `src/app/domain/models/machine.model.ts` para adicionar o campo opcional `tank_volume_liters?: number | null` aos tipos `MachineItem`, `MachineDraft`, `MachineCreate` e `MachineUpdate`, verificando a tipagem estática.
- [x] 3.2 Atualizar `MachinesService`, `MachinesRepository` e `MachineExcelService` para incluir `tank_volume_liters` na seleção, persistência e exportação de planilhas Excel, verificando que os dados são devidamente mapeados.
- [x] 3.3 Atualizar `MachinesViewModel`, o formulário reativo e os templates `machines.html` e `machines.ts` com o campo "Volume do Tanque (Litros)" usando `p-inputnumber` no modal de cadastro/edição e nova coluna na tabela de listagem, verificando a renderização na interface.

## 4. Campos de Volume/Massa e Unidade em Caldas (/cadastro/caldas)

- [x] 4.1 Atualizar as interfaces de domínio em `src/app/domain/models/mixture.model.ts` para adicionar os campos opcionais `volume_or_mass?: number | null` e `unit?: 'kg' | 'L' | string | null` aos tipos `MixtureInputItem` e `MixtureInputDraft`, verificando a tipagem estática.
- [x] 4.2 Atualizar `MixturesService` e `MixturesRepository` para incluir `volume_or_mass` e `unit` na consulta e persistência atômica da lista de insumos de calda, verificando a integridade das operações.
- [x] 4.3 Atualizar `MixturesViewModel`, a inicialização do FormArray de insumos e o template `mixtures.html` adicionando os campos de "Volume / Massa" e "Unidade (kg, L)" em cada insumo no modal e na visualização detalhada, verificando a manipulação e validação do formulário.

## 5. Testes Unitários e Validação Final

- [x] 5.1 Atualizar e expandir os testes unitários de `ZoneMapManagementViewModel` e `MapPolygonSelector`, verificando o cálculo do ponto de menor ordem e a centralização do mapa no Leaflet.
- [x] 5.2 Atualizar e expandir os testes unitários de `MachinesViewModel`, `MachinesRepository`, `MachinesService` e `MachineExcelService`, validando o suporte a `tank_volume_liters`.
- [x] 5.3 Atualizar e expandir os testes unitários de `MixturesViewModel`, `MixturesRepository` e `MixturesService`, validando o suporte a `volume_or_mass` e `unit` para insumos de calda.
- [x] 5.4 Executar os testes automatizados com `npm test` garantindo que todos os testes passem sem regressões.
