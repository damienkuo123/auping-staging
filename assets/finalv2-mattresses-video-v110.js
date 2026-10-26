/* Mattresses official circular production video: native gesture-activated player. */
(()=>{'use strict';
function boot(){
  const section=[...document.querySelectorAll('[data-section="TwoColumn"]')].find(s=>s.textContent.includes('循環床墊'));
  if(!section)return;
  const video=section.querySelector('video');if(!video||video.dataset.aupingNativeVideoV110)return;
  video.dataset.aupingNativeVideoV110='1';video.controls=true;video.muted=true;
  video.setAttribute('controls','');video.setAttribute('playsinline','');video.preload='metadata';
  video.poster='/auping-staging/assets/finalv2-mattresses-20261021/circular-thumbnail.png';
  video.style.cssText+=';display:block!important;opacity:1!important;visibility:visible!important;position:relative!important;pointer-events:auto!important;z-index:2!important;';
  const overlay=video.parentElement?.querySelector('[class*="Video_VideoPreview"]');
  if(overlay){overlay.hidden=true;overlay.style.setProperty('display','none','important');overlay.setAttribute('aria-hidden','true');}
  video.addEventListener('error',()=>{section.dataset.aupingVideoError='media-error-'+(video.error?.code||'unknown')});
  video.addEventListener('playing',()=>{section.dataset.aupingVideoPlaying='1'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
