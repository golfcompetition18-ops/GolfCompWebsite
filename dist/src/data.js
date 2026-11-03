const pars=[4,4,3,5,4,4,3,5,4,4,3,4,5,4,4,3,5,4];
const si=[7,3,15,1,11,5,17,9,13,8,16,4,2,12,6,18,10,14];
const tee=(id,name,category,rating,slope,shift=0)=>({id,name,category,rating,slope,holes:pars.map((par,i)=>({par,si:si[(i+shift)%18]}))});
export const sampleCourses=[
 {id:'heather',name:'Heather & Heath • Surrey',provenance:'Fictional illustrative course — not official ratings',tees:[tee('white-m','White','men',72.4,132),tee('yellow-m','Yellow','men',70.2,124),tee('red-w','Red','women',73.1,129),tee('yellow-w','Yellow','women',75.2,136)]},
 {id:'coast',name:'North Coast Links • Scotland',provenance:'Fictional illustrative course — not official ratings',tees:[tee('white-m','White','men',73.6,140,2),tee('yellow-m','Yellow','men',71.1,130,2),tee('red-w','Red','women',72.9,131,2)]}
];
export function initialState(){return {version:1,courseId:'heather',format:'stableford',allowance:95,title:'The Sunday Four',courses:structuredClone(sampleCourses),players:[['Alex Morgan',12.4,'white-m','A'],['Sam Patel',18.2,'yellow-m','B'],['Jamie Lee',7.6,'white-m','A'],['Charlie Evans',24.1,'red-w','B']].map(([name,index,teeId,team],i)=>({id:`p${i}`,name,index,teeId,team,scores:Array.from({length:18},(_,h)=>h<6?pars[h]+[1,2,0,2][i]+(h%3===0?1:0):null)}))};}
