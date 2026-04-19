const primaryNavItems = [
  { id: "tamil", label: "Tamil", href: "tamil.html" },
  { id: "hindi", label: "Hindi", href: "hindi.html" },
  { id: "telugu", label: "Telugu", href: "telugu.html" },
  { id: "kannada", label: "Kannada", href: "kannada.html" },
  { id: "malayalam", label: "Malayalam", href: "malayalam.html" },
  { id: "marathi", label: "Marathi", href: "marathi.html" },
  { id: "punjabi", label: "Punjabi", href: "punjabi.html" },
  { id: "air", label: "AIR", href: "air.html" },
  { id: "favorites", label: "Favorites", href: "favorites.html" }
];

const footerNavItems = [
  { id: "submit-radio", label: "Submit Radio", href: "submit-radio.html" },
  { id: "contact-us", label: "Contact US", href: "contact-us.html" },
  { id: "privacy-policy", label: "Privacy Policy", href: "privacy-policy.html" }
];

const currentPage = document.body.dataset.page || "home";

const renderNavLinks = (items) =>
  items
    .map(
      (item) =>
        `<a href="${item.href}"${item.id === currentPage ? ' class="is-active"' : ""}>${item.label}</a>`
    )
    .join("");

const headerMarkup = `
  <header class="site-header">
    <div class="brand-row">
      <a class="brand" href="index.html" aria-label="Radio Star home">
        <img class="brand-logo" src="images/radio-star-logo.svg" alt="Radio Star logo">
        <span class="brand-text">Radio Star</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="site-nav">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
      ${renderNavLinks(primaryNavItems)}
    </nav>
  </header>
`;

const footerMarkup = `
  <footer class="site-footer">
    <div class="footer-top">
      <div>
        <p class="eyebrow">Quick Links</p>
        <h2>Stay connected with your radio community.</h2>
      </div>
      <nav class="footer-links" aria-label="Footer navigation">
        ${renderNavLinks(footerNavItems)}
      </nav>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Radio Star. All rights reserved.</p>
      <p>Built for desktop, tablet, and mobile listening audiences.</p>
    </div>
  </footer>
`;

document.querySelectorAll('[data-include="header"]').forEach((node) => {
  node.outerHTML = headerMarkup;
});

document.querySelectorAll('[data-include="footer"]').forEach((node) => {
  node.outerHTML = footerMarkup;
});

const toggleButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (toggleButton && siteNav) {
  toggleButton.addEventListener("click", () => {
    const expanded = toggleButton.getAttribute("aria-expanded") === "true";
    toggleButton.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open");
  });
}
