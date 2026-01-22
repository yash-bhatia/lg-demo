/**
 * Image CTA Overlay Block
 * Displays cards with thumbnail images, animation videos, headlines and body copy
 * Video plays in-place on the card when play button is clicked
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
 * Extract video URL from text
 */
function extractVideoUrl(text) {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('http') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return '';
}

/**
 * Parse document rows to extract styles and card data
 */
function parseDocumentRows(block) {
  const styles = {
    blockType: 'three-blocks',
    mediaType: 'animation',
    align: 'left',
    marginTop: true,
    marginBottom: true,
    backgroundColor: 'default',
    headlineFontDesktop: '40px-semibold',
    headlineFontMobile: '24px-light',
    bodyFontDesktop: '16px-normal',
    bodyFontMobile: '14px-normal',
  };

  // Initialize cards array for 3 cards (max)
  const cards = [
    { image: '', video: '', headline: '', bodyCopy: '', altTag: '', ctaUrl: '', ctaText: '' },
    { image: '', video: '', headline: '', bodyCopy: '', altTag: '', ctaUrl: '', ctaText: '' },
    { image: '', video: '', headline: '', bodyCopy: '', altTag: '', ctaUrl: '', ctaText: '' },
  ];

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const label = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cols[1].textContent.trim().toLowerCase();
      const htmlValue = cols[1].innerHTML.trim();
      const rawValue = cols[1].textContent.trim();

      // Parse style properties
      switch (label) {
        case 'selectblocktype':
        case 'blocktype':
          styles.blockType = value || 'three-blocks';
          break;
        case 'mediatypeitems':
        case 'mediatype':
          styles.mediaType = value || 'animation';
          break;
        case 'contentalignment':
        case 'align':
          styles.align = value || 'left';
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
        default:
          break;
      }

      // Parse numbered card properties (Headline #1, Body Copy #1, Image #1, Video #1, etc.)
      const cardMatch = label.match(/^(.+?)#?(\d+)$/);
      if (cardMatch) {
        const prop = cardMatch[1].replace(/\s+/g, '');
        const cardIndex = parseInt(cardMatch[2], 10) - 1;

        if (cardIndex >= 0 && cardIndex < cards.length) {
          switch (prop) {
            case 'image':
            case 'thumbnailimage':
              cards[cardIndex].image = extractImageUrl(rawValue, htmlValue);
              break;
            case 'video':
            case 'animationvideo':
              cards[cardIndex].video = extractVideoUrl(rawValue);
              break;
            case 'headline':
              cards[cardIndex].headline = rawValue;
              break;
            case 'bodycopy':
            case 'body':
              cards[cardIndex].bodyCopy = rawValue;
              break;
            case 'alttag':
            case 'alt':
              cards[cardIndex].altTag = rawValue;
              break;
            case 'ctaurl':
            case 'cta':
              cards[cardIndex].ctaUrl = rawValue;
              break;
            case 'ctatext':
              cards[cardIndex].ctaText = rawValue;
              break;
            default:
              break;
          }
        }
      }
    }
  });

  // Filter out empty cards
  const validCards = cards.filter((card) => card.image || card.video || card.headline || card.bodyCopy);

  // Debug logging
  console.log('image-cta-overlay: Parsed cards:', validCards);
  validCards.forEach((card, index) => {
    console.log(`Card ${index + 1}:`, {
      hasImage: !!card.image,
      hasVideo: !!card.video,
      image: card.image?.substring(0, 50),
      video: card.video?.substring(0, 50),
      headline: card.headline?.substring(0, 30)
    });
  });

  return { styles, cards: validCards.length > 0 ? validCards : cards };
}

/**
 * Build CSS class list based on styles
 */
function buildClassList(styles) {
  const classes = ['image-cta-overlay-inner'];

  // Block type
  if (styles.blockType) {
    classes.push(`image-cta-overlay--${styles.blockType}`);
  }

  // Alignment
  classes.push(`image-cta-overlay--align-${styles.align}`);

  // Background
  if (styles.backgroundColor !== 'default') {
    classes.push(`image-cta-overlay--bg-${styles.backgroundColor}`);
  }

  // Margins
  if (styles.marginTop) {
    classes.push('image-cta-overlay--margin-top');
  }
  if (styles.marginBottom) {
    classes.push('image-cta-overlay--margin-bottom');
  }

  return classes.join(' ');
}

/**
 * Create a single card HTML
 */
function createCardHTML(card, index) {
  const hasVideo = card.video && card.video.length > 0;

  let html = `<div class="image-cta-overlay-card" data-card-index="${index}">`;

  // Media container (image/video)
  html += '<div class="image-cta-overlay-media">';

  // Image
  if (card.image) {
    html += `<img src="${card.image}" alt="${card.altTag || ''}" loading="lazy" class="image-cta-overlay-img">`;
  }

  // Video element (hidden initially, shown when play is clicked)
  if (hasVideo) {
    html += `
      <video 
        class="image-cta-overlay-video" 
        src="${card.video}" 
        muted 
        loop 
        playsinline
        preload="metadata"
      ></video>
    `;

    // Play button
    html += `
      <button class="image-cta-overlay-play-btn" type="button" aria-label="Play animation">
        <svg class="play-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="2"/>
          <polygon points="26,20 26,44 46,32" fill="white"/>
        </svg>
      </button>
    `;

    // Pause button (hidden initially)
    html += `
      <button class="image-cta-overlay-pause-btn" type="button" aria-label="Pause animation" style="display: none;">
        <svg class="pause-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="2"/>
          <rect x="22" y="20" width="8" height="24" fill="white"/>
          <rect x="34" y="20" width="8" height="24" fill="white"/>
        </svg>
      </button>
    `;
  }

  html += '</div>'; // End media container

  // Content container (headline and body)
  html += '<div class="image-cta-overlay-content">';

  if (card.headline) {
    html += `<h3 class="image-cta-overlay-headline">${card.headline}</h3>`;
  }

  if (card.bodyCopy) {
    html += `<p class="image-cta-overlay-body">${card.bodyCopy}</p>`;
  }

  if (card.ctaUrl && card.ctaText) {
    html += `<a href="${card.ctaUrl}" class="image-cta-overlay-cta">${card.ctaText}</a>`;
  }

  html += '</div>'; // End content container
  html += '</div>'; // End card

  return html;
}

/**
 * Initialize video player functionality (in-place video playback)
 */
function initVideoPlayers(block) {
  const cards = block.querySelectorAll('.image-cta-overlay-card');

  console.log('Initializing video players for', cards.length, 'cards');

  cards.forEach((card, index) => {
    const video = card.querySelector('.image-cta-overlay-video');
    const image = card.querySelector('.image-cta-overlay-img');
    const playBtn = card.querySelector('.image-cta-overlay-play-btn');
    const pauseBtn = card.querySelector('.image-cta-overlay-pause-btn');

    console.log(`Card ${index + 1}:`, {
      hasVideo: !!video,
      hasImage: !!image,
      hasPlayBtn: !!playBtn,
      videoSrc: video?.src
    });

    if (!video || !playBtn) return;

    // Play button click
    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Hide image, show video
      if (image) image.style.display = 'none';
      video.style.display = 'block';
      video.play();

      // Toggle buttons
      playBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'flex';
    });

    // Pause button click
    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        video.pause();

        // Toggle buttons
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'flex';
      });
    }

    // Video ended - show play button again
    video.addEventListener('ended', () => {
      if (pauseBtn) pauseBtn.style.display = 'none';
      playBtn.style.display = 'flex';
    });
  });
}

/**
 * Main decorate function
 */
export default function decorate(block) {
  // Parse document structure
  const { styles, cards } = parseDocumentRows(block);

  // Build class list
  const classList = buildClassList(styles);

  // Clear existing content
  block.textContent = '';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = classList;

  // Determine grid columns based on number of cards
  const gridClass = cards.length === 2 ? 'image-cta-overlay-grid--2' : 'image-cta-overlay-grid--3';

  // Create cards grid
  let cardsHTML = `<div class="image-cta-overlay-grid ${gridClass}">`;
  cards.forEach((card, index) => {
    cardsHTML += createCardHTML(card, index);
  });
  cardsHTML += '</div>';

  wrapper.innerHTML = cardsHTML;
  block.appendChild(wrapper);

  // Initialize video players
  initVideoPlayers(block);
}
