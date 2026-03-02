
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
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0xCF0000});
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    var base = this.createCuerpo(Puerta.tama);
    // Al nodo que contiene la transformación interactiva que abre y cierra la grapadora se accede desde el método update, se almacena en un atributo.
  this.movil = this.createMovil(Puerta.tama);

    // Al nodo  this, la grapadora, se le cuelgan como hijos la base y la parte móvil
    this.add (base);
    this.add (this.createSemicircularDonut(Puerta.tama));
  this.add (this.movil);
  }
  
  createCuerpo(tama) {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var cuerpo = new THREE.Object3D();
    // Cada figura, un Mesh, está compuesto de una geometría y un material
    var cajaBase = new THREE.Mesh (new THREE.BoxGeometry (tama*2,tama*1.5,tama*0.2), this.material);
    cajaBase.rotation.z = Math.PI/2;
    cajaBase.position.y = tama;
    cuerpo.add (cajaBase);
    return cuerpo;
  }
createSemicircularDonut(tama) {

  const shape = new THREE.Shape();

  const radioExterior = tama * 0.75;
  const radioInterior = tama * 0.4;

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

  // --- EXTRUSIÓN ---
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: tama * 0.2,
    bevelEnabled: false
  });

  geometry.center();

  const mesh = new THREE.Mesh(geometry, this.material);
  mesh.position.y = tama * 2.3;

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
    folder.add (this.guiControls, 'rotacion', -0.125, 0.2, 0.001)
      .name ('Apertura : ')
      .onChange ( (value) => this.setAngulo (-value) );
  }
  
  createMovil (tama) {
    // Se crea la parte móvil
    var cajaMovil = new THREE.Mesh (
        new THREE.BoxGeometry (tama, tama*0.12, tama*0.2),
        this.material
    );
    cajaMovil.position.set (-tama*0.45, tama*0.06, 0);
    
    var movil = new THREE.Object3D();
    // // IMPORTANTE: Con independencia del orden en el que se escriban las 2 líneas siguientes, SIEMPRE se aplica primero la rotación y después la traslación. Prueba a intercambiar las dos líneas siguientes y verás que no se produce ningún cambio al ejecutar.    
    movil.rotation.z = this.guiControls.rotacion;
    movil.position.set(tama*0.45,tama*0.2,0);
    movil.add(cajaMovil);
    return movil;
  }
  
  setAngulo (valor) {
    this.movil.rotation.z = valor;
  }
  
  update () {
    // No hay nada que actualizar ya que la apertura de la puerta se ha actualizado desde la interfaz
  }
}

export { Puerta }
