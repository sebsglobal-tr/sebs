# GitHub Private Repository Kurulum Rehberi

## 1. GitHub'da Private Repository Oluşturma

1. GitHub'a giriş yapın: https://github.com
2. Sağ üst köşedeki "+" butonuna tıklayın
3. "New repository" seçeneğini seçin
4. Repository ayarları:
   - **Repository name**: `sebs-global` (veya istediğiniz bir isim)
   - **Description**: "SEBS Global Eğitim Platformu"
   - **Visibility**: ✅ **Private** seçeneğini işaretleyin
   - ❌ "Initialize this repository with a README" seçeneğini İŞARETLEMEYİN (zaten dosyalarınız var)
5. "Create repository" butonuna tıklayın

## 2. GitHub Repository URL'sini Kopyalama

Repository oluşturulduktan sonra GitHub size bir sayfa gösterecek. Bu sayfada HTTPS veya SSH URL'sini bulacaksınız. Örnek:
- HTTPS: `https://github.com/KULLANICI_ADINIZ/sebs-global.git`
- SSH: `git@github.com:KULLANICI_ADINIZ/sebs-global.git`

## 3. Local Repository'yi GitHub'a Bağlama

Repository URL'sini aldıktan sonra, terminalde şu komutları çalıştırın:

```bash
cd /Users/apple/Desktop/Dosyaar/sebs
git remote add origin GITHUB_REPO_URL_BURAYA
git push -u origin main
```

**Örnek:**
```bash
git remote add origin https://github.com/KULLANICI_ADINIZ/sebs-global.git
git push -u origin main
```

## 4. Otomatik Güncelleme İçin

Her dosya değişikliğinden sonra GitHub'a göndermek için:

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

## 5. GitHub Kimlik Doğrulama

Eğer push yaparken kimlik doğrulama hatası alırsanız:

### Personal Access Token Kullanımı (Önerilen)
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Token adı verin ve `repo` yetkisini seçin
4. Token'ı kopyalayın
5. Push yaparken şifre yerine bu token'ı kullanın

### SSH Key Kullanımı (Alternatif)
1. SSH key oluşturun: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Public key'i GitHub'a ekleyin: Settings → SSH and GPG keys → New SSH key

## Güvenlik Notları

- ✅ `.env` dosyası `.gitignore`'da olduğu için GitHub'a gitmeyecek (güvenli)
- ✅ `node_modules` klasörü `.gitignore`'da (çok büyük olduğu için)
- ✅ Private repository olduğu için sadece siz erişebilirsiniz
