/* NASCERE V2 hotfix: movement, display placement and stand controls. */
(() => {
  /* ------------------------------------------------------------------
     1. CAMERA-RELATIVE MOVEMENT
     ------------------------------------------------------------------ */
  const movement = AFRAME.components['museum-movement'];
  if (movement?.Component?.prototype) {
    movement.Component.prototype.tick = function (time, delta) {
      const cameraEl = document.getElementById('camera');
      if (!cameraEl || !delta) return;

      let x = this.joystickX;
      let y = this.joystickY;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;
      if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) return;

      const threeCamera = cameraEl.getObject3D('camera') || cameraEl.sceneEl?.camera;
      if (!threeCamera) return;
      threeCamera.getWorldDirection(this.forward);
      this.forward.y = 0;
      if (this.forward.lengthSq() < 0.0001) return;
      this.forward.normalize();
      this.right.set(-this.forward.z, 0, this.forward.x);
      this.move.set(0, 0, 0)
        .addScaledVector(this.right, x)
        .addScaledVector(this.forward, -y);
      if (this.move.lengthSq() > 1) this.move.normalize();
      this.move.multiplyScalar(this.data.speed * Math.min(delta / 1000, 0.045));
      this.el.object3D.position.add(this.move);
    };
  }

  /* ------------------------------------------------------------------
     2. LOCAL JEWELLERY FALLBACKS
     ------------------------------------------------------------------ */
  const localJewellery = {
    'pendiente_coral_nascere1.glb': './assets/pendiente_coral.glb',
    'pendiente_coral_nascere2.glb': './assets/pendiente_coral1.glb',
    'pendiente_coral_nascere3.glb': './assets/pendiente_coral2.glb',
    'pendiente_coral_nascere4.glb': './assets/pendiente_coral.glb',
    'anillo_coral_nascere1.glb': './assets/anillo_coral1.glb',
    'anillo_coral_nascere2.glb': './assets/anillo_coral1.glb',
    'anillo_coral_nascere3.glb': './assets/anillo_coral1.glb',
    'anillo_coral_nascere4.glb': './assets/anillo_coral1.glb'
  };

  function localSource(value) {
    if (!value) return null;
    for (const [remoteName, localPath] of Object.entries(localJewellery)) {
      if (value.includes(remoteName)) return localPath;
    }
    return null;
  }

  function repairEntity(el) {
    if (!el?.getAttribute) return;
    const gltf = el.getAttribute('gltf-model');
    if (typeof gltf === 'string') {
      const local = localSource(gltf);
      if (local && gltf !== local) el.setAttribute('gltf-model', local);
    }
    const deferred = el.getAttribute('deferred-gltf');
    if (deferred) {
      const raw = typeof deferred === 'string'
        ? deferred
        : `src: ${deferred.src || ''}; delay: ${deferred.delay || 0}`;
      const local = localSource(raw);
      if (local) {
        const delayMatch = raw.match(/delay\s*:\s*(\d+)/i);
        const delay = delayMatch ? Number(delayMatch[1]) : 0;
        el.setAttribute('deferred-gltf', `src: ${local}; delay: ${Math.min(delay, 250)}`);
      }
    }
  }

  function repairTree(root) {
    if (root.nodeType === 1) repairEntity(root);
    root.querySelectorAll?.('[gltf-model], [deferred-gltf]').forEach(repairEntity);
  }

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(repairTree));
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  /* ------------------------------------------------------------------
     3. JEWELLERY PLACEMENT
     Four main pieces sit inside the four central glass tubes.
     Four secondary pieces sit inside the transparent side display case.
     ------------------------------------------------------------------ */
  function setTransform(el, position, scale, rotation) {
    if (!el) return;
    el.setAttribute('position', position);
    if (scale) el.setAttribute('scale', scale);
    if (rotation) el.setAttribute('rotation', rotation);
  }

  function arrangeJewellery() {
    const central = [...document.querySelectorAll('.critical-model.jewellery')];
    const side = [...document.querySelectorAll('.jewellery:not(.critical-model)')];

    /* Centre each piece on the actual stand/tube axis. */
    const centralLayout = [
      { position: '-2 1.52 -2', scale: '0.0045 0.0045 0.0045', rotation: '0 15 0' },
      { position: '2 1.52 -2',  scale: '0.0042 0.0042 0.0042', rotation: '0 -20 0' },
      { position: '-2 1.48 2', scale: '0.0085 0.0085 0.0085', rotation: '20 20 20' },
      { position: '2 1.48 2',  scale: '0.0085 0.0085 0.0085', rotation: '90 20 90' }
    ];
    centralLayout.forEach((layout, index) => {
      setTransform(central[index], layout.position, layout.scale, layout.rotation);
    });

    /* Transparent side vitrine: pieces are INSIDE it, not hovering above it. */
    const sideLayout = [
      { position: '3.94 0.78 3.25',  scale: '0.0027 0.0027 0.0027', rotation: '0 90 0' },
      { position: '3.94 0.78 1.15',  scale: '0.0025 0.0025 0.0025', rotation: '0 90 0' },
      { position: '3.94 0.78 -1.15', scale: '0.0055 0.0055 0.0055', rotation: '0 90 0' },
      { position: '3.94 0.78 -3.25', scale: '0.0055 0.0055 0.0055', rotation: '0 90 0' }
    ];
    sideLayout.forEach((layout, index) => {
      setTransform(side[index], layout.position, layout.scale, layout.rotation);
    });
  }

  function makeSideDisplayTransparent() {
    const shelf = document.querySelector('a-box.wall[position="4 0.5 0"]');
    if (!shelf) return;

    /* Turn the old black counter into a glass display case. */
    shelf.removeAttribute('src');
    shelf.setAttribute('position', '4 0.82 0');
    shelf.setAttribute('width', '0.78');
    shelf.setAttribute('height', '1.42');
    shelf.setAttribute('depth', '9.4');
    shelf.setAttribute(
      'material',
      'color: #dffcff; opacity: 0.14; transparent: true; roughness: 0.06; metalness: 0.02; side: double; depthWrite: false'
    );

    const scene = document.getElementById('museum-scene');
    if (!scene || document.getElementById('side-glass-shelf-1')) return;

    /* Two very subtle glass shelves make it read as a vitrine rather than a box. */
    [0.48, 1.12].forEach((y, index) => {
      const plate = document.createElement('a-box');
      plate.id = `side-glass-shelf-${index + 1}`;
      plate.setAttribute('position', `4 ${y} 0`);
      plate.setAttribute('width', '0.72');
      plate.setAttribute('height', '0.025');
      plate.setAttribute('depth', '9.1');
      plate.setAttribute(
        'material',
        'color: #eaffff; opacity: 0.28; transparent: true; roughness: 0.05; side: double; depthWrite: false'
      );
      scene.appendChild(plate);
    });
  }

  /* ------------------------------------------------------------------
     4. PHYSICAL INFO BUTTONS ON THE STAND BASES
     Existing hotspot elements keep their original click listeners, but
     are moved off the glass and rebuilt as crisp physical buttons.
     ------------------------------------------------------------------ */
  const buttonLayout = [
    { position: '1.48 0.68 2', rotation: '0 -90 0', number: '01' },
    { position: '1.48 0.68 -2', rotation: '0 -90 0', number: '02' },
    { position: '-2.52 0.68 2', rotation: '0 -90 0', number: '03' },
    { position: '-2.52 0.68 -2', rotation: '0 -90 0', number: '04' }
  ];

  function makeNumberCanvas(number, index) {
    const id = `nascere-button-${index + 1}`;
    let canvas = document.getElementById(id);
    if (canvas) return canvas;

    canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = 512;
    canvas.height = 512;
    canvas.style.display = 'none';
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = '#72d8de';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#eaffff';
    ctx.lineWidth = 18;
    ctx.strokeRect(18, 18, 476, 476);
    ctx.fillStyle = '#0b333b';
    ctx.font = '600 190px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number, 256, 270);
    document.body.appendChild(canvas);
    return canvas;
  }

  function rebuildStandButtons() {
    const hotspots = [...document.querySelectorAll('.nascere-hotspot')];
    if (hotspots.length < 4) return false;

    hotspots.slice(0, 4).forEach((marker, index) => {
      const layout = buttonLayout[index];
      marker.removeAttribute('face-camera');
      marker.removeAttribute('animation__appear');
      marker.setAttribute('position', layout.position);
      marker.setAttribute('rotation', layout.rotation);
      marker.setAttribute('radius', '0.115');
      marker.setAttribute('scale', '1 1 1');

      while (marker.firstChild) marker.removeChild(marker.firstChild);
      const canvas = makeNumberCanvas(layout.number, index);
      marker.setAttribute(
        'material',
        `src: #${canvas.id}; shader: flat; side: double; transparent: false; alphaTest: 0.01`
      );

      const body = document.createElement('a-cylinder');
      body.setAttribute('radius', '0.13');
      body.setAttribute('height', '0.055');
      body.setAttribute('rotation', '90 0 0');
      body.setAttribute('position', '0 0 -0.035');
      body.setAttribute('material', 'color: #173f48; roughness: 0.38; metalness: 0.35');
      marker.appendChild(body);

      /* Keep hover subtle and attached to the base. */
      marker.addEventListener('mouseenter', () => marker.setAttribute('scale', '1.08 1.08 1.08'));
      marker.addEventListener('mouseleave', () => marker.setAttribute('scale', '1 1 1'));
    });
    return true;
  }

  document.addEventListener('DOMContentLoaded', () => {
    repairTree(document);
    makeSideDisplayTransparent();
    arrangeJewellery();

    document.querySelectorAll('.jewellery').forEach((el) => {
      el.addEventListener('model-error', () => {
        const current = el.getAttribute('gltf-model') || '';
        const deferred = el.getAttribute('deferred-gltf');
        const raw = typeof deferred === 'string' ? deferred : deferred?.src || '';
        const local = localSource(current || raw);
        if (local) el.setAttribute('gltf-model', local);
      });
    });

    const scene = document.getElementById('museum-scene');
    const applyAfterScene = () => {
      arrangeJewellery();
      makeSideDisplayTransparent();
      /* script.js adds hotspots in its own scene-loaded handler. Run after it. */
      requestAnimationFrame(() => {
        if (!rebuildStandButtons()) {
          window.setTimeout(rebuildStandButtons, 120);
        }
      });
    };

    if (scene?.hasLoaded) applyAfterScene();
    else scene?.addEventListener('loaded', applyAfterScene, { once: true });

    window.setTimeout(() => observer.disconnect(), 8000);
  }, { once: true });
})();
