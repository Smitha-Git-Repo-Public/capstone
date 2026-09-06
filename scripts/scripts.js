import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) {
      // No authored bold/italic. WKND authors standalone CTAs (e.g. "All
      // Articles" / "All Trips") as plain links that render as yellow buttons.
      // Buttonize an isolated lone-link paragraph in default content only —
      // skip block-scoped CTAs (heroes style their own) and grouped lone-link
      // paragraphs (e.g. the author's stacked Facebook/Twitter/Instagram links).
      const inDefault = p.closest('.default-content-wrapper');
      const isLoneLinkP = (el) => el && el.tagName === 'P'
        && el.children.length === 1 && el.firstElementChild.tagName === 'A'
        && el.textContent.trim() === el.firstElementChild.textContent.trim();
      const grouped = isLoneLinkP(p.previousElementSibling)
        || isLoneLinkP(p.nextElementSibling);
      if (inDefault && !grouped) {
        p.className = 'button-wrapper';
        a.className = 'button cta';
      }
      return;
    }

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
/**
 * Consume `section-metadata` tables: apply their key/value pairs to the parent
 * section (Style -> class names, other keys -> data-* attributes) and remove the
 * table. The vendored aem.js decorateSections does not handle this, so without
 * it the metadata renders as literal "style / grey" text on the page.
 * @param {Element} main
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > div > .section-metadata').forEach((meta) => {
    const section = meta.closest(':scope > div') || meta.parentElement;
    [...meta.children].forEach((row) => {
      const cells = row.children;
      if (cells.length < 2) return;
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key === 'style') {
        value.split(',').forEach((s) => {
          const cls = s.trim().toLowerCase().replace(/\s+/g, '-');
          if (cls) section.classList.add(cls);
        });
      } else if (key) {
        section.dataset[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
      }
    });
    meta.remove();
  });
}

/**
 * Detect the page template from its URL path (locale-agnostic) and tag <body>
 * so template-specific layouts (e.g. the two-column article/adventure detail
 * pages) can be scoped in CSS. Listing pages (…/magazine, …/adventures) have no
 * trailing detail segment and are intentionally excluded.
 * @returns {string} the template name, or '' if none
 */
function detectTemplate() {
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  if (/\/magazine\/[^/]+/.test(path)) return 'magazine-article';
  if (/\/adventures\/[^/]+/.test(path)) return 'adventure-detail';
  if (/\/faqs$/.test(path)) return 'faqs';
  return '';
}

/**
 * Wrap a run of sibling sections in a grid container so a template can present
 * them side by side (main content + right sidebar) on desktop.
 * @param {Element} main
 * @param {Element[]} sections sections to move into the wrapper (in order)
 * @param {string} className wrapper class
 */
function groupSections(main, sections, className) {
  if (!sections.length) return;
  const wrapper = document.createElement('div');
  wrapper.className = className;
  sections[0].before(wrapper);
  sections.forEach((s) => wrapper.append(s));
}

/**
 * Template-specific desktop layouts. WKND renders article and adventure detail
 * pages as two columns: the main content on the left and a narrow sidebar
 * ("Share This Story" / adventure details) on the right. Content-first EDS
 * emits these as stacked sections; here we group them so CSS can lay them out.
 * @param {Element} main
 * @param {string} template
 */
function decorateTemplateLayout(main, template) {
  const sections = [...main.querySelectorAll(':scope > .section')];
  const headingText = (s) => (s.querySelector('h1,h2,h3,h4,h5,h6')?.textContent || '').trim().toLowerCase();

  if (template === 'magazine-article') {
    // Right sidebar = the "Share This Story" section; everything between the
    // breadcrumb and that section is the article column.
    const share = sections.find((s) => headingText(s).startsWith('share this'));
    if (!share) return;
    const shareIdx = sections.indexOf(share);
    // article column starts after the lead image + breadcrumb (first 2 sections
    // when present); fall back to everything before the share section.
    const start = Math.min(2, shareIdx);
    const column = sections.slice(start, shareIdx);
    if (!column.length) return;
    const colWrap = document.createElement('div');
    colWrap.className = 'article-column';
    column[0].before(colWrap);
    column.forEach((s) => colWrap.append(s));
    groupSections(main, [colWrap, share], 'article-layout');
  } else if (template === 'adventure-detail') {
    // The carousel + H1 stay full-width; below them the trip details block
    // (left sidebar) sits beside the tabs/overview (right column). The details
    // block and the "Share this Adventure" heading live in the first section,
    // while the tabs are in the next section — so build a grid and move the
    // details block + its wrapper into the left column and the tabs into right.
    const detailsWrap = main.querySelector('.columns-details-wrapper')
      || main.querySelector('.columns-details')?.closest(':scope > .section > div');
    const tabsSec = sections.find((s) => s.querySelector('.tabs-content'));
    const detailsBlock = main.querySelector('.columns-details');
    if (detailsWrap && tabsSec && detailsBlock) {
      const grid = document.createElement('div');
      grid.className = 'adventure-layout';
      const left = document.createElement('div');
      left.className = 'adventure-details-col';
      const right = document.createElement('div');
      right.className = 'adventure-main-col';
      // insert the grid right before the details wrapper's position
      detailsWrap.before(grid);
      // left column: the details block (+ the "Share this Adventure" heading,
      // which lives elsewhere in the same section as its own default-content
      // wrapper — move the heading itself into the left column).
      const shareHeading = [...main.querySelectorAll('h5')]
        .find((h) => /share this/i.test(h.textContent || ''));
      left.append(detailsBlock);
      if (shareHeading) left.append(shareHeading);
      // right column: the whole tabs section content
      right.append(tabsSec);
      grid.append(left, right);
    }
  } else if (template === 'faqs') {
    // Left column = intro (h1 + image + copy) + the accordion; right sidebar =
    // the "Need more help?" default-content block.
    const accordionWrap = main.querySelector('.accordion-faq-wrapper');
    const helpWrap = [...main.querySelectorAll('.default-content-wrapper')]
      .find((w) => /need more help/i.test(w.textContent || ''));
    if (accordionWrap && helpWrap) {
      const introSec = sections[0];
      const grid = document.createElement('div');
      grid.className = 'faqs-layout';
      const left = document.createElement('div');
      left.className = 'faqs-main-col';
      const right = document.createElement('div');
      right.className = 'faqs-help-col';
      (introSec || accordionWrap.closest('.section')).before(grid);
      if (introSec) left.append(...introSec.querySelectorAll(':scope > div'));
      left.append(accordionWrap);
      right.append(helpWrap);
      grid.append(left, right);
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSectionMetadata(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  // Tag <body> with the template so template CSS applies from first paint.
  // The two-column DOM regrouping itself is deferred until after loadSections
  // (see loadLazy) so blocks still decorate inside their original sections.
  const template = detectTemplate();
  if (template) document.body.classList.add(`template-${template}`);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  // Regroup sections into template-specific two-column layouts only after all
  // blocks have loaded, so moving a block's wrapper never strands it as
  // "initialized" (which would skip its decoration, e.g. the FAQ accordion).
  const template = detectTemplate();
  if (template) decorateTemplateLayout(main, template);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
