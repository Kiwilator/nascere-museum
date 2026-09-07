/* NASCERE V2 — jewellery motion only. Rotate each jewel around its own visual centre. */
(() => {
  const activeSpins = new WeakSet();

  /* Load the label correction after the existing interaction pass, without
     touching the main scene structure. */
  if (!document.querySelector('script[data-nascere-label-fix]')) {
    const labelScript = document.createElement('script');
    labelScript.src = './label-fix-v2.js?v=1';
    labelScript.dataset.nascereLabelFix = 'true';
    document.head.appendChild(labelScript);
  }

  function buildSelfSpinPivot(el, index) {
    const mesh = el?.getObject3D('mesh');
    if (!mesh || activeSpins.has(el)) return;

    /* Keep the vertical float created by visual-fix-v2, but remove any A-Frame
       rotation animation on the entity itself. Rotating the entity is wrong for
       these GLBs because several have an off-centre internal pivot and therefore
       orbit around the stand instead of spinning in place. */
    el.removeAttribute('animation__turn');
    el.object3D.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(mesh);
    if (box.isEmpty()) return;

    const worldCenter = box.getCenter(new THREE.Vector3());
    const localCenter = el.object3D.worldToLocal(worldCenter.clone());

    const pivot = new THREE.Group();
    pivot.name = 'nascere-self-spin-pivot';
    pivot.position.copy(localCenter);
    el.object3D.add(pivot);

    /* Reparent while preserving the current world transform. From this point on,
       pivot.rotation.y turns the piece around its own visible centre. */
    pivot.attach(mesh);
    pivot.updateMatrixWorld(true);

    const direction = index % 2 === 0 ? 1 : -1;
    const duration = 15000 + (index % 4) * 1800 + (index >= 4 ? 2200 : 0);
    const radiansPerMs = direction * (Math.PI * 2) / duration;
    let last = performance.now();
    activeSpins.add(el);

    function frame(now) {
      if (!el.isConnected || !pivot.parent) return;
      const dt = Math.min(now - last, 50);
      last = now;
      pivot.rotation.y += radiansPerMs * dt;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function applyJewelleryMotion() {
    [...document.querySelectorAll('.jewellery')].slice(0, 8).forEach((el, index) => {
      const run = () => requestAnimationFrame(() => buildSelfSpinPivot(el, index));
      if (el.getObject3D('mesh')) run();
      else el.addEventListener('model-loaded', run, { once: true });
    });
  }

  function start() {
    const scene = document.getElementById('museum-scene');
    const afterScene = () => {
      /* visual-fix-v2 places the pieces first; build the local spin pivots after. */
      window.setTimeout(applyJewelleryMotion, 1500);
      window.setTimeout(applyJewelleryMotion, 2450);
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
