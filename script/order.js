document.addEventListener('DOMContentLoaded', async () => {

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



})