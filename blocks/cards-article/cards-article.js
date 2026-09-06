import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Make the whole card clickable (matches the WKND source, where the image is
  // linked too). Only the title text was a link, so the large image — the
  // natural click target — did nothing. Wrap each card's image in an anchor to
  // the same destination as its title link. Hidden from the a11y tree so it
  // doesn't duplicate the title link for screen readers / keyboard.
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const titleLink = li.querySelector('.cards-article-card-body a[href]');
    const picture = li.querySelector('.cards-article-card-image picture');
    if (!titleLink || !picture || picture.closest('a')) return;
    const imageLink = document.createElement('a');
    imageLink.href = titleLink.getAttribute('href');
    imageLink.className = 'cards-article-card-image-link';
    imageLink.tabIndex = -1;
    imageLink.setAttribute('aria-hidden', 'true');
    picture.replaceWith(imageLink);
    imageLink.append(picture);
  });

  block.textContent = '';
  block.append(ul);
}
