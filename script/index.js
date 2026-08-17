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
  // 1.1 ПОЕЛЕМЕНТНА АНІМАЦІЯ ПОЯВИ
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
  // 2. МOБІЛЬНЕ ВИЇЗНЕ МЕНЮ
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileOverlayMenu = document.getElementById('mobileOverlayMenu');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (mobileMenuBtn && mobileOverlayMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileOverlayMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener('click', () => {
        mobileOverlayMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileOverlayMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', (e) => {
      if (mobileOverlayMenu.classList.contains('active') && !mobileOverlayMenu.contains(e.target)) {
        mobileOverlayMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }


  // ==========================================
  // 3. ІНДИКАТОР СКРОЛУ HERO
  // ==========================================
  const scrollTrigger = document.getElementById('scrollTrigger');
  const firstSection = document.getElementById('about-us');

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

      faqTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherContent = otherTrigger.nextElementSibling;
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      trigger.setAttribute('aria-expanded', !isExpanded);

      if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
    });
  });


  // ==========================================
  // 6. СЕЛЕКТОР МОВИ (Dropdown UI)
  // ==========================================
  const langBtn = document.getElementById('langBtn');
  const langSelector = document.querySelector('.lang-selector');
  const currentLangLabel = document.getElementById('current-lang');
  const langItems = document.querySelectorAll('.lang-dropdown-item');

  if (langBtn && langSelector) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelector.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      langSelector.classList.remove('active');
    });

    langItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        langItems.forEach((el) => el.classList.remove('active'));
        item.classList.add('active');

        const langCode = item.getAttribute('data-lang').toUpperCase();
        if (currentLangLabel) {
          currentLangLabel.textContent = langCode;
        }

        langSelector.classList.remove('active');
      });
    });
  }


  // ==========================================
  // 7. СИСТЕМА ЛОКАЛІЗАЦІЇ (i18n) — ВИПРАВЛЕНО
  // ==========================================
  const currentLangCodeEl = document.getElementById('current-lang');
  const langDropdownItems = document.querySelectorAll('.lang-dropdown-item');

  // Допоміжна функція для пошуку ключів (працює і з "quotes.hero_quote", і з { quotes: { hero_quote: "..." } })
  function getTranslationValue(dataObj, pathKey) {
    if (!pathKey) return null;
    if (dataObj[pathKey] !== undefined) return dataObj[pathKey];
    return pathKey.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), dataObj);
  }

  async function loadLanguage(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Не вдалося завантажити файл мови: ${lang}`);
      const data = await response.json();

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const rawKey = el.getAttribute('data-i18n');
        if (!rawKey) return;

        // Розпізнаємо синтаксис [data-text]quotes.hero_quote або стандартний quotes.hero_quote
        const attrMatch = rawKey.match(/^\[(.*?)\](.*)$/);

        if (attrMatch) {
          const attrName = attrMatch[1];
          const actualKey = attrMatch[2];
          const val = getTranslationValue(data, actualKey);
          if (val) el.setAttribute(attrName, val);
        } else {
          const val = getTranslationValue(data, rawKey);
          if (val) el.innerHTML = val;
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        const val = getTranslationValue(data, key);
        if (val) elem.placeholder = val;
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

      // Сповіщаємо скрипт друку про вибір нової мови
      if (typeof window.onLanguageChangeForTypewriter === 'function') {
        window.onLanguageChangeForTypewriter();
      }

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

  // ЗАВЖДИ викликаємо завантаження мови при старті сторінки
  const savedLang = localStorage.getItem('selectedLanguage') || 'uk';
  loadLanguage(savedLang);


// ==========================================
  // 8. ІНТЕРАКТИВНЕ НАДСИЛАННЯ ФОРМИ
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
    const formStatusMessages = {
      de: { sending: "Wird gesendet...", success: "Nachricht gesendet ✓", fileDefault: "Grundriss oder Fotos hinzufügen (optional)" },
      uk: { sending: "Надсилання...", success: "Повідомлення надіслано ✓", fileDefault: "Grundriss oder Fotos hinzufügen (optional)" }
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.submit-btn');
      if (!submitBtn) return;

      const btnText = submitBtn.querySelector('span');
      const btnIcon = submitBtn.querySelector('svg'); // Отримуємо елемент стрілочки
      const currentLang = localStorage.getItem('selectedLanguage') || 'de';
      const langMsgs = formStatusMessages[currentLang] || formStatusMessages['de'];

      // Стан надсилання
      if (btnText) {
        btnText.setAttribute('data-i18n', 'form_sending');
        btnText.textContent = langMsgs.sending;
      }

      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.opacity = '0.7';

      setTimeout(() => {
        // Стан успішного відправлення: міняємо текст і ховаємо стрілочку
        if (btnText) {
          btnText.setAttribute('data-i18n', 'form_success');
          btnText.textContent = langMsgs.success;
        }

        if (btnIcon) {
          btnIcon.style.display = 'none'; // Стрілочка зникає
        }

        contactForm.reset();

        if (fileNameDisplay) {
          fileNameDisplay.setAttribute('data-i18n', 'contact_file');
          fileNameDisplay.textContent = langMsgs.fileDefault;
        }

        // Повернення до початкового стану через 4 секунди (4000 мс)
        setTimeout(() => {
          if (btnText) {
            btnText.setAttribute('data-i18n', 'submit-btn');
          }

          if (btnIcon) {
            btnIcon.style.display = ''; // Повертаємо стрілочку
          }

          if (typeof loadLanguage === 'function') {
            loadLanguage(currentLang);
          }

          submitBtn.style.pointerEvents = 'all';
          submitBtn.style.opacity = '1';
        }, 4000); // Час у мілісекундах (наприклад, 4000 мс = 4 секунди)

      }, 1500);
    });
  }


  // ==========================================
  // 9. АНІМАЦІЯ ДРУКУ (Typewriter)
  // ==========================================
  const quoteSection = document.querySelector("#quote-section");
  const textElement = document.querySelector(".typewriter-text");
  let typeTimer = null;
  let isSectionVisible = false;

  function runTypewriter() {
    if (!textElement) return;

    // Спочатку перевіряємо data-text, якщо його немає — беремо textContent
    const fullText = textElement.getAttribute("data-text") || textElement.textContent.trim();
    if (!fullText) return;

    if (typeTimer) clearTimeout(typeTimer);

    // 1. Запобігаємо стрибку висоти
    textElement.style.minHeight = '0px';
    textElement.textContent = fullText;
    const targetHeight = textElement.offsetHeight;
    textElement.style.minHeight = `${targetHeight}px`;

    // 2. Очищення перед друком
    textElement.textContent = "";
    textElement.classList.remove('finished');

    let i = 0;
    function nextChar() {
      if (i < fullText.length) {
        textElement.textContent += fullText.charAt(i);
        i++;
        typeTimer = setTimeout(nextChar, 30);
      } else {
        textElement.classList.add('finished');
      }
    }
    nextChar();
  }

  window.onLanguageChangeForTypewriter = () => {
    // Перезапускаємо друк тільки якщо секція видима прямо зараз
    if (isSectionVisible) {
      runTypewriter();
    }
  };

  if (quoteSection && textElement) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isSectionVisible = entry.isIntersecting;

        if (entry.isIntersecting) {
          runTypewriter();
        } else {
          if (typeTimer) clearTimeout(typeTimer);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(quoteSection);
  }

});