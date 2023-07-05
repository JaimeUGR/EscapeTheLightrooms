/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

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

		const txLoader = GameState.txLoader

		let texturaPuerta = txLoader.load("./resources/textures/models/madera-clara.jpg")
		let texturaPomo = txLoader.load("./resources/textures/models/oro1.jpeg")

		this.materialPuerta = new THREE.MeshLambertMaterial({map: texturaPuerta})
		this.materialPomo = new THREE.MeshLambertMaterial({map: texturaPomo})

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
		// Crear sonidos
		//

		this._crearSonidos()

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

	_crearSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadGlobalSound("./resources/sounds/doorIsLocked.wav", (audio) => {
			this._sonidos.bloqueada = audio

			audio.setVolume(0.3)
			audio.setPlaybackRate(0.8)
		})

		GameState.systems.sound.loadPositionalSound("./resources/sounds/openWoodDoor.wav", (audio) => {
			this._sonidos.abrir = audio

			audio.setVolume(0.3)
			audio.setPlaybackRate(1.38)

			audio.setDistanceModel('linear')
			audio.setRefDistance(25)
			audio.setMaxDistance(100)
			audio.setRolloffFactor(0.95)

			audio.translateX(-this.puertaX/2)
			audio.translateY(this.puertaY/2)

			this.add(audio)
		})
	}

	_crearAnimacion()
	{
		this.animaciones = {}

		let framePuertaCerrada = {rY: 0}
		let framePuertaAbierta = {rY: -Math.PI/2}

		this.animaciones.abrirPuerta = new TWEEN.Tween(framePuertaCerrada).to(framePuertaAbierta, 2000)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onStart(() => {
				GameState.flags.salidaAbierta = true
				// NOTE: Iniciar cinemática y bloquear entrada

				this._sonidos.abrir.play()
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
		{
			// Sonido puerta cerrada
			if (!this._sonidos.bloqueada.isPlaying)
				this._sonidos.bloqueada.play()

			return
		}

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
