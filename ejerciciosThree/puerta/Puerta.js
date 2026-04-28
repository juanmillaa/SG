
import * as THREE from 'three'

class Puerta extends THREE.Object3D {
  static #TAMA = 0.15;
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
    // Tomamos las coordenadas X e Y de cada vértice
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Calculamos el ángulo (U) y la distancia al centro (V)
    // Atan2 nos da el ángulo en radianes
    let angle = Math.atan2(y, x); 
    let radius = Math.sqrt(x * x + y * y);

    // Normalizamos los valores para que estén entre 0 y 1 (rango UV)
    // Dividimos por PI porque es un semicírculo
    let u = angle / Math.PI; 
    let v = radius; // Puedes ajustar esto dividiendo por el radio máximo

    // Si es la cara lateral (el grosor), usamos Z para la coordenada V
    // Así la veta de la madera baja por el borde correctamente
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
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    const loader = new THREE.TextureLoader().load('../imgs/maderapuerta.jpg');
    this.material = new THREE.MeshStandardMaterial({
      map: loader,
      roughness: 0.7,
      metalness: 0.1,
    });
    const textureLoader = new THREE.TextureLoader();
const texturaMadera = textureLoader.load('../imgs/maderapuerta.jpg');

// Importante: Permitir que la textura se repita si es necesario
texturaMadera.wrapS = THREE.RepeatWrapping;
texturaMadera.wrapT = THREE.RepeatWrapping;

// Material 1: Para las tapas planas (Veta horizontal)
this.materialTapa = new THREE.MeshStandardMaterial({
  map: texturaMadera,
  roughness: 0.7,
  metalness: 0.1,
});

// Material 2: Para el borde/grosor
// Usamos un color sólido o una versión oscurecida de la madera para que no distraiga
this.materialBorde = new THREE.MeshStandardMaterial({
  color: 0x5d4037, // Un marrón oscuro mate que combine con la madera
  roughness: 0.9,
  metalness: 0.0,
});

// Creamos un array con los dos materiales
this.materialesDonut = [this.materialTapa, this.materialBorde];
  // 1. Creamos el contenedor "Móvil" que será la puerta entera
  this.movil = new THREE.Object3D();
  const cuerpo = this.createCuerpo(Puerta.tama);
  const arco = this.createSemicircularDonut(Puerta.tama);
  const pomo = this.createPomo(Puerta.tama);
  // 2. Creamos las partes
  this.movil.add(cuerpo);
  this.movil.add(arco);
  this.movil.add(pomo);
  this.add(this.movil);
  this.movil.position.set(0, 0, 0);
    // Al nodo  this, la grapadora, se le cuelgan como hijos la base y la parte móvil
  }
  
  createCuerpo(tama) {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var cuerpo = new THREE.Object3D();
    // Cada figura, un Mesh, está compuesto de una geometría y un material
    var geometry = new THREE.BoxGeometry (tama*2,tama*1.4,tama*0.2);
    var cajaBase = new THREE.Mesh (geometry,this.material);
    // cajaBase.rotation.z = Math.PI/2;
    geometry.rotateZ(Math.PI/2);
    geometry.translate(tama*0.7,tama,0);

    cuerpo.add (cajaBase);
    return cuerpo;
  }

createPomo(tama){
  var k = 0.019;
  var geometry = new THREE.TorusKnotGeometry( 1, 10, 267, 3,15,1 );
  var torusKnot = new THREE.Mesh( geometry, this.material );
  var pomo = new THREE.Object3D();
  torusKnot.scale.set(tama*k,tama*k,tama*(k+0.025));
  torusKnot.position.y = tama
  torusKnot.position.x = tama - 0.1 + tama*0.7;
  pomo.add(torusKnot);
  return pomo;

}
createSemicircularDonut(tama) {
  // 1. Definir la forma base (Semicírculo exterior)
  const shape = new THREE.Shape();
  const radioExterior = tama * 0.70;
  const radioInterior = tama * 0.3;

  // Dibujar arco exterior y cerrar la base plana
  shape.absarc(0, 0, radioExterior, 0, Math.PI, false);
  shape.lineTo(-radioExterior, 0); 
  shape.closePath(); // Cierra el semicírculo exterior

  // 2. Definir el agujero (Semicírculo interior)
  const hole = new THREE.Path();
  hole.absarc(0, 0, radioInterior, 0, Math.PI, false);
  hole.lineTo(-radioInterior, 0);
  hole.closePath(); // Cierra el agujero
  
  shape.holes.push(hole);

  // 3. Configuración del Extrude
  const extrudeSettings = {
    depth: tama * 0.2,
    bevelEnabled: false,
    bevelThickness: 0.01, // Pequeño bisel para realismo
    bevelSize: 0.01,
    bevelSegments: 3,
    // WorldUVGenerator suele funcionar mejor para mantener la proyección plana
    uvGenerator: THREE.ExtrudeGeometry.WorldUVGenerator 
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
  // --- PASO CLAVE: Ajuste de UVs manual para la tapa ---
  // A veces WorldUVGenerator necesita un pequeño empujón.
  // Vamos a escalar las UVs de la tapa para que la veta se vea del tamaño correcto.
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    // Escala la textura en la tapa (puedes ajustar estos números)
    uvs.setX(i, uvs.getX(i) * 0.5); // Hace la veta más densa horizontalmente
    uvs.setY(i, uvs.getY(i) * 0.5); 
  }
  uvs.needsUpdate = true;


  // 4. Posicionamiento
  geometry.center();
  geometry.translate(tama * 0.7, tama * 2.3, 0);

  // 5. Crear la Malla usando el ARRAY de materiales
  // Three.js asignará automáticamente materialTapa a las caras planas
  // y materialBorde a los laterales de la extrusión.
  const mesh = new THREE.Mesh(geometry, this.materialesDonut);

  return mesh;
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
    folder.add (this.guiControls, 'rotacion', -Math.PI/2, Math.PI/2, 0.0001)
      .name ('Apertura : ')
      .onChange ( (value) => this.setAngulo (-value) );
  }
  
  
  setAngulo (valor) {
    this.movil.rotation.y = valor;
  }
  
  update () {
    // No hay nada que actualizar ya que la apertura de la puerta se ha actualizado desde la interfaz
  }
}

export { Puerta }
