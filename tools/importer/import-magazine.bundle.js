/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-magazine.js
  var import_magazine_exports = {};
  __export(import_magazine_exports, {
    default: () => import_magazine_default
  });

  // tools/importer/parsers/cards-profile.js
  function parse(element, { document: document2 }) {
    const cells = [];
    let cardSections;
    if (element.matches("section.cmp-experience-fragment--contributor, .cmp-experience-fragment--contributor")) {
      cardSections = [element];
    } else {
      cardSections = Array.from(
        element.querySelectorAll("section.cmp-experience-fragment--contributor, .cmp-experience-fragment--contributor")
      );
    }
    cardSections.forEach((card) => {
      const image = card.querySelector(".cmp-image img.cmp-image__image, .cmp-image img, img");
      const contentCell = [];
      const nameEl = card.querySelector("h3.cmp-title__text, .cmp-title h3, h3");
      if (nameEl) {
        const h3 = document2.createElement("h3");
        h3.textContent = nameEl.textContent.trim();
        contentCell.push(h3);
      }
      const roleEl = card.querySelector("h5.cmp-title__text, .cmp-title h5, h5");
      if (roleEl && roleEl.textContent.trim()) {
        const h5 = document2.createElement("h5");
        h5.textContent = roleEl.textContent.trim();
        contentCell.push(h5);
      }
      const socialLinks = Array.from(
        card.querySelectorAll(".cmp-buildingblock--btn-list a.cmp-button, .cmp-buildingblock a[href]")
      );
      if (socialLinks.length) {
        const p = document2.createElement("p");
        socialLinks.forEach((srcLink, i) => {
          const a = document2.createElement("a");
          a.href = srcLink.getAttribute("href") || "#";
          const label = srcLink.querySelector(".cmp-button__text");
          a.textContent = (label ? label.textContent : srcLink.textContent).trim();
          p.appendChild(a);
          if (i < socialLinks.length - 1) p.appendChild(document2.createTextNode(" "));
        });
        contentCell.push(p);
      }
      if (image || contentCell.length) {
        cells.push([image || "", contentCell.length ? contentCell : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-profile", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Site header experience fragment: language nav, sign-in, main nav, search
        // (cleaned.html line 5: <header class="...cmp-experiencefragment--header">)
        "header",
        // Site footer experience fragment: footer nav, social buttons, copyright
        // (cleaned.html line 471: <footer class="...cmp-experiencefragment--footer">)
        "footer",
        // Adobe ID syncing tracking iframe
        // (cleaned.html line 566: <iframe id="destination_publishing_iframe_wkndsite_0">)
        "iframe",
        // Mobile nav toggle button (cleaned.html line 568: <div id="toggleNav">)
        "#toggleNav",
        // Mobile navigation drawer (cleaned.html line 574: <div id="mobileNav">)
        "#mobileNav",
        // Stray empty <meta> elements left inside cmp-image blocks
        // (cleaned.html lines 183, 204, 227, 271, 334, 378)
        "meta"
      ]);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function sectionStartSelector(selector) {
    return Array.isArray(selector) ? selector[0] : selector;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const startSelector = sectionStartSelector(section.selector);
        const sectionEl = element.querySelector(startSelector);
        if (!sectionEl) continue;
        const prev = sectionEl.previousElementSibling;
        if (prev && prev.tagName === "HR") {
          if (section.style && !prev.hasAttribute(SECTION_MARKER_ATTR)) {
            prev.setAttribute(SECTION_MARKER_ATTR, section.id);
          }
          continue;
        }
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(sectionStartSelector(section.selector));
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-magazine.js
  var parsers = {
    "cards-profile": parse
  };
  var PAGE_TEMPLATE = {
    "name": "magazine",
    "description": "WKND magazine page template",
    "urls": [
      "https://wknd.site/ca/en/magazine/arctic-surfing.html",
      "https://wknd.site/ca/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/ca/en/magazine/members-only/alaskan-adventure.html",
      "https://wknd.site/ca/en/magazine/members-only/fly-fishing-the-amazon.html",
      "https://wknd.site/ca/en/magazine/san-diego-surf.html",
      "https://wknd.site/ca/en/magazine/ski-touring.html",
      "https://wknd.site/ca/en/magazine/western-australia.html",
      "https://wknd.site/us/en/magazine/arctic-surfing.html",
      "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/us/en/magazine/san-diego-surf.html",
      "https://wknd.site/us/en/magazine/ski-touring.html",
      "https://wknd.site/us/en/magazine/western-australia.html"
    ],
    "blocks": [
      {
        "name": "cards-profile",
        "instances": [
          ".cmp-byline"
        ]
      }
    ],
    "sections": [
      {
        "id": "lead-image",
        "name": "Full-width lead article photo",
        "selector": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > div.image.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > div.image.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        "id": "breadcrumb",
        "name": "Breadcrumb navigation",
        "selector": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > div.breadcrumb.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > div.breadcrumb.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        "id": "article-body",
        "name": "Article title, byline line, and rich-text body",
        "selector": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--8 > div.cmp-container"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--8 > div.cmp-container"
        ]
      },
      {
        "id": "author-bio",
        "name": "Author bio card (contributor profile)",
        "selector": [
          ".cmp-byline"
        ],
        "style": null,
        "blocks": [
          "cards-profile"
        ],
        "defaultContent": []
      },
      {
        "id": "sidebar-related",
        "name": "Sidebar: Share This Story + Up Next related articles",
        "selector": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > aside.container.responsivegrid.cmp-layoutcontainer--sidebar"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > aside.container.responsivegrid.cmp-layoutcontainer--sidebar"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    (template.blocks || []).forEach((blockDef) => {
      (blockDef.instances || []).forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_magazine_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_magazine_exports);
})();
