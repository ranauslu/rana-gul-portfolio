/* ============================================================
   Rana Gül portföyü — etkileşim
   Dil değiştirme, mobil menü, galeri/satış üretimi, lightbox.
   ============================================================ */

// --- Desen verisi (DÜZENLE: yeni desen ekleyince buraya bir satır ekle) ---
// kategori: "cicekli" | "geometrik" | "botanik"
const DESENLER = [
  { kod: "EH DSN 2591", dosya: "desenlerim/EH DSN 2591.jpg", kategori: "cicekli",   fiyat: "₺2.500" },
  { kod: "EH DSN 2592", dosya: "desenlerim/EH DSN 2592.jpg", kategori: "cicekli",   fiyat: "₺2.500" },
  { kod: "EH DSN 2598", dosya: "desenlerim/EH DSN 2598.jpg", kategori: "geometrik", fiyat: "₺2.000" },
  { kod: "EH DSN 2599", dosya: "desenlerim/EH DSN 2599.jpg", kategori: "geometrik", fiyat: "₺2.800" },
  { kod: "EH DSN 2601", dosya: "desenlerim/EH DSN 2601.jpg", kategori: "geometrik", fiyat: "₺1.800" },
  { kod: "EH DSN 2605", dosya: "desenlerim/EH DSN 2605.jpg", kategori: "botanik",   fiyat: "₺2.800" },
];

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

/* ---------------- Satış ---------------- */
const shop = document.getElementById("shop");
function renderShop() {
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
      <img src="${src(d.dosya)}" alt="${d.kod}" loading="lazy" />
      <div class="shop-body">
        <span class="shop-code">${d.kod}</span>
        <span class="shop-tag">${t(tag.tr, tag.en)}</span>
        <span class="shop-price">${d.fiyat}</span>
        <a class="btn btn-primary shop-buy" href="${mailto}">${t("Satın Al / Teklif Al", "Buy / Request Quote")}</a>
        <a class="shop-wa" href="${wa}" target="_blank" rel="noopener" style="text-align:center;margin-top:8px;font-size:0.85rem;color:var(--metin-soft)">${t("WhatsApp ile sor", "Ask via WhatsApp")}</a>
      </div>`;
    shop.appendChild(item);
  });
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
document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ---------------- Dil değiştirme ---------------- */
function applyLang(lang) {
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-tr]").forEach((el) => {
    const val = lang === "en" ? el.dataset.en : el.dataset.tr;
    if (val != null) el.innerHTML = val;
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
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const konu = encodeURIComponent(`Web sitesi mesajı — ${f.ad.value}`);
  const govde = encodeURIComponent(`${f.mesaj.value}\n\n— ${f.ad.value} (${f.email.value})`);
  window.location.href = `mailto:${EPOSTA}?subject=${konu}&body=${govde}`;
});

/* ---------------- Başlat ---------------- */
renderBrands();
document.getElementById("year").textContent = new Date().getFullYear();
applyLang(localStorage.getItem("dil") || "tr");
