// Four Seasons Pádel · Palmarés V146
// Mejora cruce histórico para mejores posiciones trimestrales (especialmente Año IV).
(function(){
'use strict';

function valsOfPlayer(x){return [x?.jugador,x?.id,x?.nombre].map(norm).filter(Boolean)}
function overlap(a,b){return a.some(x=>b.includes(x))}

async function historicalAliases(){
 const base=new Set();
 try{base.add(norm(PLAYER_KEY));base.add(norm(PLAYER_NAME))}catch(e){}
 const shown=norm(document.getElementById('playerName')?.textContent||'');
 const alias=norm((document.getElementById('playerAlias')?.textContent||'').replace(/^\s*·\s*/,''));
 if(shown)base.add(shown);if(alias)base.add(alias);
 const annual=await annualRows();
 let changed=true;
 while(changed){
  changed=false;
  annual.forEach(r=>annualPlayers(r).forEach(p=>{
   const vals=valsOfPlayer(p);
   if(vals.some(v=>base.has(v))){vals.forEach(v=>{if(!base.has(v)){base.add(v);changed=true}})}
  }));
 }
 return base;
}

function bestQuarterPosition(jp){
 const ps=[...(jp?.posiciones||[])].filter(x=>num(x.posicion)>0);
 if(!ps.length)return null;
 ps.sort((a,b)=>num(b.jornada)-num(a.jornada));
 return num(ps[0].posicion)||null;
}

function emoji(est){const s=norm(est);if(s.includes('otono'))return '🍂';if(s.includes('invierno'))return '❄️';if(s.includes('primavera'))return '🌸';if(s.includes('verano'))return '☀️';return '•'}

async function fixHistoricalQuarterRanks(){
 const box=document.getElementById('seasons');if(!box)return;
 try{
  const [cache,aliases]=await Promise.all([cacheRows(),historicalAliases()]);
  const bestByYear=new Map();
  cache.forEach(r=>{
   const players=Array.isArray(r.payload?.jugadores)?r.payload.jugadores:[];
   const jp=players.find(p=>valsOfPlayer(p).some(v=>aliases.has(v)));
   const pos=bestQuarterPosition(jp);if(!pos)return;
   const year=String(r.temporada||'').toUpperCase();
   const idx=seasonOrder.indexOf(String(r.estacion||'').toUpperCase());
   const prev=bestByYear.get(year);
   if(!prev||pos<prev.pos||(pos===prev.pos&&idx>prev.idx))bestByYear.set(year,{pos,estacion:r.estacion,idx});
  });

  [...box.querySelectorAll('.season')].forEach(card=>{
   const year=String(card.querySelector('span')?.textContent||'').replace(/\s*·\s*ACTUAL\s*/i,'').trim().toUpperCase();
   const strong=card.querySelector('.seasonBest strong');if(!strong)return;
   const best=bestByYear.get(year);
   if(best){strong.textContent=`${best.pos}º · ${emoji(best.estacion)}`;strong.title=`${best.pos}º · ${best.estacion}`}
   else if(year==='AÑO III'){strong.textContent='S/D';strong.title='Sin clasificación trimestral indexada para Año III'}
  });
 }catch(e){console.warn('V146 posiciones trimestrales históricas',e)}
 const f=document.querySelector('.foot');if(f)f.textContent='FOUR SEASONS PÁDEL · PALMARÉS · WEB V146 · 16/10/2026';
}

function wait(){let n=0;const t=setInterval(()=>{n++;const app=document.getElementById('app');if(app&&!app.hidden&&document.querySelector('.season .seasonBest')){clearInterval(t);fixHistoricalQuarterRanks()}else if(n>260)clearInterval(t)},50)}
wait();
})();
