/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns-featured
 * Base block: columns
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--featured)
 * Generated: 2026-09-06
 *
 * Block library structure (Columns): multiple columns, first row = block name.
 *   Second row defines the column count; subsequent rows match it.
 * Source is a featured teaser laid out as two visual columns:
 *   Column 1: text content — pretitle, title (h2), description, CTA link.
 *   Column 2: featured image.
 *   => single content row with 2 cells.
 */
export default function parse(element, { document }) {
  // Column 1: text content
  const textCell = [];

  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = pretitle.textContent.trim();
    p.appendChild(strong);
    textCell.push(p);
  }

  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (title && title.textContent.trim()) {
    const heading = document.createElement('h2');
    heading.textContent = title.textContent.trim();
    textCell.push(heading);
  }

  const description = element.querySelector('.cmp-teaser__description');
  if (description && description.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    textCell.push(p);
  }

  const ctas = element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a');
  ctas.forEach((cta) => {
    const link = document.createElement('a');
    link.href = cta.getAttribute('href') || '';
    link.textContent = cta.textContent.trim();
    textCell.push(link);
  });

  // Column 2: image
  const image = element.querySelector('.cmp-teaser__image img, img.cmp-image__image, img');

  // Empty-block guard
  if (!textCell.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', image || '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
