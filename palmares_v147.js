// Four Seasons Pádel · Palmarés V147
// Unifica la cabecera con Tesorería y reutiliza exactamente su logo embebido.
(function(){
'use strict';

function injectHeaderStyles(){
  const s=document.createElement('style');
  s.textContent=`
    .top.areaHero{display:grid!important;grid-template-columns:minmax(0,1fr) 320px!important;gap:22px!important;align-items:center!important;padding:24px 26px!important;min-height:0!important}
    .areaHeroMain{min-width:0}
    .areaHero .areaEyebrow{font-size:13px;letter-spacing:.18em;color:#d4dde3;font-weight:900;text-transform:uppercase}
    .areaHero .areaTitle{font-size:clamp(36px,6vw,68px)!important;line-height:.95!important;margin:9px 0 10px!important;letter-spacing:-.035em}
    .areaHero .areaSubtitle{font-size:clamp(17px,2.4vw,25px);color:#c8d3d9;margin-bottom:9px}
    .areaHero .areaMicro{color:#b9c4ca;font-size:14px;line-height:1.45}
    .areaLogoWrap{justify-self:end;display:flex;align-items:center;justify-content:center;min-height:180px;padding:18px 20px;background:linear-gradient(180deg,rgba(10,22,31,.95),rgba(7,15,21,.98));border:1px solid #203742;border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 12px 28px rgba(0,0,0,.22);overflow:hidden}
    .areaHomeLink{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:100%;color:inherit;text-decoration:none;border-radius:14px;outline:none}
    .areaLogo{display:block;width:100%;max-width:270px;max-height:145px;object-fit:contain;filter:drop-shadow(0 12px 24px rgba(0,0,0,.35));border-radius:0;transition:transform .18s ease,filter .18s ease}
    .areaHomeLink:hover .areaLogo{transform:translateY(-2px) scale(1.015);filter:drop-shadow(0 14px 28px rgba(0,0,0,.42))}
    .areaHomeHint{font-size:12px;color:#9fb1bb;font-weight:800;letter-spacing:.02em;text-align:center;transition:color .18s ease}
    .areaHomeLink:hover .areaHomeHint{color:var(--green)}
    .areaHeaderBadges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    .areaHeaderBack{display:inline-block;margin-top:14px;color:#dcefe5;text-decoration:none;border:1px solid var(--line);padding:8px 12px;border-radius:12px;background:#0b1913;font-weight:800}
    .heroLogo{display:none!important}
    @media(max-width:760px){
      .top.areaHero{grid-template-columns:1fr!important;padding:18px!important}
      .areaLogoWrap{justify-self:start;width:100%;min-height:140px;padding:16px}
      .areaLogo{max-width:240px}
    }
  `;
  document.head.appendChild(s);
}

async function loadTreasuryLogo(img){
  try{
    const res=await fetch('tesoreria.html?v=logo',{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const html=await res.text();
    const doc=new DOMParser().parseFromString(html,'text/html');
    const treasuryLogo=doc.querySelector('.logo');
    if(!treasuryLogo||!treasuryLogo.getAttribute('src'))throw new Error('Logo no encontrado en Tesorería');
    img.src=treasuryLogo.getAttribute('src');
    img.alt='Logo Four Seasons Pádel';
  }catch(e){
    console.warn('V147: no se pudo reutilizar el logo de Tesorería',e);
    img.style.display='none';
  }
}

function rebuildHeader(){
  const top=document.querySelector('.top');
  if(!top)return;
  injectHeaderStyles();
  top.classList.add('areaHero');
  top.innerHTML=`
    <div class="areaHeroMain">
      <div class="areaEyebrow">Área del jugador · Four Seasons Pádel</div>
      <h1 class="areaTitle">🏆 PALMARÉS</h1>
      <div class="areaSubtitle">Tu historia en Four Seasons Pádel</div>
      <div class="areaMicro">Estadísticas, récords, posiciones y fases finales calculadas desde los datos indexados.</div>
      <div class="areaHeaderBadges">
        <span class="badge">⚡ Supabase rápido</span>
        <span class="badge">📗 Sheets manda</span>
        <span class="badge">🔄 Actualización automática</span>
      </div>
      <a class="areaHeaderBack" href="index.html">← VOLVER A LA LIGA</a>
    </div>
    <div class="areaLogoWrap">
      <a class="areaHomeLink" href="index.html" aria-label="Volver a la web principal">
        <img class="areaLogo" alt="Logo Four Seasons Pádel">
        <span class="areaHomeHint">Volver a la liga</span>
      </a>
    </div>`;
  const img=top.querySelector('.areaLogo');
  loadTreasuryLogo(img);
  const f=document.querySelector('.foot');
  if(f)f.textContent='FOUR SEASONS PÁDEL · PALMARÉS · WEB V147 · 16/10/2026';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rebuildHeader);else rebuildHeader();
})();
