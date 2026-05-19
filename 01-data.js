// ── DATA ──────────────────────────────────────────────────────────────────────
const CLASSES = [
  {name:'Warrior', color:'#C79C6E'},
  {name:'Paladin', color:'#F58CBA'},
  {name:'Hunter',  color:'#ABD473'},
  {name:'Rogue',   color:'#e8e020'},
  {name:'Priest',  color:'#c8c8c8'},
  {name:'Shaman',  color:'#0090ff'},
  {name:'Mage',    color:'#69CCF0'},
  {name:'Warlock', color:'#9482C9'},
  {name:'Druid',   color:'#FF7D0A'},
];
const CM = {};
CLASSES.forEach(c => CM[c.name] = c);

// Official TBC spec icons from Blizzard CDN
const BASE = 'https://wow.zamimg.com/images/wow/icons/medium/';
const SPEC_ICONS = {
  // Warrior
  'Warrior:Arms':         BASE+'ability_warrior_savageblow.jpg',
  'Warrior:Fury':         BASE+'ability_warrior_innerrage.jpg',
  'Warrior:Protection':   BASE+'ability_warrior_defensivestance.jpg',
  // Paladin
  'Paladin:Holy':         BASE+'spell_holy_holybolt.jpg',
  'Paladin:Protection':   BASE+'spell_holy_devotionaura.jpg',
  'Paladin:Retribution':  BASE+'spell_holy_auraoflight.jpg',
  // Hunter
  'Hunter:Beast Mastery': BASE+'ability_hunter_beasttaming.jpg',
  'Hunter:Marksmanship':  BASE+'ability_marksmanship.jpg',
  'Hunter:Survival':      BASE+'ability_hunter_swiftstrike.jpg',
  // Rogue
  'Rogue:Assassination':  BASE+'ability_rogue_eviscerate.jpg',
  'Rogue:Combat':         BASE+'ability_backstab.jpg',
  'Rogue:Subtlety':       BASE+'ability_stealth.jpg',
  // Priest
  'Priest:Discipline':    BASE+'spell_holy_wordfortitude.jpg',
  'Priest:Holy':          BASE+'spell_holy_guardianspirit.jpg',
  'Priest:Shadow':        BASE+'spell_shadow_shadowwordpain.jpg',
  // Shaman
  'Shaman:Elemental':     BASE+'spell_nature_lightning.jpg',
  'Shaman:Enhancement':   BASE+'spell_nature_lightningshield.jpg',
  'Shaman:Restoration':   BASE+'spell_nature_magicimmunity.jpg',
  // Mage
  'Mage:Arcane':          BASE+'spell_holy_magicalsentry.jpg',
  'Mage:Fire':            BASE+'spell_fire_firebolt02.jpg',
  'Mage:Frost':           BASE+'spell_frost_frostbolt02.jpg',
  // Warlock
  'Warlock:Affliction':   BASE+'spell_shadow_deathcoil.jpg',
  'Warlock:Demonology':   BASE+'spell_shadow_metamorphosis.jpg',
  'Warlock:Destruction':  BASE+'spell_shadow_rainoffire.jpg',
  // Druid
  'Druid:Balance':        BASE+'spell_nature_starfall.jpg',
  'Druid:Feral':          BASE+'ability_druid_catform.jpg',
  'Druid:Feral Combat':   BASE+'ability_druid_catform.jpg',
  'Druid:Feral Tank':     BASE+'ability_racial_bearform.jpg',
  'Druid:Restoration':    BASE+'spell_nature_healingtouch.jpg',
};

// Canonical TBC specs per class (used for Ideal Roster & Recruitment)
const CLASS_SPECS = {
  Warrior:  ['Arms', 'Fury', 'Protection'],
  Paladin:  ['Holy', 'Protection', 'Retribution'],
  Hunter:   ['Beast Mastery', 'Marksmanship', 'Survival'],
  Rogue:    ['Assassination', 'Combat', 'Subtlety'],
  Priest:   ['Discipline', 'Holy', 'Shadow'],
  Shaman:   ['Elemental', 'Enhancement', 'Restoration'],
  Mage:     ['Arcane', 'Fire', 'Frost'],
  Warlock:  ['Affliction', 'Demonology', 'Destruction'],
  Druid:    ['Balance', 'Feral Combat', 'Feral Tank', 'Restoration'],
};

// Shorthand aliases → canonical names (for matching member specs to icons)
const SPEC_ALIASES = {};

// Class fallback icons (no spec)

// Class fallback icons (no spec)
const CLASS_ICONS = {
  'Warrior': BASE+'ability_warrior_savageblow.jpg',
  'Paladin': BASE+'spell_holy_holybolt.jpg',
  'Hunter':  BASE+'ability_hunter_beasttaming.jpg',
  'Rogue':   BASE+'ability_backstab.jpg',
  'Priest':  BASE+'spell_holy_guardianspirit.jpg',
  'Shaman':  BASE+'spell_nature_lightning.jpg',
  'Mage':    BASE+'spell_frost_frostbolt02.jpg',
  'Warlock': BASE+'spell_shadow_rainoffire.jpg',
  'Druid':   BASE+'spell_nature_starfall.jpg',
};

function canonicalSpec(cls, spec) {
  if (!spec) return null;
  // Try direct match first
  const direct = cls + ':' + spec;
  if (SPEC_ICONS[direct]) return spec;
  // Try alias
  const alias = SPEC_ALIASES[spec.toLowerCase()];
  if (alias && SPEC_ICONS[cls + ':' + alias]) return alias;
  return spec;
}

function specIcon(cls, spec) {
  if (spec) {
    const canonical = canonicalSpec(cls, spec);
    const key = cls + ':' + canonical;
    if (SPEC_ICONS[key]) return SPEC_ICONS[key];
    // fallback: try original
    if (SPEC_ICONS[cls + ':' + spec]) return SPEC_ICONS[cls + ':' + spec];
  }
  return CLASS_ICONS[cls] || BASE+'inv_misc_questionmark.jpg';
}

function clsBg(cls) {
  const c = CM[cls];
  if (!c) return 'rgba(128,128,128,0.15)';
  const h = c.color;
  const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},0.15)`;
}

const DEFAULT_MEMBERS = [
  {id:1,  name:'Rokkr',        cls:'Warrior', spec:'Protection',   rank:'Member', notes:''},
  {id:2,  name:'Orcuspine',    cls:'Warrior', spec:'Fury',         rank:'Member', notes:'OS: Protection'},
  {id:3,  name:'Buckstar',     cls:'Warrior', spec:'Fury',         rank:'Member', notes:'OS: Protection'},
  {id:4,  name:'Bloodgrin',    cls:'Warrior', spec:'Fury',         rank:'Member', notes:'OS: Protection'},
  {id:5,  name:'Bhalldos',     cls:'Warlock', spec:'Destruction',  rank:'Member', notes:''},
  {id:6,  name:'Yelinde',      cls:'Warlock', spec:'Destruction',  rank:'Member', notes:''},
  {id:7,  name:'Moolock',      cls:'Warlock', spec:'Affliction',   rank:'Member', notes:''},
  {id:8,  name:'Orcstronaunt', cls:'Shaman',  spec:'Restoration',  rank:'Member', notes:'OS: Enhancement'},
  {id:9,  name:'Xiolora',      cls:'Shaman',  spec:'Restoration',  rank:'Member', notes:'OS: Enhancement'},
  {id:10, name:'Vasj',         cls:'Shaman',  spec:'Enhancement',  rank:'Member', notes:'OS: Restoration'},
  {id:11, name:'Elsjaman',     cls:'Shaman',  spec:'Elemental',    rank:'Member', notes:''},
  {id:12, name:'Mentet',       cls:'Rogue',   spec:'Combat',       rank:'Member', notes:''},
  {id:13, name:'Dorey',        cls:'Rogue',   spec:'Combat',       rank:'Member', notes:''},
  {id:14, name:'Darkp',        cls:'Priest',  spec:'Holy',         rank:'Member', notes:''},
  {id:15, name:'Astradamus',   cls:'Priest',  spec:'Shadow',       rank:'Member', notes:'OS: Holy'},
  {id:16, name:'Lorric',       cls:'Paladin', spec:'Retribution',  rank:'Member', notes:'OS: Holy'},
  {id:17, name:'Tynck',        cls:'Paladin', spec:'Holy',         rank:'Member', notes:''},
  {id:18, name:'Hemoroidz',    cls:'Paladin', spec:'Holy',         rank:'Member', notes:'OS: Protection'},
  {id:19, name:'Holyhavoc',    cls:'Paladin', spec:'Protection',   rank:'Member', notes:'OS: Retribution'},
  {id:20, name:'Brian',        cls:'Mage',    spec:'Frost',        rank:'Member', notes:''},
  {id:21, name:'Loimu',        cls:'Mage',    spec:'Frost',        rank:'Member', notes:''},
  {id:22, name:'Mereel',       cls:'Mage',    spec:'Frost',        rank:'Member', notes:''},
  {id:23, name:'Tryllebue',    cls:'Hunter',  spec:'Beast Mastery',rank:'Member', notes:''},
  {id:24, name:'Cuppatea',     cls:'Hunter',  spec:'Survival',     rank:'Member', notes:''},
  {id:25, name:'Bowhard',      cls:'Hunter',  spec:'Beast Mastery',rank:'Member', notes:''},
  {id:26, name:'Johnpaw',      cls:'Druid',   spec:'Feral Combat', rank:'Member', notes:'OS: Balance'},
  {id:27, name:'Fanmoo',       cls:'Druid',   spec:'Balance',      rank:'Member', notes:'OS: Restoration'},
];

const DEFAULT_IDEAL = {};

// 8 groups × 5 slots each
const DEFAULT_GROUPS = Array.from({length:8}, () => Array(5).fill(null));

function migrateMembers(arr) {
  return arr.map(m => {
    let spec = m.cls && m.spec ? (canonicalSpec(m.cls, m.spec) || m.spec) : (m.spec || '');
    // Migrate bare "Feral" druid to "Feral Combat"
    if (m.cls === 'Druid' && spec === 'Feral') spec = 'Feral Combat';
    return { ...m, spec };
  });
}

function load() {
  try {
    const rawMembers = JSON.parse(localStorage.getItem('gm_members')) || DEFAULT_MEMBERS;
    return {
      members: migrateMembers(rawMembers),
      ideal:   JSON.parse(localStorage.getItem('gm_ideal'))   || DEFAULT_IDEAL,
      groups:  JSON.parse(localStorage.getItem('gm_groups'))  || DEFAULT_GROUPS,
      nextId:  parseInt(localStorage.getItem('gm_nextId'))    || 28,
    };
  } catch(e) {
    return { members: DEFAULT_MEMBERS, ideal: DEFAULT_IDEAL, groups: DEFAULT_GROUPS, nextId: 28 };
  }
}

let { members, ideal, groups, nextId } = load();
// Save migrated members back immediately
localStorage.setItem('gm_members', JSON.stringify(members));

function save() {
  localStorage.setItem('gm_members', JSON.stringify(members));
  localStorage.setItem('gm_ideal',   JSON.stringify(ideal));
  localStorage.setItem('gm_groups',  JSON.stringify(groups));
  localStorage.setItem('gm_nextId',  nextId);
  cloudSaveMembers();
  cloudSaveIdeal();
  cloudSaveGroups();
}
