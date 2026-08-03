(()=>{'use strict';
const BASE=location.pathname.startsWith('/auping-staging')?'/auping-staging':'';
const DATA=window.AUPING_SITE_DATA||{search:[]};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const normPath=(href)=>{try{let u=new URL(href,location.href),p=u.pathname.replace(/^\/auping-staging/,'').replace(/^\/(en|zh-tw|zh)(?=\/|$)/,'')||'/';if(!p.endsWith('/')&&!/\.[a-z0-9]+$/i.test(p))p+='/';if(p.startsWith('/mattress-toppers/'))p='/toppers/'+p.slice('/mattress-toppers/'.length);return p}catch{return ''}};
function chineseHref(url){const p=normPath(url);return BASE+(p||'/')}
function setupSearch(){
 let panel=$('.rc5-search');if(!panel){panel=document.createElement('section');panel.className='rc5-search';panel.hidden=true;panel.innerHTML=`<div class="rc5-search__inner"><label class="rc5-search__label" for="rc5-search-input">搜尋 Auping</label><div class="rc5-search__field"><input id="rc5-search-input" type="search" placeholder="輸入商品、類別或內容關鍵字"><button class="rc5-search__close" type="button" aria-label="關閉搜尋">×</button></div><div class="rc5-search__results"></div></div>`;document.body.appendChild(panel)}
 const input=$('#rc5-search-input',panel),results=$('.rc5-search__results',panel),close=$('.rc5-search__close',panel);
 const run=()=>{const q=input.value.trim().toLowerCase();if(!q){results.innerHTML='';return}const rows=(DATA.search||[]).filter(x=>(x.title+' '+x.text+' '+x.url).toLowerCase().includes(q)).slice(0,18);results.innerHTML=rows.length?rows.map(x=>`<a href="${chineseHref(x.url)}"><strong>${x.title}</strong><span>${x.text}</span></a>`).join(''):`<div><strong>找不到符合的本站內容</strong><span>請嘗試其他關鍵字，或前往官方門市取得協助。</span></div>`};
 const open=()=>{panel.hidden=false;requestAnimationFrame(()=>input.focus())};
 const shut=()=>{panel.hidden=true;input.value='';results.innerHTML=''};
 close.onclick=shut;input.oninput=run;input.onkeydown=e=>{if(e.key==='Escape')shut();if(e.key==='Enter')run()};
 // Capture phase prevents the older snapshot search handler from opening a second overlay.
 document.addEventListener('click',e=>{const c=e.target.closest('button,a');if(!c)return;const t=((c.getAttribute('aria-label')||'')+' '+(c.title||'')+' '+(c.innerText||'')).toLowerCase();const isHeader=!!c.closest('header,nav');const isSearch=(t.includes('search')||t.includes('搜尋')||c.getAttribute('aria-label')==='Submit'||(isHeader&&c.querySelector('svg')&&t.trim()===''));if(isSearch&&!c.getAttribute('href')){e.preventDefault();e.stopImmediatePropagation();open()}},true);
}
function setupFilters(){
 const cards=$$('[data-rc5-filter-card]');if(!cards.length)return;
 const inputs=$$('input[data-rc5-filter-key]');if(!inputs.length)return;
 const total=cards.length;let chips=$('.rc5-filter-chips');if(!chips){chips=document.createElement('div');chips.className='rc5-filter-chips';const title=$('[class*="CatalogWithFilters_productsTitle"]')||$('h1');(title?.parentElement||cards[0].parentElement).insertAdjacentElement('afterend',chips)}
 let none=$('.rc5-no-results');if(!none){none=document.createElement('div');none.className='rc5-no-results';none.hidden=true;none.textContent='找不到符合條件的商品';cards[0].parentElement.appendChild(none)}
 const count=$('[class*="CatalogWithFilters_productsTotal"]');
 const selected=()=>{const m={};inputs.filter(x=>x.checked).forEach(x=>(m[x.dataset.rc5FilterKey]??=[]).push(x.dataset.rc5FilterValue));return m};
 const apply=(update=true)=>{const groups=selected();let visible=0;cards.forEach(card=>{let ok=true;for(const [key,vals] of Object.entries(groups)){const have=(card.dataset['rc5'+key[0].toUpperCase()+key.slice(1)]||'').split('|').filter(Boolean);if(!vals.some(v=>have.includes(v))){ok=false;break}}card.hidden=!ok;if(ok)visible++});if(count)count.textContent=`共 ${visible} 件商品`;none.hidden=visible!==0;chips.innerHTML='';inputs.filter(x=>x.checked).forEach(input=>{const b=document.createElement('button');b.type='button';b.className='rc5-filter-chip';b.textContent=(input.dataset.rc5FilterValue||'條件')+' ×';b.onclick=()=>{input.checked=false;apply(true)};chips.appendChild(b)});if(update){const u=new URL(location.href);const keys=[...new Set(inputs.map(x=>x.dataset.rc5FilterKey))];keys.forEach(k=>u.searchParams.delete(k));inputs.filter(x=>x.checked).forEach(x=>u.searchParams.append(x.dataset.rc5FilterKey,x.dataset.rc5FilterValue));history.replaceState({},'',u)}};
 const params=new URLSearchParams(location.search);inputs.forEach(i=>{if(params.getAll(i.dataset.rc5FilterKey).includes(i.dataset.rc5FilterValue)||params.getAll(i.name).includes(i.value))i.checked=true;i.addEventListener('change',()=>apply(true))});apply(false)
}
function setupNews(){const buttons=$$('[class*="News"] button,[class*="Tag"] button');if(!buttons.length)return;const cards=$$('[class*="NewsCard"],article');const q=new URLSearchParams(location.search).get('tags')||new URLSearchParams(location.search).get('tag')||'';buttons.forEach(b=>{const t=(b.innerText||'').trim();if(q&&t.toLowerCase().includes(q.toLowerCase()))b.classList.add('active')})}
function cleanLanguage(){$$('a,button,span,div').forEach(x=>{const t=(x.innerText||'').trim();if((t==='English'||t==='EN')&&x.children.length<4)x.classList.add('rc5-language-hidden')})}
function boot(){setupSearch();setupFilters();setupNews();cleanLanguage()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
