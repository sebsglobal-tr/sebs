/**
 * Network Güvenliği — örnekleri terminal görünümüyle gösterir.
 */
(function (global) {
    'use strict';

    var path = (typeof location !== 'undefined' && location.pathname) || '';
    if (path.indexOf('network-guvenligi') === -1) return;
    if (!document.querySelector('.module-layout')) return;

    function termLine(type, text) {
        var esc = String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        if (type === 'prompt') return '<span class="term-prompt">' + esc + '</span> ';
        if (type === 'cmd') return '<span class="term-cmd">' + esc + '</span>';
        if (type === 'comment') return '<span class="term-comment">' + esc + '</span>';
        return '<span class="term-output">' + esc + '</span>';
    }

    function buildTerminal(kind, title, ariaLabel, lines) {
        var cls =
            kind === 'win' ? 'windows-terminal' : kind === 'mac' ? 'macos-terminal' : 'linux-terminal';
        var body = lines
            .map(function (row) {
                if (row.length === 1) return termLine('output', row[0]);
                return termLine(row[0], row[1]);
            })
            .join('\\n');
        var wrap = document.createElement('div');
        wrap.className = cls + ' sebs-ng-term-injected';
        wrap.setAttribute('aria-label', ariaLabel);
        wrap.innerHTML =
            '<div class="term-header">' +
            '<span class="term-dot red"></span><span class="term-dot yellow"></span><span class="term-dot green"></span>' +
            '<span class="term-title">' +
            title +
            '</span></div>' +
            '<div class="term-body">' +
            body +
            '</div>';
        return wrap;
    }

    function findH2(needle) {
        var n = String(needle || '').toLowerCase();
        return Array.from(document.querySelectorAll('.section-inner h2, .content-card h2')).find(
            function (h) {
                return String(h.textContent || '')
                    .toLowerCase()
                    .indexOf(n) !== -1;
            }
        );
    }

    function insertAfter(el, node) {
        if (!el || !node) return false;
        var wrap = document.createElement('div');
        wrap.className = 'sebs-ng-term-wrap';
        wrap.style.margin = '1rem 0 1.25rem';
        wrap.appendChild(node);
        el.parentNode.insertBefore(wrap, el.nextSibling);
        return true;
    }

    function headingIntro() {
        var p = document.createElement('p');
        p.className = 'section-mini-heading';
        p.textContent = 'Örnek terminal oturumu (kavramsal)';
        var hint = document.createElement('p');
        hint.className = 'mod2-lede';
        hint.style.marginTop = '0.35rem';
        hint.textContent =
            'Aşağıdaki çıktılar tipik kanıt toplama görünümünü simüle eder; IP ve metinler uydurmadır.';
        return { p: p, hint: hint };
    }

    function injectMod06() {
        if (document.querySelector('[data-sebs-mod06-term]')) return;
        var h07 = findH2('0.7');
        if (!h07) return;
        var intro = headingIntro();
        var grid = document.createElement('div');
        grid.className = 'mod2-card-grid mod2-os-section sebs-ng-term-block';
        grid.setAttribute('data-sebs-mod06-term', '1');
        grid.style.margin = '1.25rem 0';

        var win = buildTerminal('win', 'PowerShell — kanıt disiplini', 'Modül 0.6 Windows örnek', [
            ['prompt', 'PS C:\\evidence>'],
            ['cmd', 'Get-Date -Format o'],
            ['output', '2026-04-17T09:15:02.4411203+03:00'],
            ['prompt', 'PS C:\\evidence>'],
            ['cmd', 'w32tm /query /status | Select-String "Source|Last Sync"'],
            ['output', 'Source: time.corp.example (0x8)'],
            ['output', 'Last Successful Sync Time: 17.04.2026 09:12:01'],
            ['prompt', 'PS C:\\evidence>'],
            ['cmd', 'Get-FileHash .\\capture_90s.pcap -Algorithm SHA256'],
            ['output', 'SHA256  B4E2...91F0  .\\capture_90s.pcap'],
            ['comment', '# Hash manifest ve erişim kaydı ile birlikte saklanır.']
        ]);
        var lin = buildTerminal('linux', 'bash — UTC + manifest', 'Modül 0.6 Linux örnek', [
            ['prompt', 'analist@host:~/evidence$'],
            ['cmd', 'date -Iseconds | tee time_local.txt'],
            ['output', '2026-04-17T09:15:02+03:00'],
            ['prompt', 'analist@host:~/evidence$'],
            ['cmd', 'timedatectl status | grep -E "synchronized|NTP"'],
            ['output', 'System clock synchronized: yes'],
            ['prompt', 'analist@host:~/evidence$'],
            ['cmd', 'sha256sum capture_90s.pcap | tee -a manifest.sha256'],
            ['output', 'a3f29c...91e8  capture_90s.pcap'],
            ['comment', '# Okuma amaçlı; RoE zaman penceresi dışına çıkma.']
        ]);
        var mac = buildTerminal('mac', 'zsh — UTC kanıt', 'Modül 0.6 macOS örnek', [
            ['prompt', 'analist@Mac evidence %'],
            ['cmd', 'date -u +"%Y-%m-%dT%H:%M:%SZ"'],
            ['output', '2026-04-17T06:15:02Z'],
            ['prompt', 'analist@Mac evidence %'],
            ['cmd', 'shasum -a 256 capture_90s.pcap | tee -a manifest.sha256'],
            ['output', 'b4e2a1...91f0  capture_90s.pcap'],
            ['comment', '# Uydurma örnek; gerçek ortamda minimizasyon notu şart.']
        ]);

        [win, lin, mac].forEach(function (t, i) {
            var card = document.createElement('div');
            card.className = 'mod2-card';
            var h = document.createElement('h4');
            h.textContent = ['Windows', 'Linux', 'macOS'][i];
            card.appendChild(h);
            card.appendChild(t);
            grid.appendChild(card);
        });

        h07.parentNode.insertBefore(intro.p, h07);
        h07.parentNode.insertBefore(intro.hint, h07);
        h07.parentNode.insertBefore(grid, h07);
    }

    function injectMod07Tshark() {
        if (document.querySelector('[data-sebs-mod07-tshark]')) return;
        var h08 = findH2('0.8');
        if (!h08) return;
        var intro = headingIntro();
        var t = buildTerminal(
            'linux',
            'tshark — kanıt kesiti (60–180 sn)',
            'Modül 0.7 Wireshark/tshark örnek',
            [
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'tshark -r capture_90s.pcap -q -z endpoints,ip'],
                ['output', '================================================================================'],
                ['output', 'IPv4 Endpoints (top 3)'],
                ['output', '192.0.2.10  <->  203.0.113.44   frames: 842  bytes: 401200'],
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'tshark -r capture_90s.pcap -Y "dns" -T fields -e frame.time -e dns.qry.name | head -n 3'],
                ['output', 'Apr 17, 2026 09:14:01.112  portal.example.corp.'],
                ['comment', '# File → Export Specified Packets + SHA-256 manifest.']
            ]
        );
        t.classList.add('mod2-wireshark-terminal');
        t.setAttribute('data-sebs-mod07-tshark', '1');
        h08.parentNode.insertBefore(intro.p, h08);
        h08.parentNode.insertBefore(intro.hint, h08);
        h08.parentNode.insertBefore(t, h08);
    }

    function injectMod17() {
        if (document.querySelector('[data-sebs-mod17-term]')) return;
        var h18 = findH2('1.8');
        if (!h18) return;
        var intro = headingIntro();
        var grid = document.createElement('div');
        grid.className = 'mod2-card-grid mod2-os-section sebs-ng-term-block';
        grid.setAttribute('data-sebs-mod17-term', '1');
        grid.style.margin = '1.25rem 0';

        var win = buildTerminal('win', 'PowerShell — yerel yüzey', 'Modül 1.7 Windows örnek', [
            ['prompt', 'PS C:\\evidence>'],
            ['cmd', 'Get-NetTCPConnection -State Listen | Select LocalAddress,LocalPort -First 4'],
            ['output', 'LocalAddress LocalPort'],
            ['output', '0.0.0.0        445'],
            ['output', '::             3389'],
            ['prompt', 'PS C:\\evidence>'],
            ['cmd', 'arp -a | Select-String "192.0.2.1"'],
            ['output', '  192.0.2.1    00-11-22-33-44-55    dynamic'],
            ['comment', '# Dinleyen port + komşu tablosu = saldırı yüzeyi kanıtı.']
        ]);
        var lin = buildTerminal('linux', 'bash — arayüz ve dinleyen', 'Modül 1.7 Linux örnek', [
            ['prompt', 'analist@ws:~/evidence$'],
            ['cmd', 'ip -brief addr | head -n 4'],
            ['output', 'lo      127.0.0.1/8'],
            ['output', 'eth0    198.51.100.20/24'],
            ['prompt', 'analist@ws:~/evidence$'],
            ['cmd', 'ss -lntup | head -n 5'],
            ['output', 'LISTEN 0.0.0.0:22 users:(("sshd",pid=1201))'],
            ['comment', '# ip/route/neigh çıktıları manifest.sha256 ile paketlenir.']
        ]);

        [['Windows', win], ['Linux', lin]].forEach(function (pair) {
            var card = document.createElement('div');
            card.className = 'mod2-card';
            var h = document.createElement('h4');
            h.textContent = pair[0];
            card.appendChild(h);
            card.appendChild(pair[1]);
            grid.appendChild(card);
        });

        h18.parentNode.insertBefore(intro.p, h18);
        h18.parentNode.insertBefore(intro.hint, h18);
        h18.parentNode.insertBefore(grid, h18);
    }

    var LESSON_TERMINALS = [
        {
            h2: '2.1',
            term: buildTerminal('linux', 'bash — MitM triage', '2.1 MitM örnek', [
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'dig +short portal.example.corp @192.0.2.53 | tee dns_a.txt'],
                ['output', '203.0.113.30'],
                ['output', '203.0.113.31'],
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'ip neigh show 192.0.2.1'],
                ['output', '192.0.2.1 dev eth0 lladdr 00:11:22:33:44:55 REACHABLE'],
                ['comment', '# Gateway MAC + DNS korelasyonu; tek belirti kanıt değildir.']
            ])
        },
        {
            h2: '2.2',
            term: buildTerminal('linux', 'bash — ARP/DNS tutarsızlık', '2.2 Spoofing örnek', [
                ['prompt', 'analist@ws:~/evidence$'],
                [
                    'cmd',
                    'tshark -r capture_120s.pcap -Y "arp.duplicate-address-detected" -T fields -e frame.time -e arp.src.proto_ipv4 | head -n 3'
                ],
                ['output', 'Apr 16, 2026 14:42:03.221  198.51.100.55'],
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'grep portal.example.corp dns_query.log | tail -n 2'],
                ['output', '14:42:01 A 203.0.113.30 TTL 30'],
                ['output', '14:42:08 A 198.51.100.99 TTL 15'],
                ['comment', '# Karşı kanıt: planlı CDN/DHCP değişikliği kontrol edilir.']
            ])
        },
        {
            h2: '2.3',
            term: buildTerminal('linux', 'bash — DoS sinyalleri', '2.3 DoS örnek', [
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'ss -s | tee socket_summary.txt'],
                ['output', 'TCP:   18420 (estab 120, closed 18200, orphaned 40)'],
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'cat flow_top_talkers.txt | head -n 3'],
                ['output', 'DST 203.0.113.50:443  pps=12400  bytes=8.1M  (window 14:00-14:05)'],
                ['comment', '# Flow + cihaz CPU + servis latency birlikte okunur.']
            ])
        },
        {
            h2: '2.4',
            term: buildTerminal('linux', 'bash — davranış + DNS', '2.4 AI-destekli örnek', [
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'zgrep -h "query:" proxy_dns.log | sort -u | wc -l'],
                ['output', '47'],
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'grep "first_seen_domain" ndr_alerts.json | head -n 2'],
                ['output', '{"domain":"cdn-assets-7f2a.example.net","score":0.71,"action":"review"}'],
                ['comment', '# “AI yaptı” etiketi kanıt değil; DNS+proxy+flow ile sabitle.']
            ])
        },
        {
            h2: '2.5',
            term: buildTerminal('linux', 'bash — kablosuz controller', '2.5 Kablosuz örnek', [
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'grep -E "rogue|unexpected BSSID|deauth" wlc_events_10m.log | head -n 4'],
                ['output', '14:41:02 WARN  SSID=CorpWiFi  new_BSSID=aa:bb:cc:dd:ee:ff  (not in allowlist)'],
                ['output', '14:41:15 INFO  deauth/disassoc spike  count=20  AP=Floor-3-WLC'],
                ['comment', '# Cracking yok; envanter dışı AP + auth korelasyonu.']
            ])
        }
    ];

    function anchorBeforeH2(h2Key) {
        var h2 = findH2(h2Key);
        if (!h2) return null;
        var sib = h2.previousElementSibling;
        while (sib && sib.tagName !== 'H2') {
            if (sib.classList && sib.classList.contains('mod2-bypass-strip')) {
                var lede = sib.querySelector('.mod2-lede');
                if (lede) return lede;
                return sib;
            }
            if (sib.tagName === 'P' && /ipucu/i.test(String(sib.textContent || ''))) {
                return sib;
            }
            sib = sib.previousElementSibling;
        }
        return null;
    }

    function injectMod2Lessons() {
        LESSON_TERMINALS.forEach(function (item) {
            if (document.querySelector('[data-sebs-lesson-term="' + item.h2 + '"]')) return;
            var anchor = anchorBeforeH2(item.h2);
            if (!anchor) return;
            var t = item.term.cloneNode(true);
            t.setAttribute('data-sebs-lesson-term', item.h2);
            insertAfter(anchor, t);
        });
    }

    function injectExampleNotes() {
        document.querySelectorAll('.module-note-example').forEach(function (note) {
            var card = note.closest('.content-card') || note.closest('.section-inner');
            if (!card || card.querySelector('.sebs-ng-term-injected')) return;
            if (card.querySelector('.linux-terminal, .windows-terminal, .macos-terminal')) return;
            var t = buildTerminal('linux', 'bash — örnek çıktı', 'Örnek notu terminal', [
                ['prompt', 'analist@ws:~/evidence$'],
                ['cmd', 'date -u +"%Y-%m-%dT%H:%M:%SZ" | tee -a session.log'],
                ['output', '2026-04-17T06:20:11Z'],
                ['comment', '# İpucu/örnek notu: komut yalnızca kanıt disiplini içindir.']
            ]);
            insertAfter(note, t);
        });
    }

    function run() {
        injectMod06();
        injectMod07Tshark();
        injectMod17();
        injectMod2Lessons();
        injectExampleNotes();
    }

    function schedule() {
        setTimeout(run, 80);
        setTimeout(run, 450);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', schedule);
    } else {
        schedule();
    }
})(typeof window !== 'undefined' ? window : this);
