/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselGalleryParser from './parsers/carousel-gallery.js';
import columnsDetailsParser from './parsers/columns-details.js';
import tabsContentParser from './parsers/tabs-content.js';

// PARSER REGISTRY
const parsers = {
  "carousel-gallery": carouselGalleryParser,
  "columns-details": columnsDetailsParser,
  "tabs-content": tabsContentParser,
};

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  "name": "adventures-2",
  "description": "WKND adventures-2 page template",
  "urls": [
    "https://wknd.site/ca/en/adventures/bali-surf-camp.html",
    "https://wknd.site/ca/en/adventures/beervana-portland.html",
    "https://wknd.site/ca/en/adventures/climbing-new-zealand.html",
    "https://wknd.site/ca/en/adventures/colorado-rock-climbing.html",
    "https://wknd.site/ca/en/adventures/cycling-southern-utah.html",
    "https://wknd.site/ca/en/adventures/cycling-tuscany.html",
    "https://wknd.site/ca/en/adventures/downhill-skiing-wyoming.html",
    "https://wknd.site/ca/en/adventures/gastronomic-marais-tour.html",
    "https://wknd.site/ca/en/adventures/napa-wine-tasting.html",
    "https://wknd.site/ca/en/adventures/riverside-camping-australia.html",
    "https://wknd.site/ca/en/adventures/ski-touring-mont-blanc.html",
    "https://wknd.site/ca/en/adventures/surf-camp-costa-rica.html",
    "https://wknd.site/ca/en/adventures/tahoe-skiing.html",
    "https://wknd.site/ca/en/adventures/west-coast-cycling.html",
    "https://wknd.site/ca/en/adventures/whistler-mountain-biking.html",
    "https://wknd.site/ca/en/adventures/yosemite-backpacking.html",
    "https://wknd.site/us/en/adventures/bali-surf-camp.html",
    "https://wknd.site/us/en/adventures/beervana-portland.html",
    "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
    "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
    "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
    "https://wknd.site/us/en/adventures/cycling-tuscany.html",
    "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
    "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
    "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
    "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
    "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
    "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
    "https://wknd.site/us/en/adventures/tahoe-skiing.html",
    "https://wknd.site/us/en/adventures/west-coast-cycling.html",
    "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
    "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
  ],
  "blocks": [
    {
      "name": "carousel-gallery",
      "instances": [
        ".carousel.cmp-carousel--mini"
      ]
    },
    {
      "name": "columns-details",
      "instances": [
        ".contentfragment.cmp-contentfragment--elements"
      ]
    },
    {
      "name": "tabs-content",
      "instances": [
        ".tabs.panelcontainer"
      ]
    }
  ],
  "sections": [
    {
      "id": "breadcrumb",
      "name": "Breadcrumb navigation",
      "selector": [
        ".breadcrumb.cmp-breadcrumb--fixed"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".breadcrumb.cmp-breadcrumb--fixed"
      ]
    },
    {
      "id": "top-carousel",
      "name": "Full-width top image carousel",
      "selector": [
        ".carousel.cmp-carousel--mini"
      ],
      "style": null,
      "blocks": [
        "carousel-gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "title",
      "name": "Adventure title",
      "selector": [
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12"
      ]
    },
    {
      "id": "details-panel",
      "name": "Adventure details attribute panel + share",
      "selector": [
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--3"
      ],
      "style": null,
      "blocks": [
        "columns-details"
      ],
      "defaultContent": [
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--3 > div.cmp-container > div.aem-Grid > div.title",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--3 > div.cmp-container > div.aem-Grid > div.sharing"
      ]
    },
    {
      "id": "tabs",
      "name": "Content tabs (Overview / Itinerary / What to Bring)",
      "selector": [
        ".tabs.panelcontainer"
      ],
      "style": null,
      "blocks": [
        "tabs-content"
      ],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  (template.blocks || []).forEach((blockDef) => {
    (blockDef.instances || []).forEach((selector) => {
      const elements = document.querySelectorAll(selector);
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

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
