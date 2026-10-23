#!/usr/bin/env python3
"""Auping v2.0.2: one read-only routing contract for release and in-repo validator.

Interactive HTML must use the nine-section RC7 menu. Simple redirect aliases must
stay redirects (no menu); one explicitly named dynamic RC72 bridge remains OPEN as
an architectural exception. Unknown types fail closed. No network or writes.
"""
from __future__ import annotations
from html.parser import HTMLParser
import pathlib
import re
import urllib.parse

BRIDGE_ROUTE='/news/awards/'

class RouteContractError(ValueError): pass

def fail(message):
    raise RouteContractError('HARD_STOP__V202_ROUTE_'+message)

class Tags(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags=[]
    def handle_starttag(self,tag,attrs):
        self.tags.append((tag,dict(attrs)))
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)

def as_route(raw):
    u=urllib.parse.urlsplit(raw.strip().strip('"\''))
    if u.scheme or u.netloc or u.query or u.fragment:fail('REDIRECT_EXTERNAL_OR_PARAMS')
    if not u.path.startswith('/auping-staging/'):fail('REDIRECT_NOT_LOCAL_'+u.path[:80])
    rel=u.path[len('/auping-staging'):]
    if not rel.startswith('/') or not rel.endswith('/') or '//' in rel or '..' in pathlib.PurePosixPath(rel).parts:
        fail('REDIRECT_TARGET_PATH_'+rel[:80])
    return rel

def classify(doc:str,route:str,existing_routes:set[str]):
    """Returns (kind, details); interactive documents validated separately.

    Only zero-delay, same-site redirect stubs (41 historically) and the precisely
    documented /news/awards/ RC72 bridge (1 historically) have no RC7 mobile menu.
    """
    if re.search(r'<aside\b[^>]*class="[^"]*\bFullPageMenu_FullPageMenu__JtGdn\b',doc,re.I):
        return 'interactive',{}
    if route==BRIDGE_ROUTE:
        required=('data-auping-page-type="bridge"','data-rc72-route="news-awards"',
                  '/assets/rc7-local-pages.js', 'data-auping-generated-heading')
        if not all(q in doc for q in required):fail('BRIDGE_SIGNATURE_CHANGED')
        if 'rc7-runtime.js' in doc or 'data-auping-mobile-root=' in doc or 'http-equiv="refresh"' in doc:
            fail('BRIDGE_OWNER_CONFLICT')
        return 'bridge_preserved',{'controller':'rc7-local-pages.js','acceptance':'EXCEPTION_NOT_UNIFIED_RC7'}
    if 'data-rc72-route' in doc or 'rc7-runtime.js' in doc or 'data-auping-mobile-root' in doc:
        fail('MISSING_NAV_ON_INTERACTIVE_'+route)
    if len(doc.encode('utf8'))>4096:fail('REDIRECT_TOO_LARGE_'+route)
    if re.search(r'<(?:header|aside|nav)\b',doc,re.I):fail('REDIRECT_HAS_NAV_'+route)
    parser=Tags()
    try:parser.feed(doc)
    except Exception as e:fail('INVALID_HTML_'+type(e).__name__)
    metas=[attrs for tag,attrs in parser.tags if tag=='meta' and (attrs.get('http-equiv') or '').lower()=='refresh']
    if len(metas)!=1:fail('NO_UNIQUE_ZERO_REFRESH_'+route)
    m=re.fullmatch(r'\s*0\s*;\s*url\s*=\s*(.*?)\s*',metas[0].get('content',''),re.I)
    if not m:fail('REFRESH_NOT_INSTANT_'+route)
    target=as_route(m.group(1))
    if route==target or target not in existing_routes:fail('REDIRECT_TARGET_MISSING_OR_SELF_'+route+'_'+target)
    canon=[a for tag,a in parser.tags if tag=='link' and 'canonical' in (a.get('rel') or '').lower().split()]
    if len(canon)>1:fail('DUPLICATE_CANONICAL_'+route)
    if canon and as_route(canon[0].get('href',''))!=target:fail('REDIRECT_CANONICAL_MISMATCH_'+route)
    anchors=[a for tag,a in parser.tags if tag=='a']
    if not any(a.get('href','')=='/auping-staging'+target for a in anchors):fail('REDIRECT_NO_FALLBACK_LINK_'+route)
    if 'location.replace(' not in doc:fail('REDIRECT_NO_JS_FALLBACK_'+route)
    if 'data-auping-mobile-trigger=' in doc or 'data-auping-shared-menu=' in doc:
        fail('REDIRECT_WRONGLY_NORMALIZED_'+route)
    return 'redirect_preserved',{'target':target,'owner':'no_navigation_immediate_redirect'}

def validate_redirect_graph(redirects:dict[str,str],types:dict[str,str],interactive_types=('interactive',)):
    """Allow finite, local alias chains; ban cycles, missing targets and dynamic bridges.

    At most 3 redirects may be followed before reaching an interactive page.
    Returns diagnostics for receipts, not new HTML.
    """
    depths={}
    for start in redirects:
        target=redirects[start];seen={start}
        for depth in range(1,4):
            if target in seen:fail('REDIRECT_CYCLE_'+start)
            seen.add(target)
            state=types.get(target)
            if state in interactive_types:
                depths[start]=depth
                break
            if state!='redirect_preserved' or target not in redirects:
                fail('REDIRECT_BAD_TERMINAL_'+start+'_'+target+'_'+str(state))
            target=redirects[target]
        else:fail('REDIRECT_CHAIN_TOO_LONG_'+start)
    return {'count':len(redirects),'maxDepth':max(depths.values(),default=0),
            'multiHop':sum(n>1 for n in depths.values())}
