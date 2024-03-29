/*
 * Copyright (c) 2023. Jaime P. and Francisco E.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */


// Clases de las Bibliotecas

import * as THREE from '../libs/three.module.js'
import {GUI} from '../libs/dat.gui.module.js'
import * as TWEEN from '../libs/tween.esm.js'

// Clases del Proyecto

import {GestorCamaras} from "./cameras/GestorCamaras.js"
import {Sala} from "./rooms/Sala.js"
import {SalaPrincipal} from "./rooms/SalaPrincipal.js"
import {SalaIzquierda} from "./rooms/SalaIzquierda.js"
import {SalaDerecha} from "./rooms/SalaDerecha.js"
import {SalaSuperior} from "./rooms/SalaSuperior.js"
import {SalaFinal} from "./rooms/SalaFinal.js"


import {GameState} from "./GameState.js"
import {SistemaColisiones} from "./systems/SistemaColisiones.js"
import {SistemaInteraccion} from "./systems/SistemaInteraccion.js"
import {SistemaMensajes} from "./systems/SistemaMensajes.js"
import {SistemaSonidos} from "./systems/SistemaSonidos.js"
import {Config} from "./Config.js"
import {MSG_INICIO_CONTROLES, MSG_INICIO_JUEGO} from "./messages/messages.js"
import {RandomIntInRange} from "./Utils.js"
import {EndLocation} from "./locations/EndLocation.js"

//
// Variables de control general
//

let FPSLimit = true
let isWindowFocused = true
let myDeltaTime = 1/30
let myDelta = 0

/*
	// TODO: Separar los sistemas del juego y el propio juego de la escena
	Escena principal y clase gestora de los sistemas principales.

	Se establece en el GameState como game. Inicializa los sistemas, cámaras, renderizado y eventos.
	Gestiona también los menús.
 */
class EscapeTheLightrooms extends THREE.Scene
{
	// Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
	// la visualización de la escena
	constructor(myCanvas)
	{
		super()

		//
		// Inicialización
		//

		this.sonidos = {}

		this.clock = new THREE.Clock(false)

		// Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
		this.renderer = this.createRenderer(myCanvas)

		this.inicializarMenus()
		this.inicializarGameState()

		// Se crea la interfaz gráfica de usuario
		this.gui = this.createGUI()

		//
		// Crear las luces
		//

		this.createLights ()


		//
		// Crear las salas
		//

		this.crearSalas()

		//
		// Eventos de focus
		//

		this.createEventHandlers()

		this.clock.start()
	}

	inicializarGameState()
	{
		GameState.Initialize(this)

		this.soundSystem = new SistemaSonidos()
		GameState.systems.sound = this.soundSystem

		this.collisionSystem = new SistemaColisiones({
			startPos: new THREE.Vector2(-500, -100),
			size: new THREE.Vector2(1000, 1000),
			maxDepth: 7
		})

		this.interactionSystem = new SistemaInteraccion()
		this.gestorCamaras = new GestorCamaras(this)
		this.messageSystem = new SistemaMensajes()

		// Debug
		this.add(this.collisionSystem.debugNode)

		// Colocar los sistemas
		GameState.systems.collision = this.collisionSystem
		GameState.systems.interaction = this.interactionSystem
		GameState.systems.cameras = this.gestorCamaras
		GameState.systems.messages = this.messageSystem

		this.add(GameState.debug.O3Player)

		//
		// Localizaciones
		//
		GameState.locations.end = new EndLocation(this)
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

		this.salaFinal = new SalaFinal(Sala.AnchoPuerta() + 30, 50, 300, {
			up: true
		})

		// Colocar las salas en su posición final
		// Centrar las salas
		this.salaPrincipal.translateX(-this.salaPrincipal.largoParedX/2)
		this.salaIzquierda.translateX(-this.salaIzquierda.largoParedX/2)
		this.salaDerecha.translateX(-this.salaDerecha.largoParedX/2)
		this.salaSuperior.translateX(-this.salaSuperior.largoParedX/2)
		this.salaFinal.translateX(-this.salaFinal.largoParedX/2)

		// Posicionamos las salas adyacentes a la principal
		this.salaIzquierda.translateX(this.salaIzquierda.largoParedX/2 +
			this.salaPrincipal.largoParedX/2 + 4*Sala.GrosorPared() + this.salaPrincipal.pasilloIzquierda.largoPasillo)
		this.salaIzquierda.translateZ(this.salaPrincipal.largoParedZ/2 - this.salaIzquierda.largoParedZ/2)

		this.salaDerecha.translateX(-(this.salaDerecha.largoParedX/2 +
			this.salaPrincipal.largoParedX/2 + 4*Sala.GrosorPared() + this.salaPrincipal.pasilloDerecha.largoPasillo))
		this.salaDerecha.translateZ(this.salaPrincipal.largoParedZ/2 - this.salaDerecha.largoParedZ/2)

		this.salaSuperior.translateZ(this.salaPrincipal.largoParedZ
			+ 4*Sala.GrosorPared() + this.salaPrincipal.pasilloSuperior.largoPasillo)

		this.salaFinal.translateZ(-(this.salaFinal.largoParedZ + 2*Sala.GrosorPared()))

		// Añadir los pasillos de conexión
		this.add(this.salaPrincipal)
		this.add(this.salaIzquierda)
		this.add(this.salaDerecha)
		this.add(this.salaSuperior)
		this.add(this.salaFinal)

		// NOTE: Importante cuándo llamamos a este método (debe ser después de meter los objetos al grafo)
		this.salaPrincipal.updateColliders()
		this.salaIzquierda.updateColliders()
		this.salaDerecha.updateColliders()
		this.salaSuperior.updateColliders()
		this.salaFinal.updateColliders()
	}

	//
	inicializarMenus()
	{
		// Menú Juego
		this.enMenuJuego = false

		$("#cerrarMenuJuego")
			.on("click", (event) => {
				// Para que no se pueda interactuar al pulsar este botón
				event.stopPropagation()

				$("#menuJuego").css("display", "none")
				this.enMenuJuego = false
			})

		// Menú Controles
		$(".menu-boton-controles")
			.on("click", () => {
				// Abrir el menú de controles
				$("#menuControles").css("display", "block")
			})

		$("#cerrarMenuControles")
			.on("click", () => {
				$("#menuControles").css("display", "none")
			})

		// Menú Créditos

		$(".menu-boton-creditos")
			.on("click", () => {
				// Abrir el menú de créditos
				$("#menuCreditos").css("display", "block")
			})

		$("#cerrarMenuCreditos")
			.on("click", () => {
				$("#menuCreditos").css("display", "none")
			})
	}

	//
	mostrarMenuJuego()
	{
		console.log("Muestro el menu")

		this.enMenuJuego = true

		$("#menuJuego")
			.css("display", "flex")
	}

	//
	inicializarSonidoAmbiente()
	{
		// Cargar el audio
		this.soundSystem.loadGlobalSound("./resources/sounds/asteroid-atmosphere.wav", (audio) => {
			this.sonidos.atmAmbiental = {
				audio: audio,
				baseVolume: 0.08,
				duration: audio.buffer.duration*1000, // MS
				enabled: true
			}

			audio.setVolume(this.sonidos.atmAmbiental.baseVolume)

			// Replay random
			const playAudioRandom = () => {
				if (!this.sonidos.atmAmbiental.enabled)
					return

				this.sonidos.atmAmbiental.audio.play()
				setTimeout(playAudioRandom, RandomIntInRange(100 + this.sonidos.atmAmbiental.duration, 5000 + this.sonidos.atmAmbiental.duration))
			}

			playAudioRandom()
		})
	}

	//
	_procesarClick(event)
	{
		//console.log("Recibo click")

		// Iniciar el juego
		if (!GameState.gameData.gameStarted)
		{
			GameState.gameData.gameStarted = true
			//console.log("Iniciando...")
			this.messageSystem.mostrarMensaje(MSG_INICIO_JUEGO, 20000)
			this.messageSystem.mostrarMensaje(MSG_INICIO_CONTROLES, 15000)
			this.gestorCamaras.cambiarAControladorPrincipal()

			// Iniciar la música de ambiente
			this.inicializarSonidoAmbiente()
		}
		else // Procesar el click
		{
			if (this.enMenuJuego)
				return

			this.interactionSystem.onMouseClick(event, this.gestorCamaras.getCamaraActiva())
		}
	}

	createEventHandlers()
	{
		//
		// Eventos de interacción
		//

		document.addEventListener('keydown', (event) => {
			if (!GameState.gameData.gameStarted || !GameState.gameData.inputEnabled)
				return

			// Si hay algún menú mostrado, se ignoran las pulsaciones
			if (this.enMenuJuego)
				return

			// Tecla ESC
			if (event.code === "Escape")
			{
				// Mostrar el menú del juego
				GameState.scene.mostrarMenuJuego()
				return
			}

			// Eventos dirigidos al movimiento / cámaras
			this.gestorCamaras.onKeyDown(event)
		})

		document.addEventListener('keyup', this.gestorCamaras.onKeyUp.bind(this.gestorCamaras))
		document.addEventListener('mousemove', this.gestorCamaras.onMouseMove.bind(this.gestorCamaras))


		//
		// Focus
		//

		document.addEventListener('focus', () => {
			isWindowFocused = true
		})

		document.addEventListener('blur', () => {
			isWindowFocused = false
		})
	}

	// Este método inicia una animación de 0.2 segundos que rota la cámara 360º para precargar objetos pesados
	preloadCamera()
	{
		let camera = this.getCamera()
		const rInicial = camera.rotation.y


		let frameIni = {rY: rInicial}
		let frameFin = {rY: rInicial + 2*Math.PI}

		const aniPreCarga = new TWEEN.Tween(frameIni).to(frameFin, 4000)
			.onUpdate(() => {
				camera.rotation.y = frameIni.rY
			})
			.onComplete(() => {
				camera.rotation.y = rInicial
				console.log("Completed PreLoad")

				// Esperar a que el audio esté cargado
				const esperarCargasAdicionales = () => {

					// Audio Cargado
					if (GameState.systems.sound.hasPendingLoads())
					{
						console.log("Esperando Carga Adicional")
						setTimeout(esperarCargasAdicionales, 200)
						return
					}

					// Estamos esperando en el menú principal
					this.enMenuJuego = true

					// Permitir que empiece el juego
					$("#botonJugar")
						.html("Play")
						.addClass("ready")
						.on("click", (event) => {
							// Activar
							this.enMenuJuego = false

							// Hacer el fade del menú al juego
							$("#menuPrincipal").css("display", "none")

							// Activar el robot
							setTimeout(() => {
								this.salaPrincipal.robot.iniciaAnimacionContinua()
							}, 2500)

							// Activar los clicks
							window.addEventListener('click', this._procesarClick.bind(this))
						})
				}

				esperarCargasAdicionales()
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
				volumenSonido: 1,
				volumenSonidoAmbiental: 0.5,
				hayLimiteFPS: false,
				limiteFPS: 30,
				resetearPosicion: () => {
					let iniPos = GameState.player.initialPosition

					console.log("DEBUG: Player position reset")

					GameState.player.position.set(iniPos.x, iniPos.y, iniPos.z)
				}
			}

			const folder = gui.addFolder("Options")

			folder.add(this.guiMenuOpciones, "volumenSonido", 0, 1, 0.01)
				.name("Master Volume:")
				.onChange((value) => GameState.systems.sound.getAudioListener().setMasterVolume(value))

			folder.add(this.guiMenuOpciones, "volumenSonidoAmbiental", 0, 1, 0.01)
				.name("Ambiental Volume:")
				.onChange((value) => this.sonidos.atmAmbiental.audio.setVolume(this.sonidos.atmAmbiental.baseVolume * value * 2))

			folder.add(this.guiMenuOpciones, "hayLimiteFPS")
				.name("Limit max FPS:")
				.onChange((value) => FPSLimit = value).listen()

			folder.add(this.guiMenuOpciones, "limiteFPS", 15, 240, 5)
				.name("FPS Limit:")
				.onChange((value) => myDeltaTime = 1.0 / value).listen()

			folder.add(this.guiMenuOpciones, "resetearPosicion")
				.name("[ RESET POSITION ]")
		}

		//
		// Folder Debug
		//

		{
			this.guiMenuDebug = {
				controlesVuelo: false,
				toggleColisiones: () => {
					if (GameState.gameData.colsEnabled)
						console.log("DEBUG: Collisions disabled")
					else
						console.log("DEBUG: Collisions enabled")

					GameState.gameData.colsEnabled = !GameState.gameData.colsEnabled
				},
				toggleRangoInteraccion: () => {
					if (GameState.gameData.interactionRangeEnabled)
						console.log("DEBUG: Interaction range disabled")
					else
						console.log("DEBUG: Interaction range enabled")

					GameState.gameData.interactionRangeEnabled = !GameState.gameData.interactionRangeEnabled
				}
			}

			// Debug
			{
				const folder = gui.addFolder("Debug")

				folder.add(this.guiMenuDebug, "controlesVuelo")
					.name("Fly (R - F): ").onChange((value) => GameState.debug.controlesVuelo = value)

				folder.add(this.guiMenuDebug, "toggleColisiones")
					.name("[ TOGGLE COLLISIONS ]")

				folder.add(this.guiMenuDebug, "toggleRangoInteraccion")
					.name("[ TOGGLE INTERACTION RANGE ]")

				const subFolder = folder.addFolder("Flags")
				subFolder.add(GameState.flags, "tieneDestornillador")
					.name("tieneDestornillador").listen()
				subFolder.add(GameState.flags, "tieneTarjeta")
					.name("tieneTarjeta").listen()
				subFolder.add(GameState.flags, "tieneManecillaHora")
					.name("tieneManecillaHora").listen()
				subFolder.add(GameState.flags, "tieneManecillaMinuto")
					.name("tieneManecillaMinuto").listen()
				subFolder.add(GameState.flags, "tienePrisma")
					.name("tienePrisma").listen()
				subFolder.add(GameState.flags, "tienePila")
					.name("tienePila").listen()
				subFolder.add(GameState.flags, "robotConPila")
					.name("robotConPila").listen()
				subFolder.add(GameState.flags, "salidaAbierta")
					.name("salidaAbierta").listen()
			}
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
		const isGamePaused = !isWindowFocused || this.enMenuJuego
		let currentDelta = this.clock.getDelta()

		if (isGamePaused)
		{
			setTimeout(() => this.update(), FPSLimit ? myDeltaTime : 1 / 60.0)
			return
		}

		if (FPSLimit)
		{
			myDelta += currentDelta

			if (myDelta >= myDeltaTime)
			{
				myDelta -= myDeltaTime

				// Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
				this.renderer.render(this, this.getCamera())
			}
		}
		else
		{
			this.renderer.render(this, this.getCamera())
		}

		// Para permitir el control manual del robot
		this.salaPrincipal.robot.update()

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
	main_scene.update()
	main_scene.preloadCamera()

	console.log("Game Started")
});
