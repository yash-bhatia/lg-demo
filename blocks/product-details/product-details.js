/**
 * Product Details Block
 * Reads SKU from URL path and displays product information
 *
 * URL Format: /products/{SKU}
 * Example: /products/OLED55G54LW
 *
 * Future API Integration:
 * Replace getProductData() with an API call
 */

/**
 * Hardcoded product data - Replace with API call in future
 * @param {string} sku - Product SKU
 * @returns {Object} Product data
 */
function getProductData(sku) {
  const products = {
    OLED55G54LW: {
      sku: 'OLED55G54LW',
      name: '55 inch LG OLED evo AI G5 4K Smart TV 2025 - Wall mount version',
      shortName: '55 inch LG OLED evo AI G5 4K Smart TV 2025 - Wall mount version',
      badge: 'Trade-Up for £150 off',
      price: 1699.00,
      originalPrice: 2399.99,
      memberPrice: 1665.02,
      currency: '£',
      savings: 700.99,
      rating: 4.8,
      reviewCount: 2031,
      recommendPercentage: 95,
      recommendCount: 244,
      recommendTotal: 257,
      sizes: ['97"', '83"', '77"', '65"', '55"'],
      selectedSize: '55"',
      keyFeatures: [
        '4K picture quality, AI upscaled visual, and surround sound from the alpha 11 AI Processor Gen2',
        'True black levels in every pixel create stunning contrast, depth, and detail',
        '100% Colour Fidelity for accurate lifelike colours. 100% Colour Volume for richer hues',
      ],
      freeDelivery: true,
    },
    DEFAULT: {
      sku: 'UNKNOWN',
      name: 'Product Not Found',
      shortName: 'Product Not Found',
      badge: '',
      price: 0,
      originalPrice: 0,
      memberPrice: 0,
      currency: '£',
      savings: 0,
      rating: 0,
      reviewCount: 0,
      recommendPercentage: 0,
      recommendCount: 0,
      recommendTotal: 0,
      sizes: [],
      selectedSize: '',
      keyFeatures: ['Product information not available'],
      freeDelivery: false,
    },
  };

  return products[sku] || products.DEFAULT;
}

/**
 * Gets SKU from URL path
 * URL: /products/OLED55G54LW → Returns: OLED55G54LW
 * @returns {string} SKU
 */
function getSkuFromUrl() {
  const { pathname } = window.location;
  const segments = pathname.split('/').filter((s) => s);

  // Get last segment as SKU
  const lastSegment = segments[segments.length - 1] || '';

  // Return uppercase SKU or empty string
  return lastSegment.toUpperCase();
}

function createStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let html = '';

  for (let i = 0; i < 5; i += 1) {
    if (i < fullStars) {
      html += '<span class="star star-full">★</span>';
    } else if (i === fullStars && hasHalfStar) {
      html += '<span class="star star-half">★</span>';
    } else {
      html += '<span class="star star-empty">☆</span>';
    }
  }
  return html;
}

function createSizeSelector(sizes, selectedSize) {
  if (!sizes?.length) return '';

  return `
    <div class="size-selector">
      ${sizes.map((size) => `
        <button class="size-btn ${size === selectedSize ? 'selected' : ''}" data-size="${size}">${size}</button>
      `).join('')}
    </div>
  `;
}

function createKeyFeatures(features) {
  if (!features?.length) return '';

  return `
    <div class="key-features">
      <h3>Key Features</h3>
      <ul>${features.map((f) => `<li>${f}</li>`).join('')}</ul>
      <button class="more-btn">More <span class="arrow">▼</span></button>
    </div>
  `;
}

function createStickyHeader(product) {
  return `
    <div class="product-sticky-header">
      <div class="sticky-header-content">
        <div class="sticky-product-name">${product.shortName}</div>
        <div class="sticky-actions">
          <div class="product-sheet">
            <span class="sheet-icon">📄</span>
            <span>Product<br>Information Sheet</span>
          </div>
          <div class="sticky-pricing">
            <span class="savings">Save ${product.currency}${product.savings.toFixed(2)}</span>
            <span class="original-price">${product.currency}${product.originalPrice.toFixed(2)}</span>
          </div>
          <div class="sticky-price">
            <span class="current-price">${product.currency}${product.price.toFixed(2)}</span>
            <span class="member-price">Members Only ${product.currency}${product.memberPrice.toFixed(2)}</span>
          </div>
          <button class="buy-now-btn">Buy Now</button>
        </div>
      </div>
    </div>
  `;
}

function createProductContent(product) {
  return `
    <div class="product-main">
      <div class="product-info">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <h1 class="product-title">${product.name}</h1>
        <div class="product-meta">
          <span class="product-sku">${product.sku}</span>
          <span class="meta-separator">|</span>
          <a href="#" class="chat-expert">Chat with an expert <span class="chat-icon">💬</span></a>
        </div>
        <div class="product-rating">
          <div class="stars">${createStarRating(product.rating)}</div>
          <span class="rating-value">${product.rating}</span>
          <span class="review-count">${product.reviewCount} Reviews</span>
        </div>
        <div class="recommend-info">
          ${product.recommendCount} out of ${product.recommendTotal} (${product.recommendPercentage}%) reviewers recommend this product
        </div>
        <button class="share-thoughts-btn">SHARE YOUR THOUGHTS!</button>
        ${createSizeSelector(product.sizes, product.selectedSize)}
        ${createKeyFeatures(product.keyFeatures)}
        ${product.freeDelivery ? `
          <div class="delivery-banner">
            <span class="delivery-icon">🚚</span>
            <span class="delivery-text">Free Express Delivery</span>
          </div>
        ` : ''}
      </div>
      <div class="product-gallery">
        <div class="gallery-main">
          <div class="gallery-badge">Ultimate gaming</div>
          <div class="gallery-features">
            <span>VRR</span><span>ALLM</span><span>G-SYNC</span><span>FreeSync</span>
          </div>
          <div class="gallery-image">
            <img src="/icons/placeholder-product.svg" alt="${product.name}" loading="lazy">
          </div>
          <button class="ar-btn"><span>✨</span> AR</button>
        </div>
        <div class="gallery-thumbnails">
          ${Array(8).fill('<div class="thumbnail"></div>').join('')}
        </div>
      </div>
    </div>
  `;
}

function initEventListeners(block) {
  block.querySelectorAll('.size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  const moreBtn = block.querySelector('.more-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const keyFeatures = block.querySelector('.key-features');
      keyFeatures.classList.toggle('expanded');
      moreBtn.querySelector('.arrow').textContent = keyFeatures.classList.contains('expanded') ? '▲' : '▼';
    });
  }

  const buyNowBtn = block.querySelector('.buy-now-btn');
  if (buyNowBtn) {
    // eslint-disable-next-line no-alert
    buyNowBtn.addEventListener('click', () => alert('Added to cart!'));
  }
}

/**
 * Main decoration function
 * Reads SKU from URL and renders product
 */
export default async function decorate(block) {
  // Get SKU from URL path
  const sku = getSkuFromUrl();

  // Get product data
  const product = getProductData(sku);

  // Build UI
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'product-details-container';
  container.dataset.sku = sku;
  container.innerHTML = createStickyHeader(product) + createProductContent(product);

  block.appendChild(container);
  initEventListeners(block);
}
