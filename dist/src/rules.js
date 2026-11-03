// Signed convention: a plus handicap is negative. Full precision until final rounding.
export const formats = {stroke:{label:'Individual stroke play',allowance:95},stableford:{label:'Individual Stableford',allowance:95},match:{label:'Singles match play',allowance:100},fourball:{label:'Fourball Stableford',allowance:85},fourmatch:{label:'Fourball match play',allowance:90}};
export const roundHandicap = n => Math.floor(n + 0.5) || 0;
export const handicapLabel = n => n < 0 ? `+${Math.abs(n)}` : String(n);
export const parTotal = tee => tee.holes.reduce((a,h)=>a+h.par,0);
export function validateTee(t) {
  if(!t || typeof t.id!=='string' || !t.id || typeof t.name!=='string' || !t.name.trim() || !['men','women'].includes(t.category)) throw Error('Each tee needs an ID, name and men/women rating category.');
  if(!Number.isFinite(t.rating)||t.rating<40||t.rating>90||!Number.isInteger(t.slope)||t.slope<55||t.slope>155) throw Error('Course Rating must be 40–90 and Slope an integer from 55–155.');
  if(!Array.isArray(t.holes)||t.holes.length!==18 || t.holes.some(h=>!Number.isInteger(h.par)||h.par<3||h.par>6||!Number.isInteger(h.si)||h.si<1||h.si>18)||new Set(t.holes.map(h=>h.si)).size!==18) throw Error('Supply 18 holes, pars 3–6, and a unique stroke index 1–18.');
  return t;
}
export function validateCourse(c){
  if(!c || typeof c.id!=='string'||!c.id||typeof c.name!=='string'||!c.name.trim()||!Array.isArray(c.tees)||!c.tees.length)throw Error('Course needs ID, name and tees.');
  c.tees.forEach(validateTee);if(new Set(c.tees.map(t=>t.id)).size!==c.tees.length)throw Error('Tee IDs must be unique.');return c;
}
export function courseHandicap(index,tee){
  validateTee(tee);if(!Number.isFinite(index)||index < -10||index>54)throw Error('Index must be between +10.0 (enter -10) and 54.0.');
  return index * tee.slope / 113 + tee.rating - parTotal(tee);
}
export function strokesAt(hcp,si){
  if(!Number.isInteger(hcp)||!Number.isInteger(si)||si<1||si>18)throw Error('Invalid stroke allocation.');
  const n=Math.abs(hcp),base=Math.floor(n/18),extra=n%18;
  return (hcp>=0 ? base+(si<=extra?1:0) : -(base+(si>18-extra?1:0))) || 0;
}
export function playingHandicaps(players,tees,format,allowance=formats[format]?.allowance){
  if(!formats[format]||!Number.isFinite(allowance)||allowance<0||allowance>100)throw Error('Invalid format or allowance.');
  const raw=players.map((p,i)=>courseHandicap(p.index,tees[i]));
  const minPar=Math.min(...tees.map(parTotal));
  // Rule 6.2b: absolute net-score formats receive difference in pars after allowance.
  const adjusted=raw.map((ch,i)=>ch*allowance/100 + (['stroke','match','fourmatch'].includes(format)?parTotal(tees[i])-minPar:0));
  const low=Math.min(...adjusted);
  return raw.map((ch,i)=>({raw:ch,course:roundHandicap(ch),playing:roundHandicap(['match','fourmatch'].includes(format)?adjusted[i]-low:adjusted[i])}));
}
export function scoreHole(gross,hole,hcp){
  if(gross===null||gross===undefined||gross==='')return {played:false,net:null,points:0};
  if(gross==='X')return {played:true,net:null,points:0};
  if(!Number.isInteger(gross)||gross<1||gross>99)throw Error('Score must be 1–99, X (no return), or blank.');
  const net=gross-strokesAt(hcp,hole.si);return {played:true,net,points:Math.max(0,2+hole.par-net)};
}
export function playerResult(player,tee,hcp){
  const holes=tee.holes.map((h,i)=>scoreHole(player.scores[i],h,hcp));
  const through=holes.filter(h=>h.played).length;
  return {holes,through,points:holes.reduce((a,h)=>a+h.points,0),gross:player.scores.reduce((a,s)=>a+(Number.isInteger(s)?s:0),0),net:holes.reduce((a,h)=>a+(h.net??0),0),nr:holes.some(h=>h.played&&h.net===null),complete:through===18};
}
export function teamResult(results){
  const holes=Array.from({length:18},(_,i)=>{const h=results.map(r=>r.holes[i]);return {played:h.every(x=>x.played),points:Math.max(...h.map(x=>x.points))};});
  return {through:holes.filter(h=>h.played).length,points:holes.filter(h=>h.played).reduce((a,h)=>a+h.points,0)};
}
export function matchResult(sides){
  let lead=0,through=0,finished=false;const holes=[];
  for(let i=0;i<18;i++){
    const a=sides[0].map(r=>r.holes[i]),b=sides[1].map(r=>r.holes[i]);
    if(!a.every(h=>h.played)||!b.every(h=>h.played)||finished)break;
    const best=h=>Math.min(...h.map(x=>x.net??Infinity));
    const x=best(a),y=best(b),win=x===y?0:x<y?1:-1;
    lead+=win;through++;holes.push(win);finished=Math.abs(lead)>18-through;
  }
  const remaining=18-through;
  const status=finished?`${lead>0?'A':'B'} wins ${Math.abs(lead)} & ${remaining}`:through===18?(lead===0?'Match halved':`${lead>0?'A':'B'} wins ${Math.abs(lead)} up`):lead===0?'All square':`${lead>0?'A':'B'} ${Math.abs(lead)} up`;
  return {lead,through,finished:finished||through===18,status,holes};
}
