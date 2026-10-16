// Four Seasons Pádel · Palmarés V138
// Ajustes visuales/UX: distinguir Cuadro/Satélite, posiciones por año responsive y Top 10 móvil.
(function(){
'use strict';

function seasonEmoji(v){const s=norm(v);if(s.includes('otono'))return '🍂';if(s.includes('invierno'))return '❄️';if(s.includes('primavera'))return '🌸';if(s.includes('verano'))return '☀️';return '•'}
function kindLabel(k){return k==='cuadro'?'CUADRO':k==='satelite'?'SATÉLITE':'—'}
function journeyKindV138(j){const t=norm(j.tipo),h=norm(j.hoja);if(t.includes('cuadro')||h.includes('cuadro'))return 'cuadro';if(t.includes('satel')||h.includes('satel'))return 'satelite';return ''}
function aggV138(all){const map=new Map();all.forEach(m=>{const s=sideInfo(m);if(!s)return;const tipo=String(m.tipo||'').trim();const key=[m.temporada,m.estacion,m.jornada,m.hoja,tipo].join('|');if(!map.has(key))map.set(key,{temporada:m.temporada,estacion:m.estacion,jornada:m.jornada,hoja:m.hoja,fecha:m.fecha||'',tipo,partidos:0,ganados:0,average:0,completos:0,partners:new Set()});const j=map.get(key);j.partidos++;if(s.won)j.ganados++;if(Number.isFinite(Number(m.resultado_a))&&Number.isFinite(Number(m.resultado_b))){j.average+=s.for-s.against;j.completos++}if(s.partner)j.partners.add(s.partner)});return [...map.values()]}

function css(){const s=document.createElement('style');s.textContent=`
.seasons{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(105px,1fr))!important;width:100%;gap:9px}
.season{width:100%;min-width:0;padding:12px 7px!important}
.season .seasonBest strong{white-space:nowrap;font-size:10px!important}
.formatBadge{display:inline-flex;align-items:center;border:1px solid #315c49;background:#10251b;color:#9ee6c1;border-radius:999px;padding:3px 7px;font-size:9px;font-weight:900;letter-spacing:.06em;margin-left:6px;vertical-align:2px;white-space:nowrap}
.formatBadge[data-kind="cuadro"]{background:#123a2a;border-color:#32d68a;color:#82f0b7}
.formatBadge[data-kind="satelite"]{background:#242044;border-color:#9c8aff;color:#d1c5ff}
.top10row.v138{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:10px;align-items:center}
.top10row.v138 .journeyMain{min-width:0}
.top10row.v138 .metrics{display:flex;gap:14px;align-items:center;justify-content:flex-end;white-space:nowrap}
.top10row.v138 .wins{font-weight:900;color:var(--green)}
.top10row.v138 .avg{font-weight:950;color:var(--green);font-size:18px}
.top10row.v138 .mate{grid-column:2/4;color:#e8f4ee}
@media(max-width:760px){
 .seasons{grid-template-columns:repeat(auto-fit,minmax(88px,1fr))!important}
 .season span{font-size:10px!important}.season b{font-size:24px!important}.season .seasonBest{font-size:8px!important}.season .seasonBest strong{font-size:9px!important}
 .top10row.v138{grid-template-columns:34px minmax(0,1fr) auto!important;gap:8px!important;padding:12px 10px!important}
 .top10row.v138 .metrics{flex-direction:column;gap:2px;align-items:flex-end;justify-content:center}
 .top10row.v138 .wins{font-size:15px}.top10row.v138 .avg{font-size:18px}
 .top10row.v138 .mate{grid-column:2/4!important;font-size:14px;line-height:1.3}
 .formatBadge{margin-left:0;margin-top:5px;vertical-align:0}
}
`;document.head.appendChild(s)}

async function fixPositions(){const box=document.getElementById('seasons');if(!box)return;[...box.querySelectorAll('.season')].forEach(card=>{const best=card.querySelector('.seasonBest strong');if(!best)return;const txt=best.textContent.trim();const m=txt.match(/^(\d+º)\s*·\s*(.+)$/i);if(m)best.textContent=`${m[1]} · ${seasonEmoji(m[2])}`})}

async function rebuildTop10AndBestResult(){try{const [newM,oldM]=await Promise.all([matches('historico_partidos'),matches('historico_partidos_antiguos',true)]);const all=[...oldM,...newM];const ranked=rankJourneys(aggV138(all));const top=ranked.slice(0,10);const host=document.getElementById('top10');if(host){host.innerHTML=top.length?top.map((j,i)=>{const kind=journeyKindV138(j);return `<div class="top10row v138"><div class="pos">${i+1}</div><div class="journeyMain"><div class="main">${esc(j.temporada)} · ${esc(j.estacion)} · J${j.jornada}</div><div class="small">${esc(j.fecha||j.hoja||'')}</div>${kind?`<span class="formatBadge" data-kind="${kind}">${kindLabel(kind)}</span>`:''}</div><div class="metrics"><span class="wins">${j.ganados} victorias</span><span class="avg">${j.average>=0?'+':''}${j.average}</span></div><div class="mate">👥 ${esc([...j.partners].join(' / ')||'—')}</div></div>`}).join(''):'<div class="muted">Sin jornadas completas suficientes para elaborar el Top 10.</div>'}
 const bm=bestSingle(all);if(bm){const kind=journeyKindV138(bm);const d=document.getElementById('bestMatchDetail');if(d&&kind&&!d.querySelector('.formatBadge'))d.insertAdjacentHTML('afterbegin',`<span class="formatBadge" data-kind="${kind}" style="margin:0 0 7px 0">${kindLabel(kind)}</span><br>`)}
}catch(e){console.warn('V138 top10',e)}}

function version(){const f=document.querySelector('.foot');if(f)f.textContent='FOUR SEASONS PÁDEL · PALMARÉS · WEB V142 · 16/10/2026'}
async function go(){css();version();await fixPositions();await rebuildTop10AndBestResult()}
function wait(){let n=0;const t=setInterval(()=>{n++;const app=document.getElementById('app');if(app&&!app.hidden&&document.querySelector('.season .seasonBest')){clearInterval(t);go()}else if(n>240)clearInterval(t)},50)}
wait();
})();
