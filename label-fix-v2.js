/* NASCERE V2 — smaller static stand labels with full Spanish accents. */
(() => {
  const STANDS = [
    { x:  2, z:  2, es: 'PROYECTO',   en: 'PROJECT' },
    { x:  2, z: -2, es: 'MATERIAL',   en: 'MATERIAL' },
    { x: -2, z:  2, es: 'SISTEMA',    en: 'SYSTEM' },
    { x: -2, z: -2, es: 'COLECCIÓN',  en: 'COLLECTION' }
  ];

  function makeTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(159, 227, 230, 0.92)';

    let fontSize = 86;
    ctx.font = `600 ${fontSize}px Arial, Helvetica, sans-serif`;
    const maxWidth = 900;
    let measured = ctx.measureText(text).width;
    if (measured > maxWidth) {
      fontSize *= maxWidth / measured;
      ctx.font = `600 ${fontSize}px Arial, Helvetica, sans-serif`;
    }
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  function addLabel(scene, stand, text) {
    const holder = document.createElement('a-entity');
    holder.classList.add('nascere-micro-label', 'nascere-canvas-label');
    holder.setAttribute('position', `${stand.x - 0.497} 0.84 ${stand.z}`);
    holder.setAttribute('rotation', '0 -90 0');
    scene.appendChild(holder);

    const geometry = new THREE.PlaneGeometry(0.38, 0.072);
    const material = new THREE.MeshBasicMaterial({
      map: makeTextTexture(text),
      transparent: true,
      opacity: 0.90,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 35;
    holder.setObject3D('mesh', mesh);
  }

  function rebuildLabels() {
    const scene = document.getElementById('museum-scene');
    if (!scene) return;

    document.querySelectorAll('.nascere-micro-label').forEach((el) => {
      const mesh = el.getObject3D?.('mesh');
      if (mesh?.material?.map) mesh.material.map.dispose();
      if (mesh?.material?.dispose) mesh.material.dispose();
      if (mesh?.geometry?.dispose) mesh.geometry.dispose();
      el.remove();
    });

    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    STANDS.forEach((stand) => addLabel(scene, stand, stand[lang]));
  }

  function bindLanguage() {
    document.querySelectorAll('[data-language]').forEach((button) => {
      if (button.dataset.nascereCanvasLabelBound === 'true') return;
      button.dataset.nascereCanvasLabelBound = 'true';
      button.addEventListener('click', () => window.setTimeout(rebuildLabels, 30));
    });
  }

  function start() {
    const scene = document.getElementById('museum-scene');
    const afterScene = () => {
      window.setTimeout(() => { rebuildLabels(); bindLanguage(); }, 2300);
      window.setTimeout(rebuildLabels, 3050);
    };
    if (scene?.hasLoaded) afterScene();
    else scene?.addEventListener('loaded', afterScene, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
