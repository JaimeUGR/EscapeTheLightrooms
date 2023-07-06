/*
 * Copyright (c) 2023. Jaime P. and Francisco E.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'

import {GameState} from "../GameState.js"

class CristalContenedor extends THREE.Object3D
{
	constructor(dimensiones =  {
		numVertices: 6,
		sX: 1,
		sY: 1,
		sZ: 1
	})
	{
		super()

		this.sX = dimensiones.sX
		this.sY = dimensiones.sY
		this.sZ = dimensiones.sZ

		this.estaRoto = false

		//
		// Material
		//

		this.materialCristal = new THREE.MeshPhysicalMaterial({
			color: 0xffffff, // Color cristal
			transparent: true,
			opacity: 0.8, // Opacidad
			roughness: 0, // Rugosidad
			metalness: 0, // Metalicidad
			clearcoat: 0, // Capa de recubrimiento clara
			clearcoatRoughness: 0, // Rugosidad de la capa de recubrimiento clara
		})

		//
		// Shape Cristal
		//

		let shapeCristal = new THREE.Shape()
		const radius = 0.5; // Radio de la figura

		// Calcular los ángulos de los vértices
		const angleIncrement = (Math.PI * 2) / dimensiones.numVertices
		let currentAngle = Math.PI/2

		// Crear los vértices de la figura
		for (let i = 0; i < dimensiones.numVertices; i++)
		{
			const x = Math.cos(currentAngle) * radius
			const y = Math.sin(currentAngle) * radius

			if (i === 0)
				shapeCristal.moveTo(x, y)
			else
				shapeCristal.lineTo(x, y)

			currentAngle += angleIncrement
		}

		// Hacer la revolución
		let geoCristal = new THREE.LatheGeometry(shapeCristal.getPoints(dimensiones.numVertices), dimensiones.numVertices)
		this.add(new THREE.Mesh(geoCristal, this.materialCristal))

		this.scale.set(dimensiones.sX, dimensiones.sY, dimensiones.sZ)

		//
		// Sonidos
		//

		this._crearSonidos()

		//
		// Animaciones
		//

		this._crearAnimaciones()
	}

	romper()
	{
		// TODO: Añadir a la animación una textura de rotura progresiva (ir cambiándola)
		this.animaciones.disolver.start()
	}

	_crearSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadPositionalSound("./resources/sounds/vapor.mp3", (audio) => {
			this._sonidos.disolver = audio

			audio.setVolume(0.25)
			audio.setPlaybackRate(1.65)

			audio.setDistanceModel('linear')
			audio.setRefDistance(10)
			audio.setMaxDistance(90)
			audio.setRolloffFactor(0.9)

			this.add(audio)
		})

		GameState.systems.sound.loadPositionalSound("./resources/sounds/glassBreak.mp3", (audio) => {
			this._sonidos.romper = audio

			audio.setVolume(0.3)

			audio.setDistanceModel('linear')
			audio.setRefDistance(20)
			audio.setMaxDistance(90)
			audio.setRolloffFactor(0)

			this.add(audio)
		})
	}

	_crearAnimaciones()
	{
		this.animaciones = {}

		let frameInicio = {
			sX: this.sX,
			sY: this.sY,
			sZ: this.sZ
		}

		let frameFin = {
			sX: 0.1,
			sY: 0.1,
			sZ: 0.1
		}

		this.animaciones.disolver = new TWEEN.Tween(frameInicio).to(frameFin, 2000)
			.easing(TWEEN.Easing.Sinusoidal.In)
			.onStart(() => {
				this._sonidos.disolver.play()
			})
			.onUpdate(() => {
				this.scale.set(frameInicio.sX, frameInicio.sY, frameInicio.sZ)
			})
			.onComplete(() => {
				this.estaRoto = true
				this.parent.remove(this)
				this._sonidos.romper.play()
			})
	}
}

export {CristalContenedor}
