(() => {
  const frame = document.getElementById('museum-frame');
  const loading = document.getElementById('loading-screen');
  const loadingStatus = document.getElementById('loading-status');
  const panel = document.getElementById('exhibit-panel');
  const panelIndex = document.getElementById('panel-index');
  const panelCategory = document.getElementById('panel-category');
  const panelEyebrow = document.getElementById('panel-eyebrow');
  const panelTitle = document.getElementById('panel-title');
  const panelLead = document.getElementById('panel-lead');
  const panelBody = document.getElementById('panel-body');
  const panelProgress = document.getElementById('panel-progress');
  const introCard = document.getElementById('intro-card');
  const exhibitHint = document.getElementById('exhibit-hint');
  const soundToggle = document.getElementById('sound-toggle');
  const resetButton = document.getElementById('reset-view');
  const brandButton = document.getElementById('brand-button');
  const closeButton = document.querySelector('.panel-close');

  let museumWindow = null;
  let museumDocument = null;
  let scene = null;
  let currentLanguage = 'es';
  let soundOn = false;
  let introTimer = null;

  const UI = {
    es: {
      museum: 'MUSEO VIRTUAL', sound: 'SONIDO', reset: 'INICIO',
      intro: 'Recorre el espacio y selecciona los puntos de la exposición para descubrir el proyecto.',
      move: 'Mover', look: 'Mirar', selectPoint: 'Selecciona un punto', explore: 'EXPLORA LA EXPOSICIÓN'
    },
    en: {
      museum: 'VIRTUAL MUSEUM', sound: 'SOUND', reset: 'START',
      intro: 'Move through the space and select the exhibition points to discover the project.',
      move: 'Move', look: 'Look', selectPoint: 'Select a point', explore: 'EXPLORE THE EXHIBITION'
    }
  };

  const EXHIBITS = {
    project: {
      index: '01',
      es: {
        category: 'NASCERE', eyebrow: 'PROYECTO', title: 'Diseñar a partir del residuo',
        lead: 'Nascere combina diseño de joyería, reutilización material y exposición digital en un mismo proyecto.',
        body: [
          'La propuesta parte del poliestireno expandido (EPS) como residuo y lo transforma en materia para crear piezas de joyería. El objetivo es dar valor a un material de uso cotidiano que suele resultar difícil de gestionar una vez desechado.',
          'El museo virtual permite mostrar las piezas y explicar el proceso sin depender de una exposición física. La visita se convierte así en una parte del propio proyecto: no solo enseña el resultado, también hace visible la relación entre material, diseño y sostenibilidad.'
        ]
      },
      en: {
        category: 'NASCERE', eyebrow: 'PROJECT', title: 'Designing from waste',
        lead: 'Nascere brings jewellery design, material reuse and digital exhibition together in one project.',
        body: [
          'The project starts with expanded polystyrene (EPS) as waste and transforms it into material for jewellery pieces. Its aim is to give new value to an everyday material that is often difficult to manage once discarded.',
          'The virtual museum presents the pieces and explains the process without relying on a physical exhibition. The visit therefore becomes part of the project itself: it shows not only the final objects, but also the relationship between material, design and sustainability.'
        ]
      }
    },
    material: {
      index: '02',
      es: {
        category: 'MATERIAL', eyebrow: 'POLIESTIRENO EXPANDIDO', title: 'Un residuo ligero, un problema real',
        lead: 'El EPS contiene una gran proporción de aire. Esa ligereza es útil durante su vida como embalaje, pero complica su recuperación posterior.',
        body: [
          'El poliestireno expandido es habitual en envases y embalajes. Su baja densidad implica transportar mucho volumen para recuperar relativamente poca materia, lo que puede hacer poco eficiente su reciclaje convencional.',
          'Nascere investiga una transformación a pequeña escala y próxima al lugar donde se genera el residuo. En vez de entender el EPS únicamente como desecho, el proyecto lo utiliza como punto de partida para desarrollar objetos con un nuevo valor formal y simbólico.'
        ]
      },
      en: {
        category: 'MATERIAL', eyebrow: 'EXPANDED POLYSTYRENE', title: 'Lightweight waste, a real problem',
        lead: 'EPS contains a very high proportion of air. That lightness is useful as packaging, but makes its recovery more difficult afterwards.',
        body: [
          'Expanded polystyrene is common in packaging. Its low density means transporting a large volume to recover a comparatively small amount of material, which can make conventional recycling inefficient.',
          'Nascere explores small-scale transformation close to where the waste is generated. Rather than treating EPS only as refuse, the project uses it as a starting point for objects with new formal and symbolic value.'
        ]
      }
    },
    circular: {
      index: '03',
      es: {
        category: 'SISTEMA', eyebrow: 'ECONOMÍA CIRCULAR', title: 'Mantener el material en uso',
        lead: 'La lógica circular cambia la pregunta: no qué hacer con el residuo al final, sino cómo volver a introducirlo en un ciclo de uso.',
        body: [
          'Procesar el material localmente permite reducir desplazamientos y explorar usos que no dependen de grandes volúmenes industriales. El residuo se convierte en un recurso disponible para experimentar desde el diseño.',
          'En este contexto, la joyería funciona como un campo de prueba especialmente interesante: trabaja con poca cantidad de materia, admite procesos experimentales y permite comunicar el origen del material a través del propio objeto.'
        ]
      },
      en: {
        category: 'SYSTEM', eyebrow: 'CIRCULAR ECONOMY', title: 'Keeping material in use',
        lead: 'Circular thinking changes the question: not simply what to do with waste at the end, but how to introduce it into another cycle of use.',
        body: [
          'Processing material locally can reduce transport and open up uses that do not depend on industrial-scale volumes. Waste becomes a resource available for design experimentation.',
          'Jewellery is a particularly useful testing ground in this context: it uses small amounts of material, allows experimental processes and can communicate the origin of that material through the object itself.'
        ]
      }
    },
    ocean: {
      index: '04',
      es: {
        category: 'COLECCIÓN', eyebrow: 'INSPIRACIÓN MARINA', title: 'El océano como forma y mensaje',
        lead: 'Corales, conchas y estructuras orgánicas conectan la forma de las piezas con el destino ambiental de muchos residuos plásticos.',
        body: [
          'La colección utiliza referencias marinas para construir una narrativa visual alrededor del material. Las formas no funcionan solo como decoración: sitúan las piezas dentro de una reflexión sobre contaminación, transformación y cuidado de los ecosistemas.',
          'Esta relación también orienta la atmósfera del museo. Luz, color, sonido y movimiento buscan que la exposición digital tenga una identidad propia y que el visitante entienda las joyas como parte de un relato más amplio.'
        ]
      },
      en: {
        category: 'COLLECTION', eyebrow: 'MARINE INSPIRATION', title: 'The ocean as form and message',
        lead: 'Corals, shells and organic structures connect the pieces with the environmental destination of many plastic wastes.',
        body: [
          'The collection uses marine references to build a visual narrative around the material. The forms are not merely decorative: they place the pieces within a reflection on pollution, transformation and the care of ecosystems.',
          'This relationship also shapes the atmosphere of the museum. Light, colour, sound and movement give the digital exhibition its own identity and connect each jewel to a wider story.'
        ]
      }
    }
  };

  const HOTSPOTS = [
    { key: 'project', number: '01', position: '1.58 1.30 1.72' },
    { key: 'material', number: '02', position: '1.58 1.30 -2.25' },
    { key: 'circular', number: '03', position: '-1.58 1.30 1.72' },
    { key: 'ocean', number: '04', position: '-1.58 1.30 -2.25' }
  ];

  function setLanguage(lang) {
    if (!UI[lang]) return;
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.language === lang ? 'true' : 'false');
    });
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      if (UI[lang][key]) node.textContent = UI[lang][key];
    });
    if (panel.classList.contains('is-open') && panel.dataset.exhibit) {
      fillPanel(panel.dataset.exhibit);
    }
  }

  function fillPanel(key) {
    const exhibit = EXHIBITS[key];
    if (!exhibit) return;
    const text = exhibit[currentLanguage];
    panel.dataset.exhibit = key;
    panelIndex.textContent = exhibit.index;
    panelCategory.textContent = text.category;
    panelEyebrow.textContent = text.eyebrow;
    panelTitle.textContent = text.title;
    panelLead.textContent = text.lead;
    panelBody.innerHTML = text.body.map((p) => `<p>${p}</p>`).join('');
    panelProgress.textContent = `${exhibit.index} / 04`;
  }

  function openPanel(key) {
    fillPanel(key);
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    hideIntro();
  }

  function closePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  function hideIntro() {
    if (introTimer) clearTimeout(introTimer);
    introCard.classList.add('is-hidden');
    window.setTimeout(() => { introCard.style.pointerEvents = 'none'; }, 500);
  }

  function injectLegacyStyles(doc) {
    const style = doc.createElement('style');
    style.textContent = `
      html,body { background:#102f39 !important; }
      canvas { cursor: grab; }
      canvas:active { cursor: grabbing; }
      .a-enter-vr-button {
        right:18px !important; bottom:18px !important;
        width:42px !important; height:42px !important;
        border-radius:50% !important;
        border:1px solid rgba(232,251,251,.28) !important;
        background-color:rgba(8,34,42,.62) !important;
        backdrop-filter:blur(8px);
      }
    `;
    doc.head.appendChild(style);
  }

  function createEntity(tag, attrs = {}) {
    const el = museumDocument.createElement(tag);
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
    return el;
  }

  function tuneAtmosphere() {
    scene.setAttribute('renderer', 'colorManagement: true; antialias: true; sortObjects: true');
    scene.setAttribute('fog', 'type: linear; color: #9bbbc2; near: 8; far: 24');

    const main = museumDocument.querySelector('#animated-light');
    const right = museumDocument.querySelector('#animated-light-right');
    const left = museumDocument.querySelector('#animated-light-left');
    if (main) main.setAttribute('light', 'type: point; intensity: 0.72; color: #e7ffff; castShadow: true');
    if (right) right.setAttribute('light', 'type: point; intensity: 0.28; color: #55b8c4; castShadow: true');
    if (left) left.setAttribute('light', 'type: point; intensity: 0.30; color: #4a9eaa; castShadow: true');

    const ambient = createEntity('a-entity', {
      light: 'type: hemisphere; color: #f1ffff; groundColor: #163d47; intensity: 0.42'
    });
    scene.appendChild(ambient);

    const fill = createEntity('a-entity', {
      position: '-2 3.6 -1',
      light: 'type: directional; color: #c8f6f7; intensity: 0.22'
    });
    scene.appendChild(fill);

    const floor = museumDocument.querySelector('a-box[height="0.1"][width="40"]');
    if (floor) floor.setAttribute('material', 'repeat: 18 18; color: #d4e6e7; roughness: 0.88');
    const ceiling = museumDocument.querySelector('a-box[height="0.2"][width="40"]');
    if (ceiling) ceiling.setAttribute('material', 'repeat: 10 10; color: #dcebed; roughness: 0.95');

    const cylinders = [...museumDocument.querySelectorAll('a-entity[geometry*="segmentsRadial: 6"]')];
    cylinders.forEach((el, index) => {
      if (index < 4) {
        el.setAttribute('material', 'color: #254f57; roughness: 0.48; metalness: 0.14');
      } else if (index < 8) {
        el.setAttribute('material', 'color: #dffcff; opacity: 0.16; transparent: true; roughness: 0.08; metalness: 0.02; side: double');
      }
    });

    ['-2 0.055 -2', '2 0.055 -2', '-2 0.055 2', '2 0.055 2'].forEach((position) => {
      const ring = createEntity('a-ring', {
        position,
        rotation: '-90 0 0',
        'radius-inner': '0.53',
        'radius-outer': '0.555',
        material: 'color: #75d8de; shader: flat; opacity: 0.42; transparent: true'
      });
      scene.appendChild(ring);
    });
  }

  function removeOldButtons() {
    ['cursor-listener-button1', 'cursor-listener-button2', 'cursor-listener-button3', 'cursor-listener-button4']
      .forEach((attribute) => {
        museumDocument.querySelectorAll(`[${attribute}]`).forEach((el) => {
          el.setAttribute('visible', 'false');
          [...el.children].forEach((child) => child.setAttribute('visible', 'false'));
        });
      });
  }

  function addHotspots() {
    let camera = museumDocument.querySelector('#camera') || museumDocument.querySelector('[camera]');
    if (camera && !camera.id) camera.id = 'camera';

    HOTSPOTS.forEach(({ key, number, position }) => {
      const marker = createEntity('a-circle', {
        class: 'nascere-hotspot',
        position,
        radius: '0.105',
        'look-at': '#camera',
        material: 'color: #e9ffff; shader: flat; opacity: 0.94; transparent: true; side: double',
        animation__appear: 'property: scale; from: 0.01 0.01 0.01; to: 1 1 1; dur: 650; easing: easeOutBack'
      });
      marker.dataset.exhibit = key;

      const ring = createEntity('a-ring', {
        position: '0 0 0.003',
        'radius-inner': '0.125',
        'radius-outer': '0.135',
        material: 'color: #75d8de; shader: flat; opacity: 0.72; transparent: true; side: double',
        animation: 'property: material.opacity; from: 0.25; to: 0.85; dur: 1400; dir: alternate; loop: true; easing: easeInOutSine'
      });
      const text = createEntity('a-text', {
        value: number,
        align: 'center',
        color: '#123b43',
        width: '0.48',
        position: '0 -0.018 0.006',
        material: 'shader: flat'
      });
      marker.appendChild(ring);
      marker.appendChild(text);

      marker.addEventListener('mouseenter', () => {
        marker.setAttribute('scale', '1.16 1.16 1.16');
        exhibitHint.classList.add('is-visible');
      });
      marker.addEventListener('mouseleave', () => {
        marker.setAttribute('scale', '1 1 1');
        exhibitHint.classList.remove('is-visible');
      });
      marker.addEventListener('click', () => openPanel(key));
      scene.appendChild(marker);
    });

    const mouseCursor = createEntity('a-entity', {
      cursor: 'rayOrigin: mouse; fuse: false',
      raycaster: 'objects: .nascere-hotspot; far: 30'
    });
    scene.appendChild(mouseCursor);
  }

  function tuneJewelleryMotion() {
    const models = [...museumDocument.querySelectorAll('[gltf-model]')].filter((el) => {
      const model = el.getAttribute('gltf-model') || '';
      return /ringCoral|earringCoral/i.test(model);
    });
    models.forEach((el, index) => {
      if (!el.getAttribute('animation')) {
        el.setAttribute('animation', `property: rotation; to: 0 ${360 + (index % 2) * 15} 0; dur: ${18000 + index * 900}; loop: true; easing: linear`);
      }
    });
  }

  function setupMuseum() {
    if (!frame.contentWindow || !frame.contentDocument) return;
    museumWindow = frame.contentWindow;
    museumDocument = frame.contentDocument;
    scene = museumDocument.querySelector('a-scene');
    if (!scene) return;

    const onReady = () => {
      try {
        injectLegacyStyles(museumDocument);
        tuneAtmosphere();
        removeOldButtons();
        addHotspots();
        tuneJewelleryMotion();
        loadingStatus.textContent = currentLanguage === 'es' ? 'Exposición lista' : 'Exhibition ready';
        window.setTimeout(() => loading.classList.add('is-hidden'), 350);
        introTimer = window.setTimeout(hideIntro, 9000);
      } catch (error) {
        console.error('Nascere V2 setup error:', error);
        loading.classList.add('is-hidden');
      }
    };

    if (scene.hasLoaded) onReady();
    else scene.addEventListener('loaded', onReady, { once: true });
  }

  function toggleSound() {
    if (!museumDocument) return;
    const sound = museumDocument.querySelector('#seaSound');
    if (!sound || !sound.components || !sound.components.sound) return;
    soundOn = !soundOn;
    if (soundOn) sound.components.sound.playSound();
    else sound.components.sound.pauseSound();
    soundToggle.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
  }

  function resetView() {
    if (!museumDocument) return;
    const rig = museumDocument.querySelector('#rig');
    const camera = museumDocument.querySelector('#camera') || museumDocument.querySelector('[camera]');
    if (rig) {
      rig.setAttribute('position', '-5 0 0');
      rig.setAttribute('rotation', '0 -90 0');
    }
    const look = camera && camera.components ? camera.components['look-controls'] : null;
    if (look) {
      if (look.pitchObject) look.pitchObject.rotation.x = 0;
      if (look.yawObject) look.yawObject.rotation.y = 0;
    }
    closePanel();
  }

  function setupJoystick() {
    const base = document.getElementById('joystick-base');
    const nub = document.getElementById('joystick-nub');
    if (!base || !nub) return;
    const state = { active: false, x: 0, y: 0, pointerId: null };

    function updateFromEvent(event) {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const max = rect.width * 0.33;
      let dx = event.clientX - cx;
      let dy = event.clientY - cy;
      const length = Math.hypot(dx, dy);
      if (length > max) { dx = dx / length * max; dy = dy / length * max; }
      state.x = dx / max;
      state.y = dy / max;
      nub.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    base.addEventListener('pointerdown', (event) => {
      state.active = true;
      state.pointerId = event.pointerId;
      base.setPointerCapture(event.pointerId);
      updateFromEvent(event);
      hideIntro();
    });
    base.addEventListener('pointermove', (event) => {
      if (state.active && event.pointerId === state.pointerId) updateFromEvent(event);
    });
    const stop = (event) => {
      if (state.pointerId !== null && event.pointerId !== state.pointerId) return;
      state.active = false; state.x = 0; state.y = 0; state.pointerId = null;
      nub.style.transform = 'translate(0,0)';
    };
    base.addEventListener('pointerup', stop);
    base.addEventListener('pointercancel', stop);

    let previous = performance.now();
    function moveLoop(now) {
      const dt = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      if (state.active && museumDocument && museumWindow) {
        const rig = museumDocument.querySelector('#rig');
        const camera = museumDocument.querySelector('#camera') || museumDocument.querySelector('[camera]');
        if (rig && camera && museumWindow.THREE) {
          const THREE = museumWindow.THREE;
          const forward = new THREE.Vector3();
          camera.object3D.getWorldDirection(forward);
          forward.y = 0;
          if (forward.lengthSq() > 0) forward.normalize();
          const right = new THREE.Vector3(-forward.z, 0, forward.x);
          const move = new THREE.Vector3()
            .addScaledVector(right, state.x)
            .addScaledVector(forward, -state.y);
          if (move.lengthSq() > 1) move.normalize();
          move.multiplyScalar(1.35 * dt);
          rig.object3D.position.add(move);
        }
      }
      requestAnimationFrame(moveLoop);
    }
    requestAnimationFrame(moveLoop);
  }

  frame.addEventListener('load', setupMuseum);
  soundToggle.addEventListener('click', toggleSound);
  resetButton.addEventListener('click', resetView);
  brandButton.addEventListener('click', () => openPanel('project'));
  closeButton.addEventListener('click', closePanel);
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('#exhibit-panel') && !event.target.closest('.topbar')) hideIntro();
  }, { once: true });

  setupJoystick();
  setLanguage('es');

  window.setTimeout(() => {
    if (!loading.classList.contains('is-hidden')) {
      loadingStatus.textContent = currentLanguage === 'es' ? 'El museo está tardando un poco más…' : 'The museum is taking a little longer…';
    }
  }, 10000);
})();
