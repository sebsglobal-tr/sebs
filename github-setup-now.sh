#!/bin/bash

# GitHub Repository Kurulum Script'i
# Kullanıcı: abidinsamet0cay@gmail.com

echo "🚀 GitHub Repository Kurulum Başlatılıyor..."
echo ""

# GitHub kullanıcı adı (e-posta'dan türetilmiş)
GITHUB_USER="abidinsamet0cay"
REPO_NAME="sebs-global"

echo "📋 Repository Bilgileri:"
echo "   Kullanıcı: $GITHUB_USER"
echo "   Repository: $REPO_NAME"
echo "   Visibility: Private"
echo ""

echo "⚠️  ÖNEMLİ: Bu script GitHub'da repository oluşturmaz!"
echo "   Lütfen önce GitHub'da private repository oluşturun:"
echo "   1. https://github.com/new adresine gidin"
echo "   2. Repository name: $REPO_NAME"
echo "   3. Private seçin"
echo "   4. 'Initialize with README' seçeneğini İŞARETLEMEYİN"
echo "   5. 'Create repository' butonuna tıklayın"
echo ""

read -p "GitHub'da repository oluşturdunuz mu? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Önce GitHub'da repository oluşturmanız gerekiyor."
    exit 1
fi

echo ""
echo "📝 Repository URL'ini girin (örnek: https://github.com/$GITHUB_USER/$REPO_NAME.git):"
read -p "URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"
    echo "Varsayılan URL kullanılıyor: $REPO_URL"
fi

echo ""
echo "🔗 Remote repository ekleniyor..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo "📤 GitHub'a gönderiliyor..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Başarıyla GitHub'a gönderildi!"
    echo "🌐 Repository URL: $REPO_URL"
else
    echo ""
    echo "❌ Hata oluştu!"
    echo "   Lütfen şunları kontrol edin:"
    echo "   1. GitHub'da repository oluşturuldu mu?"
    echo "   2. Repository URL'i doğru mu?"
    echo "   3. GitHub kimlik doğrulaması yapıldı mı?"
    echo ""
    echo "   GitHub Personal Access Token oluşturmayı unutmayın:"
    echo "   https://github.com/settings/tokens"
fi
