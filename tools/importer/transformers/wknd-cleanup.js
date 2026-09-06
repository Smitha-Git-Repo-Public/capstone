/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * Removes non-authorable site chrome (header, footer, mobile nav, tracking
 * iframe) and stray empty <meta> elements.
 * All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Site header experience fragment: language nav, sign-in, main nav, search
      // (cleaned.html line 5: <header class="...cmp-experiencefragment--header">)
      'header',
      // Site footer experience fragment: footer nav, social buttons, copyright
      // (cleaned.html line 471: <footer class="...cmp-experiencefragment--footer">)
      'footer',
      // Adobe ID syncing tracking iframe
      // (cleaned.html line 566: <iframe id="destination_publishing_iframe_wkndsite_0">)
      'iframe',
      // Mobile nav toggle button (cleaned.html line 568: <div id="toggleNav">)
      '#toggleNav',
      // Mobile navigation drawer (cleaned.html line 574: <div id="mobileNav">)
      '#mobileNav',
      // Stray empty <meta> elements left inside cmp-image blocks
      // (cleaned.html lines 183, 204, 227, 271, 334, 378)
      'meta',
    ]);
  }
}
