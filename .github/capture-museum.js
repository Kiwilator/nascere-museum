const { chromium } = require('playwright');
const fs = require('fs');

const TARGET = process.env.TARGET_URL || 'http://127.0.0.1:8000/index.html';
const OUT = 'captures';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1
  });

  page.on('console', msg => console.log('[browser]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  await page.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => !!window.AFRAME && document.querySelector('#museum-scene')?.hasLoaded === true, null, { timeout: 120000 });
  await page.waitForTimeout(14000);

  const cleanOverlays = async (hideAllUI = false) => {
    await page.evaluate((hideAll) => {
      const loading = document.getElementById('loading-screen');
      if (loading) { loading.style.display = 'none'; loading.classList.add('is-hidden'); }
      const intro = document.getElementById('intro-card');
      if (intro) { intro.style.display = 'none'; intro.classList.add('is-hidden'); }
      const hint = document.getElementById('exhibit-hint');
      if (hint) hint.style.display = 'none';
      const veil = document.getElementById('nascere-panel-veil');
      if (veil) veil.style.opacity = '0';
      const panel = document.getElementById('exhibit-panel');
      if (panel) { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden','true'); }
      const ui = document.getElementById('museum-ui');
      if (ui) ui.style.display = hideAll ? 'none' : '';
    }, hideAllUI);
  };

  const setView = async (x, z, tx, ty, tz) => {
    await page.evaluate(({x,z,tx,ty,tz}) => {
      const rig = document.getElementById('rig');
      const camera = document.getElementById('camera');
      if (!rig || !camera || !window.THREE) return;

      const look = camera.components?.['look-controls'];
      if (look?.pause) look.pause();

      rig.object3D.position.set(x, 0, z);
      rig.object3D.rotation.set(0, 0, 0);
      camera.object3D.position.set(0, 1.6, 0);
      camera.object3D.rotation.set(0, 0, 0);
      camera.object3D.lookAt(new THREE.Vector3(tx, ty, tz));
      camera.object3D.updateMatrixWorld(true);
      rig.object3D.updateMatrixWorld(true);
    }, {x,z,tx,ty,tz});
    await page.waitForTimeout(1000);
  };

  const shot = async (name) => {
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log('captured', name);
  };

  await cleanOverlays(false);
  await setView(-5.0, 0.0, 0.0, 1.45, 0.0);
  await shot('01_entrada_con_interfaz');

  await cleanOverlays(true);
  await shot('02_entrada_limpia');

  await setView(-4.65, 4.45, 0.15, 1.30, -0.15);
  await shot('03_vista_general_diagonal');

  await setView(-4.65, -4.35, 0.0, 1.20, 0.0);
  await shot('04_peanas_banco_y_recorrido');

  await setView(1.35, 1.15, 4.05, 1.22, -2.05);
  await shot('05_vitrina_lateral_y_joyas');

  await setView(-0.7, 4.65, -1.0, 1.45, -4.9);
  await shot('06_mural_y_coleccion');

  await cleanOverlays(false);
  await setView(-3.7, 3.55, 1.85, 1.28, 1.9);
  await page.evaluate(() => {
    document.getElementById('museum-ui')?.style.removeProperty('display');
    const intro = document.getElementById('intro-card');
    if (intro) intro.style.display = 'none';
    document.getElementById('brand-button')?.click();
  });
  await page.waitForTimeout(800);
  await shot('07_panel_interactivo_proyecto');

  await page.evaluate(() => document.querySelector('.panel-close')?.click());
  await setView(0.3, -4.45, 2.0, 1.35, -2.0);
  await shot('08_punto_material');

  await browser.close();
})();