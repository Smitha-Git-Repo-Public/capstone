/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs-filter
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures.html (.tabs.panelcontainer)
 * Generated: 2026-09-06
 *
 * Block library structure (Tabs): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one tab:
 *     Cell 1: Tab Label (mandatory).
 *     Cell 2: Tab Content (mandatory) — the panel content.
 *
 * Source: <div class="tabs panelcontainer"> > <div class="cmp-tabs">
 *   <ol class="cmp-tabs__tablist"> > <li class="cmp-tabs__tab">Label</li>  (6 tabs)
 *   <div class="cmp-tabs__tabpanel">  (6 panels, one per tab, each holding an .image-list.list)
 *
 * The per-panel card grids (.image-list.list) are transformed separately by the
 * cards-article parser (scoped selector ".tabs.panelcontainer .image-list.list").
 * This parser only captures the tab label + panel content wrapper and references
 * the existing panel content element so the nested cards parser still matches it —
 * it does NOT re-parse the cards here.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Tab labels, in document order.
  const tabs = Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, .cmp-tabs__tab'));

  // Tab panels, in document order — index-aligned with the tab labels.
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  tabs.forEach((tab, i) => {
    // Cell 1: tab label text
    const label = tab.textContent.trim();

    // Cell 2: the corresponding panel's content.
    // Prefer the inner card grid (.image-list.list) so the cards-article parser can
    // still target it; fall back to the whole panel's children.
    const panel = panels[i];
    let contentCell = '';
    if (panel) {
      const cardGrid = panel.querySelector('.image-list.list');
      if (cardGrid) {
        contentCell = cardGrid;
      } else {
        const children = Array.from(panel.children);
        contentCell = children.length ? children : panel;
      }
    }

    if (label || contentCell) {
      cells.push([label || '', contentCell]);
    }
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-filter', cells });
  element.replaceWith(block);
}
