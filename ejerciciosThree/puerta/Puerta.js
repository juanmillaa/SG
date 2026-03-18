
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

  static get tama() {
    return this.#TAMA;
  }
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    const loader = new THREE.TextureLoader();
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    // this.material = new THREE.MeshStandardMaterial({color: 0xCF0000});
    this.material = new THREE.MeshStandardMaterial({
      map: loader.load("../imgs/daria-yakovleva-wood-2045379_640.jpg"),
      normalMap: loader.load("../imgs/daria-yakovleva-wood-2045379_640.jpg"),
      roughnessMap: loader.load("../imgs/daria-yakovleva-wood-2045379_640.jpg"),
      displacementMap: loader.load("../imgs/daria-yakovleva-wood-2045379_640.jpg"),
      displacementScale: 0.05
    });
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

  const shape = new THREE.Shape();

  const radioExterior = tama * 0.70;
  const radioInterior = tama * 0.3;

  // --- CONTORNO EXTERIOR ---
  shape.absarc(0, 0, radioExterior, 0, Math.PI, false);
  shape.lineTo(-radioExterior, 0);
  shape.lineTo(radioExterior, 0);

  // --- AGUJERO INTERIOR ---
  const hole = new THREE.Path();
  hole.absarc(0, 0, radioInterior, 0, Math.PI, false);
  hole.lineTo(-radioInterior, 0);
  hole.lineTo(radioInterior, 0);

  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: tama * 0.2,
    bevelEnabled: false
  });

  geometry.center();
  geometry.translate(tama*0.7,tama*2.3,0);
  const mesh = new THREE.Mesh(geometry, this.material);

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
