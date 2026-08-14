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
    if re.search(patt,html,re.I):
        return re.sub(patt,rep,html,count=1,flags=re.I)
    return html

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo",required=True)
    ap.add_argument("--contract",required=True)
    ap.add_argument("--fragment",required=True)
    a=ap.parse_args()
    repo=Path(a.repo); c=json.loads(Path(a.contract).read_text())
    target=repo/"customer-service/manuals/index.html"
    if target.exists(): raise SystemExit("STOP: target already exists")
    frag=Path(a.fragment).read_text()
    if hashlib.sha256(frag.encode()).hexdigest()!=c["localizedFragmentSha256"]:
        raise SystemExit("STOP: localized fragment SHA mismatch")
    shell=(repo/"customer-service/index.html").read_text()
    html=sub_once(r"<main\b.*?</main>",frag,shell,"main")
    html=sub_once(r"<title>.*?</title>",f"<title>{c['metadata']['title']}</title>",html,"title")
    html=meta_replace(html,"name","description",c["metadata"]["description"])
    html=meta_replace(html,"property","og:title",c["metadata"]["title"])
    html=meta_replace(html,"property","og:description",c["metadata"]["description"])
    html=meta_replace(html,"name","twitter:title",c["metadata"]["title"])
    html=meta_replace(html,"name","twitter:description",c["metadata"]["description"])
    canonical="/auping-staging/customer-service/manuals/"
    if re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*>',html,re.I):
        html=re.sub(r'<link[^>]+rel=["\']canonical["\'][^>]*>',f'<link rel="canonical" href="{canonical}"/>',html,count=1,flags=re.I)
    else:
        html=html.replace("</head>",f'<link rel="canonical" href="{canonical}"/></head>',1)
    html=meta_replace(html,"property","og:url",canonical)
    html=re.sub(r'data-auping-page-id="[^"]*"', 'data-auping-page-id="customer-service-manuals"', html,count=1)
    html=html.replace("<main",'<!-- AUPING_CS_WAVE2_MANUALS_V1 --><main',1)
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(html)
    print("MATERIALIZE_MANUALS_PASS")

if __name__=="__main__":
    main()
