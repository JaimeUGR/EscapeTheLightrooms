
// Clases de las Bibliotecas

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { FirstPersonControls } from "../libs/FirstPersonControls.js";
import {
	BufferGeometry,
	MeshPhongMaterial,
	LineBasicMaterial,
	ExtrudeGeometry,
	ObjectLoader
} from "../libs/three.module.js";
import {CSG} from '../libs/CSG-v2.js'
import {MTLLoader} from "../libs/MTLLoader.js";
import {OBJLoader} from "../libs/OBJLoader.js";
import * as TWEEN from '../libs/tween.esm.js'

// Clases del Proyecto

import {GestorCamaras} from "./cameras/GestorCamaras.js"
import {Sala} from "./rooms/Sala.js"
import {SalaPrincipal} from "./rooms/SalaPrincipal.js"
import {SalaIzquierda} from "./rooms/SalaIzquierda.js"
import {SalaDerecha} from "./rooms/SalaDerecha.js"
import {SalaSuperior} from "./rooms/SalaSuperior.js"


/**
 * Clase que hereda de THREE.Scene, con la que se gestionará todo el juego
 */

let FPSLimit = true
let myDeltaTime = 1/30.0
let myDelta = 0

class EscapeTheLightrooms extends THREE.Scene
{
	// Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
	// la visualización de la escena
	constructor(myCanvas)
	{
		super();

		this.clock = new THREE.Clock(false)

		// Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
		this.renderer = this.createRenderer(myCanvas);

		// Se crea la interfaz gráfica de usuario
		this.gui = this.createGUI ();

		// Construimos los distinos elementos que tendremos en la escena

		// Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
		// Tras crear cada elemento se añadirá a la escena con   this.add(variable)
		this.createLights ();

		// Tendremos una cámara con un control de movimiento con el ratón
		this.createCamera ();

		// Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
		this.axis = new THREE.AxesHelper (50);
		this.add (this.axis);

		// Por último creamos el modelo.
		// El modelo puede incluir su parte de la interfaz gráfica de usuario. Le pasamos la referencia a
		// la gui y el texto bajo el que se agruparán los controles de la interfaz que añada el modelo.
		//this.add(new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0xff00ff})))

		//
		// Crear las salas
		//

		this.crearSalas()

		//
		// Añadir las cámaras
		//

		let aCaja = 15
		let cajaGeo = new THREE.BoxGeometry(30, aCaja, 10)
		cajaGeo.translate(15, aCaja/2, 5)

		this.add(new THREE.Mesh(cajaGeo, new THREE.MeshBasicMaterial({color: 0xf7fa2a})))

		this.clock.start()
	}

	// Crear las salas, unirlas y colocarlas

	crearSalas()
	{
		// Temporal
		let largoPasillo = 20

		// Crear las salas
		this.salaPrincipal = new SalaPrincipal(150, 110, 40, {
			up: true,
			down: true,
			left: true,
			right: true
		})

		this.salaIzquierda = new SalaIzquierda(150, 110, 40, {
			right: true
		})

		this.salaDerecha = new SalaDerecha(150, 110, 40, {
			left: true
		})

		this.salaSuperior = new SalaSuperior(150, 110, 40, {
			down: true
		})


		// Colocar las salas en su posición final
		// Centrar las salas
		this.salaPrincipal.translateX(-this.salaPrincipal.largoParedX/2)
		this.salaIzquierda.translateX(-this.salaIzquierda.largoParedX/2)
		this.salaDerecha.translateX(-this.salaDerecha.largoParedX/2)
		this.salaSuperior.translateX(-this.salaSuperior.largoParedX/2)

		// Posicionamos las salas adyacentes a la principal
		this.salaIzquierda.translateX(this.salaIzquierda.largoParedX/2 +
			this.salaPrincipal.largoParedX/2 + 2*Sala.GrosorPared() + largoPasillo)

		this.salaDerecha.translateX(-(this.salaDerecha.largoParedX/2 +
			this.salaPrincipal.largoParedX/2 + 2*Sala.GrosorPared() + largoPasillo))

		this.salaSuperior.translateZ(this.salaPrincipal.largoParedZ
			+ 2*Sala.GrosorPared() + largoPasillo)

		// Añadir los pasillos de conexión


		this.add(this.salaPrincipal)
		this.add(this.salaIzquierda)
		this.add(this.salaDerecha)
		this.add(this.salaSuperior)
	}


	//

	createCamera()
	{
		this.gestorCamaras = new GestorCamaras(this)

		return


		// Para crear una cámara le indicamos
		//   El ángulo del campo de visión vértical en grados sexagesimales
		//   La razón de aspecto ancho/alto
		//   Los planos de recorte cercano y lejano
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		// También se indica dónde se coloca
		this.camera.position.set (25, 20, 25);
		// Y hacia dónde mira
		//var look = new THREE.Vector3 (0,0,0);
		//this.camera.lookAt(look);
		this.add (this.camera);

		this.cameraControl = new FirstPersonControls(this.camera, this.renderer.domElement)
		this.cameraControl.movementSpeed = 20
		this.cameraControl.lookSpeed = 0.4
		this.cameraControl.noFly = true
		this.cameraControl.lookVertical = true

		this.cameraControl.constrainVertical = true
		this.cameraControl.minVerticalAngle = (Math.PI / 180) * 5
		this.cameraControl.maxVerticalAngle = (Math.PI / 180) * 5
		this.cameraControl.minPolarAngle = (Math.PI / 180) * 5;
		this.cameraControl.maxPolarAngle = (Math.PI / 180) * 5;

		// Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
		/*this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);

		// Se configuran las velocidades de los movimientos
		this.cameraControl.rotateSpeed = 5;
		this.cameraControl.zoomSpeed = -2;
		this.cameraControl.panSpeed = 0.5;
		// Debe orbitar con respecto al punto de mira de la cámara
		this.cameraControl.target = look;*/
	}


	createGUI()
	{
		// Se crea la interfaz gráfica de usuario
		var gui = new GUI();

		// La escena le va a añadir sus propios controles.
		// Se definen mediante una   new function()
		// En este caso la intensidad de la luz y si se muestran o no los ejes
		this.guiControls = {
			// En el contexto de una función   this   alude a la función
			lightIntensity : 0.5,
			axisOnOff : true,
			fpsLimit: false
		}

		// Se crea una sección para los controles de esta clase
		var folder = gui.addFolder ('Luz y Ejes');

		// Se le añade un control para la intensidad de la luz
		folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1)
			.name('Intensidad de la Luz : ')
			.onChange ( (value) => this.setLightIntensity (value) );

		// Y otro para mostrar u ocultar los ejes
		folder.add (this.guiControls, 'axisOnOff')
			.name ('Mostrar ejes : ')
			.onChange ( (value) => this.setAxisVisible (value) );

		folder.add(this.guiControls, 'fpsLimit')
			.name('Límite FPS : ')
			.onChange((value) => FPSLimit = value).listen()

		return gui;
	}

	createLights()
	{
		// Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
		// La luz ambiental solo tiene un color y una intensidad
		// Se declara como   var   y va a ser una variable local a este método
		//    se hace así puesto que no va a ser accedida desde otros métodos
		var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
		// La añadimos a la escena
		this.add (ambientLight);

		// Se crea una luz focal que va a ser la luz principal de la escena
		// La luz focal, además tiene una posición, y un punto de mira
		// Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
		// En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
		this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
		this.spotLight.position.set( 60, 60, 40 );
		this.add (this.spotLight);
	}

	setLightIntensity(valor)
	{
		this.spotLight.intensity = valor;
	}

	setAxisVisible(valor)
	{
		this.axis.visible = valor;
	}

	createRenderer(myCanvas)
	{
		// Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

		// Se instancia un Renderer   WebGL
		var renderer = new THREE.WebGLRenderer();

		// Se establece un color de fondo en las imágenes que genera el render
		renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

		// Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
		renderer.setSize(window.innerWidth, window.innerHeight);

		// La visualización se muestra en el lienzo recibido
		$(myCanvas).append(renderer.domElement);

		return renderer;
	}

	getCamera()
	{
		// En principio se devuelve la única cámara que tenemos
		// Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
		return this.gestorCamaras.getCamaraActiva();
	}

	setCameraAspect(ratio)
	{
		// Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
		// su sistema operativo hay que actualizar el ratio de aspecto de la cámara
		this.camera.aspect = ratio;
		// Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
		this.camera.updateProjectionMatrix();
	}

	onWindowResize()
	{
		// Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
		// Hay que actualizar el ratio de aspecto de la cámara
		this.setCameraAspect (window.innerWidth / window.innerHeight);

		// Y también el tamaño del renderizador
		this.renderer.setSize (window.innerWidth, window.innerHeight);
	}

	update()
	{
		let currentDelta = this.clock.getDelta()

		if (FPSLimit)
		{
			myDelta += currentDelta

			if (myDelta >= myDeltaTime)
			{
				myDelta -= myDeltaTime

				// Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
				this.renderer.render (this, this.getCamera());
			}
		}
		else
		{
			this.renderer.render (this, this.getCamera());
		}



		// Se actualiza la posición de la cámara según su controlador
		this.gestorCamaras.update(currentDelta);

		// Actualizar modelos
		TWEEN.update()

		// Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
		// Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
		// Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
		requestAnimationFrame(() => this.update())
	}
}


// MAIN //
$(function () {

	// Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
	const main_scene = new EscapeTheLightrooms("#WebGL-output");

	// Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
	window.addEventListener ("resize", () => main_scene.onWindowResize());

	// Que no se nos olvide, la primera visualización.
	main_scene.update();
});
