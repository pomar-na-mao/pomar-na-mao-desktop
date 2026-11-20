# Inventário pré-migração de `user_roles`

Somente contagens agregadas são registradas neste documento; nenhum identificador, e-mail ou token é persistido.

| Tenant | Projeto Supabase | `admin` | `user` | Outros | Estado |
| --- | --- | ---: | ---: | ---: | --- |
| Hass Avocado | `uxschjkypkkzprbwuhxm` | 1 | 2 | 0 | Migration aplicada e verificada via MCP em 2026-11-16 |
| Ricardo Lichia | `cumkqrjwsbyotaojeyxv` | 6 | 0 | 0 | Migration aplicada e verificada pelo operador em 2026-11-16 |
| Ricardo Abacate | `hopjwluxjyhfovwylmok` | 2 | 0 | 0 | Migration aplicada e verificada pelo operador em 2026-11-16 |

Consulta usada:

```sql
select role, count(*)::bigint as user_count
from public.user_roles
group by role
order by role;
```

Verificação pós-migração de Hass Avocado: default `'user'::text`, constraint `user_roles_role_check` aceitando somente `admin`/`user`, contagens preservadas e política SELECT existente `User can read their role` com expressão `auth.uid() = user_id`.

Verificação pós-migração de Ricardo Lichia: default `'user'::text`, constraint `user_roles_role_check`, 6 administradores, nenhum papel inválido e política SELECT `User can read their role` limitada por `auth.uid() = user_id`.

Verificação pós-migração de Ricardo Abacate: default `'user'::text`, constraint `user_roles_role_check`, 2 administradores e nenhum papel inválido. Existem duas políticas SELECT semanticamente equivalentes (`User can read their role` e `Users can view own roles`), ambas limitadas por `auth.uid() = user_id`; a redundância não amplia acesso.
