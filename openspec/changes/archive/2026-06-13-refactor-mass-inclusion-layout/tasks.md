## 1. Refatoração de Layout da Tela

- [x] 1.1 Modificar `mass-inclusion.html` para aplicar o layout de tela cheia com `aside` (320px) na esquerda e mapa na direita, removendo o componente `app-mass-inclusion-map-filters`.
- [x] 1.2 Atualizar `mass-inclusion.ts` removendo o componente `MassInclusionMapFilters` de suas importações e declarações.

## 2. Integração do Seletor de Zonas no Formulário

- [x] 2.1 Adicionar o seletor de zonas (`app-select` do Zone) no topo do arquivo `mass-inclusion-form.html` antes das ocorrências.
- [x] 2.2 Atualizar o arquivo `mass-inclusion-form.ts` para expor e manipular qualquer interação do seletor de zonas necessária pelo formulário.

## 3. Limpeza de Componentes e Testes

- [x] 3.1 Excluir o diretório obsoleto `src/app/ui/components/mass-inclusion/mass-inclusion-map-filters/`.
- [x] 3.2 Executar compilação do projeto (`npm run web:build`) e rodar testes unitários relacionados para garantir integridade e ausência de quebras.
