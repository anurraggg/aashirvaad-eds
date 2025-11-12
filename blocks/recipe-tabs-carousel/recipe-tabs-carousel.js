export default function decorate(block) {
    console.log('✅ recipe-tabs-carousel: decorate() start');
    if (!block) return;
    block.classList.add('recipe-tabs-carousel');
  
    // Collect rows (EDS often flattens tables into divs)
    const rows = [...block.children];
    if (rows.length === 0) {
      console.warn('recipe-tabs-carousel: no rows found.');
      return;
    }
  
    // --- Title & subtitle (first row) ---
    const titleRow = rows.shift();
    const title = (titleRow?.children?.[0]?.innerText || '').trim();
    const subtitle = (titleRow?.children?.[1]?.innerText || '').trim();
  
    // --- Create main structure ---
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
  
    // replace block content with our wrapper
    block.innerHTML = '';
    block.appendChild(wrapper);
  
    // Helper: robust row parser
    function parseRowContent(row) {
      // image src (if any)
      const imgEl = row.querySelector('img');
      const img = imgEl ? (imgEl.src || '') : '';
  
      // gather text nodes inside row (div, p, span) to a single string
      const texts = [...row.querySelectorAll('div, p, span')]
        .map(n => (n.innerText || '').trim())
        .filter(Boolean);
      const fullText = texts.join('\n');
  
      // attempt to extract labeled fields
      const getLabel = (label) => {
        const re = new RegExp(label.replace(/\s+/g, '\\s*') + '\\s*:\\s*(.+)', 'i');
        const m = fullText.match(re);
        return m ? m[1].trim() : null;
      };
  
      const data = {
        img,
        overlayTitle: getLabel('Overlay Title') || getLabel('OverlayTitle') || null,
        overlayButton: getLabel('Overlay Button') || getLabel('OverlayButton') || null,
        category: getLabel('Category') || null,
        title: getLabel('Title') || null,
        time: getLabel('Time') || null,
        level: getLabel('Level') || null,
        link: getLabel('Link') || null,
        // keep the raw lines as fallback
        rawLines: texts
      };
  
      // Fallback mapping if no labeled fields exist
      const anyLabelFound = ['overlayTitle','overlayButton','category','title','time','level','link']
        .some(k => !!data[k]);
      if (!anyLabelFound && data.rawLines.length) {
        // map ordered lines to fields (best-effort)
        const L = data.rawLines;
        data.overlayTitle = data.overlayTitle || L[0] || null;
        data.overlayButton = data.overlayButton || L[1] || null;
        data.category = data.category || L[2] || null;
        data.title = data.title || L[3] || null;
        data.time = data.time || L[4] || null;
        data.level = data.level || L[5] || null;
        data.link = data.link || L[6] || null;
      }
  
      return data;
    }
  
    // Build tabs + carousels
    const tabsArray = [];
    const carouselsArray = [];
    let activeCarousel = null;
  
    rows.forEach((row) => {
      const firstCol = (row.children?.[0]?.innerText || '').trim().toLowerCase();
  
      if (firstCol === 'tab') {
        // new tab
        const tabName = (row.children?.[1]?.innerText || 'Tab').trim();
        const tabBtn = document.createElement('button');
        tabBtn.className = 'rtc__tab';
        tabBtn.type = 'button';
        tabBtn.textContent = tabName;
        tabsContainer.appendChild(tabBtn);
        tabsArray.push(tabBtn);
  
        // create carousel for this tab
        const carousel = document.createElement('div');
        carousel.className = 'rtc__carousel';
        // wrap carousel for arrows positioning
        const carouselWrap = document.createElement('div');
        carouselWrap.className = 'rtc__carousel-wrap';
        carouselWrap.appendChild(carousel);
        carouselsContainer.appendChild(carouselWrap);
        carouselsArray.push(carousel);
  
        // set active for first tab later
        activeCarousel = carousel;
  
        // click handler will be attached after all built
      } else {
        // card row — must have current carousel
        if (!activeCarousel) {
          // ignore rows before first 'Tab'
          console.warn('recipe-tabs-carousel: card row before first "Tab" row - ignored.');
          return;
        }
        const data = parseRowContent(row);
        // build card
        const card = document.createElement('div');
        card.className = 'rtc__card';
  
        // image wrapper
        const imgWrap = document.createElement('div');
        imgWrap.className = 'rtc__image';
        if (data.img) {
          const img = document.createElement('img');
          img.src = data.img;
          img.alt = data.title || '';
          img.loading = 'lazy';
          imgWrap.appendChild(img);
        }
  
        // overlay (only overlayTitle + overlayButton)
        const overlay = document.createElement('div');
        overlay.className = 'rtc__overlay';
        if (data.overlayTitle) {
          const oT = document.createElement('p');
          oT.className = 'rtc__overlay-title';
          oT.textContent = data.overlayTitle;
          overlay.appendChild(oT);
        }
        if (data.overlayButton) {
          const btn = document.createElement('a');
          btn.className = 'rtc__overlay-btn';
          btn.textContent = data.overlayButton;
          if (data.link) {
            btn.href = data.link;
            btn.setAttribute('target', '_self');
          } else {
            // if no link, make it non-clickable but keep style
            btn.removeAttribute('href');
          }
          overlay.appendChild(btn);
        }
        imgWrap.appendChild(overlay);
  
        // body
        const body = document.createElement('div');
        body.className = 'rtc__body';
        if (data.category) {
          const cat = document.createElement('p');
          cat.className = 'rtc__category';
          cat.textContent = data.category;
          body.appendChild(cat);
        }
        if (data.title) {
          const h3 = document.createElement('h3');
          h3.textContent = data.title;
          body.appendChild(h3);
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
        body.appendChild(meta);
  
        // assemble card
        card.appendChild(imgWrap);
        card.appendChild(body);
  
        // append to active carousel
        activeCarousel.appendChild(card);
      }
    });
  
    // If no tabs were created, abort
    if (!tabsArray.length || !carouselsArray.length) {
      console.warn('recipe-tabs-carousel: no tabs/carousels created.');
      return;
    }
  
    // Add arrows and attach nav handlers for each carousel
    carouselsArray.forEach((carousel) => {
      const wrap = carousel.parentElement; // .rtc__carousel-wrap
      // create prev / next
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'rtc__nav rtc__prev';
      prev.textContent = '←';
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'rtc__nav rtc__next';
      next.textContent = '→';
  
      // position arrows inside wrapper
      wrap.appendChild(prev);
      wrap.appendChild(next);
  
      // compute scroll distance on each click based on card width
      function getScrollStep() {
        const card = carousel.querySelector('.rtc__card');
        const gap = parseInt(getComputedStyle(carousel).gap || 24, 10) || 24;
        return card ? (card.offsetWidth + gap) : 320;
      }
  
      prev.addEventListener('click', () => {
        const step = getScrollStep();
        carousel.scrollBy({ left: -step, behavior: 'smooth' });
      });
  
      next.addEventListener('click', () => {
        const step = getScrollStep();
        carousel.scrollBy({ left: step, behavior: 'smooth' });
      });
    });
  
    // --- Tab switching logic (use arrays so indexes match) ---
    // activate first tab/carousel by default
    function setActiveTab(index) {
      tabsArray.forEach((t, i) => {
        if (i === index) t.classList.add('active'); else t.classList.remove('active');
      });
      carouselsArray.forEach((c, i) => {
        if (i === index) {
          c.classList.add('active');
          c.style.opacity = '1';
          c.style.visibility = 'visible';
          c.style.transform = 'translateY(0)';
          c.parentElement.style.zIndex = '5';
        } else {
          c.classList.remove('active');
          c.style.opacity = '0';
          c.style.visibility = 'hidden';
          c.style.transform = 'translateY(10px)';
          c.parentElement.style.zIndex = '1';
        }
      });
    }
  
    setActiveTab(0);
  
    tabsArray.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('active')) return;
        setActiveTab(i);
        // reset scroll position of newly activated carousel
        const carousel = carouselsArray[i];
        if (carousel) carousel.scrollTo({ left: 0, behavior: 'smooth' });
      });
    });
  
    // ensure overlay buttons are clickable and open link (but not whole card)
    block.querySelectorAll('.rtc__overlay-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // if it has an href we allow it; stop propagation so card-level handlers (if any) won't catch
        e.stopPropagation();
        const href = btn.getAttribute('href');
        if (href) {
          // open in same tab (consistent with earlier behavior)
          window.location.href = href;
        }
      });
    });
  
    console.log('✅ recipe-tabs-carousel: build complete', { tabs: tabsArray.length, carousels: carouselsArray.length });
  }
  