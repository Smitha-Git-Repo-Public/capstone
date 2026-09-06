/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery. Base: carousel.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.carousel.cmp-carousel--mini)
 * Generated: 2026-09-06
 *
 * Image-only rotating gallery. Library convention: 2-column table, first row = block
 * name, each subsequent row = one slide (image in cell 1, optional text in cell 2).
 * Since this variant is image-only, cell 2 is left empty to keep column count uniform.
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item; extract in DOM order.
  const items = Array.from(
    element.querySelectorAll('.cmp-carousel__item, [class*="carousel__item"]'),
  );

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img.cmp-image__image, .cmp-image img, img');
    if (img) {
      // 2-column row: image in first cell, empty text cell (image-only gallery).
      cells.push([img, '']);
    }
  });

  // Empty-block guard: if no slides found, unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
