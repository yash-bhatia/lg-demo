import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Gets SKU from URL path
 * URL: /products/OLED55G54LW → Returns: OLED55G54LW
 * @returns {string} SKU
 */
function getSkuFromUrl() {
  const { pathname } = window.location;
  const segments = pathname.split('/').filter((s) => s);
  
  // Check if we're on a product page
  const productsIndex = segments.indexOf('products');
  if (productsIndex >= 0 && segments[productsIndex + 1]) {
    return segments[productsIndex + 1].toUpperCase();
  }
  
  // Fallback: get last segment as SKU
  const lastSegment = segments[segments.length - 1] || '';
  return lastSegment.toUpperCase();
}

/**
 * Creates breadcrumb navigation HTML
 * @param {Array|string} breadcrumbItems - Breadcrumb items array or SKU string
 * @returns {string} Breadcrumb HTML
 */
function createBreadcrumb(breadcrumbItems) {
  // breadcrumbItems can be an array from API or we construct it from SKU
  const items = Array.isArray(breadcrumbItems) ? breadcrumbItems : [
    { label: 'Home', url: '/' },
    { label: 'TV and Soundbars', url: '/tv-and-soundbars' },
    { label: 'OLED evo', url: '/tv-and-soundbars/oled-evo' },
    { label: breadcrumbItems || 'Product', url: null },
  ];

  const breadcrumbHtml = items.map((item, index) => {
    const isLast = index === items.length - 1;
    if (isLast) {
      return `<span class="breadcrumb-current">${item.label}</span>`;
    }
    return `<a href="${item.url}" class="breadcrumb-link">${item.label}</a><span class="breadcrumb-separator">›</span>`;
  }).join('');

  return `
    <nav class="header-breadcrumb">
      <div class="breadcrumb-content">
        ${breadcrumbHtml}
      </div>
    </nav>
  `;
}

/**
 * Fetches product breadcrumb data from API
 * @param {string} sku - Product SKU
 * @returns {Promise<Array>} Breadcrumb items
 */
async function getBreadcrumbData(sku) {
  if (!sku) return null;
  
  try {
    const apiUrl = `https://696f0a83a06046ce618526b0.mockapi.io/api/${sku}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const normalizedSku = (sku || '').toUpperCase().trim();
      const product = data.find((item) => {
        const itemSku = (item.sku || '').toUpperCase().trim();
        return itemSku === normalizedSku;
      });
      
      if (product && product.breadcrumb) {
        return product.breadcrumb;
      }
    }
  } catch (error) {
    console.error('Failed to fetch breadcrumb data:', error);
  }
  
  return null;
}

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
 * Creates mega menu for navigation item
 * @param {Element} navItem The navigation item element
 */
function getMegaMenuContent(menuType) {
  const menus = {
    'Shop': {
      columns: [
        {
          title: 'Offers',
          items: [
            { label: 'All Promotions', url: '/promotions' },
            { label: 'Exclusive to LG.com', url: '/exclusive' },
            { label: 'Bundle Offers', url: '/bundle-offers' },
            { label: 'Trade-Up', url: '/trade-up' },
            { label: 'Great Offers', url: '/great-offers' },
            { label: 'Monthly LG', url: '/monthly-lg' },
            { label: 'LG Flex with Raylo Subscription', url: '/lg-flex' }
          ]
        },
        {
          title: 'New & Featured',
          items: [
            { label: 'Best', url: '/best' },
            { label: 'New & Upcoming', url: '/new-upcoming' },
            { label: 'CineBeam Q Projector', url: '/cinebeam-q' },
            { label: 'MoodUP™ Fridge Freezers', url: '/moodupfridge' },
            { label: 'A New Way to Care for Your Laundry', url: '/laundry-care' }
          ]
        },
        {
          title: 'Selected Shops',
          items: [
            { label: 'Business Shop', url: '/business-shop' },
            { label: 'Student Shop', url: '/student-shop' },
            { label: 'Key Worker Shop', url: '/key-worker-shop' },
            { label: 'Partner Shop', url: '/partner-shop' }
          ]
        },
        {
          title: 'Buying Guides',
          items: [
            { label: 'TV Lineup Guide', url: '/tv-lineup', badge: 'NEW' },
            { label: 'TV Features Guide', url: '/tv-features', badge: 'NEW' },
            { label: 'Monitor Lineup Guide', url: '/monitor-lineup', badge: 'NEW' },
            { label: 'Monitor Features Guide', url: '/monitor-features', badge: 'NEW' },
            { label: 'Fridge Freezers Features Guide', url: '/fridge-freezers', badge: 'NEW' },
            { label: 'Laundry Features Guide', url: '/laundry-features', badge: 'NEW' }
          ]
        },
        {
          title: 'Why buy from LG',
          items: [
            { label: 'LG Member Benefits', url: '/member-benefits' }
          ]
        }
      ],
      promos: [
        { url: '/tv-offers', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=250&fit=crop', alt: 'Up to 15% off on selected LG TVs' },
        { url: '/sound-suite', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop', alt: 'Introducing Sound Suite' },
        { url: '/speaker-offer', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=250&fit=crop', alt: 'Free Speaker or Soundbar with LG Bundles' },
        { url: '/washer-dryer', img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=250&fit=crop', alt: '20% off Washer and Dryer Pairs' }
      ]
    },
    'TV/Audio/Video': {
      columns: [
        {
          title: 'TVs',
          items: [
            { label: 'OLED TVs', url: '/tv/oled' },
            { label: 'QNED TVs', url: '/tv/qned' },
            { label: 'NanoCell TVs', url: '/tv/nanocell' },
            { label: '4K TVs', url: '/tv/4k' },
            { label: 'Smart TVs', url: '/tv/smart' },
            { label: 'All TVs', url: '/tv/all' }
          ]
        },
        {
          title: 'Audio',
          items: [
            { label: 'Soundbars', url: '/audio/soundbars' },
            { label: 'Wireless Speakers', url: '/audio/wireless-speakers' },
            { label: 'Home Theatre', url: '/audio/home-theatre' },
            { label: 'All Audio', url: '/audio/all' }
          ]
        },
        {
          title: 'Projectors',
          items: [
            { label: 'CineBeam Projectors', url: '/projectors/cinebeam' },
            { label: '4K Projectors', url: '/projectors/4k' },
            { label: 'All Projectors', url: '/projectors/all' }
          ]
        },
        {
          title: 'Shop by Size',
          items: [
            { label: '97" TVs', url: '/tv/97-inch' },
            { label: '83" TVs', url: '/tv/83-inch' },
            { label: '77" TVs', url: '/tv/77-inch' },
            { label: '65" TVs', url: '/tv/65-inch' },
            { label: '55" TVs', url: '/tv/55-inch' }
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'TV Buying Guide', url: '/guides/tv' },
            { label: 'Audio Buying Guide', url: '/guides/audio' },
            { label: 'Compare TVs', url: '/compare/tv' }
          ]
        }
      ],
      promos: [
        { url: '/tv-offers', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=250&fit=crop', alt: 'OLED TVs' },
        { url: '/soundbar-offers', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop', alt: 'Soundbars' },
        { url: '/projector-offers', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=250&fit=crop', alt: 'Projectors' },
        { url: '/audio-bundle', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=250&fit=crop', alt: 'Audio Bundles' }
      ]
    },
    'Appliances': {
      columns: [
        {
          title: 'Kitchen',
          items: [
            { label: 'Refrigerators', url: '/appliances/refrigerators' },
            { label: 'Dishwashers', url: '/appliances/dishwashers' },
            { label: 'Ovens & Ranges', url: '/appliances/ovens' },
            { label: 'Microwaves', url: '/appliances/microwaves' },
            { label: 'All Kitchen', url: '/appliances/kitchen' }
          ]
        },
        {
          title: 'Laundry',
          items: [
            { label: 'Washing Machines', url: '/appliances/washing-machines' },
            { label: 'Dryers', url: '/appliances/dryers' },
            { label: 'Washer Dryer Combos', url: '/appliances/combos' },
            { label: 'All Laundry', url: '/appliances/laundry' }
          ]
        },
        {
          title: 'Vacuum Cleaners',
          items: [
            { label: 'Cordless Vacuums', url: '/appliances/cordless-vacuums' },
            { label: 'Robot Vacuums', url: '/appliances/robot-vacuums' },
            { label: 'All Vacuums', url: '/appliances/vacuums' }
          ]
        },
        {
          title: 'Air Care',
          items: [
            { label: 'Air Purifiers', url: '/appliances/air-purifiers' },
            { label: 'Dehumidifiers', url: '/appliances/dehumidifiers' },
            { label: 'Stylers', url: '/appliances/stylers' }
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'Appliance Buying Guide', url: '/guides/appliances' },
            { label: 'Energy Efficiency', url: '/guides/energy' },
            { label: 'Compare Appliances', url: '/compare/appliances' }
          ]
        }
      ],
      promos: [
        { url: '/fridge-offers', img: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=250&fit=crop', alt: 'Refrigerators' },
        { url: '/laundry-offers', img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=250&fit=crop', alt: 'Laundry' },
        { url: '/vacuum-offers', img: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=250&fit=crop', alt: 'Vacuums' },
        { url: '/aircare-offers', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=250&fit=crop', alt: 'Air Care' }
      ]
    },
    'Heating & Cooling': {
      columns: [
        {
          title: 'Air Conditioning',
          items: [
            { label: 'Split Systems', url: '/hvac/split-systems' },
            { label: 'Multi-Split Systems', url: '/hvac/multi-split' },
            { label: 'Portable AC', url: '/hvac/portable' },
            { label: 'All Air Conditioning', url: '/hvac/ac' }
          ]
        },
        {
          title: 'Heat Pumps',
          items: [
            { label: 'Air Source Heat Pumps', url: '/hvac/heat-pumps' },
            { label: 'Therma V', url: '/hvac/therma-v' },
            { label: 'All Heat Pumps', url: '/hvac/heating' }
          ]
        },
        {
          title: 'Shop by Room',
          items: [
            { label: 'Living Room', url: '/hvac/living-room' },
            { label: 'Bedroom', url: '/hvac/bedroom' },
            { label: 'Office', url: '/hvac/office' },
            { label: 'Multi-Room', url: '/hvac/multi-room' }
          ]
        },
        {
          title: 'Features',
          items: [
            { label: 'Energy Efficient', url: '/hvac/energy-efficient' },
            { label: 'Smart Control', url: '/hvac/smart-control' },
            { label: 'Quiet Operation', url: '/hvac/quiet' }
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'HVAC Buying Guide', url: '/guides/hvac' },
            { label: 'Installation Services', url: '/services/installation' },
            { label: 'Compare Systems', url: '/compare/hvac' }
          ]
        }
      ],
      promos: [
        { url: '/ac-offers', img: 'https://www.rajanandco.in/pub/media/catalog/category/ac001.jpg', alt: 'Air Conditioning' },
        { url: '/heat-pump-offers', img: 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=400&h=250&fit=crop', alt: 'Heat Pumps' },
        { url: '/smart-hvac', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=250&fit=crop', alt: 'Smart HVAC' },
        { url: '/installation', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop', alt: 'Installation' }
      ]
    },
    'Computing': {
      columns: [
        {
          title: 'Monitors',
          items: [
            { label: 'Gaming Monitors', url: '/computing/gaming-monitors' },
            { label: 'UltraWide Monitors', url: '/computing/ultrawide' },
            { label: '4K Monitors', url: '/computing/4k-monitors' },
            { label: 'All Monitors', url: '/computing/monitors' }
          ]
        },
        {
          title: 'Laptops',
          items: [
            { label: 'Gram Laptops', url: '/computing/gram' },
            { label: 'Business Laptops', url: '/computing/business' },
            { label: 'All Laptops', url: '/computing/laptops' }
          ]
        },
        {
          title: 'Desktop PCs',
          items: [
            { label: 'All-in-One PCs', url: '/computing/all-in-one' },
            { label: 'Desktop Towers', url: '/computing/towers' }
          ]
        },
        {
          title: 'Accessories',
          items: [
            { label: 'Keyboards & Mice', url: '/computing/peripherals' },
            { label: 'Monitor Arms', url: '/computing/monitor-arms' },
            { label: 'Laptop Bags', url: '/computing/bags' }
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'Monitor Buying Guide', url: '/guides/monitors' },
            { label: 'Laptop Buying Guide', url: '/guides/laptops' },
            { label: 'Compare Products', url: '/compare/computing' }
          ]
        }
      ],
      promos: [
        { url: '/monitor-offers', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=250&fit=crop', alt: 'Monitors' },
        { url: '/laptop-offers', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=250&fit=crop', alt: 'Laptops' },
        { url: '/gaming-offers', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=250&fit=crop', alt: 'Gaming' },
        { url: '/business-computing', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop', alt: 'Business Computing' }
      ]
    },
    'Accessories': {
      columns: [
        {
          title: 'TV Accessories',
          items: [
            { label: 'TV Wall Mounts', url: '/accessories/tv-mounts' },
            { label: 'Remote Controls', url: '/accessories/remotes' },
            { label: 'HDMI Cables', url: '/accessories/hdmi' },
            { label: 'All TV Accessories', url: '/accessories/tv' }
          ]
        },
        {
          title: 'Audio Accessories',
          items: [
            { label: 'Soundbar Mounts', url: '/accessories/soundbar-mounts' },
            { label: 'Audio Cables', url: '/accessories/audio-cables' },
            { label: 'All Audio Accessories', url: '/accessories/audio' }
          ]
        },
        {
          title: 'Appliance Accessories',
          items: [
            { label: 'Fridge Filters', url: '/accessories/fridge-filters' },
            { label: 'Washing Machine Parts', url: '/accessories/washer-parts' },
            { label: 'Vacuum Accessories', url: '/accessories/vacuum-parts' },
            { label: 'All Appliance Accessories', url: '/accessories/appliances' }
          ]
        },
        {
          title: 'Smart Home',
          items: [
            { label: 'Smart Controllers', url: '/accessories/smart-controllers' },
            { label: 'Voice Assistants', url: '/accessories/voice' },
            { label: 'Smart Hubs', url: '/accessories/hubs' }
          ]
        },
        {
          title: 'Care & Maintenance',
          items: [
            { label: 'Cleaning Products', url: '/accessories/cleaning' },
            { label: 'Screen Protectors', url: '/accessories/screen-protectors' },
            { label: 'Extended Warranties', url: '/accessories/warranty' }
          ]
        }
      ],
      promos: [
        { url: '/mount-offers', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop', alt: 'Wall Mounts' },
        { url: '/cable-offers', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=250&fit=crop', alt: 'Cables & Accessories' },
        { url: '/filter-offers', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=250&fit=crop', alt: 'Filters & Parts' },
        { url: '/warranty-offers', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop', alt: 'Warranties' }
      ]
    },
    'Support': {
      columns: [
        {
          title: 'Product Support',
          items: [
            { label: 'Product Registration', url: '/support/registration' },
            { label: 'User Manuals', url: '/support/manuals' },
            { label: 'Software & Drivers', url: '/support/downloads' },
            { label: 'Warranty Information', url: '/support/warranty' }
          ]
        },
        {
          title: 'Repairs & Service',
          items: [
            { label: 'Request a Repair', url: '/support/repair' },
            { label: 'Service Centres', url: '/support/centres' },
            { label: 'Spare Parts', url: '/support/parts' },
            { label: 'Track Repair', url: '/support/track' }
          ]
        },
        {
          title: 'Help & Contact',
          items: [
            { label: 'FAQs', url: '/support/faq' },
            { label: 'Contact Us', url: '/support/contact' },
            { label: 'Live Chat', url: '/support/chat' },
            { label: 'Email Support', url: '/support/email' }
          ]
        },
        {
          title: 'Installation',
          items: [
            { label: 'Installation Services', url: '/support/installation' },
            { label: 'Setup Guides', url: '/support/setup' },
            { label: 'Video Tutorials', url: '/support/videos' }
          ]
        },
        {
          title: 'Account',
          items: [
            { label: 'My Orders', url: '/account/orders' },
            { label: 'My Products', url: '/account/products' },
            { label: 'Track Order', url: '/account/track' }
          ]
        }
      ],
      promos: [
        { url: '/support/chat', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop', alt: 'Live Support' },
        { url: '/support/repair', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop', alt: 'Repair Services' },
        { url: '/support/installation', img: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=250&fit=crop', alt: 'Installation' },
        { url: '/support/warranty', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop', alt: 'Warranty' }
      ]
    },
    'LG AI': {
      columns: [
        {
          title: 'AI Features',
          items: [
            { label: 'ThinQ AI Platform', url: '/ai/thinq' },
            { label: 'AI ThinQ App', url: '/ai/app' },
            { label: 'Voice Control', url: '/ai/voice' },
            { label: 'AI Picture & Sound', url: '/ai/picture-sound' }
          ]
        },
        {
          title: 'Smart Home',
          items: [
            { label: 'Connected Devices', url: '/ai/connected' },
            { label: 'Home Automation', url: '/ai/automation' },
            { label: 'Energy Monitoring', url: '/ai/energy' }
          ]
        },
        {
          title: 'Compatibility',
          items: [
            { label: 'Works with Alexa', url: '/ai/alexa' },
            { label: 'Works with Google', url: '/ai/google' },
            { label: 'Apple HomeKit', url: '/ai/homekit' }
          ]
        },
        {
          title: 'AI Products',
          items: [
            { label: 'AI TVs', url: '/ai/tvs' },
            { label: 'AI Appliances', url: '/ai/appliances' },
            { label: 'All AI Products', url: '/ai/products' }
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'AI Setup Guide', url: '/guides/ai-setup' },
            { label: 'Smart Home Guide', url: '/guides/smart-home' },
            { label: 'ThinQ App Guide', url: '/guides/thinq' }
          ]
        }
      ],
      promos: [
        { url: '/ai/thinq', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=250&fit=crop', alt: 'ThinQ AI' },
        { url: '/ai/voice', img: 'https://images.unsplash.com/photo-1589254065909-b7086229d08c?w=400&h=250&fit=crop', alt: 'Voice Control' },
        { url: '/ai/smart-home', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop', alt: 'Smart Home' },
        { url: '/ai/automation', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=250&fit=crop', alt: 'Automation' }
      ]
    }
  };
  
  return menus[menuType] || menus['Shop']; // Default to Shop menu if not found
}

function createMegaMenu(navItem, menuType) {
  const megaMenu = document.createElement('div');
  megaMenu.className = 'mega-menu';
  
  const menuData = getMegaMenuContent(menuType);
  
  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'mega-menu-content';
  
  // Create columns
  menuData.columns.forEach((column) => {
    const col = document.createElement('div');
    col.className = 'mega-menu-column';
    
    const title = document.createElement('h3');
    title.textContent = column.title;
    col.appendChild(title);
    
    const ul = document.createElement('ul');
    column.items.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.label;
      
      if (item.badge) {
        const badge = document.createElement('span');
        badge.className = 'badge-new';
        badge.textContent = item.badge;
        a.appendChild(badge);
      }
      
      li.appendChild(a);
      ul.appendChild(li);
    });
    
    col.appendChild(ul);
    contentDiv.appendChild(col);
  });
  
  // Create promo section
  const promosDiv = document.createElement('div');
  promosDiv.className = 'mega-menu-promos';
  
  const promoGrid = document.createElement('div');
  promoGrid.className = 'mega-menu-promo-grid';
  
  menuData.promos.forEach((promo) => {
    const a = document.createElement('a');
    a.href = promo.url;
    a.className = 'mega-menu-promo-card';
    
    const img = document.createElement('img');
    img.src = promo.img;
    img.alt = promo.alt;
    img.loading = 'lazy';
    
    a.appendChild(img);
    promoGrid.appendChild(a);
  });
  
  promosDiv.appendChild(promoGrid);
  
  // Build mega menu
  megaMenu.appendChild(contentDiv);
  megaMenu.appendChild(promosDiv);
  
  navItem.appendChild(megaMenu);
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
  
  // Note: Hamburger menu will be added to toolsContainer after this function returns

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

  // For mobile: add brand logo to nav main row (keep it in top bar for desktop)
  let mobileBrand = null;
  if (navBrand) {
    // Create mobile brand element with logo
    mobileBrand = document.createElement('div');
    mobileBrand.className = 'nav-brand-mobile';
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.className = 'nav-brand-link';
    homeLink.setAttribute('aria-label', 'LG Home');
    homeLink.innerHTML = `
      <span class="icon icon-logo-lg">
        <img src="/icons/logo-lg-100-44.svg" alt="LG" loading="eager">
      </span>
    `;
    mobileBrand.appendChild(homeLink);
    // Remove brand from nav (it's now in top bar for desktop)
    navBrand.remove();
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      
      // Add mega menu for all main menu items
      const linkText = navSection.querySelector('a')?.textContent.trim() || navSection.textContent.trim();
      console.log('Nav section link text:', linkText);
      
      // List of menu items that should have mega menus
      const megaMenuItems = ['Shop', 'TV/Audio/Video', 'Appliances', 'Heating & Cooling', 'Computing', 'Accessories', 'Support', 'LG AI'];
      
      if (megaMenuItems.includes(linkText)) {
        console.log(`${linkText} menu found, adding mega menu`);
        navSection.classList.add('has-mega-menu');
        createMegaMenu(navSection, linkText);
        
        if (isDesktop.matches) {
          // Add hover event listeners for desktop
          let hoverTimeout;
          const megaMenu = navSection.querySelector('.mega-menu');
          const productStickyHeader = document.querySelector('.product-sticky-header');
          console.log('Mega menu element:', megaMenu);
          
          // Show mega menu on nav item hover
          navSection.addEventListener('mouseenter', () => {
            console.log(`Mouse entered ${linkText} menu`);
            clearTimeout(hoverTimeout);
            if (megaMenu) {
              megaMenu.style.display = 'block';
              console.log('Mega menu displayed');
              
              // Lower z-index of product-sticky-header
              if (productStickyHeader) {
                productStickyHeader.style.zIndex = '1';
                console.log('Product sticky header z-index set to 1');
              }
            }
          });
          
          // Hide mega menu when leaving nav item
          navSection.addEventListener('mouseleave', () => {
            console.log(`Mouse left ${linkText} menu`);
            hoverTimeout = setTimeout(() => {
              if (megaMenu) {
                megaMenu.style.display = 'none';
                console.log('Mega menu hidden');
                
                // Restore z-index of product-sticky-header
                if (productStickyHeader) {
                  productStickyHeader.style.zIndex = '48';
                  console.log('Product sticky header z-index restored to 48');
                }
              }
            }, 100);
          });
          
          // Keep mega menu open when hovering over it
          if (megaMenu) {
            megaMenu.addEventListener('mouseenter', () => {
              console.log('Mouse entered mega menu');
              clearTimeout(hoverTimeout);
            });
            
            megaMenu.addEventListener('mouseleave', () => {
              console.log('Mouse left mega menu');
              megaMenu.style.display = 'none';
              
              // Restore z-index of product-sticky-header
              if (productStickyHeader) {
                productStickyHeader.style.zIndex = '48';
                console.log('Product sticky header z-index restored to 48');
              }
            });
          }
        }
      }
      
      navSection.addEventListener('click', () => {
        if (isDesktop.matches && !navSection.classList.contains('has-mega-menu')) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Decorate tools section (search + icons)
  decorateTools(navTools);

  // hamburger for mobile - add to tools container (on the right side with other icons)
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  
  // Add hamburger to tools container (on the right side, after cart icon)
  if (navTools && navTools.querySelector('.nav-tools-container')) {
    navTools.querySelector('.nav-tools-container').appendChild(hamburger);
  } else {
    // Fallback: prepend to nav if tools container doesn't exist
    nav.prepend(hamburger);
  }
  
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Add mobile brand to nav (for mobile view)
  if (mobileBrand) {
    nav.insertBefore(mobileBrand, nav.firstChild);
  }

  // Create main nav row container
  const mainNavRow = document.createElement('div');
  mainNavRow.className = 'nav-main-row';
  mainNavRow.append(nav);

  // Create breadcrumb navigation (only on product pages)
  const sku = getSkuFromUrl();
  let breadcrumbHtml = '';
  
  if (sku) {
    try {
      const breadcrumbData = await getBreadcrumbData(sku);
      breadcrumbHtml = createBreadcrumb(breadcrumbData || sku);
    } catch (error) {
      console.error('Error loading breadcrumb:', error);
      breadcrumbHtml = createBreadcrumb(sku);
    }
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(topBar);
  navWrapper.append(mainNavRow);
  
  // Add breadcrumb to header (below main nav row)
  if (breadcrumbHtml) {
    const breadcrumbContainer = document.createElement('div');
    breadcrumbContainer.className = 'header-breadcrumb-container';
    breadcrumbContainer.innerHTML = breadcrumbHtml;
    navWrapper.append(breadcrumbContainer);
  }
  
  block.append(navWrapper);
}
