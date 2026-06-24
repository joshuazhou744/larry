// Data layer — agents, abilities, maps from valorant-api.com

const SLOT_KEY = {
  Ability1: 'C',
  Ability2: 'Q',
  Grenade: 'E',
  Ultimate: 'X',
}

const SLOT_ORDER = ['Ability1', 'Ability2', 'Grenade', 'Ultimate']

export const ROLE_COLOR = {
  Duelist: '#ff4655',
  Initiator: '#ffb020',
  Controller: '#19d3c5',
  Sentinel: '#46d27e',
}

export function roleColor(role) {
  return ROLE_COLOR[role] ?? '#9aa6b2'
}

export const MAP_ROTATIONS = {
  Ascent:   { attack: 90, defense: 270 },
  Bind:     { attack: 0,  defense: 180 },
  Haven:    { attack: 90, defense: 270 },
  Split:    { attack: 90, defense: 270 },
  Breeze:   { attack: 0,  defense: 180 },
  Fracture: { attack: 0,  defense: 0   },
  Lotus:    { attack: 0,  defense: 180 },
  Pearl:    { attack: 0,  defense: 180 },
  Sunset:   { attack: 0,  defense: 180 },
  Icebox:   { attack: 90, defense: 270 },
  Abyss:    { attack: 90, defense: 270 },
  Corrode:  { attack: 90, defense: 270 },
  Summit:   { attack: 180, defense: 0 }
}

export function getMapRotation(mapName, side) {
  return MAP_ROTATIONS[mapName]?.[side] ?? 0
}

export const LINEUP_COLORS = [
  '#19d3c5',
  '#ff4655',
  '#ffb020',
  '#46d27e',
  '#c98bff',
  '#f1f5f9',
]

const MAP_ORDER = [
  'Ascent', 'Bind', 'Haven', 'Split', 'Breeze', 'Fracture',
  'Lotus', 'Pearl', 'Sunset', 'Icebox', 'Abyss', 'Corrode',
]

export async function fetchAgents() {
  const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
  const json = await res.json()

  const agents = json.data
    .filter((a) => a.isPlayableCharacter && a.displayIcon && a.role)
    .map((a) => {
      const abilities = SLOT_ORDER.map((slot) => {
        const found = a.abilities.find((ab) => ab.slot === slot)
        if (!found || !found.displayIcon) return null
        return { slot, key: SLOT_KEY[slot], name: found.displayName ?? slot, icon: found.displayIcon }
      }).filter(Boolean)

      return {
        uuid: a.uuid,
        name: a.displayName,
        role: a.role.displayName,
        roleIcon: a.role.displayIcon,
        icon: a.displayIcon,
        abilities,
      }
    })

  agents.sort((a, b) => a.name.localeCompare(b.name))
  return agents
}

export async function fetchMaps() {
  const res = await fetch('https://valorant-api.com/v1/maps')
  const json = await res.json()

  const maps = json.data
    .filter((m) => m.tacticalDescription && m.displayIcon)
    .map((m) => ({
      uuid: m.uuid,
      name: m.displayName,
      minimap: m.displayIcon,
      thumb: m.listViewIcon ?? m.displayIcon,
      splash: m.splash ?? '',
    }))

  maps.sort((a, b) => {
    const ia = MAP_ORDER.indexOf(a.name)
    const ib = MAP_ORDER.indexOf(b.name)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
  return maps
}

export const ROLES = ['Duelist', 'Initiator', 'Controller', 'Sentinel']
