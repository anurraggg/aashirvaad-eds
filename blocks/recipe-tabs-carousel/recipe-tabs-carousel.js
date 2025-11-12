export default function decorate(block) {
    console.log('✅ recipe-tabs-carousel: decorate() start');
    if (!block) return;
    block.classList.add('recipe-tabs-carousel');
  
    // Collect rows
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
  
    block.innerHTML = '';
    block.appendChild(wrapper);
  
    // Helper: parse row data
    function parseRowContent(row) {
      const imgEl = row.querySelector('img');
      const img = imgEl ? (imgEl.src || '') : '';
      const texts = [...row.querySelectorAll('div, p, span')]
        .map(n => (n.innerText || '').trim())
        .filter(Boolean);
      const fullText = texts.join('\n');
  
      const getLabel = (label) => {
        const re = new RegExp(label.replace(/\s+/g, '\\s*') + '\\s*:\\s*(.+)', 'i');
        const m = fullText.match(re);
        return m ? m[1].trim() : null;
      };
  
      const data = {
        img,
        overlayTitle: getLabel('Overlay Title') || null,
        overlayButton: getLabel('Overlay Button') || null,
        category: getLabel('Category') || null,
        title: getLabel('Title') || null,
        time: getLabel('Time') || null,
        level: getLabel('Level') || null,
        link: getLabel('Link') || null,
        rawLines: texts
      };
  
      const anyLabelFound = ['overlayTitle','overlayButton','category','title','time','level','link']
        .some(k => !!data[k]);
      if (!anyLabelFound && data.rawLines.length) {
        const L = data.rawLines;
        data.overlayTitle = L[0] || null;
        data.overlayButton = L[1] || null;
        data.category = L[2] || null;
        data.title = L[3] || null;
        data.time = L[4] || null;
        data.level = L[5] || null;
        data.link = L[6] || null;
      }
      return data;
    }
  
    // --- Build tabs + carousels ---
    const tabsArray = [];
    const carouselsArray = [];
    let activeCarousel = null;
  
    rows.forEach((row) => {
      const firstCol = (row.children?.[0]?.innerText || '').trim().toLowerCase();
  
      if (firstCol === 'tab') {
        const tabName = (row.children?.[1]?.innerText || 'Tab').trim();
        const tabBtn = document.createElement('button');
        tabBtn.className = 'rtc__tab';
        tabBtn.type = 'button';
        tabBtn.textContent = tabName;
        tabsContainer.appendChild(tabBtn);
        tabsArray.push(tabBtn);
  
        const carouselWrap = document.createElement('div');
        carouselWrap.className = 'rtc__carousel-wrap';
        const carousel = document.createElement('div');
        carousel.className = 'rtc__carousel';
        carouselWrap.appendChild(carousel);
        carouselsContainer.appendChild(carouselWrap);
        carouselsArray.push(carousel);
        activeCarousel = carousel;
      } else if (activeCarousel) {
        const data = parseRowContent(row);
        const card = document.createElement('div');
        card.className = 'rtc__card';
  
        const imgWrap = document.createElement('div');
        imgWrap.className = 'rtc__image';
        if (data.img) {
          const img = document.createElement('img');
          img.src = data.img;
          img.alt = data.title || '';
          img.loading = 'lazy';
          imgWrap.appendChild(img);
        }
  
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
          }
          overlay.appendChild(btn);
        }
        imgWrap.appendChild(overlay);
  
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
  
        card.appendChild(imgWrap);
        card.appendChild(body);
        activeCarousel.appendChild(card);
      }
    });
  
    if (!tabsArray.length || !carouselsArray.length) {
      console.warn('recipe-tabs-carousel: no tabs/carousels created.');
      return;
    }
  
    // --- Add navigation arrows ---
    carouselsArray.forEach((carousel, index) => {
      const wrap = carousel.parentElement;
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'rtc__nav rtc__prev';
      prev.textContent = '←';
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'rtc__nav rtc__next';
      next.textContent = '→';
      wrap.appendChild(prev);
      wrap.appendChild(next);
  
      const getScrollStep = () => {
        const card = carousel.querySelector('.rtc__card');
        const gap = parseInt(getComputedStyle(carousel).gap || 24, 10) || 24;
        return card ? (card.offsetWidth + gap) : 320;
      };
  
      prev.addEventListener('click', () => {
        const activeCarousel = carouselsArray.find(c => c.classList.contains('active'));
        if (activeCarousel === carousel) {
          activeCarousel.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        }
      });
  
      next.addEventListener('click', () => {
        const activeCarousel = carouselsArray.find(c => c.classList.contains('active'));
        if (activeCarousel === carousel) {
          activeCarousel.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        }
      });
    });
  
    // --- Tab switching ---
    function setActiveTab(index) {
      tabsArray.forEach((t, i) => t.classList.toggle('active', i === index));
      carouselsArray.forEach((c, i) => {
        c.classList.toggle('active', i === index);
        c.style.opacity = i === index ? '1' : '0';
        c.style.visibility = i === index ? 'visible' : 'hidden';
        c.style.transform = i === index ? 'translateY(0)' : 'translateY(10px)';
      });
    }
  
    setActiveTab(0);
  
    tabsArray.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        if (!tab.classList.contains('active')) {
          setActiveTab(i);
          const carousel = carouselsArray[i];
          if (carousel) carousel.scrollTo({ left: 0, behavior: 'smooth' });
        }
      });
    });
  
    // --- Overlay button click handling ---
    block.querySelectorAll('.rtc__overlay-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const href = btn.getAttribute('href');
        if (href) window.location.href = href;
      });
    });
  
    console.log('✅ recipe-tabs-carousel: build complete', { tabs: tabsArray.length, carousels: carouselsArray.length });
  }
  