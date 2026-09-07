/* NASCERE V2 hotfix: correct camera-relative movement and prefer local jewellery assets. */
(() => {
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

      /* Use the actual THREE camera, not the A-Frame entity Group.
         Object3D.getWorldDirection() on the Group points along +Z, which
         made W/S and A/D feel reversed. */
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

  /* Watch the parser so the swap happens as each A-Frame entity is created. */
  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(repairTree));
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', () => {
    repairTree(document);

    /* If a jewellery model ever errors, keep a visible fallback in its place. */
    document.querySelectorAll('.jewellery').forEach((el) => {
      el.addEventListener('model-error', () => {
        const current = el.getAttribute('gltf-model') || '';
        if (current && current.startsWith('./assets/')) return;
        const deferred = el.getAttribute('deferred-gltf');
        const raw = typeof deferred === 'string' ? deferred : deferred?.src || '';
        const local = localSource(current || raw);
        if (local) el.setAttribute('gltf-model', local);
      });
    });

    window.setTimeout(() => observer.disconnect(), 8000);
  }, { once: true });
})();
