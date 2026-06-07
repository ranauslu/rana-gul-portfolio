/* ============================================================
   Rana Gül portföyü — etkileşim
   Dil değiştirme, mobil menü, galeri/satış üretimi, lightbox.
   ============================================================ */

// --- Desen verisi (görseller AES ile şifreli; enc = desenler-enc/<id>.enc) ---
// kategori: "cicekli" | "geometrik" | "botanik"
const DESENLER = [
  { kod: "EH DSN 2591", enc: "desenler-enc/2591.enc", kategori: "cicekli",   fiyat: "₺2.500" },
  { kod: "EH DSN 2592", enc: "desenler-enc/2592.enc", kategori: "cicekli",   fiyat: "₺2.500" },
  { kod: "EH DSN 2598", enc: "desenler-enc/2598.enc", kategori: "geometrik", fiyat: "₺2.000" },
  { kod: "EH DSN 2599", enc: "desenler-enc/2599.enc", kategori: "geometrik", fiyat: "₺2.800" },
  { kod: "EH DSN 2601", enc: "desenler-enc/2601.enc", kategori: "geometrik", fiyat: "₺1.800" },
  { kod: "EH DSN 2605", enc: "desenler-enc/2605.enc", kategori: "botanik",   fiyat: "₺2.800" },
];

// --- Şifreleme ayarları (salt gizli değildir; anahtar yalnızca tarayıcıda türetilir) ---
const ENC_SALT_HEX = "43c343aeff39cf50369d12da51da4d1c";
const ENC_ITER = 200000;
let cryptoKey = null;        // çözülmüş AES anahtarı (şifre doğruysa)
let unlocked = false;        // bölüm açıldı mı
const blobCache = {};        // kod -> çözülmüş görsel blob URL'i

function hexToBytes(hex) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
  return a;
}
async function deriveKey(password) {
  const baseKey = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: hexToBytes(ENC_SALT_HEX), iterations: ENC_ITER, hash: "SHA-256" },
    baseKey, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
}
async function decryptToUrl(path, key) {
  const buf = new Uint8Array(await (await fetch(path)).arrayBuffer());
  const iv = buf.slice(0, 12);
  const data = buf.slice(12); // ciphertext + tag
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return URL.createObjectURL(new Blob([plain], { type: "image/jpeg" }));
}

const KATEGORI_AD = {
  cicekli:   { tr: "Çiçekli",   en: "Floral" },
  geometrik: { tr: "Geometrik", en: "Geometric" },
  botanik:   { tr: "Botanik",   en: "Botanical" },
};

// --- Birlikte çalışılan markalar (DÜZENLE: logo eklemek için firmalogolar/'a koy + buraya satır ekle) ---
// dark: true → logo açık/beyaz renkli, koyu zemin gerektiriyor
const FIRMALAR = [
  { ad: "Farika Porselen", dosya: "firmalogolar/Farika-Porselen-Logo-siyah-1775120863.png" },
  { ad: "Tulu Porselen",   dosya: "firmalogolar/logo-3.svg", dark: true },
  { ad: "English Home",    dosya: "firmalogolar/english-home-yeni-amblem-ve-logo-00.jpg" },
  { ad: "Karaca",          dosya: "firmalogolar/00983bcb6bc86de5958d8f4be2852a7e.jpg" },
  { ad: "Linens",          dosya: "firmalogolar/148394948089726.jpeg" },
  { ad: "Madame Coco",     dosya: "firmalogolar/291_original.jpg" },
  { ad: "Gallery Crystal", dosya: "firmalogolar/logo png.png" },
];

// DÜZENLE: satın alma / teklif mesajlarının gideceği adresler
const EPOSTA = "ranaguldesigner@gmail.com";
const WHATSAPP = "905462629501"; // ülke kodu + numara, başında + ve boşluk olmadan

const t = (tr, en) => (document.body.dataset.lang === "en" ? en : tr);
const src = (yol) => encodeURI(yol);

/* ---------------- Galeri ---------------- */
const gallery = document.getElementById("gallery");
function renderGallery(filtre = "all") {
  if (!gallery) return;
  gallery.innerHTML = "";
  DESENLER.filter((d) => filtre === "all" || d.kategori === filtre).forEach((d) => {
    const tag = KATEGORI_AD[d.kategori];
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";
    tile.innerHTML = `
      <img src="${src(d.dosya)}" alt="${d.kod} — ${t(tag.tr, tag.en)}" loading="lazy" />
      <div class="tile-meta">
        <span class="tile-code">${d.kod}</span>
        <span class="tile-tag">${t(tag.tr, tag.en)}</span>
      </div>`;
    tile.addEventListener("click", () => openLightbox(d));
    gallery.appendChild(tile);
  });
}

/* ---------------- Filtreler ---------------- */
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderGallery(btn.dataset.filter);
  });
});

/* ---------------- Satış (şifre çözülünce) ---------------- */
const shop = document.getElementById("shop");
function renderShop() {
  if (!shop || !unlocked) return; // yalnızca kilit açılınca
  shop.innerHTML = "";
  DESENLER.forEach((d) => {
    const tag = KATEGORI_AD[d.kategori];
    const konu = encodeURIComponent(`Desen satın alma — ${d.kod}`);
    const govde = encodeURIComponent(
      `Merhaba Rana, "${d.kod}" desenini satın almak / hakkında teklif almak istiyorum.`
    );
    const mailto = `mailto:${EPOSTA}?subject=${konu}&body=${govde}`;
    const wa = `https://wa.me/${WHATSAPP}?text=${govde}`;

    const item = document.createElement("article");
    item.className = "shop-item";
    item.innerHTML = `
      <img src="${blobCache[d.kod] || ""}" alt="${d.kod}" />
      <div class="shop-body">
        <span class="shop-code">${d.kod}</span>
        <span class="shop-tag">${t(tag.tr, tag.en)}</span>
        <span class="shop-price">${d.fiyat}</span>
        <a class="btn btn-primary shop-buy" href="${mailto}">${t("Satın Al / Teklif Al", "Buy / Request Quote")}</a>
        <a class="shop-wa" href="${wa}" target="_blank" rel="noopener" style="text-align:center;margin-top:8px;font-size:0.85rem;color:var(--ink-soft)">${t("WhatsApp ile sor", "Ask via WhatsApp")}</a>
      </div>`;
    shop.appendChild(item);
  });
}

/* ---------------- Kilit / şifre çözme ---------------- */
const lockForm = document.getElementById("lockForm");
if (lockForm) {
  lockForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("lockInput");
    const errorEl = document.getElementById("lockError");
    const btn = lockForm.querySelector("button");
    const pw = input.value;
    errorEl.hidden = true;
    btn.disabled = true;
    const oldLabel = btn.textContent;
    btn.textContent = "…";
    try {
      const key = await deriveKey(pw);
      // Tüm desenleri çöz — yanlış şifrede ilki hata fırlatır
      for (const d of DESENLER) {
        blobCache[d.kod] = await decryptToUrl(d.enc, key);
      }
      cryptoKey = key;
      unlocked = true;
      renderShop();
      document.getElementById("lockGate").hidden = true;
      document.getElementById("shopProtected").hidden = false;
    } catch (err) {
      // yanlış şifre → çözme başarısız
      Object.keys(blobCache).forEach((k) => delete blobCache[k]);
      errorEl.hidden = false;
      input.value = "";
      input.focus();
    } finally {
      btn.disabled = false;
      btn.textContent = oldLabel;
    }
  });
}

/* ---------------- Banner carousel ---------------- */
const BANNER_COUNT = 15; // assets/banners/b01.jpg ... b15.jpg
const bc = document.getElementById("bc");
function buildCarousel() {
  if (!bc) return;
  const slides = [];
  const dots = document.createElement("div");
  dots.className = "bc-dots";

  for (let i = 1; i <= BANNER_COUNT; i++) {
    const img = document.createElement("img");
    img.className = "bc-slide" + (i === 1 ? " active" : "");
    img.alt = "Rana Gül Design Studio — desen koleksiyonu " + i;
    img.decoding = "async";
    const path = "assets/banners/b" + String(i).padStart(2, "0") + ".jpg";
    if (i === 1) img.src = path; else img.dataset.src = path;
    bc.appendChild(img);
    slides.push(img);

    const dot = document.createElement("button");
    dot.className = "bc-dot" + (i === 1 ? " active" : "");
    dot.type = "button";
    dot.setAttribute("aria-label", "Slayt " + i);
    dot.addEventListener("click", () => goTo(i - 1, true));
    dots.appendChild(dot);
  }

  const prev = document.createElement("button");
  prev.className = "bc-arrow bc-prev"; prev.type = "button";
  prev.setAttribute("aria-label", "Önceki"); prev.innerHTML = "‹";
  const next = document.createElement("button");
  next.className = "bc-arrow bc-next"; next.type = "button";
  next.setAttribute("aria-label", "Sonraki"); next.innerHTML = "›";
  prev.addEventListener("click", () => goTo(cur - 1, true));
  next.addEventListener("click", () => goTo(cur + 1, true));

  bc.appendChild(prev); bc.appendChild(next); bc.appendChild(dots);

  let cur = 0;
  let timer = null;
  const dotEls = dots.querySelectorAll(".bc-dot");

  function load(i) {
    const s = slides[i];
    if (s && s.dataset.src) { s.src = s.dataset.src; delete s.dataset.src; }
  }
  function goTo(i, manual) {
    i = (i + BANNER_COUNT) % BANNER_COUNT;
    slides[cur].classList.remove("active");
    dotEls[cur].classList.remove("active");
    cur = i;
    load(cur); load((cur + 1) % BANNER_COUNT); // mevcut + sonraki ön-yükle
    slides[cur].classList.add("active");
    dotEls[cur].classList.add("active");
    if (manual) restart();
  }
  function start() { timer = setInterval(() => goTo(cur + 1, false), 5000); }
  function restart() { clearInterval(timer); start(); }

  load(1); // ikinci slaytı baştan hazırla
  bc.addEventListener("mouseenter", () => clearInterval(timer));
  bc.addEventListener("mouseleave", start);
  start();
  // dışarıdan erişim (goTo) için kapanışta tut
  window.__bcGoTo = goTo;
}

/* ---------------- Markalar ---------------- */
const firmalar = document.getElementById("firmalar");
function renderBrands() {
  if (!firmalar) return;
  firmalar.innerHTML = "";
  FIRMALAR.forEach((f) => {
    const cell = document.createElement("div");
    cell.className = "brand-cell" + (f.dark ? " brand-cell--dark" : "");
    cell.innerHTML = `<img src="${src(f.dosya)}" alt="${f.ad}" title="${f.ad}" loading="lazy" />`;
    firmalar.appendChild(cell);
  });
}

/* ---------------- Lightbox ---------------- */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCap = document.getElementById("lightboxCaption");

function openLightbox(d) {
  const tag = KATEGORI_AD[d.kategori];
  lightboxImg.src = src(d.dosya);
  lightboxImg.alt = d.kod;
  lightboxCap.textContent = `${d.kod} — ${t(tag.tr, tag.en)}`;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}
if (lightbox) {
  document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
}

/* ---------------- Dil değiştirme ---------------- */
function applyLang(lang) {
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-tr]").forEach((el) => {
    const val = lang === "en" ? el.dataset.en : el.dataset.tr;
    if (val != null) el.innerHTML = val;
  });
  // input placeholder çevirileri (data-tr-ph / data-en-ph)
  document.querySelectorAll("[data-tr-ph]").forEach((el) => {
    el.placeholder = lang === "en" ? el.dataset.enPh : el.dataset.trPh;
  });
  localStorage.setItem("dil", lang);
  // dinamik bölümleri yeniden çiz (etiketler dile göre)
  const aktif = document.querySelector(".filter.is-active")?.dataset.filter || "all";
  renderGallery(aktif);
  renderShop();
}
document.querySelector(".lang-toggle").addEventListener("click", () => {
  applyLang(document.body.dataset.lang === "en" ? "tr" : "en");
});

/* ---------------- Mobil menü ---------------- */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------------- İletişim formu (mailto) ---------------- */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const konu = encodeURIComponent(`Web sitesi mesajı — ${f.ad.value}`);
    const govde = encodeURIComponent(`${f.mesaj.value}\n\n— ${f.ad.value} (${f.email.value})`);
    window.location.href = `mailto:${EPOSTA}?subject=${konu}&body=${govde}`;
  });
}

/* ---------------- Başlat ---------------- */
buildCarousel();
renderBrands();
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
applyLang(localStorage.getItem("dil") || "tr");
