/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

import {RandomIntInRange, ShuffleArray} from "../Utils.js"

class Laser extends THREE.Object3D
{
	constructor(dimensiones = {
		radioSoporte: 5,
		radioLaser: 4,
		alturaSoporte: 20,
		alturaLaser: 10,
		radioHuecoLaser: 0.25, // NOTE: El hueco se abre hasta la mitad del radio del laser
		tiempoAnimacionActivacion: 5000,
	})
	{
		super()

		this.radioSoporte = dimensiones.radioSoporte
		this.radioLaser = dimensiones.radioLaser
		this.alturaSoporte = dimensiones.alturaSoporte
		this.alturaLaser = dimensiones.alturaLaser
		this.radioHuecoLaser = dimensiones.radioHuecoLaser

		this.tiempoActivacion = dimensiones.tiempoAnimacionActivacion
		this.activado = false

		this.baseCollider = null

		this.haz = null
		this.coloresHaz = null
		this.colorSeleccionado = 0

		this.callbackCambioColor = null

		//
		// Materiales
		//

		const txLoader = GameState.txLoader

		let texturaSoporte = txLoader.load("../../resources/textures/models/metal-negro.jpg")
		texturaSoporte.wrapS = THREE.MirroredRepeatWrapping
		texturaSoporte.repeat.set(2, 1)

		this.materialSoporte = new THREE.MeshLambertMaterial({
			map: texturaSoporte
		})

		let texturaLaser = txLoader.load("../../resources/textures/models/metal-peligro.jpg")
		texturaLaser.wrapS = THREE.RepeatWrapping
		texturaLaser.repeat.set(2, 1)

		this.materialLaser = new THREE.MeshLambertMaterial({
			map: texturaLaser
		})

		// NO MODIFICAR
		this.materialHaz = new THREE.MeshBasicMaterial({color: 0xFFFFFF})

		//
		// Soporte
		//

		let geoSoporte = new THREE.CylinderGeometry(this.radioSoporte, this.radioSoporte, this.alturaSoporte)

		geoSoporte.translate(0, -(this.alturaSoporte/2 + this.alturaLaser/2), 0)
		this.add(new THREE.Mesh(geoSoporte.clone(), this.materialSoporte))

		geoSoporte.translate(0, this.alturaSoporte, 0)

		this.meshSoporteSuperior = new THREE.Mesh(geoSoporte, this.materialSoporte)
		this.add(this.meshSoporteSuperior)

		//
		// Láser
		//

		let geoLaser = new THREE.CylinderGeometry(this.radioLaser, this.radioLaser, this.alturaLaser)

		let geoRecorteLaser = new THREE.CylinderGeometry(this.radioHuecoLaser, this.radioHuecoLaser, this.radioLaser)
		geoRecorteLaser.rotateX(Math.PI/2)
		geoRecorteLaser.translate(0, 0, this.radioLaser/2)

		let csg = new CSG().union([new THREE.Mesh(geoLaser, this.materialLaser)])
			.subtract([new THREE.Mesh(geoRecorteLaser, null)])

		let meshRecorteLaser = csg.toMesh()

		let O3HazLaser = new THREE.Object3D() // NOTE: A este O3 se le engancha directamete el cilindro del haz
		meshRecorteLaser.add(O3HazLaser)

		this.add(meshRecorteLaser)

		//
		// Sonidos
		//

		this._crearSonidos()

		//
		// Animaciones
		//

		this._crearAnimaciones()

		//
		// Colisiones
		//

		this._crearColliders()
	}

	_crearSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadPositionalSound("../../resources/sounds/hydraulic.mp3", (audio) => {
			this._sonidos.mover = audio

			audio.setVolume(0.7)
			audio.setPlaybackRate(1.7)

			audio.setDistanceModel('linear')
			audio.setRefDistance(10)
			audio.setMaxDistance(130)
			audio.setRolloffFactor(0.94)

			// Posicionamiento en el cierre
			audio.translateY(this.alturaSoporte + this.alturaLaser/2)
			audio.translateZ(this.radioSoporte/2)

			this.add(audio)
		})

		GameState.systems.sound.loadPositionalSound("../../resources/sounds/plasmaCannon.wav", (audio) => {
			this._sonidos.disparar = audio

			audio.setVolume(0.7)

			audio.setDistanceModel('exponential')
			audio.setRefDistance(10)
			audio.setMaxDistance(100)
			audio.setRolloffFactor(0.6)

			// Posicionamiento en el cierre
			audio.translateY(this.alturaSoporte + this.alturaLaser/2)
			audio.translateZ(this.radioSoporte/2)

			this.add(audio)
		})
	}

	_crearAnimaciones()
	{
		this.animaciones = {}

		let frameDesactivado = { tY: 0 }
		let frameActivado = { tY: this.alturaLaser }

		this.animaciones.activacion = new TWEEN.Tween(frameDesactivado).to(frameActivado, this.tiempoActivacion)
			.onStart(() => {
				this._sonidos.mover.play()
			})
			.onUpdate(() => {
				this.meshSoporteSuperior.position.y = frameDesactivado.tY
			})
			.onComplete(() => {
				this.haz.visible = true
				this.activado = true

				frameDesactivado.tY = 0

				setTimeout(() => this._sonidos.disparar.play(), RandomIntInRange(15, 75))
			})

		this.animaciones.desactivacion = new TWEEN.Tween(frameActivado).to(frameDesactivado, this.tiempoActivacion)
			.onStart(() => {
				this.haz.visible = false
				this.activado = false
				this._sonidos.mover.play()
			})
			.onUpdate(() => {
				this.meshSoporteSuperior.position.y = frameActivado.tY
			})
			.onComplete(() => {
				frameActivado.tY = this.alturaLaser
			})
	}

	activarLaser()
	{
		if (this.activado)
		{
			console.error("El laser ya está activo")
			return
		}

		this.animaciones.activacion.start()
	}

	desactivarLaser()
	{
		if (!this.activado)
		{
			console.error("El laser ya estaba desactivado")
			return
		}

		this.animaciones.desactivacion.start()
	}

	setHaz(largoHaz, colores, visible = false)
	{
		if (this.haz !== null)
		{
			console.error("Has intentado setear un haz ya colocado")
			return
		}

		let geoHaz = new THREE.CylinderGeometry(this.radioHuecoLaser, this.radioHuecoLaser, largoHaz)
		geoHaz.rotateX(Math.PI/2)
		geoHaz.translate(0, 0, largoHaz/2)

		ShuffleArray(colores)
		this.coloresHaz = colores
		this.colorSeleccionado = -1 // NOTE: Luego se llama a seleccionar el siguiente color y se actualizará

		this.haz = new THREE.Mesh(geoHaz, this.materialHaz)
		this.haz.visible = visible

		this.siguienteColorHaz()

		this.add(this.haz)
	}

	setCallbackCambioColor(callback)
	{
		this.callbackCambioColor = callback
	}

	siguienteColorHaz()
	{
		if (this.haz === null || this.coloresHaz.length === 0)
		{
			console.error("Fallo al cambiar color. El haz es nulo o no hay colores")
			return
		}

		this.colorSeleccionado = (this.colorSeleccionado + 1) % this.coloresHaz.length
		this.materialHaz.color.setHex(this.coloresHaz[this.colorSeleccionado])
		this.materialHaz.needsUpdate = true

		if (this.callbackCambioColor !== null)
			this.callbackCambioColor()
	}

	getColorHaz()
	{
		return this.materialHaz.color.getHex()
	}

	updateColliders()
	{
		let colSys = GameState.systems.collision

		// Añado mis colliders
		this.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.uuid,
			SistemaColisiones.Box3ArrayToRectArray([this.baseCollider], this.matrixWorld))
	}

	_crearColliders()
	{
		let tmpMin = new THREE.Vector3(-this.radioSoporte, 0, -this.radioSoporte)
		let tmpMax = new THREE.Vector3(this.radioSoporte, 0, this.radioSoporte)

		this.baseCollider = new THREE.Box3(tmpMin, tmpMax)
	}
}

export {Laser}
