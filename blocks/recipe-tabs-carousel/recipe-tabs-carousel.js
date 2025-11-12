export default function decorate(block) {
    block.classList.add('recipe-tabs-carousel');
  
    const rows = [...block.children];
    if (rows.length === 0) return;
  
    // --- Extract Title + Subtitle ---
    const titleRow = rows.shift();
    const title = titleRow?.children?.[0]?.innerText?.trim() || '';
    const subtitle = titleRow?.children?.[1]?.innerText?.trim() || '';
  
    // --- Containers ---
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
  
    // --- Parse Tabs + Cards ---
    let currentTab = null;
    let currentCarousel = null;
  
    rows.forEach((row) => {
      const firstCellText = row.children?.[0]?.innerText?.trim() || '';
  
      if (firstCellText.toLowerCase() === 'tab') {
        const tabName = row.children?.[1]?.innerText?.trim() || 'Tab';
        const tabButton = document.createElement('button');
        tabButton.className = 'rtc__tab';
        tabButton.textContent = tabName;
  
        if (!currentTab) tabButton.classList.add('active'); // First tab active
        tabsContainer.appendChild(tabButton);
  
        currentTab = tabName;
  
        currentCarousel = document.createElement('div');
        currentCarousel.className = 'rtc__carousel';
        if (tabsContainer.children.length === 1) currentCarousel.classList.add('active');
  
        carouselsContainer.appendChild(currentCarousel);
  
        tabButton.addEventListener('click', () => {
          document.querySelectorAll('.rtc__tab').forEach((t) => t.classList.remove('active'));
          document.querySelectorAll('.rtc__carousel').forEach((c) => c.classList.remove('active'));
          tabButton.classList.add('active');
          currentCarousel.classList.add('active');
        });
      } else if (currentCarousel) {
        // Parse card data
        const cells = [...row.children];
        const imgEl = row.querySelector('img');
        const imgSrc = imgEl ? imgEl.src : '';
  
        const data = {};
        cells.forEach((cell) => {
          const txt = cell.innerText.trim();
          if (txt.startsWith('Overlay Title:')) data.overlayTitle = txt.replace('Overlay Title:', '').trim();
          if (txt.startsWith('Overlay Button:')) data.overlayButton = txt.replace('Overlay Button:', '').trim();
          if (txt.startsWith('Category:')) data.category = txt.replace('Category:', '').trim();
          if (txt.startsWith('Title:')) data.title = txt.replace('Title:', '').trim();
          if (txt.startsWith('Time:')) data.time = txt.replace('Time:', '').trim();
          if (txt.startsWith('Level:')) data.level = txt.replace('Level:', '').trim();
          if (txt.startsWith('Link:')) data.link = txt.replace('Link:', '').trim();
        });
  
        // Create card
        const card = document.createElement('div');
        card.className = 'rtc__card';
  
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'rtc__image';
        if (imgSrc) {
          const img = document.createElement('img');
          img.src = imgSrc;
          img.alt = data.title || '';
          imgWrapper.appendChild(img);
        }
  
        const overlay = document.createElement('div');
        overlay.className = 'rtc__overlay';
        if (data.overlayTitle) {
          const oTitle = document.createElement('p');
          oTitle.className = 'rtc__overlay-title';
          oTitle.textContent = data.overlayTitle;
          overlay.appendChild(oTitle);
        }
        if (data.overlayButton && data.link) {
          const btn = document.createElement('a');
          btn.href = data.link;
          btn.className = 'rtc__overlay-btn';
          btn.textContent = data.overlayButton;
          overlay.appendChild(btn);
        }
        imgWrapper.appendChild(overlay);
  
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
          const time = document.createElement('span');
          time.innerHTML = `⏱ ${data.time}`;
          meta.appendChild(time);
        }
        if (data.level) {
          const lvl = document.createElement('span');
          lvl.innerHTML = `👨‍🍳 ${data.level}`;
          meta.appendChild(lvl);
        }
  
        cardBody.appendChild(meta);
  
        card.appendChild(imgWrapper);
        card.appendChild(cardBody);
        currentCarousel.appendChild(card);
      }
    });
  
    wrapper.appendChild(tabsContainer);
    wrapper.appendChild(carouselsContainer);
    block.innerHTML = '';
    block.appendChild(wrapper);
  
    // --- Add Navigation Arrows ---
    document.querySelectorAll('.rtc__carousel').forEach((carousel) => {
      const prev = document.createElement('button');
      prev.className = 'rtc__nav rtc__prev';
      prev.textContent = '←';
      const next = document.createElement('button');
      next.className = 'rtc__nav rtc__next';
      next.textContent = '→';
      carousel.parentElement.append(prev, next);
  
      let scrollPos = 0;
      const cardWidth = carousel.querySelector('.rtc__card')?.offsetWidth || 300;
  
      prev.addEventListener('click', () => {
        scrollPos = Math.max(0, scrollPos - cardWidth - 24);
        carousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        scrollPos = Math.min(carousel.scrollWidth, scrollPos + cardWidth + 24);
        carousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
      });
    });
  }
  