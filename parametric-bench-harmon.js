/*
 * NASCERE — Parametric bench adaptation
 * Design reference: Brendan Harmon, “Parametric Bench”.
 * Tutorial: https://baharmon.github.io/parametric-bench/
 * Grasshopper source: https://github.com/baharmon/generative-design/blob/main/grasshopper/parametric-bench.gh
 *
 * This lightweight WebXR implementation recreates the tutorial's core method
 * (two boundary curves, lofted seat, vertical extrusion and end supports)
 * specifically for the Nascere museum. The original Grasshopper definition is
 * not redistributed in this repository.
 */

AFRAME.registerComponent('parametric-bench-harmon', {
  schema: {
    length: { type: 'number', default: 3.35 },
    width: { type: 'number', default: 0.72 },
    height: { type: 'number', default: 0.47 },
    thickness: { type: 'number', default: 0.16 },
    legThickness: { type: 'number', default: 0.20 },
    segments: { type: 'int', default: 56 },
    color: { type: 'color', default: '#dcebea' }
  },

  init() {
    this.buildBench();
  },

  buildBench() {
    const data = this.data;
    const halfLength = data.length / 2;
    const halfWidth = data.width / 2;

    // A gently changing ergonomic profile inspired by Harmon's two-curve workflow.
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-halfLength, data.height + 0.01, 0),
      new THREE.Vector3(-data.length * 0.30, data.height + 0.10, 0),
      new THREE.Vector3(-data.length * 0.08, data.height + 0.035, 0),
      new THREE.Vector3(data.length * 0.15, data.height - 0.025, 0),
      new THREE.Vector3(data.length * 0.34, data.height + 0.055, 0),
      new THREE.Vector3(halfLength, data.height + 0.015, 0)
    ], false, 'catmullrom', 0.42);

    const samples = Math.max(12, data.segments);
    const points = curve.getPoints(samples);
    const positions = [];
    const indices = [];

    // Four vertices per section: top/front, top/back, bottom/front, bottom/back.
    points.forEach((point) => {
      positions.push(
        point.x, point.y, -halfWidth,
        point.x, point.y, halfWidth,
        point.x, point.y - data.thickness, -halfWidth,
        point.x, point.y - data.thickness, halfWidth
      );
    });

    for (let i = 0; i < points.length - 1; i += 1) {
      const a = i * 4;
      const b = (i + 1) * 4;

      // Top.
      indices.push(a, a + 1, b, b, a + 1, b + 1);
      // Bottom.
      indices.push(a + 2, b + 2, a + 3, b + 2, b + 3, a + 3);
      // Front side.
      indices.push(a, b, a + 2, b, b + 2, a + 2);
      // Back side.
      indices.push(a + 1, a + 3, b + 1, b + 1, a + 3, b + 3);
    }

    // Close both ends of the extruded seat.
    const first = 0;
    const last = (points.length - 1) * 4;
    indices.push(first, first + 2, first + 1, first + 1, first + 2, first + 3);
    indices.push(last, last + 1, last + 2, last + 1, last + 3, last + 2);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(data.color),
      roughness: 0.74,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    const group = new THREE.Group();
    const seat = new THREE.Mesh(geometry, material);
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    const makeLeg = (point, side) => {
      const top = Math.max(0.24, point.y - data.thickness);
      const legGeometry = new THREE.BoxGeometry(data.legThickness, top, data.width);
      const leg = new THREE.Mesh(legGeometry, material);
      const inset = data.legThickness * 0.48;
      leg.position.set(
        point.x + (side === 'left' ? inset : -inset),
        top / 2,
        0
      );
      leg.castShadow = true;
      leg.receiveShadow = true;
      return leg;
    };

    group.add(makeLeg(points[0], 'left'));
    group.add(makeLeg(points[points.length - 1], 'right'));

    // Very subtle darker plinth line: separates the pale bench from Nascere's light floor.
    const plinthMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8fb5b8'),
      roughness: 0.82,
      metalness: 0.02
    });
    const plinthGeometry = new THREE.BoxGeometry(data.length - 0.22, 0.018, data.width - 0.08);
    const plinth = new THREE.Mesh(plinthGeometry, plinthMaterial);
    plinth.position.y = 0.009;
    plinth.receiveShadow = true;
    group.add(plinth);

    this.el.setObject3D('mesh', group);
  },

  remove() {
    const group = this.el.getObject3D('mesh');
    if (!group) return;
    group.traverse((node) => {
      if (!node.isMesh) return;
      node.geometry?.dispose();
      if (Array.isArray(node.material)) node.material.forEach((material) => material.dispose());
      else node.material?.dispose();
    });
    this.el.removeObject3D('mesh');
  }
});
