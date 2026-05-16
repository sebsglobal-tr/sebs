# Modül QA — duman testi

## Otomatik kontrol

```bash
python3 scripts/verify_module_qa_paths.py
```

Kontrol edilen yollar:

| Seviye | Dosya |
|--------|--------|
| Başlangıç | `frontend/modules/guncel-siber-guvenlige-giris.html` |
| Orta | `frontend/modules/network-guvenligi.html` |
| İleri | `frontend/modules/penetration-testing.html` |

Her dosyada: `premium-lesson.css`, `module-access-check.js`, `sebs-premium-module-lessons.js`, `quiz-exam.js`.

Bulut: `aws-temelleri.html`, `azure-cloud.html`, `gcp.html` → `sebs-module-lite.css` + yakında metni.

## Manuel (5 dk)

1. Giriş yapmadan modül URL’si → erişim modalı (prod) veya localhost’ta test kullanıcısı.
2. Paket satın almadan `POST /api/progress` → `403` + `PACKAGE_REQUIRED`.
3. Başlangıç modülünde ders geçişi + quiz kaydı.
4. `modules.html` → AWS/Azure/GCP kartları **Yakında** + **Bilgilendirme**.

## Footer

Marketing sayfalarında yasal linkler: `/gizlilik`, `/kullanim-sartlari`, `/kvkk`.
