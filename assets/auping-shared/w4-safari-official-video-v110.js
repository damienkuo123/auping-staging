/* Auping Final V2 W4 v1.1.0: Safari video readiness for SAME official media only.
   Never substitute a different film. Do not mask 0:00 with a poster as a passing result.
   This file touches only the two known VideoPlayer families. */
(()=>{'use strict';
const route=location.pathname.replace(/^\/auping-staging\//,'/');
const isMattress=route==='/mattresses/';const isBedLinen=route==='/bed-linen/';
if(!isMattress&&!isBedLinen)return;
const target=isMattress?'circular-mattresses.mp4':'video_banner_-_middle_page_0.mp4';
const find=()=>[...document.querySelectorAll('video')].find(v=>isBedLinen?Boolean(v.closest('section[data-section="VideoPlayer"]')):(v.getAttribute('src')||v.querySelector('source[src]')?.getAttribute('src')||'').includes(target));
let armed=false;
function prepare(){const v=find();if(!v||armed)return;armed=true;
 v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','true');
 v.controls=true;v.preload='auto';v.setAttribute('preload','auto');
 // The browser cannot autoplay with audio. Keep native controls to unmute if desired.
 v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.autoplay=true;v.setAttribute('autoplay','');
 // Do not loop an original editorial film that is meant to be user-controlled.
 v.dataset.aupingVideoSourceAuthority='original-official-unchanged';
 const state={ready:false,playing:false,advanced:false,error:null,start:0};
 const record=()=>{v.dataset.aupingVideoPlaybackProof=JSON.stringify({readyState:v.readyState,networkState:v.networkState,currentTime:v.currentTime,duration:Number.isFinite(v.duration)?v.duration:null,videoWidth:v.videoWidth,videoHeight:v.videoHeight,paused:v.paused,advanced:state.advanced,error:v.error?.code||null});};
 const play=()=>{v.play().catch(()=>{record();});};
 v.addEventListener('playing',()=>{state.playing=true;state.start=v.currentTime;record();},{passive:true});
 v.addEventListener('timeupdate',()=>{if(v.currentTime>Math.max(.2,state.start+.2))state.advanced=true;record();},{passive:true});
 v.addEventListener('loadedmetadata',()=>{record();play();},{passive:true});
 v.addEventListener('canplay',()=>{record();play();},{passive:true});
 v.addEventListener('error',record,{passive:true});
 // For source changes by the preview exact-authority capture, request one fresh load.
 try{v.load();}catch(e){}play();
 v.addEventListener('touchend',()=>{if(v.paused)play();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&v.paused)play();});
 window.addEventListener('pageshow',()=>{if(v.paused)play();});
 setTimeout(record,3500);setTimeout(record,8000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare,{once:true});else prepare();
setTimeout(prepare,1500);
})();
