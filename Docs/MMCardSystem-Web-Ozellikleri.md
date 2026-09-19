# MMCard — Tanıtım Web Sitesi Özellik Dokümanı

> MMCard uygulamasını tanıtan web sitesi (landing page) için hazırlanmıştır.
> İçerik, MMCardSystem backend analizinden (gerçek uygulama özellikleri) çıkarılmıştır. Tarih: 20.08.2026

---

## 1. Amaç ve Kapsam

- Bu web sitesi uygulamanın **kendisi değildir** — **login/kayıt formu, panel, kullanıcı işlemleri YOKTUR**.
- Site, **MMCard dijital kartvizit uygulamasını tanıtır** ve ziyaretçiyi uygulamayı kullanmaya yönlendirir.
- Dil: **Türkçe**.
- İçerik tamamen gerçek uygulama yeteneklerine dayanmalıdır (backend'de olmayan özellik uydurulmamalı).

---

## 2. Tanıtılacak Ürün: MMCard Nedir?

Backend analizinden çıkan, uygulamanın **gerçek yetenekleri** (tanıtım içeriğinin kaynağı):

| Özellik | Açıklama |
|---|---|
| **Dijital kartvizit** | Kullanıcıya özel, benzersiz adresli dijital kart. Kağıt kartvizitin modern karşılığı. |
| **Kart aktivasyonu** | Kullanıcı, kendisine verilen kart kodu ile kartını tek seferde aktive eder. |
| **Çoklu kart** | Bir kullanıcı birden fazla karta sahip olabilir (kişisel/iş ayrımı). |
| **İletişim bilgileri** | Telefon (mobil/ev/iş), e-posta (kişisel/iş/kurumsal/destek/satış), adres (ev/iş/ofis/şube), sosyal medya hesapları. |
| **Öncelikli iletişim (Primary)** | Kartta bir telefon/e-posta/adres "birincil" işaretlenir; rehbere kaydederken öne çıkar. |
| **Herkese açık kart sayfası** | Kartın paylaşılabilir URL'si; herkes bağlantıyı açıp tüm iletişim bilgilerini görebilir. |
| **VCF (vCard) indirme** | Kart tek tıkla **.vcf dosyası** olarak indirilir; telefonda açılınca doğrudan **rehbere kaydedilir**. |
| **Google Maps entegrasyonu** | Karttaki her adres için VCF içinde Google Maps bağlantısı üretilir. |
| **Güvenli doğrulama** | E-posta doğrulama (6 haneli kod, tek kullanımlık, süre limitli). |
| **Kurumsal yönetim** | Admin paneli: toplu kart üretimi (1–1000), kart iptali, kullanıcı/rol yönetimi. |
| **Konum verisi** | Türkiye il/ilçe/mahalle bazlı adres yapısı. |

---

## 3. Site Yapısı — Bölüm Bölüm İçerik Taslağı

### 3.1 Header / Navbar

- **Logo:** "MMCard" (uygulamanın e-posta gönderen adı ve markası).
- **Menü:** Özellikler · Nasıl Çalışır · SSS · İletişim
- **CTA butonu:** "Kartımı Oluştur" / "Hemen Başla" (uygulama linkine yönlendirir).

### 3.2 Hero Bölümü

**Başlık taslakları (seçenek):**
- "Kağıt Kartviziti Bırakın, Dijital Kartvizitinizi Paylaşın"
- "Tüm İletişim Bilgileriniz Tek Linkte"

**Alt metin taslağı:**
- "MMCard ile telefon, e-posta, adres ve sosyal medya hesaplarınızı tek dijital kartta toplayın. Kartınızı paylaşın, karşınızdaki tek tıkla rehberine kaydetsin."

**CTA:** "Kartımı Oluştur" (birincil) + "Nasıl Çalışır?" (ikincil, aşağı kaydırır).

**Görsel:** Dijital kart mockup'ı — ad, telefon (birincil işaretli), e-posta, adres, sosyal medya ikonları.

### 3.3 Nasıl Çalışır (3 Adım)

Uygulamanın gerçek akışına birebir uyar:

| Adım | Başlık | Açıklama |
|---|---|---|
| 1 | **Kartını Aktive Et** | Sana verilen kart kodu ile kartını aktive et ve sahibi ol. |
| 2 | **Bilgilerini Ekle** | Telefon, e-posta, adres ve sosyal medya hesaplarını ekle; kartında hangilerinin görüneceğini seç. |
| 3 | **Paylaş, Kaydetsinler** | Kartının bağlantısını paylaş; karşındaki tek tıkla kartı görüntülesin ve VCF ile rehberine kaydetsin. |

### 3.4 Özellikler Bölümü (Grid — 6 kart önerisi)

| Özellik Kartı | Başlık | Açıklama Metni |
|---|---|---|
| 1 | **Tek Linkte Tüm Bilgiler** | Telefon, e-posta, adres ve sosyal medya hesapların tek sayfada. |
| 2 | **Rehbere Tek Tıkla Kaydet** | VCF (vCard) indirme: kartın telefonda açılınca doğrudan rehbere eklenir. |
| 3 | **Öncelikli İletişim** | Birincil telefon/e-posta/adresini işaretle; rehbere kaydederken öne çıksın. |
| 4 | **Konum ve Harita** | Adreslerin Google Maps bağlantısıyla gelir; tek tıkla yol tarifi. |
| 5 | **Çoklu Kart** | Kişisel ve iş için ayrı kartlar oluştur. |
| 6 | **Kurumsal Kullanım** | Şirketler için toplu kart üretimi ve yönetim. |

### 3.5 Neden MMCard? (Kağıt Kartvizite Karşı)

- Kartvizit basım maliyeti yok; bilgiler değişince yeniden basım yok — kartta anında güncellenir.
- Kaybolmaz, yıpranmaz; her zaman güncel.
- Çevre dostu: kağıt tüketimi yok.
- Paylaşım sınırsız: QR/bağlantı ile herkese anında ulaştır.
- E-posta doğrulamalı güvenli altyapı.

### 3.6 SSS (FAQ) — Uygulamanın Gerçek Kurallarından Türetilmiş Sorular

| Soru | Cevap |
|---|---|
| Kartımı nasıl aktive ederim? | Sana verilen kart kodu ile uygulamada tek seferde aktive edersin. |
| Bir kartı birden fazla kişi kullanabilir mi? | Hayır — her kart yalnızca bir kullanıcıya atanır. |
| İptal edilen kart tekrar kullanılabilir mi? | Hayır — iptal kalıcıdır; yeni kart üretilmesi gerekir. |
| Kartımda neler paylaşabilirim? | Telefon, e-posta, adres ve sosyal medya hesapları; hangilerinin görüneceğini sen seçersin. |
| Karşımdaki kişi kartımı nasıl kaydeder? | Kart bağlantısını açar ve .vcf dosyasını indirir; telefonda açınca bilgilerin rehberine eklenir. |
| Adresim haritada görünür mü? | Evet — karttaki adresler için Google Maps bağlantısı üretilir. |
| Hesabımın güvenliği nasıl sağlanıyor? | E-posta doğrulama kodu ile hesap onayı; kodlar tek kullanımlık ve süre limitlidir. |

### 3.7 İletişim / CTA Bölümü

- Başlık: "Dijital Kartvizitin Hazır mı?"
- CTA: "Kartımı Oluştur"
- Kurumsal satış için e-posta/telefon alanı (placeholder — backend'de iletişim formu yoktur; statik bilgi konur).

### 3.8 Footer

- Logo + kısa açıklama
- Menü linkleri (Özellikler, Nasıl Çalışır, SSS, İletişim)
- Telif: "© 2026 MMCard — Tüm hakları saklıdır."

---

## 4. Tasarım ve İçerik Notları

- **Marka adı:** MMCard (e-posta gönderen adı ve "MMCard'a Hoş Geldiniz" şablonundan).
- **Ton:** Sade, profesyonel, Türkçe; teknik detaylara boğmadan.
- **Görsel önerileri:**
  - Hero: dijital kart mockup'ı (ad + iletişim bilgileri + sosyal ikonlar).
  - "Nasıl Çalışır": 3 adımlı ikonlu şema.
  - VCF özelliği: telefon rehberine kaydetme akışını gösteren mini animasyon/görsel.
  - Özellikler: ikonlu grid (6 kart).
- **Site tek sayfa (single page) veya çok bölümlü landing** olabilir; tüm içerik tek sayfaya sığacak hacimdedir.
- **Teknik gereksinim:** Login, form doğrulama, kullanıcı oturumu GEREKMEZ. Statik içerik yeterlidir.

---

## 5. Yapılmaması Gerekenler (Önemli)

1. **Login/kayıt formu koyma** — site tanıtım amaçlıdır; uygulama ayrıdır.
2. **Fiyatlandırma icat etme** — backend'de fiyat/abonelik modeli yoktur; fiyat yazılmamalıdır.
3. **Olmayan özellikleri tanıtma** — backend'de aşağıdakiler henüz uygulanmamıştır, tanıtımda vaat edilmemelidir:
   - Şifre sıfırlama ("şifremi unuttum")
   - İki adımlı doğrulama (2FA) ile giriş
   - E-posta/telefon değiştirme akışları
4. **Canlı uygulama verisi çekmeye çalışma** — site statiktir, API'ye bağlanmaz.

---

## 6. Bilgi Amaçlı: Uygulamanın Gerçek Teknik Özeti

(Tanıtım içeriği yazarken doğruluk kontrolü için — siteye konulmayacak)

- Backend: .NET 8 Web API · MySQL 8 · JWT tabanlı kimlik doğrulama
- Kullanıcı rolleri: BRONZE (standart kullanıcı), ADMIN, SUPER_ADMIN
- Kart: benzersiz 64 karakterlik paylaşım anahtarı (UrlKey) · toplu üretim (1–1000) · tek seferlik aktivasyon · kalıcı iptal
- E-posta doğrulama: 6 haneli OTP · 15 dk geçerli · 5 deneme limiti · 60 sn yeniden gönderme beklemesi
- VCF: vCard 3.0 · telefon/e-posta/adres + Google Maps linki + sosyal medya etiketleri
- Adres hiyerarşisi: İl → İlçe → Mahalle

---

*Bu doküman MMCardSystem backend kodunun analizinden üretilmiştir ve tanıtım web sitesinin içerik kaynağıdır.*
