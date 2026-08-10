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
  document.querySelectorAll('.faq-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const parent = trigger.parentElement;
    const content = parent.querySelector('.faq-content');

    // Закрити інші відкриті елементи (за бажанням)
    document.querySelectorAll('.faq-item').forEach(item => {
      if (item !== parent) {
        item.classList.remove('active');
        item.querySelector('.faq-content').style.maxHeight = null;
      }
    });

    // Перемикання поточного елемента
    parent.classList.toggle('active');
    if (parent.classList.contains('active')) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = null;
    }
  });
});


  // ==========================================
  // 6. СЕЛЕКТОР МОВИ (Dropdown)
  // ==========================================
const langBtn = document.getElementById('langBtn');
const langSelector = document.querySelector('.lang-selector');
const currentLangLabel = document.getElementById('current-lang');
const langItems = document.querySelectorAll('.lang-dropdown-item');

if (langBtn && langSelector) {
  // Відкриття / закриття меню
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langSelector.classList.toggle('active');
  });

  // Закриття при кліку поза меню
  document.addEventListener('click', () => {
    langSelector.classList.remove('active');
  });

  // Перемикання мов у списку
  langItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      // Знімаємо active з усіх і додаємо обраному
      langItems.forEach((el) => el.classList.remove('active'));
      item.classList.add('active');

      // Оновлюємо текст у кнопці (наприклад, "DE", "UK", "EN")
      const langCode = item.getAttribute('data-lang').toUpperCase();
      if (currentLangLabel) {
        currentLangLabel.textContent = langCode;
      }

      // Закриваємо селектор
      langSelector.classList.remove('active');
    });
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
// 8. ІНТЕРАКТИВНЕ НАДСИЛАННЯ ФОРМИ ТА ЗАВАНТАЖЕННЯ ФАЙЛУ
// ==========================================
const contactForm = document.getElementById('generalContactForm');
const fileInput = document.getElementById('fileUpload');
const fileNameDisplay = document.getElementById('fileNameDisplay');

// 1. Відстеження вибору файлу (відображення назви файлу)
if (fileInput && fileNameDisplay) {
  fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      fileNameDisplay.textContent = this.files[0].name;
    }
  });
}

// 2. Обробка відправки форми
if (contactForm) {
  // Словник-заглушка на випадок, якщо в JSON немає ключів для стану відправки
  const formStatusMessages = {
    de: { sending: "Wird gesendet...", success: "Nachricht gesendet ✓", fileDefault: "Grundriss oder Fotos hinzufügen (optional)" }
  };

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    if (!submitBtn) return;

    const btnText = submitBtn.querySelector('span');
    const currentLang = localStorage.getItem('selectedLanguage') || 'de';
    const langMsgs = formStatusMessages[currentLang] || formStatusMessages['de'];

    // Крок А: Стан "Надсилання..."
    if (btnText) {
      btnText.setAttribute('data-i18n', 'form_sending');
      btnText.textContent = langMsgs.sending; // Гарантована зміна тексту
    }

    submitBtn.style.pointerEvents = 'none';
    submitBtn.style.opacity = '0.7';

    if (typeof loadLanguage === 'function') {
      loadLanguage(currentLang);
    }

    setTimeout(() => {
      // Крок Б: Стан "Успішно надіслано"
      if (btnText) {
        btnText.setAttribute('data-i18n', 'form_success');
        btnText.textContent = langMsgs.success; // Гарантована зміна тексту
      }

      if (typeof loadLanguage === 'function') {
        loadLanguage(currentLang);
      }

      // Скидаємо форму
      contactForm.reset();

      // Очищаємо вибраний файл і повертаємо початковий текст підказки для файлу
      if (fileNameDisplay) {
        fileNameDisplay.setAttribute('data-i18n', 'contact_file');
        fileNameDisplay.textContent = langMsgs.fileDefault;
      }

      setTimeout(() => {
        // Крок В: Повертаємо кнопку в початковий стан через 4 секунди
        if (btnText) {
          btnText.setAttribute('data-i18n', 'contact_submit');
        }

        if (typeof loadLanguage === 'function') {
          loadLanguage(currentLang);
        }

        submitBtn.style.pointerEvents = 'all';
        submitBtn.style.opacity = '1';
      }, 4000);

    }, 1500);
  });
}
});