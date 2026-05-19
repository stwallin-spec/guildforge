// ══════════════════════════════════════════════════════════
// PROFESSIONS
// ══════════════════════════════════════════════════════════

// profItems: array of { memberId, memberName, profession, itemId, itemName, itemIcon, itemUrl }
let profItems = [];
let profLookupResult = null; // pending item from lookup
let activeProfFilter = ''; // '' = all

function loadProfData() {
  try {
    profItems = JSON.parse(localStorage.getItem('gm_profitems') || '[]');
  } catch(e) { profItems = []; }
}

function saveProfData() {
  localStorage.setItem('gm_profitems', JSON.stringify(profItems));
  cloudSaveProf();
}

function initProfessions() {
  loadProfData();
  // Populate member select with blank first option
  const sel = document.getElementById('prof-member-sel');
  if (sel) {
    sel.innerHTML = '<option value="">— Select member —</option>' +
      members.map(m => `<option value="${m.id}">${m.name} (${m.cls})</option>`).join('');
  }
  // Reset profession select to blank
  const profSel = document.getElementById('prof-sel');
  if (profSel) profSel.value = '';
  profLookupResult = null;
  document.getElementById('prof-item-preview').style.display = 'none';
  document.getElementById('prof-lookup-status').textContent = '';
  document.getElementById('prof-add-btn').disabled = true;
  document.getElementById('prof-url-input').value = '';
  renderProfPills();
  renderProfessions();
}

const ALL_PROFESSIONS = ['Alchemy','Blacksmithing','Enchanting','Engineering','Jewelcrafting','Leatherworking','Tailoring','Cooking','First Aid'];

const PROF_COLORS = {
  'Alchemy':       { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)' },  // purple
  'Blacksmithing': { color: '#f97316', bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)' },  // orange
  'Enchanting':    { color: '#ec4899', bg: 'rgba(236,72,153,0.15)',  border: 'rgba(236,72,153,0.4)' },  // pink
  'Engineering':   { color: '#eab308', bg: 'rgba(234,179,8,0.15)',   border: 'rgba(234,179,8,0.4)'  },  // yellow
  'Jewelcrafting': { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.4)'  },  // cyan
  'Leatherworking':{ color: '#84cc16', bg: 'rgba(132,204,22,0.15)',  border: 'rgba(132,204,22,0.4)' },  // lime
  'Tailoring':     { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)',   border: 'rgba(244,63,94,0.4)'  },  // rose
  'Cooking':       { color: '#fb923c', bg: 'rgba(251,146,60,0.15)',  border: 'rgba(251,146,60,0.4)' },  // light orange
  'First Aid':     { color: '#4ade80', bg: 'rgba(74,222,128,0.15)',  border: 'rgba(74,222,128,0.4)' },  // green
};

function profColor(prof) { return PROF_COLORS[prof] || { color: '#9896a4', bg: 'rgba(152,150,164,0.1)', border: 'rgba(152,150,164,0.3)' }; }

function renderProfPills() {
  const el = document.getElementById('prof-prof-filters');
  if (!el) return;
  const profs = ['', ...ALL_PROFESSIONS];
  el.innerHTML = profs.map(p => {
    const isActive = activeProfFilter === p;
    const label = p || 'All';
    const pc = p ? profColor(p) : null;
    const inactiveStyle = pc
      ? `color:${pc.color}99;border-color:${pc.border}66;background:transparent`
      : `color:var(--text3);border-color:var(--border);background:transparent`;
    const activeStyle = pc
      ? `color:${pc.color};border-color:${pc.color};background:${pc.bg};font-weight:600`
      : `color:var(--gold2);border-color:var(--gold);background:rgba(200,168,75,0.15);font-weight:600`;
    const hoverStyle = pc
      ? `color:${pc.color};border-color:${pc.border};background:${pc.bg}`
      : `color:var(--text2);border-color:var(--border2);background:var(--bg3)`;
    return `<button class="pill"
      style="${isActive ? activeStyle : inactiveStyle}"
      onmouseover="this.style.cssText='${hoverStyle}'"
      onmouseout="this.style.cssText='${isActive ? activeStyle : inactiveStyle}'"
      onclick="setProfFilter('${p}')">${label}
    </button>`;
  }).join('');
}

function setProfFilter(prof) {
  activeProfFilter = prof;
  renderProfPills();
  renderProfessions();
}

async function lookupProfItem() {
  const url = document.getElementById('prof-url-input').value.trim();
  const status = document.getElementById('prof-lookup-status');
  const preview = document.getElementById('prof-item-preview');
  const addBtn = document.getElementById('prof-add-btn');

  if (!url) { status.textContent = 'Paste a WoWHead URL first.'; status.style.color = '#e06060'; return; }

  // Support both item= and spell= URLs
  const itemMatch = url.match(/item[=\/](\d+)/i);
  const spellMatch = url.match(/spell[=\/](\d+)/i);
  if (!itemMatch && !spellMatch) {
    status.textContent = 'Could not find an item or spell ID in that URL.';
    status.style.color = '#e06060'; return;
  }

  const isSpell = !!spellMatch && !itemMatch;
  const entryId = isSpell ? spellMatch[1] : itemMatch[1];
  const entryType = isSpell ? 'spell' : 'item';

  // Extract name from URL slug
  const slugMatch = url.match(/(?:item|spell)[=\/]\d+[/]([a-z0-9-]+)/i);
  let itemName = slugMatch
    ? slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : (isSpell ? 'Spell ' : 'Item ') + entryId;

  // Parse everything from the URL — no API call needed
  profLookupResult = {
    itemId: entryId,
    itemName: itemName,
    itemIcon: '',
    itemUrl: isSpell
      ? 'https://www.wowhead.com/tbc/spell=' + entryId
      : 'https://www.wowhead.com/tbc/item=' + entryId
  };

  document.getElementById('prof-preview-name').textContent = itemName;
  document.getElementById('prof-preview-type').textContent = (isSpell ? 'Spell' : 'Item') + ' #' + entryId;
  document.getElementById('prof-preview-icon').style.display = 'none';
  preview.style.display = 'flex';
  status.textContent = '✓ Ready to add. Press + Add to save.';
  status.style.color = '#80d080';
  addBtn.disabled = false;
}

function addProfItem() {
  if (!profLookupResult) return;
  const memberSel = document.getElementById('prof-member-sel');
  const profSel = document.getElementById('prof-sel');
  const memberId = parseInt(memberSel.value);
  const member = members.find(m => m.id === memberId);
  if (!member) return;

  // Avoid duplicates per member
  const exists = profItems.some(p => p.memberId === memberId && p.itemId === profLookupResult.itemId);
  if (exists) {
    document.getElementById('prof-lookup-status').textContent = `${member.name} already has this item listed.`;
    document.getElementById('prof-lookup-status').style.color = '#e06060';
    return;
  }

  profItems.push({
    memberId,
    memberName: member.name,
    memberCls: member.cls,
    profession: profSel.value,
    ...profLookupResult
  });
  saveProfData();

  // Reset
  document.getElementById('prof-url-input').value = '';
  document.getElementById('prof-item-preview').style.display = 'none';
  document.getElementById('prof-lookup-status').textContent = `Added ${profLookupResult.itemName} for ${member.name}.`;
  document.getElementById('prof-lookup-status').style.color = '#80d080';
  document.getElementById('prof-add-btn').disabled = true;
  profLookupResult = null;
  renderProfPills();
  renderProfessions();
}

function removeProfItem(memberId, itemId) {
  profItems = profItems.filter(p => !(p.memberId === memberId && p.itemId === itemId));
  saveProfData();
  renderProfPills();
  renderProfessions();
}

function renderProfessions() {
  const el = document.getElementById('prof-registry');
  if (!el) return;

  const q = (document.getElementById('prof-search')?.value || '').toLowerCase();

  let filtered = profItems.filter(p => {
    const matchQ = !q || p.itemName.toLowerCase().includes(q) || p.memberName.toLowerCase().includes(q) || p.profession.toLowerCase().includes(q);
    const matchP = !activeProfFilter || p.profession === activeProfFilter;
    return matchQ && matchP;
  });

  if (!filtered.length) {
    const msg = activeProfFilter
      ? `No ${activeProfFilter} items added yet.`
      : profItems.length ? 'No items match your search.' : 'No craftable items added yet. Paste a WoWHead URL on the left to get started.';
    el.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:8px">${msg}</div>`;
    return;
  }

  // Group by profession
  const byProf = {};
  filtered.forEach(p => {
    if (!byProf[p.profession]) byProf[p.profession] = [];
    byProf[p.profession].push(p);
  });

  // Within each profession, group by item so you can see all crafters at a glance
  let out = '';
  for (const [prof, items] of Object.entries(byProf).sort()) {
    // Group items by itemId
    const byItem = {};
    items.forEach(p => {
      if (!byItem[p.itemId]) byItem[p.itemId] = { ...p, crafters: [] };
      byItem[p.itemId].crafters.push({ memberId: p.memberId, memberName: p.memberName, memberCls: p.memberCls });
    });

    const pc = profColor(prof);
    out += `<div style="margin-bottom:20px">
      <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:600;color:${pc.color};
                  padding:6px 0 8px;border-bottom:1px solid ${pc.border};margin-bottom:10px;
                  display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${pc.color};flex-shrink:0"></span>
        ${prof}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">`;

    for (const item of Object.values(byItem)) {
      const cc = CM[item.memberCls] || { color: '#888' };
      const crafterPills = item.crafters.map(c => {
        const mc = CM[c.memberCls] || { color: '#888' };
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;
          border-radius:10px;font-size:11px;font-weight:600;
          background:rgba(${hexToRgb(mc.color)},0.15);color:${mc.color};
          border:1px solid rgba(${hexToRgb(mc.color)},0.3)">
          ${c.memberName}
          <button onclick="removeProfItem(${c.memberId},'${item.itemId}')"
            style="background:transparent;border:none;color:inherit;opacity:0.5;cursor:pointer;font-size:10px;padding:0;margin-left:2px;line-height:1"
            title="Remove">✕</button>
        </span>`;
      }).join('');

      out += `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);
                padding:10px 14px;display:flex;align-items:center;gap:12px;
                border-left:3px solid ${pc.color};transition:background .15s"
               onmouseover="this.style.background='${pc.bg}'"
               onmouseout="this.style.background='var(--bg2)'">
        <div style="flex:1;min-width:0">
          <a href="${item.itemUrl}" target="_blank" class="wowhead"
             style="font-size:13px;font-weight:600;color:${pc.color};text-decoration:none">${item.itemName}</a>
          <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">${crafterPills}</div>
        </div>
      </div>`;
    }
    out += '</div></div>';
  }
  el.innerHTML = out;
  if (window.WH && WH.Tooltips) WH.Tooltips.refreshLinks();
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
