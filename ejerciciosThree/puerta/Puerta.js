import * as THREE from 'three'

class Puerta extends THREE.Object3D {
  static #TAMA = 1;
  static #CUERPO_DIMENSIONES;
  static {
    this.#CUERPO_DIMENSIONES = Object.freeze([
      this.#TAMA * 2,
      this.#TAMA * 1.5,
      this.#TAMA * 0.2
    ]);
  }

  static get cuerpoDimensiones() { return this.#CUERPO_DIMENSIONES; }
  static get tama() { return this.#TAMA; }

  constructor() {
    super();

    const loader = new THREE.TextureLoader();
    const texturaColor     = loader.load('./textura/PaintedWood005_1K-JPG_Color.jpg');
    const texturaNormal    = loader.load('./textura/PaintedWood005_1K-JPG_NormalGL.jpg');
    const texturaRoughness = loader.load('./textura/PaintedWood005_1K-JPG_Roughness.jpg');

    // Todas las texturas en modo repeat para que Three.js las trate igual
    [texturaColor, texturaNormal, texturaRoughness].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });

    this.material = new THREE.MeshStandardMaterial({
      map:          texturaColor,
      normalMap:    texturaNormal,
      normalScale:  new THREE.Vector2(1.2, 1.2),
      roughnessMap: texturaRoughness,
      roughness:    0.8,
    });

    this.movil = new THREE.Object3D();
    this.movil.add(this.createCuerpo(Puerta.tama));
    this.movil.add(this.createPomo(Puerta.tama));
    this.add(this.movil);
    this.movil.position.set(0, 0, 0);
  }

  createCuerpo(tama) {
    const cuerpo = new THREE.Object3D();
    const ancho  = tama * 1.4;
    const alto   = tama * 2;
    const radio  = ancho / 2;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(ancho, 0);
    shape.lineTo(ancho, alto);
    shape.absarc(ancho / 2, alto, radio, 0, Math.PI, false);
    shape.lineTo(0, 0);

    const agujero = new THREE.Path();
    agujero.absarc(ancho / 2, alto, tama * 0.3, 0, Math.PI, false);
    agujero.closePath();
    shape.holes.push(agujero);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: tama * 0.2,
      bevelEnabled: false,
    });

    // ── Recomputar UVs para que cubran todo el bounding box ──────────────────
    // ExtrudeGeometry deja UVs en espacio local del shape (0…ancho, 0…alto+radio).
    // Los normalizamos al rango [0,1] usando el bounding box real de la geometría.
    geometry.computeBoundingBox();
    const bb   = geometry.boundingBox;
    const sizeX = bb.max.x - bb.min.x;
    const sizeY = bb.max.y - bb.min.y;

    const uvAttr = geometry.attributes.uv;
    const posAttr = geometry.attributes.position;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      uvAttr.setXY(
        i,
        (x - bb.min.x) / sizeX,   // U: 0 en el borde izquierdo, 1 en el derecho
        (y - bb.min.y) / sizeY    // V: 0 en la base, 1 en la cima del arco
      );
    }
    uvAttr.needsUpdate = true;
    // ─────────────────────────────────────────────────────────────────────────

    cuerpo.add(new THREE.Mesh(geometry, this.material));
    return cuerpo;
  }

  createPomo(tama) {
    const k        = 0.019;
    const geometry = new THREE.TorusKnotGeometry(1, 10, 267, 3, 15, 1);
    const torusKnot = new THREE.Mesh(geometry, this.material);
    torusKnot.scale.set(tama * k, tama * k, tama * k * 2);
    torusKnot.position.set(tama * 1.2, tama, tama * 0.1);

    const pomo = new THREE.Object3D();
    pomo.add(torusKnot);
    return pomo;
  }

  setAngulo(valor) { this.movil.rotation.y = valor; }
  update() {}
}

export { Puerta }