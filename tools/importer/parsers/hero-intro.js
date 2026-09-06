/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-intro
 * Base block: hero
 * Source: https://wknd.site/us/en/adventures.html (.teaser.cmp-teaser--hero)
 * Generated: 2026-09-06
 *
 * Block library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2 (single cell): Background Image (optional).
 *   Row 3 (single cell): Title (heading, optional), Subheading (optional), CTA (optional).
 *
 * Source: <div class="teaser cmp-teaser--hero"> > <div class="cmp-teaser">
 *   .cmp-teaser__content > h2.cmp-teaser__title + .cmp-teaser__description (p)
 *   .cmp-teaser__image > .cmp-image > img.cmp-image__image
 */
export default function parse(element, { document }) {
  // Background image (optional) — image lives in the teaser image container
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Title (heading, optional)
  const title = element.querySelector('.cmp-teaser__title, h1, h2, [class*="title"]');

  // Subheading / description (optional) — reference inner paragraph(s) if present
  const descriptionWrap = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const descriptionEls = descriptionWrap
    ? Array.from(descriptionWrap.querySelectorAll(':scope > p'))
    : [];

  // Call-to-action (optional) — teaser action links
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.cmp-button'),
  );

  // Empty-block guard
  if (!image && !title && !descriptionEls.length && !ctaLinks.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single cell) — only if present
  if (image) {
    cells.push([image]);
  }

  // Row 3: title + subheading + CTA in one cell
  const contentCell = [];
  if (title) contentCell.push(title);
  if (descriptionEls.length) {
    contentCell.push(...descriptionEls);
  } else if (descriptionWrap) {
    contentCell.push(descriptionWrap);
  }
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-intro', cells });
  element.replaceWith(block);
}
