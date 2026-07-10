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
          observer.unobserve(entry.target); // Вимикаємо стеження після появи
        }
      });
    }, {
      root: null,
      threshold: 0.1, // Оптимальний поріг для швидкого та плавого відгуку
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(element => revealObserver.observe(element));
  });


  // ==========================================
  // 2. ІНДИКАТОР СКРОЛУ HERO (Стрілка)
  // ==========================================
  const scrollTrigger = document.getElementById('scrollTrigger');
  const firstSection = document.getElementById('first-section');

  if (scrollTrigger && firstSection) {
    // Клік для плавного скролу до першої секції
    scrollTrigger.addEventListener('click', () => {
      firstSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    });

    // Автоматичне приховання через 5 секунд, якщо користувач бездіє
    const autoHideTimeout = setTimeout(() => {
      scrollTrigger.classList.add('fade-out');
    }, 5000);

    // Миттєве приховання при ручному скролі (збереження продуктивності)
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        scrollTrigger.classList.add('fade-out');
        clearTimeout(autoHideTimeout);
      }
    }, { passive: true });
  }


  // ==========================================
  // 3. ДИНАМІЧНИЙ НАВБАР
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
  // 4. FAQ АКОРДЕОН
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Закриваємо інші відкриті вкладки для акуратності інтерфейсу
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });

        // Перемикаємо стан поточної вкладки
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
  // 5. СЕЛЕКТОР МОВИ (Dropdown)
  // ==========================================
  const langBtn = document.getElementById('langBtn');
  const langSelector = document.querySelector('.lang-selector');

  if (langBtn && langSelector) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelector.classList.toggle('active');
    });

    // Закриваємо меню при кліку в будь-яке інше місце сторінки
    document.addEventListener('click', () => {
      langSelector.classList.remove('active');
    });
  }


  // ==========================================
  // 6. СИСТЕМА ЛОКАЛІЗАЦІЇ (i18n)
  // ==========================================
  const currentLangCodeEl = document.getElementById('current-lang');
  const langDropdownItems = document.querySelectorAll('.lang-dropdown-item');
  
  async function loadLanguage(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Не вдалося завантажити файл мови: ${lang}`);
      const data = await response.json();

      // Переклад звичайного текстового контенту
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) {
          el.innerHTML = data[key]; // innerHTML для збереження <br>, <i> тощо.
        }
      });

      // Переклад плейсхолдерів у формах
      document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (data[key]) {
          elem.placeholder = data[key]; 
        }
      });

      // Оновлення технічних атрибутів та стану селектора
      document.documentElement.lang = lang;
      if (currentLangCodeEl) currentLangCodeEl.textContent = lang.toUpperCase();

      // Оновлення активного класу в елементах списку мов
      langDropdownItems.forEach(item => {
        if (item.getAttribute('data-lang') === lang) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Зберігаємо вибір користувача в браузері
      localStorage.setItem('selectedLanguage', lang);

    } catch (error) {
      console.error("Помилка локалізації проекту:", error);
    }
  }

  // Слухач подій для зміни мови при кліку
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

  // Ініціалізація при першому візиті / перезавантаженні
  const savedLang = localStorage.getItem('selectedLanguage') || 'uk';
  if (savedLang !== 'uk') {
    loadLanguage(savedLang);
  }


  // ==========================================
  // 7. ІНТЕРАКТИВНЕ НАДСИЛАННЯ ФОРМИ (Ajax-like)
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

      // Емуляція відправки на сервер (наприклад, через fetch API)
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