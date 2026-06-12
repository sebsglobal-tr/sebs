/* LunaBox Teslimat Krizi — vaka verisi */
window.LUNABOX_VAKA = (function () {
  var JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJMQjEwNDIiLCJlbWFpbCI6ImRlbW9AbHVuYWJveC50ZXN0IiwicGxhbiI6InN0YW5kYXJkIiwibG9ja2VySWQiOiJMS1ItMDcifQ.mock-signature-value';

  var WEBHOOK_JSON =
    '{\n  "payload": {\n    "event": "parcel_delivered",\n    "orderId": "ORD-7781",\n    "lockerId": "LKR-07",\n    "timestamp": "2026-05-16T03:42:00Z"\n  },\n  "signatureHeader": "sha256=SHA256(payload)",\n  "developerNote": "Payload hashlenirse webhook güvenlidir."\n}';

  var PICKUP_CODE =
    'function generatePickupCode(userId) {\n  const seed = Date.now() + userId;\n  Math.seedrandom(seed);\n  return Math.floor(Math.random() * 100000000).toString().padStart(8, "0");\n}';

  var OPENSSL_LIST =
    'OpenSSL Algorithm Output - Gateway Node\n\naes-128-cbc\naes-256-gcm\ndes-cbc\ndes-ecb\nrc4\nchacha20-poly1305';

  var LEGACY_NOTE =
    'Offline emergency note protection:\n\nMethod: Vigenere\nKey: LUNA\nUsed for: all offline notes';

  var XOR_DEMO =
    'C1 = P1 XOR K\nC2 = P2 XOR K\n\nSame K was used for two different emergency messages.';

  var PUBLIC_PEM =
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----';

  var PRIVATE_PEM =
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----';

  var HYBRID_PLAN =
    'Amaç:\nAylık uyuşmazlık raporlarını yalnızca hukuk ekibinin okuyabilmesi.\n\nÖnerilen yöntem:\n- 250 MB PDF raporları doğrudan RSA public key ile şifrele.\n- Private key hukuk ekibinde kalsın.';

  return {
    mock: {
      jwtToken: JWT_TOKEN,
      webhookPayload:
        '{"event":"parcel_delivered","orderId":"ORD-7781","lockerId":"LKR-07","timestamp":"2026-05-16T03:42:00Z"}',
      webhookSecret: 'LUNABOX_EDU_WEBHOOK_SECRET'
    },

    tools: [
      { id: 'jwt', label: 'JWT', sub: 'Token Decode', icon: 'fa-solid fa-key', color: '#38bdf8' },
      { id: 'sha', label: 'SHA-256', sub: 'Özet', icon: 'fa-solid fa-fingerprint', color: '#a78bfa' },
      { id: 'hmac', label: 'HMAC', sub: 'Doğrula', icon: 'fa-solid fa-shield-halved', color: '#34d399' },
      { id: 'entropy', label: 'Entropi', sub: 'Randomness', icon: 'fa-solid fa-dice', color: '#fbbf24' },
      { id: 'openssl', label: 'OpenSSL', sub: 'Algoritma', icon: 'fa-solid fa-list', color: '#fb923c' },
      { id: 'legacy', label: 'Legacy', sub: 'Şifre', icon: 'fa-solid fa-scroll', color: '#f472b6' },
      { id: 'xor', label: 'XOR', sub: 'Tekrar', icon: 'fa-solid fa-code-merge', color: '#e879f9' },
      { id: 'key', label: 'Anahtar', sub: 'PEM İncele', icon: 'fa-solid fa-file-shield', color: '#2dd4bf' },
      { id: 'hybrid', label: 'Hibrit', sub: 'Karşılaştır', icon: 'fa-solid fa-layer-group', color: '#818cf8' }
    ],

    stages: [
      {
        id: 'jwt',
        title: 'Mobil uygulama tokenı',
        time: '03:44',
        tl: 'JWT payload incelemesi',
        alarmHint: 'Mobil token içeriği açık görünebilir.',
        story:
          'Geliştirici notu: «Token imzalı olduğu için içindeki bilgiler kullanıcıdan gizlidir.» Bu ifadeyi kanıt üzerinde test edin.',
        hint: 'mobile_access_token.txt dosyasındaki token değerini JWT Decode aracına yapıştırın. Payload okunabilir mi değerlendirin.',
        requiredTools: ['jwt'],
        evidenceHtml:
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-solid fa-mobile-screen"></i> mobile_access_token.txt</div>' +
          '<div class="lb-file-body">' +
          JWT_TOKEN +
          '</div><div class="lb-file-note">Geliştirici: JWT imzalı olduğu için payload gizlidir.</div></div>',
        finding: {
          title: 'JWT payload gizli değildir',
          evidence: 'Token decode edildiğinde userId, email, plan ve lockerId görülebildi.',
          risk: 'Orta',
          riskLevel: 'medium',
          recommendation:
            'JWT içine gereksiz hassas veri konulmamalı; şifreli token veya opaque session token değerlendirilmeli.'
        }
      },
      {
        id: 'webhook',
        title: 'Mağaza webhook',
        time: '03:48',
        tl: 'Webhook imza kontrolü',
        alarmHint: 'Webhook imza doğrulama uyarıları.',
        story: '«Payload hashlenirse webhook güvenlidir» ifadesi plain SHA-256 vs HMAC açısından test edilmeli.',
        hint: 'store_webhook_sample.txt içeriğini HMAC aracına yapıştırın veya payload ile imza alanlarını ayrı girin.',
        requiredTools: ['hmac'],
        evidenceHtml:
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-solid fa-plug"></i> store_webhook_sample.txt</div>' +
          '<div class="lb-file-body lb-file-body--mono">' +
          WEBHOOK_JSON +
          '</div><div class="lb-file-note">Geliştirici: Payload hashlenirse webhook güvenlidir.</div></div>',
        finding: {
          title: 'Webhook doğrulaması plain SHA-256\'a dayanıyor',
          evidence: 'signatureHeader = SHA256(payload); gizli anahtar kullanılmıyor.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'HMAC-SHA256 ve replay/timestamp kontrolleri kullanılmalı.'
        }
      },
      {
        id: 'pickup',
        title: 'Teslimat kodu üretimi',
        time: '03:52',
        tl: 'Pickup code generator',
        alarmHint: 'Teslimat kodları tahmin edilebilir olabilir.',
        story: '8 haneli dolap kodları Math.random() ve Date.now() ile üretiliyor.',
        hint: 'pickup_code_generator_note.txt kodunu Entropi aracına yapıştırın.',
        requiredTools: ['entropy'],
        evidenceHtml:
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-regular fa-file-code"></i> pickup_code_generator_note.txt</div>' +
          '<div class="lb-file-body">' +
          PICKUP_CODE +
          '</div><div class="lb-file-note">Geliştirici: Kodlar random üretildiği için güvenlidir.</div></div>',
        finding: {
          title: 'Teslimat kodu üretimi tahmin edilebilir girdilere dayanıyor',
          evidence: 'Date.now(), userId ve Math.random() kullanımı tespit edildi.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'CSPRNG tabanlı kod üretimi; tek kullanımlık ve süreli kodlar.'
        }
      },
      {
        id: 'openssl',
        title: 'OpenSSL algoritma listesi',
        time: '03:56',
        tl: 'Gateway algoritmaları',
        alarmHint: 'DES ve RC4 listede görünüyor.',
        story: '«OpenSSL listesinde varsa güvenlidir» varsayımı test edilmeli.',
        hint: 'gateway_openssl_algorithms.txt listesini OpenSSL aracına yapıştırın.',
        requiredTools: ['openssl'],
        evidenceHtml:
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-solid fa-server"></i> gateway_openssl_algorithms.txt</div>' +
          '<div class="lb-file-body">' +
          OPENSSL_LIST +
          '</div><div class="lb-file-note">Geliştirici: DES ve RC4 görünüyor, güvenle kullanabiliriz.</div></div>',
        finding: {
          title: 'OpenSSL listesi güvenli algoritma listesi gibi yorumlanmış',
          evidence: 'DES ve RC4 listede göründüğü için güvenli kabul edilmiş.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'DES, RC4 ve ECB yeni tasarımlarda kullanılmamalı.'
        }
      },
      {
        id: 'legacy',
        title: 'Legacy offline mod',
        time: '04:02',
        tl: 'Vigenère / XOR',
        alarmHint: 'Eski dolaplarda custom şifreleme.',
        story: 'Vigenère ve tekrar kullanılan XOR anahtarı tespit edildi. İki kanıt dosyasını inceleyin.',
        hint: 'legacy_offline_mode.txt → Legacy Şifre; xor_key_reuse_demo.txt → XOR Tekrar. İki aracı da çalıştırın.',
        requiredTools: ['legacy', 'xor'],
        evidenceHtml:
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-solid fa-box-archive"></i> legacy_offline_mode.txt</div>' +
          '<div class="lb-file-body">' +
          LEGACY_NOTE +
          '</div></div>' +
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-solid fa-code"></i> xor_key_reuse_demo.txt</div>' +
          '<div class="lb-file-body">' +
          XOR_DEMO +
          '</div></div>',
        finding: {
          title: 'Legacy offline modda klasik/custom kripto kullanılıyor',
          evidence: 'Vigenère ve tekrar kullanılan XOR anahtar akışı.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'Custom/klasik yöntemler kaldırılmalı; standart kütüphaneler kullanılmalı.'
        }
      },
      {
        id: 'keys',
        title: 'Kurye cihaz anahtarı',
        time: '04:08',
        tl: 'PEM dosyaları',
        alarmHint: 'Private key repo içinde.',
        story: 'Public ve private PEM dosyalarını ayırt edin; private key yönetimini değerlendirin.',
        hint: 'PEM içeriklerini Anahtar İncele aracına yapıştırın; public/private ayrımını belirleyin.',
        requiredTools: ['key'],
        evidenceHtml:
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-solid fa-key"></i> courier_device_public.pem</div>' +
          '<div class="lb-file-body">' +
          PUBLIC_PEM +
          '</div></div>' +
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-solid fa-key"></i> courier_device_private.pem</div>' +
          '<div class="lb-file-body">' +
          PRIVATE_PEM +
          '</div><div class="lb-file-note">Repo notu: private key test kolaylığı için repo içinde.</div></div>',
        finding: {
          title: 'Private key kaynak kod deposunda tutuluyor',
          evidence: 'courier_device_private.pem repo içinde.',
          risk: 'Kritik',
          riskLevel: 'critical',
          recommendation: 'Anahtar rotate edilmeli; secret manager kullanılmalı.'
        }
      },
      {
        id: 'hybrid',
        title: 'Büyük rapor şifreleme',
        time: '04:14',
        tl: 'RSA vs hibrit plan',
        alarmHint: '250 MB PDF doğrudan RSA önerisi.',
        story: 'Hukuk raporları için doğrudan RSA şifreleme planı hibrit yaklaşımla karşılaştırılmalı.',
        hint: 'legal_report_encryption_plan.txt planını Hibrit Şifreleme aracına yapıştırın.',
        requiredTools: ['hybrid'],
        evidenceHtml:
          '<div class="lb-file"><div class="lb-file-head"><i class="fa-regular fa-file-pdf"></i> legal_report_encryption_plan.txt</div>' +
          '<div class="lb-file-body">' +
          HYBRID_PLAN +
          '</div></div>',
        finding: {
          title: 'Büyük raporlar için doğrudan RSA şifreleme uygun değil',
          evidence: '250 MB PDF doğrudan RSA ile şifrelenmesi önerilmiş.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'Hibrit şifreleme: veri AES-GCM, anahtar RSA/OAEP ile korunmalı.'
        }
      }
    ],

    finalReport:
      'LunaBox Teslimat Krizi\nKriptografi Ön İnceleme Raporu\n\n' +
      'Vaka: LunaBox Olay Kaydı #LB-3091\n\n' +
      'İnceleme Özeti:\n' +
      'Mobil token, webhook, teslimat kodu, OpenSSL, legacy mod, anahtar yönetimi ve rapor şifreleme incelenmiştir.\n\n' +
      'Bulgu 1 — JWT: Payload okunabilir; imza gizlilik sağlamaz.\n\n' +
      'Bulgu 2 — Webhook: Plain SHA-256 yeterli değil; HMAC gerekir.\n\n' +
      'Bulgu 3 — Teslimat kodu: Math.random/Date.now riski; CSPRNG gerekir.\n\n' +
      'Bulgu 4 — OpenSSL: Listedeki her algoritma güvenli değildir.\n\n' +
      'Bulgu 5 — Legacy: Vigenère ve XOR tekrarı uygun değil.\n\n' +
      'Bulgu 6 — Private key: Repo içinde tutulmamalı.\n\n' +
      'Bulgu 7 — Büyük rapor: Hibrit şifreleme tercih edilmeli.\n\n' +
      'Genel Sonuç: Kriptografik mekanizmalar doğru amaçla kullanılmalıdır.'
  };
})();
