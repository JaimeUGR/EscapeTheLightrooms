
import {PerspectiveCamera} from "../../libs/three.module.js";
import {ControladorCamaraPrincipal} from "./ControladorCamaraPrincipal.js";
import {ControladorCamaraCinematica} from "./ControladorCamaraCinematica.js";
import {GameState} from "../GameState.js";

const ID_CAMARA_PRINCIPAL = 0
const ID_CAMARA_CINEMATICA = 1

class GestorCamaras
{
	constructor(game, gameState)
	{
		this.game = game
		this.gameState = gameState

		this.controladoresCamaras = []
		this.activeController = null
		this.activeCameraID = -1

		// Crear la cámara principal
		this.camaraPrincipal = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)

		// Colocar la cámara en la posición del jugador inicial
		this.camaraPrincipal.position.set(GameState.player.position.x, GameState.player.position.y, GameState.player.position.z)
		this.camaraPrincipal.lookAt(GameState.player.position.x, GameState.player.position.y, GameState.player.position.z + 1)

		// Añadir el controlador principal
		this._crearControladorPrincipal()

		// Añadir la cámara cinemática
		this._crearControladorCinematica()
	}

	_crearControladorPrincipal()
	{
		// Crear el controlador
		let controladorCam = new ControladorCamaraPrincipal(this.camaraPrincipal, this.game.renderer.domElement)

		// Añadir el controlador a la lista
		this.aniadeControlador(controladorCam)
	}

	_crearControladorCinematica()
	{
		// Crear el controlador
		let controladorCam = new ControladorCamaraCinematica(this.camaraPrincipal)

		// Añadir el controlador a la lista
		this.aniadeControlador(controladorCam, true)
	}

	// PRE: Este controlador tendrá una cámara distinta a la principal
	aniadeControlador(controladorCamara, setActive = false)
	{
		// Añadir la cámara a los controladores
		this.controladoresCamaras.push(controladorCamara)

		// Añadir la cámara a la escena
		this.game.add(controladorCamara.camara)

		// Generar el id
		let id = this.controladoresCamaras.length - 1

		if (setActive)
			this.cambiarControladorCamara(id)

		return id
	}

	cambiarAControladorPrincipal()
	{
		this.cambiarControladorCamara(ID_CAMARA_PRINCIPAL)
	}

	cambiarAControladorCinematica()
	{
		this.cambiarControladorCamara(ID_CAMARA_CINEMATICA)
	}

	cambiarControladorCamara(id)
	{
		// Fallback a la cámara del jugador
		if (id >= this.controladoresCamaras.length)
			id = ID_CAMARA_PRINCIPAL

		// Si es la cámara activa no se hace nada
		if (id === this.activeCameraID)
			return false

		// Desactivar la cámara actual
		if (this.activeController != null)
			this.activeController.disable()

		// Activar la nueva
		this.activeCameraID = id
		this.activeController = this.controladoresCamaras[this.activeCameraID]

		console.log(this.activeCameraID)
		console.log(this.activeController)

		this.activeController.enable()

		return true
	}

	getControladorActivo()
	{
		return this.activeController
	}

	getCamaraActiva()
	{
		return this.activeController.camara
	}

	setCameraAspect(ratio)
	{
		this.controladoresCamaras.forEach((controladorCam) => {
			controladorCam.camara.aspect = ratio
			controladorCam.camara.updateProjectionMatrix()
		})
	}

	// Eventos
	onKeyUp(event)
	{
		this.activeController.onKeyUp(event)
	}

	onKeyDown(event)
	{
		this.activeController.onKeyDown(event)
	}

	onMouseMove(event)
	{
		this.activeController.onMouseMove(event)
	}

	update(deltaTime)
	{
		this.activeController.update(deltaTime)
	}
}

export {GestorCamaras}