from pathlib import Path

# Update index cache-buster and enrich control copy to match bacteria layout.
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = s.replace('./style.css?v=6', './style.css?v=7')
s = s.replace('./style.css?v=5', './style.css?v=7')

s = s.replace(
'''            <div class="control-copy"><b>WASD O FLECHAS</b><em data-i18n="move">Mover</em></div>''',
'''            <div class="control-copy"><em data-i18n="move">MOVER</em><b>WASD O FLECHAS</b><small>Usa WASD o las flechas del teclado</small></div>'''
)
s = s.replace(
'''            <div class="control-copy"><b>CLIC + ARRASTRAR</b><em data-i18n="look">Mirar</em></div>''',
'''            <div class="control-copy"><em data-i18n="look">MIRAR</em><b>CLIC + ARRASTRAR</b><small>Mantén pulsado el botón izquierdo y arrastra</small></div>'''
)
p.write_text(s, encoding='utf-8')

# Append strong overrides so legacy generic span rules cannot distort the controls.
p = Path('style.css')
s = p.read_text(encoding='utf-8')
marker = '/* FINAL bacteria-layout onboarding override */'
if marker in s:
    s = s[:s.index(marker)].rstrip() + '\n\n'

s += r'''
/* FINAL bacteria-layout onboarding override */
#intro-card .intro-shell {
  width: min(760px, calc(100vw - 44px));
  padding: 28px 30px 24px;
}
#intro-card .intro-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 22px;
  margin-top: 24px;
  align-items: stretch;
}
#intro-card .intro-controls > .control-card {
  min-width: 0;
  min-height: 174px;
  padding: 16px 18px;
  margin: 0;
  border: 1px solid rgba(231,253,253,.13);
  border-radius: 14px;
  background: rgba(255,255,255,.055);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 22px;
  text-align: left;
}

/* Never show mobile cards on desktop. This must beat the generic control-card rule. */
#intro-card .intro-controls > .mobile-only {
  display: none !important;
}
#intro-card .intro-controls > .desktop-only {
  display: flex !important;
}

/* Cancel the old generic span-card styling inside the visual demos. */
#intro-card .controls-demo-wrap span,
#intro-card .controls-mouse-demo span {
  min-width: 0;
  padding: 0;
  margin: 0;
  border-radius: 0;
  background: transparent;
}

#intro-card .control-copy {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}
#intro-card .control-copy em {
  order: 0;
  display: block;
  margin: 0;
  color: var(--sea);
  font-size: 10px;
  line-height: 1.2;
  font-style: normal;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
}
#intro-card .control-copy b {
  order: 1;
  display: block;
  margin: 0;
  color: var(--white);
  font-size: 14px;
  line-height: 1.18;
  font-weight: 700;
  letter-spacing: .035em;
  white-space: normal;
}
#intro-card .control-copy small {
  order: 2;
  display: block;
  margin-top: 2px;
  color: rgba(248,255,255,.60);
  font-size: 11px;
  line-height: 1.45;
  font-weight: 400;
  letter-spacing: 0;
}

/* Keyboard exactly like the bacteria museum: WASD block, then a separated arrow block. */
#intro-card .controls-demo-wrap {
  width: 128px;
  height: 138px;
  flex: 0 0 128px;
  position: relative;
  border: 0;
  background: transparent;
}
#intro-card .controls-demo-keys {
  position: absolute;
  left: 15px;
  top: 0;
  width: 98px;
  height: 64px;
  display: grid;
  grid-template-columns: repeat(3,30px);
  grid-template-rows: repeat(2,30px);
  gap: 4px;
  border: 0;
  background: transparent;
}
#intro-card .controls-demo-arrows {
  position: absolute;
  left: 24px;
  top: 82px;
  width: 80px;
  height: 51px;
  display: grid;
  grid-template-columns: repeat(3,24px);
  grid-template-rows: repeat(2,24px);
  gap: 3px;
  opacity: .78;
  border: 0;
  background: transparent;
}
#intro-card .controls-demo-key {
  box-sizing: border-box !important;
  min-width: 0 !important;
  width: 30px !important;
  height: 30px !important;
  padding: 0 !important;
  margin: 0 !important;
  display: grid !important;
  place-items: center !important;
  border: 1px solid rgba(232,251,251,.42) !important;
  border-radius: 6px !important;
  background: rgba(255,255,255,.10) !important;
  color: var(--white) !important;
  font-size: 11px !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  box-shadow: 0 2px 0 rgba(1,18,23,.28) !important;
  animation: nascere-key-pulse 2.8s ease-in-out infinite;
}
#intro-card .controls-demo-arrows .controls-demo-key {
  width: 24px !important;
  height: 24px !important;
  font-size: 10px !important;
}
#intro-card .controls-demo-key.w { grid-column:2; grid-row:1; }
#intro-card .controls-demo-key.a { grid-column:1; grid-row:2; animation-delay:.35s; }
#intro-card .controls-demo-key.s { grid-column:2; grid-row:2; animation-delay:.70s; }
#intro-card .controls-demo-key.d { grid-column:3; grid-row:2; animation-delay:1.05s; }
#intro-card .controls-demo-arrows .up { grid-column:2; grid-row:1; }
#intro-card .controls-demo-arrows .left { grid-column:1; grid-row:2; animation-delay:.35s; }
#intro-card .controls-demo-arrows .down { grid-column:2; grid-row:2; animation-delay:.70s; }
#intro-card .controls-demo-arrows .right { grid-column:3; grid-row:2; animation-delay:1.05s; }

/* Mouse exactly like bacteria museum. */
#intro-card .controls-mouse-demo {
  width: 124px;
  height: 116px;
  flex: 0 0 124px;
  position: relative;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
}
#intro-card .controls-mouse-shape {
  width: 42px;
  height: 64px;
  position: relative;
  border: 2px solid rgba(232,251,251,.72);
  border-radius: 22px;
  background: rgba(255,255,255,.07);
  animation: nascere-mouse-drag 2.4s ease-in-out infinite;
}
#intro-card .controls-mouse-shape::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  width: 1px;
  height: 24px;
  background: rgba(232,251,251,.35);
}
#intro-card .controls-mouse-shape::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 7px;
  width: 13px;
  height: 18px;
  border-radius: 8px 4px 5px 4px;
  background: var(--sea);
  animation: nascere-click 2.4s ease-in-out infinite;
}
#intro-card .controls-drag-arrows {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  color: var(--sea);
  font-size: 20px;
  line-height: 1;
  letter-spacing: .16em;
}

@media (max-width: 720px) {
  #intro-card .intro-shell {
    width: min(390px, calc(100vw - 24px));
    padding: 24px 18px 20px;
  }
  #intro-card .intro-controls {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  #intro-card .intro-controls > .desktop-only {
    display: none !important;
  }
  #intro-card .intro-controls > .mobile-only {
    display: flex !important;
    min-height: 82px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    text-align: center;
  }
}
'''

p.write_text(s, encoding='utf-8')
