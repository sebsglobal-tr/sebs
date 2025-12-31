# PostgreSQL Veritabanı Kurulum Rehberi

## Adım 1: PostgreSQL Kurulumu

### macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Adım 2: Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
psql postgres

# Veritabanı oluştur
CREATE DATABASE sebsglobal;

# Kullanıcı oluştur (opsiyonel)
CREATE USER sebs_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sebsglobal TO sebs_user;

# Çıkış
\q
```

## Adım 3: Şemayı Yükleme

```bash
psql -U postgres -d sebsglobal -f admin/database-schema.sql
```

## Adım 4: .env Dosyası Oluşturma

Proje ana dizininde `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasına şunları ekleyin:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=sebsglobal
DB_PASSWORD=your_password
DB_PORT=5432
PORT=8006
```

## Adım 5: Node.js Modüllerini Yükleme

```bash
npm install
```

## Adım 6: Backend Sunucuyu Başlatma

```bash
npm start
```

veya development modunda:

```bash
npm run dev
```

## Adım 7: Test

Backend sunucu çalışıyorsa:
```bash
curl http://localhost:8006/api/health
```

Başarılı yanıt:
```json
{"status":"ok","message":"SEBS Global API is running"}
```

## Gerekli Komutlar

### Veritabanına Bağlanma:
```bash
psql -U postgres -d sebsglobal
```

### Tabloları Kontrol Etme:
```sql
\dt
```

### Users Tablosuna Bakma:
```sql
SELECT * FROM users;
```

### Progress Tablosuna Bakma:
```sql
SELECT * FROM user_module_progress;
```

## Sorun Giderme

### PostgreSQL başlamıyor:
```bash
# macOS
brew services restart postgresql@15

# Ubuntu
sudo systemctl restart postgresql
```

### Port 8006 kullanımda:
`.env` dosyasında PORT değiştirin.

### Bağlantı hatası:
`.env` dosyasında DB bilgilerini kontrol edin.

