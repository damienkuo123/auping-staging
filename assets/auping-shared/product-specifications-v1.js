/* Final V2 | Product Specifications owner v1.0
 * Opt-in only: [data-auping-spec-contract="v1"].
 * No write to U1/U2/U3/U4D, Read More, navigation or gallery handlers.
 * Native href #product-specifications remains functional even when JS is unavailable.
 */
(()=>{
  'use strict';
  const section = document.querySelector('section[data-auping-spec-contract="v1"][data-section="ProductSpecifications"]');
  if (!section || section.dataset.aupingSpecOwner) return;
  const table = section.querySelector('table');
  const button = section.querySelector('button[class*="Specifications_showMoreButton"]');
  const rows = table ? Array.from(table.querySelectorAll('tbody > tr')) : [];
  if (!table || !button || rows.length < 4) {
    if(section) section.dataset.aupingSpecOwner='failed';
    console.error('[Auping Specs v1] missing table/button/full rows');
    return;
  }
  section.dataset.aupingSpecOwner='initializing';
  const tbody=table.tBodies[0];
  if(!tbody.id)tbody.id='auping-product-specifications-table-body';
  button.type='button';
  button.setAttribute('aria-controls',tbody.id);
  button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-label','展開全部規格');
  const label=button.querySelector('span:last-child') || button;
  const expandedRows=rows.slice(3);
  let expanded=false;
  const paint=()=>{
    expandedRows.forEach(tr=>{
      tr.hidden=!expanded;
      tr.style.display=expanded?'':'none';
    });
    button.setAttribute('aria-expanded',String(expanded));
    button.setAttribute('aria-label',expanded?'收合規格':'展開全部規格');
    label.textContent=expanded?'收合規格':'更多規格';
    section.dataset.aupingSpecExpanded=String(expanded);
  };
  button.addEventListener('click',()=>{expanded=!expanded;paint();});
  const jump=document.querySelector('a.auping-spec-anchor[href="#product-specifications"]');
  section.style.scrollMarginTop='130px';
  if(jump){
    jump.setAttribute('aria-label','前往產品規格');
    // Native anchor handles mouse, keyboard and history without custom click owner.
  }
  paint();
  section.dataset.aupingSpecOwner='ready';
  section.dataset.aupingSpecRowCount=String(rows.length);
  document.dispatchEvent(new CustomEvent('auping:product-specifications-ready',{detail:{rows:rows.length}}));
})();
