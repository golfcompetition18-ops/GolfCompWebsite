import {competitionTypes,createSeason,calculateSeason,captureRound,eventType} from './season.js';
import {playingHandicaps,handicapLabel} from './rules.js';

export function initSeasonUI({getState,persist,renderRound,message,download,esc,option}){
  const $=id=>document.getElementById(id);let selected=0;
  const fail=err=>message(err.message,true);
  function render(){
    const state=getState(),s=state.season;
    $('season-empty').hidden=!!s;$('season-workspace').hidden=!s;if(!s)return;
    const result=calculateSeason(s),done=result.events.length;
    selected=Math.max(0,Math.min(11,selected));
    const event=s.events[selected],type=event.id==='captain'&&!event.captainType?null:eventType(event);
    $('season-progress').textContent=`${done} / 12 completed`;
    $('season-events').innerHTML=competitionTypes.map((c,i)=>`<button class="event-tile ${i===selected?'chosen':''}" data-event="${i}"><small>${String(i+1).padStart(2,'0')} · ${s.events[i].snapshot?'RECORDED':i===done?'UP NEXT':'TO PLAY'}</small><strong>${esc(c.name)}</strong></button>`).join('');
    $('season-roster').innerHTML=`<table><thead><tr><th>Player</th><th>Starting handicap index</th><th>Prior Score Differentials · oldest → newest (up to 20)</th></tr></thead><tbody>${s.roster.map((p,i)=>`<tr><th>${esc(state.players.find(x=>x.id===p.id)?.name||p.name)}</th><td><input aria-label="${esc(p.name)} starting handicap" data-start="${i}" type="number" min="-10" max="54" step="0.1" value="${p.starting}" ${done?'disabled':''}></td><td><input class="history-input" aria-label="${esc(p.name)} prior differentials" data-history="${i}" value="${esc(p.history.join(', '))}" placeholder="e.g. 15.3, 12.1, 18.0" ${done?'disabled':''}></td></tr>`).join('')}</tbody></table>`;
    $('season-event-title').textContent=competitionTypes[selected].name;
    $('captain-choice-wrap').hidden=event.id!=='captain';
    $('captain-choice').innerHTML=option('','Choose a competition type',event.captainType)+competitionTypes.filter(c=>c.id!=='captain').map(c=>option(c.id,c.name,event.captainType)).join('');
    $('captain-choice').disabled=!!event.snapshot;
    $('event-allowance').value=event.allowance;$('event-allowance').disabled=!!event.snapshot;
    $('event-pcc').value=event.pcc;$('event-pcc').disabled=!!event.snapshot;
    $('season-event-description').textContent=`${type?type.metric==='net'?'Lowest net strokes over 18 holes.':'Highest Stableford points on '+({all:'all 18 holes',front:'holes 1–9',back:'holes 10–18',par3:'par 3 holes',par4:'par 4 holes',par5:'par 5 holes','si-high':'holes with SI 10–18','si-low':'holes with SI 1–9'}[type.scope])+'.':'Captain must choose one of the first 11 competition types.'} Uses the pre-event competition index. All 18 hole entries are needed for handicap adjustment.`;
    $('record-event').disabled=selected!==done||done===12||!type;
    $('record-event').textContent=event.snapshot?'Competition recorded':selected!==done?'Record earlier competitions first':'Record current round for this competition';
    $('undo-event').disabled=done===0;
    $('season-event-results').innerHTML='';
    if(event.snapshot){
      const rows=result.events[selected].rows;
      $('season-event-results').innerHTML=`<p class="hint">Recorded at ${esc(event.snapshot.courseName)} · ${esc(event.snapshot.recordedAt.slice(0,10))} · ${type.metric==='net'?'Net strokes':'Stableford points'}</p><div class="table-wrap"><table><thead><tr><th>Player</th><th>Place</th><th>Score</th><th>Competition points</th><th>Score Differential</th><th>Index before → after</th><th>Playing Handicap used</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${esc(s.roster.find(p=>p.id===r.id).name)}</th><td>${r.place}${r.tieSize>1?' =':''}</td><td>${r.nr?'NR':r.value}</td><td><strong>${r.points}</strong></td><td>${r.differential.toFixed(1)}</td><td>${handicapLabel(r.before)} → ${handicapLabel(r.after)}</td><td>${handicapLabel(r.playing)}</td></tr>`).join('')}</tbody></table></div>`;
    }
    // Current PH always refers to the currently selected course and player tees.
    const course=state.courses.find(c=>c.id===state.courseId),rosterPlayers=s.roster.map(p=>state.players.find(x=>x.id===p.id));
    let ph={};const next=s.events[Math.min(done,11)],nextType=next.id==='captain'&&!next.captainType?{metric:'points'}:eventType(next);
    if(rosterPlayers.every(Boolean)){
      const hs=playingHandicaps(s.roster.map(p=>({index:result.current[p.id]})),rosterPlayers.map(p=>course.tees.find(t=>t.id===p.teeId)),nextType.metric==='net'?'stroke':'stableford',next.allowance);
      ph=Object.fromEntries(s.roster.map((p,i)=>[p.id,hs[i].playing]));
    }
    $('season-standings').innerHTML=`<table><caption class="hint" style="text-align:left;padding:16px">Each cell: competition points (event score). Final column: current PH at ${esc(course.name)}, using selected player tees and ${next.allowance}% allowance${done===12?' (last event settings)':' for the next event'}. Equal total points share position.</caption><thead><tr><th>Player</th>${competitionTypes.map((c,i)=>`<th title="${esc(c.name)}">${i+1}<small class="competition-heading">${esc(c.name)}</small></th>`).join('')}<th>Total Points</th><th>Starting index</th><th>Current index<br><small>Local estimate</small></th><th>Playing Handicap</th></tr></thead><tbody>${result.standings.map((p,i,all)=>{const rank=all.findIndex(x=>x.total===p.total)+1;return `<tr><th>${rank}. ${esc(state.players.find(x=>x.id===p.id)?.name||p.name)}</th>${s.events.map((e,j)=>{const r=result.events[j]?.rows.find(x=>x.id===p.id);return `<td>${r?`<strong>${r.points}</strong><small class="cell-score">(${r.nr?'NR':r.value})</small>`:'—'}</td>`;}).join('')}<td class="total-points">${p.total}</td><td>${handicapLabel(p.starting)}</td><td>${handicapLabel(p.current)}</td><td class="current-ph">${ph[p.id]===undefined?'—':handicapLabel(ph[p.id])}</td></tr>`;}).join('')}</tbody></table>`;
    $('season-next-note').textContent=done===12?'Season complete. Export your round to keep the full season and scorecards.':`Next: ${competitionTypes[done].name}. Choose “Prepare next competition”, enter a new complete round on “The round”, then record it here. Both tabs now use the calculated competition indices.`;
    $('prepare-event').disabled=done===12;
  }
  $('create-season').onclick=()=>{
    try{
      const state=getState();if(state.players.length>14)throw Error('Remove extra players on The round tab; this season requires exactly 14.');
      if(!confirm('Create the 12-event season? Empty player slots will be added to make a group of 14. Enter all names and starting indices before recording the first event.'))return;
      while(state.players.length<14)state.players.push({id:crypto.randomUUID(),name:`Player ${state.players.length+1}`,index:18,team:state.players.length%2?'B':'A',teeId:state.courses.find(c=>c.id===state.courseId).tees[0].id,scores:Array(18).fill(null)});
      state.season=createSeason(state.players);selected=0;persist();renderRound();render();
    }catch(err){fail(err);}
  };
  $('season-events').onclick=e=>{const b=e.target.closest('[data-event]');if(b){selected=+b.dataset.event;render();}};
  $('season-roster').onchange=e=>{
    const state=getState(),s=state.season;if(s.events.some(x=>x.snapshot))return;
    const draft=structuredClone(s);
    try{
      if(e.target.hasAttribute('data-start')){if(!e.target.value||!e.target.checkValidity())throw Error('Starting index must be from -10.0 to 54.0, in tenths.');draft.roster[+e.target.dataset.start].starting=Number(e.target.value);}
      if(e.target.hasAttribute('data-history')){const raw=e.target.value.trim();if(raw&&!/^[\d\s,.+\-]+$/.test(raw))throw Error('Enter differentials separated by commas; use negative values for plus differentials.');const history=raw?raw.split(',').map(x=>x.trim()===''?NaN:Number(x)):[];draft.roster[+e.target.dataset.history].history=history;}
      calculateSeason(draft);state.season=draft;persist();renderRound();render();
    }catch(err){fail(err);render();}
  };
  for(const [id,field] of [['captain-choice','captainType'],['event-allowance','allowance'],['event-pcc','pcc']])$(id).onchange=e=>{
    const state=getState(),draft=structuredClone(state.season);if(draft.events[selected].snapshot)return;
    try{if(!e.target.checkValidity()||field!=='captainType'&&e.target.value==='')throw Error('Enter a valid event setting.');draft.events[selected][field]=field==='captainType'?e.target.value:Number(e.target.value);calculateSeason(draft);state.season=draft;persist();render();}catch(err){fail(err);render();}
  };
  $('record-event').onclick=()=>{
    try{
      const state=getState(),draft=structuredClone(state.season),done=calculateSeason(draft).events.length;
      if(selected!==done||done===12)throw Error('Record each event once, in sequence.');
      draft.roster.forEach(p=>p.name=state.players.find(x=>x.id===p.id)?.name||p.name);
      draft.events[selected].snapshot=captureRound(state,draft);calculateSeason(draft);
      if(!confirm(`Record ${competitionTypes[selected].name}, award points and recalculate competition handicaps? This saves a copy of all 14 cards and tee ratings.`))return;
      state.season=draft;persist();renderRound();render();message('Competition recorded. Points and handicap estimates updated for the next round.');
    }catch(err){fail(err);}
  };
  $('undo-event').onclick=()=>{const state=getState(),done=calculateSeason(state.season).events.length;if(done&&confirm('Undo the most recent competition? Its season points and handicap changes will be removed. The active round scores stay in place.')){state.season.events[done-1].snapshot=null;selected=done-1;persist();renderRound();render();}};
  $('prepare-event').onclick=()=>{try{const state=getState(),s=state.season,done=calculateSeason(s).events.length;if(done===12)return;const next=s.events[done],type=eventType(next);if(!confirm(`Prepare ${competitionTypes[done].name}? This clears the active hole scores. Recorded season cards are kept.`))return;state.players.forEach(p=>p.scores=Array(18).fill(null));state.format=type.metric==='net'?'stroke':'stableford';state.allowance=next.allowance;state.title=competitionTypes[done].name;selected=done;renderRound();document.querySelector('nav [data-tab="round"]').click();message('Ready for the next competition. Choose its course and player tees, then enter all 18 holes.');}catch(err){fail(err);}};
  $('export-season').onclick=()=>download('fairway-season-round.json',getState());
  return {render};
}
