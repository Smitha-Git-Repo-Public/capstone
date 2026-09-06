import { createOptimizedPicture } from '../../scripts/aem.js';

/* Inline social icons (WKND source renders these as an icon-font glyph bar). */
const ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.03 1.46-4.03 4.14v2.31H7.85V13h2.71v8h2.94z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 5.9c-.7.32-1.5.53-2.3.63.83-.5 1.46-1.28 1.76-2.22-.78.46-1.64.8-2.55.98A4.02 4.02 0 0 0 11.9 8.9c0 .32.03.62.1.92-3.34-.17-6.3-1.77-8.28-4.2-.35.6-.55 1.28-.55 2.02 0 1.4.7 2.63 1.79 3.35-.66-.02-1.28-.2-1.82-.5v.05c0 1.95 1.38 3.57 3.22 3.94-.34.1-.7.14-1.06.14-.26 0-.5-.02-.75-.07.51 1.6 2 2.76 3.75 2.8A8.07 8.07 0 0 1 2 18.9a11.4 11.4 0 0 0 6.17 1.8c7.4 0 11.45-6.13 11.45-11.45v-.52A8.13 8.13 0 0 0 22 5.9z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.6c2.74 0 3.06.01 4.14.06 1 .05 1.54.21 1.9.35.48.19.82.41 1.18.77.36.36.58.7.77 1.18.14.36.3.9.35 1.9.05 1.08.06 1.4.06 4.14s-.01 3.06-.06 4.14c-.05 1-.21 1.54-.35 1.9-.19.48-.41.82-.77 1.18-.36.36-.7.58-1.18.77-.36.14-.9.3-1.9.35-1.08.05-1.4.06-4.14.06s-3.06-.01-4.14-.06c-1-.05-1.54-.21-1.9-.35a3.18 3.18 0 0 1-1.18-.77 3.18 3.18 0 0 1-.77-1.18c-.14-.36-.3-.9-.35-1.9C3.61 15.06 3.6 14.74 3.6 12s.01-3.06.06-4.14c.05-1 .21-1.54.35-1.9.19-.48.41-.82.77-1.18.36-.36.7-.58 1.18-.77.36-.14.9-.3 1.9-.35C8.94 3.61 9.26 3.6 12 3.6zm0 1.98c-2.7 0-3 .01-4.06.06-.98.04-1.5.2-1.86.34-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.3.88-.34 1.86-.05 1.06-.06 1.37-.06 4.06s.01 3 .06 4.06c.04.98.2 1.5.34 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.88.3 1.86.34 1.06.05 1.37.06 4.06.06s3-.01 4.06-.06c.98-.04 1.5-.2 1.86-.34.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.3-.88.34-1.86.05-1.06.06-1.37.06-4.06s-.01-3-.06-4.06c-.04-.98-.2-1.5-.34-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.36-.14-.88-.3-1.86-.34-1.06-.05-1.36-.06-4.06-.06zm0 3.37a4.05 4.05 0 1 1 0 8.1 4.05 4.05 0 0 1 0-8.1zm0 6.68a2.63 2.63 0 1 0 0-5.26 2.63 2.63 0 0 0 0 5.26zm5.16-6.9a.95.95 0 1 1-1.9 0 .95.95 0 0 1 1.9 0z"/></svg>',
};

function iconFor(link) {
  const key = (`${link.textContent} ${link.getAttribute('href') || ''}`).toLowerCase();
  if (key.includes('facebook')) return { name: 'facebook', label: 'Facebook' };
  if (key.includes('twitter')) return { name: 'twitter', label: 'Twitter' };
  if (key.includes('insta')) return { name: 'instagram', label: 'Instagram' };
  return null;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-profile-card-image';
      else div.className = 'cards-profile-card-body';
    });
    ul.append(li);
  });

  /* Replace social link text with icon glyphs (matches WKND source icon bar). */
  ul.querySelectorAll('.cards-profile-card-body a').forEach((link) => {
    const icon = iconFor(link);
    if (!icon) return;
    link.setAttribute('aria-label', icon.label);
    link.innerHTML = ICONS[icon.name];
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
