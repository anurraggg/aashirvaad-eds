export default function decorate(block) {
    block.classList.add('promo-banner');
  
    const rows = [...block.children];
    if (rows.length === 0) return;
  
    // Get content from Google Doc table or divs
    const cells = [...rows[0].children];
    const bgImgEl = block.querySelector('img');
    const bgImgSrc = bgImgEl ? bgImgEl.src : '';
  
    const title = cells[1]?.innerText?.trim() || '';
    const desc = cells[2]?.innerText?.trim() || '';
    const buttonText = cells[3]?.innerText?.trim() || '';
    const buttonLink = cells[4]?.innerText?.trim() || '#';
  
    // Build HTML
    const wrapper = document.createElement('div');
    wrapper.className = 'promo-banner__wrapper';
    if (bgImgSrc) wrapper.style.backgroundImage = `url('${bgImgSrc}')`;
  
    const overlay = document.createElement('div');
    overlay.className = 'promo-banner__overlay';
  
    const content = document.createElement('div');
    content.className = 'promo-banner__content';
  
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title;
      content.appendChild(h2);
    }
  
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.appendChild(p);
    }
  
    if (buttonText) {
      const a = document.createElement('a');
      a.textContent = buttonText;
      a.href = buttonLink;
      a.className = 'promo-banner__btn';
      content.appendChild(a);
    }
  
    overlay.appendChild(content);
    wrapper.appendChild(overlay);
  
    block.innerHTML = '';
    block.appendChild(wrapper);
  }
  