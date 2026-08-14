## 1. Database Contract

- [x] 1.1 Consultar o schema real de `public.zones` e `public.regions` via MCP do Supabase antes de escrever SQL.
- [x] 1.2 Definir ou ajustar a estrutura de `public.regions` para armazenar pontos do poligono da zona, incluindo vinculo com `zones` quando o banco permitir.
- [x] 1.3 Criar a RPC transacional `public.create_zone_with_regions` para validar nome, GeoJSON, vertices, inserir `zones` e inserir `regions` sem deixar persistencia parcial.
- [x] 1.4 Configurar grants, RLS ou policies necessarios para que usuarios autenticados possam executar a criacao de zona conforme o padrao do projeto.
- [x] 1.5 Atualizar `database.md` item 18 com a RPC de criacao de zona e pontos de regiao.
- [x] 1.6 Atualizar `database.md` item 20 com o processo web de cadastro de zona por poligono.
- [x] 1.7 Atualizar `database.md` item 22 com o resumo final do novo processo.
- [x] 1.8 Atualizar `database.md` item 24 com os drops/detalhes afetados pela nova tabela/RPC/policies.
- [x] 1.9 Atualizar `database.md` item 25 com o SQL consolidado de `zones`, `regions`, RPC, grants, indexes e RLS/policies.

## 2. Domain and Data Layer

- [x] 2.1 Atualizar os modelos TypeScript de `Zone` e `Region` para refletirem o contrato confirmado do banco.
- [x] 2.2 Adicionar tipos de payload e retorno para criacao de zona com pontos de regiao.
- [x] 2.3 Implementar metodo no service/repository para chamar `create_zone_with_regions`.
- [x] 2.4 Invalidar caches de referencia de `zones`, `regions` e dados de mapa apos criacao bem-sucedida.
- [x] 2.5 Tratar erros de duplicidade, poligono invalido e falhas Supabase com mensagens especificas para a camada de UI.

## 3. UI and Routing

- [x] 3.1 Adicionar a nova rota autenticada lazy-loaded para a tela de cadastro de zonas por poligono.
- [x] 3.2 Adicionar o novo item na sidebar imediatamente abaixo de `Inclusoes em Massa`.
- [x] 3.3 Criar a view seguindo o layout de `/inclusoes-em-massa`, com painel lateral a esquerda, mapa full-height a direita e botao de tela cheia.
- [x] 3.4 Reutilizar ou extrair o `MapPolygonSelector` para permitir desenho de um unico poligono fechado sem quebrar a tela de inclusoes em massa.
- [x] 3.5 Criar o painel/formulario lateral com lista de zonas existentes, nome obrigatorio e campos opcionais alinhados ao contrato de `zones`.
- [x] 3.6 Implementar o view-model com carregamento inicial, validacao de nome, validacao de poligono, estados de loading/sucesso/erro e limpeza apos sucesso.
- [x] 3.7 Garantir labels, foco visivel, alvos clicaveis adequados, contraste e estados bloqueados conforme as diretrizes de UI/UX.

## 4. Tests

- [x] 4.1 Criar testes unitarios para validacao de nome obrigatorio, nome duplicado e poligono incompleto.
- [x] 4.2 Criar testes unitarios para o view-model cobrindo carregamento de zonas, habilitacao de salvar, sucesso, erro e preservacao de estado em falha.
- [x] 4.3 Criar testes unitarios para service/repository cobrindo payload enviado a RPC, retorno de sucesso, erro Supabase e invalidacao de cache.
- [x] 4.4 Criar testes unitarios para rota/sidebar verificando a nova entrada abaixo de `Inclusoes em Massa`.
- [x] 4.5 Atualizar ou criar testes do componente de mapa se houver extracao/reuso do `MapPolygonSelector`.

## 5. Validation

- [x] 5.1 Executar TypeScript check do projeto.
- [x] 5.2 Executar lint.
- [x] 5.3 Executar testes unitarios.
- [x] 5.4 Revisar visualmente a tela em desktop e largura estreita para confirmar que painel, mapa, botoes e mensagens nao se sobrepoem.
