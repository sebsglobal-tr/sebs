# SEBS Global - Eğitim Platformu

SEBS Global, siber güvenlik eğitimleri sunan modern bir web platformudur.

## 🚀 Özellikler

- Kullanıcı kayıt ve giriş sistemi
- E-posta doğrulama
- Modül bazlı eğitim içerikleri
- İnteraktif simülasyonlar
- İlerleme takibi
- Satın alma sistemi
- Dashboard ve istatistikler

## 📋 Gereksinimler

- Node.js 16+
- PostgreSQL veritabanı
- SMTP e-posta servisi (opsiyonel)

## ⚙️ Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
```

3. `.env` dosyasındaki değerleri doldurun (veritabanı, SMTP vb.)

4. Sunucuyu başlatın:
```bash
node server.js
```

## 🔐 Güvenlik

- `.env` dosyası Git'e commit edilmez
- Şifreler bcrypt ile hash'lenir
- JWT token ile kimlik doğrulama
- Rate limiting aktif
- Helmet.js güvenlik başlıkları

## 📝 Lisans

Özel proje - Tüm hakları saklıdır.

## 👤 Geliştirici

Abidin Samet Çay
