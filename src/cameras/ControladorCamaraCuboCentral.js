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
	}

	enable()
	{
		GameState.tmp.cameraLock = true

		// RESET
		this.rotacionCubo = 0
		this.rotacionCamara = 0

		this.cuboCentral.animaciones.camara.activa = true

		// TODO: Desactivar el rango de interacción?
	}

	disable()
	{
		GameState.tmp.cameraLock = false

		this.cuboCentral.O3Cubo.rotation.y = 0
		this.O3Camara.rotation.x = 0

		this.cuboCentral.animaciones.camara.activa = false

		// TODO: Reactivar el rango de interacción?
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
		this.cuboCentral.O3Cubo.rotation.y = this.rotacionCubo
	}

	aplicarRotacionCamara()
	{
		// Aplicar las posibles rotaciones
		this.O3Camara.rotation.x = this.rotacionCamara
	}
}

export {ControladorCamaraCuboCentral}
