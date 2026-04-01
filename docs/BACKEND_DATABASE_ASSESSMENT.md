# SEBS Global – Backend ve Veritabanı Değerlendirmesi (Yazılımcı Gözüyle)

**Tarih:** 2026-02-06  
**Kapsam:** server.js (Express), PostgreSQL şeması, migration’lar, API tasarımı, güvenlik, hata yönetimi.  
**Puan:** 100 üzerinden, acımasız kriterlerle.

---

## 1. API ve endpoint’ler (12/25)

### Eksik endpoint’ler (−8)
Frontend şu endpoint’lere istek atıyor ama **server.js’te tanımlı değil:**

| Endpoint | Çağıran | Etkisi |
|----------|---------|--------|
| `POST /api/progress/time` | utils/time-tracker.js, api-client.js | Modül süresi hiç backend’e yazılmıyor. |
| `POST /api/progress/quiz` | utils/quiz-tracker.js, api-client.js | Quiz sonuçları hiç backend’e yazılmıyor. |
| `POST /api/simulations/complete` | utils/simulation-tracker.js, api-client.js | Simülasyon tamamlama kaydı yok. |

Sonuç: `module_progress.time_spent_minutes`, `module_progress.last_step` (quiz), `simulation_runs` tabloları bu akışla **dolmayacak**. Değerlendirme raporu (evaluation) bu tablolardan okuyor; veri olmayınca rapor hep “yeterli veri yok” seviyesinde kalır. **Kritik iş mantığı eksik.**

### Mevcut endpoint’ler (+)
- `GET /api/health` – DB ve sunucu kontrolü
- `GET/POST /api/auth/*` – register, login, verify, resend (JWT + Supabase sync ayrı)
- `GET /api/users/me` – kullanıcı + purchases
- `GET /api/modules`, `GET /api/modules/:id`
- `POST /api/progress/lesson/:id` – ders ilerlemesi (user_lesson_progress + user_module_progress)
- `GET /api/progress/module/:moduleId`, `GET /api/progress/overview`
- `GET /api/evaluation/report`, `GET /api/certificates`, `GET /api/certificates/check/:category`, `GET /api/certificates/:id/report`
- `POST /api/purchase`, `POST /api/users/reset-progress`

### Küçük hata (düzeltildi)
- `POST /api/progress/lesson/:id`: body’den `progressPercentage: progressPct` alınıp sonra `progressPercentage || 0` kullanılıyordu; `progressPercentage` tanımsız olduğu için hep 0 gidiyordu. **progressPct kullanılacak şekilde düzeltildi.**

---

## 2. Veritabanı şeması ve tutarlılık (14/20)

### Tablolar (007 / 009)
- **users:** UUID, email, password_hash, role, access_level, is_verified; uygun.
- **modules, lessons:** FK’lar var (lessons → modules).
- **user_lesson_progress, user_module_progress:** user_id UUID, module_id/lesson_id FK; UNIQUE(user_id, lesson_id/module_id); iyi.
- **module_progress:** user_id, module_id (UUID ama **modules(id) REFERENCES yok**); `time_spent_minutes`, `updated_at` (007’de var), 009 ile `last_step` JSONB ekleniyor.
- **simulation_runs:** user_id UUID, module_id nullable, simulation_id TEXT; FK yok.
- **certificates:** user_id UUID, category/title/description; uygun.
- **purchases, user_package_purchases:** **user_id TEXT** – users.id UUID ile tutarsız; FK yok. Pratikte UUID string yazılıyor, tip ve referans bütünlüğü zayıf (−2).

### Migration karmaşa (−2)
- İki tane “007” dosyası: `007_sever_required_tables_all.sql` ve `007_server_required_tables_all.sql` (typo + çift).
- Onlarca “fix_*”, “COZUM_*”, “TUM_SORUNLARI_COZ*” vb. migration; hangisinin canlıda çalıştığı net değil (−2).

### İndeksler
- users(email), modules(is_active, category, level), user_module_progress(user_id, module_id), module_progress(user_id, module_id), certificates(user_id, category), simulation_runs(user_id) – sorgu desenlerine uygun.

---

## 3. Güvenlik (15/20)

### Artılar
- Tüm SQL **parametreli** ($1, $2, …); string birleştirme yok; SQL injection riski düşük.
- `authenticateToken`: JWT_SECRET + SUPABASE_JWT_SECRET ile çift JWT; Supabase’de `ensureUserFromSupabase` ile users senkronu.
- Rate limit (ör. 15 dk’da 100 istek), Helmet (CSP, HSTS), CORS sınırlı.
- Production’da JWT_SECRET ve DATABASE_URL kontrolü; zayıf/placeholder secret’ta exit(1).
- Hassas endpoint’ler (progress, certificates, purchase, reset-progress) `authenticateToken` ile korunuyor.
- Sertifika raporu: certificateId + user_id ile sadece kendi sertifikası.

### Eksiler
- **category** (certificates/check): Parametreden normalize ediliyor; whitelist yok. Örn. `category=xyz` ile INSERT yapılabiliyor (−1).
- **price** (purchase): Sayısal doğrulama yok; negatif veya çok büyük değer gönderilebilir (−1).
- **reset-progress:** confirm boolean kontrolü var; CSRF token yok (−1).
- CORS_ORIGIN varsayılanı localhost:8000; canlıda mutlaka override edilmeli (−1).

---

## 4. Hata yönetimi ve dayanıklılık (13/15)

### Artılar
- `isDbUnavailableError(err)`: 42P01, 42P07, “does not exist” → kullanıcıya Türkçe “Veritabanı geçici olarak kullanılamıyor.”
- certificates list/report/check’te try/catch ve tutarlı mesaj.
- evaluation/report: `module_progress` ilk sorguda `last_step` yok; ikinci sorgu (last_step) ayrı try/catch’te, kolon yoksa atlanıyor.
- DB bağlantı periyodik kontrolü (SELECT 1), testConnection ile fallback.

### Eksiler
- Birçok route’ta `logger.error` veya `console.error` var; production’da error.message bazen JSON’da dönüyor (NODE_ENV === 'development'); iyi. Ama bazı endpoint’ler hâlâ “Internal server error” İngilizce (−1).
- purchases tablosu yoksa purchase flow’da catch ile devam; kullanıcıya “Satın alındı” deniyor ama purchases’a yazılmamış olabilir (−1).

---

## 5. Kod yapısı ve sürdürülebilirlik (10/15)

### Artılar
- Tek server.js; route’lar gruplanmış (auth, users, modules, progress, evaluation, certificates, purchase, reset).
- Ortak middleware (auth, rate limit, helmet, cors) merkezi.

### Eksiler
- **Dosya boyutu:** 2200+ satır; route’lar ayrı dosyalara (routes/auth.js, routes/progress.js vb.) bölünmemiş (−2).
- **Tekrarlayan sorgular:** purchases ve user_package_purchases aynı anda iki yerde (users/me, purchase response) benzer şekilde çekiliyor; yardımcı fonksiyon yok (−1).
- **Sabit metinler:** Türkçe/İngilizce karışık; bazıları “User not found”, bazıları “Kullanıcı bulunamadı” (−1).
- **Magic string:** `[SUPABASE]` password placeholder, categoryNorm mapping (siber_guvenlik → cybersecurity) kod içinde; config/constant’a alınabilir (−1).

---

## 6. Veritabanı kullanımı ve sorgular (12/15)

### Artılar
- progress/overview: user_module_progress + module_progress LEFT JOIN; “sadece module_progress’te olan” ayrı sorgu ile birleştirilmiş; mantık doğru.
- certificates/check: Önce tamamlanmış modül sayısı, sonra mevcut sertifika, yoksa INSERT; race için aynı kullanıcıda çift sertifika riski düşük (UNIQUE yok ama “LIMIT 1” + tek kullanıcı akışı).
- evaluation/report: quiz + simülasyon skorları ağırlıklı ortalama; deterministik.

### Eksiler
- **certificates/check WHERE koşulu:**  
  `AND (LOWER(COALESCE(m.category, 'cybersecurity')) = $2 OR LOWER(REPLACE(...)) = $2)`  
  Parantez doğru; AND/OR sırası beklediğimiz gibi. (Not: Kontrol edildi, hata yok.)
- **module_progress:** modules(id) ile FK yok; orphan module_id mümkün (−1).
- **N+1 yok** ama bazı akışlarda 4–5 ardışık sorgu (evaluation: user + progress + stepResult + simResult); tek bir transaction veya daha az round-trip ile toplanabilir (−1).
- **purchases DELETE:** reset-progress’te `user_id = $1`; purchases.user_id TEXT, targetId UUID string; PostgreSQL’de karşılaştırma çalışır (−1 puan değil, not).

---

## Puan özeti

| Kriter | Puan | Max | Not |
|--------|------|-----|-----|
| API ve endpoint’ler | 12 | 25 | Eksik: time, quiz, simulations/complete |
| Veritabanı şeması | 14 | 20 | user_id TEXT vs UUID, migration karmaşa |
| Güvenlik | 15 | 20 | Parametreli SQL, auth; category/price/CSRF |
| Hata yönetimi | 13 | 15 | DB unavailable mesajı iyi; bazı generic hatalar |
| Kod yapısı | 10 | 15 | Tek dosya, tekrarlar, dil karışıklığı |
| DB kullanımı | 12 | 15 | FK eksikleri, çoklu sorgu |
| **Toplam** | **76** | **100** | |

---

## Acımasız özet

- **76/100.** Altyapı (auth, rate limit, parametreli SQL, Türkçe hata mesajları, evaluation/certificates mantığı) sağlam; fakat **süre, quiz ve simülasyon verisi backend’e hiç yazılmıyor** çünkü ilgili endpoint’ler yok. Bu da değerlendirme raporunu ve ileride kullanılabilecek analitiği fiilen devre dışı bırakıyor.
- Şema tarafında purchases.user_id TEXT, migration dağınıklığı ve module_progress’te FK eksikliği sürdürülebilirlik ve veri bütünlüğü açısından puan kırdı.
- **Yapılması gerekenler (öncelik sırasıyla):**  
  1) `POST /api/progress/time`, `POST /api/progress/quiz`, `POST /api/simulations/complete` ekleyip ilgili tablolara yazmak.  
  2) purchase’ta price için validasyon (min 0, makul üst sınır).  
  3) certificates/check’te category whitelist.  
  4) purchases tablolarında user_id’yi UUID yapıp users(id) ile FK kurmak (migration ile).  
  5) Route’ları dosyalara bölmek ve sabit metinleri merkezileştirmek.

Bu düzeltmeler yapıldıktan sonra aynı kriterlerle **85–90** bandına çıkmak mümkün.
