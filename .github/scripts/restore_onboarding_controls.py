from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old = '''        <div class="intro-controls" aria-label="Controles de navegación">
          <span><b>W A S D&nbsp;&nbsp;&nbsp;← ↑ ↓ →</b><em data-i18n="move">Mover</em></span>
        </div>'''

new = '''        <div class="intro-controls" aria-label="Controles de navegación">
          <span class="desktop-only control-card keyboard-control">
            <span class="control-visual keyboard-visual" aria-hidden="true">
              <span class="key-row key-row-top"><i class="keycap">W</i><i class="keycap arrow-key">↑</i></span>
              <span class="key-row"><i class="keycap">A</i><i class="keycap">S</i><i class="keycap">D</i><i class="keycap arrow-key">←</i><i class="keycap arrow-key">↓</i><i class="keycap arrow-key">→</i></span>
            </span>
            <b>WASD + FLECHAS</b>
            <em data-i18n="move">Mover</em>
          </span>
          <span class="desktop-only control-card mouse-control">
            <span class="mouse-icon" aria-hidden="true"><i></i></span>
            <b>ARRASTRAR</b>
            <em data-i18n="look">Mirar</em>
          </span>
          <span class="mobile-only control-card"><b>JOYSTICK</b><em data-i18n="move">Mover</em></span>
          <span class="mobile-only control-card"><b>DESLIZAR</b><em data-i18n="look">Mirar</em></span>
        </div>'''

if old not in s:
    raise SystemExit('Current simplified controls block not found')
s = s.replace(old, new)

style_marker = '</head>'
styles = '''  <style id="onboarding-control-icons">
    .intro-controls .control-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;min-width:190px;}
    .control-visual{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:54px;justify-content:center;}
    .key-row{display:flex;gap:4px;align-items:center;justify-content:center;}
    .key-row-top{transform:translateX(-31px);}
    .keycap{display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(232,255,255,.42);border-radius:6px;background:rgba(255,255,255,.09);box-shadow:inset 0 -2px 0 rgba(255,255,255,.08),0 3px 10px rgba(0,0,0,.12);font:600 10px/1 'DM Sans',sans-serif;font-style:normal;color:#f8ffff;}
    .arrow-key{color:#75d8de;}
    .mouse-icon{position:relative;width:34px;height:52px;border:1.5px solid rgba(232,255,255,.62);border-radius:17px;display:block;margin:1px auto 2px;background:rgba(255,255,255,.055);}
    .mouse-icon::before{content:'';position:absolute;left:50%;top:0;bottom:25px;width:1px;background:rgba(232,255,255,.24);transform:translateX(-50%);}
    .mouse-icon i{position:absolute;left:50%;top:8px;width:3px;height:9px;border-radius:3px;background:#75d8de;transform:translateX(-50%);}
    .intro-controls .control-card>b{margin-top:1px;}
    @media (max-width:720px){.intro-controls .desktop-only{display:none!important}.intro-controls .mobile-only{display:flex!important}}
  </style>\n'''
if 'id="onboarding-control-icons"' not in s:
    s = s.replace(style_marker, styles + style_marker)

p.write_text(s, encoding='utf-8')
