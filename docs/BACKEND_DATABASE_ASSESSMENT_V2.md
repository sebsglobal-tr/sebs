# SEBS Global – Backend & Veritabanı Testi (Yeniden – Acımasız)

**Tarih:** 2026-02-06 (rev 2)  
**Kapsam:** server.js, PostgreSQL, API, güvenlik, hata yönetimi.  
**Önceki puan:** 76/100 → **Güncel puan aşağıda.**

---

## 1. API ve endpoint’ler — 19/25 (önceki: 12)

### Yapılanlar
- **POST /api/progress/time:** Modül süresi `module_progress.time_spent_minutes`’a yazılıyor; ON CONFLICT ile artırılıyor. Tek istekte max 1440 dakika (24 saat) sınırı var.
- **POST /api/progress/quiz:** Quiz sonucu `module_progress.last_step` (JSONB) içinde `quizResults` dizisine ekleniyor/güncelleniyor. `last_step` kolonu yoksa 501 + net mesaj.
- **POST /api/simulations/complete:** `simulation_runs` tablosuna INSERT; body’de simulationId, score, timeSpent, attempts vb. alınıyor.

### Hâlâ eksik / zayıf (−6)
- **moduleId / UUID:** progress/time ve progress/quiz’de `moduleId` format kontrolü yok; geçersiz UUID ile DB hatası veya beklenmeyen davranış olabilir (−1).
- **Yinelenen simülasyon:** `simulation_runs`’ta (user_id, simulation_id, completed_at) için UNIQUE yok; aynı simülasyon defalarca gönderilip raporu şişirebilir (−2).
- **progress/lesson:** Body’de `status` için whitelist yok (örn. sadece not_started, in_progress, completed kabul edilmeli) (−1).
- **Tutarlı dil:** Bazı 400/404 mesajları hâlâ İngilizce (“Lesson not found”, “Module progress not found”); Türkçe ile karışık (−1).
- **API dokümantasyonu:** Endpoint’lerin body/response’u tek yerde (OpenAPI/Swagger vb.) tanımlı değil (−1).

---

## 2. Veritabanı şeması — 14/20 (değişiklik yok)

- **purchases / user_package_purchases:** user_id TEXT; users.id UUID. FK yok, tip tutarsız (−3).
- **module_progress.module_id:** modules(id) REFERENCES yok; orphan kayıt mümkün (−1).
- **İki 007 migration:** 007_sever / 007_server; hangisinin resmi olduğu belirsiz (−1).
- **Çok sayıda fix/COZUM migration:** Bakım ve “hangi migration çalıştı?” karmaşası (−1).

---

## 3. Güvenlik — 17/20 (önceki: 15)

### Yapılanlar
- **Purchase:** price 0–999999.99 aralığında zorunlu sayı; aksi 400.
- **Certificates/check:** Sadece cybersecurity, cloud, data_science (siber-guvenlik → cybersecurity) kabul; diğerleri 400.

### Hâlâ eksik (−3)
- **reset-progress:** CSRF token veya double-submit yok; confirm: true tek başına (−1).
- **category (purchase):** Sadece level whitelist var; category için whitelist yok; keyfi string INSERT’e gidebilir (−1).
- **Rate limit:** 15 dk’da 100 istek; abuse için hâlâ yeterli olabilir; login/register için ayrı sıkı limit yok (−1).

---

## 4. Hata yönetimi — 13/15 (değişiklik yok)

- DB tablo/bağlantı hatalarında Türkçe “Veritabanı geçici olarak kullanılamıyor” iyi.
- Bazı route’larda hâlâ “Internal server error” veya İngilizce mesaj; production’da error.message sadece development’ta dönüyor (kabul edilebilir).

---

## 5. Kod yapısı — 10/15 (değişiklik yok)

- Tek 2300+ satırlık server.js; route’lar dosyaya bölünmemiş.
- Purchases çekme mantığı users/me ve purchase response’ta tekrarlanıyor.
- Türkçe/İngilizce mesaj karışık; sabit metinler merkezi değil.

---

## 6. Veritabanı kullanımı — 12/15 (değişiklik yok)

- Parametreli sorgular; N+1 yok.
- module_progress FK eksik; evaluation tarafında 4–5 ardışık sorgu (tek transaction değil).

---

## Puan özeti (güncel)

| Kriter              | Önceki | Şimdi | Max |
|---------------------|--------|--------|-----|
| API / endpoint’ler  | 12     | 19     | 25  |
| Veritabanı şeması   | 14     | 14     | 20  |
| Güvenlik            | 15     | 17     | 20  |
| Hata yönetimi       | 13     | 13     | 15  |
| Kod yapısı          | 10     | 10     | 15  |
| DB kullanımı        | 12     | 12     | 15  |
| **Toplam**          | **76** | **85** | **100** |

---

## Acımasız özet

- **85/100.** Kritik eksikler (time, quiz, simulations/complete) giderildi; fiyat ve sertifika kategorisi sıkılaştırıldı. Değerlendirme raporunun dolması için gerekli veri akışı artık mevcut.
- **Kalan 15 puan:** Şema (user_id TEXT, FK’lar, migration karmaşası), kod bölme ve dil tutarlılığı, input (moduleId/UUID, category purchase), simülasyon duplicate’ı, CSRF. Bunlar olmadan “production-ready ve bakımı kolay” hissi tam oturmuyor.
- **Düzeltilen ek detay:** progress/time’da tek istekte max dakika 86400’den 1440’a (24 saat) çekildi; aksi halde tek istekle 60 günlük süre yazılabiliyordu.

**Sonuç:** Backend artık işlevsel ve güvenlik açığı tarafı sıkılaştırılmış; bir sonraki adım şema temizliği, route/modül ayrıştırma ve küçük iyileştirmelerle 90+ bandına çıkar.
