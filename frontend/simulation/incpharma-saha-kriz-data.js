/**
 * INCPHARMA — Bir Günde Sahada (Demo Assessment)
 * Kurgusal ürün; gerçek tedavi/ürün iddiası yoktur.
 */
window.INCPHARMA_SIM = {
  id: 'incpharma-saha-kriz-demo',
  title: 'Bir Günde Sahada — Kriz, Etik ve Bilimsel Temsil',
  company: 'INCPHARMA',
  product: 'OncoRelief IV',
  molecule: 'Relivansetron',
  lot: 'ORV-24-118A',
  tagline: 'Her bilgi talebi cevaplanmaz. Bazıları doğru kanala taşınır.',

  competencies: [
    { key: 'decisionQuality', label: 'Karar Kalitesi' },
    { key: 'ethicalIntegrity', label: 'Etik Tutarlılık' },
    { key: 'scientificAccuracy', label: 'Bilimsel Doğruluk' },
    { key: 'crisisCommunication', label: 'Kriz İletişimi' },
    { key: 'crisisRecovery', label: 'Kriz Sonrası Güven Onarımı' },
    { key: 'relationshipManagement', label: 'Hastane İlişkisi Yönetimi' },
    { key: 'escalationDiscipline', label: 'Kayıt ve Eskalasyon' },
    { key: 'reportingDiscipline', label: 'Raporlama Disiplini' },
    { key: 'professionalRepresentation', label: 'Profesyonel Temsil' },
  ],

  fatalLabels: {
    fatalParticleUse: 'Şüpheli flakon için kullanıma açık kapı',
    fatalCompetitorClaim: 'Rakip ürün hakkında kanıtsız genelleme',
    fatalOffLabelShare: 'Off-label kaynak paylaşım vaadi',
    fatalOffLabelVerbal: 'Off-label konuyu kayıt dışı sözlü görüşmeye taşıma',
    fatalSupportPromise: 'Uygunsuz destek beklentisine açık kapı',
    fatalClinicalInstruction: 'Klinik/operasyon kararına doğrudan müdahale',
  },

  scenes: {
    intro: {
      type: 'intro',
      next: 'opening',
    },

    opening: {
      title: 'Sıradan gün, ani bildirim',
      continueLabel: 'Onkoloji servisine gir',
      time: '08:42',
      location: 'Atlas Üniversitesi Hastanesi — Otopark',
      narrative:
        'Arabanızı otoparka park ettiniz. Her şey sıradan görünüyor — ta ki hastane kapısına yürürken telefon titreyene kadar.',
      agenda: [
        { time: '09.00', label: 'Onkoloji servisi — kısa ziyaret' },
        { time: '10.30', label: 'Dr. Selim Arda görüşmesi' },
        { time: '11.15', label: 'Dr. Hakan Er — kısa ürün değerlendirmesi' },
        { time: '14.00', label: 'Servis ekibi bilgilendirme (ihtimal)' },
        { time: '17.30', label: 'Murat Bey — gün sonu saha raporu' },
      ],
      alert: {
        title: 'Acil Saha Bildirimi',
        lines: [
          'Hastane: Atlas Üniversitesi Hastanesi',
          'Bölüm: Onkoloji Servisi',
          'Ürün: OncoRelief IV · Lot: ORV-24-118A',
          'Bildirim: Uygulama sonrası ciddi reaksiyon / anafilaktik reaksiyon şüphesi',
          'Durum: Servis ekibi ürünle ilgili açıklama bekliyor',
        ],
      },
      thought:
        'Bugün ürün anlatmaya gelmiştin. Ama şimdi konu ürün tanıtımı değil — hasta güvenliği, bildirim süreci ve hastane güveni aynı anda masada.',
      next: 'crisis',
    },

    crisis: {
      title: 'Anafilaktik kriz — İlk 60 saniye',
      location: 'Onkoloji servisi',
      narrative:
        'Koridor hareketli. Hemşire Ece sizi görür; Dr. Selim Arda hasta odasından çıkmıştır. Ekip net ve sorumlu açıklama bekliyor.',
      dialogue: [
        { who: 'Hemşire Ece', text: 'Siz INCPHARMA temsilcisisiniz değil mi? Az önce OncoRelief IV sonrası hasta ciddi reaksiyon verdi. Ekip üründen şüpheleniyor. Ne söyleyebilirsiniz?' },
        { who: 'Dr. Selim Arda', text: 'Tedavi kararına karışmanızı istemiyorum. Ürün güvenliliği, bildirim süreci ve bundan sonra nasıl ilerleyeceğimiz konusunda net olmanız gerekiyor.' },
      ],
      choices: [
        {
          id: 'crisis_own',
          label: 'Klinik alana girmeden krizi sahiplenmek',
          detail:
            'Geçmiş olsun; klinik müdahale hekimin alanında. Kesin yorum yapamam; ciddi reaksiyon şüphesi olarak kayıt, bilgi toplama ve farmakovijilans/medikal ekibe acil iletim.',
          effects: {
            crisisCommunication: 10,
            relationshipManagement: 6,
            scientificAccuracy: 6,
            escalationDiscipline: 8,
            decisionQuality: 8,
          },
          next: 'lot',
        },
        {
          id: 'crisis_defensive',
          label: 'Ürünü savunmadan önce belirsizliği vurgulamak',
          detail:
            'Bu reaksiyonlar birçok nedenden gelişebilir; üründen kaynaklandığını hemen söylemek doğru olmaz. Ürün bilgi dosyasındaki güvenlilik bölümünü birlikte kontrol edelim.',
          effects: {
            flags: { earlyDefensive: true },
            crisisCommunication: -8,
            relationshipManagement: -6,
            decisionQuality: -4,
          },
          next: 'lot',
        },
        {
          id: 'crisis_clinical',
          label: 'Keskin operasyon tavrı — kullanımı durdurun',
          detail:
            'Servisteki OncoRelief IV kullanımını şimdilik durdurun; aynı lot ürünleri ayırın, firmaya bilgi vereyim.',
          effects: {
            flags: { roleOverreach: true },
            fatal: 'fatalClinicalInstruction',
            relationshipManagement: -10,
            professionalRepresentation: -8,
            ethicalIntegrity: -6,
          },
          next: 'lot',
        },
      ],
    },

    lot: {
      title: 'Lot izleme — Hangi parti, hangi flakon?',
      dynamic: 'lot',
    },

    doctor: {
      dynamic: 'doctor',
    },

    particle: {
      title: 'Partikül şüphesi — Hemşire ikna olmuyor',
      location: 'Servis — flakon kontrolü',
      narrative:
        'Açılmamış flakonda net seçilemeyen küçük bir nokta görünüyor. Hemşire gerçek zamanlı karar baskısı altında.',
      productNote:
        'Kullanım öncesi flakon görsel olarak kontrol edilmelidir. Partikül, renk değişimi veya ambalaj bütünlüğü şüphesinde ürün ayrıştırılmalı ve kalite sürecine bildirilmelidir.',
      dialogue: [
        { who: 'Hemşire Ece', text: 'Net söyleyin — bu flakon kullanılabilir mi? Prospektüsü görüyorum ama gerçek hayatta karar vermemiz gerekiyor.' },
      ],
      choices: [
        {
          id: 'particle_clear',
          label: 'Netlik ve rol sınırını birlikte kurmak',
          detail:
            'Klinik uygulama kararı veremem; şüpheli flakon normal ürün gibi değerlendirilmemeli — ayrıştırma, kayıt ve kalite bildirimi gerekir.',
          effects: { crisisCommunication: 6, scientificAccuracy: 6, relationshipManagement: 4 },
          next: 'particle_mini',
        },
        {
          id: 'particle_delegate',
          label: 'Sorumluluğu hekime bırakmak',
          detail: 'Kararı hekim ve hastane prosedürü vermeli; ben görsel kontrol uyarısını paylaşır, şüpheyi kaliteye iletirim.',
          effects: {
            flags: { particleUnclear: true },
            ethicalIntegrity: 4,
            relationshipManagement: -6,
            crisisCommunication: -4,
          },
          next: 'doctor',
        },
        {
          id: 'particle_soften',
          label: 'Pratik baskıyı rahatlatmak',
          detail: 'Partikül emin değiliz; servis ihtiyacı varsa doktor değerlendirmesiyle ilerlenebilir — lotu not edelim.',
          effects: {
            flags: { particleRisk: true },
            fatal: 'fatalParticleUse',
            crisisCommunication: -12,
            scientificAccuracy: -10,
            relationshipManagement: -8,
            decisionQuality: -8,
          },
          next: 'doctor',
        },
      ],
    },

    particle_mini: {
      title: 'Hemşire ikna olmuyor — Netlik turu',
      dialogue: [{ who: 'Hemşire Ece', text: 'Yani kullanmayalım diyorsunuz ama açıkça söylemek istemiyorsunuz?' }],
      choices: [
        {
          id: 'mini_empathy',
          label: 'Empatik netlik',
          detail: 'Şüpheli flakon normal ürün gibi kullanılmamalı — ürün güvenliği süreci olarak söylüyorum; uygulama kararı hastanede.',
          effects: {
            flags: { recoveryStrong: true },
            crisisCommunication: 10,
            relationshipManagement: 8,
            scientificAccuracy: 6,
          },
          next: 'doctor',
        },
        {
          id: 'mini_legal',
          label: 'Yasal sınıra sığınma',
          detail: 'Kullanın/kullanmayın diyemem — sadece bildirim açabilirim.',
          effects: {
            flags: { particleUnclear: true },
            ethicalIntegrity: 6,
            relationshipManagement: -6,
          },
          next: 'doctor',
        },
        {
          id: 'mini_soft',
          label: 'Baskıyı azalt — belirsiz bırak',
          detail: 'Emin değilsek doktorla bakarız; belki yansımadır.',
          effects: { flags: { particleUnclear: true }, crisisCommunication: -6, scientificAccuracy: -4 },
          next: 'doctor',
        },
      ],
    },

    nermin: {
      title: 'Ara olay — Dr. Nermin Kaya',
      time: 'Öğleden sonra',
      location: 'Onkoloji servisi — koridor',
      narrative:
        'Kriz sonrası servis ekibi kısa açıklama bekliyor. Dr. Nermin Kaya kapıda belirir; net ve sabırsız.',
      dialogue: [
        {
          who: 'Dr. Nermin Kaya',
          text: 'Uzun anlatmayın. Ekip ürün kaynaklı mı değil mi bilmek istemiyor — süreç ne, kim ne zaman dönecek? Abartılı ürün savunması istemiyorum.',
        },
      ],
      choices: [
        {
          id: 'nermin_process',
          label: '60 saniyelik şeffaf süreç özeti',
          detail:
            'İki bildirim var: reaksiyon şüphesi farmakovijilans, flakon şüphesi kalite. Klinik karar sizin; biz kayıt, ayrıştırma ve yazılı resmi dönüş.',
          effects: { crisisRecovery: 10, crisisCommunication: 8, professionalRepresentation: 6 },
          next: 'competitor',
        },
        {
          id: 'nermin_short',
          label: 'Çok kısa — detay sonra',
          detail: 'Firmaya ilettik, değerlendirme sonrası döneceğiz.',
          effects: { crisisRecovery: 2, relationshipManagement: -4 },
          next: 'competitor',
        },
        {
          id: 'nermin_defend',
          label: 'Ürünü savun — endişe abartılı',
          detail: 'OncoRelief onaylı çerçevede kullanılıyor; ürün kaynaklı kanıt yok, endişe abartılı.',
          effects: { crisisRecovery: -10, relationshipManagement: -8, flags: { earlyDefensive: true } },
          next: 'competitor',
        },
      ],
    },

    competitor: {
      title: 'Rakip ürün baskısı',
      location: 'Koridor',
      narrative: 'Dr. Hakan Er ile karşılaşırsınız. Bugünkü kriz onun itirazını güçlendirir.',
      dialogue: [
        {
          who: 'Dr. Hakan Er',
          text: 'Biz diğer ürünle ilerliyorduk. Bugün yaşananlardan sonra OncoRelief IV\'i gündeme almak zorlaştı. Diğer firmada böyle bir kriz yaşamadık.',
        },
      ],
      choices: [
        {
          id: 'comp_neutral',
          label: 'Rakibi kötülemeden süreci sahiplenmek',
          detail:
            'Diğer ürünlerle ilgili yorum yapmam doğru olmaz. Bildirimleri resmi kalite ve farmakovijilans süreciyle ele alıyoruz.',
          effects: { ethicalIntegrity: 8, scientificAccuracy: 8, relationshipManagement: 6 },
          next: 'offlabel',
        },
        {
          id: 'comp_delay',
          label: 'Görüşmeyi erteleyerek ilişkiyi korumak',
          detail: 'Bugün ürün değerlendirmesi için doğru gün değil; inceleme sonrası yazılı bilgilendirme.',
          effects: { relationshipManagement: 4, professionalRepresentation: 3 },
          next: 'offlabel',
        },
        {
          id: 'comp_claim',
          label: 'Kanıtsız rakip genellemesi',
          detail: 'Benzer bildirimler farklı ürünlerde de yaşanabilir; önemli olan firmanın yönetimi.',
          effects: {
            fatal: 'fatalCompetitorClaim',
            ethicalIntegrity: -14,
            scientificAccuracy: -12,
            professionalRepresentation: -10,
          },
          next: 'offlabel',
        },
      ],
    },

    offlabel: {
      title: 'Off-label talep — Hayır demek yetmez',
      transition: 'Her bilgi talebi cevaplanmaz. Bazıları doğru kanala taşınır.',
      thought:
        'Yanlış bir cümle ruhsat dışı tanıtım riskine dönüşebilir. Bu sadece bilgi talebi mi, yoksa sınırın dışına çeken bir alan mı?',
      dialogue: [
        {
          who: 'Dr. Hakan Er',
          text: 'Standart seçeneklerin yetmediği durumlar oluyor. OncoRelief IV\'in resmi endikasyonunu biliyorum — farklı hasta profillerinde değerlendirildiğini duydum. Veri, yayın veya merkez deneyimi var mı? Tanıtım değil, bilimsel bilgi soruyorum.',
        },
      ],
      choices: [
        {
          id: 'off_cold',
          label: 'Soğuk ve güvenli red',
          detail: 'Ruhsatlı tanıtım kapsamı dışında; bu konuda konuşmam, yorum yapmam veya kaynak paylaşmam doğru olmaz.',
          effects: {
            flags: { offLabelCold: true },
            ethicalIntegrity: 10,
            scientificAccuracy: 8,
            relationshipManagement: -8,
          },
          next: 'whatsapp',
        },
        {
          id: 'off_channel',
          label: 'Dengeli medikal kanal yönlendirmesi',
          detail:
            'Bilimsel tarafı anlıyorum; off-label yorum veya kaynak paylaşımı yapamam. Talebi resmi medikal bilgi sürecine yönlendirebilirim.',
          effects: {
            flags: { offLabelClean: true },
            ethicalIntegrity: 12,
            scientificAccuracy: 10,
            relationshipManagement: 8,
            decisionQuality: 8,
          },
          next: 'whatsapp',
        },
        {
          id: 'off_grey',
          label: 'Gri alan — sonra kaynak iletebilirim',
          detail: 'Doğrudan öneri yapmam; bazı yayınlar var, isterseniz sonra birkaç kaynak iletebilirim.',
          effects: {
            flags: { offLabelRisk: true },
            ethicalIntegrity: -12,
            relationshipManagement: 6,
            decisionQuality: -6,
          },
          next: 'whatsapp',
        },
      ],
    },

    whatsapp: {
      title: 'WhatsApp tuzağı',
      type: 'phone',
      choices: [
        {
          id: 'wa_official',
          label: 'Resmi kanala çek',
          detail:
            'Kişisel WhatsApp üzerinden kaynak iletmem uygun değil. Talebi kayıtlı medikal ekibe yönlendireceğim.',
          effects: { ethicalIntegrity: 10, flags: { recoveryStrong: true } },
          next: 'service',
        },
        {
          id: 'wa_send',
          label: 'Yayınları göndereceğimi söyle',
          detail: 'Birkaç kaynak bakıp ileteyim — klinik karar hekimin.',
          effects: { fatal: 'fatalOffLabelShare', ethicalIntegrity: -16, relationshipManagement: 8 },
          next: 'service',
        },
        {
          id: 'wa_verbal',
          label: 'Sözlü konuşalım — yazılı değil',
          detail: 'Yazılı paylaşmam uygun değil; bir sonraki ziyarette sözlü konuşalım.',
          effects: { fatal: 'fatalOffLabelVerbal', ethicalIntegrity: -14 },
          next: 'service',
        },
      ],
    },

    service: {
      title: 'Servis sorumlusu baskısı',
      dialogue: [
        {
          who: 'Levent Bey',
          text: 'Servis çok gerildi. Firma olarak ekibe destek sağlarsanız süreç yumuşar — eğitim, kolaylıklar, moral… Güveni yeniden kurmamız lazım.',
        },
      ],
      choices: [
        {
          id: 'svc_clear',
          label: 'Etik sınır net — şeffaf takip',
          detail:
            'Promosyonel destekle değil, şeffaf takip ve doğru bilgilendirmeyle toparlarız. Karar sürecini etkileyebilecek avantaj sunamam.',
          effects: { ethicalIntegrity: 10, relationshipManagement: 6, professionalRepresentation: 8 },
          next: 'brief',
        },
        {
          id: 'svc_ambiguous',
          label: 'Yönetime taşıyacağım — açık kapı',
          detail: 'Tek başıma söz veremem; uygun başlıkları Murat Bey ile paylaşırım.',
          effects: { flags: { supportAmbiguity: true }, ethicalIntegrity: -6, relationshipManagement: 4 },
          next: 'brief',
        },
        {
          id: 'svc_flexible',
          label: 'Esnek görün — içeride konuşuruz',
          detail: 'Eğitim veya küçük destek organizasyonu için içeride konuşup döneceğim.',
          effects: {
            flags: { supportRisk: true },
            fatal: 'fatalSupportPromise',
            ethicalIntegrity: -14,
            relationshipManagement: 8,
          },
          next: 'brief',
        },
      ],
    },

    murat_sms: {
      title: 'Gün içi — Murat Bey mesajı',
      type: 'sms',
      time: '16:10',
      smsFrom: 'Murat Bey · Bölge Müdürü',
      smsBody:
        'Atlas ziyareti nasıl gidiyor? Hastane stratejik — ama stratejik diye uyum sınırını esnetme. Gün sonu raporunda olay-risk-aksiyon net olsun.',
      narrative: 'Saha uygulamasından kısa mesaj. Ticari baskı ile etik sınır aynı anda.',
      choices: [
        {
          id: 'sms_process',
          label: 'Süreç odaklı kısa yanıt',
          detail:
            'İki bildirim açıldı (FV + kalite). Off-label medikal kanala, destek talebi sınırlandı. Raporu olay sınıflandırmasıyla ileteceğim.',
          effects: { reportingDiscipline: 6, ethicalIntegrity: 6, professionalRepresentation: 6 },
          next: 'report',
        },
        {
          id: 'sms_vague',
          label: 'Belirsiz — «iyi gidiyor»',
          detail: 'Genel olarak kontrol altında, akşam raporlarım.',
          effects: { reportingDiscipline: -4, decisionQuality: -2 },
          next: 'report',
        },
        {
          id: 'sms_pressure',
          label: 'İlişkiyi kurtarmak için esnek davrandığımı yaz',
          detail: 'Hastane gerildi, ilişkiyi korumak için esnek davrandım.',
          effects: { ethicalIntegrity: -8, relationshipManagement: 4 },
          next: 'report',
        },
      ],
    },

    brief: {
      title: 'Servis ekibine kısa açıklama',
      narrative: 'Levent Bey sonrası servis ekibi 60–90 saniyelik bilgilendirme bekliyor. Tonunuz Kriz Sonrası Güven Onarımı puanını belirler.',
      choices: [
        {
          id: 'brief_transparent',
          label: 'Şeffaf süreç çerçevesi',
          detail:
            'İki bildirim: reaksiyon şüphesi (farmakovijilans) ve flakon şüphesi (kalite). Klinik yorum hekimlerin; kesin neden-sonuç yorumu yapmayacağız; resmi yazılı süreç.',
          effects: { crisisRecovery: 12, relationshipManagement: 8, professionalRepresentation: 8 },
          next: 'murat_sms',
        },
        {
          id: 'brief_short',
          label: 'Kısa ama yetersiz',
          detail: 'Olayları ileteceğiz; ürün bilgi dosyasındaki uyarılar dikkate alınmalı.',
          effects: { crisisRecovery: 4, scientificAccuracy: 4 },
          next: 'murat_sms',
        },
        {
          id: 'brief_defensive',
          label: 'Savunmacı ürün dili',
          detail: 'Doğrudan ürün kaynaklı veri yok; gereksiz endişe oluşmaması önemli.',
          effects: { crisisRecovery: -10, relationshipManagement: -8, flags: { earlyDefensive: true } },
          next: 'murat_sms',
        },
      ],
    },

    report: {
      title: 'Gün sonu saha raporu',
      type: 'report',
      fields: [
        {
          id: 'r1',
          q: 'Ciddi reaksiyon şüphesi hangi süreç altında raporlanmalı?',
          options: [
            { id: 'a', label: 'Farmakovijilans bildirimi', correct: true },
            { id: 'b', label: 'Rutin ürün tanıtım notu' },
            { id: 'c', label: 'Satış fırsatı takibi' },
            { id: 'd', label: 'Rakip ürün karşılaştırma notu' },
          ],
        },
        {
          id: 'r2',
          q: 'Partikül/görsel şüphe hangi süreçte izlenmeli?',
          options: [
            { id: 'a', label: 'Kalite bildirimi / ürün şikâyeti', correct: true },
            { id: 'b', label: 'Doktor tercih notu' },
            { id: 'c', label: 'Pazarlama geri bildirimi' },
          ],
        },
        {
          id: 'r3',
          q: 'Off-label bilgi talebi nasıl raporlanmalı?',
          options: [
            { id: 'a', label: 'Resmi medikal bilgi talebi olarak yönlendirilmeli', correct: true },
            { id: 'b', label: 'Temsilci yayın göndermeli' },
            { id: 'c', label: 'Sözlü açıklanmalı — rapor gerekmez' },
          ],
        },
        {
          id: 'r4',
          q: 'Levent Bey’in “moral/kolaylık” talebi nasıl ele alınmalı?',
          options: [
            { id: 'a', label: 'Etik dışı beklenti — net sınır; uyumlu bilgilendirme resmi kanaldan', correct: true },
            { id: 'b', label: 'Bölge müdürüne sorulup destek aranmalı' },
            { id: 'c', label: 'Hastane stratejik — küçük destek planlanmalı' },
          ],
        },
      ],
      next: 'evening_return',
    },

    evening_return: {
      title: 'Gün sonu — Ofise dönüş',
      time: '18:05',
      location: 'INCPHARMA · Saha uygulaması',
      continueLabel: 'Murat Bey ile görüşmeye gir',
      narrative:
        'Gün boyunca yaşananlar sistem notlarına, saha rapor taslağına ve hastane geri bildirimlerine işlendi. Toplantı odasında Murat Bey bekliyor — bu «gün nasıl geçti» sohbeti değil.',
      thought:
        'Kriz dili, etik sınır ve ilişki yönetimi aynı masada sorulacak. Kriz sonrası kısa bilgilendirmen de değerlendirildi: ürünü mü savundun, süreci mi şeffaflaştırdın?',
      next: 'manager',
    },

    manager: {
      title: 'Müdür baskısı — Boss fight',
      time: '18:20',
      location: 'INCPHARMA — Toplantı odası',
      narrative:
        'Murat Bey dosyaya bakar. «Etik kararı nasıl savundun, ilişkiyi nasıl korudun, kriz sonrası açıklaman güveni onardı mı?»',
      choices: [
        {
          id: 'mgr_strong',
          label: 'Dengeli temsil — süreç ve kanal',
          detail:
            'Off-label’da medikal kanala yönlendirdim; destekte avantaj sunmadım; kriz sonrasında ürünü değil iki bildirimi ayrı süreç olarak yönettim.',
          effects: { professionalRepresentation: 10, crisisRecovery: 8, decisionQuality: 8 },
          next: 'finale',
        },
        {
          id: 'mgr_recover',
          label: 'İlişki soğuk kaldı — toparlama planı',
          detail: 'Sadece «yapamam» demek yetmez; sınırı korurken uygun kanalı açmalıydım — bunu yazılı süreçle düzelteceğim.',
          effects: { relationshipManagement: 8, crisisRecovery: 6, flags: { recoveryStrong: true } },
          next: 'finale',
        },
        {
          id: 'mgr_own_fatal',
          label: 'Hatayı tam sahiplenme (fatal varsa)',
          detail:
            'Kişisel kaynak göndermeyeceğim; talep resmi medikal süreçte; serviste karar sürecini etkileyen destek yok.',
          effects: { ethicalIntegrity: 8, flags: { recoveryStrong: true } },
          next: 'finale',
          requiresFatal: true,
        },
        {
          id: 'mgr_defend',
          label: 'Kendini savun — niyet önemli değil',
          detail: 'Zaten öneri yapmadım; sadece yayın paylaşacaktım.',
          effects: { ethicalIntegrity: -10, professionalRepresentation: -8 },
          next: 'finale',
        },
        {
          id: 'mgr_commercial',
          label: 'Hastane stratejik — esneklik gerekli',
          detail: 'İlişkiyi koparmamak için esnek davrandım.',
          effects: { ethicalIntegrity: -12, professionalRepresentation: -10, decisionQuality: -8 },
          next: 'finale',
        },
      ],
    },

    finale: {
      type: 'finale',
    },
  },
};

/** Dinamik sahneler: önceki kararlara göre */
window.INCPHARMA_SIM.resolveScene = function (sceneId, state) {
  if (sceneId === 'doctor') {
    return window.INCPHARMA_SIM.buildDoctorScene(state);
  }
  if (sceneId === 'lot') {
    return window.INCPHARMA_SIM.buildLotScene(state);
  }
  var base = window.INCPHARMA_SIM.scenes[sceneId];
  if (!base) return null;
  if (base.dynamic === 'lot') {
    return window.INCPHARMA_SIM.buildLotScene(state);
  }
  if (sceneId === 'whatsapp') {
    return window.INCPHARMA_SIM.buildWhatsappScene(state, base);
  }
  if (sceneId === 'manager') {
    return window.INCPHARMA_SIM.buildManagerScene(state, base);
  }
  return base;
};

window.INCPHARMA_SIM.buildDoctorScene = function (state) {
  var f = state.flags || {};
  var dialogue = [];
  var narrative = 'Dr. Selim Arda sizi kenara çağırır. Reaksiyon şüphesi ve flakon görsel şüphesi birlikte değerlendiriliyor.';

  if (f.particleRisk || f.fatalParticleUse) {
    narrative =
      'Dr. Selim sertleşmiştir: «Şüpheli flakon için kullanılabileceği izlenimi verildi. Hasta güvenliği açısından bunun anlamının farkında mısınız?»';
    dialogue.push({
      who: 'Dr. Selim Arda',
      text: 'Şimdi bana net söyleyin: Klinik karar alanımıza girmeden, kalite ve güvenlilik açısından ne yapılması gerektiğini açıkça ifade edin.',
    });
  } else if (f.earlyDefensive) {
    narrative = 'Dr. Selim: «Savunmada kaldığınızı hissediyorum. Ürün savunması değil, kayıtlı resmi süreç anlatın.»';
    dialogue.push({ who: 'Dr. Selim Arda', text: 'Farmakovijilans ve kalite süreçlerini nasıl başlattınız?' });
  } else {
    narrative = 'Dr. Selim kontrollü: «Süreci düzgün başlattınız. Resmi süreç nasıl işleyecek?»';
    dialogue.push({
      who: 'Dr. Selim Arda',
      text: 'Klinik kullanım kararı bizde. İnceleme tamamlanmadan neden-sonuç yorumu yapmayın; yazılı dönüş bekliyorum.',
    });
  }

  return {
    title: 'Doktor gerilimi — Serviste ürünü durduralım mı?',
    location: 'Onkoloji servisi',
    narrative: narrative,
    dialogue: dialogue,
    choices: [
      {
        id: 'doc_process',
        label: 'Süreç odaklı net cevap',
        detail:
          'Klinik karar sizin alanınızda. İki bildirim ciddiye alınmalı; lot ve şüpheli flakon ayrıştırılarak kalite ve farmakovijilans değerlendirmesine taşınmalı.',
        effects: { crisisCommunication: 10, escalationDiscipline: 8, scientificAccuracy: 6 },
        next: 'nermin',
      },
      {
        id: 'doc_recover',
        label: 'Savunmacı algıyı düzelt',
        detail:
          'Savunmaya çalıştıysam düzeltirim. Neden-sonuç yorumu yapamam; reaksiyon farmakovijilans, flakon kalite sürecine — yazılı dönüş organize edeceğim.',
        effects: { flags: { recoveryStrong: true }, crisisRecovery: 10, relationshipManagement: 8 },
        next: 'nermin',
      },
      {
        id: 'doc_own_particle',
        label: 'Partikül hatasını sahiplen',
        detail:
          'İlk ifadem yanlış izlenim oluşturdu. Şüpheli flakon normal ürün gibi işlem görmemeli; kalite bildirimi ve ayrıştırma gerekir.',
        effects: { flags: { recoveryStrong: true }, crisisCommunication: 8, crisisRecovery: 8 },
        next: 'nermin',
        showIf: function (s) {
          return s.flags.particleRisk;
        },
      },
      {
        id: 'doc_blame',
        label: 'Sorumluluğu hastaneye at',
        detail: 'Bu kararı zaten siz veriyorsunuz; ben sadece not alacağımı söyledim.',
        effects: { flags: { relationshipDamaged: true }, relationshipManagement: -10 },
        next: 'nermin',
      },
    ],
  };
};

window.INCPHARMA_SIM.buildLotScene = function (state) {
  var f = state.flags || {};
  var narrative =
    'İlaç hazırlama alanında kullanılmış ambalaj, raftaki kutular (aynı lot ORV-24-118A ve bir farklı lot) ve teslim fişi var.';
  var dialogue = [];

  if (f.roleOverreach) {
    narrative +=
      ' Servis sorumlusu Levent Bey yaklaşır — az önce «kullanımı durdurun» ifadesini duymuş.';
    dialogue.push({
      who: 'Levent Bey',
      text: 'Firma temsilcisi olarak servis kullanım kararımıza siz mi müdahale ediyorsunuz? Hangi yetkiyle söylüyorsunuz?',
    });
  } else if (f.earlyDefensive) {
    dialogue.push({
      who: 'Hemşire Ece',
      text: 'Lütfen bu kez net olalım. Biz olayı küçük göstermeye çalışmıyoruz. Hangi bilgileri kayda almalıyız?',
    });
  } else {
    dialogue.push({
      who: 'Hemşire Ece',
      text: 'Tamam, hangi bilgileri kayda almamız gerektiğini birlikte netleştirelim. Kullanılan flakon bu kutudan — aynı lot ürünleri ayıralım mı?',
    });
  }

  var choices = [
    {
      id: 'lot_record',
      label: 'Kayıt ve ayrıştırmayı hastane prosedürüyle birleştirmek',
      detail:
        'Lot, uygulama zamanı, ambalaj ve aynı lot ürünler ayrı kayıt altına; şüpheli ürünler hastane prosedürüyle ayrıştırılmalı. Kalite ve farmakovijilans bildirimi başlatılacak.',
      effects: { escalationDiscipline: 10, relationshipManagement: 6, crisisCommunication: 6, decisionQuality: 6 },
      next: 'particle',
    },
    {
      id: 'lot_stop',
      label: 'Aynı lotu şimdilik kullanmayın (firma önerisi)',
      detail: 'Aynı lot ürünleri şimdilik kullanmayın; lot ve fişi alıp ileteceğim — hastane kararı olarak değil, firma önerisi.',
      effects: {
        relationshipManagement: -4,
        escalationDiscipline: 4,
        decisionQuality: -2,
      },
      next: 'particle',
    },
    {
      id: 'lot_analyze',
      label: 'Önce kanıt eşleştirmesi — yavaş ama analitik',
      detail: 'Uygulama kaydı ve ambalaj eşleşmeden tüm lotu şüpheli saymak doğru olmayabilir; ama servis ne yapacağını da bilmeli.',
      effects: { scientificAccuracy: 6, crisisCommunication: -4, relationshipManagement: -3 },
      next: 'particle',
    },
  ];

  if (f.roleOverreach) {
    choices.unshift({
      id: 'lot_recover_levent',
      label: 'Levent Bey’e rol sınırını netleştir (toparlama)',
      detail:
        'Klinik veya operasyon kararı vermek istemem. Kastım, şüpheli ürünlerin hastane prosedürünüzle ayrıştırılması ve kayıt altına alınmasıydı.',
      effects: {
        flags: { recoveryStrong: true },
        relationshipManagement: 8,
        crisisCommunication: 6,
        professionalRepresentation: 6,
      },
      next: 'particle',
    });
  }

  return {
    title: 'Lot izleme — Hangi parti, hangi flakon?',
    location: 'İlaç hazırlama alanı',
    narrative: narrative,
    dialogue: dialogue,
    choices: choices,
  };
};

window.INCPHARMA_SIM.buildWhatsappScene = function (state, base) {
  var msg =
    state.flags.offLabelRisk
      ? 'Dr. Hakan: «Az önceki off-label konu için yayınları gönderebilir misiniz? Konsey öncesi göz atmak isterim.»'
      : state.flags.offLabelClean
        ? 'Dr. Hakan: «Medikal bilgi talebini nasıl açıyoruz? Asistanıma bilgi vereyim.»'
        : 'Dr. Hakan: «Off-label konusu için resmi kanaldan yanıt bekliyorum.»';
  return Object.assign({}, base, {
    phoneMessage: msg,
    narrative: 'Koridorda telefon titrer. Kişisel kanal baskısı.',
  });
};

window.INCPHARMA_SIM.buildManagerScene = function (state, base) {
  var choices = base.choices.filter(function (c) {
    if (c.requiresFatal && !(state.fatalErrors && state.fatalErrors.length)) return false;
    if (c.id === 'mgr_own_fatal' && !(state.fatalErrors && state.fatalErrors.length)) return false;
    return true;
  });
  var extra = '';
  if (state.fatalErrors && state.fatalErrors.length) {
    extra =
      ' Dosyada ' +
      state.fatalErrors.length +
      ' kritik uyum uyarısı işaretli. Kişisel WhatsApp veya off-label paylaşım kayıtları masada.';
  }
  return Object.assign({}, base, {
    narrative: base.narrative + extra,
    choices: choices,
  });
};
