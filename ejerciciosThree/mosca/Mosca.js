import * as THREE from 'three'

class Mosca extends THREE.Object3D {

  constructor() {
    super();

    // El material se usa desde varios métodos. Por eso se almacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0x000000});
    this.tama = 1;

    // --- Cabeceo ---
    this.cabezagirando = true; // ACTIVO automáticamente
    this.velocidadCabeceo = 0.01;
    this.angulocabeza = 0;
    this.angulomincabeza = -Math.PI/6;
    this.angulomaxcabeza = Math.PI/6;
    this.sentidocabeceo = 1;

    // --- Aleteo ---
    this.aleteo = true; // ACTIVO automáticamente
    this.anguloAleteo = -Math.PI / 3;
    this.velocidadAleteo = 1;
    this.tamano = 0.3;
    this.amplitudAlas = THREE.MathUtils.degToRad(10);
    this.anguloAlaMin = this.anguloAleteo - this.amplitudAlas;
    this.anguloAlaMax = this.anguloAleteo + this.amplitudAlas;
    this.sentidoaleteo = 1;

    // --- Corneta ---
    this.cornetaEscalando = true; // ACTIVO automáticamente
    this.cornetaScaleFactor = 1;
    this.cornetaScaleMin = 1;
    this.cornetaScaleMax = 3.0;
    this.cornetaScaleSpeed = 0.01;
    this.cornetaScaleDireccion = 1; // 1 = crecer, -1 = achicar

    // Construcción del modelo
    this.cuerpo   = this.createBase(this.tamano);
    this.cabeza   = this.createHead(this.tamano);
    this.alas     = this.createAlas(this.tamano);
    this.patas    = this.createPatas(this.tamano);
    this.ojos     = this.createOjos(this.tamano);
    this.corneta  = this.createCorneta(this.tamano);

    this.add(this.cuerpo);
    this.cuerpo.add(this.cabeza);
    this.cuerpo.add(this.alas);
    this.cuerpo.add(this.patas);
    this.cabeza.add(this.ojos);
    this.cabeza.add(this.corneta);
    this.scale.set(this.tama, this.tama, this.tama);
  }

  createBase(tama) {
    var base = new THREE.Object3D();

    const shape = new THREE.Shape();
    shape.moveTo(-1, 0);
    shape.lineTo(-0.92, 0.27);
    shape.lineTo(-0.72, 0.59);
    shape.lineTo(-0.5, 0.81);
    shape.lineTo(-0.26, 0.93);
    shape.lineTo(0, 1);
    shape.lineTo(0.26, 0.93);
    shape.lineTo(0.72, 0.59);
    shape.lineTo(1, 0);
    shape.lineTo(0.83, -0.42);
    shape.lineTo(0, -0.8);
    shape.lineTo(-0.83, -0.42);
    shape.lineTo(-1, 0);

    var extrudeSettings_cuerpo = {
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.99,
      curveSegments: 30,
      steps: 9,
    };

    var geometriaCuerpo = new THREE.ExtrudeGeometry(shape, extrudeSettings_cuerpo);
    geometriaCuerpo.center();
    geometriaCuerpo.translate(0, 2, -2.2);
    var cuerpo = new THREE.Mesh(geometriaCuerpo, this.material);
    cuerpo.scale.set(tama * 0.3, tama * 0.3, tama * 0.5);

    base.add(cuerpo);
    return base;
  }

  createHead(tama) {
    let base = new THREE.Object3D();
    const forma_cabeza = new THREE.Shape();

    forma_cabeza.moveTo(-1, 0);
    forma_cabeza.lineTo(-0.5531075811241097, -0.6490366908323321);
    forma_cabeza.lineTo(-0.29291197908027333, -0.8051540520586337);
    forma_cabeza.lineTo(0, -0.8051540520586337);
    forma_cabeza.lineTo(0.2665085653139749, -0.8051540520586337);
    forma_cabeza.lineTo(0.5136943872556194, -0.6490366908323321);
    forma_cabeza.lineTo(0.7868997694016476, -0.2847628479709616);
    forma_cabeza.lineTo(1, 0);
    forma_cabeza.lineTo(1.1706882824163072, 0.3722310471897241);
    forma_cabeza.lineTo(1.248746963029458, 0.6714559895401355);
    forma_cabeza.lineTo(1.248746963029458, 0.9836907119927388);
    forma_cabeza.lineTo(1.105639381905348, 1.2178667538321912);
    forma_cabeza.lineTo(0.7934046594527443, 1.3349547747519175);
    forma_cabeza.lineTo(0.4161210364891816, 1.3869938951606846);
    forma_cabeza.lineTo(0, 1.4195183454161642);
    forma_cabeza.lineTo(-0.4880586806131506, 1.4065085653139724);
    forma_cabeza.lineTo(-0.8653423035767134, 1.3154401045986297);
    forma_cabeza.lineTo(-1.2035965862337008, 1.0942738428613694);
    forma_cabeza.lineTo(-1.275150376795755, 0.7365048900510945);
    forma_cabeza.lineTo(-1.1645672459271252, 0.40475549744520395);
    forma_cabeza.lineTo(-1, 0);

    var extrudeSettings_cabeza = {
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSegments: 4,
      steps: 9,
    };

    var geometriaCabeza = new THREE.ExtrudeGeometry(forma_cabeza, extrudeSettings_cabeza);
    geometriaCabeza.rotateX(-Math.PI / 2);
    var cabeza = new THREE.Mesh(geometriaCabeza, this.material);
    cabeza.scale.set(tama * 0.2, tama * 0.2, tama * 0.2);

    base.add(cabeza);
    base.position.set(tama * 0.05, tama * 0.5, 0);
    return base;
  }

  createOjos(tama) {
    var base = new THREE.Object3D();
    var geometry = new THREE.SphereGeometry(15, 9, 20, 6.283185307179586, 3.96468992883032, 0, 3.277353);
    var material = new THREE.MeshBasicMaterial({ color: 0xb81414 });

    var ojo_izquierdo = new THREE.Mesh(geometry, material);
    ojo_izquierdo.rotation.x = -Math.PI / 2;
    ojo_izquierdo.rotation.y = Math.PI / 7;

    var factor = 0.015 * tama;
    ojo_izquierdo.scale.set(factor, factor * 1.5, factor);

    var edges = new THREE.EdgesGeometry(geometry);
    var lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    var wireframe = new THREE.LineSegments(edges, lineMaterial);
    ojo_izquierdo.add(wireframe);

    var separacion = 0.25 * tama;
    ojo_izquierdo.position.x = separacion;
    base.add(ojo_izquierdo);

    var ojo_derecho = ojo_izquierdo.clone();
    ojo_derecho.position.x = -separacion;
    ojo_derecho.scale.z *= -1;
    ojo_derecho.rotation.y = Math.PI;
    base.add(ojo_derecho);

    base.position.set(0, 0.5 * tama, 0);
    return base;
  }

  createCorneta(tama) {
    const base = new THREE.Object3D();
    const puntos = [];

    for (let i = 0; i < 8; i++) {
      let x = 0.4 + Math.pow(i * 0.2, 3) * 0.8;
      let y = i * 0.8;
      puntos.push(new THREE.Vector2(x * tama, y * tama));
    }

    const geometry = new THREE.LatheGeometry(puntos, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xb81414, side: THREE.DoubleSide });
    this.corneta = new THREE.Mesh(geometry, material);

    var factor = 0.5 * tama;
    this.corneta.scale.set(factor, factor * 1.2, factor);
    this.corneta.rotation.x = Math.PI / 2 + Math.PI / 6;

    base.add(this.corneta);
    base.position.set(0, 0.25 * tama, 0.50 * tama);
    return base;
  }

  createAlas(tama) {
    const base = new THREE.Object3D();

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3 * tama, 0.4 * tama, 0.7 * tama, 0.9 * tama, 1.1 * tama, 1.0 * tama);
    shape.bezierCurveTo(1.3 * tama, 0.8 * tama, 1.3 * tama, 0.2 * tama, 1.0 * tama, -0.2 * tama);
    shape.bezierCurveTo(0.6 * tama, -0.6 * tama, 0.2 * tama, -0.4 * tama, 0, -0.1 * tama);
    shape.lineTo(0, 0);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.01,
      bevelEnabled: false,
      curveSegments: 32
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });

    const alaDerecha = new THREE.Mesh(geometry, material);
    let factor = tama * 3;

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
    const bordeDerecha = new THREE.LineSegments(edges, lineMat);
    alaDerecha.add(bordeDerecha);

    const crearLinea = (pts) => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return new THREE.Line(geo, lineMat);
    };

    const line1 = crearLinea([
      new THREE.Vector3(0 * tama, 0, 0.02 * tama),
      new THREE.Vector3(0.5 * tama, 0.6 * tama, 0.02 * tama),
      new THREE.Vector3(1.0 * tama, 0.8 * tama, 0.02 * tama)
    ]);
    const line2 = crearLinea([
      new THREE.Vector3(0 * tama, 0, 0.02 * tama),
      new THREE.Vector3(0.6 * tama, 0.2 * tama, 0.02 * tama),
      new THREE.Vector3(1.0 * tama, 0.3 * tama, 0.02 * tama)
    ]);
    const line3 = crearLinea([
      new THREE.Vector3(0 * tama, 0, 0.02 * tama),
      new THREE.Vector3(0.5 * tama, -0.2 * tama, 0.02 * tama),
      new THREE.Vector3(0.9 * tama, -0.1 * tama, 0.02 * tama)
    ]);

    alaDerecha.add(line1, line2, line3);
    alaDerecha.scale.set(factor - 0.2, factor, factor);
    alaDerecha.position.set(0, 0, 0);

    const pivotDerecho = new THREE.Object3D();
    pivotDerecho.add(alaDerecha);
    pivotDerecho.position.set(-0.15 * tama, 1.1 * tama, -0.9 * tama);
    pivotDerecho.rotation.x = -Math.PI / 3;

    const pivotIzquierdo = pivotDerecho.clone();
    pivotIzquierdo.position.x = 0.15 * tama;
    pivotIzquierdo.children[0].scale.x *= -1;

    base.add(pivotDerecho);
    base.add(pivotIzquierdo);

    this.pivotD = pivotDerecho;
    this.pivotI = pivotIzquierdo;

    return base;
  }

  createPatas(tama) {
    var patas = new THREE.Object3D();
    var patas_derechas = new THREE.Object3D();
    var patas_derecha_1 = new THREE.Object3D();
    var patas_derecha_2 = new THREE.Object3D();
    var patas_derecha_3 = new THREE.Object3D();
    patas.add(patas_derechas);

    var circulo = new THREE.Shape();
    circulo.absarc(0, 0, 0.01, 0, 2 * Math.PI, false);

    const pts = [
      { x: 0.00000, y: 1.00000 },
      { x: 0.03524, y: 1.00123 },
      { x: 0.05651, y: 0.97996 },
      { x: 0.05887, y: 0.93033 },
      { x: 0.05769, y: 0.83107 },
      { x: 0.08723, y: 0.80271 },
      { x: 0.13631, y: 0.8 },
      { x: 0.20000, y: 0.80000 },
      { x: 0.05887, y: 0.83543 }
    ];

    var curvePoints = pts.map(p => new THREE.Vector3(p.x, p.y, 0));
    var path = new THREE.CatmullRomCurve3(curvePoints);
    var options = { steps: 100, curveSegments: 32, extrudePath: path };
    var geometry = new THREE.ExtrudeGeometry(circulo, options);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xBAD123 }));
    mesh.scale.set(4 * tama, 4 * tama, 7 * tama);

    patas_derecha_1.add(mesh);
    patas_derecha_2 = patas_derecha_1.clone();
    patas_derecha_3 = patas_derecha_1.clone();

    patas_derecha_1.position.set(0.45 * tama, -3.25 * tama, -0.8 * tama);
    patas_derecha_2.position.set(0.45 * tama, -3.25 * tama, -1.2 * tama);
    patas_derecha_3.position.set(0.45 * tama, -3.25 * tama, -1.6 * tama);

    patas_derechas.add(patas_derecha_1);
    patas_derechas.add(patas_derecha_2);
    patas_derechas.add(patas_derecha_3);

    var patas_izquierdas = patas_derechas.clone();
    patas_izquierdas.scale.x *= -1;
    patas.add(patas_izquierdas);

    return patas;
  }

  update() {
    // --- Cabeceo automático ---
    if (this.cabezagirando) {
      this.cabeza.rotation.z += this.sentidocabeceo * this.velocidadCabeceo;
      if (this.cabeza.rotation.z > this.angulomaxcabeza) {
        this.cabeza.rotation.z = this.angulomaxcabeza;
        this.sentidocabeceo = -1;
      } else if (this.cabeza.rotation.z < this.angulomincabeza) {
        this.cabeza.rotation.z = this.angulomincabeza;
        this.sentidocabeceo = 1;
      }
    }

    // --- Aleteo automático ---
    if (this.aleteo) {
      this.pivotD.rotation.x += this.sentidoaleteo * this.velocidadAleteo;
      this.pivotI.rotation.x += this.sentidoaleteo * this.velocidadAleteo;

      if (this.pivotD.rotation.x > this.anguloAlaMax || this.pivotI.rotation.x > this.anguloAlaMax) {
        this.sentidoaleteo = -1;
        this.pivotD.rotation.x = this.anguloAlaMax;
        this.pivotI.rotation.x = this.anguloAlaMax;
      }

      if (this.pivotD.rotation.x < this.anguloAlaMin || this.pivotI.rotation.x < this.anguloAlaMin) {
        this.sentidoaleteo = 1;
        this.pivotD.rotation.x = this.anguloAlaMin;
        this.pivotI.rotation.x = this.anguloAlaMin;
      }
    }

    // --- Corneta automática (oscila entre min y max) ---
    if (this.cornetaEscalando) {
      this.cornetaScaleFactor += this.cornetaScaleDireccion * this.cornetaScaleSpeed;

      if (this.cornetaScaleFactor >= this.cornetaScaleMax) {
        this.cornetaScaleFactor = this.cornetaScaleMax;
        this.cornetaScaleDireccion = -1; // Ahora encoge
      } else if (this.cornetaScaleFactor <= this.cornetaScaleMin) {
        this.cornetaScaleFactor = this.cornetaScaleMin;
        this.cornetaScaleDireccion = 1; // Ahora crece
      }

      this.corneta.scale.set(1, 1, this.cornetaScaleFactor);
    }
  }
}

export { Mosca }