(()=>{
  'use strict';

  const BASE = location.pathname.startsWith('/auping-staging') ? '/auping-staging' : '';
  const route = (path) => /^https?:/i.test(path) ? path : `${BASE}${path}`;
  const RAW_MEDIA_BASE = 'https://raw.githubusercontent.com/damienkuo123/auping-staging/main/assets/light-catalog/media/';
  const GITHUB_MEDIA_BASE = 'https://github.com/damienkuo123/auping-staging/raw/refs/heads/main/assets/light-catalog/media/';
  const RAW_WEBM_BASE = 'https://raw.githubusercontent.com/damienkuo123/auping-staging/main/assets/light-catalog/media/';
  const GITHUB_WEBM_BASE = 'https://github.com/damienkuo123/auping-staging/raw/refs/heads/main/assets/light-catalog/media/';

  const links = [
    ['Box Springs 床組', '/box-springs/'], ['床架', '/beds/'], ['床墊', '/mattresses/'],
    ['床墊舒適層', '/toppers/'], ['床底', '/bed-bases/'], ['枕頭', '/pillows/'],
    ['寢具', '/bed-linen/'], ['尋找門市', 'https://www.auping.com/en/store-locator'],
    ['關於 Auping', '/about-auping/'], ['客戶服務', '/customer-service/']
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

  // Desktop/mobile navigation ownership moved to RC7.
  function armVideo(video, index) {
    if (video.dataset.aupingVideoReady) return;
    video.dataset.aupingVideoReady = '1';

    const current = video.getAttribute('src') || video.querySelector('source[src]')?.getAttribute('src') || '';
    const file = mediaFileFor(current);
    if (!file) return;

    const webmFile = file.replace(/\.mp4$/i, '.webm');
    const canWebM = Boolean(
      video.canPlayType('video/webm; codecs="vp8"') ||
      video.canPlayType('video/webm')
    );
    const candidates = canWebM
      ? [
          `${RAW_WEBM_BASE}${webmFile}`,
          `${GITHUB_WEBM_BASE}${webmFile}`,
          `${RAW_MEDIA_BASE}${file}`,
          `${GITHUB_MEDIA_BASE}${file}`
        ]
      : [
          `${RAW_MEDIA_BASE}${file}`,
          `${GITHUB_MEDIA_BASE}${file}`
        ];

    video.querySelectorAll('source').forEach((source) => source.remove());
    video.dataset.aupingMediaFile = file;
    video.dataset.aupingWebmFile = webmFile;
    video.dataset.aupingMediaCandidates = String(candidates.length);

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

    let candidate = -1;
    let lastAdvance = 0;
    const play = () => video.play().catch(() => {});
    const useNextCandidate = () => {
      const now = Date.now();
      if (now - lastAdvance < 300) return false;
      lastAdvance = now;
      candidate += 1;
      if (candidate >= candidates.length) {
        video.dataset.aupingMediaExhausted = 'true';
        return false;
      }
      video.dataset.aupingMediaCandidate = String(candidate);
      video.src = candidates[candidate];
      try { video.load(); } catch {}
      play();
      return true;
    };

    video.addEventListener('error', useNextCandidate, { passive: true });
    video.addEventListener('loadeddata', play, { passive: true });
    video.addEventListener('canplay', play, { passive: true });
    useNextCandidate();

    [5000, 11000, 18000].forEach((delay) => {
      setTimeout(() => {
        if (video.readyState === 0) useNextCandidate();
      }, delay);
    });
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
  const boot = () => {
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
/* RC6: visual-only poster fallback and captured-noise cleanup. Search, mobile menu,
   filters and route ownership live exclusively in assets/rc6-runtime.js. */
;(() => {
  'use strict';
  const script = [...document.scripts].find((node) => /snapshot-interactions\.js(?:\?|$)/.test(node.src));
  const assetBase = script?.src ? new URL('.', script.src) : new URL('/assets/', location.origin);
  const posterBase = new URL('hybrid-posters/', assetBase).href;
  const posterFiles = new Set([
    '1e148dd8972b04e0fe919757c882.mp4','fdfaecfdf94deb4e840c6b83c202.mp4',
    '927e13502742db5ff7e642b84de9.mp4','2c7f60394e11ffca478b4cf3324f.mp4',
    'e9b877417b0f4a580bed30e01448.mp4','2a7be2063982a32f62c283deeca6.mp4',
    '1c887ed4fb0aa061cf0eeca786c3.mp4','7a6e9914db47f88e9c9415e507ed.mp4',
    '193fbd75c0b38f98e24babb9116b.mp4','a3315162a17e816d46aa5b3f1a3b.mp4'
  ]);
  const mediaFile = (video) => {
    const source = video.currentSrc || video.getAttribute('src') || video.querySelector('source[src]')?.getAttribute('src') || '';
    try { return new URL(source, location.href).pathname.split('/').pop() || ''; }
    catch { return source.split('/').pop()?.split('?')[0] || ''; }
  };
  function preparePoster(video, index) {
    if (video.dataset.aupingPosterReady === 'true') return;
    video.dataset.aupingPosterReady = 'true';
    const file = mediaFile(video);
    if (!posterFiles.has(file)) return;
    const poster = new URL(file.replace(/\.mp4$/i, '.jpg'), posterBase).href;
    video.poster = poster;
    video.setAttribute('poster', poster);
    video.style.backgroundImage = `url("${poster}")`;
    video.style.backgroundPosition = 'center';
    video.style.backgroundSize = 'cover';
    const parent = video.parentElement;
    let overlay = parent?.querySelector(':scope > .auping-video-poster-fallback');
    if (parent && !overlay) {
      overlay = document.createElement('div');
      overlay.className = 'auping-video-poster-fallback';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.backgroundImage = `url("${poster}")`;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      video.insertAdjacentElement('afterend', overlay);
    }
    const showVideo = () => overlay?.classList.add('is-hidden');
    const showPoster = () => overlay?.classList.remove('is-hidden');
    video.addEventListener('loadeddata', showVideo, { passive: true });
    video.addEventListener('canplay', showVideo, { passive: true });
    video.addEventListener('playing', showVideo, { passive: true });
    video.addEventListener('error', showPoster, { passive: true });
    if (video.readyState >= 2) showVideo(); else showPoster();
    setTimeout(() => video.readyState >= 2 ? showVideo() : showPoster(), index === 0 ? 4500 : 7000);
  }
  function cleanCapturedNoise() {
    document.querySelectorAll('#CybotCookiebotDialog,#CybotCookiebotDialogBodyUnderlay,[id^="batBeacon"],.sqzly-personalization').forEach((node) => node.remove());
  }
  function boot() {
    cleanCapturedNoise();
    [...document.querySelectorAll('video')].forEach(preparePoster);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  new MutationObserver(boot).observe(document.documentElement, { childList: true, subtree: true });
})();
