/* NASCERE V2 — preserve the original museum layout and modernise interaction only. */
(() => {
  /* ---------------------------------------------------------------
     1. CAMERA-RELATIVE MOVEMENT
     --------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------
     2. ORIGINAL NASCERE JEWELLERY LAYOUT
     These are the exact models/transforms used by the original museum.
     They deliberately do NOT sit on the stand axis because several GLBs
     have off-centre internal origins.
     --------------------------------------------------------------- */
  const CDN = 'https://cdn.glitch.global/875c914b-5bf9-4bd8-8d5b-92c7da9612b5/';
  const ORIGINAL_JEWELLERY = [
    {
      src: `${CDN}pendiente_coral_nascere1.glb?v=1726913537738`,
      position: '0.7 1.33 -1.7', scale: '0.008 0.008 0.008', rotation: '0 0 0',
      animation: 'property: rotation; to: 20 20 20; loop: true; dur: 5000; dir: alternate; easing: linear'
    },
    {
      src: `${CDN}pendiente_coral_nascere2.glb?v=1726913544885`,
      position: '-1.5 1.5 -0.85', scale: '0.006 0.006 0.006', rotation: '0 0 0',
      animation: 'property: rotation; to: 10 10 10; loop: true; dir: alternate; dur: 5000; easing: linear'
    },
    {
      src: `${CDN}anillo_coral_nascere1.glb?v=1726913476758`,
      position: '-2 1.5 2.5', scale: '0.01 0.01 0.01', rotation: '20 20 20',
      animation: 'property: rotation; to: 0 0 360; loop: true; dir: alternate; dur: 15000; easing: linear'
    },
    {
      src: `${CDN}anillo_coral_nascere2.glb?v=1726913672249`,
      position: '2 1.5 2.25', scale: '0.01 0.01 0.01', rotation: '90 90 90',
      animation: 'property: rotation; to: 0 0 360; loop: true; dir: alternate; dur: 15000; easing: linear'
    },
    {
      src: `${CDN}pendiente_coral_nascere3.glb?v=1726913555722`,
      position: '4.75 1.23 -0.5', scale: '0.006 0.006 0.006', rotation: '0 90 0'
    },
    {
      src: `${CDN}pendiente_coral_nascere4.glb?v=1726913561175`,
      position: '5.36 1.2 -4', scale: '0.0045 0.0045 0.0045', rotation: '0 90 0'
    },
    {
      src: `${CDN}anillo_coral_nascere3.glb?v=1726913508106`,
      position: '3.65 1.2 -0.5', scale: '0.007 0.007 0.007', rotation: '0 90 0'
    },
    {
      src: `${CDN}anillo_coral_nascere4.glb?v=1726913519350`,
      position: '3.42 1.2 -2.5', scale: '0.007 0.007 0.007', rotation: '0 90 0'
    }
  ];

  function restoreOriginalJewellery() {
    const jewellery = [...document.querySelectorAll('.jewellery')];
    ORIGINAL_JEWELLERY.forEach((layout, index) => {
      const el = jewellery[index];
      if (!el) return;
      el.removeAttribute('deferred-gltf');
      el.setAttribute('gltf-model', layout.src);
      el.setAttribute('position', layout.position);
      el.setAttribute('scale', layout.scale);
      el.setAttribute('rotation', layout.rotation);
      if (layout.animation) el.setAttribute('animation', layout.animation);
      else el.removeAttribute('animation');
    });
  }

  function restoreOriginalSideDisplay() {
    /* The long dark plinth stays exactly as in the original museum. */
    const plinth = [...document.querySelectorAll('a-box.wall')].find((el) => {
      const p = el.getAttribute('position');
      return p && Math.abs(p.x - 4) < 0.01 && Math.abs(p.y - 0.5) < 0.01 && Math.abs(p.z) < 0.01;
    });
    if (plinth) {
      plinth.setAttribute('position', '4 0.5 0');
      plinth.setAttribute('width', '0.5');
      plinth.setAttribute('height', '1');
      plinth.setAttribute('depth', '10');
      plinth.setAttribute('src', 'https://raw.githubusercontent.com/oluisjuan/LongCovid-Pilot/6cb8541bd70d241880310ad02f84dee1ab6ba867/material/darktexture.jpg');
      plinth.setAttribute('material', 'repeat: 10 1');
    }

    /* Use the actual original display-case GLB rather than rebuilding it. */
    const display = [...document.querySelectorAll('[deferred-gltf], [gltf-model]')].find((el) => {
      const a = String(el.getAttribute('gltf-model') || '');
      const b = String(el.getAttribute('deferred-gltf') || '');
      return a.includes('display_case_maya.glb') || b.includes('display_case_maya.glb');
    });
    if (display) {
      display.removeAttribute('deferred-gltf');
      display.setAttribute('gltf-model', './assets/display_case_maya.glb');
      display.setAttribute('scale', '6 6 50');
      display.setAttribute('position', '4 0.8 -2.3');
      display.setAttribute('rotation', '0 0 0');
    }

    document.querySelectorAll('[id^="side-glass-shelf-"]').forEach((el) => el.remove());
  }

  /* ---------------------------------------------------------------
     3. CRISP PHYSICAL BUTTONS — NO SQUARE TEXTURE
     All four face the entrance in the same direction.
     --------------------------------------------------------------- */
  const STANDS = [
    { key: 'project',  number: '01', x:  2, z:  2 },
    { key: 'material', number: '02', x:  2, z: -2 },
    { key: 'circular', number: '03', x: -2, z:  2 },
    { key: 'ocean',    number: '04', x: -2, z: -2 }
  ];

  function rebuildStandButtons() {
    const markers = [...document.querySelectorAll('.nascere-hotspot')]
      .filter((el) => !el.classList.contains('nascere-stand-hitbox'))
      .slice(0, 4);
    if (markers.length < 4) return false;

    markers.forEach((marker, index) => {
      const stand = STANDS[index];
      marker.removeAttribute('face-camera');
      marker.removeAttribute('animation__appear');
      marker.setAttribute('position', `${stand.x - 0.54} 0.72 ${stand.z}`);
      marker.setAttribute('rotation', '0 -90 0');
      marker.setAttribute('radius', '0.17');
      marker.setAttribute('scale', '1 1 1');
      marker.setAttribute('material', 'color: #ffffff; opacity: 0.001; transparent: true; depthWrite: false; side: double');

      while (marker.firstChild) marker.removeChild(marker.firstChild);

      const body = document.createElement('a-cylinder');
      body.setAttribute('radius', '0.145');
      body.setAttribute('height', '0.055');
      body.setAttribute('rotation', '90 0 0');
      body.setAttribute('position', '0 0 0.018');
      body.setAttribute('material', 'color: #163b44; roughness: 0.34; metalness: 0.28');
      marker.appendChild(body);

      const face = document.createElement('a-circle');
      face.setAttribute('radius', '0.122');
      face.setAttribute('position', '0 0 0.051');
      face.setAttribute('material', 'color: #8de3e6; shader: flat; side: double');
      marker.appendChild(face);

      const ring = document.createElement('a-ring');
      ring.setAttribute('radius-inner', '0.123');
      ring.setAttribute('radius-outer', '0.137');
      ring.setAttribute('position', '0 0 0.053');
      ring.setAttribute('material', 'color: #eaffff; shader: flat; side: double');
      marker.appendChild(ring);

      const label = document.createElement('a-text');
      label.setAttribute('value', stand.number);
      label.setAttribute('align', 'center');
      label.setAttribute('anchor', 'center');
      label.setAttribute('baseline', 'center');
      label.setAttribute('width', '0.48');
      label.setAttribute('color', '#0a3038');
      label.setAttribute('position', '0 -0.012 0.057');
      label.setAttribute('material', 'shader: flat; side: double');
      marker.appendChild(label);
    });
    return true;
  }

  /* ---------------------------------------------------------------
     4. WHOLE STAND CLICKABLE + SUBTLE HOVER FEEDBACK
     --------------------------------------------------------------- */
  const baseScales = new WeakMap();
  const podiumColours = new WeakMap();

  function findAt(selector, x, y, z, tolerance = 0.08) {
    return [...document.querySelectorAll(selector)].find((el) => {
      const p = el.getAttribute('position');
      return p && Math.abs(p.x - x) < tolerance && Math.abs(p.y - y) < tolerance && Math.abs(p.z - z) < tolerance;
    });
  }

  function scaleElement(el, factor) {
    if (!el?.object3D) return;
    if (!baseScales.has(el)) baseScales.set(el, el.object3D.scale.clone());
    const base = baseScales.get(el);
    el.object3D.scale.copy(base).multiplyScalar(factor);
  }

  function tintPodium(el, hover) {
    const mesh = el?.getObject3D('mesh');
    if (!mesh) return;
    mesh.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach((mat) => {
        if (!mat.color) return;
        if (!podiumColours.has(mat)) podiumColours.set(mat, mat.color.clone());
        const original = podiumColours.get(mat);
        if (hover) mat.color.copy(original).lerp(new THREE.Color('#ffffff'), 0.20);
        else mat.color.copy(original);
        mat.needsUpdate = true;
      });
    });
  }

  function setStandHover(index, hover) {
    const s = STANDS[index];
    const base = findAt('[geometry*="primitive: cylinder"]', s.x, 0.5, s.z);
    const glass = findAt('[geometry*="primitive: cylinder"]', s.x, 1.25, s.z);
    const podium = findAt('[gltf-model*="display_podium.glb"]', s.x, 0.95, s.z, 0.12);

    [base, glass, podium].forEach((el) => scaleElement(el, hover ? 1.035 : 1));
    if (base) base.setAttribute('material', 'color', hover ? '#587d83' : '#254f57');
    if (glass) {
      glass.setAttribute('material', 'color', hover ? '#ffffff' : '#dffcff');
      glass.setAttribute('material', 'opacity', hover ? 0.25 : 0.16);
    }
    tintPodium(podium, hover);
  }

  function makeWholeStandsClickable() {
    const scene = document.getElementById('museum-scene');
    const markers = [...document.querySelectorAll('.nascere-hotspot')]
      .filter((el) => !el.classList.contains('nascere-stand-hitbox'))
      .slice(0, 4);
    if (!scene || markers.length < 4) return false;

    document.querySelectorAll('.nascere-stand-hitbox').forEach((el) => el.remove());

    STANDS.forEach((stand, index) => {
      const hitbox = document.createElement('a-cylinder');
      hitbox.classList.add('nascere-hotspot', 'nascere-stand-hitbox');
      hitbox.setAttribute('position', `${stand.x} 1.35 ${stand.z}`);
      hitbox.setAttribute('radius', '0.62');
      hitbox.setAttribute('height', '2.7');
      hitbox.setAttribute('material', 'color: #ffffff; opacity: 0.001; transparent: true; depthWrite: false');
      hitbox.dataset.exhibit = stand.key;

      hitbox.addEventListener('mouseenter', () => {
        setStandHover(index, true);
        markers[index].setAttribute('scale', '1.07 1.07 1.07');
        const canvas = scene.canvas;
        if (canvas) canvas.style.cursor = 'pointer';
      });
      hitbox.addEventListener('mouseleave', () => {
        setStandHover(index, false);
        markers[index].setAttribute('scale', '1 1 1');
        const canvas = scene.canvas;
        if (canvas) canvas.style.cursor = 'grab';
      });
      hitbox.addEventListener('click', () => markers[index].emit('click', {}, false));
      scene.appendChild(hitbox);
    });
    return true;
  }

  function applyOriginalLayout() {
    restoreOriginalJewellery();
    restoreOriginalSideDisplay();
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyOriginalLayout();

    const scene = document.getElementById('museum-scene');
    const afterScene = () => {
      applyOriginalLayout();
      requestAnimationFrame(() => {
        rebuildStandButtons();
        makeWholeStandsClickable();
      });
      /* Re-apply after GLBs resolve so delayed model setup cannot move them. */
      window.setTimeout(applyOriginalLayout, 500);
      window.setTimeout(applyOriginalLayout, 1600);
    };

    if (scene?.hasLoaded) afterScene();
    else scene?.addEventListener('loaded', afterScene, { once: true });
  }, { once: true });
})();
