/**
 * Tüm premium modülleri İşletim Sistemi Güvenliği (Temel) şablonuna yaklaştırır:
 * - module-2-enhanced içerik sınıfı
 * - Bölüm başına kapak görseli + concept-grid (yoksa)
 * - Yan menüde otomatik alt-H2 listesi yok (sadece nav-link-section)
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

    function stripAutoSubNav() {
        document.querySelectorAll('.nav-sublist').forEach(function (el) {
            el.remove();
        });
        document.querySelectorAll('.nav-section-item').forEach(function (li) {
            li.classList.remove('nav-section-item', 'is-open');
        });
        document.querySelectorAll('.nav-link-section .nav-expand-indicator').forEach(function (i) {
            i.remove();
        });
        document.querySelectorAll('.nav-link-section .nav-label').forEach(function (span) {
            var link = span.closest('.nav-link-section');
            if (!link) return;
            var icon = link.querySelector('i.fas, i.fab');
            var text = span.textContent.trim();
            link.textContent = '';
            if (icon) link.appendChild(icon);
            link.appendChild(document.createTextNode(' ' + text));
        });
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

    function buildIntro(section, index) {
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

    function run() {
        stripAutoSubNav();
        enhanceSectionInners();
        var sections = document.querySelectorAll('.module-layout .content-section');
        sections.forEach(function (sec, i) {
            buildIntro(sec, i);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
