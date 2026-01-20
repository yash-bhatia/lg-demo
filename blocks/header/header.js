import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Creates the top bar with logo and business link
 * @param {Element} navBrand The brand section element
 * @param {Element} navTools The tools section element
 * @returns {Element} Top bar element
 */
function createTopBar(navBrand, navTools) {
  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';

  // Add brand/logo to top bar using SVG icon
  const brandContainer = document.createElement('div');
  brandContainer.className = 'nav-brand-container';

  const homeLink = document.createElement('a');
  homeLink.href = '/';
  homeLink.className = 'nav-brand-link';
  homeLink.setAttribute('aria-label', 'LG Home');
  homeLink.innerHTML = `
    <span class="icon icon-logo-lg">
      <img src="/icons/logo-lg-100-44.svg" alt="LG" loading="eager">
    </span>
  `;
  brandContainer.appendChild(homeLink);
  topBar.appendChild(brandContainer);

  // Add business link to top bar
  const businessContainer = document.createElement('div');
  businessContainer.className = 'nav-business-container';

  if (navTools) {
    const businessLink = navTools.querySelector('a');
    if (businessLink && !businessLink.querySelector('.icon')) {
      const link = document.createElement('a');
      link.href = businessLink.href;
      link.className = 'nav-business-link';
      // Capitalize first letter
      const text = businessLink.textContent.trim();
      link.textContent = text.charAt(0).toUpperCase() + text.slice(1);
      const arrow = document.createElement('span');
      arrow.className = 'nav-external-arrow';
      arrow.innerHTML = ' ↗';
      link.appendChild(arrow);
      businessContainer.appendChild(link);
    }
  }
  topBar.appendChild(businessContainer);

  return topBar;
}

/**
 * Decorates the tools section with search and icons
 * @param {Element} navTools The tools section element
 */
function decorateTools(navTools) {
  if (!navTools) return;

  // Create a new container for tools (search + icons only)
  const toolsContainer = document.createElement('div');
  toolsContainer.className = 'nav-tools-container';

  // Create search bar
  const searchContainer = document.createElement('div');
  searchContainer.className = 'nav-search';
  searchContainer.innerHTML = `
    <form class="nav-search-form" action="/search" method="get">
      <span class="icon icon-search">
        <img data-icon-name="search" src="/icons/search.svg" alt="Search" loading="lazy">
      </span>
      <input type="search" name="q" placeholder="Search" aria-label="Search">
    </form>
  `;
  toolsContainer.appendChild(searchContainer);

  // Create user icon
  const userLink = document.createElement('a');
  userLink.href = '/account';
  userLink.className = 'nav-icon nav-icon-user';
  userLink.setAttribute('aria-label', 'Account');
  userLink.innerHTML = `
    <span class="icon icon-user">
      <img data-icon-name="user" src="/icons/user.svg" alt="Account" loading="lazy">
    </span>
  `;
  toolsContainer.appendChild(userLink);

  // Create cart icon
  const cartLink = document.createElement('a');
  cartLink.href = '/cart';
  cartLink.className = 'nav-icon nav-icon-cart';
  cartLink.setAttribute('aria-label', 'Cart');
  cartLink.innerHTML = `
    <span class="icon icon-cart">
      <img data-icon-name="cart" src="/icons/cart.svg" alt="Cart" loading="lazy">
    </span>
  `;
  toolsContainer.appendChild(cartLink);

  // Clear original content and add new container
  navTools.innerHTML = '';
  navTools.appendChild(toolsContainer);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const navTools = nav.querySelector('.nav-tools');

  // Create top bar with logo and business link
  const topBar = createTopBar(navBrand, navTools);

  // Remove brand from nav (it's now in top bar)
  if (navBrand) {
    navBrand.remove();
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Decorate tools section (search + icons)
  decorateTools(navTools);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Create main nav row container
  const mainNavRow = document.createElement('div');
  mainNavRow.className = 'nav-main-row';
  mainNavRow.append(nav);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(topBar);
  navWrapper.append(mainNavRow);
  block.append(navWrapper);
}
