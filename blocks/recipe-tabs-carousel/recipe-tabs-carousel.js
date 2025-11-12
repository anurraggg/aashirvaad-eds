export default function decorate(block) {
    console.log('✅ Recipe Tabs Carousel (robust) loaded');
    block.classList.add('recipe-tabs-carousel');
  
    // collect children as rows (EDS flattens to divs)
    const rows = [...block.children];
    if (rows.length === 0) return;
  
    // Title row detection: first row -> title & subtitle
    const titleRow = rows.shift();
    const title = titleRow?.children?.[0]?.innerText?.trim() || '';
    const subtitle = titleRow?.children?.[1]?.innerText?.trim() || '';
  
    // build main layout
    const wrapper = document.createElement('div');
    wrapper.className = 'rtc__wrapper';
  
    if (title || subtitle) {
      const header = document.createElement('div');
      header.className = 'rtc__header';
      if (title) {
        const h2 = document.createElement('h2');
        h2.textContent = title;
        header.appendChild(h2);
      }
      if (subtitle) {
        const p = document.createElement('p');
        p.textContent = subtitle;
        header.appendChild(p);
      }
      wrapper.appendChild(header);
    }
  
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'rtc__tabs';
    const carouselsContainer = document.createElement('div');
    carouselsContainer.className = 'rtc__carousels';
  
    wrapper.appendChild(tabsContainer);
    wrapper.appendChild(carouselsContainer);
    block.innerHTML = '';
    block.appendChild(wrapper);
  
    let currentCarousel = null;
  
    // helper: parse a row into data object (robust)
    function parseRow(row) {
      const imgEl = row.querySelector('img');
      const imgSrc = imgEl ? imgEl.src : '';
  
      // full text of row (all cells) to search for labeled fields
      const fullText = [...row.querySelectorAll('div, p, span')]
        .map(n => n.innerText || '')
        .join('\n')
        .replace(/\r/g, '')
        .trim();
  
      // regex getter
      const getLabel = (label) => {
        const re = new RegExp(label.replace(/\s+/g, '\\s*') + '\\s*:\\s*(.+)', 'i');
        const m = fullText.match(re);
        return m ? m[1].trim() : null;
      };
  
      const data = {
        overlayTitle: getLabel('Overlay Title') || getLabel('OverlayTitle') || null,
        overlayButton: getLabel('Overlay Button') || getLabel('OverlayButton') || null,
        category: getLabel('Category') || null,
        title: getLabel('Title') || null,
        time: getLabel('Time') || null,
        level: getLabel('Level') || null,
        link: getLabel('Link') || null,
        img: imgSrc,
      };
  
      // fallback: if no labeled fields found, fall back to ordered lines parse
      const anyLabeled = Object.keys(data).some(k => (k === 'img') ? false : !!data[k]);
      if (!anyLabeled) {
        const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
        // map fallback positions:
        // [0] Overlay Title, [1] Overlay Button, [2] Category, [3] Title, [4] Time, [5] Level, [6] Link
        if (lines.length) data.overlayTitle = data.overlayTitle || lines[0] || null;
        if (lines.length > 1) data.overlayButton = data.overlayButton || lines[1] || null;
        if (lines.length > 2) data.category = data.category || lines[2] || null;
        if (lines.length > 3) data.title = data.title || lines[3] || null;
        if (lines.length > 4) data.time = data.time || lines[4] || null;
        if (lines.length > 5) data.level = data.level || lines[5] || null;
        if (lines.length > 6) data.link = data.link || lines[6] || null;
      }
  
      return data;
    }
  
    // parse rows -> tabs + cards
    rows.forEach((row) => {
      const firstColText = row.children?.[0]?.innerText?.trim()?.toLowerCase() || '';
  
      if (firstColText === 'tab') {
        // new tab
        const tabName = row.children?.[1]?.innerText?.trim() || 'Tab';
        const tabButton = document.createElement('button');
        tabButton.className = 'rtc__tab';
        tabButton.textContent = tabName;
        if (!tabsContainer.querySelector('.rtc__tab')) tabButton.classList.add('active');
        tabsContainer.appendChild(tabButton);
  
        // create a new carousel container for this tab
        currentCarousel = document.createElement('div');
        currentCarousel.className = 'rtc__carousel';
        if (!carouselsContainer.querySelector('.rtc__carousel')) currentCarousel.classList.add('active');
        carouselsContainer.appendChild(currentCarousel);
  
        // tab click handler
        tabButton.addEventListener('click', () => {
          tabsContainer.querySelectorAll('.rtc__tab').forEach(t => t.classList.remove('active'));
          carouselsContainer.querySelectorAll('.rtc__carousel').forEach(c => c.classList.remove('active'));
          tabButton.classList.add('active');
          currentCarousel.classList.add('active');
        });
      } else if (currentCarousel) {
        // recipe card row for current tab
        const data = parseRow(row);
        console.log('Parsed recipe:', data);
  
        // create card markup
        const card = document.createElement('div');
        card.className = 'rtc__card';
  
        // image wrapper
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'rtc__image';
        if (data.img) {
          const img = document.createElement('img');
          img.src = data.img;
          img.alt = data.title || '';
          img.loading = 'lazy';
          imgWrapper.appendChild(img);
        }
  
        // overlay (only overlayTitle + overlayButton)
        const overlay = document.createElement('div');
        overlay.className = 'rtc__overlay';
        if (data.overlayTitle) {
          const oTitle = document.createElement('p');
          oTitle.className = 'rtc__overlay-title';
          oTitle.textContent = data.overlayTitle;
          overlay.appendChild(oTitle);
        }
        if (data.overlayButton) {
          // only add button if link exists
          const btn = document.createElement('a');
          btn.className = 'rtc__overlay-btn';
          btn.textContent = data.overlayButton;
          if (data.link) {
            btn.href = data.link;
            btn.setAttribute('target', '_self');
          } else {
            // no link: make it a non-clickable span-looking button
            btn.removeAttribute('href');
          }
          overlay.appendChild(btn);
        }
        imgWrapper.appendChild(overlay);
  
        // card body (below image) -> category / title / meta
        const cardBody = document.createElement('div');
        cardBody.className = 'rtc__body';
  
        if (data.category) {
          const cat = document.createElement('p');
          cat.className = 'rtc__category';
          cat.textContent = data.category;
          cardBody.appendChild(cat);
        }
  
        if (data.title) {
          const h3 = document.createElement('h3');
          h3.textContent = data.title;
          cardBody.appendChild(h3);
        }
  
        const meta = document.createElement('div');
        meta.className = 'rtc__meta';
        if (data.time) {
          const s = document.createElement('span');
          s.className = 'rtc__meta-item';
          s.innerHTML = `⏱ ${data.time}`;
          meta.appendChild(s);
        }
        if (data.level) {
          const s2 = document.createElement('span');
          s2.className = 'rtc__meta-item';
          s2.innerHTML = `👨‍🍳 ${data.level}`;
          meta.appendChild(s2);
        }
        cardBody.appendChild(meta);
  
        // assemble and append to current carousel
        card.appendChild(imgWrapper);
        card.appendChild(cardBody);
        currentCarousel.appendChild(card);
      } else {
        // row before any tab - ignore or log
        console.warn('Row found before first Tab — ignored:', row);
      }
    });
  
    // add navigation arrows per carousel (arrow placed next to carouselsContainer)
    carouselsContainer.querySelectorAll('.rtc__carousel').forEach((carousel) => {
      const wrapperBox = document.createElement('div');
      wrapperBox.className = 'rtc__carousel-wrap';
      carousel.parentElement.insertBefore(wrapperBox, carousel);
      wrapperBox.appendChild(carousel);
  
      const prev = document.createElement('button');
      prev.className = 'rtc__nav rtc__prev';
      prev.textContent = '←';
  
      const next = document.createElement('button');
      next.className = 'rtc__nav rtc__next';
      next.textContent = '→';
  
      wrapperBox.appendChild(prev);
      wrapperBox.appendChild(next);
  
      // compute card width on demand
      function getCardWidth() {
        const card = carousel.querySelector('.rtc__card');
        return card ? (card.offsetWidth + parseInt(getComputedStyle(carousel).gap || 24)) : 320;
      }
  
      let scrollPos = 0;
      prev.addEventListener('click', () => {
        const w = getCardWidth();
        scrollPos = Math.max(0, scrollPos - w);
        carousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        const w = getCardWidth();
        scrollPos = Math.min(carousel.scrollWidth - carousel.clientWidth, scrollPos + w);
        carousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
      });
  
      // reset scrollPos when tab becomes active
      carousel.addEventListener('scroll', () => {
        scrollPos = carousel.scrollLeft;
      });
    });
  
    // final append already done above
    console.log('Recipe Tabs Carousel ready');
  }
  