/**
 * Shared helpers for the dynamic article listings.
 *
 * Edge Delivery serves a `query-index.json` (built by an indexer in production,
 * or by tools/generate-query-index.js locally). Every dynamic listing on the
 * site — the article/adventure grids, the featured spotlight and the "next
 * adventure" feature — reads from that single index through here, so the fetch
 * is cached once per page and the filtering rules stay consistent.
 */

const INDEX_PATH = '/query-index.json';
let indexPromise;

/** Fetch and cache the query index for the lifetime of the page. */
export async function fetchArticles() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_PATH)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return indexPromise;
}

/** The current page path, normalised the same way index paths are stored. */
export function currentPath() {
  return window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
}

/**
 * The locale prefix (lang/country, e.g. "us/en") of the current page, or '' at
 * the site root. Works for the locale home ("/us/en") and any deeper page
 * ("/us/en/magazine/…") since the locale is always the first two segments.
 */
export function currentLocale() {
  const segments = currentPath().split('/').filter(Boolean);
  return segments.length >= 2 ? `${segments[0]}/${segments[1]}` : '';
}

/** The activity tags of an index row as a lowercase array. */
export function articleActivities(article) {
  return (article.activity || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Filter, offset and limit the index.
 * @param {Array} articles the raw index rows
 * @param {object} opts { category, locale, activity, offset, limit, exclude }
 *   activity — keep only rows tagged with this activity (case-insensitive).
 */
export function selectArticles(articles, opts = {}) {
  const {
    category, locale, activity, offset = 0, limit = Infinity, exclude,
  } = opts;
  const wantedActivity = activity ? activity.trim().toLowerCase() : '';
  return articles
    .filter((a) => (!category || a.category === category)
      && (!locale || a.locale === locale)
      && (!wantedActivity || articleActivities(a).includes(wantedActivity))
      && (!exclude || a.path !== exclude))
    .slice(offset, offset + limit);
}

/** Distinct activity tags present across a set of articles, sorted. */
export function collectActivities(articles) {
  const set = new Set();
  articles.forEach((a) => articleActivities(a).forEach((x) => set.add(x)));
  return [...set].sort();
}

/**
 * Build one article card as the two-cell row structure the `cards-article`
 * styling expects: [ image, body(title link + description) ].
 * @param {object} article an index row
 * @param {(src:string, alt:string) => (HTMLElement|null)} makePicture
 *        image factory (createOptimizedPicture, injected to avoid importing
 *        aem.js here so this module stays framework-light)
 */
export function buildArticleCard(article, makePicture) {
  const row = document.createElement('div');

  const imageCell = document.createElement('div');
  if (article.image && makePicture) {
    const picture = makePicture(article.image, article.title || '');
    if (picture) imageCell.append(picture);
  }

  const bodyCell = document.createElement('div');
  const heading = document.createElement('h3');
  const link = document.createElement('a');
  link.href = article.path;
  link.textContent = article.title || article.path;
  heading.append(link);
  bodyCell.append(heading);
  if (article.description) {
    const p = document.createElement('p');
    p.textContent = article.description;
    bodyCell.append(p);
  }

  row.append(imageCell, bodyCell);
  return row;
}

/**
 * Build one article card as an `<li>` in the exact shape the cards-article
 * block produces after decoration: an image cell (with a hidden whole-card
 * link) and a body cell (title link + description). Enhancing a decorated
 * cards-article grid with these keeps the markup and styling identical.
 * @param {object} article an index row
 * @param {(src:string, alt:string) => (HTMLElement|null)} makePicture
 */
export function buildArticleCardItem(article, makePicture) {
  const li = document.createElement('li');
  const row = buildArticleCard(article, makePicture);
  [...row.children].forEach((cell) => {
    if (cell.querySelector('picture')) cell.className = 'cards-article-card-image';
    else cell.className = 'cards-article-card-body';
    li.append(cell);
  });

  // Whole-card image link (mirrors cards-article), hidden from a11y so it does
  // not duplicate the title link.
  const titleLink = li.querySelector('.cards-article-card-body a[href]');
  const picture = li.querySelector('.cards-article-card-image picture');
  if (titleLink && picture) {
    const imageLink = document.createElement('a');
    imageLink.href = titleLink.getAttribute('href');
    imageLink.className = 'cards-article-card-image-link';
    imageLink.tabIndex = -1;
    imageLink.setAttribute('aria-hidden', 'true');
    picture.replaceWith(imageLink);
    imageLink.append(picture);
  }
  return li;
}

/**
 * Build an accessible activity filter bar wrapped in a `.tabs-filter` element,
 * so it inherits the tabs-filter block's segmented-tab styling verbatim.
 * @param {string[]} activities distinct activity tags, lowercase
 * @param {(activity: string) => void} onSelect called with '' for "All"
 * @returns {HTMLElement} the `.tabs-filter` wrapper
 */
export function buildFilterBar(activities, onSelect) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-filter';

  const bar = document.createElement('div');
  bar.className = 'tabs-filter-list';
  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', 'Filter adventures by activity');
  wrapper.append(bar);

  ['all', ...activities].forEach((activity, i) => {
    const label = activity === 'all' ? 'All' : activity.replace(/^\w/, (c) => c.toUpperCase());
    const button = document.createElement('button');
    button.className = 'tabs-filter-tab';
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', i === 0);
    button.addEventListener('click', () => {
      bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      button.setAttribute('aria-selected', true);
      onSelect(activity === 'all' ? '' : activity);
    });
    bar.append(button);
  });
  return wrapper;
}

/**
 * Repoint a curated "spotlight" block (a single hand-authored teaser such as the
 * homepage Featured Article or Next Adventures feature) at the newest article in
 * a category, in place. Only the heading text, body copy, thumbnail image and
 * CTA target are swapped — the block's authored structure, pretitle and CTA
 * wording are preserved, so its decoration and styling are untouched.
 *
 * Runs after the block has decorated (below the fold), so it never blocks the
 * hero/LCP render on the index fetch.
 *
 * @param {Element} block the decorated block element
 * @param {object} article the index row to feature
 */
export function fillSpotlight(block, article) {
  if (!block || !article) return;

  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.textContent = article.title || heading.textContent;

  // Body copy: the first non-pretitle paragraph that is not a CTA link.
  const paras = [...block.querySelectorAll('p')];
  const copy = paras.find((p) => !p.querySelector('a') && p.textContent.trim()
    && !/^featured article$/i.test(p.textContent.trim()));
  if (copy && article.description) copy.textContent = article.description;

  // CTA + any card links point at the featured article; keep their label.
  block.querySelectorAll('a[href]').forEach((a) => { a.href = article.path; });

  // Thumbnail: repoint every source/img at the article image, keep dimensions.
  if (article.image) {
    block.querySelectorAll('picture source').forEach((s) => s.setAttribute('srcset', article.image));
    const img = block.querySelector('img');
    if (img) {
      img.src = article.image;
      img.setAttribute('alt', article.title || img.getAttribute('alt') || '');
    }
  }
}
