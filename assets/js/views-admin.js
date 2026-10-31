/* Perdeci — Fiyatlar, Raporlar, Ayarlar, Giriş, Müşteri Takip */
(function () {
  const V = (window.V = window.V || {});
  const { esc, money, num } = U;
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

  /* ---------- FİYAT LİSTESİ ---------- */
  V.prices = function () {
    const p = S.prices();
    const exOf = (t) => { const T = C.CURTAIN_TYPES[t]; return { type: t, width: 300, height: T.flat ? 160 : 260, pleat: T.flat ? 1 : T.pleats[T.pleats.length - 1] }; };
    const exText = (t, prices) => { const c = exOf(t); const T = C.CURTAIN_TYPES[t]; return `${T.flat ? '300×160 cm · ' + num(C.flatArea(c), 1) + ' m²' : '300 cm ray · ' + num(C.fabricMeters(c), 1) + ' m kumaş'} → ${money(C.price(c, prices))}`; };
    const html = `
      <div class="page-head"><div><h1>Fiyat Listesi</h1><p>Pileli perdelerde fiyat <strong>kumaş metresi × (kumaş fiyatı + dikim)</strong>, düz perdelerde <strong>m² × fiyat</strong> (en az 1 m²) olarak hesaplanır.</p></div>
        <div class="actions"><button class="btn primary" id="psave">${I('check', 16)} Fiyatları Kaydet</button></div></div>
      <div class="split">
        <div class="stack">
          <div class="card"><div class="card-head"><h3>Perde türü fiyatları</h3><p>Pileli: ₺ / metre kumaş · Düz: ₺ / m² (mekanizma dahil)</p></div>
            <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tür</th><th>Hesap</th><th>Örnek</th><th class="num">Birim fiyat</th></tr></thead><tbody>
              ${C.TYPE_LIST.map((t) => { const T = C.CURTAIN_TYPES[t]; const pl = T.pleats[T.pleats.length - 1]; return `<tr><td><div class="cell-main"><span class="room-ic" style="width:34px;height:34px">${I('curtain', 16)}</span><div><strong>${t}</strong><small>${esc(T.desc)}</small></div></div></td><td>${T.flat ? 'En × boy (m²)' : `Ray eni × pile (1:${String(pl).replace('.', ',')})`}</td><td class="faint" data-ex="${t}">${exText(t, p)}</td><td class="num"><div class="input-wrap" style="justify-content:flex-end"><input class="input price-input" type="number" min="0" data-type="${t}" value="${p.types[t]}" style="padding-right:44px"><span class="input-suffix">${T.flat ? '/m²' : '/m'}</span></div></td></tr>`; }).join('')}
              <tr><td><div class="cell-main"><span class="room-ic" style="width:34px;height:34px">${I('scissors', 16)}</span><div><strong>Dikim</strong><small>Pileli perdelerde kumaş metresi başına</small></div></div></td><td>Kumaş metresi</td><td class="faint">Tül, fon, blackout, kruvaze</td><td class="num"><div class="input-wrap" style="justify-content:flex-end"><input class="input price-input" type="number" min="0" id="sewing" value="${p.sewing}" style="padding-right:44px"><span class="input-suffix">/m</span></div></td></tr>
            </tbody></table></div></div>
          <div class="grid g2">
            <div class="card"><div class="card-head"><h3>Ek kalemler</h3><p>Perde başına, birimine göre</p></div><div class="card-body">${Object.entries(C.SERVICES).map(([k, l]) => `<div class="kv"><span>${l} <small class="faint">${C.SERVICE_UNIT_LABEL[C.SERVICE_UNIT[k]]}</small></span><strong><input class="input price-input" type="number" min="0" data-service="${k}" value="${p.services[k]}"></strong></div>`).join('')}</div></div>
            <div class="card"><div class="card-head"><h3>Montaj ve teslimat</h3><p>Sipariş başına / cephe başına</p></div><div class="card-body">
              <div class="kv"><span>Yerinde ölçü / keşif <small class="faint">0 = ücretsiz</small></span><strong><input class="input price-input" type="number" min="0" data-fee="kesif" value="${p.fees.kesif}"></strong></div>
              <div class="kv"><span>Montaj <small class="faint">cephe başına</small></span><strong><input class="input price-input" type="number" min="0" data-fee="montaj" value="${p.fees.montaj}"></strong></div>
              <div class="kv"><span>Eski perde sökümü <small class="faint">cephe başına</small></span><strong><input class="input price-input" type="number" min="0" data-fee="sokum" value="${p.fees.sokum}"></strong></div>
              <div class="kv"><span>Adrese teslim</span><strong><input class="input price-input" type="number" min="0" data-fee="adresTeslim" value="${p.fees.adresTeslim}"></strong></div>
              <div class="kv"><span>Garanti süresi <small class="faint">yıl</small></span><strong><input class="input price-input" type="number" min="0" id="warranty" value="${S.shop().warrantyYears || 2}"></strong></div></div></div>
          </div>
        </div>
        <div class="card" style="position:sticky;top:80px"><div class="card-head"><span class="modal-icon" style="width:34px;height:34px">${I('calculator', 17)}</span><div><h3>Hızlı hesap</h3><p>Müşteriye telefonda fiyat verin</p></div></div>
          <div class="card-body"><div class="form-grid">
            <label class="field"><span class="field-label">Perde türü</span><select class="input" id="ctype">${C.TYPE_LIST.map((t) => `<option>${t}</option>`).join('')}</select></label>
            <label class="field third"><span class="field-label">En</span><div class="input-wrap"><input class="input" type="number" id="cw" value="300"><span class="input-suffix">cm</span></div></label>
            <label class="field third"><span class="field-label">Boy</span><div class="input-wrap"><input class="input" type="number" id="ch" value="260"><span class="input-suffix">cm</span></div></label>
            <label class="field third" id="cpw"><span class="field-label">Pile</span><select class="input" id="cp">${[1.5, 2, 2.5, 3].map((x) => `<option value="${x}" ${x === 3 ? 'selected' : ''}>1:${String(x).replace('.', ',')}</option>`).join('')}</select></label>
            <label class="field half"><span class="field-label">Adet</span><input class="input" type="number" id="cn" value="1" min="1"></label>
            <label class="field half" style="justify-content:flex-end"><span class="row" style="gap:8px;font-size:13px;color:var(--text-2);height:40px"><input type="checkbox" id="cmontaj" checked style="accent-color:var(--primary)"> Montaj dahil</span></label>
            <div class="field"><span class="field-label">Ek kalemler</span><div class="chip-select" id="csvcs"></div></div>
          </div>
          <div class="calc-result" style="margin-top:16px"><span id="carea"></span><strong id="cprice"></strong><span id="cnote"></span></div></div></div>
      </div>`;
    const mount = (el) => {
      const current = () => {
        const np = JSON.parse(JSON.stringify(S.prices()));
        el.querySelectorAll('input[data-type]').forEach((x) => { np.types[x.dataset.type] = Math.max(0, +x.value || 0); });
        el.querySelectorAll('[data-service]').forEach((x) => { np.services[x.dataset.service] = Math.max(0, +x.value || 0); });
        el.querySelectorAll('[data-fee]').forEach((x) => { np.fees[x.dataset.fee] = Math.max(0, +x.value || 0); });
        np.sewing = Math.max(0, +el.querySelector('#sewing').value || 0);
        return np;
      };
      let lastType = null;
      const calc = () => {
        const pr = current();
        const type = el.querySelector('#ctype').value;
        const flat = C.CURTAIN_TYPES[type].flat;
        el.querySelector('#cpw').style.display = flat ? 'none' : '';
        const c = { type, width: +el.querySelector('#cw').value || 0, height: +el.querySelector('#ch').value || 0, pleat: +el.querySelector('#cp').value };
        if (lastType !== type) {
          lastType = type;
          el.querySelector('#csvcs').innerHTML = C.servicesFor(c).map((k) => `<label class="chip-opt"><input type="checkbox" data-csvc="${k}"><span>${C.SERVICES[k]}</span></label>`).join('');
          el.querySelectorAll('[data-csvc]').forEach((x) => x.addEventListener('change', calc));
        }
        const n = Math.max(1, +el.querySelector('#cn').value || 1);
        const base = C.price(c, pr);
        const svc = [...el.querySelectorAll('[data-csvc]:checked')].reduce((s, x) => s + C.servicePrice(x.dataset.csvc, c, pr), 0);
        const montaj = el.querySelector('#cmontaj').checked ? pr.fees.montaj : 0;
        const total = (base + svc) * n + montaj;
        el.querySelector('#carea').textContent = flat ? `${num(C.flatArea(c), 2)} m² × ${money(pr.types[type])}${n > 1 ? ` × ${n} adet` : ''}` : `${num(C.fabricMeters(c), 2)} m kumaş × (${money(pr.types[type])} + ${money(pr.sewing)} dikim)${n > 1 ? ` × ${n} adet` : ''}`;
        el.querySelector('#cprice').textContent = money(total);
        el.querySelector('#cnote').textContent = [svc ? `${money(svc * n)} ek kalem` : '', montaj ? `${money(montaj)} montaj` : ''].filter(Boolean).join(' · ') || 'Kumaş, dikim ve mekanizma dahil';
        C.TYPE_LIST.forEach((t) => { el.querySelector(`[data-ex="${t}"]`).textContent = exText(t, pr); });
      };
      el.querySelectorAll('input, select').forEach((x) => x.addEventListener('input', calc));
      calc();
      el.querySelector('#psave').addEventListener('click', () => {
        S.savePrices(current());
        S.saveShop({ warrantyYears: Math.max(0, +el.querySelector('#warranty').value || 0) });
        UI.toast('Fiyat listesi kaydedildi', 'ok', 'Yeni tekliflerde bu fiyatlar kullanılacak.');
      });
    };
    return { title: 'Fiyat Listesi', crumbs: [['Fiyat Listesi']], html, mount };
  };

  /* ---------- RAPORLAR ---------- */
  V.reports = function () {
    const orders = S.orders().filter((o) => o.status !== 'iptal');
    const now = new Date();
    const yearAgo = new Date(now.getTime() - 365 * 864e5);
    const pays = orders.flatMap((o) => o.payments.map((p) => ({ ...p, o })));
    const yearRev = sum(pays.filter((p) => new Date(p.at) >= yearAgo), (p) => p.amount);
    const delivered = orders.filter((o) => o.status === 'teslim');
    const turn = delivered.map((o) => { const a = o.history.find((x) => x.status === 'tedarik'); const r = o.history.find((x) => x.status === 'teslim'); return a && r ? (new Date(r.at) - new Date(a.at)) / 864e5 : null; }).filter((x) => x !== null);
    const avgTurn = turn.length ? sum(turn, (x) => x) / turn.length : 0;
    const onTime = delivered.filter((o) => o.readyAt && new Date(o.readyAt) <= new Date(new Date(o.dueAt).getTime() + 864e5)).length;
    const onTimePct = delivered.length ? Math.round((onTime / delivered.length) * 100) : 0;
    const soldMeters = sum(delivered.flatMap((o) => o.items), (i) => { const c = S.curtain(i.curtainId); return c ? C.fabricMeters(c) : 0; });
    const avgOrder = delivered.length ? sum(delivered, (o) => S.totals(o).total) / delivered.length : 0;
    const quoted = S.orders().filter((o) => o.history.some((x) => x.status === 'teklif'));
    const decided = quoted.filter((o) => o.status === 'iptal' || o.approvedAt);
    const winRate = decided.length ? Math.round((decided.filter((o) => o.approvedAt).length / decided.length) * 100) : 0;

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const s = new Date(now.getFullYear(), now.getMonth() - i, 1), e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      months.push({ label: U.MONTHS_S[s.getMonth()], value: sum(pays.filter((p) => new Date(p.at) >= s && new Date(p.at) < e), (p) => p.amount), full: `${U.MONTHS[s.getMonth()]} ${s.getFullYear()}` });
    }
    const group = (arr, keyFn, valFn) => { const m = {}; arr.forEach((x) => { const k = keyFn(x); if (k) m[k] = (m[k] || 0) + valFn(x); }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
    const byDistrict = group(orders, (o) => S.house(o.houseId)?.district, () => 1).slice(0, 8).map(([k, v]) => ({ label: k, value: v, tip: `${k}: ${v} sipariş` }));
    const byType = group(delivered.flatMap((o) => o.items), (i) => S.curtain(i.curtainId)?.type, (i) => i.price).map(([k, v]) => ({ label: k, value: v }));
    const byMethod = group(pays, (p) => p.method, (p) => p.amount).map(([k, v]) => ({ label: k, value: v }));
    const byRole = group(delivered, (o) => { const m = S.house(o.houseId)?.members.find((x) => x.personId === o.deliveredTo); return m?.role || (o.deliveredTo ? 'Diğer' : null); }, () => 1).map(([k, v]) => ({ label: k, value: v, tip: `${k}: ${v} teslim` }));
    const top = S.houses().map((h) => ({ h, st: S.houseStats(h.id) })).sort((a, b) => b.st.spent - a.st.spent).slice(0, 10);

    const kpi = (icon, label, value, sub) => `<div class="card kpi"><div class="kpi-label"><span class="ic-box">${I(icon, 16)}</span>${label}</div><div class="kpi-value">${value}</div><div class="kpi-sub">${sub}</div></div>`;
    const html = `
      <div class="page-head"><div><h1>Raporlar</h1><p>Son 12 ayın özeti. Tahsilat tutarları ödeme tarihine göre hesaplanır.</p></div>
        <div class="actions"><button class="btn" data-act="exportCsv">${I('download', 16)} CSV indir</button></div></div>
      <div class="grid g5">
        ${kpi('wallet', 'Yıllık tahsilat', money(yearRev), 'Son 365 gün')}
        ${kpi('clipboard', 'Tamamlanan satış', num(delivered.length), `Ortalama ${money(avgOrder)}`)}
        ${kpi('tag', 'Teklif dönüşümü', `%${winRate}`, `${decided.filter((o) => o.approvedAt).length} / ${decided.length} teklif onaylandı`)}
        ${kpi('clock', 'Ortalama teslim süresi', `${num(avgTurn, 1)} gün`, `Onaydan teslime · zamanında %${onTimePct}`)}
        ${kpi('scissors', 'Satılan kumaş', `${num(soldMeters, 0)} m`, `${num(sum(delivered, (o) => o.items.length))} parça perde takıldı`)}
      </div>
      <div class="card" style="margin-top:18px"><div class="card-head"><h3>Aylık tahsilat</h3><p>₺ · son 12 ay</p></div><div class="card-body">${Viz.columns(months, { height: 230, hlLast: true, tipFmt: (d) => `${d.full}: ${money(d.value)}` })}</div></div>
      <div class="grid g2" style="margin-top:18px">
        <div class="card"><div class="card-head"><h3>Perde türüne göre ciro</h3></div><div class="card-body">${Viz.hbars(byType, { fmt: (v) => money(v) })}</div></div>
        <div class="card"><div class="card-head"><h3>İlçelere göre sipariş</h3></div><div class="card-body">${Viz.hbars(byDistrict)}</div></div>
        <div class="card"><div class="card-head"><h3>Perdeyi kim teslim aldı?</h3><p>Teslim alan kişinin evdeki rolü</p></div><div class="card-body">${Viz.hbars(byRole)}</div></div>
        <div class="card"><div class="card-head"><h3>Ödeme yöntemleri</h3></div><div class="card-body">${Viz.hbars(byMethod, { fmt: (v) => money(v) })}</div></div>
      </div>
      <div class="card" style="margin-top:18px"><div class="card-head"><h3>En çok ödeme yapan evler</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Ev</th><th>İlçe</th><th class="num">Sipariş</th><th class="num">Perde</th><th class="num">Toplam ödeme</th><th class="num">Bakiye</th><th>Son teslim</th></tr></thead><tbody>
        ${top.map(({ h, st }, i) => `<tr class="link" data-href="#/ev/${h.id}"><td><span class="count-badge">${i + 1}</span></td><td><strong>${esc(h.title)}</strong></td><td>${esc(h.district)}</td><td class="num">${st.orders}</td><td class="num">${st.curtains}</td><td class="num"><strong>${money(st.spent)}</strong></td><td class="num" style="${st.balance ? 'color:var(--danger)' : ''}">${st.balance ? money(st.balance) : '—'}</td><td>${st.last ? U.date(st.last.deliveredAt) : '—'}</td></tr>`).join('')}
      </tbody></table></div></div>`;
    return { title: 'Raporlar', crumbs: [['Raporlar']], html };
  };

  /* ---------- AYARLAR ---------- */
  V.settings = function () {
    const shop = S.shop();
    const theme = (() => { try { return localStorage.getItem('perdeci.theme') || 'system'; } catch (e) { return 'system'; } })();
    const fields = [
      { name: 'name', label: 'Dükkan adı', required: true },
      { name: 'owner', label: 'Sahibi', col: 'half' }, { name: 'ownerShort', label: 'Panelde görünen ad', col: 'half' },
      { name: 'phone', label: 'Telefon', col: 'half', icon: 'phone' }, { name: 'whatsapp', label: 'WhatsApp', col: 'half', icon: 'phone' },
      { name: 'email', label: 'E-posta', col: 'half', icon: 'mail' }, { name: 'hours', label: 'Çalışma saatleri', col: 'half', icon: 'clock' },
      { name: 'address', label: 'Adres', type: 'textarea', rows: 2 },
      { name: 'taxNo', label: 'Vergi no', col: 'half' }, { name: 'smsSignature', label: 'SMS imzası', col: 'half', hint: 'Her SMS\'in sonuna eklenir' },
    ];
    const st = { houses: S.houses().length, people: S.people().length, rooms: S.db.rooms.length, facades: S.db.facades.length, curtains: S.allCurtains().length, orders: S.orders().length, messages: S.messages().length };
    const html = `
      <div class="page-head"><div><h1>Ayarlar</h1><p>Dükkan bilgileri, görünüm ve demo verileri.</p></div></div>
      <div class="split">
        <div class="card"><div class="card-head"><h3>Dükkan bilgileri</h3><p>Fiş, etiket ve SMS'lerde kullanılır</p></div><div class="card-body"><form id="shopf">${UI.form(fields, shop)}</form></div>
          <div class="card-foot"><span class="grow"></span><button class="btn primary" id="shopsave">${I('check', 16)} Kaydet</button></div></div>
        <div class="stack">
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:12px">Görünüm</h3><div class="seg" id="themeseg">${[['system', 'Sistem', 'monitor'], ['light', 'Açık', 'sun'], ['dark', 'Koyu', 'moon']].map(([k, l, ic]) => `<button data-th="${k}" class="${theme === k ? 'on' : ''}">${I(ic, 15)} ${l}</button>`).join('')}</div></div>
          <div class="card pad"><h3 style="font-size:15px;margin-bottom:6px">Veri</h3><p class="faint" style="font-size:13px;margin-bottom:10px">Demo veriler yalnızca bu tarayıcıda saklanır.</p>
            ${UI.kv('Ev', st.houses, 'home')}${UI.kv('Kişi', st.people, 'users')}${UI.kv('Oda / Cephe', `${st.rooms} / ${st.facades}`, 'door')}${UI.kv('Perde', st.curtains, 'curtain')}${UI.kv('Sipariş', st.orders, 'clipboard')}${UI.kv('SMS', st.messages, 'message')}
            <div class="row wrap" style="margin-top:14px"><button class="btn" data-act="exportJson">${I('download', 16)} Yedek al</button><label class="btn">${I('upload', 16)} Yedek yükle<input type="file" accept="application/json" id="impf" hidden></label></div>
            <button class="btn danger block" style="margin-top:10px" data-act="resetData">${I('refresh', 16)} Demo verilerini sıfırla</button></div>
          <div class="info-box">${I('info', 18)}<div><strong>Bu bir demodur.</strong> Giriş, SMS ve ödeme işlemleri simülasyondur; hiçbir veri sunucuya gönderilmez.</div></div>
        </div></div>`;
    const mount = (el) => {
      el.querySelector('#shopsave').addEventListener('click', () => { const v = UI.readForm(el.querySelector('#shopf'), fields); if (!v.name) return UI.toast('Dükkan adı zorunlu', 'err'); S.saveShop(v); UI.toast('Dükkan bilgileri kaydedildi', 'ok'); });
      el.querySelectorAll('[data-th]').forEach((b) => b.addEventListener('click', () => { App.setTheme(b.dataset.th); el.querySelectorAll('[data-th]').forEach((x) => x.classList.toggle('on', x === b)); }));
      el.querySelector('#impf').addEventListener('change', (e) => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => { try { S.importJson(r.result); UI.toast('Yedek yüklendi', 'ok'); } catch (err) { UI.toast('Yedek okunamadı', 'err', err.message); } };
        r.readAsText(f);
      });
    };
    return { title: 'Ayarlar', crumbs: [['Ayarlar']], html, mount };
  };

  /* ---------- GİRİŞ ---------- */
  V.login = function () {
    const shop = S.shop();
    const html = `<div class="login">
      <div class="login-art">
        <div class="stage" id="stage"><div class="sheer"></div><div class="rod"></div><div class="drape l"></div><div class="drape r"></div></div>
        <div class="brand" style="position:relative;z-index:2;padding:0"><div class="brand-mark">${I('curtain', 22)}</div><div><div class="brand-name">Perdeci</div><div class="brand-sub" style="color:#a9c2bc">Perde satış & montaj yönetim paneli</div></div></div>
        <h2>Her evin her perdesi, <em>tek ekranda.</em></h2>
        <p>Evleri, odaları, cepheleri ve takılan perdeleri kaydedin. Ölçüden teklife, dikimden montaja tüm süreci takip edin; evdeki her yetkili kişi teslim kodu ile perdesini alsın.</p>
        <div class="login-feats"><div>${I('layers', 16)} Ev › Oda › Cephe › Perde</div><div>${I('shield', 16)} Teslim yetkilileri</div><div>${I('message', 16)} Otomatik SMS</div></div>
      </div>
      <div class="login-form">
        <h1>Hoş geldiniz</h1><p>${esc(shop.name)} paneline giriş yapın.</p>
        <div class="demo-cred">${I('info', 18)}<span>Demo hesabı hazır, <strong>Panele Gir</strong>'e basmanız yeterli.</span></div>
        <form id="loginf"><div class="form-grid">
          ${UI.field({ name: 'email', label: 'E-posta', icon: 'mail', type: 'email' }, { email: 'kemal@nazliperde.com' })}
          ${UI.field({ name: 'pass', label: 'Şifre', icon: 'lock', type: 'password' }, { pass: 'demo-perdeci' })}
          <label class="field"><span class="row" style="gap:8px;font-size:13px;color:var(--text-2)"><input type="checkbox" checked style="accent-color:var(--primary)"> Beni hatırla</span></label>
        </div><button class="btn primary lg block" style="margin-top:18px" type="submit">${I('arrow-right', 18)} Panele Gir</button></form>
        <div class="login-alt">${I('package', 18)} Müşteri misiniz? <a class="btn sm soft" href="#/takip">Siparişimi takip et</a></div>
      </div></div>`;
    const mount = (el) => {
      setTimeout(() => el.querySelector('#stage')?.classList.add('open'), 250);
      el.querySelector('#loginf').addEventListener('submit', (e) => { e.preventDefault(); App.login(); });
    };
    return { title: 'Giriş', html, mount, bare: true };
  };

  /* ---------- MÜŞTERİ TAKİP ---------- */
  V.track = function () {
    const shop = S.shop();
    const q = U.qs();
    const samples = S.activeOrders().slice(0, 4).map((o) => { const p = S.primary(o.houseId)?.person; return { code: o.code, tail: (p?.phone || '').replace(/\D/g, '').slice(-4) }; }).filter((x) => x.tail);
    const html = `<div class="track-page">
      <div class="track-top"><div class="brand-mark">${I('curtain', 22)}</div><div><div class="brand-name">${esc(shop.name)}</div><div class="brand-sub">${esc(shop.phone)} · ${esc(shop.hours)}</div></div><span class="grow"></span><a class="btn sm ghost" href="#/giris">${I('lock', 14)} Dükkan girişi</a></div>
      <div class="track-wrap">
        <div class="track-hero"><h1>Perdeniz ne durumda?</h1><p>Size gelen SMS'teki sipariş kodunu ve telefon numaranızın son 4 hanesini girin.</p></div>
        <div class="card pad"><form id="trackf" class="track-form">
          <label class="field" style="grid-column:auto"><span class="field-label">Sipariş kodu</span><input class="input" name="code" placeholder="SP-0000" value="${esc(q.kod || '')}"></label>
          <label class="field" style="grid-column:auto"><span class="field-label">Telefon son 4 hane</span><input class="input" name="tail" inputmode="numeric" maxlength="4" placeholder="1234" value="${esc(q.tel || '')}"></label>
          <button class="btn primary" style="height:40px" type="submit">${I('search', 16)} Sorgula</button></form>
          ${samples.length ? `<div class="track-samples">Demo için deneyin: ${samples.map((s) => `<button data-code="${s.code}" data-tail="${s.tail}">${s.code} · ${s.tail}</button>`).join('')}</div>` : ''}</div>
        <div id="track-out" style="margin-top:18px"></div>
      </div></div>`;
    const mount = (el) => {
      const out = el.querySelector('#track-out');
      const show = (code, tail) => {
        const o = S.orders().find((x) => x.code.toLowerCase() === String(code).trim().toLowerCase());
        const ok = o && S.members(o.houseId).some((m) => (m.person.phone || '').replace(/\D/g, '').endsWith(String(tail).trim()) && String(tail).trim().length === 4);
        if (!ok) { out.innerHTML = `<div class="card">${UI.empty('search', 'Sipariş bulunamadı', 'Kod veya telefon numarası eşleşmedi. Lütfen SMS\'teki bilgileri kontrol edin.')}</div>`; return; }
        const h = S.house(o.houseId);
        const auth = S.authorized(o.houseId);
        const st = C.ST[o.status];
        out.innerHTML = `<div class="card"><div class="card-head"><span class="tl-ic" style="--c:${st.color}">${I(st.icon, 15)}</span><div><h3>${esc(o.code)} · ${esc(h.title)}</h3><p>${o.items.length} parça perde · ${esc(C.DELIVERY[o.deliveryMethod])}</p></div><div class="actions">${UI.status(o.status)}</div></div>
          <div class="card-body">${UI.stepper(o)}</div>
          <div class="card-body" style="border-top:1px solid var(--border)">
            ${o.status === 'hazir' ? `<div class="info-box" style="margin-bottom:12px">${I('package', 18)}<div><strong>Perdeleriniz hazır!</strong> Teslim kodu SMS ile gönderildi. Evinizden ${auth.map((m) => esc(U.firstName(m.person.name))).join(', ')} dükkana gelip kodu söyleyerek teslim alabilir.</div></div>` : ''}
            ${o.status === 'teslim' ? `<div class="info-box" style="margin-bottom:12px">${I('check-circle', 18)}<div>Perdeleriniz <strong>${U.dt(o.deliveredAt)}</strong> tarihinde <strong>${esc(U.firstName(o.deliveredToName))}</strong> tarafından teslim alındı.</div></div>` : ''}
            ${o.status === 'teklif' ? `<div class="info-box" style="margin-bottom:12px">${I('tag', 18)}<div><strong>Teklifiniz hazır:</strong> ${money(S.totals(o).total)}. Onaylamak veya kumaş değiştirmek için ${esc(S.shop().phone)} numarasından bize ulaşın.</div></div>` : ''}
            ${UI.kv('Sipariş tarihi', U.date(o.createdAt), 'calendar')}${o.measureAt ? UI.kv('Ölçü randevusu', U.dt(o.measureAt), 'ruler') : ''}${UI.kv(o.deliveryMethod === 'montaj' ? 'Planlanan montaj' : 'Planlanan teslim', U.date(o.dueAt), 'package')}${UI.kv('Tutar', money(S.totals(o).total), 'wallet')}${UI.kv('Kalan ödeme', S.totals(o).balance ? money(S.totals(o).balance) : 'Ödendi', 'check')}
            <div class="row wrap" style="margin-top:12px;gap:6px">${o.items.slice(0, 12).map((i) => { const c = S.curtain(i.curtainId); return c ? `<span class="mini-curtain" style="--sw:${c.color}"><i></i>${esc(S.path(c.id).room?.name || '')} · ${esc(c.type)}</span>` : ''; }).join('')}${o.items.length > 12 ? `<span class="chip">+${o.items.length - 12}</span>` : ''}</div>
          </div></div>
          <p class="faint" style="text-align:center;margin-top:14px;font-size:13px">Sorunuz mu var? ${esc(shop.phone)} · ${esc(shop.address)}</p>`;
      };
      el.querySelector('#trackf').addEventListener('submit', (e) => { e.preventDefault(); const f = new FormData(e.target); show(f.get('code'), f.get('tail')); });
      el.querySelectorAll('[data-code]').forEach((b) => b.addEventListener('click', () => { el.querySelector('[name=code]').value = b.dataset.code; el.querySelector('[name=tail]').value = b.dataset.tail; show(b.dataset.code, b.dataset.tail); }));
      if (q.kod && q.tel) show(q.kod, q.tel);
    };
    return { title: 'Sipariş Takip', html, mount, bare: true };
  };
})();
