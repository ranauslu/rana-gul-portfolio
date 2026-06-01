# Rana Gül — Portföy & Desen Sitesi

Porselen / sofra takımı yüzey deseni portföyü. Tamamen **statik** bir site:
HTML + CSS + JavaScript. Sunucu veya kurulum gerektirmez.

## Çalıştırma

İki yol var:

1. **En basit:** `index.html` dosyasına çift tıkla, tarayıcıda açılır.
2. **Yerel sunucu (önerilir):** Terminalde bu klasörde:
   ```
   python3 -m http.server 8000
   ```
   Sonra tarayıcıda `http://localhost:8000` adresini aç.

## Yayınlama

Klasörün tamamını şu servislerden birine yükle (ücretsiz):
- **GitHub Pages** — repoyu yükle, Settings → Pages’ten yayınla.
- **Netlify** — klasörü sürükle-bırak.

## İçeriği düzenleme

| Ne | Nerede |
|----|--------|
| İsim, biyografi, beceriler | `index.html` — `<!-- DÜZENLE -->` yorumlarına bak |
| Desenler, kategoriler, fiyatlar | `js/main.js` — en üstteki `DESENLER` listesi |
| E-posta / WhatsApp numarası | `js/main.js` — `EPOSTA` ve `WHATSAPP` değişkenleri + `index.html` iletişim bölümü |
| Renkler | `css/style.css` — en üstteki `:root` değişkenleri |
| Profil fotoğrafı | `assets/img/profil.jpg` ekle, `index.html`’deki placeholder’ı `<img>` ile değiştir |

### Yeni desen ekleme

1. Görseli `desenlerim/` klasörüne koy.
2. `js/main.js` içindeki `DESENLER` listesine bir satır ekle:
   ```js
   { kod: "EH DSN 2610", dosya: "desenlerim/EH DSN 2610.jpg", kategori: "cicekli", fiyat: "₺2.500" },
   ```
   `kategori`: `"cicekli"`, `"geometrik"` veya `"botanik"`.

Desen hem **Tasarımlar** galerisinde hem **Desen Satın Al** bölümünde otomatik görünür.

## Özellikler

- Türkçe / İngilizce dil değiştirme (tercih tarayıcıda saklanır)
- Galeri kategori filtreleri + tıklayınca büyüten lightbox
- "Satın Al / Teklif Al" → otomatik e-posta + WhatsApp mesajı
- Mobil uyumlu (responsive) tasarım, mor + turuncu sade tema
