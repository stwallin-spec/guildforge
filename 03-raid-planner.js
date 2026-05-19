// ── ROLE CLASSIFICATION ───────────────────────────────────────────────────────
// Maps class:spec → role category
const SPEC_ROLES = {
  // Tanks
  'Warrior:Protection':  'tank',
  'Paladin:Protection':  'tank',
  'Druid:Feral Tank':    'tank',
  // Healers
  'Paladin:Holy':        'healer',
  'Priest:Discipline':   'healer',
  'Priest:Holy':         'healer',
  'Shaman:Restoration':  'healer',
  'Druid:Restoration':   'healer',
  // Ranged DPS
  'Hunter:Beast Mastery':'rdps',
  'Hunter:Marksmanship': 'rdps',
  'Hunter:Survival':     'rdps',
  'Mage:Arcane':         'rdps',
  'Mage:Fire':           'rdps',
  'Mage:Frost':          'rdps',
  'Warlock:Affliction':  'rdps',
  'Warlock:Demonology':  'rdps',
  'Warlock:Destruction': 'rdps',
  'Priest:Shadow':       'rdps',
  'Shaman:Elemental':    'rdps',
  'Druid:Balance':       'rdps',
  // Melee DPS
  'Warrior:Arms':        'mdps',
  'Warrior:Fury':        'mdps',
  'Paladin:Retribution': 'mdps',
  'Rogue:Assassination': 'mdps',
  'Rogue:Combat':        'mdps',
  'Rogue:Subtlety':      'mdps',
  'Shaman:Enhancement':  'mdps',
  'Druid:Feral Combat':  'mdps',
};

function getMemberRole(m) {
  const key = m.cls + ':' + (m.spec || '');
  return SPEC_ROLES[key] || null;
}

function getRaidRoleCounts() {
  const inRaid = groups.flat().filter(Boolean).map(s => getMemberById(s.id)).filter(Boolean);
  return {
    tank:   inRaid.filter(m => getMemberRole(m) === 'tank').length,
    healer: inRaid.filter(m => getMemberRole(m) === 'healer').length,
    rdps:   inRaid.filter(m => getMemberRole(m) === 'rdps').length,
    mdps:   inRaid.filter(m => getMemberRole(m) === 'mdps').length,
    total:  inRaid.length,
  };
}

// ── RAID PLANNER ──────────────────────────────────────────────────────────────
let dragSource = null; // { type: 'bench'|'slot', memberId, groupIdx, slotIdx }

function getMemberById(id) { return members.find(m => m.id === id); }
function assignedIds() { return new Set(groups.flat().filter(Boolean).map(s => s.id)); }

function renderBench() {
  const q = (document.getElementById('bench-search').value || '').toLowerCase();
  const assigned = assignedIds();
  const benched = new Set(benchedIds);
  const available = members.filter(m => !assigned.has(m.id) && !benched.has(m.id) && (
    !q || m.name.toLowerCase().includes(q) || m.cls.toLowerCase().includes(q)
  ));

  const el = document.getElementById('bench-list');

  if (!available.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:8px">All members assigned or benched</div>';
    renderBenchedGroup();
    return;
  }

  // If we have signup data, split into two sections
  if (_raidSignupIds && _raidSignupIds.size > 0) {
    const signedUp  = available.filter(m =>  _raidSignupIds.has(m.id));
    const notSigned = available.filter(m => !_raidSignupIds.has(m.id));

    const makeCard = (m, highlight) => {
      const cc = CM[m.cls] || { color: '#888' };
      const icon = specIcon(m.cls, m.spec);
      const style = highlight
        ? `border:1px solid ${cc.color}88;background:rgba(0,0,0,0.35);`
        : `opacity:0.45;border:1px solid transparent;`;
      return `<div class="bench-member" draggable="true" style="${style}"
        data-id="${m.id}"
        ondragstart="onBenchDragStart(event,${m.id})"
        ondragend="onDragEnd(event)">
        <img src="${icon}" class="spec-icon" alt="${m.spec||m.cls}" onerror="this.style.display='none'">
        <span class="bench-name" style="color:${cc.color}">${m.name}</span>
        <span class="bench-cls">${m.spec || m.cls}</span>
        ${highlight ? '<span style="font-size:9px;color:#80d080;margin-left:auto;flex-shrink:0">✓ Signed</span>' : ''}
        <button onclick="event.stopPropagation();bench(${m.id})" title="Move to benched"
          style="margin-left:auto;flex-shrink:0;background:transparent;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:0 2px;line-height:1"
          onmouseover="this.style.color='#e06060'" onmouseout="this.style.color='var(--text3)'">⊖</button>
      </div>`;
    };

    let out = '';

    // Banner showing which event is loaded
    out += `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;margin-bottom:6px;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:var(--radius);font-size:10px">
      <span style="color:var(--gold)">⚔ <strong>${_raidSignupTitle}</strong> &mdash; ${_raidSignupDate}</span>
      <button onclick="_raidSignupIds=null;_raidSignupTitle=null;_raidSignupDate=null;renderBench()"
        style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;padding:0 2px" title="Clear import">✕</button>
    </div>`;

    if (signedUp.length) {
      out += `<div style="font-size:9px;font-weight:700;color:#80d080;text-transform:uppercase;letter-spacing:0.08em;padding:2px 4px;margin-bottom:4px">✓ Signed Up (${signedUp.length})</div>`;
      out += signedUp.map(m => makeCard(m, true)).join('');
    }

    if (notSigned.length) {
      out += `<div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;padding:2px 4px;margin:8px 0 4px">Not Signed (${notSigned.length})</div>`;
      out += notSigned.map(m => makeCard(m, false)).join('');
    }

    el.innerHTML = out;
  } else {
    // Normal render — no import active
    el.innerHTML = available.map(m => {
      const cc = CM[m.cls] || { color: '#888' };
      const icon = specIcon(m.cls, m.spec);
      return `<div class="bench-member" draggable="true"
        data-id="${m.id}"
        ondragstart="onBenchDragStart(event,${m.id})"
        ondragend="onDragEnd(event)">
        <img src="${icon}" class="spec-icon" alt="${m.spec||m.cls}" onerror="this.style.display='none'">
        <span class="bench-name" style="color:${cc.color}">${m.name}</span>
        <span class="bench-cls">${m.spec || m.cls}</span>
        <button onclick="event.stopPropagation();bench(${m.id})" title="Move to benched"
          style="margin-left:auto;flex-shrink:0;background:transparent;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:0 2px;line-height:1"
          onmouseover="this.style.color='#e06060'" onmouseout="this.style.color='var(--text3)'">⊖</button>
      </div>`;
    }).join('');
  }

  renderBenchedGroup();
}

function renderBenchedGroup() {
  const benched = new Set(benchedIds);
  const benchedMembers = members.filter(m => benched.has(m.id));
  const el = document.getElementById('benched-group');
  if (!benchedMembers.length) { el.innerHTML = ''; return; }

  const slots = benchedMembers.map(m => {
    const cc = CM[m.cls] || { color: '#888' };
    const icon = specIcon(m.cls, m.spec);
    return `<div class="slot filled" style="cursor:default">
      <img src="${icon}" class="spec-icon" alt="${m.spec||m.cls}" onerror="this.style.display='none'">
      <span class="slot-name" style="color:${cc.color}">${m.name}</span>
      <span class="slot-cls">${m.spec || m.cls}</span>
      <button class="slot-remove" onclick="unbench(${m.id})" title="Send back to available">↩</button>
    </div>`;
  }).join('');

  el.innerHTML = `<div class="group-box" style="margin-top:10px;border-color:rgba(200,168,75,0.25)">
    <div class="group-header" style="background:rgba(30,20,10,0.8);display:flex;align-items:center;gap:8px">
      <span style="flex:1">Benched</span>
      <span class="group-count">${benchedMembers.length}</span>
      <button onclick="clearBenched()" style="font-size:10px;padding:2px 8px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:var(--text2);cursor:pointer;font-family:'Exo 2',sans-serif" title="Send all back to available">Send all back</button>
    </div>
    <div class="group-slots" style="display:grid;grid-template-columns:1fr 1fr;gap:5px">${slots}</div>
  </div>`;
}

let benchedIds = [];
let _raidSignupIds   = null; // Set of member IDs from Raid-Helper import
let _raidSignupTitle = null;
let _raidSignupDate  = null;

function benchRemaining() {
  const assigned = assignedIds();
  const newBenched = members
    .filter(m => !assigned.has(m.id) && !benchedIds.includes(m.id))
    .map(m => m.id);
  benchedIds = [...benchedIds, ...newBenched];
  renderBench();
}

function bench(id) {
  if (benchedIds.includes(id)) return;
  benchedIds.push(id);
  renderBench();
}

function unbench(id) {
  if (!_li) return;
  benchedIds = benchedIds.filter(x => x !== id);
  renderBench();
}

function clearBenched() {
  benchedIds = [];
  renderBench();
}

// ── TBC CLASSIC BUFF DATABASE ─────────────────────────────────────────────
// Maps class+spec to buffs/debuffs they provide
// Format: { name, type ('buff'|'debuff'|'other'), color, icon (emoji fallback) }


// ── BUFF DEFINITIONS ────────────────────────────────────────────────────────

function renderGroups() {
  document.getElementById('groups-grid').innerHTML = groups.map((grp, gi) => {
    const count = grp.filter(Boolean).length;
    const slots = grp.map((s, si) => {
      if (s) {
        const m = getMemberById(s.id);
        if (!m) return slotEmpty(gi, si);
        const cc = CM[m.cls] || { color: '#888' };
        const icon = specIcon(m.cls, m.spec);
        const role = getMemberRole(m);
        const rolePip = role ? `<span class="role-pip role-pip-${role}" title="${{tank:'Tank',healer:'Healer',rdps:'Ranged DPS',mdps:'Melee DPS'}[role]}"></span>` : '';
        return `<div class="slot filled" draggable="true"
          data-group="${gi}" data-slot="${si}"
          ondragstart="onSlotDragStart(event,${gi},${si})"
          ondragend="onDragEnd(event)"
          ondragover="event.preventDefault()"
          ondrop="onSlotDrop(event,${gi},${si})">
          ${rolePip}<img src="${icon}" class="spec-icon" alt="${m.spec||m.cls}" onerror="this.style.display='none'">
          <span class="slot-name" style="color:${cc.color}">${m.name}</span>
          <span class="slot-cls">${m.spec || m.cls}</span>
          <button class="slot-remove" onclick="event.stopPropagation();removeFromSlot(${gi},${si})" title="Remove">✕</button>
        </div>`;
      }
      return slotEmpty(gi, si);
    }).join('');
    return `<div class="group-box" id="group-${gi}"
      ondragover="onGroupDragOver(event,${gi})"
      ondragleave="onGroupDragLeave(${gi})"
      ondrop="onGroupDrop(event,${gi})">
      <div class="group-header">
        <span>Group ${gi + 1}</span>
        <span class="group-count">${count}/5</span>
      </div>
      <div class="group-slots">${slots}</div>
    </div>`;
  }).join('');

  // Render role summary
  renderRolesSummary();
}

function slotEmpty(gi, si) {
  return `<div class="slot empty"
    ondragover="event.preventDefault()"
    ondrop="onSlotDrop(event,${gi},${si})">
    <span style="font-size:11px;color:var(--text3)">Empty slot</span>
  </div>`;
}

function renderRolesSummary() {
  const el = document.getElementById('raid-role-summary');
  if (!el) return;
  const { tank, healer, rdps, mdps, total } = getRaidRoleCounts();
  const inRaid = groups.flat().filter(Boolean).length;

  const roleBox = (label, count, color, icon) => {
    const ideal = {tank:2,healer:5,rdps:8,mdps:10}[icon] || 0;
    const diff = count - ideal;
    const statusColor = count === 0 ? 'var(--text3)' : color;
    return `<div class="role-summary-card">
      <div class="role-summary-icon role-pip-${icon}"></div>
      <div class="role-summary-label">${label}</div>
      <div class="role-summary-count" style="color:${statusColor}">${count}</div>
    </div>`;
  };

  el.innerHTML = `
    <div class="role-summary-bar">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;font-weight:600">Raid Composition — ${inRaid}/25</div>
      <div class="role-summary-cards">
        ${roleBox('Tanks', tank, '#4fc3f7', 'tank')}
        ${roleBox('Healers', healer, '#81c784', 'healer')}
        ${roleBox('Ranged DPS', rdps, '#ffb74d', 'rdps')}
        ${roleBox('Melee DPS', mdps, '#f06292', 'mdps')}
      </div>
      <div class="role-summary-breakdown">
        <div class="role-bar-wrap">
          ${tank   > 0 ? `<div class="role-bar-seg" style="flex:${tank};background:#4fc3f7" title="${tank} Tank${tank!==1?'s':''}"></div>` : ''}
          ${healer > 0 ? `<div class="role-bar-seg" style="flex:${healer};background:#81c784" title="${healer} Healer${healer!==1?'s':''}"></div>` : ''}
          ${rdps   > 0 ? `<div class="role-bar-seg" style="flex:${rdps};background:#ffb74d" title="${rdps} Ranged DPS"></div>` : ''}
          ${mdps   > 0 ? `<div class="role-bar-seg" style="flex:${mdps};background:#f06292" title="${mdps} Melee DPS"></div>` : ''}
          ${inRaid < 25 ? `<div class="role-bar-seg" style="flex:${25-inRaid};background:var(--bg4)" title="${25-inRaid} empty slots"></div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderRaid() { renderBench(); renderGroups(); }

// ── RAID-HELPER IMPORT ─────────────────────────────────────────────────────

// Map Raid-Helper spec names → our canonical spec names
const RH_SPEC_MAP = {
  'Protection1': 'Protection', 'Protection2': 'Protection',
  'Holy1':       'Holy',       'Holy2':       'Holy',
  'Restoration1':'Restoration','Restoration2':'Restoration',
  'Beastmastery':'Beast Mastery',
  'Feral1':      'Feral Combat','Feral2':     'Feral Combat',
  'Guardian':    'Feral Tank',
  'Demonology':  'Demonology',
  'Destruction': 'Destruction',
  'Affliction':  'Affliction',
  'Subtlety':    'Subtlety',
  'Assassination':'Assassination',
  'Combat':      'Combat',
  'Arms':        'Arms',
  'Fury':        'Fury',
  'Arcane':      'Arcane',
  'Fire':        'Fire',
  'Frost':       'Frost',
  'Shadow':      'Shadow',
  'Discipline':  'Discipline',
  'Balance':     'Balance',
  'Elemental':   'Elemental',
  'Enhancement': 'Enhancement',
  'Retribution': 'Retribution',
  'Survival':    'Survival',
  'Marksmanship':'Marksmanship',
};

// Map Raid-Helper class names → our class names
const RH_CLASS_MAP = {
  'Tank':    null, // role not class — will match by name only
  'Healer':  null,
  'Melee':   null,
  'Ranged':  null,
  'Absence': null,
  'Tentative':null,
};

let _importedSignups = null; // holds fetched data before applying

function showImportRaidModal() {
  document.getElementById('import-raid-url').value = '';
  document.getElementById('import-raid-status').textContent = '';
  document.getElementById('import-raid-preview').style.display = 'none';
  document.getElementById('import-apply-btn').style.display = 'none';
  document.getElementById('import-fetch-btn').style.display = '';
  _importedSignups = null;
  const modal = document.getElementById('import-raid-modal');
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('import-raid-url').focus(), 50);
}

function closeImportRaidModal() {
  document.getElementById('import-raid-modal').style.display = 'none';
}

async function fetchRaidSignups() {
  const raw = document.getElementById('import-raid-url').value.trim();
  const statusEl = document.getElementById('import-raid-status');
  const btn = document.getElementById('import-fetch-btn');

  // Extract event ID from URL
  const match = raw.match(/(\d{15,})/);
  if (!match) {
    statusEl.style.color = '#e07070';
    statusEl.textContent = '⚠ Could not find event ID in URL. Try: https://raid-helper.xyz/event/123...';
    return;
  }

  const eventId = match[1];
  const apiUrl = `https://raid-helper.xyz/api/v4/events/${eventId}`;

  statusEl.style.color = 'var(--text3)';
  statusEl.textContent = '⟳ Fetching signups...';
  btn.disabled = true;

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!data.signUps || !data.signUps.length) {
      throw new Error('No signups found in this event.');
    }

    // Categorise signups
    const confirmed = [], tentative = [], absent = [], unmatched = [];

    data.signUps.forEach(s => {
      const isAbsence   = s.className === 'Absence'   || s.status === 'absence';
      const isTentative = s.className === 'Tentative' || s.status === 'tentative';

      // Find matching member in our roster (by name, case-insensitive)
      const member = members.find(m =>
        m.name.toLowerCase() === s.name.toLowerCase()
      );

      const entry = { rhName: s.name, member };

      if (isAbsence)        absent.push(entry);
      else if (isTentative) tentative.push(entry);
      else if (member)      confirmed.push(entry);
      else                  unmatched.push(entry);
    });

    _importedSignups = { confirmed, tentative, absent, unmatched, eventTitle: data.title, eventDate: data.date };

    // Show preview
    statusEl.style.color = '#80d080';
    statusEl.textContent = `✓ Loaded "${data.title}" — ${data.date}`;

    renderImportPreview(confirmed, tentative, absent, unmatched);
    document.getElementById('import-raid-preview').style.display = 'block';
    document.getElementById('import-apply-btn').style.display = '';

  } catch(e) {
    statusEl.style.color = '#e07070';
    statusEl.textContent = `⚠ ${e.message}`;
  }
  btn.disabled = false;
}

function renderImportPreview(confirmed, tentative, absent, unmatched) {
  const confirmedEl = document.getElementById('import-raid-confirmed');
  const missingEl   = document.getElementById('import-raid-missing');
  const tentativeEl = document.getElementById('import-raid-tentative');

  // Confirmed + matched
  confirmedEl.innerHTML = `<div style="font-size:11px;color:#80d080;font-weight:600;margin-bottom:4px">✓ Confirmed (${confirmed.length})</div>` +
    confirmed.map(e => {
      const cc = CM[e.member.cls] || { color:'#888' };
      return `<span style="font-size:11px;color:${cc.color};background:rgba(0,0,0,0.3);border-radius:3px;padding:1px 6px;margin:2px;display:inline-block">${e.member.name} <span style="opacity:0.6">${e.member.spec||e.member.cls}</span></span>`;
    }).join('');

  // Unmatched (in Raid-Helper but not in our roster)
  missingEl.innerHTML = unmatched.length ? `<div style="font-size:11px;color:#e0a040;font-weight:600;margin-bottom:4px">⚠ Not in roster (${unmatched.length}) — will be ignored</div>` +
    unmatched.map(e => `<span style="font-size:11px;color:#e0a040;background:rgba(0,0,0,0.3);border-radius:3px;padding:1px 6px;margin:2px;display:inline-block">${e.rhName}</span>`).join('') : '';

  // Tentative
  tentativeEl.innerHTML = tentative.length ? `<div style="font-size:11px;color:#9896a4;font-weight:600;margin-bottom:4px">? Tentative (${tentative.length})</div>` +
    tentative.map(e => `<span style="font-size:11px;color:#9896a4;background:rgba(0,0,0,0.3);border-radius:3px;padding:1px 6px;margin:2px;display:inline-block">${e.rhName}</span>`).join('') : '';
}

function applyRaidSignups() {
  if (!_importedSignups) return;
  const { confirmed } = _importedSignups;
  if (!confirmed.length) { alert('No confirmed signups matched your roster.'); return; }

  // Store confirmed IDs so renderBench can highlight them
  _raidSignupIds   = new Set(confirmed.map(e => e.member.id));
  _raidSignupTitle = _importedSignups.eventTitle;
  _raidSignupDate  = _importedSignups.eventDate;

  // Auto-bench everyone NOT in the confirmed list (and not already assigned to groups)
  const assigned = assignedIds();
  benchedIds = members
    .filter(m => !_raidSignupIds.has(m.id) && !assigned.has(m.id))
    .map(m => m.id);

  closeImportRaidModal();
  renderBench();

  // Toast
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a24;border:1px solid var(--gold);border-radius:6px;padding:10px 20px;font-size:12px;color:#fff;z-index:9999;pointer-events:none';
  toast.textContent = `✓ ${confirmed.length} signups ready for "${_importedSignups.eventTitle}" (${_importedSignups.eventDate})`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
// Close import modal on backdrop click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('import-raid-modal');
  if (modal && e.target === modal) closeImportRaidModal();
});



// ── RAID ROSTER SAVE / ARCHIVE ─────────────────────────────────────────────

function getRaidArchive() {
  try { return JSON.parse(localStorage.getItem('gm_raid_archive')) || []; }
  catch(e) { return []; }
}

function saveRaidArchive(archive) {
  localStorage.setItem('gm_raid_archive', JSON.stringify(archive));
  // Also sync to Supabase
  sbSet('raid_archive', archive).catch(() => {});
}

function showSaveRaidModal() {
  if (!_li) { alert('Please login as officer to save rosters.'); return; }
  const hasPlayers = groups.some(g => g.some(Boolean));
  if (!hasPlayers) { alert('Add some players to groups first!'); return; }
  // Pre-fill with today's date
  const today = new Date().toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
  document.getElementById('save-raid-name').value = today;
  const modal = document.getElementById('save-raid-modal');
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('save-raid-name').select(), 50);
}

function closeSaveRaidModal() {
  document.getElementById('save-raid-modal').style.display = 'none';
}

function confirmSaveRaid() {
  const name = document.getElementById('save-raid-name').value.trim();
  if (!name) { alert('Please enter a name.'); return; }
  const archive = getRaidArchive();
  const entry = {
    id: Date.now(),
    name,
    date: new Date().toISOString(),
    groups: JSON.parse(JSON.stringify(groups)),
    memberSnapshot: groups.flat().filter(Boolean).map(s => {
      const m = getMemberById(s.id);
      return m ? { id: m.id, name: m.name, cls: m.cls, spec: m.spec } : null;
    }).filter(Boolean)
  };
  archive.unshift(entry); // newest first
  saveRaidArchive(archive);
  closeSaveRaidModal();
  renderRaidArchive();
  // Flash confirmation
  const btn = document.querySelector('[onclick="toggleRaidArchive()"]');
  if (btn) { btn.textContent = '✓ Saved!'; setTimeout(() => btn.textContent = '📋 Archive', 1500); }
}

function toggleRaidArchive() {
  const panel = document.getElementById('raid-archive-panel');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    renderRaidArchive();
  } else {
    panel.style.display = 'none';
  }
}

function renderRaidArchive() {
  const archive = getRaidArchive();
  const el = document.getElementById('raid-archive-list');
  if (!archive.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:8px 0">No saved rosters yet. Fill your groups and click 💾 Save Roster.</div>';
    return;
  }
  el.innerHTML = archive.map(entry => {
    const date = new Date(entry.date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
    const playerCount = entry.groups.flat().filter(Boolean).length;
    // Show first 6 player names as preview
    const preview = (entry.memberSnapshot || []).slice(0, 8).map(m => {
      const cc = CM[m.cls] || { color: '#888' };
      return `<span style="font-size:10px;color:${cc.color}">${m.name}</span>`;
    }).join(', ');
    return `<div class="archive-entry" style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div>
          <span style="font-weight:600;color:var(--text);font-size:13px">${entry.name}</span>
          <span style="font-size:10px;color:var(--text3);margin-left:8px">${date} · ${playerCount} players</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn" style="font-size:11px;padding:3px 10px" onclick="loadRaidEntry(${entry.id})">Load</button>
          <button class="btn" style="font-size:11px;padding:3px 10px;color:#e07070;border-color:#e07070" onclick="deleteRaidEntry(${entry.id})">✕</button>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${preview}${playerCount > 8 ? `<span style="font-size:10px;color:var(--text3)"> +${playerCount - 8} more</span>` : ''}</div>
    </div>`;
  }).join('');
}

function loadRaidEntry(id) {
  if (!_li) { alert('Please login as officer to load rosters.'); return; }
  const archive = getRaidArchive();
  const entry = archive.find(e => e.id === id);
  if (!entry) return;
  if (!confirm(`Load "${entry.name}"? This will replace your current groups.`)) return;
  groups = entry.groups;
  save();
  renderRaid();
  // Close archive panel
  document.getElementById('raid-archive-panel').style.display = 'none';
}

function deleteRaidEntry(id) {
  if (!_li) return;
  const archive = getRaidArchive();
  const entry = archive.find(e => e.id === id);
  if (!entry) return;
  if (!confirm(`Delete "${entry.name}"?`)) return;
  const updated = archive.filter(e => e.id !== id);
  saveRaidArchive(updated);
  renderRaidArchive();
}

// Close save modal on backdrop click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('save-raid-modal');
  if (modal && e.target === modal) closeSaveRaidModal();
});


// Drag handlers
function onBenchDragStart(e, memberId) {
  if (!_li) { e.preventDefault(); return; }
  dragSource = { type: 'bench', memberId };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function onSlotDragStart(e, gi, si) {
  if (!_li) { e.preventDefault(); return; }
  const s = groups[gi][si];
  if (!s) return;
  dragSource = { type: 'slot', memberId: s.id, groupIdx: gi, slotIdx: si };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.stopPropagation();
}
function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
}
function onGroupDragOver(e, gi) {
  e.preventDefault();
  document.getElementById('group-' + gi).classList.add('drag-over');
}
function onGroupDragLeave(gi) {
  document.getElementById('group-' + gi).classList.remove('drag-over');
}
function onGroupDrop(e, gi) {
  e.preventDefault();
  document.getElementById('group-' + gi).classList.remove('drag-over');
  if (!_li || !dragSource) return;
  // Find first empty slot
  const emptySlot = groups[gi].findIndex(s => !s);
  if (emptySlot === -1) return; // group full
  dropIntoSlot(gi, emptySlot);
}
function onSlotDrop(e, gi, si) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('group-' + gi)?.classList.remove('drag-over');
  if (!_li || !dragSource) return;
  dropIntoSlot(gi, si);
}

function dropIntoSlot(gi, si) {
  if (!_li) return;
  if (!dragSource) return;
  const existing = groups[gi][si];
  if (dragSource.type === 'bench') {
    if (existing) {
      // swap: put existing back to bench (just remove from slot)
      groups[gi][si] = null;
    }
    // remove member from any other slot they might be in
    groups = groups.map((g, gIdx) => g.map((s, sIdx) => {
      if (s && s.id === dragSource.memberId && !(gIdx === gi && sIdx === si)) return null;
      return s;
    }));
    groups[gi][si] = { id: dragSource.memberId };
  } else if (dragSource.type === 'slot') {
    const srcGi = dragSource.groupIdx, srcSi = dragSource.slotIdx;
    if (srcGi === gi && srcSi === si) { dragSource = null; return; }
    // swap
    const tmp = groups[gi][si];
    groups[gi][si] = groups[srcGi][srcSi];
    groups[srcGi][srcSi] = tmp;
  }
  dragSource = null;
  save();
  renderRaid();
}

function removeFromSlot(gi, si) {
  groups[gi][si] = null;
  save();
  renderRaid();
}

function clearRaid() {
  if (!confirm('Clear all raid groups?')) return;
  groups = Array.from({length:8}, () => Array(5).fill(null));
  benchedIds = [];
  save(); renderRaid();
}

async function exportImage() {
  const btn = document.getElementById('print-btn');
  btn.textContent = '⏳ Generating...';
  btn.disabled = true;

  // Load html2canvas if not already loaded
  if (!window.html2canvas) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // Build a clean off-screen render of just the groups
  const date = new Date().toLocaleDateString('en-GB', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
  const filledGroups = groups.map((grp, gi) => {
    const slots = grp.map((s, si) => {
      if (!s) return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#1a1a24;border:1px dashed rgba(255,255,255,0.08);border-radius:5px;opacity:0.35"><span style="font-size:11px;color:#5c5a6a">Empty</span></div>`;
      const m = getMemberById(s.id); if (!m) return '';
      const cc = CM[m.cls] || {color:'#888'};
      const icon = specIcon(m.cls, m.spec);
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#1e1e2e;border:1px solid rgba(255,255,255,0.1);border-radius:5px">
        <img src="${icon}" style="width:24px;height:24px;border-radius:4px;flex-shrink:0" crossorigin="anonymous">
        <span style="font-size:13px;font-weight:600;color:${cc.color};flex:1">${m.name}</span>
        <span style="font-size:10px;color:#5c5a6a">${m.spec||m.cls}</span>
      </div>`;
    }).join('');
    return `<div style="background:#16161d;border:1px solid rgba(255,255,255,0.1);border-radius:8px;overflow:hidden;break-inside:avoid">
      <div style="background:#1e1e28;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#c8a84b;letter-spacing:0.05em">Group ${gi+1}</span>
        <span style="font-size:10px;color:#5c5a6a">${grp.filter(Boolean).length}/5</span>
      </div>
      <div style="padding:8px;display:flex;flex-direction:column;gap:4px">${slots}</div>
    </div>`;
  }).join('');

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;background:#0e0e12;padding:24px;font-family:Exo 2,sans-serif;width:960px';

  // Build benched section if any
  const benchedMembers = members.filter(m => benchedIds.includes(m.id));
  const benchedHTML = benchedMembers.length ? (() => {
    const slots = benchedMembers.map(m => {
      const cc = CM[m.cls] || {color:'#888'};
      const icon = specIcon(m.cls, m.spec);
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#1e1a10;border:1px solid rgba(200,168,75,0.15);border-radius:5px">
        <img src="${icon}" style="width:24px;height:24px;border-radius:4px;flex-shrink:0" crossorigin="anonymous">
        <span style="font-size:13px;font-weight:600;color:${cc.color};flex:1">${m.name}</span>
        <span style="font-size:10px;color:#5c5a6a">${m.spec||m.cls}</span>
      </div>`;
    }).join('');
    return `<div style="margin-top:14px;background:#16161d;border:1px solid rgba(200,168,75,0.25);border-radius:8px;overflow:hidden">
      <div style="background:#1e1a10;padding:8px 12px;border-bottom:1px solid rgba(200,168,75,0.15);display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#c8a84b;letter-spacing:0.05em">Benched</span>
        <span style="font-size:10px;color:#5c5a6a">${benchedMembers.length}</span>
      </div>
      <div style="padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px">${slots}</div>
    </div>`;
  })() : '';

  wrap.innerHTML = `
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:16px;border-bottom:1px solid #c8a84b;padding-bottom:12px">
      <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#f0d070">⚔ Raid Roster</span>
      <span style="font-size:12px;color:#5c5a6a">${date}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-items:start">${filledGroups}</div>
    ${benchedHTML}
  `;
  document.body.appendChild(wrap);

  try {
    // Wait for images to load
    await Promise.all([...wrap.querySelectorAll('img')].map(img =>
      img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
    ));

    const canvas = await html2canvas(wrap, {
      backgroundColor: '#0e0e12',
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `raid-roster-${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch(e) {
    alert('Could not generate image. Try right-clicking the raid groups and saving as screenshot instead.');
    console.error(e);
  } finally {
    document.body.removeChild(wrap);
    btn.textContent = '📷 Export as Image';
    btn.disabled = false;
  }
}
