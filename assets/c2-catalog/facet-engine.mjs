/* Auping C2.3 | shared verified-membership facet engine | no DOM ownership.
 * All membership is from the external official authority; never derive it from product labels.
 */
export function makeEngine(category) {
  if(!category?.products?.length||!Array.isArray(category.facets))throw Error('MISSING_OFFICIAL_AUTHORITY');
  const products=category.products,facets=category.facets;
  const byKey=new Map(),byId=new Map(products.map(p=>[p.id,p]));
  for(const facet of facets){
    if(!facet.key||!facet.nativeValue||!Array.isArray(facet.orderedIds))throw Error('BAD_OFFICIAL_FACET');
    const f={...facet,members:new Set(facet.orderedIds)};
    if(f.members.size!==facet.orderedIds.length||[...f.members].some(id=>!byId.has(id)))throw Error('INVALID_OFFICIAL_MEMBERSHIP');
    if(!byKey.has(f.key))byKey.set(f.key,[]);
    byKey.get(f.key).push(f);
  }
  function matching(selected) {
    const filters=[...selected].filter(([,vals])=>vals?.size);
    return products.filter(p=>filters.every(([key,vals])=>{
      const group=byKey.get(key)||[];
      return group.some(f=>vals.has(f.nativeValue)&&f.members.has(p.id));
    }));
  }
  function availability(selected) {
    const remaining=new Set(matching(selected).map(p=>p.id));
    return facets.map(f=>({key:f.key,nativeValue:f.nativeValue,
      selected:!!selected.get(f.key)?.has(f.nativeValue),
      count:f.orderedIds.filter(id=>remaining.has(id)).length,
      // Options with zero intersection disappear, including other values of an active group.
      // Existing selections remain visible and removable regardless of count.
      visible:!!selected.get(f.key)?.has(f.nativeValue)||f.orderedIds.some(id=>remaining.has(id))
    }));
  }
  function sanitize(selected) {
    const valid=new Map(),removed=[];
    // Preserve input order: URL order is meaningful when an invalid multi-select arrives.
    for(const [key,vals] of selected){
      const group=byKey.get(key)||[];
      for(const value of vals){
        const facet=group.find(f=>f.nativeValue===value);
        if(!facet){removed.push({key,value,reason:'UNKNOWN_FACET'});continue;}
        const current=new Set(valid.get(key)||[]);
        const possible=new Set(matching(valid).map(p=>p.id));
        if(!facet.orderedIds.some(id=>possible.has(id))){
          removed.push({key,value,reason:'ZERO_INTERSECTION'});continue;
        }
        current.add(value);valid.set(key,current);
      }
    }
    return {selected:valid,removed};
  }
  function canAdd(selected,facet) {
    return facet.orderedIds.some(id=>matching(selected).some(p=>p.id===id));
  }
  return {matching,availability,sanitize,canAdd,facets,byKey};
}
