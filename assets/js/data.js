/* Perdeci — sabitler ve demo verisi üretici (perde satış, dikim ve montaj) */
(function () {
  const C = {};

  C.CURTAIN_TYPES = {
    'Tül':      { flat: false, layer: 2, fabrics: ['Polyester Tül', 'Keten Görünümlü Tül', 'Vual', 'Organze', 'Bürümcük Tül'], pleats: [2.5, 3], care: '30° hassas yıkama, düşük devir sıkma', desc: 'Işık geçiren ince perde' },
    'Kruvaze':  { flat: false, layer: 2, fabrics: ['Vual', 'Polyester Tül', 'Organze'], pleats: [2.5], care: '30° hassas yıkama, askıda kurutma', desc: 'Çapraz bağlanan tül' },
    'Fon':      { flat: false, layer: 3, fabrics: ['Kadife', 'Keten', 'Şönil', 'Saten', 'Jakarlı', 'Pamuklu', 'Dimout'], pleats: [1.5, 2, 2.5], care: '30° hassas yıkama veya kuru temizleme', desc: 'Yanlarda duran dekoratif perde' },
    'Blackout': { flat: false, layer: 3, fabrics: ['3 Kat Blackout', 'Blackout Kadife', 'Blackout Keten Dokulu'], pleats: [2, 2.5], care: 'Elde yıkama, sıkmadan kurutma', desc: 'Işığı tamamen kesen karartma perdesi' },
    'Stor':     { flat: true, layer: 1, fabrics: ['Polyester Stor', 'Screen Stor', 'Blackout Stor', 'Keten Dokulu Stor'], pleats: [1], care: 'Nemli bezle silinir, ultrasonik temizlik', desc: 'Sarmal mekanizmalı düz perde' },
    'Zebra':    { flat: true, layer: 1, fabrics: ['Polyester Zebra', 'Bambu Zebra', 'Keten Zebra', 'Blackout Zebra'], pleats: [1], care: 'Nemli bezle silinir, ultrasonik temizlik', desc: 'Şeffaf/opak bantlı perde' },
    'Jaluzi':   { flat: true, layer: 1, fabrics: ['Alüminyum 25 mm', 'Ahşap 50 mm', 'PVC 35 mm'], pleats: [1], care: 'Toz alınır, lameller tek tek silinir', desc: 'Yatay lamelli perde' },
    'Plise':    { flat: true, layer: 1, fabrics: ['Polyester Plise', 'Petek (Honeycomb)'], pleats: [1], care: 'Hafif fırçalama, ultrasonik temizlik', desc: 'Akordeon katlamalı perde' },
    'Dikey':    { flat: true, layer: 1, fabrics: ['Polyester Dikey 89 mm', 'PVC Dikey 127 mm'], pleats: [1], care: 'Lameller sökülüp yıkanabilir', desc: 'Dikey lamelli ofis perdesi' },
  };
  C.TYPE_LIST = Object.keys(C.CURTAIN_TYPES);

  C.COLORS = [
    { name: 'Beyaz', hex: '#fbfbf8' }, { name: 'Kırık Beyaz', hex: '#f3efe4' }, { name: 'Krem', hex: '#ebe0c8' },
    { name: 'Bej', hex: '#d8c6a6' }, { name: 'Vizon', hex: '#a59584' }, { name: 'Taş Grisi', hex: '#bdb8ae' },
    { name: 'Füme', hex: '#6a6e72' }, { name: 'Antrasit', hex: '#45494e' }, { name: 'Lacivert', hex: '#2c3e66' },
    { name: 'Petrol Mavisi', hex: '#1f5f6b' }, { name: 'Gök Mavisi', hex: '#9cc3db' }, { name: 'Zümrüt', hex: '#2f6b4f' },
    { name: 'Adaçayı', hex: '#9caf96' }, { name: 'Pudra', hex: '#e6c3bd' }, { name: 'Gül Kurusu', hex: '#b9847f' },
    { name: 'Bordo', hex: '#6e2232' }, { name: 'Hardal', hex: '#c9a13b' }, { name: 'Taba', hex: '#9a6a3f' },
    { name: 'Toprak', hex: '#8a5a44' }, { name: 'Mürdüm', hex: '#5a3552' }, { name: 'Şampanya', hex: '#e3d3b0' },
  ];
  C.colorHex = (name) => (C.COLORS.find(c => c.name === name) || { hex: '#cccccc' }).hex;

  C.OPENINGS = ['Pencere', 'Balkon Kapısı', 'Balkon Kapısı + Pencere', 'Fransız Balkon', 'Sürme Kapı', 'Cam Cephe', 'Köşe Pencere', 'Çatı Penceresi'];
  C.DIRECTIONS = ['Kuzey', 'Kuzeydoğu', 'Doğu', 'Güneydoğu', 'Güney', 'Güneybatı', 'Batı', 'Kuzeybatı'];
  C.SUN = {
    'Kuzey': 'Az güneş alır. İnce tül ve açık renk fon yeterli, blackout gerekmez.',
    'Kuzeydoğu': 'Sabah güneşi alır. Tül + hafif fon önerilir.',
    'Doğu': 'Sabah güneşi erken odayı aydınlatır. Yatak odasıysa blackout önerin.',
    'Güneydoğu': 'Öğlene kadar yoğun güneş. Astarlı fon veya screen stor önerin.',
    'Güney': 'Gün boyu güneş alır. Solmaya dayanıklı, astarlı kumaş önerin.',
    'Güneybatı': 'Öğleden sonra yoğun güneş. Termal astar veya blackout önerin.',
    'Batı': 'İkindi güneşi sıcak ve sert. Solma riski yüksek; UV dayanımlı kumaş önerin.',
    'Kuzeybatı': 'Akşamüstü kısa süre güneş alır. Dekoratif fon tercih edilebilir.',
  };

  C.ROOM_TYPES = {
    'Salon': 'sofa', 'Yemek Odası': 'utensils', 'Yatak Odası': 'bed', 'Çocuk Odası': 'smile', 'Mutfak': 'utensils',
    'Çalışma Odası': 'book', 'Misafir Odası': 'armchair', 'Kış Bahçesi': 'leaf', 'Teras': 'sun', 'Ofis': 'monitor',
    'Toplantı Odası': 'users', 'Bekleme Alanı': 'armchair', 'Otel Odası': 'bed', 'Lobi': 'building', 'Diğer': 'door',
  };
  C.HOUSE_TYPES = {
    'Daire': 'building', 'Dubleks': 'building', 'Villa': 'home', 'Müstakil': 'home', 'Yazlık': 'sun',
    'Ofis': 'briefcase', 'Klinik': 'plus-square', 'İşyeri': 'store', 'Otel': 'building',
  };
  C.ROLES = ['Ev Sahibi', 'Eş', 'Çocuk', 'Ebeveyn', 'Kardeş', 'Akraba', 'Kiracı', 'Yardımcı', 'Kapıcı', 'Site Görevlisi', 'Komşu', 'Yetkili', 'Çalışan'];
  C.MOUNTS = ['Ray', 'Korniş', 'Rustik Boru', 'Tavan Rayı', 'Motorlu Ray', 'Zincirli Mekanizma', 'Yaylı Mekanizma', 'Motorlu Mekanizma', 'Lamel Mekanizması'];
  C.HOOKS = ['Kanca', 'Halka', 'Kuşgözü', 'Pense', 'Kurşun Etek', 'Cırt', 'Mekanizma'];
  C.LININGS = ['Astarsız', 'Astarlı', 'Termal Astar', 'Blackout Astar'];
  C.CONDITIONS = ['Yeni', 'Çok İyi', 'İyi', 'Yıpranmış', 'Değişmeli'];

  C.STATUSES = [
    { key: 'olcu',    label: 'Ölçü Randevusu',  short: 'Ölçü',    color: '#6d5bd0', icon: 'ruler',        action: 'Ölçü Alındı' },
    { key: 'teklif',  label: 'Teklif Verildi',  short: 'Teklif',  color: '#2a78d6', icon: 'tag',          action: 'Teklif Onaylandı' },
    { key: 'tedarik', label: 'Kumaş Tedarikte', short: 'Tedarik', color: '#0e8fa3', icon: 'truck',        action: 'Kumaş Geldi, Dikime Al' },
    { key: 'uretim',  label: 'Dikimde',         short: 'Dikimde', color: '#c27a12', icon: 'scissors',     action: 'Hazır İşaretle' },
    { key: 'hazir',   label: 'Teslime Hazır',   short: 'Hazır',   color: '#13875a', icon: 'package',      action: 'Teslim Et' },
    { key: 'teslim',  label: 'Teslim Edildi',   short: 'Teslim',  color: '#6b7280', icon: 'check-circle' },
    { key: 'iptal',   label: 'İptal',           short: 'İptal',   color: '#c23b3b', icon: 'ban' },
  ];
  C.ST = Object.fromEntries(C.STATUSES.map(s => [s.key, s]));
  C.FLOW = ['olcu', 'teklif', 'tedarik', 'uretim', 'hazir', 'teslim'];
  C.ACTIVE = ['olcu', 'teklif', 'tedarik', 'uretim', 'hazir'];

  // Perde başına ek kalemler ve birimleri: m = ray eni (metre), kumas = kumaş metresi, adet
  C.SERVICES = { ray: 'Ray', kornis: 'Rustik korniş', astar: 'Astar', kursun: 'Kurşun etek', motor: 'Motor + kumanda' };
  C.SERVICE_UNIT = { ray: 'm', kornis: 'm', astar: 'kumas', kursun: 'kumas', motor: 'adet' };
  C.SERVICE_UNIT_LABEL = { m: '₺ / metre ray', kumas: '₺ / metre kumaş', adet: '₺ / adet' };
  C.MEASURE = { yerinde: 'Yerinde ölçü', musteri: 'Müşteri ölçüyü getirdi', kayitli: 'Kayıtlı ölçüler' };
  C.DELIVERY = { dukkan: 'Dükkandan teslim', adres: 'Adrese teslim', montaj: 'Montajlı teslim' };
  C.PAYMENT = ['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Cari Hesap'];
  C.STAFF = ['Kemal Usta', 'Hüseyin (Montaj)', 'Sevim (Dikim)', 'Derya (Dikim)'];

  C.DEFAULT_PRICES = {
    // Pileli perdeler: ₺ / metre kumaş · Düz perdeler: ₺ / m²
    types: { 'Tül': 420, 'Kruvaze': 460, 'Fon': 640, 'Blackout': 720, 'Stor': 1100, 'Zebra': 1350, 'Jaluzi': 1600, 'Plise': 1850, 'Dikey': 950 },
    sewing: 110,
    services: { ray: 320, kornis: 650, astar: 180, kursun: 40, motor: 4500 },
    fees: { kesif: 0, adresTeslim: 250, montaj: 300, sokum: 150 },
  };

  C.area = (c) => (Number(c.width) / 100) * (Number(c.height) / 100) * ((C.CURTAIN_TYPES[c.type] || { flat: true }).flat ? 1 : (Number(c.pleat) || 1));
  C.fabricMeters = (c) => ((C.CURTAIN_TYPES[c.type] || { flat: true }).flat ? 0 : (Number(c.width) / 100) * (Number(c.pleat) || 1));
  C.flatArea = (c) => Math.max(1, (Number(c.width) / 100) * (Number(c.height) / 100));
  const r10 = (n) => Math.max(10, Math.round(n / 10) * 10);
  // Perdenin satış fiyatı (kumaş + dikim ya da m² fiyatı)
  C.price = (c, prices) => {
    const p = prices || C.DEFAULT_PRICES;
    const rate = p.types[c.type] || 500;
    if ((C.CURTAIN_TYPES[c.type] || { flat: true }).flat) return r10(C.flatArea(c) * rate);
    return r10(C.fabricMeters(c) * (rate + (p.sewing || 0)));
  };
  C.servicePrice = (k, c, prices) => {
    const rate = (prices || C.DEFAULT_PRICES).services[k] || 0;
    const u = C.SERVICE_UNIT[k];
    if (u === 'm') return r10((Number(c.width) / 100) * rate);
    if (u === 'kumas') return r10(C.fabricMeters(c) * rate);
    return rate;
  };
  C.servicesFor = (c) => {
    const flat = (C.CURTAIN_TYPES[c.type] || {}).flat;
    if (flat) return ['motor'];
    return ['ray', 'kornis', 'astar', 'kursun', 'motor'];
  };

  /* ---------- Demo verisi ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  C.buildSeed = function () {
    const R = mulberry32(20261101);
    const rint = (a, b) => Math.floor(a + R() * (b - a + 1));
    const pick = (arr) => arr[Math.floor(R() * arr.length)];
    const chance = (p) => R() < p;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const DAY = 864e5;
    const at = (offsetDays, hour = 10, min = 0) => {
      const t = new Date(today.getTime() + Math.round(offsetDays) * DAY);
      t.setHours(hour, min, 0, 0);
      return t.toISOString();
    };
    const addH = (iso, hours) => new Date(new Date(iso).getTime() + hours * 3600e3).toISOString();
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const clampNow = (iso) => (iso > nowIso ? new Date(nowMs - rint(5, 90) * 60e3).toISOString() : iso);

    const db = {
      version: 4,
      createdAt: nowIso,
      shop: {
        name: 'Nazlı Perde & Dekorasyon',
        owner: 'Kemal Yıldırım',
        ownerShort: 'Kemal Usta',
        phone: '0216 418 27 50',
        whatsapp: '0532 418 27 50',
        email: 'iletisim@nazliperde.com',
        address: 'Caferağa Mah. Moda Cad. No:84, Kadıköy / İstanbul',
        hours: 'Pzt–Cmt 09:00–19:30',
        taxNo: '6310482915',
        smsSignature: 'Nazlı Perde',
        warrantyYears: 2,
      },
      prices: JSON.parse(JSON.stringify(C.DEFAULT_PRICES)),
      people: [], houses: [], rooms: [], facades: [], curtains: [], orders: [], messages: [], events: [],
      counters: { house: 100, curtain: 1000, order: 0 },
    };

    /* Kişiler */
    const P = [
      ['ahmet', 'Ahmet Yılmaz', '0532 418 72 15', 'ahmet.yilmaz@mail.com', 'Sadık müşteri. Evi, Bodrum yazlığı ve ofisinin perdeleri bizden.'],
      ['elif', 'Elif Yılmaz', '0533 207 44 81', 'elif.yilmaz@mail.com', 'Kumaş ve renk seçimlerini genelde Elif Hanım yapıyor.'],
      ['can', 'Can Yılmaz', '0544 912 30 06', '', 'Üniversite öğrencisi, teslim alabilir.'],
      ['fatma', 'Fatma Demir', '0535 661 09 27', '', 'Yılmaz ailesinde ve Oya Hanım\'da yardımcı olarak çalışıyor.'],
      ['recep', 'Recep Kaya', '0542 380 55 12', '', 'Bağdat Cad. 312 apartman görevlisi.'],
      ['huseyinb', 'Hüseyin Er', '0536 774 21 90', '', 'Yalıkavak Deniz Sitesi görevlisi, anahtar kendisinde.'],
      ['zeynep', 'Zeynep Arslan', '0532 745 63 08', 'zeynep.arslan@mail.com', 'Yılmaz Mimarlık\'ta ofis müdürü.'],
      ['kerem', 'Kerem Arslan', '0530 118 92 47', '', ''],
      ['murat', 'Murat Kaya', '0541 236 70 54', 'murat.kaya@mail.com', ''],
      ['ayse', 'Ayşe Kaya', '0543 559 18 33', '', ''],
      ['selin', 'Selin Kaya', '', '', '12 yaşında, teslim yetkisi yok.'],
      ['serkan', 'Serkan Demir', '0532 990 14 62', 'serkan.demir@mail.com', '3 evi var, ikisini kiraya veriyor. Kiralık evlerin perdelerini o ödüyor.'],
      ['nermin', 'Nermin Demir', '0533 402 77 19', '', ''],
      ['ozan', 'Ozan Demir', '0545 230 81 66', '', ''],
      ['burak', 'Burak Öztürk', '0537 614 52 90', 'burak.ozturk@mail.com', 'Mimoza Sitesi kiracısı.'],
      ['deniz', 'Deniz Öztürk', '0538 271 39 05', '', ''],
      ['gizem', 'Gizem Aydın', '0539 855 60 21', 'gizem.aydin@mail.com', 'Serkan Bey\'in Maltepe dairesinde kiracı. Hakan Bey\'in kardeşi.'],
      ['gulsum', 'Gülsüm Er', '0546 318 47 70', '', 'Demir ve Çelik ailelerinde yardımcı.'],
      ['selim', 'Dr. Selim Çelik', '0532 507 26 38', 'selim.celik@mail.com', 'Muayenehane ve ev ayrı faturalandırılıyor.'],
      ['nur', 'Nur Çelik', '0533 864 15 92', '', ''],
      ['asli', 'Aslı Koç', '0541 692 07 44', 'asli.koc@mail.com', 'Dr. Çelik\'in kliniğinde hemşire. Ailesi aynı binada.'],
      ['mehmetk', 'Mehmet Koç', '0532 145 98 31', '', 'Emekli öğretmen. Aynı binada iki dairesi var.'],
      ['hatice', 'Hatice Koç', '0535 489 62 10', '', ''],
      ['ali', 'Ali Şahin', '0542 731 06 58', '', 'Yeşilköy Gül Apt. kapıcısı.'],
      ['emre', 'Emre Şahin', '0532 670 43 29', 'emre@modakafe.com', 'Kafe sahibi, e-fatura istiyor.'],
      ['cem', 'Cem Polat', '0544 208 91 37', 'cem.polat@mail.com', 'Moda Kafe müdürü.'],
      ['ebru', 'Ebru Polat', '0536 952 74 03', '', ''],
      ['kaan', 'Kaan Polat', '', '', '8 yaşında.'],
      ['saadet', 'Saadet Uçar', '0535 117 26 84', '', 'Anneanne, teslim alabilir.'],
      ['hakan', 'Hakan Aydın', '0533 640 85 17', 'hakan.aydin@mail.com', ''],
      ['merve', 'Merve Aydın', '0538 403 19 72', '', ''],
      ['tolga', 'Tolga Erdem', '0532 381 57 46', 'tolga.erdem@mail.com', ''],
      ['pinar', 'Pınar Erdem', '0537 926 03 58', '', ''],
      ['ismail', 'İsmail Bozkurt', '0542 177 64 39', '', 'Alaçatı Taş Evler görevlisi.'],
      ['oya', 'Oya Güneş', '0532 604 38 91', '', 'Yalnız yaşıyor. Oğlu Barış Bey veya Fatma Hanım teslim alabilir.'],
      ['baris', 'Barış Güneş', '0544 857 20 63', 'baris.gunes@mail.com', ''],
      ['volkan', 'Volkan Kurt', '0531 249 86 07', 'volkan.kurt@mail.com', ''],
      ['sibel', 'Sibel Kurt', '0539 718 45 26', '', ''],
      ['levent', 'Levent Yıldız', '0532 913 70 48', 'info@modabutikotel.com', 'Otel sahibi. Odaları sırayla yeniliyor.'],
      ['tugba', 'Tuğba Aksoy', '0546 520 37 81', '', 'Moda Butik Otel resepsiyon şefi.'],
      ['onur', 'Onur Aksoy', '0533 286 14 95', '', ''],
      ['sevgi', 'Sevgi Tan', '0535 349 82 60', '', 'Kaya ailesinin komşusu, onlar yokken teslim alıyor.'],
    ];
    const pid = {};
    P.forEach(([k, name, phone, email, note]) => {
      const id = 'p_' + k;
      pid[k] = id;
      db.people.push({ id, name, phone, email, note, createdAt: at(-rint(200, 900)) });
    });

    /* Evler */
    const H = [
      { k: 'yilmaz', title: 'Yılmaz Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Kadıköy', hood: 'Caddebostan', street: 'Bağdat Cad. No:312', unit: 'Kat 4 · D:8', color: '#1e5b55', notes: 'Kapı kodu 4512. Asansör var. Salon tavanı alçı, ray montajında dübel dikkat.', tags: ['VIP', 'Düzenli'], m: [['ahmet', 'Ev Sahibi', 1, 1], ['elif', 'Eş', 1, 0], ['can', 'Çocuk', 1, 0], ['fatma', 'Yardımcı', 1, 0], ['recep', 'Kapıcı', 1, 0]] },
      { k: 'yilmazyazlik', title: 'Yılmaz Yazlık', type: 'Yazlık', layout: 'yazlik', city: 'Muğla', district: 'Bodrum', hood: 'Yalıkavak', street: 'Gökçebel Mah. Deniz Sitesi', unit: 'Villa 7', color: '#c8743f', notes: 'Deniz havası; UV dayanımlı kumaş tercih edildi. Anahtar site görevlisinde.', tags: ['Sezonluk'], m: [['ahmet', 'Ev Sahibi', 1, 1], ['elif', 'Eş', 1, 0], ['huseyinb', 'Site Görevlisi', 1, 0]] },
      { k: 'yilmazofis', title: 'Yılmaz Mimarlık Ofisi', type: 'Ofis', layout: 'ofis', city: 'İstanbul', district: 'Ataşehir', hood: 'Atatürk Mah.', street: 'Ataşehir Bulvarı, Ofis Plaza', unit: 'Kat 12 · No:1204', color: '#3b5b8c', notes: 'Fatura şirket adına. Montaj mesai saatinde (09:00–18:00).', tags: ['Kurumsal', 'Faturalı'], m: [['ahmet', 'Yetkili', 1, 1], ['zeynep', 'Çalışan', 1, 0]] },
      { k: 'kaya', title: 'Kaya Ailesi', type: 'Müstakil', layout: 'mustakil', city: 'İstanbul', district: 'Üsküdar', hood: 'Kuzguncuk', street: 'İcadiye Cad. No:41', unit: 'Müstakil · 3 kat', color: '#7a4e8c', notes: 'Eski ahşap ev, tavan yüksekliği 300 cm. Ahşap pervaza korniş monte edildi.', tags: [], m: [['murat', 'Ev Sahibi', 1, 1], ['ayse', 'Eş', 1, 0], ['selin', 'Çocuk', 0, 0], ['sevgi', 'Komşu', 1, 0]] },
      { k: 'mimoza', title: 'Mimoza Sitesi B-14', type: 'Daire', layout: '2+1', city: 'İstanbul', district: 'Ataşehir', hood: 'Barbaros Mah.', street: 'Mimoza Sitesi B Blok', unit: 'Kat 7 · D:14', color: '#2f6b4f', notes: 'Kiralık. Ücret ev sahibi Serkan Demir\'e faturalanır, teslimatı kiracı alır.', tags: ['Kiralık'], m: [['serkan', 'Ev Sahibi', 1, 1], ['burak', 'Kiracı', 1, 0], ['deniz', 'Kiracı', 1, 0]] },
      { k: 'baglarbasi', title: 'Bağlarbaşı Dairesi', type: 'Daire', layout: '1+1', city: 'İstanbul', district: 'Maltepe', hood: 'Bağlarbaşı', street: 'Gülsuyu Sok. No:9', unit: 'Kat 2 · D:5', color: '#5b7a3a', notes: 'Kiralık. Ekonomik seri kumaş tercih ediliyor.', tags: ['Kiralık'], m: [['serkan', 'Ev Sahibi', 1, 1], ['gizem', 'Kiracı', 1, 0], ['hakan', 'Akraba', 1, 0]] },
      { k: 'demirvilla', title: 'Demir Villası', type: 'Villa', layout: 'villa', city: 'İstanbul', district: 'Beykoz', hood: 'Kavacık', street: 'Orman Sok. No:3', unit: 'Villa', color: '#8c3b3b', notes: 'Güvenlik girişinde isim verilmeli. Kış bahçesi plise perdeleri özel ölçü.', tags: ['VIP'], m: [['serkan', 'Ev Sahibi', 1, 1], ['nermin', 'Eş', 1, 0], ['ozan', 'Çocuk', 1, 0], ['gulsum', 'Yardımcı', 1, 0]] },
      { k: 'arslan', title: 'Arslan Ailesi', type: 'Daire', layout: '4+1', city: 'İstanbul', district: 'Beşiktaş', hood: 'Levent', street: 'Çarşı Cad. Lale Apt. No:18', unit: 'Kat 5 · D:10', color: '#a0527a', notes: 'Yeni taşındılar, salon ve yemek odası için ölçü alınacak.', tags: [], m: [['kerem', 'Ev Sahibi', 1, 1], ['zeynep', 'Eş', 1, 0]] },
      { k: 'klinik', title: 'Dr. Selim Çelik Muayenehanesi', type: 'Klinik', layout: 'klinik', city: 'İstanbul', district: 'Şişli', hood: 'Nişantaşı', street: 'Valikonağı Cad. No:77', unit: 'Kat 2', color: '#2a6f97', notes: 'Silinebilir, antibakteriyel kumaş istendi. Pazar kapalı.', tags: ['Kurumsal', 'Hijyen'], m: [['selim', 'Yetkili', 1, 1], ['asli', 'Çalışan', 1, 0]] },
      { k: 'celik', title: 'Çelik Ailesi', type: 'Villa', layout: 'villa', city: 'İstanbul', district: 'Sarıyer', hood: 'Tarabya', street: 'Boğaz Evleri No:12', unit: 'Villa', color: '#245c73', notes: 'Deniz cephesi; tüller boydan, kurşun etekli.', tags: ['VIP'], m: [['selim', 'Ev Sahibi', 1, 1], ['nur', 'Eş', 1, 0], ['gulsum', 'Yardımcı', 1, 0]] },
      { k: 'koc3', title: 'Gül Apt. D:3 · Aslı Koç', type: 'Daire', layout: '2+1', city: 'İstanbul', district: 'Bakırköy', hood: 'Yeşilköy', street: 'İstasyon Cad. Gül Apt. No:22', unit: 'Kat 1 · D:3', color: '#9c6b30', notes: 'Aynı binada D:5 ailesinin dairesi.', tags: [], m: [['asli', 'Ev Sahibi', 1, 1], ['mehmetk', 'Ebeveyn', 1, 0], ['ali', 'Kapıcı', 1, 0]] },
      { k: 'koc5', title: 'Gül Apt. D:5 · Koç Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Bakırköy', hood: 'Yeşilköy', street: 'İstasyon Cad. Gül Apt. No:22', unit: 'Kat 2 · D:5', color: '#b5863f', notes: 'Mehmet Bey nakit ödemeyi tercih ediyor.', tags: [], m: [['mehmetk', 'Ev Sahibi', 1, 1], ['hatice', 'Eş', 1, 0], ['asli', 'Çocuk', 1, 0], ['ali', 'Kapıcı', 1, 0]] },
      { k: 'modakafe', title: 'Moda Kafe & Bistro', type: 'İşyeri', layout: 'kafe', city: 'İstanbul', district: 'Kadıköy', hood: 'Moda', street: 'Moda Cad. No:145', unit: 'Zemin kat', color: '#6b4f3a', notes: 'Teras için dış mekan kumaşı. Montaj sabah 10:00 öncesi.', tags: ['Kurumsal', 'Faturalı'], m: [['emre', 'Yetkili', 1, 1], ['cem', 'Çalışan', 1, 0]] },
      { k: 'polat', title: 'Polat Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Maltepe', hood: 'İdealtepe', street: 'Rıfkı Tongsir Cad. Deniz Apt. No:30', unit: 'Kat 3 · D:7', color: '#3d6b8c', notes: '', tags: [], m: [['cem', 'Ev Sahibi', 1, 1], ['ebru', 'Eş', 1, 0], ['kaan', 'Çocuk', 0, 0], ['saadet', 'Akraba', 1, 0]] },
      { k: 'aydin', title: 'Aydın Ailesi', type: 'Daire', layout: '2+1', city: 'İstanbul', district: 'Kartal', hood: 'Kordonboyu', street: 'Ankara Cad. Sahil Konutları A-6', unit: 'Kat 6 · D:24', color: '#4a7c6f', notes: '', tags: [], m: [['hakan', 'Ev Sahibi', 1, 1], ['merve', 'Eş', 1, 0], ['gizem', 'Kardeş', 1, 0]] },
      { k: 'erdem', title: 'Erdem Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Üsküdar', hood: 'Acıbadem', street: 'Tekin Sok. Acıbadem Evleri No:4', unit: 'Kat 8 · D:31', color: '#7c5c9c', notes: '', tags: ['Düzenli'], m: [['tolga', 'Ev Sahibi', 1, 1], ['pinar', 'Eş', 1, 0]] },
      { k: 'alacati', title: 'Erdem Alaçatı Evi', type: 'Yazlık', layout: 'yazlik', city: 'İzmir', district: 'Çeşme', hood: 'Alaçatı', street: 'Kemalpaşa Cad. Taş Evler No:8', unit: 'Müstakil', color: '#c99a3b', notes: 'Perdeler kargo ile gidiyor, montajı yerel usta yapıyor.', tags: ['Sezonluk'], m: [['tolga', 'Ev Sahibi', 1, 1], ['pinar', 'Eş', 1, 0], ['ismail', 'Site Görevlisi', 1, 0]] },
      { k: 'gunes', title: 'Güneş Dubleksi', type: 'Dubleks', layout: '4+1', city: 'İstanbul', district: 'Bakırköy', hood: 'Ataköy 7-8. Kısım', street: 'Ataköy Konakları C Blok', unit: 'Kat 11-12 · D:46', color: '#d08c2c', notes: 'Oya Hanım yalnız yaşıyor. Montaj günü Barış Bey veya Fatma Hanım evde oluyor.', tags: ['VIP'], m: [['oya', 'Ev Sahibi', 1, 1], ['baris', 'Çocuk', 1, 0], ['fatma', 'Yardımcı', 1, 0]] },
      { k: 'etiler', title: 'Barış Güneş · Etiler', type: 'Daire', layout: '1+1', city: 'İstanbul', district: 'Beşiktaş', hood: 'Etiler', street: 'Nispetiye Cad. No:58', unit: 'Kat 3 · D:6', color: '#565f8c', notes: '', tags: [], m: [['baris', 'Ev Sahibi', 1, 1]] },
      { k: 'kurt', title: 'Kurt Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Ataşehir', hood: 'İçerenköy', street: 'Kayışdağı Cad. Yeşil Vadi Sitesi', unit: 'Kat 4 · D:12', color: '#3f7d5a', notes: '', tags: [], m: [['volkan', 'Ev Sahibi', 1, 1], ['sibel', 'Eş', 1, 0]] },
      { k: 'otel', title: 'Moda Butik Otel', type: 'Otel', layout: 'otel', city: 'İstanbul', district: 'Kadıköy', hood: 'Moda', street: 'Şair Nefi Sok. No:12', unit: 'Bina', color: '#8c2f4b', notes: 'Odalar sırayla yenileniyor. Tüm odalarda karartma zorunlu.', tags: ['Kurumsal', 'VIP', 'Faturalı'], m: [['levent', 'Yetkili', 1, 1], ['tugba', 'Çalışan', 1, 0]] },
      { k: 'aksoy', title: 'Aksoy Ailesi', type: 'Daire', layout: '2+1', city: 'İstanbul', district: 'Kadıköy', hood: 'Fenerbahçe', street: 'Kalamış Cad. No:66', unit: 'Kat 2 · D:4', color: '#4f6d8c', notes: '', tags: [], m: [['tugba', 'Ev Sahibi', 1, 1], ['onur', 'Eş', 1, 0]] },
    ];

    const LAYOUTS = {
      '1+1': [['Salon'], ['Yatak Odası'], ['Mutfak']],
      '2+1': [['Salon'], ['Yatak Odası'], ['Çocuk Odası'], ['Mutfak']],
      '3+1': [['Salon'], ['Ebeveyn Yatak Odası', 'Yatak Odası'], ['Çocuk Odası'], ['Çalışma Odası'], ['Mutfak']],
      '4+1': [['Salon'], ['Yemek Odası'], ['Ebeveyn Yatak Odası', 'Yatak Odası'], ['Çocuk Odası'], ['Genç Odası', 'Çocuk Odası'], ['Misafir Odası'], ['Mutfak']],
      'villa': [['Salon'], ['Yemek Odası'], ['Ebeveyn Yatak Odası', 'Yatak Odası'], ['Çocuk Odası'], ['Misafir Odası'], ['Çalışma Odası'], ['Mutfak'], ['Kış Bahçesi']],
      'mustakil': [['Salon'], ['Yatak Odası'], ['Çocuk Odası'], ['Çalışma Odası'], ['Mutfak'], ['Çatı Katı', 'Misafir Odası']],
      'yazlik': [['Salon'], ['Yatak Odası'], ['Misafir Odası'], ['Mutfak'], ['Veranda', 'Teras']],
      'ofis': [['Yönetici Odası', 'Ofis'], ['Toplantı Odası'], ['Açık Ofis', 'Ofis'], ['Bekleme Alanı']],
      'klinik': [['Muayene Odası', 'Ofis'], ['Doktor Odası', 'Ofis'], ['Bekleme Salonu', 'Bekleme Alanı']],
      'kafe': [['Ana Salon', 'Salon'], ['Teras'], ['Özel Bölüm', 'Salon']],
      'otel': [['Lobi'], ['Kahvaltı Salonu', 'Yemek Odası'], ['Oda 101', 'Otel Odası'], ['Oda 102', 'Otel Odası'], ['Oda 103', 'Otel Odası'], ['Oda 201', 'Otel Odası'], ['Oda 202', 'Otel Odası'], ['Oda 203', 'Otel Odası'], ['Suit 301', 'Otel Odası']],
    };

    const sunny = ['Güney', 'Güneybatı', 'Güneydoğu', 'Batı', 'Doğu'];
    const FT = {
      'Salon': () => [
        { name: 'Balkon Cephesi', opening: 'Balkon Kapısı + Pencere', width: rint(34, 46) * 10, height: rint(25, 27) * 10, direction: pick(sunny) },
        ...(chance(0.75) ? [{ name: 'Yan Pencere', opening: pick(['Pencere', 'Pencere', 'Köşe Pencere']), width: rint(16, 24) * 10, height: rint(245, 265), direction: pick(C.DIRECTIONS) }] : []),
      ],
      'Yemek Odası': () => [{ name: 'Pencere Cephesi', opening: pick(['Pencere', 'Fransız Balkon']), width: rint(22, 30) * 10, height: rint(250, 265), direction: pick(C.DIRECTIONS) }],
      'Yatak Odası': () => [{ name: 'Ana Pencere', opening: pick(['Pencere', 'Fransız Balkon', 'Balkon Kapısı']), width: rint(18, 26) * 10, height: rint(245, 265), direction: pick(C.DIRECTIONS) }],
      'Çocuk Odası': () => [{ name: 'Pencere', opening: 'Pencere', width: rint(15, 21) * 10, height: rint(245, 260), direction: pick(C.DIRECTIONS) }],
      'Mutfak': () => [{ name: 'Mutfak Penceresi', opening: 'Pencere', width: rint(11, 17) * 10, height: rint(12, 16) * 10, direction: pick(C.DIRECTIONS), short: true }],
      'Çalışma Odası': () => [{ name: 'Pencere', opening: 'Pencere', width: rint(14, 20) * 10, height: rint(245, 260), direction: pick(C.DIRECTIONS) }],
      'Misafir Odası': () => [{ name: 'Pencere', opening: pick(['Pencere', 'Çatı Penceresi']), width: rint(15, 21) * 10, height: rint(240, 255), direction: pick(C.DIRECTIONS) }],
      'Kış Bahçesi': () => [{ name: 'Bahçe Cephesi', opening: 'Cam Cephe', width: rint(42, 56) * 10, height: rint(240, 260), direction: 'Güney' }, { name: 'Yan Cam', opening: 'Sürme Kapı', width: rint(26, 32) * 10, height: rint(240, 255), direction: 'Batı' }],
      'Teras': () => [{ name: 'Teras Cephesi', opening: 'Sürme Kapı', width: rint(38, 52) * 10, height: rint(240, 260), direction: pick(sunny) }],
      'Ofis': () => [{ name: 'Cam Cephe', opening: 'Cam Cephe', width: rint(32, 52) * 10, height: rint(260, 280), direction: pick(C.DIRECTIONS) }],
      'Toplantı Odası': () => [{ name: 'Cam Cephe', opening: 'Cam Cephe', width: rint(36, 48) * 10, height: rint(260, 280), direction: pick(C.DIRECTIONS) }],
      'Bekleme Alanı': () => [{ name: 'Vitrin Cephesi', opening: 'Cam Cephe', width: rint(30, 42) * 10, height: rint(250, 270), direction: pick(C.DIRECTIONS) }],
      'Otel Odası': () => [{ name: 'Balkon Cephesi', opening: pick(['Balkon Kapısı', 'Fransız Balkon']), width: rint(18, 24) * 10, height: rint(250, 265), direction: pick(sunny) }],
      'Lobi': () => [{ name: 'Giriş Cephesi', opening: 'Cam Cephe', width: rint(40, 52) * 10, height: rint(280, 300), direction: 'Kuzey' }, { name: 'Yan Pencere', opening: 'Pencere', width: rint(18, 22) * 10, height: rint(270, 290), direction: 'Doğu' }],
    };

    const sheerColors = ['Beyaz', 'Kırık Beyaz', 'Kırık Beyaz', 'Krem', 'Şampanya', 'Taş Grisi'];
    const drapeColors = ['Vizon', 'Antrasit', 'Lacivert', 'Petrol Mavisi', 'Zümrüt', 'Bordo', 'Hardal', 'Taba', 'Bej', 'Füme', 'Adaçayı', 'Gül Kurusu', 'Toprak', 'Mürdüm'];
    const flatColors = ['Kırık Beyaz', 'Krem', 'Bej', 'Taş Grisi', 'Füme', 'Antrasit', 'Vizon'];
    const kidColors = ['Gök Mavisi', 'Pudra', 'Adaçayı', 'Hardal', 'Krem'];

    const mk = (type, f, o = {}) => {
      const T = C.CURTAIN_TYPES[type];
      const fabric = o.fabric || pick(T.fabrics);
      const colorName = o.color || pick(T.flat ? flatColors : (type === 'Tül' || type === 'Kruvaze' ? sheerColors : drapeColors));
      let mount = o.mount;
      if (!mount) {
        if (T.flat) mount = type === 'Jaluzi' || type === 'Dikey' ? 'Lamel Mekanizması' : pick(['Zincirli Mekanizma', 'Zincirli Mekanizma', 'Yaylı Mekanizma', 'Motorlu Mekanizma']);
        else mount = pick(['Ray', 'Ray', 'Korniş', 'Rustik Boru', 'Tavan Rayı']);
      }
      const width = T.flat ? Math.max(60, Math.round((f.width - (f.opening === 'Balkon Kapısı + Pencere' ? 0 : 10)) / 5) * 5) : f.width + rint(0, 2) * 10;
      const height = f.short ? f.height + rint(1, 3) * 10 : (T.flat ? Math.round(f.height * (f.opening === 'Pencere' ? 0.62 : 0.92) / 5) * 5 : f.height - rint(1, 3));
      return {
        type, fabric, colorName, color: C.colorHex(colorName),
        width, height,
        pleat: T.flat ? 1 : (o.pleat || pick(T.pleats)),
        panels: o.panels || (type === 'Fon' || type === 'Blackout' ? 2 : (type === 'Kruvaze' ? 2 : (T.flat ? 1 : (f.width > 300 ? 2 : 1)))),
        mount,
        hook: T.flat ? 'Mekanizma' : (o.hook || (type === 'Tül' ? pick(['Kanca', 'Kurşun Etek', 'Kanca']) : pick(['Kanca', 'Halka', 'Kuşgözü', 'Pense']))),
        lining: T.flat ? 'Astarsız' : (type === 'Blackout' ? 'Blackout Astar' : (type === 'Fon' ? pick(['Astarlı', 'Astarlı', 'Astarsız', 'Termal Astar']) : 'Astarsız')),
        care: T.care,
        condition: 'Yeni',
        notes: o.notes || '',
      };
    };

    const curtainsFor = (rtype, f) => {
      switch (rtype) {
        case 'Salon': case 'Lobi': return chance(0.12) ? [mk('Kruvaze', f), mk('Fon', f)] : [mk('Tül', f, { pleat: 3 }), mk('Fon', f)];
        case 'Yemek Odası': return [mk(chance(0.3) ? 'Kruvaze' : 'Tül', f), mk('Fon', f)];
        case 'Yatak Odası': case 'Otel Odası': return chance(0.65) ? [mk('Tül', f), mk('Blackout', f)] : [mk('Tül', f), mk('Stor', f, { fabric: 'Blackout Stor' })];
        case 'Çocuk Odası': return chance(0.5) ? [mk('Zebra', f, { color: pick(kidColors) })] : [mk('Tül', f), mk('Fon', f, { fabric: 'Pamuklu', color: pick(kidColors) })];
        case 'Mutfak': {
          const t = pick(['Stor', 'Zebra', 'Jaluzi', 'Plise', 'Tül']);
          return [mk(t, f, t === 'Tül' ? { pleat: 2.5, hook: 'Kanca', mount: 'Korniş' } : {})];
        }
        case 'Çalışma Odası': return [mk(pick(['Zebra', 'Jaluzi', 'Stor']), f)];
        case 'Misafir Odası': return [mk('Tül', f), mk('Fon', f)];
        case 'Kış Bahçesi': return [mk('Plise', f)];
        case 'Teras': return [mk('Fon', f, { fabric: 'Keten', notes: 'Dış mekan (outdoor) kumaş, UV dayanımlı.' })];
        case 'Ofis': case 'Toplantı Odası': case 'Bekleme Alanı': return [mk(pick(['Dikey', 'Stor', 'Jaluzi', 'Zebra']), f)];
        default: return [mk('Tül', f)];
      }
    };

    const hid = {};
    const houseRooms = {};
    H.forEach((h) => {
      const id = 'h_' + h.k;
      hid[h.k] = id;
      db.counters.house++;
      db.houses.push({
        id, code: 'EV-' + db.counters.house, title: h.title, type: h.type, layout: h.layout,
        city: h.city, district: h.district, neighborhood: h.hood, street: h.street, unit: h.unit,
        color: h.color, notes: h.notes, tags: h.tags, createdAt: null,
        members: h.m.map(([pk, role, can, prim]) => ({ personId: pid[pk], role, canPickup: !!can, isPrimary: !!prim })),
      });
      houseRooms[id] = [];
      (LAYOUTS[h.layout] || LAYOUTS['2+1']).forEach(([rname, rtype], ri) => {
        const type = rtype || rname;
        const room = { id: `r_${h.k}_${ri}`, houseId: id, name: rname, type, order: ri, notes: '' };
        if (type === 'Kış Bahçesi') room.notes = 'Cam tavan; yazın aşırı ısınıyor, plise önerildi.';
        if (rname === 'Salon' && h.k === 'yilmaz') room.notes = 'Piyano pencere önünde, montajda dikkat.';
        db.rooms.push(room);
        houseRooms[id].push(room);
        (FT[type] || FT['Çocuk Odası'])().forEach((f, fi) => {
          const fac = { id: `f_${h.k}_${ri}_${fi}`, roomId: room.id, name: f.name, opening: f.opening, direction: f.direction, width: f.width, height: h.k === 'kaya' && !f.short ? f.height + 40 : f.height, short: !!f.short, notes: '' };
          db.facades.push(fac);
          curtainsFor(type, fac).forEach((c) => {
            db.counters.curtain++;
            db.curtains.push({ id: 'c_' + db.counters.curtain, code: 'PR-' + db.counters.curtain, facadeId: fac.id, installedAt: null, ...c });
          });
          delete fac.short;
        });
      });
    });

    /* Yardımcılar */
    const facOf = Object.fromEntries(db.facades.map(f => [f.id, f]));
    const houseObj = (id) => db.houses.find(h => h.id === id);
    const authorized = (houseId) => houseObj(houseId).members.filter(m => m.canPickup);
    const primary = (houseId) => houseObj(houseId).members.find(m => m.isPrimary) || houseObj(houseId).members[0];
    const personName = (id) => (db.people.find(p => p.id === id) || {}).name;
    const firstName = (id) => (personName(id) || '').replace('Dr. ', '').split(' ')[0];
    const curtainsOfRooms = (ids) => db.curtains.filter(c => ids.has(facOf[c.facadeId].roomId));
    const servicesOf = (c) => {
      const s = [];
      if (C.CURTAIN_TYPES[c.type].flat) { if (/Motorlu/.test(c.mount)) s.push('motor'); return s; }
      if (/Ray/.test(c.mount)) s.push('ray');
      if (/Korniş|Boru/.test(c.mount)) s.push('kornis');
      if (/Motorlu/.test(c.mount)) s.push('motor');
      if (c.lining === 'Astarlı' || c.lining === 'Termal Astar') s.push('astar');
      if (c.hook === 'Kurşun Etek') s.push('kursun');
      return s;
    };

    /* Sipariş taslakları: her perde tek bir satış siparişine aittir */
    // [ev, durum, odalar, ölçü yöntemi, teslim yöntemi, teslim günü (bugüne göre)]
    const ACTIVE_SEED = [
      ['yilmazyazlik', 'hazir', 'all', 'yerinde', 'dukkan', 0],
      ['gunes', 'hazir', ['Salon', 'Yemek Odası'], 'yerinde', 'montaj', -1],
      ['kaya', 'hazir', ['Salon'], 'kayitli', 'dukkan', 0],
      ['koc5', 'hazir', ['Salon', 'Ebeveyn Yatak Odası'], 'musteri', 'dukkan', -2],
      ['otel', 'uretim', ['Oda 101', 'Oda 102', 'Oda 103'], 'kayitli', 'montaj', 3],
      ['mimoza', 'uretim', 'all', 'yerinde', 'adres', 2],
      ['klinik', 'uretim', 'all', 'yerinde', 'montaj', 1],
      ['etiler', 'uretim', 'all', 'musteri', 'dukkan', 1],
      ['demirvilla', 'tedarik', ['Salon', 'Kış Bahçesi', 'Yemek Odası'], 'yerinde', 'montaj', 6],
      ['aydin', 'tedarik', ['Salon'], 'yerinde', 'dukkan', 5],
      ['polat', 'teklif', ['Salon', 'Ebeveyn Yatak Odası'], 'yerinde', 'montaj', 12],
      ['alacati', 'teklif', 'all', 'musteri', 'adres', 14],
      ['aksoy', 'teklif', ['Salon'], 'kayitli', 'dukkan', 10],
      ['modakafe', 'olcu', 'all', 'yerinde', 'montaj', 18],
      ['arslan', 'olcu', ['Salon', 'Yemek Odası'], 'yerinde', 'montaj', 16],
      ['kurt', 'olcu', ['Salon'], 'yerinde', 'montaj', 20],
    ];
    const activeByHouse = Object.fromEntries(ACTIVE_SEED.map(a => [a[0], a]));
    const heavy = { yilmaz: [3, 4], otel: [4, 5], celik: [3, 4], demirvilla: [3, 4], gunes: [3, 4], klinik: [2, 3], modakafe: [2, 3] };
    const drafts = [];
    H.forEach((h) => {
      const houseId = hid[h.k];
      const rooms = houseRooms[houseId];
      const act = activeByHouse[h.k];
      let activeIds = new Set();
      if (act) {
        const sel = act[2] === 'all' ? rooms : rooms.filter(r => act[2].includes(r.name));
        activeIds = new Set(sel.map(r => r.id));
        drafts.push({ houseId, status: act[1], roomIds: activeIds, measure: act[3], delivery: act[4], dueOff: act[5], active: true });
      }
      const rest = rooms.filter(r => !activeIds.has(r.id));
      if (!rest.length) return;
      const [a, b] = heavy[h.k] || [2, 3];
      const n = Math.max(1, Math.min(rest.length, rint(a, b)));
      const groups = Array.from({ length: n }, () => []);
      rest.forEach((r, i) => groups[Math.min(n - 1, Math.floor((i * n) / rest.length))].push(r));
      let off = -rint(330, 720);
      groups.forEach((g, gi) => {
        if (gi > 0) off = Math.min(-14, off + rint(60, Math.max(70, Math.round((-14 - off) / (n - gi)))));
        const cancelled = gi > 0 && gi === n - 1 && chance(0.22);
        drafts.push({ houseId, status: cancelled ? 'iptal' : 'teslim', roomIds: new Set(g.map(r => r.id)), measure: gi === 0 ? 'yerinde' : pick(['yerinde', 'kayitli', 'musteri']), delivery: pick(['montaj', 'montaj', 'montaj', 'dukkan', 'adres']), off, active: false });
      });
    });

    /* Zaman çizelgesi */
    const STEP_H = { teklif: [8, 40], tedarik: [20, 110], uretim: [48, 120], hazir: [40, 96], teslim: [4, 60] };
    drafts.forEach((d) => {
      const steps = d.measure === 'yerinde' ? C.FLOW : C.FLOW.slice(1);
      const target = d.status === 'iptal' ? 'teklif' : d.status;
      const reached = steps.slice(0, steps.indexOf(target) + 1);
      const times = {};
      if (d.active) {
        if (target === 'olcu') {
          times.olcu = at(Math.max(0, Math.min(3, d.dueOff - 17)), rint(10, 16), pick([0, 30]));
        } else {
          let t = new Date(nowMs - (target === 'hazir' ? rint(20, 70) : rint(3, 30)) * 3600e3).toISOString();
          for (let i = reached.length - 1; i >= 0; i--) {
            times[reached[i]] = t;
            if (i > 0) { const [lo, hi] = STEP_H[reached[i]]; t = addH(t, -rint(lo, hi)); }
          }
        }
      } else {
        let t = at(d.off, rint(10, 16), pick([0, 15, 30, 45]));
        reached.forEach((s, i) => { if (i > 0) { const [lo, hi] = STEP_H[s]; t = addH(t, rint(lo, hi)); } times[s] = t; });
        if (d.status === 'iptal') times.iptal = addH(t, rint(48, 240));
      }
      d.times = times;
      const first = times[reached[0]];
      d.createdAt = reached[0] === 'olcu' ? addH(first, -rint(24, 72)) : first;
      d.sortAt = d.createdAt;
      if (d.active) d.dueAt = at(d.dueOff, 17, 0);
      else d.dueAt = addH(times.tedarik || first, (rint(8, 13)) * 24);
    });
    drafts.sort((a, b) => (a.sortAt < b.sortAt ? -1 : 1));

    const recent = (iso) => new Date(iso) > new Date(today.getTime() - 75 * DAY);
    drafts.forEach((d) => {
      db.counters.order++;
      const house = houseObj(d.houseId);
      const curtains = curtainsOfRooms(d.roomIds);
      const items = curtains.map((c) => {
        const services = servicesOf(c);
        const basePrice = C.price(c, db.prices);
        const servicePrice = services.reduce((s, k) => s + C.servicePrice(k, c, db.prices), 0);
        return { curtainId: c.id, services, basePrice, servicePrice, price: basePrice + servicePrice };
      });
      const facadeCount = new Set(curtains.map(c => c.facadeId)).size;
      const sokum = d.delivery === 'montaj' && chance(0.35);
      const fees = [];
      if (d.delivery === 'adres') fees.push({ label: 'Adrese teslim', amount: db.prices.fees.adresTeslim });
      if (d.delivery === 'montaj') fees.push({ label: `Montaj (${facadeCount} cephe)`, amount: db.prices.fees.montaj * facadeCount });
      if (sokum) fees.push({ label: `Eski perde sökümü (${facadeCount} cephe)`, amount: db.prices.fees.sokum * facadeCount });
      const subtotal = items.reduce((s, i) => s + i.price, 0) + fees.reduce((s, f) => s + f.amount, 0);
      const vip = (house.tags || []).includes('VIP') || (house.tags || []).includes('Kurumsal');
      const discount = vip && chance(0.7) ? Math.round(subtotal * pick([0.05, 0.08, 0.1]) / 100) * 100 : (chance(0.25) ? Math.round(subtotal * 0.05 / 100) * 100 : 0);
      const total = subtotal - discount;
      const code = `SP-${String(db.counters.order).padStart(4, '0')}`;
      const prim = primary(d.houseId);
      const auth = authorized(d.houseId);
      const orderedBy = chance(0.65) ? prim.personId : pick(auth).personId;
      const order = {
        id: 'o_' + db.counters.order, code, houseId: d.houseId, status: d.status,
        items, fees, discount, total, payments: [], createdAt: clampNow(d.createdAt),
        measureMethod: d.measure, measureAt: d.times.olcu || null, dueAt: d.dueAt, deliveryMethod: d.delivery, sokum,
        deliveryCode: String(rint(1000, 9999)), notes: '', history: [], orderedBy,
        deliveredTo: null, deliveredToName: null, deliveredAt: null, readyAt: null, approvedAt: null, signature: null,
      };
      const T = d.times;
      const hist = (status, iso, note, by) => order.history.push({ status, at: clampNow(iso), note, by });
      if (d.measure === 'yerinde') hist('olcu', d.createdAt, `Ölçü randevusu oluşturuldu (${firstName(orderedBy)} ile görüşüldü).`, 'Kemal Usta');
      if (T.teklif) {
        const how = d.measure === 'yerinde' ? `Ölçüler alındı (${facadeCount} cephe). ` : d.measure === 'musteri' ? `${firstName(orderedBy)} ölçüleri getirdi. ` : 'Kayıtlı ölçüler kullanıldı. ';
        hist('teklif', T.teklif, `${how}${items.length} parça perde için ${U.money(total)} teklif verildi.`, 'Kemal Usta');
      }
      if (T.tedarik) {
        order.approvedAt = clampNow(T.tedarik);
        const dep = chance(0.88) ? Math.round(total * pick([0.3, 0.4, 0.5]) / 100) * 100 : 0;
        if (dep) order.payments.push({ at: order.approvedAt, amount: dep, method: pick(['Nakit', 'Kredi Kartı', 'Kredi Kartı', 'Havale/EFT']), note: 'Kapora' });
        hist('tedarik', T.tedarik, `Teklif ${personName(orderedBy)} tarafından onaylandı${dep ? `, ${U.money(dep)} kapora alındı` : ''}. Kumaşlar tedarikçiden istendi.`, 'Kemal Usta');
      }
      if (T.uretim) hist('uretim', T.uretim, 'Kumaşlar geldi, kesim ve dikime alındı.', pick(['Sevim (Dikim)', 'Derya (Dikim)']));
      if (T.hazir) {
        hist('hazir', T.hazir, `Dikim ve kalite kontrol tamamlandı, paketlendi. ${auth.length} yetkiliye SMS gönderildi.`, pick(['Sevim (Dikim)', 'Derya (Dikim)']));
        order.readyAt = clampNow(T.hazir);
      }
      if (d.status === 'teslim') {
        const t = addH(T.hazir, rint(STEP_H.teslim[0], STEP_H.teslim[1]));
        const rec = d.delivery === 'dukkan' ? pick(auth) : (chance(0.6) ? auth.find(m => m.personId === prim.personId) || pick(auth) : pick(auth));
        order.deliveredTo = rec.personId;
        order.deliveredToName = personName(rec.personId);
        order.deliveredAt = clampNow(t);
        const msg = d.delivery === 'dukkan' ? `${personName(rec.personId)} (${rec.role}) dükkandan teslim aldı. Teslim kodu doğrulandı.`
          : d.delivery === 'montaj' ? `${sokum ? 'Eski perdeler söküldü, ' : ''}montaj tamamlandı. ${personName(rec.personId)} (${rec.role}) teslim aldı.`
            : `Adrese teslim edildi, ${personName(rec.personId)} (${rec.role}) teslim aldı.`;
        hist('teslim', t, msg, d.delivery === 'dukkan' ? 'Kemal Usta' : 'Hüseyin (Montaj)');
        curtains.forEach((c) => {
          c.installedAt = order.deliveredAt;
          const age = (nowMs - new Date(c.installedAt).getTime()) / DAY;
          c.condition = age < 200 ? 'Çok İyi' : pick(['Çok İyi', 'İyi', 'İyi', 'İyi', ...(age > 500 ? ['Yıpranmış'] : [])]);
        });
        const paid = order.payments.reduce((s, p) => s + p.amount, 0);
        const rest = total - paid;
        const method = (house.tags || []).includes('Faturalı') ? pick(['Havale/EFT', 'Cari Hesap']) : pick(['Nakit', 'Kredi Kartı', 'Kredi Kartı', 'Havale/EFT']);
        const r = R();
        if (rest > 0) {
          if (r < 0.86) order.payments.push({ at: order.deliveredAt, amount: rest, method });
          else if (r < 0.95) order.payments.push({ at: order.deliveredAt, amount: Math.round(rest * 0.5 / 100) * 100, method });
        }
      }
      if (d.status === 'iptal') {
        hist('iptal', T.iptal, pick(['Müşteri fiyatı yüksek buldu, teklif kabul edilmedi.', 'Müşteri kararını erteledi.', 'Ev satıldı, sipariş iptal.']), 'Kemal Usta');
      }

      // Notlar
      const notes = {
        gunes: 'Montaj için Barış Bey ile saat teyit edilecek.',
        otel: '1. kat odaları. Kalan odalar bir sonraki partide.',
        klinik: 'Antibakteriyel, silinebilir kumaş. Montaj pazartesi sabah.',
        modakafe: 'Ölçü sabah 08:30\'da, kafe açılmadan önce.',
        yilmazyazlik: 'Ahmet Bey İstanbul\'a dönerken dükkandan alacak.',
        demirvilla: 'Kış bahçesi plise kumaşı İtalya\'dan geliyor (7–10 gün).',
        polat: 'Ebru Hanım iki renk arasında kararsız; numune kartela verildi.',
        arslan: 'Yeni taşındılar. Ray ve korniş de bizden.',
      };
      if (d.active) order.notes = notes[Object.keys(hid).find(k => hid[k] === d.houseId)] || '';
      db.orders.push(order);

      // SMS kayıtları (son 75 gün)
      const sms = (personId, iso, text, kind) => {
        const p = db.people.find(x => x.id === personId);
        if (!p || !p.phone || !recent(iso)) return;
        db.messages.push({ id: 'm_' + db.messages.length, personId, phone: p.phone, at: clampNow(iso), text, orderId: order.id, kind, status: 'İletildi' });
      };
      const sig = db.shop.smsSignature;
      const ds = (iso) => new Date(iso).toLocaleDateString('tr-TR');
      const ts = (iso) => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      if (order.measureAt) sms(prim.personId, d.createdAt, `Sayın ${personName(prim.personId)}, ${code} ölçü randevunuz ${ds(order.measureAt)} saat ${ts(order.measureAt)} olarak planlandı. ${sig}`, 'randevu');
      if (T.teklif) sms(orderedBy, T.teklif, `Sayın ${personName(orderedBy)}, ${code} nolu perde teklifiniz hazır: ${U.money(total)}. Detay: nazliperde.com/takip ${sig}`, 'teklif');
      if (T.tedarik) sms(prim.personId, T.tedarik, `${code}: Siparişiniz onaylandı, kumaşlarınız sipariş edildi. Tahmini teslim: ${ds(order.dueAt)}. ${sig}`, 'onay');
      if (T.hazir) {
        const names = auth.map(m => firstName(m.personId)).join(', ');
        auth.forEach((m) => sms(m.personId, T.hazir, d.delivery === 'dukkan'
          ? `${code} nolu perdeleriniz hazır. Teslim kodu: ${order.deliveryCode}. Evinizden ${names} dükkandan teslim alabilir. ${sig}`
          : `${code} nolu perdeleriniz hazır. ${d.delivery === 'montaj' ? 'Montaj' : 'Teslimat'} için sizi arayacağız. Teslim kodu: ${order.deliveryCode}. ${sig}`, 'hazir'));
      }
      if (order.deliveredAt) sms(prim.personId, order.deliveredAt, `${code} nolu perdeleriniz ${order.deliveredToName} tarafından teslim alındı. ${db.shop.warrantyYears} yıl garantilidir. Bizi tercih ettiğiniz için teşekkürler. ${sig}`, 'teslim');
    });

    // Ev kayıt tarihleri: ilk siparişten biraz önce
    db.houses.forEach((h) => {
      const first = db.orders.filter(o => o.houseId === h.id).map(o => o.createdAt).sort()[0];
      h.createdAt = first ? addH(first, -rint(2, 72)) : at(-rint(30, 300));
      db.events.push({ at: h.createdAt, type: 'house', text: `${h.title} kaydı oluşturuldu`, ref: '#/ev/' + h.id, icon: 'home' });
    });
    db.messages.sort((a, b) => (a.at < b.at ? 1 : -1));
    return db;
  };

  window.C = C;
})();
