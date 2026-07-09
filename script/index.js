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

  // --- СИСТЕМА ПЕРЕКЛАДУ (i18n) ---
  const currentLangCodeEl = document.getElementById('current-lang');
  const langDropdownItems = document.querySelectorAll('.lang-dropdown-item');
  
  // 1. Функція завантаження JSON файлу та перекладу
  async function loadLanguage(lang) {
    try {
      // Завантажуємо файл конфігурації мови
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Не вдалося завантажити мову: ${lang}`);
      const data = await response.json();

      // Шукаємо всі елементи з атрибутом data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) {
          // Використовуємо innerHTML, оскільки у вас в текстах є теги <br> та <i>
          el.innerHTML = data[key];
        }
      });

      // Оновлюємо атрибути тегу <html> та текст на кнопці селектора
      document.documentElement.lang = lang;
      if (currentLangCodeEl) currentLangCodeEl.textContent = lang.toUpperCase();

      // Оновлюємо активний клас у випадаючому списку
      langDropdownItems.forEach(item => {
        if (item.getAttribute('data-lang') === lang) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Зберігаємо вибір користувача
      localStorage.setItem('selectedLanguage', lang);

    } catch (error) {
      console.error("Помилка локалізації:", error);
    }
  }

  // 2. Слухач кліків на пункти меню мов
  langDropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = item.getAttribute('data-lang');
      if (targetLang) {
        loadLanguage(targetLang);
        langSelector.classList.remove('active'); // закриваємо меню
      }
    });
  });

  // 3. Ініціалізація при завантаженні: перевіряємо збережену мову або ставимо дефолтну (uk)
  const savedLang = localStorage.getItem('selectedLanguage') || 'uk';
  if (savedLang !== 'uk') {
    loadLanguage(savedLang);
  }
});