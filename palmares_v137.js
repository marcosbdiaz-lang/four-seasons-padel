// Four Seasons Pádel · Palmarés V137
// Capa acumulativa sobre V136: logo, hitos separados Cuadro/Satélite y mejor posición trimestral por año.
(function(){
  'use strict';

  const VERSION='V137';

  function injectStyles(){
    const style=document.createElement('style');
    style.textContent=`
      .leagueLogo img{object-fit:contain!important;padding:4px;background:#08120e}
      .season{min-width:0}
      .season .seasonLabel{display:block;margin-top:8px;font-size:9px;font-weight:900;letter-spacing:.08em;color:#73a58d;text-transform:uppercase}
      .season .seasonBest{margin-top:8px;padding-top:8px;border-top:1px solid #203c31;font-size:9px;line-height:1.25;color:#7fa08f;text-transform:uppercase;letter-spacing:.04em}
      .season .seasonBest strong{display:block;margin-top:3px;color:#dcefe5;font-size:11px;letter-spacing:0;text-transform:none}
      @media(max-width:760px){.season{padding:11px 6px}.season b{font-size:24px}.season .seasonBest strong{font-size:10px}}
    `;
    document.head.appendChild(style);
  }

  function fixLogoAndVersion(){
    const logo=document.querySelector('.leagueLogo img');
    if(logo){
      logo.src='./logo_palmares.jpg?v=137';
      logo.alt='Logo Four Seasons Pádel 2026';
    }
    const foot=document.querySelector('.foot');
    if(foot) foot.textContent='FOUR SEASONS PÁDEL · PALMARÉS · WEB V137 · 15/10/2026';
  }

  function getPlayerCandidates(){
    const vals=[];
    try{ vals.push(PLAYER_KEY,PLAYER_NAME); }catch(e){}
    const name=document.getElementById('playerName')?.textContent||'';
    const alias=(document.getElementById('playerAlias')?.textContent||'').replace(/^\s*·\s*/, '');
    vals.push(name,alias);
    return new Set(vals.map(v=>norm(v)).filter(Boolean));
  }

  function v137JourneyAgg(all){
    const map=new Map();
    all.forEach(m=>{
      const s=sideInfo(m); if(!s) return;
      const tipo=String(m.tipo||'').trim();
      const key=[m.temporada,m.estacion,m.jornada,m.hoja,tipo].join('|');
      if(!map.has(key)) map.set(key,{temporada:m.temporada,estacion:m.estacion,jornada:m.jornada,hoja:m.hoja,fecha:m.fecha||'',tipo,partidos:0,ganados:0,average:0,completos:0,partners:new Set()});
      const j=map.get(key);
      j.partidos++;
      if(s.won) j.ganados++;
      if(Number.isFinite(Number(m.resultado_a))&&Number.isFinite(Number(m.resultado_b))){j.average+=s.for-s.against;j.completos++;}
      if(s.partner) j.partners.add(s.partner);
    });
    return [...map.values()];
  }

  function journeyKind(j){
    const t=norm(j.tipo);
    const h=norm(j.hoja);
    if(t.includes('cuadro')||h.includes('cuadro')) return 'cuadro';
    if(t.includes('satel')||h.includes('satel')) return 'satelite';
    return '';
  }

  function renderJourneyCard(id,detailId,j){
    const main=document.getElementById(id), detail=document.getElementById(detailId);
    if(!main||!detail) return;
    if(!j){
      main.textContent='—';
      detail.innerHTML='<span class="muted">Sin jornadas completas auditables de este formato.</span>';
      return;
    }
    main.textContent=`${j.ganados} victorias · Average ${j.average>=0?'+':''}${j.average}`;
    detail.innerHTML=`<strong>${esc(j.temporada)} · ${esc(j.estacion)} · J${j.jornada}</strong><br>👥 Con <strong>${esc([...j.partners].join(' / ')||'—')}</strong>${j.fecha?`<br>📅 ${esc(j.fecha)}`:''}`;
  }

  async function upgradePersonalMilestones(){
    const grid=document.querySelector('.featureGrid');
    const oldCard=grid?.querySelector('section:first-child');
    if(!grid||!oldCard) return;

    const cuadro=oldCard.cloneNode(true);
    cuadro.querySelector('h3').textContent='Mejor jornada de CUADRO';
    cuadro.querySelector('.big').id='bestJourneyCuadro';
    cuadro.querySelector('.big').textContent='—';
    cuadro.querySelector('.detail').id='bestJourneyCuadroDetail';
    cuadro.querySelector('.detail').textContent='—';

    const satelite=oldCard.cloneNode(true);
    satelite.classList.remove('gold');
    satelite.querySelector('h3').textContent='Mejor jornada de SATÉLITE';
    satelite.querySelector('.big').id='bestJourneySatelite';
    satelite.querySelector('.big').textContent='—';
    satelite.querySelector('.detail').id='bestJourneySateliteDetail';
    satelite.querySelector('.detail').textContent='—';

    oldCard.replaceWith(cuadro,satelite);

    try{
      const [newM,oldM]=await Promise.all([matches('historico_partidos'),matches('historico_partidos_antiguos',true)]);
      const ranked=rankJourneys(v137JourneyAgg([...oldM,...newM]));
      renderJourneyCard('bestJourneyCuadro','bestJourneyCuadroDetail',ranked.find(j=>journeyKind(j)==='cuadro'));
      renderJourneyCard('bestJourneySatelite','bestJourneySateliteDetail',ranked.find(j=>journeyKind(j)==='satelite'));
    }catch(e){
      document.getElementById('bestJourneyCuadroDetail').innerHTML='<span class="muted">No se pudo cargar este récord.</span>';
      document.getElementById('bestJourneySateliteDetail').innerHTML='<span class="muted">No se pudo cargar este récord.</span>';
    }
  }

  function latestQuarterPosition(jp){
    const ps=[...(jp?.posiciones||[])].filter(x=>num(x.posicion)>0);
    if(!ps.length) return null;
    ps.sort((a,b)=>num(b.jornada)-num(a.jornada));
    return num(ps[0].posicion)||null;
  }

  async function upgradeAnnualPositions(){
    const box=document.getElementById('seasons');
    if(!box) return;
    try{
      const cache=await cacheRows();
      const candidates=getPlayerCandidates();
      const bestByYear=new Map();

      cache.forEach(r=>{
        const players=Array.isArray(r.payload?.jugadores)?r.payload.jugadores:[];
        const jp=players.find(x=>[x.jugador,x.id,x.nombre].some(v=>candidates.has(norm(v))));
        const pos=latestQuarterPosition(jp);
        if(!pos) return;
        const y=String(r.temporada||'').toUpperCase();
        const estacion=String(r.estacion||'').toUpperCase();
        const idx=seasonOrder.indexOf(estacion);
        const prev=bestByYear.get(y);
        if(!prev||pos<prev.pos||(pos===prev.pos&&idx>prev.idx)) bestByYear.set(y,{pos,estacion,idx});
      });

      [...box.querySelectorAll('.season')].forEach(card=>{
        const oldSpan=card.querySelector('span');
        const oldB=card.querySelector('b');
        if(!oldSpan||!oldB) return;
        const original=oldSpan.textContent.trim();
        const current=/ACTUAL/i.test(original);
        const year=original.replace(/\s*·\s*ACTUAL\s*/i,'').trim().toUpperCase();
        const total=oldB.textContent.trim();
        const best=bestByYear.get(year);
        card.innerHTML=`<span>${esc(year)}</span><small class="seasonLabel">${current?'ACTUAL':'TOTAL AÑO'}</small><b>${esc(total)}</b><div class="seasonBest">MEJOR TRIM.${best?`<strong>${best.pos}º · ${esc(best.estacion)}</strong>`:'<strong>—</strong>'}</div>`;
      });
    }catch(e){
      [...box.querySelectorAll('.season')].forEach(card=>{
        if(card.querySelector('.seasonLabel')) return;
        const s=card.querySelector('span'),b=card.querySelector('b');
        if(!s||!b) return;
        const current=/ACTUAL/i.test(s.textContent);
        s.textContent=s.textContent.replace(/\s*·\s*ACTUAL\s*/i,'').trim();
        b.insertAdjacentHTML('beforebegin',`<small class="seasonLabel">${current?'ACTUAL':'TOTAL AÑO'}</small>`);
        b.insertAdjacentHTML('afterend','<div class="seasonBest">MEJOR TRIM.<strong>—</strong></div>');
      });
    }
  }

  async function applyV137(){
    injectStyles();
    fixLogoAndVersion();
    await Promise.all([upgradePersonalMilestones(),upgradeAnnualPositions()]);
  }

  function waitForV136(){
    const app=document.getElementById('app');
    if(app&&!app.hidden){ applyV137(); return; }
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const a=document.getElementById('app');
      if(a&&!a.hidden){ clearInterval(timer); applyV137(); }
      else if(tries>200) clearInterval(timer);
    },50);
  }

  waitForV136();
})();
