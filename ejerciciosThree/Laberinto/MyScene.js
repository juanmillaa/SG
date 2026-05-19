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
    this.playerRadius = 0.22;
    this.playerHeight = 1;

    // Temporizador y estadísticas
    this.gameStartTime = null;
    this.gameEndTime = null;
    this.gameFinished = false;

    // Cámara superior (minimapa)
    this.topCamera = null;
    this.topCameraViewport = { x: 20, y: 20, width: 300, height: 200 };
    this.playerMarker = null;

    // Raycaster reutilizable
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 2;

    this.renderer = this.createRenderer(myCanvas);
    this.createLights();
    this.createStars();
    this.createCamera();
    this.createGround();
    this.createPickupHUD();

    // Cargar laberinto
    var laberintoCargado = $.Deferred();
    this.laberinto = new Laberinto("./laberinto.txt", laberintoCargado);
    this.add(this.laberinto);

    laberintoCargado.done(() => {
      console.log("✅ Laberinto cargado");
      this.collectWalls();
      this.createPickups();
      this.createTopCamera();
      this.initFirstPersonControls();
      this.setupMouseEvents();
      this.startGameTimer();

      // ── Reposicionar antorchas en coordenadas mundo ──────────────
      const celdas = [
        [3, 5], [7, 3], [13, 15], [5, 20], [15, 10],
        [10, 8], [12, 22], [4, 14], [9, 18], [16, 5]
      ];
      this.torches.forEach((light, i) => {
        const pos = new THREE.Vector3();
        this.laberinto.getMundoFromCelda(celdas[i][0], celdas[i][1], pos);
        light.position.set(pos.x, 1.5, pos.z);
      });
    });
  }

  // ─────────────────────────────────────────────
  //  HUD DE PICKUPS
  // ─────────────────────────────────────────────

  createPickupHUD() {
    // Estilos
    const style = document.createElement('style');
    style.textContent = `
      #pickup-hud {
        position: fixed;
        top: 16px;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(10,10,26,0.82);
        border: 1.5px solid rgba(255,170,0,0.7);
        border-radius: 14px;
        padding: 8px 16px;
        z-index: 1000;
        pointer-events: none;
      }
      .pu-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .pu-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid rgba(255,170,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: rgba(255,255,255,0.04);
        filter: grayscale(1) opacity(0.3);
        transition: filter 0.4s, box-shadow 0.4s;
      }
      .pu-icon.collected {
        filter: none;
        border-color: #ffaa00;
        background: rgba(255,170,0,0.15);
        box-shadow: 0 0 8px rgba(255,170,0,0.5);
      }
      .pu-label {
        font-size: 9px;
        font-family: Arial, sans-serif;
        color: rgba(255,255,255,0.4);
        letter-spacing: 0.04em;
      }
      .pu-label.collected { color: #ffcc66; }
      #pu-divider {
        width: 1px;
        height: 46px;
        background: rgba(255,170,0,0.25);
      }
      #pu-counter {
        font-size: 13px;
        font-family: Arial, sans-serif;
        font-weight: bold;
        color: #ffaa00;
        white-space: nowrap;
        transition: color 0.4s;
      }
    `;
    document.head.appendChild(style);

    // Estructura HTML
    const hud = document.createElement('div');
    hud.id = 'pickup-hud';
    hud.innerHTML = `
      <div class="pu-item">
        <div class="pu-icon" id="hud-nucleo">💎</div>
        <span class="pu-label" id="hud-nucleo-label">Núcleo</span>
      </div>
      <div class="pu-item">
        <div class="pu-icon" id="hud-carnivora">🌿</div>
        <span class="pu-label" id="hud-carnivora-label">Carnívora</span>
      </div>
      <div class="pu-item">
        <div class="pu-icon" id="hud-mosca">🪰</div>
        <span class="pu-label" id="hud-mosca-label">Mosca</span>
      </div>
      <div class="pu-item">
        <div class="pu-icon" id="hud-llave">🔑</div>
        <span class="pu-label" id="hud-llave-label">Llave</span>
      </div>
      <div id="pu-divider"></div>
      <span id="pu-counter">0 / 4</span>
    `;
    document.body.appendChild(hud);
  }

  // ─────────────────────────────────────────────
  //  PICKUPS
  // ─────────────────────────────────────────────

  createPickups() {
    this.nucleo = new Nucleo(null, "nucleo");
    this.add(this.nucleo);
    this.laberinto.getMundoFromCelda(3, 5, this.nucleo.position);
    this.nucleo.position.y = 0.75;
    this.pickups.push({ obj: this.nucleo, nombre: '💎 Núcleo', recogido: false });

    this.carnivora = new Carnivora();
    this.add(this.carnivora);
    this.laberinto.getMundoFromCelda(13, 15, this.carnivora.position);
    this.carnivora.position.y = 0;
    this.pickups.push({ obj: this.carnivora, nombre: '🌿 Carnívora', recogido: false });

    this.mosca = new Mosca();
    this.add(this.mosca);
    this.laberinto.getMundoFromCelda(8, 23, this.mosca.position);
    this.mosca.position.y = 1.25;
    // La mosca tiene colisión hasta que se recoge
    this.walls.push(this.mosca);
    this.pickups.push({ obj: this.mosca, nombre: '🪰 Mosca', recogido: false });

    this.llave = new Llave();
    this.add(this.llave);
    this.laberinto.getMundoFromCelda(15, 20, this.llave.position);
    this.llave.position.y = 0;
    this.pickups.push({ obj: this.llave, nombre: '🔑 Llave', recogido: false });

    // Puerta: sólida hasta que se abra
    this.puerta = new Puerta();
    this.add(this.puerta);
    this.laberinto.getMundoFromCelda(1, 24, this.puerta.position);
    this.puerta.position.y = 0;
    this.puerta.rotation.y = Math.PI / 2;
    this.puerta.position.z += 0.5;
    this.puertaRotacionOriginal = this.puerta.rotation.y;
    this.walls.push(this.puerta);
  }

  // ─────────────────────────────────────────────
  //  COLISIONES
  // ─────────────────────────────────────────────

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

  removeFromWalls(obj) {
    const idx = this.walls.indexOf(obj);
    if (idx !== -1) this.walls.splice(idx, 1);
  }

  // ─────────────────────────────────────────────
  //  EVENTOS DE RATÓN (RAYCAST UNIFICADO)
  // ─────────────────────────────────────────────

  setupMouseEvents() {
    this.renderer.domElement.addEventListener('click', () => {
      this.handleRaycastInteraction();
    });
  }

  handleRaycastInteraction() {
    // Dirección hacia donde mira la cámara
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    this.raycaster.set(this.camera.position, direction);

    // ── Fase 1: intentar recoger pickups pendientes ──────────────
    const pickupsPendientes = this.pickups
      .filter(p => !p.recogido)
      .map(p => p.obj);

    if (pickupsPendientes.length > 0) {
      const hitsPickup = this.raycaster.intersectObjects(pickupsPendientes, true);

      if (hitsPickup.length > 0) {
        const meshImpactado = hitsPickup[0].object;
        const pickup = this.pickups.find(p =>
          !p.recogido && this.perteneceA(meshImpactado, p.obj)
        );

        if (pickup) {
          this.recogerPickup(pickup);
          return;
        }
      }
    }

    // ── Fase 2: intentar abrir la puerta ─────────────────────────
    if (!this.puertaAbierta) {
      const hitsPuerta = this.raycaster.intersectObjects([this.puerta], true);

      if (hitsPuerta.length > 0) {
        if (this.pickupsRecogidos.length === this.totalPickups) {
          this.abrirPuerta();
        } else {
          const faltan = this.totalPickups - this.pickupsRecogidos.length;
          console.log(`🔒 Puerta bloqueada: te faltan ${faltan} objeto(s)`);
          this.mostrarMensaje(`🔒 Necesitas ${faltan} objeto(s) más para abrir la puerta`);
        }
      }
    }
  }

  /**
   * Comprueba si un mesh descendiente pertenece a un objeto raíz.
   */
  perteneceA(mesh, raiz) {
    let actual = mesh;
    while (actual) {
      if (actual === raiz) return true;
      actual = actual.parent;
    }
    return false;
  }

  // ─────────────────────────────────────────────
  //  LÓGICA DE JUEGO
  // ─────────────────────────────────────────────

  recogerPickup(pickup) {
    pickup.recogido = true;
    pickup.obj.visible = false;

    // Si el pickup tenía colisión (ej: mosca), quitarla
    this.removeFromWalls(pickup.obj);

    this.pickupsRecogidos.push(pickup.nombre);
    console.log(`✅ ${pickup.nombre} recogido (${this.pickupsRecogidos.length}/${this.totalPickups})`);

    this.createPickupEffect(pickup.obj.position.clone());
    this.updateDisplay();

    if (this.pickupsRecogidos.length === this.totalPickups) {
      console.log("🎉 ¡Todos los objetos recogidos! Ve a la puerta.");
      this.mostrarMensaje("🎉 ¡Todos los objetos recogidos! Ve a la puerta.");
    }
  }

  abrirPuerta() {
    this.puertaAbierta = true;
    console.log("🚪 ¡Puerta abierta!");

    this.removeFromWalls(this.puerta);

    let angulo = 0;
    const animar = () => {
      angulo += 0.05;
      this.puerta.rotation.y = this.puertaRotacionOriginal + angulo;
      if (angulo < Math.PI / 1.8) {
        requestAnimationFrame(animar);
      } else {
        setTimeout(() => this.showStatsPanel(), 500);
      }
    };
    animar();
  }

  updateDisplay() {
    // Mapa nombre → id del HUD
    const map = {
      '💎 Núcleo': 'nucleo',
      '🌿 Carnívora': 'carnivora',
      '🪰 Mosca': 'mosca',
      '🔑 Llave': 'llave',
    };

    // Iluminar los iconos de los pickups recogidos
    this.pickups.forEach(p => {
      const key = map[p.nombre];
      if (!key) return;
      const icon = document.getElementById(`hud-${key}`);
      const label = document.getElementById(`hud-${key}-label`);
      if (p.recogido) {
        icon?.classList.add('collected');
        label?.classList.add('collected');
      }
    });

    // Actualizar contador
    const counter = document.getElementById('pu-counter');
    if (counter) {
      const n = this.pickupsRecogidos.length;
      counter.textContent = `${n} / ${this.totalPickups}`;
      if (n === this.totalPickups) {
        counter.style.color = '#44ff88';
      }
    }
  }

  mostrarMensaje(texto, duracion = 3000) {
    let msg = document.getElementById('hud-mensaje');
    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'hud-mensaje';
      msg.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.75);
        color: #fff;
        padding: 10px 24px;
        border-radius: 20px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        z-index: 1500;
        pointer-events: none;
        transition: opacity 0.3s;
      `;
      document.body.appendChild(msg);
    }

    msg.textContent = texto;
    msg.style.opacity = '1';
    clearTimeout(msg._timeout);
    msg._timeout = setTimeout(() => { msg.style.opacity = '0'; }, duracion);
  }

  createPickupEffect(position) {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true });
    const effect = new THREE.Mesh(geometry, material);
    effect.position.copy(position);
    this.add(effect);

    let t = 0;
    const animate = () => {
      t += 0.05;
      effect.scale.setScalar(1 + t * 2);
      effect.material.opacity = Math.max(0, 1 - t);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.remove(effect);
        geometry.dispose();
        material.dispose();
      }
    };
    animate();
  }

  // ─────────────────────────────────────────────
  //  TEMPORIZADOR Y ESTADÍSTICAS
  // ─────────────────────────────────────────────

  startGameTimer() {
    this.gameStartTime = Date.now();
    console.log("⏱️ Temporizador iniciado");
  }

  showStatsPanel() {
    if (this.gameFinished) return;
    this.gameFinished = true;
    this.gameEndTime = Date.now();

    const totalTime = (this.gameEndTime - this.gameStartTime) / 1000;
    const minutes = Math.floor(totalTime / 60);
    const seconds = Math.floor(totalTime % 60);
    const centiseconds = Math.floor((totalTime % 1) * 100);
    const collectedPickups = this.pickupsRecogidos.length;
    const pickupNames = this.pickupsRecogidos.join(', ');

    const panel = document.createElement('div');
    panel.id = 'stats-panel';
    panel.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #fff;
        padding: 30px 40px;
        border-radius: 20px;
        font-family: Arial, sans-serif;
        z-index: 2000;
        text-align: center;
        box-shadow: 0 0 50px rgba(0,0,0,0.8);
        border: 2px solid #ffaa00;
        min-width: 350px;
        animation: slideIn 0.5s ease-out;
      ">
        <style>
          @keyframes slideIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          @keyframes glow {
            0%   { text-shadow: 0 0 5px #ffaa00; }
            100% { text-shadow: 0 0 20px #ffaa00; }
          }
          .stat-number { font-size: 48px; font-weight: bold; color: #ffaa00; animation: glow 1s ease-in-out infinite alternate; }
          .stat-label  { font-size: 14px; color: #aaa; margin-top: 5px; }
          .stat-row    { margin: 20px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 10px; }
          .pickup-list { font-size: 16px; color: #ffaa00; margin-top: 10px; }
          #stats-panel button {
            margin-top: 20px; padding: 10px 30px; font-size: 16px;
            background: #ffaa00; color: #1a1a2e; border: none;
            border-radius: 25px; cursor: pointer; font-weight: bold; transition: all 0.3s;
          }
          #stats-panel button:hover { transform: scale(1.05); background: #ffcc44; box-shadow: 0 0 15px #ffaa00; }
          #stats-panel h1 { margin: 0 0 20px 0; font-size: 28px; color: #ffaa00; }
          .trophy { font-size: 60px; margin-bottom: 10px; }
        </style>

        <div class="trophy">🏆</div>
        <h1>¡VICTORIA!</h1>
        <p>¡Has completado el laberinto!</p>

        <div class="stat-row">
          <div class="stat-number">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}</div>
          <div class="stat-label">TIEMPO TOTAL</div>
        </div>

        <div class="stat-row">
          <div class="stat-number">${collectedPickups}/${this.totalPickups}</div>
          <div class="stat-label">PICK-UPS RECOGIDOS</div>
          <div class="pickup-list">📦 ${pickupNames || 'Ninguno'}</div>
        </div>

        <div class="stat-row">
          <div class="stat-number">${Math.floor(totalTime * 100)}</div>
          <div class="stat-label">PUNTUACIÓN</div>
          <div class="stat-label" style="font-size:11px;">(Tiempo × 100)</div>
        </div>

        <button onclick="location.reload()">🔄 JUGAR DE NUEVO</button>
        <button id="close-stats" style="background:#333;color:#fff;margin-left:10px;">✖ CERRAR</button>
      </div>
    `;

    document.body.appendChild(panel);
    document.getElementById('close-stats').addEventListener('click', () => panel.remove());

    console.log("═══════════════════════════════════");
    console.log("🏆 ESTADÍSTICAS FINALES 🏆");
    console.log(`⏱️ Tiempo: ${minutes}m ${seconds}s ${centiseconds}cs`);
    console.log(`📦 Pick-ups: ${collectedPickups}/${this.totalPickups} (${pickupNames})`);
    console.log(`⭐ Puntuación: ${Math.floor(totalTime * 100)}`);
    console.log("═══════════════════════════════════");
  }

  // ─────────────────────────────────────────────
  //  CONTROLES
  // ─────────────────────────────────────────────

  initFirstPersonControls() {
    this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.controls.movementSpeed = 5.0;
    this.controls.lookSpeed = 0.1;
    this.controls.activeLook = true;

    this.laberinto.getMundoFromCelda(1, 1, this.camera.position);
    this.camera.position.y = this.playerHeight;

    console.log("🎮 Controles activados - Haz CLICK en la pantalla para empezar");
  }

  // ─────────────────────────────────────────────
  //  CÁMARAS
  // ─────────────────────────────────────────────

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
    this.add(this.camera);
  }

  createTopCamera() {
    const laberintoWidth = this.laberinto.xNumBloques * this.laberinto.anchoBloque;
    const laberintoHeight = this.laberinto.zNumBloques * this.laberinto.anchoBloque;
    const laberintoSize = Math.max(laberintoWidth, laberintoHeight);

    this.topCamera = new THREE.OrthographicCamera(
      -laberintoSize / 2, laberintoSize / 2,
      laberintoSize / 2, -laberintoSize / 2,
      0.1, 50
    );
    this.topCamera.position.set(0, 20, 0);
    this.topCamera.lookAt(0, 0, 0);

    this.topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.topLight.position.set(5, 10, 5);
    this.add(this.topLight);

    this.playerMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff0000, emissiveIntensity: 0.3 })
    );
    this.add(this.playerMarker);

    // Borde del minimapa
    const border = document.createElement('div');
    border.style.cssText = `
      position: fixed;
      left: ${this.topCameraViewport.x - 2}px;
      bottom: ${this.topCameraViewport.y - 2}px;
      width: ${this.topCameraViewport.width + 4}px;
      height: ${this.topCameraViewport.height + 4}px;
      border: 2px solid rgba(255,170,0,0.85);
      border-radius: 8px;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 0 10px rgba(0,0,0,0.6);
    `;
    document.body.appendChild(border);

    console.log("📷 Cámara superior creada");
  }

  renderTopView() {
    if (!this.topCamera) return;

    if (this.playerMarker && this.camera) {
      this.playerMarker.position.copy(this.camera.position);
      this.playerMarker.position.y = 0.1;
    }

    const { x, y, width, height } = this.topCameraViewport;
    const currentViewport = this.renderer.getViewport(new THREE.Vector4());
    const currentScissor = this.renderer.getScissor(new THREE.Vector4());
    const currentScissorTest = this.renderer.getScissorTest();

    this.renderer.setScissorTest(true);
    this.renderer.setViewport(x, y, width, height);
    this.renderer.setScissor(x, y, width, height);
    this.renderer.setClearColor(0x000000, 0.7);
    this.renderer.clear();
    this.renderer.render(this, this.topCamera);

    this.renderer.setViewport(currentViewport.x, currentViewport.y, currentViewport.z, currentViewport.w);
    this.renderer.setScissor(currentScissor.x, currentScissor.y, currentScissor.z, currentScissor.w);
    this.renderer.setScissorTest(currentScissorTest);
    this.renderer.setClearColor(0x0a0a1a, 1.0);
  }

  // ─────────────────────────────────────────────
  //  ESCENA BASE
  // ─────────────────────────────────────────────

  createGround() {
    const geometry = new THREE.BoxGeometry(100, 0.02, 100);

    const colorMap = new THREE.TextureLoader().load('../imgs/cesped.jpg');
    const normalMap = new THREE.TextureLoader().load('../texturas/TexturaCesped/NormalCesped.png');
    const roughMap = new THREE.TextureLoader().load('../texturas/TexturaCesped/RoughCesped.png');

    [colorMap, normalMap, roughMap].forEach(map => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(8, 8);
    });

    const material = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap,
      roughnessMap: roughMap,
      roughness: 0.8,
      metalness: 0.1
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.add(ground);
  }

  createLights() {
    // ── Luz ambiental mínima (noche de bosque) ──────────────────
    this.ambientLight = new THREE.AmbientLight(0x0a1a0f, 0.4);
    this.add(this.ambientLight);

    // ── Luz solar dinámica (CAMBIA en el tiempo) ─────────────────
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(10, 15, 5);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 512;
    this.sunLight.shadow.mapSize.height = 512;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 60;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.add(this.sunLight);

    // ── Luz de luna (complementaria, aparece de noche) ──────────
    this.moonLight = new THREE.DirectionalLight(0x2244aa, 0.0);
    this.moonLight.position.set(-10, 12, -5);
    this.add(this.moonLight);

    // ── Antorchas distribuidas por el laberinto ──────────────────
    const torchPositions = [
      [3, 5], [7, 3], [13, 15], [5, 20], [15, 10],
      [10, 8], [12, 22], [4, 14], [9, 18], [16, 5]
    ];

    this.torches = [];
    torchPositions.forEach((_, i) => {
      const light = new THREE.PointLight(0xff8822, 1.4, 5.0);
      light.position.set(0, 1.5, 0);
      light._offset = i * 2.3;
      this.add(light);
      this.torches.push(light);
    });

    console.log("💡 Luces de bosque creadas (sol/luna + 10 antorchas)");
  }

  createRenderer(myCanvas) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x0a0a1a, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    $(myCanvas).append(renderer.domElement);
    return renderer;
  }
  createStars() {
    const starCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Distribuir en esfera grande alrededor del jugador
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9); // solo hemisferio superior
      const r = 80;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });

    this.stars = new THREE.Points(geometry, material);
    this.add(this.stars);

    // Guardar offsets de parpadeo por estrella
    this.starOffsets = new Float32Array(starCount).map(() => Math.random() * Math.PI * 2);

    console.log("⭐ Estrellas creadas");
  }
  // ─────────────────────────────────────────────
  //  RESIZE
  // ─────────────────────────────────────────────

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.topCamera && this.laberinto) {
      const s = Math.max(
        this.laberinto.xNumBloques * this.laberinto.anchoBloque,
        this.laberinto.zNumBloques * this.laberinto.anchoBloque
      );
      this.topCamera.left = -s / 2;
      this.topCamera.right = s / 2;
      this.topCamera.top = s / 2;
      this.topCamera.bottom = -s / 2;
      this.topCamera.updateProjectionMatrix();
    }

    if (this.controls) this.controls.handleResize();
  }

  // ─────────────────────────────────────────────
  //  BUCLE PRINCIPAL
  // ─────────────────────────────────────────────

  update() {
    if (this.controls) {
      const prevPosition = this.camera.position.clone();
      this.controls.update(1 / 60);
      this.camera.position.y = this.playerHeight;

      if (this.walls.length > 0 && this.checkCollision(this.camera.position)) {
        const slideX = new THREE.Vector3(this.camera.position.x, this.playerHeight, prevPosition.z);
        const slideZ = new THREE.Vector3(prevPosition.x, this.playerHeight, this.camera.position.z);

        if (!this.checkCollision(slideX)) {
          this.camera.position.copy(slideX);
        } else if (!this.checkCollision(slideZ)) {
          this.camera.position.copy(slideZ);
        } else {
          this.camera.position.copy(prevPosition);
          this.camera.position.y = this.playerHeight;
        }
      }
    }

    // Animar pickups no recogidos
    if (this.carnivora && !this.pickups.find(p => p.nombre === '🌿 Carnívora')?.recogido) {
      this.carnivora.update();
    }
    if (this.nucleo && !this.pickups.find(p => p.nombre === '💎 Núcleo')?.recogido) {
      this.nucleo.update();
    }
    if (this.mosca && !this.pickups.find(p => p.nombre === '🪰 Mosca')?.recogido) {
      this.mosca.update();
    }

    // ── Ciclo día/noche ──────────────────────────────────────────
    const time = Date.now() * 0.001;
    const cycle = (Math.sin(time * 0.1) + 1) / 2;

    // Al final del ciclo día/noche existente, reemplaza las 3 ramas así:

    if (cycle > 0.7) {
      // Día — estrellas invisibles
      this.sunLight.color.setRGB(0.95, 1.0, 0.88);
      this.sunLight.intensity = 1.4;
      this.ambientLight.color.setRGB(0.1, 0.18, 0.08);
      this.ambientLight.intensity = 0.35;
      this.moonLight.intensity = 0.0;
      if (this.stars) this.stars.material.opacity = 0.0;

    } else if (cycle > 0.4) {
      // Amanecer/atardecer — estrellas aparecen gradualmente
      const t = (cycle - 0.4) / 0.3;
      this.sunLight.color.setRGB(1.0, 0.5 + t * 0.48, 0.15 + t * 0.73);
      this.sunLight.intensity = 0.5 + t * 0.9;
      this.ambientLight.color.setRGB(0.12, 0.08, 0.04);
      this.ambientLight.intensity = 0.12 + t * 0.23;
      this.moonLight.intensity = 0.0;
      if (this.stars) this.stars.material.opacity = (1 - t) * 0.7;

    } else {
      // Noche — estrellas visibles y parpadeando
      const t = cycle / 0.4;
      this.sunLight.intensity = t * 0.25;
      this.sunLight.color.setRGB(0.3 + t * 0.65, 0.4 + t * 0.6, 0.8 + t * 0.08);
      this.moonLight.intensity = (1 - t) * 0.45;
      this.ambientLight.color.setRGB(0.02, 0.04, 0.08);
      this.ambientLight.intensity = 0.06 + (1 - t) * 0.06;
      if (this.stars) this.stars.material.opacity = 0.7 + (1 - t) * 0.25;
    }

    // Parpadeo sutil de estrellas (añadir justo después del bloque if/else)
    if (this.stars && this.stars.material.opacity > 0) {
      const twinkle = Math.sin(time * 2.1) * 0.04 + Math.sin(time * 5.7) * 0.02;
      this.stars.material.opacity = Math.min(1, Math.max(0, this.stars.material.opacity + twinkle));
      // Rotar lentamente el cielo estrellado
      this.stars.rotation.y = time * 0.002;
    }

    this.sunLight.position.x = Math.cos(time * 0.008) * 15;
    this.sunLight.position.y = Math.abs(Math.sin(time * 0.008)) * 20 + 2;

    // ── Parpadeo de antorchas ────────────────────────────────────
    this.torches.forEach(torch => {
      const flicker =
        Math.sin(time * 7.3 + torch._offset) * 0.10 +
        Math.sin(time * 13.1 + torch._offset) * 0.05 +
        Math.sin(time * 3.7 + torch._offset) * 0.08;

      torch.intensity = 1.4 + flicker;

      const g = 0.53 + flicker * 0.3;
      const b = 0.13 + Math.max(0, flicker) * 0.1;
      torch.color.setRGB(1.0, g, b);
    });

    this.renderer.render(this, this.camera);
    this.renderTopView();

    requestAnimationFrame(() => this.update());
  }
}

$(function () {
  const scene = new MyScene("#WebGL-output");
  window.addEventListener("resize", () => scene.onWindowResize());
  scene.update();
});