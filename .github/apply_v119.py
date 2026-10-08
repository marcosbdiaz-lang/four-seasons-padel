from pathlib import Path
import re, subprocess
p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Mantener V119 si aún no estuviera aplicado.
if 'playerConflictRedV119' not in s:
    css='''\n/* V119 · Aviso visual de jugador convocado en más de un bloque */\n.playerConflictRedV119{color:#ff5252!important;font-weight:950;text-shadow:0 0 10px rgba(255,82,82,.28)}\n.playerConflictPurpleV119{color:#c678ff!important;font-weight:950;text-shadow:0 0 10px rgba(198,120,255,.25)}\n'''
    style_end=s.find('</style>')
    assert style_end!=-1
    s=s[:style_end]+css+s[style_end:]

# V121 · viewport de escritorio para html2canvas.
marker121='windowWidth:1280, // V121 exportación con layout escritorio también en móvil'
if marker121 not in s:
    old='''    const canvas=await window.html2canvas(source,{\n      backgroundColor:"#070b0e",\n      scale:Math.min(2,Math.max(1,window.devicePixelRatio||1)),'''
    new='''    const canvas=await window.html2canvas(source,{\n      backgroundColor:"#070b0e",\n      windowWidth:1280, // V121 exportación con layout escritorio también en móvil\n      scale:Math.min(2,Math.max(1,window.devicePixelRatio||1)),'''
    assert s.count(old)==1, f'Anchor exportación esperado 1 vez, encontrado {s.count(old)}'
    s=s.replace(old,new,1)

# V122 · SOLO exportación: forzar el clon interno de html2canvas a geometría de escritorio.
# La página visible no se modifica en ningún momento.
marker122='// V122 SOLO EXPORTACION: clon interno con geometria escritorio'
if marker122 not in s:
    old='''      windowWidth:1280, // V121 exportación con layout escritorio también en móvil\n      scale:Math.min(2,Math.max(1,window.devicePixelRatio||1)),'''
    new='''      windowWidth:1600, // V122: viewport de escritorio del clon, no de la página visible\n      onclone:(clonedDoc)=>{\n        // V122 SOLO EXPORTACION: clon interno con geometria escritorio\n        const clonedSource=clonedDoc.getElementById(sectionId);\n        if(!clonedSource)return;\n        clonedDoc.documentElement.style.width="1600px";\n        clonedDoc.body.style.width="1600px";\n        clonedDoc.body.style.maxWidth="none";\n        clonedDoc.body.style.overflow="visible";\n        const clonedMain=clonedDoc.querySelector("main");\n        if(clonedMain){\n          clonedMain.style.width="1600px";\n          clonedMain.style.maxWidth="none";\n        }\n        clonedSource.style.width="1560px";\n        clonedSource.style.maxWidth="none";\n        clonedSource.style.margin="0 auto";\n        clonedSource.style.overflow="visible";\n        // El layout desktop existente decide columnas/estética; solo le damos espacio real.\n        [clonedSource.querySelector("#grid"),clonedSource.querySelector("#satGrid")].forEach(el=>{\n          if(el){el.style.width="100%";el.style.maxWidth="none";}\n        });\n      },\n      scale:Math.min(2,Math.max(1,window.devicePixelRatio||1)),'''
    assert s.count(old)==1, f'Anchor V121 esperado 1 vez, encontrado {s.count(old)}'
    s=s.replace(old,new,1)

# Versionado visible/exportación.
s=s.replace('<strong>V120</strong>','<strong>V121</strong>',1)
s=s.replace('<strong>V121</strong>','<strong>V122</strong>',1)
s=s.replace('Marcos Good V120','Marcos Good V121')
s=s.replace('Marcos Good V121','Marcos Good V122')

p.write_text(s,encoding='utf-8')
assert marker122 in s
assert 'windowWidth:1600' in s
assert '<strong>V122</strong>' in s
scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',s,re.S|re.I)
Path('/tmp/v122_app.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/v122_app.js'],check=True)
print('V122 OK: clon interno de exportación a escritorio; página visible intacta; sintaxis JS validada')
