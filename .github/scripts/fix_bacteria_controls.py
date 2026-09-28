from pathlib import Path

# --- HTML: use the same visual structure as Museo-bacterias-2 ---
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = s.replace('./style.css?v=5', './style.css?v=6')
old = '''        <div class="intro-controls" aria-label="Controles de navegación">
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
new = '''        <div class="intro-controls" aria-label="Controles de navegación">
          <div class="desktop-only control-card keyboard-control">
            <div class="controls-demo-wrap" aria-hidden="true">
              <div class="controls-demo-keys">
                <span class="controls-demo-key w">W</span>
                <span class="controls-demo-key a">A</span>
                <span class="controls-demo-key s">S</span>
                <span class="controls-demo-key d">D</span>
              </div>
              <div class="controls-demo-arrows">
                <span class="controls-demo-key up">↑</span>
                <span class="controls-demo-key left">←</span>
                <span class="controls-demo-key down">↓</span>
                <span class="controls-demo-key right">→</span>
              </div>
            </div>
            <div class="control-copy"><b>WASD O FLECHAS</b><em data-i18n="move">Mover</em></div>
          </div>
          <div class="desktop-only control-card mouse-control">
            <div class="controls-mouse-demo" aria-hidden="true">
              <div class="controls-mouse-shape"></div>
              <div class="controls-drag-arrows">← →</div>
            </div>
            <div class="control-copy"><b>CLIC + ARRASTRAR</b><em data-i18n="look">Mirar</em></div>
          </div>
          <div class="mobile-only control-card"><b>JOYSTICK</b><em data-i18n="move">Mover</em></div>
          <div class="mobile-only control-card"><b>DESLIZAR</b><em data-i18n="look">Mirar</em></div>
        </div>'''
if old not in s:
    raise SystemExit('Expected current controls block not found')
s = s.replace(old, new)
p.write_text(s, encoding='utf-8')

# --- CSS: remove selector collision and reproduce the bacteria controls visuals ---
p = Path('style.css')
s = p.read_text(encoding='utf-8')
s = s.replace(
    '.intro-controls span { min-width:150px; padding:13px 16px 12px; border:1px solid rgba(231,253,253,.16); border-radius:14px; background:rgba(255,255,255,.055); }',
    '.intro-controls > .control-card { min-width:150px; padding:13px 16px 12px; border:1px solid rgba(231,253,253,.16); border-radius:14px; background:rgba(255,255,255,.055); }'
)
marker = '/* bacteria-style onboarding controls */'
if marker not in s:
    s += r'''

/* bacteria-style onboarding controls */
.intro-controls > .control-card {
  min-height: 158px;
  flex: 1 1 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  text-align: left;
}
.control-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.intro-controls .control-copy b {
  margin: 0;
  font-size: 10px;
  line-height: 1.25;
  letter-spacing: .08em;
  white-space: nowrap;
}
.intro-controls .control-copy em {
  margin: 0;
  color: var(--sea);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .14em;
}

/* Keyboard visual copied from the bacteria museum logic, recoloured for Nascere. */
.controls-demo-wrap {
  width: 128px;
  height: 138px;
  flex: 0 0 128px;
  position: relative;
}
.controls-demo-keys {
  position: absolute;
  left: 15px;
  top: 0;
  width: 98px;
  display: grid;
  grid-template-columns: repeat(3,30px);
  grid-template-rows: repeat(2,30px);
  gap: 4px;
}
.intro-controls .controls-demo-key {
  min-width: 0;
  width: 30px;
  height: 30px;
  padding: 0;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  border: 1px solid rgba(232,251,251,.42);
  border-radius: 6px;
  background: rgba(255,255,255,.10);
  color: var(--white);
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 2px 0 rgba(1,18,23,.28);
  animation: nascere-key-pulse 2.8s ease-in-out infinite;
}
.controls-demo-key.w { grid-column: 2; grid-row: 1; }
.controls-demo-key.a { grid-column: 1; grid-row: 2; animation-delay: .35s; }
.controls-demo-key.s { grid-column: 2; grid-row: 2; animation-delay: .70s; }
.controls-demo-key.d { grid-column: 3; grid-row: 2; animation-delay: 1.05s; }
.controls-demo-arrows {
  position: absolute;
  left: 24px;
  top: 82px;
  width: 80px;
  display: grid;
  grid-template-columns: repeat(3,24px);
  grid-template-rows: repeat(2,24px);
  gap: 3px;
  opacity: .82;
}
.intro-controls .controls-demo-arrows .controls-demo-key {
  width: 24px;
  height: 24px;
  font-size: 10px;
}
.controls-demo-arrows .up { grid-column: 2; grid-row: 1; }
.controls-demo-arrows .left { grid-column: 1; grid-row: 2; animation-delay: .35s; }
.controls-demo-arrows .down { grid-column: 2; grid-row: 2; animation-delay: .70s; }
.controls-demo-arrows .right { grid-column: 3; grid-row: 2; animation-delay: 1.05s; }

/* Mouse visual copied from the bacteria museum logic, recoloured for Nascere. */
.controls-mouse-demo {
  width: 124px;
  height: 116px;
  flex: 0 0 124px;
  position: relative;
  display: grid;
  place-items: center;
}
.controls-mouse-shape {
  width: 40px;
  height: 60px;
  position: relative;
  border: 2px solid rgba(232,251,251,.72);
  border-radius: 21px;
  background: rgba(255,255,255,.08);
  animation: nascere-mouse-drag 2.4s ease-in-out infinite;
}
.controls-mouse-shape::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  width: 1px;
  height: 23px;
  background: rgba(232,251,251,.35);
}
.controls-mouse-shape::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 7px;
  width: 12px;
  height: 17px;
  border-radius: 8px 4px 5px 4px;
  background: var(--sea);
  animation: nascere-click 2.4s ease-in-out infinite;
}
.controls-drag-arrows {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2px;
  text-align: center;
  color: var(--sea);
  font-size: 20px;
  letter-spacing: .16em;
}

@keyframes nascere-key-pulse {
  0%,72%,100% { transform:translateY(0); background:rgba(255,255,255,.10); }
  10%,28% { transform:translateY(2px); background:rgba(117,216,222,.24); }
}
@keyframes nascere-mouse-drag {
  0%,18%,100% { transform:translateX(-17px); }
  55%,72% { transform:translateX(17px); }
}
@keyframes nascere-click {
  0%,12%,82%,100% { opacity:.42; transform:scale(1); }
  20%,68% { opacity:1; transform:scale(.86); }
}

@media (max-width: 720px) {
  .intro-controls > .control-card { min-height: 0; flex: 1 1 42%; display: flex; }
  .intro-controls > .desktop-only { display: none; }
  .intro-controls > .mobile-only { display: flex; flex-direction: column; text-align: center; gap: 4px; }
}
@media (prefers-reduced-motion: reduce) {
  .controls-demo-key, .controls-mouse-shape, .controls-mouse-shape::after { animation: none !important; }
}
'''
p.write_text(s, encoding='utf-8')
