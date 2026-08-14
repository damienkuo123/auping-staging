#!/usr/bin/env python3
import argparse, hashlib, json, re
from pathlib import Path

def sub_once(pattern,repl,text,label):
    out,n=re.subn(pattern,repl,text,count=1,flags=re.S|re.I)
    if n!=1:
        raise SystemExit(f"STOP: {label} replacement count={n}")
    return out

def replace_meta(html,key,value,attr="name"):
    patt=rf'<meta[^>]+{attr}=["\']{re.escape(key)}["\'][^>]*>'
    rep=f'<meta {attr}="{key}" content="{value}"/>'
    if re.search(patt,html,re.I):
        return re.sub(patt,rep,html,count=1,flags=re.I)
    return html

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo",required=True)
    ap.add_argument("--contract",required=True)
    ap.add_argument("--fragments",required=True)
    a=ap.parse_args()
    repo=Path(a.repo)
    c=json.loads(Path(a.contract).read_text())
    shell=(repo/"customer-service/index.html").read_text()
    if "<main" not in shell:
        raise SystemExit("STOP: canonical Customer Service shell has no main")
    created=[]
    try:
        for r in c["routes"]:
            target=repo/r["route"].strip("/")/"index.html"
            if target.exists():
                raise SystemExit(f"STOP: target exists {target}")
            frag=(Path(a.fragments)/r["fragmentFile"]).read_text()
            if hashlib.sha256(frag.encode()).hexdigest()!=r["localizedFragmentSha256"]:
                raise SystemExit(f"STOP: fragment SHA mismatch {r['route']}")
            html=sub_once(r"<main\b.*?</main>",frag,shell,f"main {r['route']}")
            html=sub_once(r"<title>.*?</title>",f"<title>{r['localizedTitle']}</title>",html,"title")
            html=replace_meta(html,"description",r["localizedDescription"],"name")
            html=replace_meta(html,"og:title",r["localizedTitle"],"property")
            html=replace_meta(html,"og:description",r["localizedDescription"],"property")
            html=replace_meta(html,"twitter:title",r["localizedTitle"],"name")
            html=replace_meta(html,"twitter:description",r["localizedDescription"],"name")
            canonical="/auping-staging"+r["route"]
            if re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*>',html,re.I):
                html=re.sub(r'<link[^>]+rel=["\']canonical["\'][^>]*>',f'<link rel="canonical" href="{canonical}"/>',html,count=1,flags=re.I)
            else:
                html=html.replace("</head>",f'<link rel="canonical" href="{canonical}"/></head>',1)
            html=replace_meta(html,"og:url",canonical,"property")
            html=re.sub(r'data-auping-page-id="[^"]*"',f'data-auping-page-id="cs-wave1-{r["slug"]}"',html,count=1)
            html=html.replace("</head>", """<style data-auping-niaga-responsive-v12>
[data-auping-niaga-hero="mobile"]{display:none!important}
@media (max-width:767px){
  [data-auping-niaga-hero="desktop"]{display:none!important}
  [data-auping-niaga-hero="mobile"]{display:block!important}
}
</style></head>""",1)
            html=html.replace("<main",f'<!-- AUPING_CS_WAVE1_NIAGA_V1_2 route="{r["route"]}" --><main',1)
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(html)
            created.append(target)
        print("MATERIALIZE_PASS",len(created))
    except Exception:
        for p in created:
            try: p.unlink()
            except Exception: pass
        raise

if __name__=="__main__":
    main()
