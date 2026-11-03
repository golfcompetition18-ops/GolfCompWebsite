import {playingHandicaps,scoreHole,validateTee,courseHandicap,roundHandicap,strokesAt} from './rules.js';

export const competitionTypes = [
  {id:'official-stableford',name:'Official Stableford',scope:'all',metric:'points',basis:'official'},
  {id:'front',name:'Best Front 9',scope:'front',metric:'points',basis:'society'},
  {id:'medal',name:'Official Medal',scope:'all',metric:'net',basis:'official'},
  {id:'back',name:'Best Back 9',scope:'back',metric:'points',basis:'society'},
  {id:'best-stableford',name:'Best Stableford',scope:'all',metric:'points',basis:'society'},
  {id:'par3',name:'Best Par 3',scope:'par3',metric:'points',basis:'society'},
  {id:'unofficial',name:'Stableford - unofficial',scope:'all',metric:'points',basis:'society'},
  {id:'par5',name:'Best Par 5',scope:'par5',metric:'points',basis:'society'},
  {id:'si-high',name:'SI 10 to 18',scope:'si-high',metric:'points',basis:'society'},
  {id:'par4',name:'Best Par 4',scope:'par4',metric:'points',basis:'society'},
  {id:'si-low',name:'SI 1 to 9',scope:'si-low',metric:'points',basis:'society'},
  {id:'captain',name:'Captains Pick',scope:'all',metric:'points',basis:'society'}
];
const number=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
export function createSeason(players){
  if(players.length!==14)throw Error('A season needs exactly 14 players.');
  return {version:1,roster:players.map(p=>({id:p.id,name:p.name,starting:p.index,history:[]})),
    events:competitionTypes.map(c=>({id:c.id,captainType:'',allowance:95,pcc:0,snapshot:null}))};
}
export function eventType(event){const id=event.id==='captain'?event.captainType:event.id;const type=competitionTypes.find(c=>c.id===id&&c.id!=='captain');if(!type)throw Error('Choose a valid Captain’s Pick.');return type;}
export function selectedHoles(tee,scope){return tee.holes.map((h,i)=>({h,i})).filter(({h,i})=>scope==='all'||scope==='front'&&i<9||scope==='back'&&i>=9||scope==='par3'&&h.par===3||scope==='par4'&&h.par===4||scope==='par5'&&h.par===5||scope==='si-high'&&h.si>=10||scope==='si-low'&&h.si<=9);}
function checkSnapshot(snapshot,roster){
  if(!snapshot||typeof snapshot.courseName!=='string'||typeof snapshot.recordedAt!=='string'||!Number.isFinite(Date.parse(snapshot.recordedAt))||!Array.isArray(snapshot.entries)||snapshot.entries.length!==14)throw Error('Event requires a dated, complete snapshot for 14 players.');
  if(new Set(snapshot.entries.map(e=>e.id)).size!==14||snapshot.entries.some(e=>!roster.some(p=>p.id===e.id)))throw Error('Event players must match the season roster.');
  snapshot.entries.forEach(e=>{validateTee(e.tee);if(!number(e.index,-10,54)||!Array.isArray(e.scores)||e.scores.length!==18||e.scores.some(s=>s!==null&&s!=='X'&&(!Number.isInteger(s)||s<1||s>99)))throw Error('Invalid event index or score.');});
}
export function validateSeason(s){
  if(!s||s.version!==1||!Array.isArray(s.roster)||s.roster.length!==14||new Set(s.roster.map(p=>p.id)).size!==14||s.roster.some(p=>typeof p.id!=='string'||!p.id||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!number(p.starting,-10,54)||!Array.isArray(p.history)||p.history.length>20||p.history.some(d=>!number(d,-20,100))))throw Error('Invalid 14-player season roster or differential history.');
  if(!Array.isArray(s.events)||s.events.length!==12)throw Error('Season needs 12 competitions.');
  let gap=false;
  s.events.forEach((e,i)=>{if(e.id!==competitionTypes[i].id||!number(e.allowance,0,100)||![-1,0,1,2,3].includes(e.pcc)||typeof e.captainType!=='string')throw Error('Invalid competition configuration.');if(e.id!=='captain'||e.captainType)eventType(e);if(!e.snapshot){gap=true;return;}if(gap)throw Error('Record competitions in order.');eventType(e);checkSnapshot(e.snapshot,s.roster);});
  return s;
}
export function scoreEvent(event,snapshot,roster,current){
  checkSnapshot(snapshot,roster);
  const type=eventType(event),entries=snapshot.entries,tees=entries.map(e=>e.tee);
  const indices=entries.map(e=>({index:current[e.id]}));
  const hcp=playingHandicaps(indices,tees,type.metric==='points'?'stableford':'stroke',event.allowance);
  return entries.map((e,j)=>{
    const selected=selectedHoles(e.tee,type.scope);
    if(!selected.length)throw Error(`${type.name}: no eligible holes for ${e.name||e.id}.`);
    const scores=selected.map(({h,i})=>({...scoreHole(e.scores[i],h,hcp[j].playing),gross:e.scores[i]}));
    if(scores.some(s=>!s.played))throw Error(`${type.name}: all selected holes need a score or X for ${e.name||e.id}.`);
    const nr=type.metric!=='points'&&scores.some(s=>s.net===null);
    const value=nr?null:scores.reduce((a,s)=>a+(type.metric==='points'?s.points:s.net),0);
    return {id:e.id,value,nr,playing:hcp[j].playing,index:indices[j].index,holeCount:selected.length,
      // Countback is deliberately excluded until a committee policy is supplied.
      order:roster.findIndex(p=>p.id===e.id)};
  });
}
export function awardPoints(rows,metric,tiePolicy='average'){
  if(rows.length!==14)throw Error('Points are based on exactly 14 players.');
  const ordered=rows.map(r=>({...r})).sort((a,b)=>(a.nr-b.nr)||(a.nr?0:metric==='points'?b.value-a.value:a.value-b.value)||a.order-b.order);
  for(let i=0;i<ordered.length;){let end=i+1;while(end<14&&ordered[end].nr===ordered[i].nr&&ordered[end].value===ordered[i].value)end++;
    for(let j=i;j<end;j++)Object.assign(ordered[j],{place:i+1,points:tiePolicy==='average'?(14-i+15-end)/2:14-i,tieSize:end-i,rankStart:i,rankEnd:end});i=end;
  }return ordered;
}
export function calculateSeason(season){
  validateSeason(season);
  const current=Object.fromEntries(season.roster.map(p=>[p.id,p.starting]));
  const histories=Object.fromEntries(season.roster.map(p=>[p.id,[...p.history]]));
  const totals=Object.fromEntries(season.roster.map(p=>[p.id,0]));const events=[];
  for(const event of season.events){if(!event.snapshot)break;
    const rows=awardPoints(scoreEvent(event,event.snapshot,season.roster,current),eventType(event).metric);
    for(const r of rows){totals[r.id]+=r.points;
      const entry=event.snapshot.entries.find(e=>e.id===r.id);
      const diff=roundDifferential(entry,current[r.id],event.pcc);
      histories[r.id].push(diff);histories[r.id]=histories[r.id].slice(-20);
      const next=estimateIndex(histories[r.id],season.roster.find(p=>p.id===r.id).starting);
      r.differential=diff;r.before=current[r.id];r.after=next;r.delta=Math.round((next-current[r.id])*10)/10;current[r.id]=next;
    }events.push({id:event.id,rows});
  }
  return {events,current,histories,standings:season.roster.map(p=>({...p,total:totals[p.id],current:current[p.id]})).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name))};
}
// Core WHS averaging only: no caps, ESR, PCC generation or official score submission.
export function estimateIndex(history,starting){
  const values=history.slice(-20).sort((a,b)=>a-b),n=values.length;
  if(n<3)return starting;
  const count=n<=5?1:n<=8?2:n<=11?3:n<=14?4:n<=16?5:n<=18?6:n===19?7:8;
  const adjustment=n===3?-2:n===4||n===6?-1:0;
  return Math.max(-10,Math.min(54,roundHandicap((values.slice(0,count).reduce((a,b)=>a+b,0)/count+adjustment)*10)/10));
}
export function roundDifferential(entry,index,pcc=0){
  const ch=roundHandicap(courseHandicap(index,entry.tee));
  const adjusted=entry.tee.holes.reduce((total,h,i)=>{
    const gross=entry.scores[i];if(gross===null||gross===undefined)throw Error(`${entry.name||entry.id}: enter all 18 holes for handicap adjustment, even for a subset competition.`);
    const shots=strokesAt(ch,h.si),cap=ch>54&&shots>=4?h.par+5:h.par+2+shots;
    return total+(gross==='X'?cap:Math.min(gross,cap));
  },0);
  return roundHandicap((113/entry.tee.slope*(adjusted-entry.tee.rating-pcc))*10)/10;
}
export function captureRound(state,season){
  const course=state.courses.find(c=>c.id===state.courseId);
  if(state.players.length!==14||state.players.some(p=>!season.roster.some(r=>r.id===p.id)))throw Error('The round must contain the season’s 14 players.');
  return {courseName:course.name,recordedAt:new Date().toISOString(),entries:state.players.map(p=>({id:p.id,name:p.name,index:p.index,scores:structuredClone(p.scores),tee:structuredClone(course.tees.find(t=>t.id===p.teeId))}))};
}
