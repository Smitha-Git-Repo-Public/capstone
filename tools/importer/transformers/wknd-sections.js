/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks and section metadata.
 * Inserts <hr> before each non-first section and a Section Metadata block
 * after each section that declares a style.
 *
 * Section boundaries come from page-templates.json (payload.template.sections).
 * A section's `selector` may be a string or an array of selectors; the FIRST
 * entry is the section's start boundary, so we resolve arrays to their first
 * element.
 *
 * Uses both hooks: breaks are inserted in beforeTransform (while every section
 * element still exists, before parsers can replaceWith their matched element),
 * anchored by a temporary marker attribute; metadata blocks are inserted in
 * afterTransform against that marker (or the surviving original element).
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

function sectionStartSelector(selector) {
  // Section selector may be a string or an array; the first entry is the start boundary.
  return Array.isArray(selector) ? selector[0] : selector;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata

      const startSelector = sectionStartSelector(section.selector);
      const sectionEl = element.querySelector(startSelector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      // Dedup: if two section entries resolve to the same start boundary (e.g. sibling
      // grids sharing identical classes), a second <hr> here would create an empty
      // section. Skip when the immediately preceding sibling is already a break.
      const prev = sectionEl.previousElementSibling;
      if (prev && prev.tagName === 'HR') {
        // Preserve a style marker if this styled section landed on the shared boundary.
        if (section.style && !prev.hasAttribute(SECTION_MARKER_ATTR)) {
          prev.setAttribute(SECTION_MARKER_ATTR, section.id);
        }
        continue;
      }

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(sectionStartSelector(section.selector));
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
