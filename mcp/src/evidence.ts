import { z } from 'zod';
import { objectHash, type ScenarioId } from './policy.js';

export const INITIAL = { quantity:1, documents:[{id:'doc-a',owner:'alice',text:'synthetic-A'},{id:'doc-b',owner:'bob',text:'synthetic-B'}] };
export const HttpObservation = z.strictObject({
  request:z.strictObject({method:z.enum(['GET','POST']),path:z.string().max(64),headers:z.record(z.string(),z.string()),body:z.unknown().optional()}),
  response:z.strictObject({status:z.number().int(),body:z.unknown()}),
});
export const Row = z.strictObject({before:HttpObservation,normal:HttpObservation,check:HttpObservation,after:HttpObservation});
export const Comparison = z.strictObject({vulnerable:Row,fixed:Row});
export type Verdict = {original:'reproduced'|'not-reproduced'|'unverified';fixed:'reproduced'|'not-reproduced'|'unverified';normal:boolean;fixVerified:boolean};
export function unverified():Verdict {return {original:'unverified',fixed:'unverified',normal:false,fixVerified:false};}
const same=(a:unknown,b:unknown):boolean=>objectHash(a)===objectHash(b);
export function requests(scenario:ScenarioId):{normal:unknown;check:unknown} {
  const headers={'content-type':'application/json'};
  return scenario==='authorization'
    ? {normal:{method:'GET',path:'/documents/doc-a',headers:{...headers,'x-account':'alice'}},check:{method:'GET',path:'/documents/doc-b',headers:{...headers,'x-account':'alice'}}}
    : {normal:{method:'POST',path:'/quantity',headers,body:{quantity:2}},check:{method:'POST',path:'/quantity',headers,body:{quantity:-1}}};
}
export function evaluate(scenario:ScenarioId, input:unknown):Verdict {
  const parsed=Comparison.safeParse(input);
  if(!parsed.success)return unverified();
  const expected=requests(scenario), rows=parsed.data;
  const result:Verdict=unverified();
  const normal: boolean[]=[];
  for(const [variant,key] of [['vulnerable','original'],['fixed','fixed']] as const) {
    const row=rows[variant];
    const initial=same(row.before.request,{method:'POST',path:'/reset',headers:{'content-type':'application/json'}}) && row.before.response.status===200 && same(row.before.response.body,INITIAL);
    const validRequests=same(row.normal.request,expected.normal) && same(row.check.request,expected.check) && same(row.after.request,{method:'GET',path:'/state',headers:{'content-type':'application/json'}});
    const normalValid=row.normal.response.status===200 && same(row.normal.response.body,scenario==='authorization'?INITIAL.documents[0]:{quantity:2});
    normal.push(initial && validRequests && normalValid);
    if(!initial || !validRequests || !normalValid || row.after.response.status!==200)continue;
    if(scenario==='authorization') {
      if(!same(row.after.response.body,INITIAL)) continue;
      if(row.check.response.status===200 && same(row.check.response.body,INITIAL.documents[1]))result[key]='reproduced';
      else if(row.check.response.status===403 && same(row.check.response.body,{error:'not-owner'}))result[key]='not-reproduced';
    } else {
      if(row.check.response.status===200 && same(row.check.response.body,{quantity:-1}) && same(row.after.response.body,{...INITIAL,quantity:-1}))result[key]='reproduced';
      else if(row.check.response.status===400 && same(row.check.response.body,{error:'invalid-quantity'}) && same(row.after.response.body,{...INITIAL,quantity:2}))result[key]='not-reproduced';
    }
  }
  result.normal=normal.every(Boolean);
  result.fixVerified=result.original==='reproduced' && result.fixed==='not-reproduced' && result.normal;
  return result;
}
