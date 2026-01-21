/**
 * Text Block - Configurable text component with document-based styling
 *
 * Document Structure (in Word/Google Docs):
 * ┌─────────────────────┬─────────────────────────────────────────────────┐
 * │ text                │                                                 │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Block Type          │ Disclaimer                                      │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Text Alignment      │ Left                                            │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Width               │ 1440                                            │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Background          │ Default                                         │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Margin Top          │ No                                              │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Margin Bottom       │ Yes                                             │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Border              │ None                                            │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Headline            │ Your headline text here                         │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Body                │ Your body copy text here                        │
 * ├─────────────────────┼─────────────────────────────────────────────────┤
 * │ Disclaimer          │ *Your disclaimer text here                      │
 * └─────────────────────┴─────────────────────────────────────────────────┘
 *
 * Style Options:
 *   Block Type:      Default, Disclaimer, Announcement
 *   Text Alignment:  Left, Center, Right
 *   Width:           Full, 1440, 1200, 960
 *   Background:      Default, Light, Dark, Black, White, Red/Brand
 *   Margin Top:      Yes, No
 *   Margin Bottom:   Yes, No
 *   Border:          Yes, None
 *
 * Content Rows (all optional):
 *   Headline:        Main heading (H2)
 *   Body:            Body copy paragraph
 *   Disclaimer:      Small disclaimer text
 */

/**
 * Parse styles and content from document rows
 * @param {HTMLElement} block
 * @returns {Object} parsed data with styles and content
 */
function parseDocumentRows(block) {
  const styles = {
    blockType: 'default',
    alignment: 'left',
    width: 'full',
    background: 'default',
    marginTop: false,
    marginBottom: false,
    border: false,
  };

  const content = {
    headline: '',
    body: '',
    disclaimer: '',
  };

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const label = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cols[1].textContent.trim().toLowerCase();
      const htmlValue = cols[1].innerHTML.trim();

      // Parse style rows
      switch (label) {
        case 'blocktype':
          if (value === 'disclaimer') styles.blockType = 'disclaimer';
          else if (value === 'announcement') styles.blockType = 'announcement';
          else styles.blockType = 'default';
          break;
        case 'textalignment':
        case 'alignment':
          if (value === 'center') styles.alignment = 'center';
          else if (value === 'right') styles.alignment = 'right';
          else styles.alignment = 'left';
          break;
        case 'width':
          if (value === '1440' || value === '1440px') styles.width = '1440';
          else if (value === '1200' || value === '1200px') styles.width = '1200';
          else if (value === '960' || value === '960px') styles.width = '960';
          else styles.width = 'full';
          break;
        case 'background':
        case 'backgroundcolor':
          if (value === 'light' || value === 'grey' || value === 'gray') styles.background = 'light';
          else if (value === 'dark') styles.background = 'dark';
          else if (value === 'black') styles.background = 'black';
          else if (value === 'white') styles.background = 'white';
          else if (value === 'red' || value === 'brand') styles.background = 'brand';
          else styles.background = 'default';
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
        // Parse content rows
        case 'headline':
          content.headline = htmlValue;
          break;
        case 'body':
          content.body = htmlValue;
          break;
        case 'disclaimer':
          content.disclaimer = htmlValue;
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
  const classes = ['text-block-container'];

  classes.push(`text-block--${styles.blockType}`);
  classes.push(`text-block--align-${styles.alignment}`);
  classes.push(`text-block--width-${styles.width}`);
  classes.push(`text-block--bg-${styles.background}`);

  if (styles.marginTop) classes.push('text-block--margin-top');
  if (styles.marginBottom) classes.push('text-block--margin-bottom');
  if (styles.border) classes.push('text-block--border');

  return classes.join(' ');
}

/**
 * Create text block HTML
 * @param {Object} content
 * @param {Object} styles
 * @returns {string} HTML string
 */
function createTextBlockHTML(content, styles) {
  const hasHeadline = content.headline.length > 0;
  const hasBody = content.body.length > 0;
  const hasDisclaimer = content.disclaimer.length > 0;

  let html = '<div class="text-block-inner">';

  if (hasHeadline) {
    html += `
      <div class="text-block-headline">
        <h2>${content.headline}</h2>
      </div>
    `;
  }

  if (hasBody) {
    html += `
      <div class="text-block-body">
        ${content.body}
      </div>
    `;
  }

  if (hasDisclaimer) {
    html += `
      <div class="text-block-disclaimer">
        <p>${content.disclaimer}</p>
      </div>
    `;
  }

  html += '</div>';

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
  container.innerHTML = createTextBlockHTML(content, styles);

  // Append to block
  block.appendChild(container);
}
