#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, subprocess
from datetime import datetime, timezone
from pathlib import Path
PAGES=["beds/noa/index.html","beds/noble/index.html","beds/original/index.html","box-springs/criade/index.html","box-springs/kiruna/index.html"]
LOCAL=["/auping-staging/assets/rc76/common/explore-beds.avif","/auping-staging/assets/rc76/common/create-bedroom.avif"]
REMOTE=["/_next/image?url=https%3A%2F%2Fapi.auping.com%2Fsites%2Fdefault%2Ffiles%2F2025-11%2Faurondepastillegreen_1.png","/_next/image?url=https%3A%2F%2Fapi.auping.com%2Fsites%2Fdefault%2Ffiles%2F2025-10%2Fauping_aw25_bedlinen_dessin_playful_bricks_065.png"]

def main()->int:
 ap=argparse.ArgumentParser();ap.add_argument('--repo',required=True);ap.add_argument('--report',required=True);a=ap.parse_args()
 repo=Path(a.repo).expanduser().resolve(); failures=[]; details={}
 for rel in PAGES:
  p=repo/rel
  if not p.is_file(): failures.append(f"missing-page:{rel}"); continue
  t=p.read_text(encoding='utf-8')
  details[rel]={"localCounts":{x:t.count(x) for x in LOCAL},"remoteCounts":{x:t.count(x) for x in REMOTE}}
  for x in LOCAL:
   if t.count(x)<3: failures.append(f"local-asset-not-applied:{rel}:{x}")
  for x in REMOTE:
   if x in t: failures.append(f"remote-next-image-remains:{rel}:{x}")
 for rel in ["assets/rc76/common/explore-beds.avif","assets/rc76/common/create-bedroom.avif"]:
  p=repo/rel
  if not p.is_file() or p.stat().st_size<8000: failures.append(f"invalid-asset:{rel}")
  elif b"ftypavif" not in p.read_bytes()[:64]: failures.append(f"not-avif:{rel}")
 phase04=None
 validator=repo/'tools/validate_rc75_phase04.py'
 if validator.is_file():
  cp=subprocess.run(['python3',str(validator),str(repo),'--report',str(repo/'audit/rc7.6/rc76a-phase04-regression.json')],capture_output=True,text=True)
  phase04={"returncode":cp.returncode,"stdout":cp.stdout[-4000:],"stderr":cp.stderr[-2000:]}
  if cp.returncode!=0: failures.append('phase04-regression')
 report={"schema":"AUPING-RC7.6A-VALIDATION-V1","generatedAt":datetime.now(timezone.utc).isoformat(),"passed":not failures,"targetPages":len(PAGES),"failures":failures,"details":details,"phase04":phase04}
 out=repo/a.report;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(report,ensure_ascii=False,indent=2));return 0 if not failures else 1
if __name__=='__main__':raise SystemExit(main())
