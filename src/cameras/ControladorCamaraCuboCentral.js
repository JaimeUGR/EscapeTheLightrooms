
import * as TWEEN from '../../libs/tween.esm.js'
import {Object3D} from "../../libs/three.module.js"
import {ControladorCamara} from "./ControladorCamara.js"
import {GameState} from "../GameState.js"

class ControladorCamaraCuboCentral extends ControladorCamara
{
	constructor(camara, cuboCentral)
	{
		super(camara)
		this.isSceneCamera = false

		this.cuboCentral = cuboCentral

		this.rotacionCubo = 0
		this.rotacionCamara = 0

		this.O3Camara = new Object3D()
		this.O3Camara.add(this.camara)

		// Posicionar la cámara manualmente respecto al cubo
		this.cuboCentral.add(this.O3Camara)

		this.camara.position.set(0, 0, this.cuboCentral.ladoCubo + 2*this.cuboCentral.bordeCubo + 15)
		this.camara.lookAt(0, 0, 0)

		this._crearAnimaciones()
	}

	enable()
	{
		GameState.tmp.cameraLock = true

		// RESET
		this.rotacionCubo = 0
		this.rotacionCamara = 0

		this.cuboCentral.animaciones.camara.activa = true

		// TODO: Desactivar el rango de interacción
	}

	disable()
	{
		GameState.tmp.cameraLock = false

		this.cuboCentral.O3Cubo.rotation.y = 0
		this.O3Camara.rotation.x = 0

		this.cuboCentral.animaciones.camara.activa = false

		// TODO: Reactivar el rango de interacción
	}

	onKeyUp(event)
	{
		switch (event.code)
		{
			// NOTE: lo hacemos aquí para que el up se lance aquí
			case "Escape":
				// Salir de este controlador y volver al principal
				GameState.systems.cameras.cambiarAControladorPrincipal()
				break
		}
	}

	onKeyDown(event)
	{
		// NOTE: Si añadimos teclas que no animen, hay que mover esto
		if (this._animating)
			return

		switch (event.code)
		{
			case "KeyA":
				this.rotacionCubo += Math.PI/2
				this.aplicarRotacionCubo()
				break
			case "KeyD":
				this.rotacionCubo -= Math.PI/2
				this.aplicarRotacionCubo()
				break
			case "KeyW":

				if (this.rotacionCamara === 0)
					this.rotacionCamara = -Math.PI/2

				this.aplicarRotacionCamara()
				break
			case "KeyS":
				if (this.rotacionCamara !== 0)
					this.rotacionCamara = 0

				this.aplicarRotacionCamara()
				break
		}
	}

	aplicarRotacionCubo()
	{
		// Aplicar las posibles rotaciones
		//this.cuboCentral.O3Cubo.rotation.y = this.rotacionCubo

		if (this._animating)
			return

		this._animating = true

		this.animaciones.rotarCubo.rotacionActual = this.cuboCentral.O3Cubo.rotation.y
		this.animaciones.rotarCubo.rotacionObjetivo = this.rotacionCubo
		this.animaciones.rotarCubo.animacion.start()
	}

	aplicarRotacionCamara()
	{
		// Aplicar las posibles rotaciones
		//this.O3Camara.rotation.x = this.rotacionCamara

		if (this._animating)
			return

		this._animating = true

		this.animaciones.subirCamara.rotacionActual = this.O3Camara.rotation.x
		this.animaciones.subirCamara.rotacionObjetivo = this.rotacionCamara
		this.animaciones.subirCamara.animacion.start()
	}

	_crearAnimaciones()
	{
		this._animating = false

		this.animaciones = {}

		this.animaciones.rotarCubo = {
			animacion: null,
			rotacionActual: 0,
			rotacionObjetivo: 0
		}

		this.animaciones.subirCamara = {
			animacion: null,
			rotacionActual: 0,
			rotacionObjetivo: 0
		}

		let frameRCubo_I = { rY: 0 }
		let frameRCubo_F = { rY: 0 }
		let frameRCamara_I = { rX: 0 }
		let frameRCamara_F = { rX: 0 }

		let animacionRotarCubo = new TWEEN.Tween(frameRCubo_I).to(frameRCubo_F, 500)
			.onStart(() => {
				frameRCubo_F.rY = this.animaciones.rotarCubo.rotacionObjetivo -  this.animaciones.rotarCubo.rotacionActual
			})
			.onUpdate(() => {
				this.cuboCentral.O3Cubo.rotation.y = this.animaciones.rotarCubo.rotacionActual + frameRCubo_I.rY
			})
			.onComplete(() => {
				frameRCubo_I.rY = 0
				this._animating = false
			})

		let animacionRotarCamara = new TWEEN.Tween(frameRCamara_I).to(frameRCamara_F, 500)
			.onStart(() => {
				frameRCamara_F.rX = this.animaciones.subirCamara.rotacionObjetivo -  this.animaciones.subirCamara.rotacionActual
			})
			.onUpdate(() => {
				this.O3Camara.rotation.x = this.animaciones.subirCamara.rotacionActual + frameRCamara_I.rX
			})
			.onComplete(() => {
				frameRCamara_I.rX = 0
				this._animating = false
			})

		this.animaciones.rotarCubo.animacion = animacionRotarCubo
		this.animaciones.subirCamara.animacion = animacionRotarCamara
	}
}

export {ControladorCamaraCuboCentral}
