# Temel Network — Architecture Reference

## Exact Files Responsible for Cybersecurity Module (Template)

| Responsibility | File | Notes |
|----------------|------|-------|
| **Lesson data** | `modules/guncel-siber-guvenlige-giris.html` | Content hardcoded in `<section class="content-section">` blocks. Each section has `id` and `data-section` matching sidebar links. No separate JSON/DB for lesson content. |
| **Lesson page rendering** | Same file | Each lesson = one `<section class="content-section docx-content">` with `.section-header`, `.content-body`, `.section-inner`. Content is raw HTML (paragraphs, lists, callout-box, tables). |
| **Sidebar navigation** | Same file | `<a class="nav-link-section" data-section="section-id">` inside `<ul class="nav-list">`. Order of links = lesson order. |
| **Progress storage** | `utils/module-progress.js` | `saveLessonProgress(moduleName, lessonName)` → API; `getModuleIdFromName()` for DB. |
| **Progress (in-page)** | `modules/guncel-siber-guvenlige-giris.html` (script block) | `STORAGE_KEY`, `loadProgress()`, `saveProgressLocal()`, `completeLesson(sectionId)`, `markCompletedInSidebar()`, `goToSectionByIndex()`. Uses `navLinks` and `sections` (DOM). |
| **Premium blocks CSS** | `public/css/premium-lesson.css` | `callout-box` (tip/info/warning), `info-table-compact`, `concept-card`, `terimler-block`, `sorular-block`, `scenario-block`. |

## Temel Network — Same Structure

- **Lesson page:** `modules/temel-network-egitimi.html`
- **Module name:** `Temel Network Eğitimi` (MODULE_NAME constant)
- **Lesson IDs:** `lesson-1`, `lesson-2`, … (or `ders-1`, `ders-2`, …) — sequential, no 0.x
- **sidebar:** Same `.nav-link-section` pattern, `Lesson 1`, `Lesson 2`, …
- **progress:** Same `ModuleProgressTracker`, `loadProgress`, `completeLesson` logic

## SEBS Network Lab 1 — Kucuk Ofis Agi Kurulumu ve WAN Baglantisi

### 1) Simulasyonun Amaci

Bu simulasyonun amaci, ogrencinin temel ag bilesenlerini sadece teorik olarak bilmesi degil, uygulamali olarak kurup test etmesidir.

Ogrenci bu senaryoda:

- LAN icinde cihazlari dogru konumlandirmayi
- Switch uzerinden yerel ag baglantisi kurmayi
- IP adreslemesini yapmayi
- Ayni agdaki cihazlarin haberlesmesini test etmeyi
- Router ekleyerek LAN'i WAN'a baglamayi
- Gateway mantigini anlamayi
- Yonlendirme sayesinde uzak aga erismeyi

ogrenir.

Bu yapi temel network guvenligi icin uygundur; cunku guvenlikte ilk adim saldiri analizi degil, agin dogru kurulum mantigini kavramaktir.

### 2) Simulasyon Yapisi

Simulasyon iki asamadan olusur:

- **Asama 1:** Kucuk bir LAN kurulumu
- **Asama 2:** Kurulan LAN'in WAN'a baglanmasi

Bu iki asama birbirine baglidir. Ogrenci ikinci asamaya gecerken sifirdan baslamaz; ilk kurulan LAN altyapisi uzerine WAN katmani eklenir.

### 3) Senaryo Hikayesi

SEBS Academy icin kucuk bir ofis agi kurulacaktir.

Ofiste birden fazla personel bilgisayari, bir yazici ve yerel bir dosya sunucusu bulunmaktadir. Ilk asamada ogrenciden bu cihazlar arasinda calisan bir yerel ag (LAN) kurmasi beklenir. Ikinci asamada sirketin internete/uzak aga cikis ihtiyaci devreye girer ve ogrenci mevcut LAN'i bir router uzerinden WAN baglantisi ile dis aga acar.

Bu hikaye baslangic seviyesi icin gercekci ve ogretici bir akis sunar.

### 4) Kullanilacak Cihazlar

**Asama 1:**

- 1 adet switch
- 3 adet PC
- 1 adet yazici
- 1 adet server

**Asama 2 (ek):**

- 1 adet sirket router'i
- 1 adet ISP router veya WAN cloud
- 1 adet uzak sunucu (dis ag sunucusu)

Istege bagli sade senaryo (baslangic seviyesi):

- 1 switch
- 2 PC
- 1 printer

Egitim etkinligi acisindan 3 PC + 1 printer + 1 server yapisi daha fazla pratik kazandirir.

### 5) Ogrenim Ciktilari

Bu lab tamamlandiginda ogrenci:

- LAN topolojisini cizip uygulayabilir
- Temel IP plani olusturabilir
- Ping ve benzeri testlerle baglanti dogrulamasi yapabilir
- Default gateway kavramini dogru kullanabilir
- Router ile farkli aglar arasi iletisimi saglayabilir
- Temel ag guvenligi calismalari icin gerekli kurulum zeminini hazirlayabilir
