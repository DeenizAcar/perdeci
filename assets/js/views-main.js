/* Perdeci — Panel, Evler, Ev / Oda / Cephe / Perde */
(function () {
  const V = (window.V = window.V || {});
  const { esc, money, num } = U;

  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const houseName = (id) => S.house(id)?.title || 'Silinmiş ev';

  /* ---------- Ortak parçalar ---------- */
  V.actItem = function (ev) {
    let icon = 'info', color = '#7b8794', html = '';
    if (ev.kind === 'event') {
      icon = ev.icon || 'info';
      html = ev.ref ? `<a class="ref" href="${ev.ref}">${esc(ev.text)}</a>` : esc(ev.text);
    } else if (ev.kind === 'payment') {
      icon = 'wallet'; color = '#13875a';
      html = `<a class="ref" href="#/siparis/${ev.order.id}">${esc(ev.order.code)}</a> · ${esc(houseName(ev.order.houseId))} — ${esc(ev.note)}`;
    } else {
      const st = C.ST[ev.kind] || C.ST.atolyede;
      icon = st.icon; color = st.color;
      html = `<a class="ref" href="#/siparis/${ev.order.id}">${esc(ev.order.code)}</a> · ${esc(houseName(ev.order.houseId))} — <span class="muted">${esc(ev.note)}</span>`;
    }
    return `<li><span class="tl-ic" style="--c:${color}">${I(icon, 15)}</span><div class="tl-body"><p>${html}</p><small>${U.rel(ev.at)}${ev.by ? ' · ' + esc(ev.by) : ''}</small></div></li>`;
  };

  V.miniCurtain = (c) => {
    const st = S.curtainStatus(c.id);
    return `<span class="mini-curtain" style="--sw:${c.color};--st:${st.color}" data-tip="${esc(`${c.code} · ${c.type} · ${c.fabric} · ${c.colorName}\n${st.label}`)}"><i></i>${esc(c.type)}${st.key !== 'evde' ? '<b></b>' : ''}</span>`;
  };

  V.whoCan = (houseId, max = 6) => {
    const a = S.authorized(houseId);
    return `<div class="who-can">${a.slice(0, max).map((m) => `<span class="chip ok" data-tip="${esc(m.role + (m.person.phone ? ' · ' + m.person.phone : ''))}">${UI.avatar(m.person, 18)}${esc(U.firstName(m.person.name))}</span>`).join('')}${a.length > max ? `<span class="chip">+${a.length - max}</span>` : ''}</div>`;
  };

  V.houseCard = function (h) {
    const st = S.houseStats(h.id);
    const members = S.members(h.id).map((m) => m.person);
    return `<a class="card house-card" href="#/ev/${h.id}" style="--hc:${h.color || '#1e5b55'}">
      <div class="house-cover">
        <div class="hc-icon">${UI.houseIcon(h.type, 22)}</div>
        <span class="hc-code">${esc(h.code)}</span>
        <svg class="curtain-deco" width="120" height="88" viewBox="0 0 120 88"><path d="M0 4h120" stroke="#fff" stroke-width="3"/><path d="M4 4c6 30 4 60 0 84h36C30 60 34 30 40 4z" fill="#fff"/><path d="M116 4c-6 30-4 60 0 84H80c10-28 6-58 0-84z" fill="#fff"/></svg>
        ${st.active ? `<div class="hc-status">${UI.status(st.active.status, true)}</div>` : ''}
      </div>
      <div class="house-body">
        <div><h3>${esc(h.title)}</h3>
          <div class="row wrap" style="gap:5px;margin-top:6px"><span class="type-chip">${esc(h.type)}${h.layout && /\+/.test(h.layout) ? ' · ' + esc(h.layout) : ''}</span>${(h.tags || []).map(UI.tag).join('')}</div></div>
        <div class="house-addr">${I('pin', 14)}<span>${esc(h.neighborhood)}, ${esc(h.district)} / ${esc(h.city)}<br><span class="faint">${esc(h.street)} · ${esc(h.unit)}</span></span></div>
        <div class="house-stats"><div><strong>${st.rooms}</strong><span>Oda</span></div><div><strong>${st.facades}</strong><span>Cephe</span></div><div><strong>${st.curtains}</strong><span>Perde</span></div></div>
        <div class="house-foot">${UI.avatars(members, 4, 28)}<span class="faint" style="font-size:12px">${members.length} kişi · ${S.authorized(h.id).length} yetkili</span><span class="grow"></span>${st.balance > 0 ? `<span class="chip" style="color:var(--danger)" data-tip="Açık bakiye">${money(st.balance)}</span>` : (st.last ? `<span class="faint" style="font-size:12px" data-tip="Son teslim">${U.rel(st.last.deliveredAt)}</span>` : '')}</div>
      </div></a>`;
  };

  /* ---------- PANEL ---------- */
  V.dashboard = function () {
    const shop = S.shop();
    const orders = S.orders();
    const active = S.activeOrders();
    const by = (k) => active.filter((o) => o.status === k);
    const ready = by('hazir').sort((a, b) => (a.readyAt < b.readyAt ? -1 : 1));
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 864e5), d60 = new Date(now.getTime() - 60 * 864e5);
    const pays = orders.flatMap((o) => o.payments.map((p) => ({ ...p, o })));
    const monthRev = sum(pays.filter((p) => new Date(p.at) >= d30), (p) => p.amount);
    const prevRev = sum(pays.filter((p) => new Date(p.at) >= d60 && new Date(p.at) < d30), (p) => p.amount);
    const delta = prevRev ? Math.round(((monthRev - prevRev) / prevRev) * 100) : 0;
    const openOrders = orders.filter((o) => o.status === 'teslim' && S.totals(o).balance > 0);
    const balance = sum(openOrders, (o) => S.totals(o).balance);
    const wsItems = active.filter((o) => o.status !== 'planlandi').flatMap((o) => o.items).map((i) => S.curtain(i.curtainId)).filter(Boolean);
    const wsArea = sum(wsItems, (c) => C.area(c));
    const h = now.getHours();
    const greet = h < 5 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : h < 22 ? 'İyi akşamlar' : 'İyi geceler';

    // Ajanda
    const todayEnd = U.sod(now).getTime() + 2 * 864e5;
    const agenda = [];
    by('planlandi').forEach((o) => { if (new Date(o.pickupAt).getTime() < todayEnd) agenda.push({ at: o.pickupAt, o, kind: 'alim' }); });
    active.filter((o) => o.status !== 'planlandi').forEach((o) => { if (new Date(o.dueAt).getTime() < todayEnd) agenda.push({ at: o.dueAt, o, kind: 'teslim' }); });
    agenda.sort((a, b) => (a.at < b.at ? -1 : 1));
    const todayPick = agenda.filter((a) => a.kind === 'alim' && U.dayDiff(a.at) === 0).length;
    const todayDue = agenda.filter((a) => a.kind === 'teslim' && U.dayDiff(a.at) <= 0).length;

    // Haftalık tahsilat (son 12 hafta)
    const weekStart = (d) => { const x = U.sod(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x; };
    const w0 = weekStart(now);
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const s = new Date(w0.getTime() - i * 7 * 864e5), e = new Date(s.getTime() + 7 * 864e5);
      weeks.push({ label: `${s.getDate()} ${U.MONTHS_S[s.getMonth()]}`, value: sum(pays.filter((p) => new Date(p.at) >= s && new Date(p.at) < e), (p) => p.amount), s });
    }
    const typeCounts = {};
    wsItems.forEach((c) => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
    const typeData = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: v, tip: `${k}: ${v} parça atölyede` }));

    // En değerli evler & çoklu ev sahipleri
    const top = S.houses().map((h) => ({ h, st: S.houseStats(h.id) })).sort((a, b) => b.st.spent - a.st.spent).slice(0, 6);
    const multi = S.people().map((p) => ({ p, hs: S.personHouses(p.id) })).filter((x) => x.hs.length > 1).sort((a, b) => b.hs.length - a.hs.length).slice(0, 6);

    const html = `
      <section class="hero-greet">
        <svg class="hero-deco" width="300" height="220" viewBox="0 0 120 88"><path d="M0 4h120" stroke="#fff" stroke-width="3"/><path d="M4 4c6 30 4 60 0 84h36C30 60 34 30 40 4z" fill="#fff"/><path d="M116 4c-6 30-4 60 0 84H80c10-28 6-58 0-84z" fill="#fff"/></svg>
        <div><div class="eyebrow" style="color:rgba(255,255,255,.7)">${U.dateLong(now.toISOString())}</div>
          <h1>${greet}, ${esc(shop.ownerShort)}</h1>
          <p>Bugün <strong>${todayPick}</strong> alım randevusu ve <strong>${todayDue}</strong> teslim planı var. <strong>${ready.length}</strong> sipariş teslim alınmayı bekliyor, atölyede <strong>${wsItems.length}</strong> parça perde işlemde.</p></div>
        <div class="hero-actions"><a class="btn" href="#/teslimat">${I('package', 16)} Teslimat Masası</a><button class="btn light" data-act="newOrder">${I('plus', 16)} Yeni Sipariş</button></div>
      </section>

      <div class="grid g5">
        ${kpi('clipboard', 'Aktif sipariş', num(active.length), `${by('planlandi').length} alım planlı · ${active.length - by('planlandi').length} atölyede`, '#/siparisler')}
        ${kpi('package', 'Teslime hazır', num(ready.length), ready.length ? `En eskisi ${U.rel(ready[0].readyAt)}` : 'Bekleyen yok', '#/teslimat')}
        ${kpi('wallet', 'Son 30 gün tahsilat', money(monthRev), `<span class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} %${Math.abs(delta)}</span> önceki 30 güne göre`, '#/raporlar')}
        ${kpi('alert', 'Açık bakiye', money(balance), `Teslim edilmiş ${openOrders.length} siparişte alacak`, '#/siparisler?gorunum=liste&durum=teslim&bakiye=1')}
        ${kpi('droplets', 'Atölyedeki perde', num(wsItems.length), `${num(wsArea, 0)} m² kumaş işlemde`, '#/perdeler?durum=atolye')}
      </div>

      <div class="section-title"><h2>Sipariş akışı</h2><div class="actions"><a class="btn sm ghost" href="#/siparisler">Panoya git ${I('arrow-right', 14)}</a></div></div>
      <div class="pipeline">${C.ACTIVE.map((k) => {
        const st = C.ST[k]; const list = by(k);
        const items = sum(list, (o) => o.items.length);
        return `<a class="pipe" href="#/siparisler?durum=${k}" style="--c:${st.color}"><div class="pipe-top">${I(st.icon, 16)} ${st.label}</div><div class="pipe-num">${list.length}</div><div class="pipe-sub">${items} parça perde${list.length ? ' · ' + money(sum(list, (o) => S.totals(o).total)) : ''}</div></a>`;
      }).join('')}</div>

      <div class="split wide" style="margin-top:18px">
        <div class="card">
          <div class="card-head"><h3>Ajanda</h3><p>Bugün, yarın ve gecikenler</p><div class="actions"><a class="btn sm ghost" href="#/takvim">${I('calendar', 14)} Takvim</a></div></div>
          <div class="card-body flush">${agenda.length ? agenda.map((a) => {
            const o = a.o; const dd = U.dayDiff(a.at);
            const late = a.kind === 'teslim' && dd < 0;
            return `<a class="agenda-item" href="#/siparis/${o.id}">
              <div class="agenda-time"><strong>${U.time(a.at)}</strong><small style="${late ? 'color:var(--danger)' : ''}">${dd === 0 ? 'Bugün' : dd === 1 ? 'Yarın' : dd < 0 ? `${-dd} gün geç` : U.dshort(a.at)}</small></div>
              <span class="tl-ic" style="--c:${a.kind === 'alim' ? C.ST.planlandi.color : C.ST[o.status].color}">${I(a.kind === 'alim' ? 'truck' : 'package', 15)}</span>
              <div class="agenda-main"><strong>${esc(houseName(o.houseId))}</strong><small>${esc(o.code)} · ${a.kind === 'alim' ? esc(C.PICKUP[o.pickupMethod]) : 'Planlanan teslim · ' + esc(C.DELIVERY[o.deliveryMethod])} · ${o.items.length} parça</small></div>
              ${UI.status(o.status, true)}</a>`;
          }).join('') : UI.empty('calendar', 'Ajanda boş', 'Bugün ve yarın için planlanmış iş yok.')}</div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Teslim bekleyenler</h3><p>Evdeki yetkili herkes teslim alabilir</p></div>
          <div class="card-body flush">${ready.length ? ready.map((o) => `
            <div class="agenda-item">
              <div class="agenda-main"><a href="#/siparis/${o.id}"><strong>${esc(houseName(o.houseId))}</strong></a><small>${esc(o.code)} · ${o.items.length} parça · ${U.rel(o.readyAt)} hazır${S.totals(o).balance ? ' · ' + money(S.totals(o).balance) + ' tahsil edilecek' : ' · ödendi'}</small>${V.whoCan(o.houseId, 4)}</div>
              <a class="btn sm soft" href="#/teslimat?siparis=${o.id}">${I('check', 14)} Teslim et</a></div>`).join('') : UI.empty('package', 'Teslim bekleyen yok', 'Hazır siparişler burada listelenir.')}</div>
        </div>
      </div>

      <div class="grid g2" style="margin-top:18px">
        <div class="card"><div class="card-head"><h3>Haftalık tahsilat</h3><p>Son 12 hafta · ₺</p><div class="actions"><span class="faint" style="font-size:12.5px">Bu hafta: <strong style="color:var(--text)">${money(weeks[weeks.length - 1].value)}</strong></span></div></div>
          <div class="card-body">${Viz.columns(weeks, { height: 190, hlLast: true, tipFmt: (d) => `${d.label} haftası: ${money(d.value)}` })}</div></div>
        <div class="card"><div class="card-head"><h3>Atölyedeki perdeler</h3><p>Türe göre parça sayısı</p></div>
          <div class="card-body">${typeData.length ? Viz.hbars(typeData) : UI.empty('droplets', 'Atölye boş')}</div></div>
      </div>

      <div class="split" style="margin-top:18px">
        <div class="card"><div class="card-head"><h3>Son hareketler</h3><div class="actions"><a class="btn sm ghost" href="#/siparisler?gorunum=liste">Tümü</a></div></div>
          <div class="card-body"><ul class="timeline">${S.activity(12).map(V.actItem).join('')}</ul></div></div>
        <div class="stack">
          <div class="card"><div class="card-head"><h3>En değerli müşteriler</h3><p>Toplam ödeme</p></div>
            <div class="card-body flush">${top.map(({ h, st }, i) => `<a class="agenda-item" href="#/ev/${h.id}"><span class="count-badge">${i + 1}</span><div class="agenda-main"><strong>${esc(h.title)}</strong><small>${st.orders} sipariş · ${st.curtains} perde</small></div><strong class="mono">${money(st.spent)}</strong></a>`).join('')}</div></div>
          <div class="card"><div class="card-head"><h3>Birden fazla evi olanlar</h3></div>
            <div class="card-body flush">${multi.map(({ p, hs }) => `<a class="agenda-item" href="#/kisi/${p.id}">${UI.avatar(p, 34)}<div class="agenda-main"><strong>${esc(p.name)}</strong><small>${hs.map((x) => esc(x.house.title)).join(' · ')}</small></div><span class="count-badge">${hs.length}</span></a>`).join('')}</div></div>
        </div>
      </div>`;
    return { title: 'Panel', crumbs: [['Panel']], html };

    function kpi(icon, label, value, sub, href) {
      return `<a class="card kpi" href="${href}"><div class="kpi-label"><span class="ic-box">${I(icon, 16)}</span>${label}</div><div class="kpi-value">${value}</div><div class="kpi-sub">${sub}</div></a>`;
    }
  };

  /* ---------- EVLER ---------- */
  V.houses = function () {
    const q = U.qs();
    const districts = [...new Set(S.houses().map((h) => h.district))].sort((a, b) => a.localeCompare(b, 'tr'));
    const types = Object.keys(C.HOUSE_TYPES);
    const html = `
      <div class="page-head"><div><h1>Evler</h1><p>Perdelerini yıkadığınız ${S.houses().length} adres. Her evin odaları, cepheleri ve perdeleri ayrı ayrı kayıtlı.</p></div>
        <div class="actions"><button class="btn primary" data-act="houseForm">${I('plus', 16)} Yeni Ev</button></div></div>
      <div class="toolbar">
        <div class="input-wrap">${I('search', 16, 'input-ic')}<input class="input has-ic" id="hq" placeholder="Ev adı, adres, kod veya kişi ara…" value="${esc(q.q || '')}"></div>
        <select class="input" id="hd"><option value="">Tüm ilçeler</option>${districts.map((d) => `<option ${q.ilce === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>
        <select class="input" id="ht"><option value="">Tüm türler</option>${types.map((d) => `<option ${q.tur === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>
        <select class="input" id="hs"><option value="">Tüm durumlar</option><option value="aktif" ${q.durum === 'aktif' ? 'selected' : ''}>Aktif siparişi olan</option><option value="hazir" ${q.durum === 'hazir' ? 'selected' : ''}>Teslime hazır</option><option value="bakiye" ${q.durum === 'bakiye' ? 'selected' : ''}>Açık bakiyesi olan</option></select>
        <span class="grow"></span>
        <div class="seg"><button data-view="grid" class="${q.gorunum !== 'liste' ? 'on' : ''}">${I('grid', 15)} Kart</button><button data-view="liste" class="${q.gorunum === 'liste' ? 'on' : ''}">${I('list', 15)} Liste</button></div>
      </div>
      <div id="houses-out"></div>`;
    const mount = (el) => {
      const out = el.querySelector('#houses-out');
      const render = () => {
        const p = U.qs();
        let list = S.houses().filter((h) => {
          if (p.ilce && h.district !== p.ilce) return false;
          if (p.tur && h.type !== p.tur) return false;
          const st = S.houseStats(h.id);
          if (p.durum === 'aktif' && !st.active) return false;
          if (p.durum === 'hazir' && st.active?.status !== 'hazir') return false;
          if (p.durum === 'bakiye' && !st.balance) return false;
          const names = S.members(h.id).map((m) => m.person.name).join(' ');
          return U.match(p.q || '', h.title, h.code, h.district, h.neighborhood, h.street, h.unit, names, (h.tags || []).join(' '));
        });
        if (!list.length) { out.innerHTML = UI.empty('home', 'Eşleşen ev bulunamadı', 'Filtreleri değiştirmeyi ya da yeni bir ev eklemeyi deneyin.', `<button class="btn primary" data-act="houseForm">${I('plus', 16)} Yeni Ev</button>`); return; }
        if (p.gorunum === 'liste') {
          out.innerHTML = `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ev</th><th>Adres</th><th>Kişiler</th><th class="num">Oda</th><th class="num">Perde</th><th>Durum</th><th class="num">Toplam ödeme</th><th class="num">Bakiye</th></tr></thead><tbody>
            ${list.map((h) => { const st = S.houseStats(h.id); return `<tr class="link" data-href="#/ev/${h.id}"><td><div class="cell-main"><span class="room-ic" style="background:${h.color};color:#fff;width:34px;height:34px;border-radius:10px">${UI.houseIcon(h.type, 16)}</span><div><strong>${esc(h.title)}</strong><small>${esc(h.code)} · ${esc(h.type)}</small></div></div></td><td>${esc(h.neighborhood)}, ${esc(h.district)}<br><small class="faint">${esc(h.unit)}</small></td><td>${UI.avatars(S.members(h.id).map((m) => m.person), 4, 26)}</td><td class="num">${st.rooms}</td><td class="num">${st.curtains}</td><td>${st.active ? UI.status(st.active.status, true) : '<span class="faint">—</span>'}</td><td class="num">${money(st.spent)}</td><td class="num" style="${st.balance ? 'color:var(--danger);font-weight:600' : ''}">${st.balance ? money(st.balance) : '—'}</td></tr>`; }).join('')}
            </tbody></table></div></div>`;
        } else {
          out.innerHTML = `<div class="cards-auto">${list.map(V.houseCard).join('')}<button class="add-tile" data-act="houseForm">${I('plus', 22)} Yeni ev ekle</button></div>`;
        }
      };
      const deb = U.debounce(() => { U.setQs({ q: el.querySelector('#hq').value }); render(); }, 120);
      el.querySelector('#hq').addEventListener('input', deb);
      el.querySelector('#hd').addEventListener('change', (e) => { U.setQs({ ilce: e.target.value }); render(); });
      el.querySelector('#ht').addEventListener('change', (e) => { U.setQs({ tur: e.target.value }); render(); });
      el.querySelector('#hs').addEventListener('change', (e) => { U.setQs({ durum: e.target.value }); render(); });
      el.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { el.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('on', x === b)); U.setQs({ gorunum: b.dataset.view === 'liste' ? 'liste' : '' }); render(); }));
      render();
    };
    return { title: 'Evler', crumbs: [['Evler']], html, mount };
  };

  /* ---------- EV DETAY ---------- */
  V.house = function ({ id }) {
    const h = S.house(id);
    if (!h) return V.notFound('Ev bulunamadı');
    const q = U.qs();
    const tab = q.sekme || 'odalar';
    const st = S.houseStats(id);
    const rooms = S.rooms(id);
    const members = S.members(id);
    const prim = S.primary(id);
    const orders = S.houseOrders(id);
    const tabs = [['odalar', 'Odalar & Perdeler', 'door', rooms.length], ['kisiler', 'Kişiler', 'users', members.length], ['siparisler', 'Siparişler', 'clipboard', orders.length], ['bilgi', 'Adres & Notlar', 'info']];

    let body = '';
    if (tab === 'odalar') {
      body = `<div class="split left">
        <div class="card" style="position:sticky;top:80px">${V.tree(h)}</div>
        <div class="cards-auto" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">
          ${rooms.map((r) => V.roomCard(r)).join('')}
          <button class="add-tile" data-act="roomForm" data-house="${id}">${I('plus', 22)} Oda ekle</button>
        </div></div>`;
    } else if (tab === 'kisiler') {
      body = `<div class="info-box" style="margin-bottom:16px">${I('shield', 18)}<div><strong>Teslim yetkisi:</strong> Bu evde ${S.authorized(id).length} kişi perdeleri teslim alabilir. Sipariş hazır olduğunda yetkililerin hepsine teslim kodu SMS ile gider; dükkana gelen yetkili kişi kodu söyleyerek teslim alır.</div></div>
        <div class="cards-auto">${members.map((m) => V.memberCard(m, id)).join('')}
          <button class="add-tile" data-act="linkForm" data-house="${id}">${I('user-plus', 22)} Kişi bağla</button></div>`;
    } else if (tab === 'siparisler') {
      body = orders.length ? `<div class="card"><div class="tbl-wrap">${V.ordersTable(orders, { house: false })}</div></div>` : UI.empty('clipboard', 'Henüz sipariş yok', 'Bu ev için ilk yıkama siparişini oluşturun.', `<button class="btn primary" data-act="newOrder" data-house="${id}">${I('plus', 16)} Sipariş oluştur</button>`);
    } else {
      const evs = orders.flatMap((o) => o.history.map((x) => ({ at: x.at, kind: x.payment ? 'payment' : x.status, order: o, note: x.note, by: x.by }))).sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 14);
      body = `<div class="split">
        <div class="stack">
          <div class="card"><div class="card-head"><h3>Adres</h3><div class="actions"><button class="btn sm ghost" data-act="houseForm" data-id="${id}">${I('edit', 14)} Düzenle</button></div></div>
            <div class="card-body">${UI.kv('İl / İlçe', `${esc(h.city)} / ${esc(h.district)}`, 'pin')}${UI.kv('Mahalle', esc(h.neighborhood))}${UI.kv('Cadde / Sokak / Bina', esc(h.street))}${UI.kv('Kat / Daire', esc(h.unit))}${UI.kv('Ev tipi', `${esc(h.type)}${h.layout ? ' · ' + esc(h.layout) : ''}`, 'home')}${UI.kv('Kayıt tarihi', U.date(h.createdAt), 'calendar')}</div></div>
          <div class="card"><div class="card-head"><h3>Ev geçmişi</h3></div><div class="card-body">${evs.length ? `<ul class="timeline">${evs.map(V.actItem).join('')}</ul>` : UI.empty('history', 'Kayıt yok')}</div></div>
        </div>
        <div class="stack">
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:10px">Notlar</h3>${h.notes ? `<div class="note-box">${I('info', 16)}<span>${esc(h.notes)}</span></div>` : '<p class="faint">Not eklenmemiş.</p>'}</div>
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:10px">Faturalandırma</h3>${UI.kv('Fatura sahibi', prim ? esc(prim.person.name) : '—', 'user')}${UI.kv('Toplam ödeme', money(st.spent), 'wallet')}${UI.kv('Açık bakiye', st.balance ? `<span style="color:var(--danger)">${money(st.balance)}</span>` : '—', 'alert')}${UI.kv('Sipariş sayısı', st.orders, 'clipboard')}</div>
        </div></div>`;
    }

    const html = `
      <div class="detail-head" style="--hc:${h.color}">
        <div class="detail-icon">${UI.houseIcon(h.type, 30)}</div>
        <div class="detail-title"><div class="eyebrow">${esc(h.code)} · ${esc(h.type)}${h.layout && /\+/.test(h.layout) ? ' ' + esc(h.layout) : ''}</div>
          <h1>${esc(h.title)} ${(h.tags || []).map(UI.tag).join('')}</h1>
          <div class="detail-meta"><span>${I('pin', 15)} ${esc(h.neighborhood)}, ${esc(h.district)} / ${esc(h.city)} · ${esc(h.unit)}</span>${prim ? `<span>${I('crown', 15)} <a href="#/kisi/${prim.personId}">${esc(prim.person.name)}</a></span>` : ''}${prim?.person.phone ? `<span>${I('phone', 15)} ${esc(prim.person.phone)}</span>` : ''}</div></div>
        <div class="detail-actions">
          <button class="btn" data-act="houseForm" data-id="${id}">${I('edit', 16)} Düzenle</button>
          <button class="btn primary" data-act="newOrder" data-house="${id}">${I('plus', 16)} Sipariş Oluştur</button>
        </div></div>
      ${st.active ? `<div class="card" style="margin-bottom:18px;border-color:${C.ST[st.active.status].color}55"><div class="card-head"><span class="tl-ic" style="--c:${C.ST[st.active.status].color}">${I(C.ST[st.active.status].icon, 15)}</span><div><h3>Aktif sipariş: <a href="#/siparis/${st.active.id}">${esc(st.active.code)}</a></h3><p>${st.active.items.length} parça · Planlanan teslim ${U.date(st.active.dueAt)} · ${esc(C.DELIVERY[st.active.deliveryMethod])}</p></div><div class="actions">${st.active.status === 'hazir' ? `<a class="btn sm primary" href="#/teslimat?siparis=${st.active.id}">${I('check', 14)} Teslim et</a>` : ''}<a class="btn sm" href="#/siparis/${st.active.id}">Detay ${I('arrow-right', 14)}</a></div></div><div class="card-body">${UI.stepper(st.active)}</div></div>` : ''}
      <div class="stat-strip">
        <div><span>Oda</span><strong>${st.rooms}</strong></div><div><span>Cephe</span><strong>${st.facades}</strong></div><div><span>Perde</span><strong>${st.curtains}</strong></div>
        <div><span>Kumaş alanı</span><strong>${num(st.area, 1)} m²</strong></div><div><span>Sipariş</span><strong>${st.orders}</strong></div>
        <div><span>Toplam ödeme</span><strong>${money(st.spent)}</strong></div><div><span>Açık bakiye</span><strong class="${st.balance ? 'warn' : ''}">${st.balance ? money(st.balance) : '—'}</strong></div>
      </div>
      <nav class="tabs">${tabs.map(([k, l, ic, n]) => `<a href="#/ev/${id}?sekme=${k}" class="${tab === k ? 'on' : ''}">${I(ic, 16)} ${l}${n !== undefined ? ` <span class="count-badge">${n}</span>` : ''}</a>`).join('')}</nav>
      ${body}`;
    return { title: h.title, crumbs: [['Evler', '#/evler'], [h.title]], html };
  };

  V.tree = function (h) {
    const rooms = S.rooms(h.id);
    return `<div class="tree"><div class="tree-head">${I('layers', 16)}<strong style="font-size:13.5px">Ev yapısı</strong><span class="faint" style="margin-left:auto;font-size:12px">Ev › Oda › Cephe › Perde</span></div>
      ${rooms.map((r) => {
        const facs = S.facades(r.id);
        return `<details open><summary>${I('chevron-right', 14, 'chev')}${UI.roomIcon(r.type, 15)}<a href="#/oda/${r.id}">${esc(r.name)}</a><span class="count-badge">${S.roomCurtains(r.id).length}</span></summary>
          <div class="branch">${facs.map((f) => `<details><summary>${I('chevron-right', 13, 'chev')}${I('window', 14)}<a href="#/cephe/${f.id}" style="font-weight:500">${esc(f.name)}</a></summary>
            <div class="branch">${S.curtains(f.id).map((c) => `<a class="leaf" href="#/perde/${c.id}"><span class="sw-dot" style="--sw:${c.color}"></span>${esc(c.type)}<small>${esc(c.code)}</small></a>`).join('') || '<span class="leaf faint">Perde yok</span>'}</div></details>`).join('') || '<span class="leaf faint">Cephe yok</span>'}</div></details>`;
      }).join('') || '<p class="faint" style="padding:8px">Henüz oda eklenmemiş.</p>'}</div>`;
  };

  V.roomCard = function (r) {
    const facs = S.facades(r.id);
    const cs = S.roomCurtains(r.id);
    return `<div class="card room-card">
      <div class="room-head"><a class="room-ic" href="#/oda/${r.id}">${UI.roomIcon(r.type, 19)}</a><div><a href="#/oda/${r.id}"><h3>${esc(r.name)}</h3></a><small>${facs.length} cephe · ${cs.length} perde · ${num(sum(cs, (c) => C.area(c)), 1)} m²</small></div>
        <div class="actions"><button class="btn-icon sm ghost" data-act="facadeForm" data-room="${r.id}" data-tip="Cephe ekle">${I('plus', 16)}</button><button class="btn-icon sm ghost" data-act="roomForm" data-id="${r.id}" data-tip="Odayı düzenle">${I('edit', 15)}</button></div></div>
      <div class="fac-list">${facs.map((f) => `<a class="fac-row" href="#/cephe/${f.id}"><div class="fac-thumb">${Viz.facade(f, S.curtains(f.id), { mini: true })}</div>
        <div class="fac-info"><strong>${esc(f.name)}</strong><small>${esc(f.opening)} · ${esc(f.direction)} · ${f.width}×${f.height} cm</small>
          <div class="fac-curtains">${S.curtains(f.id).map(V.miniCurtain).join('') || '<span class="faint" style="font-size:12px">Perde yok</span>'}</div></div></a>`).join('') || `<div class="fac-row"><span class="faint" style="font-size:13px">Bu odada henüz cephe yok.</span></div>`}</div></div>`;
  };

  V.memberCard = function (m, houseId) {
    const others = S.personHouses(m.personId).filter((x) => x.house.id !== houseId);
    const p = m.person;
    return `<div class="card member-card">
      <div class="member-top">${UI.avatar(p, 46)}<div style="min-width:0"><a href="#/kisi/${p.id}"><h4>${esc(p.name)} ${m.isPrimary ? `<span class="primary-star" data-tip="Birincil kişi / fatura sahibi">${I('crown', 15)}</span>` : ''}</h4></a><small>${esc(m.role)}${p.phone ? ' · ' + esc(p.phone) : ''}</small></div>
        <div class="actions"><button class="btn-icon sm ghost" data-act="linkForm" data-house="${houseId}" data-person="${p.id}" data-tip="Rolü düzenle">${I('edit', 15)}</button><button class="btn-icon sm ghost" data-act="unlink" data-house="${houseId}" data-person="${p.id}" data-tip="Evden çıkar">${I('x', 15)}</button></div></div>
      <div class="perm ${m.canPickup ? 'yes' : ''}"><span class="row" style="gap:8px">${I(m.canPickup ? 'shield' : 'ban', 16)} ${m.canPickup ? 'Perde teslim alabilir' : 'Teslim yetkisi yok'}</span><label><input type="checkbox" data-act="togglePickup" data-house="${houseId}" data-person="${p.id}" ${m.canPickup ? 'checked' : ''}><span class="switch"></span></label></div>
      ${others.length ? `<div><div class="faint" style="font-size:12px;margin-bottom:6px">Diğer evleri</div><div class="member-houses">${others.map((x) => `<a class="chip" href="#/ev/${x.house.id}">${UI.houseIcon(x.house.type, 13)} ${esc(x.house.title)} <span class="faint">· ${esc(x.role)}</span></a>`).join('')}</div></div>` : ''}
      ${p.note ? `<p class="faint" style="font-size:12.5px">${esc(p.note)}</p>` : ''}</div>`;
  };

  /* ---------- ODA ---------- */
  V.room = function ({ id }) {
    const r = S.room(id);
    if (!r) return V.notFound('Oda bulunamadı');
    const h = S.house(r.houseId);
    const facs = S.facades(id);
    const cs = S.roomCurtains(id);
    const html = `
      <div class="detail-head" style="--hc:${h.color}">
        <div class="detail-icon">${UI.roomIcon(r.type, 28)}</div>
        <div class="detail-title"><div class="eyebrow">Oda · ${esc(r.type)}</div><h1>${esc(r.name)}</h1>
          <div class="detail-meta"><span>${UI.houseIcon(h.type, 15)} <a href="#/ev/${h.id}">${esc(h.title)}</a></span><span>${I('pin', 15)} ${esc(h.neighborhood)}, ${esc(h.district)}</span></div></div>
        <div class="detail-actions"><button class="btn" data-act="roomForm" data-id="${id}">${I('edit', 16)} Düzenle</button><button class="btn primary" data-act="facadeForm" data-room="${id}">${I('plus', 16)} Cephe Ekle</button></div></div>
      <div class="stat-strip"><div><span>Cephe</span><strong>${facs.length}</strong></div><div><span>Perde</span><strong>${cs.length}</strong></div><div><span>Kumaş alanı</span><strong>${num(sum(cs, (c) => C.area(c)), 1)} m²</strong></div><div><span>Tahmini yıkama</span><strong>${money(sum(cs, (c) => S.washPrice(c)))}</strong></div><div><span>Atölyede</span><strong>${cs.filter((c) => S.curtainStatus(c.id).key !== 'evde').length}</strong></div></div>
      ${r.notes ? `<div class="note-box" style="margin-bottom:18px">${I('info', 16)}<span>${esc(r.notes)}</span></div>` : ''}
      <div class="grid g2">
        ${facs.map((f) => `<div class="card facade-card">
          <a class="facade-viz big" href="#/cephe/${f.id}">${Viz.facade(f, S.curtains(f.id))}<span class="dir-badge">${I('compass', 14)} ${esc(f.direction)}</span></a>
          <div class="card-head"><div><h3><a href="#/cephe/${f.id}">${esc(f.name)}</a></h3><p>${esc(f.opening)} · ${f.width} × ${f.height} cm</p></div>
            <div class="actions"><button class="btn sm soft" data-act="curtainForm" data-facade="${f.id}">${I('plus', 14)} Perde</button><a class="btn-icon sm ghost" href="#/cephe/${f.id}">${I('arrow-right', 15)}</a></div></div>
          <div>${S.curtains(f.id).map((c) => V.curtainRow(c)).join('') || '<div class="card-body faint">Bu cephede perde yok.</div>'}</div></div>`).join('')}
        <button class="add-tile" style="min-height:300px" data-act="facadeForm" data-room="${id}">${I('plus', 24)} Cephe ekle<span class="faint" style="font-weight:500;font-size:12.5px">Pencere, balkon kapısı, cam cephe…</span></button>
      </div>`;
    return { title: r.name, crumbs: [['Evler', '#/evler'], [h.title, '#/ev/' + h.id], [r.name]], html };
  };

  V.curtainRow = (c, opt = {}) => `<a class="curtain-card" href="#/perde/${c.id}" style="border-top:1px solid var(--border)">${Viz.swatch(c, opt.size || 42)}
    <div style="min-width:0"><h4>${esc(c.type)} <span class="faint mono" style="font-size:12px;font-weight:600">${esc(c.code)}</span></h4><div class="meta">${esc(c.fabric)} · ${esc(c.colorName)} · ${UI.dim(c)}${!C.CURTAIN_TYPES[c.type]?.flat ? ` · pile 1:${c.pleat}` : ''}</div></div>
    <div class="right">${UI.curtainStatus(c.id, true)}<small class="faint">${c.washCount ? `${c.washCount}. yıkama · ${U.rel(c.lastWashed)}` : 'Hiç yıkanmadı'}</small></div></a>`;

  /* ---------- CEPHE ---------- */
  V.facade = function ({ id }) {
    const f = S.facade(id);
    if (!f) return V.notFound('Cephe bulunamadı');
    const r = S.room(f.roomId); const h = S.house(r.houseId);
    const cs = S.curtains(id);
    const html = `
      <div class="detail-head" style="--hc:${h.color}">
        <div class="detail-icon">${I('window', 28)}</div>
        <div class="detail-title"><div class="eyebrow">Cephe · ${esc(f.opening)}</div><h1>${esc(f.name)}</h1>
          <div class="detail-meta"><span>${UI.houseIcon(h.type, 15)} <a href="#/ev/${h.id}">${esc(h.title)}</a></span><span>${UI.roomIcon(r.type, 15)} <a href="#/oda/${r.id}">${esc(r.name)}</a></span><span>${I('compass', 15)} ${esc(f.direction)}</span><span>${I('ruler', 15)} ${f.width} × ${f.height} cm</span></div></div>
        <div class="detail-actions"><button class="btn" data-act="facadeForm" data-id="${id}">${I('edit', 16)} Düzenle</button><button class="btn primary" data-act="curtainForm" data-facade="${id}">${I('plus', 16)} Perde Ekle</button></div></div>
      <div class="split">
        <div class="stack">
          <div class="card" style="overflow:hidden"><div class="facade-viz big" id="fviz">${Viz.facade(f, cs)}<span class="dir-badge">${I('compass', 14)} ${esc(f.direction)} cephe</span></div>
            <div class="card-body"><div class="row between" style="margin-bottom:10px"><strong style="font-size:13.5px">Perde katmanları</strong><span class="faint" style="font-size:12px">Gizlemek için tıklayın · çizimdeki perdeye tıklayınca detayı açılır</span></div>
              <div class="layer-list">${cs.map((c) => `<label class="layer" data-layer="${c.id}">${Viz.swatch(c, 30)}<div><strong style="font-size:13.5px">${esc(c.type)}</strong> <span class="faint" style="font-size:12px">${esc(c.code)} · ${esc(c.fabric)} · ${esc(c.colorName)}</span></div><span class="eye">${I('eye', 17)}</span></label>`).join('') || '<p class="faint">Bu cephede perde yok. Sağ üstten ekleyebilirsiniz.</p>'}</div></div></div>
          <div class="card"><div class="card-head"><h3>Perdeler</h3><p>${cs.length} parça · ${num(sum(cs, (c) => C.area(c)), 1)} m² kumaş</p></div><div>${cs.map((c) => V.curtainRow(c, { size: 48 })).join('') || '<div class="card-body faint">Perde yok.</div>'}</div></div>
        </div>
        <div class="stack">
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:6px">Cephe bilgisi</h3>
            ${UI.kv('Açıklık tipi', esc(f.opening), 'window')}${UI.kv('Yön', esc(f.direction), 'compass')}${UI.kv('Ray genişliği', f.width + ' cm', 'ruler')}${UI.kv('Tavan–zemin yüksekliği', f.height + ' cm', 'ruler')}${UI.kv('Cephe alanı', num((f.width * f.height) / 10000, 2) + ' m²', 'grid')}${UI.kv('Perde sayısı', cs.length, 'curtain')}</div>
          <div class="info-box">${I('sun', 18)}<div><strong>Güneş durumu:</strong> ${esc(C.SUN[f.direction] || '')}</div></div>
          ${f.notes ? `<div class="note-box">${I('info', 16)}<span>${esc(f.notes)}</span></div>` : ''}
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:6px">Tahmini yıkama ücreti</h3>${cs.map((c) => UI.kv(`${esc(c.type)} <span class="faint">(${num(C.area(c), 1)} m²)</span>`, money(S.washPrice(c)))).join('')}${UI.kv('<strong>Toplam</strong>', `<strong>${money(sum(cs, (c) => S.washPrice(c)))}</strong>`)}
            <button class="btn soft block" style="margin-top:12px" data-act="newOrder" data-house="${h.id}" data-preselect="${cs.map((c) => c.id).join(',')}">${I('droplets', 16)} Bu cepheyi yıkamaya gönder</button></div>
        </div></div>`;
    const mount = (el) => {
      const hidden = new Set();
      const redraw = () => { el.querySelector('#fviz').firstElementChild.outerHTML = Viz.facade(f, cs, { hidden: [...hidden] }); };
      el.querySelectorAll('[data-layer]').forEach((l) => l.addEventListener('click', (e) => {
        e.preventDefault();
        const cid = l.dataset.layer;
        if (hidden.has(cid)) hidden.delete(cid); else hidden.add(cid);
        l.classList.toggle('off', hidden.has(cid));
        l.querySelector('.eye').innerHTML = I(hidden.has(cid) ? 'eye-off' : 'eye', 17);
        redraw();
      }));
      el.querySelector('#fviz').addEventListener('click', (e) => { const g = e.target.closest('[data-curtain]'); if (g) location.hash = '#/perde/' + g.dataset.curtain; });
    };
    return { title: f.name, crumbs: [['Evler', '#/evler'], [h.title, '#/ev/' + h.id], [r.name, '#/oda/' + r.id], [f.name]], html, mount };
  };

  /* ---------- PERDE ---------- */
  V.curtain = function ({ id }) {
    const c = S.curtain(id);
    if (!c) return V.notFound('Perde bulunamadı');
    const { facade: f, room: r, house: h } = S.path(id);
    const st = S.curtainStatus(id);
    const T = C.CURTAIN_TYPES[c.type] || {};
    const hist = S.curtainOrders(id);
    const area = C.area(c);
    const rate = S.prices().types[c.type] || 0;
    const spec = (icon, k, v) => `<div class="spec"><span>${I(icon, 13)} ${k}</span><strong>${v}</strong></div>`;
    const html = `
      <div class="detail-head" style="--hc:${h.color}">
        ${Viz.swatch(c, 64)}
        <div class="detail-title"><div class="eyebrow">${esc(c.code)} · ${esc(T.desc || 'Perde')}</div><h1>${esc(c.type)} perde ${UI.curtainStatus(id)}</h1>
          <div class="detail-meta"><span>${UI.houseIcon(h.type, 15)} <a href="#/ev/${h.id}">${esc(h.title)}</a></span><span>${UI.roomIcon(r.type, 15)} <a href="#/oda/${r.id}">${esc(r.name)}</a></span><span>${I('window', 15)} <a href="#/cephe/${f.id}">${esc(f.name)}</a></span></div></div>
        <div class="detail-actions"><button class="btn" data-act="curtainForm" data-id="${id}">${I('edit', 16)} Düzenle</button><button class="btn" data-act="printLabel" data-id="${id}">${I('printer', 16)} Etiket</button>${st.order ? `<a class="btn primary" href="#/siparis/${st.order.id}">${I('clipboard', 16)} ${esc(st.order.code)}</a>` : `<button class="btn primary" data-act="newOrder" data-house="${h.id}" data-preselect="${id}">${I('droplets', 16)} Yıkamaya Gönder</button>`}</div></div>
      <div class="split">
        <div class="stack">
          <div class="card"><div class="card-head"><h3>Teknik özellikler</h3></div>
            <div class="spec-grid">
              ${spec('curtain', 'Perde türü', esc(c.type))}${spec('layers', 'Kumaş', esc(c.fabric))}${spec('tag', 'Renk', `<span class="row" style="gap:6px"><span class="sw-dot" style="width:14px;height:14px;border-radius:4px;background:${c.color};box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)"></span>${esc(c.colorName)}</span>`)}
              ${spec('ruler', T.flat ? 'Genişlik' : 'Ray genişliği', `${num(c.width)} cm`)}${spec('ruler', 'Boy', `${num(c.height)} cm`)}${spec('move', 'Pile oranı', T.flat ? 'Düz (pilesiz)' : `1 : ${String(c.pleat).replace('.', ',')}`)}
              ${spec('grid', 'Kumaş eni', T.flat ? `${num(c.width)} cm` : `${num(c.width * c.pleat)} cm`)}${spec('grid', 'Kumaş alanı', `${num(area, 2)} m²`)}${spec('copy', 'Kanat sayısı', c.panels || 1)}
              ${spec('sliders', 'Montaj', esc(c.mount))}${spec('link', 'Askı tipi', esc(c.hook))}${spec('layers', 'Astar', esc(c.lining))}
              ${spec('droplets', 'Yıkama talimatı', esc(c.care))}${spec('sparkles', 'Kondisyon', esc(c.condition || 'İyi'))}${spec('calendar', 'Alım tarihi', U.date(c.purchasedAt))}
              ${spec('refresh', 'Yıkama sayısı', `${c.washCount || 0} kez`)}${spec('history', 'Son yıkama', c.lastWashed ? U.date(c.lastWashed) : '—')}${spec('wallet', 'Tahmini ücret', money(S.washPrice(c)))}
            </div>${c.notes ? `<div class="card-body"><div class="note-box">${I('info', 16)}<span>${esc(c.notes)}</span></div></div>` : ''}</div>
          <div class="card"><div class="card-head"><h3>Yıkama geçmişi</h3><p>${hist.length} sipariş</p></div>
            ${hist.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sipariş</th><th>Tarih</th><th>Durum</th><th>Hizmet</th><th>Teslim alan</th><th class="num">Ücret</th></tr></thead><tbody>
              ${hist.map((o) => { const it = o.items.find((i) => i.curtainId === id); return `<tr class="link" data-href="#/siparis/${o.id}"><td><strong>${esc(o.code)}</strong></td><td>${U.date(o.pickupAt)}</td><td>${UI.status(o.status, true)}</td><td>Yıkama & ütü${it.services.length ? ' + ' + it.services.map((s) => esc(C.SERVICES[s])).join(', ') : ''}</td><td>${o.deliveredToName ? esc(o.deliveredToName) : '<span class="faint">—</span>'}</td><td class="num">${money(it.price)}</td></tr>`; }).join('')}
            </tbody></table></div>` : `<div class="card-body">${UI.empty('droplets', 'Henüz yıkanmadı', 'Bu perde için yıkama kaydı yok.')}</div>`}</div>
        </div>
        <div class="stack">
          <div class="card"><div class="swatch-hero">${Viz.swatch(c, 96)}<div><strong style="font-size:16px">${esc(c.colorName)}</strong><div class="faint" style="font-size:13px">${esc(c.fabric)}</div><div class="faint mono" style="font-size:12px;margin-top:4px">${esc(c.color)}</div></div></div></div>
          <div class="card" style="overflow:hidden"><a class="facade-viz" href="#/cephe/${f.id}">${Viz.facade(f, S.curtains(f.id), { highlight: id, dims: false })}<span class="dir-badge">${I('window', 14)} ${esc(f.name)}</span></a></div>
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:6px">Ücret hesabı</h3>
            ${UI.kv('Kumaş alanı', T.flat ? `${num(c.width / 100, 2)} × ${num(c.height / 100, 2)} m` : `${num(c.width / 100, 2)} × ${String(c.pleat).replace('.', ',')} pile × ${num(c.height / 100, 2)} m`)}${UI.kv('Alan', num(area, 2) + ' m²')}${UI.kv('Birim fiyat', money(rate) + ' / m²')}${UI.kv('<strong>Yıkama + ütü</strong>', `<strong>${money(S.washPrice(c))}</strong>`)}</div>
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:10px">Atölye etiketi</h3>${V.label(c)}<button class="btn block" style="margin-top:10px" data-act="printLabel" data-id="${id}">${I('printer', 16)} Etiketi yazdır</button></div>
          <button class="btn ghost danger-text" data-act="deleteCurtain" data-id="${id}">${I('trash', 16)} Perdeyi sil</button>
        </div></div>`;
    return { title: `${c.type} ${c.code}`, crumbs: [['Evler', '#/evler'], [h.title, '#/ev/' + h.id], [r.name, '#/oda/' + r.id], [f.name, '#/cephe/' + f.id], [c.code]], html };
  };

  V.label = (c) => {
    const { room: r, house: h, facade: f } = S.path(c.id);
    return `<div class="label-print"><div class="lp-shop">${esc(S.shop().name)}</div>${Viz.barcode(c.code, 200, 44)}<div class="lp-code">${esc(c.code)}</div><div class="lp-sub"><strong>${esc(h.title)}</strong><br>${esc(r.name)} · ${esc(f.name)}<br>${esc(c.type)} · ${esc(c.colorName)} · ${UI.dim(c)}<br>${esc(c.care)}</div></div>`;
  };

  V.notFound = (t) => ({ title: t, crumbs: [[t]], html: UI.empty('alert', t, 'Kayıt silinmiş ya da bağlantı hatalı olabilir.', `<a class="btn primary" href="#/">Panele dön</a>`) });
})();
