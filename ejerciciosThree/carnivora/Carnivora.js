const SEGMENTOS_RADIALES = 64;
const PI = 3.14;

import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'
const ALTURA_BASE = 0.35;
const ALTURA_TRONCO = 0.8;

class Carnivora extends THREE.Object3D {
  constructor(gui, titleGui) {
    super();

    // Se crea la parte de la interfaz que corresponde a la carnivora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui, titleGui);

    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({ color: 0x228B22 });


    this.girando = false;
    this.anguloObjetivo = 0;
    this.velocidadGiro = 0.02;

    this.cabezaGirando = false;
    this.velocidadCabeza = 0.01;
    this.anguloCentralCabeza = -Math.PI / 3;
    const amplitud = THREE.MathUtils.degToRad(20);


    this.lenguaEscalando = false;      // indica si está animándose
    this.lenguaScaleFactor = 1;        // escala actual en Y
    this.lenguaScaleMin = 0.5;         // escala mínima
    this.lenguaScaleMax = 4.0;         // escala máxima
    this.lenguaScaleSpeed = 0.01;      // velocidad de crecimiento/reducción por frame
    this.lenguaScaleDireccion = 1;     // 1 = crecer, -1 = achicar

    this.anguloMinCabeza = this.anguloCentralCabeza - amplitud;
    this.anguloMaxCabeza = this.anguloCentralCabeza + amplitud;
    this.direccionCabeza = 1;
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    var tamano = 1;   // 15 cm de largo. Las unidades son metros


    this.base = this.createBase(tamano);
    this.tronco = this.createTronco(tamano)
    this.hoja = this.createHoja(tamano);
    this.otra_hoja = this.createHoja(tamano);
    this.giratorio = this.createGiratorio(tamano)
    this.cabeza = this.createCabeza(tamano)
    this.lengua = this.createLengua(tamano)


    this.otra_hoja.rotation.y = Math.PI;
    this.otra_hoja.position.y += 0.15*tamano;

    // Al nodo  this, la carnivora, se le cuelgan como hijos la base y la parte móvil
    this.add(this.base);
    this.base.add(this.tronco)
    this.tronco.add(this.giratorio);
    this.tronco.add(this.hoja);
    this.tronco.add(this.otra_hoja);
    this.giratorio.add(this.cabeza);
    this.cabeza.add(this.lengua);

  }

 
  createBase(tama) {

    var base = new THREE.Object3D();

    var mat = new THREE.MeshStandardMaterial({ color: 0xA0522D });
    const matMaceta = new THREE.MeshStandardMaterial({
      color: 0xC06030,
      roughness: 0.9,
      metalness: 0.1
    });
    // Cilindro exterior (maceta)
    var geoExt = new THREE.CylinderGeometry(tama * 0.4, tama * 0.25, ALTURA_BASE, SEGMENTOS_RADIALES);

    var cajaBase = new CSG.Brush(geoExt, mat);

    // Cilindro interior (para vaciar)
    var geoInt = new THREE.CylinderGeometry(tama * 0.3, tama * 0.3, ALTURA_BASE/2.0, 24);

    geoInt.translate(0, ALTURA_BASE/2.0, 0);

    var cilInt = new CSG.Brush(geoInt, mat);

    var evaluador = new CSG.Evaluator();

    // Restar interior
    var maceta = evaluador.evaluate(cajaBase, cilInt, CSG.SUBTRACTION);

    maceta.material = matMaceta;  // materialConTextura RARO;;
    maceta.position.y = ALTURA_BASE / 2;

    base.add(maceta);

    return base;
  }
  createTronco(tama) {

    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var base = new THREE.Object3D();
    // Cada figura, un Mesh, está compuesto de una geometría y un material
    const loader = new THREE.TextureLoader();
    const materialConTextura = new THREE.MeshStandardMaterial({
          map: loader.load("../texturas/TexturaPlanta/plant_difuse.png"),
          normalMap: loader.load("../texturas/TexturaPlanta/plant_normal.png"),
          roughnessMap: loader.load("../texturas/TexturaPlanta/plant_rough.png"),
          displacementMap: loader.load("../texturas/TexturaPlanta/plant_displacement.png"),
          displacementScale: 0.05
        });
    const matTronco = new THREE.MeshStandardMaterial({
      color: 0x2E7D32,
      roughness: 0.7,
      metalness: 0.1
    });
    var cajaBase = new THREE.Mesh(new THREE.CylinderGeometry(tama * 0.1, tama * 0.1, ALTURA_TRONCO, SEGMENTOS_RADIALES), matTronco);
    cajaBase.position.y = ALTURA_TRONCO / 2;


    base.position.set(0, (3.0/4.0)*ALTURA_BASE, 0);
    base.add(cajaBase);
    return base;
  }

  createHoja(tama){
    var shape = new THREE.Shape();
    shape.moveTo(0,0);
    shape.quadraticCurveTo(0,0.15*tama,0.35*tama,0.15*tama);
    shape.quadraticCurveTo(0.7*tama,0.15*tama,0.7*tama,0);
    shape.quadraticCurveTo(0.7*tama,-0.15*tama,0.35*tama,-0.15*tama);
    shape.quadraticCurveTo(0,-0.15*tama,0,0);

    var geometry = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial( { color: 0x556B2F, side: THREE.DoubleSide } );
    var hoja = new THREE.Mesh(geometry, mat);
    hoja.position.x = tama*0.1;  // tama*0.1 es el radio del cilindro
    hoja.position.y = ALTURA_TRONCO /2.0;

    hoja.rotation.x = Math.PI/3;

    var obj_hoja = new THREE.Object3D();
    obj_hoja.add(hoja);

    return obj_hoja;
  }

  createGiratorio(tama) {

    const altura = 0.5;
    const longitud = 0.35;

    // CURVA DEL TALLO
    class TalloCurve extends THREE.Curve {

      getPoint(t, target = new THREE.Vector3()) {

        // t ∈ [0,1]

        const x = t * altura;          // altura vertical
        const y = Math.sqrt(t) * longitud; // curvatura
        const z = 0;

        return target.set(x, y, z);
      }
    }

    const path = new TalloCurve();

    const geometry = new THREE.TubeGeometry(
      path,
      60,      // segmentos longitudinales
      0.1 * tama,    // radio del tallo
      16,      // segmentos radiales
      false
    );
    const loader = new THREE.TextureLoader();
    const materialConTextura = new THREE.MeshStandardMaterial({
          map: loader.load("../texturas/TexturaPlanta/plant_difuse.png"),
          normalMap: loader.load("../texturas/TexturaPlanta/plant_normal.png"),
          roughnessMap: loader.load("../texturas/TexturaPlanta/plant_rough.png"),
          displacementMap: loader.load("../texturas/TexturaPlanta/plant_displacement.png"),
          displacementScale: 0.05
        });
    const matTronco = new THREE.MeshStandardMaterial({
      color: 0x2E7D32,
      roughness: 0.7,
      metalness: 0.1
    });
    var mesh = new THREE.Mesh(geometry, matTronco);

    var giratorio = new THREE.Object3D();

    // IMPORTANTE → nace encima del tronco
    giratorio.position.y = 0.8-0.01;   // CREAR CONSTANTE SIENDO ESTE LA ALTURA DE TRONCO  RRESTO EL 0.01 para que no se note separacion

    giratorio.add(mesh);

    return giratorio;
  }

  girar180() {
    this.girando = true;
    this.anguloObjetivo += Math.PI;
  }
  createCabeza(tama) {
    const radio = tama * 0.4;

    const geometry = new THREE.SphereGeometry(
      radio, 32, 32,
      0, 2 * Math.PI,
      2.2, Math.PI
    );
    geometry.translate(0, radio, 0);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xffaaaa,
      side: THREE.DoubleSide
    });
    const cabeza = new THREE.Object3D();
    const sphere = new THREE.Mesh(geometry, mat);


    cabeza.rotation.z = - Math.PI / 3;
    cabeza.position.y = 0.3;
    cabeza.position.x = 0.45;
    cabeza.add(sphere);

    return cabeza;
  }

  createLengua(tama) {
    class CustomSinCurve extends THREE.Curve {
      constructor(length = 3) {
        super();
        this.length = length; // factor de alargamiento
      }
      getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tx = t * this.length - this.length / 2;
        const ty = Math.sin(2 * Math.PI * t) * 0.1;
        const tz = 0;
        return optionalTarget.set(tx, ty, tz);
      }
    }

    // Guardamos la curva como atributo de la clase para poder modificarla
    this.lenguaCurve = new CustomSinCurve(tama * 0.5); // longitud inicial
    this.lenguaMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.lenguaGeometry = new THREE.TubeGeometry(this.lenguaCurve, 50, 0.05, 8, false);
    this.lenguaGeometry.translate(tama * 0.25, 0, 0);
    this.lenguaGeometry.rotateZ(Math.PI / 2);
    this.lenguaMesh = new THREE.Mesh(this.lenguaGeometry, this.lenguaMaterial);

    const lengua = new THREE.Object3D();
    lengua.add(this.lenguaMesh);

    return lengua;

  }
  animarLengua() {
    this.lenguaEscalando = true;  // activamos animación
  }

  createGUI(gui, titleGui) {
    this.guiControls = {
      girar: () => this.girar180(),
      parar: () => this.parar(),
      empezarCabeza: () => this.empezarCabeza(),
      pararCabeza: () => this.pararCabeza(),
      alargarLengua: () => this.animarLengua(),
    };

    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder(titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    folder.add(this.guiControls, 'girar')
      .name('Girar 180°');
    folder.add(this.guiControls, 'parar')
      .name('Parar');
    folder.add(this.guiControls, 'empezarCabeza')
      .name('Mover cabeza');

    folder.add(this.guiControls, 'pararCabeza')
      .name('Parar cabeza');
    folder.add(this.guiControls, 'alargarLengua')
      .name('Animar lengua')
      .onChange(() => this.animarLengua());

  }
  parar() {
    this.girando = false;
  }

  empezarCabeza() {
    this.cabezaGirando = true;
  }

  pararCabeza() {
    this.cabezaGirando = false;
  }
  update() {

    if (this.lenguaEscalando) {
      // Incrementa o decrementa la escala sobre el eje Y
      this.lenguaScaleFactor += this.lenguaScaleDireccion * this.lenguaScaleSpeed;

      // Limitar entre min y max
      if (this.lenguaScaleFactor >= this.lenguaScaleMax) {
        this.lenguaScaleFactor = this.lenguaScaleMax;
        this.lenguaScaleDireccion = -1; // empezar a achicar
      } else if (this.lenguaScaleFactor <= this.lenguaScaleMin) {
        this.lenguaScaleFactor = this.lenguaScaleMin;
        this.lenguaScaleDireccion = 1; // empezar a crecer
      }

      // Aplicar escala solo sobre el eje Y
      this.lenguaMesh.scale.set(1, this.lenguaScaleFactor, 1);
    }

    if (this.girando) {

      let diferencia =
        this.anguloObjetivo - this.giratorio.rotation.y;

      if (Math.abs(diferencia) > 0.01) {

        this.giratorio.rotation.y +=
          Math.sign(diferencia) * this.velocidadGiro;

      } else {
        this.giratorio.rotation.y = this.anguloObjetivo;
        this.girando = false;
      }
    }
    if (this.cabezaGirando) {

      this.cabeza.rotation.z +=
        this.direccionCabeza * this.velocidadCabeza;

      if (this.cabeza.rotation.z > this.anguloMaxCabeza) {
        this.cabeza.rotation.z = this.anguloMaxCabeza;
        this.direccionCabeza = -1;
      }

      if (this.cabeza.rotation.z < this.anguloMinCabeza) {
        this.cabeza.rotation.z = this.anguloMinCabeza;
        this.direccionCabeza = 1;
      }
    }
  }
}

export { Carnivora }
