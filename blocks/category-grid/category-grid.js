export default function decorate(block) {
    block.classList.add('category-grid');
  
    // Get all rows (div-based EDS structure)
    const rows = [...block.children];
    if (rows.length === 0) return;
  
    // --- Detect Title ---
    let titleText = '';
    const firstRow = rows[0];
    const firstCell = firstRow.querySelector('div, p');
    const maybeImage = firstRow.querySelector('img');
  
    // If first row has no image, treat it as title
    if (firstCell && !maybeImage && firstCell.textContent.trim()) {
      titleText = firstCell.textContent.trim();
      firstRow.remove(); // safely remove title row
    }
  
    // --- Create wrapper for items ---
    const wrapper = document.createElement('div');
    wrapper.className = 'category-grid__wrapper';
  
    // --- Build each item ---
    rows.forEach((row) => {
      const cells = [...row.children];
      if (cells.length === 0) return;
  
      const imgEl = row.querySelector('img');
      const nameEl = cells.find((c) => !c.querySelector('img'));
      const imgSrc = imgEl ? imgEl.src : '';
      const name = nameEl ? nameEl.textContent.trim() : '';
  
      // Skip empty rows
      if (!imgSrc && !name) return;
  
      const item = document.createElement('div');
      item.className = 'category-grid__item';
  
      const imgWrap = document.createElement('div');
      imgWrap.className = 'category-grid__image-wrap';
      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = name;
        img.loading = 'lazy';
        imgWrap.appendChild(img);
      }
  
      const label = document.createElement('p');
      label.className = 'category-grid__label';
      label.textContent = name;
  
      item.append(imgWrap, label);
      wrapper.appendChild(item);
    });
  
    // --- Clear block and rebuild ---
    block.innerHTML = '';
  
    // Add title if present
    if (titleText) {
      const title = document.createElement('h2');
      title.className = 'category-grid__title';
      title.textContent = titleText;
      block.appendChild(title);
    }
  
    block.appendChild(wrapper);
  }
  