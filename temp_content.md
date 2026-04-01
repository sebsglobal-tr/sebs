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

