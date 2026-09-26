// Amer Dalati — portfolio interactions. No dependencies.

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => (reducedMotion.matches ? 'auto' : 'smooth');

const announcer = document.querySelector('[data-announcer]');
let announceTimer;

function announce(message, delay = 0) {
  if (!announcer) return;
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  }, delay);
}

function el(tag, className = '', attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

function icon(name) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

const slug = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const pad = (n) => String(Math.floor(n)).padStart(2, '0');

function formatTimecode(seconds, fps = 30) {
  const t = Math.max(0, seconds);
  const frames = Math.floor((t % 1) * fps);
  return `${pad(t / 3600)}:${pad((t / 60) % 60)}:${pad(t % 60)}:${pad(frames)}`;
}

/* ---------- Header ---------- */
function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const update = () => header.classList.toggle('is-solid', window.scrollY > 16);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ---------- Current section in the nav ---------- */
function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const hash = `#${entry.target.id}`;
        for (const link of links) {
          if (link.getAttribute('href') === hash) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-45% 0px -54% 0px' }
  );
  document.querySelectorAll('main > section[id]').forEach((section) => observer.observe(section));
}

/* ---------- Mobile menu ---------- */
function initMenu() {
  const dialog = document.querySelector('[data-menu]');
  const openButton = document.querySelector('[data-menu-open]');
  if (!dialog || !openButton || typeof dialog.showModal !== 'function') return;

  openButton.addEventListener('click', () => {
    dialog.showModal();
    openButton.setAttribute('aria-expanded', 'true');
  });
  dialog.addEventListener('close', () => openButton.setAttribute('aria-expanded', 'false'));
  dialog.querySelector('[data-menu-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#"]')) dialog.close();
  });

  const desktop = window.matchMedia('(min-width: 900px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches && dialog.open) dialog.close();
  });
}

/* ---------- Work: the editor timeline ---------- */
function initEditor() {
  const editor = document.querySelector('[data-editor]');
  const reel = editor?.querySelector('[data-reel]');
  const clips = reel ? [...reel.querySelectorAll('.clip')] : [];
  if (!clips.length) return;

  // Monitor: every clip's media moves into one screen, stacked.
  const monitor = el('div', 'monitor');
  const screen = el('div', 'screen');
  const bar = el('div', 'monitor-bar', { 'aria-hidden': 'true' });
  const timecode = el('span', 'rec');
  const counter = el('span', 'counter');
  bar.append(timecode, counter);
  const medias = clips.map((clip) => {
    const media = clip.querySelector('.clip-media');
    screen.append(media);
    return media;
  });
  screen.append(bar);
  monitor.append(screen);

  // Timeline: one tab per clip, grouped by project.
  const timeline = el('div', 'timeline');
  const scroller = el('div', 'tl-scroller');
  const content = el('div', 'tl-content');
  const ruler = el('div', 'tl-ruler', { 'aria-hidden': 'true' });
  const track = el('div', 'tl-track', { role: 'tablist', 'aria-label': 'Clips' });
  const audio = el('div', 'tl-audio', { 'aria-hidden': 'true' });
  const playhead = el('div', 'playhead', { 'aria-hidden': 'true' });

  const groups = new Map();
  const tabs = clips.map((clip, index) => {
    const groupName = clip.dataset.group || 'Work';
    let group = groups.get(groupName);
    if (!group) {
      group = el('div', 'tl-group', { 'data-group': slug(groupName) });
      const name = el('span', 'tl-group-name', { 'aria-hidden': 'true' });
      name.textContent = groupName;
      group.append(name, el('div', 'tl-clips'));
      track.append(group);
      groups.set(groupName, group);
    }
    const title = clip.querySelector('.clip-title')?.textContent.trim() || `Clip ${index + 1}`;
    const tab = el('button', 'tl-clip', {
      type: 'button',
      role: 'tab',
      id: `tab-${clip.id}`,
      'aria-controls': clip.id,
      'aria-selected': 'false',
      'aria-label': `${groupName}: ${title}`,
      tabindex: '-1',
    });
    tab.style.setProperty('--len', clip.dataset.len || '15');
    tab.style.setProperty('--thumb', medias[index].style.getPropertyValue('--thumb'));
    const label = el('span', 'tl-clip-label', { 'aria-hidden': 'true' });
    label.textContent = clip.dataset.label || title;
    tab.append(label);
    group.querySelector('.tl-clips').append(tab);
    clip.setAttribute('role', 'tabpanel');
    clip.setAttribute('aria-labelledby', tab.id);
    return tab;
  });

  content.append(ruler, track, audio);
  scroller.append(content);
  timeline.append(scroller, playhead);

  // Transport
  const transport = el('div', 'transport');
  const prev = el('button', 'transport-button', { type: 'button', 'aria-label': 'Previous clip' });
  const prevText = el('span');
  prevText.textContent = 'Previous';
  prev.append(icon('prev'), prevText);
  const next = el('button', 'transport-button', { type: 'button', 'aria-label': 'Next clip' });
  const nextText = el('span');
  nextText.textContent = 'Next';
  next.append(nextText, icon('next'));
  const count = el('span', 'transport-count', { 'aria-hidden': 'true' });
  transport.append(prev, count, next);

  editor.prepend(monitor, timeline, transport);
  editor.classList.add('is-ready');

  // Geometry
  let active = -1;
  let centers = [];
  let pps = 10;
  let suppressUntil = 0;

  const buildRuler = () => {
    ruler.textContent = '';
    const width = track.offsetWidth;
    for (let s = 0; s * pps <= width; s += 5) {
      const mark = el('span');
      mark.style.left = `${s * pps}px`;
      mark.textContent = `${pad(s / 60)}:${pad(s % 60)}`;
      ruler.append(mark);
    }
  };

  const measure = () => {
    pps = parseFloat(getComputedStyle(editor).getPropertyValue('--pps')) || 10;
    centers = tabs.map((tab) => tab.offsetLeft + tab.offsetWidth / 2);
    buildRuler();
  };

  const nearest = (x) => {
    let best = 0;
    let distance = Infinity;
    centers.forEach((center, index) => {
      const d = Math.abs(center - x);
      if (d < distance) {
        distance = d;
        best = index;
      }
    });
    return best;
  };

  const stopPlayback = () => {
    screen.classList.remove('is-playing');
    screen.querySelectorAll('iframe').forEach((frame) => frame.remove());
    medias.forEach((media) => media.classList.remove('is-playing'));
  };

  const select = (index, { scroll = true, focus = false, instant = false, speak = true } = {}) => {
    const target = Math.max(0, Math.min(tabs.length - 1, index));
    if (target !== active) {
      stopPlayback();
      if (active >= 0) {
        tabs[active].setAttribute('aria-selected', 'false');
        tabs[active].tabIndex = -1;
        medias[active].classList.remove('is-active');
        clips[active].classList.remove('is-active');
      }
      active = target;
      tabs[active].setAttribute('aria-selected', 'true');
      tabs[active].tabIndex = 0;
      medias[active].classList.add('is-active');
      clips[active].classList.add('is-active');
      const position = `${active + 1} / ${tabs.length}`;
      count.textContent = position;
      counter.textContent = position;
      prev.setAttribute('aria-disabled', String(active === 0));
      next.setAttribute('aria-disabled', String(active === tabs.length - 1));
      prev.disabled = false;
      next.disabled = false;
      if (speak) announce(`Clip ${active + 1} of ${tabs.length}. ${tabs[active].getAttribute('aria-label')}`, 350);
    }
    if (scroll) {
      const left = centers[active] - scroller.clientWidth / 2;
      if (Math.abs(scroller.scrollLeft - left) > 1) {
        const quick = instant || reducedMotion.matches;
        suppressUntil = performance.now() + (quick ? 60 : 1200);
        scroller.scrollTo({ left, behavior: quick ? 'auto' : 'smooth' });
      }
    }
    if (focus) tabs[active].focus({ preventScroll: true });
  };

  // Scrubbing: whatever sits under the playhead becomes the active clip.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      timecode.textContent = formatTimecode(scroller.scrollLeft / pps);
      if (performance.now() < suppressUntil) return;
      const index = nearest(scroller.scrollLeft + scroller.clientWidth / 2);
      if (index !== active) select(index, { scroll: false });
    });
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  scroller.addEventListener('scrollend', () => {
    suppressUntil = 0;
    onScroll();
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
  });

  track.addEventListener('keydown', (event) => {
    const moves = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key], { focus: true });
  });

  prev.addEventListener('click', () => {
    if (active > 0) select(active - 1);
  });
  next.addEventListener('click', () => {
    if (active < tabs.length - 1) select(active + 1);
  });

  // Mouse drag to scrub (touch already scrolls natively).
  let drag = null;
  let dragged = false;
  scroller.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: scroller.scrollLeft, id: event.pointerId };
    dragged = false;
  });
  scroller.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (!dragged && Math.abs(dx) > 5) {
      dragged = true;
      suppressUntil = 0;
      scroller.classList.add('is-dragging');
      scroller.setPointerCapture(drag.id);
    }
    if (dragged) scroller.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    if (!dragged) return;
    scroller.classList.remove('is-dragging');
    select(active);
    setTimeout(() => {
      dragged = false;
    }, 0);
  };
  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);
  scroller.addEventListener(
    'click',
    (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  // Click-to-load players (YouTube via youtube-nocookie, Drive preview).
  screen.addEventListener('click', (event) => {
    const play = event.target.closest('.play[data-embed]');
    if (!play) return;
    event.preventDefault();
    const media = play.closest('.clip-media');
    const frame = el('iframe', '', {
      src: play.dataset.embed,
      title: play.dataset.embedTitle || 'Video player',
      allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
      allowfullscreen: '',
      referrerpolicy: 'strict-origin-when-cross-origin',
    });
    media.append(frame);
    media.classList.add('is-playing');
    screen.classList.add('is-playing');
    frame.focus();
  });

  measure();
  select(0, { instant: true, speak: false });
  timecode.textContent = formatTimecode(scroller.scrollLeft / pps);

  if ('ResizeObserver' in window) {
    let lastWidth = scroller.clientWidth;
    new ResizeObserver(() => {
      if (scroller.clientWidth === lastWidth) return;
      lastWidth = scroller.clientWidth;
      measure();
      select(active, { instant: true, speak: false });
    }).observe(scroller);
  }
  document.fonts?.ready.then(() => {
    measure();
    select(active, { instant: true, speak: false });
  });
}

/* ---------- Copy email ---------- */
function copyFallback(text) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  field.remove();
  return ok;
}

function initCopy() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    const label = button.querySelector('[data-copy-label]');
    const use = button.querySelector('use');
    let timer;
    button.addEventListener('click', async () => {
      const text = button.dataset.copy;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = copyFallback(text);
      }
      if (!ok) {
        announce('Copy failed. Select the email address and copy it manually.');
        return;
      }
      button.classList.add('is-done');
      if (label) label.textContent = 'Copied';
      use?.setAttribute('href', '#i-check');
      announce('Email address copied');
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.classList.remove('is-done');
        if (label) label.textContent = 'Copy';
        use?.setAttribute('href', '#i-copy');
      }, 2200);
    });
  });
}

/* ---------- Certificate lightbox ---------- */
function initLightbox() {
  const dialog = document.querySelector('[data-lightbox]');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const caption = dialog.querySelector('[data-lightbox-caption]');
  const image = el('img', 'lightbox-img', { alt: '' });
  dialog.insertBefore(image, caption);

  document.querySelectorAll('[data-full]').forEach((button) => {
    button.addEventListener('click', () => {
      const thumb = button.querySelector('img');
      image.src = button.dataset.full;
      image.width = Number(button.dataset.w);
      image.height = Number(button.dataset.h);
      image.alt = thumb ? thumb.alt : '';
      caption.textContent = button.dataset.caption || '';
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => image.removeAttribute('src'));
}

initHeader();
initScrollSpy();
initMenu();
initEditor();
initCopy();
initLightbox();
