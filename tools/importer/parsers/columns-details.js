/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-details. Base: columns.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.contentfragment.cmp-contentfragment--elements)
 * Generated: 2026-09-06
 *
 * Attribute spec panel: label/value pairs (Activity, Adventure Type, Trip Length,
 * Group Size, Difficulty, Price). Library convention: columns = multiple rows/columns,
 * first row = block name. Represent each attribute as a 2-column row: label | value.
 */
export default function parse(element, { document }) {
  // Each attribute is a .cmp-contentfragment__element containing a <dt> (label) and <dd> (value).
  const elements = Array.from(
    element.querySelectorAll('.cmp-contentfragment__element, dl > div'),
  );

  const cells = [];
  elements.forEach((el) => {
    const label = el.querySelector('.cmp-contentfragment__element-title, dt');
    const value = el.querySelector('.cmp-contentfragment__element-value, dd');
    if (label || value) {
      const labelText = label ? label.textContent.trim() : '';
      const valueText = value ? value.textContent.trim() : '';
      // 2-column row: label | value.
      cells.push([labelText, valueText]);
    }
  });

  // Empty-block guard: if no attribute pairs found, unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-details', cells });
  element.replaceWith(block);
}
