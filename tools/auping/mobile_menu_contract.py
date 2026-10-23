#!/usr/bin/env python3
"""RC7 shared mobile menu and typed-route contract: redirects/RC72 bridge explicit.
Run after local promotion; read only. Zero errors DOES NOT mean bridge is unified.
"""
import argparse,collections,json,pathlib,re,sys
from route_archetypes import classify,validate_redirect_graph,RouteContractError
KEYS=['box-springs','beds','mattresses','toppers','bed-bases','pillows','bed-linen','accessories','smart-products']
NAVCSS='assets/auping-shared/mobile-menu-v200.css'
TAG='data-auping-shared-menu="v2.0.2"'
MENU=re.compile(r'<aside\b[^>]*class="[^"]*\bFullPageMenu_FullPageMenu__JtGdn\b[^\"]*"[^>]*>[\s\S]*?</aside>',re.I)
EXCLUDE={'assets','.git','node_modules','dist','build','.venv','_tmp'}
def route(p):return '/' if len(p.parts)==1 else '/'+('/'.join(p.parts[:-1]))+'/'
def check(repo,canonical):
 issues=[];got={};kinds={};targets={};counts=collections.Counter()
 for path in repo.rglob('index.html'):
  rel=path.relative_to(repo)
  if any(q in EXCLUDE for q in rel.parts[:-1]):continue
  r=route(rel);got[r]=True
 # Separate pass so redirect targets can be verified against all present routes.
 for path in repo.rglob('index.html'):
  rel=path.relative_to(repo)
  if any(q in EXCLUDE for q in rel.parts[:-1]):continue
  r=route(rel);s=path.read_text('utf8')
  try:kind,detail=classify(s,r,set(got))
  except RouteContractError as e:
   issues.append((r,str(e)));continue
  kinds[r]=kind;counts[kind]+=1
  if kind=='redirect_preserved':targets[r]=detail['target']
  if kind!='interactive':
   if r in canonical:issues.append((r,'CANONICAL_MUST_HAVE_RC7_MENU'))
   continue
  nav=MENU.findall(s)
  if len(nav)!=1:issues.append((r,'MENU_COUNT_'+str(len(nav))));continue
  m=nav[0]
  for key,n in [('data-auping-mobile-root',1),('data-auping-mobile-item',9),('data-auping-mobile-submenu',9),('data-auping-mobile-back',9)]:
   if len(re.findall(r'\b'+key+r'=',m))!=n:issues.append((r,key+'_COUNT'))
  for key in KEYS:
   if len(re.findall(r'\bdata-auping-mobile-item="'+re.escape(key)+r'"',m))!=1:issues.append((r,'ITEM_'+key))
   if len(re.findall(r'\bdata-auping-mobile-submenu="'+re.escape(key)+r'"',m))!=1:issues.append((r,'SUB_'+key))
  if len(re.findall(r'\bdata-auping-mobile-trigger=',s))!=1:issues.append((r,'TRIGGER_COUNT'))
  if s.count(TAG)!=1:issues.append((r,'SHARED_CSS_LINK'))
  if s.count('rc7-runtime.js')!=1:issues.append((r,'RC7_CONTROLLER'))
 if len(got)!=384 or counts['interactive']!=342 or counts['redirect_preserved']!=41 or counts['bridge_preserved']!=1:
  issues.append(('SCOPE','ARCHETYPE_COUNTS_'+json.dumps(dict(counts),sort_keys=True)))
 try:graph=validate_redirect_graph(targets,kinds)
 except RouteContractError as e:issues.append(('REDIRECTS',str(e)));graph={}
 missing=sorted(canonical-set(got))
 if missing:issues.append(('SCOPE','MISSING_'+str(len(missing))+'_'+','.join(missing[:3])))
 js=(repo/'assets/rc73-page.js').read_text('utf8')
 for sig in ['if(mobileTrigger&&root&&!root.hasAttribute("data-auping-mobile-root")){','if(mt&&mr&&!window.AupingRC7MobileMenu&&!mr.hasAttribute("data-auping-mobile-root")){']:
  if js.count(sig)!=1:issues.append(('SHARED_RC73','SINGLE_OWNER_GUARD_MISSING'))
 if not (repo/NAVCSS).is_file():issues.append(('SHARED_CSS','FILE_MISSING'))
 return got,counts,issues,graph
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--repo',required=True);a.add_argument('--canonical',required=True);args=a.parse_args()
 repo=pathlib.Path(args.repo).resolve();c=[x.strip() for x in pathlib.Path(args.canonical).read_text('utf8').splitlines() if x.strip()]
 if len(c)!=328 or len(set(c))!=328:sys.exit('HARD_STOP_CANONICAL_SCOPE')
 got,counts,issues,graph=check(repo,set(c))
 print(json.dumps({'schema':'AUPING_SHARED_MOBILE_MENU_VALIDATOR_V202','checkedActualRoutes':len(got),'canonicalRoutes':len(c),'kinds':dict(counts),'redirectGraph':graph,'rc72BridgeException':'/news/awards/ remains distinct and unaccepted as RC7','errors':len(issues),'firstErrors':issues[:15]},ensure_ascii=False))
 sys.exit(0 if not issues else 2)
