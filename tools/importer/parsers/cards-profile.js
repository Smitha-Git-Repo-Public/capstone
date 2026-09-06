/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-profile
 * Base block: cards
 * Source: https://wknd.site/us/en/about-us.html (section.experiencefragment.cmp-experience-fragment--contributor)
 * Generated: 2026-09-06
 *
 * Block library structure (Cards): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one profile card:
 *     Cell 1: circular/rounded portrait image (mandatory).
 *     Cell 2: text content — name (H3), role/eyebrow subtitle (H5, optional),
 *             and a row of social icon links (Facebook / Twitter / Instagram, optional).
 *
 * Source DOM (about-us):
 *   Each card is a <section class="experiencefragment cmp-experience-fragment--contributor">.
 *   Inside: .image img.cmp-image__image, h3.cmp-title__text (name),
 *   h5.cmp-title__text (role), and .cmp-buildingblock--btn-list a.cmp-button (social links).
 *   The instance selector matches each card section individually, so this parser handles
 *   both cases: invoked on a single card section, or on a container holding several.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Resolve the set of card sections. The instance selector matches an individual
  // card section, but stay robust if a wrapping container is passed instead.
  let cardSections;
  if (element.matches('section.cmp-experience-fragment--contributor, .cmp-experience-fragment--contributor')) {
    cardSections = [element];
  } else {
    cardSections = Array.from(
      element.querySelectorAll('section.cmp-experience-fragment--contributor, .cmp-experience-fragment--contributor'),
    );
  }

  cardSections.forEach((card) => {
    // Cell 1: portrait image (mandatory per Cards convention)
    const image = card.querySelector('.cmp-image img.cmp-image__image, .cmp-image img, img');

    // Cell 2: text content — name (H3), role subtitle (H5), social links
    const contentCell = [];

    // Name: prefer an <h3>, fall back to any title text near the top of the card
    const nameEl = card.querySelector('h3.cmp-title__text, .cmp-title h3, h3');
    if (nameEl) {
      const h3 = document.createElement('h3');
      h3.textContent = nameEl.textContent.trim();
      contentCell.push(h3);
    }

    // Role / eyebrow subtitle: the H5 title text
    const roleEl = card.querySelector('h5.cmp-title__text, .cmp-title h5, h5');
    if (roleEl && roleEl.textContent.trim()) {
      const h5 = document.createElement('h5');
      h5.textContent = roleEl.textContent.trim();
      contentCell.push(h5);
    }

    // Social links: the button list. Preserve each link (href + label text).
    const socialLinks = Array.from(
      card.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button, .cmp-buildingblock a[href]'),
    );
    if (socialLinks.length) {
      const p = document.createElement('p');
      socialLinks.forEach((srcLink, i) => {
        const a = document.createElement('a');
        a.href = srcLink.getAttribute('href') || '#';
        const label = srcLink.querySelector('.cmp-button__text');
        a.textContent = (label ? label.textContent : srcLink.textContent).trim();
        p.appendChild(a);
        if (i < socialLinks.length - 1) p.appendChild(document.createTextNode(' '));
      });
      contentCell.push(p);
    }

    // Emit a card row only when it carries real content
    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard: nothing to migrate, unwrap in place
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  element.replaceWith(block);
}
