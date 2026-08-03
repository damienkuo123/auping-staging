
(function(){
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 $$('[data-open-search], .icon-button[aria-label="Search"]').forEach(b=>b.addEventListener('click',()=>$('.search-dialog')?.classList.add('open')));
 $('.search-close')?.addEventListener('click',()=>$('.search-dialog')?.classList.remove('open'));
 $$('[data-demo-config]').forEach(b=>b.addEventListener('click',()=>{const t=document.createElement('div');t.className='demo-toast';t.textContent='Configurator reference captured; backend rules are not connected in this static build.';document.body.append(t);setTimeout(()=>t.remove(),3500)}));
 const search=(q)=>{q=q.trim().toLowerCase();if(q.length<2)return[];return (window.AUPING_SEARCH_INDEX||[]).filter(x=>(x.title+' '+x.text+' '+x.type).toLowerCase().includes(q)).slice(0,30)};
 function relUrl(path){return (window.AUPING_ROOT||'')+path.replace(/^\//,'')+'/'}
 $$('.site-search').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const q=$('input',f).value;const box=$('.search-results',f.parentElement);box.innerHTML=search(q).map(x=>`<a href="${relUrl(x.url)}"><strong>${x.title}</strong><small>${x.type}</small></a>`).join('')||'<p>No results</p>'}));
 $('.full-search')?.addEventListener('submit',e=>{e.preventDefault();const q=$('#full-search-input').value;$('#full-search-results').innerHTML=search(q).map(x=>`<a href="${relUrl(x.url)}"><strong>${x.title}</strong><span>${x.type}</span><p>${x.text||''}</p></a>`).join('')||'<p>No results</p>'});
 $('#store-filter')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();$$('.store-result').forEach(x=>x.classList.toggle('hidden',q&&!x.dataset.storeText.includes(q)))});
})();
