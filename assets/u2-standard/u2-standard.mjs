/* Auping U2 | standard product card DOM adapter v1.
 * U1 owns the shared SVG / gallery state transitions; U2 handles standard list boundaries.
 * RC7 remains the ONLY owner of standard catalog filtering, pagination, URL and sorting.
 * U2 does not mutate source product text, CTA URLs, badges, swatches, or filter membership.
 */
import {mountStandardCard} from '../c2-catalog/ui-contract.mjs';
const route=location.pathname.replace(/^\/auping-staging(?=\/|$)/,'').replace(/\/$/,'')+'/' ;
const EXPECT={
 '/bed-bases/':5,
 '/toppers/':6,
 '/mattress-toppers/':6,
 '/bed-linen/duvet-covers/':22,
 '/bed-linen/pillowcases/':22,
 '/bed-linen/pillows/':3,
 '/bed-linen/duvets/':9,
 '/bed-linen/fitted-sheets/':8,
 '/bed-linen/mattress-protectors/':4,
 '/bed-linen/bedspreads/':1
};
if(Object.hasOwn(EXPECT,route)){
 const root=document.documentElement;
 if(!root.dataset.aupingU2StandardOwner){
   root.dataset.aupingU2StandardOwner='initializing';
   const boot=()=>{
     if(root.dataset.aupingU2StandardOwner==='ready'||root.dataset.aupingU2StandardOwner==='failed')return;
     try{
       const list=document.querySelector('[class*="CatalogWithFilters_base"] [class*="ProductList_container"]');
       if(!list)throw Error('U2_LIST_NOT_FOUND');
       const cards=[...list.querySelectorAll('[class*="ProductCard_Card__"]')]
         .filter(n=>n.matches('[class*="ProductCard_Card__"]'));
       if(cards.length!==EXPECT[route])throw Error(`U2_CARD_COUNT_${cards.length}_EXPECTED_${EXPECT[route]}`);
       const native=cards.map(c=>c.querySelector('button[class*="ProductCardImageSlide_NextButton"]')).find(Boolean);
       if(!native||!native.querySelector('svg')){
         // A whole route without a source-native SVG is not permission to invent one.
         if(cards.some(c=>c.querySelectorAll('[class*="ProductCardImageSlide_Slide"] img').length>1))
           throw Error('U2_ROUTE_HAS_MULTIMEDIA_WITHOUT_NATIVE_ARROW');
       }
       let gallery=0,single=0,sourcePreserved=0;
       for(const card of cards){
         const output=mountStandardCard(card,native);
         if(output.media==='gallery')gallery++;
         else if(output.media==='single')single++;
         else sourcePreserved++;
       }
       list.dataset.aupingU2StandardCatalog='1';
       root.dataset.aupingU2StandardRoute=route;
       root.dataset.aupingU2StandardCardCount=String(cards.length);
       root.dataset.aupingU2StandardGalleryCount=String(gallery);
       root.dataset.aupingU2StandardSingleCount=String(single);
       root.dataset.aupingU2StandardPreservedCount=String(sourcePreserved);
       root.dataset.aupingU2StandardOwner='ready';
       document.dispatchEvent(new CustomEvent('auping:u2-standard-ready',{detail:{route,cardCount:cards.length,gallery,single,sourcePreserved}}));
     }catch(e){root.dataset.aupingU2StandardOwner='failed';root.dataset.aupingU2StandardError=String(e?.message||e);console.error('[Auping U2]',e)}
   };
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
   else boot();
 }
}
