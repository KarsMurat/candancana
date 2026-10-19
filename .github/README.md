# Candan Cana — etkileşimli demo

HTML, CSS ve JavaScript ile hazırlanmış Türkçe konsept demo. Paket kurulumu,
framework, veritabanı veya uygulama sunucusu gerektirmez.

## Demo adresi

GitHub Pages hedefi: https://karsmurat.github.io/candancana/

Mağaza, örnek satın alma, müşteri hesabı, dijital anı sayfaları, çalışan paneli,
ürün/fiyat/stok yönetimi ve şematik dikim haritası aynı yerel demo verisini kullanır.

**Gerçek ödeme, sipariş işleme, e-posta gönderimi veya kimlik doğrulama yoktur.**
Yönetim ekranı herkesin deneyebileceği bir demo görünümüdür. Yalnızca örnek
bilgiler kullanın. Değişiklikler ziyaretçinin tarayıcısında localStorage içinde
tutulur; farklı cihazlara veya diğer ziyaretçilere aktarılmaz. Anı bağlantıları,
değiştirilmemiş başlangıç örnekleri dışında cihazlar arası paylaşım sağlamaz.
Üst çubuktaki Sıfırla düğmesi yalnızca o tarayıcıdaki demo verisini sıfırlar.

Tohum, Filiz ve Kök paketlerinin güncel fiyatı **0 TL**’dir. Eski tarayıcı
kayıtları bir defalık katalog geçişiyle güncellenir. Mevcut siparişlerin kayıtlı
tutarları, stoklar ve diğer demo düzenlemeleri korunur. Sonraki fiyat değişiklikleri
yönetim panelinden yapılabilir; 0 TL dahil geçerli fiyatlar yenilemede saklanır.

## Yerelde açma

index.html dosyasını tarayıcıda açın veya depo klasöründe aşağıdaki komutu çalıştırın:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

## Yayınlama

main dalına gönderilen site değişiklikleri `.github/workflows/pages.yml`
üzerinden otomatik yayımlanır. Actions ekranından elle de çalıştırılabilir.
Pages yayın kaynağı **GitHub Actions** olarak seçilmelidir.

Yayın öncesi JavaScript sözdizimi kontrol edilir. Sadece
`.github/pages-files.txt` içindeki dosyalar `_site` klasörüne kopyalanır.
`deployment.json`, commit SHA'sını ve yayın dosyalarının SHA-256 özetlerini içerir.

```sh
python3 .github/scripts/prepare-pages.py
```

Bu depo ve yayın; patent başvuru formunu, yatırımcı sunumunu, iç proje belgelerini,
yerel test kayıtlarını veya yapılandırma sırlarını içermez. `.gitignore`, sadece
incelenmiş demo dosyalarını izlemeye izin verir. Yeni bir yayın dosyası eklerken
hem `.gitignore` hem de yayın dosya listesi güncellenmelidir.

## Görseller

Konsept ve marka görselleri proje sahibinin sağladığı varlıklardan hazırlanmıştır.
15 Ekim tarihli yeni logonun simgesi üst menü ve yönetim panelinde, tam hali alt
bölümde kullanılır. Aynı simgeden favicon hazırlanmıştır. Eski logo yayından çıkarılmıştır.
Luna ve Misket fotoğrafları Unsplash örnek görselleridir; gerçek müşteri kaydı değildir.
Cormorant Garamond yazı tipi SIL Open Font License 1.1 ile sunulur;
lisans metni `assets/FONT_LICENSE.txt` dosyasındadır.

Harita yerel SVG çizimidir, gerçek harita servisi veya navigasyon değildir.
`robots.txt` ve robots meta etiketi demoyu arama indeksinden uzak tutmayı amaçlar;
bunlar erişim kontrolü değildir. Demo internette herkese açıktır.
