from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = '''        <div class="intro-controls" aria-label="Controles de navegación">
          <span class="desktop-only"><b>W A S D</b><em data-i18n="move">Mover</em></span>
          <span class="desktop-only"><b>ARRASTRAR</b><em data-i18n="look">Mirar</em></span>
          <span class="mobile-only"><b>JOYSTICK</b><em data-i18n="move">Mover</em></span>
          <span class="mobile-only"><b>DESLIZAR</b><em data-i18n="look">Mirar</em></span>
        </div>'''
new = '''        <div class="intro-controls" aria-label="Controles de navegación">
          <span><b>W A S D&nbsp;&nbsp;&nbsp;← ↑ ↓ →</b><em data-i18n="move">Mover</em></span>
        </div>'''
if old not in s:
    raise SystemExit('controls block not found')
p.write_text(s.replace(old, new), encoding='utf-8')
