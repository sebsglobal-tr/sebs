#!/bin/bash

# SEBS Global Sunucu Başlatma Script'i
# Veritabanı bağlantısını test eder ve sunucuyu başlatır

echo "🚀 SEBS Global Sunucu Başlatılıyor..."
echo ""

# Veritabanı bağlantısını test et
echo "🔍 Veritabanı bağlantısı kontrol ediliyor..."
if node fix-database-connection.js > /dev/null 2>&1; then
    echo "✅ Veritabanı bağlantısı başarılı!"
    echo ""
    echo "🌐 Sunucu başlatılıyor..."
    echo "   Port: 8006"
    echo "   URL: http://localhost:8006"
    echo ""
    
    # Sunucuyu başlat
    node server.js
else
    echo "❌ Veritabanı bağlantısı başarısız!"
    echo ""
    echo "📝 Yapılacaklar:"
    echo "   1. DATABASE_FIX_REHBERI.md dosyasını okuyun"
    echo "   2. Supabase Dashboard'dan doğru connection string'i alın"
    echo "   3. .env dosyasını güncelleyin"
    echo ""
    echo "💡 Test için: node fix-database-connection.js"
    exit 1
fi
