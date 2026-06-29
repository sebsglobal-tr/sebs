/**
 * Temel Kriptografi: ders başlığı + section id → üst şerit SVG.
 * temel-kriptografi-premium.js tarafından yüklenir (önce bu dosya).
 */
(function () {
  'use strict';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function palette(mod) {
    var palettes = [
      { a: '#1e40af', b: '#3b82f6', c: '#d4a853', bg: '#f8fafc' },
      { a: '#0f172a', b: '#334155', c: '#d4a853', bg: '#f8fafc' },
      { a: '#7f1d1d', b: '#b91c1c', c: '#fcd34d', bg: '#fffbeb' },
      { a: '#0369a1', b: '#0ea5e9', c: '#fef08a', bg: '#f0f9ff' },
      { a: '#0f766e', b: '#14b8a6', c: '#fde68a', bg: '#f0fdfa' },
      { a: '#5b21b6', b: '#7c3aed', c: '#fcd34d', bg: '#faf5ff' },
      { a: '#9f1239', b: '#e11d48', c: '#a7f3d0', bg: '#fff1f2' },
      { a: '#166534', b: '#22c55e', c: '#fef9c3', bg: '#f0fdf4' }
    ];
    return palettes[(mod - 1) % 8] || palettes[0];
  }

  function parseLessonIdx(id) {
    var m = /-l(\d+)$/.exec(id || '');
    return m ? parseInt(m[1], 10) : 0;
  }

  /** İlk eşleşen kural kazanır (özgül → genel sıra). */
  var RULES = [
    { re: /terimler sözlüğü/i, k: 'glossary' },
    { re: /analitik senaryo/i, k: 'scenario' },
    { re: /neler öğrendik/i, k: 'recap' },
    { re: /^modül\s+\d+\s+—/i, k: 'mod_banner' },
    { re: /^\$2b\$/i, k: 'bcrypt_line' },
    { re: /BEGIN RSA PRIVATE KEY/i, k: 'rsa_pem' },
    { re: /dosya içeriğinin başında/i, k: 'rsa_file_teaser' },
    { re: /openssl çıktısında şu temsili/i, k: 'openssl_cert_sample' },
    { re: /temsili openssl çıktısı/i, k: 'openssl_text_sample' },
    { re: /geliştirici ekibe öneri|güvenlik ekibine bulgu/i, k: 'security_report' },
    { re: /kaçınılması gereken yanlış yorumlar/i, k: 'myths' },
    { re: /otp.*koşulları|otp['\u2019]de anahtar/i, k: 'otp_rules' },
    { re: /one-time pad|otp ve mükemmel/i, k: 'otp_pad' },
    { re: /frekans analizi/i, k: 'freq_bars' },
    { re: /klasik şifreleri görselleştiren/i, k: 'classic_viz' },
    { re: /klasik şifrelerin zayıflıkları/i, k: 'weak_classic' },
    { re: /polialfabetik/i, k: 'poly_rotors' },
    { re: /yer değiştirme şifreleri/i, k: 'transposition' },
    { re: /yerine koyma şifreleri/i, k: 'substitution' },
    { re: /ecb\s*—|ecb —/i, k: 'ecb_pattern' },
    { re: /cbc\s*—|cbc —/i, k: 'cbc_chain' },
    { re: /ctr\s*—|ctr —|counter mode/i, k: 'ctr_counter' },
    { re: /kimlik doğrulamalı şifreleme/i, k: 'ae_auth' },
    { re: /akış şifreleri/i, k: 'stream_bits' },
    { re: /blok şifreleme modları/i, k: 'modes_overview' },
    { re: /blok şifreleme/i, k: 'block_cipher' },
    { re: /simetrik şifreleme araç/i, k: 'sym_tools' },
    { re: /simetrik şifreleme mantığı/i, k: 'sym_logic' },
    { re: /openssl algoritma listesinde/i, k: 'openssl_cipher_list' },
    { re: /openssl ile aes-256-cbc/i, k: 'openssl_aes_file' },
    { re: /openssl ile hmac ve plain hash/i, k: 'openssl_hmac_lab' },
    { re: /openssl ile hash çıktısı/i, k: 'openssl_hash_read' },
    { re: /openssl ile sertifika içeriğinin/i, k: 'openssl_cert_read' },
    { re: /openssl ile anahtar dosyalarını/i, k: 'openssl_key_inspect' },
    { re: /cyberchef ile hash ve encoding/i, k: 'cyberchef_hash_enc' },
    { re: /aynı girdi için beklenen/i, k: 'triple_compare' },
    { re: /hmac çıktısı ile plain hash/i, k: 'hmac_vs_plain' },
    { re: /parola hashleme araçlarının/i, k: 'passwd_detect' },
    { re: /hash kırma araçlarının etik/i, k: 'hash_ethics' },
    { re: /hash, mac ve parola saklama araçları/i, k: 'hash_mac_toolbox' },
    { re: /parola saklama temelleri/i, k: 'password_store' },
    { re: /anahtar türetme fonksiyonları/i, k: 'kdf_ladder' },
    { re: /mesaj doğrulama kodları/i, k: 'mac_primer' },
    { re: /hash kullanım alanları/i, k: 'hash_uses' },
    { re: /yaygın hash aileleri/i, k: 'hash_families' },
    { re: /kriptografik hash fonksiyonları/i, k: 'hash_primer' },
    { re: /python cryptography/i, k: 'python_crypto' },
    { re: /ecc anahtar çıktısının/i, k: 'ecc_curve' },
    { re: /wireshark ile tls/i, k: 'wireshark_tls' },
    { re: /tls trafiğinde şu tür/i, k: 'tls_packets' },
    { re: /tarayıcı.*sertifika zinciri/i, k: 'browser_chain' },
    { re: /gnupg ile dosya imzalama/i, k: 'gpg_sign' },
    { re: /deprecated algoritma uyarısı/i, k: 'deprecated_warn' },
    { re: /temel matematiksel kavramlar/i, k: 'math_primer' },
    { re: /veri gösterimi ve dönüşüm/i, k: 'data_pipeline' },
    { re: /^veri gösterimi$/i, k: 'data_bits' },
    { re: /base64 ve sha-256/i, k: 'b64_sha_compare' },
    { re: /xor işleminin terslenebilirliğini/i, k: 'xor_lab' },
    { re: /hex ve binary dönüşümlerini/i, k: 'hex_bin_lab' },
    { re: /hesaplama ve güvenlik seviyesi/i, k: 'keyspace' },
    { re: /rastgelelik kavramına/i, k: 'entropy_dice' },
    { re: /tarihsel gelişim/i, k: 'history' },
    { re: /temel güvenlik hedefleri/i, k: 'cia_triad' },
    { re: /kriptografinin tanımı|tanımı ve kapsamı/i, k: 'intro_lock' },
    { re: /temel terminoloji/i, k: 'terminology' },
    { re: /kriptografi araçlarına genel bakış/i, k: 'tools_overview' },
    { re: /openssl.*algoritma isimlerini tanımak/i, k: 'openssl_algo_read' },
    { re: /cyberchef.*encoding ile şifrelemeyi ayırmak/i, k: 'cyberchef_enc_vs_enc' },
    { re: /komut\s*&\s*araç okuryazarlığı/i, k: 'command_lit' },
    { re: /temel seviye güvenli kullanım|kontrol listesi/i, k: 'checklist' }
  ];

  function resolveKind(title, sectionId, mod) {
    var t = title.replace(/\s+/g, ' ').trim();
    var i;
    for (i = 0; i < RULES.length; i++) {
      if (RULES[i].re.test(t)) return RULES[i].k;
    }
    var les = parseLessonIdx(sectionId);
    var h = (t.length + les * 17 + mod * 9) % 10;
    return 'abstract_' + h;
  }

  function cap(title, p, y) {
    var line = title.length > 52 ? title.slice(0, 49) + '…' : title;
    return (
      '<text x="20" y="' +
      y +
      '" fill="' +
      p.b +
      '" font-family="system-ui,sans-serif" font-size="9.5" font-weight="500" opacity="0.88">' +
      esc(line) +
      '</text>'
    );
  }

  function wrap(bg, inner) {
    return (
      '<svg class="kr-crypto-visual__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 96" fill="none" aria-hidden="true" focusable="false">' +
      '<rect width="400" height="96" rx="14" fill="' +
      bg +
      '"/>' +
      inner +
      '</svg>'
    );
  }

  function bodyFor(kind, p, mod, les, title) {
    var v = (mod + les) % 5;
    switch (kind) {
      case 'glossary':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="34" width="52" height="52" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><path d="M36 46h28M36 54h22M36 62h26" stroke="' +
          p.b +
          '" stroke-width="2"/><text x="92" y="58" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Terim → açıklama</text><text x="92" y="76" fill="' +
          p.b +
          '" font-size="10">Çevirmeli kartlarla pekiştirme</text>'
        );
      case 'scenario':
        return (
          cap(title, p, 22) +
          '<circle cx="56" cy="58" r="22" fill="' +
          p.c +
          '" fill-opacity="0.45" stroke="' +
          p.a +
          '"/><text x="44" y="64" fill="' +
          p.a +
          '" font-size="18">?</text><text x="100" y="52" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Senaryo analizi</text><text x="100" y="72" fill="' +
          p.b +
          '" font-size="10">Varsayım · risk · kanıt</text>'
        );
      case 'recap':
        return (
          cap(title, p, 22) +
          '<path d="M32 58l8 8 18-22 12 14 22-28" stroke="' +
          p.b +
          '" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="300" cy="58" r="18" fill="' +
          p.c +
          '" fill-opacity="0.35" stroke="' +
          p.a +
          '"/><text x="268" y="62" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Özet</text>'
        );
      case 'mod_banner':
        return (
          cap(title, p, 22) +
          '<rect x="20" y="36" width="360" height="44" rx="10" fill="#fff" stroke="' +
          p.a +
          '"/><text x="36" y="64" fill="' +
          p.a +
          '" font-size="14" font-weight="800" font-family="Space Grotesk,system-ui,sans-serif">Modül ' +
          mod +
          '</text><rect x="320" y="44" width="44" height="28" rx="6" fill="' +
          p.c +
          '" fill-opacity="0.4"/>'
        );
      case 'history':
        return (
          cap(title, p, 22) +
          '<circle cx="48" cy="60" r="6" fill="' +
          p.a +
          '"/><path d="M54 60h280" stroke="' +
          p.b +
          '" stroke-width="2"/><circle cx="160" cy="60" r="6" fill="' +
          p.b +
          '"/><circle cx="280" cy="60" r="6" fill="' +
          p.c +
          '" stroke="#b45309"/><text x="300" y="56" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Kerckhoffs · modern</text>'
        );
      case 'cia_triad':
        return (
          cap(title, p, 18) +
          '<rect x="16" y="32" width="104" height="52" rx="8" fill="' +
          p.a +
          '" fill-opacity="0.12" stroke="' +
          p.a +
          '"/><text x="36" y="64" fill="' +
          p.a +
          '" font-size="11" font-weight="700">Gizlilik</text>' +
          '<rect x="148" y="32" width="104" height="52" rx="8" fill="' +
          p.b +
          '" fill-opacity="0.12" stroke="' +
          p.b +
          '"/><text x="162" y="64" fill="' +
          p.b +
          '" font-size="11" font-weight="700">Bütünlük</text>' +
          '<rect x="276" y="32" width="104" height="52" rx="8" fill="#fef3c7" stroke="#b45309"/><text x="284" y="64" fill="#92400e" font-size="10" font-weight="700">Kimlik doğrulama</text>'
        );
      case 'intro_lock':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="40" width="72" height="44" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><path d="M52 52v-8a12 12 0 0 1 24 0v8" stroke="' +
          p.a +
          '" stroke-width="2" fill="none"/><rect x="46" y="52" width="36" height="24" rx="4" fill="' +
          p.c +
          '" fill-opacity="0.5"/><text x="120" y="58" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Kapsam: ne çözer / ne çözmez</text>'
        );
      case 'terminology':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="38" width="56" height="28" rx="6" fill="#fff" stroke="' +
          p.b +
          '"/><text x="32" y="57" fill="' +
          p.a +
          '" font-size="10" font-weight="700">PT</text>' +
          '<rect x="96" y="38" width="56" height="28" rx="6" fill="#fff" stroke="' +
          p.b +
          '"/><text x="102" y="57" fill="' +
          p.a +
          '" font-size="10" font-weight="700">CT</text>' +
          '<rect x="168" y="38" width="56" height="28" rx="6" fill="#fff" stroke="' +
          p.b +
          '"/><text x="174" y="57" fill="' +
          p.a +
          '" font-size="10" font-weight="700">K</text>' +
          '<text x="240" y="58" fill="' +
          p.b +
          '" font-size="10">Anahtar · algoritma · protokol</text>'
        );
      case 'tools_overview':
        return (
          cap(title, p, 22) +
          '<rect x="20" y="40" width="88" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="36" y="63" fill="' +
          p.a +
          '" font-size="10" font-weight="600">CLI</text>' +
          '<rect x="124" y="40" width="88" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="138" y="63" fill="' +
          p.a +
          '" font-size="10" font-weight="600">GUI</text>' +
          '<rect x="228" y="40" width="88" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="242" y="63" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Lab</text>' +
          '<rect x="332" y="40" width="44" height="36" rx="8" fill="' +
          p.c +
          '" fill-opacity="0.35" stroke="' +
          p.b +
          '"/>'
        );
      case 'openssl_algo_read':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="38" width="352" height="44" rx="8" fill="#0f172a"/><text x="36" y="58" fill="#94a3b8" font-family="ui-monospace,monospace" font-size="10">openssl list -cipher-algorithms</text><text x="36" y="74" fill="#64748b" font-family="ui-monospace,monospace" font-size="9">AES-256-GCM · CHACHA20 · …</text>'
        );
      case 'cyberchef_enc_vs_enc':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="40" width="140" height="40" rx="8" fill="#fff" stroke="#22c55e"/><text x="48" y="65" fill="#166534" font-size="11" font-weight="700">Encoding</text>' +
          '<text x="180" y="66" fill="' +
          p.b +
          '" font-size="14">≠</text>' +
          '<rect x="220" y="40" width="140" height="40" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="248" y="65" fill="' +
          p.a +
          '" font-size="11" font-weight="700">Şifreleme</text>'
        );
      case 'command_lit':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="38" width="352" height="44" rx="8" fill="#0f172a"/><text x="36" y="' +
          (58 + (v % 3) * 0) +
          '" fill="#e2e8f0" font-family="ui-monospace,monospace" font-size="10">$ man enc | grep -i aes    # mod ' +
          mod +
          '</text><path d="M300 52h48l-10-8m10 8l-10 8" stroke="' +
          p.c +
          '" stroke-width="2" fill="none"/>'
        );
      case 'checklist':
        return (
          cap(title, p, 22) +
          '<path d="M28 48l6 6 14-14M28 68l6 6 14-14M28 88l6 6 14-14" stroke="' +
          p.b +
          '" stroke-width="2.5" fill="none"/><text x="56" y="52" fill="' +
          p.a +
          '" font-size="10">Hassas veriyi üretim dışına taşıma</text><text x="56" y="72" fill="' +
          p.a +
          '" font-size="10">Anahtarı repo içinde bırakma</text>'
        );
      case 'data_bits':
        return (
          cap(title, p, 22) +
          '<g font-family="ui-monospace,monospace" font-size="14" font-weight="700" fill="' +
          p.a +
          '"><text x="28" y="68">01001101</text><text x="160" y="68" fill="' +
          p.b +
          '">→</text><text x="200" y="68">0x4D</text></g><text x="280" y="58" fill="' +
          p.b +
          '" font-size="10">Bit · byte · gösterim</text>'
        );
      case 'data_pipeline':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="44" width="64" height="32" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="40" y="64" fill="' +
          p.a +
          '" font-size="10">Raw</text>' +
          '<path d="M92 60h32" stroke="' +
          p.b +
          '" stroke-width="2"/><polygon points="124,60 116,56 116,64" fill="' +
          p.b +
          '"/>' +
          '<rect x="132" y="44" width="64" height="32" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="140" y="64" fill="' +
          p.a +
          '" font-size="10">Base64</text>' +
          '<path d="M200 60h32" stroke="' +
          p.b +
          '" stroke-width="2"/><rect x="240" y="44" width="120" height="32" rx="6" fill="' +
          p.c +
          '" fill-opacity="0.35" stroke="' +
          p.a +
          '"/><text x="252" y="64" fill="#0f172a" font-size="10" font-weight="600">Hex / metin</text>'
        );
      case 'math_primer':
        return (
          cap(title, p, 22) +
          '<text x="32" y="68" fill="' +
          p.a +
          '" font-size="16" font-weight="700">mod n</text><text x="120" y="68" fill="' +
          p.b +
          '" font-size="14">· XOR · modüler aritmetik</text><circle cx="320" cy="58" r="20" fill="none" stroke="' +
          p.c +
          '" stroke-width="3" stroke-dasharray="4 3"/>'
        );
      case 'keyspace':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="42" width="60" height="40" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="36" y="67" fill="' +
          p.a +
          '" font-size="10" font-weight="700">2^k</text>' +
          '<path d="M90 62h240" stroke="' +
          p.b +
          '" stroke-width="2" stroke-dasharray="6 4"/><text x="200" y="40" fill="' +
          p.b +
          '" font-size="10">Brute-force · anahtar uzayı</text>'
        );
      case 'entropy_dice':
        return (
          cap(title, p, 22) +
          '<rect x="36" y="44" width="40" height="40" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><circle cx="48" cy="56" r="3" fill="' +
          p.a +
          '"/><circle cx="64" cy="56" r="3" fill="' +
          p.a +
          '"/><circle cx="56" cy="68" r="3" fill="' +
          p.a +
          '"/>' +
          '<text x="100" y="62" fill="' +
          p.a +
          '" font-size="11" font-weight="600">CSPRNG · tahmin edilemezlik</text>'
        );
      case 'b64_sha_compare':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="42" width="150" height="38" rx="8" fill="#ecfdf5" stroke="#22c55e"/><text x="40" y="66" fill="#166534" font-size="10" font-weight="700">Base64 (geri dönüşür)</text>' +
          '<rect x="200" y="42" width="170" height="38" rx="8" fill="#f1f5f9" stroke="' +
          p.a +
          '"/><text x="216" y="66" fill="' +
          p.a +
          '" font-size="10" font-weight="700">SHA-256 (tek yönlü)</text>'
        );
      case 'xor_lab':
        return (
          cap(title, p, 22) +
          '<text x="40" y="68" fill="' +
          p.a +
          '" font-size="18" font-weight="800" font-family="ui-monospace">A</text><text x="72" y="68" fill="' +
          p.b +
          '" font-size="18">⊕</text><text x="100" y="68" fill="' +
          p.a +
          '" font-size="18" font-weight="800" font-family="ui-monospace">K</text><text x="132" y="68" fill="' +
          p.b +
          '" font-size="18">=</text><text x="160" y="68" fill="#b91c1c" font-size="18" font-weight="800" font-family="ui-monospace">B</text>'
        );
      case 'hex_bin_lab':
        return (
          cap(title, p, 22) +
          '<text x="32" y="58" fill="' +
          p.a +
          '" font-family="ui-monospace" font-size="12" font-weight="600">0xDEAD</text>' +
          '<text x="140" y="58" fill="' +
          p.b +
          '" font-size="14">⇄</text>' +
          '<text x="180" y="58" fill="' +
          p.a +
          '" font-family="ui-monospace" font-size="12" font-weight="600">1101 1110 …</text>'
        );
      case 'myths':
        return (
          cap(title, p, 22) +
          '<circle cx="56" cy="58" r="22" fill="#fef2f2" stroke="#ef4444"/><path d="M44 46l24 24M68 46l-24 24" stroke="#b91c1c" stroke-width="2.5"/><text x="100" y="62" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Yaygın yanlış yorumlar</text>'
        );
      case 'substitution':
        return (
          cap(title, p, 22) +
          '<text x="40" y="70" fill="' +
          p.a +
          '" font-size="20" font-weight="800" font-family="Georgia,serif">H</text><path d="M62 64h28" stroke="' +
          p.b +
          '" stroke-width="2"/><polygon points="92,64 84,59 84,69" fill="' +
          p.b +
          '"/><text x="108" y="70" fill="#b45309" font-size="20" font-weight="800" font-family="Georgia,serif">L</text>'
        );
      case 'transposition':
        return (
          cap(title, p, 22) +
          '<text x="32" y="58" fill="' +
          p.a +
          '" font-size="14" font-family="ui-monospace">A B C D</text><text x="32" y="78" fill="' +
          p.b +
          '" font-size="14" font-family="ui-monospace">C A D B</text><path d="M200 48l16 10-16 10" stroke="' +
          p.a +
          '" stroke-width="2" fill="none"/>'
        );
      case 'poly_rotors':
        return (
          cap(title, p, 22) +
          '<circle cx="56" cy="58" r="20" fill="#fff" stroke="' +
          p.a +
          '"/><circle cx="112" cy="58" r="20" fill="#fff" stroke="' +
          p.b +
          '"/><circle cx="168" cy="58" r="20" fill="#fff" stroke="#b45309"/><text x="220" y="62" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Çoklu alfabe · Vigenère fikri</text>'
        );
      case 'weak_classic':
        return (
          cap(title, p, 22) +
          '<path d="M32 72 L60 44 L88 72 L116 48 L144 72 L172 52 L200 72" stroke="' +
          p.b +
          '" stroke-width="2" fill="none"/><text x="220" y="58" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Frekans · known-plaintext</text>'
        );
      case 'otp_pad':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="44" width="200" height="28" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="32" y="62" fill="' +
          p.b +
          '" font-family="ui-monospace" font-size="10">…010110011101…</text><text x="240" y="62" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Tek kullanımlik anahtar</text>'
        );
      case 'otp_rules':
        return (
          cap(title, p, 22) +
          '<rect x="20" y="40" width="360" height="40" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="32" y="58" fill="' +
          p.b +
          '" font-size="10">Rastgele · tek kullanım · uzunluk ≥ mesaj · asla yeniden kullanma</text>'
        );
      case 'classic_viz':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="42" width="100" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="40" y="65" fill="' +
          p.a +
          '" font-size="10">CyberChef</text>' +
          '<rect x="140" y="42" width="100" height="36" rx="8" fill="#fff" stroke="' +
          p.b +
          '"/><text x="162" y="65" fill="' +
          p.b +
          '" font-size="10">dcode</text>' +
          '<rect x="256" y="42" width="120" height="36" rx="8" fill="' +
          p.c +
          '" fill-opacity="0.3" stroke="#b45309"/><text x="268" y="65" fill="#92400e" font-size="10">Görsel deney</text>'
        );
      case 'freq_bars':
        return (
          cap(title, p, 22) +
          '<rect x="40" y="52" width="14" height="28" fill="' +
          p.a +
          '"/><rect x="68" y="40" width="14" height="40" fill="' +
          p.b +
          '"/><rect x="96" y="48" width="14" height="32" fill="' +
          p.a +
          '"/><rect x="124" y="36" width="14" height="44" fill="#b45309"/><text x="180" y="62" fill="' +
          p.b +
          '" font-size="11" font-weight="600">Harf frekansı dağılımı</text>'
        );
      case 'sym_logic':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="44" width="80" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="48" y="67" fill="' +
          p.a +
          '" font-size="10" font-weight="600">A</text>' +
          '<rect x="300" y="44" width="80" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="328" y="67" fill="' +
          p.a +
          '" font-size="10" font-weight="600">B</text>' +
          '<rect x="168" y="48" width="64" height="28" rx="6" fill="' +
          p.c +
          '" stroke="' +
          p.b +
          '"/><text x="192" y="66" fill="#0f172a" font-size="11" font-weight="800">K</text>'
        );
      case 'block_cipher':
        return (
          cap(title, p, 22) +
          '<rect x="32" y="46" width="48" height="32" rx="4" fill="#e0f2fe" stroke="' +
          p.a +
          '"/><rect x="88" y="46" width="48" height="32" rx="4" fill="#e0f2fe" stroke="' +
          p.a +
          '"/><rect x="144" y="46" width="48" height="32" rx="4" fill="#e0f2fe" stroke="' +
          p.a +
          '"/><text x="220" y="66" fill="' +
          p.b +
          '" font-size="11" font-weight="600">AES blok: 128 bit</text>'
        );
      case 'modes_overview':
        return (
          cap(title, p, 22) +
          '<rect x="20" y="42" width="72" height="32" rx="6" fill="#fff" stroke="#64748b"/><text x="38" y="62" font-size="9" font-weight="700">ECB</text>' +
          '<rect x="104" y="42" width="72" height="32" rx="6" fill="#fff" stroke="#64748b"/><text x="120" y="62" font-size="9" font-weight="700">CBC</text>' +
          '<rect x="188" y="42" width="72" height="32" rx="6" fill="#fff" stroke="#64748b"/><text x="200" y="62" font-size="9" font-weight="700">CTR</text>' +
          '<rect x="272" y="42" width="100" height="32" rx="6" fill="' +
          p.c +
          '" fill-opacity="0.35" stroke="' +
          p.a +
          '"/><text x="288" y="62" font-size="9" font-weight="700">AEAD</text>'
        );
      case 'ecb_pattern':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="50" width="40" height="28" rx="2" fill="#93c5fd"/><rect x="68" y="50" width="40" height="28" rx="2" fill="#93c5fd"/><rect x="112" y="50" width="40" height="28" rx="2" fill="#93c5fd"/><text x="170" y="58" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Aynı PT → aynı CT bloğu</text><text x="170" y="74" fill="#b91c1c" font-size="9">ECB penguen riski</text>'
        );
      case 'cbc_chain':
        return (
          cap(title, p, 22) +
          '<circle cx="40" cy="60" r="8" fill="' +
          p.c +
          '" stroke="' +
          p.a +
          '"/><path d="M48 60h40" stroke="' +
          p.b +
          '" stroke-width="2"/><rect x="92" y="48" width="36" height="24" fill="#bfdbfe" stroke="' +
          p.a +
          '"/><path d="M128 60h40" stroke="' +
          p.b +
          '" stroke-width="2"/><rect x="172" y="48" width="36" height="24" fill="#bfdbfe" stroke="' +
          p.a +
          '"/><text x="230" y="64" fill="' +
          p.a +
          '" font-size="10" font-weight="600">IV + zincir</text>'
        );
      case 'ctr_counter':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="44" width="72" height="32" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="40" y="64" fill="' +
          p.a +
          '" font-family="ui-monospace" font-size="11">ctr++</text>' +
          '<text x="120" y="64" fill="' +
          p.b +
          '" font-size="14">⊕</text>' +
          '<rect x="150" y="44" width="72" height="32" rx="6" fill="#e0f2fe" stroke="' +
          p.b +
          '"/><text x="240" y="64" fill="' +
          p.a +
          '" font-size="10">Akış benzeri blok modu</text>'
        );
      case 'ae_auth':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="42" width="120" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="44" y="64" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Şifreli</text>' +
          '<rect x="156" y="42" width="80" height="36" rx="8" fill="' +
          p.c +
          '" fill-opacity="0.45" stroke="#15803d"/><text x="172" y="64" fill="#14532d" font-size="10" font-weight="700">Tag</text>' +
          '<text x="260" y="64" fill="' +
          p.b +
          '" font-size="10">Bütünlük + gizlilik</text>'
        );
      case 'stream_bits':
        return (
          cap(title, p, 22) +
          '<path d="M24 60 Q80 36 140 60 T260 60 T380 60" stroke="' +
          p.b +
          '" stroke-width="2" fill="none"/><text x="260" y="40" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Anahtar akışı ⊕ düz metin</text>'
        );
      case 'sym_tools':
        return (
          cap(title, p, 22) +
          '<text x="32" y="64" fill="' +
          p.a +
          '" font-family="ui-monospace" font-size="11">openssl enc -aes-256-…</text><text x="32" y="82" fill="' +
          p.b +
          '" font-family="ui-monospace" font-size="9">-K · -iv · -pbkdf2</text>'
        );
      case 'openssl_aes_file':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="44" width="100" height="36" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="40" y="66" fill="' +
          p.a +
          '" font-size="10">file.bin</text>' +
          '<path d="M128 62h40" stroke="' +
          p.b +
          '" stroke-width="2"/><rect x="176" y="44" width="100" height="36" rx="6" fill="#1e293b"/><text x="188" y="66" fill="#94a3b8" font-size="10">Salted__</text>'
        );
      case 'openssl_cipher_list':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="38" width="352" height="48" rx="8" fill="#0f172a"/><text x="36" y="58" fill="#a5b4fc" font-family="ui-monospace" font-size="9">aes-256-cbc · aes-256-gcm · camellia-256-ofb …</text><text x="36" y="76" fill="#64748b" font-family="ui-monospace" font-size="9">-help ile mod adları</text>'
        );
      case 'hash_primer':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="46" width="80" height="32" rx="6" fill="#fff" stroke="' +
          p.b +
          '"/><path d="M112 62h36" stroke="' +
          p.b +
          '" stroke-width="2"/><polygon points="148,62 140,58 140,66" fill="' +
          p.b +
          '"/>' +
          '<rect x="156" y="46" width="120" height="32" rx="8" fill="' +
          p.c +
          '" fill-opacity="0.4" stroke="' +
          p.a +
          '"/><text x="168" y="66" fill="#134e4a" font-family="ui-monospace" font-size="10">digest</text>'
        );
      case 'hash_families':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="44" width="72" height="32" rx="6" fill="#fef2f2" stroke="#ef4444"/><text x="40" y="64" fill="#991b1b" font-size="10" font-weight="700">MD5</text>' +
          '<rect x="108" y="44" width="72" height="32" rx="6" fill="#fff7ed" stroke="#ea580c"/><text x="118" y="64" fill="#9a3412" font-size="10" font-weight="700">SHA-1</text>' +
          '<rect x="192" y="44" width="88" height="32" rx="6" fill="#ecfdf5" stroke="#16a34a"/><text x="204" y="64" fill="#166534" font-size="10" font-weight="700">SHA-2/3</text>'
        );
      case 'hash_uses':
        return (
          cap(title, p, 22) +
          '<text x="32" y="52" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Bütünlük</text><text x="32" y="70" fill="' +
          p.b +
          '" font-size="10">commitment · HMAC · imza öncesi</text><circle cx="320" cy="58" r="18" fill="none" stroke="' +
          p.c +
          '" stroke-width="3"/>'
        );
      case 'mac_primer':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="48" width="64" height="28" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="44" y="66" fill="' +
          p.a +
          '" font-size="10">K</text>' +
          '<text x="110" y="66" fill="' +
          p.b +
          '" font-size="12">+</text>' +
          '<rect x="130" y="48" width="100" height="28" rx="6" fill="#f1f5f9" stroke="' +
          p.b +
          '"/><text x="148" y="66" fill="' +
          p.b +
          '" font-size="10">mesaj</text>' +
          '<text x="250" y="66" fill="' +
          p.b +
          '" font-size="12">→</text>' +
          '<rect x="270" y="48" width="90" height="28" rx="6" fill="' +
          p.c +
          '" fill-opacity="0.4" stroke="#15803d"/><text x="290" y="66" fill="#14532d" font-size="10" font-weight="700">MAC</text>'
        );
      case 'kdf_ladder':
        return (
          cap(title, p, 22) +
          '<rect x="40" y="52" width="56" height="20" rx="4" fill="#fff" stroke="' +
          p.a +
          '"/><rect x="110" y="46" width="56" height="20" rx="4" fill="#e2e8f0" stroke="' +
          p.b +
          '"/><rect x="180" y="40" width="56" height="20" rx="4" fill="#cbd5e1" stroke="' +
          p.b +
          '"/><text x="260" y="58" fill="' +
          p.a +
          '" font-size="10" font-weight="600">PBKDF2 · scrypt · Argon2</text>'
        );
      case 'password_store':
        return (
          cap(title, p, 22) +
          '<rect x="32" y="44" width="200" height="36" rx="8" fill="#1e293b"/><text x="44" y="66" fill="#86efac" font-family="ui-monospace" font-size="10">$argon2id$… veya $2b$…</text><text x="250" y="64" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Salt + maliyet</text>'
        );
      case 'hash_mac_toolbox':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="44" width="100" height="32" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><text x="48" y="64" fill="' +
          p.a +
          '" font-size="10">hash</text>' +
          '<rect x="140" y="44" width="100" height="32" rx="6" fill="#fff" stroke="' +
          p.b +
          '"/><text x="170" y="64" fill="' +
          p.b +
          '" font-size="10">HMAC</text>' +
          '<rect x="256" y="44" width="120" height="32" rx="6" fill="#fff" stroke="#15803d"/><text x="278" y="64" fill="#166534" font-size="10">KDF</text>'
        );
      case 'openssl_hash_read':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="40" width="352" height="40" rx="8" fill="#0f172a"/><text x="36" y="58" fill="#94a3b8" font-family="ui-monospace" font-size="10">openssl dgst -sha256 file.dat</text><text x="36" y="74" fill="#64748b" font-family="ui-monospace" font-size="9">(stdin)= a3f1…</text>'
        );
      case 'hmac_vs_plain':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="44" width="160" height="36" rx="8" fill="#f1f5f9" stroke="' +
          p.a +
          '"/><text x="36" y="66" fill="' +
          p.a +
          '" font-size="10" font-weight="600">HMAC (anahtarlı)</text>' +
          '<rect x="200" y="44" width="160" height="36" rx="8" fill="#fef2f2" stroke="#b91c1c"/><text x="216" y="66" fill="#991b1b" font-size="10" font-weight="600">Plain SHA (sadece özet)</text>'
        );
      case 'passwd_detect':
        return (
          cap(title, p, 22) +
          '<text x="28" y="64" fill="' +
          p.a +
          '" font-family="ui-monospace" font-size="10" font-weight="600">$2b$ · $argon2id$ · $y$</text><text x="28" y="82" fill="' +
          p.b +
          '" font-size="9">Format tanıma · parametreler</text>'
        );
      case 'bcrypt_line':
        return (
          cap(title, p, 22) +
          '<rect x="20" y="42" width="360" height="36" rx="8" fill="#1e293b"/><text x="28" y="64" fill="#86efac" font-family="ui-monospace" font-size="9">$2b$12$…22…31…</text>'
        );
      case 'hash_ethics':
        return (
          cap(title, p, 22) +
          '<path d="M80 72 L200 40 L320 72" stroke="' +
          p.b +
          '" stroke-width="2" fill="none"/><circle cx="200" cy="52" r="16" fill="' +
          p.c +
          '" stroke="' +
          p.a +
          '"/><text x="168" y="86" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Etik · izin · kapsam</text>'
        );
      case 'cyberchef_hash_enc':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="44" width="110" height="32" rx="6" fill="#ecfdf5" stroke="#22c55e"/><text x="44" y="64" fill="#166534" font-size="10">HEX out</text>' +
          '<rect x="150" y="44" width="110" height="32" rx="6" fill="#f1f5f9" stroke="' +
          p.a +
          '"/><text x="168" y="64" fill="' +
          p.a +
          '" font-size="10">SHA out</text>' +
          '<rect x="276" y="44" width="100" height="32" rx="6" fill="#fff7ed" stroke="#ea580c"/><text x="288" y="64" fill="#9a3412" font-size="10">Base64</text>'
        );
      case 'triple_compare':
        return (
          cap(title, p, 22) +
          '<polygon points="60,40 100,72 20,72" fill="#dbeafe" stroke="' +
          p.a +
          '"/><text x="120" y="52" fill="' +
          p.a +
          '" font-size="10" font-weight="600">Hash</text><text x="120" y="68" fill="' +
          p.b +
          '" font-size="10">Encoding</text><text x="120" y="84" fill="#b45309" font-size="10">Encryption</text>'
        );
      case 'openssl_hmac_lab':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="40" width="352" height="44" rx="8" fill="#0f172a"/><text x="36" y="58" fill="#94a3b8" font-family="ui-monospace" font-size="9">openssl dgst -sha256 -hmac key msg</text><text x="36" y="74" fill="#64748b" font-family="ui-monospace" font-size="9">openssl dgst -sha256 msg</text>'
        );
      case 'openssl_key_inspect':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="44" width="200" height="36" rx="6" fill="#1e293b"/><text x="40" y="66" fill="#a5b4fc" font-family="ui-monospace" font-size="9">-----BEGIN … KEY-----</text><circle cx="320" cy="62" r="20" fill="none" stroke="' +
          p.c +
          '" stroke-width="2" stroke-dasharray="3 2"/>'
        );
      case 'ecc_curve':
        return (
          cap(title, p, 22) +
          '<path d="M40 72 Q120 28 200 72 T360 72" fill="none" stroke="' +
          p.b +
          '" stroke-width="2"/><circle cx="220" cy="48" r="5" fill="' +
          p.a +
          '"/><text x="260" y="58" fill="' +
          p.a +
          '" font-size="11" font-weight="600">ECC · Curve25519 / P-256</text>'
        );
      case 'python_crypto':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="44" width="120" height="36" rx="8" fill="#fff" stroke="#15803d"/><text x="48" y="66" fill="#166534" font-size="11" font-weight="700">.py</text>' +
          '<text x="170" y="64" fill="' +
          p.a +
          '" font-family="ui-monospace" font-size="10">from cryptography…</text>'
        );
      case 'rsa_pem':
      case 'rsa_file_teaser':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="42" width="352" height="38" rx="6" fill="#1e293b"/><text x="32" y="64" fill="#fca5a5" font-family="ui-monospace" font-size="9">-----BEGIN RSA PRIVATE KEY-----</text><text x="24" y="88" fill="#b91c1c" font-size="9" font-weight="600">Özel anahtar sızdırma riski</text>'
        );
      case 'security_report':
        return (
          cap(title, p, 22) +
          '<rect x="28" y="44" width="100" height="40" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="48" y="68" fill="' +
          p.a +
          '" font-size="10" font-weight="700">Bulgu</text>' +
          '<path d="M132 64h40" stroke="' +
          p.b +
          '" stroke-width="2"/><polygon points="172,64 164,60 164,68" fill="' +
          p.b +
          '"/>' +
          '<rect x="184" y="44" width="160" height="40" rx="8" fill="#f8fafc" stroke="#64748b"/><text x="200" y="68" fill="' +
          p.b +
          '" font-size="10">Öneri · öncelik · etki</text>'
        );
      case 'gpg_sign':
        return (
          cap(title, p, 22) +
          '<rect x="32" y="44" width="88" height="36" rx="8" fill="#fff" stroke="' +
          p.a +
          '"/><text x="52" y="66" fill="' +
          p.a +
          '" font-size="10" font-weight="700">doc</text>' +
          '<path d="M124 62h36" stroke="' +
          p.b +
          '" stroke-width="2"/><rect x="168" y="44" width="88" height="36" rx="8" fill="#ecfdf5" stroke="#16a34a"/><text x="180" y="66" fill="#166534" font-size="10" font-weight="700">.sig</text>'
        );
      case 'openssl_cert_read':
      case 'openssl_cert_sample':
      case 'openssl_text_sample':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="42" width="120" height="40" rx="6" fill="#fff" stroke="#e11d48"/><text x="36" y="58" fill="#9f1239" font-size="9" font-weight="700">Subject</text><text x="36" y="74" fill="#64748b" font-size="8">CN · SAN</text>' +
          '<rect x="160" y="42" width="120" height="40" rx="6" fill="#fff" stroke="#fb7185"/><text x="172" y="58" fill="#be123c" font-size="9" font-weight="700">Issuer</text>' +
          '<rect x="296" y="42" width="80" height="40" rx="6" fill="#fff1f2" stroke="#e11d48"/><text x="308" y="66" fill="#881337" font-size="9">Validity</text>'
        );
      case 'browser_chain':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="46" width="100" height="32" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><rect x="44" y="52" width="16" height="20" rx="2" fill="none" stroke="' +
          p.a +
          '" stroke-width="2"/><path d="M48 52v-6a8 8 0 0 1 16 0v6" stroke="' +
          p.a +
          '" stroke-width="2" fill="none"/>' +
          '<path d="M128 62h28" stroke="' +
          p.b +
          '" stroke-width="2"/><rect x="164" y="46" width="100" height="32" rx="6" fill="#fff" stroke="' +
          p.b +
          '"/><text x="188" y="66" fill="' +
          p.b +
          '" font-size="10">CA</text>' +
          '<path d="M268 62h28" stroke="' +
          p.b +
          '" stroke-width="2"/><rect x="304" y="46" width="72" height="32" rx="6" fill="#ecfdf5" stroke="#16a34a"/><text x="320" y="66" fill="#166534" font-size="9">sunucu</text>'
        );
      case 'wireshark_tls':
        return (
          cap(title, p, 22) +
          '<rect x="20" y="44" width="360" height="36" rx="6" fill="#0f172a"/><text x="28" y="58" fill="#22d3ee" font-family="ui-monospace" font-size="9">ClientHello … ServerHello … Certificate</text><text x="28" y="74" fill="#64748b" font-family="ui-monospace" font-size="8">paket sırası · el sıkışma</text>'
        );
      case 'tls_packets':
        return (
          cap(title, p, 22) +
          '<rect x="24" y="46" width="70" height="28" rx="4" fill="#1e3a8a"/><text x="36" y="64" fill="#fff" font-size="8">CH</text>' +
          '<rect x="104" y="46" width="70" height="28" rx="4" fill="#312e81"/><text x="116" y="64" fill="#fff" font-size="8">SH</text>' +
          '<rect x="184" y="46" width="90" height="28" rx="4" fill="#1e40af"/><text x="196" y="64" fill="#fff" font-size="8">Cert</text>' +
          '<rect x="284" y="46" width="90" height="28" rx="4" fill="#166534"/><text x="300" y="64" fill="#fff" font-size="8">Finished</text>'
        );
      case 'deprecated_warn':
        return (
          cap(title, p, 22) +
          '<path d="M200 38 L228 82 H172 Z" fill="#fef2f2" stroke="#dc2626"/><text x="188" y="74" fill="#991b1b" font-size="11" font-weight="800">!</text><text x="240" y="58" fill="' +
          p.a +
          '" font-size="11" font-weight="600">Deprecated uyarısı</text><text x="240" y="76" fill="' +
          p.b +
          '" font-size="9">MD4 · RC4 · eski TLS</text>'
        );
      default:
        if (kind.indexOf('abstract_') === 0) {
          var n = parseInt(kind.split('_')[1], 10) || 0;
          return abstractBody(n, p, title);
        }
        return abstractBody(0, p, title);
    }
  }

  function abstractBody(n, p, title) {
    var c = cap(title, p, 22);
    switch (n % 10) {
      case 0:
        return (
          c +
          '<circle cx="60" cy="58" r="22" fill="none" stroke="' +
          p.a +
          '" stroke-width="2" stroke-dasharray="4 3"/><circle cx="200" cy="58" r="22" fill="none" stroke="' +
          p.b +
          '" stroke-width="2"/><circle cx="340" cy="58" r="22" fill="' +
          p.c +
          '" fill-opacity="0.25" stroke="' +
          p.a +
          '"/>'
        );
      case 1:
        return (
          c +
          '<path d="M24 72h352" stroke="' +
          p.b +
          '" stroke-width="2"/><path d="M24 72l40-32 40 32 40-24 40 24 40-40 40 40 40-28 40 28" stroke="' +
          p.a +
          '" stroke-width="2.5" fill="none"/>'
        );
      case 2:
        return (
          c +
          '<rect x="32" y="44" width="24" height="24" fill="' +
          p.a +
          '" fill-opacity="0.35"/><rect x="68" y="44" width="24" height="24" fill="' +
          p.b +
          '" fill-opacity="0.35"/><rect x="104" y="44" width="24" height="24" fill="' +
          p.c +
          '" fill-opacity="0.45"/><rect x="140" y="44" width="24" height="24" fill="' +
          p.a +
          '" fill-opacity="0.2"/>'
        );
      case 3:
        return (
          c +
          '<path d="M200 40v52M160 64h80M140 48c40-20 80-20 120 0" stroke="' +
          p.b +
          '" stroke-width="2" fill="none"/>'
        );
      case 4:
        return (
          c +
          '<polygon points="200,40 360,72 40,72" fill="' +
          p.c +
          '" fill-opacity="0.2" stroke="' +
          p.a +
          '"/><circle cx="200" cy="62" r="8" fill="' +
          p.b +
          '"/>'
        );
      case 5:
        return (
          c +
          '<g stroke="' +
          p.a +
          '" stroke-width="2"><path d="M40 72h60"/><path d="M120 72h60"/><path d="M200 72h60"/><path d="M280 72h60"/></g><circle cx="90" cy="72" r="4" fill="' +
          p.b +
          '"/><circle cx="230" cy="72" r="4" fill="' +
          p.b +
          '"/>'
        );
      case 6:
        return (
          c +
          '<rect x="60" y="44" width="280" height="32" rx="16" fill="#fff" stroke="' +
          p.b +
          '"/><circle cx="200" cy="60" r="10" fill="' +
          p.c +
          '" stroke="' +
          p.a +
          '"/>'
        );
      case 7:
        return (
          c +
          '<path d="M48 60h304" stroke="' +
          p.b +
          '" stroke-width="1.5" stroke-dasharray="2 6"/><path d="M48 48c80 40 224-40 304 24" stroke="' +
          p.a +
          '" stroke-width="2" fill="none"/>'
        );
      case 8:
        return (
          c +
          '<rect x="40" y="46" width="320" height="28" rx="6" fill="#fff" stroke="' +
          p.a +
          '"/><path d="M60 60h260" stroke="' +
          p.c +
          '" stroke-width="4" stroke-linecap="round"/>'
        );
      default:
        return (
          c +
          '<text x="200" y="58" text-anchor="middle" fill="' +
          p.a +
          '" font-size="12" font-weight="700">Modül görseli</text><text x="200" y="78" text-anchor="middle" fill="' +
          p.b +
          '" font-size="10">Kriptografi şeması</text>'
        );
    }
  }

  function build(title, sectionId, mod) {
    var p = palette(mod);
    var les = parseLessonIdx(sectionId);
    var kind = resolveKind(title, sectionId, mod);
    var inner = bodyFor(kind, p, mod, les, title);
    return wrap(p.bg, inner);
  }

  window.krBuildLessonVisualSvg = build;
  window.krResolveLessonVisualKind = function (title, sectionId, mod) {
    return resolveKind(title, sectionId, mod);
  };
})();
