# Skyline Empire — Airline Tycoon ✈

Türkçe, tamamen tek oyunculu ve çevrimdışı çalışabilen, mobil öncelikli havayolu şirketi simülasyonu. Gerçek para, hesap, reklam, üyelik, ücretli API ya da çevrimiçi sunucu gerekmez.

**Durum: oynanabilir v1.0, erken sürüm.** Uçak ve şehir verileri oyun dengesi için yaklaşık/kurgusal ekonomik değerlerle modellenmiştir; havacılık operasyonlarında gerçek karar vermek için kullanılmaz.

## Oyna

1. Dosyaları ZIP olarak indir ve birlikte bir klasöre çıkar.
2. `index.html` dosyasını Chrome/Edge/Firefox gibi bir tarayıcıda aç.
3. Şirket adını, ana üssünü ve zorluğu seç; oynama ekranı hemen açılır.
4. Hızlıca oynamak için başlangıçtaki boş A220'ye bir rota ata, uçuşları başlat ve **Haftayı İlerlet**.

> Tamamen çevrimdışı yerel dosya olarak açılabilir. Bazı mobil tarayıcıların `file://` erişimi/kayıt kısıtları olabilir. GitHub Pages veya başka HTTPS statik sunucuda **ilk açılış internet gerektirir**, ardından servis çalışanı (PWA) dosyaları önbelleğe alır ve oyun internetsiz oynanır. GitHub Pages için depoda Settings → Pages → Deploy from a branch → main / root gerekir; uygulama depo alt klasöründeyse URL de alt klasörle biter. Bu işlem yapılmadıysa otomatik olarak çevrimiçi oyun linki oluşmaz.

## Oyun Mekanikleri

- 33 havalimanı; kıta ve ülkelere göre pazarlar, farklı nüfus/turizm talebi
- 12 gerçek uçak ailesi/modeli (oyun için kurgulanmış fiyat ve maliyet dengesi)
- Satın alma, kiralama, ikinci el satma, yıpranma, bakım ve güvenlik duruşu
- Havalimanı ana üsleri; uçak menzili, uçuş saatleri ve sefer kısıtları
- Hat bazında sefer sayısı, bilet fiyatı, pazarlama, doluluk, talep, yakıt, personel, bakım, havalimanı ücretleri ve gelir hesabı
- 4 finansal metrik, bilanço, kredi, borç ödeme, işletme giderleri ve değerleme
- Gerçek oyuncu gerektirmeyen 3 yapay rakip, simüle pazar payları
- 12 kalıcı Ar-Ge geliştirmesi ve 6 kariyer seviyesi
- 8 iki seçenekli rastlantısal havacılık olayı; birden çok hafta süren etkiler
- 8 görev/ödül ve 10 başarım/bonus
- Bir veya dört hafta ilerletme, şirket haberleri, hafta hafta kayıt ve 32 haftalık grafikler
- Türkçe mobil/dar ekran arayüzü, yerel otomatik kayıt, JSON içe/dışa aktarım
- Bağımlılıksız HTML/CSS/JS; Google Analytics, API, reklam ve servis tarafı yok

## Dosya Yapısı

- `index.html`: uygulama kabuğu
- `style.css`: tüm responsive tasarım
- `data.js`: şehirler, uçaklar, geliştirmeler, başarılar, olaylar
- `engine.js`: deterministik simülasyon ve iş kuralları
- `app.js`: kullanıcı arayüzü ve aksiyonlar
- `sw.js`, `manifest.webmanifest`, `icon.svg`: çevrimdışı PWA ve ikon
- `tests/sim.test.js`: Node.js ile oyun ekonomisi ve kural testleri

## Test

```bash
node tests/sim.test.js
```

## Ekonomi notları

Para birimi milyon ABD dolarıdır (M$). Bir hafta bir turdur. Yolcu sayısı; uçak koltuğu, sefer sıklığı, fiyat esnekliği, rakipler, mevsimsellik ve pazarlamadan etkilenir. Gelir bilete ek hizmetler içerir. Kiralar ve kredi faizleri haftalıktır. Rastgele olaylar save dosyasında tutulan seed ile deterministiktir. Oyunun gerçek havacılık verilerine dayalı bir simülatör olduğu iddia edilmez.

## Gizlilik

Kayıtlar sadece bulunduğun cihazda tarayıcının `localStorage` alanında saklanır. Oyun hiçbir kullanıcı verisini sunucuya göndermez. Tarayıcı verilerini temizlemeden önce **Ayarlar → JSON İndir** ile yedek al.

## Planlanan sonraki sürümler

Filo özelleştirme, kargo odaklı uçaklar, rota üzerinden uçak transferi, kapsamlı rakip tarifeleri, uçuş anlaşmaları ve daha gelişmiş dünya haritası.
