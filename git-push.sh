#!/bin/bash

# SEBS Global - GitHub'a Otomatik Push Script
# Bu script dosya değişikliklerini GitHub'a gönderir

echo "🔄 Değişiklikler kontrol ediliyor..."

# Tüm değişiklikleri ekle
git add .

# Commit mesajını al
if [ -z "$1" ]; then
    COMMIT_MSG="Güncelleme: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# Commit yap
echo "📝 Commit yapılıyor: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# GitHub'a push et
echo "🚀 GitHub'a gönderiliyor..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Başarıyla GitHub'a gönderildi!"
else
    echo "❌ Hata oluştu. Lütfen GitHub repository URL'inin doğru olduğundan emin olun."
    echo "   GITHUB_SETUP.md dosyasını kontrol edin."
fi
