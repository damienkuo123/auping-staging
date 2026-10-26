/* Auping U3 — source-compatible guard for the accepted editorial Mattress V2 landing
 * and original Circular Mattresses special template. No controls/event owner added.
 * Scope: only two U3 routes; all gallery/CTA/media remain source-owned.
 */
const base='/auping-staging/';
const route=location.pathname.replace(/^\/auping-staging(?=\/|$)/,'').replace(/\/?$/,'/');
const root=document.documentElement;
const required={
 '/mattresses/':['elite-mattress','elysium-mattress','evolve-mattress','two-mattress','one-mattress','revive-mattress'],
 '/mattresses/circular-mattresses/':['elite-mattress','elysium-mattress','evolve-mattress']
};
if(Object.hasOwn(required,route)&&!root.dataset.aupingU3SpecialOwner){
 root.dataset.aupingU3SpecialOwner='initializing';
 const boot=()=>{
  if(root.dataset.aupingU3SpecialOwner!=='initializing')return;
  try{
   // R5.8 mattress landing is CatalogWithoutFilters + MattressProductCardV2.
   // Original pinned U3 page used CatalogWithFilters + ProductCard.
   // Match one known structure exactly; never synthesize or remap cards.
   const editorial=route==='/mattresses/' && !!document.querySelector('section[class*="CatalogWithoutFilters_base"]');
   const list=editorial
      ? document.querySelector('section[class*="CatalogWithoutFilters_base"] [class*="CatalogWithoutFilters_productRow"]')
      : document.querySelector('[class*="CatalogWithFilters_base"] [class*="ProductList_container"]');
   if(!list)throw Error('U3_SPECIAL_LIST_MISSING');
   const cards=[...list.querySelectorAll(editorial?'[class*="MattressProductCardV2_Base"]':'[class*="ProductCard_Card__"]')];
   const slugs=required[route];
   if(cards.length!==slugs.length)throw Error(`U3_SPECIAL_COUNT_${cards.length}_EXPECTED_${slugs.length}`);
   for(let i=0;i<cards.length;i++){
    const card=cards[i],slug=slugs[i];
    const links=[...card.querySelectorAll('a[href]')];
    const expected=base+'mattresses/'+slug+'/';
    if(!links.length||!links.some(a=>['更多資訊','了解更多','探索這款床墊'].some(label=>a.textContent.trim().includes(label))))
      throw Error('U3_PRIMARY_CTA_MISSING_'+slug);
    if(links.some(a=>new URL(a.href,location.href).pathname!==expected))
      throw Error('U3_CARD_LINK_ROUTE_MISMATCH_'+slug);
    const imgs=card.querySelectorAll('[class*="ProductCardImageSlide_Slide"] img');
    if(imgs.length!==1||card.querySelector('[class*="ProductCardImageSlide_NextButton"],.auping-catalog-gallery-next'))
      throw Error('U3_SOURCE_SINGLE_MEDIA_DRIFT_'+slug);
    card.dataset.aupingCatalogCardContract=route==='/mattresses/'?'landing-link-v1':'mattress-special-v1';
    card.dataset.aupingCatalogCtaStatus='source-preserved';
    card.dataset.aupingCatalogMediaStatus='single-image';
   }
   root.dataset.aupingU3Template=route==='/mattresses/'?'mattresses-landing-links':'circular-mattress-special';
   root.dataset.aupingU3SpecialCardCount=String(cards.length);
   root.dataset.aupingU3SpecialOwner='ready';
   document.dispatchEvent(new CustomEvent('auping:u3-special-ready',{detail:{route,cardCount:cards.length}}));
  }catch(e){root.dataset.aupingU3SpecialOwner='failed';root.dataset.aupingU3SpecialError=String(e?.message||e);console.error('[Auping U3]',e)}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}
