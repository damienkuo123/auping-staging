/* Auping U3 special-template adapter — NO new gallery or filter event owner.
 * Official C1C 2026-10-13: mattress root is editorial/navigation, circular has
 * three source-native single-image cards with existing rich product information.
 * This module does not create SKU fields or replace the U1/U2 gallery contract.
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
   const list=document.querySelector('[class*="CatalogWithFilters_base"] [class*="ProductList_container"]');
   if(!list)throw Error('U3_SPECIAL_LIST_MISSING');
   const cards=[...list.querySelectorAll('[class*="ProductCard_Card__"]')];
   const slugs=required[route];
   if(cards.length!==slugs.length)throw Error(`U3_SPECIAL_COUNT_${cards.length}_EXPECTED_${slugs.length}`);
   for(let i=0;i<cards.length;i++){
    const card=cards[i], slug=slugs[i];
    const links=[...card.querySelectorAll('a[href]')];
    const expected=base+'mattresses/'+slug+'/';
    if(!links.length||!links.some(a=>a.textContent.trim().includes('更多資訊')||a.textContent.trim().includes('了解更多')))
     throw Error('U3_PRIMARY_CTA_MISSING_'+slug);
    if(links.some(a=>new URL(a.href,location.href).pathname!==expected))
     throw Error('U3_CARD_LINK_ROUTE_MISMATCH_'+slug);
    const imgs=card.querySelectorAll('[class*="ProductCardImageSlide_Slide"] img');
    if(imgs.length!==1||card.querySelector('[class*="ProductCardImageSlide_NextButton"],.auping-catalog-gallery-next'))
     throw Error('U3_SOURCE_SINGLE_MEDIA_DRIFT_'+slug);
    // Metadata is read from source, not generated or copied from adjacent SKUs.
    card.dataset.aupingCatalogCardContract=route==='/mattresses/'?'landing-link-v1':'mattress-special-v1';
    card.dataset.aupingCatalogCtaStatus='source-preserved';
    card.dataset.aupingCatalogMediaStatus='single-image';
   }
   if(route==='/mattresses/'){
     root.dataset.aupingU3Template='mattresses-landing-links';
     // Editorial landing: expose source 6 SKU links, not unverified RC7 filter controls.
     // Keep source DOM, original media, links and official 2026-10-13 identity order.
   }else{
     root.dataset.aupingU3Template='circular-mattress-special';
     // Circular page officially has width/length facets. RC7 remains the owner.
   }
   root.dataset.aupingU3SpecialCardCount=String(cards.length);
   root.dataset.aupingU3SpecialOwner='ready';
   document.dispatchEvent(new CustomEvent('auping:u3-special-ready',{detail:{route,cardCount:cards.length}}));
  }catch(e){root.dataset.aupingU3SpecialOwner='failed';root.dataset.aupingU3SpecialError=String(e?.message||e);console.error('[Auping U3]',e)}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}
