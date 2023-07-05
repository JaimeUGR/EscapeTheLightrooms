/*
 * Copyright (c) 2023. Jaime Pérez García y Francisco Expósito Carmona.
 *
 * Escape The Lightrooms
 *
 * Todos los derechos reservados sobre la pertenencia del código, modelos y animaciones.
 * Las texturas están debidamente referenciadas a sus autores.
 */

import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {GameState} from "../GameState.js"

class Boton extends THREE.Object3D
{
	constructor(dimensiones = {
		radioBoton: 1.25,
		alturaSoporte: 0.5,
		radioSoporte: 2.5,
	})
	{
		super()

		this.radioBoton = dimensiones.radioBoton
		this.alturaSoporte = dimensiones.alturaSoporte
		this.radioSoporte = dimensiones.radioSoporte

		this._animating = false
		this.callbackAnimacion = null

		// Materiales
		this.materialPulsador = new THREE.MeshLambertMaterial({
			map: GameState.txLoader.load("../../resources/textures/models/textura_mango.png")
		})
		this.materialSoporte = new THREE.MeshLambertMaterial({
			map: GameState.txLoader.load("../../resources/textures/models/textura_soporte.png")
		})

		//
		// Modelado
		//
		let geoPulsador = new THREE.SphereGeometry(this.radioBoton, 10, 10)
		this.meshPulsador = new THREE.Mesh(geoPulsador, this.materialPulsador)

		let geoSoporte = new THREE.CylinderGeometry(this.radioSoporte, this.radioSoporte, this.alturaSoporte, 20)
		geoSoporte.rotateX(Math.PI/2)
		geoSoporte.translate(0, 0, this.alturaSoporte/2)

		this.meshPulsador.translateZ(this.alturaSoporte)

		this.add(new THREE.Mesh(geoSoporte, this.materialSoporte))
		this.add(this.meshPulsador)

		//
		// Sonidos
		//
		this._crearSonidos()

		//
		// Animación
		//
		this._crearAnimacion()

		//
		// Interacción
		//

		this.meshPulsador.userData.interaction = {
			interact: this.pulsar.bind(this)
		}
	}

	_crearSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadPositionalSound("../../resources/sounds/pressButton.mp3", (audio) => {
			this._sonidos.pulsar = audio

			audio.setVolume(0.5)

			audio.setDistanceModel("linear")
			audio.setRefDistance(15)
			audio.setMaxDistance(60)
			audio.setRolloffFactor(0.25)

			audio.translateZ(this.alturaSoporte)

			this.add(audio)
		})
	}

	_crearAnimacion()
	{
		this._animaciones = {}

		let frameInicial = {z: 1}
		let frameFinal = {z: 0.2}

		let animacionPulsar = new TWEEN.Tween(frameInicial).to(frameFinal, 400)
			.easing(TWEEN.Easing.Sinusoidal.In)
			.onStart(() => {
				// Sonido pulsar
				this._sonidos.pulsar.play()
			})
			.onUpdate(() => {
				this.meshPulsador.scale.z = frameInicial.z
			})
			.onComplete(() => {
				frameInicial.z = 1

				// Invocar la callback
				if (this.callbackAnimacion)
					this.callbackAnimacion()
			})

		let animacionDepulsar = new TWEEN.Tween(frameFinal).to(frameInicial, 325)
			.easing(TWEEN.Easing.Sinusoidal.In)
			.onStart(() => {
				// Sonido soltar
			})
			.onUpdate(() => {
				this.meshPulsador.scale.z = frameFinal.z
			})
			.onComplete(() => {
				frameFinal.z = 0.25
				this._animating = false
			})

		animacionPulsar.chain(animacionDepulsar)

		this._animaciones.pulsar = animacionPulsar
	}

	pulsar()
	{
		if (this._animating)
			return

		this._animating = true
		this._animaciones.pulsar.start()
	}

	setCallbackActivar(callback)
	{
		this.callbackAnimacion = callback
	}
}

export {Boton}
