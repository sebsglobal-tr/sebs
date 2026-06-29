/**
 * Modül / simülasyon kartlarını satın alınan paket kademesine göre kilitle.
 */
(function () {
    'use strict';

    const TIER_LABELS = {
        beginner: 'İlk Adım',
        intermediate: 'Yükseliş',
        advanced: 'Zirve'
    };

    const PRICING_BY_LEVEL = {
        beginner: '/fiyatlandirma?category=sebs-road&level=ilk-adim',
        intermediate: '/fiyatlandirma?category=sebs-road&level=yukselis',
        advanced: '/fiyatlandirma?category=sebs-road&level=zirve'
    };

    let styleInjected = false;

    function injectStyles() {
        if (styleInjected) return;
        styleInjected = true;
        const style = document.createElement('style');
        style.id = 'road-access-ui-styles';
        style.textContent =
            '.simulation-card-detailed.road-access-locked{position:relative;opacity:0.92}' +
            '.simulation-card-detailed.road-access-locked .card-image-top{filter:grayscale(0.35)}' +
            '.road-access-lock-banner{display:flex;align-items:center;gap:0.5rem;margin-top:0.65rem;padding:0.55rem 0.75rem;border-radius:10px;background:rgba(15,23,42,0.06);border:1px solid rgba(148,163,184,0.45);font-size:0.78rem;font-weight:600;color:#475569}' +
            '.road-access-lock-banner i{color:#d97706}' +
            '.btn-simulation.road-access-btn-locked{pointer-events:none;opacity:0.55;cursor:not-allowed}' +
            'a.btn-simulation.road-access-btn-unlock{display:inline-flex;align-items:center;gap:0.35rem;margin-left:0.35rem;padding:0.45rem 0.9rem;border-radius:999px;background:#0f172a;color:#fff!important;font-size:0.78rem;font-weight:700;text-decoration:none!important;pointer-events:auto;opacity:1}';
        (document.head || document.documentElement).appendChild(style);
    }

    function levelFromBadge(card) {
        const badge = card.querySelector('.level-badge');
        if (!badge) return 'beginner';
        const text = (badge.textContent || '').toLowerCase();
        if (text.includes('ileri') || text.includes('advanced')) return 'advanced';
        if (text.includes('orta') || text.includes('intermediate')) return 'intermediate';
        return 'beginner';
    }

    function slugFromModuleHref(href) {
        const m = String(href || '').match(/\/modules\/([^?#]+)/i);
        return m ? m[1].replace(/\.html$/i, '').toLowerCase() : '';
    }

    function simPathFromHref(href) {
        const m = String(href || '').match(/\/simulation\/([^?#]+)/i);
        return m ? '/simulation/' + m[1] : String(href || '');
    }

    function setCardLocked(card, locked, requiredLevel, customMessage) {
        injectStyles();
        card.classList.toggle('road-access-locked', locked);

        let banner = card.querySelector('.road-access-lock-banner');
        if (locked) {
            if (!banner) {
                banner = document.createElement('p');
                banner.className = 'road-access-lock-banner';
                const footer = card.querySelector('.simulation-footer') || card.querySelector('.simulation-actions') || card;
                footer.appendChild(banner);
            }
            const tier = TIER_LABELS[requiredLevel] || requiredLevel;
            banner.innerHTML =
                '<i class="fas fa-lock" aria-hidden="true"></i> ' +
                (customMessage || tier + ' planı veya üst paket gerekir');
        } else if (banner) {
            banner.remove();
        }

        card.querySelectorAll('.btn-simulation, .btn-start-module').forEach((btn) => {
            if (locked) {
                btn.classList.add('road-access-btn-locked');
                btn.setAttribute('aria-disabled', 'true');
                let unlock = btn.parentElement && btn.parentElement.querySelector('a.road-access-btn-unlock');
                if (!unlock) {
                    unlock = document.createElement('a');
                    unlock.className = 'road-access-btn-unlock';
                    unlock.textContent = (TIER_LABELS[requiredLevel] || 'Plan') + ' — Satın Al';
                    unlock.href = PRICING_BY_LEVEL[requiredLevel] || '/fiyatlandirma';
                    btn.insertAdjacentElement('afterend', unlock);
                }
            } else {
                btn.classList.remove('road-access-btn-locked');
                btn.removeAttribute('aria-disabled');
                const unlock = btn.parentElement && btn.parentElement.querySelector('a.road-access-btn-unlock');
                if (unlock) unlock.remove();
            }
        });
    }

    async function applyModuleCardLocks() {
        if (!window.AccessControl || !window.AccessControl.checkModuleAccess) return 0;
        const cards = document.querySelectorAll('.simulation-card-detailed[data-category]');
        let locked = 0;
        for (const card of cards) {
            const link = card.querySelector('a[href*="/modules/"]');
            if (!link) continue;
            const href = link.getAttribute('href') || '';
            if (href.includes('coming-soon') || href.includes('web-uygulama-guvenligi')) continue;

            const slug = slugFromModuleHref(href);
            const category = card.dataset.category || 'cybersecurity';
            const access = await window.AccessControl.checkModuleAccess(slug || levelFromBadge(card), category);
            const required =
                window.AccessControl.getModuleLevel && slug
                    ? window.AccessControl.getModuleLevel(slug)
                    : levelFromBadge(card);
            setCardLocked(card, !access.hasAccess, required, access.hasAccess ? '' : access.message);
            if (!access.hasAccess) locked++;
        }
        return locked;
    }

    async function applySimulationCardLocks() {
        if (!window.AccessControl || !window.AccessControl.checkSimulationAccess) return 0;
        const cards = document.querySelectorAll('.simulation-card-detailed[data-category]');
        let locked = 0;
        for (const card of cards) {
            const link = card.querySelector('a[href*="/simulation/"]');
            if (!link) continue;
            const href = link.getAttribute('href') || '';
            const path = simPathFromHref(href);
            const category = card.dataset.category || 'cybersecurity';
            const access = await window.AccessControl.checkSimulationAccess(path, category);
            const required =
                window.AccessControl.getSimulationLevelFromPath
                    ? window.AccessControl.getSimulationLevelFromPath(path)
                    : levelFromBadge(card);
            setCardLocked(card, !access.hasAccess, required, access.hasAccess ? '' : access.message);
            if (!access.hasAccess) locked++;
        }
        return locked;
    }

    async function refresh(mode) {
        injectStyles();
        if (mode === 'simulations') {
            return applySimulationCardLocks();
        }
        if (mode === 'modules') {
            return applyModuleCardLocks();
        }
        const a = await applyModuleCardLocks();
        const b = await applySimulationCardLocks();
        return a + b;
    }

    window.RoadAccessUI = {
        refresh,
        applyModuleCardLocks,
        applySimulationCardLocks,
        setCardLocked
    };
})();
