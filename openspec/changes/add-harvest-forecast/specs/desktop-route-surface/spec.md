# Spec Delta

## ADDED Requirements

### Requirement: Harvest forecast route is available in the desktop menu

O desktop SHALL disponibilizar a tela **Previsão de Safra** em `/previsao-de-safra` dentro do layout autenticado.

#### Scenario: Usuário autenticado seleciona a entrada do menu

- **WHEN** o usuário seleciona **Previsão de Safra** no menu lateral
- **THEN** o aplicativo MUST navegar para `/previsao-de-safra` e renderizar a tela no layout principal.

#### Scenario: Usuário sem sessão acessa o endereço diretamente

- **WHEN** o usuário acessa `/previsao-de-safra` sem uma sessão válida
- **THEN** o aplicativo MUST aplicar a proteção das demais rotas autenticadas.
