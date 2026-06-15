/* ── Obaida Retro Portfolio — Main Script ── */

(function () {
  'use strict';

  /* ════════════════════════════════════════
     Floating Pixels — Canvas particle system
     ════════════════════════════════════════ */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animId;
    const COLOR = 'rgba(201,122,138,0.6)';
    const COUNT = 25;

    function resize() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();

    const particles = Array.from({ length: COUNT }, function () {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.floor(Math.random() * 4),
        vy: -0.15 - Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        alpha: 0.15 + Math.random() * 0.4,
      };
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = COLOR;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -p.size) { p.y = canvas.height + p.size; p.x = Math.random() * canvas.width; }
        if (p.x < -p.size) p.x = canvas.width;
        if (p.x > canvas.width) p.x = -p.size;
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', resize);
  }

  /* ════════════════════════════════════════
     Film Strip — generate frames
     ════════════════════════════════════════ */
  var filmStrip = document.getElementById('film-strip');
  if (filmStrip) {
    for (var i = 0; i < 50; i++) {
      var frame = document.createElement('div');
      frame.className = 'film-frame';
      filmStrip.appendChild(frame);
    }
  }

  /* ════════════════════════════════════════
     Scroll Reveal
     ════════════════════════════════════════ */
  var reveals = document.querySelectorAll('.reveal');

  function checkReveals() {
    var vh = window.innerHeight;
    for (var i = 0; i < reveals.length; i++) {
      var el = reveals[i];
      if (el.classList.contains('revealed')) continue;
      var rect = el.getBoundingClientRect();
      if (rect.top < vh + 50) {
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        (function (target, d) {
          setTimeout(function () { target.classList.add('revealed'); }, d);
        })(el, delay);
      }
    }
  }

  window.addEventListener('scroll', checkReveals, { passive: true });
  checkReveals();
  requestAnimationFrame(checkReveals);
  requestAnimationFrame(function () { requestAnimationFrame(checkReveals); });
  window.addEventListener('load', checkReveals);

  /* ════════════════════════════════════════
     Typing Text Effect
     ════════════════════════════════════════ */
  var typingElements = document.querySelectorAll('.typing-text');

  function initTyping(el) {
    var text = el.getAttribute('data-text') || '';
    var cursor = el.nextElementSibling;
    el.textContent = ' ';

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        var idx = 0;
        var interval = setInterval(function () {
          idx++;
          el.textContent = text.slice(0, idx);
          if (idx >= text.length) {
            clearInterval(interval);
            if (cursor) cursor.style.display = 'none';
          }
        }, 50);
      }
    }, { threshold: 0.1 });

    observer.observe(el.parentElement);

    setTimeout(function () {
      if (el.textContent === ' ' || el.textContent.length < text.length) {
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.top < window.innerHeight + 50) {
          observer.disconnect();
          var idx2 = el.textContent === ' ' ? 0 : el.textContent.length;
          var interval2 = setInterval(function () {
            idx2++;
            el.textContent = text.slice(0, idx2);
            if (idx2 >= text.length) {
              clearInterval(interval2);
              if (cursor) cursor.style.display = 'none';
            }
          }, 50);
        }
      }
    }, 2500);
  }

  for (var t = 0; t < typingElements.length; t++) {
    initTyping(typingElements[t]);
  }

  /* ════════════════════════════════════════
     Animated Progress Bars
     ════════════════════════════════════════ */
  var progressRows = document.querySelectorAll('.progress-row');

  function initProgressBar(row) {
    var value = parseInt(row.getAttribute('data-value') || '0', 10);
    var fill = row.querySelector('.progress-fill');
    var num = fill ? fill.querySelector('span') : null;
    var animated = false;

    fill.style.width = '0%';
    if (num) num.textContent = '0%';

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        observer.disconnect();
        animateBar();
      }
    }, { threshold: 0.1 });

    observer.observe(row);

    setTimeout(function () {
      if (!animated) {
        var rect = row.getBoundingClientRect();
        if (rect.top < window.innerHeight + 50) {
          animated = true;
          observer.disconnect();
          animateBar();
        }
      }
    }, 2500);

    function animateBar() {
      var target = Math.max(0, Math.min(100, value));
      var cur = 0;
      var chunk = Math.max(1, Math.ceil(target / 25));
      var id = setInterval(function () {
        cur = Math.min(cur + chunk, target);
        fill.style.width = cur + '%';
        if (num) num.textContent = Math.round(cur) + '%';
        if (cur >= target) {
          clearInterval(id);
          fill.classList.add('progress-glow');
        }
      }, 40);
    }
  }

  for (var p = 0; p < progressRows.length; p++) {
    initProgressBar(progressRows[p]);
  }

  /* ════════════════════════════════════════
     Taskbar — Clock
     ════════════════════════════════════════ */
  var timeEl = document.getElementById('taskbar-time');

  function updateClock() {
    if (timeEl) {
      timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ════════════════════════════════════════
     Taskbar — Navigation & Scroll Spy
     ════════════════════════════════════════ */
  var taskbar = document.getElementById('taskbar');
  var navBtns = taskbar ? taskbar.querySelectorAll('[data-nav]') : [];
  var sectionIds = ['home', 'about', 'story', 'skills', 'portfolio', 'contact'];

  function setActive(id) {
    for (var i = 0; i < navBtns.length; i++) {
      var btn = navBtns[i];
      if (btn.classList.contains('taskbar__start')) continue;
      if (btn.getAttribute('data-nav') === id) {
        btn.classList.add('taskbar__btn--active');
      } else {
        btn.classList.remove('taskbar__btn--active');
      }
    }
  }

  function scrollSpy() {
    for (var i = sectionIds.length - 1; i >= 0; i--) {
      var el = document.getElementById(sectionIds[i]);
      if (el && el.getBoundingClientRect().top <= 120) {
        setActive(sectionIds[i]);
        break;
      }
    }
  }

  window.addEventListener('scroll', scrollSpy, { passive: true });
  scrollSpy();

  for (var n = 0; n < navBtns.length; n++) {
    navBtns[n].addEventListener('click', function () {
      var id = this.getAttribute('data-nav');
      var target = document.getElementById(id);
      if (target) {
        var top = target.getBoundingClientRect().top + window.pageYOffset - 10;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }

  /* ════════════════════════════════════════
     Contact Form
     ════════════════════════════════════════ */
  var form = document.getElementById('contact-form');
  var sentMsg = document.getElementById('sent-message');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.display = 'none';
      if (sentMsg) sentMsg.style.display = 'block';
    });
  }

  /* ════════════════════════════════════════
     Card Minimize Buttons
     ════════════════════════════════════════ */
  var minBtns = document.querySelectorAll('.retro-card__dot--minimize');
  for (var m = 0; m < minBtns.length; m++) {
    minBtns[m].addEventListener('click', function (e) {
      e.stopPropagation();
      var card = this.closest('.retro-card');
      if (!card) return;
      var body = card.querySelector('.retro-card__body');
      if (!body) return;
      var isMin = body.style.display === 'none';
      body.style.display = isMin ? '' : 'none';
      card.classList.toggle('retro-card--minimized', !isMin);
    });
  }

  /* ════════════════════════════════════════
     3D Tilt on Cards
     ════════════════════════════════════════ */
  var cards = document.querySelectorAll('.retro-card');
  for (var c = 0; c < cards.length; c++) {
    (function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 6;
        var y = ((e.clientY - r.top) / r.height - 0.5) * -6;
        card.style.transform = 'perspective(600px) rotateX(' + y + 'deg) rotateY(' + x + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'none';
      });
    })(cards[c]);
  }

  /* ════════════════════════════════════════
     Mouse-tracking Buttons
     ════════════════════════════════════════ */
  var trackBtns = document.querySelectorAll('.retro-btn--track');
  for (var tb = 0; tb < trackBtns.length; tb++) {
    (function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = Math.round(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 2);
        var y = Math.round(((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 2);
        btn.style.transform = 'translate(' + (x * -1) + 'px,' + (y * -1) + 'px)';
        btn.style.boxShadow = (x * 3) + 'px ' + (y * 3) + 'px 0 var(--color-rose-darker)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        btn.style.boxShadow = '';
      });
      btn.addEventListener('mousedown', function () {
        btn.style.transform = 'translate(2px, 2px)';
        btn.style.boxShadow = 'inset 2px 2px 0 rgba(0,0,0,0.3)';
      });
      btn.addEventListener('mouseup', function () {
        btn.style.transform = '';
        btn.style.boxShadow = '';
      });
    })(trackBtns[tb]);
  }

  /* ════════════════════════════════════════
     Smooth anchor links
     ════════════════════════════════════════ */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var a = 0; a < anchors.length; a++) {
    anchors[a].addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 10;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }

})();
