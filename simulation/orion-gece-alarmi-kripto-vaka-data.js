/* Orion Gece Alarmı — vaka verisi */
window.ORION_VAKA = (function () {
  var BADGE_B64 = 'eyJlbXBsb3llZUlkIjoiU1QxMDgiLCJyb2xlIjoiaW50ZXJuIiwiYXJlYSI6InJlc3RvcmF0aW9uX3ZpZXciLCJzaGlmdCI6Im5pZ2h0In0=';
  var MOON_MOCK = 'ORION_EDU_MOCK:moonstone_scan_downloaded.tiff:integrity-check-v1';
  var MOON_HASH = '8614289496c71abfcb3b299b47e4d2f2a57e72b978c09e33f4f04b9a2181970a';
  var REPORT_MOCK = 'ORION_EDU_MOCK:restoration_report.pdf:integrity-check-v1';
  var REPORT_HASH = 'd2e471959838de5dff61de12d42e4f0bf62f64b5b71266452eb8875951c92794';

  var CONFIG_JSON = {
    A: { algorithm: 'AES-256-ECB', iv: 'none', authenticationTag: false, keyStorage: 'env' },
    B: { algorithm: 'AES-256-CBC', iv: '00000000000000000000000000000000', authenticationTag: false, keyStorage: 'env' },
    C: { algorithm: 'AES-256-GCM', nonce: 'unique_per_file_encryption', authenticationTag: true, tagVerification: true, keyStorage: 'secret_manager' },
    D: { algorithm: 'AES-256-GCM', nonce: 'fixed_for_all_files', authenticationTag: true, tagVerification: false, keyStorage: 'source_code' }
  };

  return {
    mock: {
      badgePayload: BADGE_B64,
      moonContent: MOON_MOCK,
      moonHash: MOON_HASH,
      reportContent: REPORT_MOCK,
      reportHash: REPORT_HASH,
      config: CONFIG_JSON
    },

    tools: [
      { id: 'b64', label: 'Base64', sub: 'Çözücü', icon: 'fa-solid fa-arrow-right-arrow-left', color: '#38bdf8' },
      { id: 'sha', label: 'SHA-256', sub: 'Özet', icon: 'fa-solid fa-fingerprint', color: '#a78bfa' },
      { id: 'compare', label: 'Hash', sub: 'Karşılaştır', icon: 'fa-solid fa-code-compare', color: '#34d399' },
      { id: 'password', label: 'Parola', sub: 'Saklama', icon: 'fa-solid fa-key', color: '#fbbf24' },
      { id: 'config', label: 'Config', sub: 'Şifreleme', icon: 'fa-solid fa-sliders', color: '#fb923c' },
      { id: 'signature', label: 'İmza', sub: 'Doğrulama', icon: 'fa-solid fa-file-signature', color: '#f472b6' },
      { id: 'cert', label: 'Sertifika', sub: 'TLS / X.509', icon: 'fa-solid fa-certificate', color: '#2dd4bf' },
      { id: 'tls', label: 'TLS', sub: 'El sıkışma', icon: 'fa-solid fa-shield-halved', color: '#60a5fa' }
    ],

    stages: [
      {
        id: 'badge',
        title: 'Erişim rozeti',
        time: '02:18',
        tl: 'Erişim rozeti kaydı',
        alarmHint: 'Stajyer hesabı restorasyon alanı rozeti incelendi.',
        story: 'Geliştirici notu: «Rozet verisi Base64 ile şifrelenmiştir.» Bu ifadeyi kanıt üzerinde test edin.',
        hint: 'access_badge.txt dosyasındaki badge_data değerini Base64 Çöz aracına aktarın. Çözümleme sonrası verinin gerçekten şifreli mi yoksa yalnızca kodlanmış mı olduğuna kendiniz karar verin; ardından aşamayı tamamlayın.',
        requiredTools: ['b64'],
        evidenceHtml:
          '<div class="or-file"><div class="or-file-head"><i class="fa-regular fa-file-lines"></i> access_badge.txt</div>' +
          '<div class="or-file-body" id="evBadgeRaw">badge_data=' + BADGE_B64 + '</div>' +
          '<div class="or-file-note">Geliştirici: «Base64 ile şifrelenmiştir.»</div></div>',
        finding: {
          title: 'Erişim rozeti Base64 ile kodlanmış',
          evidence: 'Base64 çözümünde employeeId, role, area ve shift okunabildi.',
          risk: 'Orta',
          riskLevel: 'medium',
          recommendation: 'Base64 şifreleme değildir; gizlilik için uygun mekanizma değerlendirilmeli.'
        }
      },
      {
        id: 'hash',
        title: 'Eser görseli bütünlüğü',
        time: '02:22',
        tl: 'Ay Taşı hash kontrolü',
        alarmHint: 'Ay Taşı görseli bütünlük kontrolü.',
        story: 'moonstone_scan_downloaded.tiff dosyasının orijinal referans hash ile aynı olup olmadığını kontrol edin.',
        hint: 'Önce Kanıt Kasası\'ndan TIFF dosyasını seçin (SHA-256 açıkken de seçebilirsiniz). Hash hesaplayın; referans ve hesaplanan değerleri Hash Karşılaştır aracına elle yapıştırın.',
        requiredTools: ['sha', 'compare'],
        needsTiffSelect: true,
        evidenceHtml:
          '<div class="or-file"><div class="or-file-head"><i class="fa-regular fa-file-code"></i> moonstone_original_hash.txt</div>' +
          '<div class="or-file-body" id="evRefHash">Orijinal SHA-256:\n' + MOON_HASH + '</div></div>' +
          '<div class="or-file or-file--pick" id="pickTiff" role="button" tabindex="0">' +
          '<div class="or-file-head"><i class="fa-regular fa-file-image"></i> moonstone_scan_downloaded.tiff</div>' +
          '<div class="or-file-body">18.4 MB · Bütünlük kontrolü bekliyor\n\n← Seçmek için tıklayın</div></div>',
        finding: {
          title: 'Ay Taşı görseli bütünlük kontrolü başarılı',
          evidence: 'Hesaplanan SHA-256 referans ile eşleşti.',
          risk: 'Düşük',
          riskLevel: 'low',
          recommendation: 'Üretici doğrulaması için dijital imza ayrıca gerekir.'
        }
      },
      {
        id: 'password',
        title: 'Parola saklama',
        time: '02:28',
        tl: 'Parola kayıtları',
        alarmHint: 'MD5 ile parola saklama iddiası.',
        story: '«Parolalar MD5 ile hashleniyor, güvenli.» ifadesi örnek CSV üzerinde doğrulanmalı.',
        hint: 'Parola Saklama aracını açın. Örnek kayıtlardaki hash yöntemini inceleyin; modern parola saklama beklentileriyle kendi sonucunuzu çıkarın.',
        requiredTools: ['password'],
        evidenceHtml:
          '<div class="or-file"><div class="or-file-head"><i class="fa-solid fa-table"></i> archive_password_sample.csv</div>' +
          '<div class="or-file-body">user_id,password_hash,method\n' +
          'curator01,5f4dcc3b5aa765d61d8327deb882cf99,MD5\n' +
          'intern02,e10adc3949ba59abbe56e057f20f883e,MD5\n' +
          'restorer03,25d55ad283aa400af464c76d713c07ad,MD5</div></div>',
        finding: {
          title: 'Zayıf parola saklama (MD5)',
          evidence: 'Örnek kayıtlarda MD5 kullanımı görüldü.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'Argon2id, bcrypt veya scrypt + salt kullanılmalı.'
        }
      },
      {
        id: 'config',
        title: 'Restorasyon kasası şifreleme',
        time: '02:35',
        tl: 'Vault crypto config',
        alarmHint: 'Şifreleme yapılandırması karışık.',
        story: 'Restorasyon Kasası için dört AES yapılandırması mevcut. Config dosyasını inceleyin.',
        hint: 'Kanıt kasasındaki restoration_vault_crypto_config.json içeriğini Config aracına yapıştırın. Mod, IV/nonce, tag doğrulaması ve anahtar saklamayı birlikte değerlendirin.',
        requiredTools: ['config'],
        evidenceHtml:
          '<div class="or-file"><div class="or-file-head"><i class="fa-solid fa-file-code"></i> restoration_vault_crypto_config.json</div>' +
          '<div class="or-file-body or-file-body--mono">' + JSON.stringify(CONFIG_JSON, null, 2) + '</div></div>',
        finding: {
          title: 'Güvenli vault yapılandırması seçilmeli',
          evidence: 'ECB, sabit IV/nonce ve kaynak kodda anahtar riskleri tespit edildi; GCM + benzersiz nonce + tag doğrulama önerilir.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'Seçenek C profili: AES-GCM, benzersiz nonce, tag doğrulama, secret manager.'
        }
      },
      {
        id: 'signature',
        title: 'Restorasyon raporu imzası',
        time: '02:41',
        tl: 'İmza doğrulaması',
        alarmHint: 'Rapor imzası şüpheli.',
        story: 'Hash eşleşse bile imza doğrulaması ayrı kontrol edilmelidir.',
        hint: 'Kanıt kasasındaki yayınlanan SHA-256 değerini İmza aracına girin. Hash bütünlüğü ile dijital imza doğrulamasının farklı amaçlara hizmet ettiğini sonuçlardan çıkarın.',
        requiredTools: ['signature'],
        evidenceHtml:
          '<div class="or-file"><div class="or-file-head"><i class="fa-regular fa-file-pdf"></i> restoration_report.pdf</div>' +
          '<div class="or-file-body">+.sha256, .sig, consultant_public_key.asc\nYayınlanan hash: ' + REPORT_HASH + '</div></div>',
        finding: {
          title: 'BAD signature — rapor onaylanmamalı',
          evidence: 'İmza doğrulaması başarısız (BAD signature).',
          risk: 'Kritik',
          riskLevel: 'critical',
          recommendation: 'Yükleme süreci ve anahtar güveni incelenmeli.'
        }
      },
      {
        id: 'tls',
        title: 'TLS sertifikası',
        time: '02:48',
        tl: 'Panel TLS uyarısı',
        alarmHint: 'vault.orion-archive.test sertifika uyarısı.',
        story: 'Arşiv paneli bağlantısında sertifika uyarısı oluştu.',
        hint: 'Sertifika İncele ve TLS Akışı araçlarını kullanın. İstenen host adı, SAN alanı ve sertifika bitiş tarihini kontrol edin; simülasyon tarihi 2026-05-16.',
        requiredTools: ['cert', 'tls'],
        evidenceHtml:
          '<div class="or-file"><div class="or-file-head"><i class="fa-solid fa-certificate"></i> archive_tls_certificate.txt</div>' +
          '<div class="or-file-body">Host: vault.orion-archive.test\nSAN: archive…, cdn…\nBitiş: 2026-04-01 · Sim: 2026-05-16</div></div>',
        finding: {
          title: 'TLS sertifikasında host ve süre sorunu',
          evidence: 'vault host SAN\'da yok; sertifika süresi dolmuş.',
          risk: 'Yüksek',
          riskLevel: 'high',
          recommendation: 'Doğru SAN ve geçerli sertifika kullanılmalı.'
        }
      }
    ],

    finalReport:
      'Orion Dijital Müze Arşivi\nKriptografi Ön İnceleme Raporu\n\n' +
      'Vaka: Gece Alarmı #OR-7721\n\n' +
      'İnceleme Özeti:\n' +
      'Erişim rozeti, eser görseli, parola saklama, restorasyon kasası şifreleme, restorasyon raporu imzası ve TLS sertifikası incelenmiştir.\n\n' +
      'Bulgu 1 — Erişim Rozeti:\nRozet verisi Base64 ile kodlanmıştır. Şifreleme değildir.\n\n' +
      'Bulgu 2 — Eser Görseli:\nSHA-256 referansla eşleşti (bütünlük olumlu).\n\n' +
      'Bulgu 3 — Parola Saklama:\nMD5 kullanımı risklidir.\n\n' +
      'Bulgu 4 — Şifreleme:\nAES-GCM doğru yapılandırma ile kullanılmalıdır.\n\n' +
      'Bulgu 5 — İmza:\nBAD signature — rapor onaylanmamalı.\n\n' +
      'Bulgu 6 — TLS:\nAlan adı uyuşmazlığı ve süre aşımı.\n\n' +
      'Genel Sonuç:\nKriptografik mekanizmaların yanlış amaçla yorumlanması temel risktir.'
  };
})();
