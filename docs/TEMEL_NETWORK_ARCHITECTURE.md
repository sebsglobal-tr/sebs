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
