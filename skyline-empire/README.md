# Skyline Empire 3.0 — Airline Tycoon ✈

**Tek oyunculu, mobil uyumlu, çevrimdışı, reklam ve ödeme sistemi olmayan Türkçe havayolu yönetim simülasyonu.** Bu oyun simüle değerlerle çalışır; gerçek hava yolu fiyatları veya uçak teknik operasyonları için kaynak değildir.

## Nasıl oynanır?

1. En pratik seçenek: `skyline-empire-v3-offline.html` dosyasını Chrome veya başka modern tarayıcıda aç. CSS ve bütün JavaScript oyun dosyasına gömülüdür. İlk açılış için bile internet gerekmez.
2. Ana havalimanını ve zorluk seviyeni seç, ilk filonu ve rotanı yönet. Filo için yeni uçak satın alabilir, kiralayabilir ve bakım yapabilirsin.
3. Her hafta tur ilerlet; bilet fiyatı, frekans, yolcu talebi, personel ücretleri, fuel endeksi ve sözleşmeler net kâra dönüşür.
4. **Holding ve Yatırım:** 18 tesis, 3 sigorta seçeneği, 4 sadakat seviyesi ve 6 kademe mürettebat eğitimi.
5. **Mega Ar-Ge:** 6 ayrı dalda sırayla açılan 72 kalıcı araştırma.
6. **Kabin ve Yolcu:** 16 rota profili. Her rota için farklı hedef kitle, hizmet seviyesi ve kargo kullanımını seçebilirsin.
7. **Modernizasyon:** Her uçak için motor, kabin, kargo ambarı ve aviyonikte 3 kademe (uçak başına 12 yükseltme).
8. **Pazar ve Risk:** Yakıt fiyatı dalgalanmalarını, rota dakikliğini, maliyetleri ve ticari riskleri izle.
9. Ayarlar → **JSON İndir** ile kayıt yedeğini al. Oyun aynı tarayıcıda otomatik olarak da saklanır.

## 3.0 paketinde 204 içerik yeniliği

| Kategori | Yeni içerik | Toplam (2.0 dahil) |
| --- | ---: | ---: |
| Havalimanı | 48 | 122 |
| Uçak modeli | 18 | 38 |
| Teknoloji araştırması | 72 | Önceki 20 + 72 |
| Kurumsal tesis projesi | 18 | 18 |
| Kabin ve rota stratejisi | 16 | 16 |
| Kargo sözleşmesi | 12 | 16 |
| Yönetim kurulu olayı | 20 | 28 |
| **Toplam** | **204** | |

204 sayısı **kataloğa eklenen benzersiz etkileşimli içerik kalemlerini** ifade eder, 204 birbirinden ayrı oyun motoru vaadi değildir. Eski sistemlere ilaveten ayrı oyun mekaniği olarak araştırma önkoşulları, terminal zincirleri, risk sigortası, dinamik yakıt endeksi, pazar devinimi, kabin profilleri, her uçak için ayrı modernizasyon, yakıt tasarrufu, müşteri kulübü, güvenilirlik/dakiklik, eğitim, tesis giderleri ve analiz tabloları eklendi.

Tam içerik kataloğu: [`docs/204-YENILIK-KATALOGU.md`](docs/204-YENILIK-KATALOGU.md).

## Bütünleşik ekonomi

- Her uçuşta hava yolu pazarı, uçak doluluğu, rota profili, tahmini yolcu sayısı, gelir, yakıt endeksi, bakım, sigorta, kabin hizmetleri, emisyon, cargo ve dakiklik **aynı uçuş hesaplamasında** işlenir.
- Holding yatırımlarının giderleri ve sadakat/sigorta primleri **tek merkezi haftalık gider tablosuna** kaydolur; yatırımlar şirket değerine de dahil edilir.
- Uçak yükseltmeleri yalnızca ilgili uçağın performansını değiştirir. Satılan uçakların yükseltmeleri ve silinen rotaların profilleri temizlenir.
- Teknoloji dalında önceki basamak tamamlanmadan ileri basamağa geçilemez, böylece erken oyunda aşırı güçlenme engellenir.
- 20 ek olayda üç maliyet/risk dengeli yönetim kurulu tercihi bulunur.
- Rastgele olaylar ve haftalık yolcu dalgalanması deterministik seed sayesinde kaydedilebilir/yeniden üretilebilir.

## Kayıt uyumluluğu

1.0 ve 2.0 kayıtları (`skyline-empire-save-v1`) 3.0'da otomatik yeni `mega` alanıyla genişletilir. Mevcut sermaye, filo ve rotalar korunur. Kaydı dönüştürmeden önce JSON dosyası indirmen önerilir. Farklı cihazlarda otomatik bulut senkronizasyonu yoktur. Tarayıcı localStorage'ı kapatıyorsa JSON dışa aktarımını kullan.

## Kurulum, test ve paket

Node.js 18+ ve Python 3 ile:

```bash
node tests/sim.test.js
node tests/expansion.test.js
node tests/mega.test.js
python tests/browser-smoke.py       # Playwright + Chromium kuruluysa
python scripts/build.py
```

Üç Node test paketi 10 + 14 + 31 = **55** denetim, tarayıcı testi ise 1380px masaüstü ve 390px mobil için menü, yatırım, Ar-Ge, hangar, fiyat profili, personel ve kargo akışları çalıştırır. 200 ve 500 haftalık deterministik/stres senaryoları ayrıca simülasyonu sınar. Bu testler bilinen hataları tespit etmeye yardımcı olur; tüm cihazlarda ve tüm olası oyuncu hamlelerinde sıfır hata garantisi anlamına gelmez.

### Dosya yapısı

- `data.js`, `expansion-data.js`, `mega-data.js` — bağımsız veri katalogları.
- `engine.js`, `expansion-engine.js`, `mega-engine.js` — temel oyun kuralları ve tek merkezli finans motoru.
- `app.js`, `expansion-ui.js`, `mega-ui.js`, `style.css`, `index.html` — mobil ve masaüstü arayüz.
- `sw.js` — aynı sunucu alanında kurulabilen çevrimdışı PWA önbelleği.
- `scripts/build.py` — bağımsız HTML + kaynak ZIP oluşturur. GitHub Actions zorunlu değildir.

Önemli: `file://` üzerinden dosya açarken bazı telefon tarayıcıları otomatik kaydı sınırlandırabilir. Tek dosyalık sürüm için internet gerekmese de yerel yedek önerilir.
