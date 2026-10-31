/* Perdeci — veri katmanı (localStorage) */
(function () {
  const KEY = 'perdeci.db.v4';
  const VERSION = 4;
  let db = null;
  let ix = {};
  const listeners = new Set();

  function index() {
    ix = {
      house: new Map(db.houses.map((x) => [x.id, x])),
      person: new Map(db.people.map((x) => [x.id, x])),
      room: new Map(db.rooms.map((x) => [x.id, x])),
      facade: new Map(db.facades.map((x) => [x.id, x])),
      curtain: new Map(db.curtains.map((x) => [x.id, x])),
      order: new Map(db.orders.map((x) => [x.id, x])),
      activeByCurtain: new Map(),
    };
    db.orders.forEach((o) => {
      if (C.ACTIVE.includes(o.status)) o.items.forEach((it) => ix.activeByCurtain.set(it.curtainId, o));
    });
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn('Kaydedilemedi', e); }
  }
  function commit() { index(); save(); listeners.forEach((fn) => fn()); }

  const S = {
    get db() { return db; },
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) db = JSON.parse(raw);
      } catch (e) { db = null; }
      if (!db || db.version !== VERSION) { db = C.buildSeed(); save(); }
      try { localStorage.removeItem('perdeci.db.v3'); } catch (e) {}
      index();
    },
    reset() { db = C.buildSeed(); commit(); },
    exportJson() { return JSON.stringify(db, null, 2); },
    importJson(text) {
      const obj = JSON.parse(text);
      if (!obj.houses || !obj.people || !obj.orders) throw new Error('Geçersiz yedek dosyası');
      db = obj; commit();
    },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    persist() { commit(); },

    /* ---------- Okuma ---------- */
    houses: () => db.houses,
    house: (id) => ix.house.get(id),
    people: () => db.people,
    person: (id) => ix.person.get(id),
    rooms: (houseId) => db.rooms.filter((r) => r.houseId === houseId).sort((a, b) => a.order - b.order),
    room: (id) => ix.room.get(id),
    facades: (roomId) => db.facades.filter((f) => f.roomId === roomId),
    facade: (id) => ix.facade.get(id),
    curtains: (facadeId) => db.curtains.filter((c) => c.facadeId === facadeId).sort((a, b) => (C.CURTAIN_TYPES[a.type]?.layer || 0) - (C.CURTAIN_TYPES[b.type]?.layer || 0)),
    curtain: (id) => ix.curtain.get(id),
    allCurtains: () => db.curtains,
    orders: () => db.orders,
    order: (id) => ix.order.get(id),
    prices: () => db.prices,
    shop: () => db.shop,
    messages: () => db.messages,

    roomCurtains(roomId) { return S.facades(roomId).flatMap((f) => S.curtains(f.id)); },
    houseFacades(houseId) { return S.rooms(houseId).flatMap((r) => S.facades(r.id)); },
    houseCurtains(houseId) { return S.rooms(houseId).flatMap((r) => S.roomCurtains(r.id)); },
    path(curtainId) {
      const c = S.curtain(curtainId); if (!c) return {};
      const facade = S.facade(c.facadeId); const room = facade && S.room(facade.roomId); const house = room && S.house(room.houseId);
      return { curtain: c, facade, room, house };
    },
    members(houseId) {
      const h = S.house(houseId); if (!h) return [];
      return h.members.map((m) => ({ ...m, person: S.person(m.personId) })).filter((m) => m.person)
        .sort((a, b) => (b.isPrimary - a.isPrimary) || (b.canPickup - a.canPickup));
    },
    authorized(houseId) { return S.members(houseId).filter((m) => m.canPickup); },
    primary(houseId) { const ms = S.members(houseId); return ms.find((m) => m.isPrimary) || ms[0]; },
    personHouses(personId) {
      return db.houses.flatMap((h) => h.members.filter((m) => m.personId === personId).map((m) => ({ ...m, house: h })));
    },
    houseOrders(houseId) { return db.orders.filter((o) => o.houseId === houseId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); },
    activeOrders() { return db.orders.filter((o) => C.ACTIVE.includes(o.status)); },
    activeOrderFor(curtainId) { return ix.activeByCurtain.get(curtainId); },
    curtainOrders(curtainId) { return db.orders.filter((o) => o.items.some((i) => i.curtainId === curtainId)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); },
    curtainStatus(curtainId) {
      const o = S.activeOrderFor(curtainId);
      if (!o) {
        const c = S.curtain(curtainId);
        if (c && c.installedAt) return { key: 'takili', label: 'Takılı', short: 'Takılı', color: '#7b8794', icon: 'home' };
        return { key: 'kayitli', label: 'Siparişi yok', short: 'Kayıtlı', color: '#a0806a', icon: 'ruler' };
      }
      const st = C.ST[o.status];
      const labels = { olcu: 'Ölçü bekliyor', teklif: 'Teklifte', tedarik: 'Kumaş tedarikte', uretim: 'Dikimde', hazir: 'Teslime hazır' };
      return { key: o.status, label: labels[o.status] || st.label, short: st.short, color: st.color, icon: st.icon, order: o };
    },
    warrantyEnd(c) {
      if (!c || !c.installedAt) return null;
      const d = new Date(c.installedAt); d.setFullYear(d.getFullYear() + (db.shop.warrantyYears || 2));
      return d.toISOString();
    },
    totals(o) {
      const items = o.items.reduce((s, i) => s + i.price, 0);
      const fees = (o.fees || []).reduce((s, f) => s + f.amount, 0);
      const subtotal = items + fees;
      const total = o.total ?? Math.max(0, subtotal - (o.discount || 0));
      const paid = (o.payments || []).reduce((s, p) => s + p.amount, 0);
      return { items, fees, subtotal, discount: o.discount || 0, total, paid, balance: o.status === 'iptal' ? 0 : Math.max(0, total - paid) };
    },
    area(c) { return C.area(c); },
    price(c) { return C.price(c, db.prices); },
    priceWithServices(c, services) { return C.price(c, db.prices) + (services || []).reduce((s, k) => s + C.servicePrice(k, c, db.prices), 0); },
    houseStats(houseId) {
      const rooms = S.rooms(houseId);
      const facades = rooms.flatMap((r) => S.facades(r.id));
      const curtains = facades.flatMap((f) => S.curtains(f.id));
      const orders = S.houseOrders(houseId);
      const valid = orders.filter((o) => o.status !== 'iptal');
      const spent = valid.reduce((s, o) => s + S.totals(o).paid, 0);
      const balance = valid.filter((o) => o.status === 'teslim').reduce((s, o) => s + S.totals(o).balance, 0);
      const active = orders.find((o) => C.ACTIVE.includes(o.status));
      const last = orders.find((o) => o.status === 'teslim');
      return { rooms: rooms.length, facades: facades.length, curtains: curtains.length, area: curtains.reduce((s, c) => s + C.area(c), 0), orders: valid.length, spent, balance, active, last };
    },
    personStats(personId) {
      const hs = S.personHouses(personId);
      const orders = db.orders.filter((o) => hs.some((h) => h.house.id === o.houseId));
      const received = db.orders.filter((o) => o.deliveredTo === personId);
      const ordered = db.orders.filter((o) => o.orderedBy === personId && o.status !== 'iptal');
      const balance = hs.filter((h) => h.isPrimary).reduce((s, h) => s + S.houseStats(h.house.id).balance, 0);
      return { houses: hs.length, orders: orders.length, received: received.length, ordered: ordered.length, balance, lastReceived: received.sort((a, b) => (a.deliveredAt < b.deliveredAt ? 1 : -1))[0] };
    },
    activity(limit = 30) {
      const ev = [];
      db.orders.forEach((o) => o.history.forEach((h) => ev.push({ at: h.at, kind: h.payment ? 'payment' : h.status, order: o, note: h.note, by: h.by })));
      db.events.forEach((e) => ev.push({ at: e.at, kind: 'event', text: e.text, ref: e.ref, icon: e.icon }));
      return ev.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
    },
    search(q) {
      if (!q || !q.trim()) return { houses: [], people: [], curtains: [], orders: [] };
      const houses = db.houses.filter((h) => U.match(q, h.title, h.code, h.district, h.neighborhood, h.street, h.unit)).slice(0, 6);
      const people = db.people.filter((p) => U.match(q, p.name, p.phone, p.email)).slice(0, 6);
      const curtains = db.curtains.filter((c) => {
        const p = S.path(c.id);
        return U.match(q, c.code, c.type, c.fabric, c.colorName, p.room?.name, p.house?.title);
      }).slice(0, 6);
      const orders = db.orders.filter((o) => {
        const h = S.house(o.houseId);
        return U.match(q, o.code, h?.title, o.deliveryCode, C.ST[o.status].label);
      }).slice(0, 6);
      return { houses, people, curtains, orders };
    },

    /* ---------- Yazma ---------- */
    log(text, ref, icon) { db.events.push({ at: new Date().toISOString(), type: 'event', text, ref, icon }); },

    saveHouse(data) {
      if (data.id && S.house(data.id)) {
        Object.assign(S.house(data.id), data);
        S.log(`${data.title} bilgileri güncellendi`, '#/ev/' + data.id, 'edit');
      } else {
        db.counters.house++;
        data.id = U.uid('h'); data.code = 'EV-' + db.counters.house; data.createdAt = new Date().toISOString(); data.members = data.members || []; data.tags = data.tags || [];
        db.houses.push(data);
        S.log(`Yeni ev eklendi: ${data.title}`, '#/ev/' + data.id, 'home');
      }
      commit(); return data;
    },
    deleteHouse(id) {
      const rooms = S.rooms(id).map((r) => r.id);
      const facs = db.facades.filter((f) => rooms.includes(f.roomId)).map((f) => f.id);
      const h = S.house(id);
      db.curtains = db.curtains.filter((c) => !facs.includes(c.facadeId));
      db.facades = db.facades.filter((f) => !rooms.includes(f.roomId));
      db.rooms = db.rooms.filter((r) => r.houseId !== id);
      db.orders = db.orders.filter((o) => o.houseId !== id);
      db.houses = db.houses.filter((x) => x.id !== id);
      S.log(`${h?.title || 'Ev'} silindi`, '', 'trash');
      commit();
    },
    savePerson(data) {
      if (data.id && S.person(data.id)) Object.assign(S.person(data.id), data);
      else { data.id = U.uid('p'); data.createdAt = new Date().toISOString(); db.people.push(data); S.log(`Yeni kişi eklendi: ${data.name}`, '#/kisi/' + data.id, 'user-plus'); }
      commit(); return data;
    },
    deletePerson(id) {
      const p = S.person(id);
      db.houses.forEach((h) => { h.members = h.members.filter((m) => m.personId !== id); });
      db.people = db.people.filter((x) => x.id !== id);
      S.log(`${p?.name} kişi kaydı silindi`, '', 'trash');
      commit();
    },
    linkMember(houseId, personId, role, canPickup, isPrimary) {
      const h = S.house(houseId);
      let m = h.members.find((x) => x.personId === personId);
      if (isPrimary) h.members.forEach((x) => { x.isPrimary = false; });
      if (m) Object.assign(m, { role, canPickup: !!canPickup, isPrimary: !!isPrimary || m.isPrimary });
      else { m = { personId, role, canPickup: !!canPickup, isPrimary: !!isPrimary || h.members.length === 0 }; h.members.push(m); }
      S.log(`${S.person(personId)?.name}, ${h.title} evine ${role} olarak bağlandı`, '#/ev/' + houseId, 'link');
      commit();
    },
    updateMember(houseId, personId, patch) {
      const h = S.house(houseId);
      if (patch.isPrimary) h.members.forEach((x) => { x.isPrimary = false; });
      const m = h.members.find((x) => x.personId === personId);
      if (m) Object.assign(m, patch);
      commit();
    },
    unlinkMember(houseId, personId) {
      const h = S.house(houseId);
      h.members = h.members.filter((m) => m.personId !== personId);
      if (h.members.length && !h.members.some((m) => m.isPrimary)) h.members[0].isPrimary = true;
      S.log(`${S.person(personId)?.name}, ${h.title} evinden çıkarıldı`, '#/ev/' + houseId, 'x');
      commit();
    },
    saveRoom(data) {
      if (data.id && S.room(data.id)) Object.assign(S.room(data.id), data);
      else { data.id = U.uid('r'); data.order = S.rooms(data.houseId).length; db.rooms.push(data); S.log(`${S.house(data.houseId)?.title}: ${data.name} eklendi`, '#/oda/' + data.id, 'door'); }
      commit(); return data;
    },
    deleteRoom(id) {
      const facs = S.facades(id).map((f) => f.id);
      db.curtains = db.curtains.filter((c) => !facs.includes(c.facadeId));
      db.facades = db.facades.filter((f) => f.roomId !== id);
      db.rooms = db.rooms.filter((r) => r.id !== id);
      commit();
    },
    saveFacade(data) {
      ['width', 'height'].forEach((k) => { data[k] = Number(data[k]) || 0; });
      if (data.id && S.facade(data.id)) Object.assign(S.facade(data.id), data);
      else { data.id = U.uid('f'); db.facades.push(data); }
      commit(); return data;
    },
    deleteFacade(id) {
      db.curtains = db.curtains.filter((c) => c.facadeId !== id);
      db.facades = db.facades.filter((f) => f.id !== id);
      commit();
    },
    saveCurtain(data) {
      ['width', 'height', 'pleat', 'panels'].forEach((k) => { data[k] = Number(data[k]) || 0; });
      if (C.CURTAIN_TYPES[data.type]?.flat) data.pleat = 1;
      if (data.colorName && !data.color) data.color = C.colorHex(data.colorName);
      if (data.id && S.curtain(data.id)) Object.assign(S.curtain(data.id), data);
      else {
        db.counters.curtain++;
        data.id = 'c_' + U.uid('n').slice(2); data.code = 'PR-' + db.counters.curtain; data.installedAt = null;
        data.condition = data.condition || 'Yeni';
        db.curtains.push(data);
        const p = S.path(data.id);
        S.log(`${p.house?.title} · ${p.room?.name}: ${data.type} perde eklendi (${data.code})`, '#/perde/' + data.id, 'curtain');
      }
      commit(); return data;
    },
    deleteCurtain(id) {
      db.curtains = db.curtains.filter((c) => c.id !== id);
      commit();
    },

    sms(personId, text, orderId, kind = 'bilgi') {
      const p = S.person(personId);
      if (!p || !p.phone) return null;
      const m = { id: U.uid('m'), personId, phone: p.phone, at: new Date().toISOString(), text, orderId, kind, status: 'İletildi' };
      db.messages.unshift(m);
      return m;
    },

    buildOrderDraft({ items, measureMethod, deliveryMethod, sokum, discount }) {
      const curtains = items.map((i) => S.curtain(i.curtainId)).filter(Boolean);
      const facadeCount = new Set(curtains.map((c) => c.facadeId)).size;
      const pr = db.prices;
      const its = items.filter((i) => S.curtain(i.curtainId)).map((i) => {
        const c = S.curtain(i.curtainId);
        const basePrice = C.price(c, pr);
        const services = (i.services || []).filter((k) => C.servicesFor(c).includes(k));
        const servicePrice = services.reduce((s, k) => s + C.servicePrice(k, c, pr), 0);
        return { curtainId: i.curtainId, services, basePrice, servicePrice, price: basePrice + servicePrice };
      });
      const fees = [];
      if (measureMethod === 'yerinde' && pr.fees.kesif > 0) fees.push({ label: 'Yerinde ölçü / keşif', amount: pr.fees.kesif });
      if (deliveryMethod === 'adres') fees.push({ label: 'Adrese teslim', amount: pr.fees.adresTeslim });
      if (deliveryMethod === 'montaj' && facadeCount) fees.push({ label: `Montaj (${facadeCount} cephe)`, amount: pr.fees.montaj * facadeCount });
      if (sokum && facadeCount) fees.push({ label: `Eski perde sökümü (${facadeCount} cephe)`, amount: pr.fees.sokum * facadeCount });
      const subtotal = its.reduce((s, i) => s + i.price, 0) + fees.reduce((s, f) => s + f.amount, 0);
      const disc = Math.min(subtotal, Math.max(0, Number(discount) || 0));
      const total = its.length ? subtotal - disc : 0;
      return { items: its, fees, subtotal, discount: disc, total, facadeCount };
    },
    createOrder(input) {
      const draft = S.buildOrderDraft(input);
      db.counters.order++;
      const code = `SP-${String(db.counters.order).padStart(4, '0')}`;
      const now = new Date().toISOString();
      const yerinde = input.measureMethod === 'yerinde';
      const o = {
        id: U.uid('o'), code, houseId: input.houseId, status: yerinde ? 'olcu' : 'teklif',
        items: draft.items, fees: draft.fees, discount: draft.discount, total: draft.total, payments: [],
        createdAt: now, measureMethod: input.measureMethod, measureAt: yerinde ? input.measureAt : null, dueAt: input.dueAt,
        deliveryMethod: input.deliveryMethod, sokum: !!input.sokum,
        deliveryCode: String(1000 + Math.floor(Math.random() * 9000)), notes: input.notes || '', history: [], orderedBy: input.orderedBy || null,
        deliveredTo: null, deliveredToName: null, deliveredAt: null, readyAt: null, approvedAt: null, signature: null,
      };
      const prim = S.primary(input.houseId);
      const to = input.orderedBy ? S.person(input.orderedBy) : prim?.person;
      if (yerinde) {
        o.history.push({ status: 'olcu', at: now, note: `Ölçü randevusu oluşturuldu${to ? ` (${U.firstName(to.name)} ile görüşüldü)` : ''}.`, by: db.shop.ownerShort });
        if (to) S.sms(to.id, `Sayın ${to.name}, ${code} ölçü randevunuz ${U.date(o.measureAt)} saat ${U.time(o.measureAt)} olarak planlandı. ${db.shop.smsSignature}`, o.id, 'randevu');
      } else {
        o.history.push({ status: 'teklif', at: now, note: `${C.MEASURE[o.measureMethod]} ile ${o.items.length} parça perde için ${U.money(o.total)} teklif hazırlandı.`, by: db.shop.ownerShort });
        if (to) S.sms(to.id, `Sayın ${to.name}, ${code} nolu perde teklifiniz hazır: ${U.money(o.total)}. Detay: nazliperde.com/takip ${db.shop.smsSignature}`, o.id, 'teklif');
      }
      db.orders.push(o);
      commit();
      return o;
    },
    setStatus(orderId, status, note) {
      const o = S.order(orderId); if (!o) return;
      o.status = status;
      const now = new Date().toISOString();
      const defaults = {
        teklif: `Ölçüler alındı, ${o.items.length} parça perde için ${U.money(S.totals(o).total)} teklif verildi.`,
        tedarik: 'Teklif onaylandı. Kumaşlar tedarikçiden istendi.',
        uretim: 'Kumaşlar geldi, kesim ve dikime alındı.',
        hazir: 'Dikim ve kalite kontrol tamamlandı, paketlendi.',
        iptal: 'Sipariş iptal edildi.',
      };
      o.history.push({ status, at: now, note: note || defaults[status] || '', by: db.shop.ownerShort });
      const prim = S.primary(o.houseId);
      const sig = db.shop.smsSignature;
      if (status === 'teklif') {
        const to = o.orderedBy ? S.person(o.orderedBy) : prim?.person;
        if (to) S.sms(to.id, `Sayın ${to.name}, ${o.code} nolu perde teklifiniz hazır: ${U.money(S.totals(o).total)}. Detay: nazliperde.com/takip ${sig}`, o.id, 'teklif');
      }
      if (status === 'tedarik' && prim) S.sms(prim.personId, `${o.code}: Siparişiniz onaylandı, kumaşlarınız sipariş edildi. Tahmini teslim: ${U.date(o.dueAt)}. ${sig}`, o.id, 'onay');
      if (status === 'hazir') {
        o.readyAt = now;
        const auth = S.authorized(o.houseId);
        const names = auth.map((m) => U.firstName(m.person.name)).join(', ');
        auth.forEach((m) => S.sms(m.personId, o.deliveryMethod === 'dukkan'
          ? `${o.code} nolu perdeleriniz hazır. Teslim kodu: ${o.deliveryCode}. Evinizden ${names} dükkandan teslim alabilir. ${sig}`
          : `${o.code} nolu perdeleriniz hazır. ${o.deliveryMethod === 'montaj' ? 'Montaj' : 'Teslimat'} için sizi arayacağız. Teslim kodu: ${o.deliveryCode}. ${sig}`, o.id, 'hazir'));
        o.history[o.history.length - 1].note += ` ${auth.length} yetkiliye SMS gönderildi.`;
      }
      commit();
      return o;
    },
    approve(orderId, { personId, deposit, method, dueAt }) {
      const o = S.order(orderId); if (!o) return;
      const now = new Date().toISOString();
      o.orderedBy = personId || o.orderedBy; o.approvedAt = now; if (dueAt) o.dueAt = dueAt;
      if (deposit > 0) o.payments.push({ at: now, amount: Number(deposit), method: method || 'Nakit', note: 'Kapora' });
      const who = S.person(o.orderedBy)?.name;
      return S.setStatus(orderId, 'tedarik', `Teklif ${who ? who + ' tarafından ' : ''}onaylandı${deposit > 0 ? `, ${U.money(deposit)} kapora alındı` : ''}. Kumaşlar tedarikçiden istendi.`);
    },
    deliver(orderId, { personId, signature, payment, note, codeVerified }) {
      const o = S.order(orderId); if (!o) return;
      const p = S.person(personId);
      const mem = S.members(o.houseId).find((m) => m.personId === personId);
      const now = new Date().toISOString();
      o.status = 'teslim'; o.deliveredTo = personId; o.deliveredToName = p?.name; o.deliveredAt = now; o.signature = signature || null;
      if (payment && payment.amount > 0) o.payments.push({ at: now, amount: Number(payment.amount), method: payment.method });
      const how = o.deliveryMethod === 'montaj' ? `${o.sokum ? 'Eski perdeler söküldü, ' : ''}montaj tamamlandı. ` : o.deliveryMethod === 'adres' ? 'Adrese teslim edildi. ' : '';
      o.history.push({ status: 'teslim', at: now, note: `${how}${p?.name} (${mem?.role || 'Yetkili'}) teslim aldı.${codeVerified ? ' Teslim kodu doğrulandı.' : ' Kod yerine kimlik kontrolü yapıldı.'}${note ? ' ' + note : ''}`, by: o.deliveryMethod === 'dukkan' ? db.shop.ownerShort : 'Hüseyin (Montaj)' });
      o.items.forEach((it) => { const c = S.curtain(it.curtainId); if (c) { c.installedAt = now; c.condition = 'Yeni'; } });
      const prim = S.primary(o.houseId);
      if (prim) S.sms(prim.personId, `${o.code} nolu perdeleriniz ${p?.name} tarafından teslim alındı. ${db.shop.warrantyYears || 2} yıl garantilidir. Bizi tercih ettiğiniz için teşekkürler. ${db.shop.smsSignature}`, o.id, 'teslim');
      commit();
      return o;
    },
    addPayment(orderId, amount, method) {
      const o = S.order(orderId); if (!o) return;
      o.payments.push({ at: new Date().toISOString(), amount: Number(amount), method });
      o.history.push({ status: o.status, at: new Date().toISOString(), note: `${U.money(amount)} ödeme alındı (${method}).`, by: db.shop.ownerShort, payment: true });
      commit();
    },
    updateOrder(orderId, patch) { Object.assign(S.order(orderId), patch); commit(); },
    deleteOrder(orderId) { db.orders = db.orders.filter((o) => o.id !== orderId); commit(); },
    savePrices(p) { db.prices = p; commit(); },
    saveShop(s) { Object.assign(db.shop, s); commit(); },
  };

  window.S = S;
})();
