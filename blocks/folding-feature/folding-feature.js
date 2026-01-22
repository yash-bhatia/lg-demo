/**
 * Folding Feature Block
 * A feature showcase block with image and text content
 *
 * Document Structure (in Word/Google Docs):
 * | folding-feature |
 * | Eyebrow | [eyebrow text] |
 * | Headline | [headline text] |
 * | Body Copy | [body text] |
 * | CTA | [button text] |
 * | CTA URL | [button link] |
 * | Alt tag | [image alt text] |
 * | Disclaimer | [disclaimer text] |
 * | Image | [image URL] |
 * | Background Color | [light/dark/black/white] |
 * | Text Alignment | [left/center/right] |
 * | Image Position | [left/right] |
 * | Width | [full/1440/1200/960] |
 * | Margin Top | [yes/no] |
 * | Margin Bottom | [yes/no] |
 * | Border | [yes/no] |
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
    background: 'dark',
    textAlignment: 'left',
    imagePosition: 'right',
    width: 'full',
    marginTop: false,
    marginBottom: false,
    border: false,
    disclaimerAlignment: 'left',
    textAreaAlignment: 'center',
  };

  const content = {
    eyebrow: '',
    headline: '',
    bodyCopy: '',
    cta: '',
    ctaUrl: '',
    altTag: '',
    disclaimer: '',
    imageDesktop: '',
    imageMobile: '',
  };

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const label = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cols[1].textContent.trim().toLowerCase();
      const htmlValue = cols[1].innerHTML.trim();
      const rawValue = cols[1].textContent.trim();

      switch (label) {
        case 'eyebrow':
          content.eyebrow = rawValue;
          break;
        case 'headline':
          content.headline = htmlValue;
          break;
        case 'bodycopy':
        case 'body':
          content.bodyCopy = htmlValue;
          break;
        case 'cta':
        case 'ctabutton':
          content.cta = rawValue;
          break;
        case 'ctaurl':
        case 'ctalink':
          content.ctaUrl = extractImageUrl(rawValue, htmlValue);
          break;
        case 'alttag':
        case 'alt':
          content.altTag = rawValue;
          break;
        case 'disclaimer':
          content.disclaimer = htmlValue;
          break;
        case 'imagedesktop':
        case 'featureimagedesktop':
          content.imageDesktop = extractImageUrl(rawValue, htmlValue);
          break;
        case 'imagemobile':
        case 'featureimagemobile':
          content.imageMobile = extractImageUrl(rawValue, htmlValue);
          break;
        case 'image':
        case 'featureimage':
          // Handle comma-separated images (desktop, mobile)
          if (rawValue.includes(',')) {
            const images = rawValue.split(',').map((s) => s.trim()).filter((s) => s);
            content.imageDesktop = images[0] || '';
            content.imageMobile = images[1] || images[0] || '';
          } else {
            const imgUrl = extractImageUrl(rawValue, htmlValue);
            if (!content.imageDesktop) content.imageDesktop = imgUrl;
            if (!content.imageMobile) content.imageMobile = imgUrl;
          }
          break;
        case 'background':
        case 'backgroundcolor':
          if (value === 'light' || value === 'grey' || value === 'gray') {
            styles.background = 'light';
          } else if (value === 'dark') {
            styles.background = 'dark';
          } else if (value === 'black') {
            styles.background = 'black';
          } else if (value === 'white') {
            styles.background = 'white';
          } else {
            styles.background = 'dark';
          }
          break;
        case 'textalignment':
        case 'alignment':
          if (value === 'center') {
            styles.textAlignment = 'center';
          } else if (value === 'right') {
            styles.textAlignment = 'right';
          } else {
            styles.textAlignment = 'left';
          }
          break;
        case 'imageposition':
        case 'imagealignment':
          if (value === 'left') {
            styles.imagePosition = 'left';
          } else {
            styles.imagePosition = 'right';
          }
          break;
        case 'width':
          if (value === '1440' || value === '1440px') {
            styles.width = '1440';
          } else if (value === '1200' || value === '1200px') {
            styles.width = '1200';
          } else if (value === '960' || value === '960px') {
            styles.width = '960';
          } else {
            styles.width = 'full';
          }
          break;
        case 'margintop':
          styles.marginTop = value === 'yes' || value === 'true';
          break;
        case 'marginbottom':
          styles.marginBottom = value === 'yes' || value === 'true';
          break;
        case 'border':
          styles.border = value === 'yes' || value === 'true';
          break;
        case 'disclaimertextalignment':
        case 'disclaimeralignment':
          if (value === 'center') {
            styles.disclaimerAlignment = 'center';
          } else if (value === 'right') {
            styles.disclaimerAlignment = 'right';
          } else {
            styles.disclaimerAlignment = 'left';
          }
          break;
        case 'textareaalignment':
        case 'contentposition':
          if (value === 'left') {
            styles.textAreaAlignment = 'left';
          } else if (value === 'right') {
            styles.textAreaAlignment = 'right';
          } else {
            styles.textAreaAlignment = 'center';
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
 * Build CSS class list based on styles
 */
function buildClassList(styles) {
  const classes = ['folding-feature-block'];

  // Background
  classes.push(`folding-feature--bg-${styles.background}`);

  // Text alignment
  classes.push(`folding-feature--text-${styles.textAlignment}`);

  // Image position
  classes.push(`folding-feature--image-${styles.imagePosition}`);

  // Width
  if (styles.width !== 'full') {
    classes.push(`folding-feature--width-${styles.width}`);
  }

  // Margins
  if (styles.marginTop) {
    classes.push('folding-feature--margin-top');
  }
  if (styles.marginBottom) {
    classes.push('folding-feature--margin-bottom');
  }

  // Border
  if (styles.border) {
    classes.push('folding-feature--border');
  }

  return classes.join(' ');
}

/**
 * Create the folding feature HTML
 */
function createFoldingFeatureHTML(content, styles) {
  const desktopImage = content.imageDesktop || '';
  const mobileImage = content.imageMobile || desktopImage;
  const hasImage = desktopImage.length > 0;
  const hasCta = content.cta && content.cta.length > 0;

  let html = '<div class="folding-feature-container">';

  // Content section
  html += '<div class="folding-feature-content">';

  if (content.eyebrow) {
    html += `<span class="folding-feature-eyebrow">${content.eyebrow}</span>`;
  }

  if (content.headline) {
    html += `<h2 class="folding-feature-headline">${content.headline}</h2>`;
  }

  if (content.bodyCopy) {
    html += `<div class="folding-feature-body">${content.bodyCopy}</div>`;
  }

  if (hasCta) {
    const ctaUrl = content.ctaUrl || '#';
    html += `<a href="${ctaUrl}" class="folding-feature-cta">${content.cta}</a>`;
  }

  html += '</div>';

  // Image section with responsive picture element
  if (hasImage) {
    html += `
      <div class="folding-feature-media">
        <picture>
          <source media="(max-width: 768px)" srcset="${mobileImage}">
          <img src="${desktopImage}" alt="${content.altTag || ''}" loading="lazy" class="folding-feature-image">
        </picture>
      </div>
    `;
  }

  html += '</div>';

  // Disclaimer
  if (content.disclaimer) {
    html += `<div class="folding-feature-disclaimer folding-feature-disclaimer--${styles.disclaimerAlignment}">${content.disclaimer}</div>`;
  }

  return html;
}

export default function decorate(block) {
  // Parse document structure
  const { styles, content } = parseDocumentRows(block);

  // Build class list
  const classList = buildClassList(styles);

  // Clear existing content
  block.textContent = '';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = classList;
  wrapper.innerHTML = createFoldingFeatureHTML(content, styles);

  block.appendChild(wrapper);
}
