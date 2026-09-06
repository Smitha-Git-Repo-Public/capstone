/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-feature
 * Base block: hero
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-09-06
 *
 * Block library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2 (single cell): Background Image (optional).
 *   Row 3 (single cell): Title (heading), Subheading, CTA (text + link).
 *
 * Source is a teaser: .cmp-teaser__content (title h2, description, action link)
 *   + .cmp-teaser__image > img.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 2: background image (optional)
  const image = element.querySelector('.cmp-teaser__image img, img.cmp-image__image, img');
  if (image) {
    cells.push([image]);
  }

  // Row 3: text content — title, subheading, CTA (all in one cell)
  const contentCell = [];

  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (title && title.textContent.trim()) {
    const heading = document.createElement('h2');
    heading.textContent = title.textContent.trim();
    contentCell.push(heading);
  }

  const description = element.querySelector('.cmp-teaser__description');
  if (description && description.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    contentCell.push(p);
  }

  const ctas = element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a');
  ctas.forEach((cta) => {
    const link = document.createElement('a');
    link.href = cta.getAttribute('href') || '';
    link.textContent = cta.textContent.trim();
    contentCell.push(link);
  });

  // Empty-block guard
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([contentCell.length ? contentCell : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
