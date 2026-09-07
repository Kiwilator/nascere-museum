/* NASCERE V2 — jewellery motion only. Micro-labels remain static. */
(() => {
  function applyJewelleryMotion() {
    const jewellery = [...document.querySelectorAll('.jewellery')].slice(0, 8);

    jewellery.forEach((el, index) => {
      const rotation = el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
      const direction = index % 2 === 0 ? 360 : -360;
      const duration = 14000 + (index % 4) * 1800 + (index >= 4 ? 2500 : 0);

      /* Keep the existing vertical float, but replace the small rocking motion
         with a complete, slow rotation around the vertical axis. */
      el.removeAttribute('animation__turn');
      el.setAttribute(
        'animation__turn',
        `property: rotation; from: ${rotation.x} ${rotation.y} ${rotation.z}; to: ${rotation.x} ${rotation.y + direction} ${rotation.z}; loop: true; dur: ${duration}; easing: linear`
      );
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const scene = document.getElementById('museum-scene');
    const afterScene = () => {
      /* visual-fix-v2 reapplies jewellery placement at ~1200 ms. Run after it. */
      window.setTimeout(applyJewelleryMotion, 1450);
      window.setTimeout(applyJewelleryMotion, 2350);
    };

    if (scene?.hasLoaded) afterScene();
    else scene?.addEventListener('loaded', afterScene, { once: true });
  }, { once: true });
})();
