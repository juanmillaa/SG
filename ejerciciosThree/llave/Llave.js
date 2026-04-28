import * as THREE from 'three'

class Llave extends THREE.Object3D {
  constructor(gui, titleGui) {
    super();
    
    // 1. Configuración inicial
    this.tama = 0.5; // El tamaño inicial que querías
    
    this.material = new THREE.MeshStandardMaterial({
      color: 0xb59410,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    // 2. Creamos las partes una sola vez
    this.cuerpo = this.createCuerpo();
    this.cabeza = this.createCabezaBarrido();
    this.paleton = this.createPaleton();

<<<<<<< Updated upstream
    this.add(cabeza);
    this.add(cuerpo);
    this.add(paleton);

=======
    // 3. Añadimos todo al objeto (this)
    this.add(this.cuerpo);
    this.add(this.cabeza);
    this.add(this.paleton);

    // 4. Aplicamos el escalado inicial al objeto completo
    this.scale.set(this.tama, this.tama, this.tama);

    // 5. Setup GUI
    this.createGUI(gui, titleGui);
>>>>>>> Stashed changes
  }

  createCuerpo() {
    // Puntos fijos (escala 1:1)
    const puntos = [
      new THREE.Vector2(0, 0), new THREE.Vector2(0.3, 0.4), new THREE.Vector2(0.3, 3.9),
      new THREE.Vector2(0.44, 3.97), new THREE.Vector2(0.5, 4.1), new THREE.Vector2(0.36, 4.19),
      new THREE.Vector2(0.3, 4.32), new THREE.Vector2(0.3, 4.38), new THREE.Vector2(0.38, 4.39),
      new THREE.Vector2(0.42, 4.42), new THREE.Vector2(0.3, 4.44), new THREE.Vector2(0.37, 4.44),
      new THREE.Vector2(0.3, 4.5), new THREE.Vector2(0.44, 4.62), new THREE.Vector2(0.5, 4.8),
      new THREE.Vector2(0.36, 4.87), new THREE.Vector2(0.2, 5), new THREE.Vector2(0, 5)
    ].map(p => p.multiplyScalar(0.5)); // El 0.5 que ya tenías como escaladoCuerpo

    const geometry = new THREE.LatheGeometry(puntos, 32);
    return new THREE.Mesh(geometry, this.material);
  }

  createCabezaBarrido() {
    const puntosDatos = [
      new THREE.Vector3(0, -0.12, 0), new THREE.Vector3(-0.03, -0.04, 0),
      new THREE.Vector3(-0.10, 0.02, 0), new THREE.Vector3(-0.16, 0.08, 0),
      new THREE.Vector3(-0.25, 0.14, 0), new THREE.Vector3(-0.31, 0.22, 0),
      new THREE.Vector3(-0.32, 0.33, 0), new THREE.Vector3(-0.27, 0.41, 0),
      new THREE.Vector3(-0.18, 0.45, 0), new THREE.Vector3(-0.03, 0.40, 0),
      new THREE.Vector3(-0.10, 0.59, 0), new THREE.Vector3(-0.07, 0.63, 0),
      new THREE.Vector3(0, 0.65, 0)
    ];

    let puntosBucle = [...puntosDatos];
    for (let i = puntosDatos.length - 2; i >= 1; i--) {
      puntosBucle.push(new THREE.Vector3(-puntosDatos[i].x, puntosDatos[i].y, 0));
    }

    const camino = new THREE.CatmullRomCurve3(puntosBucle, true);
    const geometry = new THREE.TubeGeometry(camino, 64, 0.05, 12, true);
    const mesh = new THREE.Mesh(geometry, this.material);
    
    // Posición fija relativa al cuerpo (5 * 0.5 = 2.5)
    mesh.position.y = 2.5; 
    return mesh;
  }

  createPaleton() {
    const shape = new THREE.Shape();
    // Dibujo estándar
    shape.moveTo(0, 0); 
    shape.lineTo(0.2, 0); shape.lineTo(0.2, 0.1); 
    shape.lineTo(0.1, 0.1); shape.lineTo(0.1, 0.15); 
    shape.lineTo(0.2, 0.15); shape.lineTo(0.2, 0.3); 
    shape.lineTo(0, 0.3); shape.lineTo(0, 0);

    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
    geometry.translate(0, 0, -0.05); // Centrar profundidad
    
    const mesh = new THREE.Mesh(geometry, this.material);
    
    // Posición fija: radio del cilindro (0.3 * 0.5 = 0.15)
    mesh.position.set(0.15, 0.5, 0);
    return mesh;
  }

  createGUI(gui, titleGui) {
    this.guiControls = {
      rotacion: 0,
      tamaño: this.tama
    };

    const folder = gui.addFolder(titleGui);
    folder.add(this.guiControls, 'rotacion', 0, Math.PI * 2)
      .name('Girar Llave')
      .onChange((v) => { this.rotation.y = v; });

    folder.add(this.guiControls, 'tamaño', 0.1, 2.0)
      .name('Tamaño')
      .onChange((v) => {
        this.tama = v;
        // Escalamos el objeto PADRE. Esto escala automáticamente cabeza, cuerpo y paletón
        // sin que se separen entre ellos.
        this.scale.set(v, v, v);
      });
  }

  update() {}
}

export { Llave };