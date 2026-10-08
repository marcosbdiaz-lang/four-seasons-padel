from pathlib import Path
import re, subprocess
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='V122_EXPORT_DESKTOP_CLONE'
if marker not in s:
    pattern=re.compile(r'    const canvas=await window\.html2canvas\(source,\{\n(?P<opts>.*?)\n    \}\);',re.S)
    matches=list(pattern.finditer(s))
    assert len(matches)==1, f'Captura html2canvas esperada 1 vez; encontradas {len(matches)}'
    opts=matches[0].group('opts')
    block='''    // V122_EXPORT_DESKTOP_CLONE · Solo afecta a la exportación.\n    // Se clona la sección fuera de pantalla para que se maquete con ancho de escritorio,\n    // sin modificar ni un píxel de la vista real del usuario.\n    const exportWrap=document.createElement("div");\n    exportWrap.setAttribute("aria-hidden","true");\n    Object.assign(exportWrap.style,{\n      position:"fixed",left:"-20000px",top:"0",width:"1280px",minWidth:"1280px",\n      maxWidth:"none",height:"auto",overflow:"visible",pointerEvents:"none",zIndex:"-2147483647",\n      background:"#070b0e"\n    });\n    const exportSource=source.cloneNode(true);\n    Object.assign(exportSource.style,{width:"1280px",minWidth:"1280px",maxWidth:"none",height:"auto",overflow:"visible"});\n\n    // El clon debe reflejar exactamente los valores actuales aunque aún no estén serializados en HTML.\n    const srcControls=[...source.querySelectorAll("input,select,textarea")];\n    const cloneControls=[...exportSource.querySelectorAll("input,select,textarea")];\n    srcControls.forEach((el,i)=>{\n      const c=cloneControls[i];\n      if(!c)return;\n      if(el.tagName==="INPUT"){c.value=el.value;c.checked=el.checked;}\n      else if(el.tagName==="SELECT"){c.selectedIndex=el.selectedIndex;c.value=el.value;}\n      else c.value=el.value;\n    });\n\n    exportWrap.appendChild(exportSource);\n    document.body.appendChild(exportWrap);\n    let canvas;\n    try{\n      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));\n      canvas=await window.html2canvas(exportSource,{\n''' + opts + '''\n      });\n    }finally{\n      exportWrap.remove();\n    }'''
    s=pattern.sub(block,s,count=1)
    assert '<strong>V121</strong>' in s, 'No encuentro versión V121 en footer'
    s=s.replace('<strong>V121</strong>','<strong>V122</strong>',1)
    s=s.replace('Marcos Good V121','Marcos Good V122')
    p.write_text(s,encoding='utf-8')
assert marker in s
assert '<strong>V122</strong>' in s
assert 'window.html2canvas(exportSource' in s
assert 'window.html2canvas(source' not in s
scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',s,re.S|re.I)
Path('/tmp/v122_app.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/v122_app.js'],check=True)
print('V122 OK: clon de escritorio exclusivo para exportación; JS válido')
