
import {ControladorCamara} from "./ControladorCamara.js"
import * as THREE from '../../libs/three.module.js'
import {PointerLockControls} from "../../libs/PointerLockControls.js"
import {GameState} from "../GameState.js"


class ControladorCamaraPrincipal extends ControladorCamara
{
	constructor(camara, domElement)
	{
		super(camara)

		this.controlador = new PointerLockControls(camara, domElement)
		this.controlador.disconnect()

		this.controlador.isLocked = true

		this.moveForward = false
		this.moveBackward = false
		this.moveLeft = false
		this.moveRight = false
		this.moveUp = false
		this.moveDown = false

		this.velocity = new THREE.Vector3()
		this.direction = new THREE.Vector3()
	}

	enable()
	{
		// NOTA: Esta activación desactivación se habrá hecho pulsando el control
		/*this._puedeBloquear = true
		this.pantallaElemento = document.getElementById( 'pantalla' );

		this.pantallaElemento.addEventListener('click', this._iniciarBloqueo().bind(this))
		this.cameraControl.addEventListener('lock', this._bloquear.bind(this))
		this.cameraControl.addEventListener('unlock', this._desbloquear().bind(this));*/
		this.controlador.lock()
	}

	disable()
	{
		this.controlador.unlock()
	}

	onMouseMove(event)
	{
		// TODO: Cuando se hace el desbloqueo, hay que ignorar esto o la cámara se moverá
		console.log("A")
		this.controlador._onMouseMove(event)
	}

	onKeyDown(event)
	{
		console.log(event.code)
		switch (event.code)
		{
			case 'ArrowUp':
			case 'KeyW':
				this.moveForward = true
				break

			case 'ArrowLeft':
			case 'KeyA':
				this.moveLeft = true
				break

			case 'ArrowDown':
			case 'KeyS':
				this.moveBackward = true
				break

			case 'ArrowRight':
			case 'KeyD':
				this.moveRight = true
				break
			case 'KeyR':
			case 'Space':
				this.moveUp = true
				break
			case 'KeyF':
			case 'ShiftLeft':
				this.moveDown = true
				break
		}
	}

	onKeyUp(event)
	{
		switch (event.code)
		{
			case 'ArrowUp':
			case 'KeyW':
				this.moveForward = false
				break

			case 'ArrowLeft':
			case 'KeyA':
				this.moveLeft = false
				break

			case 'ArrowDown':
			case 'KeyS':
				this.moveBackward = false
				break

			case 'ArrowRight':
			case 'KeyD':
				this.moveRight = false
				break
			case 'KeyR':
			case 'Space':
				this.moveUp = false
				break
			case 'KeyF':
			case 'ShiftLeft':
				this.moveDown = false
				break
		}
	}

	update(deltaTime)
	{
		// Movimiento principal del jugador TODO: Hacer esto en otro sitio
		this.velocity.x -= this.velocity.x * 10.0 * deltaTime
		this.velocity.y -= this.velocity.y * 10.0 * deltaTime
		this.velocity.z -= this.velocity.z * 10.0 * deltaTime

		this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
		this.direction.y = Number(this.moveDown) - Number(this.moveUp)
		this.direction.x = Number(this.moveRight) - Number(this.moveLeft)
		this.direction.normalize() // this ensures consistent movements in all directions

		if (this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 800.0 * deltaTime
		if (this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 800.0 * deltaTime
		if (this.moveUp || this.moveDown) this.velocity.y -= this.direction.y * 800.0 * deltaTime


		/*this.controlador.moveRight(- this.velocity.x * deltaTime)
		this.controlador.moveForward(- this.velocity.z * deltaTime)
		this.controlador.getObject().position.y += (this.velocity.y * deltaTime)*/

		// Actualizar la posición del jugador
		// Obtener el vector de movimiento de la cámara
		let movementVector = new THREE.Vector3(0, 0, 0)
		let tmpVector = new THREE.Vector3()

		// X
		tmpVector.setFromMatrixColumn(this.camara.matrix, 0)
		movementVector.addScaledVector(tmpVector, - this.velocity.x * deltaTime)

		// Z
		tmpVector.setFromMatrixColumn(this.camara.matrix, 0)
		tmpVector.crossVectors(this.camara.up, tmpVector);
		movementVector.addScaledVector(tmpVector, -this.velocity.z * deltaTime);

		// Y
		movementVector.y += (this.velocity.y * deltaTime)

		// Aplicar el vector de movimiento
		GameState.systems.collision.update(movementVector)

		// Actualizar la posición de la cámara
		this.camara.position.set(GameState.player.position.x,
			GameState.player.position.y, GameState.player.position.z)
	}
}

export {ControladorCamaraPrincipal}
