// Yükleme ekranı sorunlarını test etme script'i
// Tarayıcı console'unda çalıştırılabilir

console.log('🔍 Yükleme Ekranı Kontrolü...');

const loadingOverlay = document.getElementById('loadingOverlay');
if (!loadingOverlay) {
    console.error('❌ loadingOverlay elementi bulunamadı!');
} else {
    console.log('✅ loadingOverlay elementi bulundu');
    console.log('   Display:', window.getComputedStyle(loadingOverlay).display);
    console.log('   Visibility:', window.getComputedStyle(loadingOverlay).visibility);
    console.log('   Opacity:', window.getComputedStyle(loadingOverlay).opacity);
    console.log('   Classes:', loadingOverlay.className);
    
    const logo = loadingOverlay.querySelector('.loading-logo img');
    if (logo) {
        console.log('✅ Logo img elementi bulundu');
        console.log('   Src:', logo.src);
        console.log('   Complete:', logo.complete);
        console.log('   Natural width:', logo.naturalWidth);
        
        if (logo.naturalWidth === 0) {
            console.warn('⚠️  Logo görseli yüklenemedi!');
            console.log('💡 SVG fallback kullanılacak');
        }
    } else {
        console.warn('⚠️  Logo img elementi bulunamadı!');
    }
    
    // Manuel olarak gizlemek için
    console.log('\n💡 Yükleme ekranını manuel gizlemek için:');
    console.log('   hideLoadingScreen() fonksiyonunu çağırın veya:');
    console.log('   document.getElementById("loadingOverlay").classList.add("hidden");');
}

// Manuel gizleme fonksiyonu
window.hideLoadingScreen = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
        console.log('✅ Yükleme ekranı gizlendi');
    }
};
