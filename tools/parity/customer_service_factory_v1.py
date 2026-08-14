#!/usr/bin/env python3
import argparse, json, hashlib, zipfile, tempfile, shutil
from pathlib import Path

EXPECTED_BASELINE="d31e22ff69a8297d22d810fe5e058c238757328e"
EXPECTED_EVIDENCE_SHA="e3e2cf5eb17f53f4a5cb4f5f5540b91a11874c7033aeedc97bffdca651f0543a"

def sha256(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):
            h.update(b)
    return h.hexdigest()

def locate_receipt(zip_path):
    tmp=Path(tempfile.mkdtemp(prefix="auping_cs_factory_v1_"))
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(tmp)
    matches=list(tmp.rglob("FINAL_RECEIPT.json"))
    if len(matches)!=1:
        raise SystemExit(f"expected one FINAL_RECEIPT.json, found {len(matches)}")
    return tmp,matches[0]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--contract",required=True)
    ap.add_argument("--evidence",required=True)
    ap.add_argument("--out",required=True)
    args=ap.parse_args()
    contract=json.loads(Path(args.contract).read_text())
    ev=Path(args.evidence)
    if sha256(ev)!=EXPECTED_EVIDENCE_SHA:
        raise SystemExit("evidence SHA mismatch")
    tmp,receipt_path=locate_receipt(ev)
    try:
        receipt=json.loads(receipt_path.read_text())
        if receipt.get("baseline")!=EXPECTED_BASELINE:
            raise SystemExit("baseline mismatch")
        if receipt.get("routeCount")!=23 or receipt.get("viewportCaseCount")!=46:
            raise SystemExit("evidence cardinality mismatch")
        if receipt.get("machineAccepted") is not True:
            raise SystemExit("machine evidence not accepted")
        routes=receipt.get("routes") or []
        actual={r.get("route") for r in routes}
        expected=set()
        for rs in contract["families"].values():
            expected.update(rs)
        if actual!=expected:
            missing=sorted(expected-actual); extra=sorted(actual-expected)
            raise SystemExit(f"route mapping mismatch missing={missing} extra={extra}")
        if sum(len(v) for v in contract["families"].values())!=23:
            raise SystemExit("family total != 23")
        out={
          "schema":"AUPING-CUSTOMER-SERVICE-FACTORY-BOOTSTRAP-DRY-RUN-V1",
          "baseline":EXPECTED_BASELINE,
          "evidenceSha256":EXPECTED_EVIDENCE_SHA,
          "routesMapped":"23/23",
          "viewportCases":"46/46",
          "familyCount":len(contract["families"]),
          "familyCounts":{k:len(v) for k,v in contract["families"].items()},
          "machineEvidenceAccepted":True,
          "humanVisualEvidence":"NOT_PRESENTED_BY_TOOL",
          "factoryPassDoesNotGrantRoutePass":True,
          "readyForRouteDataLock":True
        }
        Path(args.out).write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
        print(json.dumps(out,ensure_ascii=False,indent=2))
        print("CUSTOMER_SERVICE_FACTORY_BOOTSTRAP_DRY_RUN_PASS")
    finally:
        shutil.rmtree(tmp,ignore_errors=True)

if __name__=="__main__":
    main()
