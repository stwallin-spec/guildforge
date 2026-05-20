// ══════════════════════════════════════════════════════════
// SUPABASE — shared cloud storage
// ══════════════════════════════════════════════════════════
const _SB_URL = 'https://cgfjznbdxuslzehotnwz.supabase.co';
const _SB_KEY = 'sb_publishable_xDPNM0y1vy5qHFpVsllLSA_QU9kIX-t';
const _sb = supabase.createClient(_SB_URL, _SB_KEY);

// ── Generic helpers ──────────────────────────────────────
async function sbGet(key) {
  const { data, error } = await _sb.from('guild_data').select('data').eq('key', key).single();
  if (error) { console.warn('sbGet error', key, error.message); return null; }
  return data.data;
}

async function sbSet(key, value) {
  const { error } = await _sb.from('guild_data').upsert({ key, data: value, updated_at: new Date().toISOString() });
  if (error) {
    console.warn('sbSet error', key, error.message);
    throw new Error(error.message); // let callers (cloudSaveWishlists retry logic) know it failed
  }
}

// ── Per-member wishlist helpers ──────────────────────────────────────────────
// Each member gets their own row: key = 'wl_member_<id>', data = [...items]
// This means saves are fully isolated — two members can save simultaneously
// without ever overwriting each other.

async function sbGetAllWishlists() {
  // Fetch all rows whose key starts with 'wl_member_'
  const { data, error } = await _sb.from('guild_data')
    .select('key, data')
    .like('key', 'wl_member_%');
  if (error) {
    console.warn('sbGetAllWishlists error', error.message);
    throw new Error(error.message);
  }
  // Reassemble into { memberId(str): [...items] }
  const result = {};
  (data || []).forEach(row => {
    const id = row.key.replace('wl_member_', '');
    result[id] = row.data || [];
  });
  return result;
}

async function sbSetMemberWishlist(memberId, items) {
  const key = 'wl_member_' + String(memberId);
  const { error } = await _sb.from('guild_data')
    .upsert({ key, data: items, updated_at: new Date().toISOString() });
  if (error) {
    console.warn('sbSetMemberWishlist error', memberId, error.message);
    throw new Error(error.message);
  }
}

async function sbDeleteMemberWishlist(memberId) {
  const key = 'wl_member_' + String(memberId);
  const { error } = await _sb.from('guild_data').delete().eq('key', key);
  if (error) console.warn('sbDeleteMemberWishlist error', memberId, error.message);
}

async function sbClearAllMemberWishlists() {
  const { error } = await _sb.from('guild_data').delete().like('key', 'wl_member_%');
  if (error) {
    console.warn('sbClearAllMemberWishlists error', error.message);
    throw new Error(error.message);
  }
}

// ── Members ──────────────────────────────────────────────
async function sbLoadMembers() {
  const { data, error } = await _sb.from('members').select('id,data').order('id');
  if (error) { console.warn('sbLoadMembers error', error.message); return null; }
  return data.map(r => r.data);
}

async function sbSaveMembers() {
  // Delete all then re-insert (simple approach for small datasets)
  await _sb.from('members').delete().neq('id', -1);
  if (members.length === 0) return;
  const rows = members.map(m => ({ id: m.id, data: m }));
  const { error } = await _sb.from('members').insert(rows);
  if (error) console.warn('sbSaveMembers error', error.message);
}

// ── Load all data from Supabase ──────────────────────────
async function loadFromCloud() {
  showSyncStatus('loading');
  try {
    // Members — only overwrite local if cloud has actual data
    const cloudMembers = await sbLoadMembers();
    if (cloudMembers !== null && cloudMembers.length > 0) {
      members = cloudMembers;
      nextId = members.length ? Math.max(...members.map(m => m.id)) + 1 : 1;
      localStorage.setItem('gm_members', JSON.stringify(members));
      localStorage.setItem('gm_nextId', nextId);
    }
    // Groups — only overwrite if cloud has actual data
    const groups_data = await sbGet('groups');
    if (groups_data !== null && Array.isArray(groups_data) && groups_data.some(g => g && g.some && g.some(s => s))) {
      groups = groups_data;
      localStorage.setItem('gm_groups', JSON.stringify(groups));
    }
    // Ideal — only overwrite if cloud has actual data
    const ideal_data = await sbGet('ideal');
    if (ideal_data !== null && Object.keys(ideal_data).length > 0) {
      ideal = ideal_data;
      localStorage.setItem('gm_ideal', JSON.stringify(ideal));
    }
    // Prof items — only overwrite if cloud has actual data
    const prof_data = await sbGet('profitems');
    if (prof_data !== null && Array.isArray(prof_data) && prof_data.length > 0) {
      profItems = prof_data;
      localStorage.setItem('gm_profitems', JSON.stringify(profItems));
    }
    // Assign plans
    const assign_data = await sbGet('assign');
    if (assign_data !== null && assign_data.plans && Object.keys(assign_data.plans).length > 0) {
      localStorage.setItem('gm_assign', JSON.stringify(assign_data));
    }
    // Wishlists — prime in-memory state. Each member has their own isolated row.
    // initWishlist will re-fetch on tab visit anyway; this just primes for other tabs.
    if (Object.keys(wlData).length === 0) {
      wlData = await sbGetAllWishlists();
    }
    // Wishlist lock state
    const wl_locked = await sbGet('wishlists_locked');
    wlLocked = wl_locked === true;
    showSyncStatus('ok');
  } catch(e) {
    console.warn('loadFromCloud error', e);
    showSyncStatus('error');
  }
}
async function cloudSaveWishlists(memberId, items) {
  // Each member has their own isolated row in Supabase (key = 'wl_member_<id>').
  // Saving one member never touches any other member's data.
  try {
    await sbSetMemberWishlist(memberId, items);
    showSyncStatus('saved');
  } catch(e) {
    console.warn('cloudSaveWishlists failed, retrying...', e);
    try {
      await sbSetMemberWishlist(memberId, items);
      showSyncStatus('saved');
    } catch(e2) {
      console.warn('cloudSaveWishlists retry failed:', e2);
      showSyncStatus('error');
      throw e2;
    }
  }
}
async function cloudSaveMembers() {
  localStorage.setItem('gm_members', JSON.stringify(members));
  await sbSaveMembers();
  showSyncStatus('saved');
}

async function cloudSaveGroups() {
  localStorage.setItem('gm_groups', JSON.stringify(groups));
  try { await sbSet('groups', groups); showSyncStatus('saved'); } catch(e) { showSyncStatus('error'); }
}

async function cloudSaveIdeal() {
  localStorage.setItem('gm_ideal', JSON.stringify(ideal));
  try { await sbSet('ideal', ideal); showSyncStatus('saved'); } catch(e) { showSyncStatus('error'); }
}

async function cloudSaveProf() {
  localStorage.setItem('gm_profitems', JSON.stringify(profItems));
  try { await sbSet('profitems', profItems); showSyncStatus('saved'); } catch(e) { showSyncStatus('error'); }
}

async function cloudSaveAssign(assignData) {
  try { await sbSet('assign', assignData); showSyncStatus('saved'); }
  catch(e) { showSyncStatus('error'); throw e; }
}

// ── Sync status indicator ────────────────────────────────
function showSyncStatus(state) {
  let el = document.getElementById('sync-status');
  if (!el) return;
  const states = {
    loading: ['⟳ Syncing...', '#9896a4'],
    ok:      ['✓ In sync',    '#80d080'],
    saved:   ['✓ Saved',      '#80d080'],
    error:   ['⚠ Offline',    '#e06060'],
  };
  const [text, color] = states[state] || states.ok;
  el.textContent = text;
  el.style.color = color;
  if (state === 'saved') setTimeout(() => showSyncStatus('ok'), 2000);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.getElementById('modal-bg').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
initClassSelect();

(async function() {
  await loadFromCloud();
  // Also load raid archive from Supabase
  try {
    const archiveData = await sbGet('raid_archive');
    if (archiveData && Array.isArray(archiveData) && archiveData.length > 0) {
      localStorage.setItem('gm_raid_archive', JSON.stringify(archiveData));
    }
  } catch(e) {}
  // Load loot data from Supabase
  try {
    const lootData = await sbGet('loot');
    if (lootData && lootData.entries && lootData.entries.length > 0) {
      localStorage.setItem('gm_loot', JSON.stringify(lootData.entries));
    }
    if (lootData && lootData.itemCache) {
      localStorage.setItem('gm_loot_cache', JSON.stringify(lootData.itemCache));
    }
  } catch(e) {}
  renderRoster();
  renderProfPills();
  // Restore last active tab
  const savedTab = localStorage.getItem('gm_activetab');
  if (savedTab && savedTab !== 'roster') {
    const btn = document.querySelector(`.nav-btn[onclick*="showPage('${savedTab}'"]`);
    if (btn) await showPage(savedTab, btn);
  }
})();
