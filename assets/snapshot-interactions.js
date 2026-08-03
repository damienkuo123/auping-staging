(()=>{
  'use strict';

  const BASE = location.pathname.startsWith('/auping-staging/') ? '/auping-staging' : '';
  const route = (path) => `${BASE}${path}`;
  const RAW_MEDIA_BASE = 'https://raw.githubusercontent.com/damienkuo123/auping-staging/main/assets/light-catalog/media/';
  const GITHUB_MEDIA_BASE = 'https://github.com/damienkuo123/auping-staging/raw/refs/heads/main/assets/light-catalog/media/';

  const links = [
    ['Box springs', '/en/box-springs/'],
    ['Beds', '/en/beds/'],
    ['Mattresses', '/en/mattresses/'],
    ['Toppers', '/en/mattress-toppers/'],
    ['Bed bases', '/en/bed-bases/'],
    ['Pillows', '/en/bed-linen/pillows/'],
    ['Bed linen', '/en/bed-linen/'],
    ['Find a store', '/en/store-locator/'],
    ['About Auping', '/en/about-auping/'],
    ['Customer service', '/en/customer-service/']
  ];

  const MEDIA_FILES = {
    'https://api.auping.com/sites/default/files/2026-04/auping_fabrieksvideo_clean.mp4': '1e148dd8972b04e0fe919757c882.mp4',
    'https://api.auping.com/sites/default/files/2025-11/topban.mp4': 'fdfaecfdf94deb4e840c6b83c202.mp4',
    'https://api.auping.com/sites/default/files/2025-10/auping_essential_bed_6sec_1920x1080_a423_1.mp4': '927e13502742db5ff7e642b84de9.mp4',
    'https://api.auping.com/sites/default/files/2025-07/matrassenpagina_mood_1920x500_1.mp4': '2c7f60394e11ffca478b4cf3324f.mp4',
    'https://api.auping.com/sites/default/files/2025-12/xAuping_Ventex-426x494.mp4': 'e9b877417b0f4a580bed30e01448.mp4',
    'https://api.auping.com/sites/default/files/2025-12/Auping%20-%20Pocketsprings%20-%20V4%20-%20426x494.mp4': '2a7be2063982a32f62c283deeca6.mp4',
    'https://api.auping.com/sites/default/files/2025-07/duurzame_kwaliteit_video1.mp4': '1c887ed4fb0aa061cf0eeca786c3.mp4',
    'https://api.auping.com/sites/default/files/2022-12/auping_cutdown_1_eng_0.mp4': '7a6e9914db47f88e9c9415e507ed.mp4',
    'https://cdn.api.auping.com/sites/default/files/2022-11/2bodytypesop1matras.mp4': '193fbd75c0b38f98e24babb9116b.mp4',
    'https://api.auping.com/sites/default/files/2025-07/Auping-fabriek-bedbodem.mp4': 'a3315162a17e816d46aa5b3f1a3b.mp4'
  };

  const FILE_SET = new Set(Object.values(MEDIA_FILES));

  const clean = (value) => {
    try {
      const url = new URL(value, location.href);
      url.hash = '';
      url.search = '';
      return decodeURI(url.href);
    } catch {
      return decodeURI(String(value || '').split('#')[0].split('?')[0]);
    }
  };

  const mediaFileFor = (value) => {
    const key = clean(value);
    for (const [remote, file] of Object.entries(MEDIA_FILES)) {
      if (key === decodeURI(remote)) return file;
    }
    const file = key.split('/').pop();
    return FILE_SET.has(file) ? file : null;
  };

  function searchUI() {
    let panel = document.querySelector('.auping-static-search');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.className = 'auping-static-search';
    panel.innerHTML = `
      <div class="auping-static-search__panel">
        <button class="auping-static-search__close" aria-label="Close">×</button>
        <h2>Search Auping</h2>
        <div class="auping-static-search__row">
          <input type="search" placeholder="Search products and information">
          <button>Search</button>
        </div>
        <div class="auping-static-search__results"></div>
      </div>`;
    document.body.appendChild(panel);

    const input = panel.querySelector('input');
    const results = panel.querySelector('.auping-static-search__results');
    const run = () => {
      const query = input.value.trim().toLowerCase();
      let anchors = [...document.querySelectorAll('a[href]')]
        .map((anchor) => ({
          text: (anchor.innerText || anchor.getAttribute('aria-label') || '').trim(),
          href: anchor.getAttribute('href')
        }))
        .filter((item) => item.text && item.href && item.href.includes('/en'));
      const seen = new Set();
      anchors = anchors.filter((item) => !seen.has(item.href) && (seen.add(item.href), true));
      if (query) {
        anchors = anchors.filter((item) =>
          item.text.toLowerCase().includes(query) || item.href.toLowerCase().includes(query)
        );
      }
      results.innerHTML = anchors.slice(0, 60)
        .map((item) => `<a href="${item.href}">${item.text}</a>`)
        .join('') || '<p>No local results found.</p>';
    };

    panel.querySelector('.auping-static-search__close').onclick = () => panel.classList.remove('is-open');
    panel.querySelector('.auping-static-search__row button').onclick = run;
    input.addEventListener('input', run);
    panel.addEventListener('click', (event) => {
      if (event.target === panel) panel.classList.remove('is-open');
    });
    return panel;
  }

  function mobileNav() {
    let nav = document.querySelector('.auping-mobile-nav');
    if (nav) return nav;

    nav = document.createElement('nav');
    nav.className = 'auping-mobile-nav';
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.innerHTML = `
      <div class="auping-mobile-nav__header">
        <strong>Auping</strong>
        <button class="auping-mobile-nav__close" aria-label="Close menu">×</button>
      </div>
      ${links.map(([label, path]) => `<a href="${route(path)}">${label}</a>`).join('')}`;
    document.body.appendChild(nav);
    nav.querySelector('button').onclick = () => {
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    return nav;
  }

  const textOf = (element) => (
    `${element.getAttribute('aria-label') || ''} ${element.title || ''} ${element.innerText || ''}`
  ).toLowerCase();

  function setupMegaMenus() {
    const items = [...document.querySelectorAll('nav[aria-label="primary"]>ul>li')]
      .filter((item) => item.querySelector(':scope>div[class*="MainMenu_menu"]'));
    let timer = 0;

    const close = () => {
      clearTimeout(timer);
      items.forEach((item) => {
        item.classList.remove('auping-menu-open');
        item.querySelector(':scope>a')?.setAttribute('aria-expanded', 'false');
      });
      document.body.classList.remove('auping-mega-open');
    };

    const open = (item) => {
      clearTimeout(timer);
      items.forEach((other) => {
        if (other !== item) other.classList.remove('auping-menu-open');
      });
      item.classList.add('auping-menu-open');
      item.querySelector(':scope>a')?.setAttribute('aria-expanded', 'true');
      document.body.classList.add('auping-mega-open');
    };

    items.forEach((item) => {
      if (item.dataset.aupingMenuReady) return;
      item.dataset.aupingMenuReady = '1';
      const anchor = item.querySelector(':scope>a');
      const menu = item.querySelector(':scope>div[class*="MainMenu_menu"]');
      if (!anchor || !menu) return;

      anchor.setAttribute('aria-haspopup', 'true');
      anchor.setAttribute('aria-expanded', 'false');
      item.addEventListener('mouseenter', () => open(item));
      item.addEventListener('mouseleave', () => { timer = setTimeout(close, 140); });
      item.addEventListener('focusin', () => open(item));
      item.addEventListener('focusout', (event) => {
        if (!item.contains(event.relatedTarget)) timer = setTimeout(close, 120);
      });
      anchor.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          open(item);
          menu.querySelector('a,button')?.focus();
        }
        if (event.key === 'Escape') close();
      });
      if (matchMedia('(hover:none)').matches) {
        anchor.addEventListener('click', (event) => {
          if (!item.classList.contains('auping-menu-open')) {
            event.preventDefault();
            open(item);
          }
        });
      }
    });

    if (!document.documentElement.dataset.aupingMenuGlobalReady) {
      document.documentElement.dataset.aupingMenuGlobalReady = '1';
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });
      document.addEventListener('click', (event) => {
        if (!event.target.closest('nav[aria-label="primary"]')) close();
      });
    }
  }

  function armVideo(video, index) {
    if (video.dataset.aupingVideoReady) return;
    video.dataset.aupingVideoReady = '1';

    const current = video.getAttribute('src') || video.querySelector('source[src]')?.getAttribute('src') || '';
    const file = mediaFileFor(current);
    if (file) {
      video.querySelectorAll('source').forEach((source) => source.remove());
      video.src = `${RAW_MEDIA_BASE}${file}`;
      video.dataset.aupingMediaFile = file;
      try { video.load(); } catch {}
    }

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
    if (index === 0) {
      video.loop = true;
      video.setAttribute('loop', '');
    }

    let candidate = 0;
    const play = () => video.play().catch(() => {});
    const recover = () => {
      const fileName = video.dataset.aupingMediaFile;
      if (!fileName || candidate >= 1) return;
      candidate += 1;
      video.src = `${GITHUB_MEDIA_BASE}${fileName}`;
      try { video.load(); } catch {}
      play();
    };

    video.addEventListener('error', recover, { passive: true });
    video.addEventListener('loadeddata', play, { passive: true });
    video.addEventListener('canplay', play, { passive: true });
    setTimeout(() => {
      if (video.readyState === 0) recover();
    }, 8000);
    if (index === 0) play();
  }

  function enableVideos() {
    const videos = [...document.querySelectorAll('video')];
    if (!videos.length) return;
    videos.forEach(armVideo);

    if ('IntersectionObserver' in window && !document.documentElement.dataset.aupingVideoObserver) {
      document.documentElement.dataset.aupingVideoObserver = '1';
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            video.play().catch(() => {});
          } else if (video !== videos[0]) {
            video.pause();
          }
        });
      }, { threshold: [0, 0.15, 0.5] });
      videos.forEach((video) => observer.observe(video));
    }
  }

  document.addEventListener('click', (event) => {
    const control = event.target.closest('button,a');
    if (!control) return;
    const text = textOf(control);
    const href = control.getAttribute('href') || '';

    if (text.includes('search') && !href) {
      event.preventDefault();
      const panel = searchUI();
      panel.classList.add('is-open');
      setTimeout(() => panel.querySelector('input').focus(), 10);
    }

    if ((text.includes('menu') || text.includes('navigation')) && !href && !control.closest('.auping-mobile-nav')) {
      event.preventDefault();
      const nav = mobileNav();
      nav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.is-open').forEach((element) => element.classList.remove('is-open'));
      document.body.style.overflow = '';
    }
  });

  const boot = () => {
    setupMegaMenus();
    enableVideos();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
  new MutationObserver(boot).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('pageshow', () => setTimeout(enableVideos, 100));
  setTimeout(boot, 800);
  setTimeout(boot, 2500);
})();
