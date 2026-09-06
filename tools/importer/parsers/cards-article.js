/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-article
 * Base block: cards
 * Source: https://wknd.site/us/en.html (.image-list.list)
 * Generated: 2026-09-06
 *
 * Block library structure (Cards): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one card:
 *     Cell 1: Image (mandatory).
 *     Cell 2: Text content — Title (heading, optional), Description (optional), CTA (optional).
 *
 * Source: <div class="image-list list"> > <ul class="cmp-image-list"> > <li class="cmp-image-list__item">
 *   Each item: image link + image, title link (span.title), description span.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each card is a list item. Fall back to article content if list structure differs.
  const items = element.querySelectorAll('li.cmp-image-list__item, .cmp-image-list__item');

  items.forEach((item) => {
    // Cell 1: image (mandatory per Cards convention)
    const image = item.querySelector('img.cmp-image__image, .cmp-image img, img');

    // Cell 2: text content — title (with its link), description, optional CTA
    const contentCell = [];

    const titleLink = item.querySelector('a.cmp-image-list__item-title-link');
    const titleText = item.querySelector('.cmp-image-list__item-title');
    if (titleLink) {
      // Preserve the link as a heading. Use the title text if present, else the link's own text.
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = titleLink.getAttribute('href') || '';
      link.textContent = (titleText ? titleText.textContent : titleLink.textContent).trim();
      heading.appendChild(link);
      contentCell.push(heading);
    } else if (titleText) {
      const heading = document.createElement('h3');
      heading.textContent = titleText.textContent.trim();
      contentCell.push(heading);
    }

    const description = item.querySelector('.cmp-image-list__item-description');
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.push(p);
    }

    // Only emit a card row if it has real content
    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
