// Handler smoke test using a small DOM stub. This is not a real-browser/layout test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('app boots, creates a season, captures an event, restores export and undoes it',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'HTML IDs are unique');
  const elements=new Map(ids.map(id=>[id,{id,value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,classList:{toggle(){}},click(){this.onclick?.({target:this});}}]));
  const nav={};const store=new Map();
  globalThis.document={getElementById:id=>{assert.ok(elements.has(id),`Missing HTML element ${id}`);return elements.get(id);},querySelector:s=>{if(s==='nav')return nav;if(s==='nav [data-tab="round"]')return {click(){nav.onclick({target:{closest:()=>({dataset:{tab:'round'}})}});}};throw Error('Unexpected selector '+s);},querySelectorAll:s=>s==='.tab'?['round','season','courses','rules'].map(id=>elements.get(id)):[]};
  globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  globalThis.confirm=()=>true;
  await import('../src/app.js');
  const $=id=>elements.get(id),state=()=>JSON.parse(store.get('fairway-uk-v1'));
  assert.equal(state().players.length,4);
  $('create-season').onclick();assert.equal(state().players.length,14);assert.equal(state().season.events.length,12);
  assert.match($('season-events').innerHTML,/Captains Pick/);
  assert.match($('season-standings').innerHTML,/<th>Playing Handicap<\/th><\/tr>/);
  // Use the same score-entry handler a real user edits through.
  for(let p=0;p<14;p++)for(let h=0;h<18;h++){
    $('scorecard').onchange({target:{dataset:{scorePlayer:String(p),hole:String(h)},value:'5',hasAttribute:k=>k==='data-hole'}});
  }
  $('record-event').onclick();assert.ok(state().season.events[0].snapshot);
  assert.match($('season-event-results').innerHTML,/Score Differential/);
  // Round import also validates/rebuilds the embedded season.
  const exported=JSON.stringify(state());
  await $('import-round').onchange({target:{files:[{size:exported.length,text:async()=>exported}],value:'round.json'}});
  assert.equal(state().season.events[0].snapshot.entries.length,14);
  $('undo-event').onclick();assert.equal(state().season.events[0].snapshot,null);
  $('season-roster').onchange({target:{dataset:{start:'0'},value:'12.4',hasAttribute:k=>k==='data-start',checkValidity:()=>true}});
  assert.equal(state().season.roster[0].starting,12.4);
  $('season-events').onclick({target:{closest:()=>({dataset:{event:'11'}})}});
  $('captain-choice').onchange({target:{value:'medal',checkValidity:()=>true}});
  assert.equal(state().season.events[11].captainType,'medal');
  assert.match($('season-event-description').textContent,/Lowest net strokes/);
  assert.equal($('message').className,'');
});
