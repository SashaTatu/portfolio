document.addEventListener('DOMContentLoaded', async () => {

  // Безпечний localStorage (приватний режим Safari може кидати помилку)
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  };

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
  // 2. МОБІЛЬНЕ ВИЇЗНЕ МЕНЮ
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileOverlayMenu = document.getElementById('mobileOverlayMenu');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  function setMobileMenu(open) {
    mobileOverlayMenu.classList.toggle('active', open);
    mobileOverlayMenu.setAttribute('aria-hidden', String(!open));
    mobileOverlayMenu.inert = !open;
    mobileMenuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (mobileMenuBtn && mobileOverlayMenu) {
    setMobileMenu(false);

    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMobileMenu(true);
      if (closeMobileMenuBtn) closeMobileMenuBtn.focus();
    });

    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener('click', () => {
        setMobileMenu(false);
        mobileMenuBtn.focus();
      });
    }

    mobileNavItems.forEach(item => item.addEventListener('click', () => setMobileMenu(false)));

    document.addEventListener('click', (e) => {
      if (mobileOverlayMenu.classList.contains('active') && !mobileOverlayMenu.contains(e.target)) {
        setMobileMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileOverlayMenu.classList.contains('active')) {
        setMobileMenu(false);
        mobileMenuBtn.focus();
      }
    });

    // Якщо вікно розширили до десктопу — закриваємо меню
    window.matchMedia('(min-width: 993px)').addEventListener('change', (e) => {
      if (e.matches) setMobileMenu(false);
    });
  }



    // ==========================================
  // 6. СЕЛЕКТОР МОВИ (відкриття/закриття; вибір мови — у розділі 7)
  // ==========================================
  const langBtn = document.getElementById('langBtn');
  const langSelector = document.querySelector('.lang-selector');

  if (langBtn && langSelector) {
    const setLangMenu = (open) => {
      langSelector.classList.toggle('active', open);
      langBtn.setAttribute('aria-expanded', String(open));
    };

    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setLangMenu(!langSelector.classList.contains('active'));
    });

    document.addEventListener('click', () => setLangMenu(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setLangMenu(false);
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

  const langCache = {};
  let langRequestId = 0;

  async function loadLanguage(lang) {
    const requestId = ++langRequestId; // захист від гонки при швидкому перемиканні мов
    try {
      if (!langCache[lang]) {
        const response = await fetch(`./lang/${lang}.json`);
        if (!response.ok) throw new Error(`Не вдалося завантажити файл мови: ${lang}`);
        langCache[lang] = await response.json();
      }
      if (requestId !== langRequestId) return;
      const data = langCache[lang];

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const rawKey = el.getAttribute('data-i18n');
        if (!rawKey) return;

        // Розпізнаємо синтаксис [data-text]quotes.hero_quote або стандартний quotes.hero_quote
        const attrMatch = rawKey.match(/^\[(.*?)\](.*)$/);

        if (attrMatch) {
          const attrName = attrMatch[1];
          const actualKey = attrMatch[2];
          const val = getTranslationValue(data, actualKey);
          if (val) {
            el.setAttribute(attrName, val);
            if (attrName === 'placeholder') el.setAttribute('aria-label', val);
          }
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

      store.set('selectedLanguage', lang);
      refreshFaqHeights();

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
  const storedLang = store.get('selectedLanguage');
  const savedLang = ['de', 'uk', 'en', 'ru'].includes(storedLang) ? storedLang : 'de';
  loadLanguage(savedLang);

});