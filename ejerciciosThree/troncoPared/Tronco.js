const SEGMENTOS_RADIALES = 64;
import * as THREE from 'three'

class Tronco extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde al tronco
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0xCF0000});
    
    var tamano = 1;
    var base = this.createBase(tamano);
    // Al nodo que contiene la transformación interactiva que abre y cierra la grapadora se accede desde el método update, se almacena en un atributo.
    this.punta = this.createPunta(tamano);
    
    // Al nodo  this, la grapadora, se le cuelgan como hijos la base y la parte móvil
    this.add (base);
    this.add (this.punta);
  }
  
  createBase(tama) {
    // const loader = new THREE.TextureLoader();

    // // Cargar la textura desde URL o archivo local
    // const textura = loader.load('../texturas/TexturaBaseTronco/Bark001.png');
   
    // // Crear material usando la textura
    // const materialConTextura = new THREE.MeshStandardMaterial({ map: textura });
    const loader = new THREE.TextureLoader();

    const materialConTextura = new THREE.MeshStandardMaterial({
      map: loader.load("../texturas/TexturaBaseTronco1/DifuseWood.png"),
      normalMap: loader.load("../texturas/TexturaBaseTronco1/NormalWood.png"),
      roughnessMap: loader.load("../texturas/TexturaBaseTronco1/RoughWood.png"),
      displacementMap: loader.load("../texturas/TexturaBaseTronco1/DisplacementWood.png"),
      displacementScale: 0.05
    });
  


    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var base = new THREE.Object3D();
    var altura = tama * 2; // tu cilindro mide tama*2
    var troncoBase = new THREE.Mesh(
        new THREE.CylinderGeometry(tama * 0.5, tama * 0.5, altura, SEGMENTOS_RADIALES),
        /*this.material*/materialConTextura
    );

    // Moverlo hacia arriba la mitad de su altura para que apoye en y=0
    troncoBase.position.y = altura / 2;

    base.add(troncoBase);
  
    return base;
  }
  
  createGUI (gui,titleGui) {
    // Controles para el movimiento de la parte móvil
    this.guiControls = {
      rotacion : 0
    } 
    
    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder (titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    folder.add (this.guiControls, 'rotacion', -0.125, 0.2, 0.001)
      .name ('Apertura : ')
      .onChange ( (value) => this.setAngulo (-value) );
  }
  
    createPunta(tama) {
  

        const loader = new THREE.TextureLoader();

      const materialConTextura = new THREE.MeshStandardMaterial({
        map: loader.load("../texturas/TexturaPuntaTronco/DifusePunta.png"),
        normalMap: loader.load("../texturas/TexturaPuntaTronco/NormalPunta.png"),
        roughnessMap: loader.load("../texturas/TexturaPuntaTronco/RoughPunta.png"),
        displacementMap: loader.load("../texturas/TexturaPuntaTronco/DisplacementPunta.png"),
        displacementScale: 0.05
      });
        const alturaCono = 0.75; // altura del cono
        const geometriaPunta = new THREE.ConeGeometry(tama * 0.5, alturaCono, SEGMENTOS_RADIALES);
        const cono_punta = new THREE.Mesh(geometriaPunta, materialConTextura);

        // Mover el cono hacia arriba para que su base quede en y=0 del objeto punta
        cono_punta.position.y = alturaCono / 2;

        const punta = new THREE.Object3D();

        // Posicionar la punta sobre el cilindro
        // Si el cilindro mide tama*2 de altura:
        punta.position.set(0, tama*2, 0);

        punta.add(cono_punta);
        return punta;
    }
  
  setAngulo (valor) {
    if (this.punta) {
        this.punta.rotation.z = valor;
    }
  }
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Tronco }
