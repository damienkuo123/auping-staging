#!/usr/bin/env python3
import argparse,hashlib,json,re
from pathlib import Path

def sub_once(pattern,repl,text,label):
    out,n=re.subn(pattern,repl,text,count=1,flags=re.S|re.I)
    if n!=1: raise SystemExit(f"STOP: {label} replacement count={n}")
    return out

def meta_replace(html,attr,key,value):
    patt=rf'<meta[^>]+{attr}=["\']{re.escape(key)}["\'][^>]*>'
    rep=f'<meta {attr}="{key}" content="{value}"/>'
    if re.search(patt,html,re.I): return re.sub(patt,rep,html,count=1,flags=re.I)
    return html

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--repo',required=True);ap.add_argument('--contract',required=True);ap.add_argument('--fragments',required=True);a=ap.parse_args()
    repo=Path(a.repo);c=json.loads(Path(a.contract).read_text());shell=(repo/'customer-service/index.html').read_text();created=[]
    try:
      for r in c['routes']:
        target=repo/r['route'].strip('/')/'index.html'
        if target.exists(): raise SystemExit(f"STOP: target exists {target}")
        frag=(Path(a.fragments)/r['fragmentFile']).read_text()
        if hashlib.sha256(frag.encode()).hexdigest()!=r['localizedFragmentSha256']: raise SystemExit(f"STOP: fragment SHA mismatch {r['route']}")
        html=sub_once(r'<main\b.*?</main>',frag,shell,f"main {r['route']}")
        html=sub_once(r'<title>.*?</title>',f"<title>{r['localizedTitle']}</title>",html,'title')
        for attr,key,val in [('name','description',r['localizedDescription']),('property','og:title',r['localizedTitle']),('property','og:description',r['localizedDescription']),('name','twitter:title',r['localizedTitle']),('name','twitter:description',r['localizedDescription'])]: html=meta_replace(html,attr,key,val)
        canonical='/auping-staging'+r['route']
        if re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*>',html,re.I): html=re.sub(r'<link[^>]+rel=["\']canonical["\'][^>]*>',f'<link rel="canonical" href="{canonical}"/>',html,count=1,flags=re.I)
        else: html=html.replace('</head>',f'<link rel="canonical" href="{canonical}"/></head>',1)
        html=meta_replace(html,'property','og:url',canonical)
        html=re.sub(r'data-auping-page-id="[^"]*"',f'data-auping-page-id="cs-wave5-{r["slug"]}"',html,count=1)
        if r.get('responsiveHero'):
          css='''<style data-auping-wave5-responsive-v1>\n[data-auping-wave5-hero="mobile"]{display:none!important}\n@media (max-width:767px){\n[data-auping-wave5-hero="desktop"]{display:none!important}\n[data-auping-wave5-hero="mobile"]{display:block!important}\n}\n</style>'''
          html=html.replace('</head>',css+'</head>',1)
        html=html.replace('<main',f'<!-- AUPING_CS_WAVE5_SMARTBASE_DETAILS_V1 route="{r["route"]}" --><main',1)
        target.parent.mkdir(parents=True,exist_ok=True);target.write_text(html);created.append(target)
      print('MATERIALIZE_SMARTBASE_DETAILS_PASS',len(created))
    except BaseException:
      for p in created:
        try:p.unlink()
        except Exception:pass
      raise
if __name__=='__main__':main()
