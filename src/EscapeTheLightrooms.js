/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/


// Clases de las Bibliotecas

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { FirstPersonControls } from "../libs/FirstPersonControls.js"
import {
	BufferGeometry,
	MeshPhongMaterial,
	LineBasicMaterial,
	ExtrudeGeometry,
	ObjectLoader, Vector3, Vector2
} from "../libs/three.module.js"
import {CSG} from '../libs/CSG-v2.js'
import {MTLLoader} from "../libs/MTLLoader.js"
import {OBJLoader} from "../libs/OBJLoader.js"
import * as TWEEN from '../libs/tween.esm.js'

// Clases del Proyecto

import {GestorCamaras} from "./cameras/GestorCamaras.js"
import {Sala, Pasillo} from "./rooms/Sala.js"
import {SalaPrincipal} from "./rooms/SalaPrincipal.js"
import {SalaIzquierda} from "./rooms/SalaIzquierda.js"
import {SalaDerecha} from "./rooms/SalaDerecha.js"
import {SalaSuperior} from "./rooms/SalaSuperior.js"

import {GameState} from "./GameState.js"
import {SistemaColisiones} from "./systems/SistemaColisiones.js"
import {SistemaInteraccion} from "./systems/SistemaInteraccion.js"
import {Config} from "./Config.js"


/**
 * Clase que hereda de THREE.Scene, con la que se gestionará todo el juego
 */

let FPSLimit = true
let isWindowFocused = true
let myDeltaTime = 1/30
let myDelta = 0

class EscapeTheLightrooms extends THREE.Scene
{
	// Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
	// la visualización de la escena
	constructor(myCanvas)
	{
		super()

		this.clock = new THREE.Clock(false)

		// Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
		this.renderer = this.createRenderer(myCanvas)

		// Se crea la interfaz gráfica de usuario
		this.gui = this.createGUI()

		this.inicializarGameState()

		// Construimos los distinos elementos que tendremos en la escena

		// Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
		// Tras crear cada elemento se añadirá a la escena con   this.add(variable)
		this.createLights ()

		// Tendremos una cámara con un control de movimiento con el ratón
		this.createCamera ()

		// Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
		//this.axis = new THREE.AxesHelper (50)
		//this.add (this.axis)

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

		/*let aCaja = 15
		let cajaGeo = new THREE.BoxGeometry(30, aCaja, 10)
		cajaGeo.translate(15, aCaja/2, 5)

		this.add(new THREE.Mesh(cajaGeo, new THREE.MeshBasicMaterial({color: 0xf7fa2a})))*/

		//
		//this.gestorCamaras.cambiarControladorCamara(0)
		//

		// TODO: Temporal para el focus
		document.addEventListener('focus', () => {
			isWindowFocused = true
		})

		document.addEventListener('blur', () => {
			isWindowFocused = false
		})

		this.clock.start()
	}

	inicializarGameState()
	{
		GameState.Initialize(this)

		this.collisionSystem = new SistemaColisiones({
			startPos: new Vector2(-500, -100),
			size: new Vector2(1000, 1000),
			maxDepth: 7
		})

		this.interactionSystem = new SistemaInteraccion()
		this.gestorCamaras = new GestorCamaras(this)

		// Debug
		this.add(this.collisionSystem.debugNode)

		// Colocar los sistemas
		GameState.systems.collision = this.collisionSystem
		GameState.systems.interaction = this.interactionSystem
		GameState.systems.cameras = this.gestorCamaras

		this.add(GameState.debug.O3Player)
	}

	// Crear las salas, unirlas y colocarlas

	crearSalas()
	{
		// Crear las salas
		this.salaPrincipal = new SalaPrincipal(150, 110, 55, {
			up: true,
			down: true,
			left: true,
			right: true
		})

		this.salaIzquierda = new SalaIzquierda(200, 120, 50, {
			right: true
		})

		this.salaDerecha = new SalaDerecha(120, 150, 80, {
			left: true
		})

		this.salaSuperior = new SalaSuperior(75, 110, 60, {
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
			this.salaPrincipal.largoParedX/2 + 4*Sala.GrosorPared() + this.salaPrincipal.pasilloIzquierda.largoPasillo)
		this.salaIzquierda.translateZ(this.salaPrincipal.largoParedZ/2 - this.salaIzquierda.largoParedZ/2)

		this.salaDerecha.translateX(-(this.salaDerecha.largoParedX/2 +
			this.salaPrincipal.largoParedX/2 + 4*Sala.GrosorPared() + this.salaPrincipal.pasilloDerecha.largoPasillo))
		this.salaDerecha.translateZ(this.salaPrincipal.largoParedZ/2 - this.salaDerecha.largoParedZ/2)

		this.salaSuperior.translateZ(this.salaPrincipal.largoParedZ
			+ 4*Sala.GrosorPared() + this.salaPrincipal.pasilloSuperior.largoPasillo)

		// Añadir los pasillos de conexión
		this.add(this.salaPrincipal)
		this.add(this.salaIzquierda)
		this.add(this.salaDerecha)
		this.add(this.salaSuperior)

		// TODO: NOTE: Importante cuándo llamamos a este método (debe ser después de meter los objetos al grafo)
		this.salaPrincipal.updateColliders()
		this.salaIzquierda.updateColliders()
		this.salaDerecha.updateColliders()
		this.salaSuperior.updateColliders()
	}

	//
	cambiarCamara(event)
	{
		//console.log("Recibo click")

		// TODO: Temporal
		if (!GameState.gameData.gameStarted)
		{
			GameState.gameData.gameStarted = true
			//console.log("Iniciando...")
			this.gestorCamaras.cambiarAControladorPrincipal()
		}
		else
		{
			this.interactionSystem.onMouseClick(event, this.gestorCamaras.getCamaraActiva())
		}
	}

	createCamera()
	{
		//window.addEventListener('click', this.cambiarCamara.bind(this))
		document.addEventListener('keydown', this.gestorCamaras.onKeyDown.bind(this.gestorCamaras))
		document.addEventListener('keyup', this.gestorCamaras.onKeyUp.bind(this.gestorCamaras) )
		document.addEventListener('mousemove', this.gestorCamaras.onMouseMove.bind(this.gestorCamaras))
	}

	// Este método inicia una animación de 0.2 segundos que rota la cámara 360º para precargar objetos pesados
	preloadCamera()
	{
		let camera = this.getCamera()
		const rInicial = camera.rotation.y


		let frameIni = {rY: rInicial}
		let frameFin = {rY: rInicial + 2*Math.PI}

		const aniPreCarga = new TWEEN.Tween(frameIni).to(frameFin, 3000)
			.onUpdate(() => {
				camera.rotation.y = frameIni.rY
			})
			.onComplete(() => {
				camera.rotation.y = rInicial
				console.log("Completed PreLoad")

				// Permitir que empiece el juego
				$("#boton-jugar")
					.html("Play")
					.addClass("ready")
					.on("click", (event) => {
						// Hacer el fade del menú al juego
						$("#menuPrincipal").css("display", "none")

						// Activar los clicks
						window.addEventListener('click', this.cambiarCamara.bind(this))
					})
			})

		aniPreCarga.start()
	}


	createGUI()
	{
		// Se crea la interfaz gráfica de usuario
		const gui = new GUI()

		//
		// Folder Luces
		//

		{
			/*this.guiMenuLuces = {
				intensidadLuzSP: 0.5,
				intensidadLuzSI: 0.5,
				intensidadLuzSD: 0.5,
				intensidadLuzSS: 0.5
			}

			const folder = gui.addFolder("Luces")

			folder.add(this.guiMenuLuces, "intensidadLuzSP", 0, 1, 0.05)
				.name("IL Sala Principal: ")
				.onChange((value) => this.setLightIntensity(value))*/
		}

		//
		// Folder Opciones
		//

		{
			this.guiMenuOpciones = {
				hayLimiteFPS: false,
				limiteFPS: 30
			}

			const folder = gui.addFolder("Opciones")

			folder.add(this.guiMenuOpciones, "hayLimiteFPS")
				.name("Límite FPS Activado: ")
				.onChange((value) => FPSLimit = value).listen()

			folder.add(this.guiMenuOpciones, "limiteFPS", 15, 240, 5)
				.name("Límite FPS: ")
				.onChange((value) => myDeltaTime = 1.0 / value).listen()
		}

		//
		// Folder Debug
		//

		{
			this.guiMenuDebug = {
				controlesVuelo: false,
				toggleRangoInteraccion: () => {
					if (GameState.gameData.interactionRangeEnabled)
						console.log("DEBUG: Desactivado rango interacción")
					else
						console.log("DEBUG: Activado rango interacción")

					GameState.gameData.interactionRangeEnabled = !GameState.gameData.interactionRangeEnabled
				},
				resetearPosicion: () => {
					let iniPos = GameState.player.initialPosition
					GameState.player.position.set(iniPos.x, iniPos.y, iniPos.z)
				}
			}

			const folder = gui.addFolder("Debug y Ayuda")

			folder.add(this.guiMenuDebug, "controlesVuelo")
				.name("Controles Vuelo Activados: ").onChange((value) => GameState.debug.controlesVuelo = value)

			folder.add(this.guiMenuDebug, "toggleRangoInteraccion")
				.name("[ TOGGLE RANGO INTERACCIÓN ]")

			folder.add(this.guiMenuDebug, "resetearPosicion")
				.name("[ RESETEAR POSICIÓN ]")
		}

		return gui
	}

	createLights()
	{
		// Ambiental
		const ambientLight = new THREE.AmbientLight(0xccddee, (Config.LIGHTS_ENABLED) ? 0.45 : 0.95)
		this.add(ambientLight)
	}

	setLightIntensity(valor)
	{
		//this.spotLight.intensity = valor
	}

	setAxisVisible(valor)
	{
		this.axis.visible = valor;
	}

	createRenderer(myCanvas)
	{
		// Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

		// Se instancia un Renderer   WebGL
		var renderer = new THREE.WebGLRenderer()

		// Se establece un color de fondo en las imágenes que genera el render
		renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0)

		// Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
		renderer.setSize(window.innerWidth, window.innerHeight)

		// La visualización se muestra en el lienzo recibido
		$(myCanvas).append(renderer.domElement)

		return renderer
	}

	getCamera()
	{
		// En principio se devuelve la única cámara que tenemos
		// Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
		return this.gestorCamaras.getCamaraActiva()
	}

	setCameraAspect(ratio)
	{
		this.gestorCamaras.setCameraAspect(ratio)
	}

	onWindowResize()
	{
		// Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
		// Hay que actualizar el ratio de aspecto de la cámara
		this.setCameraAspect (window.innerWidth / window.innerHeight)

		// Y también el tamaño del renderizador
		this.renderer.setSize (window.innerWidth, window.innerHeight)
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
				this.renderer.render (this, this.getCamera())
			}
		}
		else
		{
			this.renderer.render (this, this.getCamera())
		}

		// NOTE: Si el límite de fps está activo, puede haber problemas. No recomendado.
		if (isWindowFocused)
		{
			// TODO: TMP para el contro manual
			this.salaPrincipal.robot.update()

			// Se actualiza la posición de la cámara según su controlador
			this.gestorCamaras.update(currentDelta);

			// Actualizar modelos
			TWEEN.update()
		}

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
	main_scene.update()
	main_scene.preloadCamera()

	console.log("Game Started")
});
