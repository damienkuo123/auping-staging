/* Auping U4D: ONE verified standard catalog owner — U4C independent official evidence.
 * Native ProductCard/Gallery/CTA remain owned by U1/U2. Per-option membership from
 * separately audited official browser captures; NO SKU inference from marketing text.
 */
const root=document.documentElement;
const base=location.pathname.startsWith('/auping-staging/')?'/auping-staging':'';
const route=(location.pathname.replace(/^\/auping-staging(?=\/|$)/,'').replace(/\/+$/,'')||'')+'/';
const key=route==='/toppers/'?'/mattress-toppers/':route;
const ROUTES=new Set(['/bed-bases/','/toppers/','/mattress-toppers/','/bed-linen/duvet-covers/','/bed-linen/pillowcases/','/bed-linen/pillows/','/bed-linen/duvets/','/bed-linen/fitted-sheets/','/bed-linen/mattress-protectors/','/bed-linen/bedspreads/']);
if(ROUTES.has(route)&&!root.dataset.aupingU4dOwner){
 root.dataset.aupingU4dOwner='initializing';
 const $=(s,r=document)=>r?.querySelector(s),all=(s,r=document)=>Array.from(r?.querySelectorAll(s)||[]);
 const norm=(p)=>{if(!p)return null;try{let u=new URL(p,location.href);let n=u.pathname.replace(/^\/(?:auping-staging|en)(?=\/|$)/,'').replace(/\/$/,'').toLowerCase();if(n==='/bed-linen/duvet-covers/white-lines-satin-duvet-cover')n='/bed-linen/duvet-covers/white-lines-satin';if(n.startsWith('/toppers/'))n=n.replace('/toppers/','/mattress-toppers/');return n;}catch{return null;}};
 const identity=(card)=>{for(const a of all('a[href],a[data-auping-original-href]',card)){const p=norm(a.getAttribute('data-auping-original-href')||a.getAttribute('href'));if(p?.startsWith(key.slice(0,-1)+'/'))return p;}return null;};
 async function boot(){try{
  const response=await fetch(base+'/assets/u4d-standard/authority.json?v=20261015-u4d',{cache:'no-store'});
  if(!response.ok)throw Error('U4D_AUTHORITY_FETCH_'+response.status);
  const data=await response.json();if(data.schema!=='AUPING_U4D_OFFICIAL_RENDERED_MEMBERSHIP_v2'||data.baseHead!=='1f1c54dad01f6b6b42ec6fe2541733cdcc028f24'||data.provenOptions!==109)throw Error('U4D_AUTHORITY_NOT_FULLY_VERIFIED');
  const conf=data.categories[key];const section=$('[class*="CatalogWithFilters_base"]');const list=$('[class*="ProductList_container"]',section),pane=$('[class*="CatalogWithFilters_filters"]',section),count=$('[class*="CatalogWithFilters_productsTotal"]',section);
  if(!conf||!list||!pane||!count)throw Error('NATIVE_CATALOG_TEMPLATE_MISSING');
  if(root.dataset.aupingFilterReady||root.dataset.aupingCatalogReady)throw Error('LEGACY_DOUBLE_OWNER');
  const sourceCards=all('[class*="ProductCard_Card__"]',list);if(sourceCards.length!==conf.expectedCards)throw Error('SOURCE_CARD_COUNT_'+sourceCards.length+'_'+conf.expectedCards);
  const cardMap=new Map(),used=new Set();
  for(const card of sourceCards){const id=identity(card);let index=conf.products.findIndex(p=>id&&norm(p.path)===id);
   if(index<0&&key==='/bed-linen/fitted-sheets/'&&!id&&/Satin\s*300/i.test($('[class*="ProductCard_Title"]',card)?.textContent||''))index=conf.products.findIndex(p=>p.noDetailLink);
   if(index<0||cardMap.has(index))throw Error('SKU_IDENTITY_NOT_BIJECTIVE_'+(id||'NOLINK'));
   if(id==='/bed-linen/duvet-covers/white-lines-satin'&&!all('a[title]',card).some(a=>a.title.trim()==='White Lines Satin 被套'))throw Error('WHITE_LINES_EXACT_TITLE_MISSING');
   let wrap=card;while(wrap.parentElement&&wrap.parentElement!==list)wrap=wrap.parentElement;
   if(wrap.parentElement!==list||used.has(wrap))throw Error('NATIVE_CARD_WRAPPER_NOT_ONE_TO_ONE');
   cardMap.set(index,{wrap,card});used.add(wrap);
  }
  if(cardMap.size!==conf.products.length)throw Error('NATIVE_PRODUCT_SET_INCOMPLETE');
  const facets=new Map();for(const o of conf.options){if(!facets.has(o.facet))facets.set(o.facet,[]);facets.get(o.facet).push(o);
   if(o.proof!=='OFFICIAL_RENDERED_AND_SETTLED'||!Array.isArray(o.memberIndexes)||o.memberIndexes.some(i=>!cardMap.has(i)))throw Error('UNPROVEN_OFFICIAL_OPTION_'+o.facet+'_'+o.id);}
  const controls=new Map(),optFor=(facet,id)=>conf.options.find(o=>o.facet===facet&&o.id===id),keyFor=o=>o.facet+':'+o.id;
  /* AUPING_U4D_DIMENSION_SINGLE_SELECT_v1_BEGIN */
  // Source evidence 2026-10-20: within one width/length/size group one checkbox
  // replaces its predecessor; selections from OTHER groups remain combined.
  // Color, pattern, fabric, style and adjustability retain their previous semantics.
  const exclusiveDimensionFacets=new Set([
    'Base_Width','base_length','topper_length_filter','topper_width_filter',
    'topper_height','duvet_cover_size','pillowcase_size','pillow_size',
    'duvet_size','fitted_sheet_person_size','molton_size','bedspread_size'
  ].filter(facet=>facets.has(facet)));
  function normalizedFacetValues(facet,values){
    return exclusiveDimensionFacets.has(facet)&&values.length?values.slice(-1):values;
  }
  function transitionFacetSelection(state,facet,id,checked){
    const next=new Map(state),values=new Set(state.get(facet)||[]);
    if(checked){
      if(exclusiveDimensionFacets.has(facet))values.clear();
      values.add(id);
    }else values.delete(id);
    if(values.size)next.set(facet,values);else next.delete(facet);
    return next;
  }
  /* AUPING_U4D_DIMENSION_SINGLE_SELECT_v1_END */
  // Clone source-native accordion markup (never simplified <section><strong><label>).
  function injectNativeGroup(facet,opts){
   const exemplar=all('[class*="Accordion_item__"]',pane).find(e=>e.querySelector('input[type="checkbox"]'));
   if(!exemplar)throw Error('NATIVE_ACCORDION_EXEMPLAR_MISSING');
   const group=exemplar.cloneNode(true);group.dataset.aupingU4dNativeSupplement=facet;group.removeAttribute('data-auping-u4b-extra-facet');
   const trigger=$('button[aria-controls]',group),title=$('[class*="Accordion_title"]',group),content=$('[class*="Accordion_content"]',group);
   if(!trigger||!title||!content)throw Error('NATIVE_ACCORDION_STRUCTURE_MISSING');
   const container=content.firstElementChild||content;container.replaceChildren();trigger.setAttribute('aria-controls','auping-u4d-'+facet);content.id='auping-u4d-'+facet;trigger.dataset.aupingAccordionTrigger='1';content.dataset.aupingAccordionContent='1';
   title.textContent=facet.includes('styles')?'樣式':facet==='fitted_sheet_color'?'顏色':facet;
   const template=all('[class*="FilterItem_filter__"]',exemplar).find(r=>r.querySelector('input[type="checkbox"]'));
   if(!template)throw Error('NATIVE_FILTER_ITEM_TEMPLATE_MISSING');
   for(const o of opts){const row=template.cloneNode(true),input=$('input[type="checkbox"]',row),label=$('label',row);
    if(!input||!label)throw Error('NATIVE_CHECKBOX_TEMPLATE_MISSING');
    input.name=o.facet;input.id=o.id;input.value=o.id;input.checked=false;input.removeAttribute('data-rc5-filter-key');input.removeAttribute('data-rc5-filter-value');label.htmlFor=o.id;label.textContent=o.localLabel||o.label;container.append(row);
   }
   // Native accordion controls were bound before the module was loaded.
   trigger.addEventListener('click',e=>{e.preventDefault();const open=trigger.getAttribute('aria-expanded')!=='true';trigger.setAttribute('aria-expanded',String(open));content.setAttribute('aria-hidden',String(!open));content.style.height=open?'auto':'0px';group.setAttribute('data-state',open?'open':'closed');});
   // Match the official source ordering: styles between pattern and fabric, when present.
   const before=facet.includes('styles')?all('[class*="Accordion_item__"]',pane).find(g=>g.querySelector('input[name$="_fabric"]')):null;
   if(before)before.before(group);else exemplar.parentElement.append(group);
   return group;
  }
  for(const [facet,opts] of facets){const absent=opts.filter(o=>!$(`input[type="checkbox"][name="${CSS.escape(facet)}"][id="${CSS.escape(o.id)}"]`,pane));
   if(absent.length){const nativeGroup=all('[class*="Accordion_item__"]',pane).find(g=>g.querySelector(`input[name="${CSS.escape(facet)}"]`));
    if(nativeGroup){const content=$('[class*="Accordion_content"] > div',nativeGroup)||$('[class*="Accordion_content"]',nativeGroup);
     if(!content)throw Error('NATIVE_EXTRA_FACET_CONTENT_NOT_FOUND_'+facet);
     const template=all('[class*="FilterItem_filter__"]',nativeGroup).find(g=>g.querySelector('input[type="checkbox"]'));
     for(const o of absent){if(!template)throw Error('NATIVE_EXTRA_FACET_TEMPLATE_MISSING');const row=template.cloneNode(true),input=$('input',row),label=$('label',row);if(!input||!label)throw Error('NATIVE_EXTRA_FACET_STRUCTURE');input.id=o.id;input.name=o.facet;input.value=o.id;label.htmlFor=o.id;label.textContent=({6949:'深黑色',6948:'夜藍色',6451:'松綠色',6364:'暖灰色',6365:'白色',6357:'米白色',6363:'灰褐色'}[o.id]||o.localLabel||o.label);content.append(row)}
    }else{if(!['duvet_cover_styles','pillowcase_styles'].includes(facet))throw Error('UNEXPECTED_MISSING_GROUP_'+facet);injectNativeGroup(facet,opts)}
   }
  }
  for(const o of conf.options){const input=$(`input[type="checkbox"][name="${CSS.escape(o.facet)}"][id="${CSS.escape(o.id)}"]`,pane);
   if(!input)throw Error('OFFICIAL_NATIVE_CHECKBOX_MISSING_'+keyFor(o));input.value=o.id;controls.set(keyFor(o),{o,input,row:input.closest('[class*="FilterItem_filter__"]')||input.parentElement});}
  // Explicitly suppress legacy controls absent from verified official baseline.
  for(const i of all('input[type="checkbox"]',pane)){if(controls.has(i.name+':'+i.id))continue;
   if(key==='/bed-linen/bedspreads/'&&i.id==='244'){let row=i.closest('[class*="FilterItem_filter__"]');if(row)row.hidden=true;continue;}
   if(key==='/bed-linen/duvet-covers/'&&i.name==='duvet_cover_colors'&&i.id==='6226'&&data.retiredOptions?.some(o=>o.id==='6226'&&o.route===key)){let row=i.closest('[class*="FilterItem_filter__"]');if(!row)throw Error('PINK_RETIRED_ROW_NOT_FOUND');i.checked=false;i.disabled=true;row.hidden=true;row.dataset.aupingU4dRetired='1';continue;}
   throw Error('UNVERIFIED_NATIVE_OPTION_'+i.name+'_'+i.id);
  }
  function fromURL(){const url=new URL(location.href),s=new Map();for(const [facet,opts] of facets){const values=url.searchParams.getAll(facet).filter(id=>opts.some(o=>o.id===id));const ids=normalizedFacetValues(facet,values);const selection=new Set(ids);if(selection.size)s.set(facet,selection)}return s}
  let selected=fromURL();
  function matches(selection=selected){let list=conf.products.map((p,i)=>i);for(const [facet,ids] of selection){if(!ids.size)continue;const chosen=facets.get(facet)?.filter(o=>ids.has(o.id))||[];list=list.filter(i=>chosen.some(o=>o.memberIndexes.includes(i)));}return list;}
  function syncURL(mode='push'){const url=new URL(location.href);for(const name of facets.keys())url.searchParams.delete(name);
   for(const [facet,ids] of selected){for(const id of ids)url.searchParams.append(facet,id);}if(url.href!==location.href)history[mode==='replace'?'replaceState':'pushState']({},'',url)}
  // Canonicalize old bookmarked links carrying repeated values for one dimension.
  if([...exclusiveDimensionFacets].some(facet=>new URL(location.href).searchParams.getAll(facet).length>1))syncURL('replace');
  const title=$('[class*="CatalogWithFilters_productsTitle"]',section);
  let chips=$('.rc7-filter-chips',section);if(!chips){chips=document.createElement('div');chips.className='rc7-filter-chips';}
  chips.classList.add('auping-u4d-native-chips');chips.setAttribute('aria-label','已選篩選條件');
  // Native placement: right column, immediately BEFORE the product grid; never below cards.
  list.before(chips);
  let empty=$('.rc7-no-results',section);if(!empty){empty=document.createElement('div');empty.className='rc7-no-results';empty.textContent='找不到符合條件的商品';list.after(empty)}
  const initialOptions=new Set(conf.baselineVisibleOptionIds||conf.options.map(keyFor));
  // Dynamic availability and the native disclosure are different state dimensions.
  // Fitted Sheets renders the FIRST FIVE CURRENTLY AVAILABLE colors when collapsed,
  // not a fixed set of five baseline colors. This behavior is proven by U4C+R1.
  const disclosureFacet=key==='/bed-linen/fitted-sheets/'?'fitted_sheet_color':null;
  const disclosureOrder=disclosureFacet?conf.officialDisclosureColorOrder:null;
  const expandedGroups=new Set(),disclosureButtons=[];
  if(disclosureFacet){
   const opts=facets.get(disclosureFacet),order=disclosureOrder;
   if(!Array.isArray(order)||order.length!==12||new Set(order).size!==12||opts.length!==12||order.some(id=>!controls.has(disclosureFacet+':'+id)))throw Error('UNVERIFIED_NATIVE_DISCLOSURE_ORDER');
   const group=controls.get(disclosureFacet+':'+order[0]).row.closest('[class*="Accordion_item__"]');
   const container=group?.querySelector('[class*="Accordion_content"] > div')||group?.querySelector('[class*="Accordion_content"]');
   const buttons=all('[class*="FilterItem_showMoreToggle__"]',container);
   if(!container||buttons.length!==1)throw Error('NATIVE_READ_MORE_MUST_HAVE_ONE_CONTROL_NOT_'+buttons.length);
   const button=buttons[0],label=$('[class*="FilterItem_showMoreText"]',button);
   if(!label)throw Error('NATIVE_READ_MORE_TEXT_MISSING');
   for(const id of order)container.append(controls.get(disclosureFacet+':'+id).row);
   container.append(button);button.dataset.aupingU4dReadMore=disclosureFacet;
   button.setAttribute('role','button');button.tabIndex=0;
   const draw=()=>{const open=expandedGroups.has(disclosureFacet);label.textContent=open?'收起':'顯示更多';button.setAttribute('aria-expanded',String(open));};
   const toggle=()=>{expandedGroups.has(disclosureFacet)?expandedGroups.delete(disclosureFacet):expandedGroups.add(disclosureFacet);draw();render()};
   // Capture and stop the legacy source controller before its own target/bubble listener.
   // This preserves native DOM but gives it a SINGLE event/state owner.
   button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();toggle()},true);
   button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();toggle()}},true);
   disclosureButtons.push({facet:disclosureFacet,button,draw,native:true,container});draw();
  }
  const availability=(members)=>{const active=[...selected].flatMap(([facet,ids])=>[...ids].map(id=>optFor(facet,id))).filter(Boolean);
   if(!active.length)return new Set(conf.options.map(keyFor));
   // One selected option: use independent actual official visible-option evidence, including Read More disclosure.
   if(active.length===1&&Array.isArray(active[0].officialVisibleOptionIds))return new Set(active[0].officialVisibleOptionIds);
   // Multi-select: exact official option visibility not observed for every combination; use intersecting membership.
   const result=new Set(),indices=new Set(members);
   for(const opt of conf.options)if(opt.memberIndexes.some(i=>indices.has(i))||selected.get(opt.facet)?.has(opt.id))result.add(keyFor(opt));
   return result;};
  function render(){const rows=matches(),set=new Set(rows),visibleOpts=availability(rows);
   for(const [i,entry] of cardMap){const show=set.has(i);entry.wrap.hidden=!show;entry.wrap.dataset.aupingU4dVisible=show?'1':'0'}
   count.textContent=rows.length+' of '+rows.length;empty.hidden=rows.length!==0;
   const colorVisible=disclosureFacet?disclosureOrder.filter(id=>visibleOpts.has(disclosureFacet+':'+id)):[];
   const displayedColors=disclosureFacet?new Set((expandedGroups.has(disclosureFacet)?colorVisible:colorVisible.slice(0,5))):null;
   for(const [k,{o,input,row}] of controls){const checked=!!selected.get(o.facet)?.has(o.id);
    const show=disclosureFacet===o.facet?displayedColors.has(o.id):(visibleOpts.has(k)||(exclusiveDimensionFacets.has(o.facet)&&selected.has(o.facet)));
    input.checked=checked;row.hidden=!show;row.dataset.aupingU4dOptionVisible=show?'1':'0';}
   for(const {facet,button,draw,container} of disclosureButtons){draw();button.hidden=colorVisible.length<=5;
    button.dataset.aupingU4dVisible=colorVisible.length>5?'1':'0';
    const content=container.closest('[class*="Accordion_content"]');if(content&&content.getAttribute('aria-hidden')!=='true')content.style.height='auto';}
   chips.replaceChildren();if([...selected.values()].some(ids=>ids.size)){
    const t=document.createElement('strong');t.className='auping-u4d-chips-label';t.textContent='篩選條件：';chips.append(t);
    for(const [facet,ids] of selected)for(const id of ids){const o=optFor(facet,id);if(!o)continue;const b=document.createElement('button');b.type='button';b.className='auping-u4d-chip';b.textContent=(o.localLabel||o.label)+'  ×';b.addEventListener('click',()=>{selected.get(facet)?.delete(id);if(!selected.get(facet)?.size)selected.delete(facet);render();syncURL()});chips.append(b)}
    const clear=document.createElement('button');clear.type='button';clear.className='auping-u4d-clear';clear.textContent='清除全部';clear.addEventListener('click',()=>{selected=new Map();render();syncURL()});chips.append(clear);
   }
   chips.hidden=!chips.childElementCount;root.dataset.aupingU4dVisible=String(rows.length);root.dataset.aupingU4dTotal=String(rows.length);
  }
  for(const {o,input} of controls.values())input.addEventListener('change',()=>{selected=transitionFacetSelection(selected,o.facet,o.id,input.checked);render();syncURL();});
  const toggle=$('button[class*="CatalogWithFilters_filterButton"]',section);
  if(toggle){let mobileOpen=false;pane.id=pane.id||'auping-u4d-mobile-pane';toggle.setAttribute('aria-controls',pane.id);
   const close=document.createElement('button');close.type='button';close.className='auping-u4d-mobile-close';close.dataset.aupingU4dMobileClose='1';close.textContent='關閉 ×';close.setAttribute('aria-label','關閉篩選面板');pane.prepend(close);
   // Move, never clone, the ORIGINAL native filter pane into a direct-body overlay.
   // Important: <main> and the sticky header are distinct stacking contexts; even
   // a huge child z-index within <main> cannot guarantee an unobstructed click.
   const homeAnchor=document.createComment('auping-u4d-original-native-pane-slot');pane.before(homeAnchor);
   const paint=()=>{const mobile=matchMedia('(max-width:700px)').matches;const shown=mobile&&mobileOpen;
    if(shown&&!pane.classList.contains('auping-u4d-mobile-portal')){document.body.append(pane);pane.classList.add('auping-u4d-mobile-portal')}
    else if(!shown&&pane.classList.contains('auping-u4d-mobile-portal')){homeAnchor.after(pane);pane.classList.remove('auping-u4d-mobile-portal')}
    section.classList.toggle('auping-u4d-mobile-open',shown);document.body.classList.toggle('auping-u4d-mobile-scrolllock',shown);
    toggle.setAttribute('aria-expanded',String(shown));pane.setAttribute('aria-hidden',String(mobile&&!shown));close.setAttribute('aria-hidden',String(!shown));
    if(!mobile)mobileOpen=false;};
   toggle.addEventListener('click',e=>{if(!matchMedia('(max-width:700px)').matches)return;e.preventDefault();e.stopImmediatePropagation();mobileOpen=!mobileOpen;paint()},true);
   close.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();mobileOpen=false;paint()});
   window.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileOpen){mobileOpen=false;paint()}});
   window.addEventListener('resize',paint);paint();}
  window.addEventListener('popstate',()=>{selected=fromURL();render()});render();
  root.dataset.aupingU4dOwner='ready';root.dataset.aupingU4dRoute=route;root.dataset.aupingU4dOptions=String(controls.size);root.dataset.aupingU4dCards=String(cardMap.size);
  document.dispatchEvent(new CustomEvent('auping:u4d-ready',{detail:{route,options:controls.size,cards:cardMap.size}}));
 }catch(e){root.dataset.aupingU4dOwner='failed';root.dataset.aupingU4dError=String(e?.message||e);console.error('[Auping U4D]',e)}}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
}
