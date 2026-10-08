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
  // 3. ІНДИКАТОР СКРОЛУ HERO
  // ==========================================
const scrollTrigger = document.getElementById('scrollTrigger');
  const firstSection = document.getElementById('about-us');

  if (scrollTrigger && firstSection) {
    // Зберігаємо ID таймера у змінну, щоб можна було видалити
    let autoHideTimeout = setTimeout(() => {
      scrollTrigger.classList.add('fade-out');
    }, 10000);

    scrollTrigger.addEventListener('click', () => {
      firstSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      scrollTrigger.classList.add('fade-out');
      clearTimeout(autoHideTimeout);
    });

    const handleScroll = () => {
      if (window.scrollY > 20) {
        scrollTrigger.classList.add('fade-out');
        clearTimeout(autoHideTimeout);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  if (scrollTrigger) {
    scrollTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollTrigger.click();
      }
    });
  }


  // ==========================================
  // 4. ДИНАМІЧНИЙ НАВБАР (throttle через rAF)
  // ==========================================
  const navbar = document.querySelector('.navbar');
  const navLogoImg = document.querySelector('.nav-logo-img-kolibri');
  const navLogoImg1 = document.querySelector('.nav-logo-img-kolibri1');
  const navLogoText = document.querySelector('.nav-logo');
  const budgetBtn = document.querySelector('.budget-dot');

  if (navbar) {
    let navTicking = false;

    const updateNavbar = () => {
      const scrolled = window.scrollY > 30;
      navbar.classList.toggle('scrolled', scrolled);
      if (navLogoImg) navLogoImg.classList.toggle('scrolled', scrolled);
      if (navLogoText) navLogoText.classList.toggle('scrolled', scrolled);
      if (navLogoImg1) navLogoImg1.classList.toggle('scrolled', !scrolled);
      if (budgetBtn) budgetBtn.classList.toggle('scrolled', scrolled);
      navTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!navTicking) {
        navTicking = true;
        requestAnimationFrame(updateNavbar);
      }
    }, { passive: true });

    updateNavbar(); // коректний стан, якщо сторінку відновили посередині
  }


  // ==========================================
  // 5. FAQ АКОРДЕОН
  // ==========================================
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  // Перераховує висоту відкритих пунктів (потрібно після зміни мови та resize)
  function refreshFaqHeights() {
    faqTriggers.forEach(trigger => {
      const content = trigger.nextElementSibling;
      if (!content) return;
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      content.style.maxHeight = expanded ? content.scrollHeight + 'px' : null;
      content.inert = !expanded;
    });
  }

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      faqTriggers.forEach(t => t.setAttribute('aria-expanded', String(t === trigger && willOpen)));
      refreshFaqHeights();
    });
  });

  window.addEventListener('resize', refreshFaqHeights);
  refreshFaqHeights();



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


// ==========================================
  // 8. ІНТЕРАКТИВНЕ НАДСИЛАННЯ ФОРМИ (Google Apps Script)
  // ==========================================
  const contactForm = document.getElementById('generalContactForm');
  const fileInput = document.getElementById('fileUpload');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileListContainer = document.getElementById('fileList');
  const clearFileBtn = document.getElementById('clearFileBtn');

  let selectedFiles = [];

  const MAX_FILE_SIZE_MB = 25; // Ліміт для Google Apps Script
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const fileSizeErrorMessages = {
    de: `Gesamtgröße der Dateien zu groß (max. ${MAX_FILE_SIZE_MB} MB)`,
    uk: `Загальний розмір файлів занадто великий (макс. ${MAX_FILE_SIZE_MB} МБ)`,
    en: `Total file size too large (max. ${MAX_FILE_SIZE_MB} MB)`,
    ru: `Общий размер файлов слишком большой (макс. ${MAX_FILE_SIZE_MB} МБ)`
  };

  const fileTypeErrorMessages = {
    de: 'Nur Bilder und PDF-Dateien sind erlaubt',
    uk: 'Дозволені лише зображення та PDF-файли',
    en: 'Only images and PDF files are allowed',
    ru: 'Разрешены только изображения и PDF-файлы'
  };

  const removeFileLabels = {
    de: 'Datei entfernen',
    uk: 'Видалити файл',
    en: 'Remove file',
    ru: 'Удалить файл'
  };

  const fileCountMessages = {
    de: (count) => `${count} Dateien ausgewählt`,
    uk: (count) => `Прикріплено файлів: ${count}`,
    en: (count) => `${count} files selected`,
    ru: (count) => `Прикреплено файлов: ${count}`
  };

  function resetFiles() {
    selectedFiles = [];
    if (fileInput) fileInput.value = '';
    if (clearFileBtn) clearFileBtn.style.display = 'none';
    renderFileList();
  }

  function renderFileList() {
    if (fileListContainer) fileListContainer.innerHTML = '';

    if (selectedFiles.length === 0) {
      if (clearFileBtn) clearFileBtn.style.display = 'none';

      if (fileNameDisplay) {
        fileNameDisplay.style.color = '';
        fileNameDisplay.setAttribute('data-i18n', 'contact_file');
        const currentLang = store.get('selectedLanguage') || 'de';
        const defaultTexts = {
          de: "Grundriss oder Fotos hinzufügen (optional)",
          uk: "Додати план приміщення або фотографії (за бажанням)",
          en: "Upload a room plan or photos (optional)",
          ru: "Добавить план помещения или фотографии (по желанию)"
        };
        fileNameDisplay.textContent = defaultTexts[currentLang] || defaultTexts['de'];
      }
      return;
    }

    if (clearFileBtn) clearFileBtn.style.display = 'inline-block';

    if (fileNameDisplay) {
      fileNameDisplay.removeAttribute('data-i18n');
      fileNameDisplay.style.color = '';
      const currentLang = store.get('selectedLanguage') || 'de';

      if (selectedFiles.length === 1) {
        fileNameDisplay.textContent = selectedFiles[0].name;
      } else {
        const getMsg = fileCountMessages[currentLang] || fileCountMessages['de'];
        fileNameDisplay.textContent = getMsg(selectedFiles.length);
      }
    }

    if (fileListContainer) {
      const lang = store.get('selectedLanguage') || 'de';
      const removeLabel = removeFileLabels[lang] || removeFileLabels.de;

      selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';

        const mb = file.size / (1024 * 1024);
        const sizeText = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'file-item-name';
        nameSpan.textContent = `${file.name} (${sizeText})`;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'file-item-remove';
        removeBtn.setAttribute('aria-label', `${removeLabel}: ${file.name}`);
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedFiles.splice(index, 1);
          renderFileList();
        });

        item.append(nameSpan, removeBtn);
        fileListContainer.appendChild(item);
      });
    }
  }

  if (clearFileBtn) {
    clearFileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetFiles();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        const newFiles = Array.from(this.files);

        let hasInvalidType = false;

        newFiles.forEach(newFile => {
          const validType = newFile.type.startsWith('image/') || /\.pdf$/i.test(newFile.name);
          if (!validType) {
            hasInvalidType = true;
            return;
          }
          const isDuplicate = selectedFiles.some(f => f.name === newFile.name && f.size === newFile.size);
          if (!isDuplicate) {
            selectedFiles.push(newFile);
          }
        });

        if (hasInvalidType) {
          const lang = store.get('selectedLanguage') || 'de';
          alert(fileTypeErrorMessages[lang] || fileTypeErrorMessages.de);
        }

        let totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

        if (totalSize > MAX_FILE_SIZE_BYTES) {
          const currentLang = store.get('selectedLanguage') || 'de';
          const errorMsg = fileSizeErrorMessages[currentLang] || fileSizeErrorMessages['de'];

          alert(errorMsg);
          selectedFiles = selectedFiles.filter(f => !newFiles.includes(f));
        }

        renderFileList();
        this.value = '';
      }
    });
  }

  // Функція конвертації файлу у Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve({
          name: file.name,
          type: file.type,
          base64: base64String
        });
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  if (contactForm) {
    const formStatusMessages = {
      de: { sending: "Wird gesendet...", success: "Nachricht gesendet ✓", error: "Fehler beim Senden" },
      uk: { sending: "Надсилання...", success: "Повідомлення надіслано ✓", error: "Помилка надсилання" },
      en: { sending: "Sending...", success: "Message sent ✓", error: "Sending error" },
      ru: { sending: "Отправка...", success: "Сообщение отправлено ✓", error: "Ошибка отправки" }
    };

    let isSubmitting = false;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Захист від подвійного надсилання (у т.ч. через Enter) і від спам-ботів (honeypot)
      if (isSubmitting || contactForm.querySelector('[name="website"]')?.value) return;

      let totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > MAX_FILE_SIZE_BYTES) {
        const currentLang = store.get('selectedLanguage') || 'de';
        alert(fileSizeErrorMessages[currentLang] || fileSizeErrorMessages['de']);
        return;
      }

      const submitBtn = contactForm.querySelector('.submit-btn');
      if (!submitBtn) return;

      const btnText = submitBtn.querySelector('span');
      const btnIcon = submitBtn.querySelector('svg');
      const currentLang = store.get('selectedLanguage') || 'de';
      const langMsgs = formStatusMessages[currentLang] || formStatusMessages['de'];

      if (btnText) {
        btnText.removeAttribute('data-i18n');
        btnText.textContent = langMsgs.sending;
      }

      isSubmitting = true;
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.opacity = '0.7';
      try {
        // Конвертуємо прикріплені файли в Base64
        const filesData = await Promise.all(selectedFiles.map(fileToBase64));

        const payload = {
          name: contactForm.querySelector('[name="Client Name"]')?.value || '',
          email: contactForm.querySelector('[name="Client Email"]')?.value || '',
          message: contactForm.querySelector('[name="Project Details"]')?.value || '',
          files: filesData
        };

        const scriptUrl = "https://script.google.com/macros/s/AKfycbz9pwbnknhsnP-l_1B6K4Pu1LBeI3a2WCL5KPyVxjf88hmS0x2YQQoNBsPwHc4qVdQF/exec";

        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        if (btnText) {
          btnText.textContent = langMsgs.success;
        }
        if (btnIcon) {
          btnIcon.style.display = 'none';
        }

        contactForm.reset();
        resetFiles();

      } catch (err) {
        console.error('Google Apps Script Error:', err);
        if (btnText) {
          btnText.textContent = langMsgs.error;
        }
      } finally {
        setTimeout(() => {
          if (btnText) {
            btnText.setAttribute('data-i18n', 'submit-btn');
          }
          if (btnIcon) {
            btnIcon.style.display = '';
          }
          if (typeof loadLanguage === 'function') {
            loadLanguage(currentLang);
          }
          isSubmitting = false;
          submitBtn.style.pointerEvents = 'all';
          submitBtn.style.opacity = '1';
        }, 4000);
      }
    });
  }

  // ==========================================
  // 9. АНІМАЦІЯ ДРУКУ (Typewriter)
  // ==========================================
  const quoteSection = document.querySelector("#quote-section");
  const textElement = document.querySelector(".typewriter-text");
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let typeTimer = null;
  let isSectionVisible = false;
  let typedText = ''; // текст, який уже повністю надрукований

  function runTypewriter() {
    if (!textElement) return;

    const fullText = textElement.getAttribute("data-text") || textElement.textContent.trim();
    if (!fullText) return;

    clearTimeout(typeTimer);
    textElement.setAttribute('aria-label', fullText);

    // Без анімації: якщо користувач просить менше руху або цитату вже надруковано
    if (prefersReducedMotion || typedText === fullText) {
      textElement.textContent = fullText;
      textElement.classList.add('finished');
      typedText = fullText;
      return;
    }

    // Фіксуємо висоту, щоб не було стрибків під час друку
    textElement.style.minHeight = '0px';
    textElement.textContent = fullText;
    textElement.style.minHeight = `${textElement.offsetHeight}px`;

    textElement.textContent = "";
    textElement.classList.remove('finished');

    let i = 0;
    (function nextChar() {
      if (i < fullText.length) {
        i++;
        textElement.textContent = fullText.slice(0, i);
        typeTimer = setTimeout(nextChar, 30);
      } else {
        textElement.classList.add('finished');
        typedText = fullText;
      }
    })();
  }

  // Після зміни мови друкуємо новий текст, якщо секція зараз на екрані
  window.onLanguageChangeForTypewriter = () => {
    if (isSectionVisible) runTypewriter();
  };

  if (quoteSection && textElement) {
    const quoteObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isSectionVisible = entry.isIntersecting;
        if (entry.isIntersecting) {
          runTypewriter();
        } else {
          clearTimeout(typeTimer);
        }
      });
    }, { threshold: 0.3 });

    quoteObserver.observe(quoteSection);
  }

});