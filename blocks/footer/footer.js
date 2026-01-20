import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Extracts links from a section and creates inline row
 * @param {Element} section The section containing links
 * @returns {Element} A div with inline links
 */
function createInlineLinks(section) {
  const linksRow = document.createElement('div');
  linksRow.className = 'footer-links-row';

  // Get all links from the section
  const links = section.querySelectorAll('a');
  const texts = section.querySelectorAll('p');

  // If there are links, use them
  if (links.length > 0) {
    links.forEach((link, index) => {
      const linkClone = link.cloneNode(true);
      linksRow.appendChild(linkClone);

      // Add separator except for last link
      if (index < links.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'footer-link-separator';
        separator.textContent = '|';
        linksRow.appendChild(separator);
      }
    });
  } else {
    // If no links, just use text
    texts.forEach((text, index) => {
      const span = document.createElement('span');
      span.className = 'footer-link-text';
      span.textContent = text.textContent.trim();
      linksRow.appendChild(span);

      if (index < texts.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'footer-link-separator';
        separator.textContent = '|';
        linksRow.appendChild(separator);
      }
    });
  }

  return linksRow;
}

/**
 * Creates action buttons from a section
 * @param {Element} section The section containing buttons
 * @returns {Element} A div with buttons
 */
function createActionButtons(section) {
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'footer-buttons-container';

  // Get all links/text from the section
  const links = section.querySelectorAll('a');
  const texts = section.querySelectorAll('p');

  if (links.length > 0) {
    links.forEach((link) => {
      const button = document.createElement('a');
      button.href = link.href || '#';
      button.className = 'footer-button';
      button.textContent = link.textContent.trim();
      buttonsContainer.appendChild(button);
    });
  } else {
    // Create buttons from text
    texts.forEach((text) => {
      const content = text.textContent.trim();
      if (content) {
        // Split by multiple spaces or check if single item
        const items = content.split(/\s{2,}/).filter((item) => item.trim());
        items.forEach((item) => {
          const button = document.createElement('a');
          button.href = '#';
          button.className = 'footer-button';
          button.textContent = item.trim();
          buttonsContainer.appendChild(button);
        });
      }
    });
  }

  return buttonsContainer;
}

/**
 * Creates copyright section
 * @param {Element} section The section containing copyright
 * @returns {Element} A div with copyright content
 */
function createCopyright(section) {
  const copyrightContainer = document.createElement('div');
  copyrightContainer.className = 'footer-copyright';

  const paragraphs = section.querySelectorAll('p');
  paragraphs.forEach((p) => {
    const text = document.createElement('p');
    text.innerHTML = p.innerHTML;
    copyrightContainer.appendChild(text);
  });

  return copyrightContainer;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-content';

  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Get all sections
  const sections = [...footer.querySelectorAll(':scope > div')];

  // Create main footer structure
  const footerWrapper = document.createElement('div');
  footerWrapper.className = 'footer-wrapper';

  // Create top section (links + buttons)
  const footerTop = document.createElement('div');
  footerTop.className = 'footer-top';

  // Create links container (left side)
  const linksContainer = document.createElement('div');
  linksContainer.className = 'footer-links-container';

  // Process sections based on index
  // Section 0: Primary links
  if (sections[0]) {
    const primaryLinks = createInlineLinks(sections[0]);
    primaryLinks.classList.add('footer-primary-links');
    linksContainer.appendChild(primaryLinks);
  }

  // Section 1: Secondary links
  if (sections[1]) {
    const secondaryLinks = createInlineLinks(sections[1]);
    secondaryLinks.classList.add('footer-secondary-links');
    linksContainer.appendChild(secondaryLinks);
  }

  footerTop.appendChild(linksContainer);

  // Section 2: Action buttons (right side)
  if (sections[2]) {
    const actionButtons = createActionButtons(sections[2]);
    footerTop.appendChild(actionButtons);
  }

  footerWrapper.appendChild(footerTop);

  // Create bottom section (copyright)
  const footerBottom = document.createElement('div');
  footerBottom.className = 'footer-bottom';

  // Section 3: Copyright
  if (sections[3]) {
    const copyright = createCopyright(sections[3]);
    footerBottom.appendChild(copyright);
  }

  footerWrapper.appendChild(footerBottom);

  block.append(footerWrapper);
}
