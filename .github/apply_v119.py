from pathlib import Path
import re, subprocess, tempfile
p=Path('index.html')
s=p.read_text(encoding='utf-8')
if 'playerConflictRedV119' not in s:
    css='''\n/* V119 · Aviso visual de jugador convocado en más de un bloque */\n.playerConflictRedV119{color:#ff5252!important;font-weight:950;text-shadow:0 0 10px rgba(255,82,82,.28)}\n.playerConflictPurpleV119{color:#c678ff!important;font-weight:950;text-shadow:0 0 10px rgba(198,120,255,.25)}\n'''
    style_end=s.find('</style>')
    assert style_end!=-1
    s=s[:style_end]+css+s[style_end:]
    anchor='function normalizeSearch(v){return normalizePlayerKeyV118(v)}\n'
    assert s.count(anchor)==1
    helper=r'''

// V119 · Conflictos de convocatoria entre Cuadro y Satélites.
// Morado: exactamente 2 Satélites a distinta hora, o Cuadro + Satélite 19:30.
// Rojo: más de 2 ubicaciones, 2 Satélites a la misma hora, o Cuadro + Satélite fuera de 19:30.
function splitPairPlayersV119(value){
  return String(value||"")
    .split(/\r?\n|\s+\/\s+|\s+\+\s+|\s+&\s+|\s+\|\s+/)
    .map(v=>cleanPlayerIdentityV118(v))
    .filter(Boolean);
}
function conflictTimeV119(value){
  let t="";
  try{ t=typeof formatHora==="function"?String(formatHora(value)||""):String(value||""); }
  catch(_){ t=String(value||""); }
  t=t.trim().replace(".",":");
  const m=t.match(/(?:^|\s)(\d{1,2}):(\d{2})(?:\s|$)/);
  if(!m)return "";
  return `${String(Number(m[1])).padStart(2,"0")}:${m[2]}`;
}
function buildPlayerConflictMapV119(data){
  const presence=new Map();
  const add=(pair,siteId,kind,time)=>{
    splitPairPlayersV119(pair).forEach(name=>{
      const key=normalizePlayerKeyV118(name);
      if(!key)return;
      if(!presence.has(key))presence.set(key,{name,sites:new Map()});
      presence.get(key).sites.set(siteId,{kind,time:time||""});
    });
  };
  (data&&data.cuadro||[]).forEach(p=>(p.juegos||[]).forEach(g=>{add(g.parejaA,"CUADRO","cuadro","");add(g.parejaB,"CUADRO","cuadro","");}));
  (data&&data.satelites||[]).forEach(s=>{
    const siteId=`SAT-${s.satelite}`,time=conflictTimeV119(s.hora);
    (s.partidos||[]).forEach(p=>{add(p.parejaA,siteId,"satelite",time);add(p.parejaB,siteId,"satelite",time);});
  });
  const result=new Map();
  presence.forEach((entry,key)=>{
    const sites=[...entry.sites.values()];
    if(sites.length<=1)return;
    const cuadro=sites.filter(x=>x.kind==="cuadro"),sats=sites.filter(x=>x.kind==="satelite");
    let level="";
    if(sites.length>2)level="red";
    else if(cuadro.length)level=(sats.length===1&&sats[0].time==="19:30")?"purple":"red";
    else if(sats.length===2)level=(sats[0].time&&sats[1].time&&sats[0].time!==sats[1].time)?"purple":"red";
    if(level)result.set(key,level);
  });
  return result;
}
function conflictPairHtmlV119(raw,conflicts){
  const parts=String(raw||"").split(/(\r?\n|\s+\/\s+|\s+\+\s+|\s+&\s+|\s+\|\s+)/);
  return parts.map(part=>{
    if(!part)return "";
    if(/^(\r?\n|\s+\/\s+|\s+\+\s+|\s+&\s+|\s+\|\s+)$/.test(part))return esc(part);
    const level=conflicts.get(normalizePlayerKeyV118(part));
    if(level==="red")return `<span class="playerConflictRedV119" title="⚠️ Jugador repetido en horarios/bloques incompatibles">${esc(part)}</span>`;
    if(level==="purple")return `<span class="playerConflictPurpleV119" title="ℹ️ Jugador repetido en bloques compatibles por horario">${esc(part)}</span>`;
    return esc(part);
  }).join("");
}
function applyPlayerConflictColorsV119(data){
  const conflicts=buildPlayerConflictMapV119(data||{});
  [grid,satGrid].forEach(root=>{if(root)root.querySelectorAll(".pair").forEach(el=>{el.innerHTML=conflictPairHtmlV119(el.textContent||"",conflicts);});});
}
'''
    s=s.replace(anchor,anchor+helper,1)
    old='  renderCuadro(data,readOnly);\n  renderSatelites(data,readOnly);\n  updateWinners();'
    assert old in s
    s=s.replace(old,'  renderCuadro(data,readOnly);\n  renderSatelites(data,readOnly);\n  applyPlayerConflictColorsV119(data);\n  updateWinners();',1)
    s=s.replace('<strong>V118</strong>','<strong>V119</strong>')
    s=s.replace('Marcos Good V118','Marcos Good V119')
    p.write_text(s,encoding='utf-8')
assert 'playerConflictRedV119' in s and 'playerConflictPurpleV119' in s and 'applyPlayerConflictColorsV119(data)' in s
scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',s,re.S|re.I)
Path('/tmp/v119_app.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/v119_app.js'],check=True)
print('V119 OK')
