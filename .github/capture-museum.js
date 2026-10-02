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

  await page.evaluate(() => {
    const camera = document.getElementById('camera');
    const look = camera?.components?.['look-controls'];
    if (look?.pause) look.pause();
    camera?.removeAttribute('look-controls');
  });

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

      rig.object3D.position.set(x, 0, z);
      rig.object3D.rotation.set(0, 0, 0);

      camera.object3D.position.set(0, 1.6, 0);
      camera.object3D.rotation.set(0, 0, 0);

      const worldPos = new THREE.Vector3(x, 1.6, z);
      const target = new THREE.Vector3(tx, ty, tz);
      const d = target.clone().sub(worldPos);
      const horizontal = Math.hypot(d.x, d.z);
      const yaw = Math.atan2(-d.x, -d.z);
      const pitch = Math.atan2(d.y, horizontal);

      camera.object3D.rotation.set(pitch, yaw, 0, 'YXZ');
      rig.object3D.updateMatrixWorld(true);
      camera.object3D.updateMatrixWorld(true);
    }, {x,z,tx,ty,tz});
    await page.waitForTimeout(1100);
  };

  const shot = async (name) => {
    try {
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false, timeout: 120000 });
      console.log('captured', name);
    } catch (err) {
      console.log('capture failed', name, err.message);
    }
  };

  // 1. Visitor entrance view with interface visible.
  await cleanOverlays(false);
  await setView(-4.55, 0.0, 0.0, 1.35, 0.0);
  await shot('01_entrada_con_interfaz');

  // 2. Clean entrance view for the TFG.
  await cleanOverlays(true);
  await shot('02_entrada_limpia');

  // 3. General diagonal showing the four stands, central bench and walls.
  await setView(-4.25, 4.10, 0.0, 1.25, 0.0);
  await shot('03_vista_general_diagonal');

  // 4. Opposite diagonal for spatial organization.
  await setView(-4.15, -4.10, 0.15, 1.20, 0.10);
  await shot('04_vista_general_opuesta');

  // 5. Side vitrine and jewellery display.
  await setView(1.15, 1.70, 4.05, 1.18, -1.65);
  await shot('05_vitrina_lateral_y_joyas');

  // 6. Close view of the collection/ocean stand and graphic wall.
  await setView(-0.30, -4.15, -2.0, 1.42, -2.0);
  await shot('06_coleccion_y_mural');

  // 7. Project stand with information panel open.
  await cleanOverlays(false);
  await setView(-2.75, 3.35, 2.0, 1.30, 2.0);
  await page.evaluate(() => {
    const ui = document.getElementById('museum-ui');
    if (ui) ui.style.display = '';
    const intro = document.getElementById('intro-card');
    if (intro) intro.style.display = 'none';
    document.getElementById('brand-button')?.click();
  });
  await page.waitForTimeout(800);
  await shot('07_panel_interactivo_proyecto');

  // 8. Material point with UI visible but unobstructed.
  await page.evaluate(() => document.querySelector('.panel-close')?.click());
  await setView(0.15, -4.20, 2.0, 1.32, -2.0);
  await shot('08_punto_material');

  await browser.close();
})();