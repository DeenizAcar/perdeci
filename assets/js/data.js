/* Perdeci — sabitler ve demo verisi üretici */
(function () {
  const C = {};

  C.CURTAIN_TYPES = {
    'Tül':      { flat: false, layer: 2, fabrics: ['Polyester Tül', 'Keten Görünümlü Tül', 'Vual', 'Organze', 'Bürümcük Tül'], pleats: [2.5, 3], care: '30° hassas yıkama, düşük devir sıkma', desc: 'Işık geçiren ince perde' },
    'Kruvaze':  { flat: false, layer: 2, fabrics: ['Vual', 'Polyester Tül', 'Organze'], pleats: [2.5], care: '30° hassas yıkama, askıda kurutma', desc: 'Çapraz bağlanan tül' },
    'Fon':      { flat: false, layer: 3, fabrics: ['Kadife', 'Keten', 'Şönil', 'Saten', 'Jakarlı', 'Pamuklu', 'Dimout'], pleats: [1.5, 2, 2.5], care: '30° hassas yıkama veya kuru temizleme', desc: 'Yanlarda duran dekoratif perde' },
    'Blackout': { flat: false, layer: 3, fabrics: ['3 Kat Blackout', 'Blackout Kadife', 'Blackout Keten Dokulu'], pleats: [2, 2.5], care: 'Elde yıkama, sıkmadan kurutma', desc: 'Işığı tamamen kesen karartma perdesi' },
    'Stor':     { flat: true, layer: 1, fabrics: ['Polyester Stor', 'Screen Stor', 'Blackout Stor', 'Keten Dokulu Stor'], pleats: [1], care: 'Ultrasonik temizlik', desc: 'Sarmal mekanizmalı düz perde' },
    'Zebra':    { flat: true, layer: 1, fabrics: ['Polyester Zebra', 'Bambu Zebra', 'Keten Zebra', 'Blackout Zebra'], pleats: [1], care: 'Ultrasonik temizlik', desc: 'Şeffaf/opak bantlı perde' },
    'Jaluzi':   { flat: true, layer: 1, fabrics: ['Alüminyum 25 mm', 'Ahşap 50 mm', 'PVC 35 mm'], pleats: [1], care: 'Kimyasal banyo + ultrasonik', desc: 'Yatay lamelli perde' },
    'Plise':    { flat: true, layer: 1, fabrics: ['Polyester Plise', 'Petek (Honeycomb)'], pleats: [1], care: 'Ultrasonik temizlik, düşük ısı', desc: 'Akordeon katlamalı perde' },
    'Dikey':    { flat: true, layer: 1, fabrics: ['Polyester Dikey 89 mm', 'PVC Dikey 127 mm'], pleats: [1], care: 'Ultrasonik temizlik', desc: 'Dikey lamelli ofis perdesi' },
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
    'Kuzey': 'Az güneş alır, solma riski düşük. Nem ve küf kontrolü önerilir.',
    'Kuzeydoğu': 'Sabah güneşi alır, solma riski düşük.',
    'Doğu': 'Sabah güneşi alır. Açık renk tül ve blackout iyi gider.',
    'Güneydoğu': 'Öğlene kadar yoğun güneş. Orta düzey solma riski.',
    'Güney': 'Gün boyu güneş alır. Solma riski yüksek, astarlı fon önerilir.',
    'Güneybatı': 'Öğleden sonra yoğun güneş. Solma riski yüksek.',
    'Batı': 'İkindi güneşi sıcak ve sert. Solma ve sararma riski yüksek.',
    'Kuzeybatı': 'Akşamüstü kısa süre güneş alır.',
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
  C.CONDITIONS = ['Çok İyi', 'İyi', 'Yıpranmış', 'Tamir Gerekli'];

  C.STATUSES = [
    { key: 'planlandi', label: 'Alım Planlandı', short: 'Planlandı', color: '#6d5bd0', icon: 'calendar', action: 'Teslim Alındı' },
    { key: 'atolyede',  label: 'Atölyede',       short: 'Atölyede',  color: '#2a78d6', icon: 'store',    action: 'Yıkamaya Al' },
    { key: 'yikamada',  label: 'Yıkamada',       short: 'Yıkamada',  color: '#0e8fa3', icon: 'droplets', action: 'Ütüye Al' },
    { key: 'utude',     label: 'Ütü & Bakım',    short: 'Ütüde',     color: '#c27a12', icon: 'sparkles', action: 'Hazır İşaretle' },
    { key: 'hazir',     label: 'Teslime Hazır',  short: 'Hazır',     color: '#13875a', icon: 'package',  action: 'Teslim Et' },
    { key: 'teslim',    label: 'Teslim Edildi',  short: 'Teslim',    color: '#6b7280', icon: 'check-circle' },
    { key: 'iptal',     label: 'İptal',          short: 'İptal',     color: '#c23b3b', icon: 'ban' },
  ];
  C.ST = Object.fromEntries(C.STATUSES.map(s => [s.key, s]));
  C.FLOW = ['planlandi', 'atolyede', 'yikamada', 'utude', 'hazir', 'teslim'];
  C.ACTIVE = ['planlandi', 'atolyede', 'yikamada', 'utude', 'hazir'];

  C.SERVICES = {
    tamir: 'Dikiş / Tamir', kisaltma: 'Boy Kısaltma', kursun: 'Kurşun Değişimi', astar: 'Astar Yenileme', leke: 'Özel Leke Çıkarma',
  };
  C.PICKUP = { dukkan: 'Müşteri dükkana getirdi', adres: 'Adresten alım', sokum: 'Söküm + adresten alım' };
  C.DELIVERY = { dukkan: 'Dükkandan teslim', adres: 'Adrese teslim', montaj: 'Adrese teslim + montaj' };
  C.PAYMENT = ['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Cari Hesap'];
  C.STAFF = ['Kemal Usta', 'Hüseyin (Şoför)', 'Sinan (Yıkama)', 'Derya (Ütü)'];

  C.DEFAULT_PRICES = {
    types: { 'Tül': 55, 'Kruvaze': 60, 'Fon': 85, 'Blackout': 95, 'Stor': 140, 'Zebra': 150, 'Jaluzi': 120, 'Plise': 165, 'Dikey': 110 },
    services: { tamir: 180, kisaltma: 240, kursun: 150, astar: 450, leke: 200 },
    fees: { adresAlim: 150, sokum: 200, adresTeslim: 150, montaj: 200 },
    minOrder: 400,
  };

  // Kumaş alanı (m²): pileli perdelerde ray eni × pile, düz perdelerde sadece ölçü
  C.area = (c) => {
    const t = C.CURTAIN_TYPES[c.type] || { flat: true };
    const pleat = t.flat ? 1 : (Number(c.pleat) || 1);
    return (Number(c.width) / 100) * (Number(c.height) / 100) * pleat;
  };
  C.washPrice = (c, prices) => {
    const rate = (prices || C.DEFAULT_PRICES).types[c.type] || 80;
    return Math.max(5, Math.round((C.area(c) * rate) / 5) * 5);
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
    const R = mulberry32(20261031);
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
    const nowIso = new Date().toISOString();
    const clampNow = (iso) => (iso > nowIso ? new Date(Date.now() - rint(5, 90) * 60e3).toISOString() : iso);

    const db = {
      version: 3,
      createdAt: nowIso,
      shop: {
        name: 'Nazlı Perde Yıkama & Dekorasyon',
        owner: 'Kemal Yıldırım',
        ownerShort: 'Kemal Usta',
        phone: '0216 418 27 50',
        whatsapp: '0532 418 27 50',
        email: 'iletisim@nazliperde.com',
        address: 'Caferağa Mah. Moda Cad. No:84, Kadıköy / İstanbul',
        hours: 'Pzt–Cmt 08:30–19:30',
        taxNo: '6310482915',
        smsSignature: 'Nazlı Perde',
      },
      prices: JSON.parse(JSON.stringify(C.DEFAULT_PRICES)),
      people: [], houses: [], rooms: [], facades: [], curtains: [], orders: [], messages: [], events: [],
      counters: { house: 100, curtain: 1000, order: 0 },
    };

    /* Kişiler */
    const P = [
      ['ahmet', 'Ahmet Yılmaz', '0532 418 72 15', 'ahmet.yilmaz@mail.com', 'Sürekli müşteri. Perdeleri yılda 2 kez yıkatıyor, Bodrum yazlığı ve ofisi de bizde.'],
      ['elif', 'Elif Yılmaz', '0533 207 44 81', 'elif.yilmaz@mail.com', ''],
      ['can', 'Can Yılmaz', '0544 912 30 06', '', 'Üniversite öğrencisi, teslim alabilir.'],
      ['fatma', 'Fatma Demir', '0535 661 09 27', '', 'Yılmaz ailesinde ve Oya Hanım\'da yardımcı olarak çalışıyor.'],
      ['recep', 'Recep Kaya', '0542 380 55 12', '', 'Bağdat Cad. 312 apartman görevlisi.'],
      ['huseyinb', 'Hüseyin Er', '0536 774 21 90', '', 'Yalıkavak Deniz Sitesi görevlisi, anahtar kendisinde.'],
      ['zeynep', 'Zeynep Arslan', '0532 745 63 08', 'zeynep.arslan@mail.com', 'Yılmaz Mimarlık\'ta ofis müdürü.'],
      ['kerem', 'Kerem Arslan', '0530 118 92 47', '', ''],
      ['murat', 'Murat Kaya', '0541 236 70 54', 'murat.kaya@mail.com', ''],
      ['ayse', 'Ayşe Kaya', '0543 559 18 33', '', ''],
      ['selin', 'Selin Kaya', '', '', '12 yaşında, teslim yetkisi yok.'],
      ['serkan', 'Serkan Demir', '0532 990 14 62', 'serkan.demir@mail.com', '3 evi var, ikisini kiraya veriyor. Kiralık evlerin ücreti kendisine faturalanır.'],
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
      ['levent', 'Levent Yıldız', '0532 913 70 48', 'info@modabutikotel.com', 'Otel sahibi. Üç ayda bir tüm perdeler yıkanıyor.'],
      ['tugba', 'Tuğba Aksoy', '0546 520 37 81', '', 'Moda Butik Otel resepsiyon şefi.'],
      ['onur', 'Onur Aksoy', '0533 286 14 95', '', ''],
      ['sevgi', 'Sevgi Tan', '0535 349 82 60', '', 'Kaya ailesinin komşusu, onlar yokken teslim alıyor.'],
    ];
    const pid = {};
    P.forEach(([k, name, phone, email, note], i) => {
      const id = 'p_' + k;
      pid[k] = id;
      db.people.push({ id, name, phone, email, note, createdAt: at(-rint(200, 900)) });
    });

    /* Evler */
    const H = [
      { k: 'yilmaz', title: 'Yılmaz Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Kadıköy', hood: 'Caddebostan', street: 'Bağdat Cad. No:312', unit: 'Kat 4 · D:8', color: '#1e5b55', notes: 'Kapı kodu 4512. Asansör var. Salon kornişi hassas, montajda dikkat.', tags: ['VIP', 'Düzenli'], m: [['ahmet', 'Ev Sahibi', 1, 1], ['elif', 'Eş', 1, 0], ['can', 'Çocuk', 1, 0], ['fatma', 'Yardımcı', 1, 0], ['recep', 'Kapıcı', 1, 0]] },
      { k: 'yilmazyazlik', title: 'Yılmaz Yazlık', type: 'Yazlık', layout: 'yazlik', city: 'Muğla', district: 'Bodrum', hood: 'Yalıkavak', street: 'Gökçebel Mah. Deniz Sitesi', unit: 'Villa 7', color: '#c8743f', notes: 'Sezon kapanışında (Ekim) toplu yıkama. Anahtar site görevlisinde.', tags: ['Sezonluk'], m: [['ahmet', 'Ev Sahibi', 1, 1], ['elif', 'Eş', 1, 0], ['huseyinb', 'Site Görevlisi', 1, 0]] },
      { k: 'yilmazofis', title: 'Yılmaz Mimarlık Ofisi', type: 'Ofis', layout: 'ofis', city: 'İstanbul', district: 'Ataşehir', hood: 'Atatürk Mah.', street: 'Ataşehir Bulvarı, Ofis Plaza', unit: 'Kat 12 · No:1204', color: '#3b5b8c', notes: 'Fatura şirket adına. Teslimat mesai saatinde (09:00–18:00).', tags: ['Kurumsal', 'Faturalı'], m: [['ahmet', 'Yetkili', 1, 1], ['zeynep', 'Çalışan', 1, 0]] },
      { k: 'kaya', title: 'Kaya Ailesi', type: 'Müstakil', layout: 'mustakil', city: 'İstanbul', district: 'Üsküdar', hood: 'Kuzguncuk', street: 'İcadiye Cad. No:41', unit: 'Müstakil · 3 kat', color: '#7a4e8c', notes: 'Eski ahşap ev, tavan yüksekliği 300 cm. Bahçe kapısından giriş.', tags: [], m: [['murat', 'Ev Sahibi', 1, 1], ['ayse', 'Eş', 1, 0], ['selin', 'Çocuk', 0, 0], ['sevgi', 'Komşu', 1, 0]] },
      { k: 'mimoza', title: 'Mimoza Sitesi B-14', type: 'Daire', layout: '2+1', city: 'İstanbul', district: 'Ataşehir', hood: 'Barbaros Mah.', street: 'Mimoza Sitesi B Blok', unit: 'Kat 7 · D:14', color: '#2f6b4f', notes: 'Kiralık. Ücret ev sahibi Serkan Demir\'e faturalanır, teslimatı kiracı alır.', tags: ['Kiralık'], m: [['serkan', 'Ev Sahibi', 1, 1], ['burak', 'Kiracı', 1, 0], ['deniz', 'Kiracı', 1, 0]] },
      { k: 'baglarbasi', title: 'Bağlarbaşı Dairesi', type: 'Daire', layout: '1+1', city: 'İstanbul', district: 'Maltepe', hood: 'Bağlarbaşı', street: 'Gülsuyu Sok. No:9', unit: 'Kat 2 · D:5', color: '#5b7a3a', notes: 'Kiralık. Kiracı değişiminde tüm perdeler yıkanır.', tags: ['Kiralık'], m: [['serkan', 'Ev Sahibi', 1, 1], ['gizem', 'Kiracı', 1, 0], ['hakan', 'Akraba', 1, 0]] },
      { k: 'demirvilla', title: 'Demir Villası', type: 'Villa', layout: 'villa', city: 'İstanbul', district: 'Beykoz', hood: 'Kavacık', street: 'Orman Sok. No:3', unit: 'Villa', color: '#8c3b3b', notes: 'Güvenlik girişinde isim verilmeli. Kış bahçesi plise perdeleri hassas.', tags: ['VIP'], m: [['serkan', 'Ev Sahibi', 1, 1], ['nermin', 'Eş', 1, 0], ['ozan', 'Çocuk', 1, 0], ['gulsum', 'Yardımcı', 1, 0]] },
      { k: 'arslan', title: 'Arslan Ailesi', type: 'Daire', layout: '4+1', city: 'İstanbul', district: 'Beşiktaş', hood: 'Levent', street: 'Çarşı Cad. Lale Apt. No:18', unit: 'Kat 5 · D:10', color: '#a0527a', notes: '', tags: [], m: [['kerem', 'Ev Sahibi', 1, 1], ['zeynep', 'Eş', 1, 0]] },
      { k: 'klinik', title: 'Dr. Selim Çelik Muayenehanesi', type: 'Klinik', layout: 'klinik', city: 'İstanbul', district: 'Şişli', hood: 'Nişantaşı', street: 'Valikonağı Cad. No:77', unit: 'Kat 2', color: '#2a6f97', notes: 'Hijyen gereği antibakteriyel yıkama. Pazar kapalı.', tags: ['Kurumsal', 'Hijyen'], m: [['selim', 'Yetkili', 1, 1], ['asli', 'Çalışan', 1, 0]] },
      { k: 'celik', title: 'Çelik Ailesi', type: 'Villa', layout: 'villa', city: 'İstanbul', district: 'Sarıyer', hood: 'Tarabya', street: 'Boğaz Evleri No:12', unit: 'Villa', color: '#245c73', notes: 'Deniz cephesi tuzlu hava alıyor, tüller sık yıkanmalı.', tags: ['VIP'], m: [['selim', 'Ev Sahibi', 1, 1], ['nur', 'Eş', 1, 0], ['gulsum', 'Yardımcı', 1, 0]] },
      { k: 'koc3', title: 'Gül Apt. D:3 · Aslı Koç', type: 'Daire', layout: '2+1', city: 'İstanbul', district: 'Bakırköy', hood: 'Yeşilköy', street: 'İstasyon Cad. Gül Apt. No:22', unit: 'Kat 1 · D:3', color: '#9c6b30', notes: 'Aynı binada D:5 ailesinin dairesi.', tags: [], m: [['asli', 'Ev Sahibi', 1, 1], ['mehmetk', 'Ebeveyn', 1, 0], ['ali', 'Kapıcı', 1, 0]] },
      { k: 'koc5', title: 'Gül Apt. D:5 · Koç Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Bakırköy', hood: 'Yeşilköy', street: 'İstasyon Cad. Gül Apt. No:22', unit: 'Kat 2 · D:5', color: '#b5863f', notes: 'Mehmet Bey nakit ödemeyi tercih ediyor.', tags: [], m: [['mehmetk', 'Ev Sahibi', 1, 1], ['hatice', 'Eş', 1, 0], ['asli', 'Çocuk', 1, 0], ['ali', 'Kapıcı', 1, 0]] },
      { k: 'modakafe', title: 'Moda Kafe & Bistro', type: 'İşyeri', layout: 'kafe', city: 'İstanbul', district: 'Kadıköy', hood: 'Moda', street: 'Moda Cad. No:145', unit: 'Zemin kat', color: '#6b4f3a', notes: 'Teras perdeleri dış mekan kumaşı. Teslimat sabah 10:00 öncesi.', tags: ['Kurumsal', 'Faturalı'], m: [['emre', 'Yetkili', 1, 1], ['cem', 'Çalışan', 1, 0]] },
      { k: 'polat', title: 'Polat Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Maltepe', hood: 'İdealtepe', street: 'Rıfkı Tongsir Cad. Deniz Apt. No:30', unit: 'Kat 3 · D:7', color: '#3d6b8c', notes: '', tags: [], m: [['cem', 'Ev Sahibi', 1, 1], ['ebru', 'Eş', 1, 0], ['kaan', 'Çocuk', 0, 0], ['saadet', 'Akraba', 1, 0]] },
      { k: 'aydin', title: 'Aydın Ailesi', type: 'Daire', layout: '2+1', city: 'İstanbul', district: 'Kartal', hood: 'Kordonboyu', street: 'Ankara Cad. Sahil Konutları A-6', unit: 'Kat 6 · D:24', color: '#4a7c6f', notes: '', tags: [], m: [['hakan', 'Ev Sahibi', 1, 1], ['merve', 'Eş', 1, 0], ['gizem', 'Kardeş', 1, 0]] },
      { k: 'erdem', title: 'Erdem Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Üsküdar', hood: 'Acıbadem', street: 'Tekin Sok. Acıbadem Evleri No:4', unit: 'Kat 8 · D:31', color: '#7c5c9c', notes: '', tags: ['Düzenli'], m: [['tolga', 'Ev Sahibi', 1, 1], ['pinar', 'Eş', 1, 0]] },
      { k: 'alacati', title: 'Erdem Alaçatı Evi', type: 'Yazlık', layout: 'yazlik', city: 'İzmir', district: 'Çeşme', hood: 'Alaçatı', street: 'Kemalpaşa Cad. Taş Evler No:8', unit: 'Müstakil', color: '#c99a3b', notes: 'Perdeler kargo ile gelip gidiyor; site görevlisi teslim ediyor.', tags: ['Sezonluk'], m: [['tolga', 'Ev Sahibi', 1, 1], ['pinar', 'Eş', 1, 0], ['ismail', 'Site Görevlisi', 1, 0]] },
      { k: 'gunes', title: 'Güneş Dubleksi', type: 'Dubleks', layout: '4+1', city: 'İstanbul', district: 'Bakırköy', hood: 'Ataköy 7-8. Kısım', street: 'Ataköy Konakları C Blok', unit: 'Kat 11-12 · D:46', color: '#d08c2c', notes: 'Oya Hanım yalnız yaşıyor. Teslimatı genelde Barış Bey veya Fatma Hanım alıyor.', tags: ['VIP'], m: [['oya', 'Ev Sahibi', 1, 1], ['baris', 'Çocuk', 1, 0], ['fatma', 'Yardımcı', 1, 0]] },
      { k: 'etiler', title: 'Barış Güneş · Etiler', type: 'Daire', layout: '1+1', city: 'İstanbul', district: 'Beşiktaş', hood: 'Etiler', street: 'Nispetiye Cad. No:58', unit: 'Kat 3 · D:6', color: '#565f8c', notes: '', tags: [], m: [['baris', 'Ev Sahibi', 1, 1]] },
      { k: 'kurt', title: 'Kurt Ailesi', type: 'Daire', layout: '3+1', city: 'İstanbul', district: 'Ataşehir', hood: 'İçerenköy', street: 'Kayışdağı Cad. Yeşil Vadi Sitesi', unit: 'Kat 4 · D:12', color: '#3f7d5a', notes: '', tags: [], m: [['volkan', 'Ev Sahibi', 1, 1], ['sibel', 'Eş', 1, 0]] },
      { k: 'otel', title: 'Moda Butik Otel', type: 'Otel', layout: 'otel', city: 'İstanbul', district: 'Kadıköy', hood: 'Moda', street: 'Şair Nefi Sok. No:12', unit: 'Bina', color: '#8c2f4b', notes: 'Odalar sırayla boşaltılır. Üç ayda bir tüm perdeler yıkanır.', tags: ['Kurumsal', 'VIP', 'Faturalı'], m: [['levent', 'Yetkili', 1, 1], ['tugba', 'Çalışan', 1, 0]] },
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
        condition: pick(['Çok İyi', 'İyi', 'İyi', 'İyi', 'Yıpranmış', ...(chance(0.15) ? ['Tamir Gerekli'] : [])]),
        purchasedAt: at(-rint(200, 1600)),
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
        case 'Ofis': case 'Toplantı Odası': case 'Bekleme Alanı': return [mk(pick(['Dikey', 'Stor', 'Jaluzi', 'Zebra']), f, { fabric: undefined })];
        default: return [mk('Tül', f)];
      }
    };

    const hid = {};
    const houseRooms = {};
    H.forEach((h, hi) => {
      const id = 'h_' + h.k;
      hid[h.k] = id;
      db.counters.house++;
      db.houses.push({
        id, code: 'EV-' + db.counters.house, title: h.title, type: h.type, layout: h.layout,
        city: h.city, district: h.district, neighborhood: h.hood, street: h.street, unit: h.unit,
        color: h.color, notes: h.notes, tags: h.tags, createdAt: at(-rint(120, 1100)),
        members: h.m.map(([pk, role, can, prim]) => ({ personId: pid[pk], role, canPickup: !!can, isPrimary: !!prim })),
      });
      houseRooms[id] = [];
      (LAYOUTS[h.layout] || LAYOUTS['2+1']).forEach(([rname, rtype], ri) => {
        const type = rtype || rname;
        const room = { id: `r_${h.k}_${ri}`, houseId: id, name: rname, type, order: ri, notes: '' };
        if (type === 'Kış Bahçesi') room.notes = 'Cam tavan; yaz aylarında aşırı ısınıyor.';
        if (rname === 'Salon' && h.k === 'yilmaz') room.notes = 'Piyano pencere önünde, söküm sırasında dikkat.';
        db.rooms.push(room);
        houseRooms[id].push(room);
        const facs = (FT[type] || FT['Çocuk Odası'])();
        facs.forEach((f, fi) => {
          const fac = { id: `f_${h.k}_${ri}_${fi}`, roomId: room.id, name: f.name, opening: f.opening, direction: f.direction, width: f.width, height: h.k === 'kaya' && !f.short ? f.height + 40 : f.height, notes: '' };
          db.facades.push(fac);
          curtainsFor(type, fac).forEach((c) => {
            db.counters.curtain++;
            db.curtains.push({ id: 'c_' + db.counters.curtain, code: 'PR-' + db.counters.curtain, facadeId: fac.id, washCount: 0, lastWashed: null, ...c });
          });
        });
      });
    });

    /* Yardımcılar */
    const roomOf = Object.fromEntries(db.rooms.map(r => [r.id, r]));
    const facOf = Object.fromEntries(db.facades.map(f => [f.id, f]));
    const curtainsOfHouse = (houseId) => db.curtains.filter(c => roomOf[facOf[c.facadeId].roomId].houseId === houseId);
    const selectCurtains = (houseId, rooms) => {
      const all = curtainsOfHouse(houseId);
      if (rooms === 'all') return all;
      if (rooms === 'random') {
        const rs = houseRooms[houseId];
        const chosen = rs.filter(() => chance(0.5));
        const set = new Set((chosen.length ? chosen : [rs[0]]).map(r => r.id));
        return all.filter(c => set.has(facOf[c.facadeId].roomId));
      }
      const set = new Set(houseRooms[houseId].filter(r => rooms.includes(r.name)).map(r => r.id));
      return all.filter(c => set.has(facOf[c.facadeId].roomId));
    };
    const houseObj = (id) => db.houses.find(h => h.id === id);
    const authorized = (houseId) => houseObj(houseId).members.filter(m => m.canPickup);
    const primary = (houseId) => houseObj(houseId).members.find(m => m.isPrimary) || houseObj(houseId).members[0];
    const personName = (id) => (db.people.find(p => p.id === id) || {}).name;
    const firstName = (id) => (personName(id) || '').replace('Dr. ', '').split(' ')[0];

    const orderDrafts = [];
    const ACTIVE_SEED = [
      ['yilmazyazlik', 'hazir', -6, 0, 'all', 'sokum', 'dukkan'],
      ['gunes', 'hazir', -5, -1, ['Salon', 'Yemek Odası'], 'adres', 'montaj'],
      ['kaya', 'hazir', -4, 0, ['Salon'], 'dukkan', 'dukkan'],
      ['koc5', 'hazir', -5, -2, ['Salon', 'Ebeveyn Yatak Odası'], 'dukkan', 'dukkan'],
      ['otel', 'yikamada', -2, 3, ['Oda 101', 'Oda 102', 'Oda 103'], 'sokum', 'montaj'],
      ['mimoza', 'yikamada', -2, 2, 'all', 'adres', 'adres'],
      ['demirvilla', 'yikamada', -1, 4, ['Salon', 'Kış Bahçesi', 'Yemek Odası'], 'sokum', 'montaj'],
      ['klinik', 'utude', -3, 1, 'all', 'adres', 'adres'],
      ['aydin', 'utude', -3, 1, ['Salon'], 'dukkan', 'dukkan'],
      ['etiler', 'utude', -2, 1, 'all', 'dukkan', 'dukkan'],
      ['polat', 'atolyede', -1, 4, ['Salon', 'Ebeveyn Yatak Odası'], 'dukkan', 'dukkan'],
      ['alacati', 'atolyede', -1, 5, 'all', 'sokum', 'dukkan'],
      ['aksoy', 'atolyede', 0, 4, ['Salon'], 'dukkan', 'dukkan'],
      ['modakafe', 'planlandi', 1, 4, 'all', 'sokum', 'montaj'],
      ['arslan', 'planlandi', 0, 3, ['Salon', 'Yemek Odası'], 'adres', 'adres'],
      ['kurt', 'planlandi', 2, 6, ['Salon'], 'adres', 'montaj'],
    ];
    ACTIVE_SEED.forEach(([hk, status, pOff, dOff, rooms, pm, dm]) => {
      orderDrafts.push({ houseId: hid[hk], status, pickupOff: pOff, dueOff: dOff, rooms, pm, dm, active: true });
    });

    const heavy = { yilmaz: [4, 6], otel: [4, 5], celik: [3, 4], demirvilla: [2, 4], gunes: [3, 4], klinik: [3, 4], modakafe: [2, 3] };
    H.forEach((h) => {
      const [a, b] = heavy[h.k] || [2, 4];
      const n = rint(a, b);
      const offs = [];
      for (let i = 0; i < n; i++) offs.push(-rint(9, 360));
      offs.sort((x, y) => x - y);
      offs.forEach((off) => {
        const pm = pick(['dukkan', 'dukkan', 'adres', 'sokum']);
        const dm = pm === 'sokum' ? 'montaj' : pick(['dukkan', 'dukkan', 'adres']);
        orderDrafts.push({ houseId: hid[h.k], status: pm !== 'dukkan' && chance(0.07) ? 'iptal' : 'teslim', pickupOff: off, dueOff: off + rint(3, 6), rooms: chance(0.35) ? 'all' : 'random', pm, dm, active: false });
      });
    });

    // Tarihe göre sırala ve kodla
    orderDrafts.sort((a, b) => a.pickupOff - b.pickupOff);
    orderDrafts.forEach((d) => {
      db.counters.order++;
      const house = houseObj(d.houseId);
      const curtains = selectCurtains(d.houseId, d.rooms);
      const items = curtains.map((c) => {
        const services = [];
        if (chance(0.08)) services.push('tamir');
        if (chance(0.04)) services.push('kisaltma');
        if (c.type === 'Tül' && chance(0.05)) services.push('kursun');
        if (chance(0.04)) services.push('leke');
        const servicePrice = services.reduce((s, k) => s + db.prices.services[k], 0);
        return { curtainId: c.id, wash: true, services, washPrice: C.washPrice(c, db.prices), servicePrice, price: C.washPrice(c, db.prices) + servicePrice };
      });
      const facadeCount = new Set(curtains.map(c => c.facadeId)).size;
      const fees = [];
      if (d.pm === 'adres') fees.push({ label: 'Adresten alım', amount: db.prices.fees.adresAlim });
      if (d.pm === 'sokum') fees.push({ label: `Söküm (${facadeCount} cephe)`, amount: db.prices.fees.sokum * facadeCount });
      if (d.dm === 'adres') fees.push({ label: 'Adrese teslim', amount: db.prices.fees.adresTeslim });
      if (d.dm === 'montaj') fees.push({ label: `Montaj (${facadeCount} cephe)`, amount: db.prices.fees.montaj * facadeCount });
      const subtotal = items.reduce((s, i) => s + i.price, 0) + fees.reduce((s, f) => s + f.amount, 0);
      const vip = (house.tags || []).includes('VIP') || (house.tags || []).includes('Kurumsal');
      const discount = vip && chance(0.6) ? Math.round(subtotal * pick([0.05, 0.1]) / 10) * 10 : (chance(0.12) ? Math.round(subtotal * 0.05 / 10) * 10 : 0);
      const total = Math.max(db.prices.minOrder, subtotal - discount);

      const createdAt = d.pm === 'dukkan' ? at(d.pickupOff, rint(9, 17), pick([0, 15, 30, 45])) : at(d.pickupOff - rint(1, 3), rint(9, 18), pick([0, 10, 20, 30, 40, 50]));
      const pickupAt = at(d.pickupOff, d.pm === 'dukkan' ? new Date(createdAt).getHours() : rint(9, 16), d.pm === 'dukkan' ? new Date(createdAt).getMinutes() : pick([0, 30]));
      const dueAt = at(d.dueOff, 17, 0);
      const code = `SP-${String(db.counters.order).padStart(4, '0')}`;
      const order = {
        id: 'o_' + db.counters.order, code, houseId: d.houseId, status: d.status,
        items, fees, discount, total, payments: [], createdAt, pickupAt, dueAt,
        pickupMethod: d.pm, deliveryMethod: d.dm, deliveryCode: String(rint(1000, 9999)),
        notes: '', history: [], deliveredTo: null, deliveredToName: null, deliveredAt: null, readyAt: null, signature: null,
        handedBy: null,
      };
      const prim = primary(d.houseId);
      const by = () => pick(C.STAFF);
      const hist = (status, iso, note, who) => order.history.push({ status, at: clampNow(iso), note, by: who || by() });

      if (d.pm !== 'dukkan') hist('planlandi', createdAt, `${C.PICKUP[d.pm]} randevusu oluşturuldu (${firstName(prim.personId)} ile görüşüldü).`, 'Kemal Usta');
      const steps = C.FLOW;
      const targetIdx = d.status === 'iptal' ? 1 : steps.indexOf(d.status);
      if (d.status === 'iptal') {
        order.history.push({ status: 'iptal', at: addH(createdAt, 20), note: pick(['Müşteri randevuyu iptal etti.', 'Ev sahibi tarihi erteledi, yeni sipariş açılacak.']), by: 'Kemal Usta' });
      } else {
        let t = pickupAt;
        if (targetIdx >= 1) {
          const handed = d.pm === 'dukkan' ? pick(authorized(d.houseId)) : null;
          if (handed) order.handedBy = handed.personId;
          hist('atolyede', t, d.pm === 'dukkan' ? `${items.length} parça perde ${firstName(handed.personId)} tarafından dükkana getirildi.` : `${items.length} parça perde ${d.pm === 'sokum' ? 'sökülerek ' : ''}adresten alındı.`, d.pm === 'dukkan' ? 'Kemal Usta' : 'Hüseyin (Şoför)');
        }
        if (targetIdx >= 2) { t = addH(t, rint(3, 20)); hist('yikamada', t, 'Etiketlendi, yıkama programına alındı.', 'Sinan (Yıkama)'); }
        if (targetIdx >= 3) { t = addH(t, rint(18, 40)); hist('utude', t, 'Kurutma tamamlandı, ütü ve bakımda.', 'Derya (Ütü)'); }
        if (targetIdx >= 4) {
          t = addH(t, rint(8, 26));
          hist('hazir', t, 'Kalite kontrolden geçti, paketlendi. Yetkililere SMS gönderildi.', 'Derya (Ütü)');
          order.readyAt = order.history[order.history.length - 1].at;
        }
        if (targetIdx >= 5) {
          t = addH(t, rint(4, 70));
          const rec = pick(authorized(d.houseId));
          order.deliveredTo = rec.personId;
          order.deliveredToName = personName(rec.personId);
          order.deliveredAt = clampNow(t);
          hist('teslim', t, d.dm === 'dukkan' ? `${personName(rec.personId)} (${rec.role}) dükkandan teslim aldı. Teslim kodu doğrulandı.` : `${d.dm === 'montaj' ? 'Montajı yapıldı, ' : ''}${personName(rec.personId)} (${rec.role}) adreste teslim aldı.`, d.dm === 'dukkan' ? 'Kemal Usta' : 'Hüseyin (Şoför)');
          curtains.forEach((c) => { c.washCount++; c.lastWashed = order.deliveredAt; });
          // Ödemeler
          const r = R();
          const method = (house.tags || []).includes('Faturalı') ? pick(['Havale/EFT', 'Cari Hesap']) : pick(['Nakit', 'Kredi Kartı', 'Kredi Kartı', 'Havale/EFT']);
          if (r < 0.86) order.payments.push({ at: order.deliveredAt, amount: total, method });
          else if (r < 0.95) {
            const part = Math.round(total * 0.5 / 50) * 50;
            order.payments.push({ at: order.deliveredAt, amount: part, method });
          }
        }
        if (d.active && targetIdx >= 1 && chance(0.4)) {
          order.payments.push({ at: order.history.find(h => h.status === 'atolyede').at, amount: Math.round(total * 0.3 / 50) * 50, method: pick(['Nakit', 'Kredi Kartı']), note: 'Kapora' });
        }
      }
      if (d.active && d.status === 'hazir' && d.houseId === hid.gunes) order.notes = 'Montaj için Barış Bey ile saat teyit edilecek.';
      if (d.active && d.houseId === hid.otel) order.notes = '1. kat odaları. Kalan odalar bir sonraki partide.';
      if (d.active && d.houseId === hid.klinik) order.notes = 'Antibakteriyel yıkama programı uygulanacak.';
      if (d.active && d.houseId === hid.modakafe) order.notes = 'Sabah 08:00\'de söküm, kafe açılmadan önce.';
      if (d.active && d.houseId === hid.yilmazyazlik) order.notes = 'Sezon kapanışı. Perdeler kış boyunca dükkanda kalabilir, Ahmet Bey arayacak.';
      db.orders.push(order);

      // SMS kayıtları (son 75 gün)
      const recent = (iso) => new Date(iso) > new Date(today.getTime() - 75 * DAY);
      const sms = (personId, iso, text, kind) => {
        const p = db.people.find(x => x.id === personId);
        if (!p || !p.phone) return;
        db.messages.push({ id: 'm_' + db.messages.length, personId, phone: p.phone, at: clampNow(iso), text, orderId: order.id, kind, status: 'İletildi' });
      };
      const sig = db.shop.smsSignature;
      const planned = order.history.find(h => h.status === 'planlandi');
      if (planned && recent(planned.at)) sms(prim.personId, planned.at, `Sayın ${personName(prim.personId)}, ${code} nolu perde alım randevunuz ${new Date(pickupAt).toLocaleDateString('tr-TR')} saat ${new Date(pickupAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} olarak planlandı. ${sig}`, 'randevu');
      const atel = order.history.find(h => h.status === 'atolyede');
      if (atel && recent(atel.at)) sms(prim.personId, atel.at, `${code}: ${items.length} parça perdeniz teslim alındı. Tahmini teslim: ${new Date(dueAt).toLocaleDateString('tr-TR')}. Takip: nazliperde.com/takip ${sig}`, 'alindi');
      const ready = order.history.find(h => h.status === 'hazir');
      if (ready && recent(ready.at)) {
        const names = authorized(d.houseId).map(m => firstName(m.personId)).join(', ');
        authorized(d.houseId).forEach((m) => sms(m.personId, ready.at, `${code} nolu perdeleriniz teslime hazır. Teslim kodu: ${order.deliveryCode}. Evinizden ${names} teslim alabilir. ${sig}`, 'hazir'));
      }
      if (order.deliveredAt && recent(order.deliveredAt)) sms(prim.personId, order.deliveredAt, `${code} nolu perdeleriniz ${order.deliveredToName} tarafından teslim alındı. Bizi tercih ettiğiniz için teşekkürler. ${sig}`, 'teslim');
    });

    // Bazı eski kayıt olayları
    db.houses.forEach((h) => db.events.push({ at: h.createdAt, type: 'house', text: `${h.title} kaydı oluşturuldu`, ref: '#/ev/' + h.id, icon: 'home' }));
    db.messages.sort((a, b) => (a.at < b.at ? 1 : -1));
    return db;
  };

  window.C = C;
})();
