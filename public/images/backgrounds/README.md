# Premium Arka Plan Görselleri

Bu klasöre premium görünüm için arka plan görselleri ekleyebilirsiniz.

## Önerilen boyutlar
- Hero arka planı: 1920x1080 veya daha büyük
- Sayfa arka planı: 1920x1080 veya daha büyük

## Dosya isimleri
- `hero-bg.jpg` - Ana sayfa hero bölümü
- `section-bg.jpg` - Genel sayfa arka planı

Görselleri ekledikten sonra `public/css/styles.css` dosyasındaki `:root` içindeki `--hero-bg` ve `--section-bg` değişkenlerini güncelleyin:
```css
--hero-bg: url('/images/backgrounds/hero-bg.jpg');
--section-bg: url('/images/backgrounds/section-bg.jpg');
```
