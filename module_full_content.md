# **MODÜL 1 --- Siber Güvenliğin Temelleri ve Vizyonu**

## **Modül Özeti**

Bu modül, siber güvenliğe giriş yaparak temel kavramsal çerçeveyi kurar
ve "neyi, neden ve neye karşı koruyoruz?" sorularını sistematik biçimde
yanıtlar. Siber güvenliğin kapsamı ile bilgi güvenliği arasındaki ilişki
netleştirilir; güvenliğin üç temel direği olan CIA Üçlüsü
(Gizlilik--Bütünlük--Erişilebilirlik) açıklanır. Ardından varlık,
tehdit, zafiyet, risk, exploit, payload ve zero-day gibi temel terimler
birbiriyle ilişkilendirilir ve saldırıların çoğu zaman bir "zincir"
halinde ilerlediği kavramsal olarak gösterilir. Bu modülde kazanılan dil
ve bakış açısı, bir sonraki modülde tehdit aktörlerini ve saldırı
türlerini anlamanın temelini oluşturur.

## **Modül Amaçları**

Bu modülü tamamlayan bir öğrenci:

-   Siber güvenlik ve bilgi güvenliği kavramlarını doğru düzeyde
    tanımlayabilir ve aralarındaki farkı gerekçelendirebilir.

-   Dijital varlıkları (veri, sistem, hizmet) sınıflandırabilir ve
    gerçekçi senaryolara uygulayabilir.

-   CIA Üçlüsünü açıklayabilir; basit ve karmaşık olaylarda hangi
    bileşenin etkilendiğini yorumlayabilir.

-   Tehdit, zafiyet ve risk kavramlarını birbirine karıştırmadan
    ilişkilendirebilir; önceliklendirme mantığını kavrayabilir.

-   Exploit ve payload ayrımını yapabilir; zero-day kavramının savunma
    açısından neden kritik olduğunu açıklayabilir.

-   Siber saldırıların yaşam döngüsünü (saldırı zinciri) kavramsal
    olarak ifade edebilir.

## **1) Bu Modülün Genel Yapısı ve Neden Bu Sıra?**

Siber güvenlik eğitiminde "araçlar" ve "saldırı türleri" genellikle ilgi
çekicidir; ancak sağlıklı bir öğrenme için önce kavramların netleşmesi
gerekir. Çünkü aynı olayı farklı kişiler farklı terimlerle
tanımlayabilir. Kavramsal dil ortak değilse problem yanlış anlaşılır,
yanlış çözüm uygulanır ve ekip içi iletişim zayıflar.

Bu nedenle bu modül sıralı ilerler:

1.  **Kapsamı belirler:** Neyi koruyoruz? (varlık)

2.  **Hedefi tanımlar:** Neye göre "güvenli" diyeceğiz? (CIA Üçlüsü)

3.  **Analiz dili kurar:** Tehdit--zafiyet--risk ve saldırı zinciri ile
    olayları parçalarına ayırır.

Bir sonraki modülde tehdit aktörleri ve saldırı türlerini incelerken
sürekli olarak "hangi varlık hedef alındı?", "CIA'dan hangisi
etkilendi?" ve "hangi zafiyet kullanıldı?" sorularına geri döneceksiniz.
Bu modül, o soruları doğru sormayı öğretir.

## **1.1) Siber Güvenlik Nedir?**

### **1.1.1) Tanım: "Sanat ve Bilim" Olarak Siber Güvenlik**

Siber güvenlik, bilgisayar sistemlerini, ağları ve verileri dijital
saldırılardan koruma "sanatı ve bilimi" olarak özetlenebilir. Ancak
akademik çerçevede daha kapsamlı bir tanım gerekir:

**Siber güvenlik**, dijital varlıkların gizliliğini, bütünlüğünü ve
erişilebilirliğini sağlamak amacıyla uygulanan **teknoloji, süreç ve
kontroller** bütünüdür.

Bu tanımda üç unsur özellikle kritiktir:

-   **Dijital ortam:** Bilgisayarlar, mobil cihazlar, ağlar, internet,
    bulut servisleri.

-   **Varlık:** Korunması gereken değer (veri/sistem/hizmet).

-   **Tehdit:** Zarar doğurabilecek unsur (kasıtlı saldırı, hata, yanlış
    yapılandırma, kesinti vb.).

### **1.1.2) Bilgi Güvenliği ile Siber Güvenlik Arasındaki Fark**

Yeni başlayanlar için en kritik ayrım budur:

-   **Bilgi Güvenliği (Information Security / InfoSec):** Bilgiyi
    **fiziksel veya dijital** fark etmeksizin korur (kâğıt belge, sözlü
    bilgi, dijital dosya).

-   **Siber Güvenlik (Cybersecurity):** Bilgi güvenliğinin **dijital
    ortama ve siber uzaya (ağlar, internet, dijital cihazlar, bulut)**
    odaklanan alt kümesidir.

**Neden önemli?** Bir kurumun fiziksel arşiv odasındaki dosyaların kilit
altında tutulması bilgi güvenliği kapsamındayken, bu dosyaların dijital
taramalarının bir sunucuda saklanması ve ağa açık olması siber güvenlik
kapsamını doğrudan ilgilendirir.

Bu ayrım, CIA Üçlüsünü işlerken daha da netleşir; çünkü CIA hedefleri
hem bilgi güvenliğinin hem de siber güvenliğin merkezindedir.

### **1.1.3) Dijital Varlık Kavramı: Veri -- Sistem -- Hizmet**

Bir güvenlik stratejisi kurgulanırken ilk soru şudur: **"Neyi
koruyoruz?"**\
Dijital varlıkları üç temel sınıfta ele almak pratik bir çerçeve sağlar:

1.  **Veri (Data):**

-   Örnekler: Notlar, sözleşmeler, fotoğraflar, müşteri kayıtları, sınav
    dokümanları, finansal raporlar, fikri mülkiyet (ör. bir yazılımın
    kaynak kodu).

-   Neden önemli? Verinin ifşası gizliliği, değişmesi bütünlüğü, kaybı
    erişilebilirliği etkileyebilir.

2.  **Sistem (System):**

-   Örnekler: Dizüstü bilgisayar, sunucu, mobil cihaz, veritabanı,
    işletim sistemi, uygulama, ağ cihazları (yönlendirici/router vb.).

-   Neden önemli? Sistemler veriyi işler ve hizmet üretir; sistem
    bozulursa veri ve hizmet de etkilenebilir.

3.  **Hizmet (Service):**

-   Örnekler: Web sitesinin yayın yapması, e-posta trafiğinin akması,
    çevrimiçi randevu, ödeme altyapısı, dosya paylaşımı, uzaktan erişim.

-   Neden önemli? Hizmet kesintisi, kullanıcıların ihtiyaç anında
    erişememesi demektir (CIA'da "erişilebilirlik").

**Kurgusal örnek (sınıflandırma):** "Kuzey Lojistik" adlı kurgusal bir
firmayı düşünün.

-   Araç takip uygulaması: **Hizmet**

-   Uygulamanın çalıştığı ana sunucu: **Sistem**

-   Araçların konum bilgileri ve rota kayıtları: **Veri**\
    Bu sınıflandırma, hangi varlığın hangi güvenlik hedefiyle
    korunacağını tasarlamayı kolaylaştırır.

### **1.1.4) Dijital Dünyanın Kısa Tarihçesi ve Siber Güvenliğin Doğuşu**

Siber güvenlik tarihi, teknolojik ilerleme ile kötüye kullanımın
evriminin birlikte ilerlediği bir tarihtir.

-   1970'lerde ARPANET üzerinde dolaşabilen deneysel programlar (ör.
    **Creeper**) "ağ üzerinde yayılabilen yazılım" fikrini görünür
    kılmıştır.

-   1990'larda internetin ticarileşmesiyle bağlantı ve veri akışı
    hızlanmış; güvenlik, yerel bir teknik mesele olmaktan çıkarak geniş
    ölçekli bir problem alanına dönüşmüştür.

-   Günümüzde siber güvenlik, bireysel merakın ötesinde; kurumsal
    süreklilik, ulusal güvenlik ve ekonomik istikrarla ilişkili bir
    öncelik haline gelmiştir.

Bu tarihsel bağlam, bir sonraki modülde tehdit aktörlerinin
motivasyonlarını (merak, kazanç, ideoloji, devlet destekli hedefler vb.)
anlamak için temel oluşturur.

### **1.1.5) Günlük Hayattan Örnekler** 

-   **Veri örneği:** Bir kişi telefon notlarına hassas bilgiler
    yazmıştır. Telefon ekran kilidi zayıfsa veya yedekleme izinleri
    yanlışsa bu veri yetkisiz erişime açık hale gelebilir.

-   **Sistem örneği:** Bir dizüstü bilgisayar uzun süre güncellenmeden
    kullanılır. Bu durum, bilinen açıkların kapanmaması anlamına
    gelebilir.

-   **Hizmet örneği:** Bir topluluk etkinlik kayıtlarını çevrimiçi form
    ile alır. Formun çalışmaması halinde başvurular aksar; bu doğrudan
    hizmet sürekliliği problemidir.

## **1.2) Temel Güvenlik Prensipleri --- CIA Üçlüsü**

CIA Üçlüsü, bilgi güvenliğinin (dolayısıyla siber güvenliğin) en temel
modelidir: **Gizlilik (Confidentiality), Bütünlük (Integrity),
Erişilebilirlik (Availability).**\
Bir güvenlik ihlali yaşandığında, bu üç bileşenden en az birinin zarar
gördüğü varsayılır.

### **1.2.1) Gizlilik (Confidentiality)**

**Kısa tanım:** Bilgiye yalnızca yetkilendirilmiş kişi/süreç/cihazların
erişebilmesidir.\
**Neden önemli?** Kişisel verilerin veya ticari sırların ifşası;
mahremiyet kaybı, dolandırıcılık ve itibar kaybı doğurabilir.\
**Basit örnek:** Bir e-ticaret sitesinde kullanıcı parolalarının
veritabanında "okunabilir şekilde" saklanması, sızma halinde gizlilik
açısından ağır sonuçlar doğurur.\
**Gerçek hayatta nerede görülür?** Parola paylaşımı, yanlış paylaşım
izinleri, kamuya açık ağlarda korunmasız oturumlar.

Gizliliği sağlamanın en yaygın yollarından biri şifrelemedir;
kriptografik yaklaşımlar modül 5'te daha sistematik ele alınacaktır.

### **1.2.2) Bütünlük (Integrity)**

**Kısa tanım:** Verinin doğruluğunun ve tamlığının korunması; izinsiz
veya hatalı şekilde değiştirilmemesidir.\
**Neden önemli?** Yanlış veri = yanlış karar ve yanlış işlem demektir.\
**Basit örnek:** Bir banka transferinde gönderilen tutarın alıcıya
farklı bir tutar olarak ulaşması bütünlük ihlalidir.\
**Gerçek hayatta nerede görülür?** Dosyaların kazara bozulması, yanlış
sürümün paylaşılması, izinsiz içerik değişikliği.

**Uygulama örneği (bütünlük kontrolü):** Yazılım indirme sayfalarında
verilen **checksum/kontrol toplamı** değerleri, indirilen dosyanın yolda
bozulmadığını veya değiştirilmediğini doğrulamak için kullanılır.

### **1.2.3) Erişilebilirlik (Availability)**

**Kısa tanım:** Yetkili kullanıcıların ihtiyaç duyduğu anda sistemlere
ve verilere ulaşabilmesidir.\
**Neden önemli?** İş sürekliliğini sağlar. Veri gizli ve doğru olsa
bile, hizmet çalışmıyorsa pratikte güvenlik hedefleri karşılanamaz.\
**Basit örnek:** Bir web sitesinin yoğun trafik saldırısı (DDoS)
nedeniyle kullanılamaz hale gelmesi erişilebilirlik problemidir.\
**Gerçek hayatta nerede görülür?** Sistem arızaları, bağlantı
kesintileri, yanlış yapılandırmalar, yoğunluk ve hizmet kesintileri.

**Kritik örnek:** Bir hastanenin randevu sistemi çalışmıyorsa, veri
sızmamış ve bozulmamış olsa bile hizmet üretilemediği için
erişilebilirlik hedefi zarar görmüştür.

### **1.2.4) Üçlü Arasında Denge Kurma**

Güvenlik tasarımında denge şarttır:

-   Çok sıkı gizlilik önlemleri (örn. aşırı karmaşık doğrulama adımları)
    erişilebilirliği düşürebilir.

-   Erişimi aşırı kolaylaştırmak gizlilik riskini artırabilir.

-   Değişiklikleri aşırı kısıtlamak süreçleri yavaşlatabilir (bütünlük
    korunurken iş verimi düşebilir).

1.1'deki "hizmet" varlığı, özellikle erişilebilirlik hedefiyle doğrudan
ilişkilidir.\
Modül 2'de DoS/DDoS gibi saldırıların daha çok erişilebilirliğe, kimlik
avı gibi yöntemlerin ise çoğunlukla gizlilik ve kimlik güvenliğine etki
ettiğini örneklerle göreceksiniz.

### **1.2.5) Günlük Hayattan Örnekler** 

-   **Gizlilik:** Bir kişi bulut depolama klasörünü yanlışlıkla "herkese
    açık bağlantı" ile paylaşmıştır; özel belgeler yetkisiz kişilere
    açılabilir.

-   **Bütünlük:** Ortak bir projede aynı dosya farklı sürümlerde
    düzenlenir; yanlış sürüm teslim edilir. Veri sızmasa bile bütünlük
    sorunu oluşur.

-   **Erişilebilirlik:** Yoğun başvuru gününde bir form sayfası açılmaz;
    veri sızıntısı yoktur ancak hizmet kullanılamaz.

## **1.3) Temel Siber Güvenlik Kavramları**

Bu bölüm, siber güvenlik dilinin "alfabesidir". Bir olayı analiz ederken
şu soruları sistematik hale getirir:

-   Hangi **varlık** etkilendi?

-   Hangi **tehdit** devredeydi?

-   Hangi **zafiyet** kullanıldı?

-   **Risk** neden yüksekti/düşüktü?

### **1.3.1) Varlık (Asset)**

**Kısa tanım:** Korunması gereken değer. Veri, sistem, hizmet; ayrıca
zaman, itibar ve iş süreçleri de varlık olarak ele alınabilir.\
**Neden önemli?** Varlığı tanımlamadan güvenlik hedefi ve öncelik
belirlenemez.\
**Basit örnek:** E-posta hesabı bir varlıktır; içindeki mesajlar veri,
hesabın çalışması hizmet boyutunu taşır.

### **1.3.2) Tehdit (Threat)**

**Kısa tanım:** Bir varlığa zarar verme potansiyeli taşıyan olay, kişi
veya koşul. Tehdit her zaman "gerçekleşmiş saldırı" demek değildir.\
**Basit örnek:** Parola tahmin denemeleri bir tehdittir.\
Tehdit aktörlerinin kimler olduğu ve motivasyonları Modül 2'de ayrıntılı
sınıflandırılacaktır.

### **1.3.3) Zafiyet (Vulnerability)**

**Kısa tanım:** Sistem veya süreçte bulunan açıklık/eksiklik. Sadece
yazılım hatası değil; yanlış yapılandırma ve süreç zaafları da
zafiyettir.\
**Basit örnek:** Güncellenmemiş uygulama sürümü; aşırı yetkili hesaplar;
varsayılan ayarların değiştirilmemesi.

### **1.3.4) Risk**

**Kısa tanım:** Bir tehdidin bir zafiyeti kullanma olasılığı ve bunun
sonucunda ortaya çıkacak etkinin (zararın) büyüklüğünün birlikte
değerlendirilmesidir.\
Risk yönetimi, sınırlı kaynakları doğru yere ayırabilmek için
"önceliklendirme" sağlar.

**Yaygın iki ifade biçimi:**

1.  **Risk = Olasılık × Etki (Likelihood × Impact)** --- risk
    değerlendirmede en temel ve yaygın yaklaşımdır.

2.  **Risk ≈ Tehdit × Zafiyet** --- pedagojik olarak "tehdit ve zafiyet
    arttıkça risk artar" fikrini vurgulayan basitleştirilmiş bir
    ifadedir. Uygulamada etki boyutu ayrıca değerlendirilir.

**Dikkat:** "Tehdit × Zafiyet" ifadesi, çoğu zaman olasılık (likelihood)
tarafını sezdirir. Gerçek dünyada aynı zafiyet, farklı varlıklarda
farklı etkilere yol açabilir; bu yüzden etkiyi ayrıca düşünmek gerekir.

**Pedagojik örnek:** Bir evin kapısını açık bırakmak **zafiyet**,
sokakta dolaşan bir hırsızın varlığı **tehdit**, hırsızın o açık kapıdan
girip zarar verme olasılığı ve sonucunun büyüklüğü **risk**tir.

### **1.3.5) Exploit ve Payload**

-   **Exploit:** Bir zafiyeti istismar etmek için tasarlanmış
    yöntem/kod/araçtır. "Kapıyı açmak için kullanılan maymuncuk"
    benzetmesi bu ayrımı sezdirir.

-   **Payload:** Exploit başarılı olduktan sonra hedef sistemde
    yürütülen asıl zararlı faaliyettir. "İçeri girdikten sonra yapılan
    eylem" (ör. dosyaları şifreleme, veri çalma, yetki yükseltme)
    payload ile ilişkilidir.

### **1.3.6) Zero-Day (Sıfırıncı Gün)**

**Tanım:** Üreticisi tarafından henüz bilinmeyen veya yaması
yayımlanmamış güvenlik açıklarıdır. Savunma tarafının hazırlanması için
"zamanın çok kısıtlı" olduğu durumları ifade eder.

### **1.3.7) Saldırı Zinciri Mantığı (Attack Chain)**

Siber saldırılar genellikle tek hamlede olmaz; bir süreç izler. Basit
bir saldırı zinciri şu adımlarla kavramsallaştırılabilir:

1.  **Keşif:** Hedef hakkında bilgi toplama (sistemler, kullanıcılar,
    zafiyetler).

2.  **Saldırı Hazırlığı:** Exploit ve payload'un
    hazırlanması/birleştirilmesi.

3.  **İletim:** Hazırlanan saldırının hedefe ulaştırılması (ör. e-posta,
    web, dosya).

4.  **Sızma ve Yerleşme:** Sisteme giriş ve kalıcılık sağlama.

5.  **Eylem:** Veri çalma, hizmeti durdurma, zarar verme gibi amaçların
    icrası.

Bu zincirin "etki" kısmını değerlendirmek için CIA Üçlüsüne geri
dönülür.\
Bu zincirin her aşamasında alınabilecek temel farkındalık önlemleri
Modül 8'de özetlenecektir.

### **1.3.8) Günlük Hayattan Örnekler** 

-   **Risk analizi:** Bir kişi aynı parolayı birçok hesapta kullanır
    (zafiyet). Bir saldırganın daha önce sızmış parola listelerini
    farklı sitelerde denemesi (tehdit) hesap ele geçirme olasılığını
    artırır; hesap ele geçirilirse sonuçları ağırsa risk yüksektir.

-   **Exploit--payload ayrımı:** Eski bir uygulamada bir hata vardır
    (zafiyet). Bu hatayı tetikleyen özel hazırlanmış bir istek (exploit)
    kullanılır. Sonrasında tarayıcı ayarlarını değiştiren istenmeyen bir
    yazılımın kurulması payload olabilir.

-   **Zafiyetin süreç boyutu:** Ortak bir hesabın şifresinin herkesle
    paylaşılması ve kimin ne yaptığına dair iz bırakılmaması süreç
    zafiyetidir; teknik açık olmasa bile risk üretir.

## **Terimler Sözlüğü (Glossary)**

  **Terim**                        **Türkçe Karşılığı / Açıklama**
  -------------------------------- --------------------------------------------------------------------------------
  Cybersecurity                    Siber güvenlik; dijital varlıkların tehditlere karşı korunması
  Information Security (InfoSec)   Bilgi güvenliği; bilginin fiziksel ve dijital tüm biçimlerinin korunması
  Asset                            Varlık; değeri olan ve korunması gereken unsur
  Data                             Veri; dijital içerik ve kayıtlar
  System                           Sistem; donanım/işletim sistemi/uygulama gibi bileşenler
  Service                          Hizmet; web sitesi, e-posta, çevrimiçi form gibi işlev sunan yapı
  CIA Triad                        Gizlilik--Bütünlük--Erişilebilirlik modelini ifade eder
  Confidentiality                  Gizlilik; yetkisiz erişimi engelleme
  Integrity                        Bütünlük; doğruluk ve değişmezliği koruma
  Availability                     Erişilebilirlik; ihtiyaç anında kullanılabilir olma
  Threat                           Tehdit; zarar verme potansiyeli taşıyan unsur/olay/aktör
  Vulnerability                    Zafiyet; açıklık, zayıf nokta, yanlış yapılandırma veya süreç eksikliği
  Risk                             Risk; olasılık ve etkiye göre değerlendirilen zarar ihtimali
  Exploit                          İstismar yöntemi; zafiyeti kullanmayı sağlayan teknik/kod/araç
  Payload                          Yük; istismar sonrası gerçekleştirilen asıl zararlı eylem
  Zero-day                         Yaması olmayan veya bilinmeyen güvenlik açığı
  Attack Surface                   Saldırı yüzeyi; saldırıya açık bileşenlerin toplamı
  Encryption                       Şifreleme; veriyi yalnızca yetkililerin okuyacağı forma dönüştürme
  Hardening                        Sıkılaştırma; yapılandırmaları güçlendirip saldırı yüzeyini daraltma
  Checksum                         Kontrol toplamı; dosyanın bozulmadığını/değişmediğini doğrulama değeri
  DDoS                             Dağıtık Hizmet Engelleme; trafikle hizmeti kullanılamaz hale getirme saldırısı

## **Değerlendirme Testi (10 Soru)**

Aşağıdaki sorular, modülün hedeflediği kazanımları ölçmeye yönelik
senaryo-temelli ve kavram ilişkilendirme odaklı hazırlanmıştır.

### **Soru 1**

Bir bankanın mobil uygulaması aşırı trafik nedeniyle bir süre
kullanılamaz hale geliyor. CIA Üçlüsünden hangisi en doğrudan
etkilenmiştir?\
A) Gizlilik\
B) Bütünlük\
C) Erişilebilirlik\
D) Şifreleme

**Doğru cevap: C**\
**Açıklama:** Hizmetin kullanılamaması, yetkili kullanıcıların ihtiyaç
anında erişememesi demektir; bu erişilebilirlik bileşenidir.

### **Soru 2**

Aşağıdakilerden hangisi "bilgi güvenliği--siber güvenlik" ilişkisini en
doğru açıklar?\
A) İkisi aynı kavramdır.\
B) Bilgi güvenliği, siber güvenliğin alt dalıdır.\
C) Siber güvenlik, bilgi güvenliğinin dijital ortamdaki alt kümesidir.\
D) Siber güvenlik yalnızca donanımı, bilgi güvenliği yalnızca yazılımı
korur.

**Doğru cevap: C**\
**Açıklama:** Bilgi güvenliği fiziksel ve dijital tüm bilgiyi kapsar;
siber güvenlik dijital varlık ve siber uzaya odaklanır.

### **Soru 3**

Bir ekip, ortak bir hesabın parolasını herkesle paylaşıyor ve kimin ne
yaptığı izlenemiyor. Bu durum aşağıdaki kavramlardan hangisine en uygun
örnektir?\
A) Zafiyet (süreç zafiyeti)\
B) Payload\
C) Bütünlük kontrolü (checksum)\
D) Zero-day

**Doğru cevap: A**\
**Açıklama:** Teknik bir açık olmasa bile süreç tasarımı zayıfsa zafiyet
oluşur; izlenebilirlik yokluğu riski artırır.

### **Soru 4**

Bir web sitesindeki haber içeriği yetkisiz şekilde değiştirilirse CIA
Üçlüsünden hangisi zarar görür?\
A) Gizlilik\
B) Bütünlük\
C) Erişilebilirlik\
D) Hiçbiri

**Doğru cevap: B**\
**Açıklama:** Verinin izinsiz değiştirilmesi bütünlük ihlalidir.

### **Soru 5**

Bir yazılım indirme sayfasında dosyanın yanında paylaşılan "checksum"
değerinin temel amacı nedir?\
A) Dosyayı daha hızlı indirmek\
B) Dosyanın yolda bozulmadığını veya değiştirilmediğini doğrulamak\
C) Dosyanın şifresini unutturmak\
D) Dosyayı otomatik çalıştırmak

**Doğru cevap: B**\
**Açıklama:** Checksum, dosyanın bütünlük doğrulaması için kullanılır.

### **Soru 6**

"Yazılım geliştiricisi tarafından henüz fark edilmemiş ve yaması
yayımlanmamış güvenlik açığı" hangi terimle ifade edilir?\
A) Exploit\
B) Payload\
C) Zero-day\
D) Hardening

**Doğru cevap: C**\
**Açıklama:** Yaması olmayan/bilinmeyen açıklıklar zero-day olarak
adlandırılır.

### **Soru 7**

Bir saldırıda "exploit" ile "payload" arasındaki en doğru ilişki
hangisidir?\
A) Exploit asıl zararlı eylemdir; payload sadece rapordur.\
B) Exploit zafiyeti kullanır; payload ise istismar sonrası asıl eylemi
gerçekleştirir.\
C) İkisi aynı kavramdır.\
D) Payload güvenlik önlemidir; exploit güncellemedir.

**Doğru cevap: B**\
**Açıklama:** Exploit giriş/istismar mekanizmasını, payload ise
amaçlanan eylemi temsil eder.

### **Soru 8**

Aşağıdaki eşleştirmelerden hangisi "veri--sistem--hizmet"
sınıflandırmasına en uygundur?\
A) Fotoğraf dosyası: Sistem / Dizüstü bilgisayar: Veri / E-posta:
Hizmet\
B) Fotoğraf dosyası: Veri / Dizüstü bilgisayar: Sistem / E-posta:
Hizmet\
C) Fotoğraf dosyası: Hizmet / Dizüstü bilgisayar: Veri / E-posta:
Sistem\
D) Fotoğraf dosyası: Veri / Dizüstü bilgisayar: Hizmet / E-posta: Sistem

**Doğru cevap: B**\
**Açıklama:** Dosya veri, cihaz sistem, e-posta ise hizmet örneğidir.

### **Soru 9**

Risk değerlendirmesi için en yaygın temel yaklaşım aşağıdakilerden
hangisidir?\
A) Risk = Olasılık × Etki\
B) Risk = Sadece Tehdit\
C) Risk = Sadece Zafiyet\
D) Risk = Gizlilik + Bütünlük

**Doğru cevap: A**\
**Açıklama:** Risk değerlendirmede olasılık ve etki birlikte ele alınır;
tehdit ve zafiyet bu değerlendirmeyi besleyen girdilerdir.

### **Soru 10**

IP adresi 192.0.2.45 olan bir sunucuya yönelik bir saldırıda,
saldırganın ilk aşamada hedef hakkında bilgi toplaması saldırı
zincirinin hangi evresidir?\
A) Keşif\
B) Yerleşme\
C) Sızma\
D) Eylem

**Doğru cevap: A**\
**Açıklama:** Hedefi tanıma ve bilgi toplama "keşif" aşamasıdır; sonraki
aşamalarda saldırı hazırlanır ve iletilir.

## **Bu Modülde Neler Öğrendik?**

-   Siber güvenliğin yalnızca teknik bir konu değil; teknoloji, süreç ve
    kontroller bütünlüğü olduğunu kavradık.

-   Bilgi güvenliği ile siber güvenlik arasındaki ilişkiyi doğru
    konumlandırdık; siber güvenliğin dijital odaklı alt küme olduğunu
    öğrendik.

-   Dijital varlıkları veri--sistem--hizmet olarak sınıflandırarak "neyi
    koruyoruz?" sorusuna net bir çerçeve kurduk.

-   CIA Üçlüsü ile güvenliğin hedeflerini tanımladık ve bu hedefler
    arasında denge kurmanın zorunlu olduğunu gördük.

-   Tehdit, zafiyet ve risk kavramlarını birbirine karıştırmadan
    ilişkilendirmeyi öğrendik; riskin olasılık ve etkiyle
    değerlendirildiğini kavradık.

-   Exploit ve payload ayrımıyla bir saldırının mekanizması ile etkisini
    ayırmayı öğrendik; zero-day'in savunma zorluğunu anladık.

-   Saldırıların çoğu zaman bir süreç (saldırı zinciri) halinde
    ilerlediğini ve her aşamanın ayrı önlemler gerektirebileceğini fark
    ettik.

-   Bir sonraki modülde tehdit aktörleri ve saldırı türlerini incelerken
    bu modüldeki kavramların sürekli referans noktası olacağını gördük.

# **Modül 2 --- Siber Tehdit Aktörleri ve Saldırı Türleri**

Bu modül, siber güvenlikte iki temel soruya giriş seviyesinde sistematik
bir yanıt verir: **"Tehdit kimden gelir?"** ve **"Saldırılar nasıl
gerçekleşir?"**. Önce dijital dünyadaki tehditlerin kaynağı olan
**tehdit aktörleri** (kimlerdir, hangi motivasyonlarla hareket ederler?)
sınıflandırılır; ardından başlangıç seviyesinde en yaygın **saldırı
türleri** (zararlı yazılım ailesi, sosyal mühendislik, kaba kuvvet,
DoS/DDoS) teknik ve kavramsal düzeyde açıklanır. Modül boyunca Modül
1'de kurulan **varlık--tehdit--zafiyet--risk** dili somutlaştırılır; bir
sonraki modülde (**Kimlik ve Hesap Güvenliği**) bu saldırıların neden
çoğunlukla **kullanıcılar ve hesaplar** üzerinden başarı kazandığı
netleşir.

## **Modül Amaçları**

Bu modülü tamamlayan bir öğrenci:

-   **Siber tehdit aktörlerini** teknik kapasite ve motivasyonlarına
    göre sınıflandırabilir.

-   **İç tehditleri** (kasıtlı/kazara) ayırt edebilir ve örneklerle
    anlamlandırabilir.

-   **Zararlı yazılım (Malware)** türlerini (virüs, worm, trojan,
    ransomware, spyware) karakteristik özelliklerine göre ayırt
    edebilir.

-   **Sosyal mühendislik saldırılarının** psikolojik temellerini (güven,
    korku, acele) ve uygulama kanallarını (phishing/vishing/smishing)
    açıklayabilir.

-   **Brute force** saldırılarının hesap güvenliği üzerindeki etkisini
    analiz edebilir.

-   **DoS/DDoS** saldırılarının çalışma mantığını kavrayabilir ve
    hedeflediği CIA bileşenini ilişkilendirebilir.

-   Basit olayları **aktör--zafiyet--yöntem--etki (CIA)** hattında
    kavramsal olarak çözümleyebilir.

## **1) Büyük Resim: "Kim saldırır?" ve "Nasıl saldırır?"**

Siber güvenlikte tehditleri anlamak iki temel soruyla başlar:

1.  **Tehdit aktörü kim?**\
    Amaç, motivasyon, kaynak (zaman/para), teknik kapasite ve hedef
    seçimi.

2.  **Saldırı türü ne?**\
    Yöntem, kullanılan zafiyet, hedeflenen varlık (veri/sistem/hizmet)
    ve beklenen etki.

**Geri referans (Modül 1):** "Tehdit", bir varlığa zarar verme
potansiyelidir; "zafiyet" ise bu zararı mümkün kılan açıklıktır. Bu
modül, tehdidi üreten aktörleri ve tehdidin pratikte nasıl **saldırıya**
dönüştüğünü anlatır.\
**İleri referans (Modül 3):** Birçok saldırının en kolay giriş kapısı
**kullanıcı hesaplarıdır**. Parola politikaları, MFA ve dijital kimlik
güvenliği bu modülün doğal devamıdır.

## **2) Tehdit Aktörleri**

### **2.1 Tehdit aktörü nedir?**

**Tehdit aktörü**, siber saldırıyı gerçekleştiren kişi/grup veya
saldırıyı tetikleyen iç/dış unsurdur. Aktörleri anlamak önemlidir; çünkü
**motivasyon** ve **kaynak** (zaman, para, teknik kapasite) saldırının
biçimini, hedefini ve etkisini doğrudan belirler.

Aşağıdaki aktör tiplerinde şu akış izlenir:\
**Kısa tanım → motivasyon → neden önemli → örnek → nerede görülür**

### **2.1.1 Script Kiddies** 

**Kısa tanım:** Başkaları tarafından yazılmış hazır script'leri/araçları
kullanarak saldırı denemeleri yapan, teknik derinliği genellikle sınırlı
kişilerdir.\
**Motivasyon:** Merak, öğrenme isteği, topluluk içinde "hava atma" /
görünürlük.\
**Neden önemli?** Teknik kapasiteleri düşük olsa da otomatize araçlarla
çok sayıda hedefi tarayabilir; geniş çaplı ama hedefsiz zararlar
üretebilirler.\
**Örnekler:**

-   "En yaygın 50 parola" listesiyle farklı giriş ekranlarında otomatik
    deneme yapılması.

-   İnternetten indirdiği hazır bir "site çökertme" aracıyla rastgele
    bir küçük işletmenin web sayfasına saldıran bir lise öğrencisi.\
    **Nerede görülür?** Zayıf parola kullanan hesaplara yönelik
    denemeler, açık servisleri otomatik tarayan botlar, rastgele hedef
    seçimi.\
    **Dikkat:** Modül 1'deki risk mantığında (olasılık × etki)
    **olasılık** artabilir; çünkü deneme sayısı yüksektir.

### **2.1.2 Hacktivistler**

**Kısa tanım:** Politik, sosyal veya ideolojik bir mesaj vermek amacıyla
siber saldırıları bir araç olarak kullanan kişi/gruplardır.\
**Motivasyon:** Farkındalık yaratmak, protesto etmek, bir kurumun
itibarını zedelemek, mesajı görünür kılmak.\
**Neden önemli?** Hedef seçimi çoğu zaman "sembolik"tir; amaç her zaman
maddi kazanç değildir.\
**Örnekler :**

-   Protesto amacıyla bir web sitesine aşırı istek göndererek kısa
    süreli erişim sorununa yol açma girişimi.

-   Çevresel bir felakete neden olduğu iddia edilen kurgusal **Mavi
    Deniz Petrol A.Ş.** firmasının web sitesini protesto amacıyla
    hackleyip ana sayfaya bildiri koyan grup.\
    **Nerede görülür?** Duyuru yayınlama, web sitesi görünümünü
    değiştirme (**defacement**), kampanya dönemlerinde DDoS
    girişimleri.\
    **CIA bağlantısı:** Hacktivist eylemler çoğunlukla
    **Erişilebilirliği (Availability)** hedef alır; defacement gibi
    durumlarda **Bütünlük (Integrity)** de etkilenebilir.

### **2.1.3 Siber Suç Örgütleri**

**Kısa tanım:** Tamamen profesyonel, organize ve yüksek teknik beceriye
sahip; çoğu zaman "şirket" gibi rol paylaşımıyla çalışan gruplardır.\
**Motivasyon:** Finansal kazanç.\
**Neden önemli?** Fidye yazılımları (ransomware) ve bankacılık truva
atları gibi en yıkıcı saldırıların arkasında sıkça bu gruplar bulunur.
Süreçleri "iş modeli" gibi yönetebilirler (kimlik avı ekipleri, zararlı
yazılım dağıtım ekipleri, para aklama ağları vb.).\
**Örnekler:**

-   Sahte kargo bildirimi e-postasıyla giriş bilgisi toplayıp ele
    geçirilen hesaplarla dolandırıcılık yapılması.

-   Kurgusal **Delta Finans Grubu** veritabanını şifreleyip açmak için
    **100 Bitcoin** fidye talep eden organize grup.\
    **Nerede görülür?** Fidye yazılımı kampanyaları, kimlik bilgisi
    hırsızlığı, finansal dolandırıcılık, hesap ele geçirme.

### **2.1.4 Devlet Destekli Gruplar ve APT (Gelişmiş Kalıcı Tehdit)**

**Kısa tanım:** Ulus devletlerce finanse edilebilen; istihbarat toplama
veya stratejik/kritik altyapılara zarar verme hedefiyle hareket eden en
tehlikeli aktörlerdir.\
**Motivasyon:** Casusluk, stratejik üstünlük, siber savaş.\
**Karakteristik:** Hedef sistemde çok uzun süre fark edilmeden kalabilme
(**kalıcılık/persistence**); sabırlı ve çok aşamalı ilerleme.\
**Örnek:** Tek seferlik hızlı saldırı yerine aylar boyunca bir ağda fark
edilmeden kalıp veri toplama.\
**Nerede görülür?** Kritik altyapılar, kamu hizmetleri, savunma sanayi,
büyük ölçekli kurumlar; uzun süreli sızma ve keşif faaliyetleri.\
Bu modülde APT'yi kavram düzeyinde tanıyoruz; "kalıcılık" ve "yanal
hareket" gibi kavramlar ağ güvenliği/olay müdahalesi içeriklerinde daha
anlamlı hale gelir. Bazı programlarda devlet destekli tehditler ve sızma
yöntemleri, **Threat Intelligence** gibi ileri bölümlerde daha derin
incelenir.

### **2.1.5 İç Tehditler (Insider Threats)**

**Kısa tanım:** Sisteme yasal erişimi olan çalışanlar veya eski
personelden kaynaklanan tehditlerdir. İç tehditler ikiye ayrılır:

#### **a) Kasıtlı iç tehdit**

**Tanım:** Yetkili bir kişinin bilerek zarar vermesi veya bilgiyi kötüye
kullanması.\
**Neden önemli?** İçeriden gelen kişi çoğu zaman erişim yetkilerine
sahiptir; saldırıyı kolaylaştırabilir.\
**Örnekler :**

-   Ayrılmadan önce erişebildiği dosyaları izinsiz kopyalayan çalışan.

-   İntikam amacıyla sistemi bozan personel.\
    **Nerede görülür?** Yetki kötüye kullanımı, veri sızdırma, sabotaj.

#### **b) Kazara oluşan iç tehdit**

**Tanım:** Kötü niyet olmadan hata/ihmal sonucu güvenlik sorunu
doğması.\
**Neden önemli?** En yaygın güvenlik kaynaklarından biri **insan
hatasıdır**.\
**Örnekler :**

-   Yanlış kişiye hassas dosyayı e-postalamak veya yanlış paylaşım izni
    vermek.

-   Güvenlik farkındalığı zayıf olduğu için şifresini başkasına
    kaptırmak.

-   Yanlışlıkla kritik bir veriyi silmek.\
    **Nerede görülür?** Yanlış paylaşım ayarları, kimlik avına kanma,
    yanlış yapılandırma, hatalı silme.\
    **Risk bağlantısı:** İç tehditlerde risk sadece teknik zafiyetlerden
    değil; **süreç, eğitim ve yetkilendirme** eksiklerinden de doğar.

## **3) Yaygın Siber Saldırı Türleri (Başlangıç Seviyesi)**

Bu bölümde her saldırıyı üç soru üzerinden düşünün:

-   **Hangi varlık hedefleniyor?** (veri / sistem / hizmet)

-   **CIA'dan hangisi etkileniyor?** (Gizlilik / Bütünlük /
    Erişilebilirlik)

-   **Hangi zafiyetler sık kullanılıyor?** (zayıf parola, yanlış izin,
    güncellenmemiş sistem, kandırılan kullanıcı vb.)

### **3.1 Zararlı Yazılım (Malware)**

**Tanım:** "Malicious Software" ifadesinin kısaltması olan **malware**,
sisteme zarar vermek, veri çalmak, kontrol sağlamak veya izinsiz erişim
elde etmek için tasarlanmış yazılımların genel adıdır.\
**Neden önemli?** Malware; **gizlilik** (veri çalma), **bütünlük** (veri
değiştirme) ve **erişilebilirlik** (sistemi kilitleme) üzerinde etkili
olabilir.\
**Örnek :** Ücretsiz gibi görünen bir program kurulduktan sonra arka
planda istenmeyen işlemler yapabilir.\
**Nerede görülür?** Sahte uygulamalar, şüpheli eklentiler, zararlı
ekler, korsan yazılımlar.\
**İpucu:** Modül 1'de geçen **payload**, saldırının hedefte asıl etkiyi
üreten kısmıdır; malware çoğu zaman bu payload rolünü üstlenir.\
Zararlıların işletim sistemi seviyesindeki etkileri ve savunma
yöntemleri **Modül 4: İşletim Sistemi ve Yazılım Güvenliği** kapsamında
ele alınacaktır.

#### **3.1.1 Virüs (Virus)**

**Tanım:** Genellikle bir dosyaya/uygulamaya bulaşır; o dosya
çalıştırıldığında etkinleşir ve yayılabilir. Çoğu senaryoda insan
müdahalesi (dosyanın açılması/çalıştırılması) gerekir.\
**Neden önemli?** Dosya bütünlüğünü bozabilir, veri kaybı ve performans
sorunları doğurabilir.\
**Örnek :** Şüpheli bir dosya açıldıktan sonra başka dosyalarda
bozulmalar görülmesi.\
**Nerede görülür?** Dosya paylaşımı, taşınabilir bellekler, e-posta
ekleri.

#### **3.1.2 Solucan (Worm)**

**Tanım:** İnsan müdahalesine gerek duymadan ağ üzerinden bir
bilgisayardan diğerine kendi kendine kopyalanabilen zararlı yazılımdır.\
**Neden önemli?** Hızla yayılıp ağ trafiğini şişirerek hizmetleri
aksatabilir.\
**Örnek :** Güncellenmemiş cihazları tarayıp bulduğunda kendini
kopyalayan bir yazılım.\
**Nerede görülür?** Ağ zafiyetlerinden yararlanan otomatik yayılım
senaryoları.

#### **3.1.3 Truva Atı (Trojan)**

**Tanım:** Yararlı/masum görünen bir program gibi davranıp arka planda
zararlı iş yapan yazılımdır; bazı türleri sisteme **arka kapı
(backdoor)** bırakabilir.\
**Neden önemli?** Kullanıcı güvenini hedefler; kurbanın
kurmasına/çalıştırmasına ihtiyaç duyabilir.\
**Örnek :** "PDF dönüştürücü" gibi görünen bir programın arka planda
sisteme kapı açması.\
**Nerede görülür?** Sahte yazılımlar, crack'li programlar, sahte
güncelleme pencereleri.

#### **3.1.4 Fidye Yazılımı (Ransomware)**

**Tanım:** Kurbanın dosyalarını şifreleyerek veya sistemi kilitleyerek
erişimi engeller; erişimi geri vermek için ödeme talep edebilir.\
**Neden önemli?** Doğrudan **erişilebilirliği** hedef alır; bazı
senaryolarda "veri sızdırma tehdidi" ile **gizlilik** boyutu da
eklenebilir.\
**Örnek :** Belgeler açılamaz hale gelir ve ekranda "erişimi geri almak
için ödeme" mesajı belirir.\
**Nerede görülür?** Zayıf yedekleme, güncellenmemiş sistemler, kullanıcı
hatasıyla çalıştırılan ekler.

#### **3.1.5 Casus Yazılım (Spyware)**

**Tanım:** Kullanıcının haberi olmadan bilgi toplayan yazılımlardır.
Bazı türleri **klavye vuruşlarını kaydeden (keylogger)** bileşenler
içerebilir; hatta ekranı veya kamerayı gizlice izlemeye yönelik
davranışlar sergileyebilir.\
**Neden önemli?** Öncelikle **gizliliği** tehdit eder; uzun süre fark
edilmeden çalışabilir.\
**Örnek :** Gereksiz izinler isteyen bir uygulamanın arka planda veri
göndermesi.\
**Nerede görülür?** Şüpheli uygulamalar, istenmeyen tarayıcı
eklentileri.

**Dikkat:** Bu modül saldırı türlerini kavramsal olarak açıklar; savunma
detayları ileri modüllerde derinleşir. Ancak temel prensip değişmez:
**güncelleme**, **en az ayrıcalık** ve **kullanıcı farkındalığı** riski
belirgin biçimde azaltır.

### **3.2 Sosyal Mühendislik Saldırıları**

**Tanım:** Sistemsel açıklardan ziyade insan psikolojisindeki
zayıflıkları (**güven, korku, acele**) kullanan; kişiyi bilgi vermeye,
işlem yapmaya veya bir bağlantıya tıklamaya yönlendiren manipülasyon
teknikleridir. "İnsan hackleme" olarak da anılır.\
**Neden önemli?** En iyi teknik altyapı bile kullanıcı kandırılırsa
aşılabilir.\
**Örnek :** "Hesabınız kapanacak, hemen doğrulayın" mesajıyla panik
yaratılması.\
**Nerede görülür?** E-posta, SMS, telefon aramaları, sosyal medya
mesajları.

#### **3.2.1 Phishing (Oltalama --- E-posta ile kimlik avı)**

**Tanım:** E-posta yoluyla güvenilir bir kurum (banka, sosyal medya,
destek ekibi) gibi davranarak kullanıcıdan şifre/kimlik bilgisi istemek
veya sahte bir giriş sayfasına yönlendirmektir.\
**Örnekler :**

-   "Fatura görüntülemek için giriş yapın" içerikli sahte e-posta ve
    sahte giriş sayfası.

-   <security@example.net> adresinden gelmiş gibi görünen "Hesabınız
    askıya alındı, hemen giriş yapın" içerikli sahte e-posta.\
    **Neden önemli?** Hesap ele geçirme, veri sızıntısı ve finansal
    kayıp doğurabilir.

#### **3.2.2 Vishing (Telefon ile kimlik avı)**

**Tanım:** Telefon görüşmesi üzerinden güven kazanıp bilgi almaya
çalışmaktır.\
**Örnek :** "Destek ekibiyim, doğrulama kodunu söyleyin" şeklinde
aramalar.\
**Neden önemli?** Sesli iletişim güveni hızlı oluşturur ve kişiyi "anlık
karar"a itebilir.

#### **3.2.3 Smishing (SMS ile kimlik avı)**

**Tanım:** SMS üzerinden sahte link veya yönlendirmeyle bilgi
toplama/giriş yaptırma girişimidir.\
**Örnek :** "Kargonuz teslim edilemedi, linkten adres güncelleyin"
SMS'i.\
**Neden önemli?** Mobilde linke tıklama davranışı daha "hızlı ve
düşünmeden" gerçekleşebilir.

**İleri referans (Modül 3):** Sosyal mühendislik çoğu zaman parolayı
veya doğrulama kodunu hedefler. Parola güvenliği ve MFA bu saldırıların
etkisini azaltmada kritik rol oynar.

### **3.3 Kaba Kuvvet (Brute Force) Saldırıları**

**Tanım:** Doğru şifre/anahtar/PIN bulunana kadar çok sayıda
kombinasyonu deneme-yanılma ile denemektir.\
**Neden önemli?** Zayıf, tahmini kolay veya tekrar kullanılan şifreler
teknik açık olmasa bile hesapların ele geçirilmesine yol açabilir.\
**Örnek :** "123456", "şifre123" gibi sık kullanılan parola listeleriyle
otomatik giriş denemeleri.\
**Nerede görülür?** Giriş ekranları, uzaktan erişim servisleri, web
panelleri.\
Modül 1'deki "**Zayıf şifre = zafiyet**" denklemi burada doğrudan
karşımıza çıkar.\
Koruma yöntemleri Modül 3: Kimlik ve Hesap Güvenliği'nde ele
alınacaktır.

### **3.4 DoS ve DDoS Saldırıları**

**Tanım:** Bir hizmetin kaynaklarını (işlemci, bellek, bant genişliği)
tüketerek onu erişilemez hale getirmeyi amaçlayan hizmet engelleme
saldırılarıdır.

-   **DoS (Denial of Service):** Tek bir kaynaktan veya sınırlı
    kaynaktan yapılan saldırı.

-   **DDoS (Distributed DoS):** Dünya genelinde çok sayıda ele
    geçirilmiş cihazdan aynı anda yapılan saldırı. Bu cihaz ağlarına
    **botnet** denir.

**Neden önemli?** Modül 1'deki CIA üçlüsünün **Erişilebilirlik
(Availability)** ilkesini doğrudan hedef alır. Hizmet kesintisi iş kaybı
ve itibar kaybına yol açabilir.\
**Örnek :** Bir web sitesine aynı anda çok sayıda istek gönderildiğinde
sitenin yanıt veremez hale gelmesi.\
**Dikkat (CIA bağlantısı):** DDoS çoğunlukla **gizlilik** ya da
**bütünlük** değil, **erişilebilirlik** problemidir.

## **4) Basit Saldırı Senaryolarını Kavramsal Çözümleme (Teorik)**

Bu bölüm "nasıl yapılır?" düzeyinde operasyonel talimat vermez; olayları
doğru okumayı öğretir.

### **Senaryo çözümleme şablonu**

1.  **Hedef varlık:** Veri mi, sistem mi, hizmet mi?

2.  **Aktör:** Kim olabilir? (script kiddie, suç grubu, iç tehdit vb.)

3.  **Zafiyet:** Neyden yararlanıldı? (zayıf parola, yanlış izin,
    güncellenmemiş sistem, kandırılan kullanıcı)

4.  **Yöntem:** Hangi saldırı türü? (phishing, brute force, malware,
    DDoS vb.)

5.  **Etki (CIA):** Gizlilik mi, bütünlük mü, erişilebilirlik mi
    etkilendi?

### **Mini senaryo 1** 

Bir çevrimiçi randevu hizmeti belirli saatlerde sık sık yanıt veremez
hale geliyor. İncelemede yoğun ve anormal trafik görülüyor.

-   **Varlık:** Hizmet

-   **Muhtemel yöntem:** DDoS

-   **Etki:** Erişilebilirlik

-   **Not:** CIA çerçevesinde bu bir "erişilebilirlik ihlali"dir.

### **Mini senaryo 2** 

Bir kullanıcı "hesabınız doğrulanmazsa kapanacak" e-postasına tıklayıp
giriş bilgilerini giriyor; kısa süre sonra hesabında izinsiz giriş
denemeleri başlıyor.

-   **Varlık:** Hesap ve hesap içindeki veri

-   **Muhtemel yöntem:** Phishing + hesap ele geçirme girişimi

-   **Etki:** Gizlilik riski (hesaba erişim) ve bütünlük riski
    (ayarların değiştirilmesi)

-   **Not:** Parola tekrarını önleme ve MFA'nın önemi Modül 3'te daha
    netleşir.

## **Terimler Sözlüğü**

-   **Threat Actor (Tehdit aktörü):** Saldırıyı yapan kişi/grup veya
    iç/dış unsur

-   **Script Kiddie:** Hazır araçlarla saldırı deneyen, teknik derinliği
    sınırlı kişi

-   **Hacktivist:** İdeolojik/sosyal mesaj amacıyla dijital eylem yapan
    kişi/grup

-   **Cybercrime Organization (Siber suç örgütü):** Maddi kazanç odaklı
    organize grup

-   **APT (Advanced Persistent Threat):** Belirli hedefe yönelik, uzun
    süreli ve karmaşık; "gelişmiş kalıcı tehdit" yaklaşımı

-   **Insider Threat (İç tehdit):** Kurum içinden gelen kasıtlı/kazara
    risk

-   **Malware:** Zararlı yazılımların genel adı

-   **Payload:** Saldırının hedefte asıl etkiyi (yıkıcı/zararlı işi)
    icra eden kod/bileşen

-   **Virus (Virüs):** Dosyaya bulaşıp, dosya çalıştırılınca
    etkinleşebilen zararlı yazılım

-   **Worm (Solucan):** Ağ üzerinden otomatik yayılabilen zararlı
    yazılım

-   **Trojan (Truva atı):** Masum görünüp arka planda zararlı iş yapan;
    bazen **backdoor** açabilen yazılım

-   **Backdoor (Arka kapı):** Güvenlik kontrollerini atlayarak sisteme
    girişi sağlayan gizli geçit

-   **Ransomware (Fidye yazılımı):** Verileri şifreleyip erişimi
    engelleyerek fidye talep eden malware türü

-   **Spyware (Casus yazılım):** Kullanıcıdan habersiz bilgi toplayan
    yazılım

-   **Keylogger:** Klavyede basılan tuşları kaydedip saldırgana ileten
    casus yazılım bileşeni

-   **Social Engineering (Sosyal mühendislik):** İnsanların zayıf
    noktalarını kullanarak bilgi/erişim elde etme

-   **Phishing/Vishing/Smishing:** E-posta/telefon/SMS üzerinden
    oltalama

-   **Brute Force:** Deneme-yanılma ile parola/anahtar/PIN kırma yöntemi

-   **DoS / DDoS:** Hizmeti tekil / dağıtık kaynaklarla erişilemez kılma

-   **Botnet:** Saldırganın ele geçirip uzaktan yönettiği "zombi"
    cihazlar ağı

## **Modül Değerlendirme Soruları** 

Aşağıdaki sorular, modül amaçlarına doğrudan bağlı ve "üzerine düşülmesi
gereken" kritik kavramları ölçer. Her soru için doğru cevap ve kısa
gerekçe verilmiştir.

**1) Tehdit aktörü kavramı en doğru hangi ifadeyi tanımlar?**\
A) Sadece bilgisayar virüslerini üreten kişi\
B) Bir varlığa zarar verme potansiyeli olan durum\
C) Siber saldırıyı gerçekleştiren kişi/grup veya iç/dış unsur\
D) Yalnızca DDoS saldırısı yapan bot ağı\
**Doğru: C** --- Tehdit aktörü, saldırının arkasındaki özne/unsurdur.

**2) "Hazır araçlarla rastgele hedeflerde saldırı denemesi yapan ve
motivasyonu çoğunlukla merak/gösteriş olan" profil hangisidir?**\
A) Hacktivist\
B) Script Kiddie\
C) APT\
D) Kasıtlı iç tehdit\
**Doğru: B** --- Hazır script/kit kullanımı ve düşük teknik derinlik
ayırt edicidir.

**3) Aşağıdakilerden hangisi iç tehdit türü açısından doğru
eşleştirmedir?**\
A) Yanlış kişiye dosya göndermek → kasıtlı iç tehdit\
B) İntikam için sistemi bozmak → kazara iç tehdit\
C) Şirketten veri çalmak → kasıtlı iç tehdit\
D) Phishing e-postası almak → iç tehdit\
**Doğru: C** --- Veri çalma bilinçli kötüye kullanımdır (kasıtlı).

**4) "İnsan müdahalesine gerek duymadan ağ üzerinden kendi kendine
yayılabilen" zararlı yazılım hangisidir?**\
A) Virüs\
B) Worm (Solucan)\
C) Trojan\
D) Spyware\
**Doğru: B** --- Worm'lar ağ zafiyetlerini kullanarak otomatik
yayılabilir.

**5) Trojan'ı en iyi açıklayan ifade hangisidir?**\
A) Dosyaları şifreleyip fidye isteyen yazılım\
B) Masum görünüp arka planda sisteme kapı açabilen yazılım\
C) Sadece SMS ile gönderilen saldırı mesajı\
D) Hizmete aşırı trafik gönderme yöntemi\
**Doğru: B** --- Trojan "maske takar" ve bazen backdoor bırakır.

**6) Phishing, vishing ve smishing arasındaki temel ayrım nedir?**\
A) Hedeflenen sektör\
B) Kullanılan iletişim kanalı (e-posta/telefon/SMS)\
C) Kullanılan şifreleme algoritması\
D) Saldırının mutlaka malware içermesi\
**Doğru: B** --- Ayrım iletişim kanalına göredir.

**7) Sosyal mühendislik saldırılarında en sık kullanılan psikolojik
tetikleyicilerden biri değildir?**\
A) Güven\
B) Korku\
C) Acele/Aciliyet\
D) Donanım sıcaklığı\
**Doğru: D** --- Sosyal mühendislik insan psikolojisini hedefler;
donanım sıcaklığı bunun parçası değildir.

**8) Brute force saldırısı en çok hangi zafiyetten beslenir?**\
A) Zayıf/tahmini kolay parola veya PIN\
B) Yüksek bant genişliği\
C) Güçlü yedekleme politikası\
D) MFA kullanımı\
**Doğru: A** --- Deneme-yanılma, zayıf parolaları hızlı düşürür.

**9) DDoS saldırıları CIA üçlüsünden en çok hangisini hedef alır?**\
A) Gizlilik\
B) Bütünlük\
C) Erişilebilirlik\
D) Yetkilendirme\
**Doğru: C** --- Amaç hizmeti erişilemez kılmaktır.

**10) Aşağıdaki sıralamalardan hangisi "senaryo çözümleme" için en doğru
akışı verir?**\
A) Yöntem → Etki → Aktör → Varlık → Zafiyet\
B) Varlık → Aktör → Zafiyet → Yöntem → Etki (CIA)\
C) Etki → Yöntem → Varlık → Aktör → Zafiyet\
D) Zafiyet → Etki → Varlık → Yöntem → Aktör\
**Doğru: B** --- Önce neyin hedeflendiği, sonra kim, hangi açıklık,
hangi yöntem ve CIA etkisi değerlendirilir.

## **Bu Modülde Neler Öğrendik?**

-   Siber tehditlerin tek tip "hacker"dan ibaret olmadığını;
    **ideolojik, finansal ve stratejik motivasyonların** farklı aktör
    profilleri oluşturduğunu öğrendik.

-   **İç tehditlerin** (kasıtlı/kazara) en az dış saldırganlar kadar
    önemli risk kaynağı olabileceğini kavradık.

-   **Malware** kavramını ve temel türlerini (virüs, worm, trojan,
    ransomware, spyware; ayrıca backdoor/keylogger gibi alt kavramları)
    ayırt ettik.

-   Güvenlikte **insanın zayıf halka** olabildiğini; sosyal
    mühendisliğin güven--korku--acele gibi tetikleyicilerle çalıştığını
    gördük.

-   **Brute force** ve **DoS/DDoS** saldırılarının mantığını ve CIA
    üzerindeki tipik etkilerini (özellikle **erişilebilirlik**)
    ilişkilendirdik.

-   Basit olayları **aktör--zafiyet--yöntem--etki (CIA)** şablonuyla
    kavramsal olarak çözümleyebileceğimizi gördük.

-   Modül 1'deki kavramların bu modülde saldırı dünyasına bağlandığını;
    Modül 3'ün hesap güvenliğiyle bu riskleri azaltmaya odaklanacağını
    anladık.

**Modül 3 --- Kimlik, Hesap ve Kullanıcı Güvenliği (Parola, MFA ve
Dijital Kimlik)**

Bu modül, siber savunmanın en kritik "giriş kapısı" olan kullanıcı
kimliği ve hesapların nasıl korunacağını başlangıç seviyesinde,
sistematik biçimde ele alır. Dijital kimliğin nasıl temsil edildiği;
kimlik bildirimi (identification), kimlik doğrulama (authentication) ve
yetkilendirme (authorization) arasındaki farklar netleştirilir. Ardından
parola güvenliği (güçlü parola/passphrase, entropi, parola hijyeni),
hesap ele geçirme riskleri (brute force, dictionary attack, credential
stuffing, phishing) ve bunlara karşı en etkili katmanlardan biri olan
Çok Faktörlü Kimlik Doğrulama (MFA) açıklanır. Önceki modüldeki saldırı
türleriyle (özellikle phishing ve brute force) doğrudan bağ kurulur; bir
sonraki modülde ise bu kimlik mekanizmalarının üzerinde çalıştığı
ortamın (işletim sistemi, yazılım ve tarayıcı güvenliği) nasıl
güçlendirileceği incelenecektir.

## **Modül Amaçları**

Bu modülü tamamlayan bir öğrenci:

-   Dijital kimlik, kimlik bildirimi (identification), kimlik doğrulama
    (authentication) ve yetkilendirme (authorization) kavramlarını ayırt
    edip ilişkilendirebilir.

-   Parola güvenliğinin temel prensiplerini açıklayabilir; güçlü
    parola/passphrase tasarlayabilir ve "parola entropisi" kavramını
    yorumlayabilir.

-   Brute force, dictionary attack, credential stuffing ve phishing gibi
    saldırıların hesap güvenliğini nasıl etkilediğini analiz edebilir.

-   MFA yöntemlerini (SMS/çağrı OTP, uygulama tabanlı TOTP, donanım
    güvenlik anahtarı, biyometrik) tanıyıp artı/eksi yönlerini
    değerlendirebilir.

-   Parola yöneticilerinin çalışma prensibini, "ana parola (master
    password)" mantığını ve güvenlik avantajlarını savunabilir.

-   Hesap güvenliği için uygulanabilir bir "asgari güvenlik kontrol
    listesi" oluşturup basit senaryolara uyarlayabilir.

## **1) Büyük Resim: Neden Kimlik ve Hesap Güvenliği Kritik?**

Önceki modülde tehdit aktörlerinin en sık hedef aldığı alanlardan
birinin kullanıcı hesapları olduğunu gördünüz. Bunun temel nedeni şudur:
**Hesaplar erişimin anahtarıdır.** Bir hesabın ele geçirilmesi,
saldırgana sistem içinde "meşru kullanıcı gibi" hareket etme imkânı
verir. Bu durum, saldırganın ağ içinde fark edilmeden ilerlemesini
(**lateral movement / yanal hareket**) kolaylaştırabilir.

**İnsan faktörü** de bu resmi büyütür: zayıf parola seçmek, aynı
parolayı birden fazla yerde kullanmak, doğrulama kodunu paylaşmak,
"aceleyle linke tıklamak" gibi davranışlar teknik bir açık olmadan bile
güvenlik zafiyeti yaratabilir.

-   **Geri referans (Modül 2):** Phishing/vishing/smishing ve brute
    force gibi saldırılar doğrudan hesapları hedef alır.

-   **İleri referans (Modül 4):** Hesap güvenliği güçlü olsa bile,
    güncellenmemiş yazılımlar veya kötü yapılandırılmış işletim
    sistemleri yeni zafiyetler doğurabilir. Bir sonraki modülde "güvenli
    yapılandırma + güncelleme" yaklaşımının hesap güvenliğini nasıl
    tamamladığını göreceksiniz.

**İpucu:** Kimlik güvenliğini "tek bir önlem" gibi değil, **katmanlı
savunma (defense in depth)** yaklaşımının bir parçası olarak düşünün.
MFA, parola hijyeni, yetki sınırlandırma ve izleme/uyarılar birlikte
çalıştığında gerçek etki ortaya çıkar.

## **2) Dijital Kimlik ve Temel Kavramlar**

### **2.1 Dijital Kimlik (Digital Identity)**

-   **Kısa tanım:** Bir kişi/sistem/servisin dijital ortamda "kim
    olduğunu" temsil eden veri ve özelliklerin bütünüdür (kullanıcı adı,
    e-posta, cihaz kimliği, rol bilgisi gibi).

-   **Neden önemli?** Sistemlerin "kime, neye, ne kadar yetki
    verileceği" kararının temelidir.

-   **Basit örnek :** Bir e-öğrenme sitesinde ogrenci_ayse hesabı
    yalnızca ders içeriklerini görür; egitmen_mert hesabı içerik
    ekleyebilir.

-   **Gerçek hayatta nerede görülür?** E-posta hesapları, sosyal medya,
    bankacılık uygulamaları, üniversite bilgi sistemleri, şirket içi
    paneller.

**İpucu:** Dijital kimliği "kimlik kartı" gibi düşünebilirsiniz. Ancak
kimlik kartını göstermek yetmez; sistemin, o kimliğin gerçekten size ait
olduğunu **doğrulaması** gerekir.

### **2.2 Kimlik Bildirimi (Identification), Kimlik Doğrulama (Authentication) ve Yetkilendirme (Authorization)**

Bu üç kavram sık karıştırılır; oysa teknik işleyişleri farklıdır:

#### **2.2.1 Kimlik Bildirimi (Identification)**

-   **Kısa tanım:** Kullanıcının sisteme "Ben kimim?" demesidir.
    Genellikle kullanıcı adı veya e-posta ile yapılır.

-   **Neden önemli?** Sisteme hangi kimliğin işlem yaptığını söylemeden
    doğrulama başlatılamaz.

-   **Basit örnek :** Giriş ekranına <mert@example.com> yazmak.

-   **Gerçek hayatta nerede görülür?** Kullanıcı adı/e-posta/telefon
    numarası girilen tüm giriş ekranları.

#### **2.2.2 Kimlik Doğrulama (Authentication)**

-   **Kısa tanım:** Sistemin "Gerçekten iddia ettiğin kişi misin?"
    sorusuna kanıt istemesidir.

-   **Neden önemli?** Zayıf doğrulama, saldırganın başkasının hesabına
    "o kişiymiş gibi" girmesine yol açar.

-   **Basit örnek :** Kullanıcı adı + parola ile giriş yapmak.

-   **Gerçek hayatta nerede görülür?** Parola, SMS kodu, doğrulayıcı
    uygulama kodu, parmak izi/yüz tanıma.

**Kimlik doğrulama faktörleri (3 temel kategori):**

-   **Bildiğin bir şey:** parola, PIN

-   **Sahip olduğun bir şey:** telefon, donanım güvenlik anahtarı

-   **Olduğun bir şey:** parmak izi, yüz, iris

Bu sınıflandırma, MFA'nın mantığını anlamanın temelidir.

#### **2.2.3 Yetkilendirme (Authorization)**

-   **Kısa tanım:** Doğrulama sonrası "Girdiysen ne yapmaya yetkilisin?"
    sorusunun cevabıdır.

-   **Neden önemli?** Doğrulama doğru olsa bile yetkilendirme yanlışsa
    gereğinden fazla erişim (veri sızıntısı, izinsiz değişiklik)
    oluşabilir.

-   **Basit örnek :** Bir öğrencinin "notları güncelleme" ekranını
    görmemesi; bu ekranın sadece öğretmene açık olması.

-   **Gerçek hayatta nerede görülür?** Yönetici paneli yetkileri, dosya
    paylaşım izinleri, sistem rolleri.

**Akademik benzetme : Üniversite kütüphanesi**

-   Öğrencinin numarasını söylemesi → **Kimlik Bildirimi**

-   Öğrenci kartını göstermesi → **Kimlik Doğrulama**

-   Sadece "Genel Okuma" salonuna izin verilip "Nadir Eserler" odasına
    izin verilmemesi → **Yetkilendirme**

**Dikkat:** Kimlik doğrulama "kapıdan içeri girmek", yetkilendirme
"binanın hangi odalarına girebildiğin" gibidir. Önceki modüldeki CIA
çerçevesinde, hatalı yetkilendirme çoğu zaman **gizlilik** ve
**bütünlük** ihlallerine yol açar.

### **2.3 En Az Ayrıcalık İlkesi (Least Privilege) ve RBAC**

-   **Kısa tanım:** Bir kullanıcıya/sisteme yalnızca işini yapmak için
    gereken **minimum** yetkilerin verilmesidir.

-   **Neden önemli?** Hesap ele geçirilse bile saldırganın
    yapabileceklerini sınırlar; riskin "etki" kısmını düşürür (risk
    mantığıyla ilişkilidir).

-   **Basit örnek :** Stajyer hesabına "kullanıcı oluşturma/silme"
    yetkisi verilmemesi.

-   **Gerçek hayatta nerede görülür?** Rol tabanlı erişim kontrolü
    (**RBAC**), dosya/dizin izinleri, yönetici haklarının
    sınırlandırılması.

-   **Geri referans (Modül 1):** Risk (olasılık × etki) açısından, en az
    ayrıcalık ilkesi özellikle **etkiyi** azaltır.

-   Bir sonraki modülde, işletim sistemi ve uygulama yapılandırmalarında
    "gereksiz yetkileri kapatma" yaklaşımıyla least privilege'in nasıl
    teknik olarak desteklendiğini göreceksiniz.

## **3) Parola Güvenliği: Temel İlkeler, Passphrase ve Entropi**

### **3.1 Parola Nedir ve Neden Zafiyet Olabilir?**

-   **Kısa tanım:** Hesaba girişte kullanılan gizli ifadedir
    (parola/PIN).

-   **Neden önemli?** En yaygın doğrulama yöntemi olduğu için
    saldırganların ilk denediği kapıdır.

-   **Basit örnek :** "123456" gibi parolaların çok hızlı tahmin
    edilebilmesi.

-   **Gerçek hayatta nerede görülür?** Web hesapları, bilgisayar
    oturumları, modem arayüzleri, e-posta.

-   **Geri referans (Modül 2):** Brute force saldırıları parolayı
    hedefler; sosyal mühendislik ise parolayı kullanıcıdan "aldırmaya"
    çalışır.

-   **Dikkat:** "Parolam çok güçlü, MFA'ya gerek yok" düşüncesi
    yanlıştır; çünkü phishing gibi saldırılar parolayı **tahmin
    etmeden** çalabilir.

### **3.2 Güçlü Parola ve Parola İfadesi (Passphrase)**

-   **Kısa tanım:**

    -   **Güçlü parola:** Tahmin edilmesi zor, yeterince uzun ve
        **benzersiz** parola.

    -   **Passphrase:** Birden fazla kelimeden oluşan daha uzun ifade;
        genellikle daha akılda kalıcı ve dayanıklıdır.

-   **Neden önemli?** Özellikle **uzunluk**, parola tahmin saldırılarına
    karşı direnci ciddi artırır. NIST'in rehberleri de kullanıcıların
    uzun parolalar/passphrase'ler kullanabilmesini destekleyecek şekilde
    doğrulayıcıların uzun girişlere izin vermesini vurgular.

-   **Basit örnek :**

    -   Zayıf: Mert123

    -   Daha güçlü: Mavi-Kitap-Bulut-78 (uzun ve daha yüksek çeşitlilik)

-   **Gerçek hayatta nerede görülür?** Kurumsal parola politikaları,
    kritik sistem girişleri, e-posta hesapları.

### **3.3 Parola Entropisi (Entropy) ve "Tahmin Edilemezlik"**

-   **Kısa tanım:** **Entropi**, parolanın rastgelelik/tahmin
    edilemezlik derecesini ifade eden bir güç ölçüsüdür.

-   **Neden önemli?** Entropisi düşük parolalar, saldırganların tahmin
    listelerinde (sözlükler, en sık kullanılan parolalar listeleri) yer
    alır ve hızlı kırılabilir.

-   **Basit örnek :** P\@ssw0rd123 karmaşık görünse bile çok yaygın
    kalıplara benzediği için zayıf olabilir; buna karşılık rastgele
    seçilmiş birkaç kelime + sayı içeren bir passphrase daha dayanıklı
    olma eğilimindedir.

-   **Gerçek hayatta nerede görülür?** Parola politikaları, parola
    denetleyicileri, parola kırma denemelerinde kullanılan "sık parola
    listeleri".

**İpucu:** Güvenlikte çoğu zaman **uzunluk** çok değerlidir. Çok kısa
"aşırı karmaşık" bir parola yerine daha uzun bir passphrase çoğu
senaryoda daha iyi dayanıklılık sunar.

### **3.4 Parola Hijyeni: "Ne Yapmalıyım?"**

Aşağıdaki alışkanlıklar başlangıç seviyesinde uygulanabilir ve yüksek
etkilidir:

1.  **Her hesap için benzersiz parola kullanın.**

-   **Neden önemli?** Bir sızıntıda ortaya çıkan parola, başka
    platformlarda otomatik denenebilir (credential stuffing).

2.  **Parola yöneticisi (Password Manager) kullanmayı değerlendirin.**

-   **Kısa tanım:** Parolaları şifreli bir kasada saklayan ve her site
    için güçlü parola üreten araçlar.

-   **Neden önemli?** "30 hesap → 30 farklı güçlü parola" yönetimini
    pratik hale getirir.

-   **Basit örnek :** Kullanıcı yalnızca bir **ana parola (master
    password)** ezberler; diğer parolalar kasada saklanır.

3.  **Güvenlik sorularını da parola gibi düşünün.**

-   **Neden önemli?** "Annenizin kızlık soyadı" gibi bilgiler sosyal
    mühendislikle tahmin edilebilir.

-   **Basit örnek :** Güvenlik sorusuna gerçek cevap yerine rastgele bir
    ifade belirleyip kasada saklamak.

4.  **Parola paylaşmayın; yazılı notlara dikkat edin.**

-   **Neden önemli?** İç tehdit (kasıtlı/kazara) riskini artırır (önceki
    modülle bağlantılı).

-   **Basit örnek :** Parolayı monitöre yapıştırmak.

## **4) Hesap Ele Geçirme Saldırıları: Nasıl Çalışır?**

### **4.1 Brute Force (Kaba Kuvvet)**

-   **Kısa tanım:** Doğru parola/PIN'i bulana kadar çok sayıda deneme
    yapmak.

-   **Neden önemli?** Zayıf parolalar, basit PIN'ler ve deneme sınırı
    olmayan sistemler risklidir.

-   **Basit örnek :** 4 haneli PIN için 0000--9999 aralığını sistematik
    denemek.

-   **Gerçek hayatta nerede görülür?** Giriş sayfaları, uzaktan erişim
    servisleri, yönetim panelleri.

**Savunmaya giriş (kavramsal):** deneme sınırı, hesap kilidi, hız
sınırlama (**rate limiting**) ve MFA brute force etkisini azaltır.

-   **İleri referans (Modül 4):** Rate limiting ve kilitleme gibi
    kontroller çoğu zaman uygulama/altyapı yapılandırması gerektirir;
    bir sonraki modülde "güvenli yapılandırma" ile bağını kuracağız.

### **4.2 Dictionary Attack (Sözlük Saldırısı)**

-   **Kısa tanım:** Parola tahmininde, olası parolaları "önceden
    hazırlanmış kelime/parola listelerinden" seçip denemektir.

-   **Neden önemli?** İnsanlar sık kullanılan kelimelere, kalıplara ve
    tahmin edilebilir varyasyonlara yönelir; bu listeler saldırgan için
    "kısa yol" olur.

-   **Basit örnek :** password, qwerty, admin, SehirAdi2026 gibi
    kalıpları ve küçük varyasyonlarını denemek.

-   **Gerçek hayatta nerede görülür?** Yaygın parola listeleriyle
    yapılan otomatik denemelerde.

Genellikle dictionary attack, parola tahmin saldırılarının (genel
anlamda kaba kuvvet/guessing yaklaşımının) pratik bir varyasyonu olarak
değerlendirilir.

### **4.3 Credential Stuffing (Kimlik Bilgisi Doldurma)**

-   **Kısa tanım:** Daha önce sızdırılmış kullanıcı adı--parola
    çiftlerinin başka sitelerde otomatik denenmesi.

-   **Neden önemli?** Parola tekrar kullanımı varsa tek bir sızıntı
    domino etkisi yaratır.

-   **Basit örnek :** Bir forum sitesindeki parolası sızan kişinin, aynı
    parola ile e-posta hesabının ele geçirilmesi.

-   **Gerçek hayatta nerede görülür?** Büyük veri ihlalleri sonrası
    toplu hesap ele geçirme dalgaları.

**Senaryo :** <kullanici@example.com> adresiyle bir foruma üye olan bir
kişi, forumun veri ihlali yaşamasıyla parola sızıntısına maruz kalır.
Saldırganlar aynı e-posta+parola ikilisini botlarla farklı hizmetlerde
dener. Bu davranış credential stuffing'in özüdür.

**İpucu:** Credential stuffing'in "yakıtı" **parola tekrar
kullanımıdır**. Bu yüzden "her hesap için benzersiz parola" kuralı
kritik bir savunmadır.

### **4.4 Phishing ile Hesap Ele Geçirme**

-   **Kısa tanım:** Sahte bir sayfa/mesajla kullanıcıdan giriş
    bilgilerini almak veya kullanıcıyı işlem yapmaya zorlamak.

-   **Neden önemli?** Parola ne kadar güçlü olursa olsun, kullanıcı
    kandırılıp parolasını saldırgana verirse hesap riske girer.

-   **Basit örnek :** "Hesabınız askıya alındı" e-postasıyla
    login.example.net gibi sahte bir giriş sayfasına yönlendirilip
    parolanın girilmesi.

-   **Gerçek hayatta nerede görülür?** E-posta oltalaması, SMS linkleri,
    sosyal medya mesajları, "destek ekibi" kılığında aramalar.

-   **Geri referans (Modül 2):** Phishing/vishing/smishing kanalları
    burada doğrudan "hesap ele geçirme" sonucuna bağlanır.

-   **İleri referans (Modül 4):** Tarayıcı güvenliği, güncelleme ve
    zararlı eklentiler gibi konular phishing sonrası riskleri
    büyütebilir; bir sonraki modülde bu bağlantıyı netleştireceğiz.

## **5) MFA: Hesap Güvenliğinin Çarpanı**

### **5.1 MFA Nedir?**

-   **Kısa tanım:** Giriş sırasında iki veya daha fazla doğrulama
    faktörü kullanılmasıdır (ör. parola + tek kullanımlık kod).

-   **Neden önemli?** Parola sızsa bile saldırganın giriş yapmasını
    zorlaştırır; özellikle phishing ve credential stuffing etkisini
    azaltır. CISA, MFA'nın hesap ele geçirmeyi azaltmada kritik bir
    kontrol olduğunu vurgular.

-   **Basit örnek :** Parola doğru girilse bile telefondaki doğrulayıcı
    uygulamanın ürettiği 6 haneli kod istenir.

-   **Gerçek hayatta nerede görülür?** E-posta sağlayıcıları, bankacılık
    uygulamaları, kurumsal paneller.

### **5.2 Yaygın MFA Yöntemleri**

#### **a) SMS/Çağrı ile OTP**

-   **Kısa tanım:** Telefona SMS veya arama ile gelen tek kullanımlık
    kod.

-   **Neden önemli?** Parola tek başına olmaktan daha güvenlidir; ancak
    en güçlü seçenek değildir.

-   **Basit örnek :** Girişte SMS ile gelen 482913 kodunu girmek.

-   **Gerçek hayatta nerede görülür?** Bazı banka doğrulamaları ve
    sosyal medya girişleri.

**Dikkat:** SMS tabanlı doğrulama, **SIM swapping (SIM
değişimi/taşıma)** gibi saldırılarla zayıflatılabilir; bu nedenle
mümkünse uygulama tabanlı doğrulayıcılar veya donanım anahtarları tercih
edilir. NIST, SMS temelli yaklaşımların risklerine özellikle dikkat
çekmiştir.

#### **b) Uygulama Tabanlı Doğrulayıcı (Authenticator App, TOTP)**

-   **Kısa tanım:** Telefonda çalışan uygulamanın zaman tabanlı tek
    kullanımlık kod üretmesi (TOTP).

-   **Neden önemli?** SMS kanalına bağlı bazı riskleri azaltır; daha
    kontrollü bir doğrulama sunar.

-   **Basit örnek :** Her 30 saniyede değişen kodu giriş ekranına
    yazmak.

-   **Gerçek hayatta nerede görülür?** Kurumsal hesaplar, e-posta
    hesapları, geliştirici platformları.

#### **c) Donanım Güvenlik Anahtarı (Hardware Security Key)**

-   **Kısa tanım:** USB/NFC gibi fiziksel bir cihazla doğrulama.

-   **Neden önemli?** Phishing'e karşı daha dirençli çözümler
    sağlayabilir.

-   **Basit örnek :** Girişte USB anahtarı takıp onay vermek.

-   **Gerçek hayatta nerede görülür?** Kritik kurumsal ve yönetici
    hesaplarında.

#### **d) Biyometrik Doğrulama (Biometrics)**

-   **Kısa tanım:** "Olduğun bir şey" faktörü; parmak izi/yüz gibi
    fiziksel özelliklerle doğrulama.

-   **Neden önemli?** Kullanım kolaylığı yüksektir; özellikle cihaz
    erişiminde etkilidir.

-   **Basit örnek :** Telefonda parmak izi ile kilit açma.

-   **Gerçek hayatta nerede görülür?** Mobil cihazlar, dizüstü
    bilgisayarlar, bazı kurumsal kimlik doğrulama akışları.

**İpucu:** MFA'nın amacı "kullanıcıyı yormak" değil, saldırgana ikinci
bir engel koymaktır. Parola ele geçirilse bile ikinci faktör saldırıyı
durdurabilir veya ciddi ölçüde zorlaştırabilir.

## **6) Parola Yöneticileri: Çalışma Prensibi ve Güvenlik Mantığı**

-   **Kısa tanım:** Parolaları şifreli bir kasada saklayan, her site
    için benzersiz ve güçlü parola üretmeye yardımcı olan yazılımlar.

-   **Neden önemli?** İnsan zihni çok sayıda güçlü parolayı hatırlamakta
    zorlanır; bu zorluk parola tekrar kullanımı gibi riskli davranışları
    tetikler.

-   **Basit örnek :** Kullanıcı yalnızca bir **ana parola (master
    password)** ezberler; tüm diğer parolalar kasa içinde saklanır ve
    gerektiğinde otomatik doldurulur.

-   **Gerçek hayatta nerede görülür?** Tarayıcı entegre parola kasaları,
    kurumsal parola yönetim çözümleri, bireysel parola kasası
    uygulamaları.

**Dikkat:** Ana parolanın (master password) güçlü olması kritiktir.
Çünkü kasa güvenliğinin temeli, bu tek parolanın tahmin edilemezliğine
dayanır. Burada Modül 3'teki **entropi + passphrase** mantığı doğrudan
devreye girer.

## **7) Hesap Güvenliği İçin Asgari Kontrol Listesi (Pratik Rehber)**

Aşağıdaki maddeler başlangıç seviyesinde uygulanabilir ve yüksek
etkilidir:

1.  **Benzersiz ve uzun parola/passphrase kullan.**

2.  **Parola tekrarını bırak;** mümkünse parola yöneticisi kullan.

3.  **MFA'yı etkinleştir** (tercihen uygulama tabanlı veya donanım
    anahtarı).

4.  **Kurtarma seçeneklerini güvenli tut:** kurtarma e-postası/telefonu
    güncel olsun; **recovery codes** güvenli yerde saklansın.

5.  **Şüpheli giriş uyarılarını ciddiye al:** beklenmeyen cihaz/konum
    uyarısında parola değiştir, oturumları kapat.

6.  **Yetkileri sınırla:** her yerde yönetici hesapla dolaşma; **least
    privilege** uygula.

7.  **Deneme sınırı / rate limiting** gibi kontrolleri destekle
    (kullanıcı olarak: hizmetlerin bu kontrolleri sunmasına önem ver).

-   **Geri referans (Modül 1):** Bu kontroller riskin hem olasılığını
    hem etkisini düşürür.

-   **İleri referans (Modül 4):** Güncelleme ve güvenli yapılandırma,
    kimlik güvenliğinin tamamlayıcı parçasıdır.

## **8) Kavramsal Senaryo Çözümleme**

**Senaryo şablonu (önceki modülle uyumlu):**

-   **Varlık:** Hesap mı, hizmet mi, veri mi?

-   **Aktör:** Kim olabilir?

-   **Zafiyet:** Ne kolaylaştırdı? (zayıf parola, parola tekrar
    kullanımı, MFA yokluğu, kullanıcı hatası)

-   **Yöntem:** Phishing mi, brute force mu, credential stuffing mi?

-   **Etki (CIA):** Gizlilik/bütünlük/erişilebilirlik nasıl etkilenir?

### **Mini Senaryo 1** 

Bir öğrenci, "hesabınız doğrulanmazsa kapanacak" başlıklı e-postaya
tıklayıp giriş bilgilerini giriyor. Ardından hesabında tanımadığı bir
cihaz oturumu görünüyor.

-   **Varlık:** Hesap ve içindeki veriler

-   **Muhtemel yöntem:** Phishing

-   **Zafiyet:** Sahte sayfayı ayırt edememe, MFA'nın etkin olmaması

-   **Etki (CIA):** Gizlilik riski (hesap içeriğine erişim), bütünlük
    riski (ayarların değişmesi)

### **Mini Senaryo 2** 

Bir kullanıcı aynı parolayı hem bir forumda hem de e-posta hesabında
kullanıyor. Forumda veri ihlali yaşandıktan sonra e-posta hesabına
farklı ülkelerden giriş denemeleri başlıyor.

-   **Varlık:** E-posta hesabı

-   **Muhtemel yöntem:** Credential stuffing

-   **Zafiyet:** Parola tekrar kullanımı

-   **Etki (CIA):** Gizlilik riski (iletilere erişim), bütünlük riski
    (hesap ayarlarının değiştirilmesi)

**Dikkat:** Bu senaryoların amacı "nasıl saldırı yapılır" öğretmek
değil; olayları doğru sınıflandırmayı ve doğru savunma refleksini
geliştirmektir.

## **Terimler Sözlüğü (Glossary)**

  **Terim**                           **Türkçe karşılığı / açıklama**
  ----------------------------------- ------------------------------------------------------------------------------------------------------
  Digital Identity                    Dijital kimlik; bir kişi/sistemin dijital ortamda kimliğini temsil eden veri ve özellikler bütünü
  Identification                      Kimlik bildirimi; "ben kimim?" beyanı (kullanıcı adı/e-posta girme gibi)
  Authentication                      Kimlik doğrulama; iddia edilen kimliğin kanıtlanması süreci
  Authorization                       Yetkilendirme; doğrulanan kullanıcının ne yapabileceğinin belirlenmesi
  Least Privilege                     En az ayrıcalık; yalnızca gerekli minimum yetkinin verilmesi
  RBAC (Role-Based Access Control)    Rol tabanlı erişim kontrolü; yetkilerin roller üzerinden yönetilmesi
  Lateral Movement                    Yanal hareket; ele geçirilen erişimle sistem içinde farklı kaynaklara ilerleme eğilimi
  Password                            Parola; hesap girişinde kullanılan gizli ifade
  Passphrase                          Parola ifadesi; çok kelimeli, uzun ve akılda kalıcı güçlü parola yaklaşımı
  Entropy                             Entropi; parolanın rastgelelik/tahmin edilemezlik derecesi
  Brute Force                         Kaba kuvvet; deneme-yanılma ile çok sayıda parola/PIN denemesi
  Dictionary Attack                   Sözlük saldırısı; önceden hazırlanmış parola/kelime listeleriyle tahmin denemesi
  Credential Stuffing                 Kimlik bilgisi doldurma; sızmış kullanıcı adı--parola çiftlerini başka sistemlerde otomatik deneme
  Phishing                            Oltalama; sahte iletişim/sayfalarla kullanıcıdan giriş bilgisi alma
  MFA (Multi-Factor Authentication)   Çok faktörlü kimlik doğrulama; en az iki bağımsız faktörle doğrulama
  OTP (One-Time Password)             Tek kullanımlık parola/kod; kısa süre geçerli doğrulama kodu
  TOTP (Time-based OTP)               Zaman tabanlı OTP; belli aralıklarla değişen doğrulama kodu
  Authenticator App                   Doğrulayıcı uygulama; TOTP üreten mobil uygulama
  Hardware Security Key               Donanım güvenlik anahtarı; fiziksel cihazla doğrulama sağlayan MFA yöntemi
  Biometrics                          Biyometri; parmak izi/yüz gibi fiziksel özelliklerle doğrulama
  SIM Swapping                        SIM değişimi/taşıma; numaranın saldırganın SIM'ine taşınmasıyla SMS kodlarının ele geçirilmesi riski
  Defense in Depth                    Katmanlı savunma; birden fazla güvenlik kontrolünün birlikte uygulanması
  Rate Limiting                       Hız sınırlama; çok sayıda denemenin kısa sürede yapılmasını engelleme yaklaşımı
  Recovery Codes                      Kurtarma kodları; hesabı kurtarmak için önceden alınan tek kullanımlık kodlar
  Master Password                     Ana parola; parola yöneticisi kasasına erişim sağlayan üst parola

## **Modül Değerlendirme Testi (10 Soru)**

Aşağıdaki soruların bazıları temel kavram kontrolü, bazıları ise senaryo
ve analiz odaklıdır.

### **1) Bir kullanıcının sisteme sadece e-posta adresini yazması hangi aşamadır?**

A\) Yetkilendirme\
B) Kimlik Bildirimi (Identification)\
C) Kimlik Doğrulama (Authentication)\
D) Şifreleme

**Doğru Cevap: B**\
**Açıklama:** Kullanıcı yalnızca "kim olduğunu iddia eder"; henüz kanıt
sunmaz.

### **2) Authentication ile Authorization arasındaki temel fark nedir?**

A\) Authentication "ne yapabileceğini", Authorization "kim olduğunu"
belirler\
B) Authentication "kim olduğunu", Authorization "ne yapabileceğini"
belirler\
C) İkisi aynı kavramdır\
D) Authorization sadece parolayla yapılır

**Doğru Cevap: B**\
**Açıklama:** Authentication kimliği doğrular; Authorization doğrulanan
kimliğin yetkilerini belirler.

### **3) "En az ayrıcalık (least privilege)" ilkesine en uygun örnek hangisidir?**

A\) Her kullanıcıya yönetici yetkisi vermek\
B) Tüm dosyaları herkese açık paylaşmak\
C) Kullanıcıya yalnızca işini yapmak için gerekli minimum yetkiyi
vermek\
D) Parolayı ekip içinde paylaşmak

**Doğru Cevap: C**\
**Açıklama:** Amaç, hesap ele geçirilse bile hasarı sınırlamaktır.

### **4) Aşağıdaki seçeneklerden hangisi credential stuffing'i en iyi tanımlar?**

A\) Bir hizmeti aşırı trafikle erişilemez kılmak\
B) Sızmış kullanıcı adı--parola çiftlerini başka sistemlerde otomatik
denemek\
C) Sahte bir sayfayla kullanıcıdan parola istemek\
D) Rastgele PIN denemek

**Doğru Cevap: B**\
**Açıklama:** Credential stuffing'in temelinde sızıntı + parola tekrar
kullanımı vardır.

### **5) Dictionary attack ile brute force arasındaki en doğru ilişki hangisidir?**

A\) Dictionary attack, brute force'un pratik bir varyasyonu olup önceden
hazırlanmış parola listelerini kullanır\
B) Dictionary attack sadece SMS kodlarını hedefler\
C) Brute force sadece sosyal mühendisliktir\
D) İkisi tamamen alakasızdır

**Doğru Cevap: A**\
**Açıklama:** Dictionary attack, olası parolaları "liste" üzerinden
dener; parola tahmin yaklaşımının bir türüdür.

### **6) "Parola entropisi" kavramı en doğru hangi ifadeyle açıklanır?**

A\) Parolanın kaç kez değiştirildiği\
B) Parolanın rastgelelik ve tahmin edilemezlik derecesi\
C) Parolanın hangi sitede kullanıldığı\
D) Parolanın şifreleme algoritması

**Doğru Cevap: B**\
**Açıklama:** Entropi, saldırganın tahmin işini zorlaştıran temel güç
ölçülerinden biridir.

### **7) Aşağıdaki senaryoda baskın risk hangi saldırıyla daha iyi açıklanır?**

"Bir kullanıcı, bir eğlence sitesindeki parolasını yıllardır değişmeden
kullanıyor. Daha sonra e-posta hesabında farklı ülkelerden giriş
denemeleri başlıyor."\
A) DoS\
B) Credential stuffing\
C) Worm\
D) DDoS

**Doğru Cevap: B**\
**Açıklama:** Sızıntı sonrası aynı kimlik bilgilerinin başka hizmetlerde
denenmesi credential stuffing'dir.

### **8) SMS tabanlı MFA'nın bazı durumlarda zayıflayabilmesinin önemli nedenlerinden biri hangisidir?**

A\) Parolanın çok uzun olması\
B) SIM swapping ile SMS doğrulama kodlarının ele geçirilebilmesi\
C) Tarayıcı önbelleğinin dolması\
D) Dosya izinlerinin yanlış ayarlanması

**Doğru Cevap: B**\
**Açıklama:** Numaranın saldırganın SIM'ine taşınması, SMS kodlarını
saldırganın almasına yol açabilir; bu yüzden daha güçlü yöntemler
önerilir.

### **9) "Sahip olduğun bir şey" doğrulama faktörüne en uygun örnek hangisidir?**

A\) Parola\
B) PIN\
C) Donanım güvenlik anahtarı\
D) Güvenlik sorusu cevabı

**Doğru Cevap: C**\
**Açıklama:** Donanım anahtarı fiziksel bir nesnedir; "sahiplik"
faktörüdür.

### **10) Aşağıdakilerden hangisi hem phishing hem de parola sızıntısı durumunda hesabı korumayı en iyi güçlendiren yaklaşımı temsil eder?**

A\) Aynı parolayı her yerde kullanmak\
B) Güçlü passphrase + MFA (tercihen uygulama/donanım) + kurtarma
kodlarını güvenli saklamak\
C) Parolayı not kâğıdına yazıp masada tutmak\
D) Şüpheli giriş uyarılarını önemsememek

**Doğru Cevap: B**\
**Açıklama:** Katmanlı savunma yaklaşımıyla parola + MFA + kurtarma
güvenliği birlikte risk azaltır.

## **Bu Modülde Neler Öğrendik?**

-   Dijital kimlik kavramını ve kimlik
    bildirimi--doğrulama--yetkilendirme ayrımını kurabildik.

-   Hesap ele geçirmenin neden "meşru kullanıcı gibi davranma" etkisi
    yarattığını ve bunun yanal hareketi kolaylaştırabildiğini öğrendik.

-   Güçlü parola/passphrase tasarlamanın mantığını; uzunluk,
    benzersizlik ve entropi ilişkisini kavradık.

-   Brute force, dictionary attack, credential stuffing ve phishing'in
    hesap güvenliğine etkilerini senaryo bazında analiz ettik.

-   MFA'nın çalışma mantığını ve doğrulama faktörlerini (bildiğin/sahip
    olduğun/olduğun) öğrendik; SMS tabanlı yöntemlerin sınırlılıklarını
    ve daha güçlü alternatifleri değerlendirdik.

-   Parola yöneticilerinin "şifreli kasa + ana parola" yaklaşımıyla
    parola hijyenini nasıl güçlendirdiğini öğrendik.

-   Uygulanabilir bir asgari hesap güvenliği kontrol listesi oluşturmayı
    öğrendik ve bunu risk azaltma mantığıyla ilişkilendirdik.

## **Modül 4 --- İşletim Sistemi, Yazılım ve İnternet/Tarayıcı Güvenliği (Güncelleme, Sıkılaştırma ve Güvenli Kullanım)**

Bu modül, kimlik ve hesap güvenliğinin (Modül 3) üzerinde çalıştığı
teknik zemini güvenli hale getirmeyi hedefler: işletim sistemi,
uygulamalar, uç nokta güvenlik kontrolleri ve web/tarayıcı kullanımı.
Güncelleme (patch) ve yama yönetimi, güvenli yapılandırma
(hardening/sıkılaştırma), antivirüs ve EDR gibi uç nokta koruma
yaklaşımları, lisanslı/güvenilir yazılım edinme, HTTPS ve SSL/TLS ile
şifreli iletişim, çerezler ve dijital ayak izi, tarayıcı eklentileri ve
indirme güvenliği bu dersin omurgasını oluşturur. Önceki modüllerdeki
risk mantığı (Modül 1) ve saldırı türleri (Modül 2) ile doğrudan bağ
kurularak, saldırganların pratikte çoğu zaman "güncellenmemiş yazılım +
yanlış yapılandırma + kullanıcı hatası" üçlüsünden faydalandığı
gösterilir. Bir sonraki modülde ise bu güvenli zeminin ağ üzerinde nasıl
genişletileceği; güvenli bağlantı, ağ temelleri ve iletişimin
korunmasında şifrelemenin rolü ele alınacaktır.

## **Modül Amaçları**

Bu modülü başarıyla tamamlayan bir öğrenci:

-   İşletim sistemi güvenliğinin temel bileşenlerini açıklayabilir; CIA
    (gizlilik--bütünlük--erişilebilirlik) ile ilişkilendirebilir.

-   Zafiyet (vulnerability), hata (bug), exploit ve patch/yama
    kavramlarının ilişkisini kurabilir; yama yönetiminin neden kritik
    olduğunu değerlendirebilir.

-   Güvenli yapılandırma (hardening/sıkılaştırma) yaklaşımını ve saldırı
    yüzeyi (attack surface) mantığını temel kontrollerle açıklayabilir.

-   Uç nokta (endpoint) güvenliği kapsamında geleneksel antivirüs ile
    EDR yaklaşımlarının kavramsal farklarını ayırt edebilir; APT ve
    polimorfizm gibi kavramların neden bu farkı önemli kıldığını
    yorumlayabilir.

-   Yazılım edinme/kurulum süreçlerindeki riskleri (korsan/crack'li
    yazılım, truva atı, backdoor, tedarik zinciri riski) tanımlayabilir
    ve güvenli edinme pratiklerini uygulayabilir.

-   İnternet ve tarayıcı güvenliğinde HTTP--HTTPS farkını, SSL/TLS'in
    rolünü, çerezlerin ve dijital ayak izinin etkisini, eklenti/izin
    yönetimini ve güvenli indirme alışkanlıklarını kullanabilir.

## **Ana İçerik**

### **1) Büyük Resim: "Güvenli Zemin" Neden Önemli?**

Önceki modüllerde, saldırıların çoğunun insan ve hesaplar üzerinden
başladığını gördünüz (Modül 2--3). Ancak saldırganın hedefte kalıcı etki
yaratması, çoğu zaman işletim sistemi ve yazılım katmanındaki açıklıklar
veya yanlış yapılandırmalar üzerinden gerçekleşir.

-   **Bu kavram, önceki bölümdeki risk mantığı ile ilişkilidir (Modül
    1):** Risk = olasılık × etki. Güncellenmemiş sistemler olasılığı
    artırır; aşırı yetkiler ve hatalı yapılandırmalar etkiyi büyütür.

-   **Bu kavram, önceki bölümdeki saldırı türleri ile ilişkilidir (Modül
    2):** Oltalama (phishing) kullanıcıyı "bir şey
    indirmeye/çalıştırmaya" ikna edebilir; zararlı yazılım (malware) bu
    sayede sisteme yerleşebilir.

-   **Bu kavram, önceki bölümdeki hesap güvenliği ile ilişkilidir (Modül
    3):** MFA güçlü olsa bile, cihazınıza bulaşan bir casus yazılım (ör.
    tuş kaydedici) parolanızı veya oturum bilgilerinizi riske atabilir.

-   **Bir sonraki modülde** ağ temellerine geçerken, bu güvenli zeminin
    ağ üzerinde nasıl tamamlandığını (güvenli Wi-Fi, güvenli bağlantı,
    temel ağ kontrolleri) göreceksiniz. Aynı zamanda HTTPS/TLS gibi
    şifreli iletişimin ağda nasıl bir koruma sağladığına "temel düzeyde"
    bağ kuracağız.

**Dikkat:** "Sadece güçlü parola yeter" yaklaşımı eksiktir. Güçlü
parola/MFA hesap girişini zorlaştırır; fakat cihazınız güncellenmemişse
veya tarayıcı eklentileri kontrolsüzse, hesap güvenliği dolaylı yoldan
zayıflayabilir.

### **2) İşletim Sistemi Güvenliğine Giriş**

#### **2.1 İşletim Sistemi (Operating System, OS) Nedir?**

-   **Kısa tanım:** Donanım ile kullanıcı/uygulamalar arasında köprü
    kuran; işlemci, bellek, disk ve ağ gibi kaynakları yöneten temel
    yazılımdır.

-   **Neden önemli?** Dijital varlıkların (veri ve sistemlerin) büyük
    kısmı OS üzerinde barınır. OS katmanındaki zafiyetler geniş etki
    doğurabilir (veri sızıntısı, sistem ele geçirme, hizmet kesintisi).

-   **Basit örnek :** Dosya izinleri verme, kullanıcı hesabı açma ve bir
    uygulamayı çalıştırma gibi işlemler OS tarafından yönetilir.

-   **Gerçek hayatta nerede görülür?** Windows, Linux dağıtımları,
    macOS; mobilde Android/iOS.

#### **2.2 Hata (Bug), Zafiyet (Vulnerability), Exploit ve Patch İlişkisi**

Bu dört kavram, güncelleme güvenliğini anlamanın temelidir.

-   **Bug (Hata) --- kısa tanım:** Yazılımın beklenmeyen şekilde
    davranmasına yol açan programlama hatası.

    -   **Neden önemli?** Her bug güvenlik açığı değildir; ancak bazı
        hatalar saldırganın işine yarayacak "zafiyete" dönüşebilir.

    -   **Basit örnek :** Bir uygulamanın belirli bir dosyayı açarken
        çökmesi.

    -   **Gerçek hayatta nerede görülür?** Uygulama çökmesi, beklenmeyen
        hata mesajları, kararsız çalışma.

-   **Vulnerability (Zafiyet) --- kısa tanım:** Bir bug'ın veya
    tasarım/konfigürasyon hatasının saldırgan tarafından istismar
    edilebilir hale gelmiş biçimi.

    -   **Neden önemli?** Zafiyet, tehdidin saldırıya dönüşmesini
        kolaylaştırır (Modül 1'deki risk yaklaşımı).

    -   **Basit örnek :** Bir belge görüntüleyicide, özel hazırlanmış
        bir dosya ile "uzaktan kod çalıştırma"ya izin veren açık.

    -   **Gerçek hayatta nerede görülür?** Güvenlik duyuruları, CVE
        kayıtları, üretici yamaları.

-   **Exploit --- kısa tanım:** Bir zafiyeti kullanarak istenmeyen bir
    sonucu (ör. yetki yükseltme, kod çalıştırma) elde etmeye yarayan
    yöntem/uygulama.

    -   **Neden önemli?** Zafiyetin pratikte "saldırıya dönüşmüş" halini
        temsil eder; bu yüzden yama gecikmesi kritik risk üretir.

    -   **Basit örnek :** Zafiyetli bir uygulamayı, özel hazırlanmış
        giriş verisiyle çalıştırıp kontrol dışı davranış oluşturmak.

    -   **Gerçek hayatta nerede görülür?** Saldırı raporları, güvenlik
        test senaryoları, zararlı kampanyalar.

-   **Patch (Yama) --- kısa tanım:** Üreticinin zafiyetleri kapatmak,
    hataları gidermek veya iyileştirme sağlamak için yayınladığı
    düzeltme.

    -   **Neden önemli?** Saldırganlar çoğu zaman yayımlanan yamaları
        analiz ederek zafiyetin nerede olduğunu hızlıca çıkarabilir.
        Yamalanmamış sistemler bu nedenle hedef olur.

    -   **Basit örnek :** Ofis yazılımında "uzaktan kod çalıştırma"
        açığını kapatan güncelleme; kullanıcı yüklemezse özel
        hazırlanmış bir belgeyle risk artar.

    -   **Gerçek hayatta nerede görülür?** Otomatik güncelleme
        bildirimleri, "yeniden başlat gerekli" uyarıları, kurumsal
        yamalama takvimleri.

**İpucu:** Güncelleme yalnızca "yeni özellik" değildir; çoğu zaman
görünmeyen ama kritik güvenlik düzeltmeleridir.

#### **2.3 Yama Yönetimi (Patch Management) Neden Kritik?**

-   **Kısa tanım:** OS ve uygulamalara gelen yamaların planlı biçimde
    uygulanması süreci.

-   **Neden önemli?** "Bilinen zafiyet" penceresi uzadıkça istismar
    olasılığı artar. Özellikle tarayıcı, ofis yazılımları ve işletim
    sistemi bileşenleri yüksek önceliklidir.

-   **Basit örnek :** Tarayıcınız için gelen güvenlik güncellemesini 2
    ay ertelemek; bu süre boyunca zararlı bir web sayfasının eski sürümü
    hedeflemesi.

-   **Gerçek hayatta nerede görülür?** Kurumlarda "aylık yama günü",
    acil güvenlik yamaları, otomatik güncelleme politikaları.

**Başlangıç seviyesi iyi pratikler:**

-   Otomatik güncellemeleri mümkünse açık tutun (OS + tarayıcı + temel
    uygulamalar).

-   "Büyük sürüm yükseltmesi" ile "güvenlik yamaları"nı ayırın; güvenlik
    yamaları genellikle daha önceliklidir.

-   Kritik hesaplarla kullanılan cihazlarda güncellemeleri ertelemeyi
    alışkanlık haline getirmeyin.

### **3) Yetkiler, En Az Ayrıcalık ve Temel OS Kontrolleri**

#### **3.1 Kullanıcı Hesapları ve Yönetici Yetkisi**

-   **Kısa tanım:** OS içinde her kullanıcı hesabı belirli izinlere
    sahiptir; yönetici (admin) hesaplar daha geniş yetkilidir.

-   **Neden önemli?** Zararlı bir uygulama veya saldırgan admin
    yetkisiyle çalışırsa sistemde çok daha derin değişiklik yapabilir
    (silme, yükleme, politika değiştirme).

-   **Basit örnek :** Günlük işler için standart kullanıcı hesabı
    kullanmak; sadece gerektiğinde yönetici onayı vermek.

-   **Gerçek hayatta nerede görülür?** "Bu uygulama değişiklik yapmak
    istiyor, izin veriyor musunuz?" uyarıları.

-   **Bu kavram, önceki bölümdeki en az ayrıcalık ilkesiyle ilişkilidir
    (Modül 3):** Least privilege sadece uygulama/hesap yetkileri değil,
    cihaz üzerindeki OS yetkileri için de geçerlidir.

#### **3.2 Güvenlik Duvarı (Firewall) Mantığı**

-   **Kısa tanım:** Gelen/giden ağ trafiğini kurallara göre izin
    veren/engelleyen kontrol katmanı.

-   **Neden önemli?** Dışarıdan istenmeyen bağlantı girişimlerini
    azaltır; gereksiz servislerin görünürlüğünü düşürerek saldırı
    yüzeyini küçültür.

-   **Basit örnek :** Kullanılmayan bir servisin dışarıdan bağlantı
    kabul etmesini engellemek.

-   **Gerçek hayatta nerede görülür?** OS yerleşik güvenlik duvarı
    ayarları; kurumlarda merkezi firewall'lar.

**Dikkat:** Güvenlik duvarı tek başına "tam koruma" değildir;
güncelleme, yetki yönetimi ve güvenli kullanım alışkanlıklarıyla
birlikte çalışır (katmanlı savunma).

#### **3.3 Disk Şifreleme (Disk Encryption) ve Cihaz Kaybı**

-   **Kısa tanım:** Diskteki verilerin, anahtar olmadan okunamayacak
    şekilde şifrelenmesi.

-   **Neden önemli?** Cihaz kaybolduğunda/çalındığında verilerin
    doğrudan okunmasını zorlaştırır; gizliliği korur (CIA'da gizlilik).

-   **Basit örnek :** Dizüstü bilgisayar kaybolduğunda disk şifreleme
    aktifse diski başka cihaza takıp dosyaları okumak çok zorlaşır.

-   **Gerçek hayatta nerede görülür?** Kurumsal dizüstüler, kişisel
    bilgisayarlar; telefonlarda varsayılan şifreleme.

### **4) Güvenli Yapılandırma (Hardening/Sıkılaştırma) ve Saldırı Yüzeyi**

#### **4.1 Hardening Nedir?**

-   **Kısa tanım:** Sistem ve uygulamaları, gereksiz özellikleri kapatıp
    güvenli ayarları etkinleştirerek daha dayanıklı hale getirme
    yaklaşımı.

-   **Neden önemli?** Ne kadar çok gereksiz servis/özellik açıksa
    saldırı yüzeyi o kadar büyür.

-   **Basit örnek :** Kullanılmayan uzaktan erişim özelliğini kapatmak;
    varsayılan ayarları gözden geçirmek.

-   **Gerçek hayatta nerede görülür?** Sunucu kurulum kontrol listeleri,
    güvenli yapılandırma kılavuzları, kurumsal "baseline" ayarları.

**Başlangıç seviyesi hardening kontrol başlıkları:**

-   Gereksiz uygulama/servisleri kaldırma veya kapatma

-   Varsayılan ayarları gözden geçirme (özellikle "herkese açık
    paylaşım" gibi)

-   Güncelleme ve güvenlik yamalarını düzenli alma

-   Yetkileri sınırlandırma (admin kullanımını azaltma)

-   Güvenlik duvarını etkin tutma

-   Koruma özelliklerini (uç nokta koruması vb.) açık tutma

-   Yedekleme ve geri dönüş planı (bütünlük + erişilebilirlik)

#### **4.2 Saldırı Yüzeyi (Attack Surface) Nedir?**

-   **Kısa tanım:** Bir sistemin saldırıya açık olabilecek tüm giriş
    noktalarının toplamı (açık servisler, eklentiler, yetkiler, gereksiz
    bileşenler).

-   **Neden önemli?** Daha geniş saldırı yüzeyi, daha fazla deneme
    fırsatı demektir (riskin olasılık kısmını artırır).

-   **Basit örnek :** Kullanılmayan bir dosya paylaşım servisinin açık
    kalması.

-   **Gerçek hayatta nerede görülür?** Ev modemlerinde açık yönetim
    paneli, sunucularda gereksiz servisler, tarayıcıda çok sayıda
    eklenti.

**İpucu:** "Gereksiz olanı kapat, gerekli olanı güvenli yapılandır"
başlangıç seviyesinde güçlü bir sezgidir. Ama kritik sistemlerde "neyin
gerekli olduğuna" karar verirken iş gereksinimleri ve güvenlik birlikte
değerlendirilir.

### **5) Uç Nokta Güvenliği: Antivirüs, EDR ve Modern Tehditler**

#### **5.1 Uç Nokta (Endpoint) Nedir?**

-   **Kısa tanım:** Ağa bağlı kullanıcı cihazlarıdır (bilgisayar,
    telefon, tablet gibi).

-   **Neden önemli?** Saldırıların önemli bir kısmı uç nokta üzerinden
    başlar; çünkü kullanıcı etkileşimi (indir-çalıştır, linke tıkla)
    burada gerçekleşir.

-   **Basit örnek :** Bir çalışanın dizüstü bilgisayarı, e-posta eki
    açılmasıyla risk altına girebilir.

-   **Gerçek hayatta nerede görülür?** Kurumsal bilgisayarlar, kişisel
    telefonlar, uzaktan çalışma cihazları.

#### **5.2 Antivirüs ve EDR: Kavramsal Fark**

-   **Antivirüs (geleneksel yaklaşım) --- kısa tanım:** Çoğunlukla
    **imza tabanlı** çalışır; bilinen zararlıların kalıplarını
    (imzalarını) arar.

    -   **Neden önemli?** Bilinen tehditleri hızlıca yakalamada
        etkilidir.

    -   **Basit örnek :** İndirilen bir dosya, bilinen zararlı imzayla
        eşleştiği için engellenir.

    -   **Gerçek hayatta nerede görülür?** Yerleşik koruma yazılımları,
        dosya tarama uyarıları.

-   **EDR (Endpoint Detection and Response) --- kısa tanım:** Sadece
    imzaya bakmaz; **davranışları izler**, şüpheli etkinlikleri tespit
    eder ve müdahale süreçlerini destekler.

    -   **Neden önemli?** Karmaşık ve sürekli değişen saldırılarda (ör.
        APT) yalnız imza tabanlı yaklaşım yetersiz kalabilir.

    -   **Basit örnek :** Normalde yapmaması gereken bir işlemi yapan
        uygulamanın davranışının işaretlenmesi.

    -   **Gerçek hayatta nerede görülür?** Kurumsal uç nokta güvenliği
        çözümleri, olay müdahale süreçleri.

**Bu farkı önemli kılan iki kavram:**

-   **APT (Advanced Persistent Threat) --- kısa tanım:** Hedefli, uzun
    süreli, gizli kalmaya çalışan gelişmiş saldırı kampanyaları.

    -   **Neden önemli?** APT'ler "tek bir dosya" yerine süreç ve
        davranışlarla ilerleyebilir; bu yüzden davranış analizi
        değerlidir.

-   **Polimorfizm (Polymorphism) --- kısa tanım:** Zararlı yazılımın
    tespit edilmemek için kod yapısını sürekli değiştirmesi.

    -   **Neden önemli?** İmza tabanlı tespit zorlaşabilir; davranış
        izleme daha kritik hale gelir.

-   **Bu kavram, önceki bölümdeki tehdit türleriyle ilişkilidir (Modül
    2):** Trojan, ransomware, spyware gibi türler uç noktada etkisini
    gösterir; bazıları davranışla yakalanır.

-   **Bu kavram, önceki bölümdeki hesap güvenliğiyle ilişkilidir (Modül
    3):** Spyware/tuş kaydedici gibi tehditler, parola/MFA güvenliğini
    dolaylı zayıflatabilir.

### **6) Yazılım Güvenliği: Güvenli Edinme, Lisanslı Kullanım ve Tedarik Zinciri Riski**

#### **6.1 Güvenli Yazılım Edinme (Trusted Sources)**

-   **Kısa tanım:** Yazılımın resmî kaynaklardan (üreticinin sitesi,
    resmî mağazalar) edinilmesi; mümkünse doğrulama/itibar
    kontrollerinin yapılması.

-   **Neden önemli?** Sahte kurulum dosyaları, korsan/crack'li
    yazılımlar ve "paketlenmiş" zararlı yazılımlar, bulaşma için çok
    yaygın bir yoldur.

-   **Basit örnek :** "Ücretsiz premium sürüm" diye sunulan bir kurulum
    dosyasını rastgele bir siteden indirip çalıştırmak.

-   **Gerçek hayatta nerede görülür?** Sahte indirme butonları, üçüncü
    taraf kurulum yöneticileri, korsan yazılım siteleri.

**Başlangıç seviyesi kurallar:**

-   Resmî kaynak dışı indirmelere temkinli yaklaşın.

-   "Crack", "keygen", "patch" vaatleri yüksek risk taşır.

-   Kurulum sırasında istenen izinleri okuyun; gereksiz izinleri
    sorgulayın.

#### **6.2 Lisanslı Yazılım Kullanmanın Güvenliğe Etkisi**

-   **Kısa tanım:** Yazılımın yasal ve resmî dağıtım kanalıyla
    edinilmesi ve güncelleme mekanizmalarının bozulmamış olması.

-   **Neden önemli?** Korsan/crack'li yazılımlar, çoğu zaman **Truva Atı
    (Trojan)** veya **backdoor (arka kapı)** taşıyabilir.

-   **Basit örnek :** Ücretli bir yazılımın "ücretsiz hale getirilmiş"
    sürümünün arka planda yetkisiz bağlantılar kurması.

-   **Gerçek hayatta nerede görülür?** Crack'li paketler, modifiye
    kurulum dosyaları, şüpheli "aktivasyon araçları".

**Dikkat:** Korsan yazılım, cihazın bir **botnet** parçası haline
gelmesine kadar varan sonuçlar doğurabilir (istem dışı şekilde başka
sistemlere saldırı trafiği üretmek gibi). Bu modülün amacı saldırı
öğretmek değil, risk farkındalığı kazandırmaktır.

#### **6.3 Tedarik Zinciri (Supply Chain) Riski**

-   **Kısa tanım:** Güvenilir görünen bir yazılımın güncelleme
    mekanizması, bağımlılıkları veya dağıtım süreci üzerinden zarar
    görmesi/istismar edilmesi riski.

-   **Neden önemli?** Güvenilir görülen kanallar üzerinden geniş ölçekte
    etki yaratılabilir; özellikle eklentiler ve otomatik güncellemeler
    kritik olabilir.

-   **Basit örnek :** Popüler bir eklentinin güncellemesinin ele
    geçirilip kötü amaçlı kod dağıtması.

-   **Gerçek hayatta nerede görülür?** Paket yöneticileri, eklenti
    mağazaları, otomatik güncelleme sistemleri.

### **7) İnternet ve Web Güvenliği: HTTP--HTTPS, SSL/TLS ve Güvenli Sörf**

#### **7.1 HTTP ve HTTPS Arasındaki Temel Fark**

-   **HTTP (HyperText Transfer Protocol) --- kısa tanım:** Verilerin ağ
    üzerinde **düz metin** olarak iletilebildiği web iletişim protokolü.

-   **HTTPS (HTTP Secure) --- kısa tanım:** HTTP'nin, iletişimi
    **SSL/TLS** ile şifreleyerek korunan sürümü.

-   **Neden önemli?** HTTPS, verinin gizliliğini ve bütünlüğünü
    destekler: araya giren biri veriyi okuyamaz ve (doğru kurulumla)
    yolda değiştirmek zorlaşır.

-   **Basit örnek :** Açık bir Wi-Fi'da HTTP ile giriş yapılan bir
    sayfada verilerin okunabilmesi riski; HTTPS ile bu riskin azalması.

-   **Gerçek hayatta nerede görülür?** Adres çubuğunda "<https://>" ve
    kilit simgesi; sertifika uyarıları.

**Dikkat:** HTTPS, tarayıcı ile site arasındaki iletişimi şifreler;
ancak bir sitenin "kesinlikle iyi niyetli" olduğunu %100 garanti etmez.
Bu, phishing riskini (Modül 2--3) tamamen ortadan kaldırmaz; sadece bazı
teknik riskleri azaltır.

#### **7.2 SSL/TLS Nedir?**

-   **Kısa tanım:** İnternet üzerindeki iletişimi şifreleyerek koruyan
    güvenlik protokolleridir (güncel kullanımda TLS temel kavramdır).

-   **Neden önemli?** Kimlik bilgileri ve hassas veriler aktarılırken
    gizlilik/bütünlük korunur.

-   **Basit örnek :** Bir alışveriş sitesinde ödeme adımında TLS ile
    şifreli bağlantı kurulması.

-   **Gerçek hayatta nerede görülür?** HTTPS bağlantıları, güvenli API
    çağrıları, uygulama içi güvenli bağlantılar.

-   **Bir sonraki modülde**, ağ temellerini işlerken "güvenli bağlantı"
    kavramını daha sistematik ele alacağız; TLS'in neden kritik olduğuna
    daha güçlü bir bağ kuracaksınız.

### **8) Çerezler (Cookies), Dijital Ayak İzi ve Tarayıcı Hijyeni**

#### **8.1 Çerez (Cookie) Nedir?**

-   **Kısa tanım:** Web sitelerinin tarayıcıya kaydettiği küçük veri
    dosyalarıdır; oturum ve tercih bilgilerini tutabilir.

-   **Neden önemli?** Oturum yönetimini kolaylaştırır; fakat takip
    (tracking) amaçlı da kullanılabilir ve gizlilik riskleri
    doğurabilir.

-   **Basit örnek :** Siteye tekrar girdiğinizde "beni hatırla"
    seçeneğinin çalışması.

-   **Gerçek hayatta nerede görülür?** Giriş oturumları, sepet bilgisi,
    kişiselleştirilmiş içerikler, reklam takibi.

#### **8.2 Dijital Ayak İzi (Digital Footprint) Nedir?**

-   **Kısa tanım:** İnternette yapılan işlemler sonucu oluşan izlerdir
    (aramalar, ziyaretler, beğeniler, paylaşımlar, profil bilgileri).

-   **Neden önemli?** Toplanan bilgiler, hedefli reklam kadar hedefli
    sosyal mühendislik için de "keşif materyali" olabilir.

-   **Basit örnek :** Sosyal medya paylaşımlarından ilgi alanlarının
    çıkarılması ve buna göre ikna edici sahte mesaj hazırlanması.

-   **Gerçek hayatta nerede görülür?** Reklam profilleme, veri
    aracılığı, kimlik avı kampanyalarının kişiselleştirilmesi.

-   **Bu kavram, önceki bölümdeki sosyal mühendislikle ilişkilidir
    (Modül 2):** Sosyal mühendislik çoğu zaman önceden toplanmış
    bilgilerle daha inandırıcı hale gelir.

**Dijital ayak izini yönetmek için temel alışkanlıklar:**

-   Çerez/izleyici ayarlarını gözden geçirmek ve gereksiz izinleri
    kısıtlamak

-   Tarayıcıda gereksiz eklentileri kaldırmak

-   Paylaşılan kişisel bilgileri asgari düzeyde tutmak

-   Şüpheli linklere tıklamadan önce bağlamı doğrulamak

### **9) Tarayıcı Güvenliği: Sertifikalar, Eklentiler, İndirmeler**

#### **9.1 Sertifika Uyarıları (Certificate Warnings) Nasıl Yorumlanır?**

-   **Kısa tanım:** Tarayıcı, bağlantının güvenilirliğinde problem
    algılarsa "bağlantınız gizli değil" gibi uyarılar gösterir.

-   **Neden önemli?** Sahte siteler veya araya girme girişimleri için
    bir sinyal olabilir.

-   **Basit örnek :** Giriş yapılacak sayfada sertifika uyarısı varsa
    durup doğrulama yapmak.

-   **Gerçek hayatta nerede görülür?** Giriş ekranları, ödeme sayfaları,
    kamu hizmeti portalları.

#### **9.2 Tarayıcı Eklentileri ve İzinler**

-   **Kısa tanım:** Eklentiler tarayıcıya ek özellik kazandırır;
    bazıları sayfa içeriğini okuma/değiştirme iznine sahip olabilir.

-   **Neden önemli?** Kötü niyetli veya aşırı izinli eklentiler, girilen
    verileri okuyabilir; tedarik zinciri saldırılarıyla popüler
    eklentiler ele geçirilip geniş kitle etkilenebilir.

-   **Basit örnek :** "Ziyaret ettiğiniz tüm sitelerdeki verileri okuma"
    izni isteyen eklentiyi kaldırmak veya yalnız gerekli sitelerle
    sınırlandırmak.

-   **Gerçek hayatta nerede görülür?** Reklam engelleyiciler, parola
    yöneticisi eklentileri, ekran görüntüsü araçları.

**Başlangıç seviyesi eklenti kuralları:**

-   Az sayıda, gerçekten gerekli eklenti kullanın.

-   İzinleri okuyun: "Neden bu izne ihtiyaç duyuyor?" diye sorgulayın.

-   Kullanmadığınız eklentileri kaldırın.

#### **9.3 Güvenli İndirme ve Dosya Çalıştırma Alışkanlıkları**

-   **Kısa tanım:** İnternetten indirilen dosyalar zararlı yazılım
    taşıyabilir; özellikle çalıştırılabilir dosyalar yüksek risklidir.

-   **Neden önemli?** Bulaşmaların büyük kısmı "indir-çalıştır"
    davranışıyla başlar.

-   **Basit örnek :** "fatura.pdf.exe" benzeri şüpheli dosyayı açmamak;
    dosya uzantılarına dikkat etmek.

-   **Gerçek hayatta nerede görülür?** E-posta ekleri, mesajlaşma
    uygulamaları, sahte indirme sayfaları.

**Dikkat:** "Acele" ve "merak" duygusu, sosyal mühendisliğin sık
kullandığı tetikleyicilerdendir (Modül 2). Tarayıcı hijyeni, bu
psikolojik tuzakları teknik alışkanlıklarla dengelemeye yardımcı olur.

### **10) Ek Savunma Katmanı: Yedekleme ve İzole Çalıştırma Yaklaşımı**

#### **10.1 Yedekleme (Backup) Neden Sadece "Kopya" Değildir?**

-   **Kısa tanım:** Verilerin düzenli olarak ayrı bir ortamda
    saklanması; gerektiğinde geri dönebilmeyi sağlayan süreç.

-   **Neden önemli?** Fidye yazılımı gibi erişilebilirliği hedefleyen
    tehditlerde hizmet sürekliliğini artırır.

-   **Basit örnek :** Önemli belgelerin haftalık yedeklenmesi; sorun
    olduğunda önceki sürüme dönebilmek.

-   **Gerçek hayatta nerede görülür?** Harici disk yedekleri, bulut
    yedekleme servisleri, kurumsal yedekleme politikaları.

**İpucu:** Yedekleme, geri yükleme (restore) testleriyle anlam kazanır.
"Geri dönebiliyor muyum?" sorusu pratikte doğrulanmalıdır.

#### **10.2 Sandbox (Kum Havuzu) Yaklaşımı**

-   **Kısa tanım:** Şüpheli bir yazılımı izole bir ortamda çalıştırarak
    sistemin geri kalanını riske atmadan davranışını gözlemleme
    yaklaşımı.

-   **Neden önemli?** Ana sistemi riske atmadan inceleme ve
    değerlendirme yapılabilir (kurumsal ortamlarda daha yaygındır).

-   **Basit örnek :** Şüpheli bir dosyanın ana cihazda değil, izole
    ortamda değerlendirilmesi.

-   **Gerçek hayatta nerede görülür?** Güvenlik analiz süreçleri, kurum
    içi test ortamları.

### **11) Kavramsal Senaryo Çözümleme (Teorik)**

Bu bölüm "nasıl saldırı yapılır" anlatmaz; olayları doğru
sınıflandırmayı öğretir. Bu yaklaşım, Modül 1'deki risk düşüncesini ve
Modül 2'deki saldırı türlerini pratikte birleştirir.

**Senaryo şablonu (Modül 1--2--3 ile uyumlu):**

-   **Varlık:** Veri mi, sistem mi, hizmet mi?

-   **Zafiyet:** Güncelleme eksikliği mi, yanlış yapılandırma mı,
    kullanıcı hatası mı, aşırı yetki mi?

-   **Yöntem:** Phishing mi, malware mı, bilinen zafiyetten yararlanma
    mı (kavramsal)?

-   **Etki (CIA):** Gizlilik/bütünlük/erişilebilirlik hangisi etkilendi?

-   **Asgari önlem:** Hangi temel kontrol(ler) riski düşürür?

#### **Mini Senaryo 1** 

Bir kullanıcı, tarayıcıda "güncelleme gerekli" uyarısı veren bir
sayfadan dosya indiriyor. Dosyayı çalıştırdıktan sonra bilgisayar
yavaşlıyor ve bazı dosyalarına erişemediğini fark ediyor.

-   **Varlık:** Cihaz ve dosyalar

-   **Zafiyet:** Güvenli edinme/hijyen eksikliği; şüpheli indirmenin
    çalıştırılması

-   **Yöntem:** Sosyal mühendislik + zararlı yazılım bulaşması
    (kavramsal)

-   **Etki (CIA):** Erişilebilirlik (dosyalara erişememe), ayrıca
    gizlilik riski

-   **Asgari önlem:** Resmî kaynaklardan yazılım edinme, OS/tarayıcı
    güncelleme, uç nokta koruması, yedekleme

#### **Mini Senaryo 2** 

Bir bilgisayarda uzun süredir sistem güncellemesi yapılmıyor. Kullanıcı,
sık kullandığı bir programı açtığında programın çökmesi ve beklenmeyen
hatalar artıyor.

-   **Varlık:** Sistem kararlılığı ve hizmet sürekliliği

-   **Zafiyet:** Patch eksikliği / güncelleme gecikmesi

-   **Yöntem:** Doğrudan saldırı olmak zorunda değil; "bilinen zafiyet"
    riski ve stabilite sorunları

-   **Etki (CIA):** Erişilebilirlik (sistem/uygulama kullanılamaz hale
    gelebilir)

-   **Asgari önlem:** Düzenli güncelleme takvimi, kritik yamaları
    önceliklendirme

#### **Mini Senaryo 3** 

Bir kullanıcı, e-posta ile gelen "belgeyi görüntülemek için açın"
mesajındaki eki indiriyor. Ek, güncellenmemiş bir uygulamadaki zafiyeti
tetikleyerek istenmeyen bir davranışa neden oluyor.

-   **Varlık:** Cihaz ve kullanıcı verileri

-   **Zafiyet:** Güncellenmemiş uygulama (zafiyet) + riskli ek açma
    alışkanlığı

-   **Yöntem:** Zafiyetin istismar edilmesi (kavramsal exploit
    kullanımı)

-   **Etki (CIA):** Gizlilik ve bütünlük riski; bazı durumlarda
    erişilebilirlik riski

-   **Asgari önlem:** Uygulama/OS yamaları, ek/indirme hijyeni, uç nokta
    koruması

-   **Bir sonraki modülde** bu senaryolardaki "bağlantı ve ağ ortamı"
    boyutunu (güvensiz Wi-Fi, güvenli bağlantı, temel ağ kontrolleri)
    sistematik şekilde ele alacaksınız.

## **Terimler Sözlüğü (Glossary)**

  **Terim**               **Türkçe karşılığı / açıklama**
  ----------------------- ------------------------------------------------------------------------------------------
  Operating System (OS)   İşletim sistemi; donanımı yöneten ve uygulamalara çalışma ortamı sağlayan temel yazılım
  Bug                     Hata; yazılımın beklenmeyen davranışına yol açan programlama hatası
  Vulnerability           Zafiyet; istismar edilebilir güvenlik açığı
  Exploit                 İstismar yöntemi; zafiyeti kullanarak istenmeyen sonuç elde etme yaklaşımı
  Patch                   Yama; güvenlik açığını kapatan veya hatayı düzelten güncelleme parçası
  Patch Management        Yama yönetimi; yamaların planlı şekilde uygulanması süreci
  Hardening               Sıkılaştırma/güvenli yapılandırma; gereksiz bileşenleri kapatıp güvenliği artırma
  Attack Surface          Saldırı yüzeyi; sisteme giriş noktalarının toplamı
  Firewall                Güvenlik duvarı; ağ trafiğini kurallarla denetleyen kontrol katmanı
  Disk Encryption         Disk şifreleme; verileri anahtar olmadan okunamaz hale getirme
  Endpoint                Uç nokta; ağa bağlı kullanıcı cihazı (PC, telefon vb.)
  Antivirus               Antivirüs; genellikle imza tabanlı zararlı tespiti yapan koruma yaklaşımı
  Signature-based         İmza tabanlı; bilinen zararlı kalıplarını arama yöntemi
  EDR                     Uç nokta tespit ve yanıt; davranış izleme ve müdahale odaklı güvenlik yaklaşımı
  Behavior Analysis       Davranış analizi; olağandışı eylemleri izleyip değerlendirme
  APT                     Gelişmiş kalıcı tehdit; hedefli, uzun süreli ve gizli kalmaya çalışan saldırı kampanyası
  Polymorphism            Polimorfizm; zararlı yazılımın tespitten kaçmak için sürekli değişmesi
  Trojan                  Truva atı; yararlı gibi görünüp zararlı iş yapan yazılım
  Backdoor                Arka kapı; yetkisiz erişim sağlayan gizli mekanizma
  Botnet                  Bot ağı; ele geçirilmiş cihazların uzaktan yönetilen ağı
  Supply Chain Risk       Tedarik zinciri riski; yazılım dağıtım/güncelleme/bağımlılık süreçlerinden kaynaklı risk
  HTTP                    Web iletişim protokolü; veriler şifrelenmeden iletilebilir
  HTTPS                   Güvenli HTTP; SSL/TLS ile şifreli iletişim sağlayan web protokolü
  SSL/TLS                 İnternet iletişimini şifrelemek için kullanılan güvenlik protokolleri
  Certificate             Sertifika; HTTPS bağlantısının güven ilişkisini destekleyen dijital kimlik belgesi
  Cookie                  Çerez; tarayıcıya kaydedilen küçük veri dosyası
  Digital Footprint       Dijital ayak izi; internet faaliyetleri sonucu oluşan izler
  Extension               Tarayıcı eklentisi; tarayıcıya işlev ekleyen yazılım bileşeni
  Backup                  Yedekleme; verilerin geri dönüş için ayrı ortamda kopyalanması
  Sandbox                 Kum havuzu; şüpheli yazılımı izole ortamda çalıştırma yaklaşımı

## **Test Soruları**

1.  Bir yazılım üreticisinin güvenlik açığını kapatmak için yayınladığı
    düzeltme paketine ne ad verilir?\
    A) Cookie\
    B) Patch (Yama)\
    C) Botnet\
    D) Sandbox\
    **Doğru Cevap: B**\
    **Açıklama:** Patch, zafiyetleri kapatmak veya hataları gidermek
    için yayınlanan düzeltmedir.

2.  "Saldırı yüzeyi (attack surface)" kavramı en doğru şekilde neyi
    ifade eder?\
    A) Ekran boyutunu\
    B) Sistemin saldırıya açık olabilecek giriş noktalarının toplamını\
    C) İnternet hızını\
    D) Dosya boyutunu\
    **Doğru Cevap: B**\
    **Açıklama:** Açık servisler, gereksiz bileşenler, eklentiler ve
    yetkiler saldırı yüzeyine dahildir.

3.  İşletim sistemi güvenliği neden "temel katman" olarak görülür?\
    A) Çünkü sadece internet ayarlarını yönetir\
    B) Çünkü tüm uygulamalar OS üzerinde çalıştığı için bir zafiyet
    geniş etki doğurabilir\
    C) Çünkü sadece oyun performansını artırır\
    D) Çünkü yalnızca yazıcıları yönetir\
    **Doğru Cevap: B**\
    **Açıklama:** OS, üst katmanların temelidir; zafiyetler gizlilik,
    bütünlük ve erişilebilirliği etkileyebilir.

4.  Geleneksel antivirüs ile EDR arasındaki en temel kavramsal fark
    hangisine en yakındır?\
    A) Antivirüs davranış izler, EDR yalnız dosya adını kontrol eder\
    B) EDR davranış analizine odaklanırken, geleneksel antivirüs
    çoğunlukla imza tabanlı tespiti kullanır\
    C) Antivirüs sadece sunucularda çalışır\
    D) EDR sadece çevrimdışı çalışır\
    **Doğru Cevap: B**\
    **Açıklama:** EDR, karmaşık tehditleri yakalamak için davranış
    izlemeyi öne çıkarır.

5.  "Hardening/sıkılaştırma" aşağıdakilerden hangisini en iyi açıklar?\
    A) Her kullanıcıya yönetici yetkisi vermek\
    B) Gereksiz servisleri kapatıp güvenli ayarları etkinleştirerek
    sistemi daha dayanıklı yapmak\
    C) Güncellemeleri devre dışı bırakmak\
    D) Tüm eklentileri otomatik kurmak\
    **Doğru Cevap: B**\
    **Açıklama:** Sıkılaştırma, saldırı yüzeyini azaltmaya ve güvenli
    konfigürasyona odaklanır.

6.  HTTP ile HTTPS arasındaki temel güvenlik farkı nedir?\
    A) HTTPS, veriyi düz metin taşır\
    B) HTTPS, SSL/TLS ile iletişimi şifreleyerek gizlilik ve bütünlüğü
    destekler\
    C) HTTP her zaman daha güvenlidir\
    D) İkisi arasında fark yoktur\
    **Doğru Cevap: B**\
    **Açıklama:** HTTPS, tarayıcı ile site arasındaki trafiği şifreler;
    bu, araya girme risklerini azaltır.

7.  Bir tarayıcı eklentisinin "ziyaret ettiğiniz sitelerdeki tüm
    verileri okuma" izni istemesi ne anlama gelebilir?\
    A) Sadece ekran parlaklığını ayarlayacağı\
    B) Sayfa içeriğine geniş erişimi olduğu için girilen verileri
    okuyabilme riskinin artabileceği\
    C) Bilgisayarı hızlandıracağı\
    D) İnterneti ücretsiz yapacağı\
    **Doğru Cevap: B**\
    **Açıklama:** Aşırı izinli eklentiler, gizlilik ve bütünlük
    açısından risk doğurabilir.

8.  Korsan/crack'li yazılım kullanmanın siber güvenlik açısından en
    büyük riski hangisidir?\
    A) Sadece depolama alanının azalması\
    B) İçine yerleştirilmiş trojan/backdoor gibi zararlı bileşenlerle
    sistemin ele geçirilebilmesi\
    C) Ekran çözünürlüğünün düşmesi\
    D) Klavye düzeninin değişmesi\
    **Doğru Cevap: B**\
    **Açıklama:** Crack'li paketler sıkça zararlı taşıyıcısıdır;
    backdoor ile yetkisiz erişim sağlanabilir.

9.  Çerezler (cookies) ve dijital ayak izi neden güvenlik ve gizlilik
    açısından önemlidir?\
    A) Sadece bilgisayarı hızlandırdıkları için\
    B) Kullanıcı davranışlarının izlenmesini ve sosyal mühendislik için
    keşif materyali oluşmasını kolaylaştırabildikleri için\
    C) Sadece yazıcı ayarlarını değiştirdikleri için\
    D) Güncellemeleri otomatik yükledikleri için\
    **Doğru Cevap: B**\
    **Açıklama:** İzleme verileri profilleme ve hedefli manipülasyon
    risklerini artırabilir (Modül 2 ile bağlantılı).

10. Aşağıdaki IP adreslerinden hangisi dokümantasyon/örnek amaçlı
    ayrılmış bloklardan birine aittir?\
    A) 8.8.8.8\
    B) 192.0.2.1\
    C) 127.0.0.1\
    D) 192.168.1.1\
    **Doğru Cevap: B**\
    **Açıklama:** 192.0.2.0/24 bloğu örnekleme ve dokümantasyon için
    ayrılmış adres aralıklarındandır.

## **Bu Modülde Neler Öğrendik?**

-   İşletim sisteminin dijital varlıklar için temel güven katmanı
    olduğunu ve güvenliğin burada başladığını öğrendik.

-   Bug → zafiyet → exploit → patch zincirini kurarak, yama yönetiminin
    neden kritik olduğunu kavradık.

-   Sıkılaştırma (hardening) ve saldırı yüzeyi kavramlarıyla, gereksiz
    bileşenlerin riski nasıl artırdığını gördük.

-   En az ayrıcalık, güvenlik duvarı ve disk şifreleme gibi temel OS
    kontrollerinin gizlilik, bütünlük ve erişilebilirliği nasıl
    desteklediğini ilişkilendirdik.

-   Uç nokta güvenliğinde antivirüs ile EDR'in yaklaşım farklarını; APT
    ve polimorfizm gibi modern tehditlerin bu farkı neden önemli
    kıldığını değerlendirdik.

-   Yazılımı güvenli kaynaklardan edinmenin, lisanslı kullanımın ve
    tedarik zinciri risklerinin pratik sonuçlarını analiz ettik.

-   HTTP--HTTPS farkını, SSL/TLS'in şifreli iletişimdeki rolünü ve
    sertifika uyarılarını doğru yorumlamanın önemini öğrendik.

-   Çerezler, dijital ayak izi, tarayıcı eklentileri ve güvenli indirme
    alışkanlıklarıyla internet/tarayıcı güvenliğini günlük pratiklere
    dönüştürdük.

-   Yedekleme ve izole değerlendirme (sandbox) yaklaşımının olaylara
    karşı dayanıklılık sağladığını kavradık.

## **Modül 5 --- Ağ Güvenliğinin Temelleri ve Veri Koruma Mekanizmaları (IP, DNS, Güvenli Bağlantı, Temel Ağ Kontrolleri ve Kriptografiye Giriş)**

Önceki modüllerde (Modül 3 ve 4) hesaplarınızı, cihazınızı ve
yazılımlarınızı daha güvenli hale getirmenin temel prensiplerini
öğrendiniz. Bu modül, aynı güvenlik yaklaşımını **ağ katmanına**
taşıyarak "veri bir noktadan diğerine giderken" neler olduğuna
odaklanır: IP adresleme, portlar, protokoller ve DNS gibi temel
kavramlar; Wi-Fi güvenliği, VPN ve proxy gibi güvenli bağlantı
yaklaşımları; firewall, NAT ve ağ ayrıştırma gibi temel ağ kontrolleri
ele alınır. Ayrıca verinin **gizliliğini ve bütünlüğünü** destekleyen
kriptografik temeller (şifreleme, anahtarlar, hash, salt) başlangıç
seviyesinde, bol örnekle açıklanır. Bir sonraki modülde, bu ağ
temellerini kullanarak **izleme, loglama ve olay yönetimi** gibi daha
sistematik tespit/müdahale düşüncesine geçerken bu konuların neden
kritik olduğunu göreceksiniz.

## **Modül Amaçları**

Bu modülü tamamlayan bir öğrenci:

-   IP adresi, alt ağ (subnet/CIDR), port, protokol ve DNS kavramlarını
    açıklayabilir ve aralarındaki ilişkiyi kurabilir.

-   Modem, router ve switch gibi temel ağ bileşenlerinin işlevlerini ve
    güvenlikteki rollerini tanımlayabilir.

-   Firewall, NAT ve ağ ayrıştırma (segmentation/misafir ağı)
    kontrollerinin saldırı yüzeyi ve risk üzerindeki etkisini
    yorumlayabilir.

-   Wi-Fi güvenliği (WPA2/WPA3), güvenli bağlantı alışkanlıkları, VPN ve
    proxy'nin kavramsal amaçlarını ve sınırlarını analiz edebilir.

-   Kriptografinin temel kavramlarını (plaintext, ciphertext, key),
    simetrik/asimetrik şifreleme farklarını ve hash/salt'ın bütünlük ile
    parola güvenliğindeki rolünü açıklayabilir.

## **Ana İçerik**

### **1) Büyük Resim: Neden Ağ + Veri Güvenliği?**

**Kısa tanım:** Ağ güvenliği; verinin ağ üzerinde taşınırken **yetkisiz
erişime**, **değişikliğe** veya **hizmet kesintisine** uğramasını
önlemeye yönelik yaklaşımların bütünüdür.\
**Neden önemli?** Modül 1'deki CIA üçlüsü
(Gizlilik--Bütünlük--Erişilebilirlik) ağ üzerinde "uygulamaya dönüşür."
Ağ zayıfsa, Modül 3'teki güçlü kimlik doğrulama ve Modül 4'teki
güncel/sıkılaştırılmış cihazlar bile risk altında kalabilir.\
**Basit örnek:** Güncel bir bilgisayarınız olsa bile, hatalı
yapılandırılmış bir Wi-Fi ağı üzerinden kritik bir hesaba giriş yapmanız
risk doğurabilir.\
**Gerçek hayatta nerede görülür?** Ev ağları, kampüs ağları, ofis
ağları, otel/kafe Wi-Fi'ları, mobil veri, uzaktan çalışma senaryoları.

**Dikkat (katmanlı savunma):** "Güçlü parola + güncel cihaz = tamamen
güvendeyim" düşüncesi yanıltıcıdır. Ağ, saldırganın görünürlük kazandığı
ve yanlış yapılandırmaların büyüyebildiği bir katmandır. Bu kavram,
önceki modüllerdeki risk (Modül 1) ve saldırı türleri (Modül 2) ile
doğrudan ilişkilidir.

### **2) Ağın Temel Yapı Taşları: IP, Subnet, Port, Protokol**

#### **2.1 IP Adresi (IPv4/IPv6)**

**Kısa tanım:** IP adresi, ağ üzerindeki cihazların birbirini
bulabilmesi için kullanılan adresleme sistemidir.\
**Neden önemli?** Ağ trafiğinde "kimden kime?" sorusunun temel
cevabıdır; log inceleme, erişim kontrolü ve olay analizi için ana
veridir.\
**Basit örnek:** Tarayıcınızla example.com'a girdiğinizde cihazınız bir
IP hedefiyle iletişim kurar.\
**Gerçek hayatta nerede görülür?** Modem arayüzleri, firewall kuralları,
sunucu logları, ağ izleme ekranları.

**Dokümantasyon amaçlı örnek IP blokları (bu modülde kullanılan tek
örnek bloklar):**

-   192.0.2.0/24

-   198.51.100.0/24

-   203.0.113.0/24

-   2001:db8::/32

#### **2.2 Alt Ağ (Subnet) ve CIDR Gösterimi**

**Kısa tanım:** Subnet, IP adreslerini mantıksal gruplara bölme
yöntemidir. CIDR (örn. **/24**) ağın büyüklüğünü belirtir.\
**Neden önemli?** Ağları bölmek yönetimi kolaylaştırır ve güvenlikte
**ayrıştırma** için temel oluşturur: "Her şey her şeye erişmesin."\
**Basit örnek:** 192.0.2.0/24, bir yerel ağ bloğunu temsil eder; aynı
segmentteki cihazlar gibi düşünülebilir.\
**Gerçek hayatta nerede görülür?** Kurumsal ağ tasarımı, bulut ağları,
yönlendirici/router ayarları.

**İpucu:** Sezgisel kural: "/" büyüdükçe ağ küçülür; "/" küçüldükçe ağ
büyür. Bu sezgi, ileride ağ ayrıştırma konularında çok işinize yarar
(bir sonraki modülde olay kapsamını analiz ederken de).

#### **2.3 Port**

**Kısa tanım:** Port, aynı IP üzerindeki farklı hizmetleri ayırt eden
numaralı "kapılar"dır. IP "bina adresi", port "daire numarası" gibidir.\
**Neden önemli?** Açık portlar saldırı yüzeyini büyütür; firewall
kurallarının önemli kısmı port temellidir.\
**Basit örnek:** Aynı sunucuda web hizmeti ve başka bir hizmet farklı
portlarda çalışabilir.\
**Gerçek hayatta nerede görülür?** Sunucularda "açık port" listeleri,
güvenlik duvarı kural setleri, loglarda hedef port bilgisi.

#### **2.4 Protokoller: TCP ve UDP**

**Kısa tanım:** Protokol, cihazların veri alışverişini hangi kurallarla
yapacağını tanımlar.\
**Neden önemli?** Farklı protokoller farklı davranışlar ve riskler
doğurur; izleme ve olay analizinde "trafik tipi" ayırt edici ipucu
sağlar.\
**Basit örnek:** TCP "garantili teslim", UDP "hızlı ama garantisiz" gibi
düşünülebilir.\
**Gerçek hayatta nerede görülür?** Web, e-posta, DNS sorguları,
görüntülü görüşme, oyun trafiği.

-   **TCP (Transmission Control Protocol)**

    -   **Kısa tanım:** Bağlantı kurar, paket sırasını korur, kayıpları
        telafi eder.

    -   **Neden önemli?** Oturum tabanlı ve güvenilir iletişim için
        yaygındır.

    -   **Basit örnek:** Dosya indirirken verinin eksiksiz gelmesi.

    -   **Gerçek hayatta:** Web oturumları, e-posta aktarımı, bazı dosya
        transferleri.

-   **UDP (User Datagram Protocol)**

    -   **Kısa tanım:** Bağlantısız, hız odaklıdır; teslim garantisi
        yoktur.

    -   **Neden önemli?** Düşük gecikme gereken uygulamalar için
        uygundur; bazı kötüye kullanım senaryolarında takip/filtreleme
        yaklaşımı farklılaşır.

    -   **Basit örnek:** Canlı ses/görüntü aktarımında küçük kayıpların
        tolere edilmesi.

    -   **Gerçek hayatta:** VoIP, online oyunlar, bazı DNS trafiği.

Bir sonraki modülde log okurken "TCP mi UDP mi?" ayrımı, olayın doğasını
anlamada sık kullanılan bir sınıflandırmadır.

### **3) DNS: İnternetin "Adres Defteri" ve Güvenlik Boyutu**

#### **3.1 DNS (Domain Name System)**

**Kısa tanım:** DNS, alan adlarını (example.com) IP adreslerine çeviren
sistemdir.\
**Neden önemli?** Yanlış yönlendirme kullanıcıyı sahte/hedef dışı bir
noktaya götürebilir; bu da kimlik avı (Modül 2) ve hesap güvenliği
(Modül 3) riskini büyütebilir.\
**Basit örnek:** Tarayıcıya example.com yazınca cihaz DNS'e sorar, bir
IP döner ve bağlantı o hedefe kurulur.\
**Gerçek hayatta nerede görülür?** Ev modemleri, kurumsal DNS
sunucuları, cihaz ağ ayarları.

#### **3.2 DNS Neden Risk Üretebilir?**

**Kısa tanım:** DNS "nereye gideceğini" belirlediği için, hatalı veya
kötü niyetli çözümleme yanlış hedefe yönlendirebilir.\
**Neden önemli?** Kullanıcı doğru siteye girdiğini sanırken farklı bir
noktaya gidebilir; bu durum, Modül 4'teki tarayıcı uyarıları ve güvenli
kullanım alışkanlıklarını kritik hale getirir.\
**Basit örnek:** Bir kullanıcı, alışık olduğu giriş sayfasına gittiğini
sanır; fakat DNS çözümlemesi farklı bir IP'ye yönlendirmiştir.\
**Gerçek hayatta nerede görülür?** Güvensiz Wi-Fi ağları, yanlış
yapılandırılmış modemler.

**Dikkat:** "HTTPS varsa her şey güvenlidir" düşüncesi doğru değildir.
HTTPS trafiği şifreleyebilir; fakat kullanıcıyı yanlış bir siteye
götüren yanıltıcı alan adları veya sosyal mühendislik riskleri devam
edebilir. (Bu noktada Modül 4'teki sertifika uyarısı alışkanlığı ve
Modül 3'teki kimlik bilgisi hijyeni kritik destek sağlar.)

### **4) Ağ Bileşenleri: Modem, Router, Switch ve Paket Mantığı**

#### **4.1 Veri Paketleri ve Temel Cihazlar**

**Kısa tanım:** Veri ağ üzerinde çoğunlukla **paketler** halinde
taşınır; bu paketleri yöneten cihazların güvenlikte rolü vardır.\
**Neden önemli?** Ağ cihazları "dış dünyaya açılan kapı" ve "trafik
kontrol noktaları"dır. Yanlış yapılandırma risk doğurur (Modül 1'in risk
yaklaşımıyla ilişkilidir).\
**Basit örnek:** Ev ağında telefon, bilgisayar ve TV aynı ağda paket
alışverişi yapar.\
**Gerçek hayatta nerede görülür?** Ev/işyeri ağları, kampüsler, şirket
ağları.

-   **Modem**

    -   **Kısa tanım:** İnternet servis sağlayıcısından gelen sinyali
        dijital veriye dönüştürerek dış dünyaya açılan ilk kapıyı
        oluşturur.

    -   **Neden önemli?** Dış bağlantının geçtiği yer olduğu için güncel
        ve güvenli yönetilmelidir (Modül 4'teki güncelleme prensibiyle
        aynı mantık).

    -   **Basit örnek:** Modem arayüzüne girip yönetici parolasını
        değiştirmek.

    -   **Gerçek hayatta:** Ev interneti, küçük ofisler.

-   **Router (Yönlendirici)**

    -   **Kısa tanım:** Farklı ağlar arasındaki trafiği yönetir; IP'leri
        kullanarak doğru hedefe yönlendirir.

    -   **Neden önemli?** Çoğu router temel güvenlik özellikleri
        (filtreleme, NAT, misafir ağı) sunar; yanlış ayar risk üretir.

    -   **Basit örnek:** Misafir ağını ayrı bir segmentte tutmak.

    -   **Gerçek hayatta:** Ev router'ları, ofis ağ geçitleri.

-   **Switch**

    -   **Kısa tanım:** Yerel ağ (LAN) içindeki cihazlar arasında
        trafiği dağıtır.

    -   **Neden önemli?** Yerel ağ trafiğinin düzeni ve ayrıştırma
        tasarımlarında kritik rol alır.

    -   **Basit örnek:** Ofiste aynı katta çalışan bilgisayarların aynı
        switch'e bağlı olması.

    -   **Gerçek hayatta:** Ofis ağları, laboratuvarlar, kampüs
        altyapısı.

### **5) Güvenli Bağlantı Pratikleri: Wi-Fi, VPN ve Proxy**

#### **5.1 Wi-Fi Güvenliği (WPA2/WPA3, Misafir Ağı)**

**Kısa tanım:** WPA2/WPA3, kablosuz ağda şifreleme ve kimlik doğrulama
sağlayan standartlardır.\
**Neden önemli?** Kablosuz iletişim "ortama yayılır"; zayıf yapılandırma
yetkisiz erişim ve veri riski doğurabilir.\
**Basit örnek:** Ev ağında WPA3 kullanmak, misafirleri misafir ağına
almak.\
**Gerçek hayatta nerede görülür?** Ev/işyeri modem ayarları, kampüs
ağları, oteller.

**Başlangıç seviyesi iyi pratikler:**

-   Mümkünse **WPA3**, değilse **WPA2** tercih edin.

-   Misafirler için **misafir ağı** açın; ana ağa erişimi kısıtlayın.

-   Modem/router **yönetici parolasını** değiştirin (varsayılan
    bırakmayın).

-   Modem/router **firmware güncellemelerini** ertelemeyin (Modül 4 ile
    doğrudan ilişkilidir).

#### **5.2 VPN (Virtual Private Network)**

**Kısa tanım:** VPN, cihaz ile VPN sunucusu arasında trafiği taşıyan
**şifreli bir tünel** oluşturma yaklaşımıdır.\
**Neden önemli?** Güvenilir olmayan ağlarda (ör. kalabalık bir mekân
Wi-Fi'ı) trafiğin belirli bölümünü daha korumalı taşımaya yardımcı
olabilir.\
**Basit örnek:** Açık Wi-Fi'da çalışırken kurumsal kaynaklara erişmeden
önce VPN'e bağlanmak.\
**Gerçek hayatta nerede görülür?** Uzaktan çalışma, kurumsal sistemlere
erişim, seyahat senaryoları.

**İpucu (sınırlar):** VPN, web sitelerine karşı IP'nizi maskeleyebilir
ve cihaz-VPN sunucusu arasını şifreler; ancak **tam anonimlik
garantisi** vermez. VPN sağlayıcısı bazı trafik/metadata bilgilerini
görebilir ve güven, politika ve yapılandırma önemlidir.\
Bu nokta, Modül 4'teki "uç nokta enfekteyse VPN her şeyi çözmez" ve
Modül 3'teki "kimlik bilgisi sahte sayfaya girildiyse zarar oluşur"
ilkeleriyle birebir bağlantılıdır.

#### **5.3 Proxy**

**Kısa tanım:** Proxy, kullanıcı ile internet arasında **aracı sunucu**
gibi çalışır; isteği kullanıcı adına iletir ve yanıtı geri taşır.\
**Neden önemli?** Proxy'ler çoğu zaman **içerik filtreleme**, **erişim
politikası** ve bazen **önbellekleme (caching)** gibi amaçlarla
kullanılır; her zaman tüm trafiği uçtan uca şifrelemek zorunda
değildir.\
**Basit örnek:** Bir kurumun, belirli kategorideki sitelere erişimi
proxy üzerinden kısıtlaması.\
**Gerçek hayatta nerede görülür?** Kurumsal ağ politikaları, okul
ağları, içerik filtreleme altyapıları.

**Dikkat:** "VPN = her şey şifreli" ifadesi, çoğu kullanımda cihaz-VPN
sunucusu arasını anlatır; "Proxy = her şey şifreli" ise genellikle doğru
değildir. Bu ayrım, bağlantı güvenliğini değerlendirirken kritiktir.

### **6) Temel Ağ Kontrolleri: Firewall, NAT ve Ağ Ayrıştırma**

#### **6.1 Firewall (Güvenlik Duvarı)**

**Kısa tanım:** Firewall, bir ağa giren/çıkan trafiği **önceden tanımlı
kurallara** göre denetleyen yazılım veya donanımdır.\
**Neden önemli?** İstenmeyen trafik akışını durdurarak saldırı yüzeyini
azaltır; Modül 2'deki saldırganların "ağ üzerinden deneme" fırsatlarını
sınırlandırır.\
**Gerçek hayatta nerede görülür?** Ev router'larında temel kurallar,
şirketlerde gelişmiş firewall cihazları; ayrıca Modül 4'teki uç nokta
firewall'ı ile birlikte katmanlı savunma.

#### **6.2 NAT (Network Address Translation)**

**Kısa tanım:** NAT, yerel ağdaki cihazların internete çıkarken ortak
bir dış IP üzerinden görünmesini sağlayan adres çeviri mekanizmasıdır.\
**Neden önemli?** Doğrudan erişimi varsayılan olarak zorlaştırabilir;
ancak **tek başına güvenlik değildir.** Doğru erişim kontrolü ve güncel
yapılandırma gerektirir.\
**Basit örnek:** Evdeki birçok cihazın internet çıkışında tek dış IP ile
görünmesi.\
**Gerçek hayatta nerede görülür?** Ev modemleri, kurumsal ağ geçitleri.

**Dikkat:** NAT bir "firewall" değildir. Bilinçsiz port açma gibi
işlemler saldırı yüzeyini büyütebilir. Bu, Modül 4'teki
"hardening/sıkılaştırma" yaklaşımının ağ tarafındaki karşılığıdır.

#### **6.3 Ağ Ayrıştırma (Segmentation) ve Misafir Ağı**

**Kısa tanım:** Ağ ayrıştırma, ağı bölümlere ayırıp bu bölümler arası
erişimi kurallarla sınırlamaktır.\
**Neden önemli?** Bir bölümde sorun çıksa bile diğer bölümlere yayılmayı
zorlaştırır; riskin "etki" kısmını düşürür (Modül 1 ile ilişkili).\
**Basit örnek:** Akıllı ev cihazlarını ayrı ağda, iş bilgisayarını ayrı
ağda tutmak; misafirleri misafir ağına almak.\
**Gerçek hayatta nerede görülür?** VLAN yapıları, IoT ağı, misafir ağı,
sunucu segmentleri.

Bir sonraki modülde olay analizinde "hangi segmentten geldi?" sorusu,
olayın kapsamını anlamada temel sorulardan biri olacak.

### **7) Kriptografiye Giriş: Veriyi Gizli ve Değişmez Tutmak**

Bu bölüm saldırı öğretmez; veriyi korumanın mantığını öğretir. Modül
1'deki **gizlilik** ve **bütünlük** ilkelerini teknik mekanizmalara
bağlar.

#### **7.1 Şifreleme Temelleri (Plaintext, Ciphertext, Key)**

-   **Plaintext (Düz metin):** Okunabilir ham veri.

-   **Ciphertext (Şifreli metin):** Şifreleme sonrası anlamsız görünen
    veri.

-   **Key (Anahtar):** Şifreleme/çözme için gereken gizli bilgi.

**Neden önemli?** Ağ üzerinde veri taşınırken "dinlenme" ve
"değiştirilme" riskleri vardır. Şifreleme, gizliliğin güçlü
koruyucularından biridir.\
**Basit örnek:** Bir mesajı kilitleyip sadece anahtarı olanın
açabilmesi.\
**Gerçek hayatta nerede görülür?** Web trafiğinde TLS/HTTPS, dosya
şifreleme, mesajlaşma uygulamaları.

#### **7.2 HTTPS ve SSL/TLS (Şifreli İletişim)**

**Kısa tanım:** HTTPS, HTTP'nin TLS ile güvenli hale getirilmiş
sürümüdür; tarayıcı ile site arasındaki trafiğin şifrelenmesine yardımcı
olur.\
**Neden önemli?** TLS; iletişimin **şifrelenmesini** ve çoğu senaryoda
**bütünlük/kimlik doğrulama** kontrollerini destekler.\
**Basit örnek:** Giriş sayfasında kilit simgesi görmenin temel nedeni,
bağlantının şifreli kurulmuş olmasıdır.\
**Gerçek hayatta nerede görülür?** E-posta oturumları, ödeme sayfaları,
kurumsal portallar.

**Dikkat:** HTTPS, bağlantıyı korur; sitenin içeriğinin "iyi niyetli"
olduğunu %100 garanti etmez. Bu ayrım, Modül 2'deki sosyal mühendislik
ve Modül 4'teki tarayıcı hijyeni ile birlikte değerlendirilmelidir.

#### **7.3 Simetrik ve Asimetrik Şifreleme**

**Simetrik şifreleme**

-   **Kısa tanım:** Şifreleme ve çözme için **aynı anahtar** kullanılır.

-   **Neden önemli?** Genellikle hızlıdır; büyük veri için pratiktir.

-   **Basit örnek:** Aynı anahtarla kilitlenen ve açılan bir kasa gibi.

-   **Gerçek hayatta:** AES gibi algoritmalar, veri şifreleme.

**Asimetrik şifreleme**

-   **Kısa tanım:** Birbiriyle ilişkili iki anahtar vardır: **Public Key
    (açık anahtar)** ve **Private Key (özel anahtar)**. Public key ile
    şifrelenen veri, ilgili private key ile çözülür.

-   **Neden önemli?** Anahtar paylaşımı problemini farklı bir yaklaşımla
    çözer; kimlik doğrulama/anahtar değişimi gibi süreçlerde temel rol
    oynar.

-   **Basit örnek:** Herkesin kilitleyebildiği ama sadece sahibinin
    açabildiği bir posta kutusu gibi.

-   **Gerçek hayatta:** RSA gibi algoritmalar; TLS/HTTPS'in başlangıç
    aşamalarındaki anahtar değişimi mantıkları.

Bir sonraki modülde (izleme ve olay yönetimi) şifreli trafik görünürlüğü
ve "ne zaman şifre çözülmez/çözülmemeli?" gibi operasyonel güvenlik
düşünceleri daha sistematik ele alınır.

#### **7.4 Hashing (Karma) ve Veri Bütünlüğü**

**Kısa tanım:** Hashing, veriden sabit uzunlukta bir "özet/parmak izi"
üretir.\
**Neden önemli?** Veri bütünlüğünü doğrulamakta kullanılır: Veride küçük
bir değişiklik bile hash sonucunu kökten değiştirir.\
**Basit örnek:** Bir belgenin hash'ini not edip daha sonra aynı belgenin
hash'i değişti mi diye kontrol etmek.\
**Gerçek hayatta nerede görülür?** Dosya doğrulama, dijital imza
mantıkları, log bütünlüğü, parola saklama.

**Dikkat (şifreleme ≠ hashing):** Şifreleme geri döndürülebilir
(anahtarla çözülür); hashing tek yönlü tasarlanır. Bu farkı bilmek, veri
koruma kararlarında temel bir ayrımdır.

#### **7.5 Parola Güvenliği: Salt ve Rainbow Table Mantığı**

**Kısa tanım:** Güvenli sistemler parolanın kendisini değil, parolanın
**salt** ile birlikte üretilmiş hash değerini saklamayı hedefler. Salt,
aynı parolanın her kullanıcıda farklı hash üretmesini sağlar.\
**Neden önemli?** Salt, önceden hesaplanmış hash listeleri (rainbow
table yaklaşımı) gibi yöntemlerin etkisini azaltır. Bu, Modül 3'teki
parola güvenliğiyle doğrudan ilişkilidir.\
**Basit örnek:** Aynı şifreyi kullanan iki farklı hesabın hash'lerinin
aynı çıkmaması, saldırganın toplu tahmin/karşılaştırma avantajını
azaltır.\
**Gerçek hayatta nerede görülür?** Kimlik doğrulama sistemleri, parola
depolama standartları.

### **8) Temel Ağ Hijyeni Kontrol Listesi (Başlangıç Seviyesi)**

-   Modem/router **yönetici parolasını** değiştirin; mümkünse çok
    faktörlü koruma/ek güvenlik seçeneklerini etkinleştirin.

-   Modem/router ve cihazlarınızın **güncellemelerini** ertelemeyin
    (Modül 4 ile bağlantılı).

-   **Misafir ağı** kullanın; IoT/akıllı cihazları ayrı segmentte
    tutmayı düşünün (segmentation).

-   Gereksiz servis/özellikleri kapalı tutun; port açma gibi işlemleri
    ihtiyaç ve risk mantığıyla değerlendirin (Modül 1 + Modül 4
    hardening).

-   Güvensiz ağlarda kritik işlemleri azaltın; gerekiyorsa VPN gibi
    yöntemleri bilinçli kullanın; ancak VPN'in sınırlarını unutmayın.

-   Tarayıcı sertifika uyarılarını ciddiye alın; URL/doğrulama
    alışkanlıklarını sürdürün (Modül 4 ile bağlantılı).

## **Terimler Sözlüğü (Glossary)**

  **Terim**                  **Türkçe karşılığı / açıklama**
  -------------------------- ---------------------------------------------------------------------------------------------------
  Network                    Ağ; cihazların veri alışverişi yaptığı iletişim ortamı
  Packet                     Paket; ağ üzerinde taşınan veri birimi
  IP Address                 IP adresi; ağdaki cihazların adresi
  IPv4 / IPv6                IP adresleme sürümleri; IPv4 noktalı, IPv6 daha uzun biçimde yazılır
  Subnet                     Alt ağ; IP'lerin gruplara ayrıldığı ağ bölümü
  CIDR                       IP blok gösterimi; ör. /24 ile ağ büyüklüğünü belirtir
  Port                       Port; aynı IP üzerindeki hizmetleri ayırt eden numaralı kapı
  Protocol                   Protokol; iletişim kuralları standardı
  TCP / UDP                  TCP: bağlantı yönelimli güvenilir; UDP: bağlantısız hız odaklı
  DNS                        Alan adlarını IP'ye çeviren sistem
  Modem                      Dış bağlantı sinyalini dijital veriye çeviren ve ağa giriş kapısı oluşturan cihaz
  Router                     Yönlendirici; ağlar arası trafiği IP'lerle yöneten cihaz
  Switch                     Anahtar; yerel ağ içinde trafiği dağıtan cihaz
  Firewall                   Güvenlik duvarı; trafiği kural tabanlı denetleyen sistem
  Network Firewall           Ağ güvenlik duvarı; ağ giriş/çıkışında trafiği denetleyen firewall
  NAT                        Ağ adres çevirisi; yerel ağın dış ağla adres dönüşümü
  Segmentation               Ağ ayrıştırma; ağı bölümlere ayırıp erişimi kısıtlama
  Guest Network              Misafir ağı; ana ağdan ayrılmış sınırlı erişimli ağ
  Wi-Fi                      Kablosuz yerel ağ teknolojisi
  WPA2 / WPA3                Wi-Fi güvenlik standartları; şifreleme/kimlik doğrulama sağlar
  VPN                        Sanal özel ağ; cihaz-VPN sunucusu arasında şifreli tünel yaklaşımı
  Proxy                      Aracı sunucu; istekleri kullanıcı adına iletebilir, filtreleme/önbellekleme amaçlı kullanılabilir
  Sniffing                   Ağ trafiğini dinleme/izleme faaliyeti; özellikle güvensiz ağlarda risk doğurur
  Plaintext                  Düz metin; şifrelenmemiş okunabilir veri
  Ciphertext                 Şifreli metin; şifreleme sonrası okunamaz görünen veri
  Key                        Anahtar; şifreleme/çözme için gerekli bilgi
  Encryption / Decryption    Şifreleme / Şifre çözme
  Symmetric Encryption       Simetrik şifreleme; aynı anahtar ile şifreleme/çözme
  Asymmetric Encryption      Asimetrik şifreleme; public/private key çifti ile çalışma
  Public Key / Private Key   Açık anahtar / Özel anahtar
  Hashing                    Karma; veriden sabit uzunlukta özet üretme (tek yönlü)
  Salt                       Tuzlama; parola hash'inden önce eklenen rastgele değer
  Rainbow Table              Önceden hesaplanmış hash tablolarına dayanan parola tahmin yaklaşımı
  SSL/TLS                    İletişimi şifrelemek ve bütünlük/kimlik doğrulama sağlamak için kullanılan protokoller
  HTTPS                      TLS ile güvenli hale getirilmiş web iletişimi

## **Test Soruları (En fazla 10)**

1.  IP adresinin temel amacı aşağıdakilerden hangisidir?\
    A) Dosyaları sıkıştırmak\
    B) Ağ üzerindeki cihazları adreslemek ve trafiğin kaynağını/hedefini
    belirlemek\
    C) Parola üretmek\
    D) Ekran çözünürlüğünü artırmak\
    **Doğru Cevap: B**\
    Açıklama: IP adresi, ağ iletişiminde "kimden kime?" sorusunun temel
    cevabıdır.

2.  "IP bina adresi ise port daire numarası gibidir" benzetmesi neyi
    anlatır?\
    A) IP'nin sadece kablosuz ağlarda çalıştığını\
    B) Portların aynı IP üzerindeki farklı hizmetleri ayırt ettiğini\
    C) DNS'in bir dosya türü olduğunu\
    D) VPN'in virüs temizlediğini\
    **Doğru Cevap: B**\
    Açıklama: Aynı IP'de birden fazla hizmet olabilir; port hangi
    hizmete gidileceğini belirler.

3.  TCP ve UDP arasındaki temel fark hangisidir?\
    A) TCP hız odaklıdır, UDP teslim garantilidir\
    B) TCP bağlantı kurup güvenilir iletim sağlar; UDP bağlantısız ve
    hız odaklıdır\
    C) İkisi de aynı şekilde çalışır\
    D) UDP sadece web sitelerinde kullanılır\
    **Doğru Cevap: B**\
    Açıklama: TCP güvenilirlik mekanizmaları kullanır; UDP daha az
    kontrolle hız sağlar.

4.  DNS'nin temel görevi nedir?\
    A) Dosyaları şifrelemek\
    B) Alan adlarını IP adreslerine çevirmek\
    C) Antivirüs taraması yapmak\
    D) Bilgisayarı hızlandırmak\
    **Doğru Cevap: B**\
    Açıklama: DNS, kullanıcıların kolay hatırladığı alan adlarını ağın
    kullandığı IP'lere çevirir.

5.  Misafir ağı (guest network) kullanmanın en önemli güvenlik faydası
    nedir?\
    A) İnternet hızını iki katına çıkarır\
    B) Misafir cihazlarını ana ağdan ayırarak etkiyi sınırlar\
    C) Parolayı gereksiz kılar\
    D) DNS'i devre dışı bırakır\
    **Doğru Cevap: B**\
    Açıklama: Ayrıştırma, bir bölümde sorun olsa bile diğer bölümlere
    yayılmayı zorlaştırır (Modül 1'deki risk/etki mantığıyla
    ilişkilidir).

6.  Firewall sistemleri trafiği neye göre denetler?\
    A) Kullanıcının yaşına göre\
    B) Önceden tanımlanmış güvenlik kurallarına göre\
    C) Bilgisayarın markasına göre\
    D) Elektrik tüketimine göre\
    **Doğru Cevap: B**\
    Açıklama: Firewall, izin verilen ve yasaklanan kurallar listesine
    göre trafiği filtreler.

7.  VPN ile ilgili en doğru ifade hangisidir?\
    A) VPN her koşulda tam anonimlik garantisi verir\
    B) VPN, cihaz ile VPN sunucusu arasında şifreli tünel kurabilir;
    ancak tek başına tüm riskleri çözmez\
    C) VPN, DNS'i devre dışı bırakır\
    D) VPN, sadece yerel ağ içinde çalışır\
    **Doğru Cevap: B**\
    Açıklama: VPN şifreli tünel sağlayabilir; fakat uç nokta güvenliği
    ve kimlik bilgisi hijyeni gibi faktörler hâlâ kritiktir.

8.  Proxy kullanmanın ana amaçlarından biri aşağıdakilerden hangisi
    olabilir?\
    A) İşlemci sıcaklığını düşürmek\
    B) Kullanıcı ile internet arasında aracı olarak trafiği
    yönetmek/filtrelemek\
    C) Veriyi kalıcı olarak silmek\
    D) Klavye vuruşlarını kaydetmek\
    **Doğru Cevap: B**\
    Açıklama: Proxy, erişim kontrolü ve filtreleme gibi amaçlarla aracı
    katman olarak kullanılabilir.

9.  Aşağıdakilerden hangisi tek yönlü olması hedeflenen ve veri
    bütünlüğüyle ilişkilendirilen bir işlemdir?\
    A) Simetrik şifreleme\
    B) Asimetrik şifreleme\
    C) Hashing (karma)\
    D) VPN bağlantısı\
    **Doğru Cevap: C**\
    Açıklama: Hash, verinin özetini üretir; veride değişiklik olursa
    hash sonucu belirgin biçimde değişir.

10. Parola güvenliğinde "salt" kullanmanın temel faydası hangisidir?\
    A) Parolayı herkesin okuyabilmesini sağlamak\
    B) Aynı parolaların aynı hash üretmesini sağlamak\
    C) Aynı parolaların farklı hash üretmesini sağlayarak önceden
    hesaplanmış tabloların etkisini azaltmak\
    D) VPN hızını artırmak\
    **Doğru Cevap: C**\
    Açıklama: Salt, parola hash'lerinin kullanıcılar arasında benzersiz
    olmasını destekleyerek toplu karşılaştırma/ön-hesaplama avantajını
    azaltır.

## **Bu Modülde Neler Öğrendik**

-   Ağ güvenliğinin, Modül 1'deki CIA üçlüsünü ağ katmanında hayata
    geçirdiğini ve Modül 3--4'teki güvenliği tamamladığını öğrendik.

-   IP, subnet/CIDR, port ve protokol kavramlarını; TCP ve UDP'nin
    farklarını güvenlikle ilişkilendirdik.

-   DNS'nin alan adlarını IP'ye çevirdiğini ve yanlış yönlendirme
    riskinin hesap/tarayıcı güvenliğiyle bağlantısını kurduk.

-   Modem, router ve switch'in temel rollerini ve ağın "kontrol
    noktaları" olduğunu kavradık.

-   Wi-Fi güvenliği için WPA2/WPA3, misafir ağı ve modem güncelliği gibi
    pratikleri benimsedik.

-   VPN ve proxy'nin kavramsal amaçlarını, faydalarını ve sınırlarını
    ayırt ettik.

-   Firewall, NAT ve ağ ayrıştırmanın saldırı yüzeyi ve risk üzerindeki
    etkisini yorumladık.

-   Kriptografide plaintext/ciphertext/key kavramlarını,
    simetrik/asimetrik şifrelemeyi ve hash/salt'ın bütünlük ile parola
    güvenliğindeki rolünü öğrendik.

-   Bir sonraki modülde loglama/izleme ve olay yönetimi konularına
    geçerken, bu ağ kavramlarının "normal/anormal" ayrımı için temel
    olacağını gördük.

## **Modül 6 --- Siber Güvenlikte Etik, Hukuk ve Uyumluluk**

**(Etik Hackerlık, Siber Suçlar, KVKK/GDPR, ISO 27001, Sorumlu Bildirim
ve Veri İhlali Yönetimi)**

Bu modül, siber güvenliğin yalnızca teknik kontrollerden ibaret
olmadığını; etik ilkeler, hukuki sınırlar ve uyumluluk gereklilikleriyle
birlikte anlam kazandığını ele alır. Önceki modüllerde öğrendiğiniz
hesap güvenliği (Modül 3), cihaz/yazılım güvenliği (Modül 4) ve
ağ/kriptografi temelleri (Modül 5), burada "meşru yetki + doğru amaç +
zarar vermeme + veri koruma" çerçevesine oturtulur. Bir sonraki modülde
olay yönetimi ve müdahale süreçlerine ilerlerken (loglama, tespit,
sınırlama, bildirim ve ilk adımlar), bu modülde kurduğunuz
etik-hukuk-uyum temeli kritik bir pusula olacaktır.

## **Modül Amaçları**

Bu modülü tamamlayan bir öğrenci:

-   Etik hackerlık yaklaşımını ve "yetki + kapsam" mantığını,
    profesyonel sınırlar içinde açıklayabilir.

-   "Hacker" kavramının tarihsel/teknik anlamını ve beyaz--siyah--gri
    şapka ayrımını motivasyon ve yasallık açısından ayırt edebilir.

-   KVKK ve GDPR çerçevesinde kişisel veri kavramını, temel rolleri
    (veri sorumlusu/veri işleyen) ve veri işleme ilkelerini örneklerle
    yorumlayabilir.

-   Veri ihlali kavramını (gizlilik--bütünlük--erişilebilirlik
    etkileriyle) tanımlar; bildirim ve kayıt tutma disiplininin neden
    zaman baskısı altında önemli olduğunu analiz edebilir.

-   ISO/IEC 27001'in kurumlarda Bilgi Güvenliği Yönetim Sistemi
    (BGYS/ISMS) kurmadaki rolünü ve "sadece teknik değil süreç + insan +
    politika" yaklaşımını kavrayabilir.

-   Sorumlu açıklama (coordinated vulnerability disclosure) kapsamında,
    güvenli ve yapıcı bir zafiyet bildirimi taslağı oluşturabilir.

## **Ana İçerik**

### **1) Büyük Resim: Etik ve Hukuk Neden Siber Güvenliğin Parçası?**

Önceki modüllerde, sistemi teknik olarak daha güvenli hale getiren yapı
taşlarını gördünüz:

-   Modül 3'te kimlik/hesap güvenliğiyle "kimin eriştiğini",

-   Modül 4'te cihaz ve yazılım sıkılaştırma ile "cihazın
    dayanıklılığını",

-   Modül 5'te ağ ve kriptografiyle "verinin yolculuğunu ve korunmasını"
    ele aldınız.

Ancak gerçek dünyada siber güvenlik çalışmaları şu sorulara cevap vermek
zorundadır:

-   **Yetkim var mı?** (Yetkilendirme)

-   **Neye izinliyim, sınırım ne?** (Kapsam)

-   **İncelediğim/verdiğim raporlar kime zarar verebilir?** (Zarar
    vermeme)

-   **Gördüğüm veriyi nasıl koruyacağım?** (Gizlilik/mahremiyet)

-   **Bir olay olursa neyi, nasıl kayıt altına alacağım ve kime
    bildireceğim?** (Sorumluluk)

Bu bakış, Modül 1'deki risk anlayışıyla doğrudan bağlantılıdır: "Risk =
olasılık × etki." Etik ve hukuk, yanlış adımların **etkisini** büyüten
(mağduriyet, itibar kaybı, yaptırımlar, iş sürekliliği kaybı) bir risk
alanıdır.

**Dikkat --- "Teknik olarak yapabiliyorum" ≠ "Yapmaya hakkım var"**\
Bir zafiyeti teknik olarak bulabilmek bir beceridir; fakat **izinsiz
erişim** veya **izinsiz veri toplama**, iyi niyet iddiasıyla bile ciddi
sonuçlar doğurabilir. Profesyonel güvenlik çalışması **yetki ve kapsam**
ile başlar.

### **2) Etik Hackerlık: Kavram, Şapkalar ve Profesyonel Duruş**

#### **2.1 Hacker Kavramının Tanımı ve Evrimi**

**Kısa tanım:** "Hacker" kelimesi tarihsel olarak, sistemleri
derinlemesine anlayan, sınırlarını test eden ve yaratıcı çözümler üreten
kişileri ifade ederdi. Zamanla medyada sıklıkla "izinsiz giren suçlu"
anlamında kullanıldığı için kavram bulanıklaşmıştır.\
**Neden önemli?** Etik ve hukuk konuşurken, "hacker" kelimesinin tek bir
anlama gelmediğini bilmek, mesleki kimliği doğru kurmayı sağlar.\
**Basit örnek:** Bir kişi bir yazılımı inceleyip güvenlik açığını
raporlayabilir; başka biri aynı açığı izinsiz kullanıp zarar verebilir.
İkisi aynı teknik bilgiye yaklaşsa da **niyet, izin ve yöntem**
farklıdır.\
**Gerçek hayatta nerede görülür?** İş ilanları ("penetration tester",
"security analyst"), haber dili, bug bounty programları, akademik
literatür.

#### **2.2 Şapka Türleri: Beyaz, Siyah ve Gri**

Bu sınıflandırmada belirleyici üç ölçüt vardır: **izin**, **motivasyon**
ve **yasallık**.

**Beyaz Şapkalı (Etik) Hacker**

-   **Kısa tanım:** Sistem sahibinden **yazılı izin** alarak güvenliği
    artırmak amacıyla test yapan uzmandır.

-   **Neden önemli?** Etik çalışma, Modül 1'deki CIA üçlüsünü korumayı
    hedefler; zarar üretmez, risk azaltır.

-   **Basit örnek:** Bir kurum, "yalnızca example.com üzerinde, mesai
    saatleri dışında, veri kopyalamadan" test izni verir. Uzman
    bulguları raporlar, düzeltme önerir.

-   **Gerçek hayatta nerede görülür?** Sızma test sözleşmeleri, "Rules
    of Engagement (ROE)" dokümanları, bug bounty kapsam metinleri.

**Siyah Şapkalı Hacker**

-   **Kısa tanım:** Kişisel çıkar, maddi kazanç veya zarar verme
    amacıyla sistemlere izinsiz giren kişidir.

-   **Neden önemli?** Modül 2'de gördüğünüz saldırı motivasyonları ve
    siber suç ekosistemi, burada "yasallık dışı" eksenine oturur.

-   **Basit örnek:** Bir kişinin izinsiz biçimde bir e-ticaret
    sisteminden ödeme verisi almaya çalışması.

-   **Gerçek hayatta nerede görülür?** Fidye yazılımı olayları, veri
    sızıntısı pazarları, hesap ele geçirme girişimleri.

**Gri Şapkalı Hacker**

-   **Kısa tanım:** Bazen iyi niyetli olsa bile **izin almadan** sisteme
    müdahale eden kişidir. Zarar vermese bile izinsiz işlem nedeniyle
    hukuki risk taşır.

-   **Neden önemli?** "İyi niyet" tek başına güvenli bir kalkan
    değildir; yetki/kapsam olmadan yapılan eylemler, özellikle veriyle
    temas ettiğinde ağır sonuç doğurabilir.

-   **Basit örnek:** Bir web sitesinde açık bulan kişinin, izinsiz
    biçimde sisteme girip "kanıt" üretmesi ve sonra bildirmesi.

**İpucu --- Yetki ve kapsamı yazılı hale getirin**\
Sözlü anlaşmalar yanlış anlaşılabilir. Basit bir e-posta onayı veya
imzalı doküman; hedefleri, yöntem sınırlarını, zaman penceresini ve
raporlama kanalını netleştirir.

#### **2.3 Ek Bir Kavram: Script Kiddie**

**Kısa tanım:** Derin teknik anlayışı sınırlı olup, çoğunlukla hazır
araçları/komutları deneme-yanılma ile kullanan kişidir.\
**Neden önemli?** Risk yönetiminde (Modül 1) "tehdit aktörü"
çeşitliliğini anlamak, savunma önceliklerini etkiler.\
**Basit örnek:** İnternette bulduğu bir aracı, ne yaptığını tam
anlamadan rastgele hedeflere uygulayan kişi.\
**Gerçek hayatta nerede görülür?** Basit tarama denemeleri, zayıf parola
denemeleri, yanlış yapılandırılmış servislerin "kolay hedef" görülmesi.

### **3) Etik İlkeler: Yetkilendirme, Kapsam, Gizlilik ve Zarar Vermeme**

#### **3.1 Yetkilendirme (Authorization) ve Kapsam (Scope)**

**Kısa tanım:**

-   **Yetkilendirme:** Bir sistem üzerinde güvenlik çalışması yapma
    iznidir.

-   **Kapsam:** Bu iznin sınırlarıdır (hangi sistemler, hangi yöntemler,
    hangi zaman aralığı, hangi veri türleri, hangi raporlama kanalı).\
    **Neden önemli?** Kapsam dışına taşmak; istemeden hizmet kesintisi,
    veri ihlali veya hukuki sorun üretme riskini artırır.\
    **Basit örnek:** "Sadece example.com web uygulaması" izinliyse, aynı
    altyapıdaki "api.example.com" kapsam dışı olabilir.\
    **Gerçek hayatta nerede görülür?** Sızma test sözleşmeleri, ROE
    dokümanları, bug bounty kapsam sayfaları.

**Dikkat --- Kapsam dışı 1 adım, tüm çalışmayı riskli hale
getirebilir**\
Bir sistemde teknik olarak "görülebilen" her şey izinli değildir. Kapsam
dışı bir loga bakmak bile kişisel veri temasına yol açabilir.

#### **3.2 Zarar Vermeme (Non-maleficence) ve Minimum Müdahale**

**Kısa tanım:** Güvenlik çalışmasının amacı "göstermek" değil
"korumaktır". Minimum müdahale, sistemi gereksiz yere zorlamamayı ve
hizmet sürekliliğini bozmamayı hedefler.\
**Neden önemli?** Modül 5'te konuştuğunuz ağ/servis yapıları aşırı yükte
kesintiye girebilir; bu da CIA'nın **erişilebilirlik** boyutunu ihlal
edebilir.\
**Basit örnek:** Üretim sistemine yoğun istek atmak yerine test ortamı
kullanmak veya bakım penceresi belirlemek.\
**Gerçek hayatta nerede görülür?** Üretim--test ayrımı, bakım
pencereleri, kontrollü test planları.

#### **3.3 Gizlilik (Confidentiality) ve "Bildiğini Paylaşmama" Disiplini**

**Kısa tanım:** Güvenlik çalışmasında görülen bilgiler "iş için gerekli
minimum kişi" ile paylaşılmalıdır.\
**Neden önemli?** Modül 3'teki kimlik verileri ve Modül 4'teki cihaz
bilgileri sızarsa, zarar teknik bulgudan daha büyük olabilir.\
**Basit örnek:** Ekran görüntüsü paylaşmanız gerekiyorsa, kullanıcı
adı/e-posta/kimlik benzeri alanları maskeleyerek paylaşmak.\
**Gerçek hayatta nerede görülür?** Olay raporları, redaksiyon
uygulamaları, erişim logları, gizlilik sözleşmeleri (NDA).

#### **3.4 Sorumlu Açıklama (Coordinated Vulnerability Disclosure)**

**Kısa tanım:** Zafiyet bulunduğunda, ilgili tarafla koordineli iletişim
kurup düzeltme için makul süre tanıyarak açıklama yapmak.\
**Neden önemli?** Amaç, düzeltme yapılmadan önce riski büyütmemek;
saldırganlara "hazır hedef" sunmamaktır.\
**Basit örnek:** Bir web uygulamasında kritik hata bulduğunuzda, sosyal
medyada paylaşmak yerine ilgili güvenlik kanalına teknik ama zarar
vermeyecek ayrıntıda rapor iletmek.\
**Gerçek hayatta nerede görülür?** Ürün güvenliği e-postaları, bug
bounty süreçleri, kurumsal güvenlik bildirim kanalları.

**Basit Zafiyet Bildirimi Taslağı (E-posta formatı)**

-   **Konu:** "example.com --- Güvenlik bildirimi (kapsam dahilinde)"

-   **İçerik:**

    -   Özet: Etki (CIA ile) ve risk seviyesi

    -   Etkilenen bileşen: URL/ekran (gerekirse maskeleme)

    -   Yeniden üretme adımları (zarar vermeyecek şekilde)

    -   Beklenen davranış vs. mevcut davranış

    -   Önerilen düzeltme yönü (tavsiye niteliğinde)

    -   İletişim bilgisi ve koordinasyon isteği

### **4) Siber Hukuk: Siber Suçlar ve Delil Mantığı**

#### **4.1 Siber Suç Kavramı (Yetkisiz Erişim ve Sistemle İlgili Eylemler)**

**Kısa tanım:** Siber suçlar; bir bilişim sistemine hukuka aykırı
şekilde girmek, sistemde kalmak, verileri bozmak/değiştirmek/yok etmek
veya erişimi engellemek gibi eylemleri kapsar.\
**Neden önemli?** Etik ve hukuk, "teknik deneme" ile "suç" arasındaki
sınırı belirler. Türkiye'de "bilişim sistemine girme" suçu Türk Ceza
Kanunu'nda düzenlenir; izinsiz erişimin suç tipi olarak ele alındığı
akademik/hukuki kaynaklarda bu çerçeve ayrıntılandırılır.\
**Basit örnek:** Başkasının e-posta hesabına izinsiz giriş yapmak,
"yetkisiz erişim" çerçevesinde değerlendirilir.\
**Gerçek hayatta nerede görülür?** Hesap ele geçirme, kurumsal
sistemlere izinsiz erişim, yetkisiz veri görüntüleme.

**Dikkat --- "İyi niyetliydim" savunması sınırları otomatik kaldırmaz**\
Yetkisiz erişim, zarar verilmemiş olsa bile hukuki risk doğurabilir.
Profesyonel refleks: **izin + kapsam + kayıt + sorumlu bildirim**.

#### **4.2 Dijital Adli Bilişim (Digital Forensics) Neden Önemli?**

**Kısa tanım:** Dijital adli bilişim; olay sonrası delil toplama, koruma
ve analiz disiplinidir.\
**Neden önemli?** Bir olay yaşandığında, "ne oldu?" sorusunu yanıtlamak
kadar, bunun **kanıt değerini bozmadan** yönetmek de kritiktir. Bu
nokta, bir sonraki modülde ele alacağınız olay yönetimi süreçlerine
doğrudan bağlanır.\
**Basit örnek:** Panikle logları silmek yerine, önce erişimi sınırlayıp
zaman çizelgesi oluşturmak ve kayıtları korumak.\
**Gerçek hayatta nerede görülür?** Kurumsal olay müdahale ekipleri,
hukuki süreçler, iç denetimler.

### **5) KVKK ve GDPR: Kişisel Veri, Roller ve İlkeler**

#### **5.1 Kişisel Veri ve Özel Nitelikli Veri**

**Kısa tanım:**

-   **Kişisel veri:** Kimliği belirli veya belirlenebilir bir kişiyle
    ilişkilendirilebilen bilgi.

-   **Özel nitelikli veri:** İfşa olduğunda daha ağır sonuç
    doğurabilecek hassas veri kategorileri.\
    **Neden önemli?** Modül 1'deki "gizlilik" ilkesi, kişisel veriler
    söz konusu olduğunda doğrudan hukuki yükümlülüğe dönüşür.\
    **Basit örnek:** Bir üyelik sistemindeki ad-soyad, e-posta, oturum
    kayıtları kişisel veri olabilir.\
    **Gerçek hayatta nerede görülür?** Üyelik formları, okul bilgi
    sistemleri, e-ticaret, çağrı merkezi kayıtları.

Modül 5'teki şifreleme/TLS gibi mekanizmalar gizlilik için önemlidir;
ancak tek başına "uyum" sağlamaz. Uyum, verinin nasıl toplandığı,
kimlerin eriştiği ve ne kadar saklandığıyla da ilgilidir.

#### **5.2 Roller: Veri Sorumlusu ve Veri İşleyen**

**Kısa tanım:**

-   **Veri sorumlusu (data controller):** İşleme amaç ve vasıtalarını
    belirleyen taraf.

-   **Veri işleyen (data processor):** Veri sorumlusunun talimatlarıyla
    onun adına veri işleyen taraf.\
    **Neden önemli?** Sorumlulukların kimde olduğu, aydınlatma
    metinleri, sözleşmeler ve güvenlik tedbirleri bu ayrımla netleşir.\
    **Basit örnek:** Bir etkinlik kayıt formunu yöneten organizasyon
    veri sorumlusu; form verisini barındıran hizmet sağlayıcı veri
    işleyen olabilir (sözleşmeye ve talimatlara bağlı olarak).\
    **Gerçek hayatta nerede görülür?** Bulut servisleri, çağrı merkezi
    hizmeti, dış kaynak yazılım barındırma.

**İpucu --- Rol net değilse süreç de net değildir**\
Rolünüzü belirlemeden veri toplamaya başlamak; aydınlatma, saklama
süresi ve erişim kontrolünde hatalara yol açar.

#### **5.3 KVKK Genel İlkeleri: "Doğru Veri, Doğru Amaç, Doğru Süre"**

**Kısa tanım:** KVKK'da veri işlemede hukuka uygunluk,
doğruluk/güncellik, belirli-açık-meşru amaç, amaçla
bağlantılı-sınırlı-ölçülü olma ve gerekli süre kadar muhafaza gibi
ilkeler öne çıkar.\
**Neden önemli?** "Ne kadar çok veri, o kadar iyi" yaklaşımı yanlıştır;
gereksiz veri gereksiz risk demektir.\
**Basit örnek:** Bülten aboneliğinde sadece e-posta yeterliyken
adres/kimlik istemek ölçülülük ilkesine aykırı risk doğurur.\
**Gerçek hayatta nerede görülür?** Üyelik formları, kampanya kayıtları,
mobil uygulama izinleri.

#### **5.4 GDPR Prensipleri ve Hesap Verebilirlik**

**Kısa tanım:** GDPR, veri işleme ilkelerini sistematik hale getirir:
hukuka uygunluk, amaca bağlılık, veri minimizasyonu, doğruluk, saklama
süresi sınırlaması, bütünlük-gizlilik ve hesap verebilirlik gibi
başlıklar.\
**Neden önemli?** AB ile ilişkili hizmetlerde, prensipler pratik bir
"kontrol listesi" gibi çalışır.\
**Basit örnek:** "Hesap sil" talebi verildiğinde verinin gerçekten
silinmemesi; saklama süresi ve veri sahibinin hakları açısından
uyumsuzluk üretir.\
**Gerçek hayatta nerede görülür?** Çerez tercih ekranları, kullanıcı
hakları başvuruları, veri saklama politikaları.

### **6) Veri İhlali (Data Breach): Tanım, Zaman Baskısı ve İlk Adımlar**

#### **6.1 Veri İhlali Nedir?**

**Kısa tanım:** Kişisel verilerin yetkisiz erişim/ifşa/kayıp/değişiklik
veya erişilemez hale gelmesi gibi veri güvenliğini bozan olaylar.\
**Neden önemli?** CIA üçlüsünün üç boyutu da etkilenebilir:

-   **Gizlilik:** veri sızıntısı

-   **Bütünlük:** veri değiştirme

-   **Erişilebilirlik:** veri kaybı/şifrelenme/servis kesintisi\
    **Basit örnek:** Bir dosya paylaşım bağlantısının yanlışlıkla
    "herkese açık" kalması.\
    **Gerçek hayatta nerede görülür?** Yanlış bulut izinleri, yanlış
    e-posta gönderimi, kaybolan cihaz, zayıf erişim kontrolü.

#### **6.2 "72 Saat" Mantığı: Neden Zaman Kritik?**

**Kısa tanım:** Veri ihlallerinde "gecikmeden hareket etme" esastır;
amaç zararı sınırlamak ve doğru koordinasyon kurmaktır.

-   GDPR, denetim otoritesine bildirimin "gereksiz gecikme olmaksızın"
    ve mümkünse **72 saat içinde** yapılmasını vurgular.

-   KVKK tarafında da Kurul kararlarında veri ihlalinin Kuruma **en kısa
    sürede ve en geç 72 saat içinde** bildirilmesi yaklaşımı yer alır.

**Dikkat --- Bildirim panik değil süreç işidir**\
Hız önemlidir; ama eksik/yanlış bilgi de risktir. Bu yüzden "ne oldu, ne
zaman fark edildi, ilk hangi adımlar atıldı?" kayıtları kritik hale
gelir.

#### **6.3 Başlangıç Seviyesi "İlk 6 Adım" Kontrol Listesi**

1.  **Sınırlama:** Yanlış paylaşımı kapat, erişimleri durdur, gerekirse
    anahtarları/parolaları değiştir.

2.  **Koruma:** Kanıtı bozma (logları silme, cihazı rastgele kurcalama).

3.  **Kayıt:** Zaman çizelgesi oluştur (ilk fark eden, saat,
    belirtiler).

4.  **Kapsam:** Hangi veriler/hangi kullanıcılar etkilenmiş olabilir?

5.  **İletişim:** Yetkili kişileri bilgilendir (sorumlu ekip/kişi).

6.  **Düzeltme:** Kök nedeni gidermeye başla (yanlış izin, zayıf erişim
    kontrolü, gereksiz açık servis vb.).

Bir sonraki modülde bu adımları loglarla nasıl destekleyeceğinizi, olay
sınıflandırmayı ve temel müdahale akışını daha sistematik biçimde ele
alacaksınız.

### **7) Uyum (Compliance) ve Kurumsal Yaklaşım: Veri Yaşam Döngüsü ve ISO/IEC 27001**

#### **7.1 Veri Yaşam Döngüsü (Data Lifecycle) Düşüncesi**

**Kısa tanım:** Veri; toplanır, işlenir, saklanır, paylaşılır,
arşivlenir ve silinir.\
**Neden önemli?** Güvenlik sadece "toplama anında" değil, yaşam
döngüsünün her adımında gereklidir.\
**Basit örnek:** Hesap silinse bile yedeklerde veri kalabilir; bu durum
saklama politikası ve erişim kontrolü gerektirir.\
**Gerçek hayatta nerede görülür?** Yedekleme sistemleri, log saklama,
arşiv süreçleri.

#### **7.2 Minimum Veri (Data Minimization) ve Erişim Kontrolü**

**Kısa tanım:** "Gerekli olanı topla, gerekli olan kadar tut, gerekli
olan kişi görsün."\
**Neden önemli?** Modül 3'teki "en az ayrıcalık" ilkesi veri erişimi
için de geçerlidir.\
**Basit örnek:** Destek ekibinin sadece gerekli alanları görmesi; hassas
alanların maskelenmesi.\
**Gerçek hayatta nerede görülür?** Rol tabanlı erişim (RBAC), ekran
maskeleme, ayrı yetki seviyeleri.

#### **7.3 Şeffaflık: Aydınlatma ve İletişim**

**Kısa tanım:** Kişiye "hangi verim, hangi amaçla, ne kadar süreyle,
kimlerle paylaşılabilir?" bilgilerinin açıkça sunulması yaklaşımıdır.\
**Neden önemli?** Güven ilişkisi ve hesap verebilirlik, teknik önlemler
kadar iletişimle de güçlenir.\
**Basit örnek:** Kayıt formunda kısa bir aydınlatma bağlantısı ve
iletişim kanalı bulundurmak.\
**Gerçek hayatta nerede görülür?** Web formları, mobil izin ekranları,
çerez tercih panelleri.

#### **7.4 ISO/IEC 27001: BGYS/ISMS ve Neden Kurumlar İçin Önemli?**

**Kısa tanım:** ISO/IEC 27001, kurumlarda **Bilgi Güvenliği Yönetim
Sistemi (BGYS/ISMS)** kurmak için kullanılan uluslararası bir
standarttır.\
**Neden önemli?** Güvenliği sadece "teknik araçlar" olarak değil; **risk
yönetimi, politika, süreç, rol ve sorumluluklar, insan faktörü** ile
birlikte yönetmeye zorlar. ISO, bu standardın bilgi güvenliği yönetimi
için en bilinen çerçevelerden biri olduğunu belirtir.\
**Basit örnek:** Kurumun erişim yetkileri, olay yönetimi prosedürü,
varlık envanteri ve eğitim planı gibi konuların "tek bir sistem" altında
yönetilmesi.\
**Gerçek hayatta nerede görülür?** Kurumsal denetimler, tedarikçi
değerlendirmeleri, güvenlik politika setleri, sertifikasyon süreçleri.

## **Terimler Sözlüğü (Glossary)**

  **Terim**                              **Türkçe karşılığı / açıklama**
  -------------------------------------- ----------------------------------------------------------------------------
  Ethics                                 Etik; meslekte doğru-yanlış davranış ilkeleri ve sorumluluk
  Compliance                             Uyumluluk; yasa/politika/standartlara uygun hareket etme
  Hacker                                 Sistemleri derinlemesine anlayan kişi; bağlama göre anlamı değişebilir
  White Hat                              Beyaz şapka; izinli ve güvenlik artırma amaçlı çalışan etik uzman
  Black Hat                              Siyah şapka; izinsiz ve zarar/çıkar amaçlı hareket eden kişi
  Grey Hat                               Gri şapka; iyi niyet iddiası olsa da izinsiz müdahale eden kişi
  Script Kiddie                          Hazır araçlarla deneme yapan, derin teknik bilgisi sınırlı kişi
  Authorization                          Yetkilendirme; bir işlemi yapma izninin verilmesi
  Scope                                  Kapsam; izinli çalışmanın sınırları (hedef, yöntem, zaman, veri)
  ROE (Rules of Engagement)              Çalışmanın kuralları; testin nasıl yürütüleceğini belirleyen çerçeve
  Non-maleficence                        Zarar vermeme; sistemi gereksiz riske sokmama ilkesi
  Confidentiality                        Gizlilik; yetkisiz kişilerin veriye erişememesi
  Redaction                              Maskeleme/redaksiyon; hassas bilgileri paylaşım öncesi gizleme
  Coordinated Vulnerability Disclosure   Sorumlu/koordineli zafiyet bildirimi yaklaşımı
  Pentest                                Sızma testi; izinli saldırı simülasyonu ile güvenlik değerlendirmesi
  Cyber Law                              Siber hukuk; bilişim sistemleri üzerinden eylemleri düzenleyen hukuk alanı
  Digital Forensics                      Dijital adli bilişim; delil toplama/koruma/analiz disiplini
  KVKK                                   Türkiye kişisel verileri koruma çerçevesi (6698)
  GDPR                                   AB Genel Veri Koruma Tüzüğü; veri koruma ilkeleri ve yükümlülükler
  Data Controller                        Veri sorumlusu; işleme amaç/vasıtalarını belirleyen taraf
  Data Processor                         Veri işleyen; veri sorumlusu adına işleyen taraf
  Data Breach                            Veri ihlali; yetkisiz erişim/ifşa/kayıp/değişiklik/erişilemezlik olayı
  Data Minimization                      Veri minimizasyonu; gerekli olan kadar veri toplama ve tutma
  Accountability                         Hesap verebilirlik; ilkelere uyduğunu gösterebilme sorumluluğu
  ISO/IEC 27001                          Bilgi Güvenliği Yönetim Sistemi standardı (BGYS/ISMS)
  ISMS                                   Bilgi Güvenliği Yönetim Sistemi; süreç ve kontrollerin yönetim çerçevesi

## **Test Soruları**

1.  Aşağıdakilerden hangisi "yetkilendirme" kavramını en doğru ifade
    eder?\
    A) İnternette herkese açık bilgileri okumak\
    B) Bir sistem üzerinde güvenlik çalışması yapma izninin olması\
    C) Güçlü parola kullanmak\
    D) Antivirüs kurmak\
    **Doğru Cevap: B**\
    Açıklama: Yetkilendirme, etik ve hukuki sınırın temelidir; izin
    olmadan yapılan müdahale risklidir.

2.  "Kapsam (scope)" neden kritik kabul edilir?\
    A) Testin daha uzun sürmesini sağladığı için\
    B) Kapsam dışına çıkmayı ve istemeden zarar/hukuki sorun oluşturmayı
    önlediği için\
    C) Şifreleri otomatik güçlendirdiği için\
    D) Ağ hızını artırdığı için\
    **Doğru Cevap: B**\
    Açıklama: Kapsam, hangi hedeflerin ve yöntemlerin izinli olduğunu
    netleştirir.

3.  Yazılı izin almış ve amacı güvenliği artırmak olan uzman hangi
    sınıfa girer?\
    A) Siyah şapkalı\
    B) Gri şapkalı\
    C) Beyaz şapkalı\
    D) Script kiddie\
    **Doğru Cevap: C**\
    Açıklama: Beyaz şapka, izinli ve güvenliği artırma amaçlı
    profesyonel çalışmayı ifade eder.

4.  "İyi niyetle bir sistemdeki açığı bulup izin almadan sisteme girerek
    kanıt üretmek" hangi açıdan en doğru değerlendirilir?\
    A) Tamamen serbesttir; niyet yeterlidir\
    B) İzinsiz olduğu için hukuki risk üretir ve etik çerçeveye
    aykırıdır\
    C) Her zaman ISO 27001'e uygundur\
    D) KVKK ve GDPR'ı otomatik olarak karşılar\
    **Doğru Cevap: B**\
    Açıklama: İzin/kapsam yoksa iyi niyet iddiası sınırları otomatik
    kaldırmaz.

5.  "Veri sorumlusu" rolü aşağıdakilerden hangisidir?\
    A) Sadece veriyi depolayan taraf\
    B) Kişisel verilerin işleme amaç ve vasıtalarını belirleyen taraf\
    C) Sadece internet servis sağlayıcısı\
    D) Sadece güvenlik duvarını yöneten kişi\
    **Doğru Cevap: B**\
    Açıklama: Veri sorumlusu "neden ve nasıl işlendiğini" belirler;
    sorumlulukların merkezi burasıdır.

6.  Aşağıdakilerden hangisi veri minimizasyonu ilkesine en uygundur?\
    A) "İleride lazım olur" diye her formda çok sayıda veri istemek\
    B) İhtiyaç olmayan veriyi toplamamak ve gereğinden uzun süre
    saklamamak\
    C) Tüm çalışanlara tüm verilere erişim vermek\
    D) Veriyi süresiz arşivlemek\
    **Doğru Cevap: B**\
    Açıklama: Gereksiz veri, gereksiz risk demektir; ölçülülük uyumu ve
    güvenliği güçlendirir.

7.  Veri ihlali (data breach) aşağıdakilerden hangisini kapsayabilir?\
    A) Bilgisayarın yavaşlamasını\
    B) Kişisel verinin yetkisiz ifşasını, kaybını, değişmesini veya
    erişilemez olmasını\
    C) Monitörün bozulmasını\
    D) İnternet paketinin bitmesini\
    **Doğru Cevap: B**\
    Açıklama: Veri ihlali; gizlilik, bütünlük veya erişilebilirliği
    etkileyen veri güvenliği olayıdır.

8.  GDPR'de veri ihlali bildiriminde "72 saat" vurgusunun temel amacı
    nedir?\
    A) Olayları gizlemek için zaman tanımak\
    B) Gecikmeden koordinasyon kurup zararı azaltmak\
    C) Yedekleme almak için zorunlu süre oluşturmak\
    D) İnternet hızını artırmak\
    **Doğru Cevap: B**\
    Açıklama: Amaç hızlı hareket edip zararı sınırlamak ve doğru
    koordinasyon sağlamaktır.

9.  ISO/IEC 27001 aşağıdakilerden hangisini en iyi ifade eder?\
    A) Sadece antivirüs seçme kılavuzudur\
    B) Kurumlarda Bilgi Güvenliği Yönetim Sistemi kurmaya yönelik
    standart çerçevedir\
    C) Sadece şifreleme algoritmalarını öğretir\
    D) Sadece ağ cihazı kurulum yönergesidir\
    **Doğru Cevap: B**\
    Açıklama: ISO 27001, güvenliği süreç + politika + risk yönetimi ile
    kurumsal olarak yönetmeye odaklanır.

10. Bir olay şüphesinde aşağıdaki ilk adımlardan hangisi en doğrudur?\
    A) Logları silip sistemi yeniden kurmak\
    B) Olayı görmezden gelmek\
    C) Erişimi sınırlamak, kanıtı bozmadan kayıt tutmak ve kapsamı
    belirlemek\
    D) Herkese mesaj atıp paniğe yol açmak\
    **Doğru Cevap: C**\
    Açıklama: Öncelik zararı sınırlamak ve delil/kayıt disiplinini
    korumaktır; sonraki analiz ve bildirim buna dayanır.

## **Bu Modülde Neler Öğrendik?**

-   Siber güvenliğin etik ve hukuk boyutunun, teknik önlemler kadar
    kritik olduğunu öğrendik.

-   "Hacker" kavramının tek bir anlama gelmediğini; beyaz--siyah--gri
    şapka ayrımının izin, motivasyon ve yasallıkla belirlendiğini
    kavradık.

-   Yetkilendirme ve kapsamın, güvenlik çalışmalarında hem profesyonel
    kaliteyi hem de hukuki güvenliği belirlediğini gördük.

-   Zarar vermeme ve minimum müdahale yaklaşımıyla, teknik testlerin
    hizmet sürekliliğiyle dengelenmesi gerektiğini anladık.

-   KVKK/GDPR bağlamında kişisel veri, veri sorumlusu/veri işleyen
    rolleri ve veri minimizasyonu gibi ilkelerin pratik karşılıklarını
    ilişkilendirdik.

-   Veri ihlali kavramını CIA üçlüsüyle bağladık; zaman baskısı altında
    kayıt tutma ve doğru ilk adımların neden hayati olduğunu öğrendik.

-   ISO/IEC 27001'in kurumlarda BGYS/ISMS yaklaşımıyla güvenliği
    yönetilebilir bir sisteme dönüştürdüğünü gördük.

-   Sorumlu zafiyet bildirimi yaklaşımıyla, bulguları güvenli ve yapıcı
    biçimde paylaşmanın temel prensiplerini öğrendik.

## **Modül 7 --- Olay Yönetimi ve Müdahale Temelleri + Siber Güvenlik Kariyer Farkındalığı**

*(Loglama, Tespit, Sınırlama, İlk Müdahale Akışı, Kanıt Disiplini ve
Rollere Bağlantı)*

Bu modül, bir güvenlik olayı şüphesi ortaya çıktığında "neye bakarım,
nasıl sınıflandırırım, hangi adımları hangi sırayla uygularım?"
sorularını başlangıç düzeyinde yanıtlatmayı hedefler. Önceki modüllerde
edindiğiniz hesap güvenliği (Modül 3), uç nokta/yazılım güvenliği (Modül
4), ağ ve kriptografi temelleri (Modül 5) ile etik--hukuk--uyumluluk
çerçevesi (Modül 6), burada olay yönetimi pratiğine dönüşür: log
okuryazarlığı, triage (ön değerlendirme), ilk müdahale yaşam döngüsü,
kanıtı bozmadan hareket etme ve kontrollü iletişim. Ayrıca modülün
ikinci kısmında, bu pratik akışın iş dünyasında hangi rollere (SOC
analisti, olay müdahale uzmanı, sızma testi uzmanı, GRC vb.) karşılık
geldiğini, yeni başlayan biri için kariyer yol haritası, temel
yetkinlikler ve yaygın sertifikasyonların genel konumlandırmasını ele
alacaksınız. Bir sonraki modülde, bu refleksi daha sistematik izleme ve
analiz yaklaşımlarına (ör. korelasyon, SOC mantığı, tespit kuralı
düşüncesi) taşımanın neden kritik olduğunu daha net göreceksiniz.

## **Modül Amaçları**

Bu modülü tamamlayan bir öğrenci:

-   **Event--alert--incident--breach** ayrımını kurar ve doğru
    sınıflandırmanın neden doğru tepkiyi belirlediğini açıklar.

-   Temel **log türlerini** (kimlik doğrulama, sistem, uygulama, ağ)
    örneklerle yorumlar; **zaman damgası ve senkronizasyon**
    sorunlarının analiz hatasına nasıl yol açtığını kavrar.

-   Bir olay şüphesinde **triage** yapar; etkiyi **CIA
    (Gizlilik--Bütünlük--Erişilebilirlik)** ile ilişkilendirerek
    önceliklendirme yapar.

-   Olay müdahale yaşam döngüsünü (**hazırlık, tespit, sınırlama,
    giderme, kurtarma, ders çıkarma**) başlangıç seviyesinde uygular.

-   **Kanıt koruma, kayıt tutma ve iletişim/bildirim disiplini**nin
    (Modül 6 ile bağlantılı) olay yönetimindeki rolünü açıklar.

-   Olay yönetimi pratiklerinin siber güvenlikteki **mavi takım, kırmızı
    takım, mor takım ve GRC** gibi rol/alanlarla ilişkisini kurar;
    başlangıç düzeyi bir **öğrenme planı** taslaklandırır.

## **Ana İçerik**

### **1) Büyük Resim: Olay Yönetimi Neden Gerekli?**

Önceki modüllerde güvenliği çoğunlukla **önleyici kontrollerle**
güçlendirdiniz: güçlü kimlik doğrulama (Modül 3), güncelleme ve
sıkılaştırma (Modül 4), ağ kontrolleri ve şifreleme (Modül 5). Ancak
gerçek dünyada **sıfır risk** yoktur; asıl farkı yaratan, bir anormallik
görüldüğünde **hızlı ve doğru hareket** edebilmek ve hasarı
**sınırlayabilmektir**.

-   **Geri referans (Modül 1):** Risk = olasılık × etki. Olay yönetimi
    özellikle "etkiyi" düşürmek için vardır.

-   **Geri referans (Modül 5):** IP/port/protokol bilgisi, "normal
    trafik mi anomali mi?" sorusunu yanıtlamada temel sağlar.

-   **Geri referans (Modül 6):** Kanıtı bozma, izinsiz paylaşım veya
    hatalı bildirim; teknik sorundan daha büyük etik/hukuki sonuçlar
    doğurabilir.

-   **İleri referans (Bir sonraki modül):** Korelasyon ve sürekli izleme
    mantığına geçtiğinizde, burada kazandığınız log okuryazarlığı "ham
    veriyi anlamlı sinyale dönüştürme"nin başlangıcı olacaktır.

**Dikkat Kutusu --- Olay yönetimi "panik anı" değil, süreç
disiplinidir**\
Paniğin en sık yaptığı hata: log silmek, sistemi rastgele kurcalamak,
doğrulanmamış bilgiyi kontrolsüz yaymak. Doğru yaklaşım: **sınırlama +
kayıt + doğrulama + kontrollü iletişim**.

### **2) Temel Kavramlar: Event, Alert, Incident, Breach**

#### **2.1 Event (Olay Kaydı)**

-   **Kısa tanım:** Sistem/uygulamada gerçekleşen herhangi bir işlemin
    kaydıdır (oturum açma, dosya erişimi, servis başlatma vb.).

-   **Neden önemli:** Olay yönetiminde ham veri çoğunlukla event olarak
    gelir; event'lerin çoğu saldırı değildir ama hepsi iz bırakır.

-   **Basit örnek:** Bir kullanıcı example.com hesabına giriş yapar;
    sistem "login success" kaydı üretir.

-   **Gerçek hayatta nerede görülür:** İşletim sistemi günlükleri,
    uygulama logları, EDR/antivirüs kayıtları.

#### **2.2 Alert (Alarm/Uyarı)**

-   **Kısa tanım:** Bir kural/algoritma, event'leri şüpheli bulduğunda
    üretilen uyarıdır.

-   **Neden önemli:** Alert "bakmaya değer bir şey olabilir" der; ancak
    her alert gerçek saldırı değildir (**false positive** olabilir).

-   **Basit örnek:** Aynı hesaba kısa sürede çok sayıda hatalı parola
    denemesi yapılınca "brute force şüphesi" alarmı oluşur.

-   **Gerçek hayatta nerede görülür:** Firewall/IDS uyarıları, EDR
    alarmları, SIEM uyarıları.

#### **2.3 Incident (Güvenlik Olayı) ve Breach (İhlal)**

-   **Kısa tanım:**

    -   **Incident:** Güvenlik politikasını ihlal eden veya hizmeti
        etkileyen **doğrulanmış** olay.

    -   **Breach:** Özellikle kişisel/veri gizliliği boyutunda yetkisiz
        erişim/ifşa/kayıp gibi **veri ihlali**.

-   **Neden önemli:** Modül 6'da gördüğünüz bildirim ve kayıt disiplini,
    incident/breach olduğunda kritikleşir.

-   **Basit örnek:** Yetkisiz yönetici oturumu tespit edilirse incident
    sayılabilir; kişisel veriler dışarı sızmışsa breach boyutu doğar.

-   **Gerçek hayatta nerede görülür:** Veri sızıntısı olayları, fidye
    yazılımı vakaları, hesap ele geçirme.

**İpucu Kutusu --- Kelimeyi doğru seçmek doğru tepkiyi getirir**\
"Event" çoktur, "alert" seçicidir, "incident" doğrulanmıştır. Yanlış
sınıflandırma ya gereksiz paniğe ya da tehlikeli gecikmeye yol açar.

### **3) Log Okuryazarlığı: Hangi Log Ne Söyler?**

#### **3.1 Log (Günlük)**

-   **Kısa tanım:** Sistem ve uygulamaların yaptığı işlemleri zaman
    damgası ile kayıt altına alan metin/JSON benzeri kayıtlardır.

-   **Neden önemli:** Olay anında en kritik soru "ne oldu?"dur. Loglar
    bunu kanıta dayalı yanıtlamayı sağlar.

-   **Basit örnek:** "2026-01-13 10:15:02 --- kullanıcı giriş yaptı"
    kaydı.

-   **Gerçek hayatta nerede görülür:** Sunucular, uygulamalar,
    modem/firewall cihazları, bulut servisleri.

#### **3.2 Zaman Damgası ve Senkronizasyon (Time Sync)**

-   **Kısa tanım:** Logların "ne zaman" üretildiğini gösteren zaman
    bilgisidir; sistem saatleri tutarsızsa analiz zorlaşır.

-   **Neden önemli:** Olay akışı dakikalar/saniyelerle çözülür. Saatler
    farklıysa yanlış sonuca varabilirsiniz.

-   **Basit örnek:** Bir cihazın saati 15 dakika gerideyse saldırı
    zincirini yanlış sıralayabilirsiniz.

-   **Gerçek hayatta nerede görülür:** Olay sonrası inceleme, SIEM
    korelasyonu, zaman çizelgesi çıkarma.

**Dikkat Kutusu --- Zaman hatası, en yaygın analiz tuzağıdır**\
Analize başlamadan önce logların saat dilimi (UTC/yerel), cihaz saati ve
olayın gerçek zamanı tutarlı mı kontrol edin.

#### **3.3 Log Türleri (Başlangıç Seviyesi Harita)**

-   **Kimlik doğrulama (Authentication) logları:** giriş/çıkış, MFA
    denemeleri, başarısız girişler

-   **Sistem logları:** servis başlatma, kullanıcı oluşturma, kritik
    hatalar

-   **Uygulama logları:** API hataları, yetki reddi, beklenmeyen
    istisnalar

-   **Ağ logları:** bağlantı denemeleri, port erişimleri, DNS istekleri
    *(Modül 5 ile doğrudan bağlantılı)*

-   **Geri referans (Modül 3):** Şüpheli giriş denemeleri ve oturum
    uyarıları hesap güvenliğinin "olay sinyali"dir.

-   **Geri referans (Modül 5):** IP/port/protokol bilgisi ağ loglarını
    anlamlandırır.

### **4) Triage: İlk Dakikalarda Ne Yapılır?**

Triage, bir alarm geldiğinde veya şüpheli durum görüldüğünde **hızlı ön
değerlendirme** yapmaktır.

#### **4.1 Triage Soruları (Çekirdek Çerçeve)**

-   Bu sinyal **nereden** geldi? (hangi sistem, hangi kullanıcı, hangi
    IP?)

-   Bu sinyal **ne tür**? (event mi, alert mi?)

-   **Etki var mı?** (CIA açısından gizlilik/bütünlük/erişilebilirlik)

-   Olay **devam ediyor mu?** (aktif mi, geçmiş mi?)

-   **Hızlı sınırlama** gerekiyor mu? (hesap kilitleme, erişim kesme,
    izolasyon)

**Basit örnek:**\
"example.com üzerinde 198.51.100.10 IP'sinden aynı kullanıcıya 20
başarısız giriş"

-   Kaynak: kimlik doğrulama logu

-   Etki: henüz gizlilik ihlali yok; risk artıyor

-   Aksiyon fikri: kullanıcı doğrulama, MFA kontrolü, geçici kilit/şifre
    sıfırlama

**İpucu Kutusu --- Önce doğrula, sonra büyüt**\
Bir alarmla tüm sistemi kapatmak bazen gereksiz iş kesintisi yaratır.
Triage, "kontrollü hız" disiplinidir.

#### **4.2 "Normal" Davranışın Baz Çizgisi (Baseline)**

-   **Kısa tanım:** Sistem ve kullanıcıların normalde nasıl davrandığına
    dair referans resimdir.

-   **Neden önemli:** "Anomali" diyebilmek için "normal"i bilmek
    gerekir.

-   **Basit örnek:** Normalde günde 2 kez giriş yapan hesabın bir anda
    200 giriş denemesi görmesi.

-   **Gerçek hayatta nerede görülür:** SOC operasyonları, performans
    izleme, güvenlik izleme.

### **5) Olay Müdahale Yaşam Döngüsü: Adım Adım**

Bu bölüm, klasik olay müdahale yaklaşımını başlangıç seviyesinde
uygular.

#### **5.1 Hazırlık (Preparation)**

-   **Kısa tanım:** Olay olmadan önce süreç, rol, araç ve iletişim planı
    oluşturma.

-   **Neden önemli:** Olay anında plan yoksa kararlar panikle alınır.

-   **Basit örnek:** "Kim aranacak? Hangi loglar toplanacak? Hangi
    sistemler kritik?" listesi.

-   **Gerçek hayatta nerede görülür:** Kurumsal IR planları,
    runbook'lar, vardiya süreçleri.

#### **5.2 Tespit ve Doğrulama (Detection & Validation)**

-   **Kısa tanım:** Sinyali yakalama ve gerçek olay olup olmadığını
    doğrulama.

-   **Neden önemli:** **False positive** zaman kaybettirir; **false
    negative** zarar büyütür.

-   **Basit örnek:** EDR alarmı verdiğinde gerçekten zararlı mı,
    karantina uygulanmış mı kontrol etmek.

-   **Gerçek hayatta nerede görülür:** EDR alarmları, firewall
    alarmları, SIEM uyarıları.

#### **5.3 Sınırlama (Containment)**

-   **Kısa tanım:** Olayın yayılmasını ve etkisini durdurmak için
    geçici/kalıcı önlemler almak.

-   **Neden önemli:** Etkiyi hızla düşürür *(Modül 1 risk mantığı ile
    bağlantılı)*.

-   **Basit örnek:** Şüpheli hesabı geçici kilitlemek, erişim anahtarını
    döndürmek, problemli cihazı ağdan izole etmek.

-   **Gerçek hayatta nerede görülür:** Ağ ayrıştırma (Modül 5), hesap
    güvenliği politikaları (Modül 3).

**Dikkat Kutusu --- Sınırlama yaparken kanıtı bozmamaya dikkat**\
Modül 6'daki etik/hukuk çerçevesi burada devreye girer: log silmek
yerine korumak, rastgele format atmamak, doğrulanmamış bilgi yaymamak.

#### **5.4 Giderme (Eradication)**

-   **Kısa tanım:** Kök nedeni ortadan kaldırma (zafiyet kapatma,
    zararlı bileşeni temizleme, yanlış yapılandırmayı düzeltme).

-   **Neden önemli:** Sadece sınırlayıp bırakmak sorunu geri getirir.

-   **Basit örnek:** Zayıf parola politikasını düzeltmek, gereksiz açık
    servisi kapatmak *(Modül 5'teki "açık servis" mantığıyla
    bağlantılı)*.

-   **Gerçek hayatta nerede görülür:** Patch yönetimi (Modül 4),
    yetkilendirme düzenlemeleri (Modül 3).

#### **5.5 Kurtarma (Recovery)**

-   **Kısa tanım:** Sistemleri güvenli şekilde normale döndürme ve
    izlemeyi artırma.

-   **Neden önemli:** "Acele geri açma" tekrar saldırıya zemin
    hazırlayabilir.

-   **Basit örnek:** Temizlenen sistemi kontrollü olarak ağa geri almak,
    loglamayı geçici süre sıklaştırmak.

-   **Gerçek hayatta nerede görülür:** Hizmet sürekliliği, yedekleme
    geri dönüşleri.

#### **5.6 Ders Çıkarma (Lessons Learned)**

-   **Kısa tanım:** Olay sonrası rapor ve iyileştirme aksiyonları
    üretme.

-   **Neden önemli:** Aynı olayın tekrarını önler; güvenlik olgunluğunu
    artırır.

-   **Basit örnek:** "Hangi kontrol eksikti? Hangi eğitim gerekli? Hangi
    alarm kuralı güncellenmeli?"

-   **Gerçek hayatta nerede görülür:** Post-incident review
    toplantıları, politika güncellemeleri, kontrol listeleri.

### **6) Kanıtı Koruma, Kayıt Tutma ve İletişim Disiplini**

#### **6.1 Kanıt (Evidence)**

-   **Kısa tanım:** Olayı anlamaya ve gerekirse ispat etmeye yarayan
    kayıtlar: loglar, ekran görüntüleri, konfigürasyon çıktıları, zaman
    çizelgesi notları.

-   **Neden önemli:** Yanlış müdahale hem analiz hem de hukuki/etik
    süreç açısından geri dönülemez kayıp yaratabilir *(Modül 6 ile
    bağlantılı)*.

-   **Basit örnek:** "Şüpheli giriş saatleri, kaynak IP 203.0.113.25,
    etkilenen kullanıcılar" özetinin kanıt referanslarıyla tutulması.

-   **Gerçek hayatta nerede görülür:** Adli bilişim süreçleri,
    denetimler, uyumluluk incelemeleri.

#### **6.2 Kayıt Tutma (Incident Journal) Nasıl Olmalı?**

-   **Zaman çizelgesi:** "İlk ne zaman fark edildi, kim fark etti?"

-   **Gözlem:** "Hangi belirti görüldü?"

-   **Aksiyon:** "Hangi adım atıldı, kim attı?"

-   **Sonuç:** "Ne değişti, etki azaldı mı?"

-   **Kanıt referansı:** "Hangi log, hangi ekran görüntüsü, hangi
    kayıt?"

**İpucu Kutusu --- Kayıt, hafızadan daha güvenilirdir**\
Olaylar stresli anlarda yaşanır. Yazılı kayıt, doğru iletişim ve doğru
iyileştirme için şarttır.

#### **6.3 İletişim: Kime, Ne Zaman, Ne Kadar?**

-   **Kısa tanım:** Olay bilgisini "ihtiyaç kadar" paylaşmak ve tek bir
    doğrulanmış kanaldan yönetmek.

-   **Neden önemli:** Fazla/yanlış bilgi panik yaratır; eksik bilgi
    gecikme yaratır.

-   **Basit örnek:** İç iletişimde teknik detay + etki + plan; dış
    iletişimde doğrulanmış ve gerekli minimum bilgi.

-   **Gerçek hayatta nerede görülür:** Kriz iletişimi, müşteri
    bilgilendirme, KVKK/GDPR bildirim süreçleri *(Modül 6 ile
    bağlantılı)*.

### **7) Kısa Senaryolarla Uygulama (Kavramsal)**

Bu senaryolar "nasıl saldırı yapılır" öğretmez; **olay yönetimi
refleksi** kazandırır.

#### **7.1 Şüpheli Oturum Denemeleri**

Bir hesapta kısa sürede çok sayıda başarısız giriş ve ardından farklı
bir cihazdan başarılı giriş görülüyor.

-   **Event/alert:** Başarısız girişler event; yoğunlaşınca alert
    oluşabilir.

-   **Triage:** Kullanıcı doğrulama, MFA durumu, giriş zamanı/cihazı
    kontrolü.

-   **Sınırlama:** Hesabı geçici kilitleme, parola sıfırlama, aktif
    oturumları kapatma.

-   Modül 3'te MFA ve parola hijyeni; Modül 6'da kayıt ve kontrollü
    iletişim.

#### **7.2 Beklenmeyen Ağ Trafiği Artışı**

Bir ofiste misafir ağında trafik artışı ve ana ağda yavaşlama fark
ediliyor.

-   **Triage:** Hangi segment etkilendi? *(Modül 5: ağ ayrıştırma)*

-   **Sınırlama:** Misafir ağını izole etme, ana ağa erişimi kısıtlama,
    firewall kuralını sıkılaştırma.

-   **Kayıt:** Zaman çizelgesi + etkilenen servisler *(CIA:
    erişilebilirlik)*.

-   Bir sonraki modülde korelasyonla "neden--sonuç" ilişkisi daha net
    kurulacak.

#### **7.3 Yanlış Paylaşılmış Dosya Bağlantısı Şüphesi**

Bir ekip, bir doküman bağlantısının yanlışlıkla herkese açık
olabileceğini fark ediyor.

-   **Sınıflandırma:** Breach riski var mı? *(Modül 6: veri ihlali
    mantığı)*

-   **İlk adımlar:** Linki kapat, izinleri düzelt, erişim kayıtlarını
    kontrol et, zaman çizelgesi oluştur.

-   **İletişim:** Yetkili kişilere kontrollü bilgi; gerekirse
    uyum/bildirim hazırlığı.

### **8) İş Dünyasında Olay Yönetimi: Takımlar, Roller ve Günlük Sorumluluklar**

Bu bölüm, az önce öğrendiğiniz olay yönetimi akışının sektörde **hangi
rollere** karşılık geldiğini gösterir. Bu sayede "öğrendiğim bilgi işte
nerede kullanılıyor?" bağlantısı kurarsınız.

#### **8.1 Mavi Takım (Blue Team) --- Savunma Odaklı Roller**

-   **Kısa tanım:** Kurumun dijital varlıklarını izleyen, tespit eden ve
    savunma kontrollerini geliştiren ekip/roller.

-   **Neden önemli:** Modül 1'deki CIA üçlüsünü pratikte koruyan taraf
    çoğunlukla mavi takımdır.

-   **Basit örnek:** Gece saatlerinde 192.0.2.15 IP'sinden tekrarlayan
    başarısız girişleri fark edip triage başlatmak.

-   **Gerçek hayatta nerede görülür:** SOC, EDR yönetimi, SIEM izleme,
    olay müdahale süreçleri.

**SOC Analisti (Security Operations Center Analisti)**

-   Logları ve alarmları izler, triage yapar, gerekirse olayı büyütür
    (escalation).

-   Bu rolün kalbinde **event/alert ayrımı** ve **baseline** mantığı
    vardır *(bu modülün ana konusu)*.

**Olay Müdahale Uzmanı (Incident Responder)**

-   Doğrulanmış incident'te **containment--eradication--recovery**
    adımlarını koordine eder.

-   Modül 6'daki etik/hukuk çerçevesiyle uyumlu şekilde **kanıt** ve
    **kayıt** disiplinini sürdürür.

**İpucu Kutusu --- Mavi takım için en kritik refleks**\
Hız önemlidir; fakat hız, "rastgele aksiyon" değil **prosedürlü
hız**dır. Triage ve kayıt tutma alışkanlığı sizi profesyonelleştirir.

#### **8.2 Kırmızı Takım (Red Team) --- Saldırı Simülasyonu Odaklı Roller**

-   **Kısa tanım:** Kurumun izniyle, saldırgan bakış açısını simüle
    ederek zafiyetleri bulup raporlayan ekip/roller.

-   **Neden önemli:** Gerçek saldırgan bulmadan önce zayıflıkları
    keşfedip kapatmak, olay riskini düşürür *(Modül 4 hardening, Modül 5
    açık servis, Modül 6 yetkilendirme/kapsam ile bağlantılı)*.

-   **Basit örnek:** Yeni bir uygulama yayına girmeden önce kimlik
    doğrulama akışında zayıf noktayı tespit edip raporlamak.

-   **Gerçek hayatta nerede görülür:** Sızma testleri (pentest), red
    team tatbikatları, güvenlik değerlendirmeleri.

**Sızma Testi Uzmanı (Pentester)**

-   "Teknik olarak yapılabilir" olanı değil, **izinli ve kapsam
    dahilinde** olanı yapar *(Modül 6)*.

-   Bulduğu bulgular, mavi takımın tespit kurallarını ve savunma
    kontrollerini geliştirmesine katkı sağlar.

#### **8.3 Mor Takım (Purple Team) --- İş Birliği Modeli**

-   **Kısa tanım:** Kırmızı ve mavi takımın birlikte çalışarak bilgi
    paylaşımı yaptığı çalışma modeli.

-   **Neden önemli:** Saldırı simülasyonundan çıkan bulguların, savunma
    tarafında ölçülebilir iyileştirmeye dönüşmesini hızlandırır.

-   **Basit örnek:** Red team'in simüle ettiği bir senaryodan sonra mavi
    takımın SIEM kuralını güncellemesi ve tekrar test etmesi.

-   **Gerçek hayatta nerede görülür:** Tatbikatlar, tabletop
    exercise'lar, tespit mühendisliği çalışmaları.

#### **8.4 Yönetişim, Risk ve Uyum (GRC)**

-   **Kısa tanım:** Güvenliği yönetim, risk ve mevzuat boyutuyla ele
    alan alan/roller.

-   **Neden önemli:** Olay yönetimi sadece teknik değil; bildirim, kayıt
    ve politika gerektirir *(Modül 6 ile bağlantılı)*.

-   **Basit örnek:** Veri ihlali şüphesinde hangi bilginin nasıl
    raporlanacağına dair prosedürlerin bulunması.

-   **Gerçek hayatta nerede görülür:** ISO 27001 gibi BGYS süreçleri, iç
    denetimler, KVKK/GDPR uyum çalışmaları.

**Not (Doğruluk kontrolü):** ISO/IEC 27001, kurumlarda Bilgi Güvenliği
Yönetim Sistemi (BGYS) kurmak ve riskleri yönetmek için kullanılan
uluslararası bir standarttır.

### **9) Kariyer Yol Haritası: Yetkinlikler, Öğrenme Planı ve Sertifikasyon**

#### **9.1 Temel Teknik Yetkinlikler**

Bu modülde öğrendiğiniz olay yönetimi akışı, aşağıdaki temellerle
doğrudan ilişkilidir:

-   **Ağ temelleri:** TCP/IP, DNS, HTTP(S) *(Modül 5 ile bağlantılı)*

-   **İşletim sistemleri:** Windows/Linux logları, servisler,
    kullanıcı/izin yapıları *(Modül 4 ile bağlantılı)*

-   **Kimlik ve erişim:** MFA, oturum yönetimi, hesap güvenliği
    sinyalleri *(Modül 3 ile bağlantılı)*

-   **Betik yazma/otomasyon:** Tekrarlayan kontrolleri hızlandırmak için
    (ör. log filtreleme, raporlama)

**Basit örnek:** Bir analist, her gün yüzlerce giriş denemesini tek tek
incelemek yerine, belirli bir eşik üstünü otomatik raporlayan küçük bir
betik yaklaşımıyla zaman kazanır.\
**Gerçek hayatta nerede görülür:** SOC otomasyonu, uyarı zenginleştirme
(enrichment), temel raporlama.

#### **9.2 Sosyal Yetkinlikler (Soft Skills)**

-   **Analitik düşünme:** Olay zincirini parçalara ayırıp kök nedeni
    bulma.

-   **İletişim:** Teknik bulguyu iş etkisine çevirebilme (CIA diliyle).

-   **Etik değerler:** Yetkilendirme, kapsam ve gizlilik disiplinine
    bağlılık *(Modül 6 ile bağlantılı)*.

-   **Sürekli öğrenme:** Tehditler değişir; güncel kalmak mesleğin
    parçasıdır.

#### **9.3 Sertifikasyonlara Genel Bakış (Başlangıçtan İleriye Konumlandırma)**

Sertifikalar "kapıyı açmaya" yardımcı olabilir; ancak tek başına yeterli
değildir. Bu nedenle sertifikaları, pratik projeler ve temel kavrayışla
birlikte düşünmek gerekir.

-   **CompTIA Security+** genellikle temel güvenlik kavramlarını ve
    çekirdek becerileri doğrulayan, giriş seviyesinde yaygın bir
    sertifikadır.

-   **Cisco CyberOps Associate / CBROPS** odak olarak güvenlik
    operasyonları ve SOC pratikleriyle ilişkilendirilen bir
    sertifikasyon hattıdır (loglar, izleme, operasyonel bakış).

-   **CEH (Certified Ethical Hacker)** etik hacking ve sızma testi
    kavramlarına giriş niteliğinde konumlandırılır.

-   **OSCP (Offensive Security Certified Professional)** uygulamalı/elle
    yapılan değerlendirme yaklaşımıyla bilinen bir sertifikadır;
    "hands-on" vurgusu güçlüdür.

**Dikkat Kutusu --- Sertifika tek başına kariyer garantisi değildir**\
Sertifikalar bir çerçeve sunar; mülakat ve işte performansı belirleyen,
temel mantık + pratik uygulama + iletişim disiplinidir. Bu modüldeki
triage ve kayıt tutma refleksi, pratik tarafın "çekirdeği"dir.

#### **9.4 Pratik Gelişim Önerileri (Yeni Başlayan İçin)**

-   Küçük bir sistemde "event--alert--incident" örnekleri toplayıp
    sınıflandırma pratiği yapın.

-   Baseline çıkarma alıştırması yapın: "normal giriş saatleri", "normal
    trafik" gibi.

-   Basit bir incident journal şablonu oluşturup senaryolar üzerinde
    doldurun.

-   CTF (Capture The Flag), OSINT, bug bounty gibi etkinlikleri **etik
    ve yetkili çerçevede** değerlendirin *(Modül 6 ile bağlantılı)*.

Bir sonraki modülde, bu pratiklerin daha sistematik izleme ve
korelasyonla nasıl "ölçeklenebilir" hale getirildiğini göreceksiniz.

## **Terimler Sözlüğü (Glossary)**

  **Terim**                **Türkçe karşılığı / açıklama**
  ------------------------ -------------------------------------------------------------------------------------------------------
  Event                    Olay kaydı; sistem/uygulamada gerçekleşen işlemin loglanmış hali
  Alert                    Alarm/uyarı; kurala/algoritmaya göre şüpheli bulunan sinyal
  Incident                 Güvenlik olayı; doğrulanmış ve güvenlik politikasını etkileyen durum
  Breach                   İhlal; özellikle verinin yetkisiz ifşası/erişimi/kaybı gibi veri ihlali durumu
  Log                      Günlük kaydı; sistem ve uygulama kayıtları
  Timestamp                Zaman damgası; kaydın oluştuğu an bilgisi
  Time Sync                Zaman senkronizasyonu; sistem saatlerinin tutarlı olması
  Triage                   Ön değerlendirme; hızlı sınıflandırma ve önceliklendirme
  Baseline                 Baz çizgisi; normal davranış referansı
  Containment              Sınırlama; olayın yayılmasını/etkisini durdurma
  Eradication              Giderme; kök nedeni ortadan kaldırma
  Recovery                 Kurtarma; sistemi güvenli biçimde normale döndürme
  Lessons Learned          Ders çıkarma; olay sonrası iyileştirme ve raporlama
  Evidence                 Kanıt; olayı anlamaya/ispatlamaya yarayan kayıtlar
  Runbook                  Operasyon rehberi; adım adım müdahale talimatları
  False Positive           Yanlış pozitif; alarm var ama gerçek olay değil
  False Negative           Yanlış negatif; olay var ama alarm üretmemiş
  SOC                      Güvenlik Operasyon Merkezi; izleme ve ilk analiz süreçlerinin yürütüldüğü yapı
  SIEM                     Güvenlik Bilgisi ve Olay Yönetimi; logları toplayıp analiz eden platform
  Blue Team                Mavi takım; savunma ve izleme odaklı rol/ekip
  Red Team                 Kırmızı takım; izinli saldırı simülasyonu/sızma testi odaklı rol/ekip
  Purple Team              Mor takım; kırmızı ve mavi takımın iş birliği modeli
  Incident Responder       Olay müdahale uzmanı; doğrulanmış olaylarda sınırlama--giderme--kurtarma adımlarını koordine eden rol
  Pentester                Sızma testi uzmanı; izinli kapsam dahilinde zafiyet tespiti yapan rol
  GRC                      Yönetişim, Risk ve Uyum; yönetimsel/hukuki standart ve risk boyutu
  Digital Forensics        Dijital adli bilişim; olay sonrası delil toplama ve inceleme disiplini
  Hard Skills              Teknik beceriler (ağ, işletim sistemi, kodlama vb.)
  Soft Skills              Kişisel/sosyal beceriler (iletişim, analitik düşünme vb.)
  Bug Bounty               Kurumların, sistemlerindeki açıkları etik biçimde bildirenlere ödül verdiği programlar
  Capture The Flag (CTF)   Siber güvenlik becerilerini test eden yarışma formatı
  OSINT                    Açık kaynak istihbaratı; kamuya açık verilerden bilgi toplama disiplini
  Security+                Temel güvenlik kavramlarını ölçen, giriş seviyesinde yaygın sertifikasyon
  CEH                      Etik hacking kavramlarına odaklı sertifikasyon hattı
  CyberOps / CBROPS        Güvenlik operasyonları ve SOC pratikleriyle ilişkilendirilen sertifikasyon hattı
  OSCP                     Uygulamalı sızma testi becerisini ölçmeye odaklı "hands-on" sertifikasyon

## **Test Soruları**

1.  "Event" kavramı aşağıdakilerden hangisini en doğru ifade eder?\
    A) Sadece saldırı olduğunda oluşan kayıt\
    B) Sistem veya uygulamada gerçekleşen herhangi bir işlemin kayıt
    altına alınması\
    C) Yalnızca veri ihlali durumunda oluşan bildirim\
    D) Sadece e-posta ile gelen uyarı\
    **Doğru Cevap: B**\
    Açıklama: Event, saldırı olsun olmasın sistemdeki işlemlerin
    loglanmış halidir.

2.  "Alert" ile "Incident" arasındaki en doğru ilişki hangisidir?\
    A) Her alert kesin incident'tir\
    B) Alert şüphe sinyalidir; incident doğrulanmış güvenlik olayıdır\
    C) Incident yalnızca performans sorunudur\
    D) Alert sadece kullanıcı hatasında oluşur\
    **Doğru Cevap: B**\
    Açıklama: Alert inceleme gerektirir; incident doğrulama sonrası
    sınıflandırılır.

3.  Log analizinde zaman damgası tutarsızlığı en çok hangi riski
    doğurur?\
    A) Olay akışını yanlış sıralayıp hatalı sonuca götürür\
    B) Şifreleri otomatik değiştirir\
    C) DNS'i devre dışı bırakır\
    D) Donanımı hızlandırır\
    **Doğru Cevap: A**\
    Açıklama: Zaman çizelgesi yanlışsa "ne önce oldu?" sorusu hatalı
    yanıtlanır.

4.  Triage aşamasında "etki var mı?" sorusu neden kritik kabul edilir?\
    A) Çünkü her durumda sistemi kapatmak gerekir\
    B) Çünkü CIA açısından etki, önceliklendirme ve sınırlama kararını
    belirler\
    C) Çünkü yalnızca gizlilik etkisi önemlidir\
    D) Çünkü logları silmek için hızlı karar gerekir\
    **Doğru Cevap: B**\
    Açıklama: Etki (gizlilik/bütünlük/erişilebilirlik) aciliyeti ve
    aksiyonu belirler.

5.  Aşağıdakilerden hangisi "containment (sınırlama)" örneğidir?\
    A) Olay sonrası rapor yazmak\
    B) Şüpheli hesabı geçici kilitlemek ve erişimi durdurmak\
    C) Eğitim materyali hazırlamak\
    D) Yeni bir parola politikası tasarlamak (hiç uygulamadan)\
    **Doğru Cevap: B**\
    Açıklama: Sınırlama, olayın yayılmasını veya zararını durdurma
    adımıdır.

6.  Kanıt yönetiminde en riskli davranış hangisidir?\
    A) Zaman çizelgesi tutmak\
    B) Logları koruyup kaynaklarını not etmek\
    C) Panikle logları silmek veya sistemi rastgele yeniden kurmak\
    D) Yetkili kişileri kontrollü bilgilendirmek\
    **Doğru Cevap: C**\
    Açıklama: Kanıtı bozmak hem analiz hem de etik/hukuki süreç için
    büyük zarardır (Modül 6 ile bağlantılı).

7.  "Baseline" kavramı olay tespitinde neden önemlidir?\
    A) Normal davranışı bilmeden anomaliyi doğru yorumlamak zor olduğu
    için\
    B) İnternet hızını artırdığı için\
    C) Sadece donanım arızalarını bulduğu için\
    D) Şifrelemeyi otomatik yaptığı için\
    **Doğru Cevap: A**\
    Açıklama: Anomali, normale göre sapmadır; normal tanımlı değilse
    sapma belirsizleşir.

8.  Aşağıdakilerden hangisi "eradication (giderme)" adımına en
    uygundur?\
    A) Olayı sınırlamak için hesabı kilitlemek\
    B) Kök nedeni ortadan kaldırmak: zafiyeti kapatmak veya yanlış
    yapılandırmayı düzeltmek\
    C) Sistemi hiç incelemeden tekrar açmak\
    D) Herkese ayrıntılı logları paylaşmak\
    **Doğru Cevap: B**\
    Açıklama: Giderme, sorunun geri gelmemesi için temel nedeni
    kaldırmayı hedefler.

9.  "SOC Analisti" rolünün bu modüldeki hangi iki kavramla en doğrudan
    ilişkisi vardır?\
    A) Baseline ve triage\
    B) Logo tasarımı ve pazarlama\
    C) Donanım tamiri ve kablolama\
    D) Oyun geliştirme ve animasyon\
    **Doğru Cevap: A**\
    Açıklama: SOC analisti alarmları değerlendirir (triage) ve anomaliyi
    normal davranışa göre yorumlar (baseline).

10. "Mor takım (Purple Team)" yaklaşımı en iyi hangi ifadeyle
    açıklanır?\
    A) Yalnızca yeni başlayanların yer aldığı ekip\
    B) Kırmızı ve mavi takımın iş birliğiyle bilgi paylaşarak tespit ve
    savunmayı geliştirmesi\
    C) Sadece hukuki denetim yapan birim\
    D) Sadece ağ cihazı kuran ekip\
    **Doğru Cevap: B**\
    Açıklama: Mor takım, saldırı simülasyonlarının savunma
    iyileştirmesine hızlı dönüşmesini hedefler.

## **Bu Modülde Neler Öğrendik?**

-   Event, alert, incident ve breach kavramlarını ayırt ederek doğru
    tepkiyi doğru sınıfa bağlamayı öğrendik.

-   Logların temel türlerini ve zaman damgası tutarlılığının analiz için
    neden kritik olduğunu kavradık.

-   Triage yaklaşımıyla ilk dakikalarda sorulacak çekirdek soruları ve
    önceliklendirmeyi CIA ile ilişkilendirdik.

-   Olay müdahale yaşam döngüsünü (hazırlık, tespit, sınırlama, giderme,
    kurtarma, ders çıkarma) adım adım ele aldık.

-   Kanıtı koruma, kayıt tutma ve kontrollü iletişimin (Modül 6'daki
    etik/hukuk çerçevesiyle) olay yönetiminde vazgeçilmez olduğunu
    gördük.

-   Olay yönetimi pratiklerinin sektörde mavi takım, kırmızı takım, mor
    takım ve GRC gibi rol/alanlara nasıl karşılık geldiğini öğrendik;
    kariyer planlamasında teknik ve sosyal yetkinliklerin önemini
    bağladık.

## **Modül 8 --- Genel Değerlendirme ve Günlük Hayatta Uygulanabilir Siber Güvenlik Farkındalığı**

*(Dijital hijyen, davranışsal güvenlik alışkanlıkları, hesap--cihaz--ağ
güvenliği, veri koruma, sosyal mühendislik dayanıklılığı ve kişisel mini
müdahale planı)*

Bu modül, önceki yedi modülde edinilen teknik ve teorik bilgileri günlük
yaşamda uygulanabilir, sürdürülebilir bir "güvenlik farkındalığı"
yaklaşımına dönüştürür. Modül 1'deki risk ve CIA üçlüsü, Modül 2'deki
sosyal mühendislik ve tehdit türleri, Modül 3'teki hesap/kimlik
güvenliği, Modül 4'teki cihaz ve güncelleme disiplini, Modül 5'teki ağ
ve şifreleme temelleri, Modül 6'daki etik--hukuk--uyum çerçevesi ve
Modül 7'deki olay yönetimi refleksi; bu modülde kişisel ve küçük ölçekli
ortamlara uyarlanmış pratik kontrol listeleri, davranış kuralları ve
mini planlarla bir araya getirilir. Amaç, "saldırılar nasıl yapılır?"
sorusu yerine "riskimi nasıl azaltırım, nasıl güvenli davranırım, bir
şey olursa ne yaparım?" sorularına sistematik yanıt üretebilmektir.

## **Modül Amaçları**

Bu modülü tamamlayan bir öğrenci:

-   En sık yapılan siber güvenlik hatalarını tanımlar ve bu hataların
    CIA (Gizlilik--Bütünlük--Erişilebilirlik) üzerindeki etkilerini
    açıklar (Modül 1 ile ilişkili).

-   Güvensiz dijital davranışlar ile güvenli dijital alışkanlıkları
    ayırt eder; "dijital hijyen" yaklaşımını rutin haline getirir.

-   Hesap güvenliği için uygulanabilir bir plan oluşturur: güçlü ve
    benzersiz parola, parola yöneticisi yaklaşımı, MFA, kurtarma
    ayarları (Modül 3 ile ilişkili).

-   Cihaz güvenliği hijyenini uygular: güncelleme/patche, uygulama
    izinleri, şifreleme, ekran kilidi, yedekleme ve kurtarma testi
    (Modül 4 ve Modül 5 ile ilişkili).

-   Sosyal mühendislik ve dolandırıcılık sinyallerini tanır; "dijital
    şüphecilik ve doğrulama" refleksi geliştirir (Modül 2 ile ilişkili).

-   3-2-1 yedekleme stratejisini ve "off-site yedek" mantığını akademik
    ve pratik düzeyde açıklar.

-   Sıfır Güven (Zero Trust) ve En Az Yetki (Least Privilege)
    prensiplerini günlük hayata uyarlayarak erişim kararlarını daha
    güvenli hale getirir.

-   Şüpheli bir durumda kişisel "mini olay müdahale planı" uygular:
    sınırlama--kayıt--doğrulama--kontrollü iletişim (Modül 7 ile
    ilişkili).

## **Ana İçerik**

### **1) Güvenlik Farkındalığı: Teknikten Davranışa Geçiş**

Siber güvenlik yalnızca "araçlar" veya "IT departmanı" meselesi
değildir; büyük ölçüde insan davranışlarının kalitesiyle şekillenen bir
farkındalık ve disiplin alanıdır.

#### **1.1 CIA Üçlüsü ile Günlük Karar Verme (Gizlilik--Bütünlük--Erişilebilirlik)**

-   **Kısa tanım:** CIA üçlüsü; bilginin gizli kalması, değişmeden doğru
    kalması ve ihtiyaç duyulduğunda erişilebilir olması hedefidir.

-   **Neden önemli?** Günlük bir hata, bazen "gizlilik" (hesap ele
    geçirme), bazen "bütünlük" (dosyaların değiştirilmesi), bazen
    "erişilebilirlik" (dosyalara erişememe) sorununa dönüşür.

-   **Basit örnek:** Hesabın ele geçirilmesi gizliliği; dosyaların
    bozulması bütünlüğü; fidye yazılımı erişilebilirliği etkiler.

-   **Gerçek hayatta nerede görülür?** Hesap çalınmaları, sahte
    işlemler, dosya kayıpları, hizmet kesintileri.

Modül 1'deki risk yaklaşımı ve CIA üçlüsü bu modülün omurgasını
oluşturur.\
Modül 7'deki olay yönetimi refleksi, CIA etkisini hızlı sınıflandırmada
kullanılır.

#### **1.2 "Zincir En Zayıf Halkası Kadar Güçlüdür": İnsan Faktörü**

-   **Kısa tanım:** En iyi teknik kontroller bile yanlış davranışla
    aşılabilir.

-   **Neden önemli?** Saldırılar çoğu zaman "teknik duvarı yıkmak"
    yerine kullanıcıyı ikna ederek kapıyı açtırmayı hedefler (Modül 2).

-   **Basit örnek:** Güçlü sistemler varken bile, bir kişinin OTP kodunu
    paylaşması hesabın kaybına yol açabilir.

-   **Gerçek hayatta nerede görülür?** Kimlik avı, sahte destek
    aramaları, acele ettirme taktikleri.

### **2) Günlük Hayatta Tehdit Modellemesi: "Neyi, Neden Koruyorum?"**

Güvenlik farkındalığı, rastgele önlemler toplamı değil; risk temelli bir
yaklaşımdır.

#### **2.1 Tehdit, Zafiyet, Risk ve Etki**

-   **Kısa tanım:**

    -   **Tehdit:** Zarar verme potansiyeli olan aktör veya olay
        (dolandırıcı, zararlı yazılım, veri sızıntısı).

    -   **Zafiyet:** Açıklık veya hatalı uygulama (zayıf parola,
        güncellenmemiş yazılım).

    -   **Risk:** Tehdit ve zafiyet birleştiğinde ortaya çıkan
        olasılık--etki bileşimi.

    -   **Etki:** Olay olursa kayıp türü ve büyüklüğü (para, veri,
        zaman, itibar).

-   **Neden önemli?** Modül 1'deki "risk = olasılık × etki" mantığı,
    önlem önceliklerini belirler.

-   **Basit örnek:** Aynı parolayı her yerde kullanmak zafiyettir; bir
    sızıntı tehdittir; etki zincirleme hesap kaybıdır.

-   **Gerçek hayatta nerede görülür?** Parola sızıntıları, kimlik avı
    mesajları, uygulama güvenlik açıkları.

**İpucu Kutusu --- Önce varlıklarını belirle (assets)**\
En değerli varlıklarınızı yazın: ana e-posta hesabı, banka uygulaması,
bulut depolama, telefon, kişisel fotoğraflar. Önlemleri bu varlıklara
göre önceliklendirin.

#### **2.2 Saldırı Yüzeyi ve Dijital Ayak İzi**

-   **Kısa tanım:** **Saldırı yüzeyi**, size ulaşılabilecek tüm giriş
    noktalarıdır (hesaplar, cihazlar, uygulamalar, ağlar). **Dijital
    ayak izi**, internette bıraktığınız izlerdir.

-   **Neden önemli?** Saldırı yüzeyi büyüdükçe zayıf halka ihtimali
    artar; dijital ayak izi ise hedefli saldırılarda "keşif" için
    kullanılabilir.

-   **Basit örnek:** Aynı e-posta ile çok sayıda siteye kayıt olmak;
    unutulan eski hesabı riskli hale getirebilir.

-   **Gerçek hayatta nerede görülür?** Eski üyelikler, sosyal medya
    paylaşımları, açık profil bilgileri.

Modül 1'deki "keşif (reconnaissance)" mantığı ve Modül 2'deki OSINT
kavramı; dijital ayak iziyle doğrudan ilişkilidir.

### **3) En Sık Yapılan Güvenlik Hataları ve Neden Tehlikelidir?**

Bu bölüm, pratikte en sık görülen "insan kaynaklı" zayıflıkları ve
bunların etkisini sistematik olarak ele alır.

#### **3.1 Parola Yorgunluğu ve Tekrar Kullanım**

-   **Kısa tanım:** Çok sayıda hesabı yönetmenin bilişsel yükü, aynı
    parolanın farklı yerlerde kullanılmasına yol açabilir.

-   **Neden önemli?** Modül 3'teki **credential stuffing** saldırıları,
    sızdırılmış kimlik bilgilerini başka platformlarda otomatik dener.

-   **Basit örnek:** Bir tasarım forumunda kullanılan parola aynı
    zamanda e-posta hesabında da kullanılıyorsa, forum sızıntısı
    e-postayı da riske atar.

-   **Gerçek hayatta nerede görülür?** Veri sızıntısı sonrası farklı
    hizmetlerde ardışık giriş denemeleri.

#### **3.2 Güncelleme İhmali (Update Fatigue) ve Patch Yönetimi**

-   **Kısa tanım:** Güncelleme bildirimlerini sürekli ertelemek, bilinen
    zafiyetlerin açık kalması demektir.

-   **Neden önemli?** Modül 4'te vurgulandığı gibi yamalar (patch)
    bilinen açıkları kapatır; güncellenmeyen sistemler otomatik istismar
    araçlarına karşı savunmasız kalır.

-   **Basit örnek:** Telefon veya tarayıcı aylarca güncellenmezse,
    bilinen açıklar uzun süre taşınır.

-   **Gerçek hayatta nerede görülür?** Büyük ölçekli fidye yazılımı
    dalgalarında, güncellemesi yapılmamış sistemlerin daha kolay
    etkilendiği görülmüştür.

**Dikkat Kutusu --- "Sessiz risk" etkisi**\
Güncellemeyi ertelemenin zararı genellikle hemen görünmez; ancak olay
anında maliyet bir anda büyür (Modül 7'deki "etkiyi sınırlama"
ihtiyacıyla bağlantılı).

#### **3.3 Sosyal Medyada Aşırı Paylaşım (Oversharing)**

-   **Kısa tanım:** Kişisel/kurumsal bilgilerin kontrolsüz paylaşımı.

-   **Neden önemli?** Aşırı paylaşım, saldırganın "keşif" aşamasında
    (Modül 1) hedef hakkında değerli bilgi toplamasına yardımcı olur;
    OSINT (Modül 2) ile birleşince etki artar.

-   **Basit örnek:** Ofis masasının fotoğrafında kargo etiketi, ekran
    kenarındaki not kâğıdı veya kimlik kartı görünmesi.

-   **Gerçek hayatta nerede görülür?** Sosyal medya paylaşımları,
    hikâyeler, etkinlik fotoğrafları.

### **4) Hesap Güvenliği: Kimlik, Parola, MFA ve Kurtarma**

Modül 3'teki hesap güvenliği temelleri burada günlük rutine
dönüştürülür.

#### **4.1 Güçlü ve Benzersiz Parola Stratejisi + Parola Yöneticisi Yaklaşımı**

-   **Kısa tanım:** Güçlü parola; uzun, tahmin edilmesi zor ve her hesap
    için benzersiz paroladır. Parola yöneticisi yaklaşımı, benzersiz
    parolaları güvenli biçimde yönetmeyi hedefler.

-   **Neden önemli?** Parola tekrarı zincirleme hesap kaybına yol açar
    (credential stuffing).

-   **Basit örnek:** Kısa ve tahmin edilebilir parolalar yerine uzun ve
    benzersiz parolalar tercih edilir; kişisel bilgi içermeyen uzun
    ifadeler daha dirençlidir.

-   **Gerçek hayatta nerede görülür?** Büyük sızıntılar sonrası hesap
    ele geçirmeler.

**Dikkat Kutusu --- Güvenlik soruları ve parola ipuçları**\
Güvenlik soruları sosyal mühendisliğe açıktır. Gerçek kişisel bilgi
yerine, hatırlanabilir ama ifşa riski düşük tutarlı yanıt stratejisi
geliştirin.

#### **4.2 Çok Faktörlü Kimlik Doğrulama (MFA) ve Yedek Kodlar**

-   **Kısa tanım:** MFA, parolaya ek bir doğrulama katmanı daha
    kullanmaktır (uygulama kodu, donanım anahtarı vb.).

-   **Neden önemli?** Parola sızsa bile ikinci faktör hesabı
    koruyabilir.

-   **Basit örnek:** E-posta hesabında MFA varsa, saldırgan parolayı
    bilse bile doğrulama kodu olmadan giriş yapamaz.

-   **Gerçek hayatta nerede görülür?** Bankacılık, e-posta servisleri,
    kurumsal hesaplar.

**İpucu Kutusu --- MFA yedek kurtarma kodları**\
Telefon kaybı gibi durumlara karşı, MFA yedek kodlarını güvenli bir
yerde saklamak hesap kurtarmayı kolaylaştırır.

#### **4.3 Ana E-posta Hijyeni ve Kurtarma Ayarları**

-   **Kısa tanım:** Hesap kurtarma; şifre unutma veya saldırı durumunda
    hesabı geri alma mekanizmalarıdır.

-   **Neden önemli?** Ana e-posta hesabı birçok hizmetin şifre sıfırlama
    kapısıdır.

-   **Basit örnek:** Ana e-posta hesabı için ayrı güçlü parola + MFA +
    güncel kurtarma seçenekleri (ikinci e-posta/telefon).

-   **Gerçek hayatta nerede görülür?** "Şifremi unuttum" süreçleri
    üzerinden hesap ele geçirme girişimleri.

Modül 3'teki En Az Yetki prensibi, erişim yönetimi ve hesap
ayrıcalıklarında temel yaklaşımdır.

### **5) Cihaz Güvenliği: Güncelleme, İzinler, Şifreleme ve Yedekleme**

Modül 4'teki uç nokta güvenliği, burada kontrol listesine dönüşür.

#### **5.1 Patch (Güncelleme) ve Patch Management**

-   **Kısa tanım:** Patch, güvenlik açıklarını kapatan güncellemedir.
    Patch management, güncellemeleri takip edip düzenli uygulama
    sürecidir.

-   **Neden önemli?** Bilinen açıklar yamalanmadığında otomatik istismar
    araçları için kolay hedef oluşur.

-   **Basit örnek:** Otomatik güncellemeleri kapalı tutmak, aylarca eski
    sürümde kalmaya yol açabilir.

-   **Gerçek hayatta nerede görülür?** Tarayıcı/işletim sistemi
    açıkları, uygulama güvenlik güncellemeleri.

#### **5.2 Uygulama Kaynakları, İzin Yönetimi ve Gereksiz Uygulama Temizliği**

-   **Kısa tanım:** Uygulama izinleri, uygulamanın
    kamera/konum/mikrofon/rehber gibi verilere erişim hakkıdır.

-   **Neden önemli?** Gereksiz izin, gereksiz veri riski demektir (Modül
    6'daki veri minimizasyonu ile ilişkilidir).

-   **Basit örnek:** Basit bir aracın rehbere erişim istemesi "işlevle
    ilişkili mi?" sorusunu doğurmalıdır.

-   **Gerçek hayatta nerede görülür?** Aşırı veri toplayan uygulamalar,
    reklam izleme ekosistemleri.

#### **5.3 Şifreleme ve Ekran Kilidi**

-   **Kısa tanım:** Şifreleme veriyi yetkisiz okumaya karşı korur; ekran
    kilidi fiziksel erişime karşı temel bariyerdir.

-   **Neden önemli?** Cihaz kaybı/çalınması durumunda gizliliği korur.

-   **Basit örnek:** Güçlü ekran kilidi ve şifreleme yoksa cihazı bulan
    kişi kişisel verilere ulaşabilir.

-   **Gerçek hayatta nerede görülür?** Kaybolan telefonlar, taşınabilir
    diskler.

Modül 5'teki kriptografi temelleri, şifrelemenin mantığını kavramayı
sağlar.

#### **5.4 3-2-1 Yedekleme Stratejisi ve Kurtarma Testi**

-   **Kısa tanım:** 3-2-1; verinin 3 kopyası, 2 farklı medya türü ve 1
    kopyasının farklı fiziksel konumda (off-site) tutulması
    yaklaşımıdır.

-   **Neden önemli?** Veri bütünlüğü ve erişilebilirliği için temel
    savunma hattıdır; fidye yazılımı, arıza, yanlış silme gibi risklerde
    etkiyi azaltır.

-   **Basit örnek:** Bulutta bir kopya + harici diskte bir kopya + bu
    kopyalardan birinin farklı konumda saklanması.

-   **Gerçek hayatta nerede görülür?** Cihaz arızaları, dosya kayıpları,
    fidye yazılımı sonrası geri dönüş.

**Dikkat Kutusu --- Yedek almak yetmez, geri yükleme test edilir**\
Yedeğin gerçekten işe yarayıp yaramadığını periyodik geri yükleme
testiyle doğrulayın.

### **6) Güvenli İnternet Kullanımı: Ağ Ortamı, VPN, HTTPS ve Doğrulama**

Modül 5'teki ağ temelleri bu bölümün arka plan bilgisidir.

#### **6.1 Halka Açık Wi-Fi ve MITM (Aradaki Adam) Riski**

-   **Kısa tanım:** Halka açık Wi-Fi ağları, trafiğin izlenmesi veya
    yönlendirilmesi gibi risklere daha açıktır. **MITM**, iki taraf
    arasındaki iletişimin gizlice izlenmesi/değiştirilmesidir.

-   **Neden önemli?** Ortam riski yükseldiğinde, aynı hata daha büyük
    etki doğurabilir.

-   **Basit örnek:** "FreeCafeWiFi" gibi bir ağın gerçekten kime ait
    olduğunu bilemeyebilirsiniz; hassas işlemleri ertelemek daha
    güvenlidir.

-   **Gerçek hayatta nerede görülür?** Kafe/otel/havaalanı ağları.

**Güvenli alternatif yaklaşımı:** Zorunluysa hücresel veri tercih etmek;
gerekiyorsa güvenli tünelleme yaklaşımı (ör. VPN) kullanmak.\
Modül 5'teki VPN ve ağ protokolleri; burada "ortam riskini"
anlamlandırır.

#### **6.2 HTTPS, Sertifika Uyarıları ve "Kilit Her Şeyi Kanıtlamaz"**

-   **Kısa tanım:** HTTPS, tarayıcı--site arasındaki trafiği şifreler;
    sertifika uyarısı güven ilişkisinin kurulamadığını gösterebilir.

-   **Neden önemli?** Şifreli trafik, her zaman "güvenilir niyet"
    anlamına gelmez; sahte siteler de HTTPS kullanabilir.

-   **Basit örnek:** Kilit simgesi iletişimin şifreli olduğunu
    gösterebilir; ancak alan adını ve içeriği doğrulamak gerekir.

-   **Gerçek hayatta nerede görülür?** Sahte giriş sayfaları, benzer
    görünen alan adları.

**İpucu Kutusu --- Alan adı ve gönderen kontrolü**\
Örneğin bir e-postada "<destek@example.com>" beklerken
"<destek@example-net.org>" gibi benzer görünen adresler şüphe
doğurmalıdır. Doğrulama için linke tıklamak yerine ilgili hizmete
tarayıcıdan kendiniz gidin.

### **7) Sosyal Mühendislik ve Dolandırıcılıklara Karşı Dayanıklılık**

Modül 2'deki sosyal mühendislik burada günlük hayata uyarlanır.

#### **7.1 Phishing: Mesaj Sinyalleri ve 3 Adımlı Kontrol**

-   **Kısa tanım:** Phishing; sahte mesajlarla kullanıcıyı bağlantıya
    tıklamaya, bilgi vermeye veya işlem yapmaya ikna etme girişimidir.

-   **Neden önemli?** Birçok saldırı, kullanıcının kendi eliyle kimlik
    bilgisi vermesiyle başlar.

-   **Basit örnek:** "Hesabınız askıya alındı, hemen doğrulayın" mesajı;
    sahte giriş sayfasına yönlendirebilir.

-   **Gerçek hayatta nerede görülür?** E-posta, SMS, mesajlaşma
    uygulamaları, sosyal medya.

**İpucu Kutusu --- 3 adımlı kontrol**

1.  Ton: acele/korku/ödül var mı?

2.  İşlem: parola/OTP/para transferi gibi kritik mi?

3.  Doğrulama: bağımsız kanaldan kontrol edilebilir mi?

#### **7.2 Vishing/Smishing ve OTP Paylaşmama Kuralı**

-   **Kısa tanım:** Vishing telefonla, smishing SMS ile
    dolandırıcılıktır.

-   **Neden önemli?** Resmiyet hissi hızlı iknaya yol açabilir.

-   **Basit örnek:** "Hesabınızda şüpheli işlem var" denilerek OTP
    istenmesi.

-   **Gerçek hayatta nerede görülür?** Sahte destek aramaları,
    banka/kurum taklidi.

**Dikkat Kutusu --- OTP/MFA kodu paylaşılmaz**\
OTP/MFA kodu kimliğin son anahtarı olabilir; kural olarak kimseyle
paylaşılmaz.

### **8) Çıkarılabilir Medya ve Fiziksel Güvenlik: Gözden Kaçan Riskler**

Bu başlık, "sadece dijital" sanılan güvenlik algısının ötesine geçer.

#### **8.1 Bilinçsiz USB/Güç Bankası Kullanımı**

-   **Kısa tanım:** Bulunan veya kaynağı belirsiz çıkarılabilir medya,
    zararlı yazılım taşıyabilir.

-   **Neden önemli?** Merak ve hız, teknik önlemleri baypas eder;
    zararlı içerik (payload) çalıştırılabilir.

-   **Basit örnek:** Otoparkta bulunan USB'nin bilgisayara takılması;
    zararlının ağa yayılmasına yol açabilir.

-   **Gerçek hayatta nerede görülür?** Kurumlarda "bırakılmış USB"
    senaryoları, tedarik zinciri riskleri.

Modül 2'deki Truva Atı ve solucan gibi zararlı türleri; bu riskin
mantığını açıklar.\
Modül 7'deki "sınırlama" yaklaşımı; şüpheli medya temasında cihazı izole
etmeye giden refleksin temelidir.

#### **8.2 Tailgating: Fiziksel Güvenlik ve Sosyal Mühendislik Kesişimi**

-   **Kısa tanım:** Tailgating, yetkisiz bir kişinin "kapıyı tutma" gibi
    iyi niyetli davranışlarla fiziksel alana sızmasıdır.

-   **Neden önemli?** Fiziksel erişim, dijital kontrolleri
    anlamsızlaştırabilecek kadar güçlü sonuçlar doğurabilir.

-   **Basit örnek:** Tanımadığınız birinin "kartımı unuttum" diyerek
    arkanızdan giriş yapması.

-   **Gerçek hayatta nerede görülür?** Ofisler, veri merkezleri, ortak
    çalışma alanları.

### **9) Zero Trust ve En Az Yetki: Günlük Hayata Uyarlanmış Güvenlik Prensipleri**

#### **9.1 Sıfır Güven (Zero Trust): "Asla Güvenme, Her Zaman Doğrula"**

-   **Kısa tanım:** Zero Trust, ağın içinde bile her erişim isteğinin
    doğrulanmasını savunur.

-   **Neden önemli?** "İçerisi güvenlidir" varsayımı, modern tehditlerde
    geçerliliğini yitirir.

-   **Basit örnek:** Hesap girişlerinde MFA kullanmak ve her oturumda
    anomali kontrolü yapmak.

-   **Gerçek hayatta nerede görülür?** Kurumsal erişim politikaları, çok
    faktörlü doğrulama sistemleri.

#### **9.2 En Az Yetki (Least Privilege)**

-   **Kısa tanım:** Kullanıcıya sadece işini yapması için gereken
    minimum yetkinin verilmesi.

-   **Neden önemli?** Yetki fazlalığı, ele geçirilen hesabın etkisini
    büyütür.

-   **Basit örnek:** Günlük işler için yönetici ayrıcalığı kullanmamak;
    gerekmeyen erişimleri kapatmak.

-   **Gerçek hayatta nerede görülür?** Kurumsal IAM politikaları, dosya
    paylaşım izinleri.

**:** Modül 3'teki yetkilendirme mantığı ve Modül 6'daki uyum
yaklaşımıyla doğrudan ilişkilidir.

### **10) Kişisel Olay Müdahale Mini Planı: Bir Şey Olursa Ne Yapacağım?**

Modül 7'deki olay yönetimi akışı bireysel ölçekte sadeleştirilir.

#### **10.1 Şüpheli Durumda İlk Adımlar (Kontrol Listesi)**

-   **Kısa tanım:** Olay refleksi; panik yerine sıralı ve kayıtlı
    hareket etmektir.

-   **Neden önemli?** Yanlış adımlar (kanıtı bozma, kontrolsüz paylaşım,
    acele karar) zararı büyütür.

-   **Basit örnek:** Şüpheli giriş bildirimi aldınız: önce hesabı güvene
    alın, sonra kapsamı kontrol edin.

-   **Gerçek hayatta nerede görülür?** Şüpheli oturum uyarıları, cihaz
    kaybı, beklenmedik işlem bildirimi.

**Önerilen akış:**

1.  **Sınırlama:** Şüpheli oturumu kapat, parolayı değiştir, mümkünse
    tüm cihazlardan çıkış yap.

2.  **Güçlendirme:** MFA etkinleştir/yenile; kurtarma bilgilerini
    güncelle.

3.  **Kapsam kontrolü:** Aynı e-posta/parola kullanılan diğer kritik
    hesaplardan başlayarak parolaları değiştir.

4.  **Kayıt:** Ne zaman fark ettin? Hangi belirti vardı? Ne yaptın? Kısa
    not tut.

5.  **Kontrollü iletişim:** Resmi destek kanallarına başvur; finansal
    risk varsa bankayı resmi kanaldan ara.

#### **10.2 Kanıt ve Kayıt Disiplini (Incident Journal) + Maskeleme (Redaction)**

-   **Kısa tanım:** Kanıt; olayı anlamaya yarayan bilgi; olay günlüğü;
    zaman çizelgesi ve aksiyon kaydıdır. Redaction, paylaşım öncesi
    hassas bilgiyi maskelemedir.

-   **Neden önemli?** Stres altında unutma olur; yazılı kayıt doğruluğu
    ve tutarlılığı artırır.

-   **Basit örnek:** Şüpheli e-posta geldi: gönderen adresi, tarih/saat,
    konu ve attığınız adımı kaydedin; ekran görüntüsü paylaşacaksanız
    gereksiz kişisel verileri gizleyin.

-   **Gerçek hayatta nerede görülür?** Destek talepleri, hesap kurtarma
    süreçleri, uyuşmazlıklar.

Modül 6'daki "doğru iletişim ve gizlilik" ilkesi; olay sırasında da
geçerlidir.

### **11) Kişisel Güvenlik Planı: Sürdürülebilir 15 Dakika Rutini**

Bu bölüm, modülün tüm kazanımlarını tek bir uygulanabilir plana bağlar.

#### **11.1 Haftalık/Kısa Periyotlu Kontroller**

-   Ana e-posta ve kritik hesaplar: MFA açık mı, kurtarma bilgileri
    güncel mi?

-   Kullanılmayan hesaplar: kapatılabilir mi, parola/izinleri
    güçlendirilebilir mi?

-   Cihaz güncellemeleri: bekleyen güncelleme var mı?

-   Yedekleme: son yedek ne zaman, geri yükleme denendi mi?

-   Paylaşım kontrolü: son paylaşımlarda aşırı bilgi var mı?
    (oversharing)

#### **11.2 Günlük Davranış Kuralları (Dijital Hijyen)**

-   Acele ettiren mesajlarda dur--doğrula--sonra işlem yap.

-   OTP/MFA kodunu paylaşma.

-   Açık ağlarda hassas işlemleri ertele; gerekiyorsa güvenli bağlantı
    yaklaşımı kullan.

-   Gereksiz uygulamaları kaldır; izinleri azalt.

-   Şüpheli USB/medya takma; kaynağı belirsiz donanımı kullanma.

**Mini özet:** Bu plan, Modül 3--4--5'in teknik temellerini
"alışkanlığa", Modül 6'nın veri/etik çerçevesini "davranış disiplinine",
Modül 7'nin olay yönetimini "doğru reflekslere" dönüştürür.

## **Terimler Sözlüğü (Glossary)**

  **Terim**             **Türkçe karşılığı / açıklama**
  --------------------- --------------------------------------------------------------------
  CIA Triad             Gizlilik--Bütünlük--Erişilebilirlik güvenlik hedefleri
  Threat                Tehdit; zarar verme potansiyeli olan aktör/olay
  Vulnerability         Zafiyet; açıklık veya hatalı uygulama
  Risk                  Risk; olasılık ve etki bileşimi
  Impact                Etki; olay olursa ortaya çıkan kayıp
  Attack Surface        Saldırı yüzeyi; giriş noktaları toplamı
  Digital Footprint     Dijital ayak izi; internette bırakılan izler
  Oversharing           Aşırı paylaşım; riskli düzeyde bilgi paylaşma
  OSINT                 Açık kaynaklardan bilgi toplama disiplini
  Reconnaissance        Keşif; hedef hakkında bilgi toplama aşaması
  Credential Stuffing   Sızdırılmış kimlik bilgilerinin başka sitelerde otomatik denenmesi
  Password Manager      Parola yöneticisi yaklaşımı/araçları
  MFA                   Çok faktörlü kimlik doğrulama
  OTP                   Tek kullanımlık doğrulama kodu
  Patch                 Yama/güncelleme; güvenlik açığı düzeltmesi
  Patch Management      Güncellemelerin takibi ve uygulanması süreci
  Digital Hygiene       Dijital hijyen; düzenli temel güvenlik alışkanlıkları
  Permission            Uygulama izni; verilere/özelliklere erişim hakkı
  Encryption            Şifreleme; veriyi yetkisiz okumaya karşı koruma
  Backup                Yedekleme; verinin güvenli kopyası
  3-2-1 Rule            3 kopya, 2 medya, 1 off-site yedek yaklaşımı
  Off-site Backup       Fiziksel olarak farklı konumda tutulan yedek
  MITM Attack           Aradaki adam saldırısı; iletişimin izlenmesi/değiştirilmesi
  VPN                   Güvenli tünel yaklaşımıyla bağlantıyı korumaya yardımcı teknoloji
  HTTPS                 Web trafiğini şifreleyen iletişim protokolü
  Phishing              Kimlik avı; sahte mesajlarla kandırma
  Vishing               Telefonla dolandırıcılık
  Smishing              SMS ile dolandırıcılık
  Zero Trust            "Asla güvenme, her zaman doğrula" güvenlik modeli
  Least Privilege       En az yetki; minimum gerekli ayrıcalıkla çalışma
  Trojan                Truva Atı; yararlı gibi görünen zararlı yazılım türü
  Payload               Zararlı içeriğin asıl çalıştırılan kısmı
  Worm                  Solucan; kendini yayabilen zararlı yazılım türü
  Incident Journal      Olay günlüğü; zaman çizelgesi ve aksiyon kayıtları
  Redaction             Maskeleme; paylaşım öncesi hassas bilgiyi gizleme
  Tailgating            Fiziksel alana izinsiz "arkadan sızma" davranışı

## **Test Soruları**

1.  Aşağıdakilerden hangisi CIA üçlüsünü doğru ifade eder?\
    A) Maliyet--Performans--Hız\
    B) Gizlilik--Bütünlük--Erişilebilirlik\
    C) Donanım--Yazılım--Ağ\
    D) Parola--OTP--VPN\
    **Doğru Cevap: B**\
    Açıklama: CIA, bilginin gizli kalması, doğru/bozulmamış olması ve
    gerektiğinde erişilebilir olması hedefidir.

2.  "Risk" kavramı aşağıdakilerden hangisine en yakındır?\
    A) Sadece tehditlerin listesi\
    B) Tehdit ve zafiyetin birleşmesiyle oluşan olasılık--etki
    değerlendirmesi\
    C) Sadece antivirüs kurmak\
    D) Sadece internet hızını artırmak\
    **Doğru Cevap: B**\
    Açıklama: Risk, olasılık ve etki bileşenleriyle değerlendirilir
    (Modül 1 ile ilişkili).

3.  Aynı parolayı birçok hesapta kullanmak hangi riski büyütür?\
    A) Sadece cihazın pil tüketimini artırır\
    B) Credential stuffing ile zincirleme hesap kaybı riskini artırır\
    C) HTTPS'i devre dışı bırakır\
    D) VPN'i otomatik açar\
    **Doğru Cevap: B**\
    Açıklama: Bir sızıntı başka hesaplara taşınabilir; otomatik deneme
    saldırıları yaygındır (Modül 3 ile ilişkili).

4.  MFA'nın temel katkısı aşağıdakilerden hangisidir?\
    A) Parolayı tamamen gereksiz kılar\
    B) Parola sızsa bile ek doğrulama katmanı ile hesabı korumaya
    yardımcı olur\
    C) Sadece sosyal medyada çalışır\
    D) Yedeklemeyi otomatik yapar\
    **Doğru Cevap: B**\
    Açıklama: MFA, parolaya ek bir faktör ister; ele geçirmeyi
    zorlaştırır.

5.  Güncellemeleri sürekli ertelemek neden "sessiz risk" üretir?\
    A) Çünkü ekran parlaklığı düşer\
    B) Çünkü bilinen zafiyetler açık kalır ve olay anında etki
    büyüyebilir\
    C) Çünkü parola yöneticisi çalışmaz\
    D) Çünkü cihaz otomatik olarak formatlanır\
    **Doğru Cevap: B**\
    Açıklama: Yamalar bilinen açıkları kapatır; erteleme savunmasızlığı
    uzatır (Modül 4 ve Modül 7 ile ilişkili).

6.  3-2-1 yedekleme stratejisindeki "1" neyi temsil eder?\
    A) Tek bir parola kullanmayı\
    B) Bir kopyanın fiziksel olarak farklı konumda (off-site)
    tutulmasını\
    C) Yedeğin bir günde tamamlanmasını\
    D) Sadece bir dosyanın yedeklenmesini\
    **Doğru Cevap: B**\
    Açıklama: Felaket senaryolarına karşı bir kopyanın farklı konumda
    olması kritiktir.

7.  "HTTPS kilit simgesi olan her site tamamen güvenilirdir" ifadesi
    için en doğru değerlendirme hangisidir?\
    A) Doğru\
    B) Yanlış\
    C) Sadece mobilde doğrudur\
    D) Sadece bankalarda doğrudur\
    **Doğru Cevap: B**\
    Açıklama: HTTPS iletişimi şifreler; sitenin sahibinin niyetini veya
    içeriğin güvenilirliğini tek başına kanıtlamaz.

8.  Halka açık Wi-Fi ortamında riskin artmasının temel nedeni
    aşağıdakilerden hangisine daha yakındır?\
    A) Bilgisayarın işlemcisinin yavaşlaması\
    B) Ortamda dinleme/yönlendirme gibi MITM risklerinin yükselmesi\
    C) Parolanın otomatik değişmesi\
    D) Yedeklemenin durması\
    **Doğru Cevap: B**\
    Açıklama: Ortak ağlarda trafik izleme veya yönlendirme riski
    artabilir (Modül 5 ile ilişkili).

9.  Şüpheli giriş bildirimi alındığında Modül 7 yaklaşımıyla uyumlu ilk
    adım hangisidir?\
    A) Panikle tüm bildirimleri silmek\
    B) Sınırlama yapıp hesabı güvene almak; sonra kayıt tutmak ve
    kapsamı kontrol etmek\
    C) Doğrulamadan herkese duyuru yapmak\
    D) Hiçbir işlem yapmadan beklemek\
    **Doğru Cevap: B**\
    Açıklama: Sınırlama--kayıt--doğrulama--kontrollü iletişim, olay
    yönetimi disiplinidir (Modül 7 ile ilişkili).

10. "Zero Trust" yaklaşımının özünü en iyi hangisi özetler?\
    A) İç ağdaki her şey otomatik güvenlidir\
    B) Asla güvenme, her zaman doğrula\
    C) Yalnızca parolayı uzatmak yeterlidir\
    D) Yedekleme gereksizdir\
    **Doğru Cevap: B**\
    Açıklama: Zero Trust, her erişim isteğinin doğrulanmasını savunur;
    varsayılan güveni azaltır.

## **Bu Modülde Neler Öğrendik?**

-   Güvenlik farkındalığının teknik önlemler kadar davranış disiplinine
    dayandığını ve insan faktörünün kritik olduğunu öğrendik.

-   CIA üçlüsünü günlük kararlarla ilişkilendirerek "hangi davranış
    hangi etkiyi doğurur?" bakışını geliştirdik.

-   En yaygın hataları sistematik biçimde ele aldık: parola tekrarı,
    güncelleme ihmali, aşırı paylaşım ve bunların sonuçları.

-   Hesap güvenliği için uygulanabilir bir plan kurduk: benzersiz
    parola, parola yöneticisi yaklaşımı, MFA, kurtarma ayarları.

-   Cihaz güvenliği hijyenini yapılandırdık: patch yönetimi, izinler,
    şifreleme, yedekleme ve geri yükleme testi.

-   Halka açık ağlarda ortam riskini, MITM mantığını ve doğrulama
    refleksini güçlendirdik; HTTPS'in sınırlarını öğrendik.

-   Sosyal mühendislikte phishing/vishing/smishing sinyallerini
    tanıyarak "dijital şüphecilik" becerisini geliştirdik.

-   Zero Trust ve En Az Yetki prensiplerini günlük hayata uyarlayarak
    erişim kararlarını daha güvenli hale getirdik.

-   Modül 7'deki olay yönetimi disiplinini bireysel mini müdahale
    planına dönüştürdük: sınırlama, kayıt, doğrulama, kontrollü
    iletişim.
