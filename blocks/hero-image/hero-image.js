/**
 * Hero Image Block - Configurable hero banner with document-based styling
 *
 * Document Structure (in Word/Google Docs):
 * ┌─────────────────────────────────────┬─────────────────────────────────────┐
 * │ hero-image                          │                                     │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Variant Type                        │ Default                             │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Color Desktop                  │ White                               │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Color Mobile                   │ White                               │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Width                          │ Narrow                              │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Block Horizontal Alignment     │ Left                                │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Block Vertical Alignment       │ Middle                              │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Block Vertical Alignment Mobile│ Bottom                              │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ CTA Type                            │ Button                              │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Button Type                         │ Primary                             │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Target                              │ _self                               │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Media Type                          │ Image                               │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Image Size                          │ Wide                                │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Height                              │ Auto                                │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Margin Top                          │ No                                  │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Margin Bottom                       │ No                                  │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Border                              │ None                                │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Background Color                    │ Black                               │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Padding                             │ None                                │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Style Desktop                  │ 40px Semibold                       │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Text Style Mobile                   │ 24px Semibold                       │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Eyebrow                             │ Your eyebrow text                   │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Headline                            │ Your headline text                  │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Body Copy                           │ Your body copy text                 │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ CTA                                 │ Learn More                          │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ CTA URL                             │ /learn-more                         │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Alt Tag                             │ Image alt text                      │
 * ├─────────────────────────────────────┼─────────────────────────────────────┤
 * │ Hero Image                          │ desktop-image.jpg, mobile-image.jpg │
 * └─────────────────────────────────────┴─────────────────────────────────────┘
 */

/**
 * Extract image URL from text or HTML value
 * Handles cases where image is wrapped in link or is plain text
 * @param {string} textValue - Plain text value
 * @param {string} htmlValue - HTML value
 * @returns {string} Image URL
 */
function extractImageUrl(textValue, htmlValue) {
  // First, try to extract href from anchor tag
  if (htmlValue && htmlValue.includes('<a')) {
    const hrefMatch = htmlValue.match(/href=["']([^"']+)["']/);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1];
    }
  }

  // Try to extract src from img tag
  if (htmlValue && htmlValue.includes('<img')) {
    const srcMatch = htmlValue.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }

  // Return plain text value
  return textValue || '';
}

/**
 * Parse styles and content from document rows
 * @param {HTMLElement} block
 * @returns {Object} parsed data with styles and content
 */
function parseDocumentRows(block) {
  const styles = {
    variantType: 'default',
    textColorDesktop: 'white',
    textColorMobile: 'white',
    textWidth: 'narrow',
    horizontalAlignment: 'left',
    verticalAlignment: 'middle',
    verticalAlignmentMobile: 'bottom',
    ctaType: 'button',
    buttonType: 'primary',
    target: '_self',
    mediaType: 'image',
    imageSize: 'wide',
    height: 'auto',
    marginTop: false,
    marginBottom: false,
    border: false,
    backgroundColor: 'black',
    padding: 'none',
    textStyleDesktop: '40px-semibold',
    textStyleMobile: '24px-semibold',
  };

  const content = {
    eyebrow: '',
    headline: '',
    bodyCopy: '',
    cta: '',
    ctaUrl: '',
    altTag: '',
    heroImageDesktop: '',
    heroImageMobile: '',
  };

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const label = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
      const value = cols[1].textContent.trim();
      const valueLower = value.toLowerCase();
      const htmlValue = cols[1].innerHTML.trim();

      // Parse style rows
      switch (label) {
        case 'varianttype':
        case 'selectherobannervarianttype':
          styles.variantType = valueLower || 'default';
          break;
        case 'textcolordesktop':
          styles.textColorDesktop = valueLower || 'white';
          break;
        case 'textcolormobile':
          styles.textColorMobile = valueLower || 'white';
          break;
        case 'textwidth':
          if (valueLower.includes('narrow')) styles.textWidth = 'narrow';
          else if (valueLower.includes('wide')) styles.textWidth = 'wide';
          else styles.textWidth = 'normal';
          break;
        case 'textblockhorizontalalignment':
        case 'horizontalalignment':
          if (valueLower === 'center') styles.horizontalAlignment = 'center';
          else if (valueLower === 'right') styles.horizontalAlignment = 'right';
          else styles.horizontalAlignment = 'left';
          break;
        case 'textblockverticalalignment':
        case 'verticalalignment':
          if (valueLower === 'top') styles.verticalAlignment = 'top';
          else if (valueLower === 'bottom') styles.verticalAlignment = 'bottom';
          else styles.verticalAlignment = 'middle';
          break;
        case 'textblockverticalalignmentmobile':
        case 'verticalalignmentmobile':
          if (valueLower === 'top') styles.verticalAlignmentMobile = 'top';
          else if (valueLower === 'middle') styles.verticalAlignmentMobile = 'middle';
          else styles.verticalAlignmentMobile = 'bottom';
          break;
        case 'ctatype':
          styles.ctaType = valueLower || 'button';
          break;
        case 'buttontype':
          styles.buttonType = valueLower || 'primary';
          break;
        case 'target':
          styles.target = value || '_self';
          break;
        case 'mediatype':
        case 'mediatypeitems':
          styles.mediaType = valueLower || 'image';
          break;
        case 'imagesize':
          styles.imageSize = valueLower || 'wide';
          break;
        case 'height':
          styles.height = valueLower || 'auto';
          break;
        case 'margintop':
          styles.marginTop = valueLower === 'yes' || valueLower === 'true';
          break;
        case 'marginbottom':
          styles.marginBottom = valueLower === 'yes' || valueLower === 'true';
          break;
        case 'border':
          styles.border = valueLower === 'yes' || valueLower === 'true';
          break;
        case 'backgroundcolor':
        case 'background':
          styles.backgroundColor = valueLower || 'black';
          break;
        case 'padding':
          styles.padding = valueLower || 'none';
          break;
        case 'textstyledesktop':
          styles.textStyleDesktop = valueLower.replace(/\s+/g, '-') || '40px-semibold';
          break;
        case 'textstylemobile':
          styles.textStyleMobile = valueLower.replace(/\s+/g, '-') || '24px-semibold';
          break;
        // Parse content rows
        case 'eyebrow':
          content.eyebrow = htmlValue;
          break;
        case 'headline':
          content.headline = htmlValue;
          break;
        case 'bodycopy':
        case 'body':
          content.bodyCopy = htmlValue;
          break;
        case 'cta':
          content.cta = htmlValue;
          break;
        case 'ctaurl':
          content.ctaUrl = value;
          break;
        case 'alttag':
        case 'alt':
          content.altTag = value;
          break;
        case 'heroimagedesktop':
          // Check if value contains a link, extract href
          content.heroImageDesktop = extractImageUrl(value, htmlValue);
          break;
        case 'heroimagemobile':
          // Check if value contains a link, extract href
          content.heroImageMobile = extractImageUrl(value, htmlValue);
          break;
        case 'heroimage':
        case 'image':
          // Parse comma-separated image URLs (desktop, mobile) for backwards compatibility
          if (value.includes(',')) {
            const images = value.split(',').map((s) => s.trim()).filter((s) => s);
            content.heroImageDesktop = images[0] || '';
            content.heroImageMobile = images[1] || images[0] || '';
          } else {
            // Single image - use for both if not already set
            const imgUrl = extractImageUrl(value, htmlValue);
            if (!content.heroImageDesktop) content.heroImageDesktop = imgUrl;
            if (!content.heroImageMobile) content.heroImageMobile = imgUrl;
          }
          break;
        default:
          break;
      }
    }
  });

  return { styles, content };
}

/**
 * Build CSS classes from styles
 * @param {Object} styles
 * @returns {string} CSS class string
 */
function buildClassList(styles) {
  const classes = ['hero-image-container'];

  classes.push(`hero-image--variant-${styles.variantType}`);
  classes.push(`hero-image--text-color-desktop-${styles.textColorDesktop}`);
  classes.push(`hero-image--text-color-mobile-${styles.textColorMobile}`);
  classes.push(`hero-image--text-width-${styles.textWidth}`);
  classes.push(`hero-image--h-align-${styles.horizontalAlignment}`);
  classes.push(`hero-image--v-align-${styles.verticalAlignment}`);
  classes.push(`hero-image--v-align-mobile-${styles.verticalAlignmentMobile}`);
  classes.push(`hero-image--cta-${styles.ctaType}`);
  classes.push(`hero-image--btn-${styles.buttonType}`);
  classes.push(`hero-image--image-size-${styles.imageSize}`);
  classes.push(`hero-image--bg-${styles.backgroundColor}`);

  if (styles.marginTop) classes.push('hero-image--margin-top');
  if (styles.marginBottom) classes.push('hero-image--margin-bottom');
  if (styles.border) classes.push('hero-image--border');
  if (styles.padding !== 'none') classes.push(`hero-image--padding-${styles.padding}`);

  return classes.join(' ');
}

/**
 * Create hero image block HTML
 * @param {Object} content
 * @param {Object} styles
 * @returns {string} HTML string
 */
function createHeroImageHTML(content, styles) {
  const hasEyebrow = content.eyebrow && content.eyebrow.length > 0;
  const hasHeadline = content.headline && content.headline.length > 0;
  const hasBodyCopy = content.bodyCopy && content.bodyCopy.length > 0;
  const hasCta = content.cta && content.cta.length > 0;

  // Use desktop image, fallback mobile to desktop if not set
  const desktopImage = content.heroImageDesktop || '';
  const mobileImage = content.heroImageMobile || desktopImage;
  const hasImage = desktopImage.length > 0;

  let html = '<div class="hero-image-inner">';

  // Background image container
  if (hasImage) {
    html += `
      <div class="hero-image-media">
        <picture>
          <source media="(max-width: 768px)" srcset="${mobileImage}">
          <img src="${desktopImage}" alt="${content.altTag || ''}" loading="lazy" class="hero-image-bg">
        </picture>
      </div>
    `;
  }

  // Content overlay
  html += '<div class="hero-image-content">';

  if (hasEyebrow) {
    html += `<span class="hero-image-eyebrow">${content.eyebrow}</span>`;
  }

  if (hasHeadline) {
    html += `<h1 class="hero-image-headline">${content.headline}</h1>`;
  }

  if (hasBodyCopy) {
    html += `<p class="hero-image-body">${content.bodyCopy}</p>`;
  }

  if (hasCta) {
    const target = styles.target || '_self';
    html += `<a href="${content.ctaUrl || '#'}" target="${target}" class="hero-image-cta hero-image-cta--${styles.buttonType}">${content.cta}</a>`;
  }

  html += '</div>'; // .hero-image-content
  html += '</div>'; // .hero-image-inner

  return html;
}

/**
 * Main decoration function
 */
export default function decorate(block) {
  // Parse styles and content from document rows
  const { styles, content } = parseDocumentRows(block);

  // Clear existing content
  block.textContent = '';

  // Create container with style classes
  const container = document.createElement('div');
  container.className = buildClassList(styles);

  // Set inner HTML
  container.innerHTML = createHeroImageHTML(content, styles);

  // Append to block
  block.appendChild(container);
}
