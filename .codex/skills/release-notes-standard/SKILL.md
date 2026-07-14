---
name: release-notes-standard
description: Generate project release notes in the established Markdown format from branch, commit, or diff comparisons. Use when the user asks for release notes, notas de release, changelog-style summaries, or a reusable release notes model for this repository.
---

# Release Notes Standard

Use this skill to generate release notes for this repository from Git comparisons.

## Workflow

1. Identify the comparison scope:
   - Prefer explicit branches from the user.
   - When the base branch is named like `release/vX.Y.Z`, use `vX.Y.Z` in the release notes title instead of the feature/fix branch name.
   - Use `git diff --stat`, `git diff --name-status`, and `git log --oneline base..target`.
   - Use the three-dot diff (`base...target`) when summarizing branch changes relative to the merge base.
   - Check `git status --short --branch` and call out uncommitted files when they are not part of the release notes.
2. Read the relevant diffs before writing:
   - Summarize behavior and user impact, not only filenames.
   - Inspect migrations, API contracts, view-models, tests, and config changes carefully.
   - For database changes, include migration and rollout implications.
3. Write the release notes in Portuguese unless the user asks otherwise.
4. Keep the output copy-ready Markdown.
5. If creating a file, place it under `release-notes/` using a descriptive lowercase branch or version name.

## Required Format

Use these sections in this order:

```markdown
# Release Notes - <versao da release comparada>

## Resumo

<1 a 2 paragrafos explicando o objetivo da release e o impacto pratico.>

## Mudancas Incluidas

### <Area funcional>

- <mudanca orientada a comportamento>
- <mudanca orientada a comportamento>

### Banco de dados Supabase

- <migration criada/alterada, RPCs, constraints, permissoes e dados afetados>

## Impacto Esperado

- <impacto para usuario, operacao, auditoria, sincronizacao ou suporte>

## Compatibilidade e Migracao

- <pre-requisitos, migrations, compatibilidade de payload/API, rollback quando relevante>

## Validacao

- <testes existentes ou atualizados>
- <validacoes manuais recomendadas>

## Arquivos Alterados

- `<arquivo>`
```

Omit `### Banco de dados Supabase` only when there is no database or Supabase change.

## Style Rules

- Prefer concise Portuguese.
- Use ASCII unless the target file already uses accents consistently.
- Avoid marketing tone.
- Avoid duplicating every implementation detail from the diff.
- Mention risks or rollout requirements explicitly.
- Distinguish verified facts from recommendations.
- Do not include uncommitted changes unless the user asks to include the working tree.
- Do not include an `Escopo` section.
