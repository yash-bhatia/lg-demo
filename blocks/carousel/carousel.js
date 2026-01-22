/**
 * Carousel Block
 * Displays multiple slides with headline, body copy, and image
 * Features navigation dots and prev/next buttons
 */

/**
 * Extract image URL from text or HTML
 */
function extractImageUrl(text, html) {
  // Check for href in HTML first
  if (html && html.includes('href="')) {
    const match = html.match(/href="([^"]+)"/);
    if (match && match[1]) return match[1];
  }
  // Check for src in HTML
  if (html && html.includes('src="')) {
    const match = html.match(/src="([^"]+)"/);
    if (match && match[1]) return match[1];
  }
  // Return text if it looks like a URL
  if (text && (text.startsWith('http') || text.startsWith('/'))) {
    return text.trim();
  }
  return '';
}

/**
 * Parse document rows to extract styles and slide data
 */
function parseDocumentRows(block) {
  const styles = {
    align: 'center',
    marginTop: true,
    marginBottom: true,
    backgroundColor: 'default',
    headlineFontDesktop: '40px-semibold',
    headlineFontMobile: '24px-light',
    bodyFontDesktop: '16px-normal',
    bodyFontMobile: '14px-normal',
    autoplay: false,
    autoplayDelay: 5000,
  };

  const slides = [];
  const images = [];

  console.log('Carousel: Starting to parse document rows');
  console.log('Carousel: Block children count:', block.children.length);

  [...block.children].forEach((row, rowIndex) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const label = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cols[1].textContent.trim().toLowerCase();
      const htmlValue = cols[1].innerHTML.trim();
      const rawValue = cols[1].textContent.trim();
      
      console.log(`Row ${rowIndex}: label="${label}", rawValue="${rawValue.substring(0, 50)}${rawValue.length > 50 ? '...' : ''}"`);

      // Parse style properties
      switch (label) {
        case 'contentalignment':
        case 'align':
          styles.align = value || 'center';
          break;
        case 'margintop':
          styles.marginTop = value === 'yes' || value === 'true';
          break;
        case 'marginbottom':
          styles.marginBottom = value === 'yes' || value === 'true';
          break;
        case 'backgroundcolor':
        case 'background':
          styles.backgroundColor = value || 'default';
          break;
        case 'headlinefontstyledesktop':
        case 'headlinefontdesktop':
          styles.headlineFontDesktop = value.replace(/\s+/g, '-');
          break;
        case 'headlinefontstylemobile':
        case 'headlinefontmobile':
          styles.headlineFontMobile = value.replace(/\s+/g, '-');
          break;
        case 'bodyfontstyledesktop':
        case 'bodyfontdesktop':
          styles.bodyFontDesktop = value.replace(/\s+/g, '-');
          break;
        case 'bodyfontstylemobile':
        case 'bodyfontmobile':
          styles.bodyFontMobile = value.replace(/\s+/g, '-');
          break;
        case 'autoplay':
          styles.autoplay = value === 'yes' || value === 'true';
          break;
        case 'autoplaydelay':
          styles.autoplayDelay = parseInt(rawValue, 10) || 5000;
          break;
        case 'images':
        case 'image':
          console.log('Carousel: Found images row, rawValue:', rawValue);
          // Handle comma-separated images
          const imgUrls = rawValue.split(',').map((s) => s.trim()).filter((s) => s);
          console.log('Carousel: Split into', imgUrls.length, 'URLs:', imgUrls);
          imgUrls.forEach((url) => {
            const cleanUrl = extractImageUrl(url, '');
            console.log('Carousel: Extracted URL:', cleanUrl);
            if (cleanUrl) images.push(cleanUrl);
          });
          // Also check for links in HTML
          if (htmlValue.includes('<a') || htmlValue.includes('<img')) {
            console.log('Carousel: Also checking HTML for links/images');
            const linkMatches = htmlValue.match(/href="([^"]+)"/g) || [];
            const imgMatches = htmlValue.match(/src="([^"]+)"/g) || [];
            linkMatches.forEach((match) => {
              const url = match.replace('href="', '').replace('"', '');
              if (!images.includes(url)) images.push(url);
            });
            imgMatches.forEach((match) => {
              const url = match.replace('src="', '').replace('"', '');
              if (!images.includes(url)) images.push(url);
            });
          }
          console.log('Carousel: Total images collected so far:', images.length);
          break;
        default:
          break;
      }

      // Parse numbered slide properties (Headline #1, Body Copy #1, etc.)
      const slideMatch = label.match(/^(.+?)#?(\d+)$/);
      if (slideMatch) {
        const prop = slideMatch[1].replace(/\s+/g, '');
        const slideIndex = parseInt(slideMatch[2], 10) - 1;

        // Ensure we have enough slides
        while (slides.length <= slideIndex) {
          slides.push({
            headline: '',
            bodyCopy: '',
            image: '',
            altTag: '',
          });
        }

        switch (prop) {
          case 'image':
            slides[slideIndex].image = extractImageUrl(rawValue, htmlValue);
            console.log(`  Slide #${slideIndex + 1} Image: ${slides[slideIndex].image}`);
            break;
          case 'headline':
            slides[slideIndex].headline = rawValue;
            break;
          case 'bodycopy':
          case 'body':
            slides[slideIndex].bodyCopy = rawValue;
            break;
          case 'alttag':
          case 'alt':
            slides[slideIndex].altTag = rawValue;
            break;
          default:
            break;
        }
      }
    }
  });

  // Assign images to slides
  images.forEach((imgUrl, index) => {
    if (index < slides.length) {
      slides[index].image = imgUrl;
    }
  });

  // Ensure we have at least one slide
  if (slides.length === 0 && images.length > 0) {
    images.forEach((imgUrl) => {
      slides.push({
        headline: '',
        bodyCopy: '',
        image: imgUrl,
        altTag: '',
      });
    });
  }

  // Debug logging
  console.log('Carousel: Parsed images array:', images);
  console.log('Carousel: Total slides:', slides.length);
  console.log('Carousel: Slides data:', slides.map((s, i) => ({
    index: i,
    headline: s.headline,
    hasImage: !!s.image,
    imageUrl: s.image
  })));

  return { styles, slides };
}

/**
 * Build CSS class list based on styles
 */
function buildClassList(styles) {
  const classes = ['carousel-inner'];

  // Alignment
  classes.push(`carousel--align-${styles.align}`);

  // Background
  if (styles.backgroundColor !== 'default') {
    classes.push(`carousel--bg-${styles.backgroundColor}`);
  }

  // Margins
  if (styles.marginTop) {
    classes.push('carousel--margin-top');
  }
  if (styles.marginBottom) {
    classes.push('carousel--margin-bottom');
  }

  return classes.join(' ');
}

/**
 * Create a single slide HTML
 */
function createSlideHTML(slide, index, isActive) {
  const activeClass = isActive ? 'carousel-slide--active' : '';
  
  console.log(`Creating slide ${index}:`, {
    hasHeadline: !!slide.headline,
    hasBodyCopy: !!slide.bodyCopy,
    hasImage: !!slide.image,
    imageUrl: slide.image
  });
  
  let html = `<div class="carousel-slide ${activeClass}" data-slide-index="${index}">`;
  
  // Content FIRST (headline and body above image)
  html += `<div class="carousel-slide-content">`;
  
  if (slide.headline) {
    html += `<h2 class="carousel-slide-headline">${slide.headline}</h2>`;
  }
  
  if (slide.bodyCopy) {
    html += `<p class="carousel-slide-body">${slide.bodyCopy}</p>`;
  }
  
  html += `</div>`; // End content
  
  // Image SECOND (below content)
  if (slide.image) {
    html += `<div class="carousel-slide-image">`;
    html += `<img src="${slide.image}" alt="${slide.altTag || ''}" loading="lazy">`;
    html += `</div>`;
  }
  
  html += `</div>`; // End slide
  
  console.log(`Slide ${index} HTML generated, has image element:`, html.includes('<img'));
  
  return html;
}

/**
 * Initialize carousel functionality
 */
function initCarousel(block, slidesCount, autoplay, autoplayDelay) {
  let currentSlide = 0;
  let autoplayInterval = null;
  let isPlaying = autoplay;

  const slides = block.querySelectorAll('.carousel-slide');
  const dots = block.querySelectorAll('.carousel-dot');
  const prevBtn = block.querySelector('.carousel-nav-prev');
  const nextBtn = block.querySelector('.carousel-nav-next');
  const playPauseBtn = block.querySelector('.carousel-play-pause');

  const showSlide = (index) => {
    // Hide all slides
    slides.forEach((slide) => {
      slide.classList.remove('carousel-slide--active');
    });
    
    // Remove active state from all dots
    dots.forEach((dot) => {
      dot.classList.remove('carousel-dot--active');
    });

    // Show current slide
    if (slides[index]) {
      slides[index].classList.add('carousel-slide--active');
    }
    
    // Activate current dot
    if (dots[index]) {
      dots[index].classList.add('carousel-dot--active');
    }

    currentSlide = index;
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % slidesCount;
    showSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentSlide - 1 + slidesCount) % slidesCount;
    showSlide(prev);
  };

  const startAutoplay = () => {
    if (isPlaying && slidesCount > 1) {
      stopAutoplay(); // Clear any existing interval
      autoplayInterval = setInterval(nextSlide, autoplayDelay);
      if (playPauseBtn) {
        playPauseBtn.classList.add('is-playing');
      }
    }
  };

  const stopAutoplay = () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  };

  const togglePlayPause = () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      startAutoplay();
    } else {
      stopAutoplay();
      if (playPauseBtn) {
        playPauseBtn.classList.remove('is-playing');
      }
    }
  };

  // Play/Pause button
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
    });
  }

  // Previous button
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
    });
  }

  // Dots navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  const carouselContainer = block.querySelector('.carousel-slides');
  if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    carouselContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) {
        // Swipe left - next slide
        nextSlide();
      }
      if (touchEndX > touchStartX + 50) {
        // Swipe right - previous slide
        prevSlide();
      }
    };
  }

  // Start autoplay if enabled
  if (autoplay) {
    startAutoplay();
  }
}

/**
 * Main decorate function
 */
export default function decorate(block) {
  // Parse document structure
  const { styles, slides } = parseDocumentRows(block);

  // Build class list
  const classList = buildClassList(styles);

  // Clear existing content
  block.textContent = '';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = classList;

  // Create slides container
  let html = '<div class="carousel-slides">';
  slides.forEach((slide, index) => {
    html += createSlideHTML(slide, index, index === 0);
  });
  html += '</div>';

  // Create navigation controls
  if (slides.length > 1) {
    // Dots navigation AND play/pause button
    html += '<div class="carousel-controls">';
    
    // Previous button (left arrow)
    html += `
      <button class="carousel-control-btn carousel-nav-prev" type="button" aria-label="Previous slide">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    
    // Play/Pause button (center)
    html += `
      <button class="carousel-control-btn carousel-play-pause ${styles.autoplay ? 'is-playing' : ''}" type="button" aria-label="Play/Pause">
        <svg class="play-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" fill="currentColor"/>
        </svg>
        <svg class="pause-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="currentColor"/>
        </svg>
      </button>
    `;
    
    // Next button (right arrow)
    html += `
      <button class="carousel-control-btn carousel-nav-next" type="button" aria-label="Next slide">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    
    html += '</div>'; // End controls
    
    // Dots navigation
    html += '<div class="carousel-dots">';
    slides.forEach((_, index) => {
      const activeClass = index === 0 ? 'carousel-dot--active' : '';
      html += `<button class="carousel-dot ${activeClass}" type="button" aria-label="Go to slide ${index + 1}"></button>`;
    });
    html += '</div>';
  }

  wrapper.innerHTML = html;
  block.appendChild(wrapper);

  // Initialize carousel
  if (slides.length > 1) {
    initCarousel(block, slides.length, styles.autoplay, styles.autoplayDelay);
  }
}
