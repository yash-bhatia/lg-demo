/**
 * Block Image Block
 * A media block with multiple image cards that can play YouTube videos
 *
 * Document Structure (in Word/Google Docs):
 * | block-image |
 * | Block Type | 4 Block |
 * | Media Type | Video |
 * | Video Source | Youtube |
 * | CTA Type | - |
 * | Button Type | - |
 * | Margin Top | No |
 * | Margin Bottom | Yes |
 * | Align | Align Left |
 * | Style Font Style Desktop | 40px Semibold |
 * | Style Font Style Mobile | 40px Light |
 * | Content Alignment | - |
 * | Block Image | [comma-separated image URLs] |
 * | Alt Tag #1 | [alt text] |
 * | Video ID #1 | [youtube video id] |
 * | CTA Label #1 | [label] |
 * | CTA URL #1 | [url] |
 * | Eyebrow #1 | [eyebrow text] |
 * | Headline #1 | [headline] |
 * | Body Copy #1 | [body text] |
 * | Text in the image #1 | [overlay text] |
 * | ... repeat for #2, #3, #4 ... |
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
 * Parse document rows to extract styles and content
 */
function parseDocumentRows(block) {
  const styles = {
    blockType: '4',
    mediaType: 'video',
    videoSource: 'youtube',
    ctaType: '',
    buttonType: '',
    marginTop: false,
    marginBottom: true,
    align: 'left',
    fontStyleDesktop: '40px-semibold',
    fontStyleMobile: '40px-light',
    contentAlignment: 'left',
  };

  const cards = [];
  const images = [];

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const label = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cols[1].textContent.trim().toLowerCase();
      const htmlValue = cols[1].innerHTML.trim();
      const rawValue = cols[1].textContent.trim();

      // Parse style properties
      switch (label) {
        case 'blocktype':
          const blockMatch = rawValue.match(/(\d+)/);
          if (blockMatch) {
            styles.blockType = blockMatch[1];
          }
          break;
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
        case 'margintop':
          styles.marginTop = value === 'yes' || value === 'true';
          break;
        case 'marginbottom':
          styles.marginBottom = value === 'yes' || value === 'true';
          break;
        case 'align':
          if (value.includes('center')) {
            styles.align = 'center';
          } else if (value.includes('right')) {
            styles.align = 'right';
          } else {
            styles.align = 'left';
          }
          break;
        case 'stylefontstyledesktop':
        case 'fontstyledesktop':
          styles.fontStyleDesktop = value.replace(/\s+/g, '-');
          break;
        case 'stylefontstylemobile':
        case 'fontstylemobile':
          styles.fontStyleMobile = value.replace(/\s+/g, '-');
          break;
        case 'contentalignment':
          styles.contentAlignment = value || 'left';
          break;
        case 'blockimage':
        case 'image':
        case 'images':
          // Handle comma-separated images
          const imgUrls = rawValue.split(',').map((s) => s.trim()).filter((s) => s);
          imgUrls.forEach((url) => {
            images.push(extractImageUrl(url, ''));
          });
          // Also check for links in HTML
          if (htmlValue.includes('<a') || htmlValue.includes('<img')) {
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
          break;
        default:
          // Parse card-specific properties (e.g., "alttag#1", "videoid#2")
          const cardMatch = label.match(/(.+?)#?(\d+)$/);
          if (cardMatch) {
            const prop = cardMatch[1].replace(/#/g, '');
            const cardIndex = parseInt(cardMatch[2], 10) - 1;

            // Ensure card exists
            while (cards.length <= cardIndex) {
              cards.push({
                altTag: '',
                videoId: '',
                ctaLabel: '',
                ctaUrl: '',
                ctaAdditionalClass: '',
                eyebrow: '',
                headline: '',
                bodyCopy: '',
                textInImage: '',
                image: '',
              });
            }

            switch (prop) {
              case 'image':
              case 'blockimage':
                cards[cardIndex].image = extractImageUrl(rawValue, htmlValue);
                break;
              case 'alttag':
              case 'alt':
                cards[cardIndex].altTag = rawValue;
                break;
              case 'videoid':
              case 'video':
                cards[cardIndex].videoId = rawValue;
                break;
              case 'ctalabel':
                cards[cardIndex].ctaLabel = rawValue;
                break;
              case 'ctaurl':
                cards[cardIndex].ctaUrl = extractImageUrl(rawValue, htmlValue);
                break;
              case 'ctaadditionalclass':
              case 'ctaadditionalclassname':
                cards[cardIndex].ctaAdditionalClass = rawValue;
                break;
              case 'eyebrow':
                cards[cardIndex].eyebrow = rawValue;
                break;
              case 'headline':
                cards[cardIndex].headline = htmlValue;
                break;
              case 'bodycopy':
              case 'body':
                cards[cardIndex].bodyCopy = htmlValue;
                break;
              case 'textintheimage':
              case 'textinimage':
              case 'imagetext':
                cards[cardIndex].textInImage = rawValue;
                break;
              default:
                break;
            }
          }
          break;
      }
    }
  });

  // Ensure we have a card for each image
  // Each comma-separated image belongs to a different card
  while (cards.length < images.length) {
    cards.push({
      altTag: '',
      videoId: '',
      ctaLabel: '',
      ctaUrl: '',
      ctaAdditionalClass: '',
      eyebrow: '',
      headline: '',
      bodyCopy: '',
      textInImage: '',
      image: '',
    });
  }

  // Assign each image to its corresponding card
  images.forEach((imgUrl, index) => {
    if (cards[index]) {
      cards[index].image = imgUrl;
    }
  });

  return { styles, cards };
}

/**
 * Build CSS class list based on styles
 */
function buildClassList(styles) {
  const classes = ['block-image-inner'];

  // Block type (number of columns)
  classes.push(`block-image--cols-${styles.blockType}`);

  // Media type
  classes.push(`block-image--media-${styles.mediaType}`);

  // Alignment
  classes.push(`block-image--align-${styles.align}`);

  // Margins
  if (styles.marginTop) {
    classes.push('block-image--margin-top');
  }
  if (styles.marginBottom) {
    classes.push('block-image--margin-bottom');
  }

  return classes.join(' ');
}

/**
 * Create a single card HTML
 */
function createCardHTML(card, index, styles) {
  const hasVideo = card.videoId && card.videoId.length > 0;
  const videoSrc = hasVideo ? `https://www.youtube.com/embed/${card.videoId}` : '';

  let html = `<div class="block-image-card" data-card-index="${index}">`;

  // Image container with play button overlay
  html += '<div class="block-image-media">';

  if (card.image) {
    html += `<img src="${card.image}" alt="${card.altTag || ''}" loading="lazy" class="block-image-img">`;
  }

  // Text overlay on image
  if (card.textInImage) {
    html += `<div class="block-image-overlay-text">${card.textInImage}</div>`;
  }

  // Play button for video
  if (hasVideo) {
    html += `
      <div class="c-media__container">
        <div class="button">
          <button 
            class="cmp-button c-media__button c-media__button--play c-media__button--large js-video-play" 
            data-account-id="" 
            data-player-id="" 
            data-src="${videoSrc}" 
            data-type="youtube" 
            data-video-id="${card.videoId}" 
            data-sr-text="close video" 
            type="button"
          >
            <span class="cmp-button__text c-media__button-text sr-only">Play video</span>
            <svg class="play-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="2"/>
              <polygon points="26,20 26,44 46,32" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  html += '</div>'; // End media container

  // Content section
  if (card.eyebrow || card.headline || card.bodyCopy || card.ctaLabel) {
    html += '<div class="block-image-content">';

    if (card.eyebrow) {
      html += `<span class="block-image-eyebrow">${card.eyebrow}</span>`;
    }

    if (card.headline) {
      html += `<h3 class="block-image-headline">${card.headline}</h3>`;
    }

    if (card.bodyCopy) {
      html += `<div class="block-image-body">${card.bodyCopy}</div>`;
    }

    if (card.ctaLabel && card.ctaUrl) {
      const ctaClass = card.ctaAdditionalClass ? ` ${card.ctaAdditionalClass}` : '';
      html += `<a href="${card.ctaUrl}" class="block-image-cta${ctaClass}">${card.ctaLabel}</a>`;
    }

    html += '</div>';
  }

  html += '</div>'; // End card

  return html;
}

/**
 * Create the video modal HTML
 */
function createVideoModal() {
  return `
    <div class="block-image-video-modal" id="blockImageVideoModal">
      <div class="block-image-video-overlay"></div>
      <div class="block-image-video-container">
        <button class="block-image-video-close" type="button" aria-label="Close video">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="block-image-video-wrapper">
          <iframe 
            id="blockImageVideoIframe"
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
  const modal = block.querySelector('.block-image-video-modal');
  const iframe = block.querySelector('#blockImageVideoIframe');
  const overlay = block.querySelector('.block-image-video-overlay');
  const closeBtn = block.querySelector('.block-image-video-close');
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
  let cardsHTML = '<div class="block-image-grid">';
  cards.forEach((card, index) => {
    cardsHTML += createCardHTML(card, index, styles);
  });
  cardsHTML += '</div>';

  // Add video modal
  cardsHTML += createVideoModal();

  wrapper.innerHTML = cardsHTML;
  block.appendChild(wrapper);

  // Initialize video player
  initVideoPlayer(block);
}
