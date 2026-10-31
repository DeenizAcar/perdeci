# Perdeci — Perde Yıkama Yönetim Paneli (Demo)

Perde yıkama dükkanları için hazırlanmış, tarayıcıda çalışan demo yönetim paneli.

**Canlı demo:** https://deenizacar.github.io/perdeci/

## Ne yapıyor?

- **Ev › Oda › Cephe › Perde** yapısı: Her evin odaları, her odanın cepheleri (pencere, balkon kapısı, cam cephe…), her cephenin perdeleri ayrı ayrı kayıtlı.
- **Perde türleri:** Tül, Kruvaze, Fon, Blackout, Stor, Zebra, Jaluzi, Plise, Dikey. Kumaş, renk, ölçü, pile oranı, kanat, montaj, askı, astar, yıkama talimatı.
- **Cephe çizimi:** Her cephe pencere tipi, yön ve perde katmanlarıyla çiziliyor; katmanlar açılıp kapatılabiliyor.
- **Kişiler ve teslim yetkisi:** Bir eve birden fazla kişi bağlanır (ev sahibi, eş, çocuk, kiracı, yardımcı, kapıcı, site görevlisi…). Bir kişinin birden fazla evi olabilir. Yetkili herkes perdeyi teslim alabilir.
- **Sipariş akışı:** Alım planlandı → Atölyede → Yıkamada → Ütü & Bakım → Teslime hazır → Teslim edildi. Sürükle-bırak pano ve liste görünümü.
- **Teslimat masası:** Teslim alan kişiyi seç, SMS'le giden 4 haneli kodu doğrula, perdeleri kontrol et, ödemeyi al, ekrana imza at.
- **Fiyatlandırma:** m² bazlı fiyat listesi, ek hizmetler (tamir, boy kısaltma…), söküm/montaj ücretleri, hızlı fiyat hesaplayıcı.
- **Diğer:** Takvim, SMS kayıtları (simülasyon), raporlar, atölye etiketi (barkod), fiş yazdırma, müşteri sipariş takip sayfası, açık/koyu tema, mobil uyum, yedek al/yükle.

## Teknik

- Saf HTML + CSS + JavaScript, derleme adımı yok. GitHub Pages'te doğrudan çalışır.
- Veriler tarayıcının `localStorage` alanında tutulur. Ayarlar sayfasından demo verileri sıfırlanabilir.
- Giriş, SMS ve ödeme işlemleri simülasyondur; hiçbir veri sunucuya gönderilmez.

## Yerelde çalıştırma

Herhangi bir statik sunucu yeterli:

```bash
npx serve .
```
