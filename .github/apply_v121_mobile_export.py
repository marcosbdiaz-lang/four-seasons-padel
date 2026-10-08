from pathlib import Path
import re, subprocess
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='windowWidth:1280, // V121 exportación con layout escritorio también en móvil'
if marker not in s:
    old='''    const canvas=await window.html2canvas(source,{\n      backgroundColor:"#070b0e",\n      scale:Math.min(2,Math.max(1,window.devicePixelRatio||1)),'''
    new='''    const canvas=await window.html2canvas(source,{\n      backgroundColor:"#070b0e",\n      windowWidth:1280, // V121 exportación con layout escritorio también en móvil\n      scale:Math.min(2,Math.max(1,window.devicePixelRatio||1)),'''
    assert s.count(old)==1, f'Anchor exportación esperado 1 vez, encontrado {s.count(old)}'
    s=s.replace(old,new,1)
    assert '<strong>V120</strong>' in s
    s=s.replace('<strong>V120</strong>','<strong>V121</strong>',1)
    if 'Marcos Good V120' in s:
        s=s.replace('Marcos Good V120','Marcos Good V121')
    p.write_text(s,encoding='utf-8')
assert marker in s
assert '<strong>V121</strong>' in s
scripts=re.findall(r'<script(?:\\s[^>]*)?>(.*?)</script>',s,re.S|re.I)
Path('/tmp/v121_app.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/v121_app.js'],check=True)
print('V121 OK: exportación móvil fuerza viewport de escritorio; resto intacto')
