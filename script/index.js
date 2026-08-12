document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. ПОЕЛЕМЕНТНА АНІМАЦІЯ ПОЯВИ (Intersection Observer)
  // ==========================================
  requestAnimationFrame(() => {

    const singleElements = document.querySelectorAll(`
      .section-tag,
      .section-title,
      .about-header > *,
      .about-story-fullwidth > p,
      .team-card,
      .glass-quote-card,
      .portfolio-capsule-item,
      .table-row,
      .cta-story-content > *,
      .faq-item,
      .contact-left > *,
      .shelnat-form .input-row-numeric,
      .form-submit-row,
      .btn-shelnat,
      .btn-hero-order
    `);

    singleElements.forEach(el => el.classList.add('reveal-item'));

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    singleElements.forEach(el => observer.observe(el));

    // Окремий спостерігач для сітки Процесу
    const processGrid = document.querySelector('.process-steps-grid');
    if (processGrid) {
      const processObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      processObserver.observe(processGrid);
    }
  });


  // ==========================================
  // 2. МОБІЛЬНЕ ВИЇЗНЕ МЕНЮ
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileOverlayMenu = document.getElementById('mobileOverlayMenu');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (mobileMenuBtn && mobileOverlayMenu) {
    const closeMenu = () => {
      mobileOverlayMenu.classList.remove('active');
      document.body.style.overflow = '';
    };

    const openMenu = (e) => {
      e.stopPropagation();
      mobileOverlayMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    mobileMenuBtn.addEventListener('click', openMenu);

    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener('click', closeMenu);
    }

    mobileNavItems.forEach(item => {
      item.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (mobileOverlayMenu.classList.contains('active') && !mobileOverlayMenu.contains(e.target)) {
        closeMenu();
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
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const content = trigger.nextElementSibling;

      // Закриваємо всі інші відкриті вкладки (лише 1 відкриваємо)
      faqTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherTrigger.nextElementSibling) otherTrigger.nextElementSibling.style.maxHeight = null;
        }
      });

      // Перемикаємо поточну вкладку
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        if (content) content.style.maxHeight = null;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });


  // ==========================================
  // 6. СИСТЕМА ЛОКАЛІЗАЦІЇ ТА СЕЛЕКТОР МОВИ (i18n)
  // ==========================================
  const langBtn = document.getElementById('langBtn');
  const langSelector = document.querySelector('.lang-selector');
  const currentLangLabel = document.getElementById('current-lang');
  const langDropdownItems = document.querySelectorAll('.lang-dropdown-item');
  let currentLangData = {};

  if (langBtn && langSelector) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelector.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      langSelector.classList.remove('active');
    });
  }

  async function loadLanguage(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Не вдалося завантажити файл мови: ${lang}`);
      currentLangData = await response.json();

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (currentLangData[key]) {
          el.innerHTML = currentLangData[key];
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (currentLangData[key]) {
          elem.placeholder = currentLangData[key]; 
        }
      });

      document.documentElement.lang = lang;
      if (currentLangLabel) currentLangLabel.textContent = lang.toUpperCase();

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
  loadLanguage(savedLang);
  
  // ==========================================
  // 7. ІНТЕРАКТИВНЕ НАДСИЛАННЯ ФОРМИ ТА ЗАВАНТАЖЕННЯ ФАЙЛУ
  // ==========================================
  const contactForm = document.getElementById('generalContactForm');
  const fileInput = document.getElementById('fileUpload');
  const fileNameDisplay = document.getElementById('fileNameDisplay');

  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        fileNameDisplay.textContent = this.files[0].name;
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.submit-btn');
      if (!submitBtn) return;

      const btnText = submitBtn.querySelector('span');

      // Крок А: Стан "Надсилання..."
      if (btnText) {
        btnText.textContent = currentLangData['form_sending'] || "Wird gesendet...";
      }

      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.opacity = '0.7';

      setTimeout(() => {
        // Крок Б: Стан "Успішно надіслано"
        if (btnText) {
          btnText.textContent = currentLangData['form_success'] || "Nachricht gesendet ✓";
        }

        contactForm.reset();

        if (fileNameDisplay) {
          fileNameDisplay.textContent = currentLangData['contact_file'] || "Grundriss oder Fotos hinzufügen (optional)";
        }

        setTimeout(() => {
          // Крок В: Повернення кнопки в початковий стан через 4 секунди
          if (btnText) {
            btnText.textContent = currentLangData['contact_submit'] || "Senden";
          }

          submitBtn.style.pointerEvents = 'all';
          submitBtn.style.opacity = '1';
        }, 4000);

      }, 1500);
    });
  }


  // ==========================================
  // 8. АНІМАЦІЯ ДРУКУ ТЕКСТУ (TYPEWRITER)
  // ==========================================
  const quoteSection = document.querySelector("#quote-section");
  const textElement = document.querySelector(".typewriter-text");

  if (quoteSection && textElement) {
    const fullText = textElement.getAttribute("data-text");
    let isAnimated = false;

    const typewriterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isAnimated) {
          isAnimated = true;
          
          // Фікс стрибка фону
          textElement.textContent = fullText;
          const targetHeight = textElement.offsetHeight;
          textElement.style.minHeight = `${targetHeight}px`;
          textElement.textContent = "";

          typeText(textElement, fullText, 30);
        }
      });
    }, { threshold: 0.3 });

    typewriterObserver.observe(quoteSection);

    function typeText(element, text, speed) {
      let i = 0;
      function nextChar() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(nextChar, speed);
        } else {
          element.classList.add('finished');
        }
      }
      nextChar();
    }
  }

});