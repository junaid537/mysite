import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

// document.addEventListener('DOMContentLoaded', () => {
//   if (window.location.pathname === '/about') {
//     setTimeout(() => {
//       const images = document.querySelectorAll('.cards-card-image img');
//       images.forEach((img) => {
//         img.style.setProperty('border-radius', '50%', 'important');
//         img.style.setProperty('object-fit', 'cover', 'important');
//         img.style.setProperty('width', '200px', 'important');
//         img.style.setProperty('height', '200px', 'important');
//       });
//     }, 300); // delay in ms — adjust if needed
//   }
// });
// function applyCircularCardImages() {
//   const images = document.querySelectorAll('.cards-card-image img');
//   if (images.length > 0) {
//     images.forEach((img) => {
//       img.style.setProperty('border-radius', '50%', 'important');
//       img.style.setProperty('object-fit', 'cover', 'important');
//       img.style.setProperty('width', '200px', 'important');
//       img.style.setProperty('height', '200px', 'important');
//     });
//   } else {
//     setTimeout(applyCircularCardImages, 100); // check again in 100ms
//   }
// }

// document.addEventListener('DOMContentLoaded', () => {
//   if (window.location.pathname === '/about') {
//     applyCircularCardImages();
//   }
// });
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function applyCircularCardImages() {
  const images = document.querySelectorAll('.cards-card-image img');
  const names = document.querySelectorAll('.cards h3');
  const roles = document.querySelectorAll('.cards h3 + *');
  if (images.length > 0 && names.length > 0) {
    // Apply circular styling to profile images
    images.forEach((img) => {
      img.style.setProperty('border-radius', '50%', 'important');
      img.style.setProperty('object-fit', 'cover', 'important');
      img.style.setProperty('width', '200px', 'important');
      img.style.setProperty('height', '200px', 'important');
    });

    // Apply styling and title case to h3 names
    names.forEach((h3) => {
      h3.textContent = toTitleCase(h3.textContent);

      h3.style.setProperty('font-family', 'Asar, Georgia, "Times New Roman", Times, serif', 'important');
      h3.style.setProperty('font-weight', 'normal', 'important');
      h3.style.setProperty('font-size', '24px', 'important');
      h3.style.setProperty('margin-top', '1rem', 'important');
      h3.style.setProperty('margin-bottom', '0.25rem', 'important');
      h3.style.setProperty('color', '#000', 'important');
      h3.style.setProperty('text-transform', 'none', 'important'); // ✅ override uppercase CSS
    });

  } else {
    setTimeout(applyCircularCardImages, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/about') {
    applyCircularCardImages();
  }
});

// const tryInsertSearchBox = () => {
//   const searchIconSpan = document.querySelector(
//     'header .section.nav-tools .default-content-wrapper .icon-search'
//   );

//   if (searchIconSpan) {
//     const input = document.createElement('input');
//     input.type = 'text';
//     input.placeholder = 'Search...';
//     input.style.marginLeft = '10px';
//     input.style.padding = '5px';
//     input.style.borderRadius = '4px';
//     input.style.border = '1px solid #ccc';
//     input.style.fontSize = '14px';

//     console.log("✅ Search icon found and input created");

//     searchIconSpan.parentNode.insertBefore(input, searchIconSpan.nextSibling);
//     clearInterval(intervalId); // stop checking once it's done
//   } else {
//     console.log("⏳ Still waiting for search icon...");
//   }
// };

// // Retry every 200ms until element is found
// const intervalId = setInterval(tryInsertSearchBox, 200);
//******************************************************** 
// const tryInsertSearchBox = () => {
//   const searchIconSpan = document.querySelector(
//     'header .section.nav-tools .default-content-wrapper .icon-search'
//   );

//   if (searchIconSpan) {
//     const input = document.createElement('input');
//     input.type = 'text';
//     input.placeholder = 'Search...';

//     // 🔧 Refined styling
//     input.style.marginLeft = '8px';
//     input.style.padding = '4px 8px';         // Less padding for tighter look
//     input.style.height = '28px';             // Adjust height to match nav size
//     input.style.borderRadius = '4px';
//     input.style.border = '1px solid #ccc';
//     input.style.fontSize = '14px';
//     input.style.lineHeight = '1';            // Prevent extra vertical space
//     input.style.verticalAlign = 'middle';    // Align with icon
//     input.style.boxSizing = 'border-box';

//     console.log("✅ Search icon found and input created");

//     searchIconSpan.parentNode.insertBefore(input, searchIconSpan.nextSibling);
//     clearInterval(intervalId);
//   } else {
//     console.log("⏳ Still waiting for search icon...");
//   }
// };

// // Keep trying every 200ms
// const intervalId = setInterval(tryInsertSearchBox, 200);





const tryInsertSearchBox = () => {
  const searchIconSpan = document.querySelector(
    'header .section.nav-tools .default-content-wrapper .icon-search'
  );

  if (searchIconSpan) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search...';
    input.id = 'search-input';

    // Style input
    Object.assign(input.style, {
      marginLeft: '8px',
      padding: '4px 8px',
      height: '28px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
      lineHeight: '1',
      verticalAlign: 'middle',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: '998',
    });

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'search-dropdown';
    Object.assign(dropdown.style, {
      position: 'absolute',
      background: '#fff',
      border: '1px solid #ccc',
      maxHeight: '200px',
      overflowY: 'auto',
      width: '220px',
      zIndex: '999',
      display: 'none',
    });
    document.body.appendChild(dropdown);

    let dataset = [];
    let hasFetched = false;

    // On typing
    input.addEventListener('input', async () => {
      const query = input.value.trim().toLowerCase();

      if (!query) {
        dropdown.style.display = 'none';
        return;
      }

      // Fetch only once on first valid input
      if (!hasFetched) {
        try {
          const res = await fetch('https://main--mysite--junaid537.aem.live/query-index.json');
          const json = await res.json();
          dataset = json.data || [];
          hasFetched = true;
        } catch (err) {
          console.error('❌ Fetch failed:', err);
          return;
        }
      }

      const matches = dataset.filter(item =>
        Object.values(item).some(
          val => val && val.toLowerCase().includes(query)
        )
      );

      if (matches.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      dropdown.innerHTML = '';
      matches.slice(0, 10).forEach(item => {
        const div = document.createElement('div');
        div.textContent = item.image || item.title || item.description || item.path;
        Object.assign(div.style, {
          padding: '8px',
          cursor: 'pointer',
        });
        div.onmouseenter = () => div.style.background = '#f0f0f0';
        div.onmouseleave = () => div.style.background = '';
        div.onclick = () => window.location.href = item.path;
        dropdown.appendChild(div);
      });

      const rect = input.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + window.scrollY}px`;
      dropdown.style.left = `${rect.left + window.scrollX}px`;
      dropdown.style.display = 'block';
    });

    // Hide dropdown if clicked outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== input) {
        dropdown.style.display = 'none';
      }
    });

    searchIconSpan.parentNode.insertBefore(input, searchIconSpan.nextSibling);
    clearInterval(intervalId);
    console.log("✅ Search input ready");
  } else {
    console.log("⏳ Waiting for search icon...");
  }
};

const intervalId = setInterval(tryInsertSearchBox, 200);
