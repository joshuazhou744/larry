import { supabase, supabaseReady } from './supabase'

function fromRow(row) {
  return {
    id: row.id,
    mapId: row.map_id,
    side: row.side,
    agentId: row.agent_id,
    agentName: row.agent_name,
    agentIcon: row.agent_icon,
    abilitySlot: row.ability_slot,
    abilityName: row.ability_name,
    abilityIcon: row.ability_icon,
    stand: row.stand,
    land: row.land,
    title: row.title,
    notes: row.notes,
    color: row.color,
    locked: row.locked ?? false,
  }
}

const SCREENSHOT_BUCKET = 'lineup-screenshots'

function getPublicUrl(path) {
  const { data } = supabase.storage.from(SCREENSHOT_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function fetchImages(lineupId) {
  if (!supabaseReady) return []
  const { data, error } = await supabase
    .from('lineup_images')
    .select('*')
    .eq('lineup_id', lineupId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map(row => ({
    id: row.id,
    lineupId: row.lineup_id,
    storagePath: row.storage_path,
    publicUrl: getPublicUrl(row.storage_path),
    annotations: row.annotations ?? [],
    boxes: row.boxes ?? [],
    sortOrder: row.sort_order,
  }))
}

export async function dbFetchLineups() {
  if (!supabaseReady) return []
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(fromRow)
}
