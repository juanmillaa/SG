import * as THREE from 'three'

class Llave extends THREE.Object3D {
  constructor(gui, titleGui) {
    super();
    
    this.createGUI(gui, titleGui);

    this.tama = 1;
    this.alturaLlave = 2.5;
    this.anchoCilindro = 0.4;
    this.escaladoCuerpo = 0.5;
    // Material ocre metálico
    this.material = new THREE.MeshStandardMaterial({
      color: 0xB8860B,
      metalness: 0.8,
      roughness: 0.4,
      side: THREE.DoubleSide
    });

    // Construcción de las partes
    const cabeza = this.createCabezaBarrido();
    const cuerpo = this.createCuerpo();
    const paleton = this.createPaleton();

    this.add(cabeza);
    this.add(cuerpo);
    this.add(paleton);

  }

createCabezaBarrido() {

  const puntosDatos = [
    new THREE.Vector3(0, -0.12, 0),
    new THREE.Vector3(-0.03, -0.04, 0),
    new THREE.Vector3(-0.10, 0.02, 0),
    new THREE.Vector3(-0.16, 0.08, 0),
    new THREE.Vector3(-0.25, 0.14, 0),
    new THREE.Vector3(-0.31, 0.22, 0),
    new THREE.Vector3(-0.32, 0.33, 0),
    new THREE.Vector3(-0.27, 0.41, 0),
    new THREE.Vector3(-0.18, 0.45, 0),
    new THREE.Vector3(-0.03, 0.40, 0),
    new THREE.Vector3(-0.10, 0.59, 0),
    new THREE.Vector3(-0.07, 0.63, 0),
    new THREE.Vector3(0, 0.65, 0)
  ];

  let puntosBucle = [];
  puntosDatos.forEach(p => puntosBucle.push(p.clone()));
  
  for (let i = puntosDatos.length - 2; i >= 1; i--) {
    puntosBucle.push(new THREE.Vector3(-puntosDatos[i].x, puntosDatos[i].y, 0));
  }

  const camino = new THREE.CatmullRomCurve3(puntosBucle);
  camino.closed = true;
  camino.curveType = 'centripetal';

  const radioTubo = 0.05 * this.tama;

  const geometry = new THREE.TubeGeometry(camino, 128, radioTubo, 12, true);
  const mesh = new THREE.Mesh(geometry, this.material);
  mesh.position.set(0, this.alturaLlave*1.05, 0);
  mesh.scale.set(this.tama*1.2,this.tama*1.2,this.tama*1.2);
  return mesh;
}

  createCuerpo() {
  const puntos = [
    new THREE.Vector2(0, 0),      // A - Inicio en el eje (0,0)
    new THREE.Vector2(0.3, 0.4),  // B
    new THREE.Vector2(0.3, 3.9),   // O (era 1.9)
    new THREE.Vector2(0.44, 3.97), // P (era 1.97)
    new THREE.Vector2(0.5, 4.1),   // N (era 2.1)
    new THREE.Vector2(0.36, 4.19), // Q (era 2.19)
    new THREE.Vector2(0.3, 4.32),  // M (era 2.32)
    new THREE.Vector2(0.3, 4.38),  // K (era 2.38)
    new THREE.Vector2(0.38, 4.39), // J (era 2.39)
    new THREE.Vector2(0.42, 4.42), // H (era 2.42)
    new THREE.Vector2(0.3, 4.44),  // G (era 2.44)
    new THREE.Vector2(0.37, 4.44), // I (era 2.44)
    new THREE.Vector2(0.3, 4.5),   // C (era 2.5)
    new THREE.Vector2(0.44, 4.62), // F (era 2.62)
    new THREE.Vector2(0.5, 4.8),   // D (era 2.8)
    new THREE.Vector2(0.36, 4.87),  // E (era 2.87)
    new THREE.Vector2(0.2, 5),  // E (era 2.87)
    new THREE.Vector2(0,5)
  ];

  const geometry = new THREE.LatheGeometry(puntos, 32);
  let mesh = new THREE.Mesh(geometry, this.material);
  mesh.scale.set(this.escaladoCuerpo*this.tama,this.escaladoCuerpo*this.tama, this.escaladoCuerpo*this.tama);
  return mesh;
}


  createPaleton() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); 
    shape.lineTo(0.2, 0);
    shape.lineTo(0.2, 0.1); 
    shape.lineTo(0.1, 0.1); 
    shape.lineTo(0.1, 0.15); 
    shape.lineTo(0.2, 0.15); 
    shape.lineTo(0.2, 0.3); 
    shape.lineTo(0.15,0.3);
    shape.lineTo(0.15,0.25)
    shape.lineTo(0.05,0.25);
    shape.lineTo(0.05,0.3);
    shape.lineTo(0, 0.3); 
    shape.lineTo(0, 0);
    let profundidad = this.tama * 0.15;
    const settings = { depth: profundidad, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, settings);
    geometry.translate(0,-0.15,-profundidad/2.0); //Ponemos el centro de los ejes en el lado izquierdo
    const mesh = new THREE.Mesh(geometry, this.material);
    let escalado= this.escaladoCuerpo*0.65;
    mesh.position.set(this.anchoCilindro*escalado,this.alturaLlave/5.0,0)
    mesh.scale.set(this.tama*1.2,this.tama*1.3,1)
    return mesh;
  }

  createGUI(gui, titleGui) {
    this.guiControls = {
      rotacion: 0,
    };

    var folder = gui.addFolder(titleGui);
    folder.add(this.guiControls, 'rotacion', 0, Math.PI * 2, 0.01)
      .name('Girar Llave')
      .onChange((value) => { this.rotation.y = value; });
  }

  update() {}
}

export { Llave };