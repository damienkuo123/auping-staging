/* U4B official source-membership adapter. One filter owner, U2 gallery remains unchanged.
 * Only single-option memberships are individually evidenced; multi-option OR/AND is
 * consistent with existing engine but must receive separate final browser adjudication.
 */
const root=document.documentElement;
const prefix=location.pathname.startsWith('/auping-staging/')?'/auping-staging':'';
const route=(location.pathname.replace(/^\/auping-staging(?=\/|$)/,'').replace(/\/+$/,'')||'')+'/';
const key=route==='/toppers/'?'/mattress-toppers/':route;
const scoped=['/bed-bases/','/toppers/','/mattress-toppers/','/bed-linen/duvet-covers/','/bed-linen/pillowcases/','/bed-linen/pillows/','/bed-linen/duvets/','/bed-linen/fitted-sheets/','/bed-linen/mattress-protectors/','/bed-linen/bedspreads/'];
if(scoped.includes(route)&&!root.dataset.aupingU4bOwner){
 root.dataset.aupingU4bOwner='initializing';
 const $=(q,r=document)=>r?.querySelector(q), all=(q,r=document)=>[...(r?.querySelectorAll(q)||[])];
 function normalize(h){if(!h)return null;try{return new URL(h,location.href).pathname.replace(/^\/auping-staging(?=\/|$)/,'').replace(/^\/en(?=\/|$)/,'').replace(/\/$/,'').replace(/^\/toppers\//,'/mattress-toppers/').toLowerCase()}catch{return null}}
 function identity(card){for(const a of all('a[href],a[data-auping-original-href]',card)){
  const p=normalize(a.getAttribute('data-auping-original-href')||a.getAttribute('href'));
  if(p?.startsWith(key.replace(/\/$/,'')+'/'))return p;
 }return null}
 async function boot(){try{
  const response=await fetch(prefix+'/assets/u4b-official/u4b-official-membership.json?v=20261015-u4b',{cache:'no-store'});
  if(!response.ok)throw Error('AUTHORITY_FETCH_'+response.status);
  const authority=await response.json();
  if(authority.schema!=='AUPING_U4B_OFFICIAL_SINGLE_OPTION_MEMBERSHIP_v1'||authority.provenOptions!==103||authority.baseHead!=='da686644a0684c2bc795f233e6fd074389b59824')throw Error('OFFICIAL_AUTHORITY_GATE');
  const config=authority.categories[key],section=$('[class*="CatalogWithFilters_base"]');
  const list=$('[class*="ProductList_container"]',section),pane=$('[class*="CatalogWithFilters_filters"]',section),count=$('[class*="CatalogWithFilters_productsTotal"]',section);
  if(!config||!list||!pane||!count)throw Error('U4B_ROUTE_TEMPLATE_GATE');
  if(root.dataset.aupingFilterReady||root.dataset.aupingCatalogReady)throw Error('DOUBLE_FILTER_OWNER');
  const cards=all('[class*="ProductCard_Card__"]',list);if(cards.length!==config.expectedCards)throw Error('U4B_CARD_COUNT_'+cards.length+'_EXPECTED_'+config.expectedCards);
  const matched=new Map(),occupied=new Set();
  for(const card of cards){const p=identity(card);let i=config.products.findIndex(x=>!!p&&normalize(x.path)===p);
   // ONE documented local path alias: the official White Lines Satin card is
   // /white-lines-satin while the pre-existing local card is /white-lines-satin-duvet-cover.
   // Require the specific category, exact two slugs, and source title. This is
   // a local identity crosswalk, never a new official product or invented URL.
   if(i<0&&key==='/bed-linen/duvet-covers/' &&
      p==='/bed-linen/duvet-covers/white-lines-satin-duvet-cover' &&
      all('a[title]',card).some(a=>a.getAttribute('title')?.trim()==='White Lines Satin 被套')){
     i=config.products.findIndex(x=>normalize(x.path)==='/bed-linen/duvet-covers/white-lines-satin');
     if(i<0)throw Error('KNOWN_LOCAL_WHITE_LINES_OFFICIAL_IDENTITY_MISSING');
   }
   if(i<0&&key==='/bed-linen/fitted-sheets/'&&!p&&/Satin\s*300/i.test($('[class*="ProductCard_Title"]',card)?.textContent||''))i=config.products.findIndex(x=>x.noDetailLink);
   if(i<0||matched.has(i))throw Error('SKU_BIJECTION_FAIL_'+(p||'NO_HREF')+'_'+i);
   let wrap=card;while(wrap.parentElement&&wrap.parentElement!==list)wrap=wrap.parentElement;
   if(wrap.parentElement!==list||occupied.has(wrap))throw Error('WRAPPER_NOT_ONE_TO_ONE');
   occupied.add(wrap);matched.set(i,{card,wrap});
  }
  if(matched.size!==config.expectedCards)throw Error('U4B_IDENTITY_INCOMPLETE');
  const grouped=new Map(),controls=[];
  for(const option of config.options){if(!grouped.has(option.facet))grouped.set(option.facet,[]);grouped.get(option.facet).push(option);
   if(option.memberIndexes.some(i=>!matched.has(i)))throw Error('AUTHORITATIVE_SKU_OOB');
   // The native source sometimes stores a translated filter value while the
   // unmodified HTML input id carries the proven official numeric option ID.
   let input=$(`input[type="checkbox"][name="${CSS.escape(option.facet)}"][id="${CSS.escape(option.id)}"]`,pane);
   if(!input){
     // Precisely two source snapshots omit an entire official one-option Style
     // group. Only create its proven option from captured official authority.
     if(!['duvet_cover_styles','pillowcase_styles'].includes(option.facet)||grouped.get(option.facet).length!==1)throw Error('OFFICIAL_FACET_MISSING_'+option.facet+'_'+option.id);
     const supplemental=document.createElement('section');supplemental.className='auping-u4b-verified-filter-group';
     supplemental.dataset.aupingU4bExtraFacet=option.facet;
     const head=document.createElement('strong');head.textContent='樣式';supplemental.appendChild(head);
     const row=document.createElement('label');row.className='auping-u4b-verified-filter-option';
     input=document.createElement('input');input.type='checkbox';input.id=option.id;input.name=option.facet;input.value=option.id;
     row.append(input,document.createTextNode(' '+option.label));supplemental.appendChild(row);pane.appendChild(supplemental);
   }
   input.value=option.id;
   controls.push({option,input});
  }
  if(controls.length!==config.expectedOptions)throw Error('FACET_COUNT_INCOMPLETE');
  // Suppress the one known source-only stale option absent from Official C1C.
  const stale=all('input[type="checkbox"]',pane).filter(i=>!controls.some(x=>x.input===i));
  if(stale.length){
    if(!(key==='/bed-linen/bedspreads/'&&stale.length===1&&stale[0].id==='244'))throw Error('UNPROVEN_EXTRA_FACET_CONTROL_'+stale.map(x=>x.id).join('_'));
    const n=stale[0].closest('[class*="FilterItem_filter"],[class*="FilterItem_option"]')||stale[0].parentElement?.parentElement;
    if(!n)throw Error('UNPROVEN_FACET_ROW_STRUCTURE');n.hidden=true;n.dataset.aupingU4bUnproven='1';
  }
  let chosen=new Map();
  function parse(){const url=new URL(location.href),v=new Map();for(const [facet,opts] of grouped)v.set(facet,new Set(url.searchParams.getAll(facet).filter(x=>opts.some(o=>o.id===x))));return v}
  function matches(){return config.products.map((_,i)=>i).filter(i=>[...chosen].every(([facet,ids])=>!ids.size||grouped.get(facet).some(o=>ids.has(o.id)&&o.memberIndexes.includes(i))))}
  function urlUpdate(){const url=new URL(location.href);for(const facet of grouped.keys())url.searchParams.delete(facet);
   for(const [facet,opts] of grouped)for(const opt of opts)if(chosen.get(facet)?.has(opt.id))url.searchParams.append(facet,opt.id);
   if(url.href!==location.href)history.pushState({},'',url);
  }
  let chips=$('.rc7-filter-chips',section);if(!chips){chips=document.createElement('div');chips.className='rc7-filter-chips';
   const title=$('[class*="CatalogWithFilters_productsTitle"]',section);(title?.parentElement||list.parentElement).appendChild(chips)}
  let empty=$('.rc7-no-results',section);if(!empty){empty=document.createElement('div');empty.className='rc7-no-results';empty.textContent='找不到符合條件的商品';list.after(empty)}
  function render(){const visible=new Set(matches());for(const [i,entry] of matched){entry.wrap.hidden=!visible.has(i);entry.wrap.dataset.aupingU4bVisible=visible.has(i)?'1':'0'}
   count.textContent=visible.size+' of '+config.products.length;empty.hidden=visible.size>0;chips.replaceChildren();
   for(const {input,option} of controls){const active=!!chosen.get(option.facet)?.has(option.id);input.checked=active;if(!active)continue;
    const b=document.createElement('button');b.type='button';b.className='rc7-filter-chip';b.textContent=option.label+' ×';
    b.addEventListener('click',()=>{chosen.get(option.facet).delete(option.id);render();urlUpdate()});chips.appendChild(b)}
   if(chips.children.length){const b=document.createElement('button');b.type='button';b.className='rc7-filter-clear';b.textContent='清除全部';
    b.addEventListener('click',()=>{chosen=new Map();render();urlUpdate()});chips.appendChild(b)}
   root.dataset.aupingU4bVisible=String(visible.size);
  }
  for(const {input,option} of controls)input.addEventListener('change',()=>{if(!chosen.has(option.facet))chosen.set(option.facet,new Set());
    input.checked?chosen.get(option.facet).add(option.id):chosen.get(option.facet).delete(option.id);render();urlUpdate()});
  const toggle=$('button[class*="CatalogWithFilters_filterButton"]',section);if(toggle){let open=false;pane.id=pane.id||'auping-u4b-panel';toggle.setAttribute('aria-controls',pane.id);
   const updatePanel=()=>{const mobile=matchMedia('(max-width:700px)').matches;section.classList.toggle('auping-u4b-mobile-open',mobile&&open);toggle.setAttribute('aria-expanded',String(mobile&&open));if(mobile)pane.setAttribute('aria-hidden',String(!open));else pane.removeAttribute('aria-hidden')};
   toggle.addEventListener('click',event=>{if(!matchMedia('(max-width:700px)').matches)return;event.preventDefault();event.stopImmediatePropagation();open=!open;updatePanel()},true);
   window.addEventListener('resize',updatePanel);updatePanel()}
  window.addEventListener('popstate',()=>{chosen=parse();render()});chosen=parse();render();
  root.dataset.aupingU4bRoute=route;root.dataset.aupingU4bOptions=String(controls.length);root.dataset.aupingU4bCards=String(cards.length);root.dataset.aupingU4bOwner='ready';
  document.dispatchEvent(new CustomEvent('auping:u4b-ready',{detail:{route,cards:cards.length,options:controls.length}}));
 }catch(e){root.dataset.aupingU4bOwner='failed';root.dataset.aupingU4bError=String(e?.message||e);console.error('[Auping U4B]',e)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}
