document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ (Reveal)
  // ==========================================
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
      threshold: 0.1, 
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(element => revealObserver.observe(element));
  });


  // ==========================================
  // 2. МOБІЛЬНЕ ВИЇЗНЕ МЕНЮ (МАТРИЧНИЙ КРУЖЕЧОК)
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileOverlayMenu = document.getElementById('mobileOverlayMenu');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (mobileMenuBtn && mobileOverlayMenu) {
    // Відкрити меню
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileOverlayMenu.classList.add('active');
      document.body.style.overflow = 'hidden'; // забігаємо прокрутці тла
    });

    // Закрити через хрестик
    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener('click', () => {
        mobileOverlayMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Закривати панель при кліку на будь-яке посилання всередині
    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileOverlayMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Закривати панель, якщо клікнули поза її межами
    document.addEventListener('click', (e) => {
      if (mobileOverlayMenu.classList.contains('active') && !mobileOverlayMenu.contains(e.target)) {
        mobileOverlayMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }


  // ==========================================
  // 3. ІНДИКАТОР СКРОЛУ HERO (Стрілка)
  // ==========================================
  const scrollTrigger = document.getElementById('scrollTrigger');
  const firstSection = document.getElementById('first-section');

  if (scrollTrigger && firstSection) {
    scrollTrigger.addEventListener('click', () => {
      firstSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    });

    const autoHideTimeout = setTimeout(() => {
      scrollTrigger.classList.add('fade-out');
    }, 5000);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        scrollTrigger.classList.add('fade-out');
        clearTimeout(autoHideTimeout);
      }
    }, { passive: true });
  }


  // ==========================================
  // 4. ДИНАМІЧНИЙ НАВБАР
  // ==========================================
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.padding = '10px 0';
        navbar.style.backgroundColor = 'rgba(249, 246, 244, 0.95)';
      } else {
        navbar.style.padding = '15px 0';
        navbar.style.backgroundColor = 'rgba(249, 246, 244, 0.85)';
      }
    }, { passive: true });
  }


  // ==========================================
  // 5. FAQ АКОРДЕОН
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
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
    }
  });


  // ==========================================
  // 6. СЕЛЕКТОР МОВИ (Dropdown)
  // ==========================================
  const langBtn = document.getElementById('langBtn');
  const langSelector = document.querySelector('.lang-selector');

  if (langBtn && langSelector) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelector.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      langSelector.classList.remove('active');
    });
  }


  // ==========================================
  // 7. СИСТЕМА ЛОКАЛІЗАЦІЇ (i18n)
  // ==========================================
  const currentLangCodeEl = document.getElementById('current-lang');
  const langDropdownItems = document.querySelectorAll('.lang-dropdown-item');
  
  async function loadLanguage(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Не вдалося завантажити файл мови: ${lang}`);
      const data = await response.json();

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) {
          el.innerHTML = data[key];
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (data[key]) {
          elem.placeholder = data[key]; 
        }
      });

      document.documentElement.lang = lang;
      if (currentLangCodeEl) currentLangCodeEl.textContent = lang.toUpperCase();

      langDropdownItems.forEach(item => {
        if (item.getAttribute('data-lang') === lang) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      localStorage.setItem('selectedLanguage', lang);

    } catch (error) {
      console.error("Помилка локалізації проекту:", error);
    }
  }

  langDropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = item.getAttribute('data-lang');
      if (targetLang) {
        loadLanguage(targetLang);
        if (langSelector) langSelector.classList.remove('active');
      }
    });
  });

  const savedLang = localStorage.getItem('selectedLanguage') || 'uk';
  if (savedLang !== 'uk') {
    loadLanguage(savedLang);
  }


  // ==========================================
  // 8. ІНТЕРАКТИВНЕ НАДСИЛАННЯ ФОРМИ
  // ==========================================
  const contactForm = document.getElementById('generalContactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.submit-btn');
      if (!submitBtn) return;

      const btnText = submitBtn.querySelector('span');
      const originalText = btnText ? btnText.textContent : 'Надіслати повідомлення';

      if (btnText) btnText.textContent = 'Надсилання...';
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.opacity = '0.7';

      setTimeout(() => {
        if (btnText) btnText.textContent = 'Дякуємо! Повідомлення надіслано';
        contactForm.reset();

        setTimeout(() => {
          if (btnText) btnText.textContent = originalText;
          submitBtn.style.pointerEvents = 'all';
          submitBtn.style.opacity = '1';
        }, 4000);

      }, 1500);
    });
  }
});