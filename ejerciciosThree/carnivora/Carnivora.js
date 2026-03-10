    const SEGMENTOS_RADIALES = 64;
    const PI = 3.14;

    import * as THREE from 'three'
    const ALTURA_BASE = 0.35;

    class Carnivora extends THREE.Object3D {
      constructor(gui,titleGui) {
        super();
        
        // Se crea la parte de la interfaz que corresponde a la carnivora
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
        this.createGUI(gui,titleGui);
        
        // El material se usa desde varios métodos. Por eso se alamacena en un atributo
        this.material = new THREE.MeshStandardMaterial({color: 0x228B22});
        

        this.girando = false;
        this.anguloObjetivo = 0;
        this.velocidadGiro = 0.02;

        this.cabezaGirando = false;
        this.velocidadCabeza = 0.01;
        this.anguloCentralCabeza = -Math.PI/3;
        const amplitud = THREE.MathUtils.degToRad(20);

        this.anguloMinCabeza = this.anguloCentralCabeza - amplitud;
        this.anguloMaxCabeza = this.anguloCentralCabeza + amplitud;
        this.direccionCabeza = 1;
        // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
        var tamano = 1;   // 15 cm de largo. Las unidades son metros
        

        this.base = this.createBase(tamano);
        this.tronco = this.createTronco(tamano)
        this.giratorio = this.createGiratorio(tamano)
        this.cabeza= this.createCabeza(tamano)
        
        // Al nodo  this, la carnivora, se le cuelgan como hijos la base y la parte móvil
        this.add (this.base);
        this.base.add(this.tronco)
        this.tronco.add(this.giratorio);
        this.giratorio.add(this.cabeza)
        
      }
      
      createBase(tama) {

      
        // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
        var base = new THREE.Object3D();
        // Cada figura, un Mesh, está compuesto de una geometría y un material
        var cajaBase = new THREE.Mesh (new THREE.CylinderGeometry (tama*0.25,tama*0.4,ALTURA_BASE,SEGMENTOS_RADIALES), this.material);
        cajaBase.position.y = ALTURA_BASE/2;
        
        base.add(cajaBase);
        return base;
      }

      createTronco(tama) {

        var altura = 0.8;
        // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
        var base = new THREE.Object3D();
        // Cada figura, un Mesh, está compuesto de una geometría y un material
        var cajaBase = new THREE.Mesh (new THREE.CylinderGeometry (tama*0.1,tama*0.1,altura,SEGMENTOS_RADIALES), this.material);
        cajaBase.position.y = altura/2;
        

        base.position.set(0, ALTURA_BASE, 0);
        base.add(cajaBase);
        return base;
      }
      
      createGiratorio(tama){

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
            0.1*tama,    // radio del tallo
            16,      // segmentos radiales
            false
          );

          var mesh = new THREE.Mesh(geometry, this.material);

          var giratorio = new THREE.Object3D();

          // IMPORTANTE → nace encima del tronco
          giratorio.position.y = 0.8 ;   // CREAR CONSTANTE SIENDO ESTE LA ALTURA DE TRONCO
          
          giratorio.add(mesh);

          return giratorio;
        }

        girar180() {
          this.girando = true;
          this.anguloObjetivo += Math.PI;
        }
    createCabeza(tama){
        const radio = tama * 0.4;

        const geometry = new THREE.SphereGeometry(
          radio, 32, 32,
          0, 2*Math.PI,
          2.2, Math.PI
        );
        geometry.translate(0,radio,0);
        var mat = new THREE.MeshStandardMaterial({
          color: 0xffaaaa,
          side: THREE.DoubleSide
        });
        const cabeza = new THREE.Object3D();
        const sphere = new THREE.Mesh(geometry, mat);

        
        cabeza.rotation.z = - Math.PI / 3;
        cabeza.position.y= 0.3;
        cabeza.position.x = 0.45;
        cabeza.add(sphere);

        return cabeza;
      }
      createGUI (gui,titleGui) {
        // Controles para el movimiento de la parte móvil
        this.guiControls = {
          girar : () => this.girar180(),
          parar : () => this.parar(),
          empezarCabeza : () => this.empezarCabeza(),
          pararCabeza : () => this.pararCabeza()
        };
        
        // Se crea una sección para los controles de la caja
        var folder = gui.addFolder (titleGui);
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
      update () {

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
