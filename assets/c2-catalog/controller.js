/* Auping C2.3.1 — ONE catalog owner. Scoped to Beds/Box Springs, source-verified by official 2026-10-13 capture. */
;(() => {
'use strict';
const root=document.documentElement;
if(root.dataset.aupingC2Owner==='ready'||root.dataset.aupingC2Owner==='initializing')return;
const path=location.pathname.replace(/^\/auping-staging(?=\/|$)/,'').replace(/\/$/,'')||'/';
const category=path==='/beds'?'beds':path==='/box-springs'?'box-springs':(window.__AUPING_C2_TEST_CATEGORY__||null);
if(!category)return;
root.dataset.aupingC2Owner='initializing';
const prefix=location.pathname.startsWith('/auping-staging/')?'/auping-staging':'';
const q=(s,r=document)=>r?.querySelector(s),qa=(s,r=document)=>[...(r?.querySelectorAll(s)||[])];
const diag=(message)=>{root.dataset.aupingC2Error=message;console.error('[Auping C2.2]',message)};
const slug=p=>p?.replace(/\/$/,'').split('/').pop()||'';
const canonical=u=>{try{const p=new URL(u,location.href);return (p.hostname+p.pathname).replace(/\/$/,'').toLowerCase()}catch{return''}};
const scrollHeading=title=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const y=Math.max(0,window.scrollY+title.getBoundingClientRect().top-110);window.scrollTo({top:y,behavior:'instant'})}));
async function boot(){
 try{
  const resp=await fetch(prefix+'/assets/c2-catalog/authority.json',{cache:'no-store'});if(!resp.ok)throw Error('AUTHORITY_FETCH_'+resp.status);
  const registry=await resp.json();if(registry.schema!=='AUPING-C2.2-VERIFIED-OFFICIAL-v1'||!registry.verified||registry.baseCommit!=='c238f99c602ebdf6b2615b408f512c1859511e2a')throw Error('AUTHORITY_SCHEMA_OR_BASE_MISMATCH');
  const data=registry.categories[category];if(!data||data.products.length!==data.officialTotal)throw Error('AUTHORITY_INCOMPLETE_CATEGORY');
  const {makeEngine}=await import(prefix+'/assets/c2-catalog/facet-engine.mjs');const facetEngine=makeEngine(data);
  const section=q('[class*="CatalogWithFilters_base"]');const list=q('[class*="ProductList_container"]',section);
  const title=q('[class*="CatalogWithFilters_productsTitle"]',section);const pane=q('[class*="CatalogWithFilters_filters"]',section);
  const count=q('[class*="CatalogWithFilters_productsTotal"]',section);const nav=q('nav[aria-label="Pagination"]',section);
  if(!list||!title||!pane||!count||!nav)throw Error('CATALOG_DOM_AUTHORITY_MISMATCH');
  const originals=qa(':scope > [class*="EnrichedProductCard_Base"]',list);
  if(originals.length!==27)throw Error('LOCAL_PAGE1_MUST_HAVE_27_CARDS');
  const promo=qa(':scope > [class*="ProductList_BannerColumn"]',list);
  const slugCards=new Map(originals.filter(c=>c.dataset.aupingProductSlug).map(c=>[c.dataset.aupingProductSlug,c]));
  let externalSlots=data.products.filter(p=>p.position<=27&&p.linkKind==='external-configurator');
  const map=new Map();const occupied=new Set();
  for(const product of data.products.slice(0,27)){
    let node=product.candidateLocalPath?slugCards.get(slug(product.candidateLocalPath)):originals[product.position-1];
    if(!node||occupied.has(node))throw Error('SOURCE_CARD_IDENTITY_NOT_ONE_TO_ONE_'+product.position);
    if(product.linkKind==='external-configurator'){
      const text=q('[class*="EnrichedProductCard_Title"] strong',node)?.textContent||'';
      const expected=product.name.split(' ')[0].toLowerCase();
      if(!text.toLowerCase().includes(expected))throw Error('EXTERNAL_CONFIGURATOR_SLOT_MISMATCH_'+product.position);
    }
    occupied.add(node);map.set(product.id,node);
  }
  if(occupied.size!==27)throw Error('MAPPING_NOT_BIJECTIVE');
  // Missing later-page records are sourced from the official listing and hosted verified images.
  // We reuse ONLY the card markup layout as a template, not another product's identity or picture.
  for(const product of data.products.slice(27)){
    if(!product.imageLocal||!product.href)throw Error('UNVERIFIED_LATE_CARD_'+product.position);
    const template=originals[originals.length-1].cloneNode(true);
    template.removeAttribute('data-auping-supplemental');template.dataset.aupingProductSlug=slug(product.candidateLocalPath)||slug(product.href);
    const header=q('[class*="EnrichedProductCard_Title"] strong',template);if(!header)throw Error('CARD_TEMPLATE_TITLE_NOT_FOUND');header.textContent=product.title;
    const desc=q('[class*="EnrichedProductCard_ProductInfoDescription"]',template);if(desc)desc.textContent=product.description||'';
    qa('a[href]',template).forEach(a=>{a.href=product.href;a.setAttribute('title',product.title);if(product.linkKind==='external-configurator'){a.target='_blank';a.rel='noopener noreferrer'}});
    // Supplemental page-2 cards have ONE real image. Never retain the source
    // card's carousel track/slide transform (it can paint outside the viewport).
    const slider=q('[class*="ProductCardImageSlide_Base"]',template);
    if(!slider)throw Error('CARD_TEMPLATE_IMAGE_NOT_FOUND');
    // Both first and later pages use a reusable media adapter. No guessed hover media.
    const media=product.media||{};
    const primary=media.primaryLocal||product.imageLocal;
    const alternate=media.hoverLocal||null;
    if(!primary)throw Error('MISSING_OFFICIAL_PRIMARY_'+product.id);
    const frame=document.createElement('div');frame.className='auping-c2-media-frame';
    const makeImage=(src,cls)=>{const im=document.createElement('img');im.className='auping-c2-authority-image '+cls;im.src=prefix+src;im.alt=product.title;im.loading='eager';im.decoding='async';return im};
    const first=makeImage(primary,'auping-c2-primary');frame.appendChild(first);
    let second=null,showAlt=false;
    if(alternate){second=makeImage(alternate,'auping-c2-alternate');frame.appendChild(second)}
    slider.style.position='relative';slider.style.height='100%';slider.style.width='100%';slider.style.overflow='hidden';
    slider.classList.add('auping-c2-authority-slider');
    slider.replaceChildren(frame);
    const fit=media.objectFit==='cover'?'cover':'contain';
    frame.style.setProperty('--auping-c2-object-fit',fit);
    frame.style.setProperty('--auping-c2-object-position',media.objectPosition||'center center');
    template.dataset.aupingC2MediaStatus=second?'verified-gallery':'MEDIA_UNVERIFIED';
    if(second){
      const flip=alt=>{showAlt=alt;slider.classList.toggle('auping-c2-hovered',alt);template.dataset.aupingC2HoverAngle=alt?'2':'1'};
      // Touch browsers may synthesize mouseenter + focusin immediately before a tap.
      // A tap on the arrow must switch exactly once, not flip twice back to primary.
      // Desktop pointer hover remains supported; keyboard users can use the arrow.
      slider.addEventListener('pointerenter',e=>{
        if(e.pointerType==='mouse'&&matchMedia('(hover:hover) and (pointer:fine)').matches)flip(true);
      });
      slider.addEventListener('pointerleave',e=>{
        if(e.pointerType==='mouse'&&matchMedia('(hover:hover) and (pointer:fine)').matches)flip(false);
      });
      const next=document.createElement('button');next.type='button';next.className='auping-c2-media-next';next.setAttribute('aria-label','下一張商品圖片');next.textContent='›';
      next.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();flip(!showAlt)});
      slider.appendChild(next);
    }
    // Do not repeat another product's color palette.
    qa('[class*="EnrichedProductCard_Colors"],[class*="EnrichedProductCard_ColorOptions"],[class*="EnrichedProductCard_Swatches"]',template).forEach(e=>e.remove());
    map.set(product.id,template);
  }
  if(map.size!==data.products.length)throw Error('ALL_PRODUCT_CARDS_NOT_MATERIALIZED');
  const ordered=data.products.map(p=>map.get(p.id));ordered.forEach(card=>list.appendChild(card));promo.forEach(e=>list.appendChild(e));
  section.dataset.aupingC2Catalog='1';
  // Official site has model and color facets; retired "version" is absent on BOTH categories.
  const retired=q(`button[aria-controls="${category==='beds'?'bed':'boxspring'}_size_person"]`,pane);
  if(retired){const group=retired.closest('[class*="Accordion_item__"]');if(!group)throw Error('VERSION_GROUP_CONTAINER_NOT_FOUND');group.classList.add('auping-c2-retired');qa('input',group).forEach(i=>{i.checked=false;i.disabled=true})}
  const controls=[];
  for(const facet of data.facets){
    const input=document.getElementById(facet.nativeValue);
    if(!input||input.type!=='checkbox'||input.name!==facet.queryKey)throw Error('OFFICIAL_FACET_INPUT_MISMATCH_'+facet.queryKey+'_'+facet.nativeValue);
    input.dataset.aupingC2Key=facet.key;input.dataset.aupingC2Value=facet.nativeValue;
    controls.push({input,facet});
  }
  if(controls.length!==data.facets.length)throw Error('INCOMPLETE_OFFICIAL_FILTER_CONTROLS');
  const chips=document.createElement('div');chips.className='auping-c2-chips';title.insertAdjacentElement('afterend',chips);
  const pageBtns=qa('ul[class*="Pagination_pageNumbers"] button',nav);const arrows=qa('button[class*="Pagination_paginationButton"]',nav);
  if(pageBtns.length<2||arrows.length<2)throw Error('PAGE_NAVIGATION_STRUCTURE_NOT_SUPPORTED');
  let page=1,selected=new Map(),matching=data.products;
  const groups=new Map();for(const f of data.facets){if(!groups.has(f.key))groups.set(f.key,[]);groups.get(f.key).push(f)}
  const lookup=new Map(data.products.map(p=>[p.id,p]));
  const inputFor=(facet)=>controls.find(x=>x.facet.key===facet.key&&x.facet.nativeValue===facet.nativeValue)?.input;
  const active=()=>[...selected.entries()].filter(([,s])=>s.size);
  function decodeUrl(){const u=new URL(location.href),filters=new Map();for(const [key,fs] of groups){const vals=new Set();for(const f of fs){if(u.searchParams.getAll(f.queryKey).includes(f.nativeValue))vals.add(f.nativeValue);if(u.searchParams.getAll(key).includes(f.value))vals.add(f.nativeValue)}if(u.searchParams.has(key)&&!vals.size)throw Error('UNKNOWN_LEGACY_FACET_VALUE_'+key);filters.set(key,vals)}
    return {page:Number(u.searchParams.get('page')||1)||1,filters};
  }
  function serialize(push){const u=new URL(location.href);for(const f of data.facets)u.searchParams.delete(f.queryKey);u.searchParams.delete('model');u.searchParams.delete('color');u.searchParams.delete('version');u.searchParams.delete('page');
    for(const [key,values] of active()){for(const value of values){const f=groups.get(key).find(x=>x.nativeValue===value);u.searchParams.append(f.queryKey,value)}}
    if(page>1)u.searchParams.set('page',String(page));if(u.href!==location.href)history[push?'pushState':'replaceState']({},'',u);}
  function update(){
    const valid=facetEngine.sanitize(selected);if(valid.removed.length){selected=valid.selected;root.dataset.aupingC2RejectedFacet=valid.removed.map(x=>x.key+':'+x.value).join('|')}
    matching=facetEngine.matching(selected);
    for(const {input,facet} of controls)input.checked=!!selected.get(facet.key)?.has(facet.nativeValue);
    // Visible candidates must intersect the CURRENT matching products. A checked
    // option always remains visible so its selection can be removed.
    for(const option of facetEngine.availability(selected)){
      const input=inputFor(option);if(!input)continue;
      const row=input.closest('[class*="FilterItem_filter__"],[data-rc5-filter-item]')||input.parentElement;
      if(!row)throw Error('FACET_OPTION_ROW_MISSING_'+option.nativeValue);
      row.dataset.aupingC2OptionVisible=option.visible?'1':'0';
      row.hidden=!option.visible;
      if(!option.visible)row.setAttribute('aria-hidden','true');else row.removeAttribute('aria-hidden');
      input.disabled=!option.visible;
    }
    const pages=Math.max(1,Math.ceil(matching.length/data.pageSize));page=Math.max(1,Math.min(pages,page));
    // Sorting matches official page/specific filter order using capture's recorded order.
    if(active().length===1&&active()[0][1].size===1){const [key,values]=active()[0];const f=groups.get(key).find(x=>x.nativeValue===[...values][0]);const order=new Map(f.orderedIds.map((id,i)=>[id,i]));matching.sort((a,b)=>(order.get(a.id)??9999)-(order.get(b.id)??9999));}
    const orderedVisible=matching.slice((page-1)*data.pageSize,page*data.pageSize);
    const set=new Set(orderedVisible.map(x=>x.id));for(const [id,card] of map){card.hidden=!set.has(id);card.dataset.aupingC2Visible=set.has(id)?'1':'0'}
    orderedVisible.forEach(p=>list.appendChild(map.get(p.id)));promo.forEach(e=>{e.hidden=page>1||active().length>0;list.appendChild(e)});
    count.textContent=`${orderedVisible.length} of ${matching.length}`;
    nav.hidden=pages<2;pageBtns.forEach((b,i)=>{const n=i+1;b.hidden=n>pages;b.disabled=n>pages;b.textContent=String(n);b.setAttribute('aria-current',n===page?'page':'false');b.setAttribute('aria-label',(n===page?'目前頁面 ':'前往第 ')+n+' 頁')});arrows[0].disabled=page===1;arrows[arrows.length-1].disabled=page===pages;
    chips.replaceChildren();if(active().length){const heading=document.createElement('strong');heading.textContent='Filters:';chips.appendChild(heading);
      for(const [key,values] of active())for(const value of values){const f=groups.get(key).find(x=>x.nativeValue===value);const b=document.createElement('button');b.type='button';b.textContent=f.value+' ×';b.addEventListener('click',()=>{selected.get(key).delete(value);page=1;update();serialize(true)});chips.appendChild(b)}
      const clear=document.createElement('button');clear.type='button';clear.textContent='清除全部';clear.addEventListener('click',()=>{selected=new Map();page=1;update();serialize(true)});chips.appendChild(clear);
    }
    root.dataset.aupingC2Visible=String(orderedVisible.length);root.dataset.aupingC2Total=String(matching.length);root.dataset.aupingC2Page=String(page);root.dataset.aupingC2Ids=orderedVisible.map(p=>p.id).join('|');
  }
  for(const {input,facet} of controls)input.addEventListener('change',()=>{
    if(input.checked&&!facetEngine.canAdd(selected,facet)){
      input.checked=false;root.dataset.aupingC2RejectedFacet=facet.key+':'+facet.nativeValue;
      update();return;
    }
    const values=new Set(selected.get(facet.key)||[]);
    input.checked?values.add(facet.nativeValue):values.delete(facet.nativeValue);
    selected.set(facet.key,values);page=1;update();serialize(true);
  });
  nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!nav.contains(b)||b.disabled)return;e.preventDefault();e.stopImmediatePropagation();const i=pageBtns.indexOf(b);if(i>=0)page=i+1;else if(b===arrows[0])page--;else if(b===arrows[arrows.length-1])page++;else return;update();serialize(true);scrollHeading(title)},true);
  let panelOpen=false;const filterButton=q('button[class*="CatalogWithFilters_filterButton"]',section);if(!filterButton)throw Error('MOBILE_TOGGLE_ABSENT');
  filterButton.setAttribute('aria-controls','auping-c2-mobile-panel');pane.id='auping-c2-mobile-panel';
  const syncPanel=()=>{const mobile=matchMedia('(max-width:700px)').matches;section.classList.toggle('auping-c2-mobile-open',mobile&&panelOpen);filterButton.setAttribute('aria-expanded',String(mobile&&panelOpen));if(mobile)pane.setAttribute('aria-hidden',String(!panelOpen));else pane.removeAttribute('aria-hidden')};
  filterButton.addEventListener('click',e=>{if(!matchMedia('(max-width:700px)').matches)return;e.preventDefault();e.stopImmediatePropagation();panelOpen=!panelOpen;syncPanel()},true);window.addEventListener('resize',syncPanel);syncPanel();
  // Preserve hover/arrow parity on existing cards, without replacing canonical metadata.
  for(const c of originals){const slider=q('[class*="ProductCardImageSlide_Base"]',c);const imgs=qa('[class*="ProductCardImageSlide_Slide"] img',slider);if(!slider||imgs.length<2)continue;
    const main=imgs[0],second=imgs[1];const attrs=['src','srcset','sizes'];const a=Object.fromEntries(attrs.map(k=>[k,main.getAttribute(k)])),b=Object.fromEntries(attrs.map(k=>[k,second.getAttribute(k)]));let alt=false;
    const flip=next=>{alt=next;const v=alt?b:a;for(const k of ['srcset','sizes','src'])v[k]===null?main.removeAttribute(k):main.setAttribute(k,v[k]);};
    slider.addEventListener('mouseenter',()=>flip(true));slider.addEventListener('mouseleave',()=>flip(false));q('button[class*="ProductCardImageSlide_NextButton"]',slider)?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();flip(!alt)},true);
  }
  const start=decodeUrl();page=start.page;selected=start.filters;update();
  if(root.dataset.aupingC2RejectedFacet||new URL(location.href).searchParams.has('color')||new URL(location.href).searchParams.has('model')||new URL(location.href).searchParams.has('version'))serialize(false);
  window.addEventListener('popstate',()=>{const st=decodeUrl();page=st.page;selected=st.filters;update();if(root.dataset.aupingC2RejectedFacet)serialize(false)});
  root.dataset.aupingC2Owner='ready';root.dataset.aupingC2Source='official-c1-plus-live-complete';
 }catch(e){root.dataset.aupingC2Owner='failed';diag(String(e?.message||e));}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
