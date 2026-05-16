/**
 * Tüm premium modülleri İşletim Sistemi Güvenliği (Temel) şablonuna yaklaştırır:
 * - module-2-enhanced içerik sınıfı
 * - Bölüm başına kapak görseli + concept-grid (yoksa)
 * - Yan menü alt başlıkları sebs-premium-module-lessons.js tarafından üretilir (silinmez)
 */
(function () {
    'use strict';

    if (!document.querySelector('.module-layout')) return;

    var IMAGES = [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1100&q=85',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1100&q=85',
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1100&q=85',
        'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1100&q=85',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1100&q=85',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1100&q=85'
    ];

    var CARD_SETS = [
        [
            { c: 'blue', i: 'fa-bullseye', t: 'Hedef', b: 'Bu bölümde <strong>neyi</strong> öğreneceğinizi netleştirin.' },
            { c: 'amber', i: 'fa-exclamation-triangle', t: 'Risk', b: 'Tehdit, zafiyet ve etkiyi (CIA) ayırarak düşünün.' },
            { c: 'red', i: 'fa-shield-alt', t: 'Savunma', b: 'Kontrol, süreç ve kullanıcı alışkanlığı birlikte çalışır.' }
        ],
        [
            { c: 'blue', i: 'fa-layer-group', t: 'Kavram', b: 'Terimleri bağlam içinde, örneklerle ilişkilendirin.' },
            { c: 'green', i: 'fa-check-double', t: 'Uygulama', b: 'Okuduğunuzu kısa senaryo veya kontrol listesine çevirin.' },
            { c: 'amber', i: 'fa-route', t: 'Akış', b: 'Adımları sırayla takip edin; atlama hata üretir.' }
        ]
    ];

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function enhanceSectionInners() {
        document.querySelectorAll('.module-layout .section-inner').forEach(function (inner) {
            inner.classList.add('module-2-enhanced');
        });
    }

    function sectionTitle(section) {
        var inner = section.querySelector('.section-inner');
        if (!inner) return 'Modül bölümü';
        var h = inner.querySelector('h1, h2');
        if (!h) return 'Modül bölümü';
        return (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    }

    function isSpecialSection(section) {
        if (!section) return true;
        if (section.classList.contains('eval-quiz-section')) return true;
        var inner = section.querySelector('.section-inner');
        if (inner && inner.querySelector('.glossary-table, table.glossary-table')) return true;
        var id = String(section.id || '').toLowerCase();
        return /terimler|glossary|sözlük|sozluk|değerlendirme|degerlendirme|test-soruları|test-sorulari/.test(id);
    }

    function buildIntro(section, index) {
        if (isSpecialSection(section)) return;
        var inner = section.querySelector('.section-inner');
        if (!inner || inner.querySelector('.sg-isletim-intro')) return;
        if (inner.querySelector('.concept-grid') && inner.querySelector('.lesson-image-wrap')) return;

        var title = sectionTitle(section);
        var cards = CARD_SETS[index % CARD_SETS.length];
        var img = IMAGES[index % IMAGES.length];

        var wrap = document.createElement('div');
        wrap.className = 'sg-isletim-intro';

        var html = '';
        if (!inner.querySelector('.lesson-image-wrap')) {
            html +=
                '<div class="lesson-image-wrap">' +
                '<img src="' +
                esc(img) +
                '" alt="" class="lesson-image" loading="lazy" referrerpolicy="no-referrer">' +
                '<p class="lesson-image-caption">' +
                esc(title) +
                '</p></div>';
        }
        if (!inner.querySelector('.concept-grid')) {
            html += '<p class="sg-intro-theme">Modül teması</p><div class="concept-grid">';
            cards.forEach(function (card) {
                html +=
                    '<div class="concept-card ' +
                    card.c +
                    '"><h4><i class="fas ' +
                    card.i +
                    '"></i> ' +
                    esc(card.t) +
                    '</h4><p>' +
                    card.b +
                    '</p></div>';
            });
            html += '</div>';
        }
        wrap.innerHTML = html;

        var anchor = inner.querySelector('h1') || inner.querySelector('h2') || inner.firstElementChild;
        if (anchor && anchor.parentNode === inner) {
            inner.insertBefore(wrap, anchor.nextSibling);
        } else {
            inner.insertBefore(wrap, inner.firstChild);
        }
    }

    function wireMobileMenu() {
        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        var moduleSidebar = document.querySelector('.module-sidebar');
        if (!mobileMenuToggle || !moduleSidebar) return;
        if (mobileMenuToggle.dataset.sebsMobileWired === '1') return;
        mobileMenuToggle.dataset.sebsMobileWired = '1';
        mobileMenuToggle.addEventListener('click', function () {
            moduleSidebar.classList.toggle('open');
            var icon = mobileMenuToggle.querySelector('i');
            if (!icon) return;
            if (moduleSidebar.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        document.addEventListener('click', function (event) {
            if (global.innerWidth > 1024) return;
            if (
                !moduleSidebar.contains(event.target) &&
                !mobileMenuToggle.contains(event.target) &&
                moduleSidebar.classList.contains('open')
            ) {
                moduleSidebar.classList.remove('open');
                var ic = mobileMenuToggle.querySelector('i');
                if (ic) {
                    ic.classList.remove('fa-times');
                    ic.classList.add('fa-bars');
                }
            }
        });
        document.querySelectorAll('.nav-link-section, .nav-link-sub, .nav-item').forEach(function (item) {
            item.addEventListener('click', function () {
                if (global.innerWidth > 1024) return;
                moduleSidebar.classList.remove('open');
                var ic2 = mobileMenuToggle.querySelector('i');
                if (ic2) {
                    ic2.classList.remove('fa-times');
                    ic2.classList.add('fa-bars');
                }
            });
        });
    }

    function run() {
        enhanceSectionInners();
        wireMobileMenu();
        var sections = document.querySelectorAll('.module-layout .content-section');
        sections.forEach(function (sec, i) {
            buildIntro(sec, i);
        });
        if (
            global.SebsPremiumModuleLessons &&
            typeof global.SebsPremiumModuleLessons.refreshSubheadingNav === 'function'
        ) {
            global.SebsPremiumModuleLessons.refreshSubheadingNav();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
