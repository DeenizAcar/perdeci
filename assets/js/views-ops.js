/* Perdeci — Kişiler, Siparişler, Teslimat, Takvim, Mesajlar, Perdeler */
(function () {
  const V = (window.V = window.V || {});
  const { esc, money, num } = U;
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const houseName = (id) => S.house(id)?.title || 'Silinmiş ev';

  /* ---------- KİŞİLER ---------- */
  V.people = function () {
    const q = U.qs();
    const html = `
      <div class="page-head"><div><h1>Kişiler</h1><p>Ev sahipleri, aile üyeleri, kiracılar, yardımcılar ve kapıcılar. Bir kişi birden fazla eve bağlı olabilir.</p></div>
        <div class="actions"><button class="btn primary" data-act="personForm">${I('user-plus', 16)} Yeni Kişi</button></div></div>
      <div class="toolbar">
        <div class="input-wrap">${I('search', 16, 'input-ic')}<input class="input has-ic" id="pq" placeholder="İsim, telefon veya e-posta ara…" value="${esc(q.q || '')}"></div>
        <div class="seg" id="pf">${[['', 'Tümü'], ['coklu', 'Birden fazla evi olan'], ['yetkili', 'Teslim yetkilisi'], ['yetkisiz', 'Yetkisi olmayan'], ['bakiye', 'Bakiyesi olan']].map(([k, l]) => `<button data-f="${k}" class="${(q.filtre || '') === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      </div>
      <div class="card"><div class="tbl-wrap" id="people-out"></div></div>`;
    const mount = (el) => {
      const out = el.querySelector('#people-out');
      const render = () => {
        const p = U.qs();
        const rows = S.people().map((x) => ({ p: x, hs: S.personHouses(x.id), st: S.personStats(x.id) })).filter(({ p: x, hs, st }) => {
          if (p.filtre === 'coklu' && hs.length < 2) return false;
          if (p.filtre === 'yetkili' && !hs.some((h) => h.canPickup)) return false;
          if (p.filtre === 'yetkisiz' && hs.some((h) => h.canPickup)) return false;
          if (p.filtre === 'bakiye' && !st.balance) return false;
          return U.match(p.q || '', x.name, x.phone, x.email, hs.map((h) => h.house.title + ' ' + h.role).join(' '));
        }).sort((a, b) => b.hs.length - a.hs.length || a.p.name.localeCompare(b.p.name, 'tr'));
        out.innerHTML = rows.length ? `<table class="tbl"><thead><tr><th>Kişi</th><th>Bağlı evler ve rolleri</th><th>Teslim yetkisi</th><th class="num">Teslim aldığı</th><th class="num">Bakiye</th><th>Son teslim</th></tr></thead><tbody>
          ${rows.map(({ p: x, hs, st }) => `<tr class="link" data-href="#/kisi/${x.id}">
            <td><div class="cell-main">${UI.avatar(x, 36)}<div><strong>${esc(x.name)}</strong><small>${esc(x.phone || 'Telefon yok')}</small></div></div></td>
            <td><div class="row wrap" style="gap:4px">${hs.map((h) => `<a class="chip" href="#/ev/${h.house.id}" style="height:26px">${h.isPrimary ? I('crown', 12) : UI.houseIcon(h.house.type, 12)} ${esc(h.house.title)} <span class="faint">· ${esc(h.role)}</span></a>`).join('') || '<span class="faint">Bağlı ev yok</span>'}</div></td>
            <td>${hs.length ? (hs.every((h) => h.canPickup) ? `<span class="chip ok">${I('shield', 13)} Tümünde</span>` : hs.some((h) => h.canPickup) ? `<span class="chip">${hs.filter((h) => h.canPickup).length}/${hs.length} evde</span>` : `<span class="chip no">Yok</span>`) : '—'}</td>
            <td class="num">${st.received || '—'}</td>
            <td class="num" style="${st.balance ? 'color:var(--danger);font-weight:600' : ''}">${st.balance ? money(st.balance) : '—'}</td>
            <td>${st.lastReceived ? `<span class="faint">${U.rel(st.lastReceived.deliveredAt)}</span>` : '<span class="faint">—</span>'}</td></tr>`).join('')}</tbody></table>` : UI.empty('users', 'Kişi bulunamadı');
      };
      el.querySelector('#pq').addEventListener('input', U.debounce((e) => { U.setQs({ q: e.target.value }); render(); }, 120));
      el.querySelectorAll('#pf button').forEach((b) => b.addEventListener('click', () => { el.querySelectorAll('#pf button').forEach((x) => x.classList.toggle('on', x === b)); U.setQs({ filtre: b.dataset.f }); render(); }));
      render();
    };
    return { title: 'Kişiler', crumbs: [['Kişiler']], html, mount };
  };

  V.person = function ({ id }) {
    const p = S.person(id);
    if (!p) return V.notFound('Kişi bulunamadı');
    const hs = S.personHouses(id);
    const st = S.personStats(id);
    const received = S.orders().filter((o) => o.deliveredTo === id).sort((a, b) => (a.deliveredAt < b.deliveredAt ? 1 : -1));
    const msgs = S.messages().filter((m) => m.personId === id).slice(0, 8);
    const html = `
      <div class="detail-head">
        ${UI.avatar(p, 64)}
        <div class="detail-title"><div class="eyebrow">Kişi · ${hs.length} eve bağlı</div><h1>${esc(p.name)}</h1>
          <div class="detail-meta">${p.phone ? `<span>${I('phone', 15)} ${esc(p.phone)}</span>` : ''}${p.email ? `<span>${I('mail', 15)} ${esc(p.email)}</span>` : ''}<span>${I('calendar', 15)} Kayıt ${U.date(p.createdAt)}</span></div></div>
        <div class="detail-actions"><button class="btn" data-act="personForm" data-id="${id}">${I('edit', 16)} Düzenle</button><button class="btn" data-act="smsForm" data-person="${id}">${I('message', 16)} SMS</button><button class="btn primary" data-act="linkForm" data-person="${id}">${I('link', 16)} Eve Bağla</button></div></div>
      <div class="stat-strip"><div><span>Bağlı ev</span><strong>${hs.length}</strong></div><div><span>Teslim yetkisi</span><strong>${hs.filter((h) => h.canPickup).length} evde</strong></div><div><span>Teslim aldığı</span><strong>${st.received}</strong></div><div><span>Onayladığı sipariş</span><strong>${st.ordered}</strong></div><div><span>Fatura sahibi olduğu ev</span><strong>${hs.filter((h) => h.isPrimary).length}</strong></div><div><span>Açık bakiye</span><strong class="${st.balance ? 'warn' : ''}">${st.balance ? money(st.balance) : '—'}</strong></div></div>
      <div class="split">
        <div class="stack">
          <div class="section-title" style="margin-top:0"><h2>Bağlı evler</h2></div>
          <div class="cards-auto">${hs.map((x) => {
            const hst = S.houseStats(x.house.id);
            return `<div class="card member-card" style="--hc:${x.house.color}">
              <div class="member-top"><a class="detail-icon" style="width:46px;height:46px;border-radius:13px" href="#/ev/${x.house.id}">${UI.houseIcon(x.house.type, 20)}</a><div style="min-width:0"><a href="#/ev/${x.house.id}"><h4>${esc(x.house.title)}</h4></a><small>${esc(x.role)} · ${esc(x.house.district)}</small></div>
                <div class="actions"><button class="btn-icon sm ghost" data-act="linkForm" data-house="${x.house.id}" data-person="${id}" data-tip="Rolü düzenle">${I('edit', 15)}</button></div></div>
              <div class="perm ${x.canPickup ? 'yes' : ''}"><span class="row" style="gap:8px">${I(x.canPickup ? 'shield' : 'ban', 16)} ${x.canPickup ? 'Teslim alabilir' : 'Teslim yetkisi yok'}</span><label><input type="checkbox" data-act="togglePickup" data-house="${x.house.id}" data-person="${id}" ${x.canPickup ? 'checked' : ''}><span class="switch"></span></label></div>
              <div class="row wrap" style="gap:6px">${x.isPrimary ? `<span class="chip">${I('crown', 13)} Fatura sahibi</span>` : ''}<span class="chip">${hst.curtains} perde</span>${hst.active ? UI.status(hst.active.status, true) : ''}</div></div>`;
          }).join('')}<button class="add-tile" data-act="linkForm" data-person="${id}">${I('link', 22)} Başka bir eve bağla</button></div>
          <div class="card"><div class="card-head"><h3>Teslim aldığı siparişler</h3><p>${received.length} kayıt</p></div>
            ${received.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sipariş</th><th>Ev</th><th>Teslim</th><th class="num">Parça</th><th class="num">Tutar</th></tr></thead><tbody>${received.map((o) => `<tr class="link" data-href="#/siparis/${o.id}"><td><strong>${esc(o.code)}</strong></td><td>${esc(houseName(o.houseId))}</td><td>${U.dt(o.deliveredAt)}</td><td class="num">${o.items.length}</td><td class="num">${money(S.totals(o).total)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card-body">${UI.empty('package', 'Henüz teslim almadı')}</div>`}</div>
        </div>
        <div class="stack">
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:6px">İletişim</h3>${UI.kv('Telefon', p.phone ? esc(p.phone) : '—', 'phone')}${UI.kv('E-posta', p.email ? esc(p.email) : '—', 'mail')}${UI.kv('SMS bildirimi', p.phone ? 'Açık' : 'Telefon yok', 'message')}</div>
          ${p.note ? `<div class="note-box">${I('info', 16)}<span>${esc(p.note)}</span></div>` : ''}
          <div class="card"><div class="card-head"><h3>Son mesajlar</h3><div class="actions"><a class="btn sm ghost" href="#/mesajlar?kisi=${id}">Tümü</a></div></div>
            ${msgs.length ? msgs.map((m) => `<div class="sms"><div style="min-width:0"><div class="sms-meta">${I('message', 13)} ${U.rel(m.at)} · ${esc(m.kind)}</div><div class="sms-bubble">${esc(m.text)}</div></div></div>`).join('') : `<div class="card-body faint">Mesaj yok.</div>`}</div>
          <button class="btn ghost danger-text" data-act="deletePerson" data-id="${id}">${I('trash', 16)} Kişiyi sil</button>
        </div></div>`;
    return { title: p.name, crumbs: [['Kişiler', '#/kisiler'], [p.name]], html };
  };

  /* ---------- SİPARİŞLER ---------- */
  V.ordersTable = function (orders, opt = {}) {
    return `<table class="tbl"><thead><tr><th>Sipariş</th>${opt.house !== false ? '<th>Ev</th>' : ''}<th>Tarih</th><th class="num">Parça</th><th>Durum</th><th>Teslim</th><th class="num">Tutar</th><th class="num">Bakiye</th></tr></thead><tbody>
      ${orders.map((o) => { const t = S.totals(o); return `<tr class="link" data-href="#/siparis/${o.id}">
        <td><strong class="mono">${esc(o.code)}</strong><br><small class="faint">${esc(C.DELIVERY[o.deliveryMethod])}</small></td>
        ${opt.house !== false ? `<td><div class="cell-main"><span class="sw-dot" style="width:10px;height:10px;border-radius:3px;background:${S.house(o.houseId)?.color}"></span><strong style="font-weight:600">${esc(houseName(o.houseId))}</strong></div></td>` : ''}
        <td class="nowrap">${U.date(o.createdAt)}</td><td class="num">${o.items.length}</td><td>${UI.status(o.status, true)}</td>
        <td class="nowrap">${o.deliveredAt ? `${U.date(o.deliveredAt)}<br><small class="faint">${esc(o.deliveredToName || '')}</small>` : o.status === 'iptal' ? '—' : `<span class="${U.dayDiff(o.dueAt) < 0 ? '' : 'faint'}" style="${U.dayDiff(o.dueAt) < 0 ? 'color:var(--danger);font-weight:600' : ''}">Plan: ${U.date(o.dueAt)}</span>`}</td>
        <td class="num">${money(t.total)}</td><td class="num" style="${t.balance ? 'color:var(--danger);font-weight:600' : ''}">${t.balance ? money(t.balance) : '—'}</td></tr>`; }).join('')}</tbody></table>`;
  };

  V.kcard = function (o) {
    const h = S.house(o.houseId);
    const t = S.totals(o);
    const isMeasure = o.status === 'olcu' && o.measureAt;
    const isQuote = o.status === 'teklif';
    const quoteAt = isQuote ? ([...o.history].reverse().find((x) => x.status === 'teklif')?.at || o.createdAt) : null;
    const dd = U.dayDiff(isMeasure ? o.measureAt : o.dueAt);
    const dueCls = o.status === 'teslim' || isQuote ? '' : dd < 0 ? 'late' : dd === 0 ? 'today' : '';
    const dueTxt = o.status === 'teslim' ? `${U.rel(o.deliveredAt)}` : isMeasure ? `Ölçü ${U.dueLabel(o.measureAt).toLowerCase()} ${U.time(o.measureAt)}` : isQuote ? `Teklif ${U.rel(quoteAt)}` : U.dueLabel(o.dueAt);
    const colors = [...new Set(o.items.map((i) => S.curtain(i.curtainId)?.color).filter(Boolean))].slice(0, 8);
    const st = C.ST[o.status];
    return `<div class="kcard" draggable="${o.status !== 'teslim'}" data-order="${o.id}">
      <div class="kcard-top"><span class="kcard-code">${esc(o.code)}</span><span class="due ${dueCls}">${I('clock', 12)} ${dueTxt}</span></div>
      <h4>${esc(h?.title || '—')}</h4>
      <div class="kc-meta"><span>${I('pin', 12)} ${esc(h?.district || '')}</span><span>${o.items.length} parça</span><span data-tip="${esc(C.MEASURE[o.measureMethod] + ' → ' + C.DELIVERY[o.deliveryMethod])}">${I(o.deliveryMethod === 'dukkan' ? 'store' : o.deliveryMethod === 'montaj' ? 'sparkles' : 'truck', 12)}</span>${t.balance && o.status === 'teslim' ? `<span style="color:var(--danger)">${money(t.balance)} bakiye</span>` : ''}</div>
      <div class="sw-strip">${colors.map((c) => `<i style="--sw:${c}"></i>`).join('')}</div>
      <div class="kc-foot">${o.status === 'teslim' ? `<span class="faint" style="font-size:12px">${I('user', 12)} ${esc(U.firstName(o.deliveredToName))}</span>` : UI.avatars(S.authorized(o.houseId).map((m) => m.person), 3, 22)}<span class="grow"></span><strong>${money(t.total)}</strong>
        ${st.action ? (o.status === 'hazir' ? `<a class="btn sm soft" href="#/teslimat?siparis=${o.id}" data-tip="Teslimat masasında aç">${I('check', 13)}</a>` : `<button class="btn sm soft" data-act="advance" data-id="${o.id}" data-tip="${esc(st.action)}">${I('arrow-right', 13)}</button>`) : ''}</div></div>`;
  };

  V.orders = function () {
    const q = U.qs();
    const view = q.gorunum === 'liste' ? 'liste' : 'pano';
    const html = `
      <div class="page-head"><div><h1>Siparişler</h1><p>Ölçüden montaja kadar tüm satışlar. Kartları sürükleyerek aşamalar arasında taşıyabilirsiniz.</p></div>
        <div class="actions"><div class="seg"><button data-v="pano" class="${view === 'pano' ? 'on' : ''}">${I('kanban', 15)} Pano</button><button data-v="liste" class="${view === 'liste' ? 'on' : ''}">${I('list', 15)} Liste</button></div><button class="btn primary" data-act="newOrder">${I('plus', 16)} Yeni Sipariş</button></div></div>
      <div class="toolbar">
        <div class="input-wrap">${I('search', 16, 'input-ic')}<input class="input has-ic" id="oq" placeholder="Sipariş kodu, ev adı veya kişi ara…" value="${esc(q.q || '')}"></div>
        ${view === 'liste' ? `<select class="input" id="os"><option value="">Tüm durumlar</option>${C.STATUSES.map((s) => `<option value="${s.key}" ${q.durum === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
        <select class="input" id="ob"><option value="">Tüm ödemeler</option><option value="1" ${q.bakiye === '1' ? 'selected' : ''}>Bakiyesi olan</option></select>` : ''}
        <span class="grow"></span><span class="faint" id="ocount" style="font-size:13px"></span>
      </div>
      <div id="orders-out"></div>`;
    const mount = (el) => {
      const out = el.querySelector('#orders-out');
      const render = () => {
        const p = U.qs();
        const match = (o) => {
          const h = S.house(o.houseId);
          return U.match(p.q || '', o.code, h?.title, h?.district, S.members(o.houseId).map((m) => m.person.name).join(' '), o.deliveredToName);
        };
        if (view === 'pano') {
          const recent = Date.now() - 10 * 864e5;
          const cols = [...C.ACTIVE, 'teslim'];
          let total = 0;
          out.innerHTML = `<div class="kanban">${cols.map((k) => {
            const st = C.ST[k];
            let list = S.orders().filter((o) => o.status === k && match(o));
            if (k === 'teslim') list = list.filter((o) => new Date(o.deliveredAt).getTime() > recent).sort((a, b) => (a.deliveredAt < b.deliveredAt ? 1 : -1));
            else list.sort((a, b) => (a.dueAt < b.dueAt ? -1 : 1));
            total += list.length;
            return `<div class="kcol${p.durum === k ? ' focus' : ''}" data-col="${k}" style="--c:${st.color}"><div class="kcol-head">${I(st.icon, 16)} ${k === 'teslim' ? 'Son teslimler' : st.label}<span class="count-badge">${list.length}</span></div>
              <div class="kcol-body">${list.map(V.kcard).join('') || `<div class="faint" style="font-size:12.5px;text-align:center;padding:20px 6px">Boş</div>`}</div></div>`;
          }).join('')}</div>`;
          el.querySelector('#ocount').textContent = `${total} sipariş gösteriliyor`;
          if (p.durum) { const col = out.querySelector(`[data-col="${p.durum}"]`); col && col.scrollIntoView({ inline: 'center', block: 'nearest' }); }
          bindDnd(out);
        } else {
          let list = S.orders().filter((o) => match(o) && (!p.durum || o.status === p.durum) && (p.bakiye !== '1' || S.totals(o).balance > 0)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
          el.querySelector('#ocount').textContent = `${list.length} sipariş · ${money(sum(list, (o) => S.totals(o).total))}`;
          out.innerHTML = list.length ? `<div class="card"><div class="tbl-wrap">${V.ordersTable(list)}</div></div>` : UI.empty('clipboard', 'Sipariş bulunamadı');
        }
      };
      const bindDnd = (root) => {
        let dragId = null;
        root.querySelectorAll('.kcard').forEach((card) => {
          card.addEventListener('click', (e) => { if (e.target.closest('button, a')) return; location.hash = '#/siparis/' + card.dataset.order; });
          card.addEventListener('dragstart', (e) => { dragId = card.dataset.order; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
          card.addEventListener('dragend', () => { card.classList.remove('dragging'); root.querySelectorAll('.kcol').forEach((c) => c.classList.remove('drop')); });
        });
        root.querySelectorAll('.kcol').forEach((col) => {
          col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drop'); });
          col.addEventListener('dragleave', (e) => { if (!col.contains(e.relatedTarget)) col.classList.remove('drop'); });
          col.addEventListener('drop', (e) => {
            e.preventDefault(); col.classList.remove('drop');
            const id = e.dataTransfer.getData('text/plain') || dragId;
            const o = S.order(id); const to = col.dataset.col;
            if (!o || o.status === to) return;
            if (to === 'teslim') { location.hash = '#/teslimat?siparis=' + id; return; }
            if (to === 'tedarik' && o.status === 'teklif') { A.approveForm({ id }); return; }
            S.setStatus(id, to);
            UI.toast(`${o.code} → ${C.ST[to].label}`, 'ok');
            if (to === 'hazir') A.smsToast(o);
            render();
          });
        });
      };
      el.querySelector('#oq').addEventListener('input', U.debounce((e) => { U.setQs({ q: e.target.value }); render(); }, 120));
      el.querySelector('#os')?.addEventListener('change', (e) => { U.setQs({ durum: e.target.value }); render(); });
      el.querySelector('#ob')?.addEventListener('change', (e) => { U.setQs({ bakiye: e.target.value }); render(); });
      el.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => { U.setQs({ gorunum: b.dataset.v === 'liste' ? 'liste' : '' }); App.render(); }));
      render();
    };
    return { title: 'Siparişler', crumbs: [['Siparişler']], html, mount };
  };

  /* ---------- SİPARİŞ DETAY ---------- */
  V.order = function ({ id }) {
    const o = S.order(id);
    if (!o) return V.notFound('Sipariş bulunamadı');
    const h = S.house(o.houseId);
    const t = S.totals(o);
    const st = C.ST[o.status];
    const members = S.members(o.houseId);
    const msgs = S.messages().filter((m) => m.orderId === id);
    const byRoom = {};
    o.items.forEach((it) => { const p = S.path(it.curtainId); const key = p.room ? p.room.id : 'x'; (byRoom[key] = byRoom[key] || { room: p.room, items: [] }).items.push({ it, ...p }); });
    const next = C.FLOW[C.FLOW.indexOf(o.status) + 1];
    const html = `
      <div class="detail-head" style="--hc:${st.color}">
        <div class="detail-icon">${I(st.icon, 28)}</div>
        <div class="detail-title"><div class="eyebrow">Perde siparişi · ${U.dt(o.createdAt)}</div><h1><span class="mono">${esc(o.code)}</span> ${UI.status(o.status)}</h1>
          <div class="detail-meta"><span>${UI.houseIcon(h?.type, 15)} <a href="#/ev/${o.houseId}">${esc(houseName(o.houseId))}</a></span><span>${I('ruler', 15)} ${esc(C.MEASURE[o.measureMethod] || '')}</span><span>${I(o.deliveryMethod === 'montaj' ? 'sparkles' : 'package', 15)} ${esc(C.DELIVERY[o.deliveryMethod])}</span><span>${I('curtain', 15)} ${o.items.length} parça</span></div></div>
        <div class="detail-actions">
          ${t.balance > 0 && o.status !== 'olcu' ? `<button class="btn" data-act="paymentForm" data-id="${id}">${I('wallet', 16)} Ödeme Al</button>` : ''}
          <button class="btn" data-act="printReceipt" data-id="${id}">${I('printer', 16)} ${['olcu', 'teklif'].includes(o.status) ? 'Teklif' : 'Fiş'}</button>
          ${o.status === 'hazir' ? `<a class="btn primary" href="#/teslimat?siparis=${id}">${I('check', 16)} Teslim Et</a>` : st.action ? `<button class="btn primary" data-act="advance" data-id="${id}">${I(C.ST[next].icon, 16)} ${st.action}</button>` : ''}
        </div></div>
      <div class="card pad" style="margin-bottom:18px">${UI.stepper(o)}</div>
      <div class="split">
        <div class="stack">
          <div class="card"><div class="card-head"><h3>Perdeler ve kalemler</h3><p>${Object.keys(byRoom).length} oda · ${num(sum(o.items, (i) => (S.curtain(i.curtainId) ? C.fabricMeters(S.curtain(i.curtainId)) : 0)), 1)} m pileli kumaş</p>${['olcu', 'teklif'].includes(o.status) ? `<div class="actions"><button class="btn sm ghost" data-act="editOrderItems" data-id="${id}">${I('edit', 14)} Düzenle</button></div>` : ''}</div>
            <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Perde</th><th>Konum</th><th>Ölçü</th><th>Kalemler</th><th class="num">Tutar</th></tr></thead><tbody>
              ${Object.values(byRoom).map((g) => g.items.map(({ it, curtain: c, facade: f, room: r }) => c ? `<tr class="link" data-href="#/perde/${c.id}"><td><div class="cell-main">${Viz.swatch(c, 32)}<div><strong>${esc(c.type)} · ${esc(c.fabric)}</strong><small>${esc(c.code)} · ${esc(c.colorName)}</small></div></div></td><td>${esc(r?.name || '')}<br><small class="faint">${esc(f?.name || '')}</small></td><td class="nowrap">${UI.dim(c)}<br><small class="faint">${C.CURTAIN_TYPES[c.type].flat ? num(C.flatArea(c), 1) + ' m²' : num(C.fabricMeters(c), 1) + ' m kumaş · 1:' + String(c.pleat).replace('.', ',')}</small></td><td>${C.CURTAIN_TYPES[c.type].flat ? 'Perde + mekanizma' : 'Kumaş + dikim'} <span class="faint">${money(it.basePrice ?? it.price)}</span>${it.services.length ? `<br><small style="color:var(--accent)">+ ${it.services.map((s) => esc(C.SERVICES[s])).join(', ')} ${money(it.servicePrice || 0)}</small>` : ''}</td><td class="num">${money(it.price)}</td></tr>` : `<tr><td colspan="5" class="faint">Silinmiş perde · ${money(it.price)}</td></tr>`).join('')).join('')}
            </tbody></table></div>
            <div class="card-body" style="border-top:1px solid var(--border)">
              ${UI.kv('Perdeler', money(t.items))}${(o.fees || []).map((f) => UI.kv(esc(f.label), money(f.amount))).join('')}${t.discount ? UI.kv('İndirim', `<span style="color:var(--ok)">−${money(t.discount)}</span>`) : ''}
              ${UI.kv('<strong>Genel toplam</strong>', `<strong style="font-size:17px">${money(t.total)}</strong>`)}${UI.kv('Ödenen', money(t.paid))}${UI.kv('<strong>Kalan</strong>', `<strong style="${t.balance ? 'color:var(--danger)' : 'color:var(--ok)'}">${t.balance ? money(t.balance) : 'Ödendi'}</strong>`)}
            </div>
            ${o.payments.length ? `<div class="card-body" style="border-top:1px solid var(--border)"><div class="faint" style="font-size:12px;margin-bottom:6px;font-weight:600">ÖDEMELER</div>${o.payments.map((p) => UI.kv(`${U.dt(p.at)} · ${esc(p.method)}${p.note ? ' · ' + esc(p.note) : ''}`, money(p.amount), 'wallet')).join('')}</div>` : ''}
          </div>
          <div class="card"><div class="card-head"><h3>Sipariş geçmişi</h3></div><div class="card-body"><ul class="timeline">${[...o.history].reverse().map((x) => { const s = x.payment ? { color: '#13875a', icon: 'wallet', label: 'Ödeme' } : C.ST[x.status]; return `<li><span class="tl-ic" style="--c:${s.color}">${I(s.icon, 15)}</span><div class="tl-body"><p><strong>${s.label}</strong> — <span class="muted">${esc(x.note)}</span></p><small>${U.dt(x.at)} · ${esc(x.by || '')}</small></div></li>`; }).join('')}</ul></div></div>
        </div>
        <div class="stack">
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:6px">Teslimat</h3>
            ${UI.kv('Teslim kodu', `<span class="mono" id="dcode" style="letter-spacing:.2em">••••</span> <button class="btn-icon sm ghost" data-act="revealCode" data-code="${esc(o.deliveryCode)}" data-tip="Kodu göster">${I('eye', 15)}</button>`, 'key')}
            ${o.measureAt ? UI.kv('Ölçü randevusu', U.dt(o.measureAt), 'ruler') : UI.kv('Ölçü', esc(C.MEASURE[o.measureMethod] || '—'), 'ruler')}
            ${o.approvedAt ? UI.kv('Onay', U.dt(o.approvedAt), 'check') : ''}
            ${UI.kv(o.deliveryMethod === 'montaj' ? 'Planlanan montaj' : 'Planlanan teslim', U.dt(o.dueAt), 'calendar')}${o.readyAt ? UI.kv('Hazır', U.dt(o.readyAt), 'package') : ''}
            ${o.orderedBy ? UI.kv('Siparişi veren', `<a href="#/kisi/${o.orderedBy}">${esc(S.person(o.orderedBy)?.name || '')}</a>`, 'user') : ''}
            ${o.sokum ? UI.kv('Eski perde sökümü', 'Var', 'scissors') : ''}
            ${o.deliveredAt ? UI.kv('Teslim alan', `<a href="#/kisi/${o.deliveredTo}">${esc(o.deliveredToName)}</a>`, 'check-circle') + UI.kv('Teslim zamanı', U.dt(o.deliveredAt), 'clock') : ''}
            ${o.signature ? `<div style="margin-top:10px"><div class="faint" style="font-size:12px;margin-bottom:6px">İmza</div><img src="${o.signature}" alt="İmza" style="width:100%;max-height:120px;object-fit:contain;background:#fff;border-radius:10px;border:1px solid var(--border)"></div>` : ''}
            ${o.status === 'hazir' ? `<a class="btn primary block" style="margin-top:12px" href="#/teslimat?siparis=${id}">${I('check', 16)} Teslimat masasında aç</a>` : ''}
          </div>
          <div class="card"><div class="card-head"><h3>Teslim alabilecek kişiler</h3></div><div class="card-body flush">${members.map((m) => `<a class="agenda-item" href="#/kisi/${m.personId}" style="${m.canPickup ? '' : 'opacity:.55'}">${UI.avatar(m.person, 32)}<div class="agenda-main"><strong>${esc(m.person.name)} ${m.isPrimary ? `<span class="primary-star">${I('crown', 13)}</span>` : ''}</strong><small>${esc(m.role)}${m.person.phone ? ' · ' + esc(m.person.phone) : ''}</small></div>${m.canPickup ? `<span class="chip ok">${I('shield', 13)} Yetkili</span>` : `<span class="chip no">Yetkisiz</span>`}</a>`).join('')}
            <div class="agenda-item"><button class="btn sm ghost" data-act="linkForm" data-house="${o.houseId}">${I('user-plus', 14)} Yetkili kişi ekle</button></div></div></div>
          ${o.notes ? `<div class="note-box">${I('info', 16)}<span>${esc(o.notes)}</span></div>` : ''}
          <div class="card"><div class="card-head"><h3>SMS bildirimleri</h3><p>${msgs.length} mesaj</p></div>${msgs.length ? msgs.slice(0, 6).map((m) => `<div class="sms"><div style="min-width:0"><div class="sms-meta"><strong>${esc(S.person(m.personId)?.name || m.phone)}</strong> · ${U.rel(m.at)}</div><div class="sms-bubble">${esc(m.text)}</div></div></div>`).join('') : '<div class="card-body faint">Bu sipariş için SMS gönderilmedi.</div>'}</div>
          <div class="row">${o.status !== 'iptal' && o.status !== 'teslim' ? `<button class="btn ghost danger-text" data-act="cancelOrder" data-id="${id}">${I('ban', 16)} Siparişi iptal et</button>` : ''}<button class="btn ghost danger-text" data-act="deleteOrder" data-id="${id}">${I('trash', 16)} Sil</button></div>
        </div></div>`;
    return { title: o.code, crumbs: [['Siparişler', '#/siparisler'], [o.code]], html };
  };

  /* ---------- TESLİMAT MASASI ---------- */
  V.desk = function () {
    const q = U.qs();
    const html = `
      <div class="page-head"><div><h1>Teslimat Masası</h1><p>Hazır perdeleri teslim edin: dükkana gelen ya da montajda evde bulunan yetkili kişiyi seçin, teslim kodunu doğrulayın, perdeleri kontrol edip imza alın.</p></div></div>
      <div class="desk">
        <div class="card desk-list"><div class="card-head" style="flex-direction:column;align-items:stretch;gap:10px"><div class="row"><h3>Teslime hazır</h3><span class="count-badge" id="dcount"></span></div>
          <div class="input-wrap">${I('search', 16, 'input-ic')}<input class="input has-ic" id="dq" placeholder="Kod, ev, isim, telefon veya teslim kodu"></div></div>
          <div class="card-body" id="dlist"></div></div>
        <div id="dpanel"></div>
      </div>`;
    const mount = (el) => {
      let sel = q.siparis || null;
      const state = { person: null, code: '', codeOk: false, idOverride: false, checks: new Set(), payAmount: null, payMethod: 'Nakit', signed: false };
      const listEl = el.querySelector('#dlist');
      const panel = el.querySelector('#dpanel');
      const renderList = () => {
        const term = el.querySelector('#dq').value;
        const ready = S.orders().filter((o) => o.status === 'hazir').filter((o) => U.match(term, o.code, o.deliveryCode, houseName(o.houseId), S.members(o.houseId).map((m) => m.person.name + ' ' + m.person.phone).join(' ')));
        const others = S.orders().filter((o) => ['uretim', 'tedarik', 'teklif', 'olcu'].includes(o.status)).filter((o) => term && U.match(term, o.code, houseName(o.houseId), S.members(o.houseId).map((m) => m.person.name + ' ' + m.person.phone).join(' ')));
        el.querySelector('#dcount').textContent = ready.length;
        listEl.innerHTML = (ready.map((o) => `<div class="desk-order${sel === o.id ? ' on' : ''}" data-sel="${o.id}"><span class="room-ic" style="background:${S.house(o.houseId)?.color};color:#fff">${UI.houseIcon(S.house(o.houseId)?.type, 18)}</span><div style="min-width:0;flex:1"><strong>${esc(houseName(o.houseId))}</strong><small>${esc(o.code)} · ${o.items.length} parça · ${U.rel(o.readyAt)}</small>${V.whoCan(o.houseId, 3)}</div></div>`).join('') || (term ? '' : UI.empty('package', 'Teslime hazır sipariş yok', 'Dikimi biten siparişler burada görünür.')))
          + (others.length ? `<div class="pal-group">Henüz hazır değil</div>` + others.map((o) => `<a class="desk-order" href="#/siparis/${o.id}" style="opacity:.7"><div style="flex:1;min-width:0"><strong>${esc(houseName(o.houseId))}</strong><small>${esc(o.code)}</small></div>${UI.status(o.status, true)}</a>`).join('') : '')
          + (term && !ready.length && !others.length ? UI.empty('search', 'Sonuç yok') : '');
        listEl.querySelectorAll('[data-sel]').forEach((d) => d.addEventListener('click', () => { sel = d.dataset.sel; Object.assign(state, { person: null, code: '', codeOk: false, idOverride: false, checks: new Set(), payAmount: null, signed: false }); U.setQs({ siparis: sel }); renderList(); renderPanel(); }));
      };
      const renderPanel = () => {
        const o = sel && S.order(sel);
        if (!o) { panel.innerHTML = `<div class="card">${UI.empty('package', 'Bir sipariş seçin', 'Soldaki listeden teslim edilecek siparişi seçin ya da arama kutusuna müşterinin söylediği teslim kodunu yazın.')}</div>`; return; }
        if (o.status !== 'hazir') { panel.innerHTML = `<div class="card">${UI.empty('info', `${esc(o.code)} şu an "${C.ST[o.status].label}" aşamasında`, 'Yalnızca teslime hazır siparişler teslim edilebilir.', `<a class="btn" href="#/siparis/${o.id}">Siparişe git</a>`)}</div>`; return; }
        const t = S.totals(o);
        if (state.payAmount === null) state.payAmount = t.balance;
        const members = S.members(o.houseId);
        const step1 = !!state.person, step2 = state.codeOk || state.idOverride, step3 = state.checks.size === o.items.length;
        const canFinish = step1 && step2 && step3;
        panel.innerHTML = `<div class="card">
          <div class="card-head"><span class="room-ic" style="background:${S.house(o.houseId)?.color};color:#fff">${UI.houseIcon(S.house(o.houseId)?.type, 18)}</span><div><h3>${esc(houseName(o.houseId))}</h3><p>${esc(o.code)} · ${o.items.length} parça · ${esc(C.DELIVERY[o.deliveryMethod])}</p></div><div class="actions"><a class="btn sm ghost" href="#/siparis/${o.id}">Sipariş detayı ${I('external', 13)}</a></div></div>
          <div class="desk-step ${step1 ? 'done' : ''}"><span class="num">${step1 ? I('check', 16) : 1}</span><div class="step-body"><h4>Teslim alan kişi</h4><p>Evde kayıtlı ve teslim yetkisi olan herkes perdeleri alabilir.</p>
            <div class="pick-grid">${members.map((m) => `<button class="pick ${state.person === m.personId ? 'on' : ''} ${m.canPickup ? '' : 'no'}" ${m.canPickup ? `data-person="${m.personId}"` : 'disabled'}>${UI.avatar(m.person, 34)}<div style="min-width:0"><strong>${esc(m.person.name)}</strong><small class="${m.canPickup ? 'ok' : 'bad'}">${I(m.canPickup ? 'shield' : 'ban', 12)} ${esc(m.role)} · ${m.canPickup ? 'Yetkili' : 'Yetkisi yok'}</small></div></button>`).join('')}
              <button class="pick" data-act="linkForm" data-house="${o.houseId}" style="border-style:dashed;justify-content:center;color:var(--text-3)">${I('user-plus', 18)} <strong style="color:inherit">Listede yok, ekle</strong></button></div></div></div>
          <div class="desk-step ${step2 ? 'done' : ''} ${step1 ? '' : 'locked'}"><span class="num">${step2 ? I('check', 16) : 2}</span><div class="step-body"><h4>Teslim kodu</h4><p>Kod, sipariş hazır olduğunda ${S.authorized(o.houseId).map((m) => esc(U.firstName(m.person.name))).join(', ')} kişilerine SMS ile gönderildi. <span class="faint">(Demo: kod <strong class="mono">${esc(o.deliveryCode)}</strong>)</span></p>
            <div class="row wrap" style="gap:16px"><div class="code-inputs ${state.codeOk ? 'ok' : ''}" id="codebox">${[0, 1, 2, 3].map((i) => `<input inputmode="numeric" maxlength="1" value="${esc(state.code[i] || '')}" data-ci="${i}" aria-label="Kod hanesi ${i + 1}">`).join('')}</div>
              ${state.codeOk ? `<span class="chip ok">${I('check', 14)} Kod doğrulandı</span>` : `<label class="check-item" style="padding:8px 12px"><input type="checkbox" id="idov" ${state.idOverride ? 'checked' : ''}> Kod yok, kimlik kontrolü yaptım</label>`}</div></div></div>
          <div class="desk-step ${step3 ? 'done' : ''} ${step2 ? '' : 'locked'}"><span class="num">${step3 ? I('check', 16) : 3}</span><div class="step-body"><div class="row between"><h4>Perde kontrolü</h4><button class="btn sm ghost" id="checkall">${I('check', 14)} Tümünü işaretle</button></div><p>Her parçayı etiket koduyla kontrol ederek teslim edin.</p>
            <div class="check-list">${o.items.map((it) => { const c = S.curtain(it.curtainId); const p = S.path(it.curtainId); return c ? `<label class="check-item"><input type="checkbox" data-chk="${c.id}" ${state.checks.has(c.id) ? 'checked' : ''}>${Viz.swatch(c, 26)}<span><strong style="font-size:13px">${esc(c.type)}</strong> <span class="faint" style="font-size:12px">${esc(c.code)} · ${esc(p.room?.name || '')} · ${esc(p.facade?.name || '')}</span></span><small>${esc(c.colorName)}</small></label>` : ''; }).join('')}</div></div></div>
          <div class="desk-step ${step3 ? '' : 'locked'}"><span class="num">4</span><div class="step-body"><h4>Ödeme</h4><p>Toplam ${money(t.total)} · Ödenen ${money(t.paid)}</p>
            ${t.balance > 0 ? `<div class="form-grid"><label class="field half"><span class="field-label">Tahsil edilecek</span><div class="input-wrap"><input class="input" type="number" id="payamt" value="${state.payAmount}" min="0" max="${t.balance}"><span class="input-suffix">₺</span></div><small class="field-hint">Kalan bakiye ${money(t.balance)}</small></label>
              <div class="field half"><span class="field-label">Ödeme yöntemi</span><div class="chip-select">${C.PAYMENT.map((m) => `<label class="chip-opt"><input type="radio" name="paym" value="${m}" ${state.payMethod === m ? 'checked' : ''}><span>${m}</span></label>`).join('')}</div></div></div>` : `<div class="info-box">${I('check-circle', 16)}<span>Ödeme tamamlanmış, tahsilat gerekmiyor.</span></div>`}</div></div>
          <div class="desk-step ${step3 ? '' : 'locked'}"><span class="num">5</span><div class="step-body"><div class="row between"><h4>İmza</h4><button class="btn sm ghost" id="sigclear">${I('refresh', 14)} Temizle</button></div><p>Teslim alan kişiden ekrana imza alın.</p><canvas class="sig-pad" id="sig"></canvas></div></div>
          <div class="card-foot"><span class="faint" style="font-size:13px">${canFinish ? 'Her şey hazır.' : 'Adımları tamamlayın.'}</span><span class="grow"></span><button class="btn primary lg" id="finish" ${canFinish ? '' : 'disabled'}>${I('check-circle', 18)} Teslimatı Tamamla</button></div></div>`;
        bindPanel(o);
      };
      let sigData = null;
      const bindPanel = (o) => {
        panel.querySelectorAll('[data-person]').forEach((b) => b.addEventListener('click', () => { state.person = b.dataset.person; renderPanel(); setTimeout(() => panel.querySelector('[data-ci="0"]')?.focus(), 30); }));
        const inputs = [...panel.querySelectorAll('[data-ci]')];
        inputs.forEach((inp, i) => {
          inp.removeAttribute('maxlength');
          inp.addEventListener('input', () => {
            const digits = inp.value.replace(/\D/g, '');
            if (digits.length > 1) {
              // Yapıştırma veya hızlı yazma: haneleri sıradaki kutulara dağıt
              digits.split('').forEach((d, k) => { if (inputs[i + k]) inputs[i + k].value = d; });
              (inputs[Math.min(3, i + digits.length)] || inp).focus();
            } else {
              inp.value = digits;
              if (digits && inputs[i + 1]) inputs[i + 1].focus();
            }
            state.code = inputs.map((x) => x.value).join('');
            if (state.code.length === 4) {
              if (state.code === o.deliveryCode) { state.codeOk = true; UI.toast('Teslim kodu doğrulandı', 'ok'); renderPanel(); }
              else { const box = panel.querySelector('#codebox'); box.classList.remove('bad'); void box.offsetWidth; box.classList.add('bad'); UI.toast('Kod hatalı', 'err', 'Müşteriye gelen SMS\'teki 4 haneli kodu kontrol edin.'); }
            }
          });
          inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && inputs[i - 1]) inputs[i - 1].focus(); });
        });
        panel.querySelector('#idov')?.addEventListener('change', (e) => { state.idOverride = e.target.checked; renderPanel(); });
        panel.querySelectorAll('[data-chk]').forEach((cb) => cb.addEventListener('change', () => { if (cb.checked) state.checks.add(cb.dataset.chk); else state.checks.delete(cb.dataset.chk); renderPanel(); }));
        panel.querySelector('#checkall')?.addEventListener('click', () => { o.items.forEach((it) => state.checks.add(it.curtainId)); renderPanel(); });
        panel.querySelector('#payamt')?.addEventListener('input', (e) => { state.payAmount = Number(e.target.value) || 0; });
        panel.querySelectorAll('[name="paym"]').forEach((r) => r.addEventListener('change', () => { state.payMethod = r.value; }));
        // İmza
        const cv = panel.querySelector('#sig');
        if (cv) {
          const ratio = window.devicePixelRatio || 1;
          const rect = cv.getBoundingClientRect();
          cv.width = rect.width * ratio; cv.height = rect.height * ratio;
          const ctx = cv.getContext('2d');
          ctx.scale(ratio, ratio); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = getComputedStyle(document.body).color;
          if (sigData && state.signed) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height); img.src = sigData; }
          let drawing = false, last = null;
          const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
          cv.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); });
          cv.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke(); last = p; state.signed = true; });
          const end = () => { if (drawing) { drawing = false; sigData = cv.toDataURL('image/png'); } };
          cv.addEventListener('pointerup', end); cv.addEventListener('pointerleave', end);
          panel.querySelector('#sigclear').addEventListener('click', () => { ctx.clearRect(0, 0, cv.width, cv.height); state.signed = false; sigData = null; });
        }
        panel.querySelector('#finish')?.addEventListener('click', () => {
          const t = S.totals(o);
          const amount = Math.min(t.balance, Math.max(0, Number(state.payAmount) || 0));
          // İmzayı açık zeminde sakla
          let signature = null;
          if (state.signed && cv) {
            const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height;
            const x = c2.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c2.width, c2.height);
            x.filter = getComputedStyle(document.documentElement).colorScheme === 'dark' ? 'invert(1)' : 'none';
            x.drawImage(cv, 0, 0); signature = c2.toDataURL('image/png');
          }
          const done = S.deliver(o.id, { personId: state.person, signature, payment: amount ? { amount, method: state.payMethod } : null, codeVerified: state.codeOk });
          A.deliveredModal(done);
          sel = null; U.setQs({ siparis: '' });
          Object.assign(state, { person: null, code: '', codeOk: false, idOverride: false, checks: new Set(), payAmount: null, signed: false }); sigData = null;
          renderList(); renderPanel();
        });
      };
      el.querySelector('#dq').addEventListener('input', U.debounce(() => {
        renderList();
        const term = el.querySelector('#dq').value.trim();
        if (/^\d{4}$/.test(term)) { const m = S.orders().find((o) => o.status === 'hazir' && o.deliveryCode === term); if (m) { sel = m.id; renderList(); renderPanel(); UI.toast(`Kod ${term} → ${m.code}`, 'info'); } }
      }, 120));
      renderList(); renderPanel();
      App.onRefresh = () => { renderList(); renderPanel(); };
    };
    return { title: 'Teslimat Masası', crumbs: [['Teslimat Masası']], html, mount };
  };

  /* ---------- TAKVİM ---------- */
  V.calendar = function () {
    const q = U.qs();
    const now = new Date();
    const [y, m] = (q.ay || `${now.getFullYear()}-${now.getMonth() + 1}`).split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
    const selDay = q.gun || U.toDateInput(now.toISOString());
    const events = [];
    S.orders().forEach((o) => {
      if (o.measureAt && o.status !== 'iptal') events.push({ at: o.measureAt, o, kind: 'olcu', label: 'Ölçü randevusu', color: C.ST.olcu.color, icon: 'ruler' });
      if (['tedarik', 'uretim', 'hazir'].includes(o.status)) events.push({ at: o.dueAt, o, kind: 'plan', label: o.deliveryMethod === 'montaj' ? 'Montaj planı' : 'Teslim planı', color: o.status === 'hazir' ? C.ST.hazir.color : C.ST.uretim.color, icon: o.deliveryMethod === 'montaj' ? 'sparkles' : 'package' });
      if (o.status === 'teslim') events.push({ at: o.deliveredAt, o, kind: 'teslim', label: o.deliveryMethod === 'montaj' ? 'Montaj yapıldı' : 'Teslim edildi', color: C.ST.teslim.color, icon: 'check-circle' });
      if (o.approvedAt) events.push({ at: o.approvedAt, o, kind: 'onay', label: 'Sipariş onaylandı', color: C.ST.teklif.color, icon: 'tag' });
    });
    const key = (iso) => U.toDateInput(iso);
    const byDay = {};
    events.forEach((e) => { (byDay[key(e.at)] = byDay[key(e.at)] || []).push(e); });
    Object.values(byDay).forEach((l) => l.sort((a, b) => (a.at < b.at ? -1 : 1)));
    const prev = new Date(y, m - 2, 1), next = new Date(y, m, 1);
    const days = [];
    for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
    const dayEvents = byDay[selDay] || [];
    const html = `
      <div class="page-head"><div><h1>Takvim</h1><p>Ölçü randevuları, onaylanan siparişler, planlanan montaj ve teslimler.</p></div>
        <div class="actions"><a class="btn-icon" href="#/takvim?ay=${prev.getFullYear()}-${prev.getMonth() + 1}">${I('chevron-left')}</a><a class="btn" href="#/takvim">Bugün</a><a class="btn-icon" href="#/takvim?ay=${next.getFullYear()}-${next.getMonth() + 1}">${I('chevron-right')}</a></div></div>
      <div class="split">
        <div class="card" style="overflow:hidden"><div class="card-head"><h3 style="font-size:18px;font-family:var(--font-display);font-weight:600">${U.MONTHS[m - 1]} ${y}</h3><div class="actions legend">${[['Ölçü', C.ST.olcu.color], ['Onay', C.ST.teklif.color], ['Teslim/montaj planı', C.ST.uretim.color], ['Hazır', C.ST.hazir.color], ['Teslim edildi', C.ST.teslim.color]].map(([l, c]) => `<span style="--c:${c}"><i></i>${l}</span>`).join('')}</div></div>
          <div class="cal">${['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => `<div class="cal-h">${d}</div>`).join('')}
          ${days.map((d) => { const k = key(d.toISOString()); const ev = byDay[k] || []; const isT = k === key(now.toISOString()); return `<a class="cal-d ${d.getMonth() !== m - 1 ? 'out' : ''} ${isT ? 'today' : ''} ${k === selDay ? 'sel' : ''}" href="#/takvim?ay=${y}-${m}&gun=${k}"><span class="cal-n">${d.getDate()}</span>${ev.slice(0, 3).map((e) => `<span class="cal-ev" style="--c:${e.color}">${I(e.icon, 11)}<span>${esc(houseName(e.o.houseId))}</span></span>`).join('')}${ev.length > 3 ? `<span class="cal-more">+${ev.length - 3} daha</span>` : ''}</a>`; }).join('')}</div></div>
        <div class="card"><div class="card-head"><div><h3>${U.dateLong(new Date(selDay + 'T12:00').toISOString())}</h3><p>${dayEvents.length} kayıt</p></div></div>
          <div class="card-body flush">${dayEvents.length ? dayEvents.map((e) => `<a class="agenda-item" href="#/siparis/${e.o.id}"><div class="agenda-time"><strong>${U.time(e.at)}</strong></div><span class="tl-ic" style="--c:${e.color}">${I(e.icon, 15)}</span><div class="agenda-main"><strong>${esc(houseName(e.o.houseId))}</strong><small>${e.label} · ${esc(e.o.code)} · ${e.o.items.length} parça${e.kind === 'teslim' ? ' · ' + esc(e.o.deliveredToName || '') : ''}</small></div></a>`).join('') : UI.empty('calendar', 'Bu gün için kayıt yok')}</div></div>
      </div>`;
    return { title: 'Takvim', crumbs: [['Takvim']], html };
  };

  /* ---------- MESAJLAR ---------- */
  V.messages = function () {
    const q = U.qs();
    const kinds = { '': 'Tümü', randevu: 'Ölçü randevusu', teklif: 'Teklif', onay: 'Onay', hazir: 'Teslime hazır', teslim: 'Teslim edildi', bilgi: 'Bilgi' };
    const html = `
      <div class="page-head"><div><h1>Mesajlar</h1><p>Müşterilere giden otomatik ve manuel SMS bildirimleri (demo – gerçek SMS gönderilmez).</p></div>
        <div class="actions"><button class="btn primary" data-act="smsForm">${I('send', 16)} Yeni SMS</button></div></div>
      <div class="toolbar"><div class="input-wrap">${I('search', 16, 'input-ic')}<input class="input has-ic" id="mq" placeholder="Kişi, telefon veya mesaj içeriği…" value="${esc(q.q || '')}"></div>
        <div class="seg" id="mk">${Object.entries(kinds).map(([k, l]) => `<button data-k="${k}" class="${(q.tur || '') === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="card" id="msg-out"></div>`;
    const mount = (el) => {
      const out = el.querySelector('#msg-out');
      const render = () => {
        const p = U.qs();
        const list = S.messages().filter((m) => (!p.tur || m.kind === p.tur) && (!p.kisi || m.personId === p.kisi) && U.match(p.q || '', S.person(m.personId)?.name, m.phone, m.text)).slice(0, 120);
        out.innerHTML = list.length ? list.map((m) => { const per = S.person(m.personId); const o = m.orderId && S.order(m.orderId); return `<div class="sms">${UI.avatar(per || { name: m.phone }, 36)}<div style="min-width:0;flex:1"><div class="sms-meta"><a href="#/kisi/${m.personId}"><strong>${esc(per?.name || 'Silinmiş kişi')}</strong></a><span>${esc(m.phone)}</span><span>·</span><span>${U.dt(m.at)}</span>${o ? `<a class="chip" style="height:22px" href="#/siparis/${o.id}">${esc(o.code)}</a>` : ''}<span class="chip ok" style="height:22px">${I('check', 12)} ${esc(m.status)}</span></div><div class="sms-bubble">${esc(m.text)}</div></div></div>`; }).join('') : UI.empty('message', 'Mesaj yok');
      };
      el.querySelector('#mq').addEventListener('input', U.debounce((e) => { U.setQs({ q: e.target.value }); render(); }, 120));
      el.querySelectorAll('#mk button').forEach((b) => b.addEventListener('click', () => { el.querySelectorAll('#mk button').forEach((x) => x.classList.toggle('on', x === b)); U.setQs({ tur: b.dataset.k }); render(); }));
      render();
    };
    return { title: 'Mesajlar', crumbs: [['Mesajlar']], html, mount };
  };

  /* ---------- PERDELER (KATALOG) ---------- */
  V.curtains = function () {
    const q = U.qs();
    const html = `
      <div class="page-head"><div><h1>Perdeler</h1><p>Tüm evlerdeki ${S.allCurtains().length} perde: türü, kumaşı, ölçüsü, takılma tarihi ve garantisiyle.</p></div></div>
      <div class="grid g5" style="margin-bottom:18px" id="type-tiles"></div>
      <div class="toolbar">
        <div class="input-wrap">${I('search', 16, 'input-ic')}<input class="input has-ic" id="cq" placeholder="Kod, kumaş, renk, ev veya oda ara…" value="${esc(q.q || '')}"></div>
        <select class="input" id="ct"><option value="">Tüm türler</option>${C.TYPE_LIST.map((t) => `<option ${q.tur === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <select class="input" id="cs"><option value="">Tüm durumlar</option><option value="takili" ${q.durum === 'takili' ? 'selected' : ''}>Takılı</option><option value="siparis" ${q.durum === 'siparis' ? 'selected' : ''}>Siparişte (teklif/üretim)</option><option value="uretim" ${q.durum === 'uretim' ? 'selected' : ''}>Üretimde</option><option value="garanti" ${q.durum === 'garanti' ? 'selected' : ''}>Garantisi biten</option><option value="yenile" ${q.durum === 'yenile' ? 'selected' : ''}>Yenilenmeli (yıpranmış)</option><option value="kayitli" ${q.durum === 'kayitli' ? 'selected' : ''}>Siparişi olmayan</option></select>
        <span class="grow"></span><span class="faint" id="ccount" style="font-size:13px"></span></div>
      <div class="card"><div class="tbl-wrap" id="cur-out"></div></div>`;
    const mount = (el) => {
      const out = el.querySelector('#cur-out');
      let limit = 80;
      const counts = {};
      S.allCurtains().forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
      el.querySelector('#type-tiles').innerHTML = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, n]) => `<a class="card kpi" href="#/perdeler?tur=${encodeURIComponent(t)}"><div class="kpi-label"><span class="ic-box">${I('curtain', 16)}</span>${t}</div><div class="kpi-value">${n}</div><div class="kpi-sub">${esc(C.CURTAIN_TYPES[t].desc)}</div></a>`).join('');
      const render = () => {
        const p = U.qs();
        const list = S.allCurtains().filter((c) => {
          if (p.tur && c.type !== p.tur) return false;
          const st = S.curtainStatus(c.id);
          if (p.durum === 'takili' && st.key !== 'takili') return false;
          if (p.durum === 'siparis' && !st.order) return false;
          if (p.durum === 'uretim' && !['tedarik', 'uretim', 'hazir'].includes(st.key)) return false;
          if (p.durum === 'garanti') { const w = S.warrantyEnd(c); if (!w || new Date(w) > new Date()) return false; }
          if (p.durum === 'yenile' && !['Yıpranmış', 'Değişmeli'].includes(c.condition)) return false;
          if (p.durum === 'kayitli' && st.key !== 'kayitli') return false;
          const path = S.path(c.id);
          return U.match(p.q || '', c.code, c.type, c.fabric, c.colorName, path.house?.title, path.room?.name, path.facade?.name);
        });
        el.querySelector('#ccount').textContent = `${list.length} perde · ${num(sum(list, (c) => C.area(c)), 0)} m²`;
        out.innerHTML = list.length ? `<table class="tbl"><thead><tr><th>Perde</th><th>Konum</th><th>Ölçü</th><th class="num">Kumaş</th><th>Durum</th><th>Takılma</th><th>Garanti</th></tr></thead><tbody>
          ${list.slice(0, limit).map((c) => { const path = S.path(c.id); return `<tr class="link" data-href="#/perde/${c.id}"><td><div class="cell-main">${Viz.swatch(c, 36)}<div><strong>${esc(c.type)} <span class="faint mono" style="font-size:11.5px">${esc(c.code)}</span></strong><small>${esc(c.fabric)} · ${esc(c.colorName)}</small></div></div></td><td><strong style="font-weight:600">${esc(path.house?.title)}</strong><br><small class="faint">${esc(path.room?.name)} · ${esc(path.facade?.name)}</small></td><td class="nowrap">${UI.dim(c)}${!C.CURTAIN_TYPES[c.type].flat ? `<br><small class="faint">pile 1:${c.pleat}</small>` : ''}</td><td class="num">${C.CURTAIN_TYPES[c.type].flat ? num(C.flatArea(c), 1) + ' m²' : num(C.fabricMeters(c), 1) + ' m'}</td><td>${UI.curtainStatus(c.id, true)}${['Yıpranmış', 'Değişmeli'].includes(c.condition) ? ` <span class="chip" style="height:22px;color:var(--accent)">${I('refresh', 12)} ${esc(c.condition)}</span>` : ''}</td><td>${c.installedAt ? U.date(c.installedAt) : '<span class="faint">—</span>'}</td><td>${(() => { const w = S.warrantyEnd(c); return w ? (new Date(w) > new Date() ? `<span class="chip ok" style="height:22px">${I('shield', 12)} ${U.date(w)}</span>` : '<span class="faint">Bitti</span>') : '<span class="faint">—</span>'; })()}</td></tr>`; }).join('')}</tbody></table>
          ${list.length > limit ? `<div class="card-foot"><button class="btn block" id="more">${list.length - limit} perde daha göster</button></div>` : ''}` : UI.empty('curtain', 'Perde bulunamadı');
        out.querySelector('#more')?.addEventListener('click', () => { limit += 120; render(); });
      };
      el.querySelector('#cq').addEventListener('input', U.debounce((e) => { U.setQs({ q: e.target.value }); limit = 80; render(); }, 120));
      el.querySelector('#ct').addEventListener('change', (e) => { U.setQs({ tur: e.target.value }); render(); });
      el.querySelector('#cs').addEventListener('change', (e) => { U.setQs({ durum: e.target.value }); render(); });
      render();
    };
    return { title: 'Perdeler', crumbs: [['Perdeler']], html, mount };
  };
})();
