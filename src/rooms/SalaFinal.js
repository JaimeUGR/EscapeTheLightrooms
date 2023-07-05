/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from "../../libs/three.module.js"

import {Sala} from "./Sala.js"
import {Boton} from "../models/Boton.js"
import {GameState} from "../GameState.js"

import {fadeIn, fadeOut} from "../Fading.js"

class SalaFinal extends Sala
{
	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		down: false,
		up: false,
		left: false,
		right: false
	})
	{
		super(largoParedX, largoParedZ, alturaPared, puertas, {
			suelo: "./resources/textures/rooms/Madera.jpg",
			pared: "./resources/textures/rooms/PapelBlanco.png",
			techo: "./resources/textures/rooms/AluminioTecho.jpg"
		})

		let txPared = GameState.txLoader.load("./resources/textures/rooms/PapelBlanco.png")
		let txTapas = GameState.txLoader.load("./resources/textures/models/space.jpg")

		txPared.wrapT = THREE.ClampToEdgeWrapping
		txPared.repeat.set(1, this.alturaPared/25)

		this.materialParedX.map = txPared
		this.materialParedZ.map = txPared
		this.materialParedX.bumpMap = undefined
		this.materialParedZ.bumpMap = undefined

		this.materialSuelo.map = txTapas
		this.materialTecho.map = txTapas

		this.materialParedX.needsUpdate = true
		this.materialParedZ.needsUpdate = true
		this.materialSuelo.needsUpdate = true
		this.materialSuelo.needsUpdate = true

		// Cargar sonidos
		this._cargarSonidos()

		// Añadir modelos
		this._crearModelos()
	}

	_cargarSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadGlobalSound("./resources/sounds/charge.ogg", (audio) => {
			this._sonidos.cargaTeleport = audio

			audio.setVolume(0.2)
			audio.setPlaybackRate(0.85)
			audio.duration = 4.860
		})

		GameState.systems.sound.loadGlobalSound("./resources/sounds/warp.wav", (audio) => {
			this._sonidos.teleport = audio

			audio.setVolume(0.5)
			audio.setPlaybackRate(0.5)
		})
	}

	_crearModelos()
	{
		// Botón final
		{
			let boton = new Boton()

			boton.meshPulsador.scale.x = 1.5
			boton.meshPulsador.scale.y = 1.5

			boton.translateX(this.largoParedX/2)
			boton.translateY(GameState.player.position.y)

			// Callback
			const colorFading = new THREE.Color(0xffffff)

			boton.setCallbackActivar(() => {
				if (!GameState.flags.salidaAbierta)
				{
					console.error("La salida no está desbloqueada todavía")
					return
				}

				// Preconfiguración
				GameState.gameData.interactionRangeEnabled = true
				GameState.gameData.interactionRange = -1000
				boton.userData = {}

				// Parar el sonido ambiental
				GameState.scene.sonidos.atmAmbiental.enabled = false

				//
				//
				//

				// Play sonido cargar teletransportar
				this._sonidos.cargaTeleport.play()

				setTimeout(() => {
					// Play sonido teletransportar
					this._sonidos.teleport.play()

					fadeIn({
						tiempo: 3000,
						color: colorFading,
						callback: () => {
							GameState.gameData.inputEnabled = false
							console.log("Cargando location final")
							GameState.locations.end.loadLocation()
							console.log("Carga completada")

							fadeOut({
								tiempo: 2500,
								color: colorFading,
								callback: () => GameState.locations.end.onLocationActive()
							})
						}
					})
				}, this._sonidos.cargaTeleport.duration*1000)
			})

			this.add(boton)
			GameState.systems.interaction.allInteractables.push(boton)
		}
	}
}

export {SalaFinal}
