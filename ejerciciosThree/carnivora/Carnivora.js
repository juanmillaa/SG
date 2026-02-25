const SEGMENTOS_RADIALES = 64;

import * as THREE from 'three'

class Carnivora extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la carnivora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0xCF0000});
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    var tamano = 1;   // 15 cm de largo. Las unidades son metros
    var base = this.createBase(tamano);
 
    
    // Al nodo  this, la carnivora, se le cuelgan como hijos la base y la parte móvil
    this.add (base);
  }
  
  createBase(tama) {

    var altura = 0.35;
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var base = new THREE.Object3D();
    // Cada figura, un Mesh, está compuesto de una geometría y un material
    var cajaBase = new THREE.Mesh (new THREE.CylinderGeometry (tama*0.25,tama*0.4,altura,SEGMENTOS_RADIALES), this.material);
    cajaBase.position.y = altura/2;
    
    base.add(cajaBase);
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
  
  
  update () {
    // No hay nada que actualizar ya que la apertura de la Carnivora se ha actualizado desde la interfaz
  }
}

export { Carnivora }
