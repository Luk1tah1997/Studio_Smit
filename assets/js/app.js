let selectedSlot = null;
let currentSiteData = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const siteData = await loadSiteData();

    currentSiteData = siteData;
    applyMeta(siteData);
    applyTheme(siteData);
    renderSite(siteData);
  } catch (error) {
    renderError();
  }
}

async function loadSiteData() {
  const response = await fetch("data/site.json");

  if (!response.ok) {
    throw new Error("No se pudo cargar data/site.json");
  }

  return response.json();
}

function applyMeta(siteData) {
  const title = siteData.seo?.title || siteData.business?.name || "Sitio web";
  const description = siteData.seo?.description || siteData.business?.description || "";
  const metaDescription = document.querySelector('meta[name="description"]');

  document.title = title;

  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }
}

function applyTheme(siteData) {
  const theme = siteData.theme || {};
  const palettes = Array.isArray(theme.palettes) ? theme.palettes : [];
  const selectedPalette = palettes.find((palette) => palette.id === theme.selectedPalette);
  const activeTheme = selectedPalette || palettes[0] || theme;
  const root = document.documentElement;

  root.style.setProperty("--primary-color", activeTheme.primaryColor || "#ffd000");
  root.style.setProperty("--background-color", activeTheme.backgroundColor || "#050505");
  root.style.setProperty("--surface-color", activeTheme.surfaceColor || "#111111");
  root.style.setProperty("--text-color", activeTheme.textColor || "#ffffff");
  root.style.setProperty("--muted-text-color", activeTheme.mutedTextColor || "#b8b8b8");
  root.style.setProperty("--button-text-color", activeTheme.buttonTextColor || "#050505");
  root.style.setProperty("--border-color", activeTheme.borderColor || "rgba(255, 255, 255, 0.12)");
  root.style.setProperty("--shadow-color", activeTheme.shadowColor || "rgba(0, 0, 0, 0.35)");
}

function renderSite(siteData) {
  const app = document.querySelector("#app");
  const sections = siteData.sections || {};

  selectedSlot = null;
  app.innerHTML = `
    ${renderHeader(siteData)}
    <main>
      ${renderHero(siteData)}
      ${sections.booking === false ? "" : renderBooking(siteData.booking)}
      ${sections.promotions === false ? "" : renderPromotions(siteData.promotions)}
      ${sections.gallery === false ? "" : renderGallery(siteData.gallery)}
      ${sections.contact === false ? "" : renderContact(siteData.contact)}
    </main>
    ${renderFooter(siteData.footer)}
  `;

  setupHeaderMenu();
  setupBooking();
}

function renderHeader(data) {
  const business = data.business || {};
  const contact = data.contact || {};
  const navigation = data.ui?.navigation || {};
  const menuLinks = getMenuLinks(data);
  const logoUrl = safeUrl(business.logo);
  const logo = business.logo
    ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(business.name)}">`
    : `<span class="brand-mark">${escapeHtml(getInitials(business.name))}</span>`;
  const instagramLink = contact.instagram
    ? `
      <a class="icon-button instagram-link" href="${escapeHtml(safeUrl(contact.instagram))}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="5"></rect>
          <circle cx="12" cy="12" r="4"></circle>
          <circle cx="17.5" cy="6.5" r="1"></circle>
        </svg>
      </a>
    `
    : "";
  const menuToggle = menuLinks.length
    ? `
      <button class="icon-button menu-toggle" type="button" aria-label="Abrir menu" aria-controls="mobileMenu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    `
    : "";
  const mobileMenu = menuLinks.length
    ? `
      <nav class="mobile-menu" id="mobileMenu" aria-label="Menu mobile">
        ${menuLinks.map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join("")}
      </nav>
    `
    : "";

  return `
    <header class="site-header">
      <a class="brand" href="#top" aria-label="${escapeHtml(business.name)}">
        ${logo}
        <span>
          <strong>${escapeHtml(business.name)}</strong>
          <small>${escapeHtml(business.type)}</small>
        </span>
      </a>
      <nav class="site-nav" aria-label="Principal">
        ${menuLinks.map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join("")}
      </nav>
      <div class="header-actions">
        ${instagramLink}
        ${menuToggle}
      </div>
      ${mobileMenu}
    </header>
  `;
}

function renderHero(data) {
  const business = data.business || {};
  const hero = data.ui?.hero || {};

  return `
    <section class="hero section" id="top">
      <div class="hero-content">
        <p class="eyebrow">${escapeHtml(business.type)}</p>
        <h1>${escapeHtml(business.name)}</h1>
        <h2>${escapeHtml(business.subtitle)}</h2>
        <p>${escapeHtml(business.description)}</p>
        <div class="hero-actions">
          ${hasBooking(data) ? `<a class="button primary-button" href="#turnos">${escapeHtml(hero.primaryCta || "Reservar turno")}</a>` : ""}
          ${hasGallery(data) ? `<a class="button ghost-button" href="#trabajos">${escapeHtml(hero.secondaryCta || "Ver trabajos")}</a>` : ""}
        </div>
      </div>
      <img class="hero-image" src="${escapeHtml(safeUrl(business.heroImage))}" alt="${escapeHtml(business.name)}">
    </section>
  `;
}

function renderBooking(data) {
  if (!data || data.enabled === false) {
    return "";
  }

  const sections = currentSiteData.ui?.sections || {};
  const messages = currentSiteData.ui?.bookingMessages || {};
  const mode = data.mode || "whatsapp";
  const slots = Array.isArray(data.slots) ? data.slots : [];
  const hasSlots = slots.some((slot) => Array.isArray(slot.times) && slot.times.length > 0);
  const slotsMarkup = hasSlots
    ? `
      <div class="slots-grid">
        ${slots.map((slot) => renderSlotDay(slot)).join("")}
      </div>
    `
    : "";
  const notice = getBookingNotice(data, mode, hasSlots, messages);

  return `
    <section class="section" id="turnos">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(sections.bookingEyebrow || "Agenda")}</p>
        <h2>${escapeHtml(data.title)}</h2>
        <p>${escapeHtml(data.description)}</p>
      </div>
      <div class="booking-panel">
        ${slotsMarkup}
        <p class="booking-notice" id="bookingNotice" aria-live="polite">${escapeHtml(notice)}</p>
        <button class="button primary-button booking-button" type="button" id="confirmBooking" data-booking-mode="${escapeHtml(mode)}">
          ${escapeHtml(data.buttonLabel || "Confirmar consulta")}
        </button>
      </div>
    </section>
  `;
}

function renderSlotDay(slot) {
  const times = Array.isArray(slot.times) ? slot.times : [];

  if (!times.length) {
    return "";
  }

  return `
    <div class="slot-day">
      <h3>${escapeHtml(slot.date)}</h3>
      <div class="slot-times">
        ${times.map((time) => `
          <button class="slot-button" type="button" data-date="${escapeHtml(slot.date)}" data-time="${escapeHtml(time)}">
            ${escapeHtml(time)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPromotions(items) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  const sections = currentSiteData.ui?.sections || {};

  return `
    <section class="section" id="promos">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(sections.promotionsEyebrow || "Promos")}</p>
        <h2>${escapeHtml(sections.promotionsTitle || "Promociones")}</h2>
      </div>
      <div class="card-grid promo-grid">
        ${items.map((item) => `
          <article class="card promo-card">
            <span>${escapeHtml(item.price)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderGallery(items) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  const sections = currentSiteData.ui?.sections || {};

  return `
    <section class="section" id="trabajos">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(sections.galleryEyebrow || "Portfolio")}</p>
        <h2>${escapeHtml(sections.galleryTitle || "Trabajos realizados")}</h2>
      </div>
      <div class="gallery-grid">
        ${items.map((item) => `
          <article class="card gallery-card">
            <img src="${escapeHtml(safeUrl(item.image))}" alt="${escapeHtml(item.title)}">
            <div>
              <span>${escapeHtml(item.category)}</span>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderContact(data) {
  if (!data || !hasUsefulContact(data)) {
    return "";
  }

  const sections = currentSiteData.ui?.sections || {};
  const labels = currentSiteData.ui?.contactLabels || {};
  const actions = [
    data.whatsapp ? contactButton(data.whatsapp, labels.whatsapp || "WhatsApp", "primary-button") : "",
    data.instagram ? contactButton(data.instagram, labels.instagram || "Instagram", "ghost-button") : "",
    data.email ? contactButton(`mailto:${data.email}`, labels.email || "Email", "ghost-button") : "",
    data.phone ? contactButton(`tel:${data.phone}`, labels.phone || "Telefono", "ghost-button") : "",
    data.mapUrl ? contactButton(data.mapUrl, labels.location || "Ubicacion", "ghost-button") : ""
  ].join("");

  return `
    <section class="section contact-section" id="contacto">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(sections.contactEyebrow || "Consultas")}</p>
        <h2>${escapeHtml(data.title || "Contacto")}</h2>
        ${data.address ? `<p>${escapeHtml(data.address)}</p>` : ""}
      </div>
      ${actions ? `<div class="contact-actions">${actions}</div>` : ""}
    </section>
  `;
}

function renderFooter(data) {
  return `
    <footer class="site-footer">
      <p>${escapeHtml(data?.text || "")}</p>
    </footer>
  `;
}

function setupHeaderMenu() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobileMenu");

  if (!header || !toggle || !mobileMenu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-menu-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menu" : "Abrir menu");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      header.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    }
  });
}

function setupBooking() {
  const slotButtons = document.querySelectorAll(".slot-button");
  const confirmButton = document.querySelector("#confirmBooking");
  const notice = document.querySelector("#bookingNotice");

  slotButtons.forEach((button) => {
    button.addEventListener("click", () => {
      slotButtons.forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");

      selectedSlot = {
        date: button.dataset.date,
        time: button.dataset.time
      };

      const selectedPrefix = currentSiteData.ui?.bookingMessages?.selectedPrefix || "Horario seleccionado:";

      notice.textContent = `${selectedPrefix} ${selectedSlot.date} a las ${selectedSlot.time}.`;
      notice.classList.remove("is-warning");
    });
  });

  if (confirmButton) {
    confirmButton.addEventListener("click", handleBooking);
  }
}

function handleBooking() {
  const booking = currentSiteData.booking || {};
  const mode = booking.mode || "whatsapp";

  if (mode === "calendar") {
    openExternalUrl(booking.calendarUrl);
    return;
  }

  if (mode === "external") {
    openExternalUrl(booking.externalUrl);
    return;
  }

  openBookingWhatsapp();
}

function openBookingWhatsapp() {
  const booking = currentSiteData.booking || {};
  const notice = document.querySelector("#bookingNotice");
  const messages = currentSiteData.ui?.bookingMessages || {};
  const hasSlots = hasAvailableSlots(booking);
  const whatsappUrl = safeUrl(currentSiteData.contact?.whatsapp);

  if (whatsappUrl === "#") {
    notice.textContent = "No hay un link de WhatsApp configurado.";
    notice.classList.add("is-warning");
    return;
  }

  if (!selectedSlot && hasSlots) {
    notice.textContent = messages.empty || "Primero elegi un horario disponible.";
    notice.classList.add("is-warning");
    return;
  }

  const message = selectedSlot
    ? buildBookingMessage(booking.whatsappMessage, selectedSlot, currentSiteData)
    : `Hola, quiero consultar por un turno en ${currentSiteData.business?.name || ""}.`;
  const separator = whatsappUrl.includes("?") ? "&" : "?";

  window.open(`${whatsappUrl}${separator}text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function buildBookingMessage(template, selectedSlotData, siteData) {
  const messageTemplate = template || "Hola, quiero consultar por un turno en {businessName} para el {date} a las {time}.";

  return messageTemplate
    .replaceAll("{businessName}", siteData.business?.name || "")
    .replaceAll("{date}", selectedSlotData?.date || "")
    .replaceAll("{time}", selectedSlotData?.time || "");
}

function openExternalUrl(url) {
  const targetUrl = safeUrl(url);

  if (targetUrl === "#") {
    return;
  }

  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function getBookingNotice(booking, mode, hasSlots, messages) {
  if (mode === "calendar") {
    return messages.calendar || "Los horarios y confirmaciones se gestionan desde el calendario externo.";
  }

  if (mode === "external") {
    return messages.external || "La reserva se completa desde el formulario o agenda externa.";
  }

  if (!hasSlots) {
    return messages.noSlots || "No hay horarios disponibles por el momento. Escribinos por WhatsApp para consultar.";
  }

  return messages.default || "Selecciona un horario para continuar.";
}

function getMenuLinks(data) {
  const navigation = data.ui?.navigation || {};
  const links = [];

  if (hasBooking(data)) {
    links.push({ href: "#turnos", label: navigation.booking || "Turnos" });
  }

  if (hasPromotions(data)) {
    links.push({ href: "#promos", label: navigation.promotions || "Promos" });
  }

  if (hasGallery(data)) {
    links.push({ href: "#trabajos", label: navigation.gallery || "Trabajos" });
  }

  if (hasContact(data)) {
    links.push({ href: "#contacto", label: navigation.contact || "Contacto" });
  }

  return links;
}

function hasBooking(data) {
  return data.sections?.booking !== false && data.booking?.enabled !== false && Boolean(data.booking);
}

function hasPromotions(data) {
  return data.sections?.promotions !== false && Array.isArray(data.promotions) && data.promotions.length > 0;
}

function hasGallery(data) {
  return data.sections?.gallery !== false && Array.isArray(data.gallery) && data.gallery.length > 0;
}

function hasContact(data) {
  return data.sections?.contact !== false && hasUsefulContact(data.contact);
}

function hasUsefulContact(data) {
  return Boolean(data && (data.whatsapp || data.instagram || data.email || data.phone || data.mapUrl || data.address));
}

function hasAvailableSlots(booking) {
  const slots = Array.isArray(booking.slots) ? booking.slots : [];

  return slots.some((slot) => Array.isArray(slot.times) && slot.times.length > 0);
}

function contactButton(url, label, buttonClass) {
  return `
    <a class="button ${buttonClass}" href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(label)}
    </a>
  `;
}

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value) {
  return String(value || "#");
}

function renderError() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <main class="error-state">
      <h1>No se pudo cargar la web</h1>
      <p>Revisa que el archivo <strong>data/site.json</strong> exista y tenga formato JSON valido.</p>
    </main>
  `;
}
