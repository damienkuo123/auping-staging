;(() => {
'use strict';
const VERSION='2026-09-12-rc7.3.2-readmore-bridge-safe',DATA_VERSION='20260805-rc731';
const OFFICIAL=Object.freeze({searchActive:'Header_active__TW9UV',desktopMenuActive:'MainMenu_active__e6SsM',mobileRootOpen:'FullPageMenu_FullPageMenu--open__LGkFN',mobileSubmenuOpen:'FullPageMenu_FullPageMenu__submenu--open__tbTap'});
if(window.__AUPING_RC7_LOADING__)return;window.__AUPING_RC7_LOADING__=VERSION;
const BASE=location.pathname.startsWith('/auping-staging')?'/auping-staging':'';
const currentScript=[...document.scripts].find(n=>/rc7-runtime\.js(?:\?|$)/.test(n.src));
const assetBase=window.__AUPING_RC7_ASSET_BASE__?new URL(window.__AUPING_RC7_ASSET_BASE__,location.href):(currentScript?.src?new URL('.',currentScript.src):new URL(`${BASE}/assets/`,location.origin));
const dataBase=new URL('../data/',assetBase),$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={routes:[],routeById:new Map(),routeByPath:new Map(),products:[],search:[],filters:[]};
function normalizePath(value){try{const u=new URL(value,window.__AUPING_RC7_URL_BASE__||location.href);let p=decodeURI(u.pathname).replace(/^(?:\/auping-staging)+(?=\/|$)/,'')||'/';p=p.replace(/^\/(?:en|zh-tw|zh)(?=\/|$)/i,'')||'/';if(!p.endsWith('/')&&!/\.[a-z0-9]+$/i.test(p))p+='/';return p.replace(/\/+/g,'/')}catch{return'/'}}
function localUrl(p){const n=normalizePath(p);return`${BASE}${n==='/'?'/':n}`}
function routeFor(v){try{const u=new URL(v,window.__AUPING_RC7_URL_BASE__||location.href);const h=u.hostname.toLowerCase(),sameOrigin=u.origin===location.origin,officialAuping=h==='www.auping.com'||h==='auping.com';if(!sameOrigin&&!officialAuping)return null;return state.routeByPath.get(normalizePath(u.href).toLowerCase())||null}catch{return null}}
function resolveRoute(x){const r=typeof x==='string'?(state.routeById.get(x)||routeFor(x)):x;if(!r)return{mode:'UNKNOWN',href:null,route:null};if(/^LOCAL_/.test(r.mode))return{mode:r.mode,href:localUrl(r.targetPath||r.localPath),route:r};if(r.mode==='OFFICIAL_REDIRECT')return{mode:r.mode,href:r.officialUrl,route:r};if(r.mode==='DISABLED'&&r.fallbackPath)return{mode:r.mode,href:localUrl(r.fallbackPath),route:r};return{mode:r.mode,href:null,route:r}}
async function loadJSON(n){const u=new URL(n,dataBase);u.searchParams.set('v',DATA_VERSION);const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error(`${n}: HTTP ${r.status}`);return r.json()}
async function loadData(){const[r,p,f,s]=await Promise.all(['rc6-routes.json','rc6-products.json','rc6-filter-schema.json','rc6-search-index.json'].map(loadJSON));state.routes=r.routes||[];state.products=p.products||[];state.filters=f.categories||[];state.search=s.items||[];state.routeById=new Map(state.routes.map(x=>[x.id,x]));state.routeByPath=new Map(state.routes.map(x=>[normalizePath(x.localPath).toLowerCase(),x]))}
function enforceCurrentRoute(){const r=routeFor(location.href);if(!r)return false;const x=resolveRoute(r);if(r.mode==='OFFICIAL_REDIRECT'&&x.href&&!/^https?:\/\/(?:damienkuo123\.github\.io|localhost|127\.0\.0\.1)/i.test(x.href)){document.documentElement.classList.add('rc7-redirecting');location.replace(x.href+location.search+location.hash);return true}if(r.mode==='LOCAL_ALIAS'&&x.href){const here=localUrl(r.localPath),target=x.href;if(target!==here){location.replace(target+location.hash);return true}}if(r.mode==='DISABLED'&&x.href&&normalizePath(x.href)!==normalizePath(location.href)){location.replace(x.href+location.search+location.hash);return true}return false}
function rewriteLinks(root=document){root.querySelectorAll?.('a[href]').forEach(a=>{if(a.dataset.aupingRouteReady==='1'||a.dataset.aupingOfficialExit==='1')return;let u;try{u=new URL(a.getAttribute('href'),location.href)}catch{return}if(!['http:','https:'].includes(u.protocol))return;const r=routeFor(u.href);if(!r)return;const x=resolveRoute(r);a.dataset.aupingRouteReady='1';a.dataset.aupingRouteId=r.id;a.dataset.aupingRouteMode=r.mode;if(!x.href){a.removeAttribute('href');a.setAttribute('aria-disabled','true');return}a.href=x.href;if(r.mode==='OFFICIAL_REDIRECT')a.rel='noopener noreferrer'})}
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function searchRows(query){const q=query.trim().toLocaleLowerCase('zh-Hant');if(!q)return[];return state.search.map(item=>{const t=item.title.toLocaleLowerCase('zh-Hant'),h=[item.title,item.summary,...(item.keywords||[])].join(' ').toLocaleLowerCase('zh-Hant');let score=0;if(t===q)score+=100;if(t.startsWith(q))score+=50;if(t.includes(q))score+=30;if(h.includes(q))score+=14;q.split(/\s+/).forEach(k=>{if(k&&h.includes(k))score+=3});return{item,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title,'zh-Hant')).slice(0,24).map(x=>x.item)}
function setupSearch(){const trigger=$('[data-auping-search-trigger]'),region=$('[data-auping-search-region]'),form=$('[data-auping-search-form]'),input=$('[data-auping-search-input]'),results=$('[data-auping-search-results]');if(!trigger||!region||!form||!input||!results)return null;let opened=region.classList.contains(OFFICIAL.searchActive);const setOpen=(next,{focus=false}={})=>{opened=!!next;region.classList.toggle(OFFICIAL.searchActive,opened);region.setAttribute('aria-hidden',opened?'false':'true');trigger.setAttribute('aria-expanded',opened?'true':'false');if(!opened){results.hidden=true;results.innerHTML=''}else if(focus)setTimeout(()=>input.focus(),180);document.documentElement.dataset.aupingSearchState=opened?'open':'closed'};const render=()=>{const q=input.value.trim(),rows=searchRows(q);results.hidden=false;results.innerHTML=`<div class="rc7-search-results__inner"><div class="rc7-search-results__meta">${q?`「${esc(q)}」找到 ${rows.length} 筆結果`:'請輸入搜尋內容'}</div><div class="rc7-search-results__grid">${rows.length?rows.map(item=>{const x=resolveRoute(item.routeId);return x.href?`<a class="rc7-search-result" href="${esc(x.href)}" data-auping-search-result="${esc(item.routeId)}"><strong>${esc(item.title)}</strong><span>${esc(item.summary||'')}</span></a>`:''}).join(''):'<p class="rc7-search-results__empty">找不到符合內容，請嘗試其他關鍵字。</p>'}</div></div>`};trigger.addEventListener('click',e=>{e.preventDefault();window.AupingRC7MobileMenu?.close({restoreFocus:false});setOpen(!opened)});trigger.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(!opened,{focus:!opened})}});form.addEventListener('submit',e=>{e.preventDefault();if(!opened)setOpen(true);render()});input.addEventListener('keydown',e=>{if(e.key!=='Escape')return;e.preventDefault();if(!results.hidden){results.hidden=true;results.innerHTML=''}else if(input.value)input.value='';else{setOpen(false);trigger.focus()}});setOpen(opened);document.documentElement.dataset.aupingSearchReady='1';return window.AupingRC7Search={open:o=>setOpen(true,o),close:()=>setOpen(false),toggle:()=>setOpen(!opened),renderResults:render,searchRows}}
function setupDesktopNavigation(){const root=$('[data-auping-desktop-nav]');if(!root)return null;const items=$$('[data-auping-desktop-item]',root).map(item=>({item,trigger:$('[data-auping-desktop-trigger]',item),panel:$('[data-auping-desktop-panel]',item)})).filter(x=>x.trigger&&x.panel);let active=null,timer=0;const close=()=>{clearTimeout(timer);items.forEach(x=>{x.panel.classList.remove(OFFICIAL.desktopMenuActive);x.trigger.setAttribute('aria-expanded','false');x.item.dataset.aupingDesktopState='closed'});active=null;document.documentElement.dataset.aupingDesktopMenuState='closed'};const open=entry=>{clearTimeout(timer);items.forEach(x=>{const on=x===entry;x.panel.classList.toggle(OFFICIAL.desktopMenuActive,on);x.trigger.setAttribute('aria-expanded',on?'true':'false');x.item.dataset.aupingDesktopState=on?'open':'closed'});active=entry;document.documentElement.dataset.aupingDesktopMenuState=entry.item.dataset.aupingDesktopItem};const later=()=>{clearTimeout(timer);timer=setTimeout(close,140)};items.forEach(x=>{x.item.addEventListener('mouseenter',()=>open(x));x.item.addEventListener('mouseleave',later);x.item.addEventListener('focusin',()=>open(x));x.item.addEventListener('focusout',e=>{if(!x.item.contains(e.relatedTarget))later()});x.trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open(x);x.panel.querySelector('a,button')?.focus()}else if(e.key==='Escape'){e.preventDefault();close();x.trigger.focus()}})});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)close()});document.addEventListener('pointerdown',e=>{if(active&&!root.contains(e.target))close()});window.addEventListener('scroll',close,{passive:true});window.addEventListener('resize',close,{passive:true});document.documentElement.dataset.aupingDesktopMenuReady=String(items.length);return window.AupingRC7DesktopMenu={open:key=>{const x=items.find(v=>v.item.dataset.aupingDesktopItem===key);if(x)open(x)},close}}
function setupMobileNavigation(){const trigger=$('[data-auping-mobile-trigger]'),root=$('[data-auping-mobile-root]');if(!trigger||!root)return null;const overlay=$('[data-auping-mobile-overlay]',root),subs=$$('[data-auping-mobile-submenu]',root);let previous=null;const closeSubs=()=>{subs.forEach(s=>{s.classList.remove(OFFICIAL.mobileSubmenuOpen);s.setAttribute('aria-hidden','true')});root.dataset.aupingMobileLevel='root'};const open=()=>{window.AupingRC7Search?.close();previous=document.activeElement;closeSubs();root.classList.add(OFFICIAL.mobileRootOpen);root.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');document.documentElement.dataset.aupingMobileMenuState='root';setTimeout(()=>$('[data-auping-mobile-close]',root)?.focus(),180)};const close=({restoreFocus=true}={})=>{closeSubs();root.classList.remove(OFFICIAL.mobileRootOpen);root.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');document.documentElement.dataset.aupingMobileMenuState='closed';if(restoreFocus)previous?.focus?.()};const openSubmenu=key=>{const s=subs.find(n=>n.dataset.aupingMobileSubmenu===key);if(!s)return;closeSubs();s.classList.add(OFFICIAL.mobileSubmenuOpen);s.setAttribute('aria-hidden','false');root.dataset.aupingMobileLevel=key;document.documentElement.dataset.aupingMobileMenuState=key;setTimeout(()=>$('[data-auping-mobile-back]',s)?.focus(),180)};trigger.addEventListener('click',e=>{e.preventDefault();open()});root.addEventListener('click',e=>{if(e.target.closest('[data-auping-mobile-close]')){e.preventDefault();close();return}if(e.target.closest('[data-auping-mobile-back]')){e.preventDefault();closeSubs();document.documentElement.dataset.aupingMobileMenuState='root';return}const item=e.target.closest('[data-auping-mobile-item]');if(item&&!e.target.closest('a[href]')&&subs.some(s=>s.dataset.aupingMobileSubmenu===item.dataset.aupingMobileItem)){e.preventDefault();openSubmenu(item.dataset.aupingMobileItem);return}if(e.target.closest('a[href]'))close({restoreFocus:false})});overlay?.addEventListener('click',()=>close());document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains(OFFICIAL.mobileRootOpen)){e.preventDefault();subs.some(s=>s.classList.contains(OFFICIAL.mobileSubmenuOpen))?(closeSubs(),document.documentElement.dataset.aupingMobileMenuState='root'):close()}});close({restoreFocus:false});document.documentElement.dataset.aupingMobileMenuReady=String(subs.length);return window.AupingRC7MobileMenu={open,close,openSubmenu}}
function productMatches(product,selected){return Object.entries(selected).every(([key,values])=>!values.length||values.some(v=>(Array.isArray(product.attributes?.[key])?product.attributes[key]:[]).includes(v)))}
function setupAccordions(root=document){const buttons=$$('button[aria-controls][aria-expanded]',root).filter(b=>b.closest('[class*="Accordion_item"]')&&document.getElementById(b.getAttribute('aria-controls')));const setOpen=(button,next)=>{const content=document.getElementById(button.getAttribute('aria-controls')),item=button.closest('[class*="Accordion_item"]'),icon=button.querySelector('[class*="Accordion_icon"]');if(!content)return;button.dataset.aupingAccordionTrigger='1';content.dataset.aupingAccordionContent='1';button.setAttribute('aria-expanded',next?'true':'false');content.setAttribute('aria-hidden',next?'false':'true');item?.setAttribute('data-state',next?'open':'closed');icon?.classList.toggle('Accordion_active__zxVoN',next);content.style.overflow='hidden';content.style.height=next?`${content.scrollHeight}px`:'0px';};buttons.forEach(button=>{const content=document.getElementById(button.getAttribute('aria-controls'));setOpen(button,button.getAttribute('aria-expanded')!=='false');button.addEventListener('click',e=>{e.preventDefault();setOpen(button,button.getAttribute('aria-expanded')!=='true')});content?.addEventListener('transitionend',()=>{if(button.getAttribute('aria-expanded')==='true')content.style.height='auto'})});document.documentElement.dataset.aupingAccordionReady=String(buttons.length);return window.AupingRC7Accordions={buttons,setOpen}}

function setupReadMore(root=document){
  // R5.1: only a *proven, physically clipped piece of text* earns a Read More button.
  // Do not confuse flex gaps, three feature bullets, nested layout, or total container height with hidden text.
  const PROVEN_IDS=new Set(["1f7b8818-e9fb-440e-a52b-4dc35892254b", "361df142-1237-4e86-973d-e61867fe9b8c", "364d1771-acaa-4fd3-9a9f-e4c0f717b317", "69f0e970-6fa0-48aa-b618-dddb690f6308", "7d0f4359-b49f-4b40-82ba-00245cfc934f", "8452b940-2cfe-4a5e-ae82-bb578e0fcf66", "a92b0243-1f3e-4303-9dc4-a68528855c81", "c89634b8-1de0-418d-bf26-c16406c892be", "e2b1af40-baae-4151-a130-55dd93f68e57", "f04a225a-0553-41a3-b055-2ce20cb3c4b8"]);
  const OFFICIAL_NO_BUTTON_IDS=new Set(["04886b56-ebfb-4dfa-a8d0-c03f42df28db", "0812339c-83dd-4da5-a193-102a0429bdc3", "0ae67dc2-5b11-41d4-b2e4-0e6f511c07cb", "0f8ad5b1-b8b3-49d0-92c2-cadb665f2e17", "12cdab99-d574-453e-973c-6551a7a6ee29", "177117bd-5882-427b-b774-14b74ca64dc3", "206db1f8-3714-486d-a977-952af1f6305d", "20ab4145-207d-4e2c-a99e-31328970447d", "23e8cc52-b585-4bb7-b30e-372ba5f09636", "23fd3da3-f287-43f5-b297-dfceb5757542", "2652c1b6-1932-4b55-855b-89dcdeba4187", "271d3867-0d2a-4bd4-8adc-43dfb3fb7ac8", "2b395ef8-a726-4f0e-8226-24912b3defa2", "2eaa04b7-430c-436c-85c2-05bcbd01812c", "3353e7fa-0071-4640-b8a5-e34d171e796a", "344c03d2-debf-4a7b-8180-d32edf44477d", "358b65ee-1e2e-4ad4-9d41-22845fa970aa", "3bfa3177-3c75-43c8-91af-15867f204705", "3ec3144f-4567-4297-91e0-71a9ca79b25d", "4efdbe0e-5f23-4db1-94d0-03e1682fe247", "534dbac0-4cde-408c-b9ca-6b70a76d0763", "53c714c8-31f5-4283-a24c-950d597acfb9", "53ef2e81-edeb-4bae-94df-f8a121ddf11d", "5625632b-10df-40ce-9187-b74e9dd4110a", "5d89c67e-1724-41d0-99c4-a72e009ac9e1", "5f955815-d594-445c-a5ba-4ab42ef9d5ce", "6fde8009-0c11-4c06-91a9-88948dc54d36", "702587eb-cea1-4614-88e8-1939b02eb8a6", "78daceaa-5107-4785-8746-b8952ad925ed", "7ad44602-0925-4e07-8a43-0941dba39fca", "7d1313c5-2250-4dba-95eb-62c809875e15", "7f721b08-cedf-47a7-b3e4-6f4ae27e6a2b", "841e1334-713b-433c-911e-ee7913afeb65", "85097248-f083-44a6-902e-778b758544d1", "87ed0fe5-de77-454a-abc6-917ada24535b", "88810b1c-fed1-48ed-9e14-645e5e600835", "90127445-983f-4284-a872-b2cf4a3bb656", "972e8838-5e0c-469f-a8e3-99c9ae83c52c", "97cdd2de-b98a-417a-a72f-415d69921355", "9e4f9207-65d2-40e7-9fab-e06ec4fdbda3", "9fad8d05-9f03-4091-9227-4707fcae1227", "a484685e-3cb0-4bdb-8214-c9b0f38277df", "b1a61b13-b155-47f7-a741-6923379b0aa5", "ba3144a3-45fc-4afa-a2a4-ea416857feba", "bb476a15-61eb-408b-951f-43f3bc17df52", "be914952-eb8e-40fc-ac24-0694a9d27e79", "c9a2ae14-d60f-4d56-bdb8-7747b4db84ee", "cbac919a-f888-4bac-895d-e477a642cca2", "d7a7146c-72ae-4e4c-a621-1fd23d97b2b4", "d829ef7e-c558-455e-901f-c85f280b99f6", "ef5aa190-82d6-4b71-bf45-edda7e0489fd", "f1a9b1aa-6c63-4d44-a68f-d9ffb98b4448"]);
  const R4_SOURCE_IDS=new Set(["0ab99c50-00e5-498e-8c0f-90517a319135", "1606bd10-89f5-48a7-b307-78c23b1b6c55", "1fca1b26-4a11-4a51-9aea-8457eff805be", "231e7388-209e-4ba1-bcca-3681e3990291", "367694fb-2902-4182-a7c9-68ca49192dd1", "5ff8723b-8abd-4a19-a625-334250e64ce2", "a263563c-5a25-4724-8036-7c602a35b934", "a4e6e501-16e4-4a64-a9ff-0782519ca5c4", "a5943b58-193e-4d40-8ffe-e9ccb6dd0ab1", "a97334ac-87f7-4f5e-a0c2-59694ec42b64", "af445305-88b6-4faf-8dd5-01a041fecbfd", "b2bc90e6-677c-436c-bf2b-9ec5aaf39c46", "b8b07b7c-4fc3-43a8-8ced-91b32fc0518c", "c524320a-c0c5-416f-ac97-b779df590630", "c67afe1b-29ee-4d52-ad80-8a0dfd0b6415", "cd4cfbc4-2e85-4e2d-9629-83ba68f076d4", "f4e64585-aee8-456c-a1b4-42e1b065f77b"]);
  const entries=[];
  const stats={version:'R5.1-REAL-VISIBLE-TEXT-GATE',openable:0,short:0,structural:0,noButton:0,sourceRequired:0,owned:0,media:0,created:0,failClosed:0,errors:[]};
  const selector='[class*="ReadMore_base"]';
  const norm=x=>(x?.textContent||'').replace(/\s+/g,' ').trim();
  const label=b=>[...b.querySelectorAll('span')].reverse().find(n=>norm(n))||b;
  const EPS=3;
  function prop(el,name,value){el.style.setProperty(name,value,'important')}
  function nativeLayout(e){
    const t=e.body;
    // This is a full-text state. Never change DOM contents, source wording or flex children.
    prop(t,'display',e.display);prop(t,'max-height','none');prop(t,'height','auto');
    prop(t,'min-height','0px');prop(t,'overflow','visible');
    prop(t,'-webkit-line-clamp','unset');prop(t,'-webkit-box-orient','initial');
    if(e.display.includes('flex'))prop(t,'flex-direction',e.direction);
  }
  function lineRects(t){
    // DOM Range rectangles represent *actual rendered text lines*, not the height of
    // a surrounding flex/grid/list container. No fixed character-count shortcut.
    const tw=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);
    let n,boxes=[];
    while((n=tw.nextNode())){
      if(!n.textContent.trim()||n.parentElement?.closest('script,style,noscript,template,[hidden]'))continue;
      const r=document.createRange();r.selectNodeContents(n);
      for(const q of r.getClientRects())if(q.width>0&&q.height>0&&Number.isFinite(q.top))boxes.push({top:q.top,bottom:q.bottom});
      r.detach?.();
    }
    boxes.sort((a,b)=>a.top-b.top||a.bottom-b.bottom);
    const lines=[];
    for(const b of boxes){const line=lines.find(x=>Math.abs(x.top-b.top)<2);
      if(line)line.bottom=Math.max(line.bottom,b.bottom);else lines.push({...b});}
    lines.sort((a,b)=>a.top-b.top);
    return lines;
  }
  function full(e,decision){
    e.openable=false;e.expanded=false;nativeLayout(e);
    if(e.button){e.button.hidden=true;e.button.setAttribute('aria-expanded','false')}
    e.wrapper.dataset.aupingR3bDecision=decision;e.wrapper.dataset.aupingReadMoreState='full';
    return false;
  }
  function buttonLabel(e,on){
    if(!e.button)return;
    e.button.hidden=false;
    e.button.setAttribute('aria-expanded',String(on));
    label(e.button).textContent=on?'收起':'閱讀更多';
    const ic=e.button.querySelector('[class*="Button_icon"],svg');if(ic)ic.style.transform=on?'rotate(180deg)':'';
  }
  function opened(e,on){
    if(!e.openable)return false;
    e.expanded=!!on;
    nativeLayout(e);
    if(!on){
      // Actual physical clipping, NOT -webkit-line-clamp on display:flex (which does nothing).
      prop(e.body,'height',e.fold+'px');
      prop(e.body,'max-height',e.fold+'px');
      prop(e.body,'overflow','hidden');
    }
    const now=e.body.getBoundingClientRect().height;
    if((on&&now<e.natural-EPS)||(!on&&now>e.fold+EPS)){
      stats.failClosed++;return full(e,'FAIL_CLOSED_INEFFECTIVE_CLIP');
    }
    e.wrapper.dataset.aupingReadMoreState=on?'open':'closed';
    e.wrapper.dataset.aupingR3bExpanded=String(on);
    buttonLabel(e,on);return true;
  }
  function measure(e){
    nativeLayout(e);
    const natural=e.body.getBoundingClientRect().height;
    const lines=lineRects(e.body);
    e.wrapper.dataset.aupingR51RenderedLines=String(lines.length);
    e.wrapper.dataset.aupingR51NaturalHeight=String(Math.round(natural));
    // Document may have headings, native lists, images, or feature-grid layout.
    // Such archetypes cannot be truncated by this text-only component.
    if(e.noButton)return full(e,'OFFICIAL_NO_BUTTON_FULL_VISIBLE');
    if(e.incomplete)return full(e,'SOURCE_REQUIRED_NOT_FAKE_FOLD');
    if(e.structural)return full(e,'STRUCTURAL_CONTENT_FULL_VISIBLE');
    if(e.mediaOnly)return full(e,'MEDIA_FULL_VISIBLE');
    if(e.featureSummary)return full(e,'FEATURE_SUMMARY_FULL_VISIBLE');
    if(lines.length<=3||natural<=0||!e.body.getClientRects().length)return full(e,'SHORT_FULL_VISIBLE');
    // Clamp at a measured text line boundary, retaining the original flex/block layout.
    const top=e.body.getBoundingClientRect().top;
    const fold=Math.ceil(lines[2].bottom-top+2);
    const hiddenText=lines.some(line=>line.bottom>top+fold+EPS);
    if(!hiddenText||natural<fold+12)return full(e,'NO_ACTUAL_HIDDEN_TEXT');
    e.fold=fold;e.natural=natural;
    if(!e.button){
      const b=document.createElement('button');b.type='button';
      b.className='Button_base__meou1 Button_secondary__qlOqp Button_medium___J0He Button_trailing__zkPOT ReadMore_Button__eU04h';
      b.innerHTML='<span class="Button_icon__63YhN" aria-hidden="true">⌄</span><span>閱讀更多</span>';
      e.wrapper.appendChild(b);e.button=b;stats.created++;
    }
    e.openable=true;
    if(!e.button.dataset.aupingR51Bound){
      e.button.dataset.aupingR51Bound='1';
      e.button.addEventListener('click',ev=>{ev.preventDefault();opened(e,!e.expanded)});
    }
    if(!opened(e,e.expanded))return false;
    e.wrapper.dataset.aupingR3bDecision=e.verified?'PROVEN_VISIBLE_TEXT_FOLD':'PHYSICAL_VISIBLE_TEXT_FOLD';
    return true;
  }
  const wrappers=[...root.querySelectorAll(selector)];
  for(const wrapper of wrappers){
    const body=wrapper.querySelector('[class*="ReadMore_text"]');if(!body)continue;
    const section=wrapper.closest('section[data-section="TruncatedText"]');
    const button=wrapper.querySelector('button[class*="ReadMore_Button"]');
    if((button&&button.hasAttribute('data-auping-disclosure-control'))||wrapper.hasAttribute('data-auping-disclosure-key')){
      wrapper.dataset.aupingR3bDecision='NATIVE_OWNER_UNTOUCHED';stats.owned++;continue;
    }
    // No second controller for incidental wrappers without a real text section/button.
    if(!section&&!button)continue;
    const id=section?.id||'';
    const source=norm(body);
    const children=[...body.children].filter(x=>x.tagName!=='SCRIPT');
    const hasStructural=children.some(x=>['STYLE','DIV','SECTION','ARTICLE','TABLE','FIGURE','IFRAME','VIDEO','PICTURE'].includes(x.tagName));
    const lists=children.filter(x=>x.matches('ul,ol'));
    const media=!!body.querySelector('img,video,iframe,svg,picture');
    const p=children.filter(x=>x.matches('p'));
    const nonTextualList=lists.length>0&&p.length===0&&children.every(x=>x.matches('ul,ol'));
    // A short set of feature points (including the reported three mesh-bed benefits)
    // is a full visible summary, not a text article. Do not manufacture a disclosure.
    const smallList=nonTextualList&&lists.reduce((n,x)=>n+x.children.length,0)<=3;
    const smallParagraphSummary=!lists.length&&p.length>0&&p.length<=3&&p.every(x=>{
      const st=getComputedStyle(x);const line=parseFloat(st.lineHeight)||24;
      return x.getBoundingClientRect().height<=(line*2)+EPS;
    });
    const verified=PROVEN_IDS.has(id)||R4_SOURCE_IDS.has(id);
    const e={wrapper,body,button,verified,expanded:false,openable:false,
      noButton:OFFICIAL_NO_BUTTON_IDS.has(id)||!!section?.dataset.aupingR57OfficialNoButton,
      incomplete:!verified&&/(?:\.{3}|…)[\s\u00a0]*$/.test(source),
      structural:hasStructural,
      featureSummary:smallList||(!verified&&smallParagraphSummary),
      mediaOnly:(!source&&media),
      display:getComputedStyle(body).display,
      direction:getComputedStyle(body).flexDirection||'column'};
    entries.push(e);
    try{measure(e)}catch(err){stats.errors.push({id,error:String(err)});full(e,'MEASURE_ERROR')}
  }
  function recompute(){for(const e of entries){try{measure(e)}catch(err){stats.errors.push({id:e.wrapper.closest('section')?.id||'',error:String(err)})}}
    stats.openable=entries.filter(x=>x.openable).length;
    stats.short=entries.filter(x=>!x.openable).length;
    stats.structural=entries.filter(x=>x.structural).length;
    stats.noButton=entries.filter(x=>x.noButton).length;
    stats.sourceRequired=entries.filter(x=>x.incomplete).length;
    stats.media=entries.filter(x=>x.mediaOnly).length;
    document.documentElement.dataset.aupingR51Ready=String(entries.length);
  }
  let scheduled=false;
  const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;recompute()})};
  window.addEventListener('resize',schedule,{passive:true});
  if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
  window.addEventListener('pageshow',schedule,{passive:true});
  recompute();
  window.AupingRC7ReadMore={entries,stats,recompute,setOpen:(button,yes)=>{const e=entries.find(x=>x.button===button);return e?opened(e,yes):false}};
  return window.AupingRC7ReadMore;
}

function cardMetaNode(card){return card.matches('[data-rc5-filter-card],[data-rc6-product-card],[data-rc7-product-card],[data-rc5-route]')?card:card.querySelector('[data-rc5-filter-card],[data-rc6-product-card],[data-rc7-product-card],[data-rc5-route]')}
function setupFilters(){const current=normalizePath(window.__AUPING_RC7_PATH_OVERRIDE__||location.href).toLowerCase(),filterPath=current==='/mattress-toppers/'?'/toppers/':current,schema=state.filters.find(x=>normalizePath(x.path).toLowerCase()===filterPath);if(!schema)return null;const products=state.products.filter(p=>p.category===schema.category&&p.isProduct&&!p.isPromo),byPath=new Map(products.map(p=>[normalizePath(p.localPath).toLowerCase(),p])),list=$(schema.listSelector||'[class*="ProductList_container"]'),raw=list?$$(':scope > *',list):$$(schema.cardSelector||'[data-rc7-product-card],[data-rc6-product-card],[data-rc5-filter-card],[class*="ProductCard_Card"],[class*="EnrichedProductCard_Base"],[class*="ProductList_BannerColumn"]'),cards=raw.map(card=>{const meta=cardMetaNode(card),rid=card.dataset.rc6RouteId||card.dataset.aupingRouteId||meta?.dataset.rc6RouteId||meta?.dataset.aupingRouteId||'',rp=rid?state.routeById.get(rid)?.localPath:(card.dataset.rc5Route||meta?.dataset.rc5Route||card.querySelector('a[href]')?.href||''),p=rp?byPath.get(normalizePath(rp).toLowerCase()):null,product=p||products.find(x=>x.routeId===rid)||null,isProductLike=!!(product||meta||card.matches('[data-rc7-product-card],[data-rc6-product-card],[data-rc5-filter-card],[class*="ProductCard_Card"],[class*="EnrichedProductCard_Base"]'));card.dataset.aupingProductKind=product?'product':(isProductLike?'unmanifested-product':'promotion');if(product){card.dataset.aupingProductId=product.id||product.routeId;card.dataset.aupingRouteId=product.routeId}return{card,product,isProductLike,meta}});if(!cards.some(x=>x.product))return null;schema.inputMap?.forEach(m=>{const input=document.getElementById(m.id)||$(`input[name="${CSS.escape(m.name||'')}"][value="${CSS.escape(m.nativeValue||'')}"]`);if(input){input.dataset.aupingFilterKey=m.group;input.dataset.aupingFilterValue=m.value;input.closest('[class*="FilterItem_filter"]')?.setAttribute('data-auping-filter-item','1')}});const inputs=$$('input[data-auping-filter-key]');if(!inputs.length)return null;const count=$(schema.countSelector||'[data-rc6-product-count]');let chips=$('.rc7-filter-chips');if(!chips){chips=document.createElement('div');chips.className='rc7-filter-chips';chips.setAttribute('aria-label','目前篩選條件');const title=$('[class*="CatalogWithFilters_productsTitle"],h1');(title?.parentElement||list||cards[0].card.parentElement).insertAdjacentElement('afterend',chips)}let empty=$('.rc7-no-results');if(!empty){empty=document.createElement('div');empty.className='rc7-no-results';empty.hidden=true;empty.textContent='找不到符合條件的商品';(list||cards[0].card.parentElement).appendChild(empty)}const selected=()=>{const s={};inputs.filter(i=>i.checked).forEach(i=>(s[i.dataset.aupingFilterKey]||=[]).push(i.dataset.aupingFilterValue));return s};const sync=s=>{const u=new URL(location.href);schema.groups.forEach(g=>u.searchParams.delete(g.queryKey||g.key));Object.entries(s).forEach(([k,vs])=>vs.forEach(v=>u.searchParams.append(k,v)));history.replaceState({},'',u)};const apply=(update=true)=>{const s=selected(),has=Object.values(s).some(v=>v.length);let visible=0;cards.forEach(x=>{const show=!has||!!(x.product&&productMatches(x.product,s));x.card.hidden=!show;x.card.dataset.aupingVisible=show?'1':'0';if(show&&x.isProductLike)visible++});if(count)count.textContent=`共 ${visible} 件商品`;empty.hidden=visible!==0;chips.innerHTML='';inputs.filter(i=>i.checked).forEach(i=>{const b=document.createElement('button');b.type='button';b.className='rc7-filter-chip';b.textContent=`${i.dataset.aupingFilterValue} ×`;b.onclick=()=>{i.checked=false;apply(true)};chips.appendChild(b)});if(has){const b=document.createElement('button');b.type='button';b.className='rc7-filter-clear';b.textContent='清除全部';b.onclick=()=>{inputs.forEach(i=>i.checked=false);apply(true)};chips.appendChild(b)}if(update)sync(s);document.documentElement.dataset.aupingFilterVisible=String(visible);return visible};const params=new URLSearchParams(location.search);inputs.forEach(i=>{if(params.getAll(i.dataset.aupingFilterKey).includes(i.dataset.aupingFilterValue))i.checked=true;i.addEventListener('change',()=>apply(true))});apply(false);document.documentElement.dataset.aupingFilterReady=schema.id;return window.AupingRC7Filter={apply,productMatches,products,cards,inputs}}
async function boot(){document.documentElement.dataset.aupingRc7=VERSION;try{setupReadMore();await loadData();window.AupingRC7={VERSION,state,normalizePath,resolveRoute,productMatches,searchRows,OFFICIAL};if(enforceCurrentRoute())return;rewriteLinks();setupSearch();setupDesktopNavigation();setupMobileNavigation();setupAccordions();if (!document.querySelector('script[data-auping-c2-catalog]') && !document.querySelector('script[data-auping-u4b-catalog]')) setupFilters();document.documentElement.dataset.aupingRc7Ready='1';document.dispatchEvent(new CustomEvent('auping:rc7-ready',{detail:{version:VERSION}}))}catch(e){console.error('[Auping RC7] Failed to start',e);document.documentElement.dataset.aupingRc7Error=String(e?.message||e)}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();