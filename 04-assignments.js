// ══════════════════════════════════════════════════════════
// ASSIGNMENT PLANNER

const IMG_BG_GRUUL = "assets/image_03.jpg";
const IMG_BG_HIGHKING = "assets/image_04.jpg";
const IMG_BG_MAGTHERIDON = "assets/image_05.jpg";
const IMG_BOSS_9865 = "assets/image_06.png";
const IMG_BOSS_11585 = "assets/image_07.png";
const IMG_BOSS_12472 = "assets/image_08.png";
const IMG_BOSS_18527 = "assets/image_09.png";
const IMG_BOSS_18649 = "assets/image_10.png";
const IMG_BOSS_18698 = "assets/image_11.png";
const IMG_BOSS_20194 = "assets/image_12.png";
const IMG_BOSS_20195 = "assets/image_13.png";

// SSC backgrounds
const IMG_BG_HYDROSS    = "assets/hydros.png";
const IMG_BG_LURKER     = "assets/lurker.png";
const IMG_BG_LEOTHERAS  = "assets/leotheras.png";
const IMG_BG_KARATHRESS = "assets/fathom.png";
const IMG_BG_MOROGRIM   = "assets/morogrim.png";
const IMG_BG_VASHJ      = "assets/vashj.png";
// TK backgrounds
const IMG_BG_ALAR       = "assets/alar.png";
const IMG_BG_VOIDREAVER = "assets/voidreaver.png";
const IMG_BG_SOLARIAN   = "assets/solarian.png";
const IMG_BG_KAELTHAS   = "assets/sunstrider.png";

// SSC boss/add icons
const IMG_BOSS_20023 = "assets/20023.png";   // Kael'thas Sunstrider
const IMG_BOSS_20162 = "assets/20162.png";   // Hydross the Unstable
const IMG_BOSS_20236 = "assets/20236.png";   // Master Engineer Telonicus (Kael'thas advisor)
const IMG_BOSS_20237 = "assets/20237.png";   // Grand Astromancer Capernian (Kael'thas advisor)
const IMG_BOSS_20177 = "assets/20177.png";   // Thaladred the Darkener (Kael'thas advisor)
const IMG_BOSS_20178 = "assets/20178.png";   // Master Engineer Telonicus (Kael'thas advisor)
const IMG_BOSS_20216 = "assets/20216.png";   // The Lurker Below
const IMG_BOSS_LURKER_NAGA = "assets/lurker_naga.png";  // Lurker Naga
const IMG_BOSS_20514 = "assets/20514.png";   // Leotheras the Blind
const IMG_BOSS_20568 = "assets/20568.png";   // Shadow of Leotheras
const IMG_BOSS_20662 = "assets/20662.png";   // Fathom-Lord Karathress
const IMG_BOSS_20670 = "assets/20670.png";   // Fathom-Guard Tidalvess (Karathress add)
const IMG_BOSS_20671 = "assets/20671.png";   // Fathom-Guard Sharkkis (Karathress add)
const IMG_BOSS_20672 = "assets/20672.png";   // Fathom-Guard Caribdis (Karathress add)
const IMG_BOSS_20739 = "assets/20739.png";   // Morogrim Tidewalker
const IMG_BOSS_20748 = "assets/20748.png";   // Lady Vashj
// TK boss/add icons
const IMG_BOSS_18239 = "assets/18239.png";   // High Astromancer Solarian
const IMG_BOSS_18945 = "assets/18945.png";   // Al'ar
const IMG_BOSS_18951 = "assets/18951.png";   // Void Reaver

const MARKER_ICONS = {
  star: "assets/image_14.png",
  circle: "assets/image_15.png",
  diamond: "assets/image_16.png",
  triangle: "assets/image_17.png",
  moon: "assets/image_18.png",
  square: "assets/image_19.png",
  cross: "assets/image_20.png",
  skull: "assets/image_21.png",
  tank: "assets/image_22.svg",
  healer: "assets/image_23.svg",
  mdps: "assets/image_24.svg",
  rdps: "assets/image_25.svg",
  misdirection: "https://wow.zamimg.com/images/wow/icons/medium/ability_hunter_misdirection.jpg"
};

const RAIDS = [
  {
    id: 'gruuls_lair',
    name: "Gruul's Lair",
    encounters: [
      { id: 'gruul', name: 'Gruul the Dragonkiller', bg: 'IMG_BG_GRUUL' },
      { id: 'highking', name: 'High King Maulgar', bg: 'IMG_BG_HIGHKING' },
    ]
  },
  {
    id: 'magtheridon_lair',
    name: "Magtheridon's Lair",
    encounters: [
      { id: 'magtheridon', name: 'Magtheridon', bg: 'IMG_BG_MAGTHERIDON' },
    ]
  },
  {
    id: 'serpentshrine_cavern',
    name: "Serpentshrine Cavern",
    encounters: [
      { id: 'hydross',    name: 'Hydross the Unstable',     bg: 'IMG_BG_HYDROSS'    },
      { id: 'lurker',     name: 'The Lurker Below',         bg: 'IMG_BG_LURKER'     },
      { id: 'leotheras',  name: 'Leotheras the Blind',      bg: 'IMG_BG_LEOTHERAS'  },
      { id: 'karathress', name: 'Fathom-Lord Karathress',   bg: 'IMG_BG_KARATHRESS' },
      { id: 'morogrim',   name: 'Morogrim Tidewalker',      bg: 'IMG_BG_MOROGRIM'   },
      { id: 'vashj',      name: "Lady Vashj",               bg: 'IMG_BG_VASHJ'      },
    ]
  },
  {
    id: 'the_eye',
    name: "The Eye (Tempest Keep)",
    encounters: [
      { id: 'alar',       name: "Al'ar",                    bg: 'IMG_BG_ALAR'       },
      { id: 'voidreaver', name: 'Void Reaver',              bg: 'IMG_BG_VOIDREAVER' },
      { id: 'solarian',   name: 'High Astromancer Solarian',bg: 'IMG_BG_SOLARIAN'   },
      { id: 'kaelthas',   name: "Kael'thas Sunstrider",     bg: 'IMG_BG_KAELTHAS'   },
    ]
  },
];

// Map encounter id -> background image data
const ENCOUNTER_BG = {
  gruul:       IMG_BG_GRUUL,
  highking:    IMG_BG_HIGHKING,
  magtheridon: IMG_BG_MAGTHERIDON,
  // SSC
  hydross:     IMG_BG_HYDROSS,
  lurker:      IMG_BG_LURKER,
  leotheras:   IMG_BG_LEOTHERAS,
  karathress:  IMG_BG_KARATHRESS,
  morogrim:    IMG_BG_MOROGRIM,
  vashj:       IMG_BG_VASHJ,
  // TK
  alar:        IMG_BG_ALAR,
  voidreaver:  IMG_BG_VOIDREAVER,
  solarian:    IMG_BG_SOLARIAN,
  kaelthas:    IMG_BG_KAELTHAS,
};

const BOSS_ICONS_DATA = {
  '9865':  IMG_BOSS_9865,
  '11585': IMG_BOSS_11585,
  '12472': IMG_BOSS_12472,
  '18527': IMG_BOSS_18527,
  '18649': IMG_BOSS_18649,
  '18698': IMG_BOSS_18698,
  '20194': IMG_BOSS_20194,
  '20195': IMG_BOSS_20195,
  // SSC
  '20023': IMG_BOSS_20023,
  '20162': IMG_BOSS_20162,
  '20236': IMG_BOSS_20236,
  '20237': IMG_BOSS_20237,
  '20177': IMG_BOSS_20177,
  '20178': IMG_BOSS_20178,
  '20216': IMG_BOSS_20216,
  'lurker_naga': IMG_BOSS_LURKER_NAGA,
  '20514': IMG_BOSS_20514,
  '20568': IMG_BOSS_20568,
  '20662': IMG_BOSS_20662,
  '20670': IMG_BOSS_20670,
  '20671': IMG_BOSS_20671,
  '20672': IMG_BOSS_20672,
  '20739': IMG_BOSS_20739,
  '20748': IMG_BOSS_20748,
  // TK
  '18239': IMG_BOSS_18239,
  '18945': IMG_BOSS_18945,
  '18951': IMG_BOSS_18951,
};

const BOSS_ICON_NAMES = {
  '9865':  'Channeler',
  '11585': 'Blindeye',
  '12472': 'Olm',
  '18527': 'Magtheridon',
  '18649': 'Maulgar',
  '18698': 'Gruul',
  '20194': 'Kiggler',
  '20195': 'Krosh',
  // SSC
  '20162': 'Hydross the Unstable',
  '20216': 'The Lurker Below',
  'lurker_naga': 'Lurker Naga',
  '20514': 'Leotheras the Blind',
  '20568': 'Shadow of Leotheras',
  '20662': 'Fathom-Lord Karathress',
  '20670': 'Fathom-Guard Tidalvess',
  '20671': 'Fathom-Guard Sharkkis',
  '20672': 'Fathom-Guard Caribdis',
  '20739': 'Morogrim Tidewalker',
  '20748': 'Lady Vashj',
  // TK
  '18945': "Al'ar",
  '18951': 'Void Reaver',
  '18239': 'High Astromancer Solarian',
  '20023': "Kael'thas Sunstrider",
  '20177': 'Thaladred the Darkener',
  '20178': 'Master Engineer Telonicus',
  '20236': 'Master Engineer Telonicus',
  '20237': 'Grand Astromancer Capernian',
};

// Which boss icons show for each encounter
const ENCOUNTER_BOSS_ICONS = {
  highking:    ['11585','12472','18649','20194','20195'],
  gruul:       ['18698'],
  magtheridon: ['18527','9865'],
  // SSC
  hydross:     ['20162'],                              // Hydross the Unstable
  lurker:      ['20216','lurker_naga'],               // The Lurker Below, Lurker Naga
  leotheras:   ['20514','20568'],                      // Leotheras the Blind, Shadow of Leotheras
  karathress:  ['20662','20670','20671','20672'],       // Fathom-Lord Karathress + 3 guards
  morogrim:    ['20739'],                              // Morogrim Tidewalker
  vashj:       ['20748'],                              // Lady Vashj
  // TK
  alar:        ['18945'],                              // Al'ar
  voidreaver:  ['18951'],                              // Void Reaver
  solarian:    ['18239'],                              // High Astromancer Solarian
  kaelthas:    ['20023','20177','20178','20236','20237'], // Kael'thas Sunstrider + Thaladred, Telonicus, Master Engineer, Capernian
};

// ── State ──────────────────────────────────────────────────
let assignInited = false;
let aCanvas, aCtx;
let canvasW = 900, canvasH = 506;
let _pendingRescaleW = null, _pendingRescaleH = null;  // saved canvas size from last loadPlan call

let currentEncounterId = 'gruul';
let currentEncounterName = 'Gruul the Dragonkiller';
let currentPlanId = null;
let activeTool = 'select';
let arrowColor = '#ffffff';

// Plan data: { id, name, bossName, elements: [...] }
// Element types: token, marker, bossicon, arrow, text
let assignPlans = {}; // key: planId -> plan obj
let nextPlanId = 1;
let nextElemId = 1;

// Canvas state
let elements = []; // current plan elements
let selectedId = null;
let draggingId = null;
let dragOffX = 0, dragOffY = 0;
let arrowDragHandle = null; // null | "tail" | "head"
let arrowStart = null;
let bgImage = null;
let bgLoaded = false;
let undoStack = [];

// Preloaded images cache
const imgCache = {};

function loadImg(src) {
  if (imgCache[src]) return imgCache[src];
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imgCache[src] = img;
  return img;
}

// ── Init ──────────────────────────────────────────────────
function initAssign() {
  if (!assignInited) {
    assignInited = true;
    // Load saved data
    try {
      const sd = JSON.parse(localStorage.getItem('gm_assign') || '{}');
      assignPlans = sd.plans || {};
      nextPlanId = sd.nextPlanId || 1;
      nextElemId = sd.nextElemId || 1;
    } catch(e) {}
  }

  aCanvas = document.getElementById('assign-canvas');
  aCtx = aCanvas.getContext('2d');
  const wrap = document.getElementById('assign-canvas-wrap');
  const rect = wrap.getBoundingClientRect();
  canvasW = rect.width || 900;
  canvasH = rect.height || 506;
  aCanvas.width = canvasW;
  aCanvas.height = canvasH;
  aCanvas.style.position = 'absolute';
  aCanvas.style.left = '0px';
  aCanvas.style.top = '0px';

  // Attach events
  aCanvas.onmousedown = onCanvasMouseDown;
  aCanvas.onmousemove = onCanvasMouseMove;
  aCanvas.onmouseup = onCanvasMouseUp;
  aCanvas.ondblclick = onCanvasDblClick;

  // Attach drop on canvas wrap
  const wrap2 = document.getElementById('assign-canvas-wrap');
  if (wrap2) {
    wrap2.ondragover = e => e.preventDefault();
    wrap2.ondrop = e => aCanvasDropHandler(e);
  }

  setTool('select');
  renderAssignMemberList();
  renderMarkerPalette();
  renderBossIconPalette();
  renderPlansLibrary();
  updateCurrentPlanBar();
  if (currentPlanId && assignPlans[currentPlanId]) {
    loadPlan(currentPlanId);
  } else {
    currentPlanId = null;
    bgImage = null;
    bgLoaded = false;
    renderCanvas();
    renderSpecialAssignments();
  }
}

async function saveAssignData() {
  const assignData = { plans: assignPlans, nextPlanId, nextElemId };
  localStorage.setItem('gm_assign', JSON.stringify(assignData));
  await cloudSaveAssign(assignData);
}

// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// SPECIAL ASSIGNMENTS PANEL  — icon + player + text model
// ══════════════════════════════════════════════════════════

const BASE_ICON = 'https://wow.zamimg.com/images/wow/icons/medium/';
const SA_ICONS = {
  // Druid
  'Innervate':      'spell_nature_lightning',
  'Faerie Fire':    'spell_nature_faeriefire',
  'Abolish Poison': 'spell_nature_nullifypoison',
  'Insect Swarm':   'spell_nature_insectswarm',
  // Hunter
  'MD':             'ability_hunter_misdirection',
  'Frost Trap':     'spell_frost_freezingbreath',
  'Freezing Trap':  'spell_frost_chainsofice',
  // Mage
  'Sheep':          'spell_nature_polymorph',
  'CS':             'spell_frost_iceshock',
  // Paladin
  'HoJ':            'spell_holy_sealofmight',
  // Priest
  'Fear Ward':      'spell_holy_prayerofprotection',
  'Silence':        'spell_shadow_impphaseshift',
  // Rogue
  'Kick':           'ability_kick',
  'Kidney Shot':    'ability_rogue_kidneyshot',
  // Shaman
  'Earth Shock':    'spell_nature_earthshock',
  // Warrior
  'Disarm':         'ability_warrior_disarm',
  'Pummel':         'inv_gauntlets_04',
  // Warlock
  'CoT':            'spell_shadow_curseoftounges',
  'CoR':            'spell_shadow_unholyfrenzy',
  'CoS/CoShadow':   'spell_shadow_curseofachimonde',
  'Searing Pain':   'spell_fire_soulburn',
};

const SA_SECTION_DEFS = [
  { role: 'tank',   label: 'Tanks',      color: '#4fc3f7' },
  { role: 'healer', label: 'Healers',    color: '#81c784' },
  { role: 'mdps',   label: 'Melee DPS',  color: '#f06292' },
  { role: 'rdps',   label: 'Ranged DPS', color: '#ffb74d' },
];

let saNextRowId = 1;

function saGetOrInitSections() {
  if (!currentPlanId || !assignPlans[currentPlanId]) return null;
  const plan = assignPlans[currentPlanId];
  if (!plan.specialAssignments || !Array.isArray(plan.specialAssignments.sections)) {
    plan.specialAssignments = {
      sections: SA_SECTION_DEFS.map(def => ({ role: def.role, collapsed: false, rows: [] }))
    };
  }
  // Ensure all 4 sections exist (backward compat)
  SA_SECTION_DEFS.forEach(def => {
    if (!plan.specialAssignments.sections.find(s => s.role === def.role)) {
      plan.specialAssignments.sections.push({ role: def.role, collapsed: false, rows: [] });
    }
  });
  return plan.specialAssignments.sections;
}

function saRowLabel(role, idx) {
  if (role === 'tank')   return idx === 0 ? 'MT' : 'OT' + idx;
  if (role === 'healer') return 'HE' + (idx + 1);
  if (role === 'mdps')   return 'M' + (idx + 1);
  if (role === 'rdps')   return 'R' + (idx + 1);
  return '' + (idx + 1);
}

function renderSpecialAssignments() {
  const body = document.getElementById('sa-body');
  if (!body) return;

  if (!currentPlanId || !assignPlans[currentPlanId]) {
    body.innerHTML = '<div class="sa-empty-state">Select or create a plan<br>to set up special assignments.</div>';
    return;
  }

  const sections = saGetOrInitSections();
  let html = '';

  // Icon palette — flat list, all kept icons
  const SA_ICON_GROUPS = [
    { icons: ['Innervate','Faerie Fire','Abolish Poison','Insect Swarm',
               'MD','Frost Trap','Freezing Trap',
               'Sheep','CS',
               'HoJ',
               'Fear Ward','Silence',
               'Kick','Kidney Shot',
               'Earth Shock',
               'Disarm','Pummel',
               'CoT','CoR','CoS/CoShadow','Searing Pain'] },
  ];

  html += '<div class="sa-icon-palette" id="sa-icon-palette">';
  SA_ICON_GROUPS.forEach(group => {
    group.icons.forEach(name => {
      if (!SA_ICONS[name]) return;
      const safeId = 'sa-chip-' + name.replace(/[^a-zA-Z0-9]/g,'_');
      html += `<div class="sa-icon-chip" draggable="true" id="${safeId}" data-icon-name="${name}" title="${name}">
        <img src="${BASE_ICON}${SA_ICONS[name]}.jpg" onerror="this.src='${BASE_ICON}inv_misc_questionmark.jpg'" alt="${name}" draggable="false" style="pointer-events:none">
      </div>`;
    });
  });
  // Raid marker icons (base64 inline)
  const SA_MARKER_LABELS = {star:'Star',circle:'Circle',diamond:'Diamond',triangle:'Triangle',moon:'Moon',square:'Square',cross:'Cross',skull:'Skull',tank:'Tank',healer:'Healer',mdps:'Melee',rdps:'Ranged'};
  for (const [key, label] of Object.entries(SA_MARKER_LABELS)) {
    if (!MARKER_ICONS[key]) continue;
    html += `<div class="sa-icon-chip" draggable="true" id="sa-chip-marker_${key}" data-icon-name="__marker__${key}" title="${label}">
      <img src="${MARKER_ICONS[key]}" alt="${label}" draggable="false" style="pointer-events:none">
    </div>`;
  }
  html += '</div>';

  // Sections
  sections.forEach((sec, si) => {
    const def = SA_SECTION_DEFS.find(d => d.role === sec.role) || SA_SECTION_DEFS[0];
    const collapsed = sec.collapsed;
    html += `<div class="sa-section">
      <div class="sa-section-header" onclick="saToggleSection(${si})" style="color:${def.color}">
        <span style="flex:1">${def.label} <span style="color:var(--text3);font-weight:400;font-family:'Exo 2',sans-serif">(${sec.rows.length})</span></span>
        <span style="font-size:8px;color:var(--text3)">${collapsed ? '\u25B6' : '\u25BC'}</span>
      </div>`;

    if (!collapsed) {
      html += '<div class="sa-section-body">';
      sec.rows.forEach((row, ri) => {
        const lbl = saRowLabel(sec.role, ri);
        const m = row.memberId ? members.find(x => x.id === row.memberId) : null;
        const nameColor = m ? ((CM[m.cls]||{}).color || 'var(--text)') : 'var(--text2)';
        const icons = row.icons || [];

        const iconHint = icons.length === 0 ? '<span class="sa-row-icon-hint">drop icons here</span>' : '';
        let iconSlots = icons.map((ic, ii) => {
          let imgSrc;
          if (ic.startsWith('__marker__')) {
            const mkey = ic.replace('__marker__', '');
            imgSrc = MARKER_ICONS[mkey] || (BASE_ICON + 'inv_misc_questionmark.jpg');
          } else {
            const iconFile = SA_ICONS[ic] || 'inv_misc_questionmark';
            imgSrc = BASE_ICON + iconFile + '.jpg';
          }
          return `<div class="sa-row-icon" title="${ic.replace('__marker__','')} — click to remove" onclick="saRemoveIcon(${si},${ri},${ii})">
            <img src="${imgSrc}" draggable="false" style="pointer-events:none">
          </div>`;
        }).join('');

        html += `<div class="sa-assign-row">
          <div class="sa-row-top">
            <div class="sa-row-label">${lbl}</div>
            <div class="sa-row-player" id="sa-pslot-${si}-${ri}" style="color:${nameColor}"
              ondragover="event.preventDefault();document.getElementById('sa-pslot-${si}-${ri}').classList.add('sa-drop-over')"
              ondragleave="document.getElementById('sa-pslot-${si}-${ri}').classList.remove('sa-drop-over')"
              ondrop="saOnPlayerDrop(event,${si},${ri})"
              title="Drop player to replace">${row.memberName || '\u2014'}</div>
            <input class="sa-row-text" value="${(row.text||'').replace(/"/g,'&quot;')}"
              placeholder="notes..."
              onchange="saSetRowText(${si},${ri},this.value)"
              onblur="saSetRowText(${si},${ri},this.value)">
            <button class="sa-row-del" onclick="saDeleteRow(${si},${ri})" title="Remove">\u2715</button>
          </div>
          <div class="sa-row-icons" id="sa-icons-wrap-${si}-${ri}"
            ondragover="event.preventDefault();document.getElementById('sa-icons-wrap-${si}-${ri}').classList.add('sa-drop-over')"
            ondragleave="document.getElementById('sa-icons-wrap-${si}-${ri}').classList.remove('sa-drop-over')"
            ondrop="saOnIconDrop(event,${si},${ri})">${iconSlots}${iconHint}</div>
        </div>`;
      });
      // Drop zone
      html += `<div class="sa-section-drop" id="sa-sdrop-${si}"
        ondragover="event.preventDefault();document.getElementById('sa-sdrop-${si}').classList.add('sa-drop-over')"
        ondragleave="document.getElementById('sa-sdrop-${si}').classList.remove('sa-drop-over')"
        ondrop="saOnSectionDrop(event,${si})">drag player here</div>`;
      html += '</div>';
    }
    html += '</div>';
  });

  body.innerHTML = html;

  // Single delegated dragstart on the palette — far more reliable than per-element wiring
  const palette = document.getElementById('sa-icon-palette');
  if (palette) {
    palette.ondragstart = (e) => {
      const chip = e.target.closest('[data-icon-name]');
      if (!chip) { e.preventDefault(); return; }
      e.dataTransfer.setData('saIcon', chip.dataset.iconName);
      e.dataTransfer.effectAllowed = 'copy';
    };
  }
}

function saToggleSection(si) {
  const sections = saGetOrInitSections();
  if (!sections) return;
  sections[si].collapsed = !sections[si].collapsed;
  savePlanState();
  renderSpecialAssignments();
}

function saOnSectionDrop(e, si) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('sa-sdrop-' + si)?.classList.remove('sa-drop-over');
  let name = e.dataTransfer.getData('saMember');
  if (!name) { try { const d = JSON.parse(e.dataTransfer.getData('assignElem')); if (d?.label) name = d.label; } catch(_){} }
  if (!name) return;
  const m = members.find(x => x.name === name);
  const sections = saGetOrInitSections();
  if (!sections) return;
  sections[si].rows.push({ id: 'r'+(saNextRowId++), memberId: m?m.id:null, memberName: name, icons: [], text: '' });
  savePlanState();
  renderSpecialAssignments();
}

function saOnPlayerDrop(e, si, ri) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById(`sa-pslot-${si}-${ri}`)?.classList.remove('sa-drop-over');
  let name = e.dataTransfer.getData('saMember');
  if (!name) { try { const d = JSON.parse(e.dataTransfer.getData('assignElem')); if (d?.label) name = d.label; } catch(_){} }
  if (!name) return;
  const m = members.find(x => x.name === name);
  const sections = saGetOrInitSections();
  if (!sections) return;
  sections[si].rows[ri].memberId   = m ? m.id : null;
  sections[si].rows[ri].memberName = name;
  savePlanState();
  renderSpecialAssignments();
}

function saOnIconDrop(e, si, ri) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById(`sa-icons-wrap-${si}-${ri}`)?.classList.remove('sa-drop-over');
  document.getElementById(`sa-idrop-${si}-${ri}`)?.classList.remove('sa-drop-over');
  const iconName = e.dataTransfer.getData('saIcon');
  if (!iconName) return;
  const sections = saGetOrInitSections();
  if (!sections) return;
  const row = sections[si].rows[ri];
  if (!row.icons) row.icons = [];
  if (!row.icons.includes(iconName)) row.icons.push(iconName);
  savePlanState();
  renderSpecialAssignments();
}

function saRemoveIcon(si, ri, ii) {
  const sections = saGetOrInitSections();
  if (!sections) return;
  sections[si].rows[ri].icons.splice(ii, 1);
  savePlanState();
  renderSpecialAssignments();
}

function saSetRowText(si, ri, value) {
  const sections = saGetOrInitSections();
  if (!sections) return;
  sections[si].rows[ri].text = value;
  savePlanState();
}

function saDeleteRow(si, ri) {
  const sections = saGetOrInitSections();
  if (!sections) return;
  sections[si].rows.splice(ri, 1);
  savePlanState();
  renderSpecialAssignments();
}

// ── Background ─────────────────────────────────────────────
function loadBossBackground(encounterId) {
  currentEncounterId = encounterId;
  const enc = RAIDS.flatMap(r => r.encounters).find(e => e.id === encounterId);
  if (enc) currentEncounterName = enc.name;
  const src = ENCOUNTER_BG[encounterId];
  if (!src) {
    bgImage = null; bgLoaded = false;
    // Still apply any pending rescale (no bg image — canvas stays at current size)
    if (_pendingRescaleW && _pendingRescaleH &&
        (_pendingRescaleW !== canvasW || _pendingRescaleH !== canvasH)) {
      rescaleElements(elements, _pendingRescaleW, _pendingRescaleH, canvasW, canvasH);
      const plan = currentPlanId ? assignPlans[currentPlanId] : null;
      if (plan) { plan.canvasW = canvasW; plan.canvasH = canvasH; }
    }
    _pendingRescaleW = null; _pendingRescaleH = null;
    renderCanvas(); return;
  }
  bgImage = new Image();
  bgImage.crossOrigin = 'anonymous';
  bgLoaded = false;
  bgImage.onload = () => {
    bgLoaded = true;
    // Size canvas to match image aspect ratio within the container
    const wrap = document.getElementById('assign-canvas-wrap');
    if (wrap) {
      // Remember previous canvas size before we resize
      const prevW = canvasW;
      const prevH = canvasH;
      const wrapW = wrap.clientWidth;
      const wrapH = wrap.clientHeight;
      const imgAR = bgImage.naturalWidth / bgImage.naturalHeight;
      const wrapAR = wrapW / wrapH;
      if (imgAR > wrapAR) {
        canvasW = wrapW;
        canvasH = Math.round(wrapW / imgAR);
      } else {
        canvasH = wrapH;
        canvasW = Math.round(wrapH * imgAR);
      }
      aCanvas.width = canvasW;
      aCanvas.height = canvasH;
      aCanvas.style.position = 'absolute';
      aCanvas.style.left = Math.round((wrapW - canvasW) / 2) + 'px';
      aCanvas.style.top = Math.round((wrapH - canvasH) / 2) + 'px';

      // Single rescale: from the plan's saved canvas size → the new final canvas size.
      // We only rescale the live `elements` copy — plan.elements is never touched here.
      // plan.canvasW/H is updated to the final canvas size so that savePlanState()
      // always writes the correct reference dimensions.
      const fromW = _pendingRescaleW || prevW;
      const fromH = _pendingRescaleH || prevH;
      _pendingRescaleW = null;
      _pendingRescaleH = null;
      if (fromW && fromH && (fromW !== canvasW || fromH !== canvasH)) {
        rescaleElements(elements, fromW, fromH, canvasW, canvasH);
      }
      const plan = currentPlanId ? assignPlans[currentPlanId] : null;
      if (plan) { plan.canvasW = canvasW; plan.canvasH = canvasH; }
    }
    renderCanvas();
  };
  bgImage.src = src;
}

// ── Tool ──────────────────────────────────────────────────
function setTool(tool) {
  activeTool = tool;
  document.querySelectorAll('.atool[data-tool]').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === tool);
  });
  aCanvas.style.cursor = tool === 'select' ? 'default' : tool === 'arrow' ? 'crosshair' : 'text';
}

// ── Render ─────────────────────────────────────────────────
function renderCanvas() {
  if (!aCtx) return;
  aCtx.clearRect(0, 0, canvasW, canvasH);

  // Background
  aCtx.fillStyle = '#0a0a14';
  aCtx.fillRect(0, 0, canvasW, canvasH);
  if (bgLoaded && bgImage && bgImage.naturalWidth) {
    aCtx.drawImage(bgImage, 0, 0, canvasW, canvasH);
  } else if (!currentPlanId) {
    // No plan active — show prompt
    aCtx.save();
    aCtx.fillStyle = 'rgba(200,168,75,0.12)';
    aCtx.fillRect(0, 0, canvasW, canvasH);
    aCtx.font = '600 18px "Exo 2", sans-serif';
    aCtx.fillStyle = 'rgba(200,168,75,0.6)';
    aCtx.textAlign = 'center';
    aCtx.textBaseline = 'middle';
    aCtx.fillText('Press "+ New Plan" to get started', canvasW / 2, canvasH / 2);
    aCtx.restore();
  }

  // Elements
  for (const el of elements) {
    drawElement(el);
  }

  // Overlays for selected element
  if (selectedId !== null) {
    const selEl = elements.find(e => e.id === selectedId);
    if (selEl) {
      // Arrow handles: tail (move start) and head (move end)
      if (selEl.type === 'arrow') {
        // Tail handle (x1,y1) - white circle
        aCtx.save();
        aCtx.fillStyle = 'rgba(255,255,255,0.9)';
        aCtx.strokeStyle = '#c8a84b';
        aCtx.lineWidth = 2;
        aCtx.beginPath();
        aCtx.arc(selEl.x1, selEl.y1, 8, 0, Math.PI*2);
        aCtx.fill(); aCtx.stroke();
        aCtx.restore();
        // Head handle (x2,y2) - gold circle
        aCtx.save();
        aCtx.fillStyle = 'rgba(200,168,75,0.9)';
        aCtx.strokeStyle = '#fff';
        aCtx.lineWidth = 2;
        aCtx.beginPath();
        aCtx.arc(selEl.x2, selEl.y2, 8, 0, Math.PI*2);
        aCtx.fill(); aCtx.stroke();
        aCtx.restore();
      }
      // Delete button
      const dp = getDeleteBtnPos(selEl);
      if (dp) {
        aCtx.save();
        aCtx.fillStyle = 'rgba(200,50,50,0.92)';
        aCtx.beginPath();
        aCtx.arc(dp.x, dp.y, 10, 0, Math.PI * 2);
        aCtx.fill();
        aCtx.fillStyle = '#fff';
        aCtx.font = 'bold 13px sans-serif';
        aCtx.textAlign = 'center';
        aCtx.textBaseline = 'middle';
        aCtx.fillText('✕', dp.x, dp.y);
        aCtx.restore();
      }
    }
  }
}

function drawElement(el) {
  if (!aCtx) return;
  const sel = el.id === selectedId;

  if (el.type === 'arrow') {
    drawArrow(aCtx, el.x1, el.y1, el.x2, el.y2, el.color || '#ffffff', sel);
    return;
  }
  if (el.type === 'text') {
    aCtx.save();
    aCtx.font = `${el.fontSize||14}px "Exo 2", sans-serif`;
    aCtx.fillStyle = el.color || '#ffffff';
    aCtx.strokeStyle = 'rgba(0,0,0,0.8)';
    aCtx.lineWidth = 3;
    aCtx.strokeText(el.text, el.x, el.y);
    aCtx.fillText(el.text, el.x, el.y);
    if (sel) {
      const m = aCtx.measureText(el.text);
      aCtx.strokeStyle = 'rgba(200,168,75,0.8)';
      aCtx.lineWidth = 1;
      aCtx.strokeRect(el.x - 2, el.y - (el.fontSize||14) - 2, m.width + 4, (el.fontSize||14) + 6);
    }
    aCtx.restore();
    return;
  }

  // Token or marker or bossicon
  const size = el.size || 44;
  const half = size / 2;

  // Re-resolve bossicon src from BOSS_ICONS_DATA if missing/corrupted
  if (el.type === 'bossicon' && (!el.src || el.src.length < 100)) {
    if (el.bossIconId && BOSS_ICONS_DATA[el.bossIconId]) {
      el.src = BOSS_ICONS_DATA[el.bossIconId];
    } else if (el.label) {
      const matchId = Object.keys(BOSS_ICON_NAMES).find(k => BOSS_ICON_NAMES[k] === el.label);
      if (matchId && BOSS_ICONS_DATA[matchId]) { el.src = BOSS_ICONS_DATA[matchId]; el.bossIconId = matchId; }
    }
  }

  const img = loadImg(el.src);

  if (img.complete && img.naturalWidth) {
    if (el.type === 'token') {
      aCtx.save();
      aCtx.beginPath();
      aCtx.arc(el.x, el.y, half, 0, Math.PI * 2);
      aCtx.clip();
      aCtx.drawImage(img, el.x - half, el.y - half, size, size);
      aCtx.restore();
      aCtx.beginPath();
      aCtx.arc(el.x, el.y, half, 0, Math.PI * 2);
      aCtx.strokeStyle = sel ? '#c8a84b' : (el.borderColor || 'rgba(255,255,255,0.7)');
      aCtx.lineWidth = sel ? 3 : 2;
      aCtx.stroke();
    } else if (el.type === 'bossicon') {
      aCtx.save();
      aCtx.beginPath();
      aCtx.arc(el.x, el.y, half, 0, Math.PI * 2);
      aCtx.clip();
      aCtx.drawImage(img, el.x - half, el.y - half, size, size);
      aCtx.restore();
      if (sel) {
        aCtx.beginPath();
        aCtx.arc(el.x, el.y, half + 3, 0, Math.PI * 2);
        aCtx.strokeStyle = '#c8a84b';
        aCtx.lineWidth = 2;
        aCtx.stroke();
      }
    } else {
      // Marker: draw at natural proportions, no stretch
      const iw = img.naturalWidth || size;
      const ih = img.naturalHeight || size;
      const scale2 = size / Math.max(iw, ih);
      const dw = iw * scale2, dh = ih * scale2;
      aCtx.drawImage(img, el.x - dw/2, el.y - dh/2, dw, dh);
      if (sel) {
        aCtx.strokeStyle = '#c8a84b';
        aCtx.lineWidth = 2;
        aCtx.strokeRect(el.x - dw/2 - 3, el.y - dh/2 - 3, dw + 6, dh + 6);
      }
    }
  } else {
    if (!img.complete) img.onload = () => renderCanvas();
  }

  // Label under token
  if (el.label) {
    aCtx.save();
    aCtx.font = 'bold 11px "Exo 2", sans-serif';
    aCtx.textAlign = 'center';
    const lx = el.x, ly = el.y + half + 13;
    aCtx.strokeStyle = 'rgba(0,0,0,0.9)';
    aCtx.lineWidth = 3;
    aCtx.strokeText(el.label, lx, ly);
    aCtx.fillStyle = el.labelColor || '#ffffff';
    aCtx.fillText(el.label, lx, ly);
    aCtx.restore();
  }
}

function drawArrow(ctx, x1, y1, x2, y2, color, selected) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 5) return;
  const headLen = Math.min(18, len * 0.3);

  ctx.save();
  ctx.strokeStyle = selected ? '#c8a84b' : color;
  ctx.fillStyle = selected ? '#c8a84b' : color;
  ctx.lineWidth = selected ? 3 : 2.5;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 4;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ── Mouse Events ──────────────────────────────────────────
function getPos(e) {
  const r = aCanvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function hitTest(x, y) {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === 'arrow') {
      if (pointNearLine(x, y, el.x1, el.y1, el.x2, el.y2, 8)) return el;
    } else if (el.type === 'text') {
      aCtx.font = `${el.fontSize||14}px "Exo 2", sans-serif`;
      const w = aCtx.measureText(el.text).width;
      const h = el.fontSize || 14;
      if (x >= el.x - 2 && x <= el.x + w + 2 && y >= el.y - h - 2 && y <= el.y + 6) return el;
    } else {
      const half = (el.size || 44) / 2 + 4;
      if (Math.hypot(x - el.x, y - el.y) <= half) return el;
    }
  }
  return null;
}

function pointNearLine(px, py, x1, y1, x2, y2, thresh) {
  const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D, lenSq = C * C + D * D;
  const t = Math.max(0, Math.min(1, dot / lenSq));
  return Math.hypot(px - (x1 + t * C), py - (y1 + t * D)) <= thresh;
}

document.addEventListener('keydown', function(e) {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId !== null) {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
    pushUndo();
    elements = elements.filter(el => el.id !== selectedId);
    selectedId = null;
    savePlanState();
    renderCanvas();
  }
});

function getDeleteBtnPos(el) {
  if (!el) return null;
  if (el.type === 'arrow') return { x: (el.x1+el.x2)/2, y: (el.y1+el.y2)/2 };
  if (el.type === 'text') {
    if (aCtx) { aCtx.font = `${el.fontSize||14}px "Exo 2", sans-serif`; return { x: el.x + aCtx.measureText(el.text).width + 14, y: el.y - (el.fontSize||14) }; }
    return { x: el.x + 60, y: el.y - 14 };
  }
  const half = (el.size||44)/2;
  return { x: el.x + half, y: el.y - half };
}

function onCanvasMouseDown(e) {
  const {x, y} = getPos(e);
  const inp = document.getElementById('assign-text-input');

  // Always hide text input on any canvas click (commit handled by keydown)
  if (inp && inp.style.display !== 'none') { inp.style.display = 'none'; }

  if (activeTool === 'text') {
    const val = document.getElementById('assign-text-val');
    const cr = aCanvas.getBoundingClientRect();
    const wr = document.getElementById('assign-canvas-wrap').getBoundingClientRect();
    inp.style.display = 'block';
    inp.style.left = (cr.left - wr.left + x) + 'px';
    inp.style.top = (cr.top - wr.top + y - 30) + 'px';
    val.dataset.x = x; val.dataset.y = y + 4; val.value = '';
    setTimeout(() => val.focus(), 10);
    return;
  }

  if (activeTool === 'arrow') { arrowStart = {x, y}; return; }

  if (activeTool === 'select') {
    // Check arrow endpoint handles first (only when arrow is selected)
    if (selectedId !== null) {
      const selEl = elements.find(el => el.id === selectedId);
      if (selEl && selEl.type === 'arrow') {
        if (Math.hypot(x - selEl.x1, y - selEl.y1) <= 10) {
          draggingId = selEl.id;
          arrowDragHandle = 'tail';
          renderCanvas(); return;
        }
        if (Math.hypot(x - selEl.x2, y - selEl.y2) <= 10) {
          draggingId = selEl.id;
          arrowDragHandle = 'head';
          renderCanvas(); return;
        }
      }
      // Check delete button
      const dp = getDeleteBtnPos(selEl);
      if (dp && Math.hypot(x - dp.x, y - dp.y) <= 12) {
        pushUndo();
        elements = elements.filter(el => el.id !== selectedId);
        selectedId = null; draggingId = null; arrowDragHandle = null;
        savePlanState(); renderCanvas(); return;
      }
    }
    const hit = hitTest(x, y);
    selectedId = hit ? hit.id : null;
    draggingId = hit ? hit.id : null;
    arrowDragHandle = null;
    if (hit) {
      if (hit.type === 'arrow') {
        dragOffX = x - (hit.x1 + hit.x2) / 2;
        dragOffY = y - (hit.y1 + hit.y2) / 2;
      } else {
        dragOffX = x - hit.x; dragOffY = y - hit.y;
      }
    }
    renderCanvas();
  }
}

function onCanvasMouseMove(e) {
  const {x, y} = getPos(e);
  if (draggingId !== null) {
    const el = elements.find(el => el.id === draggingId);
    if (el) {
      if (el.type === 'arrow' && arrowDragHandle === 'tail') {
        el.x1 = x; el.y1 = y;
      } else if (el.type === 'arrow' && arrowDragHandle === 'head') {
        el.x2 = x; el.y2 = y;
      } else if (el.type === 'arrow') {
        // Move whole arrow from midpoint
        const midX = (el.x1+el.x2)/2, midY = (el.y1+el.y2)/2;
        const dx = (x - dragOffX) - midX, dy = (y - dragOffY) - midY;
        el.x1 += dx; el.y1 += dy; el.x2 += dx; el.y2 += dy;
        dragOffX = x - (el.x1+el.x2)/2;
        dragOffY = y - (el.y1+el.y2)/2;
      } else {
        el.x = x - dragOffX; el.y = y - dragOffY;
      }
      renderCanvas();
    }
    return;
  }
  if (arrowStart && activeTool === 'arrow') {
    renderCanvas();
    drawArrow(aCtx, arrowStart.x, arrowStart.y, x, y, '#ffffff', false);
  }
}

function onCanvasMouseUp(e) {
  const {x, y} = getPos(e);
  if (draggingId !== null) { savePlanState(); draggingId = null; arrowDragHandle = null; }
  if (arrowStart && activeTool === 'arrow') {
    if (Math.hypot(x - arrowStart.x, y - arrowStart.y) > 10) {
      pushUndo();
      elements.push({ id: nextElemId++, type: 'arrow', x1: arrowStart.x, y1: arrowStart.y, x2: x, y2: y, color: '#ffffff' });
      savePlanState();
    }
    arrowStart = null; renderCanvas();
  }
}


function onCanvasDblClick(e) {
  const {x, y} = getPos(e);
  const inp = document.getElementById('assign-text-input');
  const val = document.getElementById('assign-text-val');
  // Position relative to canvas-wrap (canvas may be offset within wrap)
  const canvasRect = aCanvas.getBoundingClientRect();
  const wrapRect = document.getElementById('assign-canvas-wrap').getBoundingClientRect();
  const absX = canvasRect.left - wrapRect.left + x;
  const absY = canvasRect.top - wrapRect.top + y;
  inp.style.display = 'block';
  inp.style.left = absX + 'px';
  inp.style.top = (absY - 28) + 'px';
  val.dataset.x = x;
  val.dataset.y = y + 4;
  val.value = '';
  val.focus();
}

function commitText(e) {
  if (e.key === 'Enter' || e.key === 'Escape') {
    const val = document.getElementById('assign-text-val');
    const inp = document.getElementById('assign-text-input');
    if (e.key === 'Enter' && val.value.trim()) {
      pushUndo();
      elements.push({ id: nextElemId++, type: 'text', x: parseFloat(val.dataset.x), y: parseFloat(val.dataset.y), text: val.value.trim(), color: '#ffffff', fontSize: 14 });
      savePlanState();
      renderCanvas();
    }
    inp.style.display = 'none';
  }
}

// ── Drag from palette onto canvas ─────────────────────────
function startDragToCanvas(e, elemData) {
  e.dataTransfer.setData('assignElem', JSON.stringify(elemData));
}

function aCanvasDropHandler(e) {
  e.preventDefault();
  try {
    const data = JSON.parse(e.dataTransfer.getData('assignElem'));
    const r = aCanvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    pushUndo();
    elements.push({ id: nextElemId++, x, y, ...data });
    savePlanState();
    renderCanvas();
  } catch(err) { console.error('Drop error:', err); }
}

// ── Plans ─────────────────────────────────────────────────
function savePlanState() {
  if (!currentPlanId) return;
  // Strip large base64 src from bossicons before saving - we can re-resolve from BOSS_ICONS_DATA
  const elemsToSave = elements.map(el => {
    if (el.type === 'bossicon') {
      const { src, ...rest } = el; // eslint-disable-line no-unused-vars
      return rest; // save without src, bossIconId is preserved for re-resolution
    }
    return el;
  });
  assignPlans[currentPlanId].elements = JSON.parse(JSON.stringify(elemsToSave));
  // Save canvas dimensions so we can rescale coords correctly when loading on a different screen
  assignPlans[currentPlanId].canvasW = canvasW;
  assignPlans[currentPlanId].canvasH = canvasH;
  saveAssignData();
  updateCurrentPlanBar();
}

function rescaleElements(elems, fromW, fromH, toW, toH) {
  if (!fromW || !fromH || !toW || !toH) return;
  if (fromW === toW && fromH === toH) return;
  const scaleX = toW / fromW;
  const scaleY = toH / fromH;
  for (const el of elems) {
    if (el.type === 'arrow') {
      el.x1 = Math.round(el.x1 * scaleX); el.y1 = Math.round(el.y1 * scaleY);
      el.x2 = Math.round(el.x2 * scaleX); el.y2 = Math.round(el.y2 * scaleY);
    } else {
      el.x = Math.round(el.x * scaleX); el.y = Math.round(el.y * scaleY);
    }
  }
}

function loadPlan(planId) {
  currentPlanId = planId;
  const plan = assignPlans[planId];
  if (!plan) return;
  elements = JSON.parse(JSON.stringify(plan.elements || []));

  // Re-resolve bossicon srcs from BOSS_ICONS_DATA (prevents issues if base64 got
  // corrupted/truncated in storage, and avoids storing large base64 in saved plans)
  for (const el of elements) {
    if (el.type === 'bossicon') {
      // Try bossIconId first, then fall back to matching by label
      if (el.bossIconId && BOSS_ICONS_DATA[el.bossIconId]) {
        el.src = BOSS_ICONS_DATA[el.bossIconId];
      } else if (el.label) {
        // Fallback: find by label
        const matchId = Object.keys(BOSS_ICON_NAMES).find(k => BOSS_ICON_NAMES[k] === el.label);
        if (matchId && BOSS_ICONS_DATA[matchId]) {
          el.src = BOSS_ICONS_DATA[matchId];
          el.bossIconId = matchId;
        }
      }
    }
  }

  // Rescale plan.elements in-memory from their saved size to the current canvas size.
  // This is only an in-memory update — saveAssignData() is not called here, so the
  // on-disk coords and plan.canvasW/H are untouched. We also stash the saved size for
  // loadBossBackground, which may resize the canvas further once the image loads.
  const _savedW = plan.canvasW || null;
  const _savedH = plan.canvasH || null;
  if (_savedW && _savedH && (_savedW !== canvasW || _savedH !== canvasH)) {
    rescaleElements(elements, _savedW, _savedH, canvasW, canvasH);
    // Update the in-memory plan so repeated clicks within the same session
    // don't re-rescale from the original saved coords.
    plan.elements = JSON.parse(JSON.stringify(elements.map(el => {
      if (el.type === 'bossicon') { const { src, ...rest } = el; return rest; }
      return el;
    })));
    plan.canvasW = canvasW;
    plan.canvasH = canvasH;
  }
  // Pass the pre-bg-load canvas size to loadBossBackground so it can rescale
  // from THIS size → final bg-fitted size (avoids double-rescaling).
  _pendingRescaleW = plan.canvasW || null;
  _pendingRescaleH = plan.canvasH || null;

  undoStack = [];
  currentEncounterId = plan.encounterId;
  const enc = RAIDS.flatMap(r => r.encounters).find(e => e.id === plan.encounterId);
  if (enc) currentEncounterName = enc.name;
  loadBossBackground(plan.encounterId);
  renderBossIconPalette();
  renderPlansLibrary();
  updateCurrentPlanBar();
  renderCanvas();
  renderSpecialAssignments();
}



function deletePlan(id) {
  if (!confirm('Delete this plan?')) return;
  delete assignPlans[id];
  if (currentPlanId === id) {
    currentPlanId = null; elements = [];
    updateCurrentPlanBar();
    renderCanvas();
  }
  saveAssignData();
  renderPlansLibrary();
}

// Raid dates removed

// ── Raid Library & Plan Management ───────────────────────────────────────────
let openRaidId = null;         // which raid accordion is open
let wizardEncounterId = null;  // selected encounter in new-plan wizard

function renderRaidLibrary() {
  // Not used anymore - wizard renders inline
}

function renderWizardRaids() {
  const el = document.getElementById('wizard-raids');
  if (!el) return;
  el.innerHTML = RAIDS.map(raid => {
    const isOpen = openRaidId === raid.id;
    const encounters = isOpen ? raid.encounters.map(e => `
      <div onclick="selectWizardEncounter('${e.id}','${e.name.replace(/'/g,"\\'")}','${raid.id}')"
        style="padding:5px 8px 5px 20px;font-size:11px;cursor:pointer;border-radius:4px;margin-top:2px;
               background:${wizardEncounterId===e.id?'rgba(200,168,75,0.18)':'var(--bg2)'};
               color:${wizardEncounterId===e.id?'var(--gold2)':'var(--text2)'};
               border:1px solid ${wizardEncounterId===e.id?'rgba(200,168,75,0.4)':'var(--border)'}">
        ${e.name}
      </div>`).join('') : '';
    return `<div>
      <div onclick="toggleWizardRaid('${raid.id}')"
        style="padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer;border-radius:4px;
               color:var(--gold);border:1px solid var(--border);background:var(--bg2);
               display:flex;align-items:center;justify-content:space-between">
        <span>${raid.name}</span>
        <span style="font-size:9px;color:var(--text3)">${isOpen?'▲':'▼'}</span>
      </div>
      ${encounters}
    </div>`;
  }).join('');
}

function toggleWizardRaid(raidId) {
  openRaidId = openRaidId === raidId ? null : raidId;
  renderWizardRaids();
}

function selectWizardEncounter(encId, encName, raidId) {
  // Immediately create a new plan for this encounter and start drawing
  const id = 'plan_' + (nextPlanId++);
  assignPlans[id] = { id, name: '', encounterId: encId, elements: [] };
  currentPlanId = id;
  currentEncounterId = encId;
  currentEncounterName = encName;
  elements = [];
  undoStack = [];
  saveAssignData();
  cancelNewPlan();
  loadBossBackground(encId);
  renderBossIconPalette();
  renderPlansLibrary();
  updateCurrentPlanBar();
  renderSpecialAssignments();
}

function startNewPlan() {
  openRaidId = null;
  renderWizardRaids();
  document.getElementById('new-plan-wizard').style.display = 'block';
}

function cancelNewPlan() {
  document.getElementById('new-plan-wizard').style.display = 'none';
}



function renderPlansLibrary() {
  const el = document.getElementById('plans-library');
  if (!el) return;
  const allPlans = Object.values(assignPlans).filter(p => p.name);
  const unsaved = Object.values(assignPlans).filter(p => !p.name);

  if (!allPlans.length) {
    el.innerHTML = `<div style="font-size:12px;color:var(--text3);padding:8px 4px;line-height:1.6">
      No saved plans yet.<br>Create a plan and save it to see it here.
    </div>`;
    return;
  }

  // Group by raid then encounter
  const byRaid = {};
  RAIDS.forEach(r => {
    r.encounters.forEach(e => {
      const plans = allPlans.filter(p => p.encounterId === e.id);
      if (plans.length) {
        if (!byRaid[r.id]) byRaid[r.id] = { name: r.name, encs: [] };
        byRaid[r.id].encs.push({ enc: e, plans });
      }
    });
  });

  let out = '';
  for (const { name: raidName, encs } of Object.values(byRaid)) {
    out += `<div style="margin-bottom:14px">
      <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:600;color:var(--gold);
                  padding:0 0 5px;border-bottom:1px solid rgba(200,168,75,0.25);margin-bottom:6px">
        ${raidName}
      </div>`;
    for (const { enc, plans } of encs) {
      out += `<div style="margin-bottom:8px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;
                    padding:0 2px 4px 6px">${enc.name}</div>`;
      for (const p of plans) {
        const isActive = p.id === currentPlanId;
        out += `<div style="display:flex;align-items:center;gap:6px;padding:7px 8px;margin-bottom:3px;
          border-radius:6px;border:1px solid ${isActive?'rgba(200,168,75,0.5)':'var(--border)'};
          background:${isActive?'rgba(200,168,75,0.1)':'var(--bg3)'};cursor:pointer;transition:border-color .15s"
          onclick="loadPlan('${p.id}')"
          onmouseover="this.style.borderColor='rgba(200,168,75,0.35)'"
          onmouseout="this.style.borderColor='${isActive?'rgba(200,168,75,0.5)':'var(--border)'}'"
        >
          <span style="flex:1;font-size:12px;font-weight:${isActive?'600':'400'};
            color:${isActive?'var(--gold2)':'var(--text)'};
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${p.name}">${p.name}</span>
          <button onclick="event.stopPropagation();deletePlan('${p.id}')"
            style="background:transparent;border:none;color:var(--text3);cursor:pointer;
                   font-size:11px;padding:0;flex-shrink:0;line-height:1"
            onmouseover="this.style.color='#e06060'" onmouseout="this.style.color='var(--text3)'"
            title="Delete">✕</button>
        </div>`;
      }
      out += '</div>';
    }
    out += '</div>';
  }
  el.innerHTML = out;
}

function updateCurrentPlanBar() {
  const bar = document.getElementById('current-plan-bar');
  const lbl = document.getElementById('current-plan-label');
  const nameInput = document.getElementById('save-plan-name');
  if (!bar || !lbl) return;
  if (currentPlanId && assignPlans[currentPlanId]) {
    const p = assignPlans[currentPlanId];
    const enc = RAIDS.flatMap(r => r.encounters).find(e => e.id === p.encounterId);
    bar.style.display = 'block';
    lbl.textContent = enc ? enc.name : '';
    if (nameInput) nameInput.value = p.name || '';
  } else {
    bar.style.display = 'none';
  }
}

async function savePlanManual() {
  if (!currentPlanId) return;
  const nameInput = document.getElementById('save-plan-name');
  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    if (nameInput) { nameInput.focus(); nameInput.style.borderColor = '#e06060'; setTimeout(()=>nameInput.style.borderColor='',1500); }
    return;
  }
  assignPlans[currentPlanId].name = name;
  // Compute elements to save and update plan in memory
  const elemsToSave = elements.map(el => {
    if (el.type === 'bossicon') { const { src, ...rest } = el; return rest; }
    return el;
  });
  assignPlans[currentPlanId].elements = JSON.parse(JSON.stringify(elemsToSave));
  assignPlans[currentPlanId].canvasW = canvasW;
  assignPlans[currentPlanId].canvasH = canvasH;
  renderPlansLibrary();
  updateCurrentPlanBar();
  // Block button and wait for cloud write to fully complete before showing success
  const btn = document.querySelector('#current-plan-bar .btn-gold');
  if (btn) { btn.textContent = '⏳ Saving…'; btn.disabled = true; }
  try {
    await saveAssignData();
    if (btn) { btn.textContent = '✓ Saved!'; setTimeout(()=>{ btn.textContent = '💾 Save Plan'; btn.disabled = false; }, 1500); }
  } catch(e) {
    if (btn) { btn.textContent = '✗ Error'; btn.style.background = '#8b3333'; setTimeout(()=>{ btn.textContent = '💾 Save Plan'; btn.disabled = false; btn.style.background = ''; }, 2500); }
  }
}

function addPlan() { startNewPlan(); } // legacy alias

function renderPlansList() { renderPlansLibrary(); }

function selectEncounter(encId, encName) {
  selectWizardEncounter(encId, encName, null);
}


// ── Member List ───────────────────────────────────────────
function renderAssignMemberList() {
  const q = (document.getElementById('assign-member-search')?.value || '').toLowerCase();
  const filtered = members.filter(m => !q || m.name.toLowerCase().includes(q) || m.cls.toLowerCase().includes(q));
  const el = document.getElementById('assign-member-list');
  if (!el) return;
  el.innerHTML = filtered.map(m => {
    const cc = CM[m.cls] || {color:'#888'};
    const icon = specIcon(m.cls, m.spec);
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 2px;cursor:grab" draggable="true" data-mid="${m.id}" data-mname="${m.name}">
      <div class="drag-token" style="border-color:${cc.color}40;width:38px;height:38px;border-radius:50%;overflow:hidden;border:2px solid ${cc.color}40;flex-shrink:0">
        <img src="${icon}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;color:${cc.color}">${m.name}</div>
        <div style="font-size:10px;color:var(--text3)">${m.spec||m.cls}</div>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('[draggable]').forEach(row => {
    const mid = parseInt(row.dataset.mid);
    const m = members.find(x => x.id === mid);
    if (!m) return;
    const cc = CM[m.cls] || {color:'#888'};
    const icon = specIcon(m.cls, m.spec);
    const elemData = { type: 'token', src: icon, label: m.name, labelColor: cc.color, borderColor: cc.color, size: 44 };
    row.ondragstart = (e) => {
      startDragToCanvas(e, elemData);
      e.dataTransfer.setData('saMember', m.name);
    };
  });
}

// ── Marker Palette ─────────────────────────────────────────
function renderMarkerPalette() {
  const el = document.getElementById('marker-palette');
  if (!el) return;
  const MARKER_LABELS = {
    star:'Star', circle:'Circle', diamond:'Diamond', triangle:'Triangle',
    moon:'Moon', square:'Square', cross:'Cross', skull:'Skull',
    tank:'Tank', healer:'Healer', mdps:'Melee', rdps:'Ranged'
  };
  el.innerHTML = Object.entries(MARKER_ICONS).map(([name, src]) => {
    const label = MARKER_LABELS[name] || name;
    return `<div title="${label}" style="cursor:grab;text-align:center;width:44px" id="marker_${name}" draggable="true">
      <img src="${src}" style="width:36px;height:36px;object-fit:contain;display:block;margin:0 auto;border-radius:4px">
      <div style="font-size:9px;color:var(--text3);margin-top:2px">${label}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('[id^=marker_]').forEach(div => {
    const name = div.id.replace('marker_','');
    const src = MARKER_ICONS[name];
    const elemData = { type: 'marker', src, size: 40, label: '' };
    div.ondragstart = (e) => startDragToCanvas(e, elemData);
  });
}

// ── Boss Icon Palette ──────────────────────────────────────
function renderBossIconPalette() {
  const el = document.getElementById('boss-icon-palette');
  if (!el) return;
  const allowed = ENCOUNTER_BOSS_ICONS[currentEncounterId] || [];
  if (!allowed.length) {
    el.innerHTML = '<div style="font-size:11px;color:var(--text3)">No boss icons for this encounter</div>';
    return;
  }
  el.innerHTML = allowed.map(id => {
    const src = BOSS_ICONS_DATA[id];
    const name = BOSS_ICON_NAMES[id] || id;
    if (!src) return '';
    return `<div style="text-align:center;cursor:grab;width:48px" draggable="true" id="bossicon_${id}">
      <img src="${src}" title="${name}" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--border);display:block;margin:0 auto">
      <div style="font-size:9px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('[id^=bossicon_]').forEach(div => {
    const id = div.id.replace('bossicon_','');
    const src = BOSS_ICONS_DATA[id];
    const name = BOSS_ICON_NAMES[id] || id;
    const elemData = { type: 'bossicon', src, bossIconId: id, size: 50, label: name };
    div.ondragstart = (e) => startDragToCanvas(e, elemData);
  });
}

// ── Undo ──────────────────────────────────────────────────
function pushUndo() {
  const elemsToStore = elements.map(el => {
    if (el.type === 'bossicon') { const { src, ...rest } = el; return rest; } // eslint-disable-line no-unused-vars
    return el;
  });
  undoStack.push(JSON.stringify(elemsToStore));
  if (undoStack.length > 30) undoStack.shift();
}
function undoAssign() {
  if (!undoStack.length) return;
  elements = JSON.parse(undoStack.pop());
  // Re-resolve bossicon srcs after undo
  for (const el of elements) {
    if (el.type === 'bossicon' && (!el.src || el.src.length < 100)) {
      if (el.bossIconId && BOSS_ICONS_DATA[el.bossIconId]) {
        el.src = BOSS_ICONS_DATA[el.bossIconId];
      } else if (el.label) {
        const matchId = Object.keys(BOSS_ICON_NAMES).find(k => BOSS_ICON_NAMES[k] === el.label);
        if (matchId && BOSS_ICONS_DATA[matchId]) { el.src = BOSS_ICONS_DATA[matchId]; el.bossIconId = matchId; }
      }
    }
  }
  savePlanState(); renderCanvas();
}
function clearCanvas() { if (!confirm('Clear all elements from canvas?')) return; pushUndo(); elements = []; savePlanState(); renderCanvas(); }

// ── Export ────────────────────────────────────────────────

// Preload an image for export via fetch→blob to avoid tainted-canvas errors.
// Same-origin assets/ files are fetched directly (no CORS needed).
// External sources (zamimg) are fetched with mode:'cors'.
// Falls back to a plain crossOrigin image tag if fetch fails.
const _exportBlobCache = {};
async function _exportLoadImg(src) {
  if (!src) return null;
  if (_exportBlobCache[src]) return _exportBlobCache[src];
  const isExternal = src.startsWith('http://') || src.startsWith('https://');
  try {
    const res = await fetch(src, {
      mode: isExternal ? 'cors' : 'same-origin',
      credentials: 'omit',
    });
    if (res.ok) {
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload  = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });
      _exportBlobCache[src] = img;
      return img;
    }
  } catch (_) { /* fall through to crossOrigin attempt */ }
  // Fallback: crossOrigin tag (works if the server sends the right headers)
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { _exportBlobCache[src] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = src + (src.includes('?') ? '&' : '?') + '_nocache=' + Date.now();
  });
}

// Collect every unique icon URL needed for the SA panel rows.
function _exportCollectIconUrls(sections) {
  const urls = new Set();
  for (const sec of sections) {
    for (const row of (sec.rows || [])) {
      for (const ic of (row.icons || [])) {
        if (ic.startsWith('__marker__')) {
          const mkey = ic.replace('__marker__', '');
          if (MARKER_ICONS[mkey]) urls.add(MARKER_ICONS[mkey]);
        } else {
          const file = SA_ICONS[ic];
          if (file) urls.add(BASE_ICON + file + '.jpg');
        }
      }
    }
  }
  return [...urls];
}

async function exportAssignImage() {
  if (!aCanvas || !aCtx) { alert('Canvas not ready — open the Assignments tab first.'); return; }

  const btn = document.getElementById('assign-export-btn');
  if (btn) { btn.textContent = '⏳ Saving...'; btn.disabled = true; }

  try {
    const CW = canvasW || aCanvas.width;
    const CH = canvasH || aCanvas.height;

    // ── Layout constants ─────────────────────────────────────────────────
    const SA_W        = 240;   // width of the special assignments sidebar
    const PAD         = 10;    // outer padding inside SA panel
    const HDR_H       = 28;    // panel title bar height
    const SEC_HDR_H   = 22;    // per-section role header height
    const ROW_H       = 44;    // height per assignment row (top line + icon strip)
    const ICON_SZ     = 20;    // icon size in icon strip
    const LBL_W       = 30;    // width of MT/OT/HE/R label column
    const NAME_W      = 86;    // width reserved for player name
    const DIVIDER_COL = '#1e1e32';
    const BORDER_COL  = '#2a2a4a';
    const BG_PANEL    = '#10101e';
    const BG_SEC_HDR  = '#0a0a16';
    const BG_ROW_ALT  = '#0d0d1c';
    const BG_ICON_ROW = 'rgba(0,0,0,0.25)';

    const roleColors  = { tank:'#4fc3f7', healer:'#81c784', mdps:'#f06292', rdps:'#ffb74d' };
    const roleLabels  = { tank:'TANKS', healer:'HEALERS', mdps:'MELEE DPS', rdps:'RANGED DPS' };

    // ── Gather sections with content ─────────────────────────────────────
    const allSections     = saGetOrInitSections() || [];
    const activeSections  = allSections.filter(s => s.rows && s.rows.length > 0);

    // ── Pre-fetch ALL images via blob URLs to prevent tainted-canvas ────────
    // Covers: background, canvas element srcs, and SA panel icons.
    const allSrcSet = new Set();
    const bgSrc = ENCOUNTER_BG[currentEncounterId];
    if (bgSrc) allSrcSet.add(bgSrc);
    for (const el of elements) {
      if (el.src && el.src.length > 4 && !el.src.startsWith('data:')) allSrcSet.add(el.src);
    }
    _exportCollectIconUrls(activeSections).forEach(u => allSrcSet.add(u));

    const allUrls   = [...allSrcSet];
    const allLoaded = await Promise.all(allUrls.map(u => _exportLoadImg(u)));
    const iconImgMap = {};
    allUrls.forEach((u, i) => { if (allLoaded[i]) iconImgMap[u] = allLoaded[i]; });

    // ── Compute SA panel height ──────────────────────────────────────────
    // Each section: sec header + rows + small drop-zone gap
    function sectionHeight(sec) {
      return SEC_HDR_H + sec.rows.length * ROW_H + 6;
    }
    const SA_CONTENT_H = HDR_H + activeSections.reduce((s, sec) => s + sectionHeight(sec), 0);
    const SA_H         = Math.max(SA_CONTENT_H, CH);  // at least as tall as the canvas

    // ── Create output canvas ─────────────────────────────────────────────
    const hasSA = activeSections.length > 0;
    const OUT_W = hasSA ? SA_W + CW : CW;
    const OUT_H = hasSA ? SA_H : CH;

    const out = document.createElement('canvas');
    out.width  = OUT_W;
    out.height = OUT_H;
    const ctx  = out.getContext('2d', { willReadFrequently: false });

    // ── Draw canvas area (right side) ────────────────────────────────────
    // Temporarily inject blob-loaded images into imgCache so drawElement
    // pulls clean (untainted) images when we call it for the export canvas.
    const _cacheBackup = {};
    for (const [url, img] of Object.entries(iconImgMap)) {
      if (imgCache[url]) _cacheBackup[url] = imgCache[url];
      imgCache[url] = img;
    }

    const cx = hasSA ? SA_W : 0;
    const exportBg = bgSrc ? iconImgMap[bgSrc] : null;
    if (exportBg && exportBg.complete && exportBg.naturalWidth) {
      ctx.drawImage(exportBg, cx, 0, CW, CH);
    } else {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(cx, 0, CW, CH);
    }
    // Re-draw elements into export canvas by temporarily redirecting aCtx
    ctx.save();
    ctx.translate(cx, 0);
    const savedCtx = aCtx;
    aCtx = ctx;
    for (const el of elements) drawElement(el);
    aCtx = savedCtx;
    ctx.restore();

    // Restore original imgCache entries
    for (const url of Object.keys(iconImgMap)) {
      if (_cacheBackup[url]) imgCache[url] = _cacheBackup[url];
      else delete imgCache[url];
    }

    // If taller than canvas (due to SA overflow), fill remaining bg
    if (OUT_H > CH) {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(cx, CH, CW, OUT_H - CH);
    }

    if (!hasSA) {
      // Nothing to draw in the sidebar — just export the canvas as-is
    } else {
      // ── Draw SA sidebar (left side) ───────────────────────────────────

      // Panel background
      ctx.fillStyle = BG_PANEL;
      ctx.fillRect(0, 0, SA_W, OUT_H);

      // Right border divider
      ctx.fillStyle = DIVIDER_COL;
      ctx.fillRect(SA_W - 1, 0, 1, OUT_H);

      // ── Panel title bar ──────────────────────────────────────────────
      ctx.fillStyle = '#14142a';
      ctx.fillRect(0, 0, SA_W, HDR_H);
      ctx.strokeStyle = BORDER_COL;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, HDR_H); ctx.lineTo(SA_W - 1, HDR_H); ctx.stroke();

      // Gold title text — use a sword-like prefix matching the UI
      ctx.fillStyle = '#c8a84b';
      ctx.font = 'bold 11px "Exo 2", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚔  SPECIAL ASSIGNMENTS', PAD, HDR_H / 2);

      // ── Sections ────────────────────────────────────────────────────
      let curY = HDR_H;

      activeSections.forEach((sec, si) => {
        const roleColor = roleColors[sec.role] || '#aaa';
        const roleLabel = roleLabels[sec.role] || sec.role.toUpperCase();

        // Section role header
        ctx.fillStyle = BG_SEC_HDR;
        ctx.fillRect(0, curY, SA_W - 1, SEC_HDR_H);
        ctx.strokeStyle = BORDER_COL;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, curY); ctx.lineTo(SA_W - 1, curY); ctx.stroke();

        // Coloured left accent bar
        ctx.fillStyle = roleColor;
        ctx.fillRect(0, curY, 3, SEC_HDR_H);

        // Role label
        ctx.fillStyle = roleColor;
        ctx.font = 'bold 9px "Exo 2", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(roleLabel, PAD + 4, curY + SEC_HDR_H / 2);

        // Row count badge
        const badge = `${sec.rows.length}`;
        ctx.font = '9px "Exo 2", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText(badge, SA_W - PAD - 12, curY + SEC_HDR_H / 2);

        curY += SEC_HDR_H;

        // ── Assignment rows ─────────────────────────────────────────
        sec.rows.forEach((row, ri) => {
          const rowY    = curY;
          const isAlt   = ri % 2 === 1;
          const topH    = Math.round(ROW_H * 0.55);   // top line (label + name + note)
          const icnH    = ROW_H - topH;                // icon strip height

          // Row background
          ctx.fillStyle = isAlt ? BG_ROW_ALT : BG_PANEL;
          ctx.fillRect(0, rowY, SA_W - 1, ROW_H);

          // Subtle bottom divider
          ctx.strokeStyle = 'rgba(42,42,74,0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(PAD, rowY + ROW_H - 1);
          ctx.lineTo(SA_W - PAD, rowY + ROW_H - 1);
          ctx.stroke();

          // ── Top line: label | name | note ────────────────────────
          const textMidY = rowY + topH / 2;

          // Row label (MT / OT1 / HE1 / M1 / R1)
          const lbl = saRowLabel(sec.role, ri);
          ctx.fillStyle = 'rgba(255,255,255,0.28)';
          ctx.font = 'bold 8px "Exo 2", sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(lbl, PAD + 2, textMidY);

          // Player name (class-coloured)
          const member     = row.memberId ? members.find(x => x.id === row.memberId) : null;
          const nameColor  = member ? ((CM[member.cls] || {}).color || '#ffffff') : 'rgba(255,255,255,0.45)';
          const displayName = row.memberName || '—';
          ctx.fillStyle = nameColor;
          ctx.font = 'bold 11px "Exo 2", sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(displayName, PAD + LBL_W, textMidY);

          // Note text (italic, dim, after the name)
          if (row.text) {
            ctx.fillStyle = 'rgba(255,255,255,0.38)';
            ctx.font = 'italic 9px "Exo 2", sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            // Truncate note if needed
            const maxNoteW = SA_W - PAD - (PAD + LBL_W + NAME_W + 4);
            let note = row.text;
            if (ctx.measureText(note).width > maxNoteW) {
              while (note.length > 0 && ctx.measureText(note + '…').width > maxNoteW) note = note.slice(0, -1);
              note += '…';
            }
            ctx.fillText(note, PAD + LBL_W + NAME_W + 4, textMidY);
          }

          // ── Icon strip ───────────────────────────────────────────
          const icnY = rowY + topH;
          ctx.fillStyle = BG_ICON_ROW;
          ctx.fillRect(1, icnY, SA_W - 2, icnH);

          const icons = row.icons || [];
          icons.forEach((ic, ii) => {
            const ix = PAD + LBL_W + ii * (ICON_SZ + 3);
            if (ix + ICON_SZ > SA_W - PAD) return;   // overflow guard

            let imgSrc = null;
            if (ic.startsWith('__marker__')) {
              const mkey = ic.replace('__marker__', '');
              imgSrc = MARKER_ICONS[mkey] || null;
            } else {
              const file = SA_ICONS[ic];
              if (file) imgSrc = BASE_ICON + file + '.jpg';
            }

            const imgEl = imgSrc ? iconImgMap[imgSrc] : null;
            if (imgEl) {
              // Rounded-corner clip for icon
              const iy = icnY + Math.round((icnH - ICON_SZ) / 2);
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(ix, iy, ICON_SZ, ICON_SZ, 3);
              ctx.clip();
              ctx.drawImage(imgEl, ix, iy, ICON_SZ, ICON_SZ);
              ctx.restore();
              // Thin border around icon
              ctx.strokeStyle = 'rgba(255,255,255,0.15)';
              ctx.lineWidth = 1;
              ctx.strokeRect(ix + 0.5, iy + 0.5, ICON_SZ - 1, ICON_SZ - 1);
            }
          });

          curY += ROW_H;
        });

        // Small spacer between sections
        curY += 6;
      });

      // Remaining panel area below all sections — fill to edge
      if (curY < OUT_H) {
        ctx.fillStyle = BG_PANEL;
        ctx.fillRect(0, curY, SA_W - 1, OUT_H - curY);
      }
    }

    // ── Trigger download ─────────────────────────────────────────────────
    const planName = (currentPlanId && assignPlans[currentPlanId]?.name)
      ? assignPlans[currentPlanId].name
      : (currentEncounterName || 'assignment');
    const filename = planName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';

    const link = document.createElement('a');
    link.download = filename;
    link.href = out.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch(err) {
    console.error('Export error:', err);
    alert('Export failed: ' + err.message);
  } finally {
    if (btn) { btn.textContent = '📷 Export'; btn.disabled = false; }
  }
}

// Canvas drop is attached in initAssign
