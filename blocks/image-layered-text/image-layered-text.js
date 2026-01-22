/**
 * Image Layered Text Block
 * A block with images that have text overlays and video playback capability
 *
 * Document Structure (in Word/Google Docs):
 * | image-layered-text |
 * | Image Size Type | Standard |
 * | Media Type Items | Video |
 * | Video Source | Youtube |
 * | CTA Type | - |
 * | Button Type | - |
 * | Content Alignment | Left |
 * | Text Placement | Left |
 * | Margin Top | Yes |
 * | Margin Bottom | Yes |
 * | Border | None |
 * | Background Color | Default |
 * | Headline Font Style - Desktop | 40px Semibold |
 * | Headline Font Style - Mobile | 24px Light |
 * | Body Font Style - Desktop | 16px Normal |
 * | Body Font Style - Mobile | 14px Normal |
 * | Image #1 | [image URL] |
 * | Video #1 | [video URL or ID] |
 * | Headline #1 | [headline text] |
 * | Body Copy #1 | [body text] |
 * | Alt tag #1 | [alt text] |
 * | ... repeat for #2 ... |
 */

/**
 * Extract image URL from text or HTML value
 */
function extractImageUrl(textValue, htmlValue) {
  if (htmlValue && htmlValue.includes('<a')) {
    const hrefMatch = htmlValue.match(/href="([^"]+)"/);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1];
    }
  }
  if (htmlValue && htmlValue.includes('<img')) {
    const srcMatch = htmlValue.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }
  return textValue || '';
}

/**
 * Extract YouTube video ID from URL
 */
function extractVideoId(url) {
  if (!url) return '';
  
  // Already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return url;
}

/**
 * Parse document rows to extract styles and content
 */
function parseDocumentRows(block) {
  const styles = {
    imageSizeType: 'standard',
    mediaType: 'video',
    videoSource: 'youtube',
    ctaType: '',
    buttonType: '',
    contentAlignment: 'left',
    textPlacement: 'left',
    marginTop: true,
    marginBottom: true,
    border: 'none',
    backgroundColor: 'default',
    headlineFontDesktop: '40px-semibold',
    headlineFontMobile: '24px-light',
    bodyFontDesktop: '16px-normal',
    bodyFontMobile: '14px-normal',
  };

  // Initialize a single card for this block (single item, no numbered suffixes)
  const cards = [{
    image: '',
    video: '',
    headline: '',
    bodyCopy: '',
    altTag: '',
    textInImage: '',
  }];

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const label = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cols[1].textContent.trim().toLowerCase();
      const htmlValue = cols[1].innerHTML.trim();
      const rawValue = cols[1].textContent.trim();

      // Parse style properties
      switch (label) {
        case 'imagesizetype':
          styles.imageSizeType = value || 'standard';
          break;
        case 'mediatypeitems':
        case 'mediatype':
          styles.mediaType = value;
          break;
        case 'videosource':
          styles.videoSource = value;
          break;
        case 'ctatype':
          styles.ctaType = rawValue;
          break;
        case 'buttontype':
          styles.buttonType = rawValue;
          break;
        case 'contentalignment':
          styles.contentAlignment = value || 'left';
          break;
        case 'textplacement':
          styles.textPlacement = value || 'left';
          break;
        case 'margintop':
          styles.marginTop = value === 'yes' || value === 'true';
          break;
        case 'marginbottom':
          styles.marginBottom = value === 'yes' || value === 'true';
          break;
        case 'border':
          styles.border = value || 'none';
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
        case 'image':
        case 'images':
          // Extract image URL and assign directly to card
          let imgUrl = extractImageUrl(rawValue, htmlValue);
          if (imgUrl) {
            cards[0].image = imgUrl;
          }
          break;
        case 'video':
        case 'videos':
          // Extract video URL/ID and assign directly to card
          let vidUrl = extractVideoId(rawValue);
          if (vidUrl) {
            cards[0].video = vidUrl;
          }
          break;
        case 'headline':
        case 'headlinetext':
          cards[0].headline = rawValue;
          break;
        case 'bodycopy':
        case 'body':
        case 'bodycopytext':
        case 'description':
          cards[0].bodyCopy = rawValue;
          break;
        case 'alttag':
        case 'alt':
          cards[0].altTag = rawValue;
          break;
        case 'textintheimage':
        case 'textinimage':
          cards[0].textInImage = rawValue;
          break;
        default:
          break;
      }
    }
  });

  return { styles, cards };
}

/**
 * Build CSS class list based on styles
 */
function buildClassList(styles) {
  const classes = ['image-layered-text-inner'];

  // Content alignment
  classes.push(`image-layered-text--align-${styles.contentAlignment}`);

  // Text placement
  classes.push(`image-layered-text--text-${styles.textPlacement}`);

  // Background
  if (styles.backgroundColor !== 'default') {
    classes.push(`image-layered-text--bg-${styles.backgroundColor}`);
  }

  // Margins
  if (styles.marginTop) {
    classes.push('image-layered-text--margin-top');
  }
  if (styles.marginBottom) {
    classes.push('image-layered-text--margin-bottom');
  }

  // Border
  if (styles.border && styles.border !== 'none') {
    classes.push('image-layered-text--border');
  }

  return classes.join(' ');
}

/**
 * Create a single card HTML - two column layout with text on left, image on right
 */
function createCardHTML(card, index) {
  const hasVideo = card.video && card.video.length > 0;
  const videoSrc = hasVideo ? `https://www.youtube.com/embed/${card.video}` : '';

  let html = `<div class="image-layered-text-card" data-card-index="${index}">`;

  // Left column: Text content
  html += '<div class="image-layered-text-content">';
  
  if (card.headline) {
    html += `<h3 class="image-layered-text-headline">${card.headline}</h3>`;
  }
  
  if (card.bodyCopy) {
    html += `<p class="image-layered-text-body">${card.bodyCopy}</p>`;
  }

  html += '</div>'; // End text content

  // Right column: Image/Media container
  html += '<div class="image-layered-text-media">';

  if (card.image) {
    html += `<img src="${card.image}" alt="${card.altTag || ''}" loading="lazy" class="image-layered-text-img">`;
  }

  // Play button for video
  if (hasVideo) {
    html += `
      <div class="image-layered-text-play-container">
        <button 
          class="image-layered-text-play-btn js-video-play" 
          data-src="${videoSrc}" 
          data-type="youtube" 
          data-video-id="${card.video}" 
          type="button"
          aria-label="Play video"
        >
          <svg class="play-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="2"/>
            <polygon points="26,20 26,44 46,32" fill="white"/>
          </svg>
        </button>
      </div>
    `;
  }

  html += '</div>'; // End media container
  html += '</div>'; // End card

  return html;
}

/**
 * Create the video modal HTML
 */
function createVideoModal() {
  return `
    <div class="image-layered-text-video-modal" id="imageLayeredTextVideoModal">
      <div class="image-layered-text-video-overlay"></div>
      <div class="image-layered-text-video-container">
        <button class="image-layered-text-video-close" type="button" aria-label="Close video">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="image-layered-text-video-wrapper">
          <iframe 
            id="imageLayeredTextVideoIframe"
            src="" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize video player functionality
 */
function initVideoPlayer(block) {
  const modal = block.querySelector('.image-layered-text-video-modal');
  const iframe = block.querySelector('#imageLayeredTextVideoIframe');
  const overlay = block.querySelector('.image-layered-text-video-overlay');
  const closeBtn = block.querySelector('.image-layered-text-video-close');
  const playButtons = block.querySelectorAll('.js-video-play');

  if (!modal || !iframe) return;

  // Open video modal
  const openVideo = (videoSrc) => {
    iframe.src = `${videoSrc}?autoplay=1&rel=0`;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  // Close video modal
  const closeVideo = () => {
    iframe.src = '';
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  // Add click handlers to play buttons
  playButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const videoSrc = btn.getAttribute('data-src');
      if (videoSrc) {
        openVideo(videoSrc);
      }
    });
  });

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', closeVideo);
  }

  // Close on close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeVideo);
  }

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeVideo();
    }
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

  // Create cards grid
  let cardsHTML = '<div class="image-layered-text-grid">';
  cards.forEach((card, index) => {
    cardsHTML += createCardHTML(card, index);
  });
  cardsHTML += '</div>';

  // Add video modal
  cardsHTML += createVideoModal();

  wrapper.innerHTML = cardsHTML;
  block.appendChild(wrapper);

  // Initialize video player
  initVideoPlayer(block);
}
