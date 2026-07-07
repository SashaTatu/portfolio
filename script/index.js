// --- ЕФЕКТ СКРОЛУ НАВІГАЦІЇ ---


// --- FAQ АККОРДЕОН ---
document.querySelectorAll('.faq-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.parentElement;
    const content = item.querySelector('.faq-content');
    const isActive = item.classList.contains('active');
    
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('.faq-content').style.maxHeight = '0';
    });
    
    if (!isActive) {
      item.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
});

// --- SMOOTH REVEAL ANIMATION ON SCROLL ---
const revealElements = document.querySelectorAll('.reveal');
const scrollObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => scrollObserver.observe(el));

// --- ОБРОБКА ВІДПРАВКИ ФОРМ ---
const generalForm = document.getElementById('generalContactForm');
if (generalForm) {
  generalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert("Повідомлення надіслано. Ми відповімо вам найближчим часом.");
    this.reset();
  });
}

const briefForm = document.getElementById('projectBriefForm');
if (briefForm) {
  briefForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert("Дякуємо! Анкету проєкту успішно надіслано студії. Олена та Олександр зв'яжуться з вами.");
    this.reset();
  });
}


// --- КЕРУВАННЯ МЕНЮ МОВ ---
const langSelector = document.querySelector('.lang-selector');
const langBtn = document.getElementById('langBtn');

if (langBtn && langSelector) {
  // Перемикання стану при кліку на кнопку
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Зупиняє закриття від кліку по самій кнопці
    langSelector.classList.toggle('active');
  });

  // Закриття меню, якщо клікнути повз нього
  document.addEventListener('click', (e) => {
    if (!langSelector.contains(e.target)) {
      langSelector.classList.remove('active');
    }
  });
}