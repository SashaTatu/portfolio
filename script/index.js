document.addEventListener('DOMContentLoaded', () => {

    requestAnimationFrame(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.05, // Зменшили поріг, щоб анімація спрацьовувала швидше
      rootMargin: "0px 0px -20px 0px"
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  });
  
  // 1. Плавна скрол-анімація появи блоків (IntersectionObserver)
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Вимикаємо стеження після появи
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // 2. FAQ Акордеон (Плавне розгортання)
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Закриваємо інші відкриті вкладки для чистоти інтерфейсу
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-content').style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // 3. Селектор мови (Dropdown)
  const langBtn = document.getElementById('langBtn');
  const langSelector = document.querySelector('.lang-selector');

  if (langBtn && langSelector) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelector.classList.toggle('active');
    });

    // Закриваємо меню при кліку в порожнє місце
    document.addEventListener('click', () => {
      langSelector.classList.remove('active');
    });
  }
});