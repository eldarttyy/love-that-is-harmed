/* Love That Is Harmed — interactions. No libraries. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  /* ───────── Rain over the lake ───────── */
  const canvas = $('#rain'), ctx = canvas.getContext('2d');
  let W, H, drops = [], raining = true;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(W * H / 5000);
    drops = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 8 + Math.random() * 14, v: 7 + Math.random() * 7 }));
  }
  function rain() {
    if (!raining) return;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(190, 210, 225, .35)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of drops) {
      ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + d.l);
      d.y += d.v; d.x -= 0.6;
      if (d.y > H) { d.y = -20; d.x = Math.random() * W; }
    }
    ctx.stroke();
    requestAnimationFrame(rain);
  }
  addEventListener('resize', size);
  size();
  if (!reduced) {
    new IntersectionObserver(([e]) => { const was = raining; raining = e.isIntersecting; if (raining && !was) requestAnimationFrame(rain); }).observe(canvas);
    requestAnimationFrame(rain);
  }

  /* ───────── Intro ───────── */
  const lines = $$('.intro-line');
  let timers = [];
  function endIntro() {
    timers.forEach(clearTimeout);
    lines.forEach(l => l.classList.remove('on'));
    document.body.classList.remove('is-intro');
    store.set('harmed-seen-intro', true);
  }
  if (reduced || store.get('harmed-seen-intro', false) || location.hash.length > 1) endIntro();
  else {
    lines.forEach((l, i) => {
      timers.push(setTimeout(() => l.classList.add('on'), 600 + i * 3000));
      timers.push(setTimeout(() => l.classList.remove('on'), 600 + i * 3000 + 2000));
    });
    timers.push(setTimeout(endIntro, 600 + lines.length * 3000));
  }
  $('.skip-intro').addEventListener('click', endIntro);

  /* ───────── Top bar + menu ───────── */
  const topbar = $('.topbar');
  new IntersectionObserver(([e]) => topbar.classList.toggle('solid', !e.isIntersecting), { threshold: 0.12 }).observe($('.hero'));
  const menuBtn = $('.menu-btn');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    $('.menu').setAttribute('aria-hidden', !open);
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ───────── Reveals ───────── */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ───────── 1. My feelings on the wheel ───────── */
  const C = { anger: 'var(--ember)', sad: 'var(--blue)', hope: 'var(--gold)' };
  const FEEL = [
    { name: 'Anger', fam: 'anger', size: 108, text: 'At how carelessly people treat the only world we have, and at what it costs the climate, the animals, the land. Anger born from love.' },
    { name: 'Frustration', fam: 'anger', size: 92, text: 'No one talks about it. There is an elephant in the room, and everyone has learned to walk around it.' },
    { name: 'Disappointment', fam: 'anger', size: 120, text: 'So many people don\'t even know what they are doing. And many who could help choose not to.' },
    { name: 'Sadness', fam: 'sad', size: 132, text: 'The deepest one. I can see what is happening, and I can\'t stop it. I can barely even touch it.' },
    { name: 'Helplessness', fam: 'sad', size: 96, text: 'Knowing, and not being able to change anything. This is where the sadness begins.' },
    { name: 'Grief', fam: 'sad', size: 100, text: 'The smartest species the Earth has ever known, and the most destructive.' },
    { name: 'Inspiration', fam: 'hope', size: 96, text: 'One diver, alone, carrying trash up from the bottom of a lake. That was enough to change how I see one person\'s power.' },
    { name: 'Empowerment', fam: 'hope', size: 96, text: 'A cleanup with friends. A conversation. A book. Each one reminds me I am not alone in this.' },
  ];
  const wheel = $('.wheel'), center = $('.wheel-center');
  const btns = FEEL.map((f, i) => {
    const b = document.createElement('button');
    b.className = 'feel';
    b.setAttribute('role', 'tab');
    b.textContent = f.name;
    b.style.setProperty('--c', C[f.fam]);
    b.style.setProperty('--s', f.size + 'px');
    const a = -Math.PI / 2 + (i / FEEL.length) * Math.PI * 2;
    b.style.left = 50 + Math.cos(a) * 37 + '%';
    b.style.top = 50 + Math.sin(a) * 37 + '%';
    b.addEventListener('click', () => showFeel(i));
    wheel.insertBefore(b, center);
    return b;
  });
  function showFeel(i) {
    const f = FEEL[i];
    btns.forEach((b, j) => b.setAttribute('aria-selected', i === j));
    $('.kicker', center).textContent = f.fam === 'sad' && f.name === 'Sadness' ? 'The strongest' : ({ anger: 'Anger', sad: 'Sadness', hope: 'Hope' })[f.fam];
    $('.kicker', center).style.color = C[f.fam];
    $('h3', center).textContent = f.name;
    $('p', center).textContent = f.text;
    center.classList.remove('swap'); void center.offsetWidth; center.classList.add('swap');
  }
  showFeel(3);

  /* ───────── 2. Half the dots fade ───────── */
  const dots = $('.dots');
  for (let i = 0; i < 50; i++) {
    const d = document.createElement('i');
    if (i % 2 === 1) { d.className = 'gone'; d.style.transitionDelay = (i * 40) + 'ms'; }
    dots.appendChild(d);
  }

  /* ───────── 6. My practice ───────── */
  const kept = new Set(store.get('harmed-practice', []));
  const boxes = $$('.practice input'), count = $('.practice-count');
  function update() {
    const n = boxes.filter(b => b.checked).length;
    count.textContent = n === 0 ? '' : n === boxes.length ? 'All four. The feelings have somewhere to go.' : `${n} of ${boxes.length} this week.`;
  }
  boxes.forEach(b => {
    b.checked = kept.has(b.dataset.p);
    b.addEventListener('change', () => {
      b.checked ? kept.add(b.dataset.p) : kept.delete(b.dataset.p);
      store.set('harmed-practice', [...kept]);
      update();
    });
  });
  update();
})();
