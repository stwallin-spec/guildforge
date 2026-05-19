var _li = false;
var _protected = ['roster','ideal','recruit','raid','assign'];

function _checkSession() {
  if (sessionStorage.getItem('gm_ok') === '1') _li = true;
  _updateUI();
}

function _updateUI() {
  var btn = document.getElementById('login-btn');
  if (btn) { btn.textContent = _li ? '🔓 Logout' : '🔒 Login'; btn.style.color = _li ? '#80d080' : ''; }
  // Show/hide officer-only wishlist buttons
  var clearBtn = document.getElementById('wl-clear-btn');
  if (clearBtn) clearBtn.style.display = _li ? 'inline-flex' : 'none';
  _applyRestrictions();
}

function _applyRestrictions() {
  _protected.forEach(function(p) {
    var page = document.getElementById('page-' + p);
    if (!page) return;

    // Banner
    var banner = page.querySelector('._ro-banner');
    if (!_li && !banner) {
      banner = document.createElement('div');
      banner.className = '_ro-banner';
      banner.style.cssText = 'background:rgba(200,168,75,0.08);border:1px solid rgba(200,168,75,0.25);border-radius:6px;padding:8px 14px;margin-bottom:14px;font-size:12px;color:var(--text2);display:flex;align-items:center;gap:8px';
      banner.innerHTML = '🔒 View only — <button onclick="handleLoginBtn()" style="background:transparent;border:none;color:var(--gold);cursor:pointer;font-size:12px;padding:0 4px;font-family:inherit;text-decoration:underline">login as officer</button> to edit.';
      page.insertBefore(banner, page.firstChild);
    } else if (_li && banner) {
      banner.remove();
    }

    // Disable/enable buttons and inputs (skip the banner's own login button)
    page.querySelectorAll('button:not(._ro-banner button), input, select, textarea').forEach(function(el) {
      if (_li) {
        el.disabled = false;
        el.style.pointerEvents = '';
        el.style.opacity = '';
        el.style.cursor = '';
      } else {
        el.disabled = true;
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.45';
        el.style.cursor = 'not-allowed';
      }
    });
  });
}

function handleLoginBtn() {
  if (_li) {
    _li = false;
    sessionStorage.removeItem('gm_ok');
    _updateUI();
  } else {
    document.getElementById('login-pw').value = '';
    document.getElementById('login-err').textContent = '';
    document.getElementById('login-bg').style.display = 'flex';
    setTimeout(function(){ document.getElementById('login-pw').focus(); }, 50);
  }
}

function doLogin() {
  var pw = document.getElementById('login-pw').value;
  var stored = localStorage.getItem('gm_pw') || 'dvdl0l';
  if (pw === stored) {
    _li = true;
    sessionStorage.setItem('gm_ok', '1');
    document.getElementById('login-bg').style.display = 'none';
    _updateUI();
  } else {
    document.getElementById('login-err').textContent = 'Incorrect password.';
    document.getElementById('login-pw').value = '';
    document.getElementById('login-pw').focus();
  }
}

function changePassword() {
  var pw = document.getElementById('new-pw').value.trim();
  var msg = document.getElementById('pw-msg');
  if (pw.length < 4) { msg.style.color='#e06060'; msg.textContent='Min 4 characters.'; return; }
  localStorage.setItem('gm_pw', pw);
  msg.style.color='#80d080'; msg.textContent='Password updated!';
  document.getElementById('new-pw').value = '';
}

document.getElementById('login-bg').addEventListener('click', function(e) {
  if (e.target === this) this.style.display = 'none';
});

// Re-apply after each page switch (content re-renders)
var _origShowPage = showPage;
showPage = async function(name, btn) {
  await _origShowPage(name, btn);
  setTimeout(_applyRestrictions, 50);
};

// ══════════════════════════════════════════════════════════════════════════════
// WISHLIST
// ══════════════════════════════════════════════════════════════════════════════
// Data: { [memberId]: [ { itemId, itemName, itemIcon, itemUrl, quality, prio, addedAt }, ... ] }
// prio: 'bis' | 'upgrade' | 'offspec'

let wlData = {};           // memberId(str) -> array of wish items
let wlSelectedId = null;   // currently selected member id (number)
let wlLookupResult = null; // pending item from lookup
let wlDragIdx = null;      // drag-to-reorder index
let wlCurrentView = 'player'; // 'player' | 'competition'
let wlLocked = false;          // when true, no edits allowed

const WL_PRIO_LABELS = { bis: 'BiS', upgrade: 'Upgrade', offspec: 'Off Spec' };
const WL_PRIO_COLORS = {
  bis:     { color: '#f0d070', bg: 'rgba(240,208,112,0.15)', border: 'rgba(240,208,112,0.4)' },
  upgrade: { color: '#80d0ff', bg: 'rgba(128,208,255,0.12)', border: 'rgba(128,208,255,0.35)' },
  offspec: { color: '#9896a4', bg: 'rgba(152,150,164,0.1)',  border: 'rgba(152,150,164,0.3)' },
};

function wlLoad() {
  // No-op: wlData is loaded from Supabase at startup (loadFromCloud)
  // and refreshed on every tab visit (initWishlist → wlRefresh).
  // This function is kept so any legacy call sites don't break.
}

let _wlSaveTimer = null;
function wlSave(memberId) {
  // memberId must always be passed explicitly — never rely on wlSelectedId,
  // because officers can edit items for any player regardless of which player
  // is currently "selected" in the sidebar (e.g. via the competition view).
  if (memberId === undefined || memberId === null) return;
  const id = String(memberId);
  const items = wlData[id] || [];
  clearTimeout(_wlSaveTimer);
  _wlSaveTimer = setTimeout(() => cloudSaveWishlists(id, items), 600);
}

function wlSaveLock() {
  // Single source of truth: lock state lives only in Supabase
  sbSet('wishlists_locked', wlLocked).catch(() => {});
}

function wlUpdateLockBtn() {
  const btn = document.getElementById('wl-lock-btn');
  if (!btn) return;
  if (wlLocked) {
    btn.textContent = '🔒 Locked';
    btn.style.background = 'rgba(224,96,96,0.15)';
    btn.style.borderColor = 'rgba(224,96,96,0.5)';
    btn.style.color = '#e06060';
  } else {
    btn.textContent = '🔓 Unlocked';
    btn.style.background = 'transparent';
    btn.style.borderColor = 'rgba(255,255,255,0.14)';
    btn.style.color = 'var(--text2)';
  }
  // Show/hide the add form and locked banner
  const addForm = document.getElementById('wl-add-form');
  if (addForm) addForm.style.display = wlLocked ? 'none' : '';
  let banner = document.getElementById('wl-locked-banner');
  if (wlLocked) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'wl-locked-banner';
      banner.style.cssText = 'background:rgba(224,96,96,0.08);border:1px solid rgba(224,96,96,0.3);border-radius:6px;padding:10px 16px;margin-bottom:12px;font-size:12px;color:#e06060;display:flex;align-items:center;gap:8px';
      banner.innerHTML = '🔒 Wishlists are locked — no edits can be made until an officer unlocks them.';
      const panel = document.getElementById('wl-panel');
      const addFormEl = document.getElementById('wl-add-form');
      if (panel && addFormEl) panel.insertBefore(banner, addFormEl);
    }
    banner.style.display = 'flex';
  } else if (banner) {
    banner.style.display = 'none';
  }
}

async function wlClearAll() {
  if (!_li) return;
  if (!confirm('Clear ALL wishlist data for every player? This cannot be undone.')) return;
  wlData = {};
  wlSelectedId = null;
  wlRender();
  try {
    await sbClearAllMemberWishlists();
    showToast('✓ All wishlist data cleared.');
  } catch(e) {
    showToast('⚠ Clear failed to sync — check connection.');
  }
}

function wlToggleLock() {
  if (!_li) { showToast('🔒 Login as officer to lock/unlock wishlists.'); return; }
  wlLocked = !wlLocked;
  wlSaveLock();
  wlUpdateLockBtn();
  wlRender(); // re-render to show/hide edit controls
  showToast(wlLocked ? '🔒 Wishlists locked — no edits allowed.' : '🔓 Wishlists unlocked.');
}

async function initWishlist() {
  loadLootData();
  loadItemCache();
  wlLookupResult = null;
  // Always read fresh — each member's items come from their own isolated Supabase row
  showSyncStatus('loading');
  try {
    wlData = await sbGetAllWishlists();
    const wl_locked = await sbGet('wishlists_locked');
    wlLocked = wl_locked === true;
    showSyncStatus('ok');
  } catch(e) {
    console.warn('initWishlist fetch failed:', e);
    showSyncStatus('error');
    // Keep whatever is already in wlData rather than wiping it
  }
  wlUpdateLockBtn();
  wlSetView(wlCurrentView);
}

function wlSetView(view) {
  wlCurrentView = view;
  const playerBtn = document.getElementById('wl-tab-player');
  const compBtn   = document.getElementById('wl-tab-competition');
  const playerView = document.getElementById('wl-view-player');
  const compView   = document.getElementById('wl-view-competition');
  if (!playerBtn) return;
  if (view === 'player') {
    playerBtn.style.background = 'var(--gold)'; playerBtn.style.color = '#0e0e12'; playerBtn.style.fontWeight = '600';
    compBtn.style.background = 'transparent'; compBtn.style.color = 'var(--text2)'; compBtn.style.fontWeight = '400';
    playerView.style.display = 'block';
    compView.style.display = 'none';
    wlRender();
  } else {
    compBtn.style.background = 'var(--gold)'; compBtn.style.color = '#0e0e12'; compBtn.style.fontWeight = '600';
    playerBtn.style.background = 'transparent'; playerBtn.style.color = 'var(--text2)'; playerBtn.style.fontWeight = '400';
    playerView.style.display = 'none';
    compView.style.display = 'block';
    wlRenderCompetition();
  }
}

function wlRender() {
  if (wlCurrentView === 'competition') { wlRenderCompetition(); return; }
  wlRenderPlayerList();
  if (wlSelectedId !== null) {
    wlShowPanel(wlSelectedId);
  } else {
    document.getElementById('wl-panel').style.display = 'none';
    document.getElementById('wl-empty-state').style.display = 'block';
    wlRenderHotItems();
  }
}

function wlRenderHotItems() {
  const el = document.getElementById('wl-hot-items');
  if (!el) return;

  // Build item map: itemId -> { itemName, itemIcon, itemUrl, quality, wanted: [], received: [] }
  const itemMap = {};
  Object.entries(wlData).forEach(([mid, list]) => {
    const member = members.find(m => m.id === parseInt(mid));
    if (!member) return;
    list.forEach((item, idx) => {
      if (!itemMap[item.itemId]) {
        itemMap[item.itemId] = { itemId: item.itemId, itemName: item.itemName, itemIcon: item.itemIcon, itemUrl: item.itemUrl, quality: item.quality, wanted: [], received: [] };
      }
      const isReceived = (item.manualReceived === true) ||
        (item.manualReceived !== false && _lootData.some(e => String(e.itemID) === String(item.itemId) && findMemberByLootName(e.character)?.id === parseInt(mid)));
      const overridden = item.manualReceived === false;
      const actuallyReceived = overridden ? false : isReceived;
      if (actuallyReceived) {
        itemMap[item.itemId].received.push({ member, prio: item.prio });
      } else {
        itemMap[item.itemId].wanted.push({ member, prio: item.prio, rank: idx + 1 });
      }
    });
  });

  // Sort by most wanted (unreceived), top 10
  const sorted = Object.values(itemMap)
    .filter(it => it.wanted.length > 0)
    .sort((a, b) => b.wanted.length - a.wanted.length || a.itemName.localeCompare(b.itemName))
    .slice(0, 10);

  if (!sorted.length) {
    el.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:40px;text-align:center;color:var(--text3)">
      <div style="font-size:28px;margin-bottom:8px">🎯</div>
      <div style="font-size:13px">Select a player to view or edit their wishlist</div>
    </div>`;
    return;
  }

  const maxWanted = sorted[0].wanted.length;

  el.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);overflow:hidden">
      <!-- Header -->
      <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
        <span style="font-size:18px">🔥</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--gold2)">Most Contested Items</div>
          <div style="font-size:11px;color:var(--text3);margin-top:1px">Top 10 most wishlisted items across all players</div>
        </div>
      </div>

      <!-- List -->
      <div>
        ${sorted.map((item, rank) => {
          const qClass = QUALITY_CLASS[item.quality ?? 4];
          const wantCount = item.wanted.length;
          const recvCount = item.received.length;
          const barPct = Math.round((wantCount / maxWanted) * 100);
          const barColor = wantCount >= 6 ? '#e06060' : wantCount >= 4 ? '#e09040' : wantCount >= 3 ? '#e0d060' : wantCount >= 2 ? '#80c8ff' : '#80d080';

          // Sort wanted: BiS first then upgrade then offspec
          const priOrder = { bis: 0, upgrade: 1, offspec: 2 };
          const sortedWanted = [...item.wanted].sort((a, b) => (priOrder[a.prio] ?? 1) - (priOrder[b.prio] ?? 1));

          // Player avatars (up to 8)
          const avatars = sortedWanted.slice(0, 8).map(p => {
            const cc = CM[p.member.cls] || { color: '#888' };
            const icon = specIcon(p.member.cls, p.member.spec);
            const pc = WL_PRIO_COLORS[p.prio] || WL_PRIO_COLORS.upgrade;
            return `<div title="${p.member.name} — ${WL_PRIO_LABELS[p.prio]}" onclick="event.stopPropagation();wlSelectPlayer(${p.member.id})"
              style="width:28px;height:28px;border-radius:50%;overflow:hidden;flex-shrink:0;cursor:pointer;
                     border:2px solid ${pc.color};transition:transform .12s"
              onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              <img src="${icon}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
            </div>`;
          }).join('');

          const isTopThree = rank < 3;
          const rankEmoji = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '';

          return `<div style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.04);${isTopThree ? 'background:rgba(255,255,255,0.015)' : ''}">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
              <!-- Rank -->
              <div style="min-width:28px;text-align:center;flex-shrink:0">
                ${rankEmoji
                  ? `<span style="font-size:18px">${rankEmoji}</span>`
                  : `<span style="font-size:12px;font-weight:700;color:var(--text3)">${rank + 1}</span>`}
              </div>
              <!-- Icon -->
              ${item.itemIcon ? `<img src="https://wow.zamimg.com/images/wow/icons/medium/${item.itemIcon}.jpg" style="width:36px;height:36px;border-radius:6px;flex-shrink:0" onerror="this.style.display='none'">` : ''}
              <!-- Name + bar -->
              <div style="flex:1;min-width:0">
                <a href="${item.itemUrl}" target="_blank" class="${qClass}" style="text-decoration:none;font-size:13px;font-weight:700;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.itemName}</a>
                <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
                  <div style="flex:1;height:5px;background:var(--bg4);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${barPct}%;background:${barColor};border-radius:3px"></div>
                  </div>
                  <span style="font-size:11px;font-weight:700;color:${barColor};flex-shrink:0;min-width:60px">
                    ${wantCount} want${wantCount !== 1 ? 's' : ''} it${recvCount ? ` · <span style="color:#80d080;font-weight:400">✓${recvCount}</span>` : ''}
                  </span>
                </div>
              </div>
            </div>
            <!-- Player avatars -->
            <div style="display:flex;align-items:center;gap:6px;padding-left:40px;flex-wrap:wrap">
              ${avatars}
              ${sortedWanted.length > 8 ? `<span style="font-size:11px;color:var(--text3)">+${sortedWanted.length - 8} more</span>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>

      <div style="padding:10px 20px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)">
        <span style="font-size:11px;color:var(--text3)">Click a player avatar to jump to their wishlist · Switch to </span>
        <span onclick="wlSetView('competition')" style="font-size:11px;color:var(--gold);cursor:pointer;text-decoration:underline">⚔ Item Competition</span>
        <span style="font-size:11px;color:var(--text3)"> for the full breakdown</span>
      </div>
    </div>
  `;
  if (window.WH && WH.Tooltips) WH.Tooltips.refreshLinks();
}

function wlRenderPlayerList() {
  const q = (document.getElementById('wl-search')?.value || '').toLowerCase();
  const el = document.getElementById('wl-player-list');
  if (!el) return;

  const filtered = members.filter(m =>
    !q || m.name.toLowerCase().includes(q) ||
    (wlData[String(m.id)] || []).some(w => w.itemName.toLowerCase().includes(q))
  );

  if (!filtered.length) {
    el.innerHTML = '<div style="padding:12px 14px;font-size:12px;color:var(--text3)">No players found</div>';
    return;
  }

  el.innerHTML = filtered.map(m => {
    const cc = CM[m.cls] || { color: '#888' };
    const icon = specIcon(m.cls, m.spec);
    const items = wlData[String(m.id)] || [];
    const isActive = m.id === wlSelectedId;

    // Count received vs unreceived
    let receivedCount = 0, unreceivedCount = 0;
    items.forEach(item => {
      const overridden = item.manualReceived === false;
      const lootGot = _lootData.some(e => String(e.itemID) === String(item.itemId) && findMemberByLootName(e.character)?.id === m.id);
      const isReceived = overridden ? false : (lootGot || !!item.manualReceived);
      if (isReceived) receivedCount++; else unreceivedCount++;
    });

    const badges = items.length ? `
      <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
        ${unreceivedCount ? `<span style="font-size:10px;background:rgba(200,168,75,0.15);color:var(--gold);padding:1px 7px;border-radius:8px">${unreceivedCount}</span>` : ''}
        ${unreceivedCount && receivedCount ? `<span style="color:var(--text3);font-size:10px">·</span>` : ''}
        ${receivedCount ? `<span style="font-size:10px;background:rgba(128,208,128,0.15);color:#80d080;padding:1px 7px;border-radius:8px">✓${receivedCount}</span>` : ''}
      </div>` : '';

    return `<div onclick="wlSelectPlayer(${m.id})"
      style="display:flex;align-items:center;gap:9px;padding:8px 14px;cursor:pointer;
             border-left:3px solid ${isActive ? cc.color : 'transparent'};
             background:${isActive ? 'rgba(255,255,255,0.05)' : 'transparent'};
             transition:all .12s"
      onmouseover="if(${m.id}!==${wlSelectedId})this.style.background='rgba(255,255,255,0.03)'"
      onmouseout="if(${m.id}!==${wlSelectedId})this.style.background='transparent'">
      <img src="${icon}" style="width:28px;height:28px;border-radius:50%;flex-shrink:0" onerror="this.style.display='none'">
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;color:${cc.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.name}</div>
        <div style="font-size:10px;color:var(--text3)">${m.spec || m.cls}</div>
      </div>
      ${badges}
    </div>`;
  }).join('');
}

function wlGoHome() {
  wlSelectedId = null;
  const homeBtn = document.getElementById('wl-home-btn');
  if (homeBtn) homeBtn.style.display = 'none';
  wlRender();
}

function wlSelectPlayer(memberId) {
  wlSelectedId = memberId;
  const homeBtn = document.getElementById('wl-home-btn');
  if (homeBtn) homeBtn.style.display = 'block';
  wlLookupResult = null;
  // Reset add form
  const inp = document.getElementById('wl-url-input');
  if (inp) inp.value = '';
  const prev = document.getElementById('wl-preview');
  if (prev) prev.style.display = 'none';
  const st = document.getElementById('wl-status');
  if (st) st.textContent = '';
  // If we're in competition view, switch to player view first
  if (wlCurrentView !== 'player') wlSetView('player');
  else { wlRenderPlayerList(); wlShowPanel(memberId); }
}

function wlShowPanel(memberId) {
  const m = members.find(x => x.id === memberId);
  if (!m) return;
  const cc = CM[m.cls] || { color: '#888' };
  const icon = specIcon(m.cls, m.spec);
  const items = wlData[String(memberId)] || [];

  document.getElementById('wl-empty-state').style.display = 'none';
  document.getElementById('wl-panel').style.display = 'block';
  wlUpdateLockBtn();

  document.getElementById('wl-panel-icon').src = icon;
  document.getElementById('wl-panel-name').textContent = m.name;
  document.getElementById('wl-panel-name').style.color = cc.color;
  document.getElementById('wl-panel-sub').textContent = `${m.spec || m.cls} · ${m.rank || ''}`.replace(/ · $/, '');

  // Count only unreceived items for the header
  const unreceived = items.filter(item => {
    const overridden = item.manualReceived === false;
    const lootGot = _lootData.some(e => String(e.itemID) === String(item.itemId) && findMemberByLootName(e.character)?.id === memberId);
    return overridden ? false : !(lootGot || !!item.manualReceived);
  });
  const total = items.length;
  document.getElementById('wl-panel-count').textContent = total
    ? `${unreceived.length} remaining · ${total} total`
    : 'No items yet';

  wlRenderItems(memberId);
}

function wlRenderItems(memberId) {
  const el = document.getElementById('wl-items');
  if (!el) return;
  const items = wlData[String(memberId)] || [];

  if (!items.length) {
    el.innerHTML = '<div style="padding:20px 16px;text-align:center;font-size:12px;color:var(--text3)">No items yet — paste a WoWHead URL above to add the first one</div>';
    return;
  }

  // Compute received status for each item, keeping original index for drag/toggle/remove
  const annotated = items.map((item, i) => {
    const lootTrackerReceived = _lootData.some(e => {
      if (String(e.itemID) !== String(item.itemId)) return false;
      const matched = findMemberByLootName(e.character);
      return matched?.id === memberId;
    });
    const overriddenNotReceived = item.manualReceived === false;
    const received = overriddenNotReceived ? false : (lootTrackerReceived || !!item.manualReceived);
    const receivedSource = overriddenNotReceived ? '' :
      lootTrackerReceived && item.manualReceived ? 'via Loot Tracker + manual' :
      lootTrackerReceived ? 'via Loot Tracker' :
      item.manualReceived ? 'marked manually' : '';
    return { item, i, lootTrackerReceived, overriddenNotReceived, received, receivedSource };
  });

  const active   = annotated.filter(a => !a.received);
  const received = annotated.filter(a =>  a.received);

  // ── Helper: render a single item row ──
  function makeRow({ item, i, lootTrackerReceived, overriddenNotReceived, received, receivedSource }, isReceivedSection) {
    const pc = WL_PRIO_COLORS[item.prio] || WL_PRIO_COLORS.upgrade;
    const qClass = QUALITY_CLASS[item.quality ?? 4];
    const rank = active.indexOf(annotated[i]) + 1; // rank within active list only

    // "Who else wants this" — only show in active section
    const othersHtml = isReceivedSection ? '' : (() => {
      const others = [];
      Object.entries(wlData).forEach(([mid, list]) => {
        if (parseInt(mid) === memberId) return;
        const entry = list.find(w => w.itemId === item.itemId);
        if (!entry) return;
        const m2 = members.find(x => x.id === parseInt(mid));
        if (!m2) return;
        const received2 = (entry.manualReceived === true) || (entry.manualReceived !== false && _lootData.some(e => String(e.itemID) === String(entry.itemId) && findMemberByLootName(e.character)?.id === parseInt(mid)));
        others.push({ m: m2, rank: list.indexOf(entry) + 1, prio: entry.prio, received: received2 });
      });
      if (!others.length) return '';
      const activeOthers = others.filter(o => !o.received);
      const label = activeOthers.length
        ? `<span style="color:var(--text3)">Also wanted by </span>${activeOthers.map(o => {
            const cc2 = CM[o.m.cls] || { color: '#888' };
            return `<span style="color:${cc2.color};font-weight:600">${o.m.name}</span><span style="color:var(--text3)"> #${o.rank}</span>`;
          }).join('<span style="color:var(--text3)"> · </span>')}${others.length > activeOthers.length ? `<span style="color:var(--text3)"> (+${others.length - activeOthers.length} received)</span>` : ''}`
        : `<span style="color:var(--text3)">Wanted by ${others.length} other${others.length>1?'s':''} — all received ✓</span>`;
      return `<div style="font-size:10px;margin-top:2px;line-height:1.5">${label}</div>`;
    })();

    // Received button
    const btnBg     = received ? 'rgba(128,208,128,0.15)' : overriddenNotReceived ? 'rgba(224,96,96,0.1)' : 'transparent';
    const btnBorder = received ? 'rgba(128,208,128,0.4)'  : overriddenNotReceived ? 'rgba(224,96,96,0.35)' : 'rgba(255,255,255,0.12)';
    const btnColor  = received ? '#80d080'                : overriddenNotReceived ? '#e06060' : 'var(--text3)';
    const btnLabel  = received ? '✓ Received' : overriddenNotReceived ? '✕ Overridden' : '○ Received?';
    const btnTitle  = overriddenNotReceived
      ? 'Manually overridden as not received — click to restore'
      : lootTrackerReceived && !item.manualReceived
      ? 'Auto-detected from Loot Tracker — click to override as not received'
      : received ? 'Mark as not received' : 'Mark as received';

    if (isReceivedSection) {
      // Simplified row — no drag handle, no rank number, no prio selector
      return `<div style="display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid rgba(255,255,255,0.04);opacity:0.6"
        onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
        ${item.itemIcon ? `<img src="https://wow.zamimg.com/images/wow/icons/medium/${item.itemIcon}.jpg" style="width:28px;height:28px;border-radius:4px;flex-shrink:0;filter:grayscale(0.6)" onerror="this.style.display='none'">` : ''}
        <div style="flex:1;min-width:0">
          <a href="${item.itemUrl}" target="_blank" class="${qClass}" style="text-decoration:line-through;font-size:12px;font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.itemName}</a>
          <div style="font-size:10px;color:#80d080;margin-top:1px">✓ ${receivedSource || 'Received'}</div>
        </div>
        <button onclick="wlToggleReceived(${memberId},${i})"
          title="${btnTitle}"
          style="background:${btnBg};border:1px solid ${btnBorder};color:${btnColor};
                 cursor:pointer;font-size:11px;padding:3px 8px;border-radius:5px;flex-shrink:0;
                 line-height:1;font-family:'Exo 2',sans-serif;white-space:nowrap"
          onmouseover="this.style.borderColor='rgba(224,96,96,0.5)';this.style.color='#e06060'"
          onmouseout="this.style.borderColor='${btnBorder}';this.style.color='${btnColor}'">✕ Received</button>
        <button onclick="wlRemoveItem(${memberId},${i})"
          style="background:transparent;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:0;flex-shrink:0;line-height:1"
          onmouseover="this.style.color='#e06060'" onmouseout="this.style.color='var(--text3)'" title="Remove from wishlist">✕</button>
      </div>`;
    }

    // Active wishlist row — full row with drag, rank, prio selector
    return `<div id="wl-row-${i}" draggable="true"
      ondragstart="wlDragStart(event,${i})"
      ondragover="wlDragOver(event,${i})"
      ondrop="wlDrop(event,${i},${memberId})"
      ondragend="wlDragEnd()"
      style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.05);transition:background .1s;cursor:grab"
      onmouseover="this.style.background='rgba(255,255,255,0.03)'"
      onmouseout="this.style.background='transparent'">
      <span style="color:var(--text3);font-size:18px;cursor:grab;user-select:none">⠿</span>
      <span style="font-size:11px;color:var(--text3);min-width:18px;text-align:center;font-weight:600">${rank}</span>
      ${item.itemIcon ? `<img src="https://wow.zamimg.com/images/wow/icons/medium/${item.itemIcon}.jpg" style="width:32px;height:32px;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">` : ''}
      <div style="flex:1;min-width:0">
        <a href="${item.itemUrl}" target="_blank" class="${qClass}" style="text-decoration:none;font-size:13px;font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.itemName}</a>
        ${othersHtml}
      </div>
      <button onclick="wlToggleReceived(${memberId},${i})"
        title="${btnTitle}"
        style="background:${btnBg};border:1px solid ${btnBorder};color:${btnColor};
               cursor:pointer;font-size:11px;padding:3px 8px;border-radius:5px;flex-shrink:0;
               line-height:1;font-family:'Exo 2',sans-serif;white-space:nowrap;transition:all .15s"
        onmouseover="this.style.borderColor='rgba(128,208,128,0.5)';this.style.color='#80d080'"
        onmouseout="this.style.borderColor='${btnBorder}';this.style.color='${btnColor}'">${btnLabel}</button>
      <button onclick="wlRemoveItem(${memberId},${i})"
        style="background:transparent;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:0;flex-shrink:0;line-height:1"
        onmouseover="this.style.color='#e06060'" onmouseout="this.style.color='var(--text3)'" title="Remove from wishlist">✕</button>
    </div>`;
  }

  // ── Build the HTML ──
  let html = '';

  // Active wishlist section
  if (active.length) {
    html += active.map(a => makeRow(a, false)).join('');
  } else {
    html += '<div style="padding:16px;text-align:center;font-size:12px;color:#80d080">🎉 All items received!</div>';
  }

  // Received section (collapsible)
  if (received.length) {
    const sectionId = `wl-received-section-${memberId}`;
    html += `
      <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:4px">
        <button onclick="document.getElementById('${sectionId}').style.display=document.getElementById('${sectionId}').style.display==='none'?'block':'none';this.querySelector('.wl-chevron').style.transform=document.getElementById('${sectionId}').style.display==='none'?'rotate(0deg)':'rotate(180deg)'"
          style="width:100%;display:flex;align-items:center;gap:8px;padding:10px 16px;background:transparent;border:none;cursor:pointer;color:var(--text3);font-family:'Exo 2',sans-serif;font-size:11px;text-align:left"
          onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <span class="wl-chevron" style="font-size:10px;transition:transform .2s;display:inline-block;transform:rotate(180deg)">▼</span>
          <span style="text-transform:uppercase;letter-spacing:.06em">Already Received</span>
          <span style="background:rgba(128,208,128,0.15);color:#80d080;padding:1px 8px;border-radius:8px;font-size:10px">${received.length}</span>
        </button>
        <div id="${sectionId}">
          ${received.map(a => makeRow(a, true)).join('')}
        </div>
      </div>`;
  }

  el.innerHTML = html;
  if (window.WH && WH.Tooltips) WH.Tooltips.refreshLinks();
}

function wlToggleReceived(memberId, idx) {
  const list = wlData[String(memberId)] || [];
  if (!list[idx]) return;
  const item = list[idx];
  const lootTrackerReceived = _lootData.some(e =>
    String(e.itemID) === String(item.itemId) &&
    findMemberByLootName(e.character)?.id === memberId
  );

  if (lootTrackerReceived) {
    // Loot tracker says received — toggle manualReceived as an override
    // undefined/true -> false (override: mark as NOT received despite tracker)
    // false -> undefined (remove override, go back to tracker)
    if (item.manualReceived === false) {
      delete item.manualReceived; // remove override, tracker wins again
    } else {
      item.manualReceived = false; // override: not received
    }
  } else {
    // No loot tracker entry — simple toggle
    item.manualReceived = !item.manualReceived;
  }

  wlData[String(memberId)] = list;
  wlSave(memberId);
  wlRenderItems(memberId);
  wlRenderPlayerList();
}

// ── Lookup ────────────────────────────────────────────────
async function wlLookup() {
  const url = document.getElementById('wl-url-input').value.trim();
  const status = document.getElementById('wl-status');
  const preview = document.getElementById('wl-preview');

  wlLookupResult = null;
  preview.style.display = 'none';
  status.textContent = '';

  if (!url) { status.textContent = 'Paste a WoWHead item URL first.'; status.style.color = '#e06060'; return; }

  const itemMatch = url.match(/item[=\/](\d+)/i);
  if (!itemMatch) { status.textContent = 'Could not find an item ID in that URL.'; status.style.color = '#e06060'; return; }

  const itemId = itemMatch[1];
  status.textContent = '⟳ Looking up...'; status.style.color = 'var(--text3)';

  try {
    // Check item cache first
    let cached = _itemCache[parseInt(itemId)];
    if (!cached) {
      const r = await fetch(WOWHEAD_TOOLTIP + itemId);
      const d = await r.json();
      cached = { name: d.name || 'Item #' + itemId, quality: d.quality ?? 4, icon: d.icon || '' };
      _itemCache[parseInt(itemId)] = cached;
      saveItemCache();
    }

    const slugMatch = url.match(/item[=\/]\d+[\/]([a-z0-9-]+)/i);
    const nameFromSlug = slugMatch ? slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;
    const itemName = cached.name !== 'Item #' + itemId ? cached.name : (nameFromSlug || 'Item #' + itemId);

    wlLookupResult = {
      itemId,
      itemName,
      itemIcon: cached.icon || '',
      itemUrl: 'https://www.wowhead.com/tbc/item=' + itemId,
      quality: cached.quality ?? 4,
    };

    const qClass = QUALITY_CLASS[cached.quality ?? 4];
    document.getElementById('wl-preview-icon').src = cached.icon
      ? `https://wow.zamimg.com/images/wow/icons/medium/${cached.icon}.jpg` : '';
    document.getElementById('wl-preview-icon').style.display = cached.icon ? 'block' : 'none';
    document.getElementById('wl-preview-name').className = qClass;
    document.getElementById('wl-preview-name').textContent = itemName;
    document.getElementById('wl-preview-meta').textContent = `Item #${itemId} · ${QUALITY_NAME[cached.quality ?? 4] || 'Epic'}`;
    preview.style.display = 'flex';
    status.textContent = '✓ Item found — choose a priority and click + Add';
    status.style.color = '#80d080';
  } catch(e) {
    status.textContent = 'Lookup failed — check the URL and try again.';
    status.style.color = '#e06060';
  }
}

function wlAddItem() {
  if (wlLocked) { showToast('🔒 Wishlists are locked. Unlock to make changes.'); return; }
  if (!wlLookupResult || wlSelectedId === null) return;
  const prio = 'bis';
  const wlKey = String(wlSelectedId);
  const list = wlData[wlKey] || [];

  // Prevent duplicates
  if (list.some(w => String(w.itemId) === String(wlLookupResult.itemId))) {
    document.getElementById('wl-status').textContent = 'This item is already on the wishlist.';
    document.getElementById('wl-status').style.color = '#e06060';
    return;
  }

  list.push({ ...wlLookupResult, prio, addedAt: new Date().toISOString() });
  wlData[wlKey] = list;
  wlSave(wlSelectedId);

  // Reset form
  document.getElementById('wl-url-input').value = '';
  document.getElementById('wl-preview').style.display = 'none';
  document.getElementById('wl-status').textContent = `✓ ${wlLookupResult.itemName} added`;
  document.getElementById('wl-status').style.color = '#80d080';
  wlLookupResult = null;

  wlShowPanel(wlSelectedId);
  wlRenderPlayerList();
}

function wlRemoveItem(memberId, idx) {
  if (wlLocked) { showToast('🔒 Wishlists are locked. Unlock to make changes.'); return; }
  const wlKey = String(memberId);
  const list = wlData[wlKey] || [];
  list.splice(idx, 1);
  if (!list.length) {
    delete wlData[wlKey];
    // Delete the Supabase row entirely rather than saving an empty array
    sbDeleteMemberWishlist(memberId).catch(() => {});
  } else {
    wlData[wlKey] = list;
    wlSave(memberId);
  }
  wlShowPanel(memberId);
  wlRenderPlayerList();
}

function wlChangePrio(memberId, idx, prio) {
  if (wlLocked) { showToast('🔒 Wishlists are locked.'); return; }
  const wlKey = String(memberId);
  const list = wlData[wlKey] || [];
  if (list[idx]) { list[idx].prio = prio; wlData[wlKey] = list; wlSave(memberId); wlRenderItems(memberId); }
}

// ── Drag to reorder ───────────────────────────────────────
function wlDragStart(e, idx) {
  wlDragIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => { const el = document.getElementById('wl-row-' + idx); if (el) el.style.opacity = '0.4'; }, 0);
}
function wlDragOver(e, idx) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('[id^=wl-row-]').forEach(el => el.style.borderTop = '');
  const target = document.getElementById('wl-row-' + idx);
  if (target && idx !== wlDragIdx) target.style.borderTop = '2px solid var(--gold)';
}
function wlDrop(e, idx, memberId) {
  e.preventDefault();
  if (wlLocked) return;
  if (wlDragIdx === null || wlDragIdx === idx) return;
  const wlKey = String(memberId);
  const list = wlData[wlKey] || [];
  const item = list.splice(wlDragIdx, 1)[0];
  // When dragging downward, removing the item shifts all subsequent indices
  // by -1, so the effective insertion point is idx-1 to land in the correct slot.
  const insertAt = idx > wlDragIdx ? idx - 1 : idx;
  list.splice(insertAt, 0, item);
  wlData[wlKey] = list;
  wlDragIdx = null;
  wlSave(memberId);
  wlRenderItems(memberId);
}
function wlDragEnd() {
  wlDragIdx = null;
  document.querySelectorAll('[id^=wl-row-]').forEach(el => { el.style.opacity = '1'; el.style.borderTop = ''; });
}

// ── Item Competition View ─────────────────────────────────
function wlRenderCompetition() {
  const el = document.getElementById('wl-competition-content');
  if (!el) return;
  const q = (document.getElementById('wl-search')?.value || '').toLowerCase();

  // Build item map: itemId -> { itemName, itemIcon, itemUrl, quality, players: [{member, rank, prio, received}] }
  const itemMap = {};
  Object.entries(wlData).forEach(([mid, list]) => {
    const member = members.find(m => m.id === parseInt(mid));
    if (!member) return;
    list.forEach((item, idx) => {
      if (!itemMap[item.itemId]) {
        itemMap[item.itemId] = { itemId: item.itemId, itemName: item.itemName, itemIcon: item.itemIcon, itemUrl: item.itemUrl, quality: item.quality, players: [] };
      }
      const lootTracked = _lootData.some(e =>
        String(e.itemID) === String(item.itemId) && findMemberByLootName(e.character)?.id === parseInt(mid)
      );
      const received = item.manualReceived === false ? false : (!!item.manualReceived || lootTracked);
      itemMap[item.itemId].players.push({ member, rank: idx + 1, prio: item.prio, received });
    });
  });

  // Filter by search
  let items = Object.values(itemMap).filter(item =>
    !q || item.itemName.toLowerCase().includes(q) ||
    item.players.some(p => p.member.name.toLowerCase().includes(q))
  );

  if (!items.length) {
    el.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:40px;text-align:center;color:var(--text3)">
      <div style="font-size:28px;margin-bottom:8px">⚔</div>
      <div style="font-size:13px">${Object.keys(wlData).length ? 'No items match your search' : 'No wishlist data yet — add items to player wishlists first'}</div>
    </div>`;
    return;
  }

  // Sort: most wanted first (active players only), then alphabetical
  items.sort((a, b) => {
    const aActive = a.players.filter(p => !p.received).length;
    const bActive = b.players.filter(p => !p.received).length;
    if (bActive !== aActive) return bActive - aActive;
    return a.itemName.localeCompare(b.itemName);
  });

  // Demand colour thresholds
  const maxDemand = Math.max(...items.map(it => it.players.filter(p => !p.received).length), 1);

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px">
      ${items.map(item => {
        const qClass = QUALITY_CLASS[item.quality ?? 4];
        const activePlayers = item.players.filter(p => !p.received);
        const receivedPlayers = item.players.filter(p => p.received);
        const demand = activePlayers.length;
        const demandPct = Math.round((demand / maxDemand) * 100);

        // Demand colour: green=1, yellow=2-3, orange=4-5, red=6+
        const demandColor = demand >= 6 ? '#e06060' : demand >= 4 ? '#e09040' : demand >= 2 ? '#e0d060' : '#80d080';

        // Sort active players: BiS first, then Upgrade, then Offspec, then by rank within that
        const priOrder = { bis: 0, upgrade: 1, offspec: 2 };
        const sorted = [...activePlayers].sort((a, b) => (priOrder[a.prio] ?? 1) - (priOrder[b.prio] ?? 1) || a.rank - b.rank);

        return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);overflow:hidden;transition:border-color .15s"
          onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">

          <!-- Item header -->
          <div style="padding:12px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
            ${item.itemIcon ? `<img src="https://wow.zamimg.com/images/wow/icons/medium/${item.itemIcon}.jpg" style="width:32px;height:32px;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">` : ''}
            <div style="flex:1;min-width:0">
              <a href="${item.itemUrl}" target="_blank" class="${qClass}" style="text-decoration:none;font-size:13px;font-weight:700;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.itemName}</a>
              <!-- Demand bar -->
              <div style="margin-top:5px;display:flex;align-items:center;gap:6px">
                <div style="flex:1;height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">
                  <div style="height:100%;width:${demandPct}%;background:${demandColor};border-radius:2px;transition:width .3s"></div>
                </div>
                <span style="font-size:11px;font-weight:700;color:${demandColor};flex-shrink:0">${demand} want${demand === 1 ? 's' : ''} it</span>
              </div>
            </div>
          </div>

          <!-- Players who want it -->
          <div style="padding:8px 0">
            ${sorted.map((p, i) => {
              const cc = CM[p.member.cls] || { color: '#888' };
              const pc = WL_PRIO_COLORS[p.prio] || WL_PRIO_COLORS.upgrade;
              const icon = specIcon(p.member.cls, p.member.spec);
              return `<div style="display:flex;align-items:center;gap:8px;padding:6px 14px;${i < sorted.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04)' : ''}"
                onclick="wlSetView('player');wlSelectPlayer(${p.member.id})" style="cursor:pointer"
                onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                <span style="font-size:10px;color:var(--text3);min-width:16px;text-align:center;font-weight:600">#${p.rank}</span>
                <img src="${icon}" style="width:24px;height:24px;border-radius:50%;flex-shrink:0" onerror="this.style.display='none'">
                <span style="flex:1;font-size:12px;font-weight:600;color:${cc.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.member.name}</span>
                <span style="font-size:10px;color:var(--text3)">${p.member.spec || p.member.cls}</span>
                <span style="font-size:10px;padding:1px 7px;border-radius:8px;border:1px solid ${pc.border};background:${pc.bg};color:${pc.color};flex-shrink:0">${WL_PRIO_LABELS[p.prio]}</span>
              </div>`;
            }).join('')}
            ${receivedPlayers.length ? `
              <div style="padding:6px 14px;border-top:1px solid rgba(255,255,255,0.04);margin-top:2px">
                <span style="font-size:10px;color:#80d080">✓ Already received: </span>
                <span style="font-size:10px;color:var(--text3)">${receivedPlayers.map(p => p.member.name).join(', ')}</span>
              </div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
  if (window.WH && WH.Tooltips) WH.Tooltips.refreshLinks();
}

// ── Wishlist WeakAura Export ──────────────────────────────
let wlExportFormat = 'addon';

function wlShowExportModal() {
  wlSetExportFormat('addon');
  document.getElementById('wl-export-modal').style.display = 'flex';
}

function wlCloseExportModal() {
  document.getElementById('wl-export-modal').style.display = 'none';
}

function wlSetExportFormat(fmt) {
  wlExportFormat = fmt;
  // Update button styles
  ['addon','full','bis','short','macro'].forEach(f => {
    const btn = document.getElementById('wl-fmt-' + f);
    if (!btn) return;
    if (f === fmt) {
      btn.style.background = 'rgba(200,168,75,0.2)';
      btn.style.borderColor = 'var(--gold)';
      btn.style.color = 'var(--gold)';
    } else {
      btn.style.background = 'transparent';
      btn.style.borderColor = 'rgba(255,255,255,0.14)';
      btn.style.color = 'var(--text2)';
    }
  });

  const hints = {
    addon:  '🎮 For the DadsVsDragons WoW addon. Copy this string, then in-game type /dvdwl import and paste it.',
    full:  'Copy into a WeakAura → Custom Text display. Shows each player with item names and priority.',
    bis:   'BiS items only — useful for raid leaders to quickly see top priorities.',
    short: 'Compact version: just player names and item names, no priority labels.',
    macro: 'Formatted as WoW /print lines. Paste into a macro to whisper or display in-game. Note: WoW macros are limited to 255 characters — this may be truncated.',
  };
  document.getElementById('wl-export-hint').textContent = hints[fmt];
  wlGenerateExport();
}

function wlGenerateExport() {
  const fmt = wlExportFormat;
  const lines = [];

  // Sort members by name for consistent output
  const membersSorted = [...members].sort((a, b) => a.name.localeCompare(b.name));

  // ── Addon Import format ──────────────────────────────────
  if (fmt === 'addon') {
    // Build JSON object: { "PlayerName": [{itemId,itemName,prio,rank}, ...], ... }
    const obj = {};
    membersSorted.forEach(m => {
      const list = wlData[String(m.id)] || [];
      if (!list.length) return;
      obj[m.name] = list.map((it, i) => ({
        itemId:   String(it.itemId),
        itemName: it.itemName,
        prio:     it.prio || 'upgrade',
        rank:     i + 1,
      }));
    });
    if (!Object.keys(obj).length) {
      document.getElementById('wl-export-text').value = '-- No wishlist data found.';
      return;
    }
    document.getElementById('wl-export-text').value = 'DVDWishlist:' + JSON.stringify(obj);
    return;
  }

  membersSorted.forEach(m => {
    const list = (wlData[String(m.id)] || []).filter(it => {
      if (fmt === 'bis') return it.prio === 'bis';
      return true;
    });
    if (!list.length) return;

    if (fmt === 'full') {
      const itemParts = list.map((it, i) => {
        const prioTag = it.prio === 'bis' ? '[BiS]' : it.prio === 'upgrade' ? '[Up]' : '[OS]';
        return `${i + 1}. ${it.itemName} ${prioTag}`;
      });
      lines.push(`${m.name} (${m.spec || m.cls}):\n  ${itemParts.join('\n  ')}`);

    } else if (fmt === 'bis') {
      const itemParts = list.map((it, i) => `${i + 1}. ${it.itemName}`);
      lines.push(`${m.name}: ${itemParts.join(' | ')}`);

    } else if (fmt === 'short') {
      const itemParts = list.map(it => it.itemName);
      lines.push(`${m.name}: ${itemParts.join(', ')}`);

    } else if (fmt === 'macro') {
      // WoW macro: /print each player's list
      list.forEach((it, i) => {
        lines.push(`/print ${m.name} #${i + 1}: ${it.itemName}`);
      });
    }
  });

  if (!lines.length) {
    document.getElementById('wl-export-text').value = '-- No wishlist data found. Add items to player wishlists first.';
    return;
  }

  if (fmt === 'full' || fmt === 'short' || fmt === 'bis') {
    // Add a WeakAura-friendly header
    const header = `-- Guild Wishlist Export (${new Date().toLocaleDateString()})\n-- Paste into WeakAura → Display → Custom Text\n\n`;
    document.getElementById('wl-export-text').value = header + lines.join('\n\n');
  } else {
    document.getElementById('wl-export-text').value = lines.join('\n');
  }
}

function wlCopyExport() {
  const ta = document.getElementById('wl-export-text');
  ta.select();
  ta.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(ta.value).then(() => {
    const btn = document.getElementById('wl-copy-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  }).catch(() => {
    document.execCommand('copy');
    const btn = document.getElementById('wl-copy-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

// Close export modal on backdrop click
document.addEventListener('click', function(e) {
  const m = document.getElementById('wl-export-modal');
  if (m && e.target === m) wlCloseExportModal();
});

_checkSession();
