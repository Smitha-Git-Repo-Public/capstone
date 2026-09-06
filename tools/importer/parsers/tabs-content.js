/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-content. Base: tabs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.tabs.panelcontainer)
 * Generated: 2026-09-06
 *
 * Content tabs (Overview / Itinerary / What to Bring). Library convention: 2-column
 * table, first row = block name, each subsequent row = one tab (label in cell 1,
 * panel content — rich text + inline images — in cell 2).
 */
export default function parse(element, { document }) {
  // Tab labels in the tablist, in DOM order.
  const tabLabels = Array.from(
    element.querySelectorAll('.cmp-tabs__tab, [class*="tabs__tab"]:not([class*="tablist"])'),
  ).map((el) => el.textContent.trim());

  // Tab panels, in DOM order (parallel to labels).
  const panels = Array.from(
    element.querySelectorAll('.cmp-tabs__tabpanel, [class*="tabs__tabpanel"]'),
  );

  const cells = [];
  panels.forEach((panel, i) => {
    const label = tabLabels[i] || `Tab ${i + 1}`;

    // Collect the meaningful content of the panel: paragraphs, lists, headings,
    // and images (preserving rich text + inline images). Skip empty AEM grid wrappers.
    const contentCell = [];
    const nodes = Array.from(
      panel.querySelectorAll('p, ul, ol, h2, h3, h4, img.cmp-image__image, .cmp-image img'),
    );
    // De-duplicate images that may also be caught by their wrapper; use a Set of seen nodes.
    const seen = new Set();
    nodes.forEach((node) => {
      // Skip nodes that are ancestors/descendants already captured.
      if (seen.has(node)) return;
      // Skip empty text containers.
      if (node.tagName === 'P' && !node.textContent.trim() && !node.querySelector('img')) return;
      seen.add(node);
      contentCell.push(node);
    });

    // Fallback: if nothing collected, use the whole panel content fragment body.
    if (!contentCell.length) {
      const fallback = panel.querySelector('.cmp-contentfragment__elements, .contentfragment');
      if (fallback) contentCell.push(fallback);
    }

    // 2-column row: label | panel content.
    cells.push([label, contentCell.length ? contentCell : '']);
  });

  // Empty-block guard: if no tabs found, unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-content', cells });
  element.replaceWith(block);
}
