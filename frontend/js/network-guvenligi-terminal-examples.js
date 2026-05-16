/**
 * Network Güvenliği — düz metin / kod komut örneklerini terminal kutularına dönüştürür.
 */
(function (global) {
    'use strict';

    var path = (typeof location !== 'undefined' && location.pathname) || '';
    if (path.indexOf('network-guvenligi') === -1) return;
    if (!document.querySelector('.module-layout')) return;

    function ensureStyles() {
        if (document.getElementById('sebs-ng-term-style')) return;
        var s = document.createElement('style');
        s.id = 'sebs-ng-term-style';
        s.textContent =
            '.sebs-ng-plain-cmd-hidden{display:none!important;}' +
            '.sebs-ng-term-wrap .windows-terminal,.sebs-ng-term-wrap .linux-terminal,.sebs-ng-term-wrap .macos-terminal{margin:0.75rem 0;}' +
            'body.lesson-route-mode .content-card .sebs-ng-term-injected{display:block!important;}';
        document.head.appendChild(s);
    }

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

    function buildTerminal(kind, title, lines) {
        var cls =
            kind === 'win' ? 'windows-terminal' : kind === 'mac' ? 'macos-terminal' : 'linux-terminal';
        var body = lines
            .map(function (row) {
                if (row.length === 1) return termLine('output', row[0]);
                return termLine(row[0], row[1]);
            })
            .join('\n');
        var wrap = document.createElement('div');
        wrap.className = cls + ' sebs-ng-term-injected';
        wrap.setAttribute('aria-label', title);
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

    function platformKind(text) {
        var t = String(text || '').trim();
        if (!t) return null;
        if (/windows/i.test(t) && /powershell|cli|netsh|powershell/i.test(t)) return 'win';
        if (/^windows\b/i.test(t)) return 'win';
        if (/linux\s*\/\s*macos/i.test(t)) return 'linux';
        if (/^linux\b/i.test(t)) return 'linux';
        if (/^macos\b/i.test(t)) return 'mac';
        return null;
    }

    function normalizeCmd(text) {
        return String(text || '')
            .replace(/\s+/g, ' ')
            .replace(/\s*\\\s*/g, ' ')
            .trim();
    }

    function parseNumberedOrCommand(text) {
        var raw = String(text || '').trim();
        if (!raw) return null;
        var m = raw.match(/^\d+[\.)]\s*(.+)$/);
        if (m) return normalizeCmd(m[1]);
        m = raw.match(/^\d+\.([A-Za-z_$].+)$/);
        if (m) return normalizeCmd(m[1]);
        return null;
    }

    function isCommandLike(text) {
        var raw = normalizeCmd(text);
        if (!raw || raw.length < 4) return false;
        if (/^(amaç|beklenen|yorum|güvenli|not:|sınır:)/i.test(raw)) return false;
        return /^(Get-|Test-NetConnection|netsh|w32tm|arp |route |ip |ss |date |timedatectl|resolvectl|sha256sum|Get-FileHash|wevtutil|icacls|script |log show|systemsetup|shasum|openssl|nmcli|journalctl|curl |sudo |tcpdump|tshark|dig |grep |ifconfig|netstat|security |Get-WinEvent|Export-Csv|Out-File|Select-Object|Get-ChildItem|Get-VpnConnection)/i.test(
            raw
        );
    }

    function isPlatformHeadingElement(el) {
        if (!el || !el.tagName) return false;
        if (el.classList.contains('mod12-cmd-os-title')) return true;
        if (!platformKind(el.textContent)) return false;
        if (el.classList.contains('runbook-phase-heading')) return true;
        if (el.classList.contains('section-mini-heading')) return true;
        if (el.tagName === 'P') return true;
        if (el.tagName === 'H4') return true;
        return false;
    }

    function isSectionStop(startEl, el) {
        if (!el || el === startEl) return false;
        var tag = el.tagName;
        if (tag === 'H2' || tag === 'H3') return true;
        if (el.classList.contains('mod12-phase-strip')) return true;
        if (el.classList.contains('mod12-cmd-os') && !startEl.closest('.mod12-cmd-os')) return true;
        if (isPlatformHeadingElement(el)) return true;
        if (tag === 'H4' && el.classList.contains('mod12-cmd-os-title') && el !== startEl) {
            return !startEl.closest('.mod12-cmd-os');
        }
        return false;
    }

    function hasTerminalInScope(scopeRoot) {
        if (!scopeRoot) return false;
        return !!scopeRoot.querySelector(
            '.sebs-ng-term-wrap, .windows-terminal, .linux-terminal, .macos-terminal'
        );
    }

    function hasTerminalNearby(headingEl) {
        var n = headingEl.nextElementSibling;
        if (!n) return false;
        if (n.classList.contains('sebs-ng-term-wrap')) return true;
        if (n.classList.contains('windows-terminal') || n.classList.contains('linux-terminal') || n.classList.contains('macos-terminal')) {
            return true;
        }
        if (n.classList.contains('mod2-card') && hasTerminalInScope(n)) return true;
        return false;
    }

    function gatherCommandsInContainer(container, startEl) {
        var cmds = [];
        var seen = {};

        function add(raw) {
            var c = normalizeCmd(raw);
            if (!c || c.length < 3 || seen[c]) return;
            seen[c] = 1;
            cmds.push(c);
        }

        function extractFromP(p) {
            if (!p || p.closest('.sebs-ng-term-wrap, .windows-terminal, .linux-terminal, .macos-terminal')) {
                return;
            }
            if (p.classList.contains('mod12-cmd-step-label') || p.classList.contains('bullet-line')) return;
            if (p.classList.contains('mod12-cmd-code')) {
                add(p.textContent);
                return;
            }
            var codes = p.querySelectorAll('code');
            if (codes.length) {
                var parts = [];
                codes.forEach(function (code) {
                    parts.push(code.textContent.trim());
                });
                add(parts.join(' '));
                return;
            }
            var numbered = parseNumberedOrCommand(p.textContent);
            if (numbered) {
                add(numbered);
                return;
            }
            if (isCommandLike(p.textContent)) add(p.textContent);
        }

        function walkEl(el) {
            while (el) {
                if (startEl && isSectionStop(startEl, el)) break;
                if (el.classList && el.classList.contains('sebs-ng-term-wrap')) {
                    el = el.nextElementSibling;
                    continue;
                }
                if (
                    el.classList &&
                    (el.classList.contains('windows-terminal') ||
                        el.classList.contains('linux-terminal') ||
                        el.classList.contains('macos-terminal'))
                ) {
                    el = el.nextElementSibling;
                    continue;
                }
                if (el.tagName === 'P') extractFromP(el);
                if (el.tagName === 'PRE' && el.classList.contains('mod12-cmd-code')) add(el.textContent);
                if (el.tagName === 'CODE' && el.classList.contains('mod12-cmd-code')) add(el.textContent);
                if (el.classList && (el.classList.contains('mod2-card') || el.classList.contains('mod12-cmd-os'))) {
                    Array.from(el.children).forEach(function (child) {
                        if (startEl && isSectionStop(startEl, child)) return;
                        if (child.tagName === 'P') extractFromP(child);
                        if (child.tagName === 'PRE' && child.classList.contains('mod12-cmd-code')) {
                            add(child.textContent);
                        }
                        if (child.tagName === 'CODE' && child.classList.contains('mod12-cmd-code')) {
                            add(child.textContent);
                        }
                    });
                }
                el = el.nextElementSibling;
            }
        }

        if (container === null) {
            walkEl(startEl.nextElementSibling);
        } else {
            Array.from(container.children).forEach(function (child) {
                if (child === startEl) return;
                if (startEl && isSectionStop(startEl, child)) return;
                if (child.tagName === 'P') extractFromP(child);
                if (child.tagName === 'PRE' && child.classList.contains('mod12-cmd-code')) add(child.textContent);
                if (child.tagName === 'CODE' && child.classList.contains('mod12-cmd-code')) add(child.textContent);
            });
        }
        return cmds;
    }

    function parseCommandsFromSection(startEl) {
        var scope = startEl.closest('.mod12-cmd-os') || startEl.closest('.mod2-card');
        if (scope) return gatherCommandsInContainer(scope, startEl);
        return gatherCommandsInContainer(null, startEl);
    }

    function sampleOutput(cmd, kind) {
        var c = String(cmd).toLowerCase();
        if (kind === 'win') {
            if (c.indexOf('get-date') !== -1) return '2026-04-17T14:22:11.1234567+03:00';
            if (c.indexOf('get-netipconfiguration') !== -1) return 'InterfaceAlias : Ethernet0\nIPv4Address  : 198.51.100.20';
            if (c.indexOf('get-nettcpconnection') !== -1) return 'LocalAddress LocalPort\n0.0.0.0      445';
            if (c.indexOf('test-netconnection') !== -1) return 'TcpTestSucceeded : True';
            if (c.indexOf('netsh') !== -1) return 'SSID/BSSID list or profile summary (text)';
            if (c.indexOf('get-winEvent') !== -1) return 'Exported CSV: wlan_autoconfig_last2h.csv';
            if (c.indexOf('route print') !== -1) return '0.0.0.0  0.0.0.0  192.0.2.1  On-link';
            if (c.indexOf('arp') !== -1) return '192.0.2.1    00-11-22-33-44-55    dynamic';
            if (c.indexOf('get-filehash') !== -1) return 'SHA256  A3F2...C91  evidence\\file.txt';
            if (c.indexOf('w32tm') !== -1) return 'Source: time.corp.example (0x8)';
        }
        if (kind === 'linux') {
            if (c.indexOf('date') !== -1) return '2026-04-17T11:22:11Z';
            if (c.indexOf('openssl') !== -1) return 'Verify return code: 0 (ok)\nCertificate chain saved';
            if (c.indexOf('nmcli') !== -1) return 'SSID  BSSID  CHAN  SIGNAL  SECURITY';
            if (c.indexOf('journalctl') !== -1) return '... log lines written to evidence/';
            if (c.indexOf('ip -brief') !== -1 || c.indexOf('ip addr') !== -1) return 'eth0    198.51.100.20/24';
            if (c.indexOf('ss -') !== -1) return 'LISTEN 0.0.0.0:22 users:(("sshd",pid=1201))';
            if (c.indexOf('ip route') !== -1 || c.indexOf('ip neigh') !== -1) return 'default via 192.0.2.1 dev eth0';
            if (c.indexOf('resolvectl') !== -1) return 'DNS Servers: 192.0.2.53';
            if (c.indexOf('sha256sum') !== -1) return 'a3f29c...91e8  evidence/listening_ports.txt';
            if (c.indexOf('tcpdump') !== -1) return 'listening on eth0, link-type EN10MB ...';
            if (c.indexOf('curl ') !== -1) return 'HTTP/2 200\nserver: nginx';
        }
        if (kind === 'mac') {
            if (c.indexOf('date') !== -1) return '2026-04-17T11:22:11Z';
            if (c.indexOf('systemsetup') !== -1) return 'Network Time: On\nTime Server: time.corp.example';
            if (c.indexOf('shasum') !== -1) return 'b4e2a1...91f0  evidence.pcap';
            if (c.indexOf('arp') !== -1) return '? (192.0.2.1) at 0:11:22:33:44:55 on en0';
            if (c.indexOf('netstat') !== -1) return 'default            192.0.2.1';
            if (c.indexOf('airport') !== -1) return 'SSID BSSID RSSI CHANNEL';
            if (c.indexOf('log show') !== -1) return '... unified log slice';
        }
        return '...';
    }

    function promptFor(kind) {
        if (kind === 'win') return 'PS C:\\evidence>';
        if (kind === 'mac') return 'analist@Mac evidence %';
        return 'analist@ws:~/evidence$';
    }

    function terminalLinesFromCommands(cmds, kind) {
        var lines = [];
        var max = Math.min(cmds.length, 6);
        for (var i = 0; i < max; i++) {
            lines.push(['prompt', promptFor(kind)]);
            lines.push(['cmd', cmds[i]]);
            lines.push(['output', sampleOutput(cmds[i], kind)]);
        }
        if (lines.length) {
            lines.push(['comment', '# Örnek çıktı; amaç ve sınır maddeleri metin olarak kalır.']);
        }
        return lines;
    }

    function hidePlainCommandsInScope(startEl) {
        var scope = startEl.closest('.mod12-cmd-os') || startEl.closest('.mod2-card');
        var nodes;

        function hideP(p) {
            if (!p || p.closest('.sebs-ng-term-wrap, .windows-terminal, .linux-terminal, .macos-terminal')) {
                return;
            }
            if (p.classList.contains('mod12-cmd-step-label') || p.classList.contains('bullet-line')) return;
            var numbered = parseNumberedOrCommand(p.textContent);
            if (numbered || p.querySelector('code') || p.classList.contains('mod12-cmd-code') || isCommandLike(p.textContent)) {
                p.classList.add('sebs-ng-plain-cmd-hidden');
            }
        }

        if (scope) {
            scope.querySelectorAll('p, pre.mod12-cmd-code, code.mod12-cmd-code').forEach(hideP);
            return;
        }

        var el = startEl.nextElementSibling;
        while (el && !isSectionStop(startEl, el)) {
            if (el.tagName === 'P') hideP(el);
            if (el.classList && el.classList.contains('mod2-card')) {
                el.querySelectorAll('p, pre.mod12-cmd-code, code.mod12-cmd-code').forEach(hideP);
            }
            el = el.nextElementSibling;
        }
    }

    function insertTerminalAfter(headingEl, kind) {
        if (headingEl.dataset.sebsNgPlatformTerm === '1') return;
        if (hasTerminalNearby(headingEl)) return;

        var scope = headingEl.closest('.mod12-cmd-os') || headingEl.closest('.mod2-card');
        if (scope && hasTerminalInScope(scope)) return;

        var cmds = parseCommandsFromSection(headingEl);
        if (!cmds.length) return;

        var title =
            kind === 'win'
                ? 'PowerShell — örnek oturum'
                : kind === 'mac'
                  ? 'Terminal (zsh) — örnek oturum'
                  : 'bash — örnek oturum';

        var term = buildTerminal(kind, title, terminalLinesFromCommands(cmds, kind));
        var wrap = document.createElement('div');
        wrap.className = 'sebs-ng-term-wrap';
        wrap.setAttribute('data-sebs-ng-platform', kind);
        wrap.appendChild(term);

        headingEl.parentNode.insertBefore(wrap, headingEl.nextSibling);
        headingEl.dataset.sebsNgPlatformTerm = '1';
        hidePlainCommandsInScope(headingEl);
    }

    function collectPlatformHeadings() {
        var out = [];
        var seen = new Set();
        var sel =
            '.section-inner > p, .content-card > p, ' +
            '.runbook-phase-heading, ' +
            '.section-mini-heading, ' +
            '.mod2-card > h4, ' +
            'h4.mod12-cmd-os-title';
        document.querySelectorAll(sel).forEach(function (el) {
            if (!isPlatformHeadingElement(el)) return;
            var kind = platformKind(el.textContent);
            if (!kind) return;
            var key = kind + '|' + el.textContent.trim().slice(0, 40) + '|' + (el.closest('section') && el.closest('section').id);
            if (seen.has(key) && el.dataset.sebsNgPlatformTerm === '1') return;
            seen.add(key);
            out.push({ el: el, kind: kind });
        });
        return out;
    }

    function injectMod12OsBlocks() {
        document.querySelectorAll('.mod12-cmd-os').forEach(function (os) {
            if (os.dataset.sebsNgOsTerm === '1') return;
            if (hasTerminalInScope(os)) return;
            var h4 = os.querySelector(':scope > h4.mod12-cmd-os-title');
            if (!h4) return;
            var kind = platformKind(h4.textContent) || 'linux';
            var cmds = gatherCommandsInContainer(os, h4);
            if (!cmds.length) return;

            var title =
                kind === 'win'
                    ? 'PowerShell — örnek'
                    : kind === 'mac'
                      ? 'Terminal — örnek'
                      : 'bash — örnek';
            var term = buildTerminal(kind, title, terminalLinesFromCommands(cmds, kind));
            var wrap = document.createElement('div');
            wrap.className = 'sebs-ng-term-wrap';
            wrap.appendChild(term);
            h4.parentNode.insertBefore(wrap, h4.nextSibling);
            os.dataset.sebsNgOsTerm = '1';
            hidePlainCommandsInScope(h4);
        });
    }

    function injectMod2LessonExamples() {
        var presets = [
            {
                key: '2.1',
                kind: 'linux',
                lines: [
                    ['prompt', 'analist@ws:~/evidence$'],
                    ['cmd', 'dig +short portal.example.corp @192.0.2.53'],
                    ['output', '203.0.113.30'],
                    ['prompt', 'analist@ws:~/evidence$'],
                    ['cmd', 'ip neigh show 192.0.2.1'],
                    ['output', '192.0.2.1 dev eth0 lladdr 00:11:22:33:44:55 REACHABLE']
                ]
            },
            {
                key: '2.2',
                kind: 'linux',
                lines: [
                    ['prompt', 'analist@ws:~/evidence$'],
                    ['cmd', 'tshark -r capture_120s.pcap -Y "arp.duplicate-address-detected" | head -n 2'],
                    ['output', 'Apr 16, 2026 14:42:03.221  198.51.100.55']
                ]
            },
            {
                key: '2.5',
                kind: 'linux',
                lines: [
                    ['prompt', 'analist@ws:~/evidence$'],
                    ['cmd', 'grep -E "rogue|BSSID" wlc_events_10m.log | head -n 2'],
                    ['output', '14:41:02 WARN SSID=CorpWiFi new_BSSID=aa:bb:cc:dd:ee:ff']
                ]
            }
        ];
        presets.forEach(function (p) {
            if (document.querySelector('[data-sebs-lesson-term="' + p.key + '"]')) return;
            var h2 = Array.from(document.querySelectorAll('h2')).find(function (h) {
                return String(h.textContent || '').indexOf(p.key) === 0;
            });
            if (!h2) return;
            var anchor = h2.previousElementSibling;
            while (anchor && anchor.tagName !== 'H2') {
                if (anchor.classList && anchor.classList.contains('mod2-lede') && /örnek/i.test(anchor.textContent)) {
                    break;
                }
                if (anchor.classList && anchor.classList.contains('mod2-bypass-strip')) {
                    var lede = anchor.querySelector('.mod2-lede');
                    if (lede) anchor = lede;
                    break;
                }
                anchor = anchor.previousElementSibling;
            }
            if (!anchor || anchor.tagName === 'H2') return;
            var term = buildTerminal(p.kind, 'bash — örnek', p.lines);
            term.setAttribute('data-sebs-lesson-term', p.key);
            var wrap = document.createElement('div');
            wrap.className = 'sebs-ng-term-wrap';
            wrap.appendChild(term);
            anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
        });
    }

    function run() {
        ensureStyles();
        collectPlatformHeadings().forEach(function (item) {
            insertTerminalAfter(item.el, item.kind);
        });
        injectMod12OsBlocks();
        injectMod2LessonExamples();
    }

    function schedule() {
        run();
        setTimeout(run, 200);
        setTimeout(run, 800);
        setTimeout(run, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', schedule);
    } else {
        schedule();
    }

    global.addEventListener('popstate', function () {
        setTimeout(run, 150);
    });

    global.addEventListener('sebs-lesson-cards-ready', function () {
        setTimeout(run, 50);
    });
})(typeof window !== 'undefined' ? window : this);
