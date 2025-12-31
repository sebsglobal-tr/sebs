# 🔐 GitHub Personal Access Token Kurulumu

GitHub artık şifre ile push kabul etmiyor. Personal Access Token (PAT) kullanmanız gerekiyor.

## Adım 1: Token Oluşturma

1. GitHub'a giriş yapın: https://github.com
2. Sağ üst köşedeki profil resminize tıklayın
3. **Settings** seçeneğine gidin
4. Sol menüden **Developer settings** seçin
5. **Personal access tokens** → **Tokens (classic)** seçin
6. **Generate new token** → **Generate new token (classic)** butonuna tıklayın

## Adım 2: Token Ayarları

- **Note**: "SEBS Global Project" (veya istediğiniz bir isim)
- **Expiration**: İstediğiniz süre (90 gün önerilir)
- **Select scopes**: 
  - ✅ **repo** (tüm repo yetkileri) - Bu yeterli

7. **Generate token** butonuna tıklayın

## Adım 3: Token'ı Kopyalayın

⚠️ **ÖNEMLİ**: Token sadece bir kez gösterilir! Kopyalayıp güvenli bir yere kaydedin.

## Adım 4: Token ile Push Yapma

Push yaparken şifre yerine bu token'ı kullanın:

```bash
git push origin main
```

Kullanıcı adı: `abidinsamet0cay` (veya GitHub kullanıcı adınız)
Şifre: **Token'ı buraya yapıştırın**

## Alternatif: Token'ı Cache'leme (Mac)

```bash
git config --global credential.helper osxkeychain
```

Bu sayede token'ı bir kez girdikten sonra macOS Keychain'de saklanır.

## Alternatif: URL'de Token Kullanma

```bash
git remote set-url origin https://TOKEN_BURAYA@github.com/abidinsamet0cay/sebs-global.git
```

Not: Bu yöntemde token URL'de görünür, dikkatli olun!
