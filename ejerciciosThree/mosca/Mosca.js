
import * as THREE from 'three'

class Mosca extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la Mosca
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0x000000});

    this.cabezagirando = false;
    this.velocidadCabeceo = 0.01;
    this.angulocabeza = 0;

    this.angulomincabeza = -Math.PI/6;
    this.angulomaxcabeza = Math.PI/6;
    this.sentidocabeceo = 1;

    this.aleteo = false;
    this.anguloAleteo = -Math.PI / 3 ;
    this.velocidadAleteo = 1;
    this.amplitudAlas = THREE.MathUtils.degToRad(10)
    this.anguloAlaMin = this.anguloAleteo - this.amplitudAlas;
    this.anguloAlaMax = this.anguloAleteo +  this.amplitudAlas;
    this.sentidoaleteo = 1;


    this.cornetaEscalando = false;      // indica si está animándose
    this.cornetaScaleFactor = 1;        // escala actual en Y
    this.cornetaScaleMin = 1;         // escala mínima
    this.cornetaScaleMax = 3.0;         // escala máxima
    this.cornetaScaleSpeed = 0.01;      // velocidad de crecimiento/reducción por frame
    this.cornetaScaleDireccion = 1;     // 1 = crecer, -1 = achicar
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    this.tamano = 0.15;   // 15 cm de largo. Las unidades son metros
    this.cuerpo = this.createBase(this.tamano);
    this.cabeza = this.createHead(this.tamano);
    this.alas = this.createAlas(this.tamano);
    this.patas = this.createPatas(this.tamano);
    this.ojos = this.createOjos(this.tamano);
    this.corneta = this.createCorneta(this.tamano);
    // Al nodo que contiene la transformación interactiva que abre y cierra la Mosca se accede desde el método update, se almacena en un atributo.
    // this.movil = this.createMovil(tamano);
    
    // Al nodo  this, la Mosca, se le cuelgan como hijos la base y la parte móvil
    this.add(this.cuerpo);
    this.cuerpo.add(this.cabeza);
    this.cuerpo.add(this.alas);
    this.cuerpo.add(this.patas);
    this.cabeza.add(this.ojos);
    this.cabeza.add(this.corneta);
  }
  
  createBase(tama) {
    var base = new THREE.Object3D();
    
        const shape = new THREE.Shape();
    
        shape.moveTo(-1,0);
        shape.lineTo(-0.92,0.27);
        shape.lineTo(-0.72,0.59);
        shape.lineTo(-0.5,0.81);
        shape.lineTo(-0.26,0.93);
        shape.lineTo(0,1);
        shape.lineTo(0.26,0.93);
        shape.lineTo(0.72,0.59);
        shape.lineTo(1,0);
        shape.lineTo(0.83,-0.42);
        shape.lineTo(0,-0.8);
        shape.lineTo(-0.83,-0.42);
        shape.lineTo(-1,0);
    
        var extrudeSettings_cuerpo = {
          depth: 1,
          bevelEnabled: true,
          bevelThickness: 0.99,
          curveSegments: 30,
          steps: 9,
        };
    
        var geometriaCuerpo = new THREE.ExtrudeGeometry(shape,extrudeSettings_cuerpo);
        geometriaCuerpo.center();
        geometriaCuerpo.translate(0,2,-2.2);
        var cuerpo = new THREE.Mesh(geometriaCuerpo,this.material);
    
        cuerpo.scale.set(tama*0.3,tama*0.3,tama*0.5);
        
        base.add(cuerpo);
        return base;
  }

  createHead (tama){
      let base = new THREE.Object3D();
      const forma_cabeza = new THREE.Shape();

      forma_cabeza.moveTo(-1,0);
      forma_cabeza.lineTo(-0.5531075811241097,-0.6490366908323321);
      forma_cabeza.lineTo(-0.29291197908027333,-0.8051540520586337);
      forma_cabeza.lineTo(0,-0.8051540520586337);
      forma_cabeza.lineTo(0.2665085653139749,-0.8051540520586337);
      forma_cabeza.lineTo(0.5136943872556194,-0.6490366908323321);
      forma_cabeza.lineTo(0.7868997694016476,-0.2847628479709616);
      forma_cabeza.lineTo(1,0);
      forma_cabeza.lineTo(1.1706882824163072,0.3722310471897241);
      forma_cabeza.lineTo(1.248746963029458,0.6714559895401355);
      forma_cabeza.lineTo(1.248746963029458,0.9836907119927388);
      forma_cabeza.lineTo(1.105639381905348,1.2178667538321912);
      forma_cabeza.lineTo(0.7934046594527443,1.3349547747519175);
      forma_cabeza.lineTo(0.4161210364891816,1.3869938951606846);
      forma_cabeza.lineTo(0,1.4195183454161642);
      forma_cabeza.lineTo(-0.4880586806131506,1.4065085653139724);
      forma_cabeza.lineTo(-0.8653423035767134,1.3154401045986297);
      forma_cabeza.lineTo(-1.2035965862337008,1.0942738428613694);
      forma_cabeza.lineTo(-1.275150376795755,0.7365048900510945);
      forma_cabeza.lineTo(-1.1645672459271252,0.40475549744520395);
      forma_cabeza.lineTo(-1,0); // cierre

      var extrudeSettings_cabeza = {
        depth: 1,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSegments: 4,
        steps: 9,
      };
      var geometriaCabeza = new THREE.ExtrudeGeometry(forma_cabeza,extrudeSettings_cabeza);
      // geometriaCabeza.center();
      geometriaCabeza.rotateX(-Math.PI/2);
      var cabeza = new THREE.Mesh(geometriaCabeza,this.material);
      
      cabeza.scale.set(tama*0.2,tama*0.2,tama*0.2);
      base.add(cabeza);
      base.position.set(tama*0.05,tama*0.5,0);
      return base;
  }

createOjos(tama) {
    var base = new THREE.Object3D();
    var geometry = new THREE.SphereGeometry( 15, 9, 20, 6.283185307179586, 3.96468992883032, 0, 3.277353 );
    var material = new THREE.MeshBasicMaterial( { color: 0xb81414 } );
    
    // --- OJO IZQUIERDO ---
    var ojo_izquierdo = new THREE.Mesh( geometry, material );
    ojo_izquierdo.rotation.x = -Math.PI/2;
    ojo_izquierdo.rotation.y = Math.PI/7;
    
    var factor = 0.015 * tama;
    ojo_izquierdo.scale.set(factor, factor * 1.5, factor);

    var edges = new THREE.EdgesGeometry( geometry ); 
    var lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
    var wireframe = new THREE.LineSegments( edges, lineMaterial );
    ojo_izquierdo.add( wireframe );

    // Posicionamos el ojo izquierdo desplazado del centro
    var separacion = 0.25 * tama; // Ajusta este valor para juntar o separar los ojos
    ojo_izquierdo.position.x = separacion; 
    base.add( ojo_izquierdo );

    // --- OJO DERECHO ---
    var ojo_derecho = ojo_izquierdo.clone();
    // Invertimos la posición en Z para que esté al otro lado del eje
    ojo_derecho.position.x = -separacion; 
    
    // El espejado que intentabas:
    ojo_derecho.scale.z *= -1; 
    ojo_derecho.rotation.y = Math.PI; // Giramos para que mire hacia adelante
    
    base.add( ojo_derecho );

   
    
    // Esta es la posición de "el conjunto de los dos ojos" en tu modelo
    base.position.set(0, 0.5 * tama, 0);
    
    return base;
}
createCorneta(tama) {
  const base = new THREE.Object3D();
  const puntos = [];
  // Definimos la silueta: de arriba (boquilla) hacia abajo (campana)
  for (let i = 0; i < 8; i++) {
    // La x define el radio, la y define la altura
    // Usamos Math.exp o potencias para que se ensanche al final
    // let x = 0.1 + Math.pow(i * 0.2, 3)*0.8; 
    let x = 0.4 + Math.pow(i * 0.2, 3) * 0.8;
    let y = i * 0.8;
    puntos.push(new THREE.Vector2(x * tama, y * tama));
  }

  // Generamos la revolución (silueta, segmentos, ángulo inicio, ángulo total)
  const geometry = new THREE.LatheGeometry(puntos, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xb81414, side: THREE.DoubleSide });
  this.corneta = new THREE.Mesh(geometry, material);
  var factor = 0.5 * tama;
  this.corneta.scale.set(factor, factor*1.2, factor);
  this.corneta.rotation.x = Math.PI / 2 + Math.PI/6; // La orientamos hacia adelante
 // Auxiliares y posición final de la base
  // var ejes = new THREE.AxesHelper(20 * tama);
  // base.add(ejes);
  base.add(this.corneta);
  base.position.set(0, 0.25 * tama, 0.50* tama);
  return base;
}

  createAlas(tama) {
    const base = new THREE.Object3D();

    // 1. Definición de la forma (igual que la tenías)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.4, 0.7, 0.9, 1.1, 1.0);
    shape.bezierCurveTo(1.3, 0.8, 1.3, 0.2, 1.0, -0.2);
    shape.bezierCurveTo(0.6, -0.6, 0.2, -0.4, 0, -0.1);
    shape.lineTo(0, 0);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.01,
        bevelEnabled: false,
        curveSegments: 32
    });

    //  -------- MATERIAL TRANSPARENTE --------
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08, // casi invisible
        side: THREE.DoubleSide
    });

    // --- ALA DERECHA ---
    const alaDerecha = new THREE.Mesh(geometry, material);
    
    // Aplicamos el escalado (corregido para evitar negativos)
    let factor = (tama * 0.7); 

    // -------- BORDES --------
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });

    const bordeDerecha = new THREE.LineSegments(edges, lineMat);
    alaDerecha.add(bordeDerecha);
      // -------- LÍNEAS INTERNAS --------
    const crearLinea = (pts) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return new THREE.Line(geo, lineMat);
    };

    const line1 = crearLinea([
        new THREE.Vector3(0, 0, 0.02),
        new THREE.Vector3(0.5, 0.6, 0.02),
        new THREE.Vector3(1.0, 0.8, 0.02)
    ]);

    const line2 = crearLinea([
        new THREE.Vector3(0, 0, 0.02),
        new THREE.Vector3(0.6, 0.2, 0.02),
        new THREE.Vector3(1.0, 0.3, 0.02)
    ]);

    const line3 = crearLinea([
        new THREE.Vector3(0, 0, 0.02),
        new THREE.Vector3(0.5, -0.2, 0.02),
        new THREE.Vector3(0.9, -0.1, 0.02)
    ]);

    alaDerecha.add(line1, line2, line3);
    alaDerecha.scale.set(factor -0.2, factor, factor);

    // IMPORTANTE: Aquí mueves el ala respecto a su EJE.
    // Si quieres que el eje esté en la base (0,0,0), deja la posición en 0.
    // Si quieres que el eje esté más adentro del ala, pon un valor negativo en X.
    alaDerecha.position.set(0, 0, 0); 

    // --- CREAMOS EL PIVOTE (El nuevo eje) ---
    const pivotDerecho = new THREE.Object3D();
    pivotDerecho.add(alaDerecha); // El ala ahora es hija del pivote
    
    // Posicionamos el PIVOTE en el cuerpo de la mosca
    pivotDerecho.position.set(-0.15*tama, 1.1*tama, -0.9*tama); // Ajusta según la posición del cuerpo
    pivotDerecho.rotation.x = -Math.PI / 3; // Inclinación inicial

    // --- ALA IZQUIERDA (Espejo del pivote) ---
    const pivotIzquierdo = pivotDerecho.clone();
    pivotIzquierdo.position.x = 0.15*tama; // Lado opuesto
    pivotIzquierdo.children[0].scale.x *= -1; // Invertimos solo el mesh interno

    // --- AGREGAR A LA BASE ---
    base.add(pivotDerecho);
    base.add(pivotIzquierdo);

    // Guardamos referencias para animar el aleteo luego
    this.pivotD = pivotDerecho;
    this.pivotI = pivotIzquierdo;

    return base;
}
createPatas(tama){
  var patas = new THREE.Object3D();
  var patas_derechas = new THREE.Object3D();
  var patas_derecha_1 = new THREE.Object3D();
  var patas_derecha_2 = new THREE.Object3D();
  var patas_derecha_3 = new THREE.Object3D();
  patas.add(patas_derechas);

  var circulo =  new THREE.Shape();
  circulo.absarc(0, 0, 0.01, 0, 2*Math.PI, false);
  const pts = [
  { x: 0.00000, y: 1.00000 }, // A
  { x: 0.03524, y: 1.00123 }, // B
  { x: 0.05651, y: 0.97996 }, // C
  { x: 0.05887, y: 0.93033 }, // D
  { x: 0.05769, y: 0.83107 }, // E
  { x: 0.08723, y: 0.80271 }, // F
  { x: 0.13631, y: 0.8 }, // G
  { x: 0.20000, y: 0.80000 }, // H (Nuevo punto más a la derecha)
  { x: 0.05887, y: 0.83543 }  // I (Este vuelve hacia atrás)
 ];
 var curvePoints = pts.map(p => new THREE.Vector3(p.x, p.y, 0));
 var path = new THREE.CatmullRomCurve3(curvePoints);
 var options = {
    steps: 100,
    curveSegments: 32, 
    extrudePath: path
  };
 var geometry = new THREE.ExtrudeGeometry(circulo, options);
 var mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0xBAD123}));
 mesh.scale.set(4*tama, 4*tama, 7*tama);
 patas_derecha_1.add(mesh);
 patas_derecha_2 = patas_derecha_1.clone();
 patas_derecha_3 = patas_derecha_1.clone();

 patas_derecha_1.position.set(0.45*tama, -3.25*tama, -0.8*tama);
 patas_derecha_2.position.set(0.45*tama, -3.25*tama, -1.2*tama);
 patas_derecha_3.position.set(0.45*tama, -3.25*tama, -1.6*tama);
 patas_derechas.add(patas_derecha_1);
 patas_derechas.add(patas_derecha_2);
 patas_derechas.add(patas_derecha_3);

 var patas_izquierdas = patas_derechas.clone();
 patas_izquierdas.scale.x *= -1; // Invertimos solo el mesh interno
 patas.add(patas_izquierdas);

 return patas;
}
  
  createGUI (gui,titleGui) {
    // Controles para el movimiento de la parte móvil
    this.guiControls = {
      rotacion : 0,
      cabeceo : 0,
      estiramiento : () => this.estiraCorneta(),
      encoge : () => this.encogeCorneta(),
      empezarAleteo : () => this.comienzaVuelo(),
      pararAleteo : () => this.paraVuelo(),
      empezarCabeza : () => this.setCabezaGirando(),
      pararCabeza : () => this.paraCabezaGirando(),
    } 
    
    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder (titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    // folder.add (this.guiControls, 'rotacion', -0.2, 0.125, 0.001)
    //   .name ('Batir alas : ')
    //   .onChange ( (value) => this.setAnguloAlas (value) ); 
    folder.add(this.guiControls, 'empezarAleteo')
      .name('Empezar Aleteo');

    folder.add(this.guiControls, 'pararAleteo')
      .name('Parar Aleteo');
    folder.add(this.guiControls, 'empezarCabeza')
      .name('Mover cabeza');
    folder.add(this.guiControls, 'pararCabeza')
      .name('Parar cabeza');

    folder.add(this.guiControls, 'estiramiento')
      .name('Estirar corneta');
    folder.add(this.guiControls, 'encoge')
      .name('Encoger corneta');
  }
  
  setCabezaGirando () {
    this.cabezagirando = true;
  }
  paraCabezaGirando () {
    this.cabezagirando = false;
  }

  setAnguloCabeza (valor) {
    if(this.cabeza)
      this.cabeza.rotation.z = valor;
  }

  comienzaVuelo (){
    this.aleteo = true;
  }
  
  paraVuelo(){
    this.aleteo = false;
  }

  estiraCorneta(){
    this.cornetaEscalando = true;
    this.cornetaScaleDireccion = 1; // Crecer
  }

  encogeCorneta(){
    this.cornetaEscalando = true;
    this.cornetaScaleDireccion = -1; // Achicar
  }
  setAnguloAlas(valor) {
    // Rotación en X sobre el eje que definimos en el pivot
    this.pivotD.rotation.x =this.anguloAleteo + valor;
    this.pivotI.rotation.x = this.anguloAleteo + valor;
  }


  




  
  update () {
    if(this.cabezagirando) {
      this.cabeza.rotation.z += this.sentidocabeceo * this.velocidadCabeceo;
      if (this.cabeza.rotation.z > this.angulomaxcabeza) {
        this.cabeza.rotation.z = this.angulomaxcabeza;
        this.sentidocabeceo = -1; // Cambia la dirección del cabeceo
      }
      else if (this.cabeza.rotation.z < this.angulomincabeza) {
        this.cabeza.rotation.z = this.angulomincabeza;
        this.sentidocabeceo = 1; // Cambia la dirección del cabeceo
      }
    }

    if (this.aleteo){
      this.pivotD.rotation.x += this.sentidoaleteo * this.velocidadAleteo;
      this.pivotI.rotation.x += this.sentidoaleteo* this.velocidadAleteo;

      if (this.pivotD.rotation.x > this.anguloAlaMax || this.pivotI.rotation.x > this.anguloAlaMax){
        this.sentidoaleteo= -1;
        this.pivotD.rotation.x =this.anguloAlaMax;
        this.pivotI.rotation.x= this.anguloAlaMax;
      } 

      
      if (this.pivotD.rotation.x < this.anguloAlaMin || this.pivotI.rotation.x < this.anguloAlaMin){
        this.sentidoaleteo= 1;
        this.pivotD.rotation.x =this.anguloAlaMin;
        this.pivotI.rotation.x= this.anguloAlaMin;
      } 
    }


    if (this.cornetaEscalando){
      this.cornetaScaleFactor += this.cornetaScaleDireccion * this.cornetaScaleSpeed;
      // Limitar entre min y max
      if (this.cornetaScaleFactor >= this.cornetaScaleMax) {
        this.cornetaScaleFactor = this.cornetaScaleMax;
      } else if (this.cornetaScaleFactor <= this.cornetaScaleMin) {
        this.cornetaScaleFactor = this.cornetaScaleMin;
      }

      // Aplicar escala solo sobre el eje Z
      this.corneta.scale.set(1, 1, this.cornetaScaleFactor);
    }
  } 
}
export { Mosca }
