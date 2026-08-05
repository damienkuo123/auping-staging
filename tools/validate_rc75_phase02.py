#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, re
from pathlib import Path


def args():
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--output',type=Path,default=None);return p.parse_args()

def route(root,path): return root/path.strip('/')/'index.html'

def main():
    a=args();root=a.root.resolve();fail=[];checks=[]
    combo=json.loads((root/'data/rc75-combobox-variants.json').read_text(encoding='utf-8'))
    for pid,page in combo['pages'].items():
        f=route(root,page['localPath']); text=f.read_text(encoding='utf-8',errors='replace') if f.is_file() else ''
        ok=bool(text) and 'data-auping-rc75-combobox="runtime"' in text
        for c in page['controls']:
            ok=ok and f'data-auping-combobox-native="{c["key"]}"' in text
            if c['mode']=='react-overlay': ok=ok and f'data-auping-combobox="{c["key"]}"' in text
        checks.append({'pageId':pid,'type':'combobox','ok':ok,'controlCount':len(page['controls'])})
        if not ok: fail.append(pid)
    cat=json.loads((root/'data/rc75-catalog-parity.json').read_text(encoding='utf-8'))
    for pid,page in cat['pages'].items():
        f=route(root,page['localPath']); text=f.read_text(encoding='utf-8',errors='replace') if f.is_file() else ''
        ok=bool(text) and 'data-auping-rc75-catalog="runtime"' in text
        for g in page['groups']:
            for o in g['options']:
                pos=text.find(f'id="{o["inputId"]}"')
                if pos<0: pos=text.find(f"id='{o['inputId']}'")
                segment=text[max(0,pos-500):pos+1000] if pos>=0 else ''
                ok=ok and f'data-auping-filter-group="{g["key"]}"' in segment and f'data-auping-filter-value="{o["value"]}"' in segment
        for p in page['products']:
            ok=ok and p['title'] in text
        checks.append({'pageId':pid,'type':'catalog','ok':ok,'productCount':len(page['products'])})
        if not ok: fail.append(pid)
    duvet=cat['pages']['bed-linen-duvets']
    keys=[g['key'] for g in duvet['groups']]
    mapping_ok=('season' in keys and 'filling' in keys and 'fabric' not in keys)
    if not mapping_ok: fail.append('duvet-group-mapping')
    payload={'schema':'AUPING-RC7.5-PHASE02-VALIDATION-V1','passed':not fail,'checks':checks,'duvetMapping':{'keys':keys,'ok':mapping_ok},'failures':fail,'summary':{'comboboxPages':len(combo['pages']),'comboboxControls':sum(len(x['controls']) for x in combo['pages'].values()),'catalogPages':len(cat['pages']),'catalogProducts':sum(len(x['products']) for x in cat['pages'].values())}}
    out=a.output or root/'audit/rc7.5/phase02-validation.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'passed':payload['passed'],**payload['summary'],'failures':fail},ensure_ascii=False,indent=2));return 0 if not fail else 1
if __name__=='__main__': raise SystemExit(main())
