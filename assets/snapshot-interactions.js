(()=>{
  'use strict';

  const BASE = location.pathname.startsWith('/auping-staging') ? '/auping-staging' : '';
  const route = (path) => /^https?:/i.test(path) ? path : `${BASE}${path}`;
  const LOCAL_MEDIA_BASE = `${BASE}/assets/light-catalog/media/`;
  const LOCAL_WEBM_BASE = `${BASE}/assets/light-catalog/media/`;
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
          `${LOCAL_WEBM_BASE}${webmFile}`,
          `${LOCAL_MEDIA_BASE}${file}`,
          `${RAW_WEBM_BASE}${webmFile}`,
          `${GITHUB_WEBM_BASE}${webmFile}`,
          `${RAW_MEDIA_BASE}${file}`,
          `${GITHUB_MEDIA_BASE}${file}`
        ]
      : [
          `${LOCAL_MEDIA_BASE}${file}`,
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
/* AUPING-PARITY-WAVE1-START */
;(() => {
  'use strict';
  if (window.__AUPING_PARITY_WAVE1__) return;
  window.__AUPING_PARITY_WAVE1__ = true;

  const MOBILE = window.matchMedia('(max-width: 767px)');
  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const norm = (value) => clean(value).toLocaleLowerCase('en');

  const EXACT_TEXT = new Map([
    ['Electrically adjustable bed base 1M', '電動可調式床底 1M'],
    ['Electrically adjustable bed base 2M', '電動可調式床底 2M'],
    ['Electrically adjustable bed base 3M', '電動可調式床底 3M'],
    ['Manually adjustable bed base', '手動可調式床底'],
    ['Flat bed base', '固定式網狀床底'],
    ['Accessories', '配件'],
    ['Design', '設計'],
    ['Support', '支援'],
    ['Smart products', '智慧產品'],
    ['Nightstands', '床邊桌'],
    ['Bed lights', '床燈'],
    ['Decorative pillows', '裝飾抱枕'],
    ['Comfort mattress topper', 'Comfort 床墊舒適層'],
    ['Deluxe mattress topper', 'Deluxe 床墊舒適層'],
    ['Prestige mattress topper', 'Prestige 床墊舒適層'],
    ['Somnox sleep robot', 'Somnox 睡眠機器人'],
    ['Auping connect', 'Auping Connect'],
  ]);

  const DUTCH_CONTACT =
    'You can reach us every business day between 08:30 – 17:00 at the telephone number +31 570 681820 or send an email to info@auping.com';
  const TAIWAN_CONTACT =
    '台灣地區請前往「尋找門市」聯絡鄰近 Auping 門市，由門市人員提供產品與售後協助。';

  function localizeExactText(root = document) {
    const walker = document.createTreeWalker(
      root.body || root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || ['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let node;
    while ((node = walker.nextNode())) {
      const before = clean(node.nodeValue);
      if (!before) continue;
      if (EXACT_TEXT.has(before)) {
        node.nodeValue = node.nodeValue.replace(before, EXACT_TEXT.get(before));
        continue;
      }
      if (before.includes(DUTCH_CONTACT)) {
        node.nodeValue = node.nodeValue.replace(DUTCH_CONTACT, TAIWAN_CONTACT);
      }
    }
  }

  function chooseFooterGroup(label, footer) {
    let node = label;
    let best = null;
    for (let depth = 0; depth < 6 && node && node !== footer; depth += 1, node = node.parentElement) {
      const linkCount = node.querySelectorAll?.('a[href]').length || 0;
      const childCount = node.children?.length || 0;
      if (linkCount >= 2 && linkCount <= 30 && childCount >= 2) {
        best = node;
        break;
      }
    }
    return best;
  }

  function chooseFooterContent(label, group) {
    const direct = [...group.children];
    const headingChild = direct.find((child) => child === label || child.contains(label));
    if (headingChild) {
      const start = direct.indexOf(headingChild);
      for (const child of direct.slice(start + 1)) {
        if ((child.querySelectorAll?.('a[href]').length || 0) >= 1) return child;
      }
    }
    const candidates = [...group.querySelectorAll('ul,nav,[class*="links" i],[class*="content" i],[class*="list" i]')]
      .filter((node) => !node.contains(label) && (node.querySelectorAll('a[href]').length || 0) >= 1);
    if (candidates.length) {
      candidates.sort((a,b) => (a.querySelectorAll('*').length - b.querySelectorAll('*').length));
      return candidates[0];
    }
    return null;
  }

  function installFooterStyles() {
    if (document.getElementById('auping-parity-wave1-style')) return;
    const style = document.createElement('style');
    style.id = 'auping-parity-wave1-style';
    style.textContent = `
      @media (max-width:767px) {
        footer .auping-footer-accordion-trigger {
          cursor:pointer;
          position:relative;
          padding-right:30px !important;
          user-select:none;
        }
        footer .auping-footer-accordion-trigger::after {
          content:"";
          position:absolute;
          right:8px;
          top:50%;
          width:8px;
          height:8px;
          border-right:1.5px solid currentColor;
          border-bottom:1.5px solid currentColor;
          transform:translateY(-70%) rotate(45deg);
          transition:transform .22s ease;
          pointer-events:none;
        }
        footer .auping-footer-accordion-trigger[aria-expanded="true"]::after {
          transform:translateY(-30%) rotate(225deg);
        }
      }`;
    document.head.appendChild(style);
  }

  const FOOTER_DEFS = [
    { key:'products', labels:['Products','產品','商品'] },
    { key:'service-contact', labels:['Service & Contact','Service and Contact','服務與聯絡','服務與聯絡我們'] },
    { key:'about-auping', labels:['About Auping','關於 Auping'] },
  ];

  function setupFooterAccordion() {
    installFooterStyles();
    const footer = document.querySelector('footer');
    if (!footer) return;

    FOOTER_DEFS.forEach((def) => {
      if (footer.querySelector(`[data-auping-footer-accordion-key="${def.key}"]`)) return;
      const label = [...footer.querySelectorAll('button,h2,h3,h4,h5,h6,strong,p,span,div')]
        .find((el) => def.labels.some((x) => clean(el.textContent) === x));
      if (!label) return;
      const group = chooseFooterGroup(label, footer);
      if (!group) return;
      const content = chooseFooterContent(label, group);
      if (!content) return;

      const trigger = label.closest('button') || label;
      trigger.dataset.aupingFooterAccordionKey = def.key;
      trigger.classList.add('auping-footer-accordion-trigger');
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      if (!content.id) content.id = `auping-footer-${def.key}-${Math.random().toString(36).slice(2,8)}`;
      trigger.setAttribute('aria-controls', content.id);
      content.dataset.aupingFooterAccordionContent = def.key;

      const applyResponsiveState = () => {
        if (MOBILE.matches) {
          if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded','false');
          const opened = trigger.getAttribute('aria-expanded') === 'true';
          content.hidden = !opened;
        } else {
          content.hidden = false;
          trigger.removeAttribute('aria-expanded');
        }
      };
      const toggle = (event) => {
        if (!MOBILE.matches) return;
        event.preventDefault();
        event.stopPropagation();
        const opened = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', opened ? 'false' : 'true');
        content.hidden = opened;
      };
      trigger.addEventListener('click', toggle);
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') toggle(event);
      });
      if (MOBILE.addEventListener) MOBILE.addEventListener('change', applyResponsiveState);
      else MOBILE.addListener?.(applyResponsiveState);
      applyResponsiveState();
    });

    document.documentElement.dataset.aupingFooterParityReady = '1';
  }

  function bootParity() {
    localizeExactText();
    setupFooterAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootParity, { once:true });
  } else {
    bootParity();
  }
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      bootParity();
    });
  }).observe(document.documentElement, {childList:true,subtree:true});
  window.addEventListener('pageshow', () => setTimeout(bootParity, 100));
})();
/* AUPING-PARITY-WAVE1-END */

/* HUMANQA MOBILE PARITY GROUP PATCH BEGIN v1.0.3 */
;window.__aupingVerifiedAudioMp4={"1e148dd8972b04e0fe919757c882.mp4":true};
/* Auping human QA mobile shared four-issue candidate v1.0.0.
   Additive and idempotent; RC7, U4D, page navigation, sorting and Git remain owned by existing code.
   No arbitrary media URLs or replacement fonts. */
;(() => {
 'use strict';
 if (window.__aupingMobileHumanQaV1) return;
 window.__aupingMobileHumanQaV1 = true;
 const stats = {font:true, homePictures:[], carouselSections:[], videos:[], errors:[]};
 window.__aupingMobileHumanQaReport = stats;
 const mobile = () => matchMedia('(max-width:767px)').matches;
 const log = (name,e) => {stats.errors.push({component:name,error:String(e&&e.message||e)});};
 const on = (f) => {try{f()}catch(e){log(f.name||'callback',e)}};
 // Offline iOS/Android Traditional Chinese fallback; no external font dependencies.
 function fontStabilizer(){
  if(document.getElementById('auping-humanqa-font-style'))return;
  const st=document.createElement('style');st.id='auping-humanqa-font-style';
  st.textContent=`:root{--font-roboto:-apple-system,BlinkMacSystemFont,"PingFang TC","Microsoft JhengHei","Noto Sans TC",Arial,sans-serif;}
  html{font-synthesis:none;-webkit-text-size-adjust:100%;text-size-adjust:100%;}
  body,button,input,textarea,select{font-family:-apple-system,BlinkMacSystemFont,"PingFang TC","Microsoft JhengHei","Noto Sans TC",Arial,sans-serif;}
  [data-auping-mobile-root] :is(a,button,div,span,p,strong,li), footer :is(a,button,h2,h3,h4,p,span,strong,li), [data-section] :is(h1,h2,h3,h4,p,button,a,span,strong){font-variant-ligatures:none;}
  @media(max-width:767px){
  section[data-section="ModelSlider"] .slick-list{overflow-x:auto!important;overflow-y:hidden!important;touch-action:auto!important;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none;}
  section[data-section="ModelSlider"] .slick-list::-webkit-scrollbar{display:none;}
  section[data-section="ModelSlider"] .slick-track{transform:none!important;display:flex!important;float:none!important;width:max-content!important;min-width:max-content!important;}
  section[data-section="ModelSlider"] .slick-slide{float:none!important;flex:0 0 auto!important;scroll-snap-align:start;scroll-snap-stop:always;}
 }
  .auping-humanqa-sound{position:absolute;z-index:24;right:12px;top:12px;border:1px solid rgba(255,255,255,.85);background:rgba(0,0,0,.55);color:white;border-radius:24px;min-height:40px;min-width:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:6px 11px;font:600 14px/1.2 -apple-system,BlinkMacSystemFont,"PingFang TC",Arial,sans-serif;}
  .auping-humanqa-sound:focus-visible{outline:3px solid #00539f;outline-offset:2px;}`;
  document.head.appendChild(st);
 }
 function homePictures(){
   if(!mobile()) return;
   for(const picture of document.querySelectorAll('section[data-section="CategoryTiles"] picture')){
     if(picture.dataset.aupingHumanqaPicture)return;
     const localSource=[...picture.querySelectorAll('source[media]')].find(x=>/\/assets\/.*\.(?:webp|jpe?g|png|avif)/i.test(x.getAttribute('srcset')||''));
     const img=picture.querySelector('img');if(!localSource||!img)continue;
     const first=(localSource.getAttribute('srcset')||'').split(',')[0].trim().split(/\s+/)[0];
     if(!first||!first.startsWith('/auping-staging/assets/'))continue;
     picture.dataset.aupingHumanqaPicture='1';
     const remotes=[...picture.querySelectorAll('source:not([media])')];
     remotes.forEach(s=>s.setAttribute('srcset',localSource.getAttribute('srcset')));
     img.src=first;
     // Preserve desktop variants; remove an earlier remote srcset only where it would override mobile picture.
     img.removeAttribute('srcset');
     stats.homePictures.push({fallback:first,remoteCount:remotes.length});
   }
 }
 function sliderSetup(){
  if(!mobile())return; // never mutate the imported desktop Slick classes
  // The deployed Slick markup is a static snapshot; a live React Slick instance is absent.
  // Native CSS overflow + a document-capture horizontal gesture fallback cover card overlays.
  for(const section of document.querySelectorAll('section[data-section="ModelSlider"]')){
   if(section.dataset.aupingHumanqaSlider==='native-scroll-capture-v103')continue;
   const viewport=section.querySelector('.slick-list'),track=section.querySelector('.slick-track');
   if(!viewport||!track)continue;
   const slides=[...track.children].filter(x=>x.classList.contains('slick-slide'));
   if(slides.length<2)continue;
   section.dataset.aupingHumanqaSlider='native-scroll-capture-v103';
   viewport.setAttribute('tabindex',viewport.getAttribute('tabindex')||'0');
   viewport.setAttribute('role','region');viewport.setAttribute('aria-roledescription','carousel');
   viewport.setAttribute('aria-label','商品卡片輪播，可左右滑動');
   const width=()=>slides[0].getBoundingClientRect().width||slides[0].offsetWidth||320;
   const clamp=v=>Math.max(0,Math.min(viewport.scrollWidth-viewport.clientWidth,v));
   const update=()=>{
    const idx=Math.max(0,Math.min(slides.length-1,Math.round(viewport.scrollLeft/Math.max(1,width()))));
    section.dataset.aupingHumanqaIndex=String(idx);
    section.dataset.aupingHumanqaScroll=String(Math.round(viewport.scrollLeft));
    // The imported static Slick markup does not have a running Slick instance.
    // Its original mobile CSS dims every slide that is not .slick-current to 20%.
    // Keep the semantic/current visual state synchronized with actual scroll position.
    slides.forEach((slide,i)=>{
      const current=i===idx;
      slide.classList.toggle('slick-current',current);
      slide.classList.toggle('slick-active',current);
      slide.setAttribute('aria-hidden','false'); // peek-visible siblings must remain visible
      if(current)slide.setAttribute('aria-current','true');
      else slide.removeAttribute('aria-current');
    });
    return idx;
   };
   let frame=0;
   viewport.addEventListener('scroll',()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(update)},{passive:true});
   viewport.addEventListener('scrollend',update,{passive:true});
   viewport.addEventListener('keydown',e=>{
    if(e.target!==viewport||!['ArrowRight','ArrowLeft'].includes(e.key))return;
    e.preventDefault();const next=update()+(e.key==='ArrowRight'?1:-1);
    viewport.scrollTo({left:clamp(Math.max(0,next)*width()),behavior:'instant'});update();
   });
   let start=null;const inside=(t)=>{
    const r=viewport.getBoundingClientRect();
    return r.width>40&&r.height>40&&t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom;
   };
   // Capture on document: overlay elements may intercept the touch before it hits .slick-list.
   document.addEventListener('touchstart',e=>{
    if(!mobile()||e.touches.length!==1||!inside(e.touches[0]))return;
    const t=e.touches[0];start={id:t.identifier,x:t.clientX,y:t.clientY,at:viewport.scrollLeft,axis:'undecided',manualMoves:0};
    section.dataset.aupingHumanqaTouchStart='1';
   },{capture:true,passive:true});
   document.addEventListener('touchmove',e=>{
    if(!start||!mobile())return;
    const t=[...e.touches].find(q=>q.identifier===start.id);if(!t)return;
    const dx=t.clientX-start.x,dy=t.clientY-start.y;
    if(start.axis==='undecided'&&Math.max(Math.abs(dx),Math.abs(dy))>=10){
      start.axis=Math.abs(dx)>Math.abs(dy)*1.2?'horizontal':'vertical';
    }
    if(start.axis!=='horizontal')return;
    // Prevent vertical page scroll only after confirmed horizontal user intent.
    if(e.cancelable)e.preventDefault();
    viewport.scrollLeft=clamp(start.at-dx);
    start.manualMoves++;section.dataset.aupingHumanqaManualMoves=String(start.manualMoves);update();
   },{capture:true,passive:false});
   document.addEventListener('touchend',e=>{
    if(!start)return;
    const t=[...e.changedTouches].find(q=>q.identifier===start.id);if(!t)return;
    const s=start;start=null;
    if(s.axis!=='horizontal')return;
    const delta=s.x-t.clientX;
    if(Math.abs(delta)<36)return;
    const base=Math.round(s.at/Math.max(1,width()));
    const goal=Math.max(0,Math.min(slides.length-1,base+(delta>0?1:-1)));
    // A deterministic end snap ensures the carousel does not silently bounce to index 0.
    viewport.scrollTo({left:clamp(goal*width()),behavior:'instant'});
    update();section.dataset.aupingHumanqaCapturedSwipe='1';
   },{capture:true,passive:true});
   document.addEventListener('touchcancel',()=>{start=null},{capture:true,passive:true});
   update();
   stats.carouselSections.push({id:section.id||null,slides:slides.length,method:'native-scroll-plus-horizontal-capture',capture:'document'});
  }
 }
 function soundControls(){
  for(const video of document.querySelectorAll('video')){
   if(video.dataset.aupingHumanqaSoundReady)continue;
   if(!video.closest('[class*="Video_VideoInner__"]'))continue;
   const mf=(video.dataset.aupingMediaFile||video.querySelector('source[src]')?.getAttribute('src')||'').split('/').pop();
   if(!(window.__aupingVerifiedAudioMp4||{})[mf]){video.dataset.aupingHumanqaSoundReady='skipped';stats.videos.push({src:mf,audio:'UNVERIFIED_OR_SILENT_SOURCE'});continue;}
   video.dataset.aupingHumanqaMp4Audio='1';
   video.dataset.aupingHumanqaSoundReady='1';
   const host=video.parentElement; if(!host)continue;
   if(getComputedStyle(host).position==='static')host.style.position='relative';
   const btn=document.createElement('button');btn.type='button';btn.className='auping-humanqa-sound';
   btn.dataset.aupingHumanqaSoundToggle='1';btn.textContent='開啟聲音';btn.setAttribute('aria-label','開啟聲音');
   btn.setAttribute('aria-pressed','false');
   const sync=()=>{const isMuted=video.muted||video.volume===0;btn.textContent=isMuted?'開啟聲音':'靜音';btn.setAttribute('aria-label',btn.textContent);btn.setAttribute('aria-pressed',String(!isMuted));};
   btn.addEventListener('click',async e=>{
    e.preventDefault();e.stopPropagation();
    const wanted=!video.muted&&video.volume>0;
    if(!wanted){
      // Prefer local MP4 over alternate WebM when it includes the verified audio track.
      const mp4=video.dataset.aupingMediaFile;
      if(video.dataset.aupingHumanqaMp4Audio==='1'&&mp4&&video.currentSrc.endsWith('.webm')){
       const old=video.currentTime||0;
       video.src=`/auping-staging/assets/light-catalog/media/${mp4}`;
       video.load();video.addEventListener('loadedmetadata',()=>{try{video.currentTime=old}catch{}},{once:true});
      }
      video.muted=false;video.defaultMuted=false;video.removeAttribute('muted');video.volume=1;
      try{await video.play()}catch(err){video.dataset.aupingHumanqaAudioError=String(err)}
    }else{video.muted=true;video.defaultMuted=true;video.setAttribute('muted','');}
    sync();
   });
   video.addEventListener('volumechange',sync);
   host.appendChild(btn);sync();
   stats.videos.push({src:video.dataset.aupingMediaFile||video.currentSrc||null});
  }
 }
 function boot(){on(fontStabilizer);on(homePictures);on(sliderSetup);on(soundControls)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
 window.addEventListener('pageshow',boot);
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;boot()})}).observe(document.documentElement,{childList:true,subtree:true});
})();

/* HUMANQA MOBILE PARITY GROUP PATCH END */
