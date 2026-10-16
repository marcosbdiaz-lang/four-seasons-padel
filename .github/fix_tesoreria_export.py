from pathlib import Path
import re

p = Path('tesoreria.html')
s = p.read_text(encoding='utf-8')
original = s

# El enlace de vuelta al index debe envolver SOLO el logo.
# En la versión actual faltaba </a> tras la imagen, por lo que el navegador
# interpretaba buena parte de la página (incluido EXPORTAR ESTADO) como enlace.
logo_start = '<div class="logoWrap"><a class="homeLink" href="index.html" aria-label="Volver a la web principal"><img class="logo"'
pos = s.find(logo_start)
if pos < 0:
    raise SystemExit('No se encontró el bloque logoWrap/homeLink')

close_marker = '">\n  </div>\n  </section>'
end = s.find(close_marker, pos)
if end < 0:
    raise SystemExit('No se encontró el final de la imagen/logo')

# Inserta el cierre del enlace justo después del <img ...>.
insert_at = end + 2
if s[insert_at:insert_at+4] != '</a>':
    s = s[:insert_at] + '</a>' + s[insert_at:]

# Elimina el cierre </a> huérfano que antes terminaba accidentalmente ese enlace
# mucho más abajo, dentro de la cabecera del listado.
s = s.replace(
    '<span class="homeHint">↩ Haz click para volver a la web principal</span></a></div></div>',
    '<span class="homeHint">↩ Haz click para volver a la web principal</span></div></div>',
    1,
)

# Validaciones mínimas para no tocar nada más.
if s == original:
    raise SystemExit('No había cambios que aplicar')
if s.count('<a ') != s.count('</a>'):
    raise SystemExit(f'HTML con enlaces desbalanceados: aperturas={s.count("<a ")} cierres={s.count("</a>")}')
if 'id="exportGeneral"' not in s or "$('#exportGeneral').addEventListener('click'" not in s:
    raise SystemExit('No se encuentra el botón o su manejador de exportación')
if "const publicPlayerVisible=p=>norm(p.jugador_id||p.jugadorId)!=='jaime ms';" not in s:
    raise SystemExit('Se perdería el filtro público de Jaime MS')

p.write_text(s, encoding='utf-8')
print('OK: enlace del logo cerrado correctamente y exportación preservada')
