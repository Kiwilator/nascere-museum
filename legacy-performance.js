AFRAME.registerComponent('legacy-movement', {
  schema: { speed: { type: 'number', default: 1.55 } },
  init() {
    this.keys = new Set();
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.move = new THREE.Vector3();
    this.down = (event) => {
      if (/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(event.code)) {
        this.keys.add(event.code);
        event.preventDefault();
      }
    };
    this.up = (event) => this.keys.delete(event.code);
    window.addEventListener('keydown', this.down, { passive: false });
    window.addEventListener('keyup', this.up);
  },
  tick(time, delta) {
    if (!delta || this.keys.size === 0) return;
    const camera = document.getElementById('camera');
    if (!camera) return;
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;
    camera.object3D.getWorldDirection(this.forward);
    this.forward.y = 0;
    if (!this.forward.lengthSq()) return;
    this.forward.normalize();
    this.right.set(-this.forward.z, 0, this.forward.x);
    this.move.set(0, 0, 0)
      .addScaledVector(this.right, x)
      .addScaledVector(this.forward, -y);
    if (this.move.lengthSq() > 1) this.move.normalize();
    this.move.multiplyScalar(this.data.speed * Math.min(delta / 1000, 0.045));
    this.el.object3D.position.add(this.move);
  },
  remove() {
    window.removeEventListener('keydown', this.down);
    window.removeEventListener('keyup', this.up);
  }
});

AFRAME.registerComponent('rig-collider', {
  schema: {
    wallSelector: { type: 'string', default: '.wall' },
    radius: { type: 'number', default: 0.35 }
  },
  init() {
    this.sphere = new THREE.Sphere(new THREE.Vector3(), this.data.radius);
    this.world = new THREE.Vector3();
    this.prev = this.el.object3D.position.clone();
    this.boxes = [];
    const scene = this.el.sceneEl;
    const refresh = () => requestAnimationFrame(() => this.refresh());
    if (scene?.hasLoaded) refresh();
    else scene?.addEventListener('loaded', refresh, { once: true });
  },
  refresh() {
    this.boxes = [...document.querySelectorAll(this.data.wallSelector)].map((wall) => {
      wall.object3D.updateMatrixWorld(true);
      return new THREE.Box3().setFromObject(wall.object3D);
    }).filter((box) => !box.isEmpty());
  },
  tick() {
    if (!this.boxes.length) return;
    this.el.object3D.getWorldPosition(this.world);
    this.sphere.center.copy(this.world);
    for (const box of this.boxes) {
      if (box.intersectsSphere(this.sphere)) {
        this.el.object3D.position.copy(this.prev);
        return;
      }
    }
    this.prev.copy(this.el.object3D.position);
  }
});

AFRAME.registerComponent('deferred-gltf', {
  schema: { src: { type: 'string' }, delay: { type: 'number', default: 1000 } },
  init() {
    const run = () => {
      if (this.el.isConnected && this.data.src) this.el.setAttribute('gltf-model', this.data.src);
    };
    setTimeout(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1200 });
      else run();
    }, this.data.delay);
  }
});

const LEGACY_INFO = {
  1: {
    bg: ['-2 1 0.25', '-90 0 180', '5.5', '3'],
    texts: [
      ['I. Nascere es un proyecto que combina técnicas tradicionales y tecnología digital para crear joyería usando materiales reciclados, como el poliestireno expandido. El objetivo es reutilizar estos residuos plásticos y convertirlos en piezas únicas mediante impresión 3D.', '0.5 1 1', '-90 0 180'],
      ['El museo virtual se ha creado para mostrar estas piezas de forma accesible, sin necesidad de un espacio físico. Así, se reduce el impacto ambiental y se permite a las personas conocer las creaciones y el proceso de reciclaje desde cualquier lugar.', '0.5 1 -0.5', '-90 0 180']
    ]
  },
  2: {
    bg: ['-2 1 -0.1', '-90 0 180', '5.5', '3'],
    texts: [
      ['II. Se ha elegido el poliestireno expandido porque es un material que, a pesar de ser muy común, es difícil de reciclar debido a su alto contenido de aire (alrededor del 98%). Esto hace que su transporte para reciclaje sea costoso y poco eficiente. Sin embargo, al utilizarlo localmente y reciclarlo de manera casera, se puede aprovechar este material para crear nuevas piezas de valor, como joyería. Además, su reutilización ayuda a reducir los residuos plásticos que, de otro modo, terminarían en vertederos o contaminando el medio ambiente.', '0.4 1 0', '-90 0 180']
    ]
  },
  3: {
    bg: ['0.85 1 0.2', '-90 0 180', '5.5', '4'],
    texts: [
      ['III. La economía circular es una mejor opción para el poliestireno expandido porque permite reutilizar este material localmente, evitando los altos costos y el impacto ambiental asociados a su transporte. Dado que el poliestireno expandido es mayormente aire, su reciclaje en grandes distancias no es rentable. Al crear un sistema donde los residuos se recolectan, procesan y reutilizan en la misma zona, se reduce el desperdicio y se aprovecha al máximo un material que, de otra forma, acabaría en vertederos. Este enfoque fomenta un ciclo continuo de uso y reciclaje, reduciendo la necesidad de materias primas nuevas y disminuyendo el impacto ambiental.', '-1.7 1 0', '-90 0 0']
    ]
  },
  4: {
    bg: ['0.8 1 0.6', '-90 0 180', '5.5', '4'],
    texts: [
      ['IV. La inspiración marítima surge porque gran parte del poliestireno expandido que no se recicla acaba en los océanos, contribuyendo a la contaminación y al problema de los microplásticos. Al utilizar este material para crear joyería, se busca simbolizar una forma de ayudar al mar, evitando que más plásticos terminen en sus aguas. Los diseños inspirados en elementos marinos, como conchas y corales, no solo representan la belleza del océano, sino también el compromiso de reducir la contaminación plástica y proteger los ecosistemas marinos. De esta manera, el proyecto no solo crea piezas únicas, sino que también contribuye a disminuir el impacto negativo de los residuos plásticos en el medio ambiente.', '-1.7 1 0.5', '-90 0 0']
    ]
  }
};

AFRAME.registerComponent('legacy-info', {
  schema: { panel: { type: 'int' } },
  init() {
    this.created = false;
    this.nodes = [];
    this.el.addEventListener('mouseenter', () => this.show());
    this.el.addEventListener('mouseleave', () => this.hide());
  },
  createContent() {
    const cfg = LEGACY_INFO[this.data.panel];
    if (!cfg) return;
    const [bgPos, bgRot, bgW, bgH] = cfg.bg;
    const background = document.createElement('a-plane');
    background.setAttribute('position', bgPos);
    background.setAttribute('rotation', bgRot);
    background.setAttribute('width', bgW);
    background.setAttribute('height', bgH);
    background.setAttribute('material', 'color: #000; opacity: 0; transparent: true; side: double');
    this.el.appendChild(background);
    this.nodes.push(background);

    cfg.texts.forEach(([value, position, rotation]) => {
      const text = document.createElement('a-text');
      text.setAttribute('value', value);
      text.setAttribute('font', 'https://cdn.glitch.global/875c914b-5bf9-4bd8-8d5b-92c7da9612b5/fuente_nascere-msdf.json?v=1726917663169');
      text.setAttribute('font-image', 'https://cdn.glitch.global/875c914b-5bf9-4bd8-8d5b-92c7da9612b5/fuentenascere.png?v=1726917645411');
      text.setAttribute('negate', 'false');
      text.setAttribute('position', position);
      text.setAttribute('rotation', rotation);
      text.setAttribute('align', 'left');
      text.setAttribute('color', '#fff');
      text.setAttribute('opacity', '0');
      this.el.appendChild(text);
      this.nodes.push(text);
    });
    this.created = true;
  },
  show() {
    if (!this.created) this.createContent();
    this.nodes.forEach((node, index) => {
      node.setAttribute('animation__fade', `property: ${index === 0 ? 'material.opacity' : 'opacity'}; to: ${index === 0 ? 0.6 : 1}; dur: 280; easing: easeOutQuad`);
    });
  },
  hide() {
    if (!this.created) return;
    this.nodes.forEach((node, index) => {
      node.setAttribute('animation__fade', `property: ${index === 0 ? 'material.opacity' : 'opacity'}; to: 0; dur: 220; easing: easeInQuad`);
    });
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const scene = document.getElementById('legacy-scene');
  const loader = document.getElementById('legacy-loader');
  const status = document.getElementById('legacy-loader-status');
  const critical = [...document.querySelectorAll('.critical-model')];
  let loaded = 0;
  let sceneReady = false;
  let hidden = false;

  function reveal(force = false) {
    if (hidden || !sceneReady) return;
    if (!force && loaded < 2) return;
    hidden = true;
    status.textContent = 'Museo listo';
    setTimeout(() => loader.classList.add('is-hidden'), 180);
  }

  critical.forEach((model) => {
    const ready = () => {
      if (model.dataset.ready) return;
      model.dataset.ready = '1';
      loaded += 1;
      status.textContent = `Cargando piezas ${loaded}/${critical.length}`;
      reveal(false);
    };
    if (model.getObject3D('mesh')) ready();
    else model.addEventListener('model-loaded', ready, { once: true });
  });

  scene.addEventListener('loaded', () => {
    sceneReady = true;
    reveal(false);
  }, { once: true });
  setTimeout(() => reveal(true), 3400);

  let soundAttached = false;
  const startSound = () => {
    const sound = document.getElementById('seaSound');
    if (!sound?.components?.sound) return;
    const play = () => sound.components?.sound?.playSound();
    if (!soundAttached) {
      soundAttached = true;
      sound.addEventListener('sound-loaded', play, { once: true });
      sound.setAttribute('sound', 'src', sound.dataset.audioSrc);
      setTimeout(play, 650);
    } else play();
  };
  document.addEventListener('click', startSound, { once: true });
});
