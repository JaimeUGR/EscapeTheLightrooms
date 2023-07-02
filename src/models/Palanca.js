/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from "../../libs/three.module.js";
import * as TWEEN from '../../libs/tween.esm.js'
import {GameState} from "../GameState.js"

const SEGMENTOS_SOPORTE = 10

class Palanca extends THREE.Object3D
{
	constructor(dimensiones = {
		radioSoporte: 3,
		alturaSoporte: 3,

		radioPalo: 1,
		alturaPalo: 10,

		radioMango: 1.5,
		alturaMango: 5,

		rotacionDesactivada: -Math.PI/4,
		rotacionActivada: Math.PI/4,
	})
	{
		super()

		this.radioSoporte = dimensiones.radioSoporte
		this.alturaSoporte = dimensiones.alturaSoporte

		this.radioPalo = dimensiones.radioPalo
		this.alturaPalo = dimensiones.alturaPalo

		this.radioMango = dimensiones.radioMango
		this.alturaMango = dimensiones.alturaMango

		this.rotacionDesactivada = dimensiones.rotacionDesactivada
		this.rotacionActivada = dimensiones.rotacionActivada

		this.callbackAnimacion = null

		//
		// Material
		//

		const txLoader = GameState.txLoader
		let texturaSoporte = txLoader.load("../../resources/textures/models/textura_soporte.png")
		let texturaBarra = txLoader.load("../../resources/textures/models/textura_barras.png")
		let texturaMango = txLoader.load("../../resources/textures/models/textura_mango.png")

		this.materialSoporte = new THREE.MeshLambertMaterial({map: texturaSoporte})
		this.materialBarra = new THREE.MeshLambertMaterial({map: texturaBarra})
		this.materialMango = new THREE.MeshLambertMaterial({map: texturaMango})

		//
		// Modelado
		//

		// Crear soporte
		let geoSoporte = new THREE.CylinderGeometry(this.radioSoporte,this.radioSoporte,this.alturaSoporte,SEGMENTOS_SOPORTE, 2)
		let soporte = new THREE.Object3D()
		this.add(soporte.add(new THREE.Mesh(geoSoporte, this.materialSoporte)).rotateZ(Math.PI/2))

		// Crear palo
		let geoPalo = new THREE.CylinderGeometry(this.radioPalo, this.radioPalo, this.alturaPalo + this.radioSoporte/2, SEGMENTOS_SOPORTE,2)
		geoPalo.translate(0,this.radioSoporte/4 + this.alturaPalo/2,0)

		let palo =  new THREE.Object3D()

		this.add(palo.add(new THREE.Mesh(geoPalo, this.materialBarra)))

		// Crear mango
		let geoMango = new THREE.CylinderGeometry(this.radioMango, this.radioMango, this.alturaMango, SEGMENTOS_SOPORTE, 2)
		geoMango.translate(0,this.alturaMango/2 + this.radioSoporte/2 + this.alturaPalo,0)
		let mango = new THREE.Object3D();

		palo.add(mango.add(new THREE.Mesh(geoMango, this.materialMango)))

		this.add(palo)

		this.palo = palo
		this.palo.rotation.x = this.rotacionDesactivada

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

		this.palo.traverse((anyNode) => {
			anyNode.userData.interaction = {
				interact: this.activar.bind(this)
			}
		})
	}

	_crearSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadPositionalSound("../../resources/sounds/leverPull.mp3", (audio) => {
			this._sonidos.tirar = audio

			audio.setVolume(0.15)
			audio.setPlaybackRate(0.8)

			audio.setDistanceModel('linear')
			audio.setRefDistance(20)
			audio.setMaxDistance(55)
			audio.setRolloffFactor(0.9)

			this.add(audio)
		})
	}

	_crearAnimacion()
	{
		this._animating = false

		this.animaciones = {}

		this.animaciones.tirarPalanca = {
			animacion: null
		}

		let frameInicio = { rX: this.rotacionDesactivada }
		let frameFin = { rX: this.rotacionActivada}

		let animacionSoltar = new TWEEN.Tween(frameFin).to(frameInicio, 750)
			.easing(TWEEN.Easing.Quadratic.In)
			.onUpdate(() => {
				this.palo.rotation.x = frameFin.rX
			})
			.onComplete(() => {
				frameFin.rX = this.rotacionActivada
				this._animating = false
			})

		let handlerContinuar = () => {
			animacionSoltar.start()
		}

		this.animaciones.tirarPalanca.animacion = new TWEEN.Tween(frameInicio).to(frameFin, 800)
			.easing(TWEEN.Easing.Sinusoidal.Out)
			.onStart(() => {
				this._sonidos.tirar.play()
			})
			.onUpdate(() => {
				this.palo.rotation.x = frameInicio.rX
			})
			.onComplete(() => {
				frameInicio.rX = this.rotacionDesactivada

				if (this.callbackAnimacion != null)
					this.callbackAnimacion()

				setTimeout(handlerContinuar, 200)
			})
	}

	activar()
	{
		if (this._animating)
			return

		this._animating = true
		this.animaciones.tirarPalanca.animacion.start()
	}

	setCallbackActivar(callback)
	{
		this.callbackAnimacion = callback
	}
}

export {Palanca}