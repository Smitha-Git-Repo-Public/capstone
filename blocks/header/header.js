// WKND header: dark utility bar (tools) over a white main bar (brand + nav + search).
// Content-first: all copy/links/images live in /content/nav.plain.html; this module
// reads that DOM and builds layout + interactive controls (search, locale toggle).

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment (metadata-independent dual-fetch):
 * /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Relative image paths in the fragment (images/foo.svg) would resolve against
  // the current page URL; rewrite to a root-absolute path so they load on any page.
  tmp.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\//.test(src) && !src.startsWith('data:')) {
      img.setAttribute('src', `/${src.replace(/^\.?\/*/, '')}`);
    }
  });
  return tmp;
}

/** Toggle the mobile menu open/closed. */
function toggleMenu(nav, expanded) {
  const button = nav.querySelector('.nav-hamburger button');
  const open = expanded ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (button) button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

/** Build the search control (structure lives in JS per the nav contract). */
function buildSearch() {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';
  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  form.className = 'nav-search-form';
  form.addEventListener('submit', (e) => e.preventDefault());
  const label = document.createElement('span');
  label.className = 'nav-search-icon';
  label.setAttribute('aria-hidden', 'true');
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'SEARCH';
  input.setAttribute('aria-label', 'Search');
  input.className = 'nav-search-input';
  form.append(label, input);
  wrapper.append(form);
  return wrapper;
}

export default async function decorate(block) {
  const frag = await fetchNav();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.querySelectorAll(':scope > div')];
  const brandContent = sections[0];
  const linksContent = sections[1];
  const toolsContent = sections[2];

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  // --- Utility bar (row 0): tools — Sign In + locale selector ---
  // Kept as a sibling of <nav> (its own dark bar) rather than a child, so the
  // dark background is the direct backdrop of the light utility text.
  if (toolsContent) {
    const utility = document.createElement('div');
    utility.className = 'nav-utility';
    const inner = document.createElement('div');
    inner.className = 'nav-utility-inner';

    // The locale entries live in the tools <ul>; extract before processing links.
    const localeList = toolsContent.querySelector('ul');

    // Direct <p> anchors: Sign In, and the locale toggle (has a flag <img>).
    toolsContent.querySelectorAll(':scope > p > a').forEach((a) => {
      const img = a.querySelector('img');
      if (img && localeList) {
        // Locale selector: a toggle button + a dropdown built from the <ul>.
        const locale = document.createElement('div');
        locale.className = 'nav-locale';

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-locale-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-label', `Toggle Language ${a.textContent.trim()}`);
        toggle.style.backgroundImage = `url('${img.getAttribute('src')}')`;
        toggle.textContent = a.textContent.trim();

        const dropdown = localeList.cloneNode(true);
        dropdown.className = 'nav-locale-dropdown';
        dropdown.hidden = true;

        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const open = toggle.getAttribute('aria-expanded') !== 'true';
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
          dropdown.hidden = !open;
        });

        locale.append(toggle, dropdown);
        inner.append(locale);
      } else {
        // Sign In (plain link).
        const link = a.cloneNode(true);
        link.classList.add('nav-signin');
        inner.append(link);
      }
    });

    utility.append(inner);
    wrapper.append(utility);
  }

  // Main bar (row 1): <nav> directly holds brand, hamburger, the nav <ul>,
  // and the search — a flat structure so the primary <ul> is a direct child of
  // <nav> (top-level nav items are detectable as first-class links/triggers).
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'nav-main-inner';
  nav.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');

  // Brand / logo
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandContent) brand.append(...brandContent.childNodes);
  nav.append(brand);

  // Hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);

  // Nav links: the <ul> is appended directly to <nav>.
  if (linksContent) {
    const ul = linksContent.querySelector('ul');
    if (ul) {
      const list = ul.cloneNode(true);
      list.classList.add('nav-sections');
      // The "Home" root item is hidden on desktop and shown on mobile (matches
      // source): mark the item whose link points at the site root.
      const homeItem = [...list.querySelectorAll('li')].find((li) => {
        const a = li.querySelector('a');
        return a && /\/us\/en(\.html)?$/.test(a.getAttribute('href') || '');
      });
      if (homeItem) homeItem.classList.add('nav-home-item');
      nav.append(list);
    }
  }

  // Search
  nav.append(buildSearch());

  // Resize handling: reset state when crossing the breakpoint.
  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
    document.body.style.overflowY = '';
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Open navigation');
  });

  // Close the locale dropdown when clicking outside it.
  document.addEventListener('click', (e) => {
    const toggle = wrapper.querySelector('.nav-locale-toggle');
    const dropdown = wrapper.querySelector('.nav-locale-dropdown');
    if (!toggle || !dropdown || dropdown.hidden) return;
    if (!e.target.closest('.nav-locale')) {
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.hidden = true;
    }
  });

  wrapper.append(nav);
  block.append(wrapper);
}
