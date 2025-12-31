# Kullanıcı İlerlemesi Sıfırlama Kılavuzu

Bu kılavuz, kullanıcı ilerlemesini veritabanından sıfırlamak için iki yöntem sunar:

## Yöntem 1: Script ile Sıfırlama

### Kullanım

```bash
node reset-user-progress.js <user_email>
```

### Örnek

```bash
node reset-user-progress.js user@example.com
```

### Ne Yapar?

Script şu işlemleri gerçekleştirir:

1. **Kullanıcıyı Bulur**: Verilen e-posta adresine göre kullanıcıyı bulur
2. **İlerleme Verilerini Siler**:
   - `module_progress` - Modül ilerlemesi
   - `enrollments` - Kurs kayıtları
   - `simulation_runs` - Simülasyon sonuçları
   - `certificates` - Sertifikalar
   - `user_module_progress` - Eski modül ilerlemesi (varsa)
3. **Erişim Seviyesini Sıfırlar**: Kullanıcının `access_level`'ını `beginner` olarak ayarlar
4. **Onay İster**: İşlem öncesi kullanıcıdan onay ister

### Güvenlik

- Script işlem öncesi onay ister
- Tüm işlemler transaction içinde yapılır (hata durumunda geri alınır)
- Silinen kayıt sayısı gösterilir

---

## Yöntem 2: API Endpoint ile Sıfırlama

### Endpoint

```
POST /api/users/reset-progress
```

### Authentication

Bearer token gereklidir.

### Request Body

```json
{
  "targetUserId": "optional-user-id",  // Sadece admin için, yoksa kendi ilerlemesini sıfırlar
  "confirm": true  // Zorunlu: İşlemi onaylamak için true gönderin
}
```

### Örnek: Kendi İlerlemesini Sıfırlama

```javascript
const response = await fetch('http://localhost:8006/api/users/reset-progress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    confirm: true
  })
});

const result = await response.json();
console.log(result);
```

### Örnek: Admin Başka Kullanıcının İlerlemesini Sıfırlama

```javascript
const response = await fetch('http://localhost:8006/api/users/reset-progress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    targetUserId: 'user-uuid-here',
    confirm: true
  })
});
```

### Response

```json
{
  "success": true,
  "message": "Kullanıcı ilerlemesi başarıyla sıfırlandı",
  "data": {
    "userId": "user-uuid",
    "deletedRecords": {
      "module_progress": 5,
      "enrollments": 3,
      "simulation_runs": 10,
      "certificates": 2,
      "user_module_progress": 0
    },
    "totalDeleted": 20
  }
}
```

### Güvenlik

- Sadece kendi ilerlemesini sıfırlayabilir (normal kullanıcı)
- Admin kullanıcılar başka kullanıcıların ilerlemesini sıfırlayabilir
- `confirm: true` zorunludur
- Tüm işlemler transaction içinde yapılır

---

## Sıfırlanan Veriler

Aşağıdaki tablolardaki tüm kullanıcı verileri silinir:

1. **module_progress**: Modül ilerleme kayıtları
2. **enrollments**: Kurs kayıtları
3. **simulation_runs**: Simülasyon sonuçları ve skorları
4. **certificates**: Kazanılan sertifikalar
5. **purchases**: Satın alınan paketler
6. **user_module_progress**: Eski modül ilerlemesi (varsa)

## Sıfırlanmayan Veriler

Aşağıdaki veriler **SİLİNMEZ**:

- Kullanıcı hesabı (`users` tablosu)
- Refresh token'lar (`refresh_tokens` tablosu)

⚠️ **ÖNEMLİ**: Satın alımlar (`purchases`) artık silinmektedir. Kullanıcı tekrar paket satın almak zorunda kalacaktır.

## Notlar

⚠️ **UYARI**: Bu işlem geri alınamaz! Tüm ilerleme verileri kalıcı olarak silinir.

✅ **İYİ HABER**: Satın alımlar korunur, kullanıcı tekrar aynı paketlere erişebilir.

## Örnek Senaryolar

### Senaryo 1: Test Kullanıcısını Sıfırlama

```bash
node reset-user-progress.js test@example.com
```

### Senaryo 2: Kullanıcı Kendi İlerlemesini Sıfırlama

Dashboard'dan veya bir buton ile API endpoint'ini çağırabilir.

### Senaryo 3: Admin Tüm Test Kullanıcılarını Sıfırlama

```bash
# Her kullanıcı için script'i çalıştır
node reset-user-progress.js test1@example.com
node reset-user-progress.js test2@example.com
```

---

## Sorun Giderme

### Hata: "Kullanıcı bulunamadı"

- E-posta adresinin doğru olduğundan emin olun
- Kullanıcının veritabanında kayıtlı olduğunu kontrol edin

### Hata: "Tablo bulunamadı"

- Bazı tablolar mevcut olmayabilir, bu normaldir
- Script bu durumda devam eder ve uyarı verir

### Hata: "İşlem geri alındı"

- Veritabanı bağlantı hatası olabilir
- `.env` dosyasındaki `DATABASE_URL`'i kontrol edin

---

## İletişim

Sorularınız için: [İletişim sayfası](contact.html)

