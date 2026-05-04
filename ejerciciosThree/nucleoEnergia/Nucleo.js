const SEGMENTOS_RADIALES = 64;

import * as THREE from 'three';
import * as CSG from '../libs/three-bvh-csg.js';

class Nucleo extends THREE.Object3D {

  constructor() {
    super();

    // 🔁 Estados activos por defecto
    this.rotar = true;
    this.fuego = true;

    this.materiales_anillos = [];

    var tamano = 0.75;

    this.esfera = this.createEsfera(tamano);
    this.anillo1 = this.createAnillos(tamano);
    this.anillo2 = this.createAnillos(tamano);
    this.anillo3 = this.createAnillos(tamano);
    this.anillo4 = this.createAnillos(tamano);
    this.anillo5 = this.createAnillos(tamano);
    this.orb = this.createPuntos(tamano);

    this.add(this.esfera);

    this.esfera.add(this.anillo1);
    this.esfera.add(this.anillo2);
    this.esfera.add(this.anillo3);
    this.esfera.add(this.anillo4);
    this.esfera.add(this.anillo5);
    this.esfera.add(this.orb);

    // 🔥 visible desde el inicio
    this.orb.visible = true;

    // Rotaciones iniciales
    this.anillo2.rotation.x = Math.PI / 2;
    this.anillo3.rotation.z = Math.PI / 2;
    this.anillo4.rotation.z = Math.PI / 4;
    this.anillo5.rotation.z = Math.PI * 3 / 4;

    this.esfera.position.y = 1.0 * tamano;
  }

  createEsfera(tama) {

    const radio = 0.5 * tama;

    const geo = new THREE.SphereGeometry(
      radio,
      SEGMENTOS_RADIALES,
      SEGMENTOS_RADIALES
    );

    const textura = new THREE.TextureLoader().load('../nucleoEnergia/fire.jpg');

    this.material_esfera = new THREE.MeshStandardMaterial({
      map: textura,
      emissive: 0xff4500,
      emissiveMap: textura,
      emissiveIntensity: 2
    });

    let resultado = new CSG.Brush(geo, this.material_esfera);

    const evaluador = new CSG.Evaluator();

    const crateres = [
      { x: radio, y: 0, z: 0, sx: 0.10, sy: 0.50, sz: 0.35 },
      { x: -radio, y: 0.3 * tama, z: 0, sx: 0.10, sy: 0.50, sz: 0.35 },
      { x: 0, y: radio * 0.7, z: 0.1 * tama, sx: 0.18, sy: 0.22, sz: 0.18 },
      { x: 0, y: -radio * 0.8, z: 0, sx: 0.20, sy: 0.16, sz: 0.20 }
    ];

    crateres.forEach(c => {

      const g = new THREE.SphereGeometry(0.5 * tama, SEGMENTOS_RADIALES, SEGMENTOS_RADIALES);

      g.scale(c.sx * tama, c.sy * tama, c.sz * tama);
      g.translate(c.x, c.y, c.z);

      const brush = new CSG.Brush(g, this.material_esfera);

      resultado = evaluador.evaluate(
        resultado,
        brush,
        CSG.SUBTRACTION
      );
    });

    const obj = new THREE.Object3D();
    obj.add(resultado);

    return obj;
  }

  createAnillos(tama) {

    const puntos = [];
    const desplazamiento = 0.6 * tama;
    const radioPequeno = 0.05 * tama;

    for (let i = 0; i <= 20; i++) {
      const theta = (i / 20) * Math.PI * 2;

      puntos.push(new THREE.Vector2(
        desplazamiento + Math.cos(theta) * radioPequeno,
        Math.sin(theta) * radioPequeno
      ));
    }

    const geometry = new THREE.LatheGeometry(puntos, SEGMENTOS_RADIALES);

    const textura = new THREE.TextureLoader().load('../nucleoEnergia/fire.jpg');

    const material = new THREE.MeshStandardMaterial({
      map: textura,
      emissive: 0xff4500,
      emissiveMap: textura,
      emissiveIntensity: 2
    });

    this.materiales_anillos.push(material);

    const mesh = new THREE.Mesh(geometry, material);

    const anillo = new THREE.Object3D();
    anillo.add(mesh);

    return anillo;
  }

  createPuntos(tama) {

    const geo = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 200; i++) {
      vertices.push(
        (Math.random() - 0.5) * 2 * tama,
        (Math.random() - 0.5) * 2 * tama,
        (Math.random() - 0.5) * 2 * tama
      );
    }

    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    const mat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.02 * tama
    });

    return new THREE.Points(geo, mat);
  }

  update() {

    // 🔁 Rotación continua
    if (this.rotar) {
      this.esfera.rotation.x += 0.01;
      this.esfera.rotation.y += 0.01;

      this.anillo1.rotation.x += 0.02;
      this.anillo2.rotation.z += 0.05;
      this.anillo3.rotation.z += 0.015;
      this.anillo4.rotation.z += 0.01;
      this.anillo5.rotation.z += 0.018;
    }

    // 🔥 Pulso
    const scale = 1 + 0.1 * Math.sin(Date.now() * 0.005);
    this.esfera.scale.set(scale, scale, scale);

    // 🔥 Modo fuego SIEMPRE activo
    this.orb.rotation.y += 0.01;
    this.orb.rotation.x += 0.005;

    this.material_esfera.emissiveIntensity = 2 + Math.sin(Date.now() * 0.01);

    this.materiales_anillos.forEach(mat => {
      mat.emissiveIntensity = 2 + Math.sin(Date.now() * 0.01);
    });
  }
}

export { Nucleo };