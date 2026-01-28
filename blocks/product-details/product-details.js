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
 * Fallback product data - Used if API call fails
 * @param {string} sku - Product SKU
 * @returns {Object} Product data
 */
function getFallbackProductData(sku) {
  return {
    sku: sku || 'OLED55G54LW',
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
    galleryImages: [
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/tv-audio-video/tv-soundbar/oled-evo/g5/oled55g54lw/OLED55G54LW_2010x1334_7.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Front View' },
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/2025-promotions/tv-gallery-updates-june/g5/wall/55/_2010x1334_G5_55.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Wall Mount' },
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/tv-audio-video/tv-soundbar/oled-evo/g5/oled55g54lw/OLED55G54LW_2010x1334_10.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Lifestyle View' },
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/tv-audio-video/tv-soundbar/oled-evo/g5/oled55g54lw/OLED55G54LW_2010x1334_11.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Side View' },
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/tv-audio-video/tv-soundbar/oled-evo/g5/oled55g54lw/OLED55G54LW_2010x1334_12.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Detail View 1' },
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/tv-audio-video/tv-soundbar/oled-evo/g5/oled55g54lw/OLED55G54LW_2010x1334_12.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Detail View 2' },
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/tv-audio-video/tv-soundbar/oled-evo/g5/oled55g54lw/OLED55G54LW_2010x1334_13.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Detail View 3' },
      { src: 'https://www.lg.com/content/dam/channel/wcms/uk/tv-audio-video/tv-soundbar/oled-evo/g5/oled55g54lw/OLED55G54LW_2010x1334_14.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800', label: '', alt: 'LG OLED G5 Detail View 4' },
    ],
    breadcrumb: [
      { label: 'Home', url: '/' },
      { label: 'TV and Soundbars', url: '/tv-and-soundbars' },
      { label: 'OLED evo', url: '/tv-and-soundbars/oled-evo' },
      { label: sku || 'OLED55G54LW', url: null },
    ],
  };
}

/**
 * Fetch product data from API
 * @param {string} sku - Product SKU
 * @returns {Promise<Object>} Product data
 */
async function getProductData(sku) {
  const apiUrl = `https://696f0a83a06046ce618526b0.mockapi.io/api/products`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // API returns an array of products - find the one matching the requested SKU
    if (Array.isArray(data) && data.length > 0) {
      // Normalize SKU for comparison (uppercase, trim whitespace)
      const normalizedSku = (sku || '').toUpperCase().trim();
      
      // Find product with matching SKU
      const product = data.find((item) => {
        const itemSku = (item.sku || '').toUpperCase().trim();
        return itemSku === normalizedSku;
      });
      
      if (product) {
        // Ensure SKU matches the requested SKU
        product.sku = sku || product.sku;
        return product;
      }
      
      // If no matching SKU found, log warning and use fallback
      console.warn(`Product with SKU "${sku}" not found in API response. Available SKUs: ${data.map((item) => item.sku).join(', ')}`);
      return getFallbackProductData(sku);
    }
    
    // If response is not an array or is empty, use fallback
    console.warn('API returned unexpected format, using fallback data');
    return getFallbackProductData(sku);
    
  } catch (error) {
    console.error('Failed to fetch product data from API:', error);
    console.log('Using fallback product data');
    return getFallbackProductData(sku);
  }
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
    <nav class="product-breadcrumb">
      <div class="breadcrumb-content">
        ${breadcrumbHtml}
      </div>
    </nav>
  `;
}

function createStickyHeader(product) {
  const iconPath = `${window.hlx?.codeBasePath || ''}/icons/label-energy-grade-f.svg`;
  return `
    <div class="product-sticky-header">
      <div class="sticky-header-content">
        <div class="sticky-product-name">${product.shortName}</div>
        <div class="sticky-actions">
          <div class="product-sheet">
            <span class="sheet-icon">
              <img src="${iconPath}" alt="Energy Grade F" loading="lazy" style="height: 20px; width: auto;">
            </span>
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
          <span class="rating-separator">|</span>
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
          <div class="gallery-image">
            <img src="${product.galleryImages?.[0]?.src || '/icons/placeholder-product.svg'}" alt="${product.name}" loading="lazy">
          </div>
        </div>
        <button class="ar-btn"><span>✨</span> AR</button>
        <div class="gallery-thumbnails-wrapper">
          <button class="carousel-arrow carousel-prev" aria-label="Previous">‹</button>
          <div class="gallery-thumbnails">
            ${(product.galleryImages || []).map((img, index) => `
              <div class="thumbnail ${index === 0 ? 'selected' : ''}" data-index="${index}">
                <img src="${img.src}" alt="${img.alt}" loading="lazy">
                ${img.label ? `<span class="thumbnail-label">${img.label}</span>` : ''}
              </div>
            `).join('')}
          </div>
          <button class="carousel-arrow carousel-next" aria-label="Next">›</button>
        </div>
      </div>
    </div>
  `;
}

function initEventListeners(block) {
  // Size selector
  block.querySelectorAll('.size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // More button for key features
  const moreBtn = block.querySelector('.more-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const keyFeatures = block.querySelector('.key-features');
      keyFeatures.classList.toggle('expanded');
      moreBtn.querySelector('.arrow').textContent = keyFeatures.classList.contains('expanded') ? '▲' : '▼';
    });
  }

  // Buy now button
  const buyNowBtn = block.querySelector('.buy-now-btn');
  if (buyNowBtn) {
    // eslint-disable-next-line no-alert
    buyNowBtn.addEventListener('click', () => alert('Added to cart!'));
  }

  // Gallery thumbnail carousel
  const thumbnails = block.querySelectorAll('.thumbnail');
  const mainImage = block.querySelector('.gallery-image img');
  const thumbnailsContainer = block.querySelector('.gallery-thumbnails');
  const prevBtn = block.querySelector('.carousel-prev');
  const nextBtn = block.querySelector('.carousel-next');

  // Thumbnail click handler
  thumbnails.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbnails.forEach((t) => t.classList.remove('selected'));
      thumb.classList.add('selected');
      const thumbImg = thumb.querySelector('img');
      if (thumbImg && mainImage) {
        mainImage.src = thumbImg.src;
        mainImage.alt = thumbImg.alt;
      }
    });
  });

  // Carousel navigation - scroll by one thumbnail (85px width + 10px gap)
  const scrollAmount = 95;
  
  const scrollCarousel = (direction) => {
    if (!thumbnailsContainer) return;
    const currentScroll = thumbnailsContainer.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    thumbnailsContainer.scroll({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      scrollCarousel('left');
    };
  }
  
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      scrollCarousel('right');
    };
  }
}

/**
 * Main decoration function
 * Reads SKU from URL and renders product
 */
export default async function decorate(block) {
  // Get SKU from URL path
  const sku = getSkuFromUrl();

  // Show loading state
  block.textContent = '';
  const container = document.createElement('div');
  container.className = 'product-details-container';
  container.dataset.sku = sku;
  container.innerHTML = '<div class="product-loading">Loading product information...</div>';
  block.appendChild(container);

  try {
    // Fetch product data from API
    const product = await getProductData(sku);

    // Build UI with fetched data
    container.innerHTML = createBreadcrumb(product.breadcrumb || sku) + createStickyHeader(product) + createProductContent(product);
    
    initEventListeners(block);
  } catch (error) {
    console.error('Error loading product:', error);
    // Show error state or fallback
    container.innerHTML = '<div class="product-error">Failed to load product information. Please try again later.</div>';
  }
}
