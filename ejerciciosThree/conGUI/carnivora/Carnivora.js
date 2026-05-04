
const SEGMENTOS_RADIALES = 64;
const PI = 3.14;

import * as THREE from 'three';
import * as CSG from '../libs/three-bvh-csg.js';

const ALTURA_BASE = 0.35;
const ALTURA_TRONCO = 0.8;

class Carnivora extends THREE.Object3D {

  constructor(gui = null, titleGui = "") {
    super();

    if (gui) {
      this.createGUI(gui, titleGui);
    }

    this.material = new THREE.MeshStandardMaterial({
      color: 0x228B22
    });

    this.girando = false;
    this.anguloObjetivo = 0;
    this.velocidadGiro = 0.02;

    this.cabezaGirando = false;
    this.velocidadCabeza = 0.01;
    this.anguloCentralCabeza = -Math.PI / 3;

    const amplitud = THREE.MathUtils.degToRad(20);

    this.anguloMinCabeza = this.anguloCentralCabeza - amplitud;
    this.anguloMaxCabeza = this.anguloCentralCabeza + amplitud;
    this.direccionCabeza = 1;

    this.lenguaEscalando = false;
    this.lenguaScaleFactor = 1;
    this.lenguaScaleMin = 0.5;
    this.lenguaScaleMax = 4.0;
    this.lenguaScaleSpeed = 0.01;
    this.lenguaScaleDireccion = 1;

    // CAMBIA AQUI EL TAMAÑO
    var tamano = 1;

    this.base = this.createBase(tamano);
    this.tronco = this.createTronco(tamano);
    this.hoja = this.createHoja(tamano);
    this.otra_hoja = this.createHoja(tamano);
    this.giratorio = this.createGiratorio(tamano);
    this.cabeza = this.createCabeza(tamano);
    this.lengua = this.createLengua(tamano);

    this.otra_hoja.rotation.y = Math.PI;
    this.otra_hoja.position.y += 0.15 * tamano;

    this.add(this.base);
    this.base.add(this.tronco);
    this.tronco.add(this.giratorio);
    this.tronco.add(this.hoja);
    this.tronco.add(this.otra_hoja);
    this.giratorio.add(this.cabeza);
    this.cabeza.add(this.lengua);
  }

  createBase(tama) {

    const alturaBase = ALTURA_BASE * tama;

    var base = new THREE.Object3D();

    var mat = new THREE.MeshStandardMaterial({
      color: 0xA0522D
    });

    const matMaceta = new THREE.MeshStandardMaterial({
      color: 0xC06030,
      roughness: 0.9,
      metalness: 0.1
    });

    var geoExt = new THREE.CylinderGeometry(
      tama * 0.4,
      tama * 0.25,
      alturaBase,
      SEGMENTOS_RADIALES
    );

    var cajaBase = new CSG.Brush(geoExt, mat);

    var geoInt = new THREE.CylinderGeometry(
      tama * 0.3,
      tama * 0.3,
      alturaBase / 2,
      24
    );

    geoInt.translate(0, (alturaBase / 2), 0);

    var cilInt = new CSG.Brush(geoInt, mat);

    var evaluador = new CSG.Evaluator();

    var maceta = evaluador.evaluate(
      cajaBase,
      cilInt,
      CSG.SUBTRACTION
    );

    maceta.material = matMaceta;
    maceta.position.y = alturaBase / 2;

    base.add(maceta);

    return base;
  }

  createTronco(tama) {

    const alturaTronco = ALTURA_TRONCO * tama;

    var base = new THREE.Object3D();

    const textura = new THREE.TextureLoader().load('../carnivora/leaf.jpg');

    const matTronco = new THREE.MeshStandardMaterial({
      color: 0x2E7D32,
      roughness: 0.7,
      metalness: 0.1,
      map: textura
    });

    var cajaBase = new THREE.Mesh(
      new THREE.CylinderGeometry(
        tama * 0.1,
        tama * 0.1,
        alturaTronco,
        SEGMENTOS_RADIALES
      ),
      matTronco
    );

    cajaBase.position.y = alturaTronco / 2;

    base.position.set(
      0,
      (3 / 4) * ALTURA_BASE * tama,
      0
    );

    base.add(cajaBase);

    return base;
  }

  createHoja(tama) {

    var shape = new THREE.Shape();

    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0, 0.15 * tama, 0.35 * tama, 0.15 * tama);
    shape.quadraticCurveTo(0.7 * tama, 0.15 * tama, 0.7 * tama, 0);
    shape.quadraticCurveTo(0.7 * tama, -0.15 * tama, 0.35 * tama, -0.15 * tama);
    shape.quadraticCurveTo(0, -0.15 * tama, 0, 0);

    var geometry = new THREE.ShapeGeometry(shape);

    const textura = new THREE.TextureLoader().load('../carnivora/leaf.jpg');

    const mat = new THREE.MeshBasicMaterial({
      color: 0x556B2F,
      side: THREE.DoubleSide,
      map: textura
    });

    var hoja = new THREE.Mesh(geometry, mat);

    hoja.position.x = tama * 0.1;
    hoja.position.y = (ALTURA_TRONCO * tama) / 2;

    hoja.rotation.x = Math.PI / 3;

    var obj_hoja = new THREE.Object3D();
    obj_hoja.add(hoja);

    return obj_hoja;
  }

  createGiratorio(tama) {

    const altura = 0.5 * tama;
    const longitud = 0.35 * tama;

    class TalloCurve extends THREE.Curve {
      getPoint(t, target = new THREE.Vector3()) {

        const x = t * altura;
        const y = Math.sqrt(t) * longitud;
        const z = 0;

        return target.set(x, y, z);
      }
    }

    const path = new TalloCurve();

    const geometry = new THREE.TubeGeometry(
      path,
      60,
      0.1 * tama,
      16,
      false
    );

    const textura = new THREE.TextureLoader().load('../carnivora/leaf.jpg');

    const matTronco = new THREE.MeshStandardMaterial({
      color: 0x2E7D32,
      roughness: 0.7,
      metalness: 0.1,
      map: textura
    });

    var mesh = new THREE.Mesh(geometry, matTronco);

    var giratorio = new THREE.Object3D();

    giratorio.position.y =
      ALTURA_TRONCO * tama - 0.01 * tama;

    giratorio.add(mesh);

    return giratorio;
  }


  createCabeza(tama) {

    const radio = tama * 0.4;

    const geometry = new THREE.SphereGeometry(
      radio,
      32,
      32,
      0,
      2 * Math.PI,
      2.2,
      Math.PI
    );

    geometry.translate(0, radio, 0);

    const textura = new THREE.TextureLoader().load('../carnivora/flower.jpg');

    var mat = new THREE.MeshStandardMaterial({
      map: textura,
      color: 0xffaaaa,
      side: THREE.DoubleSide
    });

    const cabeza = new THREE.Object3D();

    const sphere = new THREE.Mesh(geometry, mat);

    cabeza.rotation.z = -Math.PI / 3;
    cabeza.position.y = 0.3 * tama;
    cabeza.position.x = 0.45 * tama;

    cabeza.add(sphere);

    return cabeza;
  }

  createLengua(tama) {

    class CustomSinCurve extends THREE.Curve {

      constructor(length = 3) {
        super();
        this.length = length;
      }

      getPoint(t, optionalTarget = new THREE.Vector3()) {

        const tx = t * this.length - this.length / 2;
        const ty = Math.sin(2 * Math.PI * t) * 0.1 * tama;
        const tz = 0;

        return optionalTarget.set(tx, ty, tz);
      }
    }

    this.lenguaCurve = new CustomSinCurve(tama * 0.5);

    this.lenguaMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });

    this.lenguaGeometry = new THREE.TubeGeometry(
      this.lenguaCurve,
      50,
      0.05 * tama,
      8,
      false
    );

    this.lenguaGeometry.translate(tama * 0.25, 0, 0);
    this.lenguaGeometry.rotateZ(Math.PI / 2);

    this.lenguaMesh = new THREE.Mesh(
      this.lenguaGeometry,
      this.lenguaMaterial
    );

    const lengua = new THREE.Object3D();
    lengua.add(this.lenguaMesh);

    return lengua;
  }
  girar180() {
    this.girando = true;
    this.anguloObjetivo += Math.PI;
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

  animarLengua() {
    this.lenguaEscalando = true;
  }

  createGUI(gui, titleGui) {
    if (!gui) return;
    this.guiControls = {
      girar: () => this.girar180(),
      parar: () => this.parar(),
      empezarCabeza: () => this.empezarCabeza(),
      pararCabeza: () => this.pararCabeza(),
      alargarLengua: () => this.animarLengua()
    };

    var folder = gui.addFolder(titleGui);

    folder.add(this.guiControls, 'girar')
      .name('Girar 180°');

    folder.add(this.guiControls, 'parar')
      .name('Parar');

    folder.add(this.guiControls, 'empezarCabeza')
      .name('Mover cabeza');

    folder.add(this.guiControls, 'pararCabeza')
      .name('Parar cabeza');

    folder.add(this.guiControls, 'alargarLengua')
      .name('Animar lengua');
  }


  update() {

    if (this.lenguaEscalando) {

      this.lenguaScaleFactor +=
        this.lenguaScaleDireccion *
        this.lenguaScaleSpeed;

      if (this.lenguaScaleFactor >= this.lenguaScaleMax) {
        this.lenguaScaleFactor = this.lenguaScaleMax;
        this.lenguaScaleDireccion = -1;
      }
      else if (this.lenguaScaleFactor <= this.lenguaScaleMin) {
        this.lenguaScaleFactor = this.lenguaScaleMin;
        this.lenguaScaleDireccion = 1;
      }

      this.lenguaMesh.scale.set(
        1,
        this.lenguaScaleFactor,
        1
      );
    }

    if (this.girando) {

      let diferencia =
        this.anguloObjetivo -
        this.giratorio.rotation.y;

      if (Math.abs(diferencia) > 0.01) {

        this.giratorio.rotation.y +=
          Math.sign(diferencia) *
          this.velocidadGiro;
      }
      else {
        this.giratorio.rotation.y =
          this.anguloObjetivo;

        this.girando = false;
      }
    }

    if (this.cabezaGirando) {

      this.cabeza.rotation.z +=
        this.direccionCabeza *
        this.velocidadCabeza;

      if (this.cabeza.rotation.z > this.anguloMaxCabeza) {
        this.cabeza.rotation.z =
          this.anguloMaxCabeza;

        this.direccionCabeza = -1;
      }

      if (this.cabeza.rotation.z < this.anguloMinCabeza) {
        this.cabeza.rotation.z =
          this.anguloMinCabeza;

        this.direccionCabeza = 1;
      }
    }
  }
}

export { Carnivora };