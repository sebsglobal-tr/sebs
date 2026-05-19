/* Gece Açılan Kapı — mock veri ve aşama yapılandırması */
window.GK_VAKA = {
  simId: 'gece-acilan-kapi-rdp-guvenlik-duvari',
  title: 'Gece Açılan Kapı — RDP Maruziyeti ve Güvenlik Duvarı Krizi',
  subtitle: 'OFFICE-PC-17 · Ağ maruziyeti ve uzak oturum analizi',
  durationMin: 30,

  tabs: [
    { id: 'ticket', label: 'Ticket', icon: 'fa-ticket' },
    { id: 'overview', label: 'System Overview', icon: 'fa-display' },
    { id: 'fw-profiles', label: 'Firewall Profiles', icon: 'fa-shield' },
    { id: 'ports', label: 'Open Ports', icon: 'fa-network-wired' },
    { id: 'services', label: 'Service Mapper', icon: 'fa-gears' },
    { id: 'fw-rules', label: 'Firewall Rules', icon: 'fa-list-check' },
    { id: 'logs', label: 'Login Logs', icon: 'fa-clock-rotate-left' },
    { id: 'edge-nat', label: 'Edge Firewall / NAT', icon: 'fa-globe' },
    { id: 'report', label: 'Final Report', icon: 'fa-file-lines', lockUntilStage: 7 }
  ],

  ticket: {
    id: 'NET-417',
    device: 'OFFICE-PC-17',
    user: 'destek.ofis',
    os: 'Windows 11 Pro',
    labOs: 'macOS Sonoma 14.4',
    summary: 'Gece başarısız uzak oturum açma denemeleri',
    window: '02:00–03:00',
    status: 'İlk inceleme bekliyor',
    body:
      'OFFICE-PC-17 cihazında gece boyunca başarısız oturum açma denemeleri görülüyor. Cihaz normal bir ofis bilgisayarı olmasına rağmen dış IP adreslerinden bağlantı denemeleri almış. Kullanıcı cihazı gündüz normal kullanıyor; yavaşlama veya dosya kaybı bildirimi yok. Güvenlik loglarında 02:00–03:00 arasında olağan dışı uzak bağlantı denemeleri var.'
  },

  overview: {
    hostname: 'OFFICE-PC-17',
    os: 'Windows 11 Pro',
    labOs: 'macOS Sonoma 14.4',
    user: 'destek.ofis',
    localIp: '10.10.12.47',
    networkProfile: 'Public',
    vpn: 'Kapalı',
    rdp: 'Enabled',
    lastUpdate: '18 gün önce',
    firewallStatus: 'Açık görünüyor',
    lastReboot: '2 gün önce',
    eduMsg:
      'Firewall açık görünüyor olabilir; ancak bu tek başına sistemin güvenli olduğunu kanıtlamaz. Profil durumu, inbound kurallar ve beklenmedik Allow kuralları ayrıca incelenmelidir.'
  },

  fwProfiles: [
    { profile: 'Domain', status: 'On', inbound: 'Block', note: 'Normal', level: 'ok' },
    { profile: 'Private', status: 'On', inbound: 'Block', note: 'Normal', level: 'ok' },
    { profile: 'Public', status: 'On', inbound: 'Block', note: 'Normal görünüyor', level: 'ok' }
  ],

  ports: [
    { proto: 'TCP', local: '0.0.0.0', port: 3389, state: 'LISTENING', pid: 1148, comment: 'Kritik inceleme', critical: true },
    { proto: 'TCP', local: '127.0.0.1', port: 49664, state: 'LISTENING', pid: 912, comment: 'Lokal servis', critical: false },
    { proto: 'TCP', local: '10.10.12.47', port: 5353, state: 'LISTENING', pid: 1304, comment: 'Yerel ağ', critical: false },
    { proto: 'TCP', local: '0.0.0.0', port: 445, state: 'LISTENING', pid: 4, comment: 'SMB, incelenmeli', critical: false },
    { proto: 'TCP', local: '127.0.0.1', port: 9229, state: 'LISTENING', pid: 3280, comment: 'Lokal geliştirme aracı', critical: false }
  ],

  portDetail3389: {
    port: 3389,
    state: 'LISTENING',
    listen: '0.0.0.0',
    pid: 1148,
    note: 'RDP olma ihtimali yüksek. Servis eşleştirmesi yapılmalı.'
  },

  services: {
    1148: {
      pid: 1148,
      process: 'svchost.exe',
      service: 'TermService',
      displayName: 'Remote Desktop Services',
      account: 'Local Service',
      startType: 'Automatic',
      path: 'C:\\Windows\\System32\\svchost.exe',
      signed: 'Microsoft Windows',
      riskNote:
        'Servis meşru olabilir; ancak gereksiz veya geniş erişime açık olması risk oluşturur.'
    },
    912: {
      pid: 912,
      process: 'svchost.exe',
      service: 'RpcEptMapper',
      displayName: 'RPC Endpoint Mapper',
      account: 'NT AUTHORITY\\Network Service',
      startType: 'Automatic',
      path: 'C:\\Windows\\System32\\svchost.exe',
      signed: 'Microsoft Windows',
      riskNote: 'Çekirdek RPC bileşeni; 3389 portu ve uzak oturum analizi için ana kanıt değildir.'
    },
    4: {
      pid: 4,
      process: 'System',
      service: 'System',
      displayName: 'Windows System',
      account: 'SYSTEM',
      startType: 'Boot',
      path: 'System',
      signed: 'Microsoft Windows',
      riskNote: 'Sistem süreci; açık RDP portunu kullanan TermService ile eşleştirme kanıtı değildir.'
    }
  },

  fwRules: [
    { name: 'Remote Desktop - User Mode TCP-In', profile: 'Public, Private', port: '3389', source: 'Any', action: 'Allow', status: 'Kritik', critical: true },
    { name: 'File and Printer Sharing SMB-In', profile: 'Private', port: '445', source: 'Local subnet', action: 'Allow', status: 'İncelenmeli', critical: false },
    { name: 'Core Networking DNS', profile: 'All', port: '53', source: 'System', action: 'Allow', status: 'Normal', critical: false },
    { name: 'Block Telnet Inbound', profile: 'All', port: '23', source: 'Any', action: 'Block', status: 'Normal', critical: false }
  ],

  criticalRuleDetail: {
    name: 'Remote Desktop - User Mode TCP-In',
    profiles: 'Public, Private',
    action: 'Allow',
    protocol: 'TCP',
    localPort: 3389,
    remote: 'Any',
    enabled: true
  },

  loginLogs: [
    { t: '02:11', ev: 'Remote logon attempt', user: 'administrator', src: '185.72.18.44', result: 'Failed', fail: true },
    { t: '02:12', ev: 'Remote logon attempt', user: 'admin', src: '185.72.18.44', result: 'Failed', fail: true },
    { t: '02:13', ev: 'Remote logon attempt', user: 'destek', src: '91.203.14.88', result: 'Failed', fail: true },
    { t: '02:15', ev: 'Remote logon attempt', user: 'support', src: '91.203.14.88', result: 'Failed', fail: true },
    { t: '02:21', ev: 'Remote logon attempt', user: 'destek.ofis', src: '203.0.113.27', result: 'Failed', fail: true },
    { t: '02:44', ev: 'Firewall rule check', user: 'System', src: 'Local', result: 'RDP allow rule active', system: true },
    { t: '08:32', ev: 'Local interactive logon', user: 'destek.ofis', src: 'Local', result: 'Success', fail: false }
  ],

  logsEduMsg:
    'Başarısız giriş denemeleri tek başına sistemin ele geçirildiğini kanıtlamaz. Ancak açık RDP portu ve geniş Allow kuralıyla birlikte değerlendirildiğinde ciddi maruziyet sinyali oluşturur.',

  edgeNat: {
    name: 'TEMP_RDP_SUPPORT_OFFICE17',
    publicPort: 3389,
    internalHost: '10.10.12.47',
    internalPort: 3389,
    status: 'Active',
    created: '14 gün önce',
    purpose: 'Temporary remote support',
    owner: 'IT Support',
    expectedExpiry: 'Oluşturulduktan 2 gün sonra',
    actual: 'Hâlen aktif',
    ownerNote:
      'OFFICE-PC-17, muhasebe departmanında kullanılan standart ofis bilgisayarıdır. Sürekli sunucu uygulaması yoktur. RDP iki hafta önce uzaktan destek için geçici açılmıştır; destek sonrası kapatılması gerekiyordu.'
  },

  intervention: [
    'Ticket ve sistem bilgilerini kaydet.',
    'Açık portları incele.',
    '3389 portunu PID/servis ile eşleştir.',
    'Firewall profil ve kural listesini incele.',
    'Login loglarını zaman çizelgesine dönüştür.',
    'Edge firewall/NAT kuralını kontrol et.',
    'RDP gerekliliğini sistem sahibi notuyla doğrula.',
    'Mevcut kanıtları sakla.',
    'Gereksizse RDP ve geçici NAT kuralının kapatılmasını öner.',
    'Final raporu oluştur.'
  ],

  requiredEvidence: [
    { key: 'ticket', label: 'Ticket', match: 'NET-417' },
    { key: 'port3389', label: '3389 port', match: '3389' },
    { key: 'service1148', label: 'PID/servis', match: 'TermService' },
    { key: 'fwrdp', label: 'Firewall RDP kuralı', match: 'Remote Desktop' },
    { key: 'logs', label: 'Log kanıtı', minLogs: 3, needSystem: true },
    { key: 'nat', label: 'NAT kuralı', match: 'TEMP_RDP' }
  ],

  stages: [
    {
      id: 0,
      title: 'Olay bildirimi',
      pts: 10,
      tab: 'ticket',
      guide: {
        steps: ['Ticket özetini okuyun.', 'İlk müdahale kararını seçin.', 'İsterseniz ticket\'ı kanıt sepetine ekleyin.'],
        hint: 'Şüpheli uzak erişimde önce port, firewall, servis ve log kanıtı toplanmalı; doğrudan kapatma veya sıfırlama eksik analiz olur.',
        tabHint: 'Ticket sekmesinde özet kartını inceleyin.'
      },
      question: 'Bu durumda ilk yapılması gereken nedir?',
      supervisorPrompt:
        'Merhaba. Ben Berat, SOC süpervizörünüz. Gece NET-417 ticket\'ı düştü — OFFICE-PC-17\'de başarısız uzak oturum denemeleri var. Panik yapmadan: bu durumda ilk olarak ne yaparsın?',
      options: [
        'RDP servisini hemen kapatmak.',
        'Güvenlik duvarı kurallarını hemen sıfırlamak.',
        'Önce sistemin ağ profilini, açık portları, firewall durumunu ve logları kanıt olarak incelemek.',
        'Cihazı formatlamak.'
      ],
      correct: 2,
      wrong: {
        0: 'RDP gereksiz olabilir; ancak önce gerçekten açık mı, hangi profilde açık, kim kullanıyor ve loglar ne gösteriyor incelenmelidir.',
        1: 'Firewall kurallarını belgelememek olayın kök nedenini kaybettirebilir.',
        3: 'Format son çare olabilir. Temel inceleme yapılmadan doğru karar değildir.'
      },
      ok: 'Doğru karar. Uzak bağlantı şüphesinde önce kanıt toplanmalıdır. Açık portlar, firewall profilleri, servis/PID ilişkisi ve loglar görülmeden doğrudan müdahale etmek eksik analiz olur.'
    },
    {
      id: 1,
      title: 'Sistem profili',
      pts: 10,
      tab: 'overview',
      guide: {
        steps: ['System Overview sekmesini açın.', 'Ağ profili ve RDP durumunu okuyun.', 'Soruyu yanıtlayın.'],
        hint: 'Firewall “açık” görünmesi tek başına güvenlik kanıtı değildir; Allow kuralları ayrı incelenmelidir.',
        tabHint: 'System Overview sekmesine geçin.'
      },
      question: 'Firewall açık görünüyorsa bu cihaz kesin güvenli midir?',
      supervisorPrompt:
        'System Overview\'e baktın; firewall açık görünüyor. Sence bu tek başına cihazın güvenli olduğunu kanıtlar mı, yoksa başka neye bakmalıyız?',
      options: [
        'Evet, firewall açıksa açık port riski yoktur.',
        'Hayır, firewall açık olsa bile yanlış izin kuralı varsa risk devam eder.',
        'Evet, Windows cihazlarda RDP otomatik güvenlidir.',
        'Hayır, firewall açıkken cihaz internete bağlanamaz.'
      ],
      correct: 1,
      wrong: {
        0: 'Firewall açık olabilir; ancak yanlış yazılmış Allow kuralı riski devam ettirir.',
        2: 'RDP Microsoft servisi olsa da geniş erişime açık bırakılması risklidir.',
        3: 'Firewall açıkken de yanlış NAT veya Allow kuralları dış erişime izin verebilir.'
      },
      ok: 'Doğru. Güvenlik duvarının açık olması önemlidir; fakat yanlış yazılmış bir Allow kuralı uzak erişim riskini devam ettirebilir.',
      gate: 'overviewSeen'
    },
    {
      id: 2,
      title: 'Açık portlar',
      pts: 15,
      tab: 'ports',
      guide: {
        steps: ['Open Ports tablosunda olayla ilişkili port satırını bulun.', 'Detay panelini okuyun.', 'Port kanıtını sepete ekleyin.', 'Soruyu yanıtlayın.'],
        hint: '0.0.0.0 üzerinde dinleme, tüm arayüzlerde bağlantı kabul edilebileceğini gösterebilir; kapsam firewall/NAT ile birlikte değerlendirilmelidir.',
        tabHint: 'Open Ports sekmesine geçin.'
      },
      question: '0.0.0.0 üzerinde LISTENING ne anlama gelir?',
      supervisorPrompt:
        'Open Ports tablosuna geç. Gece ticket\'ında uzaktan oturum denemeleri var — önce tablodan kanıt olarak hangi portu sepete eklemen gerektiğini kendin bul. Kanıtı ekledikten sonra dinleme adresinin ne anlama geldiğini konuşuruz.',
      supervisorPromptAfterEvidence:
        'Kanıtı ekledin, iyi. Şimdi sepetteki port satırına bak — 0.0.0.0 üzerinde LISTENING ne anlama gelir?',
      options: [
        'RDP yalnızca bu cihazın kendi içinde çalışıyor.',
        'RDP hiçbir bağlantı kabul etmiyor.',
        'RDP tüm arayüzlerde dinliyor olabilir; erişim kapsamı firewall/NAT kurallarıyla birlikte incelenmelidir.',
        'Bu port kesin zararlı yazılımdır.'
      ],
      correct: 2,
      wrong: {
        0: '127.0.0.1 dinlemesi iç erişimi sınırlar; 0.0.0.0 daha geniş kapsam gösterir.',
        1: 'LISTENING durumu bağlantı kabul etmeye hazır olduğunu gösterir.',
        3: '3389 varsayılan RDP portudur; tek başına zararlı yazılım kanıtı değildir.'
      },
      ok: 'Doğru. 3389 RDP’nin varsayılan portudur. 0.0.0.0 üzerinde dinlemesi saldırı yüzeyini büyütebilir; tek başına ele geçirilme kanıtı değildir.',
      gate: 'port3389Evidence'
    },
    {
      id: 3,
      title: 'PID / servis',
      pts: 10,
      tab: 'services',
      guide: {
        steps: ['Service Mapper\'da PID 1148\'i seçin.', 'TermService bilgisini okuyun.', 'Kanıt ekleyin.', 'Soruyu yanıtlayın.'],
        hint: 'Meşru servis olması, geniş erişime açık bırakılmasının güvenli olduğu anlamına gelmez.',
        tabHint: 'Service Mapper sekmesine geçin.'
      },
      question: 'Bu çıktıdan en doğru sonuç hangisidir?',
      supervisorPrompt:
        'PID 1148\'i TermService ile eşleştirdin. Meşru bir servis görünüyor olabilir — bu çıktıdan en doğru sonuç hangisi olurdu?',
      options: [
        'svchost.exe göründüğü için olay kesin zararlıdır.',
        'TermService meşru RDP servisidir; risk, servisin gerekli olup olmadığı ve nasıl erişime açıldığı üzerinden değerlendirilmelidir.',
        'Microsoft imzası varsa hiçbir risk yoktur.',
        'PID bilgisi önemli değildir.'
      ],
      correct: 1,
      wrong: {
        0: 'svchost.exe birçok Windows servisinde kullanılır; bağlam önemlidir.',
        2: 'İmza meşruiyeti gösterir; erişim kapsamı ayrı değerlendirilir.',
        3: 'PID, port ile servis eşleştirmesi için kritiktir.'
      },
      ok: 'Doğru. Portu kullanan servis meşru olabilir. Risk, RDP’nin gerekli olup olmadığı ve ne kadar geniş erişime açık bırakıldığıdır.',
      gate: 'serviceEvidence'
    },
    {
      id: 4,
      title: 'Firewall kuralları',
      pts: 15,
      tab: 'fw-rules',
      guide: {
        steps: ['Firewall Profiles sekmesini gözden geçirin.', 'Firewall Rules\'da kritik satırı inceleyin.', 'Kural kanıtını ekleyin.', 'Soruyu yanıtlayın.'],
        hint: 'Public profilde Any kaynağa 3389 Allow en kritik bulgudur.',
        tabHint: 'Önce Firewall Profiles, ardından Firewall Rules.'
      },
      question: 'En kritik firewall bulgusu hangisidir?',
      supervisorPrompt:
        'Firewall profilleri ve kuralları masada. Bu listede en kritik bulgu hangisi — hangisine önce odaklanırsın?',
      options: [
        'DNS kuralının açık olması.',
        'Telnet’in engellenmiş olması.',
        'RDP kuralının Public profilde Any kaynağa izin vermesi.',
        'SMB’nin Private profilde local subnet’e açık olması.'
      ],
      correct: 2,
      wrong: {
        0: 'DNS genelde gerekli çekirdek ağ trafiğidir.',
        1: 'Telnet’in engellenmesi olumlu bir durumdur.',
        3: 'SMB Private’da incelenmeli; RDP Public+Any daha kritiktir.'
      },
      ok: 'Doğru. RDP gereksizse kapatılmalı; gerekiyorsa dar kaynak veya VPN ile sınırlandırılmalıdır. Public profilde Any→3389 ciddi saldırı yüzeyidir.',
      gate: 'fwRuleEvidence',
      alsoVisit: ['fw-profiles']
    },
    {
      id: 5,
      title: 'Login logları',
      pts: 10,
      tab: 'logs',
      guide: {
        steps: ['Login Logs zaman çizelgesini inceleyin.', 'En az 3 başarısız deneme + RDP allow rule satırını seçin.', 'Kanıt ekleyin.', 'Soruyu yanıtlayın.'],
        hint: 'Başarısız girişler ihlal kanıtı olmayabilir; açık RDP maruziyetiyle birlikte risk sinyalidir.',
        tabHint: 'Login Logs sekmesine geçin.'
      },
      question: 'Loglara göre en doğru yorum hangisidir?',
      supervisorPrompt:
        'Login loglarında gece dış IP\'lerden başarısız denemeler var. Açık RDP bulgularıyla birlikte düşününce loglara göre nasıl yorumlarsın?',
      options: [
        'Sistem kesin ele geçirilmiştir.',
        'Hiç başarılı giriş yoksa risk yoktur.',
        'Başarısız dış RDP denemeleri var; bu, açık RDP maruziyetiyle birlikte riskli bir durumdur.',
        'Loglar başarısız olduğu için silinebilir.'
      ],
      correct: 2,
      wrong: {
        0: 'Başarılı dış oturum kanıtı yok; kesin ihlal denemez.',
        1: 'Başarısız denemeler maruziyet ve brute-force girişim sinyalidir.',
        3: 'Loglar korunmalıdır, silinmemelidir.'
      },
      ok: 'Doğru. Başarısız girişler tek başına ihlal kanıtı değildir; port ve firewall bulgularıyla birlikte ciddi risk oluşturur.',
      gate: 'logEvidence'
    },
    {
      id: 6,
      title: 'Edge NAT',
      pts: 10,
      tab: 'edge-nat',
      guide: {
        steps: ['Edge Firewall / NAT kuralını okuyun.', 'Sistem sahibi notunu inceleyin.', 'NAT kanıtını ekleyin.', 'Soruyu yanıtlayın.'],
        hint: 'Geçici destek NAT kuralı kapatılmadıysa dış denemeler cihaza ulaşabilir.',
        tabHint: 'Edge Firewall / NAT sekmesine geçin.'
      },
      question: 'Bu durumda en doğru aksiyon seti hangisidir?',
      supervisorPrompt:
        'Parçalar bir araya geldi: RDP dinliyor, Public profilde Any→3389 Allow var, edge\'de geçici NAT hâlâ aktif. Müdahale planında bu durumda hangi aksiyon setini seçersin?',
      options: [
        'Yalnızca Windows Firewall kapatılır.',
        'RDP servisi gerekiyorsa daraltılır; gerekmiyorsa kapatılır. Edge firewall üzerindeki geçici NAT kuralı kaldırılır veya devre dışı bırakılır. Mevcut kurallar önce belgelenir.',
        'Tüm ağ erişimi kapatılır.',
        'Başarısız loglar önemsiz olduğu için hiçbir işlem yapılmaz.'
      ],
      correct: 1,
      wrong: {
        0: 'Windows tarafı tek başına yeterli değil; edge NAT da kök nendedir.',
        2: 'Tüm erişimi kesmek genelde gerekli değildir; hedefli düzeltme yeterlidir.',
        3: 'Başarısız loglar maruziyet sinyalidir; işlem yapılmaması risklidir.'
      },
      ok: 'Doğru. Sorun yalnızca Windows RDP değildir; geçici NAT kuralı dış denemelerin ulaşmasına neden olmuştur. Değişiklik öncesi durum belgelenmelidir.',
      gate: 'natEvidence'
    },
    {
      id: 7,
      title: 'Müdahale sırası',
      pts: 10,
      type: 'order',
      supervisorPrompt:
        'Kanıtları topladın. Şimdi müdahale sırasına geçelim: adımlara tıkladıkça 1, 2, 3… diye numaralanacak. Doğru sırayı kurduğunda Onayla\'ya bas.',
      ok: 'Doğru müdahale sırası. Önce kanıt ve analiz, sonra düzeltme önerisi ve rapor.',
      orderWrong:
        'Bu sıra doğru değil. Yapılandırma değişikliğinden önce port, servis, firewall ve log belgelenmeli. Temizle\'ye basıp baştan numaralandır.',
      guide: {
        steps: ['Adımlara doğru sırayla tıklayın (1, 2, 3…).', 'Onayla ile gönderin; gerekirse Temizle ile sıfırlayın.'],
        hint:
          'Doğru sıra: 1) Ticket ve sistem bilgilerini kaydet. 2) Açık portları incele. 3) 3389 portunu PID/servis ile eşleştir. 4) Firewall profil ve kural listesini incele. 5) Login loglarını zaman çizelgesine dönüştür. 6) Edge firewall/NAT kuralını kontrol et. 7) RDP gerekliliğini sistem sahibi notuyla doğrula. 8) Mevcut kanıtları sakla. 9) Gereksizse RDP ve geçici NAT kuralının kapatılmasını öner. 10) Final raporu oluştur.',
        tabHint: 'Tüm sekmelerde topladığınız kanıtları gözden geçirin.'
      }
    },
    {
      id: 8,
      title: 'Final raporu',
      pts: 10,
      type: 'report'
    }
  ],

  reportTemplate: {
    bulgu:
      'OFFICE-PC-17 cihazında RDP servisi TCP 3389 portu üzerinden dinleme durumundadır. Port incelemesinde 3389 portunun 0.0.0.0 üzerinde LISTENING durumda olduğu ve PID 1148 ile çalışan TermService / Remote Desktop Services servisine bağlı olduğu görülmüştür. Windows Firewall kural listesinde Remote Desktop - User Mode TCP-In kuralının Public ve Private profillerde, kaynak Any olacak şekilde Allow durumda olduğu tespit edilmiştir. Ayrıca edge firewall üzerinde TEMP_RDP_SUPPORT_OFFICE17 adlı geçici NAT yönlendirme kuralı hâlen aktiftir.',
    etki:
      'Bu yapı, normalde ofis bilgisayarı olarak kullanılan OFFICE-PC-17 cihazının RDP üzerinden dış bağlantı denemelerine açık kalmasına neden olmuştur. Loglarda gece saatlerinde farklı dış IP adreslerinden başarısız uzak oturum açma denemeleri görülmektedir. Başarılı dış oturum kanıtı bulunmamakla birlikte, RDP’nin geniş erişime açık olması kaba kuvvet denemeleri ve yetkisiz uzaktan erişim riski oluşturur.',
    oneri:
      'Öncelikle mevcut port, firewall ve log bulguları kanıt olarak saklanmalıdır. RDP sürekli gerekli değilse devre dışı bırakılmalı ve edge firewall üzerindeki geçici NAT kuralı kaldırılmalıdır. RDP gerekiyorsa erişim VPN veya belirli yönetim IP’leriyle sınırlandırılmalı, MFA uygulanmalıdır. Public profilde Any kaynaklı RDP Allow kuralı kullanılmamalıdır.',
    kanitHeader: 'Kanıt özeti (sepetten otomatik)'
  },

  gains: [
    'Açık portları yalnızca sayı olarak değil, servis ve PID ilişkisiyle yorumladın.',
    'RDP 3389’un uzak erişim için kritik bir saldırı yüzeyi oluşturabileceğini gördün.',
    'Firewall açık olsa bile yanlış Allow kuralının sistemi riskli hale getirebileceğini fark ettin.',
    '0.0.0.0 üzerinde dinleyen servislerin erişim kapsamının ayrıca incelenmesi gerektiğini öğrendin.',
    'Başarısız giriş loglarını kesin ihlal değil, maruziyet sinyali olarak yorumladın.',
    'Geçici destek kurallarının kapatılmamasının kalıcı güvenlik açığına dönüşebileceğini gördün.',
    'Müdahale etmeden önce port, servis, firewall ve log kanıtlarını topladın.'
  ]
}
