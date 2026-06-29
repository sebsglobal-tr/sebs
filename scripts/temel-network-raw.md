# **MODÜL 0 --- Etik ve Yasal Çerçeve** 

Bu modül, ağ çalışmalarında "teknikten önce disiplin" ilkesini yerleştirir: **yetkilendirme**, **zarar vermeme**, **veri minimizasyonu** ve **kanıt bütünlüğü**. Bir ağ uzmanı ile kötü niyetli bir aktörü ayıran temel fark; kullandığı araçlar değil, **izin (yetki), amaç ve yöntem** üçlüsüne sadakatidir. Bu modülü tamamlamadan teknik modüllere geçiş, "ehliyetsiz trafiğe çıkmaya" benzer: niyet iyi olsa bile sonuç risklidir. Burada hedef; hangi durumda neyin **yasak/riskli/gereksiz** olduğunu ayırt eden bir refleks kazanmak ve yapılan her doğrulamanın **denetlenebilir** olmasını sağlamaktır.

## **Hedefler**

Bu modülün sonunda katılımcı:

-   **Yazılı izin** ve **RoE (Rules of Engagement)** olmadan hiçbir doğrulama/analiz faaliyetine başlanmayacağını açıklar.

-   **Kapsam / kapsam dışı** ayrımıyla sınır ihlalinin teknik, etik ve hukuki risklerini değerlendirir.

-   "**Do not harm**" yaklaşımıyla **hız/yoğunluk limitleri** ve **kill-switch** refleksini planlayabilir.

-   **Veri minimizasyonu**, **log saklama disiplini** ve **kanıt bütünlüğü** (hash, saklama, erişim kaydı, chain of custody) mantığını uygular.

-   Bir bulguyu **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** standardında; yönetici özeti ve teknik ek ayrımıyla raporlayabilir.

-   (İsimlerini bilmek açısından) **Wireshark/tcpdump** gibi trafik araçlarının ve **nmap** gibi keşif araçlarının **neden sıkı yetki ve limitlerle** kullanılması gerektiğini kavrar; "nasıl kullanılır?" kısmına girmeden sınırları doğru çizer.

## **0.1 Yetkili çalışma ilkeleri**

Ağ yönetimi, analizi veya güvenliği çalışmaları; teknik beceri kadar **yasal ve etik sınırları** ciddiye almayı gerektirir. Bir ağ üzerinde izleme/analiz/test yapmanın ilk kuralı nettir: **açık ve tartışmasız yetki**.

### **Written authorization (Yazılı izin)**

**Yazılı izin**, çalışmayı başlatan "yetki belgesi"dir. Sözlü izin ("bana bir bakıver") profesyonel dünyada çoğu zaman **yetersiz ve kanıtlanamaz** kabul edilir.

**Yazılı izinde asgari bulunması gerekenler:**

-   Yetki veren kişi/rol (ör. sistem sahibi, sorumlu yönetici)

-   Amaç (ör. "bağlantı sorununu doğrulama", "envanter doğrulama")

-   Kapsam (ağlar/sistemler/segmentler; IP gerekiyorsa yalnızca dokümantasyon blokları: **192.0.2.0/24**, **198.51.100.0/24**, **203.0.113.0/24**, **2001:db8::/32**)

-   Zaman penceresi (başlangıç--bitiş)

-   İzin verilen/verilmeyen faaliyet sınıfları (ör. "yalnızca gözlem", "yalnızca log okuma")

-   Veri işleme şartları (log/pcap alınacak mı, nerede saklanacak, kim erişecek)

**Örnek:** "Sistem yavaş, bir kontrol et" talebi; kapsamı ve veri işleme sınırlarını belirtmiyorsa, yanlış hedefe dokunma ve yetkisiz veri görme riski doğurur.

**Dikkat:** "Kurumdayım/stajyerim/öğrenciyim" yetki değildir. Yetki; varlığın sahibi veya yetkilendirilmiş rol tarafından **yazılı** şekilde verilir.

### **Rules of Engagement (RoE)**

RoE, çalışmanın "nasıl" yapılacağını belirleyen anayasadır. Yazılı izin "başlama izni" ise RoE; sınırları, temposu ve durma koşullarıyla **zarar vermeme** ilkesini işletir.

**Giriş seviyesi RoE iskeleti:**

-   **Kapsam**: hangi ağlar/sistemler dahil

-   **Kapsam dışı**: dokunulmayacak varlıklar (üçüncü parti, kritik üretim bileşenleri vb.)

-   **Zaman**: mesai/bakım penceresi

-   **Yoğunluk limitleri**: hız/tekrar/ölçüm sınırları

-   **Dur koşulları (stop conditions)**: yavaşlama, hata oranı artışı, beklenmeyen etki

-   **İletişim & escalation**: kime, nasıl haber verilir; acil durumda kim yetkili

-   **Kanıt/rapor standardı**: hangi kanıt türleri kabul, format

**İpucu:** RoE çoğu zaman tek sayfaya sığar. Uzun olmak zorunda değil; **belirsiz olmamak** zorunda.

### **Kapsam / kapsam dışı varlıklar (Scope)**

**Kapsam**, izinli sınırdır. **Kapsam dışı**, dokunulmaması gereken sınırdır. İkisi de yazılı olmalıdır; "kapsam dışı yoktur" varsayımı yapılmaz.

**Kapsam örnekleri (temsili):**

-   "192.0.2.0/24 içindeki kullanıcı ağı"

-   "198.51.100.10 (log sunucusu)"

**Kapsam dışı örnekleri (temsili):**

-   Üçüncü parti servisler

-   Kritik üretim veritabanı segmentleri

-   Paylaşımlı altyapılar

**Sık hata:** "Bir tık bakayım" refleksiyle yan taraftaki sistemlere dokunmak. Bu, iyi niyetli bile olsa sınır ihlalidir.

### **İzinli eğitim hedefleri, platform şartları ve hız limitleri**

Eğitim platformları veya lab ortamları "izinli hedef" sunsa bile **kendi kuralları** vardır: kullanım şartları, hız limitleri, yasaklı davranışlar, paylaşım kuralları vb.

-   "İzinli hedef" demek "istediğini yap" demek değildir.

-   Araçlar (ör. Wireshark/tcpdump ile yakalama, nmap ile keşif) **mutlaka** kapsam ve limitlere bağlıdır; bu modülde amaç "komut öğretmek" değil, **neden sıkı çerçeve gerektiğini** yerleştirmektir.

**Dikkat:** İnternet üzerindeki rastgele sistemler "test etmek için hedef" değildir. Bu eğitimde varsayım: yalnızca **kendi ortamın / açıkça izinli ortam**.

## **0.2 Risk yönetimi**

Risk yönetimi, "teknik olarak mümkün olanı" değil, **güvenli ve kontrollü olanı** seçmektir. Ağ ortamında risk; performans, süreklilik, gizlilik, uyumluluk ve itibar boyutlarıyla gelir.

### **Hız/yoğunluk limitleri**

Yoğunluk; tekrar sayısı, zaman aralığı, veri miktarı ve eşzamanlılık gibi faktörlerle oluşan toplam yüktür.

-   **Prensip:** Önce düşük yoğunlukla başla, gözle, sonra karar ver.

-   "Pilot doğrulama" yaklaşımı: kısa süre, düşük yük, net amaç.

**Risk örneği:** Masum görünen bir kontrol; yoğun yapılırsa cihazları yorabilir, log/depoma maliyetini büyütebilir, hatta hizmeti etkileyebilir.

**İpucu:** Çalışma öncesi "normal durum" göstergelerini not al (örn. servis yanıtı, hata oranı). Bu küçük not, ileride "bu değişiklik çalışmamdan mı kaynaklı?" sorusuna yanıt verir.

### **"Do not harm" prensibi (hizmet kesintisi önleme)**

"Önce zarar verme" yaklaşımı ağ çalışmaları için esastır.

-   Üretim sistemlerinde belirsiz etkili denemeler yapılmaz.

-   Gereksiz veri toplanmaz.

-   Yetkin olunmayan alanda "deneyeyim" yaklaşımı tercih edilmez.

-   Mümkünse önce test ortamında doğrulanır, sonra üretime uygulanır (staging/dev → production farkındalığı).

**Dikkat:** Zarar vermeme yalnızca teknik kesinti değildir; **veri gizliliği** ve **uyumluluk** zararı da aynı derecede kritiktir.

### **Kill-switch / acil durdurma mantığı (operasyonel güvenlik)**

Kill-switch, "işler kötüleşirse" **anında durma ve kontrollü geri çekilme** planıdır.

**Giriş seviyesi kill-switch planı:**

-   Stop conditions listesi (yavaşlama, hata artışı, beklenmeyen etki)

-   Yetkili iletişim (kime haber verilecek?)

-   Geri dönüş (yakalamayı durdurma, erişimi kısıtlama, veriyi güvenli saklama)

-   Kayıt (durma anı ve gerekçesi rapora girecek)

**Operasyonel küçük ama kritik detay:** Bir işlem/araç çalışırken beklenmeyen etki görüyorsan, ilk refleks "daha fazla denemek" değil, **durdurmak ve bildirmektir**. (Komut/tuş düzeyi ayrıntılar, araçların kendi dokümantasyonunda ele alınır; burada ilke önemlidir.)

## **0.3 Veri koruma ve kanıt bütünlüğü**

Ağ trafiği ve loglar; kişisel veri, kimlik bilgisi, ticari sır gibi hassas içerikler taşıyabilir. Bu nedenle iki denge aynı anda korunur:

1.  **Veri gizliliği + veri minimizasyonu**

2.  **Kanıt bütünlüğü** (denetlenebilirlik)

### **Veri gizliliği ve veri minimizasyonu**

**Veri minimizasyonu**, amaca ulaşmak için gereken **en az veriyi** toplamaktır.

-   Bazı sorunlarda tüm içerik (payload) gerekmez; çoğu durumda başlık bilgileri, zaman damgaları ve özet metrikler yeterlidir.

-   İçerik toplamak zorunluysa; saklama, erişim ve maskeleme kuralları **önceden** tanımlanır.

**Pratik soru:** "Bu veri, hangi hipotezi doğrulamak için şart?"\
Cevap veremiyorsan veri büyük olasılıkla gereksizdir.

### **Log saklama disiplini**

Log saklamak; "dosyayı bir klasöre atmak" değildir.

Asgari disiplin:

-   Nerede saklanıyor? (güvenli konum)

-   Kim erişebilir? (yetki)

-   Ne kadar süre saklanacak? (retention)

-   Paylaşım varsa maskeleme/redaksiyon nasıl?

**Dikkat:** Kanıt "fazla veri" ile değil, "doğru bağlam + doğru kayıt" ile güçlenir. Gereksiz kişisel veri raporu zayıflatır ve risk doğurur.

### **Kanıt bütünlüğü: hash, saklama, erişim kayıtları, zincir (chain of custody)**

Kanıt bütünlüğü; "bu dosya ilk aldığım dosyanın aynısı" diyebilme yeteneğidir.

-   **Hash**: dosyanın parmak izi (örn. SHA-256)

-   **Saklama**: güvenli yerde korunması

-   **Erişim kayıtları**: kim, ne zaman erişti?

-   **Chain of custody**: kanıtın kimden kime geçtiği ve hangi işlemlerden geçtiği

**Basit chain of custody şablonu:**

-   Kanıt ID: E-001

-   Kaynak: "Router log export" (temsili)

-   Alınma zamanı: (tarih-saat)

-   Alan kişi/rol: (ör. "Analist")

-   Hash: SHA-256: ...

-   Saklandığı yer: (güvenli yol)

-   Transfer: (kim aldı, ne zaman)

## **0.4 Raporlama standartları (Bulgu → Etki → Öneri → Kanıt)**

Teknik bilgi, doğru aktarılmadığında değersizleşir. Profesyonel rapor; yalnızca "ne oldu"yu değil, "ne anlama geliyor"u da anlatır.

### **Standart format**

-   **Bulgu:** Gözlenen gerçek (yorum değil)

-   **Etki:** İş/operasyon/güvenlik etkisi

-   **Öneri:** Yapılabilir düzeltme/azaltım

-   **Kanıt:** Log satırı, ekran görüntüsü, hash, zaman damgası, bağlam notu

### **Yönetici özeti vs teknik ek**

-   **Yönetici özeti:** teknik olmayan karar vericiler için; risk/etki/öneri netliği

-   **Teknik ek:** komut çıktıları, log satırları, zaman çizelgesi, kanıt ID'leri; tekrar edilebilirlik

### **Etik uyarı okuryazarlığı**

Araçlar veya savunma sistemleri bazen "şüpheli/illegal" benzeri uyarılar üretebilir.

-   Yetkili test bağlamında bu tür uyarılar, savunma mekanizmalarının çalıştığını gösterebilir: "hata" değil, **gözlem** olabilir.

-   İzinli hedef dışında böyle bir uyarı alıyorsan; bu, kapsam dışına taşmış olabileceğinin güçlü sinyalidir: **derhal dur** ve bildir.

## **Örnek: Senaryo tabanlı düşünme --- etik ikilem**

**Senaryo:** Yetkili bir çalışmada (yazılı izin var), "ağ yavaşlığı" şikâyetini incelerken trafikte hassas içerik barındırabilecek bir akış fark ediyorsun (ör. şifresiz e-posta trafiği ve içinde şirketle ilgili kritik bilgiler olabileceğine dair göstergeler).

**Nasıl düşünmelisin?**

-   **Kapsam:** Görevin "yavaşlığı" incelemek. İçerikleri okumak çoğu durumda kapsam değildir.

-   **Veri minimizasyonu:** İçeriği kaydetmek yerine; yalnızca yoğunluk, kaynak/hedef, zaman ve protokol gibi problemle ilişkili minimum veriyi not etmek daha güvenlidir.

-   **Raporlama:** Kişi isimlerine veya kesin ithamlara girmeden, teknik sınırda kal: "Şu kaynaktan yüksek hacimli ve hassas içerik riski taşıyan şifresiz trafik gözlendi" gibi.

-   **Escalation:** RoE'de tanımlı kanaldan yetkili birime ilet (güvenlik/uyumluluk/BT). Bu, hem etik hem hukuki güvence sağlar.

## **Terimler Sözlüğü**

  **Terim**                   **Türkçe karşılığı / açıklama**
  --------------------------- -----------------------------------------------------------------
  Authorization               Yetkilendirme/izin; işlem yapma hakkı
  Written authorization       Yazılı izin; denetlenebilir onay kaydı
  RoE (Rules of Engagement)   Angajman kuralları; sınırlar, zaman, yöntem, dur koşulları
  Scope / In-scope            Kapsam; izin verilen alan/varlıklar
  Out-of-scope                Kapsam dışı; dokunulmaması gereken varlıklar
  Do not harm                 Zarar vermeme; kesinti/gizlilik/uyumluluk riskini önleme
  Rate limit                  Hız/yoğunluk sınırı; platform veya RoE ile belirlenir
  Kill-switch                 Acil durdurma; ters etki görüldüğünde dur + bildir + geri çekil
  Data minimization           Veri minimizasyonu; amaç için gereken minimum veri
  Evidence integrity          Kanıt bütünlüğü; verinin değişmediğini ispatlayabilme
  Hash (SHA-256)              Dosya parmak izi; değişiklikleri tespit eder
  Chain of custody            Kanıt zinciri; kanıtın kimde/nerede/ne zaman olduğunun kaydı
  Payload                     Paket yükü; paketin asıl içeriği (başlık hariç)
  Executive summary           Yönetici özeti; karar vericiler için sade risk özeti
  Technical appendix          Teknik ek; kanıt, detay, tekrar edilebilirlik bölümü
  Mitigation                  Hafifletme/çözüm; riski azaltan aksiyon
  Staging/Dev vs Production   Test ortamı vs üretim ortamı; önce güvenli doğrulama yaklaşımı

## **Kendini Değerlendir (10 Soru)**

### **1) Bir ekip arkadaşın sözlü olarak "şu sistemi kontrol et" diyor. En doğru ilk adım hangisi?**

A\) Hemen kontrol edip sonucu mesajla iletmek\
B) "Zarar vermem" diyerek yazılı izinsiz başlamak\
C) Yazılı izin + kapsam + zaman penceresi netleşmeden başlamamak\
D) Kapsamı kendin belirleyip başlamak\
E) Önce veri toplayıp sonra izin istemek

**Doğru şık:** C\
**Gerekçe:** Yetki ve kapsam yazılı değilse denetlenebilirlik yoktur. E, veri ihlali riskini büyütür; B/D ise sınır ihlaline açıktır.

### **2) RoE belgesinde aşağıdakilerden hangisi olmazsa olmazdır?**

A\) Kullanılacak cihaz markası\
B) Kapsam dışı varlıklar ve dur koşulları (stop conditions)\
C) Raporun kaç sayfa olacağı\
D) Ekip üyelerinin kişisel geçmişi\
E) Sadece "iyi niyet" beyanı

**Doğru şık:** B\
**Gerekçe:** RoE'nin özü sınırlar ve güvenliktir. Kapsam dışı + dur koşulları, "do not harm"ı işletir.

### **3) Veri minimizasyonu ilkesine en uygun davranış hangisi?**

A\) "Belki lazım olur" diye tüm trafiği uzun süre kaydetmek\
B) Amaç için gereken en kısa aralıkta, en az veriyle doğrulama yapmak\
C) Toplanan veriyi herkesin erişebileceği yerde saklamak\
D) Kanıtı maskelemeden rapora eklemek\
E) Hash almadan paylaşmak

**Doğru şık:** B\
**Gerekçe:** Minimization; amaç--veri bağını kurar. Diğerleri gizlilik ve bütünlük riskidir.

### **4) Kill-switch refleksi hangi durumda devreye girer?**

A\) Sonuç almak gecikince yoğunluğu artırmak için\
B) Beklenmeyen performans etkisi/hata artışı görüldüğünde derhal durup bildirmek için\
C) Raporu hızlı yazmak için\
D) Kapsamı genişletmek için\
E) Kanıtı paylaşmak için

**Doğru şık:** B\
**Gerekçe:** Kill-switch, risk belirtisi gördüğünde "kontrollü durma" mekanizmasıdır.

### **5) "Bulgu" en doğru nasıl yazılır?**

A\) "Kesin kötü niyetli saldırı var."\
B) "Muhtemelen X kişi yaptı."\
C) "Şu zamanda şu kayıtta şu olay gözlendi."\
D) "Bence sistem kötü yönetiliyor."\
E) "Bu böyle devam ederse felaket olur."

**Doğru şık:** C\
**Gerekçe:** Bulgu gözlemdir; yorum değildir. A/B/D/E kanıtsız yorum içerir.

### **6) Chain of custody neden kritiktir?**

A\) Dosya boyutunu küçültmek için\
B) Kanıtın güvenilirliğini ve denetlenebilirliğini korumak için\
C) Veri minimizasyonu yapmak için\
D) Rapor sayısını artırmak için\
E) Yetkisiz erişimi kolaylaştırmak için

**Doğru şık:** B\
**Gerekçe:** Kanıtın kimde, ne zaman, hangi koşulda olduğu bilinmezse "değişmiş olabilir" şüphesi doğar.

### **7) Bir eğitim platformunda hız limitleri yazıyorsa en doğru yaklaşım hangisi?**

A\) "Eğitim" olduğu için limitler önemli değil\
B) Limitler bağlayıcıdır; okumak ve uymak zorunludur\
C) Limitler sadece yeni başlayanlar içindir\
D) Limitler rapora hiç yansımaz\
E) Limitler aşılırsa daha hızlı öğrenilir

**Doğru şık:** B\
**Gerekçe:** Platform kuralları etik/yasal sınırın parçasıdır; ihlal etmek risk ve yaptırım doğurur.

### **8) "Üretim ortamında belirsiz etkili test yapmama" ilkesi en iyi hangisiyle açıklanır?**

A\) Üretimde her şey serbesttir, çünkü gerçek veridir\
B) Önce test/staging ortamında doğrula, sonra üretimde kontrollü uygula\
C) Üretimde sadece daha hızlı denemeler yapılır\
D) Üretimde veri minimizasyonu gerekmez\
E) Üretimde RoE'ye gerek yoktur

**Doğru şık:** B\
**Gerekçe:** Zarar vermeme ve süreklilik, üretimde daha sıkı disiplin gerektirir.

### **9) Yetkili bir incelemede beklenmedik hassas içerik riski taşıyan trafik görürsen en doğru yaklaşım hangisi?**

A\) İçeriği ayrıntılı inceleyip rapora eklemek\
B) Kişi/niyet atfı yaparak kesin hüküm vermek\
C) Kapsamı aşmadan minimum veriyi not edip RoE'deki kanaldan yetkili birime iletmek\
D) Kanıtı maskelemeden paylaşmak\
E) Kimseye söylememek

**Doğru şık:** C\
**Gerekçe:** Kapsam, minimizasyon ve escalation birlikte çalışır. A/B/D etik ve gizlilik riskini büyütür; E sorumluluk ihlalidir.

### **10) Araç/sistem "şüpheli işlem" benzeri bir uyarı verdiğinde en doğru yorum hangisidir?**

A\) Uyarı her zaman görmezden gelinir\
B) Yetkili bağlamda uyarı bir gözlem olabilir; izinli hedef dışında ise derhal durmayı gerektirebilir\
C) Uyarı, mutlaka saldırı yapman gerektiği anlamına gelir\
D) Uyarı, rapora asla yazılmaz\
E) Uyarı sadece tasarım hatasıdır

**Doğru şık:** B\
**Gerekçe:** Bağlam kritiktir. Yetkili/izinli çerçevede uyarı savunmanın çalıştığına işaret edebilir; izinli hedef dışındaysa kapsam ihlali sinyalidir.

## **Bu modülde neler kazandık?**

-   Yetkisiz iş yok: **yazılı izin + net kapsam** olmadan başlanmaz.

-   RoE, güvenli çalışmanın omurgasıdır: **kapsam dışı + dur koşulları** özellikle kritiktir.

-   "Do not harm" ve **kill-switch** refleksi, profesyonel çalışma standardıdır.

-   **Veri minimizasyonu** ve **log saklama disiplini**, gizlilik/uyumluluk riskini azaltır.

-   **Hash + chain of custody** ile kanıt denetlenebilir hale gelir.

-   **Bulgu → Etki → Öneri → Kanıt (rapor formatı)**, teknik gözlemi karar verdiren çıktıya dönüştürür.

## **MODÜL 1 -- Network Mantığı: Neden Ağ, Nerede Kullanılır**

Bu modül, "network" kavramını ezber bir tanımdan çıkarıp **ihtiyaç ve bağlam** üzerinden kurar: Neden cihazları birbirine bağlarız, hangi değeri üretiriz, hangi problemleri çözeriz? Giriş seviyesinde kritik refleks şudur: Bir sorun yaşadığında önce "**Neye erişmeye çalışıyorum?** (yerel bir kaynak mı, internet üzerindeki bir servis mi, kurum içi bir sistem mi?)" sorusunu netleştirmek. Böylece troubleshooting, rastgele deneme değil; **doğru hedefi doğru bağlamda** doğrulama olur. Ayrıca bu modül, ağların **ölçeğe** (PAN/LAN/MAN/WAN) ve **erişim politikasına** (internet/intranet/extranet) göre sınıflandırılmasını gerçek hayat örnekleriyle oturtur; sonraki modüllerde göreceğimiz topoloji, IP/DNS ve performans konularına sağlam bir zemin hazırlar.

## **Modül Amaçları**

Bu modülün sonunda katılımcı:

-   Network'ü **veri paylaşımı + iletişim + kaynak erişimi** üçlüsüyle açıklar ve neden ihtiyaç olduğunu örneklerle gerekçelendirir.

-   "Standalone (tek başına çalışan)" yaklaşım ile "connected (ağa bağlı)" yaklaşımın farkını, **verimlilik ve risk** açısından kıyaslar.

-   PAN/LAN/MAN/WAN türlerini **ölçek + sahiplik + gecikme (latency)** gibi ipuçlarıyla ayırt eder.

-   Internet / intranet / extranet ayrımını "**kim erişebilir?**" sorusu üzerinden analiz eder.

-   Ağ terminolojisine giriş yapar: **node, host, link, client, server, latency** gibi terimleri doğru bağlamda kullanır.

-   Sorun anında "yerel mi, dış dünya mı?" ayrımını yapabilecek bir **ilk teşhis çerçevesi** kurar (yetkili ve zarar vermeyen yaklaşım içinde).

### **1.1 Network nedir, neden ihtiyaç var?**

#### **Ne anlama gelir?**

**Network (bilgisayar ağı)**, iki veya daha fazla cihazın (bilgisayar, telefon, yazıcı, sunucu vb.) **kablolu veya kablosuz** biçimde bağlanarak veri paylaşması ve kaynakları ortak kullanmasıdır. Teknik tanım doğru; ama "mantık" tarafında şu cümle çok iş görür:

**Network, dijital trafiğin aktığı yoldur.**\
Veri bir yerden bir yere giderken "yol", "kurallar" ve "bağlantı noktaları" gerekir. Ağ, bu düzenin tamamıdır.

Ağın ortaya çıkışındaki temel ihtiyaçlar üç başlıkta toplanır:

1.  **Veri paylaşımı**\
    Dosyalar, veritabanları, uygulama çıktıları, sensör verileri, loglar... Birden fazla kişi/cihaz aynı veriye erişmek istediğinde ağ neredeyse kaçınılmaz olur.

2.  **Kaynak erişimi (donanım/servis paylaşımı)**\
    Pahalı bir kaynağı herkes için ayrı ayrı üretmek yerine paylaşmak: yazıcı, dosya sunucusu, uygulama sunucusu, hatta internet çıkışı.

3.  **İletişim**\
    E-posta, anlık mesajlaşma, görüntülü görüşme, VoIP... Modern çalışma ve öğrenme düzeni ağ olmadan sürdürülemez.

**İpucu:** Ağ ihtiyacı çoğu zaman "tek cihaz yetmiyor" anında doğar:

-   Bilgi başka yerde duruyordur (paylaşım),

-   Servis uzaktadır (erişim),

-   Birden çok kişi aynı işi yapıyordur (koordinasyon).

#### **Gerçek hayatta belirtisi/örneği nedir?**

Bir ağın değerini, "ağ olmasaydı" durumuyla kıyaslayınca daha net görürsün.

**Örnek: Ev / Okul / Kurum karşılaştırması**

  **Senaryo**   **Ağ olmasaydı (Standalone)**                                        **Ağ ortamında (Connected)**
  ------------- -------------------------------------------------------------------- ----------------------------------------------------------------------------------------
  Ev            İnternet hattı tek bir cihaza gider, diğer cihazlar ayrı kalırdı.    Wi-Fi sayesinde telefon, tablet, TV gibi cihazlar aynı bağlantıyı paylaşır.
  Okul          Öğretmen dosyayı tek tek USB ile dağıtırdı.                          "Ortak klasör" veya bir portal ile tüm sınıf aynı anda erişir.
  Kurum         Veri her çalışanın kendi diskinde dağınık olur, kayıp riski artar.   Veriler merkezi sunucuda durur; erişim kontrolü ve yedekleme yönetilebilir hale gelir.

Burada tarihi bir anekdot da vardır: Eskiden veri, disket/USB ile "elde taşınarak" aktarılırdı. Bu yönteme esprili biçimde **"Sneakernet"** denir. Ağ teknolojileri, bu verimsizliği azaltmak için büyüdü.

**Dikkat:** "İnternet var" demek her zaman "ihtiyacım olan şeye erişiyorum" demek değildir.\
İnternet, dev bir WAN'dır; ama senin ihtiyacın bazen **aynı yerel ağdaki** bir yazıcıya erişmektir. Bağlamı karıştırmak, troubleshooting'i yanlış yola sokar.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

Bu modülde komut öğretmeyi hedeflemiyoruz; ama doğru teşhis için **doğru soruları** öğretmek zorundayız. Çünkü iyi teşhis, "çok şey denemek" değil; **doğru şeyi hedeflemek** demektir.

1.  **Erişmeye çalıştığım şey ne?**

-   "Web sitesi açılmıyor" → internet/servis erişimi olabilir

-   "Yazıcı görünmüyor" → çoğunlukla yerel ağ/kaynak erişimi

-   "Kurum içi portal açılmıyor ama genel siteler açılıyor" → intranet/extranet erişimi olabilir

2.  **Bu kaynak nerede?**

-   Aynı ev/okul/ofis içinde mi?

-   İnternet üzerinde mi?

-   Kurum içi bir sistem mi?

3.  **Sorun herkeste mi, sadece bende mi?**

-   Herkeste → servis veya genel erişim tarafı olasılığı artar

-   Sadece bende → cihaz/bağlantı bağlamı olasılığı artar

**İpucu:** Sorunu anlatırken cümleyi şu şablonla kur:\
"**Şuna erişemiyorum:** (internet sitesi / kurum portalı / yazıcı / paylaşılan klasör)."\
Bu, doğru sınıflandırmayı baştan yaptırdığı için teşhisi ciddi hızlandırır.

### **1.2 Network türleri**

Ağlar iki temel bakışla sınıflandırılır:

1.  **Coğrafi ölçek/kapsam:** PAN, LAN, MAN, WAN

2.  **Erişim politikası:** internet, intranet, extranet (kim erişebilir?)

Bu sınıflandırma, troubleshooting'de "Sorun **yerel mi**, yoksa **dış dünyada mı**?" sorusuna hızlı cevap üretir.

#### **1.2.1 PAN / LAN / MAN / WAN**

##### **Ne anlama gelir?**

-   **PAN (Personal Area Network):** Kişisel alan ağı; kısa mesafe (yakın çevre) ve kişisel cihazlar.

-   **LAN (Local Area Network):** Ev/ofis/lab gibi sınırlı bir alandaki yerel ağ.

-   **MAN (Metropolitan Area Network):** Şehir/metropol ölçeğinde bağlantı; kampüsler veya şehir içi özel omurga örnekleri.

-   **WAN (Wide Area Network):** Şehirler/ülkeler/kıtalar arası; uzak lokasyonları bağlayan ağ.

Bu ölçek büyüdükçe, genellikle **gecikme (latency)** artar ve altyapının sahipliği/işletimi daha karmaşık hale gelir. LAN'da donanım çoğunlukla senin/kurumunun kontrolündedir; WAN tarafında ise çoğu zaman operatör altyapısı devrededir.

##### **Gerçek hayatta belirtisi/örneği nedir?**

-   Telefonun Bluetooth kulaklıkla eşleşmesi → **PAN** (eşleşme/pairing mantığı sık görülür)

-   Evdeki Wi-Fi ağı veya ofis içi ağ → **LAN** (yüksek hız, düşük gecikme beklersin)

-   Bir üniversitenin şehir içindeki kampüslerini özel hatla bağlaması → **MAN** örneği olabilir

-   İstanbul ve Ankara ofislerini birbirine bağlayan hat / internetin kendisi → **WAN** (daha yüksek gecikme olasılığı)

##### **Nasıl doğrularım/çürütürüm? (güvenli)**

Aşağıdaki kontrol soruları, ağın ölçeğini hızlıca ele verir:

-   Cihazlar **aynı oda/bina** içinde mi? → LAN olasılığı yüksek

-   Cihazlar **farklı şehir/ülke** mi? → WAN olasılığı yüksek

-   Bağlantı **kişisel cihazlar arasında, çok yakın mesafede** mi? → PAN olasılığı yüksek

**İpucu:** PAN/LAN/MAN/WAN birer "etiket" değil, birer **sınır çizme aracı**dır.\
Sorunun hangi sınıfa ait olduğunu anlamak, "nerede arayacağım?" sorusunu daraltır.

#### **1.2.2 Internet vs Intranet vs Extranet**

##### **Ne anlama gelir?**

Bu kavramlar fiziksel büyüklükten çok, "**kim erişebilir?**" sorusunu cevaplar:

-   **Internet:** Herkese açık (public) ağlar ağı.

-   **Intranet:** Sadece kurum içi yetkili kullanıcıların eriştiği özel ağ/servisler.

-   **Extranet:** Kurumun bazı servislerini **seçilmiş dış paydaşlara** (iş ortağı, tedarikçi, bayi vb.) kontrollü açması.

Önemli bir ayrım: Ev ağın küçük ölçekli bir "özel ağ" gibi düşünülebilir; fakat "intranet" kelimesi genellikle **kurumsal iç servis** bağlamında kullanılır. Yine de ana mantık değişmez: erişim, kime açık?

##### **Gerçek hayatta belirtisi/örneği nedir?**

-   Genel web siteleri açılıyor ama kurum içi portal açılmıyor → internet var; intranet erişimi sorunlu olabilir.

-   Bir tedarikçinin yalnızca sipariş ekranına girebilmesi, her şeye erişememesi → extranet mantığıdır.

**Analoji (akılda kalıcı):**

-   **Intranet:** Evin salonu (sadece aile)

-   **Extranet:** Evin bahçesi (davet ettiğin kişi/kurye gibi seçilmiş erişim)

-   **Internet:** Evin önündeki cadde (herkes)

##### **Nasıl doğrularım/çürütürüm? (güvenli)**

1.  **Genel internet servisleri çalışıyor mu?**

-   Evet → "internet tamamen yok" hipotezi zayıflar.

2.  **Sadece kuruma özel servisler mi çalışmıyor?**

-   Evet → intranet/extranet erişimi veya kurum tarafı bileşenler gündeme gelir.

3.  **Sorun herkeste mi, sadece bende mi?**

-   Herkeste → servis/genel erişim olasılığı

-   Sadece bende → cihaz/yerel bağlantı olasılığı

**Dikkat:** "Bir site açılmıyor" ifadesi tek başına zayıftır.\
O servis internet mi intranet mi, bunu bilmeden doğru teşhis yolu seçemezsin.

### **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Belirti:** Ofiste internete girebiliyorsun; ama aynı ofisteki yazıcıdan çıktı alamıyorsun.\
**Olasılık:** İnternet çıkışı çalıştığına göre "dış dünya/WAN tamamen çöktü" hipotezi zayıf. Yazıcı, çoğunlukla **LAN içindeki bir kaynak** olduğu için sorun büyük olasılıkla yerel ağ/kaynak erişimi bağlamındadır.\
**Doğrulama (güvenli):**

-   Hedefi netleştir: "Erişemediğim şey internet değil, yazıcı."

-   Sorunun kapsamını daralt: "Herkes mi yazıcıya erişemiyor, sadece ben mi?"

-   Yerel mi dış mı ayrımı: İnternet çalışıyor diye yerel kaynağın otomatik çalışacağı varsayımını bırak.\
    **Sonuç:** Bu senaryoda kazanım, "internet var = her şey var" yanılgısını kırıp, sorunu doğru sınıfa (LAN/kaynak erişimi) yerleştirmektir.

## **4) Terimler Sözlüğü (Glossary)**

  **Terim**    **Türkçe karşılığı / açıklama**
  ------------ ------------------------------------------------------------------------------
  Network      Ağ; cihazların veri/kaynak/iletişim için bağlandığı yapı
  Standalone   Tek başına çalışan; ağa bağlı olmadan kullanım
  Connected    Ağa bağlı; paylaşımlı kaynaklara/servislere erişebilen kullanım
  Sneakernet   Veriyi fiziksel taşıma (USB/disket ile "elde transfer") yaklaşımı
  Node         Düğüm; ağa bağlı herhangi bir öğe (uç cihaz veya ağ cihazı dahil)
  Host         Uç birim; genellikle IP alıp veri üreten/tüketen cihaz (istemci/sunucu gibi)
  Link         Bağlantı; iki düğüm arasındaki iletişim hattı/bağ
  Client       İstemci; bir servisten hizmet talep eden cihaz/yazılım
  Server       Sunucu; ağ üzerinden hizmet sunan cihaz/yazılım
  PAN          Kişisel alan ağı; kısa mesafeli kişisel cihazlar arası bağlantı
  LAN          Yerel alan ağı; ev/ofis/lab gibi sınırlı alandaki ağ
  MAN          Metropol alan ağı; şehir/kampüs ölçeğinde bağlantı
  WAN          Geniş alan ağı; uzak lokasyonları bağlayan ağ (internet gibi)
  Internet     Herkese açık ağlar ağı
  Intranet     Kurum içi, yetkililere açık özel ağ/servisler
  Extranet     Seçilmiş dış paydaşlara kontrollü açılan kurum servisleri
  Latency      Gecikme; verinin bir noktadan diğerine gitme süresi

## **Kendini Değerlendir (10 soru)**

### **Soru 1**

Bir kullanıcı "Ofiste internete girebiliyorum ama yazıcıdan çıktı alamıyorum" diyor. En doğru ilk çerçeveleme hangisidir?\
A) Sorun kesinlikle internet servis sağlayıcısındadır\
B) Sorun muhtemelen LAN/kaynak erişimi bağlamındadır\
C) Sorun kesinlikle extranet erişimidir\
D) Sorun kesinlikle saldırıdır\
E) Sorun ancak donanım değiştirerek çözülür

**Doğru şık:** B\
**Gerekçe:** Yazıcı erişimi çoğunlukla yerel ağ (LAN) içi kaynaktır. İnternetin çalışması WAN çıkışının tamamen çökmemiş olabileceğini gösterir. Diğer şıklar kanıtsız sıçramadır.

### **Soru 2**

Aşağıdakilerden hangisi "internet var" ifadesinin tek başına yetersiz olmasının temel nedenini en iyi açıklar?\
A) İnternet her zaman yavaş olduğu için\
B) İnternet erişimi, yerel kaynak erişimini otomatik garanti etmez\
C) İnternet sadece kablosuz bağlantıdır\
D) İnternet yalnızca e-posta içindir\
E) İnternet sadece WAN demek değildir

**Doğru şık:** B\
**Gerekçe:** İnternet (WAN) çalışsa bile LAN içi yazıcı/paylaşım gibi kaynaklar ayrı bir bağlamdır. Diğer seçenekler yanlış genelleme veya muğlaktır.

### **Soru 3**

Bir sistem "yalnızca kurum içinden erişilebilir" olarak tanımlanıyor. Bu ifade, en olası hangi erişim politikasına işaret eder?\
A) Internet\
B) Intranet\
C) Extranet\
D) PAN\
E) MAN

**Doğru şık:** B\
**Gerekçe:** "Kurum içinden" ifadesi intranet mantığıdır. Extranet, seçilmiş dış paydaşlara açılan kontrollü erişimdir.

### **Soru 4**

Telefonun Bluetooth kulaklıkla çalışması ve akıllı saatle veri senkronize etmesi hangi ağ türüne daha uygundur?\
A) WAN\
B) MAN\
C) LAN\
D) PAN\
E) Extranet

**Doğru şık:** D\
**Gerekçe:** Kısa mesafeli kişisel cihazlar arası bağlantı PAN kapsamıdır.

### **Soru 5**

Aşağıdaki ifadelerden hangisi "ölçek" sınıflandırmasını (PAN/LAN/MAN/WAN) troubleshooting için doğru kullanır?\
A) Sorun varsa her zaman WAN'dadır\
B) Ölçek, sorunu kimin çözeceğini kesin belirler\
C) Ölçek, "nerede aramalıyım?" sorusunu daraltır; yerel mi uzak mı ayrımını güçlendirir\
D) Ölçek sadece kablo tipini söyler\
E) Ölçek, sadece güvenlik seviyesiyle ilgilidir

**Doğru şık:** C\
**Gerekçe:** Ölçek sınıflandırması, sorunun yerel mi uzak mı olabileceğine dair ilk çerçeveyi verir. B aşırı kesinlik içerir; diğerleri konuyu saptırır.

### **Soru 6**

Aşağıdakilerden hangisi extranet senaryosuna en uygun örnektir?\
A) Herkesin eriştiği haber sitesi\
B) Sadece kurum çalışanlarının eriştiği iç portal\
C) Bir üreticinin, yetkili servislerine özel açtığı sipariş ekranı\
D) Telefonun kulaklıkla bağlantısı\
E) Evdeki iki bilgisayarın dosya paylaşması

**Doğru şık:** C\
**Gerekçe:** Extranet, kurum dışındaki seçilmiş paydaşlara kontrollü erişimdir. A internet; B intranet; D PAN; E LAN örneğidir.

### **Soru 7**

"Network dijital trafiğin aktığı yoldur" benzetmesi, aşağıdaki hangi kavramı en iyi vurgular?\
A) Ağın yalnızca kablo demek olduğunu\
B) Ağın veri akışı ve iletişim düzeni olduğunu\
C) Ağın sadece saldırı/koruma alanı olduğunu\
D) Ağın sadece internet anlamına geldiğini\
E) Ağın yalnızca sunuculardan oluştuğunu

**Doğru şık:** B\
**Gerekçe:** Benzetme, network'ün temel işlevini (verinin düzenli hareketi/iletişim) anlatır. Diğer seçenekler daraltıcı/yanlıştır.

### **Soru 8**

Aşağıdaki eşleştirmelerden hangisi yanlış veya en az uygun olanıdır?\
A) Bluetooth kulaklık → PAN\
B) Ofis içi dosya paylaşımı → LAN\
C) Şehir çapında kurum omurgası → MAN\
D) Şehirler arası şube bağlantısı → WAN\
E) İnternet → LAN

**Doğru şık:** E\
**Gerekçe:** İnternet, küresel ölçekte bir WAN'dır. LAN, yerel alan ağıdır.

### **Soru 9**

Node ve Host için genel kabul gören ayrımı en doğru veren seçenek hangisidir?\
A) Node sadece sunucudur, host sadece istemcidir\
B) Host daha genel bir kavramdır, node daha özeldir\
C) Node ağa bağlı herhangi bir öğe olabilir; host genellikle IP alıp veri üreten/tüketen uç birimdir\
D) Node sadece kablosuz, host sadece kabloludur\
E) Aralarında fark yoktur

**Doğru şık:** C\
**Gerekçe:** Node en genel "ağa bağlı öğe" tanımıdır; host genellikle adreslenebilir uç birim mantığını taşır. Diğer seçenekler hatalı genellemeler içerir.

### **Soru 10**

Bir kullanıcı "example.com açılmıyor" diyor. Bu bilgiyle en doğru ilk yaklaşım hangisidir?\
A) Kesin DNS sorunu var demek\
B) Kesin WAN sorunu var demek\
C) "Bu servis internet mi intranet mi?" ve "başka siteler açılıyor mu?" sorularıyla bağlamı netleştirip doğrulama/çürütme yapmak\
D) Her şeyi sıfırlamak\
E) Kapsamı genişletip her şeyi kontrol etmek

**Doğru şık:** C\
**Gerekçe:** Bu modülün hedefi, tek belirtiyle kesin hüküm vermek değil; bağlamı netleştirip hipotezleri doğrulayıp çürütmektir. A/B erken kesinlik; D/E gereksiz ve riskli reflekslerdir.

## **6) Bu modülde neler öğrendik?**

-   Network'ün çekirdeği: **veri paylaşımı, iletişim ve kaynak erişimi**.

-   "İnternet var" ifadesi tek başına yeterli değildir; **yerel kaynaklar** ayrı bir bağlamdır.

-   Ağları hem **ölçeğe** (PAN/LAN/MAN/WAN) hem de **erişim politikasına** (internet/intranet/extranet) göre sınıflandırmak, troubleshooting'de ilk çerçeveyi kurar.

-   Terminolojiye giriş: **node/host/link/client/server/latency** gibi kavramlar, doğru düşünmeyi kolaylaştırır.

-   En kritik refleks: "**Neye erişmeye çalışıyorum?**" sorusunu netleştirmek ve kanıtsız sıçramalardan kaçınmak.

# **MODÜL 2 --- Topolojiler ve Veri İletimi Temelleri**

Bir ağın **şekli** (topoloji) ve verinin o şekil üzerinde **nasıl aktığı** (veri iletimi temelleri), sorun giderme refleksinin en erken kurulduğu yerdir. Bu modülde amaç; bir problem anında önce "Ağ nasıl kurulmuş?" diye düşünmek (tek nokta arızası var mı, kopma kimi etkiler?), ardından "Yavaşlık tam olarak ne?" sorusunu **ölçülebilir sinyallere** (bandwidth/throughput, latency, jitter, packet loss) çevirmektir. Böylece troubleshooting rastgele deneme olmaktan çıkar; **kapsam daraltan, kanıta dayalı** bir karar akışına dönüşür. Bu temel, ileride kablolama--cihaz rolleri ve katmanlı model (OSI/TCP-IP) konularına sağlam bir zemin sağlar: önce ağın "haritasını" ve "nabzını" okur, sonra nedenleri katman katman ayrıştırırız.

## **Hedefler**

Bu modülün sonunda:

-   Bus / Star / Ring / Mesh / Hybrid topolojilerini tanır; **arıza etkisi** ve **tasarım gerekçesi** (maliyet--dayanıklılık--genişletilebilirlik) açısından karşılaştırırsın.

-   "Tek nokta arızası (Single Point of Failure)" ve "yedeklilik (Redundancy)" kavramlarını, topoloji üzerinden açıklarsın.

-   Bit--Byte farkını ve "Mbps" ile "MB/s" ayrımını doğru yorumlar; servis sağlayıcı hız vaadi ile pratik indirme hızını ilişkilendirirsin.

-   Bandwidth, throughput, latency (RTT), jitter ve packet loss metriklerini günlük senaryolarla eşleştirir; "belirti → metrik" dönüşümünü yaparsın.

-   Basit, izinli ve zarar vermeyen doğrulama yaklaşımıyla "bu belirtiyi ne doğrular/ne çürütür?" bakışını uygularsın.

## **Ana içerik**

## **2.1 Network Topolojileri**

### **2.1.0 Topoloji nedir, neden kritiktir?**

**Network topolojisi**, ağın **fiziksel** (kablolar/cihazlar nasıl bağlandı?) veya **mantıksal** (trafik hangi yolları izliyor?) dizilişidir. Bir mimarın bina planı çizmesi gibi, ağ okuryazarlığı da topolojiyi zihinde canlandırmayı gerektirir.

Topoloji üç şeyi doğrudan etkiler:

1.  **Kablolama ve kurulum maliyeti**

2.  **Arıza anındaki davranış** (kim, ne kadar etkilenir?)

3.  **Genişletilebilirlik ve yönetilebilirlik** (büyütmek kolay mı, arıza bulmak kolay mı?)

**İpucu:** Topoloji teşhisinde ilk soru: **"Kaç kişi/kaç cihaz etkilendi?"**\
Tek cihaz etkileniyorsa "uç/port/kablo"; çok kişi etkileniyorsa "ortak nokta / omurga / merkez" hipotezi güçlenir.

**Dikkat:** Aynı belirti (ör. "internet yok") iki farklı şeye işaret edebilir:

-   **Yerel iletişim de yoksa** (cihazlar birbirini göremiyorsa) sorun daha "içeride" olabilir.

-   **Yerel iletişim var ama dışarı çıkış yoksa** sorun "çıkış/uplink" tarafında olabilir.\
    Bu modülde amaç, doğru soruyu seçmektir; ayrıntı katmanlara daha sonra oturur.

### **2.1.1 Bus (Doğrusal / Veriyolu) Topoloji**

**Yapı:** Tüm cihazlar tek bir ana hat (backbone/omurga) üzerine bağlanır. Klasik tasarımlarda hattın uçlarında sinyali sonlandıran elemanlar bulunur.

-   **Avantaj:** Düşük kablolama maliyeti (tarihsel).

-   **Dezavantaj:** Ana hat koparsa iletişim geniş etkilenir; arıza yerini bulmak zorlaşabilir.

**Örnek:** Günümüz modern ofis LAN'larında saf bus nadirdir; ancak "tek hat üzerinde paylaşım" mantığı bazı özel/legacy ortamlarda kavramsal olarak karşına çıkabilir.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Doğrular:** Aynı omurgayı paylaşan geniş bir grubun aynı anda kopması.

-   **Çürütür:** Sadece tek bir uç cihazın etkilenmesi (bus gibi herkesin etkilenmesini beklediğin yapılarda zayıf bir işaret).

### **2.1.2 Ring (Halka) Topoloji**

**Yapı:** Cihazlar kapalı bir halka oluşturacak şekilde birbirine bağlanır; veri halka üzerinde dolaşır. Bazı tasarımlarda sırayla iletimi düzenleyen "token" benzeri yaklaşımlar görülür.

-   **Avantaj:** Belirli tasarımlarda düzenli akış ve omurga mantığı.

-   **Dezavantaj:** Yedeklilik yoksa tek kopma döngüyü bozabilir (dual-ring gibi yedekli tasarımlar bu riski azaltabilir).

**Örnek:** Şehir ölçeğinde bazı fiber omurga yaklaşımlarında halka mantığıyla karşılaşılabilir.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Doğrular:** Bir kopmanın zincirleme etkisi; belirli bir noktadaki arızanın "döngüyü" kesmesi.

-   **Çürütür:** Alternatif yol olmadığı halde kesintinin hiç yansımaması (bu durumda ring hipotezi zayıflar; ya ring yoktur ya da yedeklilik vardır).

### **2.1.3 Star (Yıldız) Topoloji --- Modern LAN standardı**

**Yapı:** Tüm cihazlar merkezi bir noktaya (çoğunlukla **switch**, bazen **hub** gibi) ayrı bağlantılarla bağlanır. Ev/ofis/sınıf ağlarının önemli kısmı pratikte yıldız mantığı taşır.

-   **Avantaj:** Bir uç kablo koparsa genelde sadece o uç etkilenir; arıza tespiti görece kolaydır.

-   **Dezavantaj:** Merkez cihaz arızalanırsa çok kişi etkilenebilir (**Single Point of Failure** riski).

**Örnek:** Bir ofiste bir kişi "internet yok" derken yan masadaki kişi çalışıyorsa, yıldız topolojide bu çoğu zaman "o uca giden bağlantı/port" hipotezini güçlendirir.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Doğrular:** Tek bir kullanıcının etkilenmesi (uç/port/kablo).

-   **Doğrular:** Herkesin aynı anda etkilenmesi (merkez cihaz veya merkezden dışarı çıkış).

-   **Çürütür:** Etki alanı star'ın "merkez--uç" mantığıyla uyuşmayan, tamamen dağınık bir örüntü gösteriyorsa (ör. farklı yerlerde rastgele kopmalar) tek başına topoloji açıklaması yetmeyebilir.

**İpucu:** Star topolojide iki ayrı "merkez" düşün:

1.  **Merkez cihazın kendisi** (switch/router/AP)

2.  **Merkezin dış bağlantısı (uplink/çıkış)**\
    "Herkes interneti kaybetti" ≠ "Herkes birbirini de kaybetti".

### **2.1.4 Mesh (Örgü) Topoloji --- Yedeklilik mantığı**

**Yapı:** Cihazlar birden fazla yolla birbirine bağlıdır.

-   **Full Mesh:** Her cihaz herkesle bağlı (maksimum yedeklilik, maksimum maliyet).

-   **Partial Mesh:** Sadece kritik cihazlar birden fazla bağlantıya sahiptir (pratikte daha yaygın).

-   **Avantaj:** Bir yol kapanırsa alternatif yol ile iletişim sürebilir.

-   **Dezavantaj:** Maliyet ve yönetim karmaşıklığı artar (çok port/bağlantı).

**Örnek:** Kablosuz mesh ev sistemlerinde "tam kopma yerine kalite düşüşü ama devam" davranışı görülebilir.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Doğrular:** Tek bir bağlantı bozulduğunda iletişimin tamamen kesilmemesi; "başka yoldan" devam etmesi.

-   **Çürütür:** Tek bir kesintinin her şeyi durdurması (mesh yedekliliği yoksa veya ortak nokta varsa yine durabilir).

### **2.1.5 Hybrid (Melez) Topoloji --- Gerçek dünya normu**

**Yapı:** Birden fazla topoloji bir arada kullanılır. Örneğin katlar yıldız, katlar arası omurga halka veya başka bir yapı olabilir.

**Örnek:** Bir okulda sınıflar star mantığıyla switch'e bağlıyken, binalar arası bağlantı farklı bir omurga yaklaşımıyla kurulmuş olabilir.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Doğrular:** Sorunun sadece belirli bir bölümde görülmesi (tek sınıf/tek kat) --- hibrit yapının o alt parçası etkilenmiş olabilir.

-   **Çürütür:** Tüm kampüs aynı anda etkileniyorsa, "yerel alt parça" yerine ortak omurga/ortak çıkış olasılığı güçlenir.

**İpucu:** Hibrit ağlarda en hızlı başlangıç:\
**"Sorun nerede başlıyor ve nerede bitiyor?"** (tek oda mı, kat mı, bina mı, tüm yerleşke mi?)

### **Topoloji karşılaştırma tablosu (hızlı karar)**

  **Özellik**                **Bus**               **Star**           **Mesh**                   **Ring**                **Hybrid**
  -------------------------- --------------------- ------------------ -------------------------- ----------------------- ----------------------
  Kurulum maliyeti           Düşük                 Orta               Çok yüksek                 Orta/Yüksek             Değişken
  Tek kablo kopması etkisi   Geniş etki olabilir   Genelde tek uç     Genelde tolere eder        Yedeksizse geniş etki   Etki alanına bağlı
  Genişletilebilirlik        Zor                   Kolay              Zor/karmaşık               Orta                    Orta
  Arıza tespiti              Zor                   Kolay              Karmaşık                   Orta                    Kapsama bağlı
  Tipik kullanım             Özel/legacy           Ev/ofis/okul LAN   Kritik omurga/yedeklilik   Özel omurga             Gerçek dünya karışık

## **2.2 Veri İletimi Temelleri**

Topoloji "yolu" kurar; veri iletimi ise o yoldaki "trafik"tir. "Hızlı/yavaş" gibi belirsiz ifadeler, troubleshooting'de zayıftır; hedef, sorunu **teknik ama anlaşılır** metriklere dönüştürmektir.

### **2.2.1 Temel birimler: Bit vs Byte**

-   **Bit (b):** 0 veya 1. Ağ hızları çoğunlukla bit ile ifade edilir: **Mbps, Gbps**.

-   **Byte (B):** 8 bit. Dosya boyutu/depolama çoğunlukla byte ile ifade edilir: **MB, GB**.

**Örnek:** Servis sağlayıcı "100 Mbps" derse, bu "100 MB/s indirirsin" demek değildir.\
Teorik üst sınır yaklaşık: **100 / 8 ≈ 12.5 MB/s** (pratikte protokol ek yükleri ve ortam şartlarıyla daha düşük olabilir).

**Dikkat:** "m" ve "M" gibi harf farkları (Mb vs MB) gerçek hayatta ciddi yanlış anlaşılma doğurur.\
Hız konuşurken birimi her zaman açık yaz: **Mbps mi, MB/s mi?**

### **2.2.2 Frame (Çerçeve) ve Packet (Paket) --- giriş düzeyi**

Veri ağda tek parça dolaşmaz; parçalara bölünür.

-   **Packet (paket):** Ağlar arası taşınan, adresleme bilgisi taşıyan veri parçası gibi düşünebilirsin (kargo kutusu benzetmesi).

-   **Frame (çerçeve):** Yerel iletimde "hat üzerinde taşınan" birim gibi düşünebilirsin (kargo kamyonu benzetmesi).

Bu ayrımın sistematik karşılığını katmanlı mimaride netleştireceğiz; burada amaç terimleri **doğru bağlamda duymak ve karıştırmamaktır**.

### **2.2.3 Ağ performansının temel metrikleri**

Bu metrikler ağın "nabzı"dır:

#### **a) Bandwidth (Bant genişliği)**

**Tanım:** Birim zamanda taşınabilecek maksimum veri miktarı (kapasite).\
**Benzetme:** Yolun şerit sayısı.\
**Belirti:** Büyük dosya transferlerinde süreyi etkiler.

#### **b) Throughput (Gerçek aktarım)**

**Tanım:** Pratikte elde ettiğin aktarım hızı (gerçek hız).\
**Not:** Bandwidth teorik olabilir; throughput çoğunlukla daha düşüktür.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Doğrular:** Aynı iş yükünde yoğun saatlerde düşüş → paylaşım/darboğaz (bottleneck) olasılığı artar.

-   **Çürütür:** Tek cihazda, boş zamanda da düşükse paylaşım yerine uç/bağlantı sorunu olasılığı güçlenir.

#### **c) Latency (Gecikme) / RTT**

**Tanım:** Bir isteğin gidip gelme süresi hissi. Sıklıkla "RTT (Round Trip Time)" şeklinde düşünülür.\
**Belirti:** Web sayfasının ilk tepki süresi, oyunda komutların geç işlemesi.

#### **d) Jitter (Gecikme oynaklığı)**

**Tanım:** Gecikmenin ne kadar dalgalandığı (istikrar).\
**Belirti:** Ses/video görüşmelerinde robotik ses, kesiklik.

#### **e) Packet Loss (Paket kaybı)**

**Tanım:** Gönderilen bazı paketlerin hedefe ulaşmaması veya cevabın gelmemesi.\
**Belirti:** Video donması, görüşmede kopmalar, TCP'nin yeniden gönderimleri nedeniyle "yavaşlık" hissi.

**İpucu:** "Hız" (kapasite) ile "kalite" (latency/jitter/loss) farklı şeylerdir.\
Dosya iner ama görüşme bozuluyorsa çoğu zaman mesele "hız" değil "kalite"dir.

### **2.2.4 Belirti → metrik eşlemesi (hızlı rehber)**

-   **Büyük dosyalar yavaş:** önce **throughput/bandwidth**

-   **Tıklayınca geç tepki:** önce **latency**

-   **Ses/video robotik, aralıklı:** önce **jitter** ve/veya **packet loss**

-   **Her şey bazen iyi bazen kötü:** **jitter**, **darboğaz**, **kablosuz parazit** gibi değişkenler düşün

### **Komut & Araç Okuryazarlığı (izinli, zarar vermeyen gözlem)**

Bu bölüm, metrikleri "adıyla duymak" yerine **çıktıda görmeye** giriş sağlar. Komutlar yalnızca **kendi ağında / izinli ortamda** ve **teşhis** amacıyla kullanılmalıdır.

#### **1) Latency ve Packet Loss gözlemi: ping**

ping, karşı tarafa küçük bir istek gönderip yanıt süresini ölçer; paket kaybı yüzdesini özetleyebilir.

**Komut (Windows / Linux / macOS):**

-   ping example.com

**Beklenen çıktı türü (örnek, temsili):**

-   time=18ms gibi değerler: gecikme

-   "Lost = 0%" gibi özet: kayıp yok

-   "Request timed out": cevap gelmedi (kayıp olabilir ya da ICMP engellenmiş olabilir)

**Yorum ipucu (kritik satır):**

-   time değerlerinin **sürekli yüksek** olması → latency problemi ihtimali

-   time değerlerinin **çok dalgalı** olması → jitter ihtimali

-   Lost \> 0 → packet loss ihtimali

**Dikkat:** ping tek başına "kesin hüküm" değildir. Bazı sistemler ICMP'yi kısıtlayabilir.\
**Gözlem:** "timeout gördüm" → **Yorum:** "kayıp var olabilir" (ama engel de olabilir). Bu ayrımı not al.

#### **2) Yol üzerinde gecikme nerede artıyor? tracert / traceroute (giriş)**

Bu komutlar paketin geçtiği ara durakları kabaca gösterir (detaylı yaklaşım ileride).

-   Windows: tracert example.com

-   Linux/macOS: traceroute example.com

**Amaç:** Gecikme evden çıkarken mi artıyor, yoksa daha ileride mi?\
Bu modülde hedef, sadece "rota diye bir kavram var" farkındalığıdır.

**İpucu:** Bir şikâyeti raporlarken şu ayrımı yaz:\
"ping çıktısında gecikme **yüksek/dalgalı**, kayıp **var/yok**" → bu, kanıt standardında not almaya başlatır.

**Not (kapsam içi ufuk):** Paket yakalama araçları (ör. Wireshark/tcpdump) metrikleri daha ayrıntılı gözlemlemeyi sağlar; bu yaklaşım modül ilerledikçe sistematik ele alınacaktır. Bu modülde derinleştirmiyoruz.

### **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Belirti:** Bir çalışan "Toplantıda sesim robotlaşıyor ve kesiliyor, ama büyük dosyayı indirirken hızım iyi" diyor.\
**Olasılık:** Bandwidth/throughput "kısmen yeterli" olabilir; problem daha çok **jitter** ve/veya **packet loss** ile uyumlu.\
**Doğrulama (güvenli):**

1.  **Belirtiyi metriğe çevir:** "Robotik ses" → jitter/loss aday.

2.  **Basit gözlem:** ping example.com ile 1--2 dakika izleyip time dalgalanmasına ve timeout/kayıp işaretlerine bak.

3.  **Karşı kanıt düşün:** time stabil ve kayıp yoksa, sorun başka yerde olabilir (ör. uygulama/cihaz).\
    **Sonuç:** "Hız" değil "kalite" problemi çerçevesi güçlenir; sonraki adım, bu bulguyu daha sistematik incelemeye taşımaktır (modül ilerledikçe).

## **Terimler sözlüğü**

  **Terim**                 **Türkçe karşılığı / açıklama**
  ------------------------- ----------------------------------------------------------------
  Topology                  Topoloji; ağın fiziksel veya mantıksal yerleşimi
  Node                      Düğüm; ağa bağlı öğe/cihaz
  Link                      Bağlantı; düğümler arası iletişim hattı
  Backbone                  Omurga; ana trafiği taşıyan hat
  Redundancy                Yedeklilik; alternatif yol/cihaz ile dayanıklılık
  Single Point of Failure   Tek arıza noktası; bozulunca geniş etki doğuran kritik bileşen
  Bottleneck                Darboğaz; performansı sınırlayan en yavaş nokta
  Bus                       Doğrusal/veriyolu topolojisi
  Star                      Yıldız topolojisi; merkez üzerinden bağlantı
  Ring                      Halka topolojisi; döngüsel bağlantı
  Mesh                      Örgü topolojisi; çoklu alternatif bağlantılar
  Hybrid                    Melez topoloji; birden fazla topoloji birlikte
  Bit (b)                   En küçük veri birimi (0/1); hızlar genelde bit ile
  Byte (B)                  8 bit; dosya boyutları genelde byte ile
  Packet                    Paket; ağlar arası taşınan veri parçası (giriş tanımı)
  Frame                     Çerçeve; yerel iletimde taşınan birim (giriş tanımı)
  Bandwidth                 Bant genişliği; teorik kapasite
  Throughput                Gerçek aktarım; pratik hız
  Latency                   Gecikme; tepki/RTT hissi
  RTT                       Round Trip Time; gidip gelme süresi
  Jitter                    Gecikme oynaklığı; gecikme dalgalanması
  Packet Loss               Paket kaybı; paketlerin ulaşmaması/cevabın gelmemesi

## **Kendini Değerlendir (10 soru)**

### **Soru 1**

Bir ağda tek bir kullanıcının bağlantısı gidiyor; aynı masadaki diğer kullanıcı etkilenmiyor. Bu belirti, ilk etapta hangi yaklaşımı daha çok güçlendirir?\
A) Ortak omurga (backbone) kopması\
B) Tek arıza noktası olarak merkez cihazın bozulması\
C) Uç/port/kablo gibi kullanıcıya özel bağlantı sorunu\
D) Jitter kaynaklı performans sorunu\
E) Extranet erişim sorunu

**Doğru şık:** C\
**Gerekçe:** Etki alanı "tek kullanıcı" ise önce uç/port/kablo gibi yerel bağlantı olasılığı güçlenir. A/B geniş etki bekletir. D performans metrikleriyle ilgili, "tam kopma"yı tek başına açıklamaz. E bu modülün bağlamı dışında bir erişim sınıflamasıdır.

### **Soru 2**

Bir sınıftaki 20 cihaz aynı anda bağlantıyı kaybediyor, yan sınıf etkilenmiyor. En doğru ilk çerçeveleme hangisidir?\
A) Sorun kesinlikle internet servis sağlayıcısındadır\
B) Sorun o sınıfın ortak noktasında (ör. merkez cihaz/enerji/uplink) olabilir; kapsam daraltılmalı\
C) Sorun sadece bandwidth düşüklüğüdür\
D) Sorun sadece DNS'tir\
E) Sorun mutlaka saldırıdır

**Doğru şık:** B\
**Gerekçe:** Etki alanı sınırlı ama çoklu cihaz → o bölümde ortak nokta hipotezi mantıklıdır. Diğer şıklar kanıtsız sıçrama veya tek sebebe kilitlenmedir.

### **Soru 3**

Servis sağlayıcı "100 Mbps" hız satıyor. Teorik olarak bu, en iyi koşulda yaklaşık kaç **MB/s** indirme hızına karşılık gelir?\
A) 100 MB/s\
B) 50 MB/s\
C) 12.5 MB/s\
D) 8 MB/s\
E) 1 MB/s

**Doğru şık:** C\
**Gerekçe:** 1 Byte = 8 bit → 100 Mb/s ÷ 8 ≈ 12.5 MB/s. Diğer seçenekler bit--byte dönüşümünü göz ardı eder.

### **Soru 4**

"Web sitesine tıklayınca geç açılıyor, ama açıldıktan sonra video akışı gayet iyi" ifadesi en çok hangi metriği düşündürür?\
A) Bandwidth\
B) Latency\
C) Full mesh eksikliği\
D) Packet loss kesinliği\
E) MAN/WAN ayrımı

**Doğru şık:** B\
**Gerekçe:** İlk tepki gecikmesi latency ile uyumludur. Video akışının iyi olması throughput'un yeterli olabileceğini ima eder. D "kesin" değil; loss da olabilir ama belirti daha çok gecikmeye benzer.

### **Soru 5**

"Dosya indirirken hız iyi, ama sesli görüşmede robotik ses ve kesilmeler oluyor" şikâyeti için en iyi ilk tahmin hangisidir?\
A) Bandwidth düşük\
B) Jitter ve/veya packet loss olası\
C) Topoloji kesinlikle bus\
D) Byte/bit dönüşümü yanlış\
E) Router modeli eski, kesin sebep budur

**Doğru şık:** B\
**Gerekçe:** Gerçek zamanlı akış uygulamalarında jitter/loss kaliteyi bozar. Bandwidth iyi olabilir. C/D/E doğrudan bu belirtiyi açıklamaz veya kanıtsızdır.

### **Soru 6**

Aşağıdaki benzetmelerden hangisi bandwidth--latency farkını doğru anlatır?\
A) Bandwidth varış süresi, latency şerit sayısıdır\
B) Bandwidth şerit sayısı (kapasite), latency varış süresi (gecikme) gibidir\
C) Bandwidth sadece kablosuzda olur\
D) Latency dosya boyutudur\
E) İkisi aynı şeydir

**Doğru şık:** B\
**Gerekçe:** Bandwidth kapasiteyi, latency tepki süresini temsil eder. Diğerleri yanlış genelleme/yanlış tanımdır.

### **Soru 7**

Full mesh topolojisinin pratikteki en büyük maliyeti hangisidir?\
A) Dayanıksız olması\
B) Çoklu bağlantı/port ihtiyacı nedeniyle kurulum ve yönetim maliyetinin yükselmesi\
C) Sadece iki cihaz bağlayabilmesi\
D) Paket kaybını artırması\
E) Latency'yi otomatik sıfırlaması

**Doğru şık:** B\
**Gerekçe:** Full mesh maksimum yedeklilik sağlar ama çok bağlantı gerektirir. Diğer şıklar kavramsal olarak hatalıdır.

### **Soru 8**

ping çıktısında bazı isteklerde "Request timed out" görülüyor. En doğru yorum hangisidir?\
A) Kesinlikle saldırı var\
B) Kesinlikle kablo kopuk\
C) Paket kaybı **olabilir** veya ICMP engellenmiş olabilir; gözlem--yorum ayrımıyla ek kanıt gerekir\
D) Bandwidth kesin yüksektir\
E) Topoloji kesin ring

**Doğru şık:** C\
**Gerekçe:** Timeout tek başına kesin hüküm verdirmez; hem kayıp hem filtreleme ihtimali vardır. Bu soru, kanıt standardında düşünmeyi ölçer.

### **Soru 9**

"Tek arıza noktası" riskini azaltmaya en uygun yaklaşım hangisidir?\
A) Tek bir merkez cihaz kullanmak\
B) Yedekli bağlantı/alternatif yol sunan tasarım (ör. mesh mantığı veya redundant hatlar)\
C) Daha uzun kablo kullanmak\
D) Sadece kablosuz kullanmak\
E) Bit--byte dönüşümünü değiştirmek

**Doğru şık:** B\
**Gerekçe:** SPOF riski alternatif yol/cihaz ile azaltılır. Diğerleri doğrudan çözüm değildir.

### **Soru 10**

Aşağıdaki eşleştirmelerden hangisi "belirti → metrik" açısından en isabetlidir?\
A) "Aralıklı robotik ses" → throughput\
B) "Tıklayınca geç açılma" → latency\
C) "Büyük dosya yavaş" → yalnızca jitter\
D) "Her şey stabil ama yavaş" → yalnızca packet loss\
E) "Tek cihaz koptu" → omurga kopması

**Doğru şık:** B\
**Gerekçe:** İlk tepki gecikmesi latency ile uyumludur. A/C/D/E tek sebebe kilitlenme veya yanlış eşleştirmedir.

## **Kapanış: Bu modülde neler kazandık?**

-   Ağ topolojisini "çizim" değil **arıza etkisi ve karar verme aracı** olarak okumayı öğrendik.

-   Bus/star/ring/mesh/hibrit yapıların **maliyet--dayanıklılık--genişletilebilirlik** dengesini gördük.

-   "Hız" kavramını **bit--byte**, **bandwidth--throughput** ve **kalite metrikleri** (latency/jitter/loss) üzerinden ayrıştırdık.

-   Bir belirtiden doğrudan sonuca atlamak yerine "belirti → metrik → doğrulama/çürütme" yaklaşımını kurduk.

-   Basit komutlarla (ping, tracert/traceroute) metrikleri **çıktıda görmeye** giriş yaptık; gözlem--yorum ayrımını koruduk.

# **MODÜL 3 --- SOHO (Ev/Küçük Ofis) Ağları: Pratik Gerçekler**

Kurumsal ortamlarda yönlendirme, anahtarlama ve kablosuz yayın için ayrı cihazlar kullanılırken; ev ve küçük ofislerde (SOHO) bu işlevler çoğu zaman **tek bir kutunun içine** sığdırılır. Bu "hepsi bir arada" yaklaşım, kurulum kolaylığı sağlar ama arıza anında kök nedenin karışmasına da yol açar: "Wi-Fi var ama internet yok" gibi cümleler, aslında farklı katmanlarda farklı sorunları saklar. Bu modülde hedef; SOHO ağını **katmanlı bir harita** olarak canlandırmak (ISP hattı → modem/ONT → router/gateway → switch/AP → istemciler) ve bir problem anında **etki alanını** hızla daraltmaktır. Ardından SOHO'da en sık görülen belirtileri (kopma, yavaşlık, kapsama sorunu, IP alamama, bazı cihazların bağlanıp bazılarının bağlanmaması) **ölçülebilir ve doğrulanabilir** sinyallere çeviririz. Son olarak, yalnızca kendi/izinli ortamında kullanacağın temel komut ve araçlarla "gözlem--yorum" ayrımını koruyarak teşhis refleksi geliştirirsin.

## **Hedefler**

Bu modülün sonunda:

-   Ev tipi "modem/router" cihazının içindeki işlevleri (**modem + router + switch + access point**) ayırt edersin.

-   SOHO ağ akışını (ISP → gateway → kablolu/kablosuz dağıtım → istemci) rol ve trafik üzerinden açıklarsın.

-   "Wi-Fi bağlı" ile "internet erişimi var" farkını **katmanlı düşünme** ile netleştirirsin.

-   SOHO'da sık görülen hataları **belirti örüntüsü** ile sınıflandırır; yanlış pozitifleri azaltırsın.

-   Windows/Linux/macOS üzerinde temel komutlarla **IP/gateway/ulaşılabilirlik/DNS** doğrulaması yapar, kritik satırları yorumlarsın.

## **3.1 Ev tipi ağ mimarisi**

### **Ne anlama gelir?**

SOHO'nun en belirgin özelliği, tek cihazın aynı anda birden fazla rol oynamasıdır. Masanın üstündeki "modem" diye anılan kutu, çoğu evde aslında şu işlevleri birlikte yürütür:

-   **Modem/ONT işlevi:** ISP'den gelen hattı (fiber/DSL/kablo) ev ağına taşır.

-   **Router/Gateway işlevi:** Ev ağı (LAN) ile internet (WAN) arasında yönlendirme yapar; çoğu senaryoda adres çevirimi (NAT) uygular.

-   **Switch işlevi:** Arkasındaki LAN portlarıyla kablolu cihazları aynı yerel ağa bağlar.

-   **Access Point (AP) işlevi:** Wi-Fi sinyali yayarak kablosuz cihazları ağa dahil eder.

Bu nedenle teşhiste ilk refleks şudur: **Haritayı 30 saniyede çıkar.**\
"İnternet hattı nereden geliyor, hangi cihaz 'kapı' (gateway), hangi cihaz sadece dağıtım yapıyor?"

SOHO'da tipik akış (mantıksal harita):

1.  ISP hattı

2.  Modem/ONT veya ISP gateway

3.  Router/Gateway (evin "çıkış kapısı")

4.  Dağıtım

    a.  Kablolu: LAN portları / ek switch

    b.  Kablosuz: Wi-Fi (SSID)

5.  İstemciler: telefon, laptop, TV, konsol, yazıcı, IoT

**İpucu (zihinsel model):**\
"SOHO'da sorun giderme = haritayı çiz + etki alanını daralt."\
Harita yoksa, her adım 'tahmin' olur.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   **Telefon Wi-Fi'a bağlı ama internet yok:** Kablosuz bağlantı (yerel) var; "dışarı çıkış" (gateway/ISP) tarafı problemli olabilir.

-   **Kablolu çalışıyor ama Wi-Fi çalışmıyor:** Sorun dağıtımın kablosuz kısmında olabilir (SSID/şifre/sinyal/AP rolü).

-   **Sadece bir cihaz internete çıkamıyor:** Uç cihaz tarafı daha olasıdır (yanlış ağa bağlanma, IP alamama, adaptör/ayar).

### **Nasıl doğrularım/çürütürüm? (güvenli)**

Katmanlı düşünmeyi 4 soruyla otomatikleştir:

1.  **Bağlantı var mı?** (Wi-Fi bağlı mı, kablo takılı mı?)

2.  **IP aldım mı?** (IP/gateway görüyor muyum?)

3.  **Gateway'e ulaşabiliyor muyum?** (yerel ping)

4.  **Dış dünyaya çıkabiliyor muyum?** (dış IP/alan adı testi)

**Dikkat:** "Wi-Fi bağlı" demek "internet var" demek değildir.\
Wi-Fi çoğu zaman sadece **yerel ağa bağlandığını** söyler; internet için ayrıca **gateway ve dış çıkış** sağlıklı olmalıdır.

### **Mesh Wi-Fi mantığı (kapsama perspektifi)**

Evde uzak köşelerde çekim zayıfladığında iki sık yaklaşım görülür:

-   **Tekrarlayıcı (repeater/range extender) yaklaşımı:** Var olan Wi-Fi sinyalini alır ve yeniden yayınlar. Pratikte çoğu senaryoda performansı düşürebilir; ayrıca odalar arasında dolaşırken cihazın bağlantı değişimi hissedilebilir.

-   **Mesh yaklaşımı:** Birden fazla düğüm (node) tek bir ağ gibi çalışır; cihazlar arasında daha akıllı geçiş (roaming) davranışı hedeflenir. Düğümler arası iletişim için özel taşıma (backhaul) mantığı devreye girebilir.

**İpucu:** Kapsama sorunu yaşıyorsan önce "çekmiyor mu?" değil, **"çekiyor görünüp yavaş mı?"** diye sor.\
Çünkü sinyal seviyesi iyi görünse bile kanal kalabalığı/parazit kaliteyi düşürebilir.

## **3.2 Sık görülen hatalar ve belirtiler**

### **Ne anlama gelir?**

SOHO'da sorunların büyük kısmı "donanım bozuldu"dan çok **yanlış bağlantı, yanlış yerleşim veya yanlış yapı** kaynaklıdır. En hızlı yaklaşım, sebep listesi ezberlemek değil; **belirti örüntüsünden hipotez kurmaktır**:

-   **Tek cihaz mı etkileniyor?** → uç cihaz/bağlantı/yanlış ağ olasılığı artar.

-   **Herkes mi etkileniyor?** → ortak nokta (gateway, ISP hattı, güç) olasılığı artar.

-   **Sadece Wi-Fi mı / sadece kablo mu?** → dağıtım katmanını daraltırsın.

Aşağıdaki örüntüler SOHO'da çok sık çıkar:

### **3.2.1 Yanlış port / yanlış kablo (WAN vs LAN karışması)**

**Belirti:** "İnternet ışığı yanmıyor", "ağ var ama çıkış yok", bazen "garip bağlantı" şikâyetleri.\
**Mantık:** WAN (dış hat) ile LAN (iç ağ) portlarının yeri/rolü karışırsa topoloji bozulur.\
**Doğrulama (güvenli):** Fiziksel kontrol: Kablo doğru yuvada mı? Port ışıkları (link/activity) yanıyor mu?

### **3.2.2 Çift NAT (Double NAT) --- gizli performans katili**

**Senaryo:** ISP'nin verdiği cihazın arkasına ikinci bir router eklenir ve iki cihaz da "router/gateway" gibi davranır.\
**Belirti örüntüsü:** Temel web gezintisi çoğu zaman çalışır; ancak online oyunlarda kopma, bazı VPN türlerinde sorun, bazı uygulamalarda bağlantı kurmada zorlanma görülebilir.\
**Doğrulama (güvenli):**

-   Sorunun "her şey tamamen kapalı" değil de **belirli uygulamalarda** yoğunlaştığına bak.

-   Ağ haritasını çıkar: "Kaç tane cihaz 'gateway' gibi davranıyor?" sorusunu yanıtla.

**Dikkat:** Bu modülde amaç "çift NAT'ı tanımak ve kanıtlamak"tır.\
Cihaz üzerinde hangi menüden hangi ayar yapılır gibi marka/model adım adım konfigürasyonlar değişkendir; uygulama ayrıntıları için cihaz dokümanına gidilir.

### **3.2.3 Yanlış DNS (isim çözümleme sorunu) --- "İnternet var ama site açılmıyor"**

**Belirti örüntüsü:** Bazı uygulamalar "internet yok" der; ama aslında IP seviyesinde çıkış olabilir.\
**Klasik sinyal:** Bir IP adresine ulaşabiliyorsun; fakat **alan adı** ile erişemiyorsun.\
**Doğrulama (güvenli):** "IP ile test" + "alan adı ile test" birlikte yapılır (komutlar 3.3'te).

### **3.2.4 Kanal kalabalığı / parazit ve kapsama problemleri**

**Belirti örüntüsü:** Wi-Fi çekiyor görünüyor (çubuklar dolu), ama akşam saatlerinde yavaşlama/kopma artıyor.\
**Mantık:** Aynı ortamda çok sayıda Wi-Fi varsa hava "kalabalık" olur; performans düşebilir.\
**Doğrulama (güvenli):**

-   Sorun belirli zamanlarda artıyorsa (yoğun saat), kanal kalabalığı hipotezi güçlenir.

-   Router'a yakın noktada iyiyken uzak noktada belirgin düşüyorsa kapsama hipotezi güçlenir.

**İpucu:** "Yavaşlık" tek bir şey değildir.\
Dosya indirme yavaşsa throughput; tıklama gecikmesi varsa latency; kesik kesik görüşme varsa jitter/kayıp düşün (Modül 2'den hatırla).

### **3.2.5 "Ara ara kopuyor"**

**Belirti örüntüsü:** 10--30 dakikada bir kısa kesintiler; bazen sadece Wi-Fi'da.\
**Olasılıklar:** zayıf sinyal, geçici yoğunluk, güç dalgalanması, cihazın ısınması/yeniden başlatması, kablo temassızlığı.\
**Doğrulama (güvenli):** "Ne zaman oluyor?" (zaman örüntüsü) + "hangi cihazlarda oluyor?" (kapsam) soruları.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

SOHO için düşük riskli doğrulama sırası:

1.  **Kapsam:** Tek cihaz mı, bir oda mı, tüm ev mi?

2.  **Bağlantı tipi:** Sadece Wi-Fi mı, sadece kablo mu, ikisi de mi?

3.  **IP + gateway:** IP almış mı, varsayılan ağ geçidi var mı?

4.  **Ulaşılabilirlik:** Gateway'e ping; sonra dış test.

5.  **İsim çözümleme:** IP ile oluyor, isimle olmuyor mu?

**Dikkat (yanlış pozitif):**\
"Bir site açılmıyor" → "internet yok" demek değildir.\
En az iki farklı hedefle test etmeden kesin hüküm verme.

## **3.3 Komut & araç okuryazarlığı (temel hedef)**

### **Ne anlama gelir?**

Buradaki komutlar "hacking" için değil, **kanıt üretmek** içindir:\
"Bence sorun var" yerine "Şu çıktı şunu gösteriyor" diyebilmek.

Zihniyet: **Böl ve Yönet**

1.  Cihaz → 2) Gateway → 3) İnternet (IP) → 4) DNS (isim)

**İpucu (gözlem--yorum):**\
Komut çıktısı **gözlem**dir. "Sebep" ise **yorum**dur ve ek kanıt ister.\
Aynı çıktıyı farklı nedenler üretebilir; bu yüzden karşı kanıt aramayı bırakma.

### **3.3.1 "Bağlı mıyım, hangi ağa bağlıyım?" (bağlantı doğrulaması)**

**Windows**

-   **Komut:** netsh wlan show interfaces

    -   **Amaç:** Wi-Fi bağlı mı, hangi SSID'ye bağlıyım?

    -   **Beklenen çıktı türü:** SSID, state, signal

    -   **Yorum ipucu:** Yanlış SSID'ye bağlıysan "internet yok" şaşırtıcı değildir. Sinyal çok düşükse kopma/yavaşlık beklenebilir.

    -   **Güvenli sınır:** Sadece kendi cihazında.

**Linux**

-   **Komut:** nmcli dev status

    -   **Amaç:** Wi-Fi/Ethernet bağlı mı?

    -   **Beklenen çıktı türü:** connected/disconnected

    -   **Yorum ipucu:** "Sadece Wi-Fi mı?" sorusunu hızlı yanıtlar.

    -   **Güvenli sınır:** Yerel kullanım.

**macOS**

-   **Komut:** networksetup -getairportnetwork en0

    -   **Amaç:** Hangi Wi-Fi ağına bağlıyım?

    -   **Beklenen çıktı türü:** SSID bilgisi

    -   **Yorum ipucu:** Yanlış ağ → yanlış teşhis.

    -   **Güvenli sınır:** Yerel kullanım.

### **3.3.2 "IP aldım mı, gateway var mı?" (yerel adres doğrulaması)**

**Windows**

-   **Komut:** ipconfig /all

    -   **Amaç:** IP var mı, Default Gateway var mı, DHCP çalışıyor mu?

    -   **Beklenen çıktı türü:** IPv4 Address, Default Gateway, DHCP Enabled

    -   **Yorum ipucu:** IP yoksa veya **169.254.x.x** görüyorsan cihaz IP alamamış olabilir (yerel). Gateway yoksa internet çıkışı bekleme.

    -   **Güvenli sınır:** Yerel kullanım.

**Linux**

-   **Komut:** ip a

    -   **Amaç:** Arayüz IP almış mı?

    -   **Beklenen çıktı türü:** inet satırları

    -   **Yorum ipucu:** IP yoksa, "bağlıyım" hissi yanıltıcı olabilir.

-   **Komut:** ip r

    -   **Amaç:** Varsayılan rota var mı?

    -   **Beklenen çıktı türü:** default via \... satırı

    -   **Yorum ipucu:** default via yoksa dış çıkış için rota yoktur.

**macOS**

-   **Komut:** ifconfig

    -   **Amaç:** IP var mı? (inet satırları)

-   **Komut:** netstat -rn

    -   **Amaç:** Varsayılan rota var mı? (default satırı)

### **3.3.3 "Sorun yerel mi, dışarıda mı?" (ulaşılabilirlik testi)**

**Not (gizlilik/örnek):** Aşağıdaki IP'ler yalnızca **dokümantasyon örnekleridir**.\
Kendi ortamında, gateway adresini kendi çıktından (Default Gateway) alarak kullanmalısın.

1.  **Gateway testi (yerel):**

-   **Komut:** ping 192.0.2.1 *(örnek; sen kendi gateway'ini yazacaksın)*

    -   **Amaç:** Yerel ağ geçidine ulaşabiliyor muyum?

    -   **Beklenen çıktı türü:** time=...ms, packet loss özeti

    -   **Yorum ipucu:** Gateway'e ping yoksa sorun çoğu zaman yereldir (Wi-Fi/kablo/cihaz).

2.  **Dış dünya testi (IP ile):**

-   **Komut:** ping 198.51.100.10 *(örnek "dış IP" placeholder'ı)*

    -   **Amaç:** DNS'e takılmadan "dışarı çıkış" var mı?

    -   **Yorum ipucu:** IP'ye ping var ama alan adına yoksa DNS hipotezi güçlenir.

3.  **DNS testi (alan adı ile):**

-   **Komut:** ping example.com

    -   **Amaç:** İsim çözülüyor mu + temel erişim var mı?

    -   **Beklenen çıktı türü:** Çözümleme + gecikme

    -   **Yorum ipucu:** "host bulunamadı" benzeri hata → isim çözümleme sorunu olasılığı.

Ek (DNS'i daha net görmek istersen, güvenli):

-   **Windows:** nslookup example.com

-   **Linux/macOS:** dig example.com *(yüklü değilse sorun değil; sadece ufuk)*

    -   **Amaç:** Alan adının hangi IP'ye çözüldüğünü görmek, DNS'in cevap verip vermediğini anlamak.

    -   **Yorum ipucu:** Cevap yok/timeout → DNS yolu problemli olabilir.

**Dikkat:** ping tek başına "kesin teşhis" değildir.\
Bazı hedefler ICMP'yi kısıtlayabilir. Bu yüzden hem **gateway** hem **alan adı** gibi birden fazla kanıtla düşün.

### **3.3.4 SOHO araçları: Komutsuz hızlı kontroller (güvenli)**

-   **Router/Gateway arayüzü: "Bağlı Cihazlar / Clients"**

    -   **Amaç:** Cihaz gerçekten ağa girmiş mi, IP almış mı?

    -   **Yorum ipucu:** Listede yoksa sorun bağlantı/kimlik doğrulama katmanında olabilir.

-   **Uç cihaz ağ durumu ekranı (GUI)**

    -   **Amaç:** Bağlı mı, IP var mı, bağlantı tipi ne?

    -   **Yorum ipucu:** GUI hızlı özet verir; kesinleştirmek için komut kullanırsın.

**Köprü notu:** Trafik yakalama ve ileri analiz araçlarını (ör. paket yakalama ekosistemi) bu seviyede "gerekince" anmakla yetiniriz; detaylı trafik analizi yaklaşımı Modül 12'de ele alınacaktır.

### **Örnek: "Wi-Fi'a bağlıyım ama internete giremiyorum" (güvenli mini senaryo)**

**Belirti:** Laptop Wi-Fi'a bağlı; fakat web sayfaları açılmıyor.\
**Doğrulama akışı (Cihaz → Gateway → İnternet → DNS):**

1.  ipconfig /all (veya ip a, ip r)

    a.  **Gözlem:** Geçerli bir IP ve Default Gateway var.

    b.  **Yorum:** Cihaz yerel ağa dahil olmuş olabilir.

2.  Gateway'e ping (kendi gateway adresinle):

    a.  **Gözlem:** Düşük gecikmeyle yanıt var.

    b.  **Yorum:** Cihaz ↔ router bağlantısı sağlam görünüyor.

3.  Dış IP'ye ping (kendi izinli test hedefinle):

    a.  **Gözlem:** Yanıt var.

    b.  **Yorum:** "Dışarı çıkış" çalışıyor olabilir.

4.  ping example.com

    a.  **Gözlem:** "host bulunamadı" benzeri hata.

    b.  **Sonuç:** İsim çözümleme (DNS) yönünde sorun hipotezi güçlenir; sonraki adım DNS ayarlarını/rotayı kanıtla doğrulamaktır (uygulama ayrıntısı cihaza göre değişir).

## **Terimler Sözlüğü (Glossary)**

  **Terim**           **Türkçe karşılığı / açıklama**
  ------------------- -----------------------------------------------------------------------
  SOHO                Small Office/Home Office; ev/küçük ofis ağları
  ISP                 Internet Service Provider; internet servis sağlayıcı
  ONT                 Optical Network Terminal; fiber hat sonlandırma cihazı
  All-in-One          Birden fazla ağ rolünü tek cihazda birleştiren yapı
  Router/Gateway      Yerel ağı internete çıkaran kapı; varsayılan çıkış noktası
  NAT                 Ağ adres çevirimi; yerel adreslerin dış ağa çıkış mantığı (kavramsal)
  Switch              Kablolu cihazları yerel ağda birbirine bağlayan işlev
  Access Point (AP)   Kablosuz erişim noktası; Wi-Fi yayını işlevi
  SSID                Wi-Fi ağ adı
  Default Gateway     Varsayılan ağ geçidi; dışarı çıkış için ilk kapı
  DHCP                Otomatik IP dağıtımı yapan mekanizma (detayı ileride)
  Double NAT          Arka arkaya iki kez NAT/gateway davranışı oluşması
  Roaming             Cihazın erişim noktaları arasında geçiş davranışı
  Interference        Parazit/kanal kalabalığı; kablosuz ortamda çakışma
  APIPA               DHCP alınamayınca oluşabilen 169.254.x.x türü adresleme durumu
  Packet Loss         Paket kaybı; bazı paketlerin ulaşmaması/cevabın gelmemesi
  Latency             Gecikme; tepki/RTT hissi
  Jitter              Gecikme oynaklığı; gecikmenin dalgalanması

## **Kendini Değerlendir (10 Soru)**

### **Soru 1**

"Wi-Fi'a bağlıyım ama internet yok" cümlesini en doğru ilk çerçeveleyen seçenek hangisidir?\
A) Wi-Fi bağlıysa internet kesin vardır\
B) Wi-Fi yerel bağlantıyı gösterir; internet için gateway ve dış çıkış ayrıca doğrulanmalıdır\
C) Sorun kesin DNS'tir\
D) Sorun kesin saldırıdır\
E) Sorun kesin kablodadır

**Doğru şık:** B\
**Gerekçe:** Wi-Fi bağlantısı yerel katmanı doğrular; internet için gateway/dış erişim kanıtı gerekir. C/D/E kanıtsız tek nedene kilitlenir.

### **Soru 2**

Hem kablolu hem kablosuz cihazlarda "internet yok" şikâyeti varsa en güçlü ilk hipotez hangisidir?\
A) Tek bir cihazın adaptörü bozuk\
B) Ortak nokta (gateway/ISP hattı/güç) kaynaklı sorun olasılığı\
C) Yanlış SSID seçilmiştir\
D) Sadece bir uygulama arızalıdır\
E) Sadece bir web sitesi çökmüştür

**Doğru şık:** B\
**Gerekçe:** Dağıtım tipinden bağımsız etkilenme, ortak noktayı güçlendirir.

### **Soru 3**

ipconfig /all çıktısında IP'nin 169.254.x.x olması en doğru neyi düşündürür?\
A) İnternet çok hızlıdır\
B) Cihaz IP alamamış olabilir; yerel ağdan adres alamama ihtimali artar\
C) DNS kesin bozulmuştur\
D) Çift NAT kesin vardır\
E) İnternet kesin çalışıyordur

**Doğru şık:** B\
**Gerekçe:** Bu desen genellikle "adres alamama/yerel katmanda tamamlanmama" sinyalidir; tek başına DNS/Double NAT kanıtı değildir.

### **Soru 4**

Bir kullanıcı "Web açılıyor ama online oyunlarda kopuyor, bazı VPN'ler bağlanmıyor" diyor. SOHO'da bu örüntü aşağıdakilerden hangisini daha çok çağrıştırır?\
A) Yanlış SSID\
B) Double NAT olasılığı\
C) Tek bir web sitesinin çökmesi\
D) Klavye sürücüsü sorunu\
E) Modemin ışığının rengi

**Doğru şık:** B\
**Gerekçe:** Bazı uygulamalarda (özellikle bağlantı kurma/oturum sürdürme) seçici sorunlar, çift gateway/NAT gibi yapısal hatalara işaret edebilir.

### **Soru 5**

Bir cihaz Default Gateway'e ping atabiliyor; ancak alan adına erişimde "host bulunamadı" hatası alıyor. En makul ilk yorum hangisidir?\
A) Fiziksel kablo kopuk\
B) DNS/isim çözümleme yönünde sorun ihtimali artar\
C) Wi-Fi şifresi yanlış\
D) Router'a ulaşamıyor\
E) Topoloji kesin ring'dir

**Doğru şık:** B\
**Gerekçe:** Gateway'e ulaşmak yerel bağlantıyı destekler; alan adının çözülememesi isim çözümleme katmanına işaret eder.

### **Soru 6**

Wi-Fi sinyali güçlü görünmesine rağmen özellikle yoğun saatlerde hız düşüyor/kopmalar artıyorsa ilk hangi sınıf olasılık güçlenir?\
A) Kanal kalabalığı/parazit\
B) Bilgisayarın ekran parlaklığı\
C) Klavyenin dili\
D) RAM kapasitesi\
E) Kablosuz ağların hiçbiri etkilenmez

**Doğru şık:** A\
**Gerekçe:** Zaman örüntüsü ve "çekiyor ama kötü" davranışı kablosuz ortam kalabalığını düşündürür.

### **Soru 7**

"Böl ve Yönet" zincirine göre aşağıdakilerden hangisi doğru sıralamadır?\
A) DNS → İnternet → Gateway → Cihaz\
B) Cihaz → Gateway → İnternet (IP) → DNS (isim)\
C) İnternet → Cihaz → DNS → Gateway\
D) Gateway → DNS → Cihaz → İnternet\
E) Hepsi aynı anlama gelir

**Doğru şık:** B\
**Gerekçe:** Teşhiste önce yerel katmanlar doğrulanır, sonra dış erişim ve en sonda isim çözümleme ayrıştırılır.

### **Soru 8**

netsh wlan show interfaces komutu sana en doğrudan hangi kanıtı sağlar?\
A) Varsayılan rotayı\
B) SSID ve bağlantı/sinyal durumunu\
C) NAT tablosunu\
D) DNS cache içeriğini\
E) Port listesini

**Doğru şık:** B\
**Gerekçe:** Bu komut Wi-Fi arayüz durumuna odaklanır; IP/gateway için farklı komutlar gerekir.

### **Soru 9**

Bir sorun giderirken "tek site açılmıyor" gözlemini hangi yaklaşım en iyi yönetir?\
A) "İnternet kesin yok" demek\
B) En az iki farklı hedefle test ederek yanlış pozitifi azaltmak\
C) Hemen fabrika ayarı\
D) Herkese şifre değiştir demek\
E) Hiç test yapmadan ISP aramak

**Doğru şık:** B\
**Gerekçe:** Tek hedef, yanlış pozitif üretir; kapsam daraltma için karşı kanıt gerekir.

### **Soru 10**

Aşağıdaki ifadelerden hangisi gözlem--yorum ayrımını doğru kurar?\
A) "Ping time-out gördüm, kesin ISP çöktü."\
B) "Ping time-out gördüm; paket kaybı olabilir veya ICMP kısıtlı olabilir, ek kanıt gerekir."\
C) "Wi-Fi bağlıysa internet vardır."\
D) "Bir uygulama çalışmıyorsa internet yoktur."\
E) "Kopma varsa kesin saldırıdır."

**Doğru şık:** B\
**Gerekçe:** Çıktı gözlemdir; neden için alternatif açıklamalar ve ek kanıt gerekir.

## **Kapanış: Bu modülde neler öğrendik?**

-   SOHO ağını tek kutu gibi değil, **rol ve akış** zinciri olarak okumayı öğrendik.

-   "Wi-Fi bağlı" ile "internet var" ayrımını katmanlı düşünmeyle netleştirdik.

-   SOHO'da sık görülen hataları (yanlış port, çift NAT, DNS, parazit/kapsama) **belirti örüntüsüyle** eşleştirdik.

-   Windows/Linux/macOS üzerinde temel komutlarla **IP + gateway + dış erişim + DNS** kanıtı toplamayı öğrendik.

-   Gözlem--yorum ayrımını koruyarak, yanlış pozitifleri azaltan **kanıta dayalı troubleshooting** refleksi kurduk.

## **MODÜL 4 --- Fiziksel Katman, Kablolama, Cihaz Rolleri**

Bu modül, ağ sorunlarının büyük kısmının başladığı yere odaklanır: **fiziksel katman** ve sahadaki "gerçek" bağlantılar. Amaç; "internet yok" gibi üst seviye bir şikâyeti önce **kablo/port/link** kanıtına indirip hızlıca daraltmak ve ağ cihazlarının rollerini (modem/ONT, router/gateway, switch, access point vb.) karıştırmadan okuyabilmektir. Kabloların türleri ve bağlantı pratikleri üzerinden, aynı arızaya giden farklı teşhis yollarını **zaman--risk--yanlış pozitif** maliyetleriyle seçmeyi öğrenirsin. RJ45 sonlandırma mantığı ve Ethernet'in kavramsal pratikleriyle "tak-çalıştır" sandığın şeylerin neden bazen çalışmadığını açıklayacak bir temel kazanırsın. Modül sonunda PoE'nin saha mantığını ve platform/GUI araçlarıyla **kanıt toplayıp yorumlama** refleksini oturtursun.

## **Modül Amaçları**

Bu modülün sonunda katılımcı:

-   Temel ağ cihazlarının rollerini (modem/ONT, router/gateway, switch, access point, NIC) **karıştırmadan** açıklar.

-   Kablo ve bağlantı türlerini (bakır/fiber/koaksiyel; kablosuzun fiziksel sinyal boyutu) temel özellikleriyle ayırt eder; hangi durumda hangisinin tercih edildiğini söyler.

-   RJ45 sonlandırma standartlarının (T568A/T568B) mantığını ve **yanlış sonlandırmanın** tipik belirtilerini (ör. split pair) kavrar.

-   Ethernet'te **link, hız/duplex, auto-negotiation** gibi kavramları kavramsal düzeyde bilir; sahadaki belirtilerle ilişkilendirir.

-   PoE'nin neyi çözdüğünü (güç + veri), PoE olmayan cihaz/port senaryolarını ve **PoE bütçesi** mantığını temel düzeyde okur.

-   Windows/Linux/macOS GUI/komutlarıyla fiziksel katman odaklı hızlı kontroller yapar; çıktıda kritik alanları seçer ve kanıt üretir.

## **Ana İçerik**

### **4.1 Ağ cihazları ve rolleri**

#### **Ne anlama gelir?**

Giriş seviyesinde en çok karışan konu şudur: **Aynı kutu farklı rolleri aynı anda oynayabilir.** Bu yüzden sorun giderme, "cihaz adı" ezberiyle değil **rol** üzerinden yapılır.

-   **Node (Düğüm):** Ağa bağlı her türlü cihaz için genel isim. Bilgisayar, yazıcı, IP kamera, akıllı priz, sunucu... hepsi birer node'dur.

-   **NIC (Network Interface Card / Ağ Adaptörü):** Uç cihazın ağa bağlandığı arayüzdür; fiziksel katmanda link sinyali buradan başlar.

-   **Hub (tarihsel):** Bir porttan aldığı veriyi ayırt etmeden tüm portlara kopyalar. Güncel ağlarda neredeyse kullanılmaz; collision (çarpışma) riskini artırır ve verimsizdir.

-   **Switch:** Yerel ağ (LAN) trafiğini yönetir; cihazların hangi porta bağlı olduğunu **MAC adresleri** üzerinden öğrenir ve trafiği çoğunlukla yalnızca ilgili porta iletir.

-   **Router / Gateway:** Farklı ağları birbirine bağlayan "kapı"dır; karar verirken **IP adresleri** üzerinden yönlendirir. Ev ağını internete çıkaran tipik çıkış noktasıdır.

-   **Modem / ONT:** Servis sağlayıcıdan gelen hattı (DSL/kablo/fiber) ev/ofis ağına taşır; sinyali "ağın anlayacağı forma" çeviren uçtur.

-   **Access Point (AP):** Kablolu ağı (Ethernet) kablosuz sinyale (Wi-Fi) çevirir; kablosuz istemcileri ağa dahil eder. (Kablosuz detayları Modül 5'te ele alınır.)

**Switch vs Router'ı hızlı ayırt etme mantığı:**

-   Switch: **LAN içinde** dağıtır, ana referansı **MAC** okuryazarlığıdır.

-   Router: **ağlar arasında** geçiş sağlar, ana referansı **IP** okuryazarlığıdır.

**İpucu (rol odaklı harita):**\
"İnternete çıkış kapısı kim?" (gateway) sorusunu yanıtlayamıyorsan, rastgele denemeler artar.\
Önce rolü bul, sonra belirtini o role bağla.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Wi-Fi çekiyor ama internet yok" → AP çalışıyor olabilir; **gateway/ISP** tarafı şüpheli.

-   "Kablolu çalışan var, Wi-Fi çalışmıyor" → switch/LAN sağlıklı; **AP/SSID** tarafı şüpheli.

-   "Sadece bu bilgisayar bağlanmıyor" → **NIC/port/kablo** veya uç cihaz durumları şüpheli.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Rol doğrulaması:** Cihazda WAN/Internet portu var mı? LAN portu var mı? Wi-Fi yayınlıyor mu? Bu somut işaretler rolü netleştirir.

-   **Kapsam doğrulaması:** Tek cihaz mı, herkes mi? Sadece Wi-Fi mı, sadece kablo mu?

-   **Katman sırası:** "Link var mı?" (Fiziksel) → "IP var mı?" (IP katmanı) sırasını bozmadan ilerle.

**Dikkat:** Aynı şikâyet farklı rollerde farklı anlama gelir.\
"İnternet yok" bazen kablo/port, bazen gateway, bazen DNS'dir. Bu modülde **önce fiziksel kanıt** toplanır.

### **4.2 Kablolar ve bağlantılar**

#### **Ne anlama gelir?**

Veri bir "yol" ister. Yolun türü ve kalitesi; hız, stabilite ve sorun desenini belirler. Aynı "bağlı görünüyor" hissinin altında farklı gerçekler olabilir: gevşek konnektör, kırık tel çifti, yanlış kablo tipi, fiber uç kirliliği, parazit etkisi vb.

**Temel bağlantı aileleri:**

-   **Twisted Pair (Bakır Ethernet kabloları):** Ev/ofiste en yaygın.

    -   **CAT5e:** Tipik kullanımda 1 Gbps sınıfında yaygındır.

    -   **CAT6 / CAT6A:** Daha yüksek hedef hızlar ve daha iyi parazit dayanımı için tercih edilir.

    -   **Saha sınırı (kavramsal):** Bakır Ethernet'te "standart mesafe" yaklaşımı çoğunlukla **100 metre** civarında düşünülür; mesafe artınca **attenuation (zayıflama)** etkisi belirginleşir.

-   **Fiber optik:** Veriyi elektrikle değil **ışıkla** taşır.

    -   **Avantaj:** Uzun mesafe, elektromanyetik parazite (EMI) yüksek bağışıklık (ör. fabrika ortamı, güçlü motorlar).

    -   **Dezavantaj:** Kırılganlık, temizlik/sonlandırma hassasiyeti.

-   **Koaksiyel:** Bazı erişim altyapılarında görülür (modem tarafı gibi).

-   **Kablosuz (radyo sinyali):** Fiziksel katmanın "sinyal" boyutuna dahildir; ayrıntı ve pratik teşhis Modül 5'te.

**İpucu (saha alışkanlığı):**\
"En hızlı kanıt" çoğu zaman gözle başlar: port ışığı, konnektör oturuşu, kablo kıvrımı/ezilme izi.\
Komuta geçmeden önce 15 saniyelik fiziksel kontrol, 15 dakikayı kurtarır.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   **Temassızlık:** "Bazen var, bazen yok" (intermittent) kopmalar; masayı oynatınca kesilme.

-   **Ezilme/hasar:** Link gelir ama hız düşer; yüksek trafikte kısa kopmalar/yeniden bağlanmalar görülebilir.

-   **Parazit (EMI):** Özellikle güç kablolarına yakın güzergâhlarda dalgalı performans.

-   **Fiber uç kirliliği:** Linkin hiç gelmemesi veya stabilite sorunları.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Karşılaştırmalı test:**

    -   Aynı port + farklı kablo → kablo şüpheli mi?

    -   Aynı kablo + farklı port → port şüpheli mi?

-   **En az müdahale ilkesi:** Fiziksel şüphe varken ağ ayarlarını "kurcalamak" yanlış maliyet doğurur.

-   **Araç kanıtı:** Basit kablo test cihazı (varsa) tel çiftleri/kopukluk gibi somut sinyal verir.

**Dikkat:** "Kablo takılı" demek "kablo sağlam" demek değildir.\
Link ışığı bazen yanar ama kalite/hız sorunları devam edebilir; link kanıtını "var/yok" değil **hız/kararlılık** ile düşün.

### **4.3 RJ45 ve sonlandırma standartları**

#### **Ne anlama gelir?**

RJ45, twisted pair Ethernet'te sık kullanılan konnektör ailesidir. Kablonun içindeki 8 telin sıralaması rastgele değildir; tel çiftleri doğru sırada taşınmalıdır.

-   **T568A / T568B:** Tel dizilim standartlarıdır.

-   **Pratikte kritik kural:** Aynı kablonun iki ucu **tutarlı** olmalıdır.

    -   İki ucu da aynı standarda göre → çoğu senaryoda "düz (straight-through/patch)" mantığı.

    -   Uçlar farklı standart → "çapraz (cross)" mantığı (tarihsel kullanım daha yaygındı).

**Split pair (kritik hata örüntüsü):**\
Renkler "doğru gibi" görünse bile tel çiftleri bozulduysa kablo kısa mesafede çalışıyor gibi görünüp hız düşürebilir, paket kaybı/yeniden iletim gibi belirtiler doğurabilir.

**Auto-MDI/MDI-X ve Auto-MDIX (kavramsal):**\
Modern cihazların önemli bir kısmı düz/çapraz kablo ayrımını otomatik tolere edebilir. Bu, "her hata tolere edilir" anlamına gelmez; sahada en sağlam yaklaşım **doğru sonlandırma + tutarlılık**tır.

**İpucu:** Standart seçimi (A mı B mi) kadar önemli olan şey **tutarlılıktır**.\
İki ucu aynı standarda göre yapmak, sahada en az sürpriz üreten yaklaşımdır.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   Yeni krimplenmiş kabloyla link gelmiyor → sonlandırma hatası olasılığı artar.

-   Link var ama hız düşüyor → split pair/temas zayıflığı gibi fiziksel kalite sorunları olabilir.

-   "Her kablo çalışıyor ama bu çalışmıyor" → önce kablo/sonlandırma rasyonel adaydır.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Kablo test cihazı** (varsa) en net kanıttır: tel sırası ve kopukluk sinyali verir.

-   **Bilinen sağlam kablo** ile karşılaştır: Aynı uç cihaz/aynı portta sağlam kablo çalışıyorsa sorunu hızla daraltırsın.

-   **Gözle kontrol:** Konnektörde tel sırası, kablonun konnektöre yeterli girişi ve çene baskısı düzgün mü?

**Dikkat:** "Tesadüfen çalışıyor" hissi tehlikelidir.\
Auto-MDIX bazı uyumsuzlukları örtebilir; ama kötü sonlandırma ileride performans/kararlılık sorununa dönüşebilir.

### **4.4 Ethernet pratikleri (kavramsal)**

#### **Ne anlama gelir?**

Ethernet'i bu modülde "konfigürasyon" olarak değil, fiziksel katmanla birleşen davranışlar olarak ele alırız:

-   **Link:** İki uç arasında fiziksel bağlantının kurulduğuna dair sinyal.

-   **Hız (Speed):** Linkin anlaştığı kapasite.

-   **Duplex:** İletişimin iki yönlü çalışma biçimi.

    -   **Half duplex:** Aynı anda tek yön (tarihsel hub dünyasında tipik).

    -   **Full duplex:** Aynı anda iki yön (modern switch dünyasında standart yaklaşım).

-   **Auto-negotiation:** Cihazların "en yüksek ortak" hız/duplex üzerinde otomatik anlaşması.

**Collision domain (kavramsal):**

-   Hub kullanılan tarihsel yapılarda aynı ortamı paylaşan cihazlar aynı anda konuşursa collision olurdu.

-   Modern switch'te her port çoğunlukla kendi "yolunu" ayırdığı için çarpışma riski dramatik biçimde azalır; pratikte her switch portu ayrı bir collision domain gibi düşünülür.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   Link var ama dosya aktarımı yavaş → link hızı beklenenden düşük anlaşmış olabilir.

-   "Bir anda 1 Gbps yerine 100 Mbps görünüyor" → auto-negotiation düşük hıza düşmüş olabilir (kablo kalitesi/temas).

-   Link ışığı yanıyor ama sık kopuyor → kablo/port kalitesi veya temas problemi.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Link hızı kanıtı:** İşletim sistemi "Link Speed" gibi bir alan gösterebilir (GUI/komut).

-   **Yöntem seçimi:**

    -   Hızlı daraltma: GUI'den link ve link hızına bak.

    -   Kesinleştirme: Komutla arayüz durumunu ve (varsa) link ayrıntılarını al; sonra kablo/port karşılaştırması yap.

**Dikkat:** Link ışığı tek başına yeterli kanıt değildir.\
Link "var" olabilir ama kalite/hız sorunları sürer. Bu yüzden link + link hızı + aralıklı kopma deseni birlikte okunur.

### **4.5 PoE --- saha mantığı**

#### **Ne anlama gelir?**

**PoE (Power over Ethernet)**, Ethernet kablosu üzerinden **veri + güç** taşımaya yarar. Sahada en çok şu problemleri çözer:

-   Tavana/duvara konulan **Access Point** gibi cihazlara ayrıca priz çekmeyi azaltır.

-   **IP kamera** ve **IP telefon** gibi cihazları tek kabloyla beslemeyi kolaylaştırır.

Temel roller:

-   **PSE:** PoE sağlayan taraf (PoE switch veya PoE enjektör).

-   **PD:** PoE alan cihaz (AP/kamera vb.).

Kritik pratik: **PoE bütçesi**. Switch'in toplam sağlayabileceği güç sınırlıdır; cihaz sayısı arttıkça bütçe yetmeyebilir.

**İpucu:** PoE sorunlarında en iyi daraltma sorusu:\
"Cihaz hiç açılıyor mu (LED/boot)?" Eğer açılmıyorsa önce **güç** tarafını ele.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   AP kabloyla bağlı görünüyor ama açılmıyor → PoE yok/yetersiz olabilir.

-   Bazı PoE cihazları çalışıyor, yenisi çalışmıyor → bütçe dolmuş olabilir.

-   PoE enjektör yanlış yere/yanlış hatta → veri varmış gibi görünüp cihaz açılmayabilir.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **PoE kanıtı:** Switch arayüzü (varsa) portun PoE verdiğini/çektiğini gösterebilir.

-   **Karşılaştırmalı test:** Bilinen PoE çalışan port/kablo ile dene.

-   **Güvenli sınır:** PoE elektrik taşır; rastgele pin müdahalesi yapma, standart ekipman kullan.

**Dikkat:** "Link var" ≠ "Güç var".\
PoE'siz bir port, ağı "var gibi" gösterse bile cihazı çalıştırmayabilir.

### **4.6 Platform/GUI araç okuryazarlığı**

#### **Ne anlama gelir?**

GUI araçları "kolay yol" değil, **hızlı kanıt toplama** yöntemidir. Fiziksel katman sorunlarında GUI genelde şu bilgileri hızlı verir:

-   Adaptör etkin mi? (Enabled/Disabled)

-   Link var mı?

-   Link hızı (gösteriliyorsa)

-   Hata işareti var mı (sürücü/donanım)?

**Windows:**

-   **Ağ Bağlantıları:** Bağlı/bağlı değil, etkin/devre dışı.

-   **Aygıt Yöneticisi:** Ağ bağdaştırıcısında uyarı işareti var mı? Sürücü/donanım problemi olabilir.

**macOS:**

-   Ağ ayarlarında arayüz durumları bazen "bağlı / IP alamıyor / kablo yok" gibi sinyallerle gösterilebilir (renkli durum mantığı farklı sürümlerde değişebilir; önemli olan **hangi katmanda takıldığı**: link mi, IP mi?).

**Linux:**

-   NetworkManager arayüzleri bağlantı/arayüz durumunu hızlı özetler.

**İpucu (kanıt standardı):**\
"Ethernet bağlı görünüyor, link hızı X" = gözlem.\
"Kablo bozuk" = yorum. Yorum, ek kanıt ister (kablo/port değişimi gibi).

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   Kullanıcı "kablo takılı" der, GUI "Disconnected" gösterir → fiziksel katman önceliklidir.

-   GUI "Disabled" gösterir → sorun kablo değil, arayüz kapalı olabilir.

-   Beklenen ethernet yerine Wi-Fi üzerinden test yapılıyorsa → yanlış arayüz hatası.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   GUI ile hızlı kontrol yap; gerekiyorsa komutla kesinleştir.

-   "Doğru arayüz mü?" sorusunu ilk 30 saniyede netleştir.

### **4.7 Temel ağ teşhis araçları (hızlı kontrol)**

#### **Ne anlama gelir?**

Bu bölüm, fiziksel katmanı doğrulamak için en sık kullanılan **hızlı ve düşük riskli** araçları toplar. Amaç saldırı/keşif değil; tamamen **yerel ve güvenli teşhis**.

**Hızlı kanıt kaynakları:**

-   **Port LED'leri (link/activity):** En hızlı fiziksel sinyal.

-   **Kablo/port değişimi:** "Böl ve yönet"in pratik hali.

-   **OS komutlarıyla arayüz durumu:** Up/down, link ipuçları, doğru arayüz seçimi.

**Dikkat (yöntem seçimi):**\
Aynı teşhise iki yoldan gidebilirsin:\
**Hızlı yol:** LED + GUI + kablo/port değişimi.\
**Kesin yol:** Komutla arayüz/link kanıtı + karşılaştırmalı test.\
Zaman kısıtlıysa hızlı yol; tekrar eden sorunlarda kesin yol daha değerlidir.

#### **Komut & araç okuryazarlığı (güvenli, yerel)**

Aşağıdaki komutlar **yalnızca kendi/izinli cihazında**, teşhis/doğrulama içindir:

**Windows**

-   **Komut:** ipconfig /all

    -   **Amaç:** Adaptör var mı, fiziksel bağlantı ipucu var mı?

    -   **Beklenen çıktı türü:** Adaptör listesi, "Media State" gibi alanlar

    -   **Yorum ipucu:** "Media disconnected" → link yok olabilir (kablo/port).

    -   **Güvenli sınır:** Yerel görüntüleme.

-   **Komut:** netsh interface show interface

    -   **Amaç:** Arayüz etkin mi ve bağlı mı?

    -   **Beklenen çıktı türü:** Enabled/Connected benzeri durum satırları

    -   **Yorum ipucu:** Arayüz "disabled" ise kablo değiştirmek erken hamledir; önce arayüzü etkinleştir.

    -   **Güvenli sınır:** Yerel görüntüleme.

**Linux**

-   **Komut:** ip link

    -   **Amaç:** Arayüz etkin mi, link ipucu var mı?

    -   **Beklenen çıktı türü:** UP/DOWN ve bazı sistemlerde linki işaret eden bayraklar

    -   **Yorum ipucu:** Arayüz DOWN ise arayüz kapalı olabilir; "aktif ama link yok" deseni ayrıca kanıt ister (LED/port değişimi).

    -   **Güvenli sınır:** Yerel görüntüleme.

-   **Komut (varsa):** ethtool \<arayüz_adı\>

    -   **Amaç:** Link algısı ve hız/duplex gibi özetler (cihaza göre).

    -   **Beklenen çıktı türü:** "Link detected", hız bilgisi vb.

    -   **Yorum ipucu:** Link yoksa fiziksel katman güçlenir; link var ama hız düşükse kablo/port kalitesi düşün.

    -   **Güvenli sınır:** Yerel görüntüleme.

**macOS**

-   **Komut:** ifconfig

    -   **Amaç:** Arayüzleri ve durum ipuçlarını görmek

    -   **Beklenen çıktı türü:** Arayüz listesi ve status benzeri alanlar

    -   **Yorum ipucu:** Yanlış arayüzü incelemek yaygın hatadır; ethernet mi Wi-Fi mı netleştir.

    -   **Güvenli sınır:** Yerel görüntüleme.

-   **Komut:** networksetup -listallhardwareports

    -   **Amaç:** Donanım portu ↔ arayüz adı eşleşmesini görmek

    -   **Beklenen çıktı türü:** Hardware Port ↔ Device

    -   **Yorum ipucu:** "Hangi arayüz gerçek ethernet?" sorusunu netleştirir.

    -   **Güvenli sınır:** Yerel görüntüleme.

**Kavramsal "rota/gateway" hatırlatması (tek cümle köprü):**\
Fiziksel link sağlamsa ama hâlâ "dışarı çıkamıyorum" deseni varsa, bir sonraki adım genelde "çıkış kapısı (gateway) ve IP/DNS akışı"dır; bunlar Modül 10'da sistematikleşir.

#### **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Belirti:** Ofiste bir kullanıcı "İnternetim çok yavaş, dosya kopyalarken bekliyorum" diyor. Kesinti yok, sadece performans düşük. Cihaz ve switch portu "gigabit sınıfı" olmalı.

**Olasılık:**

-   Ağ yoğunluğu olabilir **ama** fiziksel katmanda **auto-negotiation** düşük hıza düşmüş olabilir (kablo/temas).

**Doğrulama (güvenli):**

1.  **GUI kanıtı:** Ağ bağlantısı ayrıntılarında **Link Speed** değerine bakılır.

2.  **Gözlem:** Link Speed beklenenin altında görünür (ör. "1 Gbps" beklenirken daha düşük).

3.  **Karşı kanıt arama:**

    a.  Aynı portta farklı (bilinen sağlam) patch kablo ile dene.

    b.  Aynı kablo ile farklı port dene.

4.  **Sonuç:** Kablo değişiminden sonra hız normale dönüyorsa, "yavaşlık" şikâyeti fiziksel katmandaki kablo/temas kalitesiyle tutarlıdır.

**Kısa rapor notu (Bulgu → Etki → Öneri → Kanıt):**

-   **Bulgu:** Link hızı beklenenin altında; kablo değişimiyle normale dönüyor.

-   **Etki:** Dosya aktarımı ve genel performans düşüyor.

-   **Öneri:** Patch kabloyu değiştir; kablo güzergâhını ezilme/gevşek konnektör açısından kontrol et.

-   **Kanıt:** Link Speed gözlemi + karşılaştırmalı test sonucu.

## **Terimler Sözlüğü (Glossary)**

  **Terim**           **Türkçe karşılığı / açıklama**
  ------------------- ---------------------------------------------------------------------------
  Physical Layer      Fiziksel katman; kablo/port/sinyal düzeyi
  Node                Ağa bağlı her cihaz için genel ad (düğüm)
  NIC                 Ağ adaptörü; cihazın ağa bağlandığı arayüz
  Hub                 Tarihsel cihaz; trafiği ayırt etmeden kopyalar, collision riskini artırır
  Switch              LAN içinde trafiği yönetir; MAC temelli iletim mantığı
  Router / Gateway    Ağlar arası geçiş/çıkış kapısı; IP temelli yönlendirme
  Modem / ONT         Servis sağlayıcı hattını ev/ofis ağına taşır; sinyal dönüştürme ucu
  Access Point (AP)   Kablolu ağı kablosuza taşır; Wi-Fi erişim noktası
  RJ45                Twisted pair Ethernet'te yaygın konnektör ailesi
  T568A / T568B       RJ45 tel dizilim standartları
  Split pair          Tel çiftleri bozulmuş sonlandırma; hız/kararlılık sorununa yol açabilir
  Link                Fiziksel bağlantı sinyali; "bağlılık" kanıtı
  Auto-negotiation    Cihazların hız/duplex üzerinde otomatik anlaşması
  Duplex              İletişimin iki yönlü çalışma biçimi (half/full kavramsal)
  Collision domain    Çarpışma alanı; hub dünyasında geniş, switch'te port bazlı daralır
  PoE                 Ethernet üzerinden güç + veri taşıma
  PSE / PD            PoE veren taraf / PoE alan cihaz
  EMI                 Elektromanyetik parazit; elektriksel gürültü etkisi
  Attenuation         Zayıflama; mesafe arttıkça sinyal gücünün düşmesi
  Intermittent        Aralıklı; bazen olup bazen olmayan arıza deseni

## **Kendini Değerlendir (10 Soru)**

### **Soru 1**

Bir kullanıcı "Wi-Fi çalışıyor ama kablolu PC bağlanmıyor" diyor. En doğru ilk adım hangisidir?\
A) DNS ayarlarını değiştirmek\
B) Kablolu tarafta link kanıtı toplamak (LED + arayüz durumu)\
C) Uzak bir alan adını pinglemek\
D) Uygulamayı yeniden kurmak\
E) Modemi fabrika ayarına döndürmek

**Doğru şık:** B\
**Gerekçe:** Sorun kablolu tarafta lokalize görünüyor; önce fiziksel link kanıtı toplanır. Diğer şıklar üst katmana sıçrama veya yüksek maliyetli müdahaledir.

### **Soru 2**

Windows'ta ipconfig /all çıktısında "Media disconnected" benzeri ifade görüyorsun. En doğru yorum hangisidir?\
A) DNS kesin bozuk\
B) Fiziksel link yok olabilir (kablo/port/NIC tarafı)\
C) Çift NAT vardır\
D) İnternet servis sağlayıcı kesin çökmüş\
E) Uygulama hatasıdır

**Doğru şık:** B\
**Gerekçe:** Bu ifade fiziksel bağlantı katmanına işaret eder. A/C/D/E kanıtla uyumsuz veya erken hüküm içerir.

### **Soru 3**

RJ45 sonlandırmada "asıl kritik" kural hangisidir?\
A) Her zaman T568B seçmek zorunludur\
B) İki uçta tel diziliminin tutarlı olması ve doğru sonlandırma yapılması\
C) Kabloyu olabildiğince kıvırmak\
D) Konnektörü bantlamak\
E) Sadece renklerin "benzer" görünmesi yeterlidir

**Doğru şık:** B\
**Gerekçe:** Standart seçimi kadar iki uçta tutarlılık ve temas kalitesi kritiktir. Diğerleri sahada güvenilir kanıt üretmez.

### **Soru 4**

"Link var ama hız düşük; büyük dosyada belirgin yavaşlık var" deseninde en makul ilk hipotez hangisidir?\
A) Tarayıcı önbelleği dolu\
B) Auto-negotiation düşük hıza düşmüş olabilir; kablo/temas kalitesi şüpheli\
C) DNS yanlıştır\
D) IP çakışması kesin vardır\
E) Kablosuz parazit sorunudur

**Doğru şık:** B\
**Gerekçe:** Kablolu link var ama hız düşükse fiziksel kalite ve anlaşma (negotiation) güçlü adaydır. C/D/E başka kanıt desenleri gerektirir.

### **Soru 5**

PoE ile ilgili hangisi doğrudur?\
A) Link ışığı yanıyorsa PoE mutlaka vardır\
B) PoE, Ethernet üzerinden güç + veri taşıyabilir; PoE yoksa cihaz açılmayabilir\
C) PoE sadece Wi-Fi hızını artırır\
D) PoE DNS sorunlarını çözer\
E) PoE, modem yerine geçer

**Doğru şık:** B\
**Gerekçe:** PoE'nin işi güç taşımaktır. A yanlıştır (link ≠ güç). C/D/E kavramsal olarak alakasızdır.

### **Soru 6**

PoE switch'te bazı PoE cihazları çalışıyor, yeni eklenen cihaz hiç açılmıyor. En doğru ilk kontrol hangisidir?\
A) Alan adı çözümlemesi\
B) PoE bütçesi ve ilgili portun PoE sağlama durumu\
C) Uygulamayı yeniden kurmak\
D) Uzak hedefe traceroute atmak\
E) Wi-Fi kanalını değiştirmek

**Doğru şık:** B\
**Gerekçe:** "Hiç açılmıyor" güç/PoE tarafını öne çıkarır; bütçe ve port desteği ilk kanıttır.

### **Soru 7**

Switch ve router arasındaki farkı en doğru özetleyen seçenek hangisidir?\
A) Switch internete çıkarır, router çıkaramaz\
B) Switch LAN içinde MAC mantığıyla dağıtır; router ağlar arasında IP mantığıyla yönlendirir\
C) Router sadece kablosuz, switch sadece kablolu çalışır\
D) Aralarında pratikte hiçbir fark yoktur\
E) Switch sadece evde, router sadece ofiste kullanılır

**Doğru şık:** B\
**Gerekçe:** Temel ayrım, çalışma kapsamı (LAN içi vs ağlar arası) ve referans adresleme mantığıdır (MAC vs IP). Diğerleri yanlış genellemedir.

### **Soru 8**

"Split pair" hatası için en doğru değerlendirme hangisidir?\
A) Kablo hiç çalışmaz; link asla gelmez\
B) Kablo bazen çalışıyor gibi görünebilir ama hız/kararlılık sorunları doğurabilir\
C) Sadece Wi-Fi'yi etkiler\
D) DNS'i bozar\
E) Sadece modem arızasında görülür

**Doğru şık:** B\
**Gerekçe:** Split pair, "çalışıyor gibi" görünüp performansı düşürebilir. A/C/D/E hatalıdır.

### **Soru 9**

Bakır Ethernet kablolarında saha okuryazarlığı için "mesafe arttıkça sorun riski artar" yaklaşımı en çok hangi kavramla ilişkilidir?\
A) Encryption\
B) Attenuation (zayıflama)\
C) NAT\
D) Caching\
E) Roaming

**Doğru şık:** B\
**Gerekçe:** Mesafe arttıkça sinyal zayıflaması (attenuation) belirginleşir; fiziksel katman temalı bir kavramdır.

### **Soru 10**

Aşağıdaki ifadelerden hangisi gözlem--yorum ayrımını doğru uygular?\
A) "LED yanmıyor, kesin router bozuk."\
B) "Arayüz bağlı değil görünüyor; link oluşmadığı için kablo/port/NIC tarafında ek kanıt toplayacağım."\
C) "Kablolu yavaş, kesin saldırı var."\
D) "PoE cihaz açılmıyor, kesin DNS bozuk."\
E) "RJ45 kullanıyorum, o zaman sorun olamaz."

**Doğru şık:** B\
**Gerekçe:** B, gözlemi net tutar ve yorumunu kanıta bağlar. Diğerleri kanıtsız kesin hüküm veya yanlış genellemedir.

## **Bu modülde neler öğrendik?**

-   Ağ cihazlarını isimle değil **rol** ile okumayı (node, NIC, switch, router/gateway, modem/ONT, AP).

-   Sorun daraltmayı fiziksel katmanda **kablo/port/link** kanıtıyla başlatmayı.

-   Bakır/fiber/koaksiyel gibi bağlantı türlerinin sahadaki farklarını; mesafe/parazit (EMI) etkilerini.

-   RJ45 sonlandırmada T568A/T568B mantığını ve **split pair** gibi hataların tipik belirtilerini.

-   Ethernet'te link/hız/duplex/auto-negotiation kavramlarını ve performans şikâyetleriyle ilişkilendirmeyi.

-   PoE'de "link ≠ güç" ayrımını, PSE/PD ve PoE bütçesi mantığını.

-   GUI ve komutlarla hızlı, güvenli, yerel doğrulama yapmayı ve **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** ile notlamayı.

## **MODÜL 5 --- Kablosuz Teknolojiler: Temel Okuryazarlık + Yeni Nesil Farkındalık**

Kablosuz bağlantı, "çekiyor/çekmiyor" ikiliğinden çok daha fazlasıdır: performans; **sinyal**, **kanal/bant**, **cihaz yeteneği** ve **ortam gürültüsü/paraziti** arasında bir dengedir. Bu modül, Wi-Fi'nin (802.11 ailesi) evrimini "hangi nesil hangi saha problemine cevap vermek için çıktı?" mantığıyla okutarak, hız düşüşlerini ezberle değil **kanıtla** açıklayabilmeni hedefler. Wi-Fi 7'ye kısa bir ufuk notu ile bakar, "etiket" ile "gerçek koşullar" arasındaki farkı ayırt etmeyi öğrenirsin. PAN yaklaşımıyla (Bluetooth/BLE, NFC vb.) Wi-Fi'nin karıştırıldığı senaryolarda doğru katmanı seçersin. Tüm modül boyunca prensip nettir: **izinli/yerel bağlam**, **düşük riskli yöntem**, **kanıt standardında not** (gözlem--yorum ayrımı).

## **Modül Amaçları**

Bu modülün sonunda katılımcı:

-   802.11 evrimini (b/g/n/ac/ax, 6E, 7) "hangi gelişme hangi probleme cevap?" mantığıyla açıklar.

-   Kablosuz performansı etkileyen sinyalleri (RSSI, Noise, SNR, band/kanal, kanal genişliği, link/PHY rate, BSSID) okuyup "neyi doğrular/neyi çürütür?" yaklaşımı kurar.

-   Wi-Fi 7'yi **destek zinciri** (istemci + erişim noktası + bant/kanal koşulları + ortam) üzerinden gerçekçi değerlendirir.

-   PAN teknolojilerini (Bluetooth/BLE, NFC vb.) tanır; Wi-Fi ile karışan arızalarda doğru teşhis hattını seçer.

-   Windows/Linux/macOS üzerinde **GUI + güvenli komutlarla** kablosuz durumu okuyup kritik alanları kanıt olarak kaydeder.

-   Basit kablosuz arızalarda yöntemi **zaman--karmaşıklık--yanlış pozitif** maliyetiyle seçip white-hat sınırını korur.

## **Ana içerik**

### **5.1 802.11 evrimi**

**Ne anlama gelir?**\
802.11, Wi-Fi'nin standart ailesidir. "Wi-Fi 5/6/6E/7" gibi isimler, kullanıcı dostu nesil etiketleridir; asıl okuma şu soruyla yapılır: **Bu nesil sahada neyi iyileştirdi?**\
Giriş seviyesinde ezber hedefi yok; aşağıdaki eksenler yeterli:

-   **Bantlar (2.4 / 5 / 6 GHz)**

    -   **2.4 GHz**: Daha iyi duvar geçişi/menzil eğilimi; ancak daha kalabalık ve parazite açık (Bluetooth, bazı IoT, mikrodalga vb. etkileyebilir).

    -   **5 GHz**: Daha yüksek kapasite/hız; duvar/mesafe etkisi daha belirgin olabilir (aynı odada harika, iki duvar sonra keskin düşüş görülebilir).

    -   **6 GHz**: Daha "ferah" kanal alanı hedefi; fakat daha yüksek frekans olduğu için kapsama/duvar hassasiyeti artabilir. 6 GHz erişimi pratikte **Wi-Fi 6E ile** yaygınlaştı; hem erişim noktası hem istemci desteği gerekir.

-   **Kanal genişliği (20/40/80/160 ve yeni nesilde daha geniş seçenekler)**\
    Geniş kanal teorik olarak daha yüksek kapasite demektir; ama ortam kalabalıksa geniş kanal "daha çok çakışma" anlamına da gelebilir (yanlış pozitif hız beklentisi üretir).

-   **Cihaz yeteneği (anten sayısı, desteklenen nesil/bant, sürücü kalitesi, güç tasarrufu)**\
    Aynı SSID'de bir cihaz çok hızlıyken diğeri yavaşsa, çoğu zaman fark **istemci yeteneğidir**.

**İpucu (ezbersiz hafıza):** "En yüksek hız" yerine önce şunu sor: *Benim problemim hız mı, kapasite mi, kapsama mı, kararlılık mı?* Aynı evde çoğu zaman "tepe hız" değil, **istikrar + düşük gecikme** daha kıymetlidir.

**Gerçek hayatta belirtisi/örneği nedir?**

-   2.4 GHz'te "çekiyor" görünür ama akşam saatlerinde dalgalanır → **kalabalık/parazit** olasılığı artar.

-   5 GHz'te aynı odada çok hızlıdır; 1--2 duvar sonra hız keskin düşer → **frekans fiziği**.

-   Yeni router alındı ama eski laptopta fark az → **istemci adaptörü sınırlı** olabilir.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Doğrulama 1:** Hangi bantta bağlıyım (2.4/5/6)?

-   **Doğrulama 2:** Link/PHY rate o an ne? (İnternet hızı değildir; ama sinyal/koşul ipucu verir.)

-   **Karşı kanıt:** Aynı noktada başka cihazla karşılaştır → sorun **tek cihaz mı** yoksa **ortam mı**?

**Dikkat:** "İnternet yavaş" şikâyeti her zaman Wi-Fi değildir. Bu modülde önce **kablosuz kanıt** (band/kanal/RSSI/SNR/link) toplanır. IP/DNS tarafı ilerleyen modüllerde sistematikleşir.

### **5.2 Wi-Fi 7 ve ufuk notu**

**Ne anlama gelir?**\
Wi-Fi 7 (802.11be) pratikte iki hedefe odaklanır: **daha yüksek kapasite** ve **daha düşük gecikme** (özellikle yoğun kullanımda) + uygun koşullarda daha yüksek tepe performans. Bunun en kritik okuma biçimi "etiket" değil, **destek zinciridir**:

-   İstemci (telefon/laptop) destekliyor mu?

-   Erişim noktası (AP/router) destekliyor mu?

-   Uygun bant/kanal koşulları var mı?

-   Ortam (duvar/mesafe/kalabalık/parazit) uygun mu?

Wi-Fi 7 için sık duyacağın kavramlardan biri **MLO (Multi-Link Operation)**'dır: cihazların birden fazla bağlantıyı daha akıllı kullanarak kararlılık/gecikme açısından kazanım hedeflemesi.\
Ayrıca daha geniş kanal seçenekleri (uygun regülasyon ve donanım koşullarında) ve verimlilik iyileştirmeleri konuşulur.

**İpucu (beklenti yönetimi):** "Wi-Fi 7 aldım, her yerde uçmalı" beklentisi yanlıştır. Gerçek performans çoğu zaman **istemci + AP + mesafe/duvar + kalabalık** toplamıdır.

**Ufuk notu (çok kısa):** Wi-Fi ekosisteminde bir sonraki nesil üzerine çalışmaların odağı, sadece hız değil **daha yüksek güvenilirlik/istikrar** hedefleri olabilir. (Saha açısından anlamı: kablosuzun "daha az sürpriz" üretmesi.)

**Gerçek hayatta belirtisi/örneği nedir?**

-   Yeni router kuruldu ama eski cihazlarda fark az → istemci yeteneği zinciri kırıyor.

-   Aynı SSID, iki odada çok farklı hız → nesil ne olursa olsun **fizik** baskındır.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   İstemci yeteneğini OS üzerinden doğrula (desteklenen standartlar/bantlar).

-   Bağlantı ayrıntılarını kaydet (band/kanal/RSSI/link).

-   Karşı kanıt: Aynı noktada Wi-Fi 7 destekli olduğu bilinen başka cihazla kısa karşılaştırma.

**Dikkat:** "Wi-Fi 7 yazıyor" tek başına teşhis değildir. Sorunun kablosuzdan kaynaklandığı varsayılmaz; önce **sinyal ve bağlantı ayrıntıları** toplanır.

### **5.3 PAN yaklaşımı**

**Ne anlama gelir?**\
PAN (Personal Area Network / Kişisel Alan Ağı), çok kısa menzilde cihazların birbirine bağlanması yaklaşımıdır. Troubleshooting'te kritiktir; çünkü bazı şikâyetler Wi-Fi değil **Bluetooth/NFC gibi PAN katmanındadır**.

Giriş seviyesinde en sık karşılaşılanlar:

-   **Bluetooth / BLE:** kulaklık, saat, sensör, bazı IoT kurulumları

-   **NFC:** "dokun-tetikle" (temassız ödeme/kimlik doğrulama)

-   **Zigbee/Thread (akıllı ev ekosistemleri):** Wi-Fi yerine düşük güç/mesh yaklaşımı (saha farkındalığı düzeyi)

-   **UWB (ufuk):** yakın mesafe konumlama/anahtarsız erişim senaryoları

**Gerçek hayatta belirtisi/örneği nedir?**

-   Kulaklık odadan odaya giderken kopuyor → çoğunlukla Wi-Fi değil **Bluetooth menzil/engel**.

-   IoT kurulumunda "yakındaki cihaz bulunamadı" → Wi-Fi'den önce **Bluetooth/izin/menzil** olasılığı.

**İpucu (hızlı ayrım sorusu):** "Bu cihaz internete **Wi-Fi ile mi** bağlı, yoksa telefonla **Bluetooth üzerinden mi** konuşuyor?" Cevap, doğru teşhis hattını seçtirir.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   Bağlantı türünü doğrula: uygulama/cihaz ekranında Wi-Fi mi PAN mi netleştir.

-   Kapsamı doğrula: sorun sadece PAN cihazlarında mı, Wi-Fi cihazlarında da mı?

-   Karşı kanıt: aynı PAN cihazını aynı ortamda başka telefonla dene (tek telefon/tek cihaz etkisi).

**Dikkat:** PAN sorunlarını Wi-Fi ayarlarını rastgele değiştirerek çözmeye çalışma. Önce bağlantı türünü ve desenini kanıtla; yanlış katmanda zaman kaybedersin.

### **5.4 Kablosuz teşhis araçları**

**Ne anlama gelir?**\
Kablosuzda "görünmeyen" şeyler performansı belirler: sinyal seviyesi, gürültü, kanal/bant, aynı SSID altında hangi AP'ye bağlandığın (BSSID), ortam kalabalığı ve link pazarlığı. Giriş seviyesinde hedef: **şans denemek değil, görünmeyeni görünür kılmak**.

Temel göstergeler:

-   **RSSI (dBm):** sinyal gücü (ör. -30 çok güçlü, -80 zayıf).

-   **Noise:** ortam gürültüsü (tek başına değil, RSSI ile birlikte okunur).

-   **SNR:** sinyal--gürültü oranı (kaliteyi daha doğru anlatır).

-   **Band/Channel & kanal genişliği:** ortam/çakışma yorumunu güçlendirir.

-   **Link/PHY rate:** internet hızı değildir; bağlantının o anki pazarlığıdır.

-   **SSID/BSSID:** aynı isimli ağda hangi AP'ye "yapıştığını" anlamak için.

2.4 GHz kanal okuryazarlığı (giriş seviyesi pratik):

-   2.4 GHz'te 20 MHz kanal genişliğinde, pratikte en az çakışan klasik seçimler **1 / 6 / 11**'dir.

**Dikkat:** Tek ölçümle hüküm verme. Kablosuz değişkendir; aynı yerde kısa aralıklarla değerler oynayabilir. "Kanıt" için mini kayıt tut: **zaman + konum + band/kanal + RSSI/Noise + link rate**.

**Gerçek hayatta belirtisi/örneği nedir?**

-   "Çekiyor ama video donuyor" → RSSI orta görünse bile **Noise yüksek** olabilir (SNR kötü).

-   "Kapıdan geçince hız uçtu" → band değişimi veya AP seçimi değişmiş olabilir.

-   "Bir odada herkes yavaş" → o bölgede kanal kalabalığı/parazit/mesafe kanıtı aranır.

**Nasıl doğrularım/çürütürüm? (güvenli)**

-   Hızlı doğrulama: OS Wi-Fi ayrıntılarından band/kanal/RSSI/link'i gör ve kaydet.

-   Karşılaştırmalı test: aynı noktada iki cihazla bak → tek cihaz mı, ortam mı?

-   Yöntem seçimi:

    -   **Hızlı düşük risk:** 1--2 metre yer değiştir, kapı/duvar etkisini test et; mümkünse band karşılaştır.

    -   **Daha net:** analiz aracıyla kanal kalabalığını ve BSSID/AP seçimini gör.

#### **Komut & Araç Okuryazarlığı (güvenli, yerel)**

Aşağıdaki komutlar **sadece kendi/izinli ortamında**, yalnızca **okuma/kanıt toplama** içindir.

**Windows**

-   netsh wlan show interfaces

    -   **Amaç:** SSID/BSSID, Signal, Radio type, Channel gibi kanıtları görmek.

    -   **Beklenen çıktı:** SSID, BSSID, Signal, Radio type, Channel alanları.

    -   **Yorum ipucu:** Signal kalıcı düşükse kapsama/engel; Channel/Band bilgisi ortam yorumunu güçlendirir.

    -   **Güvenli sınır:** Yerel görüntüleme.

-   netsh wlan show drivers

    -   **Amaç:** Adaptörün yetenekleri (desteklediği modlar/bantlar) ve sürücü bilgisi.

    -   **Beklenen çıktı:** desteklenen standart/özellik satırları, sürücü sürümü.

    -   **Yorum ipucu:** İstemci sınırlıysa "router değişti ama hız artmadı" açıklanır.

    -   **Güvenli sınır:** Yerel görüntüleme.

**Linux (NetworkManager olan sistemler)**

-   nmcli dev wifi

    -   **Amaç:** görülen ağlar, SIGNAL, CHAN gibi özetler.

    -   **Beklenen çıktı:** SSID, SIGNAL, CHAN sütunları (dağıtıma göre değişir).

    -   **Yorum ipucu:** Ortam kalabalığı ve kanal çakışması hakkında hızlı sinyal verir.

    -   **Güvenli sınır:** Yerel/izinli ortam.

-   iw dev \<arayüz\> link

    -   **Amaç:** bağlı olduğun BSSID, sinyal (dBm), bitrate gibi ayrıntılar.

    -   **Beklenen çıktı:** "Connected to ...", "signal: -xx dBm", "tx bitrate ..." benzeri satırlar.

    -   **Yorum ipucu:** RSSI iyi ama bitrate dalgalıysa ortam/kalabalık veya güç tasarrufu/sürücü etkisi düşün.

    -   **Güvenli sınır:** Yerel görüntüleme.

**macOS**

-   GUI yöntemi: **Option (Alt) basılıyken Wi-Fi simgesine tıkla**

    -   **Amaç:** RSSI, Noise, Tx Rate, Channel gibi detayları hızlı görmek.

    -   **Yorum ipucu:** RSSI ve Noise birlikte okunur; SNR düştükçe stabilite bozulabilir.

-   system_profiler SPAirPortDataType

    -   **Amaç:** kablosuz donanım ve bağlantı özet raporu.

    -   **Beklenen çıktı:** arayüz ve bağlantı bilgileri (format macOS sürümüne göre değişebilir).

    -   **Yorum ipucu:** band/kanal/RSSI benzeri alanlar varsa kanıt defterine not et.

    -   **Güvenli sınır:** Yerel görüntüleme.

**Dikkat (white-hat sınırı):** Bu modülde araçlar "gör ve yorumla" içindir. Yetkisiz dinleme, saldırı/istismar, agresif denemeler yok. Daha ileri trafik analizi yaklaşımı kademeli olarak sonraki modüllerde ele alınır.

#### **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Belirti:** Aynı SSID'ye bağlı iki cihaz var. Telefon görüntülü görüşmede takılıyor; laptop aynı odada daha iyi. Kullanıcı "Wi-Fi çekiyor ama olmuyor" diyor.

**Olasılık (katmanlı düşünme):**

-   Kablosuz katmanda: telefon farklı band/kanalda olabilir; RSSI/Noise nedeniyle SNR kötü olabilir; telefon "yanlış AP'ye yapışmış" olabilir.

-   Cihaz katmanında: telefon anten/güç tasarrufu/sürücü etkisi farklı olabilir.

**Doğrulama (güvenli):**

1.  **Aynı noktada kanıt topla**

-   Telefonda Wi-Fi ayrıntılarından band/kanal/sinyal bilgisi (GUI)

-   Laptopta netsh wlan show interfaces ile SSID/BSSID/Signal/Channel notu

2.  **Karşılaştır**

-   Aynı bandda mılar (2.4 vs 5)?

-   Aynı SSID'ye rağmen BSSID farklı mı? (çoklu AP/mesh etkisi)

3.  **Karşı kanıt üret**

-   Telefonu 1--2 metre farklı noktada dene: anlamlı değişim var mı?

-   Mümkünse kısa süre band karşılaştır: takılma azalıyor mu?

**Sonuç (kanıta dayalı):**\
Telefonun RSSI/Noise/SNR göstergeleri laptopa göre belirgin kötü veya farklı AP/band seçimi varsa, sorun "Wi-Fi var/yok" değil **kablosuz kalite + istemci farkı** olarak çerçevelenir.

**Bulgu → Etki → Öneri → Kanıt (rapor formatı)** kısa not:

-   **Bulgu:** Telefonun band/kanal/BSSID/RSSI(ve varsa Noise) değerleri laptopa göre dezavantajlı.

-   **Etki:** Görüşmede gecikme ve takılma.

-   **Öneri:** En düşük riskli adımlarla (konum/engel farkındalığı, uygun band tercihi, mümkünse daha uygun AP'ye yönlenme) kaliteyi iyileştir.

-   **Kanıt:** GUI/komut çıktısı + aynı noktadaki karşılaştırma notları.

## **Terimler Sözlüğü (Glossary)**

  **Terim**              **Türkçe karşılığı / açıklama**
  ---------------------- -------------------------------------------------------------------------------
  802.11                 Wi-Fi standart ailesi
  Band                   Frekans bandı (2.4/5/6 GHz gibi)
  Channel                Band içindeki kanal (frekans dilimi)
  Channel width          Kanal genişliği (20/40/80/160... MHz)
  SSID                   Kablosuz ağ adı
  BSSID                  Yayını yapan erişim noktasının kimliği (aynı SSID altında farklı AP olabilir)
  RSSI                   Alınan sinyal gücü göstergesi (genelde dBm)
  Noise                  Kablosuz ortamın gürültü seviyesi
  SNR                    Sinyal--gürültü oranı (kalite göstergesi)
  PHY rate / Link rate   Bağlantının o an anlaştığı fiziksel hız (internet hızı değildir)
  Interference           Parazit/çakışma; komşu ağlar ve cihazlar nedeniyle kalite düşüşü
  Roaming                Cihazın erişim noktaları arasında geçiş yapması
  Sticky client          Cihazın daha iyi AP varken eskisine "yapışması"
  MIMO / MU-MIMO         Çoklu antenle verimlilik teknikleri (kavramsal)
  MLO                    Multi-Link Operation; çoklu bağlantıyı daha akıllı kullanma yaklaşımı
  PAN                    Personal Area Network; kısa menzilli kişisel cihaz bağlantıları
  BLE                    Bluetooth Low Energy; düşük güç Bluetooth yaklaşımı
  NFC                    Near Field Communication; çok kısa menzilli "dokun-tetikle" iletişim

## **Kendini Değerlendir**

**Soru 1**\
Aynı odada iki ölçüm aldın:

-   Ölçüm A: RSSI −55 dBm, Noise −70 dBm

-   Ölçüm B: RSSI −65 dBm, Noise −90 dBm\
    Video görüşmesi takılıyor. Hangisi kalite açısından daha olumsuz bir tabloya işaret eder?\
    A) A, çünkü RSSI daha iyi görünüyor\
    B) A, çünkü SNR daha düşük olma eğiliminde\
    C) B, çünkü RSSI daha kötü\
    D) B, çünkü Noise daha düşük\
    E) İkisi de aynıdır, RSSI tek başına yeterlidir

**Doğru şık: B**\
**Gerekçe:** A'da gürültü daha yüksek olduğundan SNR düşebilir; "çekiyor" görünse bile kalite bozulur. C tek başına RSSI'ye yaslanır; D noise'un düşük olmasını yanlış yorumlar; E hatalıdır.

**Soru 2**\
"Router'ı Wi-Fi 7 aldım ama telefonda hız artmadı" şikâyetinde, ilk doğrulama hattı hangisidir?\
A) DNS sunucusunu değiştirmek\
B) Telefonun desteklediği Wi-Fi nesli/bantları ve bağlı olduğu bandı doğrulamak\
C) Modemi fabrika ayarına döndürmek\
D) Uygulama önbelleğini temizlemek\
E) İnternet paketini yükseltmek

**Doğru şık: B**\
**Gerekçe:** Wi-Fi 7 kazanımı destek zincirine bağlıdır; istemci yeteneği/band seçimi kanıtlanmadan diğer adımlar yüksek maliyetli veya yanlış katmandadır.

**Soru 3**\
Aynı SSID altında iki farklı BSSID görülüyor. Kullanıcı "salonda iyiydi, mutfakta çok kötü" diyor. En doğru yorum hangisidir?\
A) SSID aynıysa her zaman aynı cihaz yayın yapıyordur\
B) BSSID farkı, farklı erişim noktasına bağlanma ihtimalini güçlendirir; sticky client/roaming etkisi olabilir\
C) BSSID sadece internet paketini gösterir\
D) BSSID değişiyorsa kesin saldırı vardır\
E) BSSID, cihazın IP adresidir

**Doğru şık: B**\
**Gerekçe:** Aynı SSID çoklu AP'de normaldir; hangi AP'ye bağlandığın performansı etkileyebilir. D/E kavramsal olarak yanlıştır; A ve C yanlış genellemedir.

**Soru 4**\
2.4 GHz'te kanal planlaması konuşuluyor. 20 MHz kanal genişliği varsayımıyla, en az çakışma hedefiyle klasik seçim seti hangisidir?\
A) 2 / 4 / 8\
B) 1 / 6 / 11\
C) 3 / 7 / 13 (her ülkede aynıdır)\
D) 5 / 10 / 15\
E) Kanal seçimi önemli değildir; yalnızca şifre önemlidir

**Doğru şık: B**\
**Gerekçe:** 2.4 GHz'te 20 MHz için pratikte 1/6/11 klasik çakışmasız set olarak öğretilir. C regülasyon/kanal planı açısından "her yerde aynı" diye kesinlenemez; diğerleri teknik olarak zayıftır.

**Soru 5**\
Bir kullanıcı "Wi-Fi simgesi tam ama toplantıda ses robotikleşiyor" diyor. Aşağıdaki kanıtlardan hangisi, "sinyal var ama kalite kötü (SNR sorunu)" hipotezini en çok güçlendirir?\
A) RSSI iyi; Noise da yüksek\
B) RSSI kötü; Noise da düşük\
C) Link rate yüksek; RSSI bilinmiyor\
D) SSID adı uzun\
E) Şifre karmaşık

**Doğru şık: A**\
**Gerekçe:** Sinyal güçlü görünse de gürültü yüksekse SNR düşer ve stabilite bozulabilir. Diğerleri kaliteyi doğrudan doğrulamaz.

**Soru 6**\
"İnternet yok" şikâyetinde aşağıdaki sıralamalardan hangisi bu modülün ruhuna en uygundur?\
A) Uygulama → DNS → IP → Kablosuz sinyal\
B) Kablosuz sinyal/bağlantı ayrıntıları → (gerekirse) IP → (gerekirse) DNS → uygulama\
C) DNS → Kablosuz sinyal → IP → uygulama\
D) Modem güncellemesi → Kanal değişimi → DNS\
E) Her şeyi aynı anda değiştirmek

**Doğru şık: B**\
**Gerekçe:** Önce kablosuz kanıt toplanır; sonra daha üst katmanlara geçilir. Diğerleri katmanlı düşünmeyi bozar veya gereksiz risk/maliyet üretir.

**Soru 7**\
Telefonla bir IoT cihazı "bulunamıyor"; ama telefonda internet çalışıyor. En iyi "hızlı ayrım" sorusu hangisidir?\
A) IP adresi kaç?\
B) Cihaz internete Wi-Fi ile mi bağlı, yoksa telefonla Bluetooth üzerinden mi konuşuyor?\
C) DNS önbelleğini temizledin mi?\
D) Modem markası ne?\
E) Kablolu bağlantı var mı?

**Doğru şık: B**\
**Gerekçe:** Sorun PAN katmanında olabilir; önce bağlantı türü netleşmelidir. Diğerleri çoğunlukla yanlış katmandadır.

**Soru 8**\
Aynı noktada laptop iyi, telefon kötü. En düşük riskli ve en bilgilendirici karşı kanıt üretimi hangisidir?\
A) Telefonu fabrika ayarına döndürmek\
B) Modemi güncellemek\
C) Aynı noktada telefonun band/kanal/BSSID/RSSI (ve varsa Noise) değerlerini kaydetmek ve 1--2 metre yer değişimiyle kısa karşılaştırma yapmak\
D) Komşu ağların şifrelerini denemek\
E) Sürekli hız testi çalıştırıp ağı yormak

**Doğru şık: C**\
**Gerekçe:** Yerel/izinli, düşük riskli kanıt toplama + küçük konum değişimi "kapsama/engel" ve "istemci farkı" ayrımını güçlendirir. D/E white-hat sınırını aşar; A/B yüksek maliyetli.

**Soru 9**\
"Link/PHY rate" için en doğru ifade hangisidir?\
A) İnternet hızının aynısıdır\
B) İnternet hızına hiç etkisi yoktur\
C) Kablosuz bağlantının o anki pazarlık hızıdır; internet hızını bire bir temsil etmez ama güçlü bir ipucudur\
D) Sadece şifreleme türünü gösterir\
E) Sadece DNS'i etkiler

**Doğru şık: C**\
**Gerekçe:** Link/PHY rate "kablosuz katmandaki anlaşma"dır; internet hızına bire bir eşit değildir ama kalite/koşul okumada değerlidir.

**Soru 10**\
6 GHz bandı için aşağıdaki ifadelerden hangisi en dengeli ve giriş seviyesine uygun yorumdur?\
A) 6 GHz her zaman 2.4 GHz'ten daha uzağa gider\
B) 6 GHz genellikle daha "ferah" spektrum hedefler; ancak daha yüksek frekans olduğu için kapsama/duvar hassasiyeti artabilir ve cihaz+AP desteği gerekir\
C) 6 GHz yalnızca kablolu ağlarda çalışır\
D) 6 GHz yalnızca Bluetooth içindir\
E) 6 GHz kullanmak yasal değildir

**Doğru şık: B**\
**Gerekçe:** 6 GHz, uygun koşullarda paraziti azaltmaya yardım eder; ancak frekans fiziği ve destek zinciri belirleyicidir.

## **Bu modülde neler öğrendik?**

-   Wi-Fi'yi "çekiyor/çekmiyor" yerine **band/kanal/kalite/cihaz yeteneği** üzerinden okumayı.

-   802.11 evrimini ezberlemeden, "hangi nesil hangi probleme cevap?" mantığıyla değerlendirmeyi.

-   Kablosuz sorunlarda ilk refleksin "ayar kurcalamak" değil **kanıt toplamak** (RSSI/Noise/SNR, band/kanal, link rate, BSSID) olması gerektiğini.

-   Wi-Fi 7'yi etiket olarak değil **destek zinciri** olarak düşünmeyi.

-   PAN teknolojilerini tanıyıp Wi-Fi ile karışan senaryolarda doğru katmanı seçmeyi.

-   Yerel/izinli bağlamda GUI ve komutlarla kanıt üretip **gözlem--yorum ayrımı** yapmayı.

# **MODÜL 6 --- OSI & TCP/IP + Encapsulation/Decapsulation**

Bir web sayfasına tıkladığında arka planda gerçekleşen süreç, büyük bir lojistik operasyon gibidir: veri, her aşamada farklı kurallarla taşınır ve sonunda doğru uygulamaya teslim edilir. Bu modül, o karmaşayı **katmanlı bir düşünme modeli** ile yönetilebilir hale getirir: "Bu sorun hangi katmanda?" sorusunu refleksle sorup **kanıt toplayarak** doğru katmana inmeyi öğretir. OSI'yi "teorik referans", TCP/IP'yi "pratikte çalışan model" olarak konumlandırır; ikisini eşleştirerek gerçek hayattaki teşhisi hızlandırır. Ardından encapsulation/decapsulation ile verinin **Data → Segment → Packet → Frame → Bit** dönüşüm yolculuğunu zihinde canlandırır ve Wireshark üzerinden bu katmanların **somut izlerini** okumaya başlatır. Son olarak, VLAN etiketine girişle "aynı fiziksel altyapı üzerinde mantıksal ayrım" fikrini yalnızca okuryazarlık seviyesinde tanıtır.

## **Hedefler**

Bu modülün sonunda:

-   Katmanlı mimarinin neden var olduğunu (böl--yönet, standartlaşma, troubleshooting) açıklayabileceksin.

-   OSI 7 katmanı, her katmanın rolü ve sahadaki tipik belirtileriyle birlikte tanımlayabileceksin.

-   TCP/IP modelini OSI ile eşleştirip "hangi iş hangi katmanda?" sorusuna pratik cevap verebileceksin.

-   Encapsulation/decapsulation sürecini; **header/payload** ve PDU (bit/frame/packet/segment) kavramlarıyla ilişkilendirebileceksin.

-   VLAN tag (802.1Q) kavramını giriş seviyesinde "etiketli çerçeve, mantıksal ayrım" olarak okuyabileceksin.

-   Wireshark'ı yalnızca **kendi/izinli ortamında**; arayüz seçimi, temel filtre mantığı ve kanıt üretimi için başlangıç seviyesinde kullanabileceksin.

## **Ana içerik**

## **6.1 Katmanlı mimari neden var?**

### **Ne anlama gelir?**

Ağ iletişimi aynı anda çok fazla bileşen içerir: kablolar/elektrik sinyalleri veya radyo dalgaları, MAC ve IP adresleri, portlar, veri formatları ve uygulamalar... Bu kaosu yönetmek için mühendislikte **"Böl ve Yönet (Divide and Conquer)"** yaklaşımı kullanılır: Her katman kendi işini iyi yapar, üst katmana standart bir hizmet sunar.

Katmanlı düşünmenin temel kazanımları:

-   **Standartlaşma/uyumluluk:** Ağ kartı üreticisi, tarayıcı yazan geliştiricinin detaylarını bilmez; herkes kendi katmanının standardına uyar.

-   **Değiştirilebilirlik:** Alt katmandaki teknoloji değişse bile (ör. kablolu → kablosuz), üst katmandaki uygulamalar çoğu zaman aynı mantıkla çalışır.

-   **Troubleshooting:** Sorunu izole etmeyi sağlar: "Kablo mu kopuk (L1), IP mi yanlış (L3), DNS mi bozuk (L7'ye yakın), yoksa uygulama servisi mi hatalı?"

### **Gerçek hayatta belirtisi/örneği nedir?**

**Örnek:** "Wi-Fi simgesi var ama sayfalar açılmıyor."\
Bu tek cümle, birden çok katmana işaret edebilir: kablosuz kalite (L1'e yakın), IP alamama (L3), DNS (uygulama katmanına giden isim çözümleme akışı), uygulama tarafı servis sorunu...

**Örnek:** "Kablo takılı ama bağlantı yok."\
Bu daha çok alt katman sinyali verir: fiziksel bağlantı/arayüz durumu (L1/L2 sınırı).

### **Nasıl doğrularım/çürütürüm? (güvenli)**

Katmanlı bir soru setiyle ilerle:

-   **Fiziksel (L1):** Link var mı? (kablo, bağlantı ışığı, arayüz "connected" durumu)

-   **Yerel iletim (L2):** Aynı yerelde bir hareket var mı? (temel çerçeve trafiği)

-   **IP (L3):** IP adresi var mı? Varsayılan ağ geçidi (gateway) tanımlı mı?

-   **DNS/uygulama (L7'ye yakın):** İsim çözümleme çalışıyor mu? Uygulama servisi cevap veriyor mu?

**Dikkat:** OSI/TCP-IP "kablonun içinde fiziksel olarak katmanlar dolaşıyor" demek değildir; bu modeller **senin teşhis çerçeven**. Doğru kullanıldığında "tahmin" yerine "kanıt" üretir.

## **6.2 OSI 7 katman**

### **Ne anlama gelir?**

OSI (Open Systems Interconnection), iletişimi 7 mantıksal kata ayıran referans modeldir. Giriş seviyesinde hedef; katmanların standardını ezberlemek değil, her katmanın **rolünü**, **sahadaki belirtisini** ve **tipik kanıtını** bilmektir. Troubleshooting'te çoğu zaman aşağıdan yukarıya (1'den 7'ye) kontrol etmek verimlidir.

1.  **L1 --- Physical (Fiziksel)**

-   Görev: Bitlerin (0/1) taşınması; kablo/optik/radyo sinyali, konektörler

-   Sorun örnekleri: kopukluk, temassızlık, parazit

-   Veri birimi: **Bit**

2.  **L2 --- Data Link (Veri Bağlantı)**

-   Görev: Yerel iletim; MAC adresleme, çerçeveleme; komşu cihaza teslim

-   Cihaz rolü: **Switch, NIC (ağ kartı)**

-   Veri birimi: **Frame (Çerçeve)**

3.  **L3 --- Network (Ağ)**

-   Görev: Mantıksal adresleme (IP) ve ağlar arası iletim (routing mantığı)

-   Cihaz rolü: **Router**

-   Veri birimi: **Packet (Paket)**

4.  **L4 --- Transport (Taşıma)**

-   Görev: Uçtan uca taşıma; TCP ile güvenilirlik / UDP ile düşük gecikme; **port** kavramıyla doğru servise teslim

-   Veri birimi: **Segment (TCP)** / **Datagram (UDP)**

5.  **L5 --- Session (Oturum)**

-   Görev: Uygulamalar arası diyaloğu başlatma, sürdürme, sonlandırma (örn. oturum zaman aşımı)

6.  **L6 --- Presentation (Sunum)**

-   Görev: Veri formatı, kodlama, sıkıştırma, şifreleme (örn. JPEG/MP3, TLS gibi) --- "çevirmen" gibi

7.  **L7 --- Application (Uygulama)**

-   Görev: Kullanıcının kullandığı hizmet protokolleri (HTTP, DNS, SMTP vb.)

-   Not: Chrome/Outlook bu katman **değil**; bu katmandaki protokolleri kullanan yazılımlardır.

**İpucu (işlev sırasıyla hatırlama):** "**Sinyal → Yerel → Adres → Taşıma → Oturum → Biçim → Uygulama**"\
Bu sıralama, ezberden daha kalıcıdır.

**İpucu (mnemonic / isteğe bağlı):** İngilizce baş harflerle akılda tutmak isteyenler için sık geçen bir tekerleme:\
"**Please Do Not Throw Sausage Pizza Away**" (Physical, Data Link, Network, Transport, Session, Presentation, Application).\
Ezber tek başına teşhis değildir; **kanıtla desteklenmediğinde** yanıltır.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   L1: "Bağlı değil", ışık yok, sinyal çok zayıf

-   L2: Yerelde "bir şeyler kopuk"; çerçeve düzeyinde iletişim aksar

-   L3: IP yok/yanlış ağ; bağlı hissi var ama hedefe gidemez

-   L7: Ağ genel olarak çalışır ama tek bir uygulama/hizmet hata verir

### **Nasıl doğrularım/çürütürüm? (güvenli)**

En basit kanıtı ara:

-   L1: arayüz durumu/LED/bağlantı göstergesi

-   L3: IP + gateway var mı?

-   L7: sorun tek uygulama mı, yoksa her şey mi?

## **6.3 TCP/IP modeli ve OSI eşlemesi**

### **Ne anlama gelir?**

TCP/IP, internetin üzerinde çalıştığı pratik protokol ailesidir. Çoğu anlatımda 4 katmanlıdır (bazı kaynaklar Link katmanını daha ayrıntılı bölerek 5 diye de anlatabilir):

-   **Link / Network Access (Ağ erişimi)**

-   **Internet (İnternet)**

-   **Transport (Taşıma)**

-   **Application (Uygulama)**

**OSI eşlemesi (giriş seviyesi pratik):**

-   TCP/IP **Link** ≈ OSI **L1 + L2**

-   TCP/IP **Internet** ≈ OSI **L3**

-   TCP/IP **Transport** ≈ OSI **L4**

-   TCP/IP **Application** ≈ OSI **L5 + L6 + L7** (pratikte "uygulama tarafı" diye birlikte düşünülür)

### **Gerçek hayatta belirtisi/örneği nedir?**

**Örnek:** "IP var ama site açılmıyor."\
Internet (IP) çalışıyor olabilir; ama Transport (bağlantı/port) veya Application (DNS/HTTP servis davranışı) tarafında problem olabilir.

**Örnek:** "Wi-Fi bağlı ama IP yok."\
Link var, Internet katmanı yok gibi yorumlanır.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

OSI ile detaylandır, TCP/IP ile sadeleştir:

-   Link var mı?

-   IP var mı?

-   Taşıma/servise erişim çalışıyor mu?

-   Uygulama (isim çözümleme/servis) cevaplıyor mu?

## **6.4 Encapsulation / Decapsulation**

### **Ne anlama gelir?**

Encapsulation (kapsülleme), verinin üst katmandan alt katmana inerken her katmanın üzerine bir **"zarf" (header)** eklemesidir. Alıcı tarafta bu zarflar sırayla açılır (decapsulation). Bu süreç, "veri neden segment/packet/frame diye farklı isimler alıyor?" sorusunu netleştirir.

-   **Payload:** Taşınan asıl veri (bir üst katmandan gelen içerik)

-   **Header/Trailer:** Katmanın eklediği yol tarifi ve kontrol bilgisi

**PDU adlandırması (okuryazarlık düzeyi):**

-   L4: **Segment (TCP) / Datagram (UDP)**

-   L3: **Packet**

-   L2: **Frame**

-   L1: **Bits**

**Örnek: "Web'e girerken veri nasıl paketlenir?"**

-   Uygulama: Kullanıcı "Merhaba" yazar (Data)

-   Taşıma: TCP header eklenir (port bilgisi, sıra/akış mantığı gibi) → Segment

-   Ağ: IP header eklenir (kaynak/hedef IP) → Packet

-   Veri bağlantı: Ethernet header eklenir (kaynak/hedef MAC) → Frame

-   Fiziksel: Bitlere dönüşüp ortama verilir

**Analoji (Matruşka):** En içte veri; onu taşıma sarar, onu ağ sarar, onu veri bağlantı sarar; en dışta iletim ortamına giden bit akışı vardır.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Paket kaybı" ifadesi çoğu zaman L3 sanılır; oysa kayıp hissi L1 (parazit/kalite) veya L2 (yerel iletim) kaynaklı da olabilir. Encapsulation mantığı, "sinyal nerede bozulmuş olabilir?" sorusunu disipline eder.

-   "Veri büyüdükçe sorun artıyor" gibi desenlerde (ileri detaya girmeden) daha fazla paket/çerçeve oluşması, kalitenin zayıf olduğu yerde problemi görünür kılabilir.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   L2'de frame görmen, L3'ün kesin sağlıklı olduğu anlamına gelmez; katmanları ayrı kanıtla.

-   Wireshark'ta bir paketin içini açtığında, ilgili header alanları "hangi katmanda hangi bilgi var?" sorusunu doğrular.

**İpucu (kanıt standardı):** Not alırken katmanı yaz: "L2'de frame akıyor / L3'te beklenen yanıt yok" gibi. Bu, gözlem--yorum ayrımını otomatik güçlendirir.

## **6.5 VLAN tag'e giriş**

### **Ne anlama gelir?**

VLAN, aynı fiziksel altyapı üzerinde trafiği "mantıksal odalara" ayırma yaklaşımıdır. VLAN tag (802.1Q), Ethernet çerçevesinin içine **4 baytlık bir etiket** ekleyerek "bu çerçeve hangi VLAN'a ait?" bilgisini taşır. Giriş seviyesinde ana fikir:

-   VLAN, esas olarak **L2 mantığıdır** (broadcast alanlarını ayırır).

-   Aynı fiziksel hat üzerinden birden çok VLAN taşınabilir (etiketli trafik).

-   VLAN'lar arası iletişim genelde L3'te bir yönlendirme ihtiyacı doğurur (burada sadece ufuk notu).

**802.1Q etiketi nereye eklenir? (okuryazarlık)**\
Ethernet çerçevesinde, **MAC adres alanlarının ardından** (EtherType/Type alanı öncesine) VLAN etiketi eklenir. Böylece switch'ler, çerçevenin hangi VLAN'a ait olduğunu "yolda" anlayabilir.

**Saha nüansı (kavramsal):**

-   Switch'ler arası taşınan "etiketli" trafik, VLAN bilgisini korur.

-   Uç cihaza giden tipik "erişim (access) port" tarafında etiket genelde uç cihazın beklediği şekilde **sadeleştirilebilir**; bazı senaryolarda (örn. trunk mantığı) etiketli trafik taşınabilir.

**Dikkat:** Bu modülde VLAN yalnızca **okuryazarlık** düzeyindedir. Uygulanabilir VLAN kurulum/konfigürasyon adımları yoktur.

### **Gerçek hayatta belirtisi/örneği nedir?**

**Örnek:** "Kablo takılı, bağlı görünüyor ama ağa çıkamıyor."\
Sorun fiziksel değil; cihaz yanlış mantıksal ağa (yanlış VLAN) düşmüş olabilir. (Bu, tek açıklama değildir; kanıt gerekir.)

**Örnek:** Aynı yerde iki porttan biri çalışıp diğeri çalışmıyorsa, fiziksel kalite aynı olsa da portların mantıksal ayrımı etkili olabilir.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

Bu seviyede "ayar yapma" değil, **kanıt desenini** ararsın:

-   Aynı cihazı farklı porta takınca davranış değişiyor mu?

-   Aynı portta başka cihaz çalışıyor mu?

-   OS tarafında IP var mı? (IP yoksa L3'e çıkamıyorsun; yanlış VLAN olası nedenlerden biridir ama kesin hüküm değildir.)

## **6.6 Araç: Wireshark giriş**

### **Ne anlama gelir?**

Wireshark, trafiği yakalayıp (capture) paket/çerçeve ayrıntılarını okumaya yarayan bir **protokol analizörü**dür (packet analyzer / "sniffer" terimi de geçer). Bu modülde hedef: "gizli kapaklı işler" değil; kendi/izinli ortamında troubleshooting için **görünürlük** kazanmak ve kanıt üretmektir.

-   **Capture (yakalama):** Ağ arayüzünden ham trafiği almak (PCAP dosyası oluşabilir).

-   **Display filter (görüntü filtresi):** Yakalananlar içinde odaklanmak (yakalamayı değiştirmez; yalnızca görüntüyü süzer).

**Dikkat (etik + gizlilik):** Wireshark, hassas veri görebilir. Sadece **kendi cihazın** ve **açıkça yetkili olduğun ağ** üzerinde, gerekli en kısa süreyle kullan. Başkasının trafiğini izinsiz dinlemek hukuka aykırıdır.

### **Wireshark ile "güvenli başlangıç" (yerel/izinli)**

1.  **Arayüz seçimi**

-   Ethernet mi Wi-Fi mı? (En yaygın hata yanlış arayüzdür.)

-   Beklenen: Paket sayacı artıyor mu? Zaman damgaları akıyor mu?

2.  **Kısa ve kontrollü yakalama**

-   "Uzun yakalama" yerine 20--40 saniyelik kısa yakalama tercih et; analiz daha temiz olur.

3.  **Kontrollü, zararsız trafik üret**

-   Örnek IP: 192.0.2.1 gibi yerel bir hedefe kısa süreli test (kendi/izinli ortam varsayımı).

-   Amaç: "Ben gönderiyor muyum, yanıt geliyor mu?" desenini görmek.

4.  **Display filter ile odaklan (örnekler)**

-   icmp → ping benzeri trafik

-   arp → yerel adres çözümleme trafiği (detay Modül 7'de)

-   ip.addr == 192.0.2.10 → belirli IP'ye odaklan (örnek)

-   dns → isim çözümleme trafiği (detay Modül 10'da)

**İpucu (Wireshark panelini okumak):** Seçtiğin pakette "Packet Details" bölümünde katman benzeri bloklar görürsün:

-   **Frame...**: Yakalama bağlamı (zaman/uzunluk gibi) --- L1'e en yakın "kayıt" katmanı gibi düşün

-   **Ethernet II...**: L2 (MAC)

-   **Internet Protocol...**: L3 (IP)

-   **TCP/UDP...**: L4 (portlar)

-   **HTTP/DNS...**: L7 tarafı (uygulama protokolleri)\
    Bu bloklar, "katmanlar nerede görünür?" sorusuna pratik bir cevap verir.

### **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Örnek:** Kullanıcı "İnternetim yok" diyor; Wi-Fi simgesi var veya kablo takılı.

**Belirti → Olasılık**

-   Belirti: "Bağlı görünüyor ama sayfa açılmıyor"

-   Olasılıklar (katmanlı):

    -   L1/L2: link var gibi ama yerel iletişim kalitesiz/kopuk

    -   L3: IP yok/yanlış ağ geçidi

    -   Uygulama tarafı: IP çalışsa da DNS/HTTP tarafı sorunlu olabilir

**Doğrulama (kanıt)**

1.  OS'ten IP kanıtı: ipconfig / ip a / ifconfig ile IP + gateway var mı?

2.  Wireshark'ta doğru arayüzle kısa yakalama başlat.

3.  Kontrollü test trafiği üret (örnek): ping 192.0.2.1

4.  Wireshark'ta desen ara:

    a.  "Giden var, dönen yok" → L2/L3 sınırında sorun ihtimali artar

    b.  "Giden ve dönen var" → en azından o hedefe erişim var; sorun DNS/uygulama tarafına kayabilir (sonraki modüllerde sistematikleşir)

**Sonuç (kanıta dayalı kısa rapor notu)**

-   **Bulgu → Etki → Öneri → Kanıt (rapor formatı)**

    -   Bulgu: Yakalamada istek var/yok; yanıt var/yok (desene göre)

    -   Etki: Kullanıcı hedefe erişemiyor / uygulama çalışmıyor

    -   Öneri: Kanıtın işaret ettiği katmanda düşük riskli adımlarla ilerle (arayüz/IP/gateway kontrolü gibi)

    -   Kanıt: Wireshark ekran görüntüsü + komut çıktısı özeti (gözlem)

## **Terimler Sözlüğü (Glossary)**

  **Terim**                 **Türkçe karşılığı / açıklama**
  ------------------------- -------------------------------------------------------------------------------------------
  OSI                       İletişimi 7 katmana bölen referans model (Open Systems Interconnection)
  TCP/IP                    İnternetin pratik protokol modeli/yığını
  Layer (Katman)            İletişimi işlevsel parçalara ayıran seviye
  Divide and Conquer        Böl ve Yönet; karmaşıklığı katmanlara ayırma prensibi
  PDU                       Katmandaki veri biriminin adı (segment/packet/frame/bit)
  Bit                       Fiziksel katmanda taşınan 0/1 birimleri
  Frame                     L2 veri birimi (MAC'li çerçeve)
  Packet                    L3 veri birimi (IP'li paket)
  Segment                   TCP bağlamında L4 veri birimi
  Datagram                  UDP bağlamında L4 veri birimi
  Header                    Katmanın eklediği başlık (yol tarifi/kontrol bilgisi)
  Payload                   Taşınan asıl içerik
  Encapsulation             Üstten alta inerken header ekleyerek kapsülleme
  Decapsulation             Alıcıda katman katman açma işlemi
  NIC                       Network Interface Card; ağ kartı
  VLAN                      Mantıksal ağ ayrımı (L2 düzeyi)
  802.1Q                    VLAN etiketleme standardı (VLAN tag)
  Wireshark                 Trafik yakalama ve analiz aracı (protokol analizörü)
  Packet analyzer/sniffer   Trafiği yakalayıp inceleyen araç sınıfı (etik/yetkili kullanım şart)
  Capture                   Trafiği yakalama işlemi
  PCAP                      Yakalanan paketlerin dosya formatı
  Display filter            Yakalanan trafik içinde görüntüleme/odaklama filtresi
  Trunk (kavramsal)         VLAN bilgisinin etiketli taşındığı bağlantı yaklaşımı (konfigürasyon değil, okuryazarlık)

## **Kendini Değerlendir**

1.  Bir kullanıcı "Wi-Fi simgesi var ama hiçbir site açılmıyor" diyor. Aşağıdaki yaklaşımlardan hangisi **katmanlı ve kanıt odaklı** ilerlemeye en uygundur?\
    A) Router'ı fabrika ayarlarına döndürmek ve tekrar kurmak\
    B) Önce IP/gateway var mı bakmak, sonra gerekiyorsa DNS/uygulama kanıtı toplamak\
    C) Tarayıcıyı silip yeniden yüklemek\
    D) Rastgele DNS değiştirmek ve sonucu beklemek\
    E) Wireshark'ı açıp saatlerce trafik yakalamak\
    **Doğru:** B\
    **Gerekçe:** B, en düşük riskli ve en izlenebilir kanıt hattını kurar. A/C/D yüksek yanlış pozitif üretir. E gereksiz uzun yakalama ve gizlilik riski taşır.

2.  Encapsulation sürecinde doğru sırayı seçin (gönderici tarafta üstten alta):\
    A) Frame → Packet → Segment → Data\
    B) Data → Segment → Packet → Frame → Bits\
    C) Bits → Frame → Packet → Segment → Data\
    D) Packet → Segment → Frame → Data\
    E) Data → Packet → Segment → Frame\
    **Doğru:** B\
    **Gerekçe:** Uygulama verisi önce L4'te segment/datagram olur, L3'te packet, L2'de frame ve en altta bitlere dönüşür.

3.  "L2'de frame akıyor" gözlemi tek başına aşağıdakilerden hangisini **kesin** kanıtlar?\
    A) DNS çalışıyor\
    B) IP yönlendirme sorunsuz\
    C) Yerelde en azından bazı çerçevelerin arayüzden geçtiği\
    D) Uygulama servisi cevap veriyor\
    E) VLAN'ın doğru olduğu\
    **Doğru:** C\
    **Gerekçe:** L2 aktivitesi, yalnızca yerel çerçeve trafiği olduğuna kanıttır; L3/DNS/uygulama/VLAN doğruluğunu tek başına garanti etmez.

4.  TCP/IP "Application" katmanının OSI ile eşleşmesi için en doğru ifade hangisidir?\
    A) OSI L1'e karşılık gelir\
    B) OSI L2'ye karşılık gelir\
    C) OSI L3+L4'e karşılık gelir\
    D) OSI L5+L6+L7'nin pratikte birlikte ele alınan kısmına karşılık gelir\
    E) Sadece OSI L7'ye karşılık gelir\
    **Doğru:** D\
    **Gerekçe:** TCP/IP application, pratikte OSI'nin üst katmanlarını kapsar. E, aşırı dar yorumdur.

5.  Wireshark'ta bir paketi seçtiğinizde "Ethernet II" bloğu size en çok hangi katmanın kanıtını verir?\
    A) L1 (bit/sinyal)\
    B) L2 (MAC/çerçeve)\
    C) L3 (IP/paket)\
    D) L4 (TCP/UDP/port)\
    E) L7 (HTTP/DNS)\
    **Doğru:** B\
    **Gerekçe:** Ethernet II, MAC adresli çerçeve katmanıdır. Diğer şıklar farklı bloklara karşılık gelir.

6.  VLAN tag ile ilgili aşağıdaki ifadelerden hangisi giriş seviyesinde **en doğru ve güvenli** yorumdur?\
    A) VLAN sorunlarını çözmek için kullanıcı cihazında ayar değiştirerek VLAN ID girmek gerekir\
    B) VLAN, L3 teknolojisidir; IP üzerinden çalışır\
    C) VLAN, L2'de mantıksal ayrım sağlar; etiket switch'lerin trafiği ayırmasına yardım eder\
    D) VLAN etiketi her zaman uç cihaz tarafından görülür ve yönetilir\
    E) VLAN sadece kablosuz ağlarda kullanılır\
    **Doğru:** C\
    **Gerekçe:** VLAN temel olarak L2 mantığıdır. A/D konfigürasyon ve istisna detayına gider; B/E yanlıştır.

7.  Aşağıdaki kanıtlardan hangisi "L3 sorunu olabilir" şüphesini en çok güçlendirir?\
    A) Wi-Fi simgesi görünmesi\
    B) Wireshark'ta paket listesinde satırların akması\
    C) ipconfig/ip a çıktısında IP adresinin olmaması veya beklenmeyen ağda olması\
    D) Tarayıcının açılması\
    E) Klavyenin çalışması\
    **Doğru:** C\
    **Gerekçe:** IP'nin yokluğu/yanlışlığı doğrudan L3'e güçlü sinyal verir. A/B tek başına yeterli değildir.

8.  Wireshark'ta kısa ve kontrollü yakalama önerisinin ana gerekçesi hangisidir?\
    A) Uzun yakalama yapmak hiçbir zaman mümkün değildir\
    B) Uzun yakalama her zaman daha az veri üretir\
    C) Kısa yakalama, analiz edilebilirliği artırır ve gereksiz hassas veri toplama riskini azaltır\
    D) Kısa yakalama, DNS'i otomatik düzeltir\
    E) Kısa yakalama, VLAN'ı devre dışı bırakır\
    **Doğru:** C\
    **Gerekçe:** Sadelik + gizlilik/etik risk azaltma. Diğer şıklar yanlış nedensellik içerir.

9.  "IP var ama alan adına gidilemiyor" deseninde, aşağıdaki yöntemlerden hangisi **önce kanıt** yaklaşımıyla en uyumludur?\
    A) DNS'i rastgele değiştirmek\
    B) Önce DNS ile ilgili trafiğe/kanıta bakmak (ör. dns filtresi) ve isim çözümlemenin çalışıp çalışmadığını doğrulamak\
    C) Bilgisayarı formatlamak\
    D) Modemi değiştirmek\
    E) Wi-Fi şifresini değiştirmek\
    **Doğru:** B\
    **Gerekçe:** Desen DNS/uygulama tarafına işaret eder; önce kanıt toplanır. A/D/E yüksek yanlış pozitif riski taşır; C aşırı ve alakasızdır.

10. Bir paket detayında "Internet Protocol Version 4" bloğunu görmek en güçlü hangi çıkarımı destekler?\
    A) Bu trafiğin mutlaka HTTP olduğunu\
    B) L3 seviyesinde IP başlığının mevcut olduğunu\
    C) L2'de hiç frame olmadığını\
    D) L1'de sinyalin mükemmel olduğunu\
    E) VLAN'ın kesin doğru yapılandırıldığını\
    **Doğru:** B\
    **Gerekçe:** IP bloğu, L3 başlığının varlığına kanıttır. Protokolün HTTP olması veya sinyal kalitesi gibi sonuçlar buradan kesin çıkmaz.

## **Kapanış: Bu modülde neler kazandık?**

-   OSI ve TCP/IP'yi ezber değil, **teşhis çerçevesi** olarak kullanmayı

-   "Site açılmıyor" gibi karmaşık şikâyetleri **katmanlara ayırıp** kanıtla ilerlemeyi

-   Encapsulation/decapsulation ile verinin **Segment → Packet → Frame → Bit** yolculuğunu okumayı

-   VLAN tag kavramını **mantıksal ayrım** ve "etiketli çerçeve" perspektifiyle tanımayı

-   Wireshark'ta arayüz seçimi, kısa yakalama ve temel filtrelerle **görünürlük + kanıt** üretmeyi

-   Her adımda **white-hat sınırını** (izinli/yerel, minimum risk, gereksiz veri toplamama) korumayı

# **MODÜL 7 --- MAC, ARP: Yerel İletişim Mantığı**

Yerel ağ (LAN) problemlerinin büyük kısmı, "internet bozuk" sanılan ama aslında **aynı ağ segmentindeki cihazların birbirini bulamaması** ile başlar. Bu modül, bu yerel iletişimin temel gerçeğini netleştirir: Aynı segmentte cihazlar "nihai hedefi" IP ile düşünür, fakat teslimatı **MAC adresi** ile yapar. Ardından ARP'nin (IPv4'te) "IP → MAC eşlemesi" üreten tercüman rolünü ve ARP önbelleğinin (cache) troubleshooting'te nasıl **kanıt kaynağı** olduğunu öğrenirsin. Hedef; bir arıza anında "Bu sorun yerel mi?" sorusunu hızlı cevaplayıp, **gözlem--yorum ayrımını** koruyarak doğru katmanda ilerlemektir. Wireshark'ı bir önceki modülde tanıdın; burada ARP/MAC tarafını **gözlem düzeyinde** somutlaştıracağız.

## **Hedefler**

Bu modülün sonunda:

-   MAC adresinin rolünü (L2 kimlik), yerel iletişim ve frame (çerçeve) bağlamında açıklayabileceksin.

-   MAC'in "uçtan uca adres" olmadığını; **her atlamada yerel teslimat** için anlam kazandığını IP ile karşılaştırarak ayırt edebileceksin.

-   ARP'nin amacını ve temel akışını (request broadcast / reply unicast, ARP cache) giriş seviyesinde tanımlayabileceksin.

-   ARP tablosu ve Wireshark gözlemiyle "bu belirtiyi ne doğrular, ne çürütür?" yaklaşımını kurabileceksin.

-   Windows/Linux/macOS üzerinde **yerel ve güvenli** komutlarla MAC/ARP kanıtı toplayıp çıktıda kritik satırları seçebileceksin.

-   Basit yerel erişim sorunlarında yöntem seçimini (zaman--karmaşıklık--yanlış pozitif maliyeti) yapıp white-hat sınırını koruyabileceksin.

## **Ana içerik**

## **7.1 MAC adresi ve yerel iletişim**

### **Ne anlama gelir?**

**MAC (Media Access Control) adresi**, bir ağ arayüzünün (NIC / Wi-Fi adaptörü) **yerel ağ (Layer 2)** kimliğidir. Ethernet veya Wi-Fi gibi L2 teknolojilerinde veri, bir **frame (çerçeve)** içinde taşınır ve frame üzerinde **Kaynak MAC** ile **Hedef MAC** bulunur.

Bu noktada kritik ayrım şudur:

-   **IP adresi:** "Nereye?" (ağlar arası yönlendirme mantığı)

-   **MAC adresi:** "Bu yerel segmentte kime teslim edeceğim?" (komşuya teslim mantığı)

Bu yüzden MAC, "internetin öbür ucundaki adres" değildir. Paket ağlar arası giderken IP katmanı "nihai hedefi" temsil eder; fakat yerel iletimde her hop'ta yeni bir L2 zarf (frame) hazırlanır ve **L2 adresleme (MAC) yerel teslimata göre güncellenir**.

**İpucu (yerel mi, uzak mı?)**\
Sorun yaşadığında önce "Bu iletişim aynı LAN içinde mi?" diye sor. Aynı LAN içindeyse MAC/ARP kanıtı çok hızlı sonuç verir; uzak hedefler içinse önce IP/DNS gibi üst katmanlar daha belirleyici olabilir (detaylar sonraki modüllerde).

### **MAC adresinin yapısı (giriş seviyesi okuryazarlık)**

MAC çoğunlukla **48 bit (6 bayt)** uzunluğundadır ve genellikle 00:1A:2B:3C:4D:5E biçiminde görülür.

Giriş seviyesi için pratik okuma şekli:

-   **İlk 24 bit (OUI):** üretici/organizasyon kimliği gibi düşünülebilir.

-   **Son 24 bit:** üreticinin o arayüze verdiği cihaz-özel bölüm.

**Dikkat (kalıcı mı, değişebilir mi?)**\
MAC adresi çoğu donanımda üretimden "atanmış" gibi dursa da, işletim sistemi seviyesinde **görünen MAC'in değişebildiği** durumlar vardır (özellikle Wi-Fi'de **MAC randomization** gibi gizlilik özellikleri). Troubleshooting'te "aynı cihaz mı?" sorusunu sadece MAC'e bakarak kesinleştirmek bazen yanıltıcı olabilir; zaman/arayüz/bağlam notu tut.

### **Yerel iletişimde MAC'in rolü (Switch mantığı)**

Yerel ağda (özellikle Ethernet) cihazların frame'leri doğru yere teslim etmesi için ağ cihazları, çoğunlukla **MAC tablosu** gibi mekanizmalarla "bu MAC hangi portta?" bilgisini kullanır. Giriş seviyesinde şu fikir yeterlidir:

-   **L2 düzeyinde iletim:** MAC üzerinden yapılır.

-   **L3 düzeyinde yönlendirme:** IP üzerinden yapılır (bunu Modül 8--11 çizgisinde sistematikleştireceğiz).

**İpucu (analojiyi doğru kullan):**\
IP'yi "adres", MAC'i "kimlik kartı" gibi düşünmek ilk bakışta yardımcıdır; ama tam eşleşme değildir. IP de kimlik gibi görünür, MAC de adres gibi kullanılabilir. Asıl fark: **IP ağlar arası**, **MAC yerel teslimat** içindir.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Aynı ağdaki iki cihaz "birbirini görmüyor" hissi: çoğu zaman L2/L3 sınırında ipucu ararsın (MAC/ARP).

-   "Bağlı görünüyor" ama yerelde hiçbir kaynak çalışmıyor: L1 var gibi; L2'de frame alışverişi kopuk olabilir.

-   Wi-Fi'de aynı SSID altında farklı erişim noktasına geçiş: erişim noktasının kimliği (BSSID) pratikte MAC benzeri görünür; yerel kimliklerin değişebildiğini fark etmek önemlidir.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Kanıt 1:** Doğru arayüzün MAC'ini gör (hangi arayüz üzerinden konuşuyorum?).

-   **Kanıt 2:** Wireshark'ta (yerel/izinli) frame detaylarında kaynak/hedef MAC alanlarını gözle (L2'de gerçekten trafik var mı?).

-   **Karşı kanıt:** L2 sorunu sandığın şey L3 (IP/subnet) olabilir; IP doğrulamasını Modül 8'de sistematikleştireceğiz. Bu modülde hedef, "L2 kimlik ve yerel teslimat" kanıtını netleştirmektir.

## **7.2 ARP mantığı (temel)**

### **Ne anlama gelir?**

**ARP (Address Resolution Protocol)**, IPv4 dünyasında yerel ağda "Bu IP'nin MAC'i ne?" sorusuna cevap bulur. Çünkü cihaz, IP ile "hedefi" bilse bile, frame'i kabloya/ortama koymak için L2'de **bir MAC adresine** teslim etmek zorundadır.

Temel akış:

1.  MAC bilinmiyorsa cihaz **ARP Request** gönderir (çoğunlukla broadcast): "Şu IP kimde?"

2.  O IP'ye sahip cihaz **ARP Reply** döner (çoğunlukla unicast): "Benim, MAC'im şu."

3.  Eşleme bir süre **ARP cache**'te tutulur; böylece her seferinde yeniden sormaz.

**Örnek:**\
192.0.2.10 adresli bir cihaz, aynı yerel ağda 192.0.2.5 ile konuşmak istiyor. 192.0.2.5'in MAC'ini bilmiyorsa önce ARP ile "192.0.2.5 kimde?" diye yayın yapar; 192.0.2.5 yanıt verirse eşleme tabloya düşer.

### **ARP cache okuryazarlığı (kanıt kaynağı olarak)**

ARP cache dinamik bir tablodur:

-   Kayıtlar zamanla eklenir, "eskiyebilir", silinebilir.

-   Tek bir anlık görüntü ile kesin hüküm vermek yerine, kısa aralıklarla gözlemleyip **desen** aramak daha güvenlidir.

Bazı sistemlerde "dinamik" ve "statik" kayıt türleri görülebilir. Bu modülde **statik kayıt ekleme** gibi konfigürasyon adımlarına girilmez; sadece "tablo türü" okuryazarlığı hedeflenir.

**Dikkat (güvenlik farkındalığı --- nasıl yapılır değil):**\
ARP, yerelde "güven varsayımı" ile çalışan bir mekanizmadır; bu nedenle ARP ile ilgili suistimal türleri vardır. Bu modül bunu uygulamalı anlatmaz. Giriş seviyesinde beklenti: ARP tablosunda **beklenmedik değişim/tutarsızlık** görürsen bunu "sinyal" olarak kaydedip daha fazla kanıt toplayabilmek.

### **Tipik ARP desenleri (giriş seviyesi)**

-   **"incomplete / çözümlenemedi"** benzeri kayıtlar: IP var ama MAC çözümlenememiş olabilir; yerelde yanıt alınamıyordur.

-   **Tutarsız eşleme sinyali:** Aynı IP'ye farklı zamanlarda farklı MAC'lerin karşılık vermesi; tek başına hüküm değildir ama "daha fazla kanıt" gerektirir.

-   **Gratuitous ARP (kavramsal):** Bazı cihazlar cache güncelleme/duyuru amaçlı ARP yayınları yapabilir; gözlem düzeyinde bilmek yeterli.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Aynı ağdaki yazıcıya erişemiyorum": ARP çözümleme eksik/tutarsız olabilir.

-   "Bazen var bazen yok": cache değişimi, yerel bağlantı kararsızlığı veya adresleme tutarsızlığı olasılıkları doğar.

-   "Gateway'e gidemiyorum" şikâyeti: (IP tarafı Modül 8'de) yerelde gateway MAC'i çözümlenemiyorsa üst katmana çıkamazsın.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Kanıt 1:** ARP/komşu tablosunu oku: hedef IP için MAC kaydı var mı? "incomplete" gibi bir durum var mı?

-   **Kanıt 2:** Wireshark'ta arp filtresi ile ARP Request/Reply görüyor musun?

    -   Request var, Reply yoksa: hedef yanıt vermiyor olabilir veya yerel iletimde kopukluk olabilir.

-   **Karşı kanıt:** Sorun ARP gibi görünse de hedef IP yanlış olabilir (aynı subnet değil/yanlış hedef). Bu ayrım Modül 8'de netleşecek; burada amaç "ARP kanıtını doğru okumak".

## **Komut & Araç Okuryazarlığı (güvenli, yerel)**

Aşağıdaki komutlar **sadece kendi/izinli ortamında**, yalnızca **okuma/kanıt toplama** içindir. Amaç "keşif/tarama" değil; mevcut durumun kanıtını toplamaktır.

### **Windows**

**Komut: getmac /v**

-   Amaç: Arayüzleri ve MAC adreslerini görmek.

-   Beklenen çıktı türü: Arayüz listesi + Physical Address.

-   Yorum ipucu: Yanlış arayüzü incelemek, "sorun yok" gibi yanlış pozitif üretebilir.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: ipconfig /all**

-   Amaç: Arayüz bilgilerini daha detaylı görmek (MAC dâhil).

-   Beklenen çıktı türü: Her adaptör için fiziksel adres, IP vb. satırlar.

-   Yorum ipucu: MAC'i doğru adaptörden okuduğundan emin ol (Ethernet/Wi-Fi).

-   Güvenli sınır: Yerel görüntüleme.

**Komut: arp -a**

-   Amaç: ARP cache'i (IP → MAC) görmek.

-   Beklenen çıktı türü: IP / Physical Address / Type benzeri tablo.

-   Yorum ipucu: İletişim kurduğunu sandığın bir IP, tabloda yoksa veya "incomplete" benzeri görünüyorsa yerel çözümleme başarısız olabilir.

-   Güvenli sınır: Yerel görüntüleme.

### **Linux**

**Komut: ip link**

-   Amaç: Arayüzleri ve MAC adreslerini görmek.

-   Beklenen çıktı türü: Arayüz listesi + link/ether satırı.

-   Yorum ipucu: UP olan arayüz, her zaman "doğru arayüz" olmayabilir; bağlama göre seç.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: ip neigh**

-   Amaç: Komşu tablosunu görmek (IPv4 için ARP eşlemesine karşılık gelir).

-   Beklenen çıktı türü: IP + lladdr (MAC) + durum (REACHABLE/STALE vb.).

-   Yorum ipucu: Durumların değişmesi normaldir; kritik olan "hedef için hiç çözüm yok mu?" ve "tutarsızlık var mı?" sorusudur.

-   Güvenli sınır: Yerel görüntüleme.

**Dikkat:** Bazı Linux dağıtımlarında arp komutu varsayılan gelmeyebilir; ip neigh daha güvenilir ve modern bir okuryazarlık aracıdır.

### **macOS**

**Komut: ifconfig**

-   Amaç: Arayüzleri ve MAC bilgilerini görmek.

-   Beklenen çıktı türü: en0/en1 gibi arayüzler; ether satırı.

-   Yorum ipucu: "Wi-Fi genelde en0" genellemesi her cihazda doğru olmayabilir; çıktıya göre karar ver.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: arp -a**

-   Amaç: ARP cache'i görmek.

-   Beklenen çıktı türü: IP/hostname (varsa) + MAC eşlemesi.

-   Yorum ipucu: "(incomplete)" benzeri ifade, çözümlemenin tamamlanmadığına işaret edebilir.

-   Güvenli sınır: Yerel görüntüleme.

### **Wireshark (gözlem --- yerel/izinli)**

-   Amaç: ARP'yi gerçek trafik olarak görmek; sadece kanıt üretmek.

-   Beklenen çıktı türü: ARP Request / ARP Reply satırları.

-   Yorum ipucu:

    -   arp filtresi ile ARP paketlerini izole et.

    -   Frame detayında kaynak/hedef MAC alanlarını gözle; "kim kime konuşuyor?" netleşir.

-   Güvenli sınır: Kısa süreli, amaç odaklı yakalama; gereksiz uzun PCAP biriktirme.

## **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Belirti:** Yerel ağda olduğu söylenen bir cihaz (ör. yazıcı) zaman zaman erişilemiyor. Kullanıcı: "İnternet var ama bu cihaz yok."

**Olasılık (katmanlı düşünme):**

-   L2/L3 sınırı: Hedef IP doğru olsa bile ARP çözümlemesi başarısız olabilir (yanıt yok).

-   Yerel kararsızlık: Kablosuz kalite dalgalanması ARP yanıtlarını "zamanlama" olarak etkileyebilir.

-   IP tarafı: Hedef IP yanlış olabilir veya aynı subnet değildir (sistematik kontrol Modül 8).

-   Tutarsızlık sinyali: Aynı IP'nin farklı zamanlarda farklı MAC'lere gitmesi (acele hüküm yok; kanıt topla).

**Doğrulama (güvenli):**

1.  **Doğru arayüzü doğrula:**

    a.  Windows: getmac /v veya ipconfig /all

    b.  Linux: ip link

    c.  macOS: ifconfig

2.  **ARP/komşu tablosu kanıtı:**

    a.  Windows/macOS: arp -a

    b.  Linux: ip neigh\
        Hedef IP için MAC var mı? "incomplete" benzeri bir durum var mı?

3.  **Wireshark ile kısa ARP gözlemi:**

    a.  Filtre: arp\
        Request görünüyor mu? Reply geliyor mu?

4.  **Karşı kanıt:**\
    Aynı yerel ağda izinli ikinci bir cihazdan da tabloya bak: sorun tek cihazda mı, genel mi?

**Sonuç (kanıta dayalı):**

-   Request var, Reply yoksa: yerelde hedef yanıt vermiyor olabilir veya yerel iletimde kopukluk olabilir (L2/L3 sınırı).

-   MAC eşlemesi tutarsız değişiyorsa: "tutarsızlık sinyali" olarak not edilir; daha fazla doğrulama planlanır (tek veriden kesin hüküm yok).

**Bulgu → Etki → Öneri → Kanıt (rapor formatı) kısa not:**

-   Bulgu: ARP tablosu / Wireshark deseni

-   Etki: Yerel cihaza erişim kesintili veya yok

-   Öneri: Kanıtın işaret ettiği katmanda düşük riskli kontroller (doğru arayüz, bağlantı kararlılığı, hedef IP doğruluğu --- IP tarafı Modül 8)

-   Kanıt: Komut çıktısı özeti + kısa ARP yakalaması

## **Terimler sözlüğü**

  **Terim**                **Türkçe karşılığı / açıklama**
  ------------------------ ----------------------------------------------------------------------
  MAC address              Yerel ağ kimliği (L2); frame üzerinde kaynak/hedef olarak yer alır
  NIC                      Network Interface Card; ağ arayüzü/ağ kartı
  Frame (Ethernet frame)   L2 veri birimi; MAC adresleri bu zarfın üstündedir
  Unicast                  Tek hedefe gönderim
  Broadcast                Yerelde herkese gönderim (Ethernet'te ff:ff:ff:ff:ff:ff)
  Multicast                Belirli bir gruba gönderim (giriş düzeyinde "grup adresleri")
  ARP                      IPv4'te IP → MAC eşlemesi yapan protokol
  ARP Request              MAC'i bilinmeyen IP için yerelde "kimde?" sorusu (genelde broadcast)
  ARP Reply                "Bende" cevabı; IP'nin MAC'ini bildirir (genelde unicast)
  ARP cache / ARP table    IP → MAC eşlemelerinin geçici tutulduğu önbellek/tablo
  OUI                      MAC'in ilk kısmı; üretici/organizasyon kimliği gibi düşünülür
  BSSID                    Wi-Fi erişim noktasının kimliği; pratikte MAC benzeri görünür
  MAC randomization        Gizlilik için bazı durumlarda MAC'in rastgeleleştirilmesi
  Incomplete (ARP)         Hedef IP için MAC çözümlenemedi; yanıt alınamadı sinyali
  Neighbor table           Özellikle Linux'ta ip neigh ile görülen komşu/eşleme tablosu

## **Kendini Değerlendir**

**1) Aynı yerel ağda iki cihaz konuşacak. Cihaz A, hedefin IP'sini biliyor ama hedefin MAC'ini bilmiyor. En doğru ifade hangisi?**\
A) A, doğrudan hedef IP'ye frame gönderir; MAC'e gerek yoktur.\
B) A, ARP Request'i unicast gönderir; sadece hedef cihaz alır.\
C) A, ARP ile IP → MAC eşlemesi yapmadan L2'de teslimat yapamaz.\
D) A, DNS ile hedef MAC'i çözer; ARP yalnız router'lar içindir.\
E) A, MAC'i bilmeden TCP bağlantısı kurar; ARP yalnız UDP içindir.

-   **Doğru:** C

-   **Gerekçe:** L2 teslimat MAC ile yapılır; IP bilmek yetmez. ARP Request genellikle broadcast'tır (B yanlış). DNS MAC çözmez (D yanlış). TCP/UDP ayrımı ARP'yi değiştirmez (E yanlış).

**2) arp -a / ip neigh çıktısında hedef IP için "incomplete" benzeri durum görüyorsun. Aşağıdaki yorumlardan hangisi en temkinli ve doğru yaklaşımdır?**\
A) Kesinlikle hedef cihaz kapalıdır; başka ihtimal yoktur.\
B) ARP çözümlemesi tamamlanmamıştır; yerelde yanıt alınamıyor olabilir, fakat hedef IP'nin doğruluğu gibi karşı kanıtlar da kontrol edilmelidir.\
C) DNS bozuk demektir; DNS düzeltilmeden ARP çalışmaz.\
D) Bu her zaman Wi-Fi parazitidir; kablolu ağda olmaz.\
E) Router bozulmuştur; LAN içindeki ARP'yi router yönetir.

-   **Doğru:** B

-   **Gerekçe:** "Incomplete" güçlü bir sinyal ama tek başına kesin hüküm değildir; yanlış IP/subnet gibi karşı olasılıklar olabilir. DNS (C) ve router (E) genellemesi bu bağlamda doğru değildir.

**3) Aşağıdakilerden hangisi, "MAC adresi her zaman değişmez" iddiasını en doğru şekilde düzeltir?**\
A) MAC tamamen rastgele bir sayıdır; üreticiyle ilgisi yoktur.\
B) MAC yalnızca IP ile birlikte çalışır; tek başına anlamı yoktur.\
C) MAC donanımda atanmış olabilir; ancak işletim sistemi seviyesinde görünen MAC bazı durumlarda değişebilir (ör. gizlilik amaçlı).\
D) MAC sadece router'larda vardır; uç cihazlarda yoktur.\
E) MAC sadece Wi-Fi'de vardır; Ethernet'te IP kullanılır.

-   **Doğru:** C

-   **Gerekçe:** Giriş seviyesinde doğru çerçeve: "donanımda atanmış" kavramı var, ama pratikte görünen MAC değişebilir. Diğer seçenekler temel kavramlarla çelişir.

**4) Bir kullanıcı "internet var ama ofisteki yazıcı yok" diyor. İlk kanıt adımı olarak hangisi daha rasyoneldir?**\
A) Hemen DNS sunucusunu değiştir.\
B) Yazıcının MAC'ini tahmin et ve tabloya elle ekle.\
C) Doğru arayüzü belirleyip ARP/komşu tablosunda yazıcının IP'si için eşleme var mı bak.\
D) Rastgele IP aralığında tarama yap.\
E) Uzak bir web sitesine ping at; oluyorsa sorun yoktur.

-   **Doğru:** C

-   **Gerekçe:** Şikâyet yerel bir kaynağa ait; önce yerel kanıt (L2/L3 sınırı) toplanır. DNS (A) erken sıçrama olabilir. Tarama (D) bu eğitimde sınır dışı ve gereksizdir.

**5) Wireshark'ta arp filtresiyle ARP Request görüyorsun ama ARP Reply yok. En iyi yorum hangisi?**\
A) ARP kesinlikle çalışıyor; reply görünmemesi normaldir.\
B) Request çıkıyor ama reply yok; hedef yanıt vermiyor olabilir veya yerel iletimde kopukluk olabilir.\
C) Bu durum sadece TCP portları kapalıyken olur.\
D) Bu doğrudan DNS arızasıdır.\
E) IP adresi gereksizdir; MAC ile her şey çözülür.

-   **Doğru:** B

-   **Gerekçe:** Request varlığı "soru sorulduğunu" kanıtlar; reply yokluğu "yanıt alınmadığını" gösterir. Diğer seçenekler katman karıştırır.

**6) "Switch'ler IP bilmez" ifadesi için en doğru giriş seviyesi formülasyon hangisi?**\
A) Tüm switch'ler sadece MAC'e bakar; IP asla kullanılmaz.\
B) Yerel L2 iletimde switch'ler MAC bilgisiyle frame'leri iletir; IP yönlendirme mantığı L3 katmanındadır.\
C) Switch'ler sadece DNS'e bakar.\
D) Switch'ler IP'ye göre çalışır; MAC eski bir teknolojidir.\
E) Switch'ler ARP cache yönetir, bu yüzden router'a gerek yoktur.

-   **Doğru:** B

-   **Gerekçe:** Giriş seviyesinde doğru çerçeve: L2 switching MAC ile, L3 routing IP ile ilişkilidir. Mutlak/genelleyici ifadeler (A) yanıltıcı olabilir.

**7) ARP cache'in "dinamik" doğası neyi gerektirir?**\
A) Tek bir kez bakmak her zaman yeterlidir.\
B) Çıktıya bakarken zaman/arayüz/hedef notu tutmak ve gerekirse tekrar gözlemlemek.\
C) ARP cache asla değişmez; yalnız elle temizlenir.\
D) ARP cache sadece router'da bulunur.\
E) ARP cache yalnız IPv6 içindir.

-   **Doğru:** B

-   **Gerekçe:** ARP cache değişebilir; desen görmek için izlenebilirlik önemlidir. Diğer seçenekler temel gerçeklerle uyumsuz.

**8) Aşağıdakilerden hangisi "karşı kanıt" üretmeye en iyi örnektir?**\
A) "Bana öyle geldi" demek.\
B) Tek bir cihazda arp -a bakıp kesin karar vermek.\
C) Aynı yerel ağdaki ikinci izinli cihazda da ARP/komşu tablosuna bakıp sorunun genelliğini sınamak.\
D) Her ihtimale karşı DNS'i sıfırlamak.\
E) Sorun çözülene kadar uzun süre Wireshark yakalayıp arşivlemek.

-   **Doğru:** C

-   **Gerekçe:** Karşı kanıt, hipotezi çürütebilecek ek gözlemdir. (E) gereksiz veri toplama riskini artırır; "kanıt" var ama "gerekli ve ölçülü" değil.

## **Kapanış: Bu modülde kazandıkların**

-   MAC'in yerel teslimatta (L2) temel kimlik olduğunu; IP ile rol farkını.

-   Yerel iletişimde "nihai hedef IP olsa bile" teslimat için MAC gerektiğini.

-   ARP'nin IPv4'te IP → MAC eşlemesi yaptığını; request/reply ve cache mantığını.

-   ARP/komşu tablosu ve Wireshark gözlemiyle **kanıt üretme** ve **karşı kanıt** yaklaşımını.

-   Windows/Linux/macOS komutlarıyla yalnızca **yerel ve güvenli** şekilde çıktı okuryazarlığı kazanmayı.

-   Yöntem seçimi ve sınır çizgisi: hızlı teşhis için doğru katmana inmek, gereksiz agresif adımlara girmemek.

# **MODÜL 8 --- IP, Subnetting + IPv6 Pratik (Kademeli)**

Modül 7'de yerel ağda "kim kime frame gönderiyor?" sorusunu MAC/ARP ile yerelleştirmiştik. İnternet gibi ağlar-arası dünyada ise asıl pusula **IP adresleme**dir: Cihazın "hangi ağda" olduğunu, hangi hedefin "yakın (aynı subnet)" hangisinin "uzak (başka ağ)" olduğunu IP + **prefix/subnet mask** belirler. Bu modül, subnetting'i bir matematik gösterisine çevirmeden; **kanıt toplayarak karar verme** refleksi kazandırır: "Ben hangi ağdayım? Ağ geçidim var mı? Hedef benimle aynı subnet'te mi?" Ardından minimum IPv6 okuryazarlığıyla, modern sistemlerde IPv4+IPv6'nın birlikte (dual-stack) görülebileceğini ve IPv6 adreslerini günlük teşhis için yeterli düzeyde okuyabilmeyi hedefler. Amaç "ayar yapmak" değil; **yanlış katmanda zaman kaybetmeden** doğru katmana tutunmaktır.

## **Hedefler**

Bu modülün sonunda:

-   IPv4 adresinin, subnet mask/prefix'in ve **default gateway** kavramının rolünü açıklar.

-   "Aynı subnet" kararını ezbersiz kurar; bir IP'nin hangi ağ aralığına düştüğünü **kanıta dayalı** yorumlar.

-   CIDR/prefix okuryazarlığıyla /24 ve /26 gibi örneklerde ağ aralığı ve host aralığını çıkarır.

-   Public/Private IP ayrımını kavrar; private adreslerin internete çıkışı için neden NAT gerektiğini **kavramsal** düzeyde bilir (detay Modül 10).

-   IPv6 adres formatını, kısaltma kurallarını ve temel adres türlerini (global unicast, link-local, loopback) minimum düzeyde ayırt eder.

-   Windows/Linux/macOS üzerinde yalnızca **okuma/denetim** amaçlı komutlarla IP/prefix/gateway kanıtı toplar; çıktıda kritik satırları seçer.

-   Yerel erişim problemlerinde yöntem seçer: **"Önce adresleme kanıtı → sonra üst katmanlar"** sırasını uygular.

## **8.1 IPv4 temelleri**

### **Ne anlama gelir?**

IPv4, 32 bitlik bir adresleme sistemidir. Cihazlar bunu bitler olarak "görür"; insanlar için okunabilir olsun diye çoğunlukla **dört parçalı onluk gösterim** (dotted decimal notation) kullanılır.

Troubleshooting açısından kritik nokta: **IP tek başına yeterli değildir.** Her zaman şu üçlü birlikte düşünülür:

-   **IP + Subnet mask / Prefix (CIDR):** "Benim ağım nerede başlıyor, nerede bitiyor?"

-   **Default gateway (varsayılan ağ geçidi):** "Subnet dışına çıkmam gerekirse ilk kapım neresi?"

**Pratik model**

-   IP + Prefix = "Hangi ağdayım?"

-   Gateway = "Ağdan dışarı çıkış kapım var mı?"

**İpucu (tek cümlelik teşhis refleksi)**\
"Bağlı görünüyor ama hiçbir yere gidemiyorum" şikâyetinde ilk soru: **IP/prefix/gateway üçlüsü tutarlı mı?** Tutarlı değilse DNS/uygulama gibi üst katmanlara erken atlamak genellikle yanlış pozitiftir.

IPv4 adresini, subnet mask/prefix iki parçaya böler:

-   **Network ID (ağ kısmı):** ortak "mahalle"

-   **Host ID (host kısmı):** o mahalledeki "bina numarası"

Bu ayrımı mask/prefix belirler.

### **Public (Genel) vs Private (Özel) IP --- kavramsal okuryazarlık**

IPv4 adresleri sınırlı olduğu için, pratikte iki farklı "kullanım alanı" görürsün:

-   **Public IP:** İnternet üzerinde yönlendirilebilir, küresel ölçekte eşsiz olma hedefi taşır.

-   **Private IP (RFC 1918):** Yerel ağlarda tekrar tekrar kullanılabilen, internette doğrudan yönlendirilmeyen adres alanlarıdır. Private adresle internete çıkmak için genellikle **NAT** gerekir (NAT'in çalışma akışı Modül 10'da).

**Dikkat (kapsam sınırı)**\
NAT ve "ev router'ı" davranışları bu modülün konusu değildir. Burada yalnızca şu farkındalık hedeflenir: "Adres türü (public/private) ve gateway/NAT ihtiyacı" adresleme kanıtını yorumlarken önemlidir.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Wi-Fi bağlı ama sayfalar açılmıyor": IP yok / yanlış prefix / gateway yok gibi adresleme sinyalleri sık görülür.

-   "Aynı ağdaki cihaza erişemiyorum": IP'ler aynı subnet'te değilse (veya mask/prefix yanlışsa) hedef "yakın" görünse bile erişim olmaz.

-   "Bazen çalışıyor bazen çalışmıyor": Yanlış gateway, yanlış subnet, çakışan adresler veya kararsız adresleme bu tip tutarsız davranışlar üretir.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

Amaç "dokunmadan" kanıt toplamak:

-   **Kanıt 1:** IPv4 adresi var mı?

-   **Kanıt 2:** Prefix/mask var mı ve mantıklı mı? (/24 mü, /26 mı?)

-   **Kanıt 3:** Default gateway var mı? Var ise, **aynı subnet'te mi olmalı?** (çoğu sahada evet)

**Karşı kanıt:** IP/prefix/gateway tutarlı görünse bile sorun üst katmanda olabilir. Bu modülün hedefi, "adresleme sağlam" kanıtını üretip üst katmana geçişi bilinçli yapabilmektir.

**Dikkat (tek başına IP yeterli değil)**\
"IP'im var" demek "ağım doğru" demek değildir. Yanlış prefix seni yanlış subnet'e yerleştirir; yanlış gateway subnet dışına çıkışı kilitleyebilir.

## **8.2 Subnetting (ezbersiz giriş)**

### **Ne anlama gelir?**

Subnetting, bir IP ağını daha küçük mantıksal ağlara bölme fikridir. Giriş seviyesinde subnetting'in amacı "hesap yarışması" değil; şu iki pratik ihtiyacı anlamaktır:

-   **Adres yönetimi:** Her yere aynı büyüklükte ağ vermek zorunda kalmamak

-   **Mantıksal düzen:** Broadcast alanını küçültmek, yönetimi kolaylaştırmak (güvenlik/segmentasyon derinliği bu seviyede yapılmaz)

Subnetting'i okumak için şu üç kavram yeterli:

-   **Prefix (CIDR):** Örn. /24, /26 → ağ kısmının uzunluğu

-   **Network address (ağ adresi):** subnet'in başlangıcı

-   **Broadcast address (IPv4):** subnet içindeki "herkese" adres

**Subnet mask'i "filtre" gibi düşün**

-   Mask/prefix cihazına şunu söyler: "Şu kısım **ağ**, şu kısım **host**."

-   Bu yüzden iki cihazın "aynı ağda" sayılması için **IP + mask/prefix birlikte** değerlendirilir.

**İpucu (ezbersiz yöntem seçimi)**\
Bir IP'nin hangi subnet'e düştüğünü bulurken her zaman ikili dönüşüme gömülmek zorunda değilsin. Giriş seviyesinde yaygın prefix'lerde "blok/aralık mantığı" ile hızlı karar verilir: "Hangi aralıktayım?"

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Aynı switch'e bağlı iki cihaz birbirini görmüyorsa, sorun her zaman kablo değildir; cihazlardan biri farklı subnet'e düşmüş olabilir.

-   Bir cihaz "gateway'i görüyor" gibi görünse bile, gateway yanlış subnet'teyse dışarı çıkış kilitlenir.

-   "Hedef aynı ağda sanıyordum" yanlış teşhisi, genelde "prefix'i görmezden gelmekten" doğar.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

**Örnek:** /24 okuma (yaygın)

-   Ağ: 192.0.2.0/24

-   Pratik okuma: 192.0.2.\* aynı subnet gibi düşünülebilir (prefix sabit).

-   Genel fikir: network 192.0.2.0, broadcast 192.0.2.255, hostlar arada.

**Örnek:** /26 okuma (daha küçük subnet)

-   /24, /26 ile 4 parçaya bölünür; blok aralıkları:

    -   192.0.2.0 -- 192.0.2.63

    -   192.0.2.64 -- 192.0.2.127

    -   192.0.2.128 -- 192.0.2.191

    -   192.0.2.192 -- 192.0.2.255

Diyelim ki cihaz IP'si **192.0.2.70**:

-   70, 64--127 aralığında → subnet: **192.0.2.64/26**

-   Broadcast: **192.0.2.127**

-   Kullanılabilir host aralığı fikri: **192.0.2.65 -- 192.0.2.126**

Buradaki hedef "mükemmel hesapçı" olmak değil; şu kanıtı üretebilmek:

-   "Bu cihaz şu subnet'te. Gateway de çoğunlukla aynı subnet'te olmalı."

**Dikkat (en yaygın hata: "aynı subnet" varsayımı)**\
İki IP aynı ilk üç oktete benziyor diye her zaman aynı subnet'te değildir. Prefix farklıysa "mahalle" farklı olabilir. Bu yüzden IP'yi **prefix ile birlikte** değerlendir.

## **8.3 IPv6 temelleri (minimum okuryazarlık)**

### **Ne anlama gelir?**

IPv6, 128 bitlik adresleme sistemidir. Giriş seviyesinde amaç IPv6'yı "konfigüre etmek" değil; günlük teşhiste IPv6'yı tanıyıp okuyabilmektir:

-   Bu adres IPv6 mı, nasıl yazılmış?

-   Prefix (örn. /64) neyi ifade ediyor?

-   Aynı cihazda IPv4 ve IPv6 birlikte görülebilir mi? (Evet; bu geçiş yaklaşımına **dual-stack** denir.)

IPv6 hexadecimal bloklardan oluşur ve : ile ayrılır. Kısaltma kuralları:

-   Baştaki sıfırlar kısaltılabilir (0db8 → db8)

-   Ardışık sıfır blokları **bir kez** :: ile kısaltılabilir

**Örnek:**\
2001:db8:1:2:0:0:0:10 → 2001:db8:1:2::10

**İpucu (IPv6'yı "okumak" için)**\
IPv6 uzun görünebilir; ama teşhiste çoğu zaman kilit soru şudur: "Aynı prefix'te miyiz?" Özellikle /64, yerel ağ okuryazarlığında sık karşılaşılır.

### **Önemli IPv6 adres türleri (okuryazarlık)**

-   **Global Unicast (2000::/3):** İnternette yönlendirilebilir (IPv4'teki public'e benzer).

-   **Link-Local (fe80::/10):** Her arayüzde otomatik oluşabilir; **yalnızca yerel linkte** geçerlidir, router üzerinden geçmez.

-   **Loopback (::1):** Cihazın kendisini işaret eder (IPv4'teki loopback kavramının karşılığı).

**Dikkat (yanlış yorum riski)**\
IPv6 görmek "sorun kesin IPv6" demek değildir. Bu modülün hedefi, IPv6'yı suçlamak değil; adresleme kanıtını doğru okuyabilmektir.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Aynı arayüzde hem IPv4 hem IPv6 adresi görülebilir; bazı uygulamalar IPv6'yı tercih edebilir.

-   "IPv4 var ama bazı servisler garip" gibi şikâyetlerde IPv6 varlığı bir sinyal olabilir; fakat bu modülde servis analizi yapılmaz. Burada hedef "IPv6 da var / türü şu" kanıtını çıkarabilmektir.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Kanıt 1:** Cihazda IPv6 adresi var mı?

-   **Kanıt 2:** Prefix uzunluğu var mı? (/64 gibi)

-   **Kanıt 3:** Kısaltma doğru mu? (:: birden fazla kez kullanılmaz)

## **8.4 Komutlar (okuma/denetim)**

Aşağıdaki komutlar yalnızca **yerel/izinli** ortamda, yalnızca **okuma ve denetim** amaçlıdır. Amaç "keşif" değil; cihazın kendini nerede sandığını netleştirmektir.

### **Windows**

**Komut: ipconfig**

-   Amaç: Aktif arayüzlerde IPv4/IPv6 ve gateway bilgisine hızlı bakış.

-   Beklenen çıktı türü: IPv4 Address / Subnet Mask / Default Gateway satırları.

-   Yorum ipucu:

    -   IPv4 adresi var mı?

    -   Subnet mask/prefix var mı?

    -   Default gateway var mı?

-   Güvenli sınır: Yerel görüntüleme.

**Komut: ipconfig /all**

-   Amaç: Daha ayrıntılı kanıt (birden çok arayüz varsa kritik).

-   Beklenen çıktı türü: Arayüz blokları; IPv4/IPv6, mask, gateway, DNS vb.

-   Yorum ipucu: "Doğru arayüzü" okuduğundan emin ol (Wi-Fi/Ethernet/sanal adaptör).

-   Güvenli sınır: Yerel görüntüleme.

**Komut: route print**

-   Amaç: Default route ve gateway mantığını denetlemek.

-   Beklenen çıktı türü: Route tablosu; varsayılan rota satırı.

-   Yorum ipucu: Default route yoksa subnet dışı erişim beklenmez.

-   Güvenli sınır: Yerel görüntüleme.

**Köprü notu:** Yerel komşu çözümleme (ARP) gerekiyorsa, bunun kanıt okuryazarlığı Modül 7'dedir.

### **Linux**

**Komut: ip a**

-   Amaç: Arayüzlerin IPv4/IPv6 adreslerini görmek.

-   Beklenen çıktı türü: inet (IPv4) ve inet6 (IPv6) satırları prefix ile birlikte.

-   Yorum ipucu: Hangi arayüz aktif? IP/prefix var mı?

-   Güvenli sınır: Yerel görüntüleme.

**Komut: ip route**

-   Amaç: Varsayılan rota ve gateway kanıtını görmek.

-   Beklenen çıktı türü: default via \... satırı + diğer ağlar.

-   Yorum ipucu: Default route yoksa "dışarı çıkamama" normaldir.

-   Güvenli sınır: Yerel görüntüleme.

### **macOS**

**Komut: ifconfig**

-   Amaç: Arayüzlerde IPv4/IPv6 ve arayüz durumunu görmek.

-   Beklenen çıktı türü: inet (IPv4), inet6 (IPv6) satırları.

-   Yorum ipucu: Doğru arayüzü (ör. en0/en1) tespit etmeden yorum yapma.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: netstat -rn**

-   Amaç: Yönlendirme tablosundan default route/gateway kanıtı almak.

-   Beklenen çıktı türü: default satırı ve gateway sütunu.

-   Yorum ipucu: Default route yoksa subnet dışı trafik "nereye gideceğini" bilemez.

-   Güvenli sınır: Yerel görüntüleme.

**Dikkat (kanıt standardı)**\
Komut çıktısı alırken şu dördünü not etmek iyi bir disiplindir: **zaman**, **hangi arayüz**, **IP/prefix**, **gateway**. Sonradan "neye dayanarak söyledim?" sorusunu cevaplar.

## **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Belirti:** Aynı switch'e bağlı iki bilgisayar birbirini "bazen" görüyor gibi; ama çoğu zaman erişim yok. Kullanıcı "kablo sağlam" diyor.

**Olasılık (katmanlı düşünme):**

-   **L3 adresleme tutarsızlığı:** İki cihazın subnet algısı farklı olabilir (özellikle mask/prefix uyumsuzluğu).

-   **Yanlış yöntem seçimi riski:** "DNS bozuk" gibi üst katman varsayımları, adresleme kanıtı yokken yanlış pozitife dönüşür.

-   (Köprü) **L2/L3 sınırı**: Yerel komşu çözümleme sinyalleri Modül 7'de ele alınır; bu senaryoda ana hedef L3 kanıtıdır.

**Örnek (uydurma adreslerle):**

-   PC-A: 192.0.2.10 ve prefix /24

-   PC-B: 192.0.2.70 ve prefix /26

**Doğrulama (güvenli):**

1.  İki bilgisayarda da IP/prefix/gateway kanıtını çıkar:

    a.  Windows: ipconfig /all

    b.  Linux: ip a + ip route

    c.  macOS: ifconfig + netstat -rn

2.  "Aynı subnet" kontrolünü yap:

    a.  PC-B'nin /26 aralığı: 192.0.2.64 -- 192.0.2.127 → 192.0.2.10 bu aralıkta **değil**

    b.  PC-A'nın /24 algısı: 192.0.2.\* → 192.0.2.70 **aynı ağda gibi** görünebilir

3.  Karşı kanıt üret (yorumunu sağlamlaştır):

    a.  Eğer PC-B "A'yı uzak sanıyorsa", A'ya gitmek için gateway'e ihtiyaç duyar. Gateway yoksa veya yanlışsa erişim beklenmez.

**Sonuç (kanıta dayalı):**

-   **Bulgu:** Aynı fiziksel ortamda **prefix uyumsuzluğu** var; cihazların "aynı subnet" algısı farklı.

-   **Etki:** Yerel iletişim tutarsız/başarısız; problem üst katman (DNS/uygulama) olmadan önce L3'te kilitleniyor.

-   **Öneri:** Yetkili ortamda adresleme standardize edilmeli: aynı segmentteki cihazlar için IP/prefix tutarlı hale getirilmeli (ayar adımı tarif edilmez; yalnızca hedef tanımlanır).

-   **Kanıt:** Her iki cihazın komut çıktısından IP/prefix/gateway satırları + zaman/arayüz notu.

## **Terimler Sözlüğü**

  **Terim**                 **Türkçe karşılığı / açıklama**
  ------------------------- -------------------------------------------------------------------------------------------------
  IPv4                      32 bitlik adresleme sistemi; çoğunlukla dotted decimal gösterimle yazılır
  Dotted Decimal Notation   IPv4'ün dört parçalı onluk gösterimi
  IP (Internet Protocol)    Mantıksal adresleme; ağlar-arası yön bulma için temel
  Subnet mask               IPv4'te ağ/host sınırını belirleyen maske
  Prefix / CIDR             /24, /26 gibi kısa gösterim; ağ kısmının uzunluğu
  Subnetting                Bir IP ağını daha küçük mantıksal ağlara bölme yaklaşımı
  Network ID                Adresin "ağ" kısmı (ortak mahalle)
  Host ID                   Adresin "host" kısmı (cihaz/arayüz numarası)
  Default gateway           Subnet dışına çıkış için ilk kapı
  Default route             "Her yere gitmek için" kullanılan varsayılan yönlendirme kaydı
  Public IP                 İnternette yönlendirilebilir genel adresleme (kavramsal)
  Private IP (RFC 1918)     Yerel ağlarda tekrar kullanılabilen, internette doğrudan yönlendirilmeyen adresleme (kavramsal)
  NAT                       Private → public geçişi için kullanılan adres çevirme yaklaşımı (detay Modül 10)
  IPv6                      128 bitlik yeni nesil adresleme sistemi
  Link-Local (IPv6)         fe80::/10 ile başlayan, yalnızca yerel linkte geçerli adres türü
  Global Unicast (IPv6)     2000::/3 aralığında; internette yönlendirilebilir IPv6 adres türü
  Loopback                  Cihazın kendisini işaret eden adresleme kavramı (IPv6'da ::1)
  Dual-Stack                Aynı cihazda IPv4 ve IPv6'nın birlikte bulunması yaklaşımı

## **Kendini Değerlendir**

**1) Bir cihazın IPv4 adresi 192.0.2.25, prefix'i /26. Default gateway olarak 192.0.2.129 görülüyor. En doğru yorum hangisi?**\
A) Her şey tutarlı; gateway aynı subnet'te olmalıdır.\
B) Gateway muhtemelen farklı subnet'te; bu, subnet dışı erişimi bozabilir.\
C) /26 ile gateway'in subnet'te olup olmadığı anlaşılamaz.\
D) Gateway'in subnet'te olması gerekmez; yalnızca DNS önemli.\
E) Bu veri yalnızca L2 ile ilgilidir; L3 teşhisi yapılamaz.\
**Doğru:** B\
**Gerekçe:** /26 blokları 0--63, 64--127, 128--191... şeklindedir. 192.0.2.25 ilk blokta (0--63), 192.0.2.129 ise 128--191 bloğunda; çoğu senaryoda gateway aynı subnet'te beklenir. Diğer şıklar ya belirsizliği yanlış yönetir ya da L3'ü yanlış dışlar.

**2) Aynı switch'e bağlı iki cihaz var: PC-A 192.0.2.10/24, PC-B 192.0.2.70/26. Gateway tanımlı değil. En olası davranış hangisi?**\
A) İki yönlü iletişim sorunsuz olur; aynı 192.0.2.\* olduğu için.\
B) PC-A, PC-B'yi "yakın" görür; PC-B, PC-A'yı "uzak" görür ve iletişim tek yönlü/tutarsız olabilir.\
C) İletişim yalnızca DNS doğruysa olur.\
D) İletişim ancak NAT varsa olur.\
E) Bu durum yalnızca ARP ile ilgilidir; prefix'in etkisi yoktur.\
**Doğru:** B\
**Gerekçe:** /24 algısı B'yi aynı subnet'te sayabilir; /26 algısı A'yı kendi aralığı dışında sayar ve gateway olmadığında "uzak" hedefe gidiş bozulur. Diğer şıklar ya katmanı karıştırır ya da alakasız bağımlılıklar ekler.

**3) "Bağlı görünüyor ama internete çıkamıyorum" şikâyetinde, aşağıdaki kanıtlardan hangisi en güçlü şekilde "önce L3 adreslemeye bak" dedirtir?**\
A) Tarayıcı hata veriyor.\
B) Wi-Fi sinyal çubukları tam.\
C) Komut çıktısında default route yok ve default gateway alanı boş.\
D) Bir uygulama güncellenmiyor.\
E) Bir web sitesi açılmıyor ama diğeri açılıyor.\
**Doğru:** C\
**Gerekçe:** Default route/gateway eksikliği L3'te subnet dışı erişimi doğrudan engeller. Diğerleri üst katman semptomlarıdır; kanıt değeri daha düşüktür.

**4) Aşağıdaki ifadelerden hangisi "kanıt + belirsizlik" yaklaşımına en uygundur?**\
A) "İnternet yoksa kesin DNS bozuk."\
B) "IP var; o halde her şey tamam."\
C) "IP/prefix/gateway tutarlı görünüyor; bu kanıtla üst katmanlara geçebilirim."\
D) "Gateway varsa sorun olamaz."\
E) "Subnetting yalnızca büyük şirketlerde olur."\
**Doğru:** C\
**Gerekçe:** C, adresleme kanıtını çıkarıp karar eşiğini doğru koyar. A/B/D kesinlik hatası yapar; E genelleme yanlışıdır.

**5) IPv6 kısaltma kuralları için hangisi doğrudur?**\
A) Aynı adreste :: birden fazla kez kullanılabilir.\
B) Baştaki sıfırlar hiçbir zaman atılamaz.\
C) Ardışık sıfır blokları yalnızca bir kez :: ile kısaltılabilir.\
D) IPv6 adresleri onluk sayı sistemiyle yazılır.\
E) /64 prefix yerel ağda kullanılmaz.\
**Doğru:** C\
**Gerekçe:** :: tek seferlik "sıfır blokları kısaltmasıdır". A kural ihlali; B yanlış; D yanlış; E genellemeyle yanlıştır.

**6) Aşağıdaki IPv6 adres türü eşleştirmelerinden hangisi en doğrudur?**\
A) Link-local → 2000::/3\
B) Global unicast → fe80::/10\
C) Loopback → ::1\
D) Global unicast → ::1\
E) Link-local → /128\
**Doğru:** C\
**Gerekçe:** Loopback IPv6'da ::1'dir. Diğerleri tür/prefix karıştırır veya anlamsız genellemeler yapar.

**7) "Private IP" kavramı için en doğru ifade hangisi?**\
A) İnternette her zaman yönlendirilebilir ve eşsizdir.\
B) Yerel ağda kullanılabilir; internete doğrudan yönlendirme için genellikle NAT gerekir.\
C) Yalnızca IPv6'da vardır.\
D) Gateway'e ihtiyaç duymaz.\
E) Subnet mask ile aynı şeydir.\
**Doğru:** B\
**Gerekçe:** Private adresler yerel kullanım içindir; internete çıkışta NAT kavramsal olarak devreye girer. Diğer şıklar kavramları karıştırır.

**8) ip route çıktısında yalnızca yerel subnet rotası görünüyor; default via \... satırı yok. Bu kanıt en çok neyi destekler?**\
A) Aynı subnet içindeki hedeflere erişim tamamen imkânsızdır.\
B) Subnet dışı hedeflere erişim beklenmez; önce gateway/default route doğrulanmalıdır.\
C) DNS kesin bozuktur.\
D) Sorun yalnızca kablodadır.\
E) Bu çıktı yalnızca IPv6 için geçerlidir.\
**Doğru:** B\
**Gerekçe:** Default route yoksa cihaz "başka ağlara" nasıl gideceğini bilemez. A aşırı genelleme; C/D/E katman hatası.

**9) /26 prefix okuryazarlığında "blok/aralık" yöntemiyle aşağıdakilerden hangisi doğrudur?**\
A) 192.0.2.70 her zaman 192.0.2.0/26 içindedir.\
B) 192.0.2.70, 192.0.2.64/26 aralığına düşer.\
C) /26 ile ağ asla bölünmez.\
D) Broadcast kavramı IPv4'te yoktur.\
E) Prefix yalnızca DNS'i etkiler.\
**Doğru:** B\
**Gerekçe:** /26 blokları 0--63, 64--127... olduğundan 70 ikinci bloktadır. Diğerleri temel kavram hatası içerir.

**10) Bir komut çıktısında birden fazla arayüz görünüyorsa, en güvenli yöntem seçimi hangisidir?**\
A) İlk gördüğün arayüzü seçip devam etmek.\
B) "Doğru arayüz hangisi?" sorusunu kanıtla netleştirmek; IP/prefix/gateway'i o arayüz için okumak.\
C) Arayüz fark etmez; yalnızca uygulama hatasıdır.\
D) Gateway'i rastgele değiştirmek.\
E) Sorunu çözmek için mutlaka tarama yapmak.\
**Doğru:** B\
**Gerekçe:** Yanlış arayüz üzerinden yorum, en sık yanlış pozitiftir. D ve E güvenli sınırın dışına taşar; A/C kanıtsızdır.

## **Kapanış: Bu modülden ne kazandın?**

-   IPv4'te troubleshooting için temel kanıt üçlüsünü: **IP + prefix/mask + default gateway** okumayı.

-   "Aynı subnet" kararını ezbersiz kurmayı; /24 ve /26 gibi prefix'leri aralık mantığıyla yorumlamayı.

-   Subnetting'in "neden"ini ve network/broadcast/host aralığı okuryazarlığını giriş seviyesinde çıkarmayı.

-   Public/Private IP farkındalığıyla, NAT ihtiyacının adresleme yorumuna nasıl bağlandığını kavramsal düzeyde görmeyi.

-   IPv6'yı minimum düzeyde okumayı: kısaltma kuralları, temel adres türleri ve dual-stack farkındalığı.

-   Windows/Linux/macOS'ta yalnız **okuma/denetim** komutlarıyla kanıt toplamayı; üst katmana geçişi kanıta dayandırmayı.

# **MODÜL 9 --- TCP/UDP, Portlar, Servis Okuryazarlığı**

IP adresleme (Modül 8) veriyi "doğru cihaza" kadar getirir; fakat aynı cihazın içinde aynı anda onlarca uygulama/servis çalışır. Gelen verinin **hangi uygulamaya ait olduğunu** ayırt eden şey çoğu zaman **portlar** ve **taşıma katmanı (TCP/UDP)** mantığıdır. Bu modülün odağı port numarası ezberlemek değil; "IP doğru ama hâlâ çalışmıyor" şikâyetini **L4 düzeyinde kanıt üreterek** netleştirmektir: bağlantı **kurulamıyor mu**, **reddediliyor mu**, yoksa **kuruluyor ama uygulama yanıtı mı sorunlu**? Komutlar yalnızca **yerel/izinli** ortamda ve yalnızca **tek hedef--tek port--tek servis** doğrulaması için ele alınır; keşif/tarama yaklaşımı bu modülün dışında kalır.

## **Hedefler**

Bu modülün sonunda:

-   TCP ve UDP'nin "**güvenilirlik vs hız/overhead**" farkını ve tipik kullanım mantığını açıklayabileceksin.

-   IP'nin cihazı, portun ise cihaz içindeki **servisi/uygulamayı** temsil ettiğini; **socket/endpoint** fikrini kavrayacaksın.

-   TCP **3-Way Handshake** (SYN/SYN-ACK/ACK) ve temel bağlantı durumlarını (**LISTENING / ESTABLISHED**) çıktılar üzerinden yorumlayabileceksin.

-   "Servise erişemiyorum" durumunda sonucu **timeout / refused / unreachable** gibi sınıflandırıp neyi işaret ettiğini ayırt edebileceksin.

-   Windows/Linux/macOS'ta **okuma/denetim** komutlarıyla (listening port, süreç ilişkisi, tek port testi) kanıt toplayıp kritik satırları seçebileceksin.

-   "Önce L3 adresleme kanıtı → sonra L4 servis kanıtı → sonra DNS/uygulama" sırasını koruyarak yanlış katmanda zaman kaybetmeyeceksin.

## **Ana İçerik**

## **9.1 TCP vs UDP**

### **Ne anlama gelir?**

Taşıma katmanı (Layer 4), verinin uygulamalar arasında **nasıl taşınacağını** belirler. İki temel yaklaşım vardır:

**TCP (Transmission Control Protocol) --- "Garantili Teslimat"**

-   **Bağlantı temelli (connection-oriented):** Veri akışı başlamadan önce bağlantı kurar.

-   **3-Way Handshake:**\
    SYN (istemci → sunucu) → SYN-ACK (sunucu → istemci) → ACK (istemci → sunucu)

-   **Hata kontrolü & yeniden iletim:** Onay (ACK) gelmeyen veriyi yeniden gönderebilir.

-   **Sıralama:** Paketler karışık gelse bile hedefte sıraya koyar.

-   Tipik örnekler: HTTP/HTTPS, e-posta (SMTP), pek çok dosya aktarımı.

**UDP (User Datagram Protocol) --- "Hızlı Teslimat"**

-   **Bağlantısız (connectionless):** El sıkışma yok; gönderir ve devam eder.

-   **Garanti yok:** Kaybolan datagram için otomatik yeniden iletim beklemez.

-   Tipik örnekler: DNS (çoğunlukla), bazı gerçek zamanlı ses/görüntü ve oyun trafiği.

**İpucu (yanlış ikiliğe düşme):**\
"TCP = kesin sorunsuz, UDP = kesin hızlı" gibi genellemeler yanıltıcıdır. Sorun çözmede değerli olan, protokolün felsefesini bilip **belirtiyi doğru okumaktır**.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Web erişimi çoğunlukla TCP tabanlıdır: TCP bağlantısı kurulamazsa tarayıcı "site açılmıyor" der.

-   TCP'de karşı uç yanıt vermiyorsa istemci **timeout** dolana kadar bekler; bu "dondu" hissi oluşturabilir.

-   UDP'de "bağlantı kuruldu" sinyali olmadığı için, doğrulama çoğu zaman **uygulama yanıtı** veya üst katman davranışına dayanır (bu modülde yöntem mantığı kurulur; DNS akışı Modül 10'da detaylanır).

### **Nasıl doğrularım/çürütürüm? (güvenli)**

Bu modülde amaç tek hamlede "sebep" bulmak değil; **L4 kanıtını** temizlemek:

-   **TCP'de sonuç sınıflandırma:**

    -   **Refused (reddedildi):** "Kapıya ulaştım ama içeride dinleyen yok / aktif reddediliyor."

    -   **Timeout:** "Kapıya gidemedim ya da kapı cevap vermedi." (kural düşürüyor, yanıt gelmiyor, arada engel var)

-   **UDP'de doğrulama yaklaşımı:** UDP'nin doğası gereği "kuruldu" mesajı yoktur; bu yüzden "çalışıyor mu?" sorusu çoğu zaman **servis bağlamında** değerlendirilir (ör. DNS sorgusu yanıtlıyor mu?).

**Dikkat (TCP handshake okuryazarlığı):**\
SYN gidiyor ama SYN-ACK gelmiyorsa, olası yorumlar "sunucu/servis dinlemiyor" veya "arada kural/engel var" olabilir. Bu, kesin hüküm değil **hipotez** üretir; kanıtı (port dinliyor mu, yerelden erişim var mı, farklı istemciyle aynı mı) tamamlamadan sonuç yazma.

## **9.2 Portlar ve servisler**

### **Ne anlama gelir?**

**IP adresi** veriyi doğru "binaya" getirir. Ancak aynı binada yüzlerce "daire" (uygulama) olabilir. **Port numarası**, gelen verinin hangi uygulamaya ait olduğunu ayıran "daire numarası" gibidir.

Bir iletişimi anlamlı kılan üçlü:

-   **IP** (hangi cihaz?)

-   **Protokol** (TCP mi UDP mi?)

-   **Port** (hangi servis?)

Bu üçlü birlikte **socket/endpoint** fikrini oluşturur.

**Port aralığı:** 0--65535

**Port kategorileri (okuryazarlık):**

-   **Well-known (0--1023):** Yaygın standart servisler (HTTP 80, HTTPS 443, SSH 22, DNS 53 vb.)

-   **Registered (1024--49151):** Üreticiler/uygulamalar tarafından sık kullanılan aralık

-   **Dynamic/Private (49152--65535):** İstemcinin çıkışta geçici kullandığı portlar (ephemeral)

**Yaygın port örnekleri (ezber için değil, bağlam için):**

-   80/TCP → HTTP

-   443/TCP → HTTPS

-   22/TCP → SSH

-   53/UDP (ve bazen TCP) → DNS *(detay Modül 10)*

-   25/TCP → SMTP

**İpucu (port ezberi yerine "doğru soru"):**\
Bir servise erişim sorusunda ilk refleks "hangi port?" değil; "**hangi protokol + hangi port** bekleniyor?" olmalı. Yanlış protokol/port, doğru hedefte bile hatalı belirti üretir.

### **Örnek:**

İstemci, example.com üzerindeki HTTPS servisine bağlanıyor:

-   Hedef: example.com:443/TCP

-   İstemci, bağlantı için geçici bir port seçebilir: ör. 198.51.100.25:50123/TCP → example.com:443/TCP\
    Buradaki **50123** istemcinin "çıkış kapısıdır"; sunucunun servisi değildir.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Site açılmıyor" ama yalnızca HTTP (80) çalışıyor olabilir; HTTPS (443) kapalı/engelli olabilir.

-   "Servis çalışıyor sanıyorduk" ama ilgili portta **LISTENING** yoksa, uygulama çalışmıyor veya yanlış porta bağlı olabilir.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Kanıt 1:** Doğru port/protokol mü test ediyorum?

-   **Kanıt 2:** Karşı tarafta gerçekten **listening** var mı? (yetkili/yerel erişim varsa)

-   **Kanıt 3:** Sonuç türü nedir? (timeout vs refused)

-   **Karşı kanıt:** Port "açık" görünse bile uygulama içeride hata veriyor olabilir; bu modül, önce "L4 seviyesinde ne biliyoruz?"u netleştirir.

## **9.3 Servis erişimini "güvenli test etme" mantığı**

### **Ne anlama gelir?**

Servise erişim testi, **keşif** değildir. Bu modülde test şu ilkeye dayanır:

-   **Sadece izinli hedef**

-   **Tek hedef -- tek port -- tek protokol**

-   **Düşük risk (yük bindirmeyen, kısa süreli)**

-   **Kanıt odaklı (çıktı + zaman + arayüz notu)**

Bu sayede "erişemiyorum" cümlesi şuna dönüşür:

-   "TCP 443 denemesi **timeout** oldu."

-   "TCP 443 denemesi **refused** döndü."

-   "Yerelde dinliyor; uzaktan erişimde sorun var."

**Dikkat (sınır çizgisi):**\
"Port aralığı deneyeyim, hangisi açıksa bulayım" yaklaşımı bu modülde yok. Bu, tarama davranışına yaklaşır ve yetkisiz ortamlarda saldırı hazırlığı (recon) gibi algılanabilir. Buradaki test **yalnızca bilinen servisi doğrulama** içindir.

**İpucu (katmanlı kısa çerçeve):**\
Bir web sitesi açılmıyorsa, zihninde şu üç soruyu sırala:\
(1) "Binaya gidiyor muyum?" (L3 adresleme sağlam mı?)\
(2) "Kapı açık mı?" (L4 port erişimi)\
(3) "İçeride hizmet veriyor mu?" (uygulama)\
Bu modül özellikle (2)'yi kanıtlamayı öğretir.

### **Örnek:**

Bir web servisinde:

-   L3 sağlam olabilir (ağa bağlısın, adresleme doğru).

-   Ama L4 kapalıysa (443 engelli/servis dinlemiyor) tarayıcı yine açamaz.

-   L4 açık olsa bile uygulama HTTP 500 gibi hata verebilir (bu modülde sadece farkındalık).

## **9.4 Komutlar ve araçlar**

Aşağıdaki komutlar **yalnızca yerel/izinli** ortamda, **okuma/denetim** ve **tek servis doğrulaması** içindir. Amaç "bulmak" değil; mevcut şikâyeti kanıtlamak ve çıktıyı okumaktır.

### **Windows**

**Komut: netstat -ano**

-   Amaç: Dinleyen portları ve aktif bağlantıları görmek; PID ile süreç ilişkisini kurmak.

-   Beklenen çıktı: LISTENING/ESTABLISHED satırları, yerel/uzak adres ve portlar, PID.

-   Yorum ipucu: Şikâyet edilen port **LISTENING** değilse "servis çalışıyor" varsayımı zayıflar.

-   Güvenli sınır: Yerel görüntüleme.

**Komut (PowerShell): Test-NetConnection example.com -Port 443**

-   Amaç: Tek hedef--tek TCP port erişimi kanıtı üretmek (tarayıcı olmadan).

-   Beklenen çıktı: TcpTestSucceeded : True/False gibi özet.

-   Yorum ipucu: False "neden"i tek başına söylemez; ama L4 erişim kanıtıdır.

-   Güvenli sınır: Tek port, kısa süreli.

**Komut: curl -I <https://example.com>**

-   Amaç: Uygulamaya derin girmeden, başlık düzeyinde yanıt var mı görmek.

-   Beklenen çıktı: HTTP status satırı (200/301/403 vb.) + header'lar.

-   Yorum ipucu: Yanıt geliyorsa L4 hattı büyük ölçüde çalışıyordur; gelmiyorsa önce Test-NetConnection ile L4 kanıtını kontrol et.

-   Güvenli sınır: Okuma amaçlı, düşük trafik.

### **Linux**

**Komut: ss -tulpen**

-   Amaç: Dinleyen TCP/UDP portları ve hangi sürecin kullandığını görmek (modern netstat alternatifi).

-   Beklenen çıktı: LISTEN satırları; portlar; process bilgisi.

-   Yorum ipucu: Beklenen port LISTEN değilse sorun "ağ" değil "servis" olabilir.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: nc -vz example.com 443**

-   Amaç: Tek hedef--tek TCP port için erişim kanıtı almak.

-   Beklenen çıktı: succeeded / failed benzeri sonuç.

-   Yorum ipucu: succeeded TCP el sıkışmasının kurulabildiğini destekler; timeout benzeri sonuçlar engel/yanıt yokluğu sinyali verir.

-   Güvenli sınır: Kesinlikle port aralığı yok; tek port.

**Komut (alternatif, telnet yoksa): curl -v telnet://192.0.2.10:80**

-   Amaç: Belirli bir porta TCP bağlantısı kurulabiliyor mu görmek (okuma amaçlı).

-   Beklenen çıktı: Connected benzeri bağlantı ifadesi (bağlantı kurulursa).

-   Yorum ipucu: Bu, "port erişimi var mı?" kanıtıdır; uygulama yanıtı ayrı bir katmandır.

-   Güvenli sınır: Yalnızca izinli hedefte, tek port.

### **macOS**

**Komut: netstat -an \| grep LISTEN**

-   Amaç: Dinleyen portlara hızlı bakış.

-   Beklenen çıktı: LISTEN durumundaki socket satırları.

-   Yorum ipucu: Beklenen port dinlemiyorsa "internet yok" demeden önce servis durumunu sorgula.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: lsof -iTCP -sTCP:LISTEN**

-   Amaç: Hangi uygulamanın hangi TCP portunda dinlediğini görmek.

-   Beklenen çıktı: Process adı + port bilgisi.

-   Yorum ipucu: "Port açık" bilgisini somut bir süreçle eşlemek kanıt kalitesini artırır.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: nc -vz example.com 443**

-   Amaç/çıktı/yorum/sınır: Linux'tekiyle aynı (tek hedef--tek port).

**Dikkat (kanıt standardı):**\
Çıktı alırken şu dört notu eklemek iyi bir disiplindir: **zaman**, **hangi arayüz**, **hedef/port**, **sonuç**. "Bulgu → Etki → Öneri → Kanıt (rapor formatı)" yazarken izlenebilirlik sağlar.

## **Örnek: Troubleshooting mini senaryosu (yerel/izinli, tarama yok)**

**Belirti:** İzinli bir ortamda yeni kurulan web sunucusuna 192.0.2.50 adresinden tarayıcıyla girilemiyor ("sayfa görüntülenemiyor").

**Olasılık (katmanlı düşünme):**

-   L4: TCP/80 veya TCP/443 erişimi engelli (timeout) ya da servis dinlemiyor (refused).

-   Üst katman: L4 açık olsa bile uygulama hata veriyor olabilir (bu modülde sadece L4 kanıtı netleştirilir).

**Doğrulama (güvenli):**

1.  **Tek port testi:**

    a.  Windows istemciden: Test-NetConnection 192.0.2.50 -Port 80

    b.  Linux/macOS istemciden: nc -vz 192.0.2.50 80\
        Sonuç **timeout** mu, **refused** mı, yoksa başarılı mı? Not al.

2.  **Sunucu tarafında (yetkiliysen) dinleme kanıtı:**

    a.  Windows: netstat -ano çıktısında 80/443 **LISTENING** var mı?

    b.  Linux: ss -tulpen çıktısında 80/443 **LISTEN** var mı?

3.  **Karar (kanıta dayalı):**

    a.  İstemci testinde başarısız + sunucuda LISTEN yok → servis çalışmıyor/yanlış portta.

    b.  Sunucuda LISTEN var ama istemci testinde timeout → arada kural/engel ihtimali artar (bu modülde ayar adımı tarif edilmez; sadece "yetkili ekip kuralı gözden geçirmeli" denir).

**Bulgu → Etki → Öneri → Kanıt (rapor formatı) kısa not:**

-   **Bulgu:** Test-NetConnection/nc sonucu + sunucuda netstat/ss dinleme kanıtı (özet), zaman/arayüz

-   **Etki:** Kullanıcı web servisine erişemiyor

-   **Öneri:** Kanıtın işaret ettiği katmanda (servis dinleme / erişim kısıtı) yetkili kontrol

-   **Kanıt:** Komut çıktısı özeti + tarih/saat

## **Terimler Sözlüğü**

  **Terim**            **Türkçe karşılığı / açıklama**
  -------------------- ---------------------------------------------------------------------------------------
  TCP                  Bağlantı temelli taşıma protokolü; teslim/sıra kontrolü ve el sıkışma mantığı
  UDP                  Bağlantısız taşıma protokolü; düşük overhead, garanti/yeniden iletim uygulamaya bağlı
  Port                 0--65535 arası mantıksal kapı numarası; IP üzerindeki servisleri ayırır
  Service              Belirli port/protokolde dinleyen uygulama/hizmet (HTTP, HTTPS vb.)
  Socket / Endpoint    IP + protokol (TCP/UDP) + port birleşimiyle tanımlanan uç nokta
  3-Way Handshake      TCP bağlantısını başlatan SYN/SYN-ACK/ACK süreci
  LISTENING / LISTEN   Servisin gelen bağlantıları kabul etmeye hazır olduğu durum
  ESTABLISHED          TCP bağlantısının kurulduğu ve veri akışının başladığı durum
  Timeout              Belirli sürede yanıt alınamaması; engel/yanıt yokluğu sinyali
  Refused              Port erişilebilir ama dinleyen servis yok veya aktif reddetme sinyali
  Ephemeral Port       İstemcinin bağlantı için geçici kullandığı dinamik çıkış portu
  Firewall             Trafiğe izin/engel koyan kural katmanı (bu modülde konfigürasyon anlatılmaz)

## **Kendini Değerlendir**

1.  Bir kullanıcı "IP/prefix/gateway doğru, ama site açılmıyor" diyor. Test-NetConnection example.com -Port 443 sonucu **False**. Bu sonuç tek başına en doğru neyi ifade eder?\
    A) DNS kesin bozuk, çünkü HTTPS çalışmıyor\
    B) TCP/443'e erişim kanıtı yok; neden için ek kanıt gerekir (timeout/refused ayrımı, sunucu dinleme durumu)\
    C) UDP sorunu var; çünkü web UDP kullanır\
    D) Uygulama kesin HTTP 500 veriyor\
    E) Sorun mutlaka istemcinin ekran kartı sürücüsündedir\
    **Doğru:** B\
    **Gerekçe:** Test, TCP/443 erişiminin başarısız olduğunu gösterir ama sebep belirtmez. A/D "üst katman" kesinliği kurar; C teknik olarak yanlış genelleme; E alakasız.

2.  TCP 3-Way Handshake için doğru sıra hangisidir?\
    A) ACK → SYN → SYN-ACK\
    B) SYN → ACK → SYN-ACK\
    C) SYN → SYN-ACK → ACK\
    D) SYN-ACK → SYN → ACK\
    E) FIN → ACK → SYN\
    **Doğru:** C\
    **Gerekçe:** TCP bağlantısı SYN ile başlar, sunucu SYN-ACK döner, istemci ACK ile tamamlar. Diğerleri sıralamayı bozar veya FIN gibi alakasız bayrak içerir.

3.  Aşağıdakilerden hangisi "refused" belirtisine en yakın yorumdur?\
    A) Paketler kaybolduğu için UDP yeniden göndermiştir\
    B) Hedef cihaz kapalıdır; hiçbir şekilde erişilemez\
    C) Hedefe ulaşılıyor; fakat ilgili portta dinleyen servis yok veya aktif reddediyor\
    D) DNS kaydı bulunamadı\
    E) IP adresi kesin yanlış yazılmıştır\
    **Doğru:** C\
    **Gerekçe:** Refused genellikle "kapıya ulaştım ama içeride dinleyen yok/ret var" sinyalidir. B/E kesinlik içerir; D DNS katmanı; A alakasız.

4.  Aşağıdakilerden hangisi "port ezberi" yerine servis okuryazarlığını gösterir?\
    A) 0--65535 aralığını ezbere söylemek\
    B) 80'in HTTP olduğunu bilmek ve her sorunda tüm portları denemek\
    C) Servisin TCP mi UDP mi kullandığını ve hangi portu beklediğini doğrulamadan test yapmamak\
    D) Her zaman önce uygulamayı suçlamak\
    E) Her zaman önce firewall'ı kapatmayı önermek\
    **Doğru:** C\
    **Gerekçe:** Servis okuryazarlığı, doğru protokol/portu bilerek ve kanıtla ilerlemektir. B taramaya kayar; D/E yöntemsel olarak hatalı ve riskli.

5.  "İstemci ephemeral port kullanır" ifadesinin en doğru anlamı hangisidir?\
    A) Sunucu her servisi 49152--65535 aralığında çalıştırır\
    B) İstemci bağlantı kurarken geçici bir çıkış portu seçer; hedef servis portu değişmez\
    C) Ephemeral portlar sadece UDP içindir\
    D) Ephemeral port = well-known port demektir\
    E) Ephemeral port kullanılırsa firewall devre dışı kalır\
    **Doğru:** B\
    **Gerekçe:** Ephemeral port istemcinin geçici çıkış kapısıdır; sunucudaki servis portu (ör. 443) sabittir. Diğerleri kavramları karıştırır.

6.  Bir Linux sunucuda ss -tulpen çıktısında 80 için LISTEN görünmüyor. Aynı anda istemciden nc -vz 192.0.2.50 80 denemesi "refused" dönüyor. En makul yorum hangisi?\
    A) Ağ kesin çökmüş; IP adresleme bozuk\
    B) Sunucu tarafında 80'de dinleyen servis yok; istemci sunucuya ulaşıyor ama kapı boş\
    C) DNS sorunu var\
    D) UDP gecikmesi yüksek\
    E) Sorun mutlaka kablo kopukluğu\
    **Doğru:** B\
    **Gerekçe:** LISTEN yok + refused, "ulaştım ama dinleyen yok" çizgisine uyar. A/E L3/Fiziksel kesinliği kurar; C/D konu dışı.

7.  Aşağıdakilerden hangisi bu modülün "güvenli test" sınırına uygundur?\
    A) 1--65535 arası tüm portları denemek\
    B) Tanımadığın IP'lerde açık port aramak\
    C) İzinli bir hedefte, bilinen servisin tek portunu test etmek (ör. 443)\
    D) İnternette rastgele IP'lere netcat ile bağlanmak\
    E) Hedef bulmak için otomatik tarama aracı çalıştırmak\
    **Doğru:** C\
    **Gerekçe:** Modül, tek hedef--tek port doğrulamasıyla sınırlıdır. Diğerleri tarama/keşif davranışına kayar.

8.  curl -I <https://example.com> bir yanıt (ör. 301/200/403) döndürüyor. Bu en güçlü şekilde neyi destekler?\
    A) DNS kesin bozuk\
    B) En azından TCP/443 yolu büyük ölçüde çalışıyor ve sunucudan uygulama seviyesinde bir yanıt geliyor\
    C) UDP paketi kaybolmuş\
    D) IP adresleme kesin yanlış\
    E) Sunucu kesin hacklenmiş\
    **Doğru:** B\
    **Gerekçe:** Header yanıtı, bağlantının kurulabildiğini ve bir HTTP yanıtı geldiğini gösterir. Diğer seçenekler kanıtsız kesinlik içerir.

9.  Bir sorun için "önce L3 → sonra L4 → sonra uygulama" sırasını korumanın temel faydası hangisidir?\
    A) Daha fazla port taraması yapabilmek\
    B) Yanlış katmanda zaman kaybetmemek ve kanıt zincirini doğru kurmak\
    C) Her sorunu tek komutla çözmek\
    D) Firewall'ı devre dışı bırakmak\
    E) TCP'yi UDP'ye çevirmek\
    **Doğru:** B\
    **Gerekçe:** Katmanlı yaklaşım, yanlış pozitif maliyetini düşürür ve karar kalitesini artırır. Diğerleri kapsam dışı veya riskli.

10. Bir kullanıcı "bazen oluyor bazen olmuyor" diyor. Bu modül açısından en doğru ilk adım yaklaşımı hangisi?\
    A) Hemen tüm portları tarayıp hangileri açık bakmak\
    B) Kanıt standardıyla tek servisi hedefleyip aynı port/protokolde tekrarlı ama düşük riskli doğrulama yapmak; sonuçları timeout/refused diye sınıflandırmak\
    C) DNS'i kesin suçlamak\
    D) Uygulama hatası deyip ağ kanıtı toplamamak\
    E) Sunucuyu yeniden kurmak\
    **Doğru:** B\
    **Gerekçe:** "Bazen" türü problemler kanıtsız yorumla büyür. Aynı hedef/port üzerinde düşük riskli doğrulama + sonuç sınıflandırma doğru başlangıçtır.

## **Kapanış: Bu modülde kazandıkların**

-   TCP ve UDP'nin temel farklarını, pratikte hangi belirtilere yol açabileceğini öğrendin.

-   IP'nin cihazı, portun ise cihaz içindeki servisi temsil ettiğini; socket/endpoint mantığını kavradın.

-   Timeout/refused gibi sonuçları "kanıt" olarak sınıflandırıp doğru katmana yönelmeyi öğrendin.

-   Windows/Linux/macOS'ta komut çıktılarından LISTENING/ESTABLISHED gibi durumları okuyarak servis kanıtı toplamayı öğrendin.

-   Servis erişimini keşif gibi değil, **tek hedef--tek port** mantığıyla güvenli doğrulama olarak ele almayı benimsedin.

## **MODÜL 10 --- DNS, DHCP ve NAT**

Bu modül, "ağa bağlıyım ama hâlâ internet/uygulama çalışmıyor" şikâyetlerinin en sık kök neden üçlüsünü ele alır: **DNS (isim → IP çözümleme)**, **DHCP (IP adresini otomatik alma)** ve **NAT (ev router'ının iç ağ ile internet arasında çeviri yapması)**. Modül 8'de L3 adresleme kanıtını, Modül 9'da L4 servis erişimi kanıtını kurduysan; burada da DNS/DHCP/NAT ile **"doğru katmanı seçme"** refleksini geliştirirsin. Amaç ezber değil; **"belirti → kanıt → yorum"** zinciriyle sorunun **adres mi**, **isim mi**, yoksa **çıkış/çeviri mi** olduğunu güvenli şekilde ayrıştırmaktır. Komutlar yalnızca **yerel/izinli ortamda**, düşük riskli doğrulama ve çıktıyı okuma amacıyla ele alınır.

## **Modül Amaçları**

Bu modülün sonunda katılımcı:

-   DNS'in çözümleme akışını (yerel önbellek → resolver → hiyerarşi → yetkili yanıt) giriş seviyesinde açıklar ve "isim çalışmıyor" belirtisini doğru yorumlar.

-   DNS kayıt türlerini (A, AAAA, CNAME, MX) okuryazarlık düzeyinde tanır; "kayıt türü → beklenen davranış" ilişkisinden kanıt üretir.

-   DHCP'nin temel işleyişini (DORA süreci, lease/kira mantığı) kavrar; "IP alamama" belirtilerini ayırt eder.

-   NAT/PAT mantığını ev router'ı bağlamında yorumlar; "dışarı çıkış / dışarıdan erişim" farkını doğru konumlandırır.

-   Windows/Linux/macOS üzerinde DNS/DHCP/NAT ile ilgili kritik bilgileri komut çıktısından seçer ve **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** notu haline getirir.

## **Ana içerik**

### **10.1 DNS çalışma akışı**

#### **Ne anlama gelir?**

Bilgisayarlar IP adresleriyle, insanlar alan adlarıyla konuşur. **DNS (Domain Name System)**, alan adını (ör. [www.example.com](https://www.example.com)) uygun IP'ye çeviren, internetin "telefon rehberi" gibi çalışan dağıtık sistemidir. Giriş seviyesinde DNS'i üç katmanda okursun:

1.  **Local Cache (Yerel önbellek):**\
    Cihaz önce kendi hafızasına bakar: "Bu ismi az önce çözdüm mü?" (Bu adım hızlıdır; bazen de yanıltıcı olabilir.)

2.  **Resolver (Çözücü --- genelde router/kurum DNS/servis sağlayıcı):**\
    Önbellekte yoksa cihazın ayarlı olduğu DNS sunucusuna sorulur. Resolver'ın da önbelleği olabilir.

3.  **Hiyerarşi → Yetkili yanıt (authoritative):**\
    Resolver cevap bilmiyorsa, DNS hiyerarşisini kullanarak (kök/uzantı/yetkili yetkilendirmeleri) doğru kaynağa gider ve sonucu döndürür.

DNS'in kritik noktası şudur: **İsim çözülmüyorsa, uygulama doğru IP'ye gidemez.** Bu yüzden "internet yok" gibi görünen problemlerin bir kısmı aslında **DNS katmanında** başlar.

**Örnek:** Kullanıcı [www.example.com](https://www.example.com) yazıyor, tarayıcı "siteye ulaşılamıyor" diyor. Burada iki ayrı soru vardır:

-   "İsim çözülüyor mu?" (DNS)

-   "Çözülen IP'ye servis erişimi var mı?" (Modül 9: L4/uygulama)

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   Ağ simgesi "bağlı" görünür ama alan adlarıyla erişim başarısız olur.

-   Aynı ağda bir cihaz çalışırken diğerinde çalışmıyorsa, cihaz bazında **DNS sunucu ayarı**, **yanlış arayüz** (VPN/başka adapter) veya **önbellek** etkisi olabilir.

-   Kurum içi adlar çözülmezken dış adlar çözülüyorsa, yerel resolver/arama etki alanı davranışı devrede olabilir (bu modülde ayar anlatılmaz; kanıt okuryazarlığı hedeflenir).

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

DNS için güvenli kanıt üretme şablonu:

-   **Kanıt 1 --- Çözümleme var mı?** example.com için IP dönüyor mu?

-   **Kanıt 2 --- Kime soruyorsun?** Cihaz hangi DNS sunucusunu kullanıyor?

-   **Kanıt 3 --- Yanıt türü ne?** "Bulunamadı" mı, "zaman aşımı" mı, yoksa "yanıt var ama sorun sürüyor" mu?

**Örnek:** "IP'ye ping atabiliyorum (ör. 203.0.113.1 gibi bir test IP'si) ama [www.example.com](https://www.example.com) açılmıyor."

-   Ping'in çalışması, **L3 yolu** işaret eder.

-   Alan adının açılmaması, **DNS ihtimalini** güçlendirir.

-   Ancak DNS çözülse bile sorun **L4/uygulama** olabilir; bu yüzden önce DNS'i kanıtla, sonra Modül 9 hattına dön.

**Dikkat (DNS önbelleği yanıltabilir):**\
"Dün çalışıyordu bugün bozuk" gibi durumlarda cihazın veya resolver'ın önbelleği eski/yanlış cevabı taşıyor olabilir. Bu modül, önbellek temizleme/ayar değiştirme öğretmez; ancak rapor notunda "önbellek etkisi olası" ihtimalini **gözlem--yorum ayrımıyla** düşmeyi öğretir.

**İpucu 1 (DNS'i hatalı suçlamamak):**\
DNS testi yaparken "isim çözülmüyor" ile "isim çözülüyor ama servis çalışmıyor" ayrımını netleştir. DNS başarılıysa, bir sonraki durak çoğu zaman Modül 9'daki **tek hedef--tek port** servis doğrulamasıdır.

#### **DNS kayıt türleri (okuryazarlık)**

DNS sadece IP tutmaz; farklı kayıt türleri farklı davranışlar üretir:

-   **A:** İsim → IPv4 adresi

-   **AAAA:** İsim → IPv6 adresi

-   **CNAME:** Takma ad; bir ismi başka bir isme yönlendirir (sonunda A/AAAA ile IP'ye varılır).

-   **MX:** E-posta teslimi için hedefleri tanımlar.

**Örnek:** [www.example.com](https://www.example.com) bir **CNAME** ile example.com'a işaret edebilir; tarayıcı "IP'si yok" diye düşünmez---sonuçta çözümleme zinciri doğru IP'ye ulaşıyorsa çalışır.

#### **DNSSEC (kavramsal giriş)**

Klasik DNS yanıtları, bütünlüğü "doğası gereği" garanti etmez; araya giren yanlış yönlendirme/manipülasyon riskleri vardır. **DNSSEC**, DNS kayıtlarına **dijital imza** ekleyerek, cevabın yetkili kaynaktan geldiğine dair doğrulama yaklaşımı sunar. Bu modülde amaç saldırı/anlatım değil; **"DNS yanıtı güveni"** kavramına farkındalık kazandırmaktır.

### **10.2 DHCP çalışma akışı**

#### **Ne anlama gelir?**

**DHCP (Dynamic Host Configuration Protocol)**, cihaz ağa bağlanır bağlanmaz IP adresini ve temel ağ ayarlarını otomatik almasını sağlar. DHCP çoğu zaman şunları dağıtır:

-   IP adresi + prefix/mask

-   Default gateway

-   DNS sunucuları

-   Lease/kira süresi

Giriş seviyesinde DHCP'yi **DORA** akışıyla okursun:

1.  **Discover:** İstemci "DHCP var mı?" diye yayın yapar.

2.  **Offer:** Sunucu "şu ayarları önerebilirim" der.

3.  **Request:** İstemci "bu teklifi istiyorum" der.

4.  **Ack:** Sunucu "tamam, şu süreyle senindir" diye onaylar (lease başlar).

**İpucu 2 (DHCP--DNS bağını unutma):**\
DNS bozuk gibi görünen bir sorunun kökü DHCP olabilir; çünkü DNS sunucusu bilgisi çoğu zaman DHCP ile gelir. DNS kanıtı toplarken "DNS sunucusu **nereden** geldi?" sorusu, yanlış katmanda oyalanmayı engeller.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Wi-Fi bağlı görünüyor ama hiçbir şey açılmıyor" → DHCP'den doğru IP/gateway/DNS alınamamış olabilir.

-   Bazı cihazlar çalışırken bazıları çalışmıyorsa → lease/çakışma/yanlış ağ profili veya erişim noktası kararsızlığı gibi ihtimaller doğar (performans boyutu Modül 11'de büyür).

-   Cihaz DHCP alamadığında işletim sistemi bazen "otomatik yerel adres" kullanabilir; bu, "bağlantı var ama DHCP yok" sinyalidir (bu modülde sayısal blok ezberi değil, sinyal okuryazarlığı hedeflenir).

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

DHCP için "dokunmadan" kanıt toplama hedefi:

-   **Kanıt 1:** Arayüz DHCP ile mi yapılandırılmış?

-   **Kanıt 2:** Lease var mı, ne zaman alınmış/ne zaman bitecek?

-   **Kanıt 3:** IP/prefix + gateway + DNS birlikte tutarlı mı?

**Karşı kanıt:** IP/prefix/gateway/DNS tutarlıysa, "DHCP bozuk" hipotezi zayıflar; DNS veya L4/uygulama hattına geçilir.

#### **Statik IP vs DHCP (kavramsal)**

-   **DHCP:** Son kullanıcı cihazları (telefon/laptop) için pratik ve yönetimi kolaydır.

-   **Statik IP:** Bazı sabit servisler (ör. yazıcı/yerel sunucu gibi) için tercih edilebilir; çünkü adres değişirse erişim/bağımlılıklar etkilenebilir.\
    Bu modül, statik atama yöntemi öğretmez; yalnızca "ne zaman neden tercih edilir?" okuryazarlığı kazandırır.

### **10.3 NAT ve ev router'ı**

#### **Ne anlama gelir?**

Ev router'ı çoğu zaman tek kutuda birden fazla rol taşır:

-   Router (yönlendirici)

-   NAT/PAT (çeviri ve eşleştirme)

-   DHCP sunucusu

-   DNS forwarder/relay

-   Durum bilgili güvenlik filtresi (stateful firewall davranışı)

**NAT (Network Address Translation)**, iç ağdaki çok sayıda cihazın internete çıkışını yönetmek için adres/port çevirisi yapar. Ev senaryosunda pratikte çoğunlukla **PAT** (Port Address Translation) görürsün: birden fazla iç istemci, dışarıda tek bir çıkış kimliği üzerinden farklı port eşleştirmeleriyle temsil edilir.

**Örnek (kavramsal):**

-   İçerideki cihaz: 192.0.2.10 bir web servisine gitmek ister.

-   Router dışarıya kendi çıkış kimliğiyle (ör. 203.0.113.5) çıkar ve "hangi iç cihaz hangi dış bağlantıya karşılık geliyor?" bilgisini bir **NAT tablosunda** tutar.

-   Dönüş trafiği geldiğinde router bu tabloya bakıp paketi doğru iç cihaza yollar.

**Analojik okuma:** Bir kurumun dışarıya tek numara ile görünmesi ama içeride dahili numaralarla doğru kişiye bağlanması gibi.

#### **Artı / eksi (giriş seviyesi yorum)**

-   **Artı:** Adres tasarrufu sağlar; iç cihazlar doğrudan görünmediği için "doğrudan gelen bağlantıları" varsayılan olarak zorlaştırabilir.

-   **Eksi:** Dışarıdan içeriye "kendiliğinden" bağlantı başlatmak genelde zordur; özel durumlarda ek ağ yapılandırmaları gerekebilir (bu modülde konfigürasyon adımı anlatılmaz).

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   "İnternete çıkabiliyorum ama dışarıdan bana erişilemiyor" → NAT/firewall davranışıyla uyumlu olabilir.

-   Aynı ev ağında tüm cihazlar bir anda internete çıkamaz hale gelirse → router'ın NAT/DNS/DHCP rolleri toplu etkilenmiş olabilir.

-   "Alan adı çözülüyor ama bağlantı kurulamıyor" → DNS tamam; NAT/firewall/L4 çizgisi güçlenir (Modül 9'daki kanıta dön).

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

NAT'ı giriş seviyesinde doğrudan "tek komutla ölçmek" zordur; bu modülde hedef **dolaylı kanıt** ve doğru yorumdur:

-   **Kanıt 1:** Default gateway var mı? (Modül 8'den)

-   **Kanıt 2:** İç ağdan dışa doğru "tek hedef--tek servis" erişimi kurulabiliyor mu? (Modül 9 mantığı)

-   **Kanıt 3:** Sorun tüm cihazlarda mı, yoksa tek cihazda mı?

    -   Tüm cihazlarda ise router/çıkış zinciri olasılığı artar.

    -   Tek cihazda ise istemci/DNS/arayüz bazlı sorun olasılığı artar.

### **10.4 Komutlar (yerel/izinli doğrulama)**

Aşağıdaki komutlar yalnızca **kendi/izinli** ortamında ve troubleshooting amaçlıdır. Her komutta hedef: **kanıt üretmek** ve **çıktıdan kritik satırı seçmek**.

#### **Windows**

**Komut: ipconfig /all**

-   Amaç: IP/prefix, default gateway, DNS sunucuları, DHCP/lease bilgilerini toplu görmek.

-   Beklenen çıktı türü: "DHCP Enabled", "DNS Servers", "Default Gateway", "Lease Obtained/Expires".

-   Yorum ipucu: DNS sunucuları beklenmedik/boşsa önce "DHCP ile mi geldi?" diye kontrol et.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: nslookup example.com**

-   Amaç: DNS çözümlemesi var mı, hangi DNS sunucusu yanıtlıyor?

-   Beklenen çıktı türü: "Server:" + "Name/Address" veya hata (bulunamadı / zaman aşımı).

-   Yorum ipucu: "Server" satırı, gerçek sorgu hedefini gösterir; hatanın türünü not et.

-   Güvenli sınır: Tek alan adı sorgusu; düşük trafik.

**Komut (PowerShell): Resolve-DnsName example.com**

-   Amaç: DNS yanıtını daha yapılandırılmış görmek (A/AAAA/CNAME vb.).

-   Beklenen çıktı türü: Name, Type, IP değerleri veya hata.

-   Yorum ipucu: Çözümleme başarılıysa ama erişim yoksa, DNS'den çıkıp Modül 9 doğrulamasına geç.

-   Güvenli sınır: Okuma amaçlı.

**Komutlar (daha müdahaleci, dikkatli kullanım): ipconfig /release ve ipconfig /renew**

-   Amaç: DHCP lease'i bırakıp yeniden istemek (sorun "IP alamıyorum" şüphesindeyse).

-   Beklenen çıktı türü: Yenileme başarısı veya "DHCP sunucusuna ulaşılamıyor" benzeri hata.

-   Yorum ipucu: Yenileme başarısızsa DHCP erişimi/gücü şüphesi artar; başarılıysa DNS/gateway tutarlılığını tekrar kontrol et.

-   Güvenli sınır: Bu komutlar bağlantıyı kesebilir; **yalnızca kendi cihazında ve kontrollü anda** kullan.

#### **Linux**

**Komut: ip a**

-   Amaç: Arayüzde IP var mı, arayüz up mı?

-   Beklenen çıktı türü: inet / inet6 satırları.

-   Yorum ipucu: IP yoksa veya beklenmedikse DHCP ihtimali güçlenir.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: ip route**

-   Amaç: Default route var mı?

-   Beklenen çıktı türü: default via \... satırı.

-   Yorum ipucu: Default route yoksa "internet yok" belirtisi beklenir; DNS'i suçlamadan önce bunu kanıtla.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: resolvectl status** *(bazı sistemlerde benzeri komutlar bulunabilir)*

-   Amaç: Sistem hangi DNS sunucularını kullanıyor, hangi arayüze bağlı?

-   Beklenen çıktı türü: DNS Servers listesi, arayüz bağlamı.

-   Yorum ipucu: VPN/ikincil arayüz beklenmedik biçimde öne çıkmış olabilir.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: dig example.com veya host example.com**

-   Amaç: DNS sorgusunun yanıt alıp almadığını kanıtlamak.

-   Beklenen çıktı türü: ANSWER bölümünde kayıtlar; ayrıca TTL, query time gibi teknik alanlar.

-   Yorum ipucu: Yanıt varsa DNS temel olarak çalışıyor demektir; sorun sürüyorsa L4/uygulama hattına geç.

-   Güvenli sınır: Tek alan adı sorgusu.

**Komutlar (müdahaleci, dağıtıma bağlı): DHCP istemci yenileme**

-   Amaç: DHCP kira yenilemesini tetiklemek (sorun DHCP şüphesindeyse).

-   Beklenen çıktı türü: Yeni lease alınması veya "sunucuya ulaşılamıyor" benzeri hata.

-   Güvenli sınır: Bu işlem bağlantıyı etkileyebilir; yalnızca izinli/yerel ve kontrollü zamanda uygulanır. (Komut adı/biçimi dağıtımınıza göre değişebilir.)

#### **macOS**

**Komut: ifconfig**

-   Amaç: Arayüz durumu ve IP varlığına bakış.

-   Beklenen çıktı türü: inet / inet6 satırları.

-   Yorum ipucu: Doğru arayüzü (Wi-Fi/Ethernet) okuduğundan emin ol.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: scutil \--dns**

-   Amaç: DNS yapılandırmasını ve resolver'ları görmek.

-   Beklenen çıktı türü: Resolver listeleri, nameserver satırları.

-   Yorum ipucu: Birden fazla resolver normal olabilir; hangi arayüzün öncelikli olduğunu anlamaya çalış.

-   Güvenli sınır: Yerel görüntüleme.

**Komut: nslookup example.com**

-   Amaç/çıktı/yorum/sınır: Windows ile aynı mantık.

**Komut (müdahaleci): arayüzü DHCP ile yenileme**

-   Amaç: DHCP yenilemesini tetiklemek (sorun DHCP şüphesindeyse).

-   Beklenen çıktı türü: Yenileme sonrası IP/gateway/DNS'in güncellenmesi.

-   Güvenli sınır: Bağlantıyı etkileyebilir; yalnızca kendi cihazında ve kontrollü anda.

**Dikkat (kanıt standardı):**\
Çıktı toplarken her seferinde şu 4 notu ekle: **zaman**, **hangi arayüz**, **hangi hedef** (ör. example.com), **sonuç türü** (başarılı / bulunamadı / zaman aşımı). Bu disiplin, raporlamada izlenebilirliği artırır.

## **Troubleshooting mini senaryosu (yerel/izinli, saldırı/tarama yok)**

**Belirti:** Kullanıcı "Wi-Fi'ye bağlandım ama internet yok, siteler açılmıyor" diyor.

**Olasılık (katmanlı düşünme):**

-   **DHCP:** Cihaz doğru IP/gateway/DNS alamamış olabilir.

-   **DNS:** IP yolu var ama isim çözümleme yok olabilir.

-   **NAT/çıkış zinciri:** DNS çözülse bile dışa bağlantı kurulamıyor olabilir (bu ihtimalde Modül 9 doğrulaması devreye girer).

**Doğrulama (güvenli):**

1.  **Yerel yapılandırma kanıtı (DHCP/Gateway/DNS):**

    a.  Windows: ipconfig /all

    b.  Linux: ip a + ip route + (varsa) resolvectl status

    c.  macOS: ifconfig + scutil \--dns\
        **Kritik okuma:** Default gateway var mı? DNS sunucuları var mı? DHCP/lease bilgisi mantıklı mı?

2.  **DNS çözümleme kanıtı (tek alan adı):**

    a.  nslookup example.com (Linux'ta dig/host da olabilir)\
        **Sonuç sınıflandır:** Yanıt var mı? "Bulunamadı" mı "zaman aşımı" mı?

3.  **Karar:**

    a.  DNS çözülmüyorsa: DNS/DHCP hattı şüpheli → DNS sunucusu nereden geliyor, erişilebilir mi kanıtla.

    b.  DNS çözülüyorsa: DNS temel olarak sağlam → bir sonraki adım Modül 9'da **tek hedef--tek port** servis erişimini doğrulamaktır.

**Sonuç (kanıta dayalı rapor notu):**

-   **Bulgu:** Yapılandırma çıktısı + nslookup/dig sonucu (özet), zaman/arayüz

-   **Etki:** Alan adları çözülemediği için servis erişimi yok *(veya)* DNS çözülüyor ama erişim yok

-   **Öneri:** Kanıtın işaret ettiği katmanda (DHCP ile gelen ayarlar / DNS resolver erişimi / bir sonraki adımda L4 doğrulaması) yetkili kontrol

-   **Kanıt:** Komut çıktılarından kritik satırlar

## **Terimler Sözlüğü (Glossary)**

  **Terim**         **Türkçe karşılığı / açıklama**
  ----------------- ----------------------------------------------------------------------------
  DNS               Alan adlarını IP adreslerine çeviren isim çözümleme sistemi
  Resolver          DNS sorgusunu çözen/iletip yanıtlayan çözücü sunucu bileşeni
  Authoritative     Bir alan adının doğru kayıtlarını yetkili olarak sağlayan kaynak
  DNS Cache         Daha önce çözülen isimlerin geçici olarak tutulduğu önbellek
  A Kaydı           Alan adı → IPv4 adresi eşlemesi
  AAAA Kaydı        Alan adı → IPv6 adresi eşlemesi
  CNAME             Takma ad kaydı; bir alan adını başka bir ada yönlendirir
  MX                E-posta hedeflerini belirleyen DNS kayıt türü
  DNSSEC            DNS yanıt bütünlüğünü/dogrulamasını güçlendiren imza yaklaşımı (kavramsal)
  DHCP              Cihazlara IP/gateway/DNS gibi ağ ayarlarını otomatik dağıtan protokol
  Lease             DHCP'nin verdiği IP'nin geçerlilik/kira süresi mantığı
  DORA              DHCP akışı: Discover--Offer--Request--Acknowledge
  NAT               İç ağ ile dış ağ arasında adres çevirisi yapan mekanizma
  PAT               NAT'ın port eşleştirmeli pratik kullanımı (çok cihaz → tek çıkış kimliği)
  Default Gateway   Subnet dışına çıkış için kullanılan ilk kapı
  Default Route     "Her yere" giden temel yönlendirme kaydı

## **Kendini Değerlendir (A/B/C/D/E)**

**1) Bir kullanıcı "Alan adları açılmıyor" diyor. nslookup example.com çıktısında "Server: ..." satırı görünüyor ama sonuç "zaman aşımı" veriyor. Aynı kullanıcı IP ile bir hedefe erişebildiğini söylüyor. En doğru yorum hangisi?**\
A) DNS çalışıyordur; sorun kesinlikle NAT'tır.\
B) DNS sunucusuna erişim/yanıt sorunu ihtimali güçlenir; DNS katmanında kanıt zayıftır.\
C) DHCP kesin bozuk; DNS ile ilgisi yoktur.\
D) Sorun kesinlikle uygulama katmanındadır; DNS testine gerek yoktur.\
E) Bu çıktı, DNS'in mutlaka doğru çalıştığını kanıtlar.\
**Doğru: B**\
**Gerekçe:** "Zaman aşımı", çözümleyiciye erişim/yanıt sorununu işaret eder; IP erişimi varken alan adının çözülememesi DNS'i güçlendirir. Diğer şıklar kanıt zincirini atlıyor veya kesin konuşuyor.

**2) ipconfig /all çıktısında DNS sunucuları listelenmiş, default gateway mevcut. nslookup example.com IP döndürüyor; fakat kullanıcı hâlâ uygulamaya erişemiyor. Bir sonraki en doğru adım hangi katmana yönelmek olmalı?**\
A) DNS ayarlarını hemen değiştirmek.\
B) DHCP'yi zorlamak için kesin release/renew yapmak.\
C) Modül 9 yaklaşımıyla L4/servis erişimini tek hedef--tek port kanıtıyla doğrulamak.\
D) NAT tablosunu temizlemek (nasıl yapılacağına bakmak).\
E) Root DNS sunucularını tek tek sorgulamak.\
**Doğru: C**\
**Gerekçe:** DNS çözülüyorsa DNS temel işlevi yapıyordur; sorun servis erişimi/uygulama hattına kayar. Diğer seçenekler kanıtsız konfigürasyon müdahalesine veya kapsam dışına gider.

**3) Aşağıdakilerden hangisi CNAME için en doğru ifadedir?**\
A) CNAME, alan adını doğrudan IPv4'e çevirir.\
B) CNAME, alan adını başka bir alan adına yönlendirir; zincirin sonunda A/AAAA ile IP'ye varılır.\
C) CNAME, yalnızca e-posta teslimi içindir.\
D) CNAME, DHCP'nin verdiği bir kayıt türüdür.\
E) CNAME, NAT tablosundaki bir eşleştirmedir.\
**Doğru: B**\
**Gerekçe:** CNAME "takma ad"dır; IP'ye doğrudan bağlamaz. Diğer şıklar kayıt türlerini/katmanları karıştırır.

**4) Bir cihaz ağda "otomatik yerel adres" benzeri bir durumla sınırlı kalmış görünüyor ve internete çıkamıyor. Bu belirti en çok hangi hipotezi güçlendirir?**\
A) DNS kayıt türleri hatalıdır.\
B) DHCP'den uygun ağ yapılandırması alınamamıştır.\
C) NAT tablosu doludur; kesin odur.\
D) CNAME döngüsü vardır.\
E) DNSSEC imzası bozulmuştur.\
**Doğru: B**\
**Gerekçe:** DHCP alınamadığında işletim sistemi bazen sınırlı yerel adresleme ile kalır; bu, DHCP erişimi/işleyişi ihtimalini yükseltir.

**5) DORA sırasını doğru veren seçenek hangisidir?**\
A) Discover → Offer → Request → Acknowledge\
B) Discover → Request → Offer → Acknowledge\
C) Request → Offer → Discover → Acknowledge\
D) Offer → Discover → Request → Acknowledge\
E) Discover → Offer → Acknowledge → Request\
**Doğru: A**\
**Gerekçe:** DHCP'nin temel diyaloğu DORA'dır; diğer sıralamalar pazarlık mantığıyla çelişir.

**6) NAT/PAT için en doğru pratik yorum hangisidir?**\
A) NAT, dışarıdan içeriye bağlantıları her zaman otomatik kolaylaştırır.\
B) NAT, iç ağdaki birden çok cihazın dışa çıkışını yönetirken eşleştirme bilgisi tutar; dönüş trafiğini bu eşleştirmeyle içeri yönlendirir.\
C) NAT, DNS'in bir parçasıdır; isimleri IP'ye çevirir.\
D) NAT, DHCP'nin verdiği gateway adresidir.\
E) NAT, yalnızca IPv6 ağlarında kullanılır.\
**Doğru: B**\
**Gerekçe:** NAT/PAT'nin özü eşleştirme + takip mantığıdır. Diğer şıklar katmanları karıştırır veya hatalı genellemeler yapar.

**7) dig example.com çıktısında ANSWER bölümünde A kaydı görülüyor, query time düşük. Buna rağmen erişim yok. En doğru çıkarım hangisi?**\
A) DNS kesin olarak suçludur; çünkü dig çıktı verdi.\
B) DNS temel çözümleme açısından çalışıyor olabilir; sorun L4/uygulama hattına kaymış olabilir.\
C) DHCP kesin bozuk; çünkü dig çalıştı.\
D) NAT kesin bozuk; çünkü DNS çalışıyor.\
E) CNAME yoksa site açılmaz.\
**Doğru: B**\
**Gerekçe:** DNS yanıtı, isim çözümleme kanıtıdır; erişim yoksa başka katmanlara bakılır. Diğer şıklar kanıtı yanlış yorumlar veya kesinlik iddia eder.

**8) DNSSEC'in (kavramsal) hedeflediği temel problem aşağıdakilerden hangisine en yakındır?**\
A) DHCP'nin IP dağıtım hızını artırmak\
B) NAT tablosunu küçültmek\
C) DNS yanıtının yetkili kaynaktan geldiğine dair doğrulama/bütünlük güvenini güçlendirmek\
D) Wi-Fi sinyal gücünü artırmak\
E) TCP el sıkışmasını hızlandırmak\
**Doğru: C**\
**Gerekçe:** DNSSEC, DNS yanıt bütünlüğü/doğrulaması fikrine dayanır; diğer seçenekler farklı katmanlara aittir.

## **Bu modülde neler öğrendik?**

-   DNS'in alan adını IP'ye çeviren akışını; yerel önbellek--resolver--hiyerarşi--yetkili yanıt fikrini.

-   DNS kayıt türlerini (A/AAAA/CNAME/MX) ve "kayıt türü → beklenen davranış" okuryazarlığını.

-   DHCP'nin DORA sürecini ve lease mantığını; "IP alamama" belirtilerini kanıtla yorumlamayı.

-   NAT/PAT'nin ev router'ında iç ağ çıkışını nasıl yönettiğini; "dışa çıkış" ile "dışarıdan erişim" farkını.

-   Sorun ayırmada katmanlı sırayı korumayı: **Önce IP/gateway/DHCP kanıtı → sonra DNS kanıtı → sonra servis/uygulama (Modül 9)**.

# **MODÜL 11 --- Yönlendirme, İnternet Yolculuğu ve Performans**

Bir önceki modüllerde "aynı ağ içindeki" iletişimi (LAN mantığı) okuryazarlık düzeyinde kurduk. Bu modülde odağı büyütüyoruz: Bir paket, ev/okul/lab ağından çıkıp farklı ağlara giderken **hangi kapıdan çıkar**, **hangi yollardan geçer** ve **yol boyunca neden yavaşlar/bozulur**?\
Bu soruları ezberle değil; **katmanlı düşünme**, **doğrulama**, **kanıta dayalı yorum** ve **güvenli sınırlar** ile cevaplayacağız. Hedef; "internet yok" gibi geniş bir şikâyeti, **nerede** ve **nasıl** sıkıştıracağını bilmek.

## **Hedefler**

-   **Default gateway** kavramının paketlerin "dış dünyaya çıkışında" neden hayati olduğunu açıklayabilmek.

-   Bir paketin geçtiği durakları **traceroute/tracert** ile okuyup "nerede takılıyor?" sorusuna sistematik yaklaşabilmek.

-   Performansı sadece "hız" sanmadan; **latency, jitter, packet loss** ayrımını belirtiler üzerinden yapabilmek.

-   **Statik vs dinamik routing** farkını "manuel harita vs GPS" benzetmesiyle kavrayıp hangi problem sınıfını çözdüğünü anlayabilmek.

-   Windows/Linux/macOS üzerinde komut çıktısını okuyup **gözlem--yorum ayrımı** ile kanıta dayalı teşhis notu çıkarabilmek.

## **11.1 Paket ağlar arası nasıl gider?**

### **Default gateway: "dışarı çıkış kapısı"**

Yerel ağ içinde cihazlar genellikle "yakın çevreyi" bilir. Ama hedef, aynı ağda değilse (yani farklı bir ağa gidecekse) cihazın mantığı şudur:

-   **Soru:** "Hedef IP benimle aynı ağda mı?"

-   **Cevap: Hayır ise:** "Ben bu yolu bilmiyorum. Paketi **default gateway**'e veriyorum; o yönetsin."

Default gateway çoğu ev/okul senaryosunda **router/modem-router** cihazıdır. Bu cihaz, paketi alır, kendi yönlendirme bilgisini kullanarak bir sonraki adıma iletir. Bu karar verme ve iletme sürecine **routing (yönlendirme)** denir. İnternet yolculuğu, çoğu zaman **hop-by-hop** (durak durak) ilerler: her router bir sonraki adımı seçer.

**Örnek:** Aynı Wi-Fi'daki yazıcıya erişim var ama web siteleri açılmıyor.\
Bu, çoğu zaman "yerel ağ iletişimi var; fakat **default gateway** ya yok ya da doğru çalışmıyor" anlamına gelir.

### **Belirti → Olasılık → Doğrulama (güvenli yaklaşım)**

-   **Belirti:** "Bağlı görünüyorum ama internet yok."

-   **Olasılık:** Default gateway yok/yanlış, rota yok/yanlış, ya da gateway cihazı sorunlu.

-   **Doğrulama soruları:**

    -   Cihaz IP almış mı?

    -   Default gateway görünüyor mu?

    -   Gateway'e ulaşabiliyor muyum?

**İpucu (Zihinsel Model):**\
Default gateway'i "apartmanın kapıcısı" gibi düşün. Bina içindeki daireye (yerel ağ) gidecek kargoda kapıcı şart değildir; bina dışına çıkacak kargoda kapıcı zorunludur.

**Dikkat:**\
"İnternet yok" şikâyetinde DNS'e atlamadan önce **gateway var mı/ulaşılabiliyor mu** sorusunu netleştirmek, teşhisi hızlandırır. Yanlış sırayla ilerlemek gereksiz zaman kaybettirir.

## **11.2 Traceroute mantığı: Yol haritasını çıkarmak**

### **Traceroute/tracert neyi gösterir?**

**traceroute (Linux/macOS)** ve **tracert (Windows)**, paketin hedefe giderken geçtiği ara durakları (**hop**) görünür kılar. Bu sayede "sorun evde mi, servis sağlayıcı tarafında mı, yoksa hedefe yakın bir yerde mi?" sorusunu daraltmaya yardım eder.

### **TTL (Time To Live) mekanizması: "kurnaz ama masum" fikir**

Traceroute'un temel mantığı TTL'dir: Her IP paketinin bir "ömrü" gibi düşünülebilecek TTL değeri vardır. Paket her router'dan geçtikçe TTL azalır; TTL bittiğinde paket "daha ileri gitmez" ve çoğu zaman geri bir bilgilendirme mesajı oluşur. Traceroute bu davranışı kullanarak "1. durak, 2. durak, 3. durak..." diye yolu adım adım çıkarır.

**Örnek:**

-   TTL=1 ile giden paket ilk router'da "ömrünü" bitirir → 1. hop görünür

-   TTL=2 ile giden paket bir sonraki router'da biter → 2. hop görünür

-   Böyle devam eder...

### **Çıktı okuryazarlığı: Nelere bakılır?**

Traceroute çıktısını okurken üç şeye odaklan:

1.  **İlk hop**: Genellikle default gateway olmalıdır.

2.  **Gecikme değişimi**: Hop'lar ilerledikçe gecikmenin yavaş yavaş artması normaldir; **ani sıçrama** bir darboğaz ipucu olabilir.

3.  *" \* " satırları*: Her zaman arıza değildir. Bazı ağlar bu tür yanıtları kısıtlayabilir.

**Dikkat:**\
Traceroute "yolu gösterir", ama tek başına hüküm verdirmez. Bazı cihazlar traceroute yanıtlarını düşük öncelikli işler veya kısıtlar. Bu yüzden **ping + traceroute** birlikte yorumlandığında daha güvenilirdir.

**İpucu (Yöntem seçimi):**\
"Nerede takılıyor?" sorusunda:

-   **Ping:** kararlılık/kayıp ve temel gecikme

-   **Traceroute/Tracert:** yol ve gecikme artışının "hangi durakta" belirginleştiği\
    birlikte kullanılırsa yanlış pozitif riski azalır.

## **11.3 Performans kavramları: "Hız" her şey değildir**

Ağ performansını sadece "download hızı" sanmak yanıltıcıdır. Deneyimin kalitesini çoğu zaman şu üçlü belirler:

### **1) Latency (Gecikme) ve RTT**

-   **Latency/RTT:** Paketin gidip gelme süresi (tepki süresi).

-   **Belirti:** Web tıklamalarında "geç tepki", oyunlarda gecikme, uzaktan masaüstünde sürünme.

### **2) Jitter (Gecikme dalgalanması)**

-   **Jitter:** Gecikmenin sabit kalmaması; bir paket 20ms, diğeri 120ms gibi dalgalanması.

-   **Belirti:** Sesli/görüntülü görüşmede sesin robotikleşmesi, anlık donmalar, senkron kayması.

### **3) Packet loss (Paket kaybı)**

-   **Packet loss:** Bazı paketlerin hedefe hiç ulaşmaması.

-   **Belirti:** Görüşmenin kopması, videoda bozulma, bazı sayfaların yarım yüklenmesi, bağlantı "var" görünse de deneyimin kötüleşmesi.

Kablosuzda (Wi-Fi) bu üçlü daha sık bozulur:

-   Kanal kalabalığı/parazit (özellikle 2.4 GHz)

-   Sinyal zayıflığı (mesafe/duvar)

-   Aynı anda yoğun kullanım (stream/indirme)

**Dikkat:**\
"İnternet hızım yüksek ama görüntülü görüşme donuyor" şikâyeti çoğu zaman **jitter/loss** problemidir. Hız testi iyi çıkabilir; çünkü hız testi "kısa süreli yüksek aktarım" ölçerken, görüşme "istikrar" ister.

## **11.4 Statik vs dinamik routing'e giriş: Manuel harita mı, GPS mi?**

Router'lar dünyadaki yolları iki temel yaklaşımla "bilir":

### **Statik routing (manuel harita)**

-   **Mantık:** Yollar yönetici tarafından tek tek tanımlanır: "Şu ağa şu kapıdan git."

-   **Artısı:** Basit ve öngörülebilir; küçük yapılarda iş görür.

-   **Eksisi:** Ağ büyüdükçe bakım zorlaşır; bir hat koparsa veya yol değişirse "kendiliğinden uyum" yoktur.

### **Dinamik routing (GPS mantığı)**

-   **Mantık:** Router'lar birbirleriyle protokoller aracılığıyla bilgi paylaşır, yolları otomatik öğrenir ve değişikliklere uyum sağlar.

-   **Örnek protokol:** OSPF (kavramsal farkındalık düzeyi).

-   **Artısı:** Bir bağlantı koptuğunda alternatif rota otomatik hesaplanabilir.

**İpucu (Analojiyi sabitle):**\
Statik routing = "Elinde çizili bir şehir haritası var, yollar değişirse yeniden çizmen gerekir."\
Dinamik routing = "GPS var, yol kapanınca alternatif yolu kendi bulur."

**Dikkat:**\
Bu giriş seviyesinde dinamik yönlendirme protokollerini **kurma/ayarlama** yok. Ama "neden var olduklarını" anlamak, ileride karşılaşacağın büyük ağ davranışlarını yorumlamanı sağlar.

## **11.5 Komutlar ve araçlar: Çıktı okuma odaklı (yerel/izinli)**

Aşağıdaki komutlar yalnızca **kendi/izinli/kontrollü** ortamında troubleshooting doğrulaması içindir. Örneklerde yalnızca dokümantasyon IP blokları ve example.\* alan adları kullanılmıştır.

### **A) Ping: "Ulaşabiliyor muyum, ne kadar stabil?"**

**Windows / Linux / macOS**

-   **Amaç:** Ulaşılabilirlik + gecikme (RTT) + kayıp (loss) hakkında hızlı fikir.

-   **Beklenen çıktı türü:** yanıt satırları + özet (gönderilen/alınan/kayıp).

-   **Yorum ipucu:**

    -   Kayıp varsa (loss \> %0): kararlılık sorunu ihtimali artar.

    -   Süreler sürekli zıplıyorsa: jitter şüphesi güçlenir.

-   **Güvenli sınır:** Önce **gateway** (ör. 192.0.2.1), sonra izinli lab hedefi.

**Örnek:**

-   Windows: ping 192.0.2.1

-   Linux/macOS: ping -c 10 192.0.2.1

### **B) Traceroute/Tracert: "Yol nerede değişiyor?"**

-   **Amaç:** Hop'ları ve gecikme artışının "hangi durakta" belirginleştiğini görmek.

-   **Beklenen çıktı türü:** hop listesi + her hop için süreler.

-   **Yorum ipucu:**

    -   İlk hop gateway olmalı.

    -   Bir hop'ta süre aniden artıyorsa not al; tek başına kesin hüküm verme.

    -   "\* \* \*" görürsen hemen "arızalı" demeden, ping ve diğer kanıtlarla birlikte değerlendir.

**Örnek:**

-   Windows: tracert example.com

-   Linux/macOS: traceroute example.com

**Örnek (temsili çıktı):**

1 \<1 ms 192.0.2.1\
2 12 ms 203.0.113.1\
3 14 ms 203.0.113.5\
4 120 ms 198.51.100.20\
5 125 ms 198.51.100.30

Bu örnekte 3 → 4 arasında belirgin gecikme artışı var. Bu "mutlaka 4. hop arızalı" demek değildir; ama darboğazın o bölgede olabileceğini düşündürür ve "karşı kanıt" aramayı tetikler.

### **C) Pathping / MTR: "Kararlılık ve kayıp nereye denk geliyor?"**

Bu araçlar ping + traceroute düşüncesini birleştirir. Özellikle **aralıklı** sorunlarda faydalıdır: "Sürekli mi, dalga dalga mı?"

-   **Windows:** pathping example.com

-   **Linux:** mtr example.com (yüklüyse)

**Yorum ipucu:**

-   Bir hop "yanıt vermiyor" görünüp sonraki hop'lar düzgünse, bu bazen yanıt kısıtlamasıdır.

-   Kayıp hem o hop'ta hem sonrasında görünüyorsa, "yolun o noktasından itibaren" daha ciddi bir sinyal olabilir.

**İpucu (Zaman/karmaşıklık maliyeti):**\
Ping en hızlı ön kontroldür. Traceroute yolu gösterir. Pathping/MTR daha fazla veri toplayıp daha uzun sürer ama "aralıklı sorunları" yakalamada daha güçlüdür.

### **D) iperf3: "Yerel link kapasitesini kontrollü ölçmek" (izinli lab)**

-   **Amaç:** İnternet hızını değil; kendi kontrolündeki iki nokta arasındaki **gerçek ağ kapasitesini** ölçmek.

-   **Beklenen çıktı türü:** aktarım hızı gibi net metrikler.

-   **Güvenli sınır:** Sadece kendi lab'ındaki iki cihaz arasında.

**Dikkat:**\
iperf3 testleri kısa süreli bile olsa yoğun trafik üretebilir. Bu yüzden yalnızca kontrollü lab'da, kısa süreli ve bilinçli kullan.

## **Örnek: Troubleshooting mini senaryoları (kanıt + yöntem seçimi)**

### **Örnek 1 --- Görüntülü görüşmede robotik ses, web "genelde" açılıyor**

-   **Belirti:** Ses robotikleşiyor, video anlık donuyor; web çoğu zaman açılıyor.

-   **Olasılıklar:**

    -   Wi-Fi paraziti/sinyal zayıflığı → jitter/loss

    -   Yerel yoğunluk (indirme/stream)

    -   Servis sağlayıcı tarafında kararsızlık

-   **Doğrulama (sırayla, güvenli):**

    -   Gateway'e ping: ping 192.0.2.1

        -   Loss veya dalgalanma varsa: yerel/Wi-Fi şüphesi yükselir.

    -   Mümkünse kısa süreli Ethernet kıyası: aynı ping'i Ethernet'te tekrarla.

        -   Ethernet'te düzeliyorsa: Wi-Fi koşulları öncelikli şüpheli.

    -   Traceroute ile yol davranışı: tracert example.com / traceroute example.com

        -   Ani sıçrama not edilir; ping kanıtıyla birlikte yorumlanır.

-   **Sonuç notu (gözlem--yorum ayrımı):**

    -   **Gözlem:** Gateway ping'inde jitter/loss var.

    -   **Yorum:** Sorun büyük olasılıkla yerel kablosuz koşullarında.

### **Örnek 2 --- "ERP'ye bağlanırken çok bekliyorum ama internet hızlı"**

-   **Belirti:** İzinli kurumsal bir uygulamaya erişim gecikmeli; genel internet hızlı.

-   **Doğrulama fikri:**

    -   Uygulama hedefi için ping ile kararlılık: süreler çok dalgalı mı?

    -   Traceroute ile gecikme artışı hangi bölümde belirginleşiyor?

-   **Yorum örneği:**

    -   **Gözlem:** Ping yanıtları geliyor ama süreler dalgalı. Traceroute'ta belirli bir geçişten sonra gecikme sıçrıyor.

    -   **Yorum:** Kullanıcı cihazından ziyade, yolun belirli bir bölümünde yoğunluk/darboğaz ihtimali artar. (Kesin hüküm yerine "kanıt güçlendirme" yaklaşımıyla ek veri istenir.)

## **Terimler Sözlüğü**

  **Terim**               **Türkçe karşılığı / açıklama**
  ----------------------- -----------------------------------------------------------------------------------------
  Default Gateway         Varsayılan ağ geçidi; yerel ağdan dış ağa çıkış noktası
  Routing                 Yönlendirme; paketin hedefe gidiş yoluna karar verme ve iletme
  Routing Table           Yönlendirme tablosu; "hangi hedefe hangi yoldan gidilir?" bilgisinin mantıksal haritası
  Hop                     Durak/sıçrama; paketin bir ağ cihazından diğerine geçiş adımı
  Traceroute / Tracert    Paketin izlediği yolu hop hop gösteren komut/araç
  TTL (Time To Live)      Yaşam süresi; paketin sonsuz dolaşmasını önleyen sayaç mantığı
  RTT (Round Trip Time)   Gidiş--dönüş süresi; ping'in ölçtüğü temel gecikme değeri
  Latency                 Gecikme; tepkinin geç gelmesi
  Jitter                  Gecikme dalgalanması; özellikle ses/video için kritik
  Packet Loss             Paket kaybı; paketlerin hedefe ulaşmaması
  Pathping                Windows'ta yol + istatistiksel kararlılık/kayıp analizi yapan komut
  MTR                     Linux'ta traceroute + ping yaklaşımıyla sürekli ölçüm aracı
  iperf3                  Kontrollü ortamda iki uç arasında ağ kapasitesi ölçmeye yarayan araç
  Statik Routing          Yolların manuel tanımlandığı yönlendirme yaklaşımı
  Dinamik Routing         Yolların protokollerle otomatik öğrenildiği ve güncellendiği yaklaşım
  OSPF                    Dinamik yönlendirme protokolü; bu modülde kavramsal farkındalık düzeyinde

## **Kendini Değerlendir**

1.  Bir kullanıcı "Wi-Fi bağlı, yerel yazıcı çalışıyor ama hiçbir site açılmıyor" diyor. İlk ve en güvenli doğrulama adımı hangisidir?\
    A) tracert example.com\
    B) Gateway'e ping 192.0.2.1\
    C) mtr example.com\
    D) iperf3 ile hız testi yapmak\
    E) "DNS kesin bozuk" diyerek DNS ayarı değiştirmek\
    **Doğru:** B\
    **Gerekçe:** Yerel yazıcı çalışıyorsa LAN tarafı kısmen sağlıklıdır; dış ağa çıkış için ilk kritik kapı gateway'dir. A/C daha sonra gelir, D farklı amaç, E kanıtsız varsayım.

2.  Traceroute çıktısında 1--3. hop düşük ms iken 4. hop'ta süreler bir anda çok yükseliyor. Bu yorumlardan hangisi en doğru ve "kanıt standardına" uygundur?\
    A) "Kesinlikle 4. hop arızalı."\
    B) "4. hop'tan sonra internet çalışmaz."\
    C) "Gecikme artışı 3→4 arasında belirginleşmiş; ping/kararlılık verisiyle birlikte dar boğaz ihtimali değerlendirilmelidir."\
    D) "Bu kesin DNS problemidir."\
    E) "Traceroute yüksek gösterirse her zaman gerçek trafik de yavaştır."\
    **Doğru:** C\
    **Gerekçe:** Traceroute tek başına kesin hüküm verdirmez; doğru yaklaşım gözlem + ek doğrulama ile yorumdur. A/B/D/E aşırı kesin veya alakasız.

3.  "İndirme hızım yüksek ama görüntülü görüşmede ses robotikleşiyor" şikâyetinde en olası metrik problemi hangisidir?\
    A) Bandwidth (hız) düşüklüğü\
    B) Jitter ve/veya packet loss\
    C) IPv6 devre dışı olması\
    D) Statik routing kullanılması\
    E) MAC adresi çakışması\
    **Doğru:** B\
    **Gerekçe:** Görüşme kalitesi istikrara duyarlıdır; jitter/loss tipik belirtidir. A tek başına açıklamayabilir; C/D/E doğrudan bu belirtiyle en olası bağ değildir.

4.  Ping çıktısında "loss %0" ama RTT değerleri 15ms ile 180ms arasında sık sık zıplıyor. En iyi yorum hangisidir?\
    A) "Sorun yok; loss yoksa her şey mükemmeldir."\
    B) "Bu jitter sinyalidir; ses/video gibi uygulamalar etkilenebilir."\
    C) "Kesin packet loss vardır; ping yanlış ölçüyor."\
    D) "Bu yalnızca DNS kaynaklıdır."\
    E) "Bu durum sadece kablolu bağlantıda olur."\
    **Doğru:** B\
    **Gerekçe:** Loss olmadan da gecikme dalgalanması (jitter) olabilir. A yanlış rahatlık, C/D/E hatalı genelleme.

5.  Traceroute'da bazı satırlarda "\* \* *" görüyorsun, ancak sonraki hop'larda yine yanıtlar devam ediyor ve hedefe ulaşılıyor. En doğru çıkarım hangisi?*\
    *A) "Ağ kesin kopuk."*\
    *B) "O satırdaki cihaz traceroute yanıtlarını kısıtlıyor olabilir; ping ve diğer kanıtlarla birlikte değerlendirilir."*\
    *C) "Bu kesin bir saldırı göstergesidir."*\
    *D) "Bu her zaman router arızasıdır."*\
    *E) "Bu durumda traceroute asla kullanılmamalı."*\
    ***Doğru:** B*\
    ***Gerekçe:** "* \* \*" her zaman arıza değildir; yanıt kısıtlaması olasıdır. C/D aşırı iddialı, A/E yanlış.

6.  Aşağıdaki araç eşleştirmelerinden hangisi "amaç--araç" uyumuna en uygundur?\
    A) Yerel link kararlılığı → iperf3\
    B) Yol haritası → ping\
    C) Kararlılık + yol eğilimi (özellikle aralıklı sorunlar) → mtr/pathping\
    D) Bandwidth hakkında hızlı fikir → traceroute\
    E) Default gateway doğrulaması → traceroute\
    **Doğru:** C\
    **Gerekçe:** mtr/pathping aralıklı sorunlarda kararlılık/yol bileşimini güçlendirir. Diğerleri amaç--araç uyumsuz.

7.  "Statik routing" ile ilgili aşağıdaki ifadelerden hangisi en dengeli ve doğru?\
    A) "Her zaman dinamik routing'den daha iyidir."\
    B) "Küçük ve değişmeyen yapılarda basit/öngörülebilir olabilir; büyüdükçe bakım maliyeti artar."\
    C) "İnternet sadece statik routing ile çalışır."\
    D) "Statik routing olursa gecikme otomatik düşer."\
    E) "Statik routing güvenlik sağladığı için diğer kontroller gereksizdir."\
    **Doğru:** B\
    **Gerekçe:** Statik routing'in yeri vardır; ölçek ve değişimle bakım zorlaşır. A/C/D/E gerçekçi olmayan genellemeler.

8.  Bir sorun için "ev mi, servis sağlayıcı mı, hedef servis mi?" ayrımını yapmak istiyorsun. Aşağıdaki sıra hangisi en düşük risk ve en yüksek doğrulama değeriyle ilerler?\
    A) Önce hedef servise traceroute, sonra gateway ping\
    B) Önce gateway ping, sonra (gerekirse) traceroute, sonra (gerekirse) mtr/pathping\
    C) Önce iperf3, sonra traceroute\
    D) Önce DNS ayarlarını değiştir, sonra ping\
    E) Önce uzun süreli mtr, sonra gateway kontrolü\
    **Doğru:** B\
    **Gerekçe:** Yakından uzağa, hızlıdan ayrıntılıya ilerlemek hem güvenli hem verimlidir. Diğer sıralar ya gereksiz risk/masraf ya da kanıtsız müdahale içerir.

9.  Dinamik routing (GPS benzetmesi) için en doğru "problem sınıfı" hangisidir?\
    A) "MAC adresini otomatik bulmak"\
    B) "Kanal kalabalığını otomatik azaltmak"\
    C) "Link kopunca alternatif yolu otomatik bulmak ve rotayı güncellemek"\
    D) "DNS cache'ini otomatik temizlemek"\
    E) "TCP portlarını otomatik açmak"\
    **Doğru:** C\
    **Gerekçe:** Dinamik routing'in değeri değişime uyumdur. Diğerleri farklı katmanların konusudur.

10. Bir traceroute'ta belirli bir hop'tan sonra gecikme yüksek görünüyor. Hangi ek kanıt, "bu gerçekten kullanıcı deneyimini etkiliyor mu?" sorusuna daha sağlam yaklaşır?\
    A) Sadece "yüksek" dediğin hop'a bakıp karar vermek\
    B) Aynı hedefe ping ile kararlılık/loss/jitter sinyali aramak\
    C) Hemen tüm ağ ayarlarını sıfırlamak\
    D) Rastgele farklı hedeflere yoğun test yapmak\
    E) Cihazı kapatıp açmak ve sorunu çözdüğünü varsaymak\
    **Doğru:** B\
    **Gerekçe:** Ping, kararlılık ve kayıp hakkında ek kanıt sağlar; traceroute tek başına kesin hüküm değildir. C/D/E yöntemsel ve güvenli değildir, A kanıtsızdır.

## **Kapanış: Bu modülde neler kazandık?**

-   Default gateway'in "dış ağa çıkış kapısı" olduğunu ve sorun daraltmada neden ilk durak olduğunu öğrendik.

-   Traceroute/tracert ile yol haritası çıkarıp gecikme artışlarının **nerede belirginleştiğini** okumayı öğrendik.

-   Performansı "hız"tan ayırıp latency--jitter--loss üçlüsünü belirtilerle eşleştirdik.

-   Statik ve dinamik routing farkını (manuel harita vs GPS) kavramsal olarak oturttuk.

-   Komutları ezberlemeden; **amaç → beklenen çıktı → yorum ipucu → güvenli sınır** yaklaşımıyla kanıt üretmeyi geliştirdik.

## **MODÜL 12 --- Troubleshooting Metodolojisi + Trafik Analizi (Kademeli Wireshark)**

Bu modülde "ağ bozuk" gibi geniş şikâyetleri **katmanlı düşünme** ile daraltıp **kanıta dayalı** teşhis yapmayı öğreneceksin. Profesyonel yaklaşım, "modemi kapat-aç" gibi rastgele denemeler yerine; problemi **Fiziksel → IP → DNS → Uygulama** sırasıyla ele alıp, her adımda "bunu ne doğrular/ne çürütür?" diye sormaktır. Temel komutların **çıktı okuryazarlığını** (hangi satır kritik, hangi mesaj neye işaret eder?) oturtacak; sonra Wireshark ile ağın "röntgenini" çekerek ARP/DNS/TCP handshake/TLS/HTTP gibi örüntüleri görüp yorumlayacağız. Son bölümde STP/loop gibi kesinti üreten durumları **konfigürasyon yapmadan**, yalnızca **gözlem ve kanıt** düzeyinde ayırt etmeyi; GUI olmayan sistemlerde ise tcpdump ile hedefli yakalama yapıp PCAP'ı güvenle incelemeyi öğreneceksin. İçerik tamamen **izinli/yerel/kontrollü** ortam varsayımıyla yazılmıştır.

## **Modül Amaçları**

-   Ağ sorunlarını **katmanlı problem çözme** ile sistematik biçimde daraltabilmek (Fiziksel → IP → DNS → Uygulama).

-   Temel teşhis komutlarında **çıktı okuryazarlığı** kazanmak: "hangi alan kritik, bu neyi doğrular/çürütür?" diyebilmek.

-   **Baseline (normal trafik/normal performans)** kavramını küçük ölçekte kurup, anomaliyi "normalden sapma" olarak tanımlayabilmek.

-   Wireshark'ta yakalama yapıp, **capture filter vs display filter** farkını bilmek ve temel filtrelerle kanıt çıkarabilmek.

-   **Broadcast fırtınası / STP döngüsü** gibi kesinti belirtilerini **gözlem düzeyinde** ayırt edip kısa, izlenebilir kanıt paketi oluşturabilmek.

-   Grafik arayüzün olmadığı ortamlarda **tcpdump** ile hedefli yakalama yapıp PCAP'ı güvenli şekilde kaydedip inceleyebilmek.

## **Ana İçerik**

### **12.1 Katmanlı problem çözme**

#### **Ne anlama gelir?**

Troubleshooting, "rastgele dene düzelsin" değil; **belirtiyi doğru katmana yerleştirip** en ucuz/doğru doğrulama adımlarını sırayla uygulamaktır. Giriş seviyesinde ana refleks şu sırayı takip eder:

**Fiziksel → IP → DNS → Uygulama**

-   **Fiziksel:** Link var mı? Wi-Fi sinyali? Kablo/port? "Bağlı" görünüyor mu?

-   **IP:** IP aldım mı? Default gateway var mı? Aynı ağdaki bir hedefe gidebiliyor muyum?

-   **DNS:** İsim çözülüyor mu? Yanlış kayıt mı geliyor? Cache etkisi olabilir mi?

-   **Uygulama:** Port/servis çalışıyor mu? TLS/HTTP cevap veriyor mu?

Bu sıralama hem zaman kazandırır hem de "yanlış katmanda çözüm arama" hatasını azaltır.

Metodoloji olarak iki temel yaklaşımı bilmek işini kolaylaştırır:

-   **Aşağıdan Yukarıya (Bottom-Up):** En güvenlisi. Fiziksel temelden başlar, yukarı çıkar.\
    "Kablo/bağlantı yokken DNS test etmek" gibi zaman kayıplarını engeller.

-   **Böl ve Yönet (Divide & Conquer):** Sorunu ikiye bölerek daraltırsın.\
    Örn. "Ağ mı problem, uygulama mı?" diye hızlı bir ayrım yapıp sonra katmanlı doğrulamaya dönersin.

**İpucu (Katman haritası):**\
Fiziksel ↔ OSI L1, IP ↔ L3, DNS/Uygulama ↔ genelde L7'ye yakın düşünülür. Bu modülde amaç OSI ezberi değil; **doğru sırayla doğru soruyu sormak**.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   **"Wi-Fi bağlı ama internet yok"**: Fiziksel bağlantı var gibi; ama IP/DNS/Uygulama katmanlarında sorun olabilir.

-   **"Sadece bazı siteler açılmıyor"**: IP var; DNS veya uygulama katmanı daha şüpheli.

-   **"Ethernet takınca düzeliyor"**: Wi-Fi koşulları (sinyal/parazit/yoğunluk) fiziksel katmanda şüpheli.

TEMEL işaretler (kanıt yaklaşımıyla):

-   **L1 (Fiziksel) kanıtı:** Bağlantı göstergeleri yok, "media disconnected" benzeri durumlar.

-   **L3 (IP) kanıtı:** IP yok ya da "169.254.x.x (APIPA)" gibi otomatik adres görünüyor; gateway'e ping yok.

-   **L7 (DNS/Uygulama) kanıtı:** IP ile erişiliyor ama isimle erişilmiyor (DNS); veya HTTP 500 gibi uygulama hatası geliyor.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Önce en ucuz kanıt:** Bağlantı durumu + IP/gateway var mı?

-   **Sonra hedefi daralt:** gateway erişimi → DNS çözümleme → uygulama isteği (ör. HTTP başlık kontrolü).

-   **Her adımda not:** "Gözlem ne? Yorum ne? Bu yorum hangi kanıtla değişir?"

**Dikkat:**\
"Bir şey değiştirip düzelince" sebep-sonuç kesinleşmiş sayılmaz. Değişiklik yaptıysan (ör. DNS'i değiştirdin), bir adım geri alıp aynı testi tekrarla; böylece "tesadüf" ile "neden"i ayırırsın.

**İpucu (Yöntem seçimi):**\
"DNS mi, servis mi?" gibi ikili bir soruda önce **DNS kanıtı** üret (nslookup/dig), sonra **uygulama kanıtı** üret (curl -I). Bu sıralama yanlış pozitifi azaltır.

### **12.2 Temel teşhis komutları (çıktı yorumlama)**

#### **Ne anlama gelir?**

Komut çalıştırmak kolaydır; çıktıyı doğru okumak uzmanlıktır. Bir komutu çalıştırmadan önce şunları netleştir:

1.  **Bu komut hangi katmana bakıyor?**

2.  **Beklenen çıktı türü ne?** (liste mi, tek satır mı, istatistik mi?)

3.  **Kritik alan hangisi?** (gateway satırı, loss yüzdesi, cevap kodu, hata mesajı vb.)

**Dikkat:**\
Bu modüldeki komutlar yalnızca **kendi/izinli** ortamında troubleshooting doğrulaması içindir. Keşif/tarama/operasyon amaçlı kullanım yoktur.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Bağlıyım ama çalışmıyor" → ipconfig/ip a IP ve gateway'i görünür kılar.

-   "Site açılmıyor" → nslookup/dig isim çözülüyor mu kanıt üretir.

-   "Ping var ama site açılmıyor" → Taşıma/uygulama katmanında port/servis engeli olabilir.

-   "Yavaş ve kararsız" → ping çıktısındaki **loss** ve **dalgalı RTT** sinyaldir.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

##### **A) IP / Gateway görünürlüğü**

**Windows: ipconfig /all**

-   **Amaç:** IP, subnet, default gateway, DNS sunucuları görünsün.

-   **Beklenen çıktı:** Adaptör bazlı detay liste.

-   **Yorum ipucu:**

    -   "Default Gateway" boşsa dış ağa çıkış zorlaşır.

    -   DNS sunucuları beklenmedikse isim çözümleme şaşabilir.

-   **Güvenli sınır:** Yerel cihazında.

**Linux: ip a ve ip route**

-   **Amaç:** IP adresleri + rota (özellikle default route) kontrolü.

-   **Beklenen çıktı:** Arayüz listesi ve rota tablosu.

-   **Yorum ipucu:** default via \... satırı yoksa gateway yok demektir.

-   **Güvenli sınır:** Yerel cihazında.

**macOS: ifconfig ve netstat -rn**

-   **Amaç:** Arayüz durumu + routing tablosu.

-   **Beklenen çıktı:** Arayüz detayları ve rota listesi.

-   **Yorum ipucu:** "default" veya 0.0.0.0/0 satırı gateway'i işaret eder.

-   **Güvenli sınır:** Yerel cihazında.

##### **B) Ping: Ulaşılabilirlik + "hata mesajlarının dili"**

**Windows/Linux/macOS: ping \<hedef\>**

-   **Amaç:** Ulaşılabilirlik, RTT ve loss sinyali.

-   **Beklenen çıktı:** Yanıt satırları + özet istatistik.

-   **Yorum ipucu:**

    -   **Loss \> %0** → kararlılık sorunu ihtimali artar.

    -   RTT'nin sık "zıplaması" → jitter/kararsızlık sinyali olabilir.

-   **Güvenli sınır:** Önce gateway (ör. 192.0.2.1), sonra izinli lab hedefi (ör. 198.51.100.10).

Ping'in bazı tipik mesajları ve anlamı (kanıta dayalı düşün):

-   **Request timed out (zaman aşımı):** Paket gitti ama cevap gelmedi *gibi* görünür.\
    **Yorum:** Yol üzerinde kayıp, karşı tarafın ICMP'yi kısıtlaması veya anlık yoğunluk olabilir. Tek başına "kesin arıza" değildir; başka kanıt gerekir.

-   **Destination host unreachable:** Yerelde yol bulunamadı/erişim yok.\
    **Yorum:** Genellikle L1/L2/L3 tarafında (IP ayarları, gateway erişimi, link) şüphe artar.

-   **TTL expired in transit:** Paket döngüye girmiş olabilir (routing loop olasılığı).\
    **Yorum:** Bu seviyede "neden"e dair kesin hüküm değil; **olay sinyali** olarak not al ve ek kanıt topla.

**İpucu (Kanıt zinciri):**\
Ping "var" diye uygulama sağlıklı olmaz. Ping "yok" diye de uygulama kesin yok demek değildir (ICMP kısıtlanabilir). Bu yüzden ping'i **tek başına karar mekanizması** yapma.

##### **C) DNS kanıtı (isim çözümleme)**

**Windows: nslookup example.com / Resolve-DnsName example.com**

-   **Amaç:** "DNS cevap veriyor mu, hangi IP dönüyor?" sorusuna kanıt.

-   **Beklenen çıktı:** Dönen kayıt(lar) + kullanılan DNS sunucusu bilgisi.

-   **Yorum ipucu:**

    -   **NXDOMAIN:** "Böyle bir isim yok." (isim yanlış olabilir veya kayıt yoktur)

    -   **Server failed / Time out:** DNS sunucusuna ulaşılamıyor veya sunucu problemli olabilir

-   **Güvenli sınır:** Sadece sorgu; saldırı yok.

**Linux: dig example.com (yoksa resolvectl query example.com)**

-   **Amaç:** DNS yanıtını ve süreleri görmek.

-   **Beklenen çıktı:** Cevap bölümü + query time.

-   **Yorum ipucu:** Query time çok yükselirse gecikme kaynaklarından biri DNS olabilir.

-   **Güvenli sınır:** Yerel sorgu.

**macOS: dig example.com / scutil \--dns**

-   **Amaç:** DNS çözümleme yolu ve sunucuları anlamak.

-   **Beklenen çıktı:** Kayıtlar / yapılandırma listesi.

-   **Yorum ipucu:** VPN/kurumsal profil DNS'i değiştirebilir; baseline ile kıyas önemlidir.

-   **Güvenli sınır:** Yerel.

##### **D) Taşıma/Uygulama katmanı hızlı doğrulama (zararsız)**

**HTTP başlık testi (Linux/macOS/Windows curl): curl -I <https://example.com>**

-   **Amaç:** "DNS çözüldü; TLS/HTTP cevap veriyor mu?" sorusunu hızlı test etmek.

-   **Beklenen çıktı:** HTTP başlıkları (200/301/403/404/500 gibi).

-   **Yorum ipucu:**

    -   DNS doğru olsa bile TLS/HTTP katmanı takılabilir.

    -   4xx/5xx görmek "ulaşabildim ama uygulama/erişim farklı" demektir; "hiç ulaşamıyorum"dan ayrıdır.

-   **Güvenli sınır:** Basit başlık isteği; yük üretmez.

**Windows'ta port kontrol okuryazarlığı (kavramsal): Test-NetConnection \<hedef\> -Port \<port\>**

-   **Amaç:** "Ping var ama port kapalı/engelli mi?" sorusunu doğrulama.

-   **Beklenen çıktı:** Port test sonucu (başarılı/başarısız).

-   **Yorum ipucu:** Ping var + port yok → firewall/servis olasılığı artar.

-   **Güvenli sınır:** Sadece kendi/izinli hedef ve tek bir port.

**Dikkat:**\
"Çıktı iyi görünüyor" diye sorun bitti sayma. Aralıklı sorunlar için aynı testi farklı zamanda tekrarla; mümkünse baseline ile karşılaştır.

*(Not: Traceroute gibi "yol haritası" araçlarını önceki modülde görmüştün. Bu modülde odağımız, komutların üstüne **paket içi kanıt** ekleyerek teşhisi sağlamlaştırmaktır.)*

### **12.3 Baseline kavramına giriş**

#### **Ne anlama gelir?**

Baseline, "normal şartlarda ağım nasıl görünür?" sorusunun cevabıdır. Bir doktorun "ateşin yüksek" demesi için normalin \~36.5°C olduğunu bilmesi gibi; ağda da "ping yükseldi" diyebilmek için normal seviyeyi bilmek gerekir. Baseline, anomaliyi "normalden sapma" olarak tanımlamayı sağlar.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   Normalde gateway'e ping 5--10ms iken bir gün 80--150ms'e çıkıyorsa sapmadır.

-   Normalde DNS query time 20--40ms iken 300ms'e çıkıyorsa sapmadır.

-   Normalde Wi-Fi'da loss yokken %5 görüyorsan sapmadır.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

Küçük bir baseline şablonu tut (giriş seviyesi için yeterli):

-   **Zaman:** tarih/saat

-   **Ağ durumu:** Wi-Fi/Ethernet, (kendi ağın) SSID, sinyal (gözlem)

-   **IP/gateway/DNS:** var mı, hangi değerler?

-   **Ping:** gateway RTT/loss

-   **DNS:** nslookup/dig sonucu + süre

-   **Uygulama:** curl -I durum kodu + hızlı gözlem

**İpucu (Baseline = hızlandırıcı):**\
Baseline küçük bile olsa troubleshooting hızını ciddi artırır: "Bu değer normal mi?" tartışmasını bitirir; seni doğrudan "neden"e taşır.

### **12.4 Wireshark (kademeli)**

#### **Ne anlama gelir?**

Komutlar çoğu zaman "problem var" der; Wireshark ise "problem **şurada** ve **şu nedenle**" demeye yaklaşır. Wireshark, ağ trafiğini gözlemleyip paket seviyesinde kanıt üretir. Bu modülde hedef "paket avcılığı" değil; **sık örüntüleri tanımak** ve doğru filtreyle kanıt çıkarabilmektir.

**Önemli uyarı (kesin):** Wireshark yalnızca **kendi cihazında** ve **yazılı izin aldığın** ağda kullanılır. İzinsiz paket yakalamak hukuki/etik olarak yanlıştır.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   "DNS çalışmıyor mu?" → DNS sorgusu gidiyor mu, cevap geliyor mu?

-   "Site açılmıyor" → TCP handshake var mı? TLS aşaması nerede takılıyor?

-   "Uygulama hatası mı ağ mı?" → HTTP durum kodu görülebiliyor mu? (şifreli olmayan/izinli koşullarda)

#### **Nasıl doğrularım/çürütürüm? (güvenli, kademeli)**

**Adım 1 --- Doğru arayüzü seç**\
Wi-Fi mı Ethernet mi? Yanlış arayüz seçmek en sık hatadır.

**Adım 2 --- Kısa yakala, sonra incele**\
10--30 saniyelik capture çoğu zaman yeterlidir. Uzun yakalama gürültü üretir.

**Adım 3 --- Capture filter vs Display filter (kavramsal fark)**

-   **Capture filter:** Yakalanacak trafiği en baştan sınırlar (daha az veri, daha temiz kanıt).

-   **Display filter:** Yakalanmış veriyi ekranda süzer (analiz kolaylaşır).

**İpucu (Gürültü yönetimi):**\
İlk yakalamalarda "az yakala, çok yorumla." 2 dakikalık temiz bir PCAP, 2 saatlik gürültüden daha değerlidir.

#### **Temel örüntüler (bu modülde görmen gerekenler)**

-   **ARP:** Yerelde IP → MAC bulma trafiği

-   **DNS:** Sorgu/cevap akışı

-   **TCP 3-way handshake:** SYN → SYN-ACK → ACK (sağlıklı başlangıç)

-   **TLS:** HTTPS oturum kurulum sinyalleri (gözlem düzeyi)

-   **HTTP:** (görünürse) istek/yanıt ve durum kodları

#### **Sık görülen "iyi/kötü" bağlantı örüntüleri (kanıt okuryazarlığı)**

-   **Sağlıklı:** SYN → SYN-ACK → ACK tamamlanır; ardından veri akışı gelir.

-   **Cevap yok:** SYN gider, uzun süre cevap gelmez; tekrar denemeler (retransmission) görünebilir.

    -   **Yorum:** Kayıp/filtreleme/servise ulaşamama ihtimali artar; tek başına hüküm değil, bağlam şart.

-   **Reddedilen:** SYN gider, karşıdan **RST** döner.

    -   **Yorum:** Port kapalı veya servis o portta dinlemiyor olabilir ("kapı var ama kilitli değil, kapı yok gibi").

**Dikkat (renk yanılsaması):**\
Wireshark renkleri profile göre değişebilir. Renge değil; **paket tipine ve akışın mantığına** bak.

#### **Display filter örnekleri (okuryazarlık)**

-   ip.addr == 192.0.2.10 → Bu IP ile ilgili paketleri göster

-   dns → DNS paketleri

-   tcp.port == 80 / tcp.port == 443 → Web trafiği (HTTP/HTTPS portları)

-   tls → TLS paketleri

-   http.response.code == 404 → "Sayfa bulunamadı" yanıtlarını ayıkla (görünür koşullarda)

#### **Akışı anlamak: Follow TCP Stream**

Yüzlerce paketi tek tek okumak yerine, uygun bir pakete sağ tıklayıp **Follow → TCP Stream** ile konuşmayı tek pencerede birleştirerek okuyabilirsin (izinli/uygun senaryolarda).

#### **Özet görünürlük: Conversations / Endpoints**

"Kim kiminle konuşuyor?" sorusu için Conversations/Endpoints ekranları hızlı kanıt üretir: Hangi IP'ler yoğun, hangi çiftler çok konuşuyor, anomali var mı?

### **12.5 STP/loop kaynaklı kesinti okuryazarlığı (Wireshark ile gözlem odaklı)**

#### **Ne anlama gelir?**

Ağ bazen "internet yok" gibi değil, "her şey yavaşladı, cihazlar kopuyor" gibi davranır. Özellikle switch'li ortamlarda **loop (döngü)** oluşması, **broadcast fırtınası** benzeri bir etkiyle ağı tıkayabilir. Bu modülde hedef **loop oluşturmak değil**; belirtileri okuyup **gözlem kanıtı** üretmektir.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   İnternet ve yerel ağ aniden kullanılamaz hale gelebilir.

-   Switch ışıkları aşırı yoğun yanıp sönebilir (ortam ve cihaza göre değişir).

-   Ping süreleri fırlar, packet loss artabilir; Wi-Fi bile etkilenebilir (altyapı boğulduğu için).

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

**Wireshark ile yalnızca gözlem:**

-   Normalin çok üstünde paket hızı (saniyede çok yüksek paket sayısı) görülebilir.

-   Paketlerin önemli kısmı **broadcast/multicast** olabilir (örn. tekrar eden ARP Request türü paketler).

-   Aynı paketlerin tekrar tekrar gelmesi "fırtına" sinyali olabilir.

**STP rolü (kavramsal + gözlem):**

-   Wireshark'ta stp filtresiyle **BPDU** paketleri görülebilir; switch'lerin döngü kontrol konuşmasıdır.

-   Sağlıklı ağda BPDU'lar düzenli ama sınırlı sayıda görülebilir.

-   Topoloji değişimi gibi durumlarda daha fazla kontrol trafiği görülebilir (örn. TCN türü bildirimler).

**Kanıt paketi (giriş seviyesi standardı):**

-   10--20 saniyelik PCAP kesiti

-   Yakalama zamanı + bağlam notu (hangi cihaz, hangi arayüz, hangi belirti)

-   Basit özet: Conversations/Endpoints notu veya ekran görüntüsü (varsa)

**Dikkat:**\
STP/loop bölümünde **konfigürasyon adımı yok**. Burada yalnızca "gözlemle ayırt etme" ve "kanıt paketleme" var.

### **12.6 tcpdump + CLI analiz ekosistemi**

#### **Ne anlama gelir?**

GUI olmayan sunucularda Wireshark çalıştıramayabilirsin. Buradaki dostun tcpdump gibi CLI araçlarıdır. Bu modülde amaç:

-   doğru arayüzü seçmek,

-   kısa ve hedefli yakalamak,

-   PCAP'ı kaydetmek,

-   sonra güvenle incelemek.

#### **Gerçek hayatta belirtisi/örneği nedir?**

-   "Sadece şu servise bağlanırken sorun" → sadece o portu yakalayıp kanıt üretebilirsin.

-   "DNS yanıtı geliyor mu?" → sadece 53 trafiğini yakalayıp doğrulayabilirsin.

#### **Nasıl doğrularım/çürütürüm? (güvenli)**

**Temel kalıp (Linux/macOS):**

-   -i \<arayüz\>: arayüz seçimi

-   -n: isim çözümleme yapma (IP/port göster; hız ve netlik sağlar)

-   port \<n\> / host \<IP\>: basit filtreleme

-   -w \<dosya\>.pcap: dosyaya yaz

-   -r \<dosya\>.pcap: dosyadan oku

**Örnek: hedefli ve kısa yakalama (izinli/lab)**

sudo tcpdump -i eth0 -n host 198.51.100.10 and port 80 -w analiz.pcap

-   **Amaç:** Gürültüyü azaltıp sadece ilgili trafiği yakalamak

-   **Beklenen çıktı türü:** yakalama sayaç/özet; asıl kanıt analiz.pcap dosyası

-   **Yorum ipucu:** Dosya büyüyorsa süreyi kısalt; gürültü artıyorsa filtreyi daralt

-   **Güvenli sınır:** Kendi/izinli ağında, kontrollü süreyle

**Ekosistem farkındalığı:**

-   tshark: Wireshark'ın CLI karşılığı gibi düşünülebilir (okuma/filtreleme)

-   termshark: terminalde paket analizi arayüzü (okuryazarlık düzeyi)

**İpucu (Kanıt bütünlüğü):**\
PCAP bir kanıttır. Dosyayı tarih/saat/bağlamla adlandırmak (örn. 2026-02-09_web_80_issue.pcap) izlenebilirliği artırır. Ayrıca PCAP'ı paylaşmadan önce gizlilik/kişisel veri riskini düşün.

## **Örnek: Troubleshooting mini senaryosu (Yerel/İzinli)**

**Belirti → Olasılık → Doğrulama → Sonuç**

**Belirti:** İzinli bir lab ortamında bir web sunucusuna erişilemiyor. Sunucu IP'sine ping atılabiliyor ama web sayfası açılmıyor. (Örnek hedef: 192.0.2.50)

**Olasılıklar:**

1.  Sunucu tarafında web servisi durmuş/kilitlenmiş olabilir.

2.  Sunucu üzerindeki yerel güvenlik duvarı (firewall) portu engelliyor olabilir.

3.  Yanlış port/yanlış uygulama yönlendirmesi olabilir (uygulama katmanı).

**Doğrulama (katmanlı, güvenli):**

1.  **L3 doğrulama:**

    a.  ping 192.0.2.50

    b.  **Gözlem:** Ping başarılıysa "sunucu ayakta + temel ağ yolu var" ihtimali artar.

2.  **L4/L7 doğrulama (port/uygulama):**

    a.  İstemciden: curl -I <http://192.0.2.50> (veya izinli senaryoda alan adın varsa)

    b.  Windows ortamında: Test-NetConnection 192.0.2.50 -Port 80

    c.  **Gözlem:** Ping var ama port/HTTP yoksa, sorun L4/L7 tarafına kayar.

3.  **Paket kanıtı (sunucu tarafında, izinli):**

    a.  Sunucuda hedefli yakalama: tcpdump -i eth0 -n port 80 (ekrana akıtmak yerine kısa süreli gözlem veya -w ile PCAP)

    b.  **Gözlem seçenekleri:**

        i.  SYN paketleri geliyor ama sunucudan SYN-ACK dönmüyorsa: sunucu cevap üretmiyor/engelleniyor olabilir.

        ii. SYN'e RST dönüyorsa: port kapalı veya servis dinlemiyor olabilir.

**Sonuç (kanıta dayalı):**

-   "Ağ bozuk" demek yerine, kanıtı cümleye bağla:

    -   **Gözlem:** "Sunucuya ping var, fakat TCP/80 handshake tamamlanmıyor / HTTP başlığı dönmüyor."

    -   **Yorum:** "Bu, ağ yolundan ziyade servis/firewall tarafını daha olası kılar."

    -   **Bir sonraki kanıt ihtiyacı:** "Servis durumu ve firewall kuralları/logları (izinli ortamda) incelenmeli."

**Dikkat (Gözlem--yorum ayrımı):**\
"Firewall engelliyor" bir yorumdur. Kanıt cümlesi ise "SYN geliyor, cevap dönmüyor" veya "RST dönüyor" gibi gözlemdir. Rapor dili gözlemle başlar.

## **Terimler Sözlüğü (Glossary)**

  **Terim**                 **Türkçe karşılığı / açıklama**
  ------------------------- ----------------------------------------------------------------------------
  Troubleshooting           Sorun giderme; sistematik teşhis ve doğrulama süreci
  Katmanlı yaklaşım         Fiziksel → IP → DNS → Uygulama sırası ile daraltma yöntemi
  Bottom-Up                 Aşağıdan yukarıya yaklaşım; fizikselle başlayıp katman katman ilerleme
  Divide & Conquer          Böl ve yönet; sorunu ikiye bölerek hızlı daraltma
  Doğrulama                 Bir varsayımı kanıtla destekleme veya çürütme
  Kanıt                     Gözlemi destekleyen çıktı/kayıt (komut çıktısı, PCAP vb.)
  Baseline                  Referans noktası; ağın "normal" performans/tarfik davranışı
  Capture                   Trafik yakalama işlemi
  PCAP                      Packet Capture; yakalanan trafiğin dosya formatı
  Capture filter            Yakalanacak trafiği baştan sınırlayan filtre (kavramsal)
  Display filter            Yakalanmış trafiği ekranda süzen filtre
  ARP                       Yerel ağda IP--MAC ilişkilendirme (çözümleme) mekanizması
  DNS                       Alan adı çözümleme sistemi
  TCP handshake             TCP bağlantı başlatma süreci (SYN/SYN-ACK/ACK)
  Retransmission            Yeniden iletim; cevap gelmeyen paketin tekrar gönderilmesi
  RST (Reset)               Bağlantının reddedildiğine dair TCP sinyali
  TLS                       Şifreli oturum kurulum katmanı (HTTPS'in temeli)
  Broadcast storm           Yayın fırtınası; aşırı broadcast/multicast trafiğiyle tıkanma
  Loop                      Ağda döngü; tekrarlı trafik ve kesinti doğurabilir
  STP                       Spanning Tree Protocol; switch döngülerini engelleyen protokol (kavramsal)
  BPDU                      STP kontrol çerçeveleri (gözlem düzeyi)
  TCN                       Topology Change Notification; topoloji değişimi bildirimi (gözlem düzeyi)
  tcpdump                   CLI üzerinden paket yakalama aracı
  tshark                    Wireshark'ın komut satırı analiz aracı (okuryazarlık düzeyi)
  Endpoints/Conversations   Wireshark'ta kim kiminle konuşuyor özet görünümü

## **Kendini Değerlendir**

**1) Bir kullanıcı "Wi-Fi bağlı ama hiçbir site açılmıyor" diyor. Aşağıdaki sırayla ilerlemek, katmanlı düşünme açısından en doğru ve düşük maliyetli yaklaşıma en yakındır.**\
A) curl -I → dig → ping gateway → ipconfig\
B) ipconfig/ip a → ping gateway → nslookup/dig → curl -I\
C) nslookup/dig → curl -I → ipconfig → ping gateway\
D) Wireshark capture → Follow TCP Stream → curl -I → ping\
E) DNS'i değiştir → yeniden başlat → düzelmezse Wireshark

-   **Doğru şık: B**

-   **Kısa gerekçe:** Önce IP/gateway görünürlüğü (L2/L3 sinyali), sonra gateway erişimi (L3), sonra DNS (L7'ye giden temel bağımlılık), en sonda uygulama doğrulaması. Diğer şıklar üst katmandan başlayıp yanlış katmanda zaman kaybettirir veya kanıtsız "değiştir-düzelsin" yaklaşımına kayar.

**2) Ping çıktısında "Destination host unreachable" görüyorsun. Bu mesaj en çok hangi problem sınıfını "ilk şüpheli" yapar?**\
A) DNS yanlış kayıt dönüyor\
B) Uygulama sunucusu HTTP 500 veriyor\
C) Yerel erişim/gateway yönü (L1/L2/L3) problemli olabilir\
D) TLS sertifikası geçersiz\
E) Web sunucusu port 80'i cevaplıyor ama 404 veriyor

-   **Doğru şık: C**

-   **Kısa gerekçe:** "Unreachable" genellikle paket yerelde rota/erişim bulamadı sinyalidir (kablo, NIC, IP ayarı, gateway). DNS/TLS/HTTP gibi uygulama katmanı sorunları bu mesajı tipik olarak üretmez.

**3) nslookup example.com çıktısında NXDOMAIN görüyorsun. Aşağıdaki yorumlardan hangisi en doğru ve kanıt-odaklıdır?**\
A) "İnternet kesin yok."\
B) "DNS sunucusu cevap verdi; bu isim için kayıt yok (isim yanlış veya kayıt gerçekten yok)."\
C) "Firewall engelliyor."\
D) "TLS sorunlu."\
E) "Switch'te loop var."

-   **Doğru şık: B**

-   **Kısa gerekçe:** NXDOMAIN, DNS'in yanıt verdiğini ama adın mevcut olmadığını belirtir. "İnternet yok" veya firewall/loop/TLS gibi yorumlar ek kanıt olmadan sıçramadır.

**4) Ping başarılı, fakat web sayfası açılmıyor. Test-NetConnection \<hedef\> -Port 80 başarısız. En mantıklı "bir sonraki" kanıt adımı hangisidir?**\
A) DNS cache temizlemek\
B) Wireshark/tcpdump ile hedefte TCP/80 handshake olup olmadığını gözlemek\
C) Subnetting hesabını tekrar yapmak\
D) Wi-Fi kanalını değiştirmek\
E) IP adresini APIPA'ya almak

-   **Doğru şık: B**

-   **Kısa gerekçe:** L3 (ping) çalışıyor, L4 port testi başarısız. Paket içi kanıt (SYN gidiyor mu, RST mi dönüyor, cevap yok mu) sorunun servis/firewall/ulaşım ayrımını netleştirir. Diğerleri kanıt zinciriyle uyumsuz, rastgele adımlardır.

**5) Wireshark'ta TCP bağlantısı başlatılırken SYN paketleri gidiyor; karşıdan SYN-ACK gelmiyor ve tekrar denemeler (retransmission) görüyorsun. Bu gözlem tek başına hangi kesin sonuca götürmez?**\
A) "Uzak tarafın kesin firewall ile engellediği."\
B) "Bağlantı kurulumu tamamlanmıyor."\
C) "Paket kaybı/filtreleme/servise ulaşamama olasılığı artar."\
D) "Daha fazla bağlam/kanıt gerekir."\
E) "Sorun uygulama seviyesinden önce, bağlantı kurulumunda olabilir."

-   **Doğru şık: A**

-   **Kısa gerekçe:** SYN-ACK gelmemesi firewall olabilir ama tek açıklama değildir (kayıp, yanlış yol, servis down, rate limit vb.). Diğer şıklar gözlemle uyumludur ve "kesin hüküm" vermez.

**6) Wireshark'ta SYN'e RST dönüyor. En doğru yorum hangisine daha yakındır?**\
A) DNS bozuk\
B) Port kapalı veya o portta servis dinlemiyor olabilir\
C) Kablo kopuk\
D) Loop kesin vardır\
E) TTL expired olduğuna işaret eder

-   **Doğru şık: B**

-   **Kısa gerekçe:** RST genellikle "bu bağlantıyı istemiyorum / burada dinleyen yok" sinyalidir. DNS/kablo/loop/TTL ile doğrudan aynı şey değildir.

**7) Baseline yaklaşımını doğru anlatan seçenek hangisidir?**\
A) "Sadece sorun olunca ölçüm alınır; normal gereksiz."\
B) "Normal davranışı bilmeden anomaliyi güvenle tanımlamak zordur."\
C) "Baseline, sadece bant genişliği demektir."\
D) "Baseline varsa Wireshark'a gerek kalmaz."\
E) "Baseline, DNS'i hep aynı IP'ye sabitlemektir."

-   **Doğru şık: B**

-   **Kısa gerekçe:** Baseline normal davranış referansıdır; anomaliyi 'sapma' olarak tanımlar. Diğer şıklar baseline'ı daraltır veya yanlış tanımlar.

**8) STP/loop şüphesi olan bir ortamda, bu modülün white-hat sınırlarına en uygun kanıt paketi hangisidir?**\
A) Switch konfigürasyonuna girip STP kapatmak\
B) Ağda agresif tarama yapıp paket yağdırmak\
C) 10--20 sn PCAP + yakalama zamanı/bağlam notu + Conversations/Endpoints özeti\
D) Kabloyu rastgele çekip takmak\
E) Her cihazın trafiğini uzun süre kaydetmek

-   **Doğru şık: C**

-   **Kısa gerekçe:** Modül bu bölümde konfigürasyon değil **gözlem + kanıt paketleme** öğretir. Diğerleri riskli, yetki dışı veya gereksiz veri toplama doğurur.

**9) tcpdump -i eth0 -n host 198.51.100.10 and port 80 -w analiz.pcap komutunda -n seçeneğinin en doğru gerekçesi hangisidir?**\
A) Paketleri şifreler\
B) İsim çözümleme yapmayarak daha hızlı ve daha net çıktı sağlar\
C) STP paketlerini otomatik ayıklar\
D) Sadece broadcast paketlerini yakalar\
E) HTTP 500 hatalarını düzeltir

-   **Doğru şık: B**

-   **Kısa gerekçe:** -n isim çözümlemesini kapatır; hız ve netlik sağlar. Diğerleri tcpdump'ın bu parametresiyle ilgili değildir.

## **Bu modülde neler öğrendik?**

-   "Ağ bozuk" gibi geniş şikâyetleri **katmanlı düşünme** ile daraltmayı (Fiziksel → IP → DNS → Uygulama).

-   Komut çalıştırmaktan öte, **çıktı okuryazarlığı** ile hangi satırın neyi doğruladığını/çürüttüğünü.

-   Baseline tutarak "normalden sapma" mantığıyla anomaliyi tanımlamayı.

-   Wireshark'ta kısa ve hedefli capture alıp ARP/DNS/TCP/TLS/HTTP örüntülerini filtreleyerek kanıt çıkarmayı.

-   SYN-ACK yok / RST dönüyor gibi örüntülerle "kayıp mı, engel mi, servis mi?" sorusuna daha kanıtlı yaklaşmayı.

-   STP/loop şüphesini **konfigürasyona girmeden**, yalnızca gözlem ve kanıt düzeyinde raporlanabilir hale getirmeyi.

-   tcpdump ile CLI ortamında hedefli yakalama yapıp PCAP'ı güvenle saklama ve inceleme refleksini.

# **MODÜL 13 --- Yetkili Keşif (Recon) ve Envanter Okuryazarlığı**

Bir ağı korumanın ilk kuralı, **o ağda ne olduğunu** bilmektir: "Göremediğinizi koruyamazsınız." Bu modülde amaç, "ağda ne var?" sorusuna **yetkili, güvenli ve kanıta dayalı** biçimde cevap verebilmektir. Troubleshooting (Modül 12) sırasında en çok zaman kaybettiren şey, ortamın envanterinin belirsiz olmasıdır: hangi cihazlar var, hangi IP'ler kullanılıyor, hangi kritik hizmetler nerede çalışıyor? Bu modül; **pasif keşif** (mevcut kayıt/tabloları okuma) ile **kontrollü aktif doğrulama** (düşük yoğunluklu teyit) farkını netleştirir, "**önce en az müdahale**" prensibini refleks haline getirir. Ayrıca keşif faaliyetlerinin savunma tarafında bıraktığı **tespit sinyallerini** okuryazarlık düzeyinde ele alır; keşiften çıkan bulguları **hardening** (sıkılaştırma) önerilerine kavramsal olarak bağlar. Tüm içerik yalnızca **izinli/yerel/kurum içi yetkili** ortam varsayımıyla yazılmıştır.

## **Hedefler**

-   Yetkili keşfin amacını, sınırlarını ve **pasif vs. kontrollü aktif** keşif farkını açıklayabilmek.

-   Keşfi "rastgele deneme" değil, **soruyla başlayan ve kanıtla ilerleyen** bir metodolojiyle yürütebilmek.

-   Basit kaynaklardan (DHCP/ARP/komşu tabloları, Wi-Fi istemci listeleri) **mini envanter** çıkarabilmek ve tutarlı kayıt tutabilmek.

-   Keşif/en­vanter sürecinin ürettiği **tespit sinyallerini** okuyup "normal / sapma" ayrımı yapabilmek.

-   Keşiften çıkan riskleri **kavramsal hardening** önerilerine dönüştürebilmek.

-   Yetkili keşfi, izinli platformlar ve güvenli çalışma çerçevesi içinde planlayıp **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** ile raporlayabilmek.

## **Ana içerik**

## **13.1 Keşif metodolojisi (yetkili)**

### **Ne anlama gelir?**

**Yetkili keşif (recon)**, bir ağda/ortamda varlıkları görünür kılma işidir:

-   Hangi cihazlar var?

-   Hangi IP aralıkları kullanılıyor?

-   Hangi kritik hizmetler (ör. yönetim arayüzleri) nerede?

-   Envanter dışı cihaz var mı?

Bu modülde keşif, "saldırı hazırlığı" değil; **düzenli sağlık kontrolü** ve **envanter yönetimi** yaklaşımıdır. Özellikle yöneticinin haberi/onayı dışında ağa bağlanan cihazlar "**Gölge BT (Shadow IT)**" riskini doğurur (ör. izinsiz takılmış bir kablosuz erişim noktası, kontrolsüz bir IoT cihazı).

Giriş seviyesinde güvenli metodoloji şu iskeletle yürür:

1.  **Soru/Senaryo netliği:** "Neyi bulmaya çalışıyorum?"

2.  **Kapsam (scope):** Hangi ağ(lar), hangi zaman penceresi, hangi cihazlar **izinli**?

3.  **Pasif keşif (önce):** Mevcut kayıt ve tablolardan görünürlük çıkar (en az müdahale).

4.  **Kontrollü aktif doğrulama (sonra):** Gerekirse yalnızca izinli hedeflere **düşük yoğunluklu** teyit adımı uygula.

5.  **Çapraz kontrol:** Tek kaynağa güvenme; en az iki bağımsız kanıtla teyit et.

6.  **Kayıt & raporlama:** Gözlem ve yorumu ayır; Bulgu → Etki → Öneri → Kanıt formatında paketle.

**Pasif keşif**: DHCP lease listesi, ARP/komşu tablosu, router/AP istemci listeleri, envanter/etiket kayıtları gibi hazır verileri okumaktır.\
**Kontrollü aktif doğrulama**: Pasif bulguyu teyit etmek için, **servis kesintisi üretmeyecek** basit doğrulama adımlarıdır (ör. belirli bir izinli IP'ye tekil ping gibi).

**İpucu (Keşif = amaç odaklıdır):**\
Keşif "haritanın tamamını çıkarmak" değil; belirli bir soruya en kısa yoldan, en az müdahaleyle yanıt bulmaktır. "Önce pasif, sonra kontrollü aktif" yaklaşımı hem zaman kazandırır hem de yanlış pozitifleri azaltır.

**Dikkat (White-Hat sınırı):**\
Yetkili olmadığın ağlarda keşif yok. Keşif sırasında **agresif deneme, yoğun istek üretme, servis kesintisine yol açabilecek davranış** bu eğitimin sınırları dışındadır. Bu modülde "operasyonel tarama" değil, **envanter okuryazarlığı** öğretilir.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Yeni bir ofise geldin: "Hangi yazıcılar var, hangi IP'leri kullanıyorlar?"

-   Ev ağında "internet yavaşladı": aynı anda ağa çok cihaz bağlanmış olabilir.

-   Kurum içinde "IP çakışması" şüphesi: önce **IP↔MAC eşleşmesi** görmen gerekir.

-   "Misafir Wi-Fi'a biri bağlandı mı?" şüphesi: istemci listesinden doğrulama ihtiyacı.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Pasif kaynakları oku:** DHCP lease listesi, router/AP istemci listesi, ARP/komşu tablosu.

-   **Çapraz kontrol yap:** Aynı cihazı hem DHCP listesinde hem ARP/komşu tablosunda görmeye çalış.

-   **Gerekiyorsa kontrollü aktif teyit:**

    -   Sadece izinli IP'ye **tekil** ping (sürekli/yoğun değil).

    -   Sadece kendi cihazında bağlantı/rota doğrulaması (Modül 12'deki katmanlı yaklaşımı hatırla).

**İpucu (Kanıt kalitesi):**\
"Şüpheli cihaz var" demek yerine: "Şu MAC, şu IP ile DHCP lease'te görüldü; ARP/komşu tablosunda şu saat aralığında gözlendi" gibi **kanıt cümlesi** kur. Bu, raporlanabilirliği ciddi artırır.

### **Komut & Araç Okuryazarlığı (temel hedef)**

Bu bölümdeki komutlar **tarama/atak** için değil; **envanter görünürlüğü** ve **kontrollü doğrulama** içindir. Hepsi yalnızca **kendi/izinli** ortamında kullanılmalıdır.

#### **A) Yerel ağ kimliğini ve kapsama sınırını görmek**

**Windows: ipconfig /all**

-   **Amaç:** IP, subnet, default gateway, DNS; "ben neredeyim?" sorusuna cevap.

-   **Beklenen çıktı türü:** Adaptör bazlı detay liste.

-   **Yorum ipucu:** IP/subnet bilgisi, keşfin kapsamını yanlış seçme riskini azaltır.

-   **Güvenli sınır:** Yerel cihaz.

**Linux: ip a + ip route**

-   **Amaç:** IP adresleri + default route (gateway) görünürlüğü.

-   **Beklenen çıktı türü:** Arayüz listesi + rota tablosu.

-   **Yorum ipucu:** default via \... yoksa, dış ağa çıkış varsayımı hatalı olabilir.

-   **Güvenli sınır:** Yerel cihaz.

**macOS: ifconfig + netstat -rn**

-   **Amaç:** Arayüz durumu + routing tablosu.

-   **Beklenen çıktı türü:** Arayüz detayları + route listesi.

-   **Yorum ipucu:** default satırı gateway'i işaret eder; bu, "hangi ağa bağlıyım?" sorusunu netleştirir.

-   **Güvenli sınır:** Yerel cihaz.

#### **B) Aynı ağda kimleri "komşu" olarak görüyorum? (pasif-ağırlıklı)**

**Windows: arp -a** *(veya PowerShell: Get-NetNeighbor)*

-   **Amaç:** IP↔MAC eşleşmelerini görmek (yerel görünürlük).

-   **Beklenen çıktı türü:** IP ve MAC satırları (dinamik/statik).

-   **Yorum ipucu:** Bu tablo "tüm ağı" değil, **senin cihazının gördüğü komşuları** yansıtır.

-   **Güvenli sınır:** Yerel.

**Linux: ip neigh** *(veya arp -n)*

-   **Amaç:** Komşu tablosunu (neighbor) görmek.

-   **Beklenen çıktı türü:** IP, MAC, durum (REACHABLE/STALE vb.).

-   **Yorum ipucu:** Durumlar "en son ne zaman görüldü?" hakkında sinyal verir; **tek başına hüküm** değildir.

-   **Güvenli sınır:** Yerel.

**macOS: arp -a**

-   **Amaç/çıktı/yorum:** Windows ile benzer; yerel görünürlük sağlar.

-   **Güvenli sınır:** Yerel.

#### **C) Kontrollü aktif doğrulama (düşük yoğunluk)**

**Windows/Linux/macOS: ping \<izinli_hedef\>**

-   **Amaç:** Belirli bir IP'nin erişilebilirliğini doğrulamak (envanter teyidi).

-   **Beklenen çıktı türü:** Yanıt satırları + özet.

-   **Yorum ipucu:** Ping cevabı yoksa cihaz yok demek zorunda değildir (ICMP kısıtlanmış olabilir). Bu yüzden ping'i **tek kanıt** yapma.

-   **Güvenli sınır:** Sadece izinli hedefler; sürekli/yoğun ping yok.

-   **Örnek:** ping 192.0.2.10

#### **D) Kendi cihazımda hangi servisler "dinliyor"? (envanterin servis boyutu)**

**Windows: netstat -ano** *(veya PowerShell: Get-NetTCPConnection -State Listen)*

-   **Amaç:** Yerel makinede dinleyen portları görmek (kendi envanterin).

-   **Beklenen çıktı türü:** Local Address:Port + PID.

-   **Yorum ipucu:** "Dinliyor" görmek, dışarıdan erişilebilir olduğu anlamına gelmez (firewall/NAT etkisi olabilir).

-   **Güvenli sınır:** Yerel.

**Linux: ss -tulpn** *(yetki gerekebilir)*

-   **Amaç:** Dinleyen servisleri ve süreçleri görmek.

-   **Beklenen çıktı türü:** Port + süreç adı/PID.

-   **Yorum ipucu:** Bu, hizmet envanterinin en temel kanıtlarından biridir.

-   **Güvenli sınır:** Yerel.

**macOS: lsof -i -P -n**

-   **Amaç:** Ağ bağlantısı açan/dinleyen süreçleri görmek.

-   **Beklenen çıktı türü:** Süreç adı + portlar.

-   **Güvenli sınır:** Yerel.

**Dikkat (Keşif vs tarama):**\
Bu modülde amaç "ağın her yerini yoklamak" değil; envanter okuryazarlığı ve kontrollü doğrulamadır. Çok sayıda hedefe kısa sürede ardışık istek gönderen agresif yöntemler bu seviyenin ve white-hat sınırının dışındadır.

## **13.2 Tespit sinyalleri (okuryazarlık)**

### **Ne anlama gelir?**

**Tespit sinyalleri**, bir ağda keşif faaliyeti, anomali veya hızlı değişim olduğunda geride kalan izlerdir. Savunma bakışıyla "**neler normal, neler sapma?**" sorusunu cevaplamaya yarar. Yetkili keşif yaparken bile güvenlik cihazları bunu "şüpheli aktivite" gibi loglayabilir; bu yüzden **koordinasyon** (kimin, ne zaman, ne amaçla yaptığı) ve **düşük yoğunluk** önemlidir.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Router arayüzünde kısa sürede çok sayıda istemci görünüp kayboluyorsa (bağlan-kop).

-   ARP tablosunda aynı IP'nin farklı zamanlarda farklı MAC'lerle eşleşmesi (IP çakışması veya ARP anomali sinyali).

-   DNS tarafında kısa sürede çok sayıda farklı isim sorgusu (normal mi? baseline ile kıyas gerekir).

-   Loglarda, kısa sürede çok sayıda port/servise erişim denemesi (özellikle düzenli ve hızlıysa).

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Baseline ile kıyasla (Modül 12 köprüsü):** Bugünkü yoğunluk gerçekten "normalden sapma" mı?

-   **Kaynakları çapraz kontrol et:**

    -   Router/AP istemci listesi + DHCP lease + ARP/komşu tablosu

    -   (İzinli ortamda) kısa süreli paket gözlemi ile örüntü teyidi (Modül 12'deki kanıt yaklaşımı)

-   **Yanlış pozitifleri düşün:** Bazı cihazlar (örn. IoT) periyodik olarak kısa trafik üretir. "Sinyal" tek başına suçlama değildir; mutlaka ikinci kanıt ara.

**İpucu (Sinyal → varsayım → kanıt):**\
"Şüpheli keşif var" demeden önce sinyali tarif et: "5 dakikada X yeni istemci görüldü" veya "aynı kaynak, kısa sürede ardışık çok sayıda deneme yaptı" gibi. Sonra bu varsayımı doğrulayacak/çürütecek ikinci bir kanıt kaynağına bak.

**Örnek:** (temsilî log satırı, yalnızca okuryazarlık)\
DROP TCP 192.0.2.50 -\> 198.51.100.5 : 23\
DROP TCP 192.0.2.50 -\> 198.51.100.5 : 24\
DROP TCP 192.0.2.50 -\> 198.51.100.5 : 25\
Bu örüntü, "kullanıcı trafiği"nden farklıdır; tipik kullanıcı genelde 80/443 gibi az sayıda hedefe gider. Burada önemli olan şey "etiket": Bu davranış **yetkili bir sağlık kontrolü mü**, yoksa beklenmeyen bir aktivite mi? Cevap, kapsam/onay ve kanıtla netleştirilir.

## **13.3 Hardening önerisi (kavramsal)**

### **Ne anlama gelir?**

**Hardening (sıkılaştırma)**, envanterle görünen riskleri azaltmak için alınan yapısal önlemlerdir. Bu modülde hardening; konfigürasyon adımı öğretmek değil, "**hangi risk hangi kontrol sınıfıyla azaltılır?**" okuryazarlığıdır. Keşif çıktısı hardening'e girdi sağlar:

**Ne var? → Ne risk? → Ne öneri? → Ne kanıtla doğrularım?**

Bu yaklaşımın iki temel kavramı özellikle görünür olmalı:

-   **Saldırı yüzeyini azaltma (Attack Surface Reduction):** "Kullanmadığını kapat."

-   **En az yetki (Least Privilege):** "Sadece gereken erişim, sadece gereken yerde."

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Envanterde "kimin ne olduğu belirsiz" çok cihaz varsa: izlenebilirlik sorunu.

-   Yönetim arayüzleri (router/switch/yazıcı paneli) son kullanıcı ağıyla aynı yerdeyse: gereksiz risk.

-   Kablosuz tarafta WPS açıksa: gereksiz saldırı yüzeyi.

-   DHCP düzeni kontrolsüzse: adres yönetimi zayıflığı (çakışma ve takip edilebilirlik sorunu).

### **Nasıl doğrularım/çürütürüm? (güvenli)**

Hardening önerisi verirken **rapor formatını** disiplin haline getir:

-   **Bulgu:** Envanter kanıtı (ör. "DHCP listesinde tanımsız 6 cihaz").

-   **Etki:** Riskin sınıfı (izlenebilirlik zayıf, yetkisiz erişim ihtimali artar).

-   **Öneri:** Kontrol kategorisi (segmentasyon, envanter disiplini, erişim kısıtlama, yönetim izolasyonu).

-   **Kanıt:** Değişiklik sonrası ölçülebilir doğrulama (ör. "tanımsız cihaz sayısı 0'a indi", "yönetim erişimi yalnızca yönetici ağından").

Kavramsal hardening başlıkları (giriş seviyesi):

-   **Envanter disiplini:** cihaz adı/etiket, sahip, rol, kritik mi, nerede?

-   **Ağ ayrımı (segmentasyon mantığı):** misafir / IoT / yönetim / kullanıcı ağlarını ayırma fikri.

-   **Yönetim düzlemi izolasyonu:** yönetim panellerini ayrı bir yönetim ağı/VLAN fikriyle izole etme (konfigürasyon öğretmeden).

-   **Erişim kısıtlama:** yönetim portlarına erişimi yalnızca belirli güvenli yollardan sağlama (kavramsal).

-   **Kablosuz hijyen:** güçlü şifre, güncel şifreleme farkındalığı, WPS kapatma farkındalığı.

-   **Loglama ve izleme:** değişimleri ve anomaliyi izlemek için temel kayıt disiplini.

**Dikkat (Değişiklik riski):**\
Hardening bir "değişiklik"tir; yanlış yapılırsa kesinti üretir. Değişiklikler yetkili kişilerce, uygun zaman penceresinde ve geri dönüş (rollback) planıyla yapılmalıdır.

## **13.4 Uygulama çerçevesi (izinli platformlar)**

### **Ne anlama gelir?**

Bu başlık, keşfi "nerede ve nasıl" güvenli yapacağını çerçeveler: izinli platform seçimi, sınırların çizilmesi, yoğunluk limiti, kanıt toplama ve raporlama. Giriş seviyesinde hedef "keşif yaptım" demek değil; **kontrollü keşif yürüttüm ve izlenebilir çıktı ürettim** diyebilmek.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Evde/küçük ofiste kendi router'ının yönetim panelinden istemci/lease listesini düzenli kontrol etmek.

-   Okul/kurum içinde yetkili lab ortamında belirli alt ağın mini envanterini çıkarmak.

-   Eğitim amaçlı, açıkça izin veren izole ortamlarda (kurum içi veya yasal eğitim platformları) keşif okuryazarlığı çalışmak.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

**Güvenli keşif runbook'u (kısa çerçeve):**

1.  **Yetki + kapsam:** Hangi ağ, hangi cihazlar, hangi süre? Yazılı/onaylı çerçeve.

2.  **Risk yönetimi:** Yoğunluk limiti, "zarar vermeme", gerekirse durdurma.

3.  **Pasif veri toplama:** DHCP/ARP/Wi-Fi istemci listeleri, envanter kayıtları.

4.  **Kontrollü doğrulama:** Sadece gereken hedeflere, düşük yoğunluklu teyit (tekil ping vb.).

5.  **Kayıt:** tarih-saat, kaynak, gözlem, yorum; çıktı/log/ekran görüntüsü gibi kanıt.

6.  **Raporlama:** Bulgu → Etki → Öneri → Kanıt formatıyla teslim.

**İpucu (İzinli pratik alanı):**\
Keşif okuryazarlığı için en güvenli alan "kendi kontrolündeki küçük ağ"dır. Küçük ortamda metodoloji oturunca, kurumsal ortama geçişte en kritik şeyin "araç" değil **kapsam + kanıt disiplini** olduğunu fark edersin.

## **Örnek: Kısa "mini envanter" çıktısı (kavramsal şablon)**

Aşağıdaki şablon, "ne var?" sorusunu izlenebilir kılar. (Değerler temsili ve uydurmadır.)

-   **Cihaz:** "Yazıcı-1"

-   **IP:** 192.0.2.25

-   **MAC:** 00:11:22:33:44:55

-   **Rol:** Yazıcı

-   **Kaynak kanıt:** DHCP lease + ARP tablosu

-   **Not:** Yönetim arayüzü erişimi "kısıtlı olmalı" (kavramsal hardening girdisi)

## **Troubleshooting mini senaryosu (Yerel/İzinli)**

**Belirti → Olasılık → Doğrulama → Sonuç**

**Belirti:** İzinli bir ofis ağında bazı kullanıcılar kısa aralıklarla bağlantı kopması yaşıyor. "Ağa envanter dışı bir cihaz bağlandı mı?" şüphesi var.

**Olasılıklar (ilk üç):**

1.  Ağa yeni/etiketsiz bir cihaz bağlandı (Gölge BT).

2.  IP çakışması veya ARP anomali durumu var (aynı IP farklı MAC).

3.  Kablosuz tarafta istemci yoğunluğu/bağlan-kop davranışı artmış (baseline'dan sapma).

**Doğrulama (pasif → kontrollü aktif):**

1.  **Pasif görünürlük (router/AP yönetimi -- izinli):**

    a.  DHCP lease listesi ve bağlı istemci listesi: yeni cihaz var mı?

    b.  **Kritik:** cihaz adı/etiketi yoksa "tanımsız" olarak kayda geç.

2.  **Yerel kanıt (kendi cihazında):**

    a.  Windows/macOS: arp -a veya Linux: ip neigh ile komşu tablosu kontrolü.

    b.  **Kritik:** Aynı IP'nin farklı zamanlarda farklı MAC'lerle eşleştiğine dair sinyal var mı?

3.  **Kontrollü aktif teyit (gerekirse):**

    a.  Şüpheli IP'ye tekil ping (sürekli değil).

    b.  **Kritik:** "Yanıt var/yok" tek başına karar değildir; pasif kanıtla birlikte yorumlanır.

**Sonuç (kanıta dayalı):**

-   Eğer DHCP lease + istemci listesinde envanterde karşılığı olmayan bir cihaz görünüyorsa:

    -   **Bulgu:** "192.0.2.40 IP'li, AA:BB:CC:DD:EE:FF MAC'li cihaz lease'te var; envanterde kaydı yok."

    -   **Etki:** İzlenebilirlik ve yetkisiz erişim riski artar.

    -   **Öneri:** Envanter güncelleme + erişim kontrolü/segmentasyon değerlendirmesi (kavramsal).

    -   **Kanıt:** Lease kaydı + komşu tablosu satırları + zaman notu.

-   Eğer aynı IP iki farklı MAC ile ilişkilendiriliyorsa:

    -   **Bulgu:** "IP/MAC eşleşmesi tutarsız."

    -   **Etki:** Çakışma/kararsızlık ihtimali; kopmaları açıklayabilir.

    -   **Öneri:** Adres yönetimi iyileştirme ve çakışma kaynağı analizi (yetkili ekip süreci).

    -   **Kanıt:** ARP/komşu tablosu kayıtları ve zaman notları.

**Dikkat (Gözlem--yorum ayrımı):**\
"Gölge BT var" demek yerine, önce gözlemi yaz: "Envanterde olmayan cihaz DHCP lease'te görüldü." Yorumun (gölge BT ihtimali) kanıta bağlanır; yeni kanıt gelirse fikrin değişebilir.

## **Terimler Sözlüğü (Glossary)**

  **Terim**                    **Türkçe karşılığı / açıklama**
  ---------------------------- -------------------------------------------------------------------------------------
  Recon (Reconnaissance)       Yetkili ortamda varlıkları görünür kılma süreci
  Envanter (Asset Inventory)   Ağdaki cihaz/servislerin listesi ve tanımlayıcı bilgileri
  Asset (Varlık)               Yönetilmesi gereken cihaz, servis veya bileşen
  Scope (Kapsam)               Yetkinin ve çalışmanın sınırları: ağ/cihaz/zaman penceresi
  Pasif keşif                  Mevcut tablolardan/kayıtlardan veri okuma (en az müdahale)
  Kontrollü aktif doğrulama    Pasif bulguyu düşük yoğunlukla teyit etme (izinli hedeflerde)
  Shadow IT (Gölge BT)         IT/onay dışında ağa bağlanan veya kurulan cihaz/servisler
  DHCP Lease                   DHCP'nin dağıttığı IP kiralama kayıtları
  ARP / Neighbor table         Yerel ağda IP↔MAC eşleşmelerini tutan tablo
  Anomali                      Baseline'a göre "normalden sapma" durumu
  Tespit sinyali               Keşif/değişim/anomaliye işaret eden izler (log/örüntü)
  Hardening                    Sıkılaştırma; gereksiz saldırı yüzeyini azaltma ve ayarları güçlendirme (kavramsal)
  Attack Surface Reduction     Saldırı yüzeyini azaltma: "kullanmadığını kapat" ilkesi
  Least Privilege              En az yetki: yalnızca gereken erişimi verme yaklaşımı
  Kanıt                        Gözlemi destekleyen çıktı/kayıt (tablo satırı, log, ekran görüntüsü vb.)

## **Kendini Değerlendir**

**1) Aşağıdakilerden hangisi "pasif keşif"e en uygun örnektir?**\
A) İzinli bir IP'ye arka arkaya 500 istek atarak yanıt sürelerini ölçmek\
B) Router/AP yönetim panelinde bağlı istemci listesini ve DHCP lease kayıtlarını okumak\
C) Bir IP aralığındaki tüm adreslere kısa sürede ardışık bağlantı denemeleri yapmak\
D) Hedef sistemde çalışan yazılımların sürümlerini uzaktan çıkarmaya çalışmak\
E) Bilinmeyen bir cihaza yoğun trafik göndererek davranışını "stres test" etmek

-   **Doğru şık: B**

-   **Gerekçe:** Pasif keşif, mevcut kayıt/tabloları okumaktır.

    -   A/E yoğunluk ve test davranışı içerir (zarar verme riski).

    -   C/D uzaktan agresif keşif/operasyon çizgisine yaklaşır; bu modülün sınırı dışındadır.

**2) DHCP lease listesinde 192.0.2.60 görünüyor; ancak kendi cihazındaki ARP/komşu tablosunda bu IP yok. En doğru yorum hangisidir?**\
A) DHCP hatalı; kesinlikle o cihaz yok\
B) ARP tablosu tüm ağı gösterdiği için cihaz gizlenmiştir\
C) Tek kaynağa dayanmak riskli; ikinci kanıt (istemci listesi/log) ile çapraz kontrol gerekir\
D) Bu kesin bir saldırıdır; doğrudan cihazı engellemek gerekir\
E) IP'nin görünmemesi, cihazın mutlaka kapalı olduğunu kanıtlar

-   **Doğru şık: C**

-   **Gerekçe:** ARP/komşu tabloları "tüm ağ" değil, cihazın gördüğü komşuları yansıtır; DHCP kaydı tek başına kesin hüküm değildir.

    -   A/E kesinlik iddia eder (kanıt yetersiz).

    -   B yanlış varsayım: ARP tablosu tüm ağı göstermez.

    -   D kanıtsız hüküm ve aşırı aksiyon önerir.

**3) "Gözlem--yorum ayrımı" hangi cümle çiftiyle en iyi temsil edilir?**\
A) Gözlem: "Ağ bozuk." / Yorum: "Kesin DNS çöktü."\
B) Gözlem: "DHCP lease'te envanterde olmayan bir MAC görünüyor." / Yorum: "Gölge BT ihtimali var; ikinci kanıtla teyit edilmeli."\
C) Gözlem: "Biri saldırıyor." / Yorum: "Firewall kapatılsın."\
D) Gözlem: "Ping atamadım." / Yorum: "Cihaz yok."\
E) Gözlem: "Bağlantı koptu." / Yorum: "Kesin kablo arızası."

-   **Doğru şık: B**

-   **Gerekçe:** Gözlem ölçülebilir/veriye dayalı; yorum ise ihtimal ve doğrulama planıyla birlikte gelir.

    -   A/C/D/E kesinlik ve kanıtsız sıçrama içerir.

**4) Aşağıdaki davranış örüntülerinden hangisi "normal kullanıcı trafiği"ne daha yakındır?**\
A) Aynı kaynak IP'nin saniyeler içinde ardışık çok sayıda farklı porta deneme yapması\
B) Çok sayıda yarım kalmış TCP oturumu (tamamlanmayan bağlantı girişimleri)\
C) Sadece 80/443 gibi az sayıda yaygın servise erişim (web kullanımı)\
D) Kısa sürede yüzlerce farklı hedefe benzer istek dizileri\
E) Düzenli aralıklarla sıra dışı sayıda bağlantı denemesi

-   **Doğru şık: C**

-   **Gerekçe:** Tipik kullanıcı web trafiği ağırlıklıdır ve az sayıda servis etrafında döner.

    -   A/B/D/E daha çok otomasyon/keşif/anomali sinyali olabilir; baseline ile teyit gerekir.

**5) "En az müdahale" prensibine göre doğru sıra hangisidir?**\
A) Yoğun doğrulama → kapsam belirleme → kayıt tutma → pasif inceleme\
B) Pasif inceleme → kapsam belirleme → kayıt tutma → doğrulama yok\
C) Kapsam belirleme → pasif inceleme → kontrollü aktif doğrulama → kayıt/raporlama\
D) Aktif doğrulama → aktif doğrulama → pasif inceleme → yorum\
E) Kapsam belirleme → doğrudan hardening → kanıt toplamadan rapor

-   **Doğru şık: C**

-   **Gerekçe:** Önce kapsam, sonra pasif; gerekirse kontrollü doğrulama; her adım kayıt/kanıtla ilerler.

    -   A/D gereksiz risk ve ters sıra.

    -   B doğrulamayı dışlar (bazı durumlarda gerekir).

    -   E kanıtsız değişiklik önerir.

**6) "Hardening" için aşağıdakilerden hangisi bu modülün seviyesine en uygun ifadedir?**\
A) Tüm cihazlara aynı anda agresif değişiklik uygulamak\
B) Konfigürasyon adımlarını ayrıntılı tarif etmek\
C) Envanter bulgusunu risk sınıfına bağlayıp kontrol kategorisi önermek ve kanıtla doğrulamak\
D) Her açık servisi anında kapatmak; etkisini düşünmemek\
E) Logları kapatmak; gürültüyü azaltmak

-   **Doğru şık: C**

-   **Gerekçe:** Bu modül hardening'i kavramsal okuryazarlık düzeyinde ele alır: bulgu→etki→öneri→kanıt.

    -   A/D riskli ve kesinti üretir.

    -   B uygulanabilir talimat seviyesine iner (bu seviyenin sınırı).

    -   E güvenliği zayıflatır.

**7) Aşağıdakilerden hangisi "attack surface reduction" ilkesini en doğru açıklar?**\
A) Ne kadar çok servis açıksa o kadar hızlı çalışır\
B) Kullanılmayan servisleri kapatmak, potansiyel risk alanlarını azaltır\
C) Tüm yönetim portlarını herkes için açmak kolaylık sağlar\
D) Her cihaza aynı parolayı vermek yönetimi kolaylaştırır\
E) İzleme/loglama güvenlik için gereksizdir

-   **Doğru şık: B**

-   **Gerekçe:** Kullanılmayan servisler gereksiz saldırı yüzeyi oluşturur.

    -   A/C/D/E güvenlik prensipleriyle çelişir.

**8) Yönetim arayüzlerinin (router/switch/yazıcı paneli) izolasyonu neden önemlidir?**\
A) Çünkü yönetim arayüzleri hiçbir zaman kritik değildir\
B) Çünkü herkesin yönetim arayüzüne erişmesi sorun çözmeyi hızlandırır\
C) Çünkü yönetim yüzeyi saldırı yüzeyidir; erişimi sınırlamak risk azaltır\
D) Çünkü izolasyon, envantere ihtiyaç bırakmaz\
E) Çünkü izolasyon, tespit sinyallerini tamamen ortadan kaldırır

-   **Doğru şık: C**

-   **Gerekçe:** Yönetim düzlemi ayrı ve sınırlı olursa yetkisiz erişim riski düşer.

    -   A/B yanlış.

    -   D envanter ihtiyacını ortadan kaldırmaz.

    -   E sinyalleri "tamamen" yok etmez; sadece risk yönetimi sağlar.

**9) "Ping cevabı yok" gözlemi için en doğru yaklaşım hangisidir?**\
A) Cihaz kesinlikle kapalıdır\
B) ICMP kısıtlanmış olabilir; ikinci kanıt kaynağıyla teyit gerekir\
C) Bu her zaman DNS sorunudur\
D) Bu her zaman kablo sorunudur\
E) Bu, kesin yetkisiz keşif kanıtıdır

-   **Doğru şık: B**

-   **Gerekçe:** Ping tek başına kesin hüküm verdirmez; ICMP filtrelenebilir.

    -   A/C/D/E tek sebepli ve kanıtsız kesinlik içerir.

**10) Aşağıdaki kanıt paketlerinden hangisi "izlenebilirlik" açısından daha güçlüdür?**\
A) "Bence ağda yabancı cihaz var."\
B) "Muhtemelen saldırı var; loglara gerek yok."\
C) "DHCP lease ekran görüntüsü + ARP/komşu tablosu satırı + tarih/saat + kısa not (gözlem--yorum ayrımı) "\
D) "Sadece ping sonucu var; başka veri yok."\
E) "Sorun çözüldü; nasıl çözüldüğünü yazmaya gerek yok."

-   **Doğru şık: C**

-   **Gerekçe:** Çoklu kaynak + zaman damgası + gözlem--yorum ayrımı, denetlenebilir kanıt standardı sağlar.

    -   A/B/E kanıtsızdır.

    -   D tek kaynağa dayanır.

## **Kapanış: Bu modülde neler kazandık?**

-   Yetkili keşfin amacını ve white-hat sınırlarını; **pasif keşif** ile **kontrollü aktif doğrulama** farkını kavradık.

-   Keşfi "rastgele tarama" değil, **kapsam + kanıt** disipliniyle ilerleyen bir metodolojiye bağladık.

-   DHCP/ARP/komşu tabloları ve istemci listeleri gibi kaynaklardan **mini envanter** çıkarmayı ve çapraz teyidi öğrendik.

-   Keşif/anomali durumlarında oluşan **tespit sinyallerini** baseline bakışıyla yorumladık.

-   Keşif bulgularını **hardening** önerilerine kavramsal olarak bağladık: saldırı yüzeyi azaltma, en az yetki, yönetim izolasyonu.

-   Çıktıları **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** ile izlenebilir hâle getirmeyi pekiştirdik.

# **MODÜL 14 --- Zafiyet Okuryazarlığı ve Güvenli Doğrulama**

Modül 13'te "ağda ne var?" sorusuna envanter gözüyle bakmayı öğrendin: cihazlar, servisler ve bazen de "açık görünen kapılar". Bu modül, o bulguları **ezber bir zafiyet listesine** çevirmek yerine **kanıt, belirsizlik ve risk** ekseninde doğru okumayı öğretir. Çünkü bir portun açık olması tek başına "açık" (vulnerability) değildir; çoğu zaman bir hizmetin çalışması için gereklidir. Burada hedefin, bir bulguyu gördüğünde "panik" veya "boşvermişlik" yerine şu refleksi oturtmaktır: **Bunu ne doğrular, ne çürütür?** Giriş seviyesinde "zafiyet doğrulama"; istismar üretmek değil, **varlığı kimliklendirmek, sürüm/konfigürasyonu teyit etmek, maruziyeti anlamak, riski önceliklendirmek ve düzeltme sonrası kanıtla doğrulamak** demektir. Tüm içerik yalnızca **izinli/yerel/kurum içi yetkili** ortam varsayımıyla yazılmıştır.

## **Hedefler**

-   **"Açık port" / "zafiyet" / "istismar (exploit)"** kavramlarını net ayırmak ve doğru terimle konuşmak.

-   Otomatik raporların (tarayıcılar/uyarılar) **neden yanılabileceğini** anlamak; **false positive / false negative** okuryazarlığı kazanmak.

-   Zafiyet doğrulamada **metodoloji kurmak**: kapsam → kanıt → belirsizlik → güvenli teyit → raporlama.

-   Teknik bulguyu **risk diline** çevirmek: **Olasılık × Etki** mantığıyla (kavramsal) önceliklendirmek.

-   Düzeltme sonrası "güven ama doğrula" yaklaşımıyla **düzeltme teyidi** yapmanın neyi kanıtladığını bilmek.

-   Segmentasyonun (ağ ayrımı) güvenlikteki rolünü kavramsal açıklamak ve segmentasyonun "çalıştığını" **tekil ve güvenli** doğrulama okuryazarlığı kazanmak.

## **Ana içerik**

## **14.1 Zafiyet doğrulama metodolojisi (okuryazarlık)**

### **Ne anlama gelir?**

**Zafiyet doğrulama**, "bir sistemde zafiyet var mı?" sorusunu **yetkili, güvenli ve kanıta dayalı** yanıtlamaktır. Buradaki kritik ayrım şudur:

-   **Keşif (Modül 13):** "Ağda ne var?" (envanter görünürlüğü)

-   **Zafiyet okuryazarlığı (Modül 14):** "Bu varlığın riski ne? İddia edilen zafiyet geçerli mi? Hangi kanıt bunu destekler/çürütür?"

Bu noktada üç kavramı netleştir:

-   **Açık Port (Özellik / Feature):** Örn. bir web sunucusunun 80/443 dinlemesi çoğu zaman gerekliliktir.

-   **Zafiyet (Bug / Yanlış Konfig / Exposure):** O portun arkasındaki yazılım hatası, zayıf ayar ya da gereksiz maruziyet riski doğuruyorsa "zafiyet" konuşulur.

-   **İstismar (Exploit):** Zafiyeti kullanmaya yönelik saldırı tekniği/araç/kod. **Bu modülün kapsamı dışındadır.**

**İpucu (Analoji -- ama yanıltmasın):**\
Açık port = kapı. Zafiyet = kilidin bozuk olması. İstismar = o bozuk kilitten içeri girmeye çalışan yöntem.\
Bu modülde kapıyı "kapalı tut" ezberi yok; **hangi kapı neden açık, risk nerede** onu okuma var.

### **Metodoloji: "Soru → Kapsam → Kanıt → Teyit"**

Giriş seviyesinde en güvenli doğrulama yaklaşımı şu sırayla yürür:

1.  **Soru/İddia:** "X varlığında Y zafiyeti var" iddiası nereden geldi? (rapor, uyarı, envanter notu, kullanıcı şikâyeti)

2.  **Kapsam:** Hangi varlık(lar), hangi zaman penceresi, hangi ortam (test/üretim), kim yetkili?

3.  **Kanıt (önce pasif):** Envanter kaydı, yönetim paneli sürümü, paket sürümü, log/değişiklik kaydı (varsa).

4.  **Kontrollü teyit (gerekirse):** Yalnızca **düşük riskli** ve **tekil** doğrulamalar (yerel sürüm/patch teyidi, konfigürasyon durumu, belirli tek noktaya erişim testi).

5.  **Belirsizlik yönetimi:** "Bu kanıt neyi kesinleştirir, neyi kesinleştirmez?"

6.  **Raporlama:** **Bulgu → Etki → Öneri → Kanıt (rapor formatı)**

**Dikkat (Doğrulama ≠ istismar):**\
"Zafiyet var mı?"yı doğrulamak için zafiyeti çalıştırmak/sömürmek gerekmez ve bu modülde yoktur. Amaç: **zarar vermeden**, servisi etkilemeden, kanıt standardıyla teyit etmektir.

### **False Positive / False Negative okuryazarlığı**

Otomatik tarama/uyarı araçları **yanılabilir**:

-   **False Positive:** "Var" denir ama yoktur.

-   **False Negative:** "Yok" denir ama vardır.

Özellikle sürüm tabanlı iddialarda iki klasik tuzak vardır:

-   **Sürüm etiketi tuzağı:** "Eski sürüm görünüyor → kesin açık var" diye hüküm vermek.

-   **Backport gerçeği:** Bazı ortamlarda sürüm numarası "eski" görünse bile güvenlik yamaları backport edilmiş olabilir; yani etiket eski, kilit güçlendirilmiş olabilir.

**İpucu (Kanıt standardı):**\
Tek bir kaynağa güvenme. "Rapor dedi" yerine **en az iki bağımsız kanıt** arayın: sürüm/patch kaydı + konfigürasyon/erişim kapsamı gibi.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Bir bülten "şu sürüm aralığı riskli" diyor; envanterde o ürün var.

-   "Gereksiz açık servis var" deniyor; ama gerçekten açık mı, kimlere açık, bilinmiyor.

-   Bir raporda "kritik açık" yazıyor; ama kanıt çok zayıf (varsayım ağırlıklı).

**Örnek:** Otomatik bir rapor, bir hizmetin "eski sürüm" göründüğünü ve kritik risk olduğunu söyler. Ancak sistemde yamalar backport edilmiş olabilir. Bu durumda doğru refleks: "Panik" değil, **patch kanıtı + erişim kapsamı** ile çapraz teyittir.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Varlığı kimliklendir:** ad/rol/sahip/kritiklik/konum (mantıksal).

-   **Sürüm/patch'i yerelden teyit et:** mümkünse paket yöneticisi, sistem güncelleme kayıtları, yönetim paneli sürümü.

-   **Maruziyeti dar tanımla:** "Bu servis kimlere açık olmalı?" Segmentasyon/firewall varsayımı var mı?

-   **Sonuç cümlesini temkinli kur:** "Zafiyet var" yerine "Şu kanıtlar bu koşullarda risk sınıfını destekliyor" gibi.

## **14.2 Risk matrisi ve düzeltme teyidi (kavramsal)**

### **Ne anlama gelir?**

Aynı bulgu, farklı ortamda farklı risk üretir. Çünkü risk iki temel bileşene dayanır:

-   **Etki (Impact):** gerçekleşirse ne olur? (kesinti, veri sızıntısı, yetkisiz erişim, itibar)

-   **Olasılık (Likelihood):** gerçekleşme ihtimali (maruziyet, erişilebilirlik, kontrol seviyesi, gözlemlenen sinyaller)

Risk matrisi, bu iki boyutu görünür kılar; amaç "matematik şovu" değil, **önceliklendirme ve karar gerekçesi** oluşturmaktır.

### **"Güven ama doğrula": Düzeltme teyidi (Re-Verification)**

Bir bulgu raporlanınca IT ekibi "düzelttik" diyebilir. Güvenlik/operasyon tarafının sorusu şudur:\
**"Düzeltme gerçekten riski düşürdü mü? Hangi kanıtla?"**

Düzeltme teyidinde disiplin:

-   "Düzeltildi" demek yerine: **ne değişti, nasıl test edildi, hangi kanıt var, yan etki var mı?**

**Dikkat (Düzeltme = değişiklik riski):**\
Düzeltme bir değişikliktir; yanlış uygulanırsa kesinti üretir. Bu yüzden yetkili kişilerce ve mümkünse planlı bakım penceresinde yapılır.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Bir sunucu internete kapalıyken aynı bulgu "acil" olmayabilir; internete açıksa öncelik değişir.

-   "Gereksiz servis kapatıldı" denir; ama hâlâ erişilebiliyorsa düzeltme teyidi başarısızdır.

-   "Segmentasyon var" denir; ama misafir ağından yönetim yüzeyine erişim oluyorsa risk varsayımı yanlıştır.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

**Risk okuryazarlığı:**

-   Varlık kritikliği → maruziyet → kontroller → belirsizlik notu → öncelik.

**Düzeltme teyidi kanıt standardı:**

-   Önceki durum kanıtı (bulgu)

-   Değişiklik kanıtı (ne yapıldı)

-   Sonraki durum kanıtı (teyit)

-   Yan etki kontrolü (servis işlevi sürüyor mu)

**İpucu (Aynı test, farklı zaman):**\
Düzeltme teyidi için en sağlam yaklaşım: Bulguya dayanak olan **aynı tür** düşük riskli test/kanıt, düzeltme sonrası tekrar alınır ve karşılaştırılır. Böylece "önce/sonra" kıyası netleşir.

## **14.3 Segmentasyon doğrulama okuryazarlığı (kavramsal)**

### **Ne anlama gelir?**

**Segmentasyon**, ağı mantıksal parçalara ayırarak olayın yayılımını (blast radius) azaltmaktır: "Her şey her şeye erişmesin."\
Giriş seviyesinde segmentasyon doğrulaması, konfigürasyon öğretmez; şu soruları **kanıtla** cevaplar:

-   "Misafir ağı gerçekten iç kaynaklara kapalı mı?"

-   "IoT cihazları kritik sistemlerle aynı düzlemde mi?"

-   "Yönetim arayüzleri sadece yetkili segmentten erişilebilir mi?"

**Dikkat (Segmentasyon sadece VLAN değildir):**\
VLAN, firewall kuralları, erişim listeleri ve uygulama seviyesindeki kontroller birlikte segmentasyon hedefini taşır. Bu modülde amaç: "tasarım + kural + doğrulama" bütününü kavramaktır.

### **Gerçek hayatta belirtisi/örneği nedir?**

-   Misafir ağındaki bir cihazın, iç ağdaki yönetim arayüzlerine erişebildiği fark edilir.

-   "Yönetim portları sadece yöneticilere açık" denir; ama herkes erişebiliyorsa hedef boşa düşer.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

Segmentasyon doğrulaması "çok hedefli deneme" değildir; **bilinen tekil akış** üzerinden yapılır:

1.  **Beklenen politika:** Kim, neye, hangi servis/port ile erişebilmeli?

2.  **Test noktası:** Test hangi segmentten yapılıyor? (misafir/kullanıcı/yönetim)

3.  **Tekil doğrulama:** İzinli ortamda, **bilinen hedefe** tekil erişim testi.

4.  **Çapraz kanıt:** İstemci sonucu + (varsa) ağ cihazı logu.

**İpucu (Ping başarısızlığı bazen iyi haberdir):**\
Ping/port testi başarısızsa bu, segmentasyonun çalıştığını gösterebilir. Ama "segmentasyon çalıştı" hükmü için şunu unutma: ping, servis kapalı olduğu için de başarısız olabilir. Bu yüzden **katmanlı düşün**: IP → DNS → Uygulama.

## **Komut & Araç Okuryazarlığı (Güvenli)**

Aşağıdaki komutlar **yalnızca kendi/izinli ortamında**, zafiyet okuryazarlığı için **kimlik/sürüm/patch/erişim teyidi** amacıyla verilmiştir. Amaç "hedef bulma/tarama" değildir.

### **A) Sürüm ve patch seviyesi okuryazarlığı (yerel)**

**Windows: systeminfo**

-   Amaç: OS sürümü/build ve temel sistem bağlamı

-   Beklenen çıktı: Sistem özeti metni

-   Yorum ipucu: Sürüm tek başına hüküm değildir; risk tartışmasına bağlam sağlar

-   Güvenli sınır: Yerel cihaz

**Windows (PowerShell): Get-HotFix**

-   Amaç: Yüklü güncelleştirmeleri görmek (patch kanıtı)

-   Beklenen çıktı: KB listesi + tarihler

-   Yorum ipucu: "Sürüm etiketi eski görünüyor" durumlarında patch kanıtı ile çapraz teyit

-   Güvenli sınır: Yerel cihaz

**Linux: uname -a**

-   Amaç: Kernel/sistem kimliği

-   Beklenen çıktı: Kernel satırı

-   Yorum ipucu: Tek başına zafiyet kanıtı değildir; bağlam sağlar

-   Güvenli sınır: Yerel cihaz

**Linux (Debian/Ubuntu örneği): apt-cache policy \<paket_adı\>**

-   Amaç: Yüklü sürüm ile aday sürümü kıyaslamak (patch okuryazarlığı)

-   Beklenen çıktı: Installed/Candidate sürüm bilgileri

-   Yorum ipucu: "Güncelleme var mı, sürüm hattı nerede?" sorusuna cevap

-   Güvenli sınır: Yerel cihaz

**macOS: sw_vers**

-   Amaç: macOS sürüm kimliği

-   Beklenen çıktı: Ürün sürümü bilgisi

-   Yorum ipucu: Risk tartışmasında "hangi sürüm hattındayım?" sorusunu netleştirir

-   Güvenli sınır: Yerel cihaz

### **B) "Gereksiz açık servis" okuryazarlığı (yerel dinleyen portlar)**

**Windows: netstat -ano**

-   Amaç: Dinleyen portları ve süreçleri (PID) görmek

-   Beklenen çıktı: Local Address:Port + PID satırları

-   Yorum ipucu: "Dinliyor" görmek, dışarıdan erişilebilir demek değildir (firewall/NAT)

-   Güvenli sınır: Yerel cihaz

**Linux: ss -tulpn**

-   Amaç: Dinleyen servisleri ve süreçleri görmek

-   Beklenen çıktı: Port + süreç bilgisi

-   Yorum ipucu: "Bu servis gerçekten gerekli mi?" hardening konuşmasına kanıt sağlar

-   Güvenli sınır: Yerel cihaz

**macOS: lsof -i -P -n**

-   Amaç: Port açan/dinleyen süreçleri görmek

-   Beklenen çıktı: Süreç + port listeleri

-   Güvenli sınır: Yerel cihaz

### **C) Segmentasyon erişim teyidi (tekil, izinli ve bilinen hedefe)**

**Windows (PowerShell): Test-NetConnection \<hedef_ip\> -Port \<port\>**

-   Amaç: Bilinen tek bir hedef/port için erişim teyidi

-   Beklenen çıktı: TcpTestSucceeded: True/False

-   Yorum ipucu: False tek başına "segmentasyon çalıştı" demek olmayabilir; hedef servis down olabilir

-   Güvenli sınır: Yalnızca izinli ve bilinen hedef; geniş aralık denemesi yok

**Windows: tracert \<hedef_ip\> / Linux--macOS: traceroute \<hedef_ip\>**

-   Amaç: Yolun beklenen mi olduğunu görmek (kavramsal doğrulama)

-   Beklenen çıktı: Hop listesi

-   Yorum ipucu: Beklenmeyen yol, segmentasyon varsayımıyla çelişebilir; tek başına kesin hüküm değildir

-   Güvenli sınır: Tekil hedef; izinli ortam

## **Örnek:**

Otomatik bir rapor, bir yazıcı arayüzünde "kritik web zafiyeti" olduğunu söyler.

-   **Doğrulama yaklaşımı:** Önce yazıcının internete açık olup olmadığı ve hangi segmentte bulunduğu (maruziyet), sonra sürüm/patch kanıtı ve en sonda risk matrisiyle öncelik.

-   **Olası sonuç:** İnternete kapalı ve etki düşükse "acil panik" yerine planlı güncelleme önerisi daha doğru olabilir. Raporda "kritik" etiketini doğrudan kopyalamak yerine **kanıt + bağlam** ile yeniden gerekçelendirmek gerekir.

## **Terimler Sözlüğü (Glossary)**

  **Terim**                      **Türkçe karşılığı / açıklama**
  ------------------------------ ---------------------------------------------------------------------------------
  Open Port (Açık port)          Bir servisin belirli bir portta dinliyor olması; tek başına zafiyet değildir
  Vulnerability (Zafiyet)        Hata/yanlış ayar/maruziyet sonucu risk doğurabilen zayıflık
  Exploit (İstismar)             Zafiyeti kullanmaya yönelik saldırı tekniği/araç/kod (bu modül kapsamı dışı)
  Exposure (Maruziyet)           Bir servisin kimlere/nereden erişilebilir olduğu (açıklık düzeyi)
  False Positive                 "Var" denip aslında olmayan bulgu (yanlış alarm)
  False Negative                 "Yok" denip aslında olan bulgunun kaçırılması
  Backport                       Sürüm numarası değişmeden güvenlik yamalarının ilgili sürüme uyarlanması
  Risk                           Etki ve olasılığın birlikte değerlendirilmesiyle önceliklendirme konusu
  Impact (Etki)                  Gerçekleşirse sonuç (kesinti/veri/itibar vb.)
  Likelihood (Olasılık)          Gerçekleşme ihtimali (maruziyet, kontroller, erişilebilirlik)
  Risk Matrix                    Olasılık ve etkiye göre risk seviyesini kavramsal sınıflama yaklaşımı
  Fix Verification               Düzeltme sonrası teyit; riskin gerçekten düşüp düşmediğini kanıtla gösterme
  Patch (Yama)                   Üreticinin/dağıtımın zafiyeti kapatan güncellemesi
  Segmentasyon                   Ağı mantıksal parçalara ayırarak yayılımı azaltma yaklaşımı
  Blast Radius                   Bir olayın etkisinin yayılabileceği alanın büyüklüğü
  Bulgu → Etki → Öneri → Kanıt   Rapor formatı; gözlem--yorum ayrımını ve izlenebilirliği korur
  CVE                            Bilinen güvenlik açıkları için standart referans kimliği (liste/numaralandırma)

## **Kendini Değerlendir**

**1)** Aşağıdaki cümlelerden hangisi "açık port" ile "zafiyet" arasındaki farkı en doğru ifade eder?\
A) Açık port varsa zafiyet vardır; kapatmak gerekir.\
B) Zafiyet, açık portun arkasındaki yazılım/ayar/maruziyetin risk üretmesi durumudur.\
C) Açık port, istismarın (exploit) kendisidir.\
D) Zafiyet yalnızca sürüm numarasıyla belirlenir.\
E) Zafiyet doğrulaması için mutlaka zafiyet çalıştırılmalıdır.

-   **Doğru:** B

-   **Gerekçe:** B, farkı "risk üreten zayıflık" üzerinden kurar. A/C/D genelleme yapar. E, bu modülün temel sınırına aykırıdır (doğrulama ≠ istismar).

**2)** Otomatik bir rapor "sürüm eski → kritik" dedi. En güçlü ilk adım hangisidir?\
A) Hemen sistemi kapatmak.\
B) Raporu olduğu gibi "kritik" diye iletmek.\
C) Patch/güncelleme kanıtı ve maruziyeti (kimlere açık?) çapraz teyit etmek.\
D) Sonuç cümlesini "kesin zafiyet var" diye yazmak.\
E) Sadece ping ile hedefi kontrol etmek.

-   **Doğru:** C

-   **Gerekçe:** C, kanıt standardını ve bağlamı güçlendirir. A/B/D acele hüküm içerir. E tek başına zafiyet doğrulamaz.

**3)** "False positive" ile ilgili en doğru ifade hangisidir?\
A) Sistem kesinlikle güvendedir.\
B) Araç yanılmıştır; bu yüzden kanıtı ikinci bağımsız kaynakla teyit etmek gerekir.\
C) Zafiyet mutlaka vardır; araç yanılmaz.\
D) Segmentasyon testleri false positive üretmez.\
E) False positive sadece kablosuz ağlarda olur.

-   **Doğru:** B

-   **Gerekçe:** B doğru refleksi tarif eder: doğrula/çaprazla. Diğerleri mutlak ve yanlış genellemelerdir.

**4)** Aşağıdaki durumda hangi sonuç cümlesi "kanıt + belirsizlik" disiplinine en uygundur?\
Veri: "X hizmeti için sürüm etiketi eski görünüyor; patch kaydı belirsiz; servis sadece iç ağdan erişilebilir."\
A) Kesin kritiktir, acil müdahale şart.\
B) Kesin zafiyet yok; kapatmaya gerek yok.\
C) Bu bulgu, patch kanıtı netleşene kadar risk sınıfına adaydır; maruziyet iç ağla sınırlı olduğundan öncelik, etki/olasılık değerlendirmesiyle belirlenmelidir.\
D) Sadece port açıksa zafiyettir.\
E) Segmentasyon varsa risk sıfırdır.

-   **Doğru:** C

-   **Gerekçe:** C, belirsizliği dürüstçe taşır ve bağlamla önceliklendirir. A/B aşırı kesin, D/E hatalı genellemedir.

**5)** "Düzeltme teyidi (fix verification)" için en güçlü kanıt yaklaşımı hangisidir?\
A) IT ekibi "düzeldi" dediği için raporu kapatmak.\
B) Sadece sürüm numarasına tekrar bakmak.\
C) Bulguya dayanak olan düşük riskli kanıtı düzeltme sonrası tekrar alıp önce/sonra kıyası yapmak ve yan etkiyi kontrol etmek.\
D) Ping başarısızsa her şey düzelmiştir demek.\
E) Yalnızca kullanıcı "düzeldi" dediği için kabul etmek.

-   **Doğru:** C

-   **Gerekçe:** C, "önce/sonra" kanıt kıyasını ve yan etki kontrolünü içerir. Diğerleri tek kaynağa dayanır.

**6)** Misafir ağından belirli bir iç kaynağa yapılan tekil erişim testi başarısız oldu. Hangisi en doğru yorumdur?\
A) Segmentasyon kesin çalışıyor; başka kanıt gerekmez.\
B) Segmentasyon kesin bozuk; acil kriz.\
C) Bu, segmentasyonun çalıştığına işaret edebilir ama hedef servisin down olması/DNS/IP katmanı sorunları gibi alternatifler için katmanlı doğrulama gerekir.\
D) Ping başarısızsa zafiyet yoktur.\
E) Port testi başarısızsa cihaz ağda yoktur.

-   **Doğru:** C

-   **Gerekçe:** C, "başarısızlık" sonucunu tek nedene bağlamaz; katmanlı düşünmeyi zorunlu kılar. A/B/D/E aşırı kesin hüküm verir.

**7)** Aşağıdaki komut çıktısı yorumlarından hangisi en doğrudur?\
Durum: netstat -ano çıktısında LISTENING bir satır görüyorsun.\
A) Bu servis internete açıktır.\
B) Bu servis mutlaka zafiyetlidir.\
C) Bu servis yerelde dinliyor; dış erişim için firewall/NAT/segmentasyon bağlamı da değerlendirilmelidir.\
D) Bu servis kapatılamaz.\
E) Bu, segmentasyonun bozuk olduğunu gösterir.

-   **Doğru:** C

-   **Gerekçe:** C, "dinliyor" ile "erişilebilir" ayrımını yapar. A/B/D/E yanlış genellemedir.

**8)** Risk matrisi mantığına göre hangisi daha acil olma eğilimindedir?\
A) İç ağda erişilen, etki düşük bir bulgu.\
B) İnternete açık, etki yüksek bir bulgu.\
C) Erişimi belirsiz, etkisi belirsiz bir bulgu.\
D) Sadece "eski sürüm" etiketi görünen ama maruziyeti sıfır olan bulgu.\
E) Ping başarısız olan bulgu.

-   **Doğru:** B

-   **Gerekçe:** B'de hem olasılık (yüksek maruziyet) hem etki (yüksek) yüksek olma eğilimindedir. C belirsizdir; kanıt toplanmadan acillik kararı zayıftır. D/E tek ölçütle hüküm verir.

## **Kapanış: Bu modülde kazandıkların**

-   Açık port--zafiyet--istismar kavramlarını karıştırmadan, doğru terimle konuşma.

-   Otomatik raporların yanılabileceğini bilerek **false positive/negative** yönetimi yapma.

-   "Soru → Kapsam → Kanıt → Teyit" yöntemiyle güvenli doğrulama kurgulama.

-   Teknik bulguyu **Olasılık × Etki** mantığıyla önceliklendirme ve karar gerekçesi üretme.

-   "Güven ama doğrula" yaklaşımıyla **düzeltme teyidi** ve kanıt standardı oluşturma.

-   Segmentasyonun çalışıp çalışmadığını **tekil, izinli ve katmanlı** doğrulama okuryazarlığıyla değerlendirme.

# **MODÜL 15 --- Simülasyon Trafiği ile Tespit & Raporlama (Purple Team)**

Bu modül, önceki modüllerde kazandığın ağ okuryazarlığını "uçtan uca çıktı üretme" seviyesine taşır: **izinli ve kontrollü simülasyon trafiği** üzerinden tespit yapmayı, **doğru kanıt türünü (PCAP/Flow) seçmeyi** ve bulguları **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** ile yayınlanabilir bir rapora dönüştürmeyi öğrenirsin. Purple Team yaklaşımı "saldırı yapmak" değildir; savunma mekanizmalarının (ör. firewall/IDS/izleme kuralları) **görüp görmediğini** ölçen, iyileştirmeyi hedefleyen bir **işbirliği döngüsüdür**. Bu modülde özellikle şu refleks güçlenir: **Tespit Et → Kanıtla → Raporla**. Tüm içerik yalnızca **yerel/izinli/kurum içi yetkili** ortam varsayımıyla ve **zarar vermeme** prensibiyle yazılmıştır.

## **Hedefler**

-   Simülasyon (tatbikat) trafiğinin ne olduğunu ve Purple Team yaklaşımında tespitte nasıl kullanıldığını açıklayabilmek.

-   Bir tespit ihtiyacına göre **PCAP mı Flow mu?** kararını gerekçeli verebilmek (kapsam, maliyet, kanıt gücü).

-   Trafik örüntülerini **katmanlı düşünme** ile analiz edebilmek: Fiziksel → IP → DNS → Uygulama.

-   "Bunu ne doğrular, ne çürütür?" bakışıyla **yanlış pozitif/yanlış yorum** riskini azaltmak.

-   Bulgu--yorum ayrımını koruyarak **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** ile profesyonel rapor çıktısı üretebilmek.

## **Ana içerik**

## **15.1 Simülasyon metodolojisi (yetkili)**

### **Ne anlama gelir?**

Simülasyon metodolojisi, bir ağın savunma kabiliyetini ölçmek için **izinli ve kontrollü** şekilde üretilen trafiğin; hedefi, kapsamı, yoğunluğu ve kanıt toplama planı tanımlanarak yürütülmesidir. Buradaki temel bakış şudur: "Gerçek bir olay beklemek yerine, güvenli bir tatbikatla **görünürlüğü ve tespit refleksini** ölçmek."

Purple Team mantığı, geleneksel **Kırmızı Takım (saldırı simülasyonu)** ve **Mavi Takım (savunma/tespit)** ayrımında en sık yaşanan sorunu çözer: *iki tarafın birbirinden kopuk çalışması.* Purple Team'de hedef, "**Saldırıyı simüle et → Savunmanın gördüğünü ölç → Boşluğu kapat**" döngüsünü birlikte işletmektir.

Ölçmek istediğin sorular genellikle şunlardır:

-   **Tespit edebiliyor muyuz?** (log/PCAP/flow üzerinde sinyal görünür mü?)

-   **Yanlış pozitif üretiyor muyuz?** (normal davranışı şüpheli sanıyor muyuz?)

-   **Yanlış negatif var mı?** (gerçekten şüpheli bir sinyali kaçırıyor muyuz?)

-   **Kanıt üretebiliyor muyuz?** (bulguyu tekrar edilebilir ve denetlenebilir sunabiliyor muyuz?)

-   **İyileştirme çıkarabiliyor muyuz?** (izleme kuralı, segmentasyon, konfigürasyon, saklama politikası vb.)

Giriş seviyesinde güvenli simülasyon akışı:

1.  **Hedef soru:** "Neyi ölçmek istiyoruz?"

2.  **Kapsam:** Hangi segment, hangi sistemler, hangi zaman penceresi, kim yetkili?

3.  **Yoğunluk limiti:** Zarar vermeme için hız/yoğunluk sınırı.

4.  **Gözlem planı:** Hangi kanıt toplanacak? (PCAP, flow, log)

5.  **Beklenen sinyal:** "Ne görmeyi bekliyoruz?" (protokol, zamanlama, hedef/servis)

6.  **Raporlama planı:** Sonuç nasıl yazılacak? (Bulgu → Etki → Öneri → Kanıt)

**Dikkat (Simülasyon = kontrollü ölçüm, operasyon değil):**\
Bu modülde simülasyon, "keşif/tarama/operasyon" değildir. Hedef bulma, geniş aralık deneme, agresif deneme yok. Simülasyon yalnızca **önceden tanımlanmış**, **izinli** ve **düşük riskli** akışlarla yapılır; amaç savunma refleksini ölçmektir.\
Ayrıca üretim sistemlerinde (production) test yapılacaksa: **servisi yavaşlatmayacak/durdurmayacak** şekilde, tercihen **test ortamında** veya **planlı zaman penceresinde** yürütülür.

### **Gerçek hayatta belirtisi/örneği nedir?**

Örnek: İzleme ekibi "kısa sürede olağandışı DNS artışı" alarmı üretiyor. Bu alarm gerçekten doğru sinyali mi yakalıyor, yoksa düzenli bir güncelleme sürecini mi "şüpheli" sanıyor? Tatbikatta, belirli bir zaman penceresi için kontrollü trafik üretilir ve hem flow hem PCAP ile kanıtlanır.

Örnek: "Misafir ağından iç kaynaklara erişim olmamalı" politikası var. Tatbikatta, yalnızca tekil ve izinli bir doğrulama akışıyla bu politikanın "gerçekte" çalışıp çalışmadığı ölçülür ve raporlanır.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   **Hedef soru net mi?** Belirsizse, sonuçlar da belirsiz olur.

-   **Kapsam yazılı mı?** Segment/sistem/zaman penceresi ve yetki net mi?

-   **Beklenen sinyal tanımlı mı?** Hangi protokol/alan/metrik "sinyal" sayılacak?

-   **Karşı kanıt ne?** Bu sinyalin masum açıklaması ne olabilir? (örn. planlı yedekleme, güncelleme saati)

-   **Tekil akış prensibi:** Çoklu hedef yerine, önceden belirlenmiş tekil akış üzerinden kanıt topla.

**İpucu (Simülasyonu "soru" ile başlat):**\
"Bugün tatbikat yapalım" yerine "Şu sinyali gerçekten görüyor muyuz?" diye sor. Soru netse; kapsam, kanıt ve rapor doğal olarak netleşir.

**İpucu (Zaman penceresi = kanıtın omurgası):**\
"Bir ara oldu" yerine "Şu 10 dakikada oldu" diyebildiğin an, hem flow analizi hem PCAP doğrulaması hızlanır; yanlış yorum riski düşer.

## **15.2 PCAP vs Flow okuryazarlığı**

### **Ne anlama gelir?**

Tespit ve raporlamada en kritik karar, "**hangi veri türüyle** kanıt üreteceğim?" sorusudur. İki ana kanıt sınıfı vardır:

-   **PCAP (Packet Capture):** Trafiğin paket düzeyinde kaydı (başlık + içerik/payload). Çok detaylıdır; ancak depolama, mahremiyet ve işleme maliyeti yüksektir.

-   **Flow (NetFlow / IPFIX / sFlow gibi):** Trafiğin özet bilgisini (metadata) tutar: kim (kaynak IP), kime (hedef IP), ne zaman, hangi porttan, ne kadar veri (byte/paket), kaç oturum gibi. İçerik/payload yoktur; ama geniş ölçekli görünürlük için idealdir.

Bu farkı hatırlamak için iki analoji:

-   **PCAP = Güvenlik kamerası kaydı / video kaydı** (ne oldu, nasıl oldu ayrıntı)

-   **Flow = Telefon faturası dökümü** (kim, kimi, ne kadar aradı; ama ne konuştu yazmaz)

Giriş seviyesinde önerilen yaklaşım:

-   **Önce flow ile geniş görünürlük**,

-   Gerekirse **hedefli ve kısa PCAP ile derin kanıt**.

Karar mantığı (hangi durumda hangisi?):

-   "Hangi kaynaklar/hangi hedefler/hangi portlar yoğunlaştı?" → **Flow** çoğu zaman yeterlidir.

-   "Bu trafiğin içeriği neydi / hangi protokol alanı kanıtlıyor?" → **PCAP** gerekir.

-   "Rapor denetlenebilir olmalı" → **Flow + hedefli PCAP** birlikte çok güçlüdür.

**Dikkat (Veri minimizasyonu ve saklama):**\
PCAP paket içeriği taşıyabilir. Bu yüzden giriş seviyesinde bile **en az veri** prensibi uygulanır: kısa zaman penceresi, tekil akış, yetkili saklama, paylaşımda maskeleme/özetleme. Flow, içerik tutmadığı için mahremiyet açısından daha az riskli olsa da yine de erişim ve saklama politikası gerekir.

### **Gerçek hayatta belirtisi/örneği nedir?**

Örnek: Bir alarm "kısa sürede çok bağlantı" diyor. Flow, hangi kaynakların oturum sayısını artırdığını hızla gösterir. Sonra PCAP ile yalnızca ilgili 1--2 akış için "kanıt güçlendirme" yapılır.

Örnek: Yönetici "Bu gerçekten oldu mu?" diye soruyor. Flow grafiği/özet tablosu bir "öykü" kurar; hedefli PCAP görüntüsü/çıktısı ise bu öyküyü "kanıt standardına" taşır.

### **Nasıl doğrularım/çürütürüm? (güvenli)**

**Flow ile doğrulama (özet bakış):**

-   Zaman penceresini sabitle (örn. 10 dakika).

-   Kaynak/hedef/port/byte/paket/oturum sayısı alanlarında "sapma" var mı bak.

-   Baseline (Modül 12 köprüsü): Bu saat diliminde normalde ne olur?

**PCAP ile doğrulama (derin kanıt):**

-   Tekil akışa odaklan: "şu kaynak--hedef--protokol".

-   Protokol alanlarını gözle: DNS yanıt kodları, TCP yeniden iletim, TLS el sıkışma gibi.

-   Alternatif açıklamaları ele: DNS hatası mı, rota mı, hedef servis down mı?

**İpucu (Flow "harita", PCAP "yakın plan"):**\
Harita olmadan yakın plan bağlamı kaybeder; yakın plan olmadan harita ayrıntı kaybeder. Birlikte kullanıldığında tespit saatlerden dakikalara düşer.

## **15.3 Raporlama (Bulgu → Etki → Öneri → Kanıt)**

### **Ne anlama gelir?**

Ağ uzmanı veya güvenlik analisti olarak iş, "sinyali görmekle" bitmez. Karar vericiler (teknik/iş) için yapılması gereken, gözlemi **izlenebilir bir karara** dönüştürmektir. Bu modülde raporun standardı tek tiptir:

**Bulgu → Etki → Öneri → Kanıt (rapor formatı)**

-   **Bulgu (Finding):** Ne gördüm? Ölçülebilir, teknik ve net. *Yorum değil.*

-   **Etki (Impact):** Neden önemli? İş/operasyon riski diline çevir.

-   **Öneri (Recommendation):** Nasıl çözeriz? Ne değişecek?

-   **Kanıt (Evidence):** Çıktı/log/PCAP/flow; zaman damgası; kullanılan filtre/koşul; özet tablo/görsel.

**Dikkat (Bulgu ≠ Yorum):**\
"Şüpheli trafik var" bir yorumdur. Bulgu, "hangi zaman penceresinde, hangi kaynak-hedef arasında, hangi metrik sapmış" gibi ölçülebilir bir cümledir. Yorum, bulgunun üzerine inşa edilir; ama bulguyla karıştırılırsa rapor denetlenebilirliğini kaybeder.

### **Gerçek hayatta belirtisi/örneği nedir?**

Örnek: "Alarm geldi ama ne yapacağımız belli değil." Bu genellikle raporun "etki" ve "öneri" kısmının zayıf olduğuna işaret eder.

Örnek: "Düzelttik" deniyor ama kanıt yok. Bu, düzeltme teyidinin eksik olduğuna işaret eder (Modül 14 köprüsü).

### **Nasıl doğrularım/çürütürüm? (güvenli)**

-   Bulgu cümlesi **ölçülebilir mi?** (zaman, kaynak, hedef, protokol, metrik)

-   Alternatif açıklamalar yazıldı mı? (yanlış pozitif yönetimi)

-   Kanıt, aynı koşullarda tekrar üretilebilir mi? (hangi filtre, hangi zaman aralığı)

-   Öneri, "ne yapılacağı" kadar "nasıl teyit edileceği"ne değiniyor mu?

## **Komut & Araç Okuryazarlığı (Simülasyon ve kanıt üretimi --- güvenli)**

Aşağıdaki araç/komutlar yalnızca **kendi/izinli ortamında** "kanıt üretme" ve "çıktı okuryazarlığı" içindir. Bu modülde amaç; tespiti güçlendirmek için **hedefli yakalama**, **özetleme** ve **rapora kanıt koyma** becerisidir.

### **1) Tekil akış doğrulama (izinli)**

**Windows (PowerShell):**

-   Komut: Test-NetConnection 192.0.2.50 -Port 443

-   Amaç: Önceden bilinen tek bir hedef/port için erişim var mı yok mu kontrolü.

-   Beklenen çıktı türü: TcpTestSucceeded: True/False

-   Yorum ipucu: False sonucu tek başına "kural çalışıyor" demek değildir; hedef servis kapalı/down olabilir. Katmanlı doğrula.

-   Güvenli sınır: Tekil hedef; geniş aralık denemesi yok; yalnızca izinli ortam.

### **2) PCAP yakalama (kısa, hedefli, sınırlı)**

**Linux/macOS (tcpdump):**

-   Komut: tcpdump -i \<arayüz\> -w sim.pcap -c 500 host 192.0.2.10

-   Amaç: Belirli hedefe giden/ondan gelen trafiği sınırlı paket sayısıyla yakalamak.

-   Beklenen çıktı türü: PCAP dosyası + yakalanan paket sayısı.

-   Yorum ipucu: -c 500 gibi limitler veri minimizasyonu sağlar; rapor için yeterli örneklem üretir.

-   Güvenli sınır: İzinli ağ; kısa pencere; tekil akış.

**Windows (yerleşik, özet yaklaşım):**

-   Araç: pktmon

-   Amaç: Windows üzerinde paket izleme başlatmak ve kanıt üretmek (gerektiğinde Wireshark ile çapraz inceleme).

-   Beklenen çıktı türü: Yakalama/özet dosyası.

-   Yorum ipucu: Filtre/driver etkileri nedeniyle eksik görünen durumlarda farklı kanıtla çaprazla.

-   Güvenli sınır: Kendi cihazın ve izinli segment.

### **3) PCAP'ten hızlı özet çıkarma (kanıta dönüşüm)**

**Wireshark (GUI):**

-   Amaç: PCAP içinden ilgili protokolü filtreleyip "kanıt" olacak ekran/özet üretmek.

-   Beklenen çıktı türü: Filtrelenmiş paket listesi + istatistik ekranları.

-   Yorum ipucu (örnek filtreler):

    -   dns

    -   tcp.analysis.retransmission

    -   ip.addr == 192.0.2.10

-   Güvenli sınır: Yalnızca izinli PCAP; paylaşımda maskeleme/özetleme.

**CLI (tshark):**

-   Komut: tshark -r sim.pcap -q -z conv,ip

-   Amaç: "Kim kiminle konuştu?" özet tablosu üretmek.

-   Beklenen çıktı türü: IP konuşma (conversation) tablosu.

-   Yorum ipucu: Raporun "Kanıt" bölümünde özet tablo olarak çok değerlidir.

-   Güvenli sınır: PCAP içeriğini ham hâliyle paylaşma; özetle.

**İpucu (Tespit Et → Kanıtla → Raporla):**\
Tekil bir doğrulama akışını (ör. Test-NetConnection) **kanıt üretimi** (PCAP/özet) ile desteklediğinde, rapor "inanılır" olmaktan çıkıp "denetlenebilir" olur.

## **Troubleshooting Mini Senaryosu (Purple Team --- Yerel/İzinli)**

**Durum:** Kurum içinde yeni bir tespit kuralı devreye alındı: "DNS tarafında kısa sürede olağandışı sorgu artışı" alarmı. Yönetici soruyor: "Bu gerçekten çalışıyor mu?"

**Belirti → Olasılık → Doğrulama → Sonuç**

**Belirti:** İzleme ekibi belirli bir zaman aralığında alarm gördüğünü söylüyor.

**Olasılıklar (ilk üç):**

1.  Tatbikat kapsamında planlanan simülasyon trafiği DNS sorgu örüntüsünü artırdı (beklenen).

2.  Normal bir süreç (güncelleme/başlangıç işleri) DNS artışına neden oldu (yanlış pozitif).

3.  Ölçüm hatası: yanlış zaman penceresi/yanlış segment inceleniyor (yanlış yorum).

**Doğrulama (pasif → kontrollü, katmanlı):**

1.  **Zaman penceresini sabitle:** Alarmın geldiği 5--10 dakikayı netleştir.

2.  **Flow ile geniş bakış:** Bu pencerede DNS akışlarında (53) oturum/byte/paket artışı var mı? Hangi kaynaklar öne çıkıyor?

3.  **PCAP ile hedefli kanıt:** İlgili segmentte kısa ve hedefli PCAP al; Wireshark'ta dns filtresiyle sorgu yoğunluğunu ve yanıt örüntüsünü gözle.

4.  **Karşı kanıtı ara:** Aynı saat aralığında planlı iş var mı? Baseline ne diyor?

5.  **Sonucu temkinli kur:** "Şüpheli" etiketi yerine, ölçülebilir bulgu + alternatif açıklama + kanıt zinciri.

**Sonuç (Bulgu → Etki → Öneri → Kanıt):**

-   **Bulgu:** "Belirlenen zaman penceresinde DNS akış metrikleri baseline'a göre arttı; artışın büyük kısmı belirli kaynaklardan geliyor. PCAP'te dns filtresi altında sorgu örüntüsü yoğunlaştı."

-   **Etki:** "Kural sinyali yakalayabiliyor; ancak normal süreçlerle karışıyorsa yanlış pozitif maliyeti doğurabilir (alarm yükü)."

-   **Öneri:** "Zaman penceresi/eşik değerleri gözden geçirilsin; normal işlerin profili baseline'a işlenip istisna mantığı planlansın. Tatbikatlarda 'beklenen sinyal' dokümante edilsin."

-   **Kanıt:** "Flow özet tablosu (zaman penceresi + ilk N kaynak), PCAP'ten filtreli görüntü/çıktı (dns), kullanılan filtre ve zaman damgası."

## **Terimler Sözlüğü (Glossary)**

  **Terim**                      **Türkçe karşılığı / açıklama**
  ------------------------------ ------------------------------------------------------------------------------------------------
  Purple Team                    Kırmızı (simülasyon) ve Mavi (tespit) tarafın işbirliğiyle "simüle et--ölç--iyileştir" döngüsü
  Simulation Traffic             İzinli ortamda, kontrollü ve zarar vermeyen tatbikat trafiği
  Traffic Generation             Ölçüm amacıyla, yetkili ve kontrollü trafik üretme kavramı
  PCAP (Packet Capture)          Ağ trafiğinin paket düzeyinde kaydı (başlık + içerik/payload)
  Flow (NetFlow/IPFIX/sFlow)     Trafiğin özet/metaveri kaydı (kim-kime-ne kadar, içerik yok)
  Payload                        Paketin taşıdığı asıl içerik/veri (flow'da yer almaz, PCAP'te olabilir)
  Metadata                       Üst veri: veri hakkındaki veri (kim, kime, ne zaman, ne kadar)
  Baseline                       "Normal" davranış referansı; sapmayı ölçmek için temel
  Time Window                    İnceleme zaman penceresi; kanıtı sabitlemek için kritik
  Evidence (Kanıt)               Bulguyu destekleyen çıktı/kayıt (PCAP, flow, log, ekran görüntüsü, özet tablo)
  False Positive                 Var sanılan ama aslında normal olan durum (yanlış alarm)
  False Negative                 Var olan bir şüpheli durumu kaçırma/görememe
  Bulgu → Etki → Öneri → Kanıt   Rapor formatı; izlenebilir ve denetlenebilir çıktı üretir

## **Kendini Değerlendir**

### **1)**

Bir tatbikatta hedef soru "DNS anomalisini görüyor muyuz?" iken ekip raporu şu cümleyle açıyor: "Ağda şüpheli trafik vardı." Bu raporun en temel problemi aşağıdakilerden hangisidir?

A\) PCAP yerine flow kullanılmış olması\
B) Bulgu ile yorumun birbirine karışması\
C) Zaman penceresinin kısa seçilmesi\
D) Baseline'a bakılmaması (tek problem budur)\
E) Rapor formatında "Öneri" bölümünün gereksiz olması

**Doğru: B**\
**Gerekçe:** "Şüpheli trafik" ölçülebilir bir bulgu değil, yorumdur; bulgu (zaman/kaynak/hedef/metrik) netleşmeden denetlenebilirlik kaybolur.

-   A: Hangi veri türünün kullanıldığı söylenmemiş; sorun veri türünden önce dil/kanıt standardıdır.

-   C: Kısa pencere bazen doğru tercihtir; sorun "şüpheli" gibi ölçümsüz ifade.

-   D: Baseline önemli ama raporun "en temel" problemi burada bulgu--yorum ayrımıdır.

-   E: Öneri raporun temel parçasıdır; gereksiz değildir.

### **2)**

Aşağıdaki durumların hangisinde **flow** tek başına "ilk aşama" için daha rasyonel bir seçimdir?

A\) "DNS yanıt kodları neden değişti?" sorusu\
B) "TLS el sıkışması nerede bozuluyor?" sorusu\
C) "Hangi kaynaklar gece 03:00'te en fazla dış bağlantıyı yaptı?" sorusu\
D) "Paketteki uygulama verisi (payload) neydi?" sorusu\
E) "Belirli bir paketin bayrak alanı neydi?" sorusu

**Doğru: C**\
**Gerekçe:** Flow, kim-kime-ne kadar ve zaman penceresi temelli anomali taraması için idealdir.

-   A/B/E: Protokol detayları/alanlar genelde PCAP gerektirir.

-   D: Payload sadece PCAP ile görülebilir.

### **3)**

Bir ekip "Erişim testi başarısız oldu, demek ki segmentasyon çalışıyor" sonucunu yazıyor. Bu çıkarım hangi nedenle zayıftır?

A\) Erişim testleri hiçbir zaman kanıt sayılmaz\
B) Başarısızlık, hedef servisin kapalı/down olmasından da kaynaklanabilir\
C) Flow varken PCAP'e ihtiyaç yoktur\
D) Segmentasyon yalnızca Wi-Fi ağlarında olur\
E) Başarısızlık her zaman yanlış pozitiftir

**Doğru: B**\
**Gerekçe:** "Erişemiyorum" sonucu tek başına segmentasyon kanıtı değildir; servis durumu ve katmanlı doğrulama gerekir.

-   A: Test çıktısı kanıttır; yorum doğru kurulmalıdır.

-   C: Flow/PCAP seçimi ayrı konu; burada mantık hatası var.

-   D: Segmentasyon her ağ tasarımında olabilir.

-   E: Yanlış pozitif kavramı burada uygun değil.

### **4)**

Aşağıdakilerden hangisi "Tespit Et → Kanıtla → Raporla" döngüsünde **kanıtla** adımını en doğru temsil eder?

A\) "Bence risk yüksekti" demek\
B) Alarm ekranını kanıtsız şekilde rapora koymak\
C) Zaman penceresi ve filtre bilgisiyle birlikte flow özeti + hedefli PCAP çıktısı eklemek\
D) Sadece bir ekran görüntüsü koyup tarih belirtmemek\
E) "Bu kesin saldırıdır" ifadesini başa yazmak

**Doğru: C**\
**Gerekçe:** Kanıt, tekrar üretilebilir olmalı; zaman penceresi + filtre + veri türü birleşimi denetlenebilirlik sağlar.

-   A/E: Yorum/iddia; kanıt değil.

-   B/D: Eksik bağlam nedeniyle zayıf kanıt.

### **5)**

Bir tatbikatta ekip, üretim ortamında uzun süreli geniş kapsamlı PCAP toplamayı öneriyor. Bu modülün yaklaşımına göre en doğru tepki hangisi olur?

A\) PCAP her zaman en iyisidir; ne kadar çok o kadar iyi\
B) Flow gereksizdir; sadece PCAP yeter\
C) Veri minimizasyonu ve zarar vermeme için kısa pencere + tekil akış + yetkili saklama planı istenmeli\
D) PCAP hiçbir koşulda kullanılmamalı\
E) Sadece "gizlilik" yazıp teknik planı boş bırakmak yeter

**Doğru: C**\
**Gerekçe:** PCAP güçlü kanıt üretir ama maliyet/mahremiyet/operasyon riski vardır; hedefli ve sınırlı toplama esastır.

-   A/B: Riskleri yok sayar.

-   D: Aşırı kısıt; doğru değil.

-   E: Politika cümlesi, planın yerini tutmaz.

### **6)**

Aşağıdaki ifadelerden hangisi **Bulgu** bölümüne en uygundur?

A\) "Sistem güvensiz görünüyor."\
B) "192.0.2.10 ile 198.51.100.7 arasında, 10:00--10:10 aralığında DNS akış sayısı baseline'a göre artmış; flow özeti bunu gösteriyor."\
C) "Bu kritik bir durum, hemen müdahale edilmeli."\
D) "Bütçe çıkarsa çözebiliriz."\
E) "Bence IDS bozuk."

**Doğru: B**\
**Gerekçe:** Ölçülebilir, zaman pencereli, kanıta referans veren ifade bulgudur.

-   A/C/E: Yorum.

-   D: Yönetim/planlama yorumu; bulgu değil.

### **7)**

Bir alarmın "çalışıyor gibi görünmesi" ama gerçekte şüpheli davranışı kaçırması hangi kavrama daha yakındır?

A\) False Positive\
B) False Negative\
C) Baseline\
D) Payload\
E) Time Window

**Doğru: B**\
**Gerekçe:** Gerçek sinyali kaçırmak "yanlış negatif"tir.

-   A: Normal şeyi şüpheli sanmaktır.

-   C/D/E: Bağlam terimleridir.

### **8)**

PCAP/Flow seçimi için aşağıdaki gerekçelerden hangisi **yanlıştır**?

A\) Flow yıllarca saklanabilir; geniş ölçekli anomali için uygundur\
B) PCAP, protokol alanlarını ayrıntılı görmek için uygundur\
C) Flow, payload içerdiği için mahremiyet riski PCAP'ten yüksektir\
D) PCAP depolama ve işleme maliyeti açısından daha ağır olabilir\
E) Denetlenebilir rapor için bazen flow + hedefli PCAP birlikte en güçlü kombinasyondur

**Doğru: C**\
**Gerekçe:** Flow genellikle payload içermez; payload PCAP tarafında olabilir.

-   A/B/D/E: Modül yaklaşımıyla uyumludur.

## **Kapanış: Bu modülde kazandıklarımız**

-   Purple Team yaklaşımının "operasyon" değil, **izinli ölçüm ve iyileştirme döngüsü** olduğunu.

-   Simülasyonu doğru yürütmek için **hedef soru + kapsam + zaman penceresi + kanıt planı** disiplinini.

-   **Flow ile geniş görünürlük**, **PCAP ile hedefli derin kanıt** yaklaşımını ve hangi durumda hangisinin seçileceğini.

-   Yanlış pozitif/yanlış negatif ve yanlış yorum riskini azaltmak için **"ne doğrular, ne çürütür?"** refleksini.

-   Bulguyu profesyonel çıktıya dönüştürmek için **Bulgu → Etki → Öneri → Kanıt (rapor formatı)** standardını.
