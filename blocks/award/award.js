/**
 * Award Block - Carousel displaying award cards
 * Displays 4 cards at a time with navigation arrows
 *
 * Document Structure (in Word/Google Docs):
 * | award |
 * | Image URL | Title | Description |
 * | Image URL | Title | Description |
 * | ... repeat for each award card ... |
 */

const NAV_ITEMS = [
  { id: 'features', label: 'Features', active: true },
  { id: 'specs', label: 'Specs', active: false },
  { id: 'reviews', label: 'Reviews', active: false },
  { id: 'faq', label: 'FAQ', active: false },
  { id: 'support', label: 'Support', active: false },
  { id: 'where-to-buy', label: 'Where to Buy', active: false },
  { id: 'deals', label: 'Deals & Offers', active: false },
];

function createNavBar() {
  const nav = document.createElement('nav');
  nav.className = 'award-nav';

  const navList = document.createElement('ul');
  navList.className = 'award-nav-list';

  NAV_ITEMS.forEach((item) => {
    const navItem = document.createElement('li');
    navItem.className = 'award-nav-item';

    const navLink = document.createElement('a');
    navLink.href = `#${item.id}`;
    navLink.className = `award-nav-link${item.active ? ' active' : ''}`;
    navLink.textContent = item.label;
    navLink.dataset.tab = item.id;

    navLink.addEventListener('click', (e) => {
      e.preventDefault();
      navList.querySelectorAll('.award-nav-link').forEach((link) => {
        link.classList.remove('active');
      });
      navLink.classList.add('active');

      // Handle navigation to different sections
      if (item.id === 'specs') {
        // Scroll to key-spec component
        const keySpecBlock = document.querySelector('.key-spec');
        if (keySpecBlock) {
          keySpecBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add a small offset to account for sticky nav if needed
          setTimeout(() => {
            const offset = 80; // Adjust this value based on your nav height
            const elementPosition = keySpecBlock.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 100);
        }
      } else {
        // For other nav items, you can add similar scroll logic
        const targetElement = document.getElementById(item.id);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    navItem.appendChild(navLink);
    navList.appendChild(navItem);
  });

  nav.appendChild(navList);
  return nav;
}

export default function decorate(block) {
  const cards = [];

  // Parse each row from the document
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      let imageUrl = '';
      const link = cols[0].querySelector('a');
      if (link) {
        imageUrl = link.href;
      } else {
        imageUrl = cols[0].textContent.trim();
      }

      const card = {
        imageUrl,
        title: cols[1].textContent.trim(),
        description: cols.length >= 3 ? cols[2].textContent.trim() : '',
      };
      cards.push(card);
    }
  });

  // Clear existing content
  block.textContent = '';

  // Create navigation bar
  const navBar = createNavBar();
  block.appendChild(navBar);

  // Setup scroll-based fixed positioning
  setupScrollFixedPosition(navBar);

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'award-content';

  // Create carousel structure
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'award-carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'award-carousel';

  const carouselTrack = document.createElement('div');
  carouselTrack.className = 'award-carousel-track';

  // Create cards with inner wrapper
  cards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'award-card';
    cardEl.dataset.index = index;

    const cardInner = document.createElement('div');
    cardInner.className = 'award-card-inner';

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'award-card-image';
    if (card.imageUrl) {
      const img = document.createElement('img');
      img.src = card.imageUrl;
      img.alt = card.title;
      img.loading = 'lazy';
      imageContainer.appendChild(img);
    }

    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'award-card-content';

    const titleEl = document.createElement('h3');
    titleEl.className = 'award-card-title';
    titleEl.textContent = card.title;

    const descEl = document.createElement('p');
    descEl.className = 'award-card-description';
    descEl.textContent = card.description;

    contentContainer.appendChild(titleEl);
    contentContainer.appendChild(descEl);

    cardInner.appendChild(imageContainer);
    cardInner.appendChild(contentContainer);
    cardEl.appendChild(cardInner);
    carouselTrack.appendChild(cardEl);
  });

  carousel.appendChild(carouselTrack);
  carouselWrapper.appendChild(carousel);

  // Pagination
  const pagination = document.createElement('div');
  pagination.className = 'award-pagination';

  // Function to get cards per page based on screen width
  const getCardsPerPage = () => {
    if (window.innerWidth <= 480) return 1; // Mobile: 1 card
    if (window.innerWidth <= 768) return 2; // Tablet: 2 cards
    if (window.innerWidth <= 1024) return 3; // Large tablet: 3 cards
    return 4; // Desktop: 4 cards
  };

  let cardsPerPage = getCardsPerPage();
  let totalPages = Math.ceil(cards.length / cardsPerPage);
  let currentPage = 0;

  const updatePagination = () => {
    cardsPerPage = getCardsPerPage();
    totalPages = Math.ceil(cards.length / cardsPerPage);
    
    // Adjust current page if needed after resize
    if (currentPage >= totalPages) {
      currentPage = totalPages - 1;
    }
    
    // Calculate which cards are currently visible
    const startCard = currentPage * cardsPerPage + 1;
    const endCard = Math.min((currentPage + 1) * cardsPerPage, cards.length);
    
    // Show different format based on cards per page
    let paginationText;
    if (cardsPerPage === 1) {
      // Mobile: Show "1/13" format
      paginationText = `${startCard} / ${cards.length}`;
    } else {
      // Desktop/Tablet: Show "1-4/13" format
      paginationText = `${startCard}-${endCard} / ${cards.length}`;
    }
    
    pagination.innerHTML = `
      <button class="award-pagination-prev" aria-label="Previous page">&#8249;</button>
      <span class="award-pagination-text">${paginationText}</span>
      <button class="award-pagination-next" aria-label="Next page">&#8250;</button>
    `;

    const paginationPrev = pagination.querySelector('.award-pagination-prev');
    const paginationNext = pagination.querySelector('.award-pagination-next');

    paginationPrev.addEventListener('click', () => slideTo(currentPage - 1));
    paginationNext.addEventListener('click', () => slideTo(currentPage + 1));
    
    // Disable buttons at boundaries
    paginationPrev.disabled = currentPage === 0;
    paginationNext.disabled = currentPage >= totalPages - 1;
  };

  const slideTo = (page) => {
    cardsPerPage = getCardsPerPage();
    totalPages = Math.ceil(cards.length / cardsPerPage);
    
    if (page < 0 || page >= totalPages) return;
    currentPage = page;

    // Calculate slide percentage based on cards per page
    const slidePercentage = (currentPage * 100 * cardsPerPage) / cardsPerPage;
    carouselTrack.style.transform = `translateX(-${slidePercentage}%)`;
    updatePagination();
  };

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updatePagination();
      slideTo(0); // Reset to first page on resize
    }, 250);
  });

  contentWrapper.appendChild(carouselWrapper);
  contentWrapper.appendChild(pagination);
  block.appendChild(contentWrapper);

  // Initialize
  updatePagination();
}

/**
 * Setup scroll-based fixed positioning for award nav
 * SIMPLIFIED VERSION - calculates on demand, no complex initialization
 * @param {HTMLElement} nav - The navigation element
 */
function setupScrollFixedPosition(nav) {
  if (!nav) {
    console.error('Nav element not found');
    return;
  }

  console.log('Setting up scroll-based fixed positioning for nav');

  // Ensure nav starts in relative position
  nav.style.position = 'relative';
  nav.classList.remove('is-fixed');

  // State variables
  let originalOffset = null;
  let isFixed = false;
  const fixedTopPosition = 200; // Fixed position from top in pixels

  // Function to get the original offset (calculates on first call or when needed)
  function getOriginalOffset() {
    if (originalOffset !== null) {
      return originalOffset;
    }

    // Temporarily ensure nav is in normal position for accurate measurement
    if (isFixed) {
      nav.classList.remove('is-fixed');
      nav.style.position = 'relative';
      nav.style.top = '';
      nav.style.left = '';
      nav.style.right = '';
      nav.style.width = '';
      nav.style.zIndex = '';
    }

    // Force layout calculation
    const rect = nav.getBoundingClientRect();
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    originalOffset = rect.top + currentScroll;
    
    console.log('📍 Original offset calculated:', originalOffset, 'pixels from page top');
    return originalOffset;
  }

  // Main update function - called on scroll
  function updateNavPosition() {
    // Only apply scroll-based positioning on desktop (width >= 900px)
    const isDesktop = window.innerWidth >= 900;
    
    // If mobile, ensure nav is in normal position and exit
    if (!isDesktop) {
      if (isFixed) {
        nav.classList.remove('is-fixed');
        nav.style.position = 'relative';
        nav.style.top = '';
        nav.style.left = '';
        nav.style.right = '';
        nav.style.width = '';
        nav.style.zIndex = '';
        isFixed = false;
        console.log('📱 Mobile view detected - nav positioning disabled');
      }
      return; // Exit early on mobile
    }

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const offset = getOriginalOffset();
    
    // Calculate when nav should become fixed
    // Nav becomes fixed when scrolling past (originalOffset - fixedTopPosition)
    const scrollThreshold = offset - fixedTopPosition;
    const shouldBeFixed = scrollPosition >= scrollThreshold && scrollThreshold > 0;

    // Apply or remove fixed positioning
    if (shouldBeFixed && !isFixed) {
      // Make it fixed
      nav.classList.add('is-fixed');
      nav.style.position = 'fixed';
      nav.style.top = `${fixedTopPosition}px`;
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.width = '100%';
      nav.style.zIndex = '47';
      isFixed = true;
      console.log('🔒 Nav FIXED at scroll:', scrollPosition, 'px (threshold:', scrollThreshold, 'px)');
    } else if (!shouldBeFixed && isFixed) {
      // Make it relative again
      nav.classList.remove('is-fixed');
      nav.style.position = 'relative';
      nav.style.top = '';
      nav.style.left = '';
      nav.style.right = '';
      nav.style.width = '';
      nav.style.zIndex = '';
      isFixed = false;
      console.log('🔓 Nav UNFIXED at scroll:', scrollPosition, 'px');
    }
  }

  // Attach scroll listener immediately - no delays
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateNavPosition();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  console.log('✓ Scroll listener attached');

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const isDesktop = window.innerWidth >= 900;
      console.log('🔄 Window resized to', window.innerWidth, 'px -', isDesktop ? 'Desktop' : 'Mobile', 'view');
      
      // Reset everything
      originalOffset = null;
      nav.classList.remove('is-fixed');
      nav.style.position = 'relative';
      nav.style.top = '';
      nav.style.left = '';
      nav.style.right = '';
      nav.style.width = '';
      nav.style.zIndex = '';
      isFixed = false;
      
      // Recalculate on next scroll (will check desktop/mobile inside)
      updateNavPosition();
    }, 250);
  });

  // Initial check (in case page is already scrolled)
  setTimeout(() => {
    const isDesktop = window.innerWidth >= 900;
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    console.log('Initial check:', isDesktop ? 'Desktop' : 'Mobile', 'view, scroll:', currentScroll, 'px');
    
    if (currentScroll > 0 && isDesktop) {
      console.log('Page already scrolled on load, checking position...');
      updateNavPosition();
    }
  }, 100);

  console.log('✅ Scroll-based positioning setup complete (Desktop only: width >= 900px)');
}
