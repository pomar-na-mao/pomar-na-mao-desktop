## Context

O projeto Pomar na Mão Desktop gerencia operações, cadastros e visualizações geoespaciais em Angular com Supabase.
Atualmente:
- Na rota `/cadastro/zonas`, o componente `MapPolygonSelector` inicializa com coordenadas estáticas (`[-23.398772, -49.148646]`) e com `locateUserOnInit = true`, o que desvia o foco do usuário para a geolocalização do computador/dispositivo ao invés de centralizar na propriedade rural. O serviço `FarmBoundaryService` já busca os pontos perimetrais da tabela `farm` ordenados por `order`.
- Na rota `/cadastro/maquinas`, a tabela `public.machines` armazena dados gerais de maquinários, mas não dispõe de campo para registrar a capacidade volumétrica do tanque (em Litros).
- Na rota `/cadastro/caldas`, a composição de insumos de cada calda é persistida em `public.mixture_inputs` contendo apenas `dose` e `dose_unit`. Operadores e agrônomos necessitam informar também a quantidade física específica (volume ou massa) e a respectiva unidade ('kg' ou 'L') para o preparo dos lotes de pulverização.

## Goals / Non-Goals

**Goals:**
- Centralizar e aplicar zoom no mapa da tela `/cadastro/zonas` baseado no ponto de menor ordem (`order = 1`) retornado da tabela `farm`.
- Desativar a geolocalização automática do dispositivo no mapa de zonas para priorizar a visualização da fazenda.
- Adicionar coluna opcional `tank_volume_liters numeric` na tabela `public.machines`, atualizar o modelo de dados, o repositório, o serviço, o formulário modal e a tabela da tela `/cadastro/maquinas`.
- Adicionar colunas opcionais `volume_or_mass numeric` e `unit text` (com check constraint para `'kg'` e `'L'`) na tabela `public.mixture_inputs`, atualizar o modelo de dados, os métodos de persistência, o formulário de calda e o diálogo de detalhes em `/cadastro/caldas`.
- Atualizar o documento de arquitetura de dados `database.md` nas seções de entidades (15.7, 15.8), fluxos de telas (20.13, 20.15) e query consolidada (item 25).
- Criar um arquivo único de migration SQL executável em `supabase/migrations/` contendo todas as alterações de esquema (`ALTER TABLE ... ADD COLUMN`).
- Atualizar e cobrir as mudanças com testes unitários no padrão Vitest existente.

**Non-Goals:**
- Não alterar as regras de validação obrigatória existentes (os novos campos são estritamente opcionais).
- Não alterar a tabela `public.inputs` diretamente, já que as medições de volume/massa pertencem à formulação específica da calda (`mixture_inputs`).
- Não reescrever componentes do mapa fora do necessário para viabilizar a centralização dinâmica no ponto da fazenda.

## Decisions

### 1. Centralização dinâmica no ponto de menor ordem da fazenda em `/cadastro/zonas`
- **Decisão**: No `ZoneMapManagementViewModel`, computar `farmInitialCenter` a partir dos pontos retornados por `farmBoundaryService.getBoundary()`. Identificar o ponto com menor valor de `order` (preferencialmente `order === 1` ou o primeiro elemento da lista ordenada).
- No componente `MapPolygonSelector`, garantir que quando a propriedade `center` for atualizada assincronamente pelo ViewModel, o mapa execute `this.map.setView(this.center, this.zoom)`. Além disso, configurar `locateUserOnInit = false` em `zone-map-management.html`.
- **Alternativas consideradas**:
  - *Hardcoding das coordenadas da fazenda no template*: Rejeitado por acoplar o código a uma fazenda específica e quebrar portabilidade entre ambientes e tenants.

### 2. Modelagem das novas colunas de Máquinas e Insumos de Caldas
- **Decisão**:
  - Tabela `public.machines`:
    ```sql
    alter table public.machines
      add column if not exists tank_volume_liters numeric check (tank_volume_liters is null or tank_volume_liters >= 0);
    ```
  - Tabela `public.mixture_inputs`:
    ```sql
    alter table public.mixture_inputs
      add column if not exists volume_or_mass numeric check (volume_or_mass is null or volume_or_mass >= 0),
      add column if not exists unit text check (unit is null or unit in ('kg', 'L'));
    ```
- **Alternativas consideradas**:
  - *Usar tipo `integer` para o volume*: Rejeitado, pois volumes e massas agrícolas comumente contêm frações decimais (ex: 1.5 L, 0.25 kg).
  - *Deixar `unit` sem restrição*: Rejeitado para preservar consistência de catálogo, garantindo apenas `'kg'` ou `'L'` conforme especificado pelo usuário.

### 3. Migração SQL Unificada
- **Decisão**: Criar um arquivo único de migração em `supabase/migrations/20261031200000_release_enhancements_zonas_maquinas_caldas.sql` contendo os comandos DDL idempotentes para que o usuário possa aplicar com um único comando no Supabase.

### 4. Interface de Usuário (UI)
- **Máquinas**:
  - Inclusão do campo `Volume do Tanque (Litros)` no formulário modal com `p-inputnumber` (sufixo ` L`, opcional, aceitando decimais ou inteiros positivos).
  - Inclusão da coluna `Tanque (L)` na tabela PrimeNG e inclusão no serviço de exportação Excel.
- **Caldas**:
  - Na lista de composição de insumos no modal, adicionar para cada item:
    - Campo numérico para `Volume / Massa` (`p-inputnumber` ou input numérico).
    - Campo seletor para `Unidade` com opções `kg` e `L`.
  - Exibir essas informações adicionais na visualização detalhada da calda quando preenchidas.

## Risks / Trade-offs

- **[Risco]** Carregamento assíncrono do perímetro da fazenda pode finalizar após o mapa Leaflet já estar montado.
  - **Mitigação**: `MapPolygonSelector` observará mudanças em `center` através do ciclo `ngOnChanges` e ajustará a visão do mapa via `setView()` quando o valor válido da fazenda for emitido.
- **[Risco]** Insumos de caldas e máquinas previamente gravados no banco de dados não possuem esses campos.
  - **Mitigação**: Ambas as colunas são opcionais (`null`), permitindo retrocompatibilidade total com todos os registros existentes.
- **[Risco]** Ambiguidade entre "Dose / Unidade da Dose" (ex: ml/100L) e "Volume ou Massa / Unidade" (ex: 2.5 L).
  - **Mitigação**: Rótulos e placeholders explícitos na interface gráfica diferenciando "Dose da Bula" de "Quantidade / Massa por Lote (kg ou L)".

## Migration Plan

1. Gerar e disponibilizar o arquivo `supabase/migrations/20261031200000_release_enhancements_zonas_maquinas_caldas.sql`.
2. Executar o script no banco Supabase para adicionar as colunas e constraints em `public.machines` e `public.mixture_inputs`.
3. Atualizar o documento `database.md` nos itens 15.7, 15.8, 20.13, 20.15 e 25.
4. Aplicar as alterações nos modelos, serviços, view-models e componentes Angular.
5. Executar a suíte de testes unitários para validar que não houve regressões.
