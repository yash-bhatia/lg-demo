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

  const cardsPerPage = 4;
  const totalPages = Math.ceil(cards.length / cardsPerPage);
  let currentPage = 0;

  const updatePagination = () => {
    pagination.innerHTML = `
      <button class="award-pagination-prev" aria-label="Previous page">&#8249;</button>
      <span class="award-pagination-text">${currentPage + 1} / ${totalPages}</span>
      <button class="award-pagination-next" aria-label="Next page">&#8250;</button>
    `;

    const paginationPrev = pagination.querySelector('.award-pagination-prev');
    const paginationNext = pagination.querySelector('.award-pagination-next');

    paginationPrev.addEventListener('click', () => slideTo(currentPage - 1));
    paginationNext.addEventListener('click', () => slideTo(currentPage + 1));
  };

  const slideTo = (page) => {
    if (page < 0 || page >= totalPages) return;
    currentPage = page;

    // Slide by percentage (25% per card × 4 cards = 100% per page)
    const slidePercentage = currentPage * 100;
    carouselTrack.style.transform = `translateX(-${slidePercentage}%)`;
    updatePagination();
  };

  contentWrapper.appendChild(carouselWrapper);
  contentWrapper.appendChild(pagination);
  block.appendChild(contentWrapper);

  // Initialize
  updatePagination();
}
