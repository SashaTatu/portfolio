// Переклад юридичних сторінок (impressum.html, datenschutz.html).
// Мова береться з localStorage ("selectedLanguage"), яку зберігає index.js.
// Німецька лишається в самому HTML — для неї файл не завантажується.
(async () => {
  const page = document.body.dataset.page; // "impressum" | "datenschutz"
  if (!page) return;

  let lang = 'de';
  try { lang = localStorage.getItem('selectedLanguage') || 'de'; } catch { /* ignore */ }
  if (!['uk', 'en', 'ru'].includes(lang)) return;

  try {
    const res = await fetch(`./lang/${page}/${lang}.json`);
    if (!res.ok) return; // немає файлу — залишається німецька
    const data = await res.json();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const raw = el.getAttribute('data-i18n');
      const m = raw.match(/^\[(.*?)\](.*)$/);
      const key = m ? m[2] : raw;
      if (data[key] === undefined) return;
      if (m) el.setAttribute(m[1], data[key]);
      else el.innerHTML = data[key];
    });

    document.documentElement.lang = lang;
    if (data.title) document.title = data.title;
  } catch (err) {
    console.error('Legal i18n error:', err);
  }
})();