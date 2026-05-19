// ── NAV ───────────────────────────────────────────────────────────────────────
function toggleMobileNav() {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('hamburger-btn');
  nav.classList.toggle('mobile-open');
  btn.classList.toggle('open');
}

function closeMobileNav() {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('hamburger-btn');
  if (nav) nav.classList.remove('mobile-open');
  if (btn) btn.classList.remove('open');
}

async function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'recruit') renderRecruit();
  if (name === 'ideal') renderIdeal();
  if (name === 'raid') renderRaid();
  if (name === 'assign') initAssign();
  if (name === 'prof') initProfessions();
  if (name === 'loot') initLoot();
  if (name === 'wishlist') await initWishlist();
  closeMobileNav();
  localStorage.setItem('gm_activetab', name);
}

// ── ROSTER ────────────────────────────────────────────────────────────────────
let activeFilter = 'All';
let editId = null;

function initClassSelect() {
  const sel = document.getElementById('f-class');
  sel.innerHTML = CLASSES.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  sel.onchange = () => updateSpecSelect(sel.value);
  updateSpecSelect(sel.value);
}

function updateSpecSelect(cls, currentSpec) {
  const specs = CLASS_SPECS[cls] || [];
  const sel = document.getElementById('f-spec');
  sel.innerHTML = `<option value="">— Any —</option>` + specs.map(s =>
    `<option value="${s}"${s === currentSpec ? ' selected' : ''}>${s}</option>`
  ).join('');
  if (currentSpec) sel.value = currentSpec;
}

function renderRoster() {
  const q = (document.getElementById('search').value || '').toLowerCase();
  const filtered = members.filter(m => {
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.cls.toLowerCase().includes(q) || (m.spec||'').toLowerCase().includes(q);
    const matchF = activeFilter === 'All' || m.cls === activeFilter;
    return matchQ && matchF;
  });

  // stats
  const activeMembers = members.filter(m => !m.inactive);
  const activeClasses = CLASSES.filter(c => activeMembers.some(m => m.cls === c.name));

  const classCards = activeClasses.map(c => {
    const classMembers = activeMembers.filter(m => m.cls === c.name);
    const total = classMembers.length;
    const specRows = CLASS_SPECS[c.name].map(spec => {
      const count = classMembers.filter(m => canonicalSpec(m.cls, m.spec) === spec).length;
      if (!count) return '';
      const icon = specIcon(c.name, spec);
      const pct = Math.round(count / total * 100);
      return `<div class="cls-spec-row">
        <img src="${icon}" style="width:14px;height:14px;border-radius:2px;flex-shrink:0" onerror="this.style.display='none'">
        <span style="font-size:11px;color:var(--text2);width:72px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${spec}</span>
        <div class="cls-spec-bar-wrap"><div class="cls-spec-bar" style="width:${pct}%;background:${c.color}66"></div></div>
        <span class="cls-spec-count" style="color:${c.color}">${count}</span>
      </div>`;
    }).join('');
    return `<div class="cls-card">
      <div class="cls-header">
        <img src="${specIcon(c.name, CLASS_SPECS[c.name][0])}" style="width:22px;height:22px;border-radius:4px" onerror="this.style.display='none'">
        <span style="font-size:13px;font-weight:700;color:${c.color}">${c.name}</span>
        <span class="cls-total" style="color:${c.color}">${total}</span>
      </div>
      <div class="cls-specs">${specRows || '<span style="font-size:11px;color:var(--text3)">No spec set</span>'}</div>
    </div>`;
  }).join('');

  document.getElementById('stats').innerHTML = `
    <div class="stats-top">
      <div class="stat-card"><div class="lbl">Active</div><div class="val">${members.filter(m=>!m.inactive).length}</div></div>
      <div class="stat-card"><div class="lbl">Inactive</div><div class="val" style="color:var(--text3)">${members.filter(m=>m.inactive).length}</div></div>
      <div class="stat-card"><div class="lbl">Officers+</div><div class="val">${members.filter(m=>m.rank==='Guild Master'||m.rank==='Officer').length}</div></div>
      <div class="stat-card"><div class="lbl">In Raid</div><div class="val">${groups.flat().filter(Boolean).length}</div></div>
    </div>
    <div class="class-summary">${classCards}</div>
  `;

  // filters
  document.getElementById('filters').innerHTML = ['All', ...CLASSES.map(c=>c.name)].map(r => {
    const cc = CM[r];
    const cnt = r === 'All' ? '' : ` (${members.filter(m=>m.cls===r&&!m.inactive).length})`;
    const isActive = activeFilter === r;
    let style = '';
    if (isActive && cc) style = `background:${clsBg(r)};color:${cc.color};border-color:${cc.color}`;
    else if (isActive) style = `background:rgba(200,168,75,0.12);color:var(--gold2);border-color:var(--gold)`;
    return `<button class="pill" style="${style}" onclick="setFilter('${r}')">${r}${cnt}</button>`;
  }).join('');

  const CLASS_ORDER = CLASSES.map(c => c.name);
  function sortMembers(arr) {
    return arr.slice().sort((a, b) => {
      const ci = CLASS_ORDER.indexOf(a.cls) - CLASS_ORDER.indexOf(b.cls);
      if (ci !== 0) return ci;
      return a.name.localeCompare(b.name);
    });
  }

  const filteredActive   = sortMembers(filtered.filter(m => !m.inactive));
  const filteredInactive = sortMembers(filtered.filter(m =>  m.inactive));

  if (!filteredActive.length && !filteredInactive.length) {
    document.getElementById('member-list').innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text3)">No members found.</div>';
    return;
  }

  function memberRowHtml(m, inactive) {
    const cc = CM[m.cls] || { color: '#888' };
    const sub = [m.spec, m.notes].filter(Boolean).join(' · ');
    const inRaid = groups.flat().some(s => s && s.id === m.id);
    const icon = specIcon(m.cls, m.spec);
    const rowStyle = inactive ? 'opacity:0.55;' : '';
    const toggleTitle = inactive ? 'Move to active roster' : 'Move to inactive';
    const toggleIcon = inactive ? '↑' : '⏸';
    return `<div class="member-row" style="${rowStyle}">
      <div class="avatar" style="background:${clsBg(m.cls)};border-color:${cc.color};padding:0;overflow:hidden">
        <img src="${icon}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt="${m.cls}" onerror="this.parentNode.textContent='${m.name.slice(0,2).toUpperCase()}'">
      </div>
      <div class="minfo">
        <div class="mname" style="color:${cc.color}">${m.name}${inRaid ? ' <span style="font-size:10px;color:var(--gold);opacity:.7">★ raid</span>' : ''}</div>
        <div class="msub">${sub || '—'}</div>
      </div>
      <span class="class-tag" style="background:${clsBg(m.cls)};color:${cc.color}">${m.cls}</span>
      <span class="rank-tag">${m.rank}</span>
      <div class="row-actions">
        <button class="icon-btn" onclick="toggleInactive(${m.id})" title="${toggleTitle}" style="font-size:13px">${toggleIcon}</button>
        <button class="icon-btn" onclick="openEdit(${m.id})" title="Edit">✎</button>
        <button class="icon-btn del" onclick="removeMember(${m.id})" title="Remove">✕</button>
      </div>
    </div>`;
  }

  let html = filteredActive.map(m => memberRowHtml(m, false)).join('');

  if (filteredInactive.length) {
    html += `
    <div style="margin-top:18px;margin-bottom:6px;display:flex;align-items:center;gap:10px">
      <span style="font-family:'Cinzel',serif;font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em">Inactive Members</span>
      <div style="flex:1;height:1px;background:var(--border)"></div>
      <span style="font-size:11px;color:var(--text3)">${filteredInactive.length}</span>
    </div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Not counted in recruitment or ideal roster calculations.</div>
    ${filteredInactive.map(m => memberRowHtml(m, true)).join('')}`;
  }

  document.getElementById('member-list').innerHTML = html;
}

function toggleInactive(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;
  m.inactive = !m.inactive;
  save();
  renderRoster();
  renderRecruit();
}

function setFilter(r) { activeFilter = r; renderRoster(); }

function openAdd() {
  editId = null;
  document.getElementById('modal-title').textContent = 'Add Member';
  ['f-name','f-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-class').value = 'Warrior';
  document.getElementById('f-rank').value = 'Member';
  updateSpecSelect('Warrior');
  document.getElementById('modal-bg').classList.add('open');
}
function openEdit(id) {
  const m = members.find(x => x.id === id); if (!m) return;
  editId = id;
  document.getElementById('modal-title').textContent = 'Edit Member';
  document.getElementById('f-name').value = m.name;
  document.getElementById('f-class').value = m.cls;
  const canonical = canonicalSpec(m.cls, m.spec) || m.spec;
  updateSpecSelect(m.cls, canonical);
  document.getElementById('f-rank').value = m.rank;
  document.getElementById('f-notes').value = m.notes || '';
  document.getElementById('modal-bg').classList.add('open');
}
function closeModal() { document.getElementById('modal-bg').classList.remove('open'); }
function saveMember() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) return;
  const obj = { name, cls: document.getElementById('f-class').value, spec: document.getElementById('f-spec').value.trim(), rank: document.getElementById('f-rank').value, notes: document.getElementById('f-notes').value.trim() };
  if (editId) {
    const i = members.findIndex(x => x.id === editId);
    if (i > -1) members[i] = { ...members[i], ...obj };
  } else {
    members.push({ id: nextId++, ...obj });
  }
  save(); closeModal(); renderRoster();
}
function removeMember(id) {
  if (!confirm('Remove this member from the guild?')) return;
  members = members.filter(x => x.id !== id);
  // also remove from raid groups
  groups = groups.map(g => g.map(s => (s && s.id === id) ? null : s));
  // also clean up their wishlist data
  if (wlData[String(id)]) {
    delete wlData[String(id)];
    sbDeleteMemberWishlist(id).catch(() => {});
  }
  save(); renderRoster();
}

// ── IDEAL ─────────────────────────────────────────────────────────────────────
// Build spec list per class — always use canonical TBC specs
function specsForClass(cls) {
  return CLASS_SPECS[cls] || [];
}

function renderIdeal() {
  document.getElementById('ideal-grid').innerHTML = CLASSES.map(c => {
    const specs = specsForClass(c.name);
    const icon = specIcon(c.name, specs[0] || '');
    const total = specs.reduce((sum, spec) => sum + (ideal[c.name + ':' + spec] || 0), 0);
    const specRows = specs.map(spec => {
      const key = c.name + ':' + spec;
      const val = (ideal[key] !== undefined) ? ideal[key] : 0;
      const sicon = specIcon(c.name, spec);
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid var(--border)">
        <img src="${sicon}" style="width:20px;height:20px;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">
        <span style="flex:1;font-size:12px;color:var(--text2)">${spec}</span>
        <input class="ideal-input" type="number" min="0" max="40" value="${val}"
          style="width:44px;font-size:12px;padding:3px 6px"
          onchange="ideal['${key}']=parseInt(this.value)||0;save();renderIdeal();renderRecruit()">
      </div>`;
    }).join('');
    return `<div class="ideal-card" style="flex-direction:column;align-items:stretch;gap:0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:${specs.length?'4px':'0'}">
        <img src="${icon}" style="width:26px;height:26px;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">
        <span class="ideal-label" style="color:${c.color};flex:1">${c.name}</span>
        <span style="font-size:15px;font-weight:700;color:${c.color};min-width:24px;text-align:right" id="total-${c.name}">${total}</span>
      </div>
      ${specRows}
    </div>`;
  }).join('');
}

// ── RECRUIT ───────────────────────────────────────────────────────────────────
function renderRecruit() {
  // Build data for all classes
  const classData = CLASSES.map(c => {
    const specs = specsForClass(c.name);
    const have = members.filter(m => m.cls === c.name && !m.inactive).length;
    const want = specs.reduce((sum, spec) => sum + (ideal[c.name + ':' + spec] || 0), 0);
    const diff = want - have;
    return { c, have, want, diff, specs };
  });

  const totalHave = classData.reduce((s, d) => s + d.have, 0);
  const totalWant = classData.reduce((s, d) => s + d.want, 0);
  const totalNeed = classData.filter(d => d.diff > 0).reduce((s, d) => s + d.diff, 0);
  const classesNeed = classData.filter(d => d.diff > 0).length;
  const classesFull = classData.filter(d => d.want > 0 && d.diff === 0).length;
  const overallPct = totalWant > 0 ? Math.min(100, Math.round(totalHave / totalWant * 100)) : 100;

  // Spots needed per spec — one chip per spec with a deficit
  const needCards = classData.filter(d => d.want > 0).flatMap(({c, specs}) =>
    specs.flatMap(spec => {
      const key = c.name + ':' + spec;
      const haveSpec = members.filter(m => m.cls === c.name && canonicalSpec(m.cls, m.spec) === spec && !m.inactive).length;
      const wantSpec = ideal[key] || 0;
      const diffSpec = wantSpec - haveSpec;
      if (diffSpec <= 0 || wantSpec === 0) return [];
      const icon = specIcon(c.name, spec);
      return [`<div style="display:flex;align-items:center;gap:7px;background:var(--bg3);border:1px solid rgba(200,60,60,0.25);border-radius:var(--radius);padding:6px 10px">
        <img src="${icon}" style="width:22px;height:22px;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">
        <div style="display:flex;flex-direction:column;gap:1px">
          <span style="font-size:11px;font-weight:700;color:${c.color};line-height:1">${c.name}</span>
          <span style="font-size:10px;color:var(--text2);line-height:1">${spec}</span>
        </div>
        <span style="font-size:13px;font-weight:700;color:#f08080;margin-left:4px">-${diffSpec}</span>
      </div>`];
    })
  ).join('');

  const overCards = classData.filter(d => d.want > 0).flatMap(({c, specs}) =>
    specs.flatMap(spec => {
      const key = c.name + ':' + spec;
      const haveSpec = members.filter(m => m.cls === c.name && canonicalSpec(m.cls, m.spec) === spec && !m.inactive).length;
      const wantSpec = ideal[key] || 0;
      const diffSpec = wantSpec - haveSpec;
      if (diffSpec >= 0 || wantSpec === 0) return [];
      const icon = specIcon(c.name, spec);
      return [`<div style="display:flex;align-items:center;gap:7px;background:var(--bg3);border:1px solid rgba(200,168,75,0.2);border-radius:var(--radius);padding:6px 10px">
        <img src="${icon}" style="width:22px;height:22px;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">
        <div style="display:flex;flex-direction:column;gap:1px">
          <span style="font-size:11px;font-weight:700;color:${c.color};line-height:1">${c.name}</span>
          <span style="font-size:10px;color:var(--text2);line-height:1">${spec}</span>
        </div>
        <span style="font-size:13px;font-weight:700;color:${var_gold()};margin-left:4px">+${Math.abs(diffSpec)}</span>
      </div>`];
    })
  ).join('');

  document.getElementById('recruit-summary').innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:16px 20px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:14px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">Roster fill</div>
          <div style="font-size:26px;font-weight:700;font-family:'Cinzel',serif;color:${overallPct===100?'#80d080':overallPct>70?var_gold():'#f08080'}">${overallPct}%</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">Spots needed</div>
          <div style="font-size:26px;font-weight:700;font-family:'Cinzel',serif;color:${totalNeed>0?'#f08080':'#80d080'}">${totalNeed}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">Current / Target</div>
          <div style="font-size:26px;font-weight:700;font-family:'Cinzel',serif;color:var(--gold2)">${totalHave}<span style="font-size:16px;color:var(--text3)"> / ${totalWant}</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">Classes full</div>
          <div style="font-size:26px;font-weight:700;font-family:'Cinzel',serif;color:#80d080">${classesFull}<span style="font-size:13px;color:var(--text3)"> / ${classData.filter(d=>d.want>0).length}</span></div>
        </div>
      </div>
      <div style="height:8px;background:var(--bg4);border-radius:4px;overflow:hidden;margin-bottom:${needCards||overCards?'14px':'0'}">
        <div style="height:100%;width:${overallPct}%;background:${overallPct===100?'#60c060':overallPct>70?'#c8a84b':'#e06060'};border-radius:4px;transition:width .4s"></div>
      </div>
      ${needCards ? `<div style="margin-bottom:${overCards?'10px':'0'}"><div style="font-size:11px;color:#f08080;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Recruit</div><div style="display:flex;flex-wrap:wrap;gap:6px">${needCards}</div></div>` : ''}
      ${overCards ? `<div><div style="font-size:11px;color:${var_gold()};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Over target</div><div style="display:flex;flex-wrap:wrap;gap:6px">${overCards}</div></div>` : ''}
    </div>
  `;

  document.getElementById('recruit-list').innerHTML = classData.map(({c, have, want, diff, specs}) => {
    const pct = want > 0 ? Math.min(100, Math.round(have / want * 100)) : 100;
    const barColor = diff > 0 ? '#e06060' : diff === 0 ? '#60c060' : var_gold();
    const badge = diff > 0
      ? `<span class="need-badge need-more">Need ${diff}</span>`
      : diff === 0
        ? `<span class="need-badge need-ok">Full</span>`
        : `<span class="need-badge need-over">${Math.abs(diff)} over</span>`;

    const specRows = specs.map(spec => {
      const key = c.name + ':' + spec;
      const haveSpec = members.filter(m => m.cls === c.name && canonicalSpec(m.cls, m.spec) === spec && !m.inactive).length;
      const wantSpec = ideal[key] || 0;
      const diffSpec = wantSpec - haveSpec;
      const sicon = specIcon(c.name, spec);
      const specBadge = wantSpec === 0 ? '' : diffSpec > 0
        ? `<span style="font-size:11px;font-weight:600;color:#f08080">Need ${diffSpec}</span>`
        : diffSpec === 0
          ? `<span style="font-size:11px;font-weight:600;color:#80d080">Full</span>`
          : `<span style="font-size:11px;font-weight:600;color:${var_gold()}">${Math.abs(diffSpec)} over</span>`;
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0 4px 16px;border-top:1px solid var(--border)">
        <img src="${sicon}" style="width:18px;height:18px;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">
        <span style="flex:1;font-size:12px;color:var(--text2)">${spec}</span>
        <span style="font-size:12px;color:var(--text2);min-width:40px;text-align:center">${haveSpec} / ${wantSpec||'—'}</span>
        ${specBadge}
      </div>`;
    }).join('');

    return `<div class="recruit-row" style="display:block;padding:0">
      <div style="display:grid;grid-template-columns:130px 1fr auto auto auto;align-items:center;gap:16px;padding:10px 16px">
        <span style="font-size:13px;font-weight:700;color:${c.color}">${c.name}</span>
        <div><div class="recruit-bar-wrap"><div class="recruit-bar" style="width:${pct}%;background:${barColor}"></div></div></div>
        <span class="recruit-nums">${have} / ${want}</span>
        ${badge}
      </div>
      ${specRows ? `<div style="padding:0 16px 8px">${specRows}</div>` : ''}
    </div>`;
  }).join('');
}
function var_gold() { return '#c8a84b'; }
