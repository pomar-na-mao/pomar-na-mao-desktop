-- Home Dashboard Stats Query
-- Retorna em uma única chamada todos os dados necessários
-- para os componentes: app-total-plants, app-orchard-vigor e app-progress-card.
--
-- Pode ser executada diretamente no Supabase SQL Editor.
--
-- Campos retornados:
--   total_plants     → total de plantas cadastradas
--   alive_plants     → plantas vivas (is_dead = false)
--   updated_plants   → plantas que já passaram por inspeção (updated_at IS NOT NULL)
--   latest_updated_at → data/hora da inspeção mais recente

SELECT
  COUNT(*)                                             AS total_plants,
  COUNT(*) FILTER (WHERE is_dead = false)              AS alive_plants,
  COUNT(*) FILTER (WHERE updated_at IS NOT NULL)       AS updated_plants,
  MAX(updated_at)                                      AS latest_updated_at
FROM plants;
