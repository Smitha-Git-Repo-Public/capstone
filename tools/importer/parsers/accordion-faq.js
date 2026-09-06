/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion-faq
 * Base block: accordion
 * Source: https://wknd.site/us/en/faqs.html (.accordion.panelcontainer)
 * Generated: 2026-09-06
 *
 * Block library structure (Accordion): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one accordion item:
 *     Cell 1: Title (mandatory)   — the clickable label.
 *     Cell 2: Content (mandatory) — the body shown when expanded.
 *
 * Source: <div class="accordion panelcontainer"> > <div class="cmp-accordion">
 *   <div class="cmp-accordion__item">        (7 Q&A items)
 *     <h3 class="cmp-accordion__header">
 *       <button ...><span class="cmp-accordion__title">Question?</span> ...</button>
 *     </h3>
 *     <div class="cmp-accordion__panel"> ... <div class="cmp-text"><p>Answer</p></div>
 *
 * The panel wraps the answer in .container > .cmp-container > .text > .cmp-text.
 * We extract the .cmp-text (the answer paragraphs) so semantic markup is preserved;
 * fall back to the panel body if the expected wrapper is absent.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each accordion item = one Q&A pair (one output row).
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  items.forEach((item) => {
    // Cell 1: title — the question text from the accordion button title span.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__button, .cmp-accordion__header');
    const title = titleEl ? titleEl.textContent.trim() : '';

    // Cell 2: content — the answer body from the panel.
    const panel = item.querySelector('.cmp-accordion__panel');
    let contentCell = '';
    if (panel) {
      // Prefer the semantic text wrapper(s); fall back to panel children.
      const textEls = Array.from(panel.querySelectorAll('.cmp-text'));
      if (textEls.length) {
        contentCell = textEls.length === 1 ? textEls[0] : textEls;
      } else {
        const children = Array.from(panel.children);
        contentCell = children.length ? children : panel;
      }
    }

    if (title || (contentCell && (Array.isArray(contentCell) ? contentCell.length : true))) {
      cells.push([title || '', contentCell || '']);
    }
  });

  // Empty-block guard: nothing extractable, unwrap the element.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
