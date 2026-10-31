/* Perdeci — uygulama çekirdeği: yönlendirme, kabuk, işlemler */
(function () {
  const { esc, money, num } = U;
  const A = (window.A = {});
  const App = (window.App = { onRefresh: null });
  const SESSION = 'perdeci.session';
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

  const routes = [
    [/^$/, 'dashboard'], [/^evler$/, 'houses'], [/^ev\/([^/]+)$/, 'house'], [/^oda\/([^/]+)$/, 'room'], [/^cephe\/([^/]+)$/, 'facade'],
    [/^perde\/([^/]+)$/, 'curtain'], [/^perdeler$/, 'curtains'], [/^kisiler$/, 'people'], [/^kisi\/([^/]+)$/, 'person'],
    [/^siparisler$/, 'orders'], [/^siparis\/([^/]+)$/, 'order'], [/^teslimat$/, 'desk'], [/^takvim$/, 'calendar'],
    [/^mesajlar$/, 'messages'], [/^fiyatlar$/, 'prices'], [/^raporlar$/, 'reports'], [/^ayarlar$/, 'settings'],
    [/^giris$/, 'login', true], [/^takip$/, 'track', true],
  ];
  const navActive = { dashboard: '', houses: 'evler', house: 'evler', room: 'evler', facade: 'evler', curtain: 'perdeler', curtains: 'perdeler', people: 'kisiler', person: 'kisiler', orders: 'siparisler', order: 'siparisler', desk: 'teslimat', calendar: 'takvim', messages: 'mesajlar', prices: 'fiyatlar', reports: 'raporlar', settings: 'ayarlar' };

  const loggedIn = () => { try { return localStorage.getItem(SESSION) === '1'; } catch (e) { return true; } };
  App.login = () => { try { localStorage.setItem(SESSION, '1'); } catch (e) {} location.hash = '#/'; UI.toast(`Hoş geldiniz, ${S.shop().ownerShort}`, 'ok'); };
  A.logout = () => { try { localStorage.removeItem(SESSION); } catch (e) {} location.hash = '#/giris'; };

  function parse() {
    const raw = location.hash.replace(/^#\/?/, '');
    const path = decodeURIComponent(raw.split('?')[0]).replace(/\/$/, '');
    for (const [re, name, pub] of routes) { const m = path.match(re); if (m) return { name, params: { id: m[1] }, pub: !!pub, path }; }
    return { name: 'dashboard', params: {}, path: '' };
  }

  let lastPath = null;
  App.render = function () {
    App.onRefresh = null;
    const r = parse();
    if (!r.pub && !loggedIn()) { location.replace('#/giris'); return; }
    const view = (V[r.name] || V.dashboard)(r.params);
    const root = document.getElementById('app');
    if (view.bare) root.innerHTML = view.html;
    else root.innerHTML = shell(view, r);
    document.title = `${view.title} · Perdeci`;
    document.body.classList.remove('nav-open');
    const page = root.querySelector('.page') || root;
    view.mount && view.mount(page);
    if (lastPath !== r.path) window.scrollTo(0, 0);
    lastPath = r.path;
  };
  App.refresh = function () {
    if (App.onRefresh) {
      App.onRefresh();
      // Kenar çubuğu sayaçlarını da güncelle
      const r = parse();
      const tmp = document.createElement('div');
      tmp.innerHTML = shell({ html: '', crumbs: [] }, r);
      const ns = tmp.querySelector('.nav'), os = document.querySelector('.sidebar .nav');
      if (ns && os) os.replaceWith(ns);
      return;
    }
    const y = window.scrollY;
    App.render();
    window.scrollTo(0, y);
  };

  function shell(view, r) {
    const active = S.activeOrders();
    const ready = active.filter((o) => o.status === 'hazir').length;
    const cur = navActive[r.name];
    const link = (href, icon, label, count, hot) => `<a href="#/${href}" class="${cur === href ? 'active' : ''}">${I(icon, 18)}<span>${label}</span>${count ? `<span class="count${hot ? ' hot' : ''}">${count}</span>` : ''}</a>`;
    const shop = S.shop();
    const crumbs = (view.crumbs || []).map((c, i, a) => (i === a.length - 1 || !c[1] ? `<span class="cur">${esc(c[0])}</span>` : `<a href="${c[1]}">${esc(c[0])}</a>${I('chevron-right', 13)}`)).join('');
    return `<div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#/"><div class="brand-mark">${I('curtain', 22)}</div><div><div class="brand-name">Perdeci</div><div class="brand-sub">${esc(shop.name)}</div></div></a>
        <nav class="nav">
          <div class="nav-group"><div class="nav-title">Genel</div>${link('', 'dashboard', 'Panel')}${link('takvim', 'calendar', 'Takvim')}</div>
          <div class="nav-group"><div class="nav-title">Kayıtlar</div>${link('evler', 'home', 'Evler', S.houses().length)}${link('kisiler', 'users', 'Kişiler', S.people().length)}${link('perdeler', 'curtain', 'Perdeler', S.allCurtains().length)}</div>
          <div class="nav-group"><div class="nav-title">Operasyon</div>${link('siparisler', 'clipboard', 'Siparişler', active.length)}${link('teslimat', 'package', 'Teslimat Masası', ready, true)}${link('mesajlar', 'message', 'Mesajlar')}</div>
          <div class="nav-group"><div class="nav-title">Yönetim</div>${link('fiyatlar', 'tag', 'Fiyat Listesi')}${link('raporlar', 'chart', 'Raporlar')}${link('ayarlar', 'sliders', 'Ayarlar')}</div>
        </nav>
        <div class="side-foot">
          <div class="side-user">${UI.avatar({ name: shop.owner }, 36)}<div><strong>${esc(shop.owner)}</strong><span>Dükkan sahibi</span></div><button class="btn-icon ghost sm" data-act="logout" data-tip="Çıkış yap">${I('logout', 16)}</button></div>
          <div class="demo-note">Demo sürüm · veriler tarayıcınızda saklanır. <a href="#/takip" style="text-decoration:underline">Müşteri takip sayfası</a></div>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="btn-icon menu-btn" data-act="toggleNav" aria-label="Menü">${I('menu')}</button>
          <div class="crumbs">${crumbs}</div>
          <button class="search-btn" data-act="palette">${I('search', 16)}<span>Ev, kişi, perde, sipariş ara…</span><kbd>Ctrl K</kbd></button>
          <button class="btn-icon" data-act="quickAdd" data-tip="Hızlı ekle">${I('plus')}</button>
          <button class="btn-icon" data-act="toggleTheme" data-tip="Tema">${I(isDark() ? 'sun' : 'moon')}</button>
          <a class="btn-icon icon-wrap" href="#/teslimat" data-tip="${ready} sipariş teslime hazır">${I('bell')}${ready ? '<span class="dot"></span>' : ''}</a>
        </header>
        <main class="page">${view.html}</main>
      </div></div>`;
  }

  /* ---------- Tema ---------- */
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  App.setTheme = (t) => {
    try { localStorage.setItem('perdeci.theme', t); } catch (e) {}
    if (t === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    App.refresh();
  };
  A.toggleTheme = () => App.setTheme(isDark() ? 'light' : 'dark');
  A.toggleNav = () => document.body.classList.toggle('nav-open');

  /* ---------- Hızlı ekle menüsü ---------- */
  A.quickAdd = () => {
    UI.modal({
      title: 'Hızlı ekle', size: 'sm', icon: 'plus',
      body: `<div class="stack" style="gap:8px">${[['newOrder', 'clipboard', 'Yeni sipariş', 'Ölçü randevusu veya teklif'], ['houseForm', 'home', 'Yeni ev', 'Adres, oda ve perdeleri kaydet'], ['personForm', 'user-plus', 'Yeni kişi', 'Ev sahibi, aile üyesi, yardımcı…'], ['smsForm', 'message', 'SMS gönder', 'Müşteriye bilgi mesajı']].map(([a, ic, t, s]) => `<button class="pal-item" style="border:1px solid var(--border);background:var(--surface);width:100%;text-align:left" data-q="${a}"><span class="pi-ic">${I(ic, 16)}</span><div><strong>${t}</strong><small>${s}</small></div></button>`).join('')}</div>`,
      onMount: (el, api) => el.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { api.close(); setTimeout(() => A[b.dataset.q]({}), 150); })),
    });
  };

  /* ---------- Komut paleti ---------- */
  A.palette = () => {
    const pages = [['Panel', '#/', 'dashboard'], ['Evler', '#/evler', 'home'], ['Kişiler', '#/kisiler', 'users'], ['Perdeler', '#/perdeler', 'curtain'], ['Siparişler', '#/siparisler', 'clipboard'], ['Teslimat Masası', '#/teslimat', 'package'], ['Takvim', '#/takvim', 'calendar'], ['Mesajlar', '#/mesajlar', 'message'], ['Fiyat Listesi', '#/fiyatlar', 'tag'], ['Raporlar', '#/raporlar', 'chart'], ['Ayarlar', '#/ayarlar', 'sliders'], ['Müşteri takip sayfası', '#/takip', 'external']];
    UI.modal({
      title: 'Ara', size: 'lg', icon: 'search',
      body: `<div class="palette-input">${I('search', 20)}<input id="palq" placeholder="Ev adı, kişi, telefon, perde kodu (PR-…), sipariş kodu (SP-…)" autocomplete="off" autofocus></div><div class="palette-results" id="palr"></div>`,
      onMount: (el, api) => {
        const inp = el.querySelector('#palq'); const out = el.querySelector('#palr');
        let items = []; let sel = 0;
        const render = () => {
          const q = inp.value;
          const r = S.search(q);
          const groups = [];
          if (!q.trim()) groups.push(['Sayfalar', pages.map(([t, h, ic]) => ({ t, h, ic, s: '' }))]);
          else {
            const pg = pages.filter(([t]) => U.match(q, t)).map(([t, h, ic]) => ({ t, h, ic, s: 'Sayfa' }));
            if (pg.length) groups.push(['Sayfalar', pg]);
            if (r.orders.length) groups.push(['Siparişler', r.orders.map((o) => ({ t: `${o.code} · ${S.house(o.houseId)?.title}`, s: `${C.ST[o.status].label} · ${o.items.length} parça · ${money(S.totals(o).total)}`, h: '#/siparis/' + o.id, ic: C.ST[o.status].icon }))]);
            if (r.houses.length) groups.push(['Evler', r.houses.map((h) => ({ t: h.title, s: `${h.code} · ${h.neighborhood}, ${h.district}`, h: '#/ev/' + h.id, ic: C.HOUSE_TYPES[h.type] || 'home' }))]);
            if (r.people.length) groups.push(['Kişiler', r.people.map((p) => ({ t: p.name, s: `${p.phone || ''} · ${S.personHouses(p.id).map((x) => x.house.title).join(', ')}`, h: '#/kisi/' + p.id, ic: 'user' }))]);
            if (r.curtains.length) groups.push(['Perdeler', r.curtains.map((c) => { const p = S.path(c.id); return { t: `${c.code} · ${c.type} · ${c.colorName}`, s: `${p.house?.title} › ${p.room?.name} › ${p.facade?.name}`, h: '#/perde/' + c.id, ic: 'curtain' }; })]);
          }
          items = groups.flatMap((g) => g[1]); sel = Math.min(sel, Math.max(0, items.length - 1));
          let i = 0;
          out.innerHTML = groups.length ? groups.map(([g, list]) => `<div class="pal-group">${g}</div>${list.map((it) => `<a class="pal-item ${i === sel ? 'sel' : ''}" data-i="${i++}" href="${it.h}"><span class="pi-ic">${I(it.ic, 16)}</span><div style="min-width:0"><strong>${esc(it.t)}</strong>${it.s ? `<small>${esc(it.s)}</small>` : ''}</div><span class="right faint">${I('arrow-right', 14)}</span></a>`).join('')}`).join('') : UI.empty('search', 'Sonuç bulunamadı', `"${esc(q)}" için eşleşme yok.`);
          out.querySelectorAll('.pal-item').forEach((a) => a.addEventListener('click', () => api.close()));
        };
        inp.addEventListener('input', () => { sel = 0; render(); });
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); render(); out.querySelector('.sel')?.scrollIntoView({ block: 'nearest' }); }
          if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); out.querySelector('.sel')?.scrollIntoView({ block: 'nearest' }); }
          if (e.key === 'Enter' && items[sel]) { e.preventDefault(); location.hash = items[sel].h; api.close(); }
        });
        render();
      },
    });
  };

  /* ---------- EV formu ---------- */
  const LAYOUT_ROOMS = {
    '1+1': ['Salon', 'Yatak Odası', 'Mutfak'], '2+1': ['Salon', 'Yatak Odası', 'Çocuk Odası', 'Mutfak'],
    '3+1': ['Salon', 'Yatak Odası', 'Çocuk Odası', 'Çalışma Odası', 'Mutfak'], '4+1': ['Salon', 'Yemek Odası', 'Yatak Odası', 'Çocuk Odası', 'Çocuk Odası', 'Misafir Odası', 'Mutfak'],
    'villa': ['Salon', 'Yemek Odası', 'Yatak Odası', 'Çocuk Odası', 'Misafir Odası', 'Çalışma Odası', 'Mutfak', 'Kış Bahçesi'],
    'ofis': ['Ofis', 'Toplantı Odası', 'Bekleme Alanı'],
  };
  A.houseForm = ({ id } = {}) => {
    const h = id ? S.house(id) : null;
    const fields = [
      { section: 'Ev bilgisi' },
      { name: 'title', label: 'Ev adı', required: true, placeholder: 'Örn. Yılmaz Ailesi, Moda Kafe…', hint: 'Listede görünecek ad' },
      { name: 'type', label: 'Ev tipi', type: 'select', options: Object.keys(C.HOUSE_TYPES), col: 'half' },
      { name: 'layout', label: 'Oda düzeni', type: 'select', options: [{ value: '', label: 'Belirtilmedi' }, ...Object.keys(LAYOUT_ROOMS).map((k) => ({ value: k, label: k === 'villa' ? 'Villa' : k === 'ofis' ? 'Ofis' : k }))], col: 'half' },
      { section: 'Adres' },
      { name: 'city', label: 'İl', col: 'third', required: true }, { name: 'district', label: 'İlçe', col: 'third', required: true }, { name: 'neighborhood', label: 'Mahalle', col: 'third' },
      { name: 'street', label: 'Cadde / sokak / bina', col: 'half' }, { name: 'unit', label: 'Kat / daire', col: 'half' },
      { section: 'Diğer' },
      { name: 'tags', label: 'Etiketler', type: 'chips', options: ['VIP', 'Düzenli', 'Kurumsal', 'Faturalı', 'Kiralık', 'Sezonluk', 'Hijyen'] },
      { name: 'color', label: 'Renk', type: 'color', col: 'third' },
      { name: 'notes', label: 'Notlar', type: 'textarea', placeholder: 'Kapı kodu, asansör, montaj notları…', col: 'span4', rows: 2 },
      ...(!h ? [{ name: 'primary', label: 'Ev sahibi (birincil kişi)', type: 'select', placeholder: '— Sonra eklerim —', options: S.people().slice().sort((a, b) => a.name.localeCompare(b.name, 'tr')).map((p) => ({ value: p.id, label: p.name })) }, { name: 'autoRooms', label: 'Oda düzenine göre odaları otomatik oluştur', type: 'toggle', value: true, hint: 'Seçtiğiniz düzene göre boş odalar eklenir' }] : []),
    ];
    UI.formModal({
      title: h ? 'Evi düzenle' : 'Yeni ev', subtitle: h ? h.code : 'Perde satacağınız ya da ölçü alacağınız yeni bir adres ekleyin', icon: 'home', size: 'lg', fields,
      values: h || { type: 'Daire', layout: '3+1', city: 'İstanbul', color: '#1e5b55', tags: [] },
      submit: h ? 'Kaydet' : 'Evi oluştur',
      danger: h ? { label: 'Evi sil', onClick: async (api) => { if (await UI.confirm({ title: 'Ev silinsin mi?', text: `<strong>${esc(h.title)}</strong> ile birlikte tüm odaları, cepheleri, perdeleri ve siparişleri silinecek. Bu işlem geri alınamaz.`, ok: 'Evi sil', danger: true })) { api.close(); S.deleteHouse(h.id); UI.toast('Ev silindi', 'ok'); location.hash = '#/evler'; } } } : null,
      onSubmit: (v) => {
        const { primary, autoRooms, ...data } = v;
        if (h) { S.saveHouse({ ...h, ...data }); UI.toast('Ev güncellendi', 'ok'); return; }
        const nh = S.saveHouse(data);
        if (primary) S.linkMember(nh.id, primary, 'Ev Sahibi', true, true);
        if (autoRooms && LAYOUT_ROOMS[data.layout]) LAYOUT_ROOMS[data.layout].forEach((n) => S.saveRoom({ houseId: nh.id, name: n, type: C.ROOM_TYPES[n] ? n : 'Diğer', notes: '' }));
        UI.toast('Yeni ev oluşturuldu', 'ok', 'Şimdi odalara cephe ve perde ekleyebilirsiniz.');
        location.hash = '#/ev/' + nh.id;
      },
      onMount: (el) => { const n = el.querySelector('[name=notes]')?.closest('.field'); if (n) n.style.gridColumn = 'span 4'; },
    });
  };

  /* ---------- KİŞİ formu ---------- */
  A.personForm = ({ id } = {}) => {
    const p = id ? S.person(id) : null;
    const fields = [
      { name: 'name', label: 'Ad soyad', required: true, icon: 'user' },
      { name: 'phone', label: 'Telefon', type: 'tel', col: 'half', icon: 'phone', placeholder: '05xx xxx xx xx', hint: 'SMS bildirimleri bu numaraya gider' },
      { name: 'email', label: 'E-posta', type: 'email', col: 'half', icon: 'mail' },
      { name: 'note', label: 'Not', type: 'textarea', rows: 2 },
      ...(!p ? [{ section: 'Bir eve bağla (isteğe bağlı)' }, { name: 'houseId', label: 'Ev', type: 'select', placeholder: '— Şimdilik bağlama —', options: S.houses().map((h) => ({ value: h.id, label: h.title })), col: 'half' }, { name: 'role', label: 'Rolü', type: 'select', options: C.ROLES, col: 'half' }, { name: 'canPickup', label: 'Perde teslim alabilir', type: 'toggle', value: true }] : []),
    ];
    UI.formModal({
      title: p ? 'Kişiyi düzenle' : 'Yeni kişi', icon: 'user-plus', fields, values: p || { role: 'Ev Sahibi' }, submit: p ? 'Kaydet' : 'Kişiyi ekle',
      onSubmit: (v) => {
        const { houseId, role, canPickup, ...data } = v;
        if (p) { S.savePerson({ ...p, ...data }); UI.toast('Kişi güncellendi', 'ok'); return; }
        const np = S.savePerson(data);
        if (houseId) S.linkMember(houseId, np.id, role, canPickup, false);
        UI.toast('Kişi eklendi', 'ok', houseId ? `${S.house(houseId).title} evine ${role} olarak bağlandı.` : '');
        location.hash = '#/kisi/' + np.id;
      },
    });
  };
  A.deletePerson = async ({ id }) => {
    const p = S.person(id);
    if (await UI.confirm({ title: 'Kişi silinsin mi?', text: `<strong>${esc(p.name)}</strong> tüm evlerden çıkarılacak. Geçmiş teslim kayıtlarında adı korunur.`, ok: 'Sil', danger: true })) { S.deletePerson(id); UI.toast('Kişi silindi', 'ok'); location.hash = '#/kisiler'; }
  };

  /* ---------- Kişi ↔ Ev bağlantısı ---------- */
  A.linkForm = ({ house, person } = {}) => {
    const h = house && S.house(house);
    const p = person && S.person(person);
    const existing = h && p ? h.members.find((m) => m.personId === person) : null;
    let mode = 'mevcut';
    const people = S.people().filter((x) => !h || !h.members.some((m) => m.personId === x.id)).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    const houses = S.houses().filter((x) => !p || !x.members.some((m) => m.personId === p.id));
    const roleFields = [
      { name: 'role', label: 'Evdeki rolü', type: 'select', options: C.ROLES, col: 'half' },
      { name: 'isPrimary', label: 'Birincil kişi', type: 'toggle', hint: 'Fatura sahibi, SMS ilk ona gider', col: 'half' },
      { name: 'canPickup', label: 'Perde teslim alabilir', type: 'toggle', hint: 'Dükkana gelip teslim kodu ile perdeyi alabilir' },
    ];
    const vals = existing ? { role: existing.role, canPickup: existing.canPickup, isPrimary: existing.isPrimary } : { role: h && !h.members.length ? 'Ev Sahibi' : 'Eş', canPickup: true, isPrimary: h ? !h.members.length : false };
    const bodyFor = () => {
      if (existing) return UI.form(roleFields, vals);
      if (p) return UI.form([{ name: 'houseId', label: 'Ev', type: 'select', required: true, placeholder: '— Ev seçin —', options: houses.map((x) => ({ value: x.id, label: `${x.title} · ${x.district}` })) }, ...roleFields], vals);
      return `<div class="seg" style="margin-bottom:14px" id="lmode"><button type="button" data-m="mevcut" class="${mode === 'mevcut' ? 'on' : ''}">${I('users', 15)} Kayıtlı kişi</button><button type="button" data-m="yeni" class="${mode === 'yeni' ? 'on' : ''}">${I('user-plus', 15)} Yeni kişi</button></div>`
        + (mode === 'mevcut' ? UI.form([{ name: 'personId', label: 'Kişi', type: 'select', required: true, placeholder: '— Kişi seçin —', options: people.map((x) => ({ value: x.id, label: `${x.name}${x.phone ? ' · ' + x.phone : ''}${S.personHouses(x.id).length ? ' · ' + S.personHouses(x.id).length + ' ev' : ''}` })) }, ...roleFields], vals)
          : UI.form([{ name: 'name', label: 'Ad soyad', required: true, col: 'half' }, { name: 'phone', label: 'Telefon', type: 'tel', col: 'half', placeholder: '05xx xxx xx xx' }, ...roleFields], vals));
    };
    UI.modal({
      title: existing ? `${p.name} · ${h.title}` : h ? `${h.title} evine kişi bağla` : `${p.name} kişisini eve bağla`,
      subtitle: existing ? 'Rol ve teslim yetkisini düzenleyin' : 'Bir kişi birden fazla eve bağlanabilir', icon: 'link', body: `<form class="mform">${bodyFor()}</form>`,
      foot: `<button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" data-save>${I('check', 16)} Kaydet</button>`,
      onMount: (el, api) => {
        const bindMode = () => el.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; el.querySelector('form').innerHTML = bodyFor(); bindMode(); }));
        bindMode();
        el.querySelector('[data-save]').addEventListener('click', () => {
          const f = el.querySelector('form');
          const rv = UI.readForm(f, roleFields);
          if (existing) { S.updateMember(house, person, rv); UI.toast('Bağlantı güncellendi', 'ok'); api.close(); return; }
          if (p) {
            const hid = f.querySelector('[name=houseId]').value;
            if (!hid) return UI.toast('Bir ev seçin', 'err');
            S.linkMember(hid, p.id, rv.role, rv.canPickup, rv.isPrimary); UI.toast(`${p.name} eve bağlandı`, 'ok'); api.close(); return;
          }
          let pid;
          if (mode === 'mevcut') { pid = f.querySelector('[name=personId]').value; if (!pid) return UI.toast('Bir kişi seçin', 'err'); }
          else {
            const name = f.querySelector('[name=name]').value.trim();
            if (!name) return UI.toast('Ad soyad zorunlu', 'err');
            pid = S.savePerson({ name, phone: f.querySelector('[name=phone]').value.trim(), email: '', note: '' }).id;
          }
          S.linkMember(house, pid, rv.role, rv.canPickup, rv.isPrimary);
          UI.toast(`${S.person(pid).name} eve bağlandı`, 'ok', rv.canPickup ? 'Teslim yetkisi verildi.' : '');
          api.close();
        });
      },
    });
  };
  A.unlink = async ({ house, person }) => {
    const p = S.person(person), h = S.house(house);
    if (await UI.confirm({ title: 'Evden çıkarılsın mı?', text: `<strong>${esc(p.name)}</strong>, <strong>${esc(h.title)}</strong> evinden çıkarılacak. Kişi kaydı ve diğer evleri korunur.`, ok: 'Çıkar', danger: true })) { S.unlinkMember(house, person); UI.toast('Kişi evden çıkarıldı', 'ok'); }
  };
  A.togglePickup = ({ house, person }, el) => {
    S.updateMember(house, person, { canPickup: el.checked });
    UI.toast(el.checked ? 'Teslim yetkisi verildi' : 'Teslim yetkisi kaldırıldı', 'ok', `${S.person(person).name} · ${S.house(house).title}`);
  };

  /* ---------- ODA / CEPHE / PERDE formları ---------- */
  A.roomForm = ({ id, house } = {}) => {
    const r = id ? S.room(id) : null;
    const fields = [
      { name: 'name', label: 'Oda adı', required: true, placeholder: 'Örn. Salon, Ebeveyn Yatak Odası', col: 'half' },
      { name: 'type', label: 'Oda tipi', type: 'select', options: Object.keys(C.ROOM_TYPES), col: 'half' },
      { name: 'notes', label: 'Not', type: 'textarea', rows: 2, placeholder: 'Montaj veya söküm notları' },
    ];
    UI.formModal({
      title: r ? 'Odayı düzenle' : 'Yeni oda', subtitle: S.house(r ? r.houseId : house)?.title, icon: 'door', fields, values: r || { type: 'Salon' }, submit: r ? 'Kaydet' : 'Odayı ekle',
      danger: r ? { label: 'Odayı sil', onClick: async (api) => { if (await UI.confirm({ title: 'Oda silinsin mi?', text: `${esc(r.name)} ve içindeki tüm cephe ve perdeler silinecek.`, danger: true, ok: 'Sil' })) { api.close(); const hid = r.houseId; S.deleteRoom(r.id); UI.toast('Oda silindi', 'ok'); location.hash = '#/ev/' + hid; } } } : null,
      onSubmit: (v) => { if (r) { S.saveRoom({ ...r, ...v }); UI.toast('Oda güncellendi', 'ok'); } else { const nr = S.saveRoom({ ...v, houseId: house }); UI.toast('Oda eklendi', 'ok', 'Şimdi bu odaya cephe ekleyin.'); setTimeout(() => A.facadeForm({ room: nr.id }), 200); } },
      onMount: (el) => { const n = el.querySelector('[name=name]'); const t = el.querySelector('[name=type]'); n.addEventListener('input', () => { if (C.ROOM_TYPES[n.value]) t.value = n.value; }); },
    });
  };
  A.facadeForm = ({ id, room, onSaved } = {}) => {
    const f = id ? S.facade(id) : null;
    const rid = f ? f.roomId : room;
    const fields = [
      { name: 'name', label: 'Cephe adı', required: true, placeholder: 'Örn. Balkon Cephesi, Yan Pencere' },
      { name: 'opening', label: 'Açıklık tipi', type: 'radio-cards', options: C.OPENINGS.map((o) => ({ value: o, label: o, icon: /Kapı|Balkon/.test(o) ? 'door' : 'window' })) },
      { name: 'direction', label: 'Yön', type: 'select', options: C.DIRECTIONS, col: 'third' },
      { name: 'width', label: 'Ray genişliği', type: 'number', suffix: 'cm', required: true, col: 'third', min: 20 },
      { name: 'height', label: 'Tavan–zemin yüksekliği', type: 'number', suffix: 'cm', required: true, col: 'third', min: 20 },
      { name: 'notes', label: 'Not', type: 'textarea', rows: 2 },
    ];
    UI.formModal({
      title: f ? 'Cepheyi düzenle' : 'Yeni cephe', subtitle: `${S.house(S.room(rid)?.houseId)?.title} · ${S.room(rid)?.name}`, icon: 'window', size: 'lg', fields,
      values: f || { opening: 'Pencere', direction: 'Güney', width: 240, height: 260 }, submit: f ? 'Kaydet' : 'Cepheyi ekle',
      danger: f ? { label: 'Cepheyi sil', onClick: async (api) => { if (await UI.confirm({ title: 'Cephe silinsin mi?', text: 'Bu cephedeki tüm perdeler de silinecek.', danger: true, ok: 'Sil' })) { api.close(); S.deleteFacade(f.id); UI.toast('Cephe silindi', 'ok'); location.hash = '#/oda/' + rid; } } } : null,
      onSubmit: (v) => { if (v.width <= 0 || v.height <= 0) { UI.toast('Ölçüler sıfırdan büyük olmalı', 'err'); return false; } if (f) { S.saveFacade({ ...f, ...v }); UI.toast('Cephe güncellendi', 'ok'); } else { const nf = S.saveFacade({ ...v, roomId: rid }); UI.toast('Cephe eklendi', 'ok', 'Şimdi perdeleri ekleyin.'); if (onSaved) { onSaved(nf); return; } location.hash = '#/cephe/' + nf.id; setTimeout(() => A.curtainForm({ facade: nf.id }), 250); } },
    });
  };
  A.curtainForm = ({ id, facade, onSaved } = {}) => {
    const c = id ? S.curtain(id) : null;
    const fid = c ? c.facadeId : facade;
    const fac = S.facade(fid);
    const defType = c?.type || 'Tül';
    const fields = [
      { section: 'Perde' },
      { name: 'type', label: 'Perde türü', type: 'select', options: C.TYPE_LIST.map((t) => ({ value: t, label: `${t} — ${C.CURTAIN_TYPES[t].desc}` })), col: 'half' },
      { name: 'fabric', label: 'Kumaş', type: 'select', options: (v) => C.CURTAIN_TYPES[v.type || defType].fabrics, col: 'half' },
      { name: 'colorName', label: 'Renk', type: 'colors' },
      { section: 'Ölçü' },
      { name: 'width', label: 'Genişlik', type: 'number', suffix: 'cm', required: true, col: 'third', hint: 'Pileli perdede ray eni' },
      { name: 'height', label: 'Boy', type: 'number', suffix: 'cm', required: true, col: 'third' },
      { name: 'pleat', label: 'Pile oranı', type: 'select', options: [1, 1.5, 2, 2.5, 3].map((x) => ({ value: x, label: x === 1 ? 'Düz' : `1:${String(x).replace('.', ',')}` })), col: 'third' },
      { name: 'panels', label: 'Kanat', type: 'number', col: 'third', min: 1 },
      { name: 'mount', label: 'Montaj', type: 'select', options: C.MOUNTS, col: 'third' },
      { name: 'hook', label: 'Askı tipi', type: 'select', options: C.HOOKS, col: 'third' },
      { section: 'Detay' },
      { name: 'lining', label: 'Astar', type: 'select', options: C.LININGS, col: 'third' },
      { name: 'condition', label: 'Kondisyon', type: 'select', options: C.CONDITIONS, col: 'third' },
      { name: 'care', label: 'Bakım talimatı', col: 'third' },
      { name: 'notes', label: 'Not', type: 'textarea', rows: 2 },
    ];
    const T0 = C.CURTAIN_TYPES[defType];
    const values = c || { type: defType, fabric: T0.fabrics[0], colorName: 'Kırık Beyaz', width: fac?.width || 200, height: (fac?.height || 260) - 2, pleat: 3, panels: 1, mount: 'Ray', hook: 'Kanca', lining: 'Astarsız', condition: 'Yeni', care: T0.care };
    UI.formModal({
      title: c ? 'Perdeyi düzenle' : 'Yeni perde', subtitle: fac ? `${S.room(fac.roomId)?.name} · ${fac.name} · ${fac.width}×${fac.height} cm` : '', icon: 'curtain', size: 'lg', fields, values, submit: c ? 'Kaydet' : 'Perdeyi ekle',
      onSubmit: (v) => {
        v.color = C.colorHex(v.colorName);
        if (!v.colorName) { UI.toast('Bir renk seçin', 'err'); return false; }
        if (c) { S.saveCurtain({ ...c, ...v }); UI.toast('Perde güncellendi', 'ok'); }
        else { const nc = S.saveCurtain({ ...v, facadeId: fid }); UI.toast(`${nc.code} eklendi`, 'ok', `${nc.type} · ${nc.colorName} · ${money(S.price(nc))}`); onSaved && onSaved(nc); }
      },
      onMount: (el) => {
        const type = el.querySelector('[name=type]'), fabric = el.querySelector('[name=fabric]'), pleat = el.querySelector('[name=pleat]'), care = el.querySelector('[name=care]'), mount = el.querySelector('[name=mount]'), hook = el.querySelector('[name=hook]'), panels = el.querySelector('[name=panels]'), height = el.querySelector('[name=height]');
        const sync = (changed) => {
          const T = C.CURTAIN_TYPES[type.value];
          if (changed) {
            fabric.innerHTML = T.fabrics.map((f) => `<option>${esc(f)}</option>`).join('');
            care.value = T.care;
            if (T.flat) { pleat.value = '1'; mount.value = type.value === 'Jaluzi' || type.value === 'Dikey' ? 'Lamel Mekanizması' : 'Zincirli Mekanizma'; hook.value = 'Mekanizma'; panels.value = 1; if (fac) height.value = Math.round(fac.height * 0.6); }
            else { pleat.value = String(T.pleats[T.pleats.length - 1]); if (/Mekanizma/.test(mount.value)) mount.value = 'Ray'; if (hook.value === 'Mekanizma') hook.value = 'Kanca'; panels.value = type.value === 'Fon' || type.value === 'Blackout' || type.value === 'Kruvaze' ? 2 : 1; if (fac) height.value = fac.height - 2; }
          }
          pleat.closest('.field').style.opacity = T.flat ? 0.45 : 1; pleat.disabled = T.flat;
        };
        type.addEventListener('change', () => sync(true));
        sync(false);
      },
    });
  };
  A.deleteCurtain = async ({ id }) => {
    const c = S.curtain(id);
    if (S.activeOrderFor(id)) return UI.toast('Aktif siparişteki perde silinemez', 'err', 'Önce siparişi tamamlayın.');
    if (await UI.confirm({ title: 'Perde silinsin mi?', text: `${esc(c.code)} · ${esc(c.type)} kalıcı olarak silinecek.`, danger: true, ok: 'Sil' })) { const fid = c.facadeId; S.deleteCurtain(id); UI.toast('Perde silindi', 'ok'); location.hash = '#/cephe/' + fid; }
  };

  /* ---------- SİPARİŞ SİHİRBAZI ---------- */
  A.newOrder = ({ house, preselect } = {}) => A.orderWizard({ houseId: house, preselect: preselect ? preselect.split(',') : null });
  A.editOrderItems = ({ id }) => A.orderWizard({ order: S.order(id) });
  A.orderWizard = function ({ houseId, preselect, order }) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 864e5); tomorrow.setHours(10, 0, 0, 0);
    const due = new Date(now.getTime() + 12 * 864e5); due.setHours(14, 0, 0, 0);
    const suggest = (c) => {
      if (!c) return [];
      const s = [];
      if (/Motorlu/.test(c.mount)) s.push('motor');
      if (C.CURTAIN_TYPES[c.type]?.flat) return s;
      if (/Ray/.test(c.mount)) s.push('ray');
      if (/Korniş|Boru/.test(c.mount)) s.push('kornis');
      if (c.lining === 'Astarlı' || c.lining === 'Termal Astar') s.push('astar');
      if (c.hook === 'Kurşun Etek') s.push('kursun');
      return s;
    };
    const initHouse = order ? order.houseId : houseId || null;
    const st = {
      step: order ? 2 : houseId ? 2 : 1, houseId: initHouse, q: '',
      sel: new Map(order ? order.items.map((i) => [i.curtainId, [...i.services]]) : (preselect || []).filter(Boolean).map((id) => [id, suggest(S.curtain(id))])),
      measureMethod: 'yerinde', measureAt: U.toLocalInput(tomorrow.toISOString()), orderedBy: initHouse ? (S.primary(initHouse)?.personId || '') : '',
      deliveryMethod: 'montaj', sokum: false, dueAt: U.toLocalInput(due.toISOString()), discount: 0, notes: '',
    };
    const steps = order ? [[2, 'Perdeler']] : [[1, 'Ev'], [2, 'Perdeler'], [3, 'Ölçü & teslimat']];
    const items = () => [...st.sel].map(([curtainId, services]) => ({ curtainId, services }));
    const draft = () => (order
      ? S.buildOrderDraft({ items: items(), measureMethod: order.measureMethod, deliveryMethod: order.deliveryMethod, sokum: order.sokum, discount: order.discount })
      : S.buildOrderDraft({ items: items(), measureMethod: st.measureMethod, deliveryMethod: st.deliveryMethod, sokum: st.sokum, discount: st.discount }));
    const busy = (cid) => { const o = S.activeOrderFor(cid); return o && (!order || o.id !== order.id) ? o : null; };

    const summary = () => {
      const d = draft();
      const meters = sum([...st.sel.keys()], (id) => { const c = S.curtain(id); return c ? C.fabricMeters(c) : 0; });
      return `<div class="card pad" style="background:var(--surface-2)"><div class="faint" style="font-size:12px;font-weight:700;letter-spacing:.06em;margin-bottom:8px">TEKLİF ÖZETİ</div>
        ${st.houseId ? UI.kv('Ev', esc(S.house(st.houseId).title), 'home') : ''}${UI.kv('Perde', `${st.sel.size} parça`, 'curtain')}${meters ? UI.kv('Pileli kumaş', num(meters, 1) + ' m', 'grid') : ''}
        ${UI.kv('Perdeler', money(sum(d.items, (i) => i.basePrice)))}${sum(d.items, (i) => i.servicePrice) ? UI.kv('Ray, korniş, astar…', money(sum(d.items, (i) => i.servicePrice))) : ''}
        ${d.fees.map((f) => UI.kv(esc(f.label), money(f.amount))).join('')}${d.discount ? UI.kv('İndirim', '−' + money(d.discount)) : ''}
        ${UI.kv('<strong>Toplam</strong>', `<strong style="font-size:18px">${money(d.total)}</strong>`)}
        <small class="faint">Kapora teklif onaylanınca alınır.</small></div>`;
    };

    const curtainRow = (c, f) => {
      const b = busy(c.id); const on = st.sel.has(c.id);
      const tag = b ? `<span style="font-size:12px;color:var(--warn)">${esc(b.code)} · ${esc(C.ST[b.status].label)}</span>` : c.installedAt ? `<span class="chip" style="height:20px;font-size:11px">${I('refresh', 11)} Yenileme · ${U.date(c.installedAt)}</span>` : `<span class="chip ok" style="height:20px;font-size:11px">Yeni perde</span>`;
      const svcs = C.servicesFor(c);
      const price = on ? S.priceWithServices(c, st.sel.get(c.id)) : S.price(c);
      return `<div class="check-item" style="border-radius:0;border-width:1px 0 0;align-items:flex-start;${b ? 'opacity:.55' : ''}"><input type="checkbox" data-cur="${c.id}" ${on ? 'checked' : ''} ${b ? 'disabled' : ''} style="margin-top:4px">${Viz.swatch(c, 30)}
        <div style="min-width:0;flex:1"><div class="row wrap" style="gap:6px"><strong style="font-size:13px">${esc(c.type)} · ${esc(c.fabric)}</strong>${tag}</div>
          <span class="faint" style="font-size:12px">${esc(c.code)} · ${esc(c.colorName)} · ${UI.dim(c)}${C.CURTAIN_TYPES[c.type].flat ? ` · ${num(C.flatArea(c), 1)} m²` : ` · ${num(C.fabricMeters(c), 1)} m kumaş`}</span>
          ${on && svcs.length ? `<div class="chip-select" style="margin-top:6px">${svcs.map((k) => `<label class="chip-opt"><input type="checkbox" data-svc="${c.id}" value="${k}" ${st.sel.get(c.id).includes(k) ? 'checked' : ''}><span style="height:24px;font-size:11.5px;padding:0 9px">+ ${esc(C.SERVICES[k])} · ${money(C.servicePrice(k, c, S.prices()))}</span></label>`).join('')}</div>` : ''}</div>
        <strong class="mono" style="font-size:13px;${on ? '' : 'color:var(--text-3)'}">${money(price)}</strong></div>`;
    };

    const body = () => {
      const head = `<div class="row" style="gap:6px;margin-bottom:16px">${steps.map(([n, l], i) => `<span class="chip ${st.step === n ? 'ok' : ''}" style="${st.step > n ? 'opacity:.7' : ''}">${st.step > n ? I('check', 13) : `<strong>${i + 1}</strong>`} ${l}</span>${i < steps.length - 1 ? I('chevron-right', 14, 'faint') : ''}`).join('')}</div>`;
      if (st.step === 1) {
        const list = S.houses().filter((h) => U.match(st.q, h.title, h.district, h.neighborhood, h.code, S.members(h.id).map((m) => m.person.name + ' ' + m.person.phone).join(' ')));
        return head + `<div class="row" style="gap:8px;margin-bottom:12px"><div class="input-wrap" style="flex:1">${I('search', 16, 'input-ic')}<input class="input has-ic" id="wq" placeholder="Ev, kişi veya telefon ara…" value="${esc(st.q)}" autofocus></div><button class="btn" id="wnewhouse">${I('plus', 16)} Yeni ev</button></div>
          <div class="grid g2" id="wlist">${list.map((h) => { const hs = S.houseStats(h.id); return `<button class="pick ${st.houseId === h.id ? 'on' : ''}" data-house="${h.id}" ${hs.active ? 'data-busy="1"' : ''}><span class="room-ic" style="background:${h.color};color:#fff">${UI.houseIcon(h.type, 18)}</span><div style="min-width:0"><strong>${esc(h.title)}</strong><small>${esc(h.neighborhood)}, ${esc(h.district)} · ${hs.rooms} oda · ${hs.curtains} perde${hs.active ? ` · <span style="color:var(--warn)">${esc(C.ST[hs.active.status].label)}</span>` : ''}</small></div></button>`; }).join('')}</div>`;
      }
      if (st.step === 2) {
        const rooms = S.rooms(st.houseId);
        return head + `<div class="split" style="grid-template-columns:minmax(0,1fr) 300px">
          <div><div class="row between wrap" style="margin-bottom:10px;gap:8px"><div><strong>${esc(S.house(st.houseId).title)}</strong><div class="faint" style="font-size:12.5px">Mevcut perdeleri yenileme için seçin ya da cepheye yeni perde ekleyin.</div></div><div class="row" style="gap:6px"><button class="btn sm ghost" id="wall">${I('check', 14)} Tümünü seç</button><button class="btn sm ghost" id="wnone">Temizle</button></div></div>
            ${rooms.map((r) => {
              const cs = S.roomCurtains(r.id); const avail = cs.filter((c) => !busy(c.id)); const allOn = avail.length && avail.every((c) => st.sel.has(c.id));
              const facs = S.facades(r.id);
              return `<div class="card" style="margin-bottom:10px"><label class="card-head" style="cursor:pointer;padding:12px 14px"><input type="checkbox" data-room="${r.id}" ${allOn ? 'checked' : ''} ${avail.length ? '' : 'disabled'} style="width:18px;height:18px;accent-color:var(--primary)">${UI.roomIcon(r.type, 16)}<h3 style="font-size:14px">${esc(r.name)}</h3><p>${facs.length} cephe · ${cs.length} perde</p></label>
                ${facs.map((f) => `<div class="row" style="gap:8px;padding:8px 14px;background:var(--surface-2);border-top:1px solid var(--border)">${I('window', 14, 'faint')}<span style="font-size:12.5px;font-weight:600">${esc(f.name)}</span><span class="faint" style="font-size:12px">${esc(f.opening)} · ${f.width}×${f.height} cm · ${esc(f.direction)}</span><span class="grow"></span><button class="btn sm ghost" data-addc="${f.id}">${I('plus', 13)} Perde ekle</button></div>
                  ${S.curtains(f.id).map((c) => curtainRow(c, f)).join('')}`).join('') || `<div class="row" style="padding:10px 14px;border-top:1px solid var(--border)"><span class="faint" style="font-size:13px">Bu odada cephe yok.</span><span class="grow"></span><button class="btn sm ghost" data-addf="${r.id}">${I('plus', 13)} Cephe ekle</button></div>`}</div>`;
            }).join('') || UI.empty('door', 'Bu evde oda yok', 'Önce ev sayfasından oda ve cephe ekleyin.')}
          </div><div style="position:sticky;top:0" id="wsum">${summary()}</div></div>`;
      }
      const auth = S.authorized(st.houseId);
      const pr = S.prices();
      return head + `<div class="split" style="grid-template-columns:minmax(0,1fr) 300px"><div class="form-grid">
        <div class="form-section">Ölçü</div>
        <div class="field">${UI.field({ name: 'measureMethod', type: 'radio-cards', options: [{ value: 'yerinde', label: 'Yerinde ölçü', sub: pr.fees.kesif ? `Adrese gidilir · +${money(pr.fees.kesif)}` : 'Adrese gidilir · ücretsiz', icon: 'ruler' }, { value: 'musteri', label: 'Müşteri getirdi', sub: 'Direkt teklif verilir', icon: 'user' }, { value: 'kayitli', label: 'Kayıtlı ölçüler', sub: 'Cephe ölçüleri kullanılır', icon: 'layers' }] }, st)}</div>
        ${st.measureMethod === 'yerinde' ? `<label class="field half"><span class="field-label">Ölçü randevusu</span><input class="input" type="datetime-local" id="wmeas" value="${st.measureAt}"></label>` : ''}
        <label class="field ${st.measureMethod === 'yerinde' ? 'half' : ''}"><span class="field-label">Görüşülen kişi</span><select class="input" id="wby">${S.members(st.houseId).map((m) => `<option value="${m.personId}" ${st.orderedBy === m.personId ? 'selected' : ''}>${esc(m.person.name)} · ${esc(m.role)}</option>`).join('')}</select><small class="field-hint">${st.measureMethod === 'yerinde' ? 'Randevu SMS\'i bu kişiye gider' : 'Teklif SMS\'i bu kişiye gider'}</small></label>
        <div class="form-section">Teslimat</div>
        <div class="field">${UI.field({ name: 'deliveryMethod', type: 'radio-cards', options: [{ value: 'montaj', label: 'Montajlı teslim', sub: `+${money(pr.fees.montaj)} / cephe`, icon: 'sparkles' }, { value: 'dukkan', label: 'Dükkandan teslim', sub: 'Evdeki yetkili gelip alır', icon: 'store' }, { value: 'adres', label: 'Adrese teslim', sub: `+${money(pr.fees.adresTeslim)}`, icon: 'truck' }] }, st)}</div>
        ${st.deliveryMethod === 'montaj' ? UI.field({ name: 'sokum', type: 'toggle', label: 'Eski perdeler sökülsün', hint: `+${money(pr.fees.sokum)} / cephe`, col: 'half' }, st) : ''}
        <label class="field ${st.deliveryMethod === 'montaj' ? 'half' : 'half'}"><span class="field-label">${st.deliveryMethod === 'montaj' ? 'Planlanan montaj' : 'Planlanan teslim'}</span><input class="input" type="datetime-local" id="wdue" value="${st.dueAt}"></label>
        <div class="field ${st.deliveryMethod === 'montaj' ? '' : 'half'}"><span class="field-label">Teslim alabilecekler (${auth.length})</span>${V.whoCan(st.houseId, 6)}</div>
        <div class="form-section">Fiyat</div>
        <label class="field third"><span class="field-label">İndirim</span><div class="input-wrap"><input class="input" type="number" min="0" id="wdisc" value="${st.discount}"><span class="input-suffix">₺</span></div></label>
        <label class="field" style="grid-column:span 4"><span class="field-label">Not</span><textarea class="input" id="wnotes" rows="2" placeholder="Kumaş tercihi, renk kartelası, montaj saati…">${esc(st.notes)}</textarea></label>
      </div><div style="position:sticky;top:0" id="wsum">${summary()}</div></div>`;
    };
    const foot = () => {
      const first = steps[0][0], last = steps[steps.length - 1][0];
      const can = st.step === 1 ? !!st.houseId : st.step === 2 ? st.sel.size > 0 : true;
      return `<span class="faint" style="font-size:13px">${st.sel.size ? `${st.sel.size} parça · ${money(draft().total)}` : ''}</span><span class="grow"></span>
        ${st.step > first ? `<button class="btn ghost" data-w="back">${I('arrow-left', 16)} Geri</button>` : `<button class="btn ghost" data-close>Vazgeç</button>`}
        ${st.step < last ? `<button class="btn primary" data-w="next" ${can ? '' : 'disabled'}>İleri ${I('arrow-right', 16)}</button>` : `<button class="btn primary" data-w="done" ${can ? '' : 'disabled'}>${I('check', 16)} ${order ? 'Kaydet' : st.measureMethod === 'yerinde' ? 'Ölçü randevusu oluştur' : 'Teklif oluştur'}</button>`}`;
    };
    UI.modal({
      title: order ? `${order.code} · perdeleri düzenle` : 'Yeni perde siparişi', subtitle: order ? 'Tekliften perde ekleyin veya çıkarın' : 'Ev seçin, perdeleri belirleyin, ölçü ve montajı planlayın', icon: 'clipboard', size: 'xl',
      body: body(), foot: foot(),
      onMount: (el, api) => {
        const re = (keepScroll = true) => { const mb = el.querySelector('.modal-body'); const y = mb.scrollTop; api.setBody(body()); api.setFoot(foot()); bind(); if (keepScroll) mb.scrollTop = y; };
        const updSum = () => { const s = el.querySelector('#wsum'); if (s) s.innerHTML = summary(); api.setFoot(foot()); bindFoot(); };
        const bindFoot = () => el.querySelectorAll('[data-w], .modal-foot [data-close]').forEach((b) => b.addEventListener('click', () => {
          const w = b.dataset.w;
          if (b.hasAttribute('data-close')) return api.close();
          if (w === 'back') { st.step--; re(false); }
          if (w === 'next') { st.step++; re(false); }
          if (w === 'done') finish(api);
        }));
        const bind = () => {
          bindFoot();
          const wq = el.querySelector('#wq');
          if (wq) { wq.addEventListener('input', () => { st.q = wq.value; const pos = wq.selectionStart; re(); const n = el.querySelector('#wq'); n.focus(); n.setSelectionRange(pos, pos); }); }
          el.querySelector('#wnewhouse')?.addEventListener('click', () => { api.close(); setTimeout(() => A.houseForm({}), 150); });
          el.querySelectorAll('[data-house]').forEach((b) => b.addEventListener('click', () => {
            if (st.houseId !== b.dataset.house) { st.sel = new Map(); st.orderedBy = S.primary(b.dataset.house)?.personId || ''; }
            st.houseId = b.dataset.house;
            if (b.dataset.busy) UI.toast('Bu evin aktif bir siparişi var', 'info', 'O siparişteki perdeler tekrar seçilemez.');
            st.step = 2; re(false);
          }));
          el.querySelectorAll('[data-cur]').forEach((cb) => cb.addEventListener('change', () => { if (cb.checked) st.sel.set(cb.dataset.cur, suggest(S.curtain(cb.dataset.cur))); else st.sel.delete(cb.dataset.cur); re(); }));
          el.querySelectorAll('[data-svc]').forEach((cb) => cb.addEventListener('change', () => { const l = st.sel.get(cb.dataset.svc); if (cb.checked) l.push(cb.value); else l.splice(l.indexOf(cb.value), 1); re(); }));
          el.querySelectorAll('[data-room]').forEach((cb) => cb.addEventListener('change', () => { S.roomCurtains(cb.dataset.room).filter((c) => !busy(c.id)).forEach((c) => { if (cb.checked) { if (!st.sel.has(c.id)) st.sel.set(c.id, suggest(c)); } else st.sel.delete(c.id); }); re(); }));
          el.querySelectorAll('[data-addc]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); A.curtainForm({ facade: b.dataset.addc, onSaved: (nc) => { st.sel.set(nc.id, suggest(nc)); re(); } }); }));
          el.querySelectorAll('[data-addf]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); A.facadeForm({ room: b.dataset.addf, onSaved: () => re() }); }));
          el.querySelector('#wall')?.addEventListener('click', () => { S.houseCurtains(st.houseId).filter((c) => !busy(c.id)).forEach((c) => { if (!st.sel.has(c.id)) st.sel.set(c.id, suggest(c)); }); re(); });
          el.querySelector('#wnone')?.addEventListener('click', () => { st.sel = new Map(); re(); });
          el.querySelectorAll('[name=measureMethod]').forEach((r) => r.addEventListener('change', () => { st.measureMethod = r.value; re(); }));
          el.querySelectorAll('[name=deliveryMethod]').forEach((r) => r.addEventListener('change', () => { st.deliveryMethod = r.value; if (r.value !== 'montaj') st.sokum = false; re(); }));
          el.querySelector('[name=sokum]')?.addEventListener('change', (e) => { st.sokum = e.target.checked; updSum(); });
          const bindVal = (sel, key, numeric) => el.querySelector(sel)?.addEventListener('input', (e) => { st[key] = numeric ? Math.max(0, +e.target.value || 0) : e.target.value; if (numeric) updSum(); });
          bindVal('#wmeas', 'measureAt'); bindVal('#wdue', 'dueAt'); bindVal('#wdisc', 'discount', true); bindVal('#wnotes', 'notes');
          el.querySelector('#wby')?.addEventListener('change', (e) => { st.orderedBy = e.target.value; });
        };
        bind();
      },
    });
    function finish(api) {
      if (order) {
        const d = draft();
        S.updateOrder(order.id, { items: d.items, fees: d.fees, total: d.total });
        UI.toast('Teklif güncellendi', 'ok', `${d.items.length} parça · ${money(d.total)}`);
        api.close(); return;
      }
      const o = S.createOrder({
        houseId: st.houseId, items: items(), measureMethod: st.measureMethod, measureAt: U.fromInput(st.measureAt), orderedBy: st.orderedBy || null,
        deliveryMethod: st.deliveryMethod, sokum: st.sokum, dueAt: U.fromInput(st.dueAt), discount: st.discount, notes: st.notes,
      });
      api.close();
      UI.toast(`${o.code} oluşturuldu`, 'ok', `${o.items.length} parça · ${money(o.total)}`);
      const to = S.person(o.orderedBy) || S.primary(o.houseId)?.person;
      if (to?.phone) setTimeout(() => UI.toast(`SMS gönderildi → ${to.name}`, 'sms', o.status === 'olcu' ? `Ölçü randevusu: ${U.dt(o.measureAt)}` : `Teklif: ${money(o.total)}`), 600);
      location.hash = '#/siparis/' + o.id;
    }
  };

  /* ---------- Sipariş işlemleri ---------- */
  A.advance = ({ id }) => {
    const o = S.order(id);
    const next = C.FLOW[C.FLOW.indexOf(o.status) + 1];
    if (!next) return;
    if (next === 'teslim') { location.hash = '#/teslimat?siparis=' + id; return; }
    if (next === 'tedarik') { A.approveForm({ id }); return; }
    S.setStatus(id, next);
    UI.toast(`${o.code} → ${C.ST[next].label}`, 'ok');
    if (next === 'teklif') { const to = S.person(o.orderedBy) || S.primary(o.houseId)?.person; if (to?.phone) setTimeout(() => UI.toast(`Teklif SMS'i gönderildi → ${to.name}`, 'sms', money(S.totals(o).total)), 500); }
    if (next === 'hazir') A.smsToast(o);
  };
  A.approveForm = ({ id }) => {
    const o = S.order(id); const t = S.totals(o);
    const members = S.members(o.houseId);
    const dueDefault = new Date(Math.max(Date.now() + 10 * 864e5, new Date(o.dueAt || 0).getTime())); dueDefault.setHours(14, 0, 0, 0);
    UI.formModal({
      title: 'Teklif onaylandı', subtitle: `${o.code} · ${S.house(o.houseId)?.title} · ${money(t.total)}`, icon: 'check-circle',
      fields: [
        { name: 'personId', label: 'Onaylayan kişi', type: 'select', options: members.map((m) => ({ value: m.personId, label: `${m.person.name} · ${m.role}` })) },
        { name: 'deposit', label: 'Kapora', type: 'number', suffix: '₺', min: 0, col: 'half', hint: `Toplamın %${Math.round((Math.round(t.total * 0.4 / 100) * 100 / Math.max(1, t.total)) * 100)}'ı önerildi` },
        { name: 'dueAt', label: o.deliveryMethod === 'montaj' ? 'Planlanan montaj' : 'Planlanan teslim', type: 'datetime-local', col: 'half' },
        { name: 'method', label: 'Kapora ödeme yöntemi', type: 'radio-cards', options: C.PAYMENT.map((m) => ({ value: m, label: m })) },
      ],
      values: { personId: o.orderedBy || S.primary(o.houseId)?.personId, deposit: Math.max(0, Math.round(t.total * 0.4 / 100) * 100 - t.paid), method: 'Nakit', dueAt: U.toLocalInput(dueDefault.toISOString()) },
      submit: 'Onayla, kumaşı sipariş et',
      onSubmit: (v) => {
        S.approve(id, { personId: v.personId, deposit: Math.min(Math.max(0, v.deposit || 0), t.balance), method: v.method || 'Nakit', dueAt: U.fromInput(v.dueAt) });
        UI.toast(`${o.code} onaylandı`, 'ok', v.deposit > 0 ? `${money(v.deposit)} kapora alındı · kumaş tedarikte` : 'Kumaş tedarikte');
        const prim = S.primary(o.houseId);
        if (prim?.person.phone) setTimeout(() => UI.toast(`SMS gönderildi → ${prim.person.name}`, 'sms', 'Sipariş onayı ve tahmini teslim tarihi'), 600);
      },
    });
  };
  A.smsToast = (o) => {
    const auth = S.authorized(o.houseId);
    setTimeout(() => UI.toast(`${auth.length} yetkiliye SMS gönderildi`, 'sms', `${auth.map((m) => U.firstName(m.person.name)).join(', ')} · Teslim kodu: ${o.deliveryCode}`), 500);
  };
  A.paymentForm = ({ id }) => {
    const o = S.order(id); const t = S.totals(o);
    UI.formModal({
      title: 'Ödeme al', subtitle: `${o.code} · Kalan ${money(t.balance)}`, icon: 'wallet', size: 'sm',
      fields: [{ name: 'amount', label: 'Tutar', type: 'number', suffix: '₺', required: true, min: 1 }, { name: 'method', label: 'Yöntem', type: 'radio-cards', options: C.PAYMENT.map((m) => ({ value: m, label: m })) }],
      values: { amount: t.balance, method: 'Nakit' }, submit: 'Ödemeyi kaydet',
      onSubmit: (v) => { if (v.amount <= 0) { UI.toast('Tutar sıfırdan büyük olmalı', 'err'); return false; } S.addPayment(id, Math.min(v.amount, t.balance), v.method || 'Nakit'); UI.toast(`${money(Math.min(v.amount, t.balance))} tahsil edildi`, 'ok'); },
    });
  };
  A.cancelOrder = ({ id }) => {
    const o = S.order(id);
    UI.formModal({ title: 'Sipariş iptal edilsin mi?', subtitle: o.code, icon: 'ban', size: 'sm', fields: [{ name: 'reason', label: 'İptal nedeni', type: 'textarea', rows: 2, placeholder: 'Örn. Müşteri randevuyu erteledi' }], submit: 'İptal et',
      onSubmit: (v) => { S.setStatus(id, 'iptal', v.reason || 'Sipariş iptal edildi.'); UI.toast(`${o.code} iptal edildi`, 'ok'); } });
  };
  A.deleteOrder = async ({ id }) => {
    const o = S.order(id);
    if (await UI.confirm({ title: 'Sipariş silinsin mi?', text: `${esc(o.code)} ve tüm geçmişi silinecek. Raporlardan da düşer.`, danger: true, ok: 'Sil' })) { S.deleteOrder(id); UI.toast('Sipariş silindi', 'ok'); location.hash = '#/siparisler'; }
  };
  A.revealCode = ({ code }, el) => { const t = document.getElementById('dcode'); if (t) t.textContent = t.textContent.includes('•') ? code : '••••'; el.innerHTML = I(t && t.textContent.includes('•') ? 'eye' : 'eye-off', 15); };

  A.deliveredModal = (o) => {
    const t = S.totals(o);
    UI.modal({
      title: 'Teslimat tamamlandı', size: 'sm',
      body: `<div class="success-burst"><div class="big-check">${I('check', 36)}</div><h3 style="font-size:18px">${esc(o.code)} teslim edildi</h3><p class="muted" style="margin:6px 0 16px">${esc(o.deliveredToName)} · ${U.dt(o.deliveredAt)}</p>
        <div class="receipt"><div class="r-row"><span>Ev</span><strong>${esc(S.house(o.houseId)?.title)}</strong></div><div class="r-row"><span>Parça</span><span>${o.items.length}</span></div><div class="r-row"><span>Toplam</span><span>${money(t.total)}</span></div><div class="r-row"><span>Ödenen</span><span>${money(t.paid)}</span></div><div class="r-row total"><span>Kalan</span><span style="${t.balance ? 'color:var(--danger)' : ''}">${t.balance ? money(t.balance) : 'Ödendi'}</span></div></div>
        <p class="faint" style="font-size:12.5px;margin-top:12px">${I('message', 13)} Ev sahibine teslim bilgisi SMS ile gönderildi.</p></div>`,
      foot: `<button class="btn" data-pr>${I('printer', 16)} Fiş</button><a class="btn" href="#/siparis/${o.id}" data-close>Sipariş</a><button class="btn primary" data-close>Tamam</button>`,
      onMount: (el) => el.querySelector('[data-pr]').addEventListener('click', () => A.printReceipt({ id: o.id })),
    });
  };

  A.smsForm = ({ person } = {}) => {
    const templates = [
      ['Hatırlatma', 'Sayın {ad}, perdeleriniz hazır ve dükkanımızda sizi bekliyor. {imza}'],
      ['Kampanya', 'Sayın {ad}, yeni sezon kumaşlarımız geldi! Tül ve fonlarda %10 indirim, ücretsiz ölçü için: {tel} {imza}'],
      ['Randevu teyidi', 'Sayın {ad}, yarın ölçü almak için adresinize geleceğiz. Uygun değilse lütfen bizi arayın: {tel} {imza}'],
    ];
    const people = S.people().filter((p) => p.phone).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    UI.formModal({
      title: 'SMS gönder', subtitle: 'Demo — gerçek SMS gönderilmez', icon: 'message',
      fields: [{ name: 'personId', label: 'Alıcı', type: 'select', required: true, options: people.map((p) => ({ value: p.id, label: `${p.name} · ${p.phone}` })) }, { name: 'tpl', label: 'Şablon', type: 'select', options: [{ value: '', label: '— Serbest metin —' }, ...templates.map(([n], i) => ({ value: i, label: n }))] }, { name: 'text', label: 'Mesaj', type: 'textarea', rows: 4, required: true }],
      values: { personId: person || people[0]?.id }, submit: 'Gönder',
      onSubmit: (v) => { S.sms(v.personId, v.text, null, 'bilgi'); S.log(`${S.person(v.personId).name} kişisine SMS gönderildi`, '#/mesajlar', 'message'); S.persist(); UI.toast('SMS gönderildi', 'sms', S.person(v.personId).name); },
      onMount: (el) => {
        const tpl = el.querySelector('[name=tpl]'), txt = el.querySelector('[name=text]'), who = el.querySelector('[name=personId]');
        const fill = () => { if (tpl.value === '') return; const p = S.person(who.value); txt.value = templates[+tpl.value][1].replace('{ad}', p?.name || '').replace('{tel}', S.shop().phone).replace('{imza}', S.shop().smsSignature); };
        tpl.addEventListener('change', fill); who.addEventListener('change', fill);
      },
    });
  };

  /* ---------- Yazdırma ---------- */
  A.printHtml = (title, inner) => {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    const d = f.contentDocument;
    d.open();
    d.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#111;padding:24px;font-size:13px}h1{font-size:18px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{padding:6px 4px;border-bottom:1px solid #ddd;text-align:left}th{font-size:11px;color:#666;text-transform:uppercase}.r{text-align:right}.muted{color:#666}.label-print{border:1.5px dashed #999;border-radius:12px;padding:14px;display:inline-flex;flex-direction:column;align-items:center;gap:6px;width:260px}.lp-shop{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#444}.lp-code{font-family:monospace;font-weight:700;font-size:15px;letter-spacing:.12em}.lp-sub{font-size:11.5px;color:#555;text-align:center}.tot td{font-weight:700;font-size:14px}</style></head><body>${inner}</body></html>`);
    d.close();
    setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) {} setTimeout(() => f.remove(), 1500); }, 250);
  };
  A.printLabel = ({ id }) => {
    const c = S.curtain(id);
    UI.modal({ title: 'Ürün etiketi', subtitle: `${c.code} · ${c.type}`, icon: 'barcode', size: 'sm', body: `<div style="display:flex;justify-content:center">${V.label(c)}</div><p class="faint" style="font-size:12.5px;margin-top:12px;text-align:center">Etiket perdenin iç kenarına dikilir; dikimden montaja kadar perdeyle birlikte dolaşır, garantide perdeyi tanımlar.</p>`,
      foot: `<button class="btn ghost" data-close>Kapat</button><button class="btn primary" data-p>${I('printer', 16)} Yazdır</button>`,
      onMount: (el) => el.querySelector('[data-p]').addEventListener('click', () => A.printHtml(c.code, V.label(c))) });
  };
  A.printReceipt = ({ id }) => {
    const o = S.order(id); const t = S.totals(o); const shop = S.shop(); const h = S.house(o.houseId);
    const isQuote = ['olcu', 'teklif'].includes(o.status);
    const who = S.person(o.orderedBy);
    A.printHtml(o.code, `<h1>${esc(shop.name)}</h1><div class="muted">${esc(shop.address)} · ${esc(shop.phone)} · Vergi no ${esc(shop.taxNo || '')}</div><hr>
      <h1 style="font-size:15px;letter-spacing:.08em">${isQuote ? 'FİYAT TEKLİFİ' : 'SATIŞ FİŞİ'}</h1>
      <p><strong>No:</strong> ${esc(o.code)} &nbsp; <strong>Tarih:</strong> ${U.dt(o.createdAt)}<br><strong>Müşteri:</strong> ${esc(h?.title)}${who ? ' (' + esc(who.name) + ')' : ''} — ${esc(h?.street)} ${esc(h?.unit)}, ${esc(h?.district)}<br><strong>Teslimat:</strong> ${esc(C.DELIVERY[o.deliveryMethod])}${o.sokum ? ' · eski perde sökümü' : ''} · plan ${U.date(o.dueAt)}<br><strong>Durum:</strong> ${esc(C.ST[o.status].label)}${o.deliveredToName ? ` · Teslim alan: ${esc(o.deliveredToName)} (${U.dt(o.deliveredAt)})` : ''}</p>
      <table><thead><tr><th>Perde</th><th>Konum</th><th>Ölçü</th><th class="r">Tutar</th></tr></thead><tbody>${o.items.map((it) => { const p = S.path(it.curtainId); const c = p.curtain; return `<tr><td>${esc(c?.code)} · ${esc(c?.type)} · ${esc(c?.fabric)} · ${esc(c?.colorName)}${it.services.length ? '<br><span class="muted">+ ' + it.services.map((s) => esc(C.SERVICES[s])).join(', ') + '</span>' : ''}</td><td>${esc(p.room?.name)} / ${esc(p.facade?.name)}</td><td>${c ? `${c.width}×${c.height} cm${C.CURTAIN_TYPES[c.type].flat ? '' : ` · ${num(C.fabricMeters(c), 1)} m kumaş`}` : '—'}</td><td class="r">${money(it.price)}</td></tr>`; }).join('')}
      ${(o.fees || []).map((f) => `<tr><td colspan="3">${esc(f.label)}</td><td class="r">${money(f.amount)}</td></tr>`).join('')}${t.discount ? `<tr><td colspan="3">İndirim</td><td class="r">−${money(t.discount)}</td></tr>` : ''}
      <tr class="tot"><td colspan="3">Toplam (KDV dahil)</td><td class="r">${money(t.total)}</td></tr>${isQuote ? '' : `<tr><td colspan="3">Ödenen</td><td class="r">${money(t.paid)}</td></tr><tr class="tot"><td colspan="3">Kalan</td><td class="r">${money(t.balance)}</td></tr>`}</tbody></table>
      ${isQuote ? '<p class="muted" style="margin-top:16px">Teklif 15 gün geçerlidir. Onayda toplam tutarın %40\'ı kapora olarak alınır. Ölçüler montaj öncesi yerinde kontrol edilir.</p>' : `<p class="muted" style="margin-top:16px">Perdeler ${shop.warrantyYears || 2} yıl dikiş ve mekanizma garantilidir.</p>`}
      ${o.signature ? `<p style="margin-top:16px"><strong>Teslim alan imzası:</strong><br><img src="${o.signature}" style="max-width:260px;max-height:110px"></p>` : ''}<p class="muted" style="margin-top:24px">Bizi tercih ettiğiniz için teşekkür ederiz.</p>`);
  };

  /* ---------- Veri ---------- */
  A.exportJson = () => { U.download(`perdeci-yedek-${U.toDateInput()}.json`, S.exportJson()); UI.toast('Yedek indirildi', 'ok'); };
  A.exportCsv = () => {
    const rows = [['Sipariş', 'Ev', 'İlçe', 'Durum', 'Tarih', 'Teslim', 'Teslim alan', 'Parça', 'Toplam', 'Ödenen', 'Bakiye']];
    S.orders().forEach((o) => { const t = S.totals(o); const h = S.house(o.houseId); rows.push([o.code, h?.title, h?.district, C.ST[o.status].label, U.date(o.createdAt), o.deliveredAt ? U.date(o.deliveredAt) : '', o.deliveredToName || '', o.items.length, t.total, t.paid, t.balance]); });
    U.download(`perdeci-siparisler-${U.toDateInput()}.csv`, '﻿' + rows.map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv;charset=utf-8');
    UI.toast('CSV indirildi', 'ok');
  };
  A.resetData = async () => {
    if (await UI.confirm({ title: 'Demo verileri sıfırlansın mı?', text: 'Yaptığınız tüm değişiklikler silinir ve örnek veriler yeniden yüklenir.', ok: 'Sıfırla', danger: true })) { S.reset(); UI.toast('Demo verileri yenilendi', 'ok'); location.hash = '#/'; }
  };

  /* ---------- Başlat ---------- */
  function init() {
    try { const t = localStorage.getItem('perdeci.theme'); if (t && t !== 'system') document.documentElement.dataset.theme = t; } catch (e) {}
    S.load();
    S.onChange(() => App.refresh());
    UI.initTooltips();
    document.addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-href]');
      if (tr && !e.target.closest('a, button, input, label')) { location.hash = tr.dataset.href; return; }
      const el = e.target.closest('[data-act]');
      if (!el || el.tagName === 'INPUT') return;
      const fn = A[el.dataset.act];
      if (fn) { e.preventDefault(); fn({ ...el.dataset }, el, e); }
    });
    document.addEventListener('change', (e) => {
      const el = e.target;
      if (el.tagName === 'INPUT' && el.dataset.act && A[el.dataset.act]) A[el.dataset.act]({ ...el.dataset }, el, e);
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (loggedIn()) A.palette(); }
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (!document.documentElement.dataset.theme) App.refresh(); });
    window.addEventListener('hashchange', App.render);
    App.render();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
