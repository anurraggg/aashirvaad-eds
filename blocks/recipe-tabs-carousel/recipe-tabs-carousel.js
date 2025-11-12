export default function decorate(block) {
    console.log("✅ Recipe Tabs Carousel JS loaded!");
  
    const container = block.closest(".recipe-tabs-carousel");
    if (!container) return;
  
    const tabsWrapper = container.querySelector(".rtc__tabs");
    const carouselsWrapper = container.querySelector(".rtc__carousels");
    const carousels = [...carouselsWrapper.querySelectorAll(".rtc__carousel")];
    const tabs = [...tabsWrapper.querySelectorAll(".rtc__tab")];
  
    if (!tabs.length || !carousels.length) {
      console.warn("⚠️ No tabs or carousels found in recipe-tabs-carousel block");
      return;
    }
  
    // Activate first tab by default
    let currentIndex = 0;
    tabs[currentIndex].classList.add("active");
    carousels[currentIndex].classList.add("active");
  
    // Handle tab switching
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        if (tab.classList.contains("active")) return; // skip if already active
  
        // Remove active state from all tabs & carousels
        tabs.forEach(t => t.classList.remove("active"));
        carousels.forEach(c => {
          c.classList.remove("active");
          c.style.opacity = "0";
          c.style.visibility = "hidden";
        });
  
        // Add active state to current
        tab.classList.add("active");
        carousels[i].classList.add("active");
        carousels[i].style.opacity = "1";
        carousels[i].style.visibility = "visible";
  
        currentIndex = i;
      });
    });
  
    // Carousel navigation logic
    carousels.forEach((carousel) => {
      const prevBtn = carousel.querySelector(".rtc__prev");
      const nextBtn = carousel.querySelector(".rtc__next");
  
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
          carousel.scrollBy({ left: -300, behavior: "smooth" });
        });
  
        nextBtn.addEventListener("click", () => {
          carousel.scrollBy({ left: 300, behavior: "smooth" });
        });
      }
    });
  
    // Ensure only overlay buttons are clickable (not entire image)
    container.querySelectorAll(".rtc__overlay-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const link = btn.getAttribute("href");
        if (link) window.open(link, "_blank");
      });
    });
  }
  