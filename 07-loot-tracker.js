// ══════════════════════════════════════════════════════════════════════════════
// LOOT TRACKER
// ══════════════════════════════════════════════════════════════════════════════

const WOWHEAD_TOOLTIP = 'https://nether.wowhead.com/tbc/tooltip/item/';
const WOWHEAD_ICON    = 'https://wow.zamimg.com/images/wow/icons/medium/';
const WOWHEAD_ITEM    = 'https://www.wowhead.com/tbc/item=';

// Quality colour classes
const QUALITY_CLASS = { 0:'q1', 1:'q1', 2:'q2', 3:'q3', 4:'q4', 5:'q5' };
const QUALITY_NAME  = { 0:'Poor', 1:'Common', 2:'Uncommon', 3:'Rare', 4:'Epic', 5:'Legendary' };

let _lootData    = [];   // all parsed entries
let _itemCache   = {};   // itemID → { name, quality, icon }
let _lootView    = 'overview';

// ── Member lookup (handles name mismatches between loot exports and roster) ──
function findMemberByLootName(name) {
  if (!name || name === '_disenchanted') return null;
  const lower = name.toLowerCase();
  // Exact match first
  let m = members.find(m => m.name.toLowerCase() === lower);
  if (m) return m;
  // Fuzzy: find member whose name is most similar (handles Bahlldos vs Bhalldos etc)
  // Use Levenshtein-style: find shortest edit distance
  let best = null, bestDist = Infinity;
  members.forEach(mem => {
    const dist = levenshtein(lower, mem.name.toLowerCase());
    if (dist < bestDist && dist <= 3) { bestDist = dist; best = mem; }
  });
  return best;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i===0?j:j===0?i:0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

// ── Storage ──────────────────────────────────────────────────────────────────

function loadLootData() {
  try { _lootData = JSON.parse(localStorage.getItem('gm_loot') || '[]'); } 
  catch(e) { _lootData = []; }
}

function saveLootData() {
  localStorage.setItem('gm_loot', JSON.stringify(_lootData));
  sbSet('loot', { entries: _lootData, itemCache: _itemCache }).catch(() => {});
}

function loadItemCache() {
  try { _itemCache = JSON.parse(localStorage.getItem('gm_loot_cache') || '{}'); }
  catch(e) { _itemCache = {}; }
}

function saveItemCache() {
  localStorage.setItem('gm_loot_cache', JSON.stringify(_itemCache));
}

// ── CSV Import ────────────────────────────────────────────────────────────────

function showLootPasteModal() {
  document.getElementById('loot-paste-input').value = '';
  document.getElementById('loot-paste-status').textContent = '';
  document.getElementById('loot-paste-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('loot-paste-input').focus(), 50);
}

function closeLootPasteModal() {
  document.getElementById('loot-paste-modal').style.display = 'none';
}

async function handleLootPaste() {
  const text = document.getElementById('loot-paste-input').value.trim();
  const statusEl = document.getElementById('loot-paste-status');
  if (!text) { statusEl.style.color = '#e07070'; statusEl.textContent = 'Please paste some data first.'; return; }
  statusEl.style.color = 'var(--text3)';
  statusEl.textContent = '⟳ Processing...';
  await importLootText(text);
}

function handleLootFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    document.getElementById('loot-paste-input').value = e.target.result;
    document.getElementById('loot-paste-status').style.color = 'var(--text3)';
    document.getElementById('loot-paste-status').textContent = `✓ File loaded: ${file.name} — click Import to continue`;
  };
  reader.readAsText(file);
  event.target.value = '';
}

async function importLootText(text) {
  if (!_li) { alert('Please login as officer to import loot data.'); closeLootPasteModal(); return; }
  const statusEl = document.getElementById('loot-paste-status');
  const newEntries = parseLootCSV(text);
  if (!newEntries.length) {
    statusEl.style.color = '#e07070';
    statusEl.textContent = '⚠ No valid loot entries found. Make sure to include the header row.';
    return;
  }
  const existing = new Set(_lootData.map(e => e.id));
  const candidates = newEntries.filter(e => !existing.has(e.id));

  // Fetch item quality for new entries before filtering
  statusEl.style.color = 'var(--text3)';
  statusEl.textContent = `⟳ Fetching item data... (${candidates.length} entries)`;
  await fetchMissingItems(candidates.map(e => e.itemID));

  // Keep only Epic (4) or Legendary (5) items -- always keep Nether Vortex (30183)
  const ALWAYS_KEEP = new Set([30183]);
  const added = candidates.filter(e => {
    if (ALWAYS_KEEP.has(e.itemID)) return true;
    const quality = _itemCache[e.itemID]?.quality ?? 0;
    return quality >= 4;
  });
  const filteredOut = candidates.length - added.length;

  _lootData = [..._lootData, ...added];
  _lootData.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  saveLootData();

  await fetchMissingItems(_lootData.map(e => e.itemID));
  renderLootPage();
  closeLootPasteModal();
  const skippedMsg = newEntries.length - candidates.length > 0 ? ` · ${newEntries.length - candidates.length} duplicates skipped` : '';
  const filteredMsg = filteredOut > 0 ? ` · ${filteredOut} non-epic filtered` : '';
  showToast(`✓ Imported ${added.length} entries${skippedMsg}${filteredMsg}`);
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  const m = document.getElementById('loot-paste-modal');
  if (m && e.target === m) closeLootPasteModal();
});

// ── Manual Loot Entry ─────────────────────────────────────────────────────────

let _manualLootItemID = null;

function showManualLootModal() {
  if (!_li) { alert('Please login as officer to add loot entries.'); return; }

  // Populate character select from roster
  const sel = document.getElementById('manual-loot-character');
  sel.innerHTML = '<option value="">— Select player —</option>' +
    members.slice().sort((a,b) => a.name.localeCompare(b.name))
      .map(m => `<option value="${m.name}">${m.name} (${m.spec || m.cls})</option>`)
      .join('') +
    '<option value="_disenchanted">✨ Disenchanted</option>';

  // Default to today's date
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('manual-loot-date').value = today;
  document.getElementById('manual-loot-item').value = '';
  document.getElementById('manual-loot-note').value = '';
  document.getElementById('manual-loot-status').textContent = '';
  document.getElementById('manual-loot-offspec').value = '0';
  document.getElementById('manual-loot-preview').style.display = 'none';
  _manualLootItemID = null;

  document.getElementById('loot-manual-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('manual-loot-item').focus(), 50);
}

function closeManualLootModal() {
  document.getElementById('loot-manual-modal').style.display = 'none';
}

document.addEventListener('click', function(e) {
  const m = document.getElementById('loot-manual-modal');
  if (m && e.target === m) closeManualLootModal();
});

async function manualLootLookup() {
  const raw = document.getElementById('manual-loot-item').value.trim();
  const statusEl = document.getElementById('manual-loot-status');
  if (!raw) { statusEl.style.color = '#e07070'; statusEl.textContent = 'Please enter an item ID or URL.'; return; }

  // Extract numeric item ID from raw input (handles plain IDs and full WoWHead URLs)
  const match = raw.match(/(\d{4,})/);
  if (!match) { statusEl.style.color = '#e07070'; statusEl.textContent = '⚠ Could not find an item ID. Enter a number like 28789 or paste a WoWHead URL.'; return; }

  const itemID = parseInt(match[1]);
  statusEl.style.color = 'var(--text3)';
  statusEl.textContent = '⟳ Fetching item info...';

  try {
    if (!_itemCache[itemID]) {
      const r = await fetch(WOWHEAD_TOOLTIP + itemID);
      const d = await r.json();
      _itemCache[itemID] = { name: d.name || 'Unknown Item', quality: d.quality ?? 1, icon: d.icon || 'inv_misc_questionmark' };
      saveItemCache();
    }
    const item = _itemCache[itemID];
    const qc = QUALITY_CLASS[item.quality ?? 1];
    const iconUrl = `${WOWHEAD_ICON}${item.icon}.jpg`;

    document.getElementById('manual-loot-icon').src = iconUrl;
    document.getElementById('manual-loot-name').innerHTML = `<span class="${qc}">${item.name}</span>`;
    document.getElementById('manual-loot-meta').textContent = `Item ID: ${itemID} · ${QUALITY_NAME[item.quality ?? 1]}`;
    document.getElementById('manual-loot-preview').style.display = 'flex';
    statusEl.textContent = '';
    _manualLootItemID = itemID;
  } catch(e) {
    statusEl.style.color = '#e07070';
    statusEl.textContent = '⚠ Could not fetch item info. Check the ID and try again.';
    _manualLootItemID = null;
  }
}

async function submitManualLootEntry() {
  const statusEl = document.getElementById('manual-loot-status');
  const character = document.getElementById('manual-loot-character').value.trim();
  const date = document.getElementById('manual-loot-date').value.trim();
  const offspec = document.getElementById('manual-loot-offspec').value === '1';

  if (!character) { statusEl.style.color = '#e07070'; statusEl.textContent = '⚠ Please select a character.'; return; }
  if (!date)      { statusEl.style.color = '#e07070'; statusEl.textContent = '⚠ Please enter a date.'; return; }
  if (!_manualLootItemID) {
    // Try to look up first if user hasn't yet
    await manualLootLookup();
    if (!_manualLootItemID) return;
  }

  const entry = {
    dateTime: date,
    character,
    itemID: _manualLootItemID,
    offspec,
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    manual: true,
  };

  _lootData.push(entry);
  _lootData.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  saveLootData();
  renderLootPage();
  closeManualLootModal();

  const item = _itemCache[_manualLootItemID];
  showToast(`✓ Added ${item?.name || 'item'} → ${character === '_disenchanted' ? 'Disenchanted' : character}`);
}

function parseLootCSV(text) {
  const lines = text.trim().split('\n');
  const entries = [];

  // Split a CSV line correctly, handling quoted fields
  function splitCSVLine(line) {
    const result = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"') {
          if (line[i+1] === '"') { cur += '"'; i++; } // escaped quote
          else inQ = false;
        } else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { result.push(cur.trim()); cur = ''; }
        else cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  // Detect format from header row
  // New Gargul format: date,itemId,itemName,winner,method,offspec,uid
  // Old format:        dateTime,character,itemID,offspec,id
  let isNewFormat = false;
  let headerIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const l = lines[i].trim().toLowerCase();
    if (l.startsWith('#') || !l) continue;
    if (l.includes('itemid') && l.includes('winner') && l.includes('method')) {
      isNewFormat = true;
      headerIdx = i;
    } else if (l.includes('itemid') || l.includes('datetime') || l.includes('character')) {
      headerIdx = i;
    }
    if (headerIdx >= 0) break;
  }

  for (let i = (headerIdx >= 0 ? headerIdx + 1 : 0); i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    // Split respecting quoted fields
    const parts = splitCSVLine(line);

    if (isNewFormat) {
      // date,itemId,itemName,winner,method,offspec,uid
      if (parts.length < 7) continue;
      const [date, itemId, , winner, method, offspecVal, uid] = parts;
      const parsedItemID = parseInt(itemId);
      if (!parsedItemID || isNaN(parsedItemID)) continue;

      // Skip rows with no winner or method=none (item dropped but not awarded)
      const winnerClean = winner.trim();
      const methodClean = method.trim().toLowerCase();
      if (!winnerClean || methodClean === 'none') continue;

      entries.push({
        dateTime: date.trim(),
        character: winnerClean,
        itemID: parsedItemID,
        offspec: parseInt(offspecVal) === 1 || methodClean === 'os_roll',
        id: uid.trim(),
      });
    } else {
      // Old format: dateTime,character,itemID,offspec,id
      if (parts.length < 5) continue;
      const [dateTime, character, itemID, offspec, id] = parts;
      const parsedItemID = parseInt(itemID);
      if (!parsedItemID || isNaN(parsedItemID)) continue;
      if (!dateTime || !character) continue;
      entries.push({
        dateTime: dateTime.trim(),
        character: character.trim(),
        itemID: parsedItemID,
        offspec: parseInt(offspec) === 1,
        id: id?.trim(),
      });
    }
  }
  return entries;
}
// ── Item data fetching ────────────────────────────────────────────────────────

async function fetchMissingItems(itemIDs) {
  const unique = [...new Set(itemIDs)].filter(id => !_itemCache[id]);
  if (!unique.length) return;
  // Fetch in batches of 5 to avoid hammering the API
  for (let i = 0; i < unique.length; i += 5) {
    const batch = unique.slice(i, i + 5);
    await Promise.all(batch.map(async (id) => {
      try {
        const r = await fetch(WOWHEAD_TOOLTIP + id);
        const d = await r.json();
        _itemCache[id] = { name: d.name || 'Unknown Item', quality: d.quality ?? 1, icon: d.icon || 'inv_misc_questionmark' };
      } catch(e) {
        _itemCache[id] = { name: 'Item #' + id, quality: 1, icon: 'inv_misc_questionmark' };
      }
    }));
    saveItemCache();
  }
}

// ── Page render ───────────────────────────────────────────────────────────────

async function initLoot() {
  loadLootData();
  loadItemCache();
  await fetchMissingItems(_lootData.map(e => e.itemID));
  renderLootPage();
}

function renderLootPage() {
  const empty = document.getElementById('loot-empty-state');
  const cards = document.getElementById('loot-summary-cards');

  if (!_lootData.length) {
    empty.style.display = 'block';
    cards.innerHTML = '';
    document.getElementById('loot-view-overview').innerHTML = '';
    document.getElementById('loot-view-history').innerHTML = '';
    document.getElementById('loot-view-perplayer').innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  renderLootSummaryCards();
  renderCurrentLootView();
}

function renderLootSummaryCards() {
  const real = _lootData.filter(e => e.character !== '_disenchanted');
  const ms   = real.filter(e => !e.offspec);
  const os   = real.filter(e => e.offspec);
  const de   = _lootData.filter(e => e.character === '_disenchanted');
  const sessions = new Set(_lootData.map(e => e.dateTime)).size;
  const players  = new Set(real.map(e => e.character)).size;

  const cards = [
    { label: 'Total Items',    value: real.length,     icon: '⚔' },
    { label: 'Main Spec',      value: ms.length,       icon: '🏆' },
    { label: 'Off Spec',       value: os.length,       icon: '📦' },
    { label: 'Disenchanted',   value: de.length,       icon: '✨' },
    { label: 'Raid Sessions',  value: sessions,        icon: '📅' },
    { label: 'Players Looted', value: players,         icon: '👥' },
  ];
  document.getElementById('loot-summary-cards').innerHTML = cards.map(c =>
    `<div class="stat-card" style="min-width:110px">
      <div class="lbl">${c.icon} ${c.label}</div>
      <div class="val">${c.value}</div>
    </div>`
  ).join('');
}

function setLootView(view, btn) {
  _lootView = view;
  document.querySelectorAll('.loot-view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['overview','history','perplayer','stats','manage'].forEach(v => {
    document.getElementById('loot-view-' + v).style.display = v === view ? 'block' : 'none';
  });
  renderCurrentLootView();
}

function renderCurrentLootView() {
  if (_lootView === 'overview')  renderLootOverview();
  if (_lootView === 'history')   renderLootHistory();
  if (_lootView === 'perplayer') renderLootPerPlayer();
  if (_lootView === 'stats')     renderLootStats();
  if (_lootView === 'manage')    renderLootManage();
  // Re-process data-wowhead attributes on dynamically rendered item links
  if (window.WH && WH.Tooltips) WH.Tooltips.refreshLinks();
}

// ── Overview view ─────────────────────────────────────────────────────────────

function renderLootOverview() {
  const el = document.getElementById('loot-view-overview');
  const real = _lootData.filter(e => e.character !== '_disenchanted');

  // Count per player
  const playerMap = {};
  real.forEach(e => {
    if (!playerMap[e.character]) playerMap[e.character] = { ms: 0, os: 0, items: [] };
    if (e.offspec) playerMap[e.character].os++;
    else           playerMap[e.character].ms++;
    playerMap[e.character].items.push(e);
  });

  const sorted = Object.entries(playerMap).sort((a, b) => (b[1].ms + b[1].os) - (a[1].ms + a[1].os));
  const maxTotal = sorted[0]?.[1].ms + sorted[0]?.[1].os || 1;

  // Group by session date
  const sessions = {};
  _lootData.forEach(e => {
    if (!sessions[e.dateTime]) sessions[e.dateTime] = [];
    sessions[e.dateTime].push(e);
  });

  let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">';

  // Left: loot distribution per player
  html += '<div>';
  html += '<div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:12px;letter-spacing:0.05em">LOOT DISTRIBUTION</div>';
  html += sorted.map(([name, data]) => {
    const total = data.ms + data.os;
    const pct   = Math.round((total / maxTotal) * 100);
    const member = findMemberByLootName(name);
    const color  = member ? (CM[member.cls]?.color || '#888') : '#888';
    return `<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:12px;font-weight:600;color:${color}">${name}</span>
        <span style="font-size:11px;color:var(--text3)">${data.ms} MS${data.os ? ` · ${data.os} OS` : ''}</span>
      </div>
      <div style="background:var(--bg3);border-radius:3px;height:6px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${color};opacity:0.8;border-radius:3px;transition:width .3s"></div>
      </div>
    </div>`;
  }).join('');
  html += '</div>';

  // Right: sessions
  html += '<div>';
  html += '<div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:12px;letter-spacing:0.05em">RAID SESSIONS</div>';
  Object.entries(sessions).sort((a,b) => b[0].localeCompare(a[0])).forEach(([date, entries]) => {
    const real2 = entries.filter(e => e.character !== '_disenchanted');
    const de2   = entries.filter(e => e.character === '_disenchanted');
    html += `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:10px 14px;margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-family:'Cinzel',serif;font-size:12px;color:var(--gold)">${date}</span>
        <span style="font-size:11px;color:var(--text3)">${real2.length} items awarded${de2.length ? ` · ${de2.length} DE'd` : ''}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${real2.map(e => {
          const item = _itemCache[e.itemID] || {};
          const qc = QUALITY_CLASS[item.quality ?? 1];
          return `<a href="${WOWHEAD_ITEM}${e.itemID}" target="_blank" data-wowhead="item=${e.itemID}&domain=tbc"
            style="font-size:10px;text-decoration:none;padding:2px 7px;border-radius:3px;background:rgba(0,0,0,0.3)"
            class="${qc}">${item.name || 'Item #' + e.itemID}${e.offspec ? ' <span style="opacity:0.6">(OS)</span>' : ''}</a>`;
        }).join('')}
      </div>
    </div>`;
  });
  html += '</div></div>';

  el.innerHTML = html;
}

// ── History view ──────────────────────────────────────────────────────────────

function renderLootHistory() {
  const el = document.getElementById('loot-view-history');

  // Read current filter values BEFORE rebuilding the DOM
  const playerFilter = document.getElementById('loot-filter-player')?.value || 'All';
  const dateFilter   = document.getElementById('loot-filter-date')?.value || 'All';
  const msOnly       = document.getElementById('loot-filter-ms')?.checked || false;

  // Filter controls
  const players = ['All', ...[...new Set(_lootData.map(e => e.character))].sort().map(p => p === '_disenchanted' ? 'Disenchanted' : p)];
  const dates   = ['All', ...[...new Set(_lootData.map(e => e.dateTime))].sort().reverse()];

  let html = `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center">
    <select id="loot-filter-player" onchange="renderLootHistory()" style="background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);padding:5px 10px;font-family:'Exo 2',sans-serif;font-size:12px">
      ${players.map(p => `<option${p === playerFilter ? ' selected' : ''}>${p}</option>`).join('')}
    </select>
    <select id="loot-filter-date" onchange="renderLootHistory()" style="background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);padding:5px 10px;font-family:'Exo 2',sans-serif;font-size:12px">
      ${dates.map(d => `<option${d === dateFilter ? ' selected' : ''}>${d}</option>`).join('')}
    </select>
    <label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px;cursor:pointer">
      <input type="checkbox" id="loot-filter-ms" onchange="renderLootHistory()"${msOnly ? ' checked' : ''}> Main Spec only
    </label>
  </div>`;

  let filtered = _lootData;
  if (playerFilter !== 'All') filtered = filtered.filter(e => (playerFilter === 'Disenchanted' ? e.character === '_disenchanted' : e.character === playerFilter));
  if (dateFilter   !== 'All') filtered = filtered.filter(e => e.dateTime === dateFilter);
  if (msOnly)                 filtered = filtered.filter(e => !e.offspec);

  html += `<div class="loot-header">
    <span>Date</span><span></span><span>Item</span><span>Player</span><span>Spec</span><span>Type</span>
  </div>`;

  html += filtered.map(e => {
    const item   = _itemCache[e.itemID] || {};
    const qc     = QUALITY_CLASS[item.quality ?? 1];
    const icon   = item.icon ? `${WOWHEAD_ICON}${item.icon}.jpg` : '';
    const member = findMemberByLootName(e.character);
    const color  = member ? (CM[member.cls]?.color || '#888') : (e.character === '_disenchanted' ? '#9896a4' : '#888');
    const displayName = e.character === '_disenchanted' ? '✨ Disenchanted' : e.character;
    return `<div class="loot-row ${e.offspec ? 'offspec' : ''}">
      <span style="color:var(--text3)">${e.dateTime}</span>
      <span>${icon ? `<img src="${icon}" style="width:24px;height:24px;border-radius:3px;display:block" onerror="this.style.display='none'">` : ''}</span>
      <span><a href="${WOWHEAD_ITEM}${e.itemID}" target="_blank" data-wowhead="item=${e.itemID}&domain=tbc" class="${qc}" style="text-decoration:none;font-weight:500">${item.name || 'Item #' + e.itemID}</a></span>
      <span style="font-weight:600;color:${color}">${displayName}</span>
      <span style="color:var(--text3)">${member?.spec || member?.cls || ''}</span>
      <span>${e.character === '_disenchanted'
        ? '<span style="font-size:10px;color:#e0a040;background:rgba(224,160,64,0.1);padding:2px 7px;border-radius:10px">Disenchanted</span>'
        : e.offspec 
          ? '<span style="font-size:10px;color:#9896a4;background:rgba(255,255,255,0.07);padding:2px 7px;border-radius:10px">Off Spec</span>'
          : '<span style="font-size:10px;color:#80d080;background:rgba(128,208,128,0.1);padding:2px 7px;border-radius:10px">Main Spec</span>'
      }${e.manual ? ' <span style="font-size:9px;color:#a0a0d0;background:rgba(160,160,208,0.1);padding:1px 5px;border-radius:8px;border:1px solid rgba(160,160,208,0.25)" title="Added manually">✏</span>' : ''}</span>
    </div>`;
  }).join('') || '<div style="color:var(--text3);font-size:12px;padding:16px">No entries match the current filters.</div>';

  el.innerHTML = html;
}

// ── Per Player view ────────────────────────────────────────────────────────────

function renderLootPerPlayer() {
  const el = document.getElementById('loot-view-perplayer');
  const real = _lootData.filter(e => e.character !== '_disenchanted');
  const deEntries = _lootData.filter(e => e.character === '_disenchanted');

  const playerMap = {};
  real.forEach(e => {
    if (!playerMap[e.character]) playerMap[e.character] = [];
    playerMap[e.character].push(e);
  });

  const sorted = Object.entries(playerMap).sort((a,b) => b[1].length - a[1].length);

  const makeItemRow = (e) => {
    const item = _itemCache[e.itemID] || {};
    const qc   = QUALITY_CLASS[item.quality ?? 1];
    const ico  = item.icon ? `${WOWHEAD_ICON}${item.icon}.jpg` : '';
    const isDE = e.character === '_disenchanted';
    const badge = isDE
      ? '<span style="font-size:10px;color:#e0a040;background:rgba(224,160,64,0.1);padding:1px 6px;border-radius:8px;flex-shrink:0">DE</span>'
      : e.offspec
        ? '<span style="font-size:10px;color:#9896a4;background:rgba(255,255,255,0.07);padding:1px 6px;border-radius:8px;flex-shrink:0">OS</span>'
        : '<span style="font-size:10px;color:#80d080;background:rgba(128,208,128,0.1);padding:1px 6px;border-radius:8px;flex-shrink:0">MS</span>';
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
      ${ico ? `<img src="${ico}" style="width:22px;height:22px;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">` : ''}
      <a href="${WOWHEAD_ITEM}${e.itemID}" target="_blank" data-wowhead="item=${e.itemID}&domain=tbc" class="${qc}" style="text-decoration:none;font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name || 'Item #' + e.itemID}</a>
      <span style="font-size:10px;color:var(--text3);flex-shrink:0">${e.dateTime}</span>
      ${badge}
    </div>`;
  };

  // Player cards
  let html = sorted.map(([name, entries]) => {
    const member = findMemberByLootName(name);
    const color  = member ? (CM[member.cls]?.color || '#888') : '#888';
    const ms = entries.filter(e => !e.offspec).length;
    const os = entries.filter(e =>  e.offspec).length;
    const icon = member ? specIcon(member.cls, member.spec) : '';
    return `<div class="loot-player-bar">
      <div class="loot-player-bar-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        ${icon ? `<img src="${icon}" style="width:28px;height:28px;border-radius:50%;flex-shrink:0" onerror="this.style.display='none'">` : ''}
        <span style="font-size:14px;font-weight:700;color:${color};flex:1">${name}</span>
        <span style="font-size:11px;color:var(--text3);margin-right:8px">${member?.spec || member?.cls || ''}</span>
        <span style="font-size:11px;background:rgba(128,208,128,0.1);color:#80d080;padding:2px 8px;border-radius:10px;margin-right:4px">${ms} MS</span>
        ${os ? `<span style="font-size:11px;background:rgba(255,255,255,0.07);color:#9896a4;padding:2px 8px;border-radius:10px;margin-right:4px">${os} OS</span>` : ''}
        <span style="font-size:11px;color:var(--text3)">${entries.length} total ▾</span>
      </div>
      <div style="display:none;padding:4px 14px 10px">
        ${entries.map(e => makeItemRow(e)).join('')}
      </div>
    </div>`;
  }).join('');

  // Disenchanted section at the bottom
  if (deEntries.length) {
    html += `<div class="loot-player-bar" style="border-color:rgba(224,160,64,0.3)">
      <div class="loot-player-bar-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        <span style="font-size:18px;flex-shrink:0">✨</span>
        <span style="font-size:14px;font-weight:700;color:#e0a040;flex:1">Disenchanted</span>
        <span style="font-size:11px;background:rgba(224,160,64,0.1);color:#e0a040;padding:2px 8px;border-radius:10px;margin-right:4px">${deEntries.length} DE</span>
        <span style="font-size:11px;color:var(--text3)">nobody wanted these ▾</span>
      </div>
      <div style="display:none;padding:4px 14px 10px">
        ${deEntries.map(e => makeItemRow(e)).join('')}
      </div>
    </div>`;
  }

  el.innerHTML = html || '<div style="color:var(--text3);font-size:12px;padding:16px">No data.</div>';
}


// ── Utilities ─────────────────────────────────────────────────────────────────

// ── Stats view ─────────────────────────────────────────────────────────────

function renderLootStats() {
  const el = document.getElementById('loot-view-stats');
  const real = _lootData.filter(e => e.character !== '_disenchanted');
  if (!real.length) { el.innerHTML = '<div style="color:var(--text3);padding:16px">No data yet.</div>'; return; }

  const sessions = [...new Set(_lootData.map(e => e.dateTime))].sort();
  const msItems  = real.filter(e => !e.offspec);
  const osItems  = real.filter(e =>  e.offspec);
  const deItems  = _lootData.filter(e => e.character === '_disenchanted');
  const totalAll = real.length + deItems.length;

  const playerMS = {}, playerOS = {};
  real.forEach(e => {
    if (!e.offspec) playerMS[e.character] = (playerMS[e.character]||0) + 1;
    else            playerOS[e.character] = (playerOS[e.character]||0) + 1;
  });
  const allPlayers = [...new Set(real.map(e => e.character))].sort((a,b) =>
    ((playerMS[b]||0)+(playerOS[b]||0)) - ((playerMS[a]||0)+(playerOS[a]||0))
  );
  const sessionCounts = {};
  sessions.forEach(s => {
    const sr = real.filter(e => e.dateTime === s);
    sessionCounts[s] = { ms: sr.filter(e=>!e.offspec).length, os: sr.filter(e=>e.offspec).length };
  });
  const itemDetail = {};
  _lootData.forEach(e => {
    if (!itemDetail[e.itemID]) itemDetail[e.itemID] = { ms:0, os:0, de:0 };
    if (e.character === '_disenchanted') itemDetail[e.itemID].de++;
    else if (e.offspec)                  itemDetail[e.itemID].os++;
    else                                 itemDetail[e.itemID].ms++;
  });
  const top15 = Object.entries(itemDetail)
    .map(([id,d]) => [id, d, d.ms+d.os+d.de])
    .sort((a,b) => b[2]-a[2]).slice(0,15);
  const itemCount = {};
  real.forEach(e => { itemCount[e.itemID] = (itemCount[e.itemID]||0)+1; });

  const SVG = (w, h, content) =>
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:${h}px;overflow:visible">${content}</svg>`;

  // Player bar chart
  const BAR_H=28, BAR_GAP=6, BAR_LABEL=120, BAR_W=340;
  const maxTotal = Math.max(...allPlayers.map(p => (playerMS[p]||0)+(playerOS[p]||0)));
  const playerBars = allPlayers.map((p,i) => {
    const ms=playerMS[p]||0, os=playerOS[p]||0, total=ms+os;
    const member = findMemberByLootName(p);
    const color  = member ? (CM[member.cls]?.color||'#888') : '#888';
    const msW = Math.round((ms/maxTotal)*BAR_W);
    const osW = Math.round((os/maxTotal)*BAR_W);
    const y = i*(BAR_H+BAR_GAP);
    return `<text x="${BAR_LABEL-8}" y="${y+BAR_H/2+5}" text-anchor="end" fill="${color}" font-size="12" font-family="Exo 2,sans-serif" font-weight="600">${p}</text>
      <rect x="${BAR_LABEL}" y="${y}" width="${msW}" height="${BAR_H}" fill="${color}" opacity="0.85" rx="3"/>
      ${os>0?`<rect x="${BAR_LABEL+msW}" y="${y}" width="${osW}" height="${BAR_H}" fill="${color}" opacity="0.35" rx="3"/>`:''}
      <text x="${BAR_LABEL+msW+osW+6}" y="${y+BAR_H/2+5}" fill="#9896a4" font-size="11" font-family="Exo 2,sans-serif">${total} (${ms}MS${os?` · ${os}OS`:''})</text>`;
  }).join('');
  const playerChart = SVG(BAR_LABEL+BAR_W+100, allPlayers.length*(BAR_H+BAR_GAP), playerBars);

  // Session bar chart
  const SB_W=36, SB_GAP=14, SB_MAX_H=100;
  const maxSess = Math.max(...sessions.map(s => sessionCounts[s].ms+sessionCounts[s].os), 1);
  const sessionBars = sessions.map((s,i) => {
    const {ms,os} = sessionCounts[s]; const total=ms+os;
    const msH=Math.round((ms/maxSess)*SB_MAX_H), osH=Math.round((os/maxSess)*SB_MAX_H);
    const x=i*(SB_W+SB_GAP);
    return `<rect x="${x}" y="${SB_MAX_H-msH}" width="${SB_W*0.6}" height="${msH}" fill="#80d080" opacity="0.85" rx="2"/>
      ${os>0?`<rect x="${x+SB_W*0.6+2}" y="${SB_MAX_H-osH}" width="${SB_W*0.35}" height="${osH}" fill="#9896a4" opacity="0.85" rx="2"/>`:''}
      <text x="${x+SB_W/2}" y="${SB_MAX_H+14}" text-anchor="middle" fill="#9896a4" font-size="9" font-family="Exo 2,sans-serif">${s.slice(5)}</text>
      <text x="${x+SB_W/2}" y="${SB_MAX_H-msH-4}" text-anchor="middle" fill="#ccc" font-size="10" font-family="Exo 2,sans-serif">${total}</text>`;
  }).join('');
  const sessionChart = SVG(Math.max(sessions.length*(SB_W+SB_GAP),300), SB_MAX_H+30, sessionBars);

  // Donut
  function pCart(cx,cy,r,a){ return [cx+r*Math.sin(a), cy-r*Math.cos(a)]; }
  function dSlice(cx,cy,r,ir,s,e,color){
    if(Math.abs(e-s)<0.001) return '';
    const span=Math.min(e-s,Math.PI*2-0.001);
    const [x1,y1]=pCart(cx,cy,r,s),[x2,y2]=pCart(cx,cy,r,s+span);
    const [ix1,iy1]=pCart(cx,cy,ir,s),[ix2,iy2]=pCart(cx,cy,ir,s+span);
    const lg=span>Math.PI?1:0;
    return `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${lg},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${ir},${ir} 0 ${lg},0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z" fill="${color}" opacity="0.9"/>`;
  }
  const cx=90,cy=90,R=78,IR=50; let a=0;
  const msA=(msItems.length/totalAll)*Math.PI*2;
  const osA=(osItems.length/totalAll)*Math.PI*2;
  const deA=(deItems.length/totalAll)*Math.PI*2;
  const msSl=dSlice(cx,cy,R,IR,a,a+msA,'#80d080'); a+=msA;
  const osSl=dSlice(cx,cy,R,IR,a,a+osA,'#9896a4'); a+=osA;
  const deSl=dSlice(cx,cy,R,IR,a,a+deA,'#e0a040');
  const donutChart = SVG(280,190,`${msSl}${osSl}${deSl}
    <text x="${cx}" y="${cy-10}" text-anchor="middle" fill="#fff" font-size="20" font-family="Exo 2,sans-serif" font-weight="700">${totalAll}</text>
    <text x="${cx}" y="${cy+12}" text-anchor="middle" fill="#9896a4" font-size="11" font-family="Exo 2,sans-serif">items</text>
    <circle cx="190" cy="30" r="7" fill="#80d080"/>
    <text x="202" y="35" fill="#ddd" font-size="12" font-family="Exo 2,sans-serif">MS (${msItems.length})</text>
    <circle cx="190" cy="55" r="7" fill="#9896a4"/>
    <text x="202" y="60" fill="#ddd" font-size="12" font-family="Exo 2,sans-serif">OS (${osItems.length})</text>
    <circle cx="190" cy="80" r="7" fill="#e0a040"/>
    <text x="202" y="85" fill="#ddd" font-size="12" font-family="Exo 2,sans-serif">DE (${deItems.length})</text>`);

  // Bottom 10 (least dropped) — epic quality (4) or higher only
  const allItemsSorted = Object.entries(itemDetail)
    .map(([id,d]) => [id, d, d.ms+d.os+d.de])
    .filter(([id]) => (_itemCache[id]?.quality ?? 0) >= 4)
    .sort((a,b) => a[2]-b[2]);
  const bottom15 = allItemsSorted.slice(0, 15);

  const leastItemsHtml = bottom15.map(([id,d,total],i) => {
    const item=_itemCache[id]||{}, qc=QUALITY_CLASS[item.quality??1];
    const icon=item.icon?`${WOWHEAD_ICON}${item.icon}.jpg`:'';
    const rank = i+1;
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      <span style="font-size:10px;color:var(--text3);width:16px;text-align:right;flex-shrink:0">${rank}</span>
      ${icon?`<img src="${icon}" style="width:24px;height:24px;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">` :''}
      <a href="${WOWHEAD_ITEM}${id}" target="_blank" data-wowhead="item=${id}&domain=tbc" class="${qc}" style="text-decoration:none;font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name||'Item #'+id}</a>
      <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
        ${d.ms?`<span style="font-size:10px;color:#80d080;background:rgba(128,208,128,0.1);padding:1px 5px;border-radius:8px">${d.ms} MS</span>`:''}
        ${d.os?`<span style="font-size:10px;color:#9896a4;background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:8px">${d.os} OS</span>`:''}
        ${d.de?`<span style="font-size:10px;color:#e0a040;background:rgba(224,160,64,0.1);padding:1px 5px;border-radius:8px">${d.de} DE</span>`:''}
        <span style="font-size:12px;font-weight:700;color:#7a9ec0;margin-left:2px">${total}×</span>
      </div></div>`;
  }).join('');

  // Top 15
  const topItemsHtml = top15.map(([id,d,total]) => {
    const item=_itemCache[id]||{}, qc=QUALITY_CLASS[item.quality??1];
    const icon=item.icon?`${WOWHEAD_ICON}${item.icon}.jpg`:'';
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      ${icon?`<img src="${icon}" style="width:24px;height:24px;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">` :''}
      <a href="${WOWHEAD_ITEM}${id}" target="_blank" data-wowhead="item=${id}&domain=tbc" class="${qc}" style="text-decoration:none;font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name||'Item #'+id}</a>
      <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
        ${d.ms?`<span style="font-size:10px;color:#80d080;background:rgba(128,208,128,0.1);padding:1px 5px;border-radius:8px">${d.ms} MS</span>`:''}
        ${d.os?`<span style="font-size:10px;color:#9896a4;background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:8px">${d.os} OS</span>`:''}
        ${d.de?`<span style="font-size:10px;color:#e0a040;background:rgba(224,160,64,0.1);padding:1px 5px;border-radius:8px">${d.de} DE</span>`:''}
        <span style="font-size:12px;font-weight:700;color:var(--gold);margin-left:2px">${total}×</span>
      </div></div>`;
  }).join('');

  const topLooter=allPlayers[0], topLooterN=(playerMS[topLooter]||0)+(playerOS[topLooter]||0);
  const bigSess=sessions.reduce((b,s)=>(sessionCounts[s].ms+sessionCounts[s].os)>(sessionCounts[b]?.ms+sessionCounts[b]?.os||0)?s:b, sessions[0]);
  const recordCards=[
    {icon:'🏆',label:'Top Looter',value:topLooter,sub:`${topLooterN} items total`},
    {icon:'⚔',label:'Biggest Session',value:bigSess,sub:`${sessionCounts[bigSess]?.ms+sessionCounts[bigSess]?.os} items`},
    {icon:'📦',label:'Avg per Raid',value:(real.length/sessions.length).toFixed(1),sub:'items awarded'},
    {icon:'🎯',label:'MS Rate',value:Math.round((msItems.length/real.length)*100)+'%',sub:`${msItems.length} of ${real.length}`},
    {icon:'✨',label:'Disenchanted',value:deItems.length,sub:`${Math.round((deItems.length/totalAll)*100)}% of drops`},
    {icon:'🎲',label:'Unique Items',value:Object.keys(itemCount).length,sub:'different items'},
  ].map(c=>`<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:14px 16px;min-width:130px;flex:1">
    <div style="font-size:22px;margin-bottom:6px">${c.icon}</div>
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">${c.label}</div>
    <div style="font-size:18px;font-weight:700;color:var(--text);font-family:Cinzel,serif">${c.value}</div>
    <div style="font-size:10px;color:var(--text3);margin-top:2px">${c.sub}</div>
  </div>`).join('');

  el.innerHTML=`
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">${recordCards}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;margin-bottom:24px">
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:16px">
        <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:16px;letter-spacing:0.05em">LOOT PER PLAYER</div>
        <div style="display:flex;gap:12px;font-size:10px;color:var(--text3);margin-bottom:10px">
          <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:#80d080;border-radius:2px;display:inline-block"></span>Main Spec</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:rgba(128,208,128,0.35);border-radius:2px;display:inline-block"></span>Off Spec</span>
        </div>${playerChart}
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:16px">
          <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:12px;letter-spacing:0.05em">LOOT BREAKDOWN</div>
          ${donutChart}
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:16px">
          <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:12px;letter-spacing:0.05em">MOST DROPPED ITEMS (TOP 15)</div>
          ${topItemsHtml||'<div style="color:var(--text3);font-size:12px">No repeat drops yet.</div>'}
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:16px">
          <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:4px;letter-spacing:0.05em">LEAST DROPPED ITEMS (BOTTOM 15)</div>
          <div style="font-size:10px;color:var(--text3);margin-bottom:12px">Epic+ items that have appeared the fewest times across all raids</div>
          ${leastItemsHtml||'<div style="color:var(--text3);font-size:12px">Not enough epic+ data yet.</div>'}
        </div>
      </div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:16px;margin-bottom:24px">
      <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);margin-bottom:6px;letter-spacing:0.05em">ITEMS PER RAID SESSION</div>
      <div style="display:flex;gap:12px;font-size:10px;color:var(--text3);margin-bottom:14px">
        <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:#80d080;border-radius:2px;display:inline-block"></span>Main Spec</span>
        <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:#9896a4;border-radius:2px;display:inline-block"></span>Off Spec</span>
      </div>
      <div style="overflow-x:auto;padding-bottom:4px">${sessionChart}</div>
    </div>`;
}

// ── Manage view ─────────────────────────────────────────────────────────────

// ── Manage view ─────────────────────────────────────────────────────────────

function renderLootManage() {
  const el = document.getElementById('loot-view-manage');
  if (!_lootData.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:16px">No loot data to manage.</div>';
    return;
  }
  const sessions = {};
  _lootData.forEach(e => {
    if (!sessions[e.dateTime]) sessions[e.dateTime] = [];
    sessions[e.dateTime].push(e);
  });

  let html = `<div style="font-size:12px;color:var(--text3);margin-bottom:16px">
    ${_lootData.length} total entries across ${Object.keys(sessions).length} session${Object.keys(sessions).length!==1?'s':''}.
    Delete individual rows or entire sessions below.
  </div>`;

  Object.entries(sessions).sort((a,b) => b[0].localeCompare(a[0])).forEach(([date, entries]) => {
    const real = entries.filter(e => e.character !== '_disenchanted');
    html += `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);margin-bottom:12px;overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">
        <div>
          <span style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold)">${date}</span>
          <span style="font-size:11px;color:var(--text3);margin-left:10px">${entries.length} entries · ${real.length} awarded</span>
        </div>
        <button class="btn" style="font-size:11px;padding:3px 12px;color:#e07070;border-color:#e07070" onclick="deleteSession('${date}')">🗑 Delete Session</button>
      </div>
      <div style="padding:6px 0">
        <div style="display:grid;grid-template-columns:100px 140px 1fr 80px 36px;gap:8px;padding:4px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:2px">
          <span>Date</span><span>Player</span><span>Item</span><span>Type</span><span></span>
        </div>
        ${entries.map(e => {
          const item = _itemCache[e.itemID] || {};
          const qc = QUALITY_CLASS[item.quality??1];
          const member = findMemberByLootName(e.character);
          const color = member ? (CM[member.cls]?.color||'#888') : (e.character==='_disenchanted'?'#9896a4':'#aaa');
          const isDE = e.character === '_disenchanted';
          const badge = isDE
            ? '<span style="font-size:10px;color:#e0a040">DE</span>'
            : e.offspec
              ? '<span style="font-size:10px;color:#9896a4">Off Spec</span>'
              : '<span style="font-size:10px;color:#80d080">Main Spec</span>';
          return `<div style="display:grid;grid-template-columns:100px 140px 1fr 80px 36px;gap:8px;padding:5px 14px;align-items:center;border-bottom:1px solid rgba(255,255,255,0.03)">
            <span style="font-size:11px;color:var(--text3)">${e.dateTime}</span>
            <span style="font-size:12px;font-weight:600;color:${color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${isDE?'✨ DE':e.character}</span>
            <span><a href="${WOWHEAD_ITEM}${e.itemID}" target="_blank" data-wowhead="item=${e.itemID}&domain=tbc" class="${qc}" style="text-decoration:none;font-size:12px">${item.name||'Item #'+e.itemID}</a></span>
            <span>${badge}</span>
            <span><button onclick="deleteLootEntry('${e.id}')" title="Delete" style="background:none;border:1px solid rgba(224,112,112,0.3);border-radius:4px;color:#e07070;cursor:pointer;font-size:11px;padding:2px 6px;line-height:1">✕</button></span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  el.innerHTML = html;
}

function deleteLootEntry(id) {
  if (!_li) { alert('Please login as officer to manage loot data.'); return; }
  if (!confirm('Delete this loot entry?')) return;
  _lootData = _lootData.filter(e => e.id !== id);
  saveLootData();
  renderLootPage();
  showToast('Entry deleted.');
}

function deleteSession(date) {
  if (!_li) { alert('Please login as officer to manage loot data.'); return; }
  const count = _lootData.filter(e => e.dateTime === date).length;
  if (!confirm(`Delete all ${count} entries from ${date}?`)) return;
  _lootData = _lootData.filter(e => e.dateTime !== date);
  saveLootData();
  renderLootPage();
  showToast(`Session ${date} deleted (${count} entries removed).`);
}


function clearLootData() {
  if (!_li) { alert('Please login as officer to manage loot data.'); return; }
  if (!confirm('Clear ALL loot history? This cannot be undone.')) return;
  _lootData = [];
  _itemCache = {};
  localStorage.removeItem('gm_loot');
  localStorage.removeItem('gm_loot_cache');
  sbSet('loot', {}).catch(() => {});
  renderLootPage();
  showToast('✓ All loot history cleared.');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a24;border:1px solid var(--gold);border-radius:6px;padding:10px 20px;font-size:12px;color:#fff;z-index:9999;pointer-events:none;white-space:nowrap';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
