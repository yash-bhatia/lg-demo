/**
 * Key Spec Block - Product specifications display in two-column layout
 *
 * Future API Structure:
 * [
 *   {
 *     leftLabel: "PICTURE (DISPLAY) - Display Type",
 *     leftValue: "4K OLED",
 *     rightLabel: "PICTURE (DISPLAY) - Refresh Rate",
 *     rightValue: "120Hz Native (VRR 144Hz)"
 *   },
 *   ...
 * ]
 */

/**
 * Hardcoded specification data
 */
const HARDCODED_SPEC_DATA = [
  {
    leftLabel: 'PICTURE (DISPLAY) - Display Type',
    leftValue: '4K OLED',
    rightLabel: 'PICTURE (DISPLAY) - Refresh Rate',
    rightValue: '120Hz Native (VRR 144Hz)',
  },
  {
    leftLabel: 'PICTURE (DISPLAY) - Wide Colour Gamut',
    leftValue: 'OLED Colour',
    rightLabel: 'PICTURE (PROCESSING) - Picture Processor',
    rightValue: 'a9 AI Processor 4K Gen8',
  },
  {
    leftLabel: 'PICTURE (PROCESSING) - HDR (High Dynamic Range)',
    leftValue: 'Dolby Vision / HDR10 / HLG',
    rightLabel: 'GAMING - G-Sync Compatible (Nvidia)',
    rightValue: 'Yes',
  },
  {
    leftLabel: 'GAMING - FreeSync Compatible (AMD)',
    leftValue: 'Yes',
    rightLabel: 'AUDIO - Audio Output',
    rightValue: '40W',
  },
  {
    leftLabel: 'AUDIO - Speaker System',
    leftValue: '2.2 channel',
    rightLabel: 'AUDIO - Dolby Atmos',
    rightValue: 'Yes',
  },
  {
    leftLabel: 'DIMENSIONS AND WEIGHTS - TV Dimensions without Stand (WxHxD)',
    leftValue: '1441 x 826 x 45.1',
    rightLabel: 'DIMENSIONS AND WEIGHTS - TV Weight without Stand',
    rightValue: '16.6',
  },
];

/**
 * Load data from API (future implementation)
 * @param {string} apiUrl - API endpoint URL
 * @returns {Promise<Array>} Array of specification objects
 */
async function loadDataFromAPI(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    const data = await response.json();
    // Expect API to return array of objects with leftLabel, leftValue, rightLabel, rightValue
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load key-spec data from API:', error);
    return null;
  }
}

/**
 * Create HTML for a single specification row
 * @param {Object} spec - Specification object
 * @param {number} index - Index of the spec (for conditional separators)
 * @param {number} total - Total number of specs
 * @returns {string} HTML string
 */
function createSpecRowHTML(spec, index, total) {
  const hasSeparator = index < total - 1 && (
    index === 0 || // After first row
    index === 2 || // After third row
    index === 4    // After fifth row
  );

  let html = '<div class="key-spec-row">';

  // Left column
  html += '<div class="key-spec-column">';
  if (spec.leftLabel && spec.leftValue) {
    html += `<div class="key-spec-item">`;
    html += `<div class="key-spec-label">${spec.leftLabel}</div>`;
    html += `<div class="key-spec-value">${spec.leftValue}</div>`;
    html += `</div>`;
  }
  html += '</div>';

  // Right column
  html += '<div class="key-spec-column">';
  if (spec.rightLabel && spec.rightValue) {
    html += `<div class="key-spec-item">`;
    html += `<div class="key-spec-label">${spec.rightLabel}</div>`;
    html += `<div class="key-spec-value">${spec.rightValue}</div>`;
    html += `</div>`;
  }
  html += '</div>';

  html += '</div>';

  // Add separator line if needed
  if (hasSeparator) {
    html += '<div class="key-spec-separator"></div>';
  }

  return html;
}

/**
 * Create the complete HTML structure
 * @param {Array} specs - Array of specification objects
 * @returns {string} HTML string
 */
function createKeySpecHTML(specs) {
  if (!specs || specs.length === 0) {
    return '<div class="key-spec-empty">No specifications available</div>';
  }

  let html = '<div class="key-spec-container">';
  html += '<div class="key-spec-header">';
  html += '<h2 class="key-spec-title">Key Spec</h2>';
  html += '<div class="key-spec-title-underline"></div>';
  html += '</div>';

  html += '<div class="key-spec-content">';
  specs.forEach((spec, index) => {
    html += createSpecRowHTML(spec, index, specs.length);
  });
  html += '</div>';

  html += '</div>';

  return html;
}

/**
 * Main decoration function
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  let specs = HARDCODED_SPEC_DATA;

  // Check if block has data attribute for API URL
  const apiUrl = block.dataset.apiUrl;

  if (apiUrl) {
    // Try to load from API, fallback to hardcoded if API fails
    const apiData = await loadDataFromAPI(apiUrl);
    if (apiData && apiData.length > 0) {
      specs = apiData;
    } else {
      console.log('Key Spec: API failed or returned no data, using hardcoded data');
    }
  }

  // Clear existing content
  block.textContent = '';

  // Create and append HTML
  const container = document.createElement('div');
  container.className = 'key-spec-wrapper';
  container.innerHTML = createKeySpecHTML(specs);

  block.appendChild(container);
}
