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

  static get cuerpoDimensiones() {
    return this.#CUERPO_DIMENSIONES;
  }

  assignCircularUVs(geometry) {
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      let angle = Math.atan2(y, x); 
      let radius = Math.sqrt(x * x + y * y);

      let u = angle / Math.PI; 
      let v = radius; 

      if (Math.abs(z) > 0.01) { 
         uv.setXY(i, u, z * 2); 
      } else {
         uv.setXY(i, u, v);
      }
    }
    uv.needsUpdate = true;
  }

  static get tama() {
    return this.#TAMA;
  }

  constructor(gui, titleGui) {
    super();
    
    this.createGUI(gui, titleGui);

    const texturaColor = new THREE.TextureLoader().load('../puerta/textura/PaintedWood005_1K-JPG_Color.jpg');
    const texturaNormal = new THREE.TextureLoader().load('../puerta/textura/PaintedWood005_1K-JPG_NormalGL.jpg');
    
    this.material= new THREE.MeshStandardMaterial({
      map: texturaColor,

      normalMap: texturaNormal,
      normalScale: new THREE.Vector2(1.2, 1.2),

      roughnessMap: new THREE.TextureLoader().load('../puerta/textura/PaintedWood005_1K-JPG_Roughness.jpg'),
      roughness: 0.8,

      emissive: 0xff4500,
      emissiveMap: texturaColor,
      emissiveIntensity: 2
    });

    // Contenedor móvil de la puerta
    this.movil = new THREE.Object3D();
    
    const cuerpo = this.createCuerpo(Puerta.tama);
    const pomo = this.createPomo(Puerta.tama);
    
    this.movil.add(cuerpo);
    this.movil.add(pomo);
    this.add(this.movil);
    
    this.movil.position.set(0, 0, 0);
    this.scale.set(Puerta.tama * 1.8,Puerta.tama * 1.8,Puerta.tama * 1);
  }
  
  createCuerpo(tama) {
    var cuerpo = new THREE.Object3D();

    var ancho = tama * 1.4;
    var alto = tama * 2;
    var radioSemicirculoSuperior = ancho / 2;

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(ancho, 0);
    shape.lineTo(ancho, alto);
    shape.absarc(ancho / 2, alto, radioSemicirculoSuperior, 0, Math.PI, false);
    shape.lineTo(0, 0);

    // 3. CAMBIO: EL AGUJERO EN EL SEMICÍRCULO SUPERIOR
    var radioAgujero = tama * 0.3; 
    var agujero = new THREE.Path();
    
    // Posicionamos el centro del agujero exactamente en (ancho / 2, alto)
    // Cambiamos los ángulos (de 0 a Math.PI) y activamos el sentido horario (true) para restar la forma
    agujero.absarc(ancho / 2, alto, radioAgujero, 0, Math.PI, false);
    agujero.closePath();

    shape.holes.push(agujero);

    var extrudeSettings = {
        depth: tama * 0.2, 
        bevelEnabled: false
    };

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    this.assignCircularUVs(geometry);

    var mallaShape = new THREE.Mesh(geometry, this.material);

    cuerpo.add(mallaShape);
    return cuerpo;
  }

  createPomo(tama) {
    var k = 0.019;
    var geometry = new THREE.TorusKnotGeometry(1, 10, 267, 3, 15, 1);
    
    var torusKnot = new THREE.Mesh(geometry, this.material);
    var pomo = new THREE.Object3D();
    
    torusKnot.scale.set(tama * k, tama * k, tama * (k * 4.5));
    torusKnot.position.y = tama;
    torusKnot.position.x = tama * 1.2;
    torusKnot.position.z = tama*0.1; // Le damos un poco de profundidad para que se vea mejor
    pomo.add(torusKnot);
    return pomo;
  }

  createGUI(gui, titleGui) {
    this.guiControls = {
      rotacion: 0
    };
    
    var folder = gui.addFolder(titleGui);
    folder.add(this.guiControls, 'rotacion', -Math.PI / 2, Math.PI / 2, 0.0001)
      .name('Apertura : ')
      .onChange((value) => this.setAngulo(-value));
  }
  
  setAngulo(valor) {
    this.movil.rotation.y = valor;
  }
  
  update() {
    // No requiere acciones en el loop de renderizado
  }
}

export { Puerta }