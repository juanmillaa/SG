const SEGMENTOS_RADIALES = 64;
const PI = 3.14;

import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'
const ALTURA_BASE = 0.35;
const ALTURA_TRONCO = 0.8;

class Nucleo extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();

        // Se crea la parte de la interfaz que corresponde al nucleo
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
        this.createGUI(gui, titleGui);

        // El material se usa desde varios métodos. Por eso se alamacena en un atributo
        this.material = new THREE.MeshStandardMaterial({ color: 0x228B22 });

        this.materiales_anillos = [];


        // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
        var tamano = 1;   // 15 cm de largo. Las unidades son metros


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
        this.orb.visible = false;


        // opcional: posiciona cada anillo ligeramente distinto
        this.anillo2.rotation.x = Math.PI / 2;
        this.anillo3.rotation.z = Math.PI / 2;
        this.anillo4.rotation.z = Math.PI / 4;
        this.anillo5.rotation.z = Math.PI * 3 / 4;
        this.esfera.position.y = 0.5 * tamano + 0.5;  // el +0.5 para que anillos no chquen suelo



    }
 

    createEsfera(tama) {
        var radio = 0.5 * tama;
        const geo = new THREE.SphereGeometry(radio, SEGMENTOS_RADIALES, SEGMENTOS_RADIALES);

        const textura = new THREE.TextureLoader().load('fire.jpg');
        this.material_esfera = new THREE.MeshStandardMaterial({
            map: textura,
            emissive: 0xff4500,         // naranja-rojizo
            emissiveMap: textura,
            emissiveIntensity: 2        // un poco más brillante
        });

        var brush_esfera = new CSG.Brush(geo, this.material_esfera);

        // Primer "cráter"
        const geo_esfera_quitar = new THREE.SphereGeometry(0.5 * tama, SEGMENTOS_RADIALES, SEGMENTOS_RADIALES);
        geo_esfera_quitar.scale(0.1 * tama, 0.5 * tama, 0.35 * tama);
        geo_esfera_quitar.translate(radio, 0, 0);
        var brush_esfera_quitar = new CSG.Brush(geo_esfera_quitar, this.material_esfera);

        // Segundo "cráter"
        const geo_esfera_quitar2 = new THREE.SphereGeometry(0.5 * tama, SEGMENTOS_RADIALES, SEGMENTOS_RADIALES);
        geo_esfera_quitar2.scale(0.1 * tama, 0.5 * tama, 0.35 * tama);
        geo_esfera_quitar2.translate(-radio, 0.3, 0);
        var brush_esfera_quitar2 = new CSG.Brush(geo_esfera_quitar2, this.material_esfera); // <-- CORREGIDO

        var evaluador = new CSG.Evaluator();

        // Aplicar las sustracciones en orden
        var crater = evaluador.evaluate(brush_esfera, brush_esfera_quitar, CSG.SUBTRACTION);
        var crater_final = evaluador.evaluate(crater, brush_esfera_quitar2, CSG.SUBTRACTION);

        var obj_final = new THREE.Object3D();
        obj_final.add(crater_final);

        return obj_final;
    }
    createAnillos(tama) {

        const puntos = [];
        const desplazamiento = 0.6 * tama; // esto es para que la circunferncia este centraada en (tama*desplazamiento, 0)
        const radioPequeno = 0.05 * tama;

        for (let i = 0; i <= 20; i++) {
            const theta = (i / 20) * Math.PI * 2;
            const x = desplazamiento + Math.cos(theta) * radioPequeno;
            const y = Math.sin(theta) * radioPequeno;
            puntos.push(new THREE.Vector2(x, y));
        }

        const geometry = new THREE.LatheGeometry(puntos, 64);

        const textura = new THREE.TextureLoader().load('fire.jpg');


        const material = new THREE.MeshStandardMaterial({
            map: textura,
            emissive: 0xff4500,         // naranja-rojizo
            emissiveMap: textura,
            emissiveIntensity: 2        // un poco más brillante
        });
        this.materiales_anillos.push(material);
        const anilloMesh = new THREE.Mesh(geometry, material);
        const anillo = new THREE.Object3D();

        anillo.add(anilloMesh);
        return anillo;
    }
    createPuntos(tama) {
        const particlesGeo = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < 200; i++) {
            vertices.push(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
        }

        particlesGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const particlesMat = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.02
        });

        const particles = new THREE.Points(particlesGeo, particlesMat);

        return particles; // 👈 IMPORTANTE
    }

    createGUI(gui, titleGui) {
        this.guiControls = {
            rotar: false,
            fuego: false
        };

        var folder = gui.addFolder(titleGui);
        folder.add(this.guiControls, 'rotar').name('Rotar anillos');
        folder.add(this.guiControls, 'fuego').name('Modo fuego');
    }
    update() {
        this.orb.visible = this.guiControls.fuego;
        if (this.guiControls.rotar) {
            this.esfera.rotation.x += 0.01;
            this.esfera.rotation.y += 0.01;
            this.anillo1.rotation.x += 0.02;
            this.anillo2.rotation.z += 0.05;
            this.anillo3.rotation.z += 0.015;
            this.anillo4.rotation.z += 0.01
            this.anillo5.rotation.z += 0.018
        }
        const scale = 1 + 0.1 * Math.sin(Date.now() * 0.005);
        this.esfera.scale.set(scale, scale, scale);

        if (this.guiControls.fuego) {
            this.orb.rotation.y += 0.01;
            this.orb.rotation.x += 0.005;
            // color naranja fuego progresivo
            this.material_esfera.emissive.lerp(new THREE.Color(0xff4500), 0.05);
            // subir intensidad poco a poco
            this.material_esfera.emissiveIntensity = Math.min(
                this.material_esfera.emissiveIntensity + 0.02,
                3
            );
            this.materiales_anillos.forEach(mat => {
                mat.emissive.lerp(new THREE.Color(0xff4500), 0.05);
                mat.emissiveIntensity = Math.min(
                    mat.emissiveIntensity + 0.02,
                    3
                );
            });

        } else {
            // volver a estado normal suavemente
            this.material_esfera.emissive.lerp(new THREE.Color(0x000000), 0.05);
            this.material_esfera.emissiveIntensity = Math.max(
                this.material_esfera.emissiveIntensity - 0.02,
                0
            );
            this.materiales_anillos.forEach(mat => {
                mat.emissive.lerp(new THREE.Color(0x000000), 0.05);
                mat.emissiveIntensity = Math.max(
                    mat.emissiveIntensity - 0.02,
                    0
                );
            });

        }
    }

}

export { Nucleo }
