const SEGMENTOS_RADIALES = 64;
const PI = 3.14;

import * as THREE from 'three';
import * as CSG from '../libs/three-bvh-csg.js';

class Nucleo extends THREE.Object3D {

    constructor(gui, titleGui) {
        super();

        this.createGUI(gui, titleGui);

        this.material = new THREE.MeshStandardMaterial({
            color: 0x228B22
        });

        this.materiales_anillos = [];

        // CAMBIAR AQUÍ EL TAMAÑO GENERAL
        var tamano = 1;

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

        // Rotaciones iniciales
        this.anillo2.rotation.x = Math.PI / 2;
        this.anillo3.rotation.z = Math.PI / 2;
        this.anillo4.rotation.z = Math.PI / 4;
        this.anillo5.rotation.z = Math.PI * 3 / 4;

        // Altura proporcional
        this.esfera.position.y = 1.0 * tamano;
    }

    createEsfera(tama) {

        const radio = 0.5 * tama;

        const geo = new THREE.SphereGeometry(
            radio,
            SEGMENTOS_RADIALES,
            SEGMENTOS_RADIALES
        );

        const textura = new THREE.TextureLoader().load('fire.jpg');

        this.material_esfera = new THREE.MeshStandardMaterial({
            map: textura,
            emissive: 0xff4500,
            emissiveMap: textura,
            emissiveIntensity: 2
        });

        let resultado = new CSG.Brush(
            geo,
            this.material_esfera
        );

        const evaluador = new CSG.Evaluator();

        const crateres = [

            { x: radio, y: 0.00 * tama, z: 0.00 * tama, sx: 0.10, sy: 0.50, sz: 0.35 },
            { x: -radio, y: 0.30 * tama, z: 0.00 * tama, sx: 0.10, sy: 0.50, sz: 0.35 },

            { x: 0.00, y: radio * 0.7, z: 0.10 * tama, sx: 0.18, sy: 0.22, sz: 0.18 },
            { x: 0.00, y: -radio * 0.8, z: 0.00, sx: 0.20, sy: 0.16, sz: 0.20 },

            { x: 0.30 * tama, y: 0.25 * tama, z: radio * 0.7, sx: 0.12, sy: 0.20, sz: 0.12 },
            { x: -0.25 * tama, y: -0.15 * tama, z: -radio * 0.7, sx: 0.16, sy: 0.18, sz: 0.16 },

            { x: 0.18 * tama, y: -0.30 * tama, z: 0.28 * tama, sx: 0.08, sy: 0.14, sz: 0.08 },
            { x: -0.22 * tama, y: 0.12 * tama, z: -0.24 * tama, sx: 0.07, sy: 0.12, sz: 0.07 },

            { x: 0.35 * tama, y: 0.05 * tama, z: -0.20 * tama, sx: 0.11, sy: 0.16, sz: 0.11 },
            { x: -0.32 * tama, y: -0.10 * tama, z: 0.22 * tama, sx: 0.09, sy: 0.15, sz: 0.09 }

        ];

        crateres.forEach(c => {

            const g = new THREE.SphereGeometry(
                0.5 * tama,
                SEGMENTOS_RADIALES,
                SEGMENTOS_RADIALES
            );

            g.scale(
                c.sx * tama,
                c.sy * tama,
                c.sz * tama
            );

            g.translate(c.x, c.y, c.z);

            const brush = new CSG.Brush(
                g,
                this.material_esfera
            );

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

            const x =
                desplazamiento +
                Math.cos(theta) * radioPequeno;

            const y =
                Math.sin(theta) * radioPequeno;

            puntos.push(
                new THREE.Vector2(x, y)
            );
        }

        const geometry =
            new THREE.LatheGeometry(
                puntos,
                SEGMENTOS_RADIALES
            );

        const textura =
            new THREE.TextureLoader().load('fire.jpg');

        const material =
            new THREE.MeshStandardMaterial({
                map: textura,
                emissive: 0xff4500,
                emissiveMap: textura,
                emissiveIntensity: 2
            });

        this.materiales_anillos.push(material);

        const anilloMesh =
            new THREE.Mesh(
                geometry,
                material
            );

        const anillo =
            new THREE.Object3D();

        anillo.add(anilloMesh);

        return anillo;
    }

    createPuntos(tama) {

        const particlesGeo =
            new THREE.BufferGeometry();

        const vertices = [];

        for (let i = 0; i < 200; i++) {

            vertices.push(
                (Math.random() - 0.5) * 2 * tama,
                (Math.random() - 0.5) * 2 * tama,
                (Math.random() - 0.5) * 2 * tama
            );
        }

        particlesGeo.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(
                vertices,
                3
            )
        );

        const particlesMat =
            new THREE.PointsMaterial({
                color: 0xffaa00,
                size: 0.02 * tama
            });

        const particles =
            new THREE.Points(
                particlesGeo,
                particlesMat
            );

        return particles;
    }

    createGUI(gui, titleGui) {

        this.guiControls = {
            rotar: false,
            fuego: false
        };

        var folder =
            gui.addFolder(titleGui);

        folder.add(
            this.guiControls,
            'rotar'
        ).name('Rotar anillos');

        folder.add(
            this.guiControls,
            'fuego'
        ).name('Modo fuego');
    }

    update() {

        this.orb.visible =
            this.guiControls.fuego;

        if (this.guiControls.rotar) {

            this.esfera.rotation.x += 0.01;
            this.esfera.rotation.y += 0.01;

            this.anillo1.rotation.x += 0.02;
            this.anillo2.rotation.z += 0.05;
            this.anillo3.rotation.z += 0.015;
            this.anillo4.rotation.z += 0.01;
            this.anillo5.rotation.z += 0.018;
        }

        const scale =
            1 +
            0.1 *
            Math.sin(Date.now() * 0.005);

        this.esfera.scale.set(
            scale,
            scale,
            scale
        );

        if (this.guiControls.fuego) {

            this.orb.rotation.y += 0.01;
            this.orb.rotation.x += 0.005;

            this.material_esfera.emissive.lerp(
                new THREE.Color(0xff4500),
                0.05
            );

            this.material_esfera.emissiveIntensity =
                Math.min(
                    this.material_esfera.emissiveIntensity + 0.02,
                    3
                );

            this.materiales_anillos.forEach(mat => {

                mat.emissive.lerp(
                    new THREE.Color(0xff4500),
                    0.05
                );

                mat.emissiveIntensity =
                    Math.min(
                        mat.emissiveIntensity + 0.02,
                        3
                    );
            });

        } else {

            this.material_esfera.emissive.lerp(
                new THREE.Color(0x000000),
                0.05
            );

            this.material_esfera.emissiveIntensity =
                Math.max(
                    this.material_esfera.emissiveIntensity - 0.02,
                    0
                );

            this.materiales_anillos.forEach(mat => {

                mat.emissive.lerp(
                    new THREE.Color(0x000000),
                    0.05
                );

                mat.emissiveIntensity =
                    Math.max(
                        mat.emissiveIntensity - 0.02,
                        0
                    );
            });
        }
    }
}

export { Nucleo };