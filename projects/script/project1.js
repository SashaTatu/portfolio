/* ==========================================================================
   Сторінка проєкту: поява при скролі + лайтбокс (плавний зум, свайп, кнопки)
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Поява елементів при скролі ---------- */
  var reveal = document.querySelectorAll('.pj-r');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 2. Лайтбокс ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lb]'));
  var lb = document.getElementById('lb');
  if (!links.length || !lb) return;

  var stage = lb.querySelector('.lb-stage');
  var slide = lb.querySelector('.lb-slide');     // обгортка: анімація гортання / свайпу
  var img = lb.querySelector('.lb-img');         // саме фото: зум і переміщення
  var counter = lb.querySelector('.lb-count');
  var closeBtn = lb.querySelector('[data-act="close"]');

  var MAX = 5;                                   // максимальне збільшення
  var EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var idx = 0;
  var s = 1, tx = 0, ty = 0;                     // що зараз на екрані
  var T = { s: 1, x: 0, y: 0 };                  // куди плавно прямуємо
  var raf = 0, busy = false, isOpen = false, lastFocus = null, closeTimer = 0;

  if (links.length < 2) {
    lb.querySelector('.lb-prev').style.display = 'none';
    lb.querySelector('.lb-next').style.display = 'none';
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* --- зум: плавне наближення до цільових значень --- */
  function render() {
    img.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + s + ')';
    lb.classList.toggle('is-zoomed', T.s > 1.01);
  }
  function clampT() {
    var w = img.offsetWidth * T.s, h = img.offsetHeight * T.s;
    var bx = Math.max(0, (w - stage.clientWidth) / 2);
    var by = Math.max(0, (h - stage.clientHeight) / 2);
    T.x = Math.min(bx, Math.max(-bx, T.x));
    T.y = Math.min(by, Math.max(-by, T.y));
  }
  function snap() {                              // миттєво
    cancelAnimationFrame(raf); raf = 0;
    s = T.s; tx = T.x; ty = T.y;
    render();
  }
  function halt() {                              // зупинити плавну анімацію там, де вона є
    cancelAnimationFrame(raf); raf = 0;
    T.s = s; T.x = tx; T.y = ty;
  }
  function tick() {
    var ds = T.s - s, dx = T.x - tx, dy = T.y - ty;
    if (Math.abs(ds) < 0.002 && Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
      s = T.s; tx = T.x; ty = T.y; render(); raf = 0; return;
    }
    s += ds * 0.2; tx += dx * 0.2; ty += dy * 0.2;
    render();
    raf = requestAnimationFrame(tick);
  }
  function zoomTo(ns, cx, cy, instant) {         // cx, cy — точка відносно центру сцени
    ns = Math.min(MAX, Math.max(1, ns));
    var k = ns / T.s;
    T.x = cx - (cx - T.x) * k;
    T.y = cy - (cy - T.y) * k;
    T.s = ns;
    if (T.s <= 1.001) { T.s = 1; T.x = 0; T.y = 0; }
    clampT();
    if (instant || RM) snap();
    else if (!raf) raf = requestAnimationFrame(tick);
  }
  function reset() { T.s = 1; T.x = 0; T.y = 0; snap(); }
  function point(e) {
    var r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
  }

  /* --- завантаження фото --- */
  function preload(i) {
    var n = links.length;
    [(i + 1) % n, (i - 1 + n) % n].forEach(function (k) {
      var p = new Image(); p.src = links[k].getAttribute('href');
    });
  }
  function load(i, done) {
    idx = (i + links.length) % links.length;
    reset();
    img.classList.add('is-loading');
    var a = links[idx];
    var inner = a.querySelector('img');
    var fin = function () {
      img.onload = img.onerror = null;
      img.classList.remove('is-loading');
      if (done) done();
    };
    img.onload = fin;
    img.onerror = fin;
    img.alt = inner ? inner.alt : '';
    img.src = a.getAttribute('href');
    counter.textContent = pad(idx + 1) + ' / ' + pad(links.length);
    preload(idx);
  }

  /* --- плавне повернення на місце після неповного свайпу --- */
  function settle() {
    var ft = slide.style.transform, fo = slide.style.opacity;
    slide.style.transform = ''; slide.style.opacity = '';
    lb.style.removeProperty('--lb-o');
    if (!ft && !fo) return;
    if (RM) return;
    slide.animate(
      [{ transform: ft || 'none', opacity: fo || 1 }, { transform: 'none', opacity: 1 }],
      { duration: 380, easing: EASE }
    );
  }

  /* --- гортання: старе фото відлітає, нове виїжджає з іншого боку --- */
  function go(d, fromX) {
    if (links.length < 2 || busy) { settle(); return; }
    busy = true;
    if (T.s > 1.01) zoomTo(1, 0, 0);
    lb.style.removeProperty('--lb-o');

    var out = -d * Math.min(180, stage.clientWidth * 0.25);
    var from = fromX || 0;
    var curOp = parseFloat(slide.style.opacity);
    if (isNaN(curOp)) curOp = 1;
    slide.style.transform = ''; slide.style.opacity = '';

    function enter() {
      load(idx + d, function () {
        slide.style.transform = ''; slide.style.opacity = '';
        if (RM) { busy = false; return; }
        var a = slide.animate(
          [{ transform: 'translateX(' + (-out) + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 560, easing: EASE }
        );
        a.onfinish = function () { busy = false; };
        a.oncancel = function () { busy = false; };
      });
    }

    if (RM) { enter(); return; }
    var a = slide.animate(
      [{ transform: 'translateX(' + from + 'px)', opacity: curOp }, { transform: 'translateX(' + out + 'px)', opacity: 0 }],
      { duration: 240, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' }
    );
    a.onfinish = function () {
      slide.style.transform = 'translateX(' + out + 'px)';
      slide.style.opacity = '0';
      a.cancel();
      enter();
    };
  }

  /* --- відкриття / закриття --- */
  function open(i) {
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    busy = false;
    slide.style.transform = ''; slide.style.opacity = '';
    lb.style.removeProperty('--lb-o');
    lb.hidden = false;
    document.documentElement.classList.add('lb-lock');
    isOpen = true;
    load(i, function () {
      if (RM) return;
      slide.animate(
        [{ transform: 'scale(0.94)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 560, easing: EASE }
      );
    });
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    lb.classList.remove('is-open');
    document.documentElement.classList.remove('lb-lock');
    closeTimer = setTimeout(function () {
      if (!isOpen) {
        lb.hidden = true;
        img.removeAttribute('src');
        slide.style.transform = ''; slide.style.opacity = '';
        lb.style.removeProperty('--lb-o');
      }
    }, 380);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      open(i);
    });
  });

  /* --- кнопки --- */
  lb.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'close') close();
    else if (act === 'prev') go(-1);
    else if (act === 'next') go(1);
    else if (act === 'in')  zoomTo(T.s * 1.6, 0, 0);
    else if (act === 'out') zoomTo(T.s / 1.6, 0, 0);
  });

  /* --- клавіатура --- */
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    var k = e.key;
    if (k === 'Escape') close();
    else if (k === 'ArrowLeft') go(-1);
    else if (k === 'ArrowRight') go(1);
    else if (k === '+' || k === '=') zoomTo(T.s * 1.4, 0, 0);
    else if (k === '-' || k === '_') zoomTo(T.s / 1.4, 0, 0);
    else if (k === '0') zoomTo(1, 0, 0);
    else if (k === 'Tab') {                      // фокус залишається всередині лайтбокса
      var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return b.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* --- колесо миші / тачпад: плавний зум до курсора --- */
  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = point(e);
    var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomTo(T.s * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0018)), p.x, p.y);
  }, { passive: false });

  /* --- вказівники: перетягування, свайп, щипок, тап --- */
  var ptrs = {}, count = 0;
  var drag = null, pinch = null, lastTap = 0, lastTapX = 0, lastTapY = 0;

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function two() { var k = Object.keys(ptrs); return [ptrs[k[0]], ptrs[k[1]]]; }

  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (busy && count === 0) return;
    stage.setPointerCapture(e.pointerId);
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; count++;
    halt();
    if (count === 2) {
      var p = two();
      pinch = { d: dist(p[0], p[1]) };
      if (drag && drag.axis) settle();
      drag = null;
    } else if (count === 1) {
      drag = {
        x: e.clientX, y: e.clientY, tx: T.x, ty: T.y, moved: 0,
        onImg: e.target === img, type: e.pointerType, axis: null,
        px: e.clientX, py: e.clientY, pt: e.timeStamp, vx: 0, vy: 0
      };
      img.classList.add('is-drag');
    }
  });

  stage.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };

    if (count === 2 && pinch) {
      var p = two(), d = dist(p[0], p[1]);
      var r = stage.getBoundingClientRect();
      var cx = (p[0].x + p[1].x) / 2 - r.left - r.width / 2;
      var cy = (p[0].y + p[1].y) / 2 - r.top - r.height / 2;
      zoomTo(T.s * (d / pinch.d), cx, cy, true);
      pinch.d = d;
      return;
    }
    if (!drag) return;

    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));

    var dt = e.timeStamp - drag.pt;                // швидкість — для «кинути» свайп
    if (dt > 16) {
      drag.vx = (e.clientX - drag.px) / dt;
      drag.vy = (e.clientY - drag.py) / dt;
      drag.px = e.clientX; drag.py = e.clientY; drag.pt = e.timeStamp;
    }

    if (T.s > 1.01) {                              // збільшене фото — рухаємо його
      T.x = drag.tx + dx; T.y = drag.ty + dy;
      clampT(); snap();
      return;
    }

    if (!drag.axis && drag.moved > 8) {            // визначаємо напрямок жесту
      drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.axis === 'x' && links.length < 2) drag.axis = 'n';
    }
    if (drag.axis === 'x') {                       // фото їде за пальцем
      slide.style.transform = 'translateX(' + dx + 'px)';
      slide.style.opacity = String(1 - Math.min(0.6, Math.abs(dx) / (stage.clientWidth * 0.9)));
    } else if (drag.axis === 'y') {                // потягнути вниз — закрити
      var up = dy < 0;
      var y = up ? dy * 0.25 : dy;
      var sc = 1 - Math.min(0.15, Math.max(0, dy) / 1500);
      slide.style.transform = 'translateY(' + y + 'px) scale(' + sc + ')';
      lb.style.setProperty('--lb-o', String(1 - Math.min(0.7, Math.max(0, dy) / 400)));
    }
  });

  function endPtr(e) {
    if (!ptrs[e.pointerId]) return;
    delete ptrs[e.pointerId]; count = Math.max(0, count - 1);
    img.classList.remove('is-drag');
    if (pinch && count < 2) pinch = null;
    if (!drag || count > 0) return;

    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    var ax = drag.axis, vx = drag.vx, vy = drag.vy;
    var wasTap = drag.moved < 8, onImg = drag.onImg, type = drag.type;
    drag = null;

    if (ax === 'x') {
      var thr = Math.min(110, stage.clientWidth * 0.2);
      if (Math.abs(dx) > thr || (Math.abs(vx) > 0.5 && Math.abs(dx) > 30)) go(dx < 0 ? 1 : -1, dx);
      else settle();
      return;
    }
    if (ax === 'y') {
      if (dy > 120 || (vy > 0.6 && dy > 40)) close();
      else settle();
      return;
    }
    if (ax === 'n') { settle(); return; }

    if (wasTap) {
      var p = point(e);
      if (type === 'mouse') {                      // клік мишею: зум по фото / закрити по темному тлу
        if (onImg) zoomTo(T.s > 1.01 ? 1 : 2.4, p.x, p.y);
        else close();
        return;
      }
      var now = Date.now();                        // тач: подвійний тап — зум
      if (now - lastTap < 320 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 30) {
        zoomTo(T.s > 1.01 ? 1 : 2.6, p.x, p.y);
        lastTap = 0;
      } else {
        lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY;
        if (!onImg) close();                       // тап по темному тлу
      }
    }
  }
  stage.addEventListener('pointerup', endPtr);
  stage.addEventListener('pointercancel', function (e) {
    if (!ptrs[e.pointerId]) return;
    delete ptrs[e.pointerId]; count = Math.max(0, count - 1);
    img.classList.remove('is-drag');
    pinch = null;
    if (drag && drag.axis) settle();
    drag = null;
  });

  window.addEventListener('resize', function () { if (isOpen) { clampT(); snap(); } });
})();