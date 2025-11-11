export default function decorate(block) {
    block.classList.add('category-grid');
  
    const rows = [...block.children];
    if (rows.length === 0) return;
  
    // First row = title (optional)
    const firstRow = rows[0];
    const firstCell = firstRow.querySelector('div, p');
    let titleText = '';
    if (firstCell && firstCell.textContent.trim()) {
      titleText = firstCell.textContent.trim();
      firstRow.remove(); // remove title row from grid items
    }
  
    // Create container
    const wrapper = document.createElement('div');
    wrapper.className = 'category-grid__wrapper';
  
    // Create title if available
    if (titleText) {
      const title = document.createElement('h2');
      title.className = 'category-grid__title';
      title.textContent = titleText;
      block.prepend(title);
    }
  
    // Loop through remaining rows → each row = one category item
    rows.forEach((row) => {
      const cells = [...row.children];
      if (cells.length < 2) return;
  
      const imgEl = cells[0].querySelector('img');
      const imgSrc = imgEl ? imgEl.src : '';
      const name = cells[1].innerText.trim();
  
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
  
    block.innerHTML = '';
    block.appendChild(wrapper);
  }
  