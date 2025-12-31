# 📧 SEBS Global E-posta Doğrulama Sistemi

Bu sistem gerçek e-posta gönderimi ile çalışan bir doğrulama sistemi sağlar.

## 🚀 Hızlı Başlangıç

### 1. Gmail App Password Alın

1. Gmail hesabınıza giriş yapın
2. [Google Hesap Ayarları](https://myaccount.google.com/)'na gidin
3. **Güvenlik** > **2 Adımlı Doğrulama**'yı açın
4. **Uygulama şifreleri** > **Uygulama şifresi oluştur**
5. **Mail** seçin ve 16 karakterli şifreyi kopyalayın

### 2. Konfigürasyon Dosyasını Düzenleyin

`email_config.py` dosyasını açın ve şu bilgileri güncelleyin:

```python
SENDER_EMAIL = "your-email@gmail.com"
SENDER_PASSWORD = "your-16-character-app-password"
```

### 3. Test Edin

```bash
python3 test_email.py
```

### 4. API'yi Başlatın

```bash
python3 email_api.py
```

## 📁 Dosya Yapısı

```
├── email_api.py          # Ana API server
├── email_config.py       # E-posta konfigürasyonu
├── test_email.py         # E-posta test scripti
├── verification.db       # SQLite veritabanı (otomatik oluşur)
├── signup.html          # Üye ol sayfası
├── verify-email.html    # E-posta doğrulama sayfası
└── login.html           # Giriş sayfası
```

## 🔧 API Endpoints

### POST /send-verification
E-posta doğrulama kodu gönderir.

**Request:**
```json
{
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "message": "Doğrulama kodu gönderildi",
    "code": "123456"
}
```

### POST /verify-code
E-posta doğrulama kodunu kontrol eder.

**Request:**
```json
{
    "email": "user@example.com",
    "code": "123456"
}
```

**Response:**
```json
{
    "message": "E-posta doğrulandı",
    "verified": true
}
```

## 🛡️ Güvenlik Özellikleri

- ✅ Temp mail engelleme (40+ domain)
- ✅ 6 haneli random kod üretimi
- ✅ 10 dakika kod geçerlilik süresi
- ✅ SQLite veritabanı ile kod saklama
- ✅ CORS desteği
- ✅ Hata yönetimi

## 📧 E-posta Servisleri

### Gmail (Önerilen)
```python
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
```

### Outlook/Hotmail
```python
SMTP_SERVER = "smtp-mail.outlook.com"
SMTP_PORT = 587
```

### Yahoo
```python
SMTP_SERVER = "smtp.mail.yahoo.com"
SMTP_PORT = 587
```

## 🐛 Sorun Giderme

### "SMTPAuthenticationError" Hatası
- Gmail App Password'ünüzü kontrol edin
- 2 Adımlı Doğrulama'nın açık olduğundan emin olun

### "Address already in use" Hatası
- Port 8002'nin kullanımda olduğunu gösterir
- `pkill -f email_api.py` ile eski process'i sonlandırın

### E-posta Gelmiyor
- Spam klasörünü kontrol edin
- SMTP ayarlarınızı doğrulayın
- `test_email.py` ile test edin

## 📱 Frontend Entegrasyonu

Frontend sayfaları otomatik olarak API'yi kullanır:

1. **Üye Ol** (`signup.html`): Form gönderimi
2. **E-posta Doğrula** (`verify-email.html`): Kod doğrulama
3. **Otomatik Giriş**: Başarılı doğrulama sonrası

## 🔄 Demo Modu

Konfigürasyon dosyası yoksa sistem demo modunda çalışır:
- Kodlar konsola yazdırılır
- Gerçek e-posta gönderilmez
- Test amaçlı kullanım için uygundur

## 📞 Destek

Sorunlarınız için:
- GitHub Issues açın
- E-posta: support@sebs-global.com
- Telegram: @sebsglobal

---

**© 2024 SEBS Global. Tüm hakları saklıdır.**
