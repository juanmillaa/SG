
// // Clases de la biblioteca

// import * as THREE from 'three'
// import { GUI } from 'gui'
// import { TrackballControls } from 'trackball'

// // Clases de mi proyecto

// import { Laberinto } from './Laberinto.js'
// import { Nucleo } from '../nucleoEnergia/Nucleo.js';
// import { Carnivora } from '../carnivora/Carnivora.js';
// import { Mosca } from '../mosca/Mosca.js';
// import { Llave } from '../llave/Llave.js';
// import { Puerta } from '../puerta/Puerta.js';
 
// /// La clase fachada del modelo
// /**
//  * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
//  */

// class MyScene extends THREE.Scene {
//   // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
//   // la visualización de la escena
//   constructor (myCanvas) { 
//     super();
    
    
//     // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
//     this.renderer = this.createRenderer(myCanvas);
    
//     // Se crea la interfaz gráfica de usuario
//     this.gui = this.createGUI ();
    
//     // Construimos los distinos elementos que tendremos en la escena
    
//     // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
//     // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
//     this.createLights ();
    
//     // Tendremos una cámara con un control de movimiento con el ratón
//     this.createCamera ();
    
//     // Un suelo 
//     this.createGround ();
    
//     // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
//     // Todas las unidades están en metros
//     this.axis = new THREE.AxesHelper (0.1);
//     this.add (this.axis);
    
    
//     // Por último creamos el modelo.
//     // Le pasamos una variable de sincronizacion
//     var laberintoCargado = $.Deferred();
//     this.laberinto = new Laberinto ("./laberinto.txt", laberintoCargado);
//     this.add (this.laberinto);
//     laberintoCargado.done (() => {
//       console.log ("Este bloque no se ejecuta hasta que se resuelve la variable de sincronización");
      


//       this.nucleo = new Nucleo(null, "nucleo");
//       this.add(this.nucleo);

//       this.laberinto.getMundoFromCelda(3, 5, this.nucleo.position);
//       this.nucleo.position.y = 0.75;

//       this.carnivora = new Carnivora();
//       this.add(this.carnivora);

//       this.laberinto.getMundoFromCelda(13, 15, this.carnivora.position);
//       this.carnivora.position.y = 0;

//       this.mosca = new Mosca();
//       this.add(this.mosca);

//       this.laberinto.getMundoFromCelda(8, 17, this.mosca.position);
//       this.mosca.position.y = 1.5; 

//       this.llave = new Llave();
//       this.add(this.llave);

//       this.laberinto.getMundoFromCelda(15, 20, this.llave.position);
//       this.llave.position.y = 0; 
    

//       this.puerta = new Puerta();
//       this.add(this.puerta);

//       this.laberinto.getMundoFromCelda(1, 24, this.puerta.position);
//       this.puerta.position.y = 0;
      
//       this.puerta.rotation.y = Math.PI / 2; 
//       this.puerta.position.z+=0.5;
//     });
//   }
  
//   createCamera () {
//     // Para crear una cámara le indicamos
//     //   El ángulo del campo de visión vértical en grados sexagesimales
//     //   La razón de aspecto ancho/alto
//     //   Los planos de recorte cercano y lejano
//     this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
//     // También se indica dónde se coloca
//     this.camera.position.set (0, 10, 10);
//     // Y hacia dónde mira
//     var look = new THREE.Vector3 (0,0,0);
//     this.camera.lookAt(look);
//     this.add (this.camera);
    
//     // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
//     this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);
    
//     // Se configuran las velocidades de los movimientos
//     this.cameraControl.rotateSpeed = 5;
//     this.cameraControl.zoomSpeed = -2;
//     this.cameraControl.panSpeed = 0.5;
//     // Debe orbitar con respecto al punto de mira de la cámara
//     this.cameraControl.target = look;
//   }
  
//   createGround () {
//     // El suelo es un Mesh, necesita una geometría y un material.
    
//     // La geometría es una caja con muy poca altura
//     var geometryGround = new THREE.BoxGeometry (100,0.02,100);
    
//     // El material se hará con una textura de madera
//     var texture = new THREE.TextureLoader().load('../imgs/cesped.jpg');
//     var materialGround = new THREE.MeshStandardMaterial ({map: texture});
     
//     // Ya se puede construir el Mesh
//     var ground = new THREE.Mesh (geometryGround, materialGround);
    
//     // Todas las figuras se crean centradas en el origen.
//     // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
//     ground.position.y = -0.01;
    
//     // Que no se nos olvide añadirlo a la escena, que en este caso es  this
//     this.add (ground);
//   }
  
//   createGUI () {
//     // Se crea la interfaz gráfica de usuario
//     var gui = new GUI();
    
//     // La escena le va a añadir sus propios controles. 
//     // Se definen mediante un objeto de control
//     // En este caso la intensidad de la luz y si se muestran o no los ejes
//     this.guiControls = {
//       // En el contexto de una función   this   alude a la función
//       lightPower : 500.0,  // La potencia de esta fuente de luz se mide en lúmenes
//       ambientIntensity : 0.5,   
//       axisOnOff : true
//     }

//     // Se crea una sección para los controles de esta clase
//     var folder = gui.addFolder ('Luz y Ejes');
    
//     // Se le añade un control para la potencia de la luz puntual
//     folder.add (this.guiControls, 'lightPower', 0, 1000, 20)
//       .name('Luz puntual : ')
//       .onChange ( (value) => this.setLightPower(value) );
    
//     // Otro para la intensidad de la luz ambiental
//     folder.add (this.guiControls, 'ambientIntensity', 0, 1, 0.05)
//       .name('Luz ambiental: ')
//       .onChange ( (value) => this.setAmbientIntensity(value) );
      
//     // Y otro para mostrar u ocultar los ejes
//     folder.add (this.guiControls, 'axisOnOff')
//       .name ('Mostrar ejes : ')
//       .onChange ( (value) => this.setAxisVisible (value) );
    
//     return gui;
//   }
  
//   createLights () {
//     // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
//     // La luz ambiental solo tiene un color y una intensidad
//     // Se declara como   var   y va a ser una variable local a este método
//     //    se hace así puesto que no va a ser accedida desde otros métodos
//     this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
//     // La añadimos a la escena
//     this.add (this.ambientLight);
    
//     // Se crea una luz focal que va a ser la luz principal de la escena
//     // La luz focal, además tiene una posición, y un punto de mira
//     // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
//     // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
//     this.pointLight = new THREE.SpotLight( 0xffffff );
//     this.pointLight.power = this.guiControls.lightPower;
//     this.pointLight.position.set( 2, 9, 1 );
//     console.log (this.pointLight);
//     this.add (this.pointLight);
//   }
  
//   setLightPower (valor) {
//     this.pointLight.power = valor;
//   }

//   setAmbientIntensity (valor) {
//     this.ambientLight.intensity = valor;
//   }  
  
//   setAxisVisible (valor) {
//     this.axis.visible = valor;
//   }
  
//   createRenderer (myCanvas) {
//     // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
//     // Se instancia un Renderer   WebGL
//     var renderer = new THREE.WebGLRenderer();
    
//     // Se establece un color de fondo en las imágenes que genera el render
//     renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    
//     // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
//     renderer.setSize(window.innerWidth, window.innerHeight);
    
//     // La visualización se muestra en el lienzo recibido
//     $(myCanvas).append(renderer.domElement);
    
//     return renderer;  
//   }
  
//   getCamera () {
//     // En principio se devuelve la única cámara que tenemos
//     // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
//     return this.camera;
//   }
  
//   setCameraAspect (ratio) {
//     // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
//     // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
//     this.camera.aspect = ratio;
//     // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
//     this.camera.updateProjectionMatrix();
//   }
    
//   onWindowResize () {
//     // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
//     // Hay que actualizar el ratio de aspecto de la cámara
//     this.setCameraAspect (window.innerWidth / window.innerHeight);
    
//     // Y también el tamaño del renderizador
//     this.renderer.setSize (window.innerWidth, window.innerHeight);
//   }

//   update () {
//     // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
//     this.renderer.render (this, this.getCamera());

//     // Se actualiza la posición de la cámara según su controlador
//     this.cameraControl.update();
    
//     // Se actualiza el resto del modelo
//     this.laberinto.update();
//     if (this.carnivora) {
//       this.carnivora.update();
//     }
//     if (this.nucleo) {
//       this.nucleo.update();
//     }

//     if (this.mosca) {
//       this.mosca.update();
//     }
//     // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
//     // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
//     // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
//     requestAnimationFrame(() => this.update())
//   }
// }


// /// La función   main
// $(function () {
  
//   // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
//   var scene = new MyScene("#WebGL-output");

//   // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
//   window.addEventListener ("resize", () => scene.onWindowResize());
  
//   // Que no se nos olvide, la primera visualización.
//   scene.update();
// });

// Clases de la biblioteca
import * as THREE from 'three'
import { FirstPersonControls } from '../libs/FirstPersonControls.js'

// Clases de mi proyecto
import { Laberinto } from './Laberinto.js'
import { Nucleo } from '../nucleoEnergia/Nucleo.js';
import { Carnivora } from '../carnivora/Carnivora.js';
import { Mosca } from '../mosca/Mosca.js';
import { Llave } from '../llave/Llave.js';
import { Puerta } from '../puerta/Puerta.js';

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();

    // Contadores
    this.pickupsRecogidos = [];
    this.totalPickups = 4;
    this.puertaAbierta = false;
    this.pickups = [];

    // Colisiones
    this.walls = [];
    this.playerRadius = 0.4;
    this.playerHeight = 1.6;

    // Cámara superior
    this.topCamera = null;
    this.topCameraViewport = {
      x: 20,      // posición X desde la izquierda (píxeles)
      y: 20,      // posición Y desde arriba (píxeles)
      width: 300, // ancho de la mini-ventana
      height: 200 // alto de la mini-ventana
    };
    this.playerMarker = null; // Marcador para la vista superior

    this.renderer = this.createRenderer(myCanvas);
    this.createLights();
    this.createCamera();
    this.createGround();

    // Cargar laberinto
    var laberintoCargado = $.Deferred();
    this.laberinto = new Laberinto("./laberinto.txt", laberintoCargado);
    this.add(this.laberinto);

    laberintoCargado.done(() => {
      console.log("✅ Laberinto cargado");

      // Guardar paredes
      this.collectWalls();

      // Crear objetos a recoger
      this.createPickups();

      // Crear cámara superior
      this.createTopCamera();

      // Iniciar controles
      this.initFirstPersonControls();

      // Configurar clics
      this.setupMouseEvents();
    });
  }

  createPickups() {
    // Núcleo
    this.nucleo = new Nucleo(null, "nucleo");
    this.add(this.nucleo);
    this.laberinto.getMundoFromCelda(3, 5, this.nucleo.position);
    this.nucleo.position.y = 0.75;
    this.pickups.push({ obj: this.nucleo, nombre: '💎 Núcleo', recogido: false });

    // Carnívora
    this.carnivora = new Carnivora();
    this.add(this.carnivora);
    this.laberinto.getMundoFromCelda(13, 15, this.carnivora.position);
    this.carnivora.position.y = 0;
    this.pickups.push({ obj: this.carnivora, nombre: '🌿 Carnívora', recogido: false });

    // Mosca
    this.mosca = new Mosca();
    this.add(this.mosca);
    this.laberinto.getMundoFromCelda(8, 17, this.mosca.position);
    this.mosca.position.y = 1.5;
    this.pickups.push({ obj: this.mosca, nombre: '🪰 Mosca', recogido: false });

    // Llave
    this.llave = new Llave();
    this.add(this.llave);
    this.laberinto.getMundoFromCelda(15, 20, this.llave.position);
    this.llave.position.y = 0;
    this.pickups.push({ obj: this.llave, nombre: '🔑 Llave', recogido: false });

    // Puerta
    this.puerta = new Puerta();
    this.add(this.puerta);
    this.laberinto.getMundoFromCelda(1, 24, this.puerta.position);
    this.puerta.position.y = 0;
    this.puerta.rotation.y = Math.PI / 2;
    this.puerta.position.z += 0.5;
    this.puertaOriginalY = this.puerta.rotation.y;
  }

  collectWalls() {
    this.laberinto.children.forEach(child => {
      if (child.isMesh || child.isObject3D) {
        this.walls.push(child);
      }
    });
    console.log(`🧱 ${this.walls.length} paredes detectadas`);
  }

  checkCollision(newPosition) {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      newPosition,
      new THREE.Vector3(this.playerRadius * 2, this.playerHeight, this.playerRadius * 2)
    );

    for (let wall of this.walls) {
      if (!wall.visible) continue;
      const wallBox = new THREE.Box3().setFromObject(wall);
      if (playerBox.intersectsBox(wallBox)) {
        return true;
      }
    }
    return false;
  }

  initFirstPersonControls() {
    this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.controls.movementSpeed = 5.0;
    this.controls.lookSpeed = 0.1;
    this.controls.activeLook = true;

    // Posición inicial (celda 1,1 del laberinto)
    this.laberinto.getMundoFromCelda(1, 1, this.camera.position);
    this.camera.position.y = this.playerHeight;
    this.originalPosition = this.camera.position.clone();

    console.log("🎮 Controles activados - Haz CLICK en la pantalla para empezar");
  }

  setupMouseEvents() {
    this.renderer.domElement.addEventListener('click', () => {
      this.checkPickupCollection();
      this.checkDoorInteraction();
    });
  }

  checkPickupCollection() {
    const distanciaMaxima = 2.5;

    for (let pickup of this.pickups) {
      if (!pickup.recogido && pickup.obj.visible) {
        const distancia = this.camera.position.distanceTo(pickup.obj.position);

        if (distancia < distanciaMaxima) {
          pickup.recogido = true;
          this.pickupsRecogidos.push(pickup.nombre);
          pickup.obj.visible = false;

          console.log(`✅ ¡${pickup.nombre} recogido! (${this.pickupsRecogidos.length}/${this.totalPickups})`);
          this.createPickupEffect(pickup.obj.position);
          this.updateDisplay();

          if (this.pickupsRecogidos.length === this.totalPickups) {
            console.log("🎉 ¡FELICIDADES! Has recogido todos los objetos. ¡Ve a la puerta! 🎉");
          }
        }
      }
    }
  }

  updateDisplay() {
    const statusDiv = document.getElementById('pickups-status');
    if (statusDiv) {
      statusDiv.innerHTML = `📦 ${this.pickupsRecogidos.length}/${this.totalPickups}`;
    }
  }

  createPickupEffect(position) {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const effect = new THREE.Mesh(geometry, material);
    effect.position.copy(position);
    this.add(effect);

    let time = 0;
    const animate = () => {
      time += 0.05;
      effect.scale.setScalar(1 + time);
      if (time < 1) {
        requestAnimationFrame(animate);
      } else {
        this.remove(effect);
      }
    };
    animate();
  }

  checkDoorInteraction() {
    if (this.puerta && !this.puertaAbierta && this.pickupsRecogidos.length === this.totalPickups) {
      const distancia = this.camera.position.distanceTo(this.puerta.position);
      if (distancia < 3.0) {
        this.abrirPuerta();
      }
    }
  }

  abrirPuerta() {
    this.puertaAbierta = true;
    console.log("🚪 ¡PUERTA ABIERTA! ¡Has completado el juego! 🚪");

    let angulo = 0;
    const animar = () => {
      angulo += 0.05;
      if (angulo <= Math.PI / 1.8) {
        this.puerta.rotation.y = this.puertaOriginalY + angulo;
        requestAnimationFrame(animar);
      }
    };
    animar();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
    this.add(this.camera);
  }

  createTopCamera() {
    // Calcular el tamaño del laberinto para ajustar la cámara
    const laberintoWidth = this.laberinto.xNumBloques * this.laberinto.anchoBloque;
    const laberintoHeight = this.laberinto.zNumBloques * this.laberinto.anchoBloque;
    const laberintoSize = Math.max(laberintoWidth, laberintoHeight);
    
    // Cámara ortográfica para vista superior
    this.topCamera = new THREE.OrthographicCamera(
      -laberintoSize / 2,  // left
      laberintoSize / 2,   // right
      laberintoSize / 2,   // top
      -laberintoSize / 2,  // bottom
      0.1,                 // near
      50                   // far
    );
    
    // Posicionar la cámara mirando desde arriba
    this.topCamera.position.set(0, 20, 0);
    this.topCamera.lookAt(0, 0, 0);
    
    // Añadir luz para la vista superior
    this.topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.topLight.position.set(5, 10, 5);
    this.add(this.topLight);
    
    // Crear marcador para el jugador en la vista superior
    this.playerMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff0000, emissiveIntensity: 0.3 })
    );
    this.add(this.playerMarker);
    
    console.log("📷 Cámara superior creada");
  }

  renderTopView() {
    if (!this.topCamera) return;
    
    // Actualizar posición del marcador del jugador
    if (this.playerMarker && this.camera) {
      this.playerMarker.position.copy(this.camera.position);
      this.playerMarker.position.y = 0.1;
    }
    
    // Guardar configuración actual del renderer
    const currentViewport = this.renderer.getViewport(new THREE.Vector4());
    const currentScissor = this.renderer.getScissor(new THREE.Vector4());
    const currentScissorTest = this.renderer.getScissorTest();
    
    // Configurar la región para la mini-ventana
    const width = this.topCameraViewport.width;
    const height = this.topCameraViewport.height;
    const x = this.topCameraViewport.x;
    const y = window.innerHeight - height - this.topCameraViewport.y;
    
    // Habilitar Scissor Test para dibujar solo en la región
    this.renderer.setScissorTest(true);
    this.renderer.setViewport(x, y, width, height);
    this.renderer.setScissor(x, y, width, height);
    
    // Limpiar la zona (fondo semitransparente)
    this.renderer.setClearColor(0x000000, 0.7);
    this.renderer.clear();
    
    // Renderizar la escena desde la cámara superior
    this.renderer.render(this, this.topCamera);
    
    // Restaurar configuración original
    this.renderer.setViewport(currentViewport.x, currentViewport.y, currentViewport.z, currentViewport.w);
    this.renderer.setScissor(currentScissor.x, currentScissor.y, currentScissor.z, currentScissor.w);
    this.renderer.setScissorTest(currentScissorTest);
    this.renderer.setClearColor(0xEEEEEE, 1.0);
  }

  drawViewportBorder() {
    const borderElement = document.getElementById('top-view-border');
    if (!borderElement) {
      const div = document.createElement('div');
      div.id = 'top-view-border';
      div.style.position = 'absolute';
      div.style.left = `${this.topCameraViewport.x - 2}px`;
      div.style.top = `${window.innerHeight - this.topCameraViewport.y - this.topCameraViewport.height - 2}px`;
      div.style.width = `${this.topCameraViewport.width + 4}px`;
      div.style.height = `${this.topCameraViewport.height + 4}px`;
      div.style.border = '3px solid #ffaa00';
      div.style.borderRadius = '8px';
      div.style.pointerEvents = 'none';
      div.style.zIndex = '1000';
      div.style.backgroundColor = 'rgba(0,0,0,0.2)';
      div.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
      document.body.appendChild(div);
    } else {
      borderElement.style.left = `${this.topCameraViewport.x - 2}px`;
      borderElement.style.top = `${window.innerHeight - this.topCameraViewport.y - this.topCameraViewport.height - 2}px`;
    }
  }

  createGround() {
    const geometry = new THREE.BoxGeometry(100, 0.02, 100);
    const texture = new THREE.TextureLoader().load('../imgs/cesped.jpg');
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const ground = new THREE.Mesh(geometry, material);
    ground.position.y = -0.01;
    this.add(ground);
  }

  createLights() {
    // Luz ambiental
    this.ambientLight = new THREE.AmbientLight('white', 0.5);
    this.add(this.ambientLight);

    // Luz principal direccional
    this.mainLight = new THREE.DirectionalLight(0xffffff, 1);
    this.mainLight.position.set(5, 10, 5);
    this.add(this.mainLight);

    // Luz de relleno desde abajo
    this.fillLight = new THREE.PointLight(0x4466cc, 0.3);
    this.fillLight.position.set(0, -1, 0);
    this.add(this.fillLight);

    // Luces de colores en el laberinto
    this.redLight = new THREE.PointLight(0xff0000, 0.5);
    this.redLight.position.set(5, 2, 5);
    this.add(this.redLight);

    this.greenLight = new THREE.PointLight(0x00ff00, 0.5);
    this.greenLight.position.set(-5, 2, 8);
    this.add(this.greenLight);

    this.blueLight = new THREE.PointLight(0x0000ff, 0.5);
    this.blueLight.position.set(8, 2, -3);
    this.add(this.blueLight);

    // Luz que cambia de color (requisito)
    this.changingLight = new THREE.PointLight(0xffaa00, 0.6);
    this.changingLight.position.set(0, 3, 0);
    this.add(this.changingLight);
    
    console.log("💡 Luces creadas");
  }

  createRenderer(myCanvas) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Activar sombras para mejor视觉效果
    $(myCanvas).append(renderer.domElement);
    return renderer;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Actualizar cámara superior
    if (this.topCamera && this.laberinto) {
      const laberintoSize = Math.max(
        this.laberinto.xNumBloques * this.laberinto.anchoBloque,
        this.laberinto.zNumBloques * this.laberinto.anchoBloque
      );
      this.topCamera.left = -laberintoSize / 2;
      this.topCamera.right = laberintoSize / 2;
      this.topCamera.top = laberintoSize / 2;
      this.topCamera.bottom = -laberintoSize / 2;
      this.topCamera.updateProjectionMatrix();
    }
    
    if (this.controls) this.controls.handleResize();
  }

  update() {
    // Guardar posición antes del movimiento
    if (this.camera && this.walls.length > 0) {
      this.originalPosition.copy(this.camera.position);
    }

    // Actualizar controles
    if (this.controls) {
      this.controls.update(1 / 60);

      // Verificar colisiones
      if (this.checkCollision(this.camera.position)) {
        this.camera.position.copy(this.originalPosition);
      }
      this.camera.position.y = this.playerHeight;
    }

    // Animar objetos no recogidos
    if (this.carnivora && !this.pickups.find(p => p.nombre === '🌿 Carnívora')?.recogido) {
      this.carnivora.update();
    }
    if (this.nucleo && !this.pickups.find(p => p.nombre === '💎 Núcleo')?.recogido) {
      this.nucleo.update();
    }
    if (this.mosca && !this.pickups.find(p => p.nombre === '🪰 Mosca')?.recogido) {
      this.mosca.update();
    }

    // ANIMACIÓN DE LUCES (requisito: luz que cambia)
    const time = Date.now() * 0.002;
    
    // Luces de colores que rotan
    this.redLight.color.setHSL(Math.sin(time) * 0.3 + 0.0, 1, 0.5);
    this.greenLight.color.setHSL(Math.sin(time + 2) * 0.3 + 0.33, 1, 0.5);
    this.blueLight.color.setHSL(Math.sin(time + 4) * 0.3 + 0.66, 1, 0.5);
    
    // Luz que cambia de color cíclicamente (REQUISITO)
    const hue = (time * 0.3) % 1;
    this.changingLight.color.setHSL(hue, 1, 0.5);
    // También cambia la intensidad
    this.changingLight.intensity = 0.4 + Math.sin(time * 3) * 0.3;
    
    // Rotar la luz cambiante para mayor efecto
    this.changingLight.position.x = Math.sin(time * 0.5) * 3;
    this.changingLight.position.z = Math.cos(time * 0.7) * 3;

    // Renderizar vista principal
    this.renderer.render(this, this.camera);
    
    // Renderizar vista superior (mini-ventana)
    this.renderTopView();
    
    // Dibujar borde de la vista superior
    this.drawViewportBorder();

    requestAnimationFrame(() => this.update());
  }
}

$(function () {
  const scene = new MyScene("#WebGL-output");
  window.addEventListener("resize", () => scene.onWindowResize());
  scene.update();
});