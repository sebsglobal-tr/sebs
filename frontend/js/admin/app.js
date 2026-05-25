(function () {
    'use strict';

    const TITLES = {
        dashboard: 'Özet',
        users: 'Kullanıcılar',
        pricing: 'Fiyatlandırma',
        purchases: 'Satın almalar',
        orders: 'Ödeme siparişleri'
    };

    const CAT_LABELS = {
        cybersecurity: 'Siber güvenlik',
        cloud: 'Bulut',
        'data-science': 'Veri bilimi'
    };

    const LEVEL_LABELS = {
        beginner: 'Başlangıç',
        intermediate: 'Orta',
        advanced: 'İleri'
    };

    let currentView = 'dashboard';
    let userSearch = '';
    let userListOffset = 0;
    const userListLimit = 50;
    let pricingDraft = null;

    function apiBase() {
        if (typeof window.getSebsApiBase === 'function') return window.getSebsApiBase();
        return window.location.origin + '/api';
    }

    async function getToken() {
        try {
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                const gr = await window.supabaseAuthSystem.supabase.auth.getSession();
                if (gr?.data?.session?.access_token) {
                    localStorage.setItem('authToken', gr.data.session.access_token);
                    return gr.data.session.access_token;
                }
            }
        } catch (e) {
            /* */
        }
        return localStorage.getItem('authToken');
    }

    async function api(path, options) {
        const token = await getToken();
        if (!token) throw new Error('Giriş gerekli');
        const res = await fetch(apiBase() + path, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
                ...(options && options.headers)
            }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.message || res.statusText || 'İstek başarısız');
            err.status = res.status;
            if (res.status === 403) {
                denyAdminAccess();
            }
            throw err;
        }
        return data;
    }

    function denyAdminAccess() {
        document.documentElement.classList.remove('admin-ready');
    }

    function allowAdminAccess() {
        document.documentElement.classList.add('admin-ready');
    }

    async function getSessionEmail() {
        try {
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                const gr = await window.supabaseAuthSystem.supabase.auth.getSession();
                return gr?.data?.session?.user?.email || '';
            }
        } catch (e) {
            /* */
        }
        return '';
    }

    function showDeniedDetail(sessionEmail, role, apiMessage) {
        const el = document.getElementById('adminDeniedDetail');
        if (!el) return;
        const parts = [];
        if (sessionEmail) parts.push('Oturum: ' + sessionEmail);
        if (role) parts.push('Rol: ' + role);
        if (apiMessage) parts.push(apiMessage);
        el.textContent = parts.join(' · ');
    }

    async function assertAdminRole() {
        const token = await getToken();
        const sessionEmail = await getSessionEmail();
        const me = await fetch(apiBase() + '/admin/me', {
            headers: { Authorization: 'Bearer ' + token }
        });
        const body = await me.json().catch(() => ({}));
        if (me.ok && body.success) {
            return body;
        }
        if (me.status === 403) {
            let role = 'user';
            try {
                const probe = await fetch(apiBase() + '/users/me', {
                    headers: { Authorization: 'Bearer ' + token }
                });
                const probeBody = await probe.json().catch(() => ({}));
                role = probeBody.data?.role || role;
                if (!sessionEmail && probeBody.data?.email) {
                    showDeniedDetail(probeBody.data.email, role, body.message);
                } else {
                    showDeniedDetail(sessionEmail, role, body.message);
                }
            } catch (e) {
                showDeniedDetail(sessionEmail, role, body.message);
            }
            const err = new Error(body.message || 'Yönetici değil');
            err.status = 403;
            throw err;
        }
        if (!me.ok) {
            const err = new Error(body.message || 'Oturum gerekli');
            err.status = me.status;
            throw err;
        }
        return body;
    }

    function esc(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function fmtDate(d) {
        if (!d) return '—';
        try {
            return new Date(d).toLocaleString('tr-TR');
        } catch {
            return d;
        }
    }

    function fmtMoney(n) {
        const v = Number(n);
        if (Number.isNaN(v)) return '—';
        return v.toLocaleString('tr-TR') + ' ₺';
    }

    function roleBadge(role) {
        const r = esc(role || 'user');
        return '<span class="admin-badge admin-badge--' + esc(role) + '">' + r + '</span>';
    }

    function toast(msg) {
        const el = document.getElementById('adminToast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('is-visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () {
            el.classList.remove('is-visible');
        }, 2800);
    }

    function setView(name) {
        currentView = name;
        document.querySelectorAll('#adminNav a').forEach(function (a) {
            a.classList.toggle('is-active', a.dataset.view === name);
        });
        const title = document.getElementById('adminPageTitle');
        if (title) title.textContent = TITLES[name] || name;
        location.hash = name;
        renderView();
    }

    async function renderView() {
        const box = document.getElementById('adminContent');
        if (!box) return;
        box.innerHTML = '<div class="admin-loading">Yükleniyor…</div>';
        try {
            if (currentView === 'dashboard') await renderDashboard(box);
            else if (currentView === 'users') await renderUsers(box);
            else if (currentView === 'pricing') await renderPricing(box);
            else if (currentView === 'purchases') await renderPurchases(box);
            else if (currentView === 'orders') await renderOrders(box);
        } catch (e) {
            box.innerHTML =
                '<div class="admin-card" style="padding:2rem;text-align:center;color:#b91c1c;">' +
                esc(e.message) +
                '</div>';
        }
    }

    async function renderDashboard(box) {
        const res = await api('/admin/stats');
        const d = res.data || {};
        const roles = (d.roles || [])
            .map(function (r) {
                return '<li>' + esc(r.role) + ': <strong>' + r.c + '</strong></li>';
            })
            .join('');

        box.innerHTML =
            '<div class="admin-stat-grid">' +
            statCard('Toplam kullanıcı', d.totalUsers) +
            statCard('Aktif satın alma', d.activePurchases) +
            statCard('Ödenen sipariş', d.paidOrders) +
            statCard('Gelir (TRY)', fmtMoney(d.revenueTry)) +
            '</div>' +
            '<div class="admin-card"><div class="admin-card-head"><h2>Rol dağılımı</h2></div>' +
            '<div style="padding:1rem 1.25rem;"><ul style="margin:0;padding-left:1.25rem;color:#475569;">' +
            (roles || '<li>Veri yok</li>') +
            '</ul></div></div>';
    }

    function statCard(label, value) {
        return (
            '<div class="admin-stat"><div class="label">' +
            esc(label) +
            '</div><div class="value">' +
            esc(value) +
            '</div></div>'
        );
    }

    function usersQueryString() {
        const params = new URLSearchParams();
        params.set('limit', String(userListLimit));
        params.set('offset', String(userListOffset));
        if (userSearch) params.set('q', userSearch);
        return '?' + params.toString();
    }

    async function renderUsers(box) {
        const res = await api('/admin/users' + usersQueryString());
        const users = res.data?.users || [];
        const total = res.data?.total || 0;
        const limit = res.data?.limit || userListLimit;
        const offset = res.data?.offset ?? userListOffset;
        const from = total === 0 ? 0 : offset + 1;
        const to = Math.min(offset + users.length, total);
        const hasPrev = offset > 0;
        const hasNext = offset + users.length < total;

        const rows = users
            .map(function (u) {
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
                return (
                    '<tr><td>' +
                    esc(u.email) +
                    '</td><td>' +
                    esc(name) +
                    '</td><td>' +
                    roleBadge(u.role) +
                    '</td><td>' +
                    esc(u.access_level || '—') +
                    '</td><td>' +
                    (u.is_active ? 'Aktif' : 'Pasif') +
                    '</td><td>' +
                    fmtDate(u.created_at) +
                    '</td><td><button type="button" class="admin-btn admin-btn--ghost" data-user-id="' +
                    esc(u.id) +
                    '">Düzenle</button></td></tr>'
                );
            })
            .join('');

        box.innerHTML =
            '<div class="admin-card">' +
            '<div class="admin-card-head">' +
            '<h2>Kullanıcılar (' +
            total +
            ')</h2>' +
            '<div class="admin-card-head-actions">' +
            '<input type="search" class="admin-search" id="userSearchInput" placeholder="E-posta veya ad ara…" value="' +
            esc(userSearch) +
            '">' +
            '<button type="button" class="admin-btn admin-btn--ghost" id="syncSupabaseUsersBtn" title="Supabase Auth kayıtlarını veritabanına aktarır">' +
            '<i class="fas fa-cloud-download-alt"></i> Supabase senkron' +
            '</button>' +
            '</div></div>' +
            (total > limit && !userSearch
                ? '<p class="admin-list-hint">Liste sayfalıdır; özet kartındaki toplam (' +
                  total +
                  ') ile tabloda görünen (' +
                  limit +
                  ' kayıt/sayfa) farklı olabilir. Tüm kayıtlar için sayfalar arasında geçin veya arama kullanın.</p>'
                : '') +
            '<div style="overflow-x:auto;"><table class="admin-table"><thead><tr>' +
            '<th>E-posta</th><th>Ad</th><th>Rol</th><th>Seviye</th><th>Durum</th><th>Kayıt</th><th></th>' +
            '</tr></thead><tbody>' +
            (rows || '<tr><td colspan="7">Kullanıcı bulunamadı</td></tr>') +
            '</tbody></table></div>' +
            '<div class="admin-pagination">' +
            '<span class="admin-pagination__info">Gösterilen: ' +
            from +
            '–' +
            to +
            ' / ' +
            total +
            '</span>' +
            '<div class="admin-pagination__btns">' +
            '<button type="button" class="admin-btn admin-btn--ghost" id="usersPrevPage"' +
            (hasPrev ? '' : ' disabled') +
            '>Önceki</button>' +
            '<button type="button" class="admin-btn admin-btn--ghost" id="usersNextPage"' +
            (hasNext ? '' : ' disabled') +
            '>Sonraki</button>' +
            '</div></div></div>';

        const searchEl = document.getElementById('userSearchInput');
        if (searchEl) {
            let debounce;
            searchEl.addEventListener('input', function () {
                clearTimeout(debounce);
                debounce = setTimeout(function () {
                    userSearch = searchEl.value.trim();
                    userListOffset = 0;
                    renderUsers(box);
                }, 350);
            });
        }

        const syncBtn = document.getElementById('syncSupabaseUsersBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', async function () {
                if (!confirm('Supabase Auth\'taki tüm kullanıcılar veritabanına aktarılsın mı?')) return;
                syncBtn.disabled = true;
                try {
                    const syncRes = await api('/admin/users/sync-supabase', { method: 'POST' });
                    toast(syncRes.message || 'Senkron tamamlandı');
                    userListOffset = 0;
                    await renderUsers(box);
                } catch (e) {
                    toast(e.message || 'Senkron başarısız');
                } finally {
                    syncBtn.disabled = false;
                }
            });
        }

        const prevBtn = document.getElementById('usersPrevPage');
        const nextBtn = document.getElementById('usersNextPage');
        if (prevBtn && hasPrev) {
            prevBtn.addEventListener('click', function () {
                userListOffset = Math.max(0, offset - limit);
                renderUsers(box);
            });
        }
        if (nextBtn && hasNext) {
            nextBtn.addEventListener('click', function () {
                userListOffset = offset + limit;
                renderUsers(box);
            });
        }

        box.querySelectorAll('[data-user-id]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openUserDrawer(btn.getAttribute('data-user-id'));
            });
        });
    }

    async function openUserDrawer(userId) {
        const drawer = document.getElementById('adminDrawer');
        const body = document.getElementById('adminDrawerBody');
        if (!drawer || !body) return;
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        body.innerHTML = '<div class="admin-loading">Yükleniyor…</div>';

        drawer.addEventListener(
            'click',
            function onBg(e) {
                if (e.target === drawer) closeDrawer();
            },
            { once: true }
        );

        try {
            const res = await api('/admin/users/' + encodeURIComponent(userId));
            const u = res.data?.user;
            const purchases = res.data?.purchases || [];
            if (!u) throw new Error('Kullanıcı bulunamadı');

            const purchaseList = purchases.length
                ? purchases
                      .map(function (p) {
                          return (
                              '<li>' +
                              esc(p.category) +
                              ' / ' +
                              esc(p.level) +
                              ' — ' +
                              (p.is_active ? 'aktif' : 'pasif') +
                              ' (' +
                              fmtMoney(p.price) +
                              ')</li>'
                          );
                      })
                      .join('')
                : '<li>Paket yok</li>';

            body.innerHTML =
                '<h2 style="margin:0 0 1rem;font-size:1.1rem;">' +
                esc(u.email) +
                '</h2>' +
                '<div class="admin-field"><label>Rol</label><select id="editRole">' +
                ['user', 'admin', 'instructor']
                    .map(function (r) {
                        return (
                            '<option value="' +
                            r +
                            '"' +
                            (u.role === r ? ' selected' : '') +
                            '>' +
                            r +
                            '</option>'
                        );
                    })
                    .join('') +
                '</select></div>' +
                '<div class="admin-field"><label>Erişim seviyesi</label><select id="editAccess">' +
                ['beginner', 'intermediate', 'advanced']
                    .map(function (l) {
                        return (
                            '<option value="' +
                            l +
                            '"' +
                            (u.access_level === l ? ' selected' : '') +
                            '>' +
                            l +
                            '</option>'
                        );
                    })
                    .join('') +
                '</select></div>' +
                '<div class="admin-field"><label><input type="checkbox" id="editActive"' +
                (u.is_active ? ' checked' : '') +
                '> Hesap aktif</label></div>' +
                '<div class="admin-field"><label><input type="checkbox" id="editVerified"' +
                (u.is_verified ? ' checked' : '') +
                '> E-posta doğrulandı</label></div>' +
                '<button type="button" class="admin-btn admin-btn--primary" id="saveUserBtn" style="width:100%;margin-bottom:1rem;">Kaydet</button>' +
                '<hr style="border:none;border-top:1px solid #f1f5f9;margin:1rem 0;">' +
                '<h3 style="font-size:0.9rem;margin:0 0 0.5rem;">Paketler</h3><ul style="font-size:0.8rem;color:#64748b;padding-left:1.1rem;">' +
                purchaseList +
                '</ul>' +
                '<h3 style="font-size:0.9rem;margin:1rem 0 0.5rem;">Paket tanımla</h3>' +
                '<div class="admin-field"><label>Kategori</label><select id="grantCat">' +
                Object.keys(CAT_LABELS)
                    .map(function (k) {
                        return '<option value="' + k + '">' + CAT_LABELS[k] + '</option>';
                    })
                    .join('') +
                '</select></div>' +
                '<div class="admin-field"><label>Seviye</label><select id="grantLevel">' +
                Object.keys(LEVEL_LABELS)
                    .map(function (k) {
                        return '<option value="' + k + '">' + LEVEL_LABELS[k] + '</option>';
                    })
                    .join('') +
                '</select></div>' +
                '<button type="button" class="admin-btn admin-btn--primary" id="grantPkgBtn" style="width:100%;margin-bottom:0.5rem;">Paket ver</button>' +
                '<button type="button" class="admin-btn admin-btn--danger" id="revokePkgBtn" style="width:100%;">Paketi kaldır</button>' +
                '<button type="button" class="admin-btn admin-btn--ghost" id="closeDrawerBtn" style="width:100%;margin-top:1rem;">Kapat</button>';

            document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
            document.getElementById('saveUserBtn').addEventListener('click', async function () {
                try {
                    await api('/admin/users/' + encodeURIComponent(userId), {
                        method: 'PATCH',
                        body: JSON.stringify({
                            role: document.getElementById('editRole').value,
                            access_level: document.getElementById('editAccess').value,
                            is_active: document.getElementById('editActive').checked,
                            is_verified: document.getElementById('editVerified').checked
                        })
                    });
                    toast('Kullanıcı güncellendi');
                    closeDrawer();
                    renderView();
                } catch (e) {
                    toast(e.message);
                }
            });
            document.getElementById('grantPkgBtn').addEventListener('click', async function () {
                try {
                    await api('/admin/users/' + encodeURIComponent(userId) + '/grant-package', {
                        method: 'POST',
                        body: JSON.stringify({
                            category: document.getElementById('grantCat').value,
                            level: document.getElementById('grantLevel').value
                        })
                    });
                    toast('Paket tanımlandı');
                    openUserDrawer(userId);
                } catch (e) {
                    toast(e.message);
                }
            });
            document.getElementById('revokePkgBtn').addEventListener('click', async function () {
                try {
                    await api('/admin/users/' + encodeURIComponent(userId) + '/revoke-package', {
                        method: 'POST',
                        body: JSON.stringify({
                            category: document.getElementById('grantCat').value,
                            level: document.getElementById('grantLevel').value
                        })
                    });
                    toast('Paket kaldırıldı');
                    openUserDrawer(userId);
                } catch (e) {
                    toast(e.message);
                }
            });
        } catch (e) {
            body.innerHTML = '<p style="color:#b91c1c;">' + esc(e.message) + '</p>';
        }
    }

    function closeDrawer() {
        const drawer = document.getElementById('adminDrawer');
        if (drawer) {
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
        }
    }

    async function renderPricing(box) {
        const res = await api('/admin/pricing');
        pricingDraft = JSON.parse(JSON.stringify(res.data?.prices || {}));
        let html = '<div class="admin-card" style="padding:1.25rem;"><div class="admin-price-grid">';
        Object.keys(CAT_LABELS).forEach(function (cat) {
            html += '<div class="admin-price-cat"><h3>' + CAT_LABELS[cat] + '</h3>';
            Object.keys(LEVEL_LABELS).forEach(function (lvl) {
                const val = pricingDraft[cat]?.[lvl] ?? 0;
                html +=
                    '<div class="admin-price-row"><label>' +
                    LEVEL_LABELS[lvl] +
                    '</label><input type="number" min="0" step="1" data-cat="' +
                    cat +
                    '" data-lvl="' +
                    lvl +
                    '" value="' +
                    val +
                    '"></div>';
            });
            html += '</div>';
        });
        html +=
            '</div><button type="button" class="admin-btn admin-btn--primary" id="savePricingBtn" style="margin-top:1rem;">Fiyatları kaydet</button></div>';
        box.innerHTML = html;

        document.getElementById('savePricingBtn').addEventListener('click', async function () {
            box.querySelectorAll('input[data-cat]').forEach(function (inp) {
                const c = inp.getAttribute('data-cat');
                const l = inp.getAttribute('data-lvl');
                if (!pricingDraft[c]) pricingDraft[c] = {};
                pricingDraft[c][l] = Number(inp.value);
            });
            try {
                await api('/admin/pricing', {
                    method: 'PUT',
                    body: JSON.stringify({ prices: pricingDraft })
                });
                toast('Fiyatlar kaydedildi');
            } catch (e) {
                toast(e.message);
            }
        });
    }

    async function renderPurchases(box) {
        const res = await api('/admin/purchases?limit=50');
        const rows = (res.data || [])
            .map(function (p) {
                return (
                    '<tr><td>' +
                    esc(p.email || p.user_id) +
                    '</td><td>' +
                    esc(p.category) +
                    '</td><td>' +
                    esc(p.level) +
                    '</td><td>' +
                    fmtMoney(p.price) +
                    '</td><td>' +
                    esc(p.payment_status) +
                    '</td><td>' +
                    (p.is_active ? 'Evet' : 'Hayır') +
                    '</td><td>' +
                    fmtDate(p.purchased_at) +
                    '</td></tr>'
                );
            })
            .join('');
        box.innerHTML =
            '<div class="admin-card"><div class="admin-card-head"><h2>Son satın almalar</h2></div>' +
            '<div style="overflow-x:auto;"><table class="admin-table"><thead><tr>' +
            '<th>Kullanıcı</th><th>Kategori</th><th>Seviye</th><th>Fiyat</th><th>Ödeme</th><th>Aktif</th><th>Tarih</th>' +
            '</tr></thead><tbody>' +
            (rows || '<tr><td colspan="7">Kayıt yok</td></tr>') +
            '</tbody></table></div></div>';
    }

    async function renderOrders(box) {
        const res = await api('/admin/payment-orders?limit=50');
        const rows = (res.data || [])
            .map(function (o) {
                return (
                    '<tr><td>' +
                    esc(o.email || o.user_id) +
                    '</td><td>' +
                    esc(o.package_key || o.category) +
                    '</td><td>' +
                    fmtMoney(o.amount || o.price) +
                    '</td><td>' +
                    esc(o.status) +
                    '</td><td>' +
                    esc(o.conversation_id || '—') +
                    '</td><td>' +
                    fmtDate(o.created_at) +
                    '</td></tr>'
                );
            })
            .join('');
        box.innerHTML =
            '<div class="admin-card"><div class="admin-card-head"><h2>Ödeme siparişleri</h2></div>' +
            '<div style="overflow-x:auto;"><table class="admin-table"><thead><tr>' +
            '<th>Kullanıcı</th><th>Paket</th><th>Tutar</th><th>Durum</th><th>Referans</th><th>Tarih</th>' +
            '</tr></thead><tbody>' +
            (rows || '<tr><td colspan="6">Kayıt yok</td></tr>') +
            '</tbody></table></div></div>';
    }

    async function init() {
        const gate = document.getElementById('adminGate');
        const denied = document.getElementById('adminDenied');
        const appEl = document.getElementById('adminApp');

        if (typeof window.syncSebsSessionCookie === 'function') {
            await window.syncSebsSessionCookie();
        }

        const token = await getToken();
        if (!token) {
            window.location.replace('/login.html?redirect=' + encodeURIComponent('/admin'));
            return;
        }

        try {
            if (!window.supabaseAuthSystem && typeof SupabaseAuthSystem !== 'undefined') {
                window.supabaseAuthSystem = new SupabaseAuthSystem();
                await new Promise(function (r) {
                    setTimeout(r, 400);
                });
            }
            const meRes = await assertAdminRole();
            allowAdminAccess();
            if (gate) gate.style.display = 'none';
            if (denied) denied.style.display = 'none';
            if (appEl) appEl.style.display = 'flex';

            const emailEl = document.getElementById('adminUserEmail');
            if (emailEl) emailEl.textContent = meRes.data?.email || '';

            document.querySelectorAll('#adminNav a').forEach(function (a) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    setView(a.dataset.view);
                });
            });
            document.getElementById('adminRefreshBtn')?.addEventListener('click', renderView);

            const hash = (location.hash || '#dashboard').replace('#', '');
            setView(TITLES[hash] ? hash : 'dashboard');
        } catch (e) {
            if (e.status === 401) {
                window.location.replace('/login.html?redirect=' + encodeURIComponent('/admin'));
                return;
            }
            if (e.status === 403) {
                if (gate) gate.style.display = 'none';
                if (denied) denied.style.display = 'flex';
                return;
            }
            allowAdminAccess();
            if (gate) gate.style.display = 'none';
            if (denied) denied.style.display = 'flex';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
