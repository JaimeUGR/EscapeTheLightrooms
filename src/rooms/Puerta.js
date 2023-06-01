
import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

import {Sala, Marcos} from "./Sala.js"
import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

const Marco_X = 1

class Puerta extends THREE.Object3D
{
	constructor()
	{
		super()

		this.puertaX = Sala.AnchoPuerta() - 2*Marcos.GrosorInterior()
		this.puertaY = Sala.AltoPuerta() - Marcos.GrosorInterior()
		this.puertaZ = Sala.GrosorPared()

		this.baseCollider = null

		//
		// Material
		//

		this.materialPuerta = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})
		this.materialPomo = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		//
		// Modelado
		//

		let geoPuerta = new THREE.BoxGeometry(this.puertaX, this.puertaY, this.puertaZ)
		geoPuerta.translate(this.puertaX/2, this.puertaY/2, -this.puertaZ/2)

		this.meshPuerta = new THREE.Mesh(geoPuerta, this.materialPuerta)

		let pomo = this.createPomo()

		this.meshPuerta.add(pomo)
		this.add(this.meshPuerta)

		// Para la animación
		this.meshPuerta.translateX(-this.puertaX/2)
		// NOTE: Modificar este valor para abrir la puerta
		this.meshPuerta.rotation.y = 0

		//
		// Animación
		//

		this._crearAnimacion()

		//
		// Colisiones
		//

		this._crearColliders()

		//
		// Interacción
		//

		// TODO: TMP Para hacer pruebas. Solo si no hacemos lo del robot lo dejaremos
		pomo.userData.interaction = {
			interact: this.abrirPuerta.bind(this)
		}
	}

	_crearAnimacion()
	{
		this.animaciones = {}

		let framePuertaCerrada = {rY: 0}
		let framePuertaAbierta = {rY: -Math.PI/2}

		this.animaciones.abrirPuerta = new TWEEN.Tween(framePuertaCerrada).to(framePuertaAbierta, 2000)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onStart(() => {
				// NOTE: Iniciar cinemática y bloquear entrada
			})
			.onUpdate(() => {
				this.meshPuerta.rotation.y = framePuertaCerrada.rY
			})
			.onComplete(() => {
				// Cambiar el collider de la puerta al que tendría abierta
				this._crearColliders(true)
				this.updateColliders()
			})
	}

	abrirPuerta()
	{
		if (!GameState.flags.robotConPila)
			return

		// NOTE: Por si acaso. Si no dejas la interacción manual no hace falta
		GameState.flags.robotConPila = false

		this.animaciones.abrirPuerta.start()
	}

	updateColliders()
	{
		let colSys = GameState.systems.collision

		// Añado mis colliders
		this.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.uuid,
			SistemaColisiones.Box3ArrayToRectArray([this.baseCollider], this.matrixWorld))
	}

	_crearColliders(estaAbierta = false)
	{
		if (!estaAbierta)
		{
			let tmpMin = new THREE.Vector3(-this.puertaX/2, 0, -this.puertaZ)
			let tmpMax = new THREE.Vector3(this.puertaX/2, 0, 0)

			this.baseCollider = new THREE.Box3(tmpMin, tmpMax)
		}
		else
		{
			let tmpMin = new THREE.Vector3(-this.puertaX/2, 0, 0)
			let tmpMax = new THREE.Vector3(-this.puertaX/2 + this.puertaZ, 0, this.puertaX)

			this.baseCollider = new THREE.Box3(tmpMin, tmpMax)
		}
	}

	createPomo()
	{
		let points = []

		points.push(new THREE.Vector3(1,0,0))
		points.push(new THREE.Vector3(1,0.5,0))
		points.push(new THREE.Vector3(1.5,0.5,0))
		points.push(new THREE.Vector3(1.5,1,0))
		points.push(new THREE.Vector3(1,1,0))
		points.push(new THREE.Vector3(0,1,0))

		let geoPomo = new THREE.LatheGeometry(points, 20, 0, Math.PI* 2)
		geoPomo.rotateX(Math.PI/2)
		geoPomo.translate(this.puertaX - this.puertaX/4, this.puertaY/2, 0)

		return new THREE.Mesh(geoPomo, this.materialPomo)
	}
}

export {Puerta}
