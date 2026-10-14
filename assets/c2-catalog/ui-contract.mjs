/* Auping U1 | Enriched Card UI Contract v1
 * Shared presentation and interaction adapter for first-page and later-page
 * cards. Product membership / URL / pagination are owned by C2 controller.
 * Never infer product badges, swatches or configurator links from donor cards.
 */
const q=(s,n)=>n?.querySelector(s);
const qa=(s,n)=>[...(n?.querySelectorAll(s)||[])];
const gallerySel='[class*="ProductCardImageSlide_Base"]';
const arrowSel='button[class*="ProductCardImageSlide_NextButton"]';
const attrs=['srcset','sizes','src'];
const attrSnap=(n)=>Object.fromEntries(attrs.map(k=>[k,n.getAttribute(k)]));
const apply=(n,v)=>{for(const k of attrs)v[k]===null?n.removeAttribute(k):n.setAttribute(k,v[k])};
const mouseDesktop=(e)=>e.pointerType==='mouse'&&matchMedia('(hover:hover) and (pointer:fine)').matches;

export function createArrow(prototype){
  if(!prototype||prototype.tagName!=='BUTTON'||!q('svg',prototype))throw Error('U1_NATIVE_SVG_ARROW_REQUIRED');
  const b=prototype.cloneNode(true);
  b.type='button';
  b.classList.add('auping-catalog-gallery-next');
  b.setAttribute('aria-label','下一張商品圖片');
  b.removeAttribute('disabled');
  return b;
}
function bindGallery(slider,card,button,paint,contract='enriched-v1'){
  if(slider.dataset.aupingCatalogGalleryOwner)throw Error('U1_GALLERY_DOUBLE_OWNER');
  slider.dataset.aupingCatalogGalleryOwner='u1';
  card.dataset.aupingCatalogCardContract=contract;
  let alternate=false;
  const flip=v=>{alternate=!!v;paint(alternate);card.dataset.aupingC2HoverAngle=alternate?'2':'1'};
  slider.addEventListener('pointerenter',e=>{if(mouseDesktop(e))flip(true)});
  slider.addEventListener('pointerleave',e=>{if(mouseDesktop(e))flip(false)});
  // Capture BEFORE the inherited card anchor and any page-specific button listeners.
  button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();flip(!alternate)},true);
  button.addEventListener('pointerdown',e=>e.stopPropagation(),true);
  button.addEventListener('focus',()=>card.dataset.aupingC2GalleryKeyboard='available');
  return {flip,button};
}
export function mountExistingCard(card,prototype){
  const slider=q(gallerySel,card);
  const pics=qa('[class*="ProductCardImageSlide_Slide"] img',slider);
  if(!slider)throw Error('U1_EXISTING_SLIDER_ABSENT');
  card.dataset.aupingCatalogBadgeStatus='source-html';
  card.dataset.aupingCatalogSwatchesStatus='source-html';
  card.dataset.aupingCatalogCtaStatus='source-html';
  const old=q(arrowSel,slider);
  if(pics.length<2){old?.remove();card.dataset.aupingCatalogMediaStatus='single-image';return {media:'single'};}
  if(!old)throw Error('U1_EXISTING_ARROW_MISSING');
  const snapshots=pics.slice(0,2).map(attrSnap);
  const button=createArrow(prototype);
  old.replaceWith(button);
  bindGallery(slider,card,button,alternate=>apply(pics[0],snapshots[alternate?1:0]));
  card.dataset.aupingCatalogMediaStatus='native-gallery';
  return {media:'gallery'};
}
export function mountSupplementalCard(card,product,prototype,prefix){
  const slider=q(gallerySel,card);
  if(!slider)throw Error('U1_SUPPLEMENTAL_SLIDER_ABSENT');
  const media=product.media||{};
  const primary=media.primaryLocal||product.imageLocal;
  const alternate=media.hoverLocal||null;
  if(!primary||!primary.startsWith('/assets/c2-catalog/media/'))throw Error('U1_INVALID_PRIMARY_'+product.position);
  const frame=document.createElement('div');frame.className='auping-c2-media-frame';
  const make=(src,cls)=>{
    const im=document.createElement('img');im.className='auping-c2-authority-image '+cls;
    im.src=prefix+src;im.alt=product.title;im.loading='eager';im.decoding='async';return im;
  };
  frame.appendChild(make(primary,'auping-c2-primary'));
  if(alternate)frame.appendChild(make(alternate,'auping-c2-alternate'));
  const fit=media.objectFit==='cover'?'cover':'contain';
  frame.style.setProperty('--auping-c2-object-fit',fit);
  frame.style.setProperty('--auping-c2-object-position',media.objectPosition||'center center');
  slider.style.position='relative';slider.style.height='100%';slider.style.width='100%';slider.style.overflow='hidden';
  slider.classList.add('auping-c2-authority-slider');
  slider.replaceChildren(frame);
  card.dataset.aupingC2MediaStatus=alternate?'verified-gallery':'MEDIA_UNVERIFIED';
  if(alternate){
    const button=createArrow(prototype);
    slider.appendChild(button);
    bindGallery(slider,card,button,v=>slider.classList.toggle('auping-c2-hovered',v));
    card.dataset.aupingCatalogMediaStatus='authority-gallery';
  }else{
    card.dataset.aupingCatalogCardContract='enriched-v1';
    card.dataset.aupingCatalogMediaStatus='single-image';
  }
  // Unlike inherited donor HTML, a new product MUST NOT borrow another SKU's colors.
  const colorNodes=qa('[class*="EnrichedProductCard_Colors"],[class*="EnrichedProductCard_ColorOptions"],[class*="EnrichedProductCard_Swatches"]',card);
  const verifiedSwatches=Array.isArray(product.swatches)&&product.swatches.every(x=>x&&x.verified===true&&/^#[0-9a-fA-F]{6}$/.test(x.color));
  for(const node of colorNodes){
    if(!verifiedSwatches){node.remove();continue;}
    node.replaceChildren();
    for(const sw of product.swatches){const dot=document.createElement('span');dot.className='auping-catalog-swatch';dot.style.backgroundColor=sw.color;dot.title=sw.name||'';dot.setAttribute('aria-label',sw.name||'商品顏色');node.appendChild(dot)}
  }
  card.dataset.aupingCatalogSwatchesStatus=verifiedSwatches?'verified':'unverified-omitted';
  // Preserve generic configurator brand mark, never copy a different SKU's text badge.
  const config=q('[class*="EnrichedProductCard_ConfiguratorIcon"]',card);
  if(config){const text=q('[class*="EnrichedProductCard_ConfiguratorText"]',config);
    if(text&&!product.badgeVerified){text.remove();card.dataset.aupingCatalogBadgeStatus='unverified-omitted'}
    else card.dataset.aupingCatalogBadgeStatus='verified';
  }
  // Do not falsely point Build-your-own to the details page.
  // Keep the detail CTA; only preserve configurator CTA when SKU-specific URL exists.
  const ctas=qa('a[href]',card).filter(x=>!x.closest(gallerySel));
  for(const a of ctas){
    const label=(a.textContent||'').trim();
    if(/自行搭配|Build your own/i.test(label)){
      if(product.configuratorUrl&&/^https:\/\//.test(product.configuratorUrl)){
        a.href=product.configuratorUrl;a.target='_blank';a.rel='noopener noreferrer';
        card.dataset.aupingCatalogConfiguratorStatus='verified';
      }else{
        // Remove only THIS CTA slot. Never remove the shared Buttons container,
        // whose class name also starts with "EnrichedProductCard_Button".
        const buttonGroup=card.querySelector('[class*="EnrichedProductCard_Buttons"]');
        const slot=a.parentElement;
        if(buttonGroup && slot && slot.parentElement===buttonGroup){slot.remove();}
        else a.remove();
        card.dataset.aupingCatalogConfiguratorStatus='unverified-hidden';
      }
    }else{a.href=product.href;}
  }
  card.dataset.aupingCatalogCtaStatus='sku-specific';
  return {media:alternate?'gallery':'single',swatches:card.dataset.aupingCatalogSwatchesStatus};
}

/* U2 adds a standard-card adapter to the EXISTING U1 UI contract.
 * Both card families call bindGallery() and createArrow(); no second gallery controller. */
export function mountStandardCard(card,prototype){
  const slider=q(gallerySel,card);
  if(!slider)throw Error('U2_STANDARD_SLIDER_ABSENT');
  if(slider.dataset.aupingCatalogGalleryOwner)throw Error('U2_DOUBLE_GALLERY_OWNER');
  const imgs=qa('[class*="ProductCardImageSlide_Slide"] img',slider);
  const native=q(arrowSel,slider);
  card.dataset.aupingCatalogCardContract='standard-v1';
  card.dataset.aupingCatalogCtaStatus='source-preserved';
  card.dataset.aupingCatalogBadgeStatus='source-preserved';
  card.dataset.aupingCatalogSwatchesStatus='source-preserved';
  if(imgs.length<2){
    if(native)native.hidden=true;
    card.dataset.aupingCatalogMediaStatus='single-image';
    return {media:'single'};
  }
  if(!native){
    // Source explicitly omitted a carousel control despite two image nodes.
    // Keep it intact until verified; do not manufacture an authority claim.
    card.dataset.aupingCatalogMediaStatus='source-unverified-preserved';
    return {media:'source-preserved'};
  }
  const one=attrSnap(imgs[0]),two=attrSnap(imgs[1]);
  if(one.src===two.src&&one.srcset===two.srcset){
    native.hidden=true;
    card.dataset.aupingCatalogMediaStatus='duplicate-media-single';
    return {media:'single'};
  }
  const button=createArrow(prototype);
  native.replaceWith(button);
  slider.dataset.aupingU2Gallery='ready';
  bindGallery(slider,card,button,v=>apply(imgs[0],v?two:one),'standard-v1');
  card.dataset.aupingCatalogMediaStatus='source-native-gallery';
  return {media:'gallery'};
}
