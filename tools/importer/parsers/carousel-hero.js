/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-hero
 * Base block: carousel
 * Source: https://wknd.site/us/en.html (.carousel.cmp-carousel--hero)
 * Generated: 2026-09-06
 *
 * Block library structure (Carousel): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one slide:
 *     Cell 1: Image (mandatory, no other content).
 *     Cell 2: Text content — Title (heading, optional), Description (optional), CTA (optional).
 *
 * Source: <div class="carousel cmp-carousel--hero"> > .cmp-carousel__content
 *   > .cmp-carousel__item (one per slide) > .teaser.cmp-teaser--hero
 *     > .cmp-teaser__content (title h2, description, action-container > link)
 *     > .cmp-teaser__image > img
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each slide is a carousel item. Fall back to teasers if item markup differs.
  let slides = element.querySelectorAll('.cmp-carousel__item');
  if (!slides.length) slides = element.querySelectorAll('.teaser.cmp-teaser--hero, .cmp-teaser');

  slides.forEach((slide) => {
    // Cell 1: image (mandatory)
    const image = slide.querySelector('.cmp-teaser__image img, img.cmp-image__image, img');

    // Cell 2: text content — title, description, CTA
    const contentCell = [];

    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    if (title && title.textContent.trim()) {
      const heading = document.createElement('h2');
      heading.textContent = title.textContent.trim();
      contentCell.push(heading);
    }

    const description = slide.querySelector('.cmp-teaser__description');
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.push(p);
    }

    // CTA(s) — linked text at bottom of the cell
    const ctas = slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a');
    ctas.forEach((cta) => {
      const link = document.createElement('a');
      link.href = cta.getAttribute('href') || '';
      link.textContent = cta.textContent.trim();
      contentCell.push(link);
    });

    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
