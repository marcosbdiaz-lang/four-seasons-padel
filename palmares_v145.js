// Four Seasons Pádel · Palmarés V145
// Fases finales personales desde web_jornadas_historicas · tipo_jornada=fin_trimestre.
(function(){
'use strict';

function finalCss(){
 const s=document.createElement('style');
 s.textContent=`
 .soon.finalLive{border-style:solid;border-color:#315c49}
 .soon.finalLive .soonPill{background:rgba(57,217,138,.12);border-color:rgba(57,217,138,.4);color:var(--green)}
 .finalGrid .placeholder b.live{color:var(--gold)}
 .finalHistory{display:grid;gap:8px;margin-top:14px}
 .finalRow{display:grid;grid-template-columns:minmax(150px,1fr) auto;gap:10px;align-items:center;background:#0a1712;border:1px solid #203c31;border-radius:14px;padding:11px 12px}
 .finalRow .event{font-weight:900}.finalRow .meta{font-size:11px;color:var(--muted);margin-top:3px;line-height:1.35}
 .finalRow .result{text-align:right;font-weight:900;white-space:nowrap}.finalRow .win{color:var(--green)}.finalRow .loss{color:#ff9f9f}
 .stagePill{display:inline-flex;border:1px solid #496455;border-radius:999px;padding:2px 7px;font-size:9px;font-weight:900;letter-spacing:.05em;margin-left:5px;vertical-align:1px}
 .stagePill.final{color:var(--gold);border-color:rgba(240,199,94,.45);background:rgba(240,199,94,.08)}
 .stagePill.semi{color:#9ee6c1;border-color:#315c49;background:#10251b}
 @media(max-width:600px){.finalRow{grid-template-columns:1fr}.finalRow .result{text-align:left}.stagePill{margin-left:0;margin-top:5px}}
 `;
 document.head.appendChild(s);
}

function playerCandidates(){
 const raw=[];
 try{raw.push(PLAYER_KEY,PLAYER_NAME)}catch(e){}
 raw.push(document.getElementById('playerName')?.textContent||'');
 raw.push((document.getElementById('playerAlias')?.textContent||'').replace(/^\s*·\s*/,''));
 return [...new Set(raw.map(norm).filter(Boolean))];
}

function pairParts(pair){
 return String(pair||'').split(/\s*[-–—/]\s*/).map(x=>x.trim()).filter(Boolean);
}

function isPlayerToken(token,cands){
 const n=norm(token); if(!n)return false;
 for(const c of cands){
  if(n===c)return true;
  if(n.length>=4 && c.length>=4 && (c.startsWith(n)||n.startsWith(c)))return true;
  const nw=n.split(' '),cw=c.split(' ');
  if(nw.length>=2&&cw.length>=2&&nw[0]===cw[0]&&nw[1][0]===cw[1][0])return true;
 }
 return false;
}

function sideFor(match,cands){
 const a=pairParts(match?.parejaA),b=pairParts(match?.parejaB);
 if(a.some(x=>isPlayerToken(x,cands)))return {side:'A',partner:a.find(x=>!isPlayerToken(x,cands))||'—',opponents:b.join(' / ')||'—'};
 if(b.some(x=>isPlayerToken(x,cands)))return {side:'B',partner:b.find(x=>!isPlayerToken(x,cands))||'—',opponents:a.join(' / ')||'—'};
 return null;
}

function outcome(match,side){
 const sets=Array.isArray(match?.sets)?match.sets:[];
 let aw=0,bw=0,complete=0; const score=[];
 sets.forEach(s=>{const a=Number(s?.resultadoA),b=Number(s?.resultadoB);if(!Number.isFinite(a)||!Number.isFinite(b))return;complete++;score.push(`${a}-${b}`);if(a>b)aw++;else if(b>a)bw++;});
 if(!complete||aw===bw)return null;
 const winner=aw>bw?'A':'B';
 return {won:winner===side,score:score.join(' · '),setsA:aw,setsB:bw};
}

async function loadFinalRows(){
 return rest('web_jornadas_historicas',{
  select:'temporada,estacion,fecha,payload,tipo_jornada',
  tipo_jornada:'eq.fin_trimestre',
  order:'temporada.asc,estacion.asc',
  limit:'100'
 });
}

function eventRecency(e){return romanYear(e.temporada)*100+(seasonOrder.indexOf(String(e.estacion||'').toUpperCase())+1)}

async function renderFinals(){
 const section=document.querySelector('.soon');
 if(!section)return;
 finalCss();
 section.classList.add('finalLive');
 const title=section.querySelector('.soonHead .big'); if(title)title.textContent='Semifinales y finales';
 const sub=section.querySelector('.soonHead .muted'); if(sub)sub.textContent='Histórico personal desde jornadas de fin de trimestre indexadas.';
 const pill=section.querySelector('.soonPill'); if(pill)pill.textContent='ACTUALIZACIÓN AUTOMÁTICA';

 try{
  const rows=await loadFinalRows();
  const cands=playerCandidates();
  const events=[];
  rows.forEach(r=>{
   const ft=r?.payload?.finTrimestre||r?.payload?.fin_trimestre; if(!ft)return;
   const stages=[];
   (Array.isArray(ft.semifinales)?ft.semifinales:[]).forEach(m=>stages.push({kind:'semi',label:m.nombre||'SEMIFINAL',match:m}));
   if(ft.final)stages.push({kind:'final',label:ft.final.nombre||'FINAL',match:ft.final});
   stages.forEach(st=>{
    const side=sideFor(st.match,cands); if(!side)return;
    const out=outcome(st.match,side.side); if(!out)return;
    events.push({temporada:r.temporada,estacion:r.estacion,fecha:r.fecha||ft.fecha||'',kind:st.kind,label:st.label,partner:side.partner,opponents:side.opponents,won:out.won,score:out.score});
   });
  });

  events.sort((a,b)=>eventRecency(b)-eventRecency(a));
  const semis=events.filter(x=>x.kind==='semi');
  const finals=events.filter(x=>x.kind==='final');
  const allWins=events.filter(x=>x.won).length;
  const finalWins=finals.filter(x=>x.won).length;
  const pct=events.length?Math.round(allWins*100/events.length)+'%':'—';
  const vals=[semis.length,finals.length,finalWins,pct];
  [...section.querySelectorAll('.finalGrid .placeholder b')].forEach((el,i)=>{el.textContent=vals[i];el.classList.add('live')});

  let host=section.querySelector('.finalHistory');
  if(!host){host=document.createElement('div');host.className='finalHistory';section.querySelector('.finalGrid')?.insertAdjacentElement('afterend',host)}
  host.innerHTML=events.length?events.map(e=>`<div class="finalRow"><div><div class="event">${esc(e.temporada)} · ${esc(e.estacion)} <span class="stagePill ${e.kind}">${e.kind==='final'?'FINAL':'SEMIFINAL'}</span></div><div class="meta">${e.fecha?`📅 ${esc(e.fecha)} · `:''}👥 Con <strong>${esc(e.partner)}</strong><br>⚔️ vs ${esc(e.opponents)}</div></div><div class="result ${e.won?'win':'loss'}">${e.won?'✅ VICTORIA':'❌ DERROTA'}<br><span class="muted">${esc(e.score)}</span></div></div>`).join(''):'<div class="muted">Sin semifinales o finales con resultado completo identificadas para este jugador.</div>';

  const note=section.querySelector(':scope > .note');
  if(note)note.textContent='Fuente: jornadas FIN DE TRIMESTRE indexadas en Supabase. Se actualiza automáticamente al incorporarse nuevos cierres trimestrales; solo cuenta resultados completos y auditables.';
 }catch(e){
  const note=section.querySelector(':scope > .note');if(note)note.textContent='No se pudo cargar temporalmente el histórico de fases finales.';
  console.warn('Palmarés V145 · fases finales',e);
 }
 const f=document.querySelector('.foot');if(f)f.textContent='FOUR SEASONS PÁDEL · PALMARÉS · WEB V145 · 16/10/2026';
}

function wait(){
 let n=0;const t=setInterval(()=>{n++;const app=document.getElementById('app');if(app&&!app.hidden){clearInterval(t);renderFinals()}else if(n>240)clearInterval(t)},50);
}
wait();
})();
