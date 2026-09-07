/* NASCERE V2 — final visual correction for glass, jewellery and stand labels. */
(() => {
  const CENTRAL_TARGETS = [
    { target: new THREE.Vector3( 2, 1.55, -2), max: new THREE.Vector3(0.26, 0.31, 0.26), rotation: [0, 15, 0] },
    { target: new THREE.Vector3(-2, 1.55, -2), max: new THREE.Vector3(0.26, 0.31, 0.26), rotation: [0, -15, 0] },
    { target: new THREE.Vector3(-2, 1.52,  2), max: new THREE.Vector3(0.24, 0.24, 0.24), rotation: [20, 20, 20] },
    { target: new THREE.Vector3( 2, 1.52,  2), max: new THREE.Vector3(0.24, 0.24, 0.24), rotation: [90, 20, 90] },
    { target: new THREE.Vector3(4.02, 1.20, -0.55), max: new THREE.Vector3(0.19, 0.21, 0.275), rotation: [0, 90, 0] },
    { target: new THREE.Vector3(4.02, 1.20, -1.70), max: new THREE.Vector3(0.19, 0.21, 0.275), rotation: [0, 90, 0] },
    { target: new THREE.Vector3(4.02, 1.20, -2.85), max: new THREE.Vector3(0.19, 0.19, 0.24), rotation: [0, 90, 0] },
    { target: new THREE.Vector3(4.02, 1.20, -4.00), max: new THREE.Vector3(0.19, 0.19, 0.24), rotation: [0, 90, 0] }
  ];

  function deg(v) { return THREE.MathUtils.degToRad(v); }

  function localBounds(el) {
    const mesh = el?.getObject3D('mesh');
    if (!mesh) return null;

    /* Neutralise the A-Frame entity while measuring the GLB. This makes
       the result independent from the model's odd internal pivot/origin. */
    el.object3D.position.set(0, 0, 0);
    el.object3D.rotation.set(0, 0, 0);
    el.object3D.scale.set(1, 1, 1);
    el.object3D.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(mesh);
    if (box.isEmpty()) return null;
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3())
    };
  }

  function makeJewelleryOpaque(el) {
    const mesh = el?.getObject3D('mesh');
    if (!mesh) return;
    mesh.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.renderOrder = 2;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => {
        if (!mat) return;
        mat.depthTest = true;
        mat.depthWrite = true;
        /* These pieces are visually opaque. Prevent transparent sorting from
           changing their appearance depending on whether glass is in front. */
        if (mat.opacity == null || mat.opacity > 0.96) {
          mat.opacity = 1;
          mat.transparent = false;
        }
        mat.needsUpdate = true;
      });
    });
  }

  function placeJewellery(el, layout, index) {
    if (!el || !layout || !el.getObject3D('mesh')) return;

    el.removeAttribute('animation');
    el.removeAttribute('animation__float');
    el.removeAttribute('animation__turn');

    const measured = localBounds(el);
    if (!measured) return;
    const { center, size } = measured;
    const ratio = (limit, actual) => actual > 1e-7 ? limit / actual : Infinity;
    const scale = Math.min(
      ratio(layout.max.x, size.x),
      ratio(layout.max.y, size.y),
      ratio(layout.max.z, size.z)
    );
    if (!Number.isFinite(scale) || scale <= 0) return;

    el.object3D.scale.setScalar(scale);
    el.object3D.rotation.set(deg(layout.rotation[0]), deg(layout.rotation[1]), deg(layout.rotation[2]));
    el.object3D.updateMatrixWorld(true);

    /* Compensate the model's internal pivot after scale + rotation. */
    const offset = center.clone().multiplyScalar(scale).applyQuaternion(el.object3D.quaternion);
    const p = layout.target.clone().sub(offset);
    el.object3D.position.copy(p);
    el.object3D.updateMatrixWorld(true);

    makeJewelleryOpaque(el);

    const rise = index < 4 ? 0.05 : 0.03;
    const dur = 2700 + (index % 4) * 330;
    const turn = 7800 + (index % 4) * 700;
    el.setAttribute('animation__float',
      `property: position; from: ${p.x} ${p.y} ${p.z}; to: ${p.x} ${p.y + rise} ${p.z}; dir: alternate; loop: true; dur: ${dur}; easing: easeInOutSine`);
    el.setAttribute('animation__turn',
      `property: rotation; from: ${layout.rotation[0]} ${layout.rotation[1]} ${layout.rotation[2]}; to: ${layout.rotation[0]} ${layout.rotation[1] + 8} ${layout.rotation[2]}; dir: alternate; loop: true; dur: ${turn}; easing: easeInOutSine`);
  }

  function fixGlass() {
    const stands = [[-2,-2],[2,-2],[-2,2],[2,2]];
    const cylinders = [...document.querySelectorAll('[geometry*="primitive: cylinder"]')];
    stands.forEach(([x,z]) => {
      const glass = cylinders.find((el) => {
        const p = el.getAttribute('position');
        return p && Math.abs(p.x-x)<0.03 && Math.abs(p.y-1.25)<0.03 && Math.abs(p.z-z)<0.03;
      });
      if (!glass) return;
      glass.setAttribute('material', 'depthWrite', false);
      glass.setAttribute('material', 'depthTest', true);
      const mesh = glass.getObject3D('mesh');
      if (mesh) {
        mesh.renderOrder = 20;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (!mat) return;
          mat.transparent = true;
          mat.depthWrite = false;
          mat.depthTest = true;
          mat.needsUpdate = true;
        });
      }
    });
  }

  function doubleButtonNumbers() {
    document.querySelectorAll('.nascere-hotspot:not(.nascere-stand-hitbox) a-text').forEach((label) => {
      label.setAttribute('width', '1.36');
      label.setAttribute('position', '0 -0.010 0.060');
    });
  }

  function apply() {
    fixGlass();
    const jewellery = [...document.querySelectorAll('.jewellery')].slice(0, 8);
    jewellery.forEach((el, index) => {
      const run = () => placeJewellery(el, CENTRAL_TARGETS[index], index);
      if (el.getObject3D('mesh')) run();
      else el.addEventListener('model-loaded', run, { once: true });
    });
    doubleButtonNumbers();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const scene = document.getElementById('museum-scene');
    const afterScene = () => {
      /* hotfix-v2 creates the buttons on scene-loaded; apply just after it. */
      requestAnimationFrame(apply);
      window.setTimeout(apply, 250);
      window.setTimeout(apply, 1200);
    };
    if (scene?.hasLoaded) afterScene();
    else scene?.addEventListener('loaded', afterScene, { once: true });
  }, { once: true });
})();
