# 🚀 Hızlı Başlangıç - GitHub'a Push

## İlk Kurulum (Bir Kez)

1. **GitHub'da Private Repository Oluşturun**
   - GitHub'a giriş yapın
   - "New repository" → Private seçin → Oluşturun
   - Repository URL'ini kopyalayın (örnek: `https://github.com/KULLANICI_ADINIZ/sebs-global.git`)

2. **Repository'yi Bağlayın**
   ```bash
   git remote add origin GITHUB_REPO_URL_BURAYA
   git push -u origin main
   ```

## Her Değişiklikten Sonra GitHub'a Gönderme

### Seçenek 1: Otomatik Script (Önerilen)
```bash
./git-push.sh "Değişiklik açıklaması"
```

### Seçenek 2: Manuel Komutlar
```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

## Önemli Notlar

⚠️ **İlk push'tan önce GitHub repository URL'ini eklemeniz gerekir!**

Detaylı kurulum için `GITHUB_SETUP.md` dosyasına bakın.
