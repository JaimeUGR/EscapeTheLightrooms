/*
 * Copyright (c) 2023. Jaime Pérez García y Francisco Expósito Carmona.
 *
 * Escape The Lightrooms
 *
 * Todos los derechos reservados sobre la pertenencia del código, modelos y animaciones.
 * Las texturas están debidamente referenciadas a sus autores.
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
			suelo: "../../resources/textures/rooms/Madera.jpg",
			pared: "../../resources/textures/rooms/PapelBlanco.png",
			techo: "../../resources/textures/rooms/AluminioTecho.jpg"
		})

		let txPared = GameState.txLoader.load("../../resources/textures/rooms/PapelBlanco.png")
		let txTapas = GameState.txLoader.load("../../resources/textures/models/space.jpg")

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

		// Añadir modelos
		this.crearModelos()
	}

	crearModelos()
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

				GameState.gameData.interactionRangeEnabled = true
				GameState.gameData.interactionRange = -1000

				boton.userData = {}

				// Play sonido cargar teletransportar
				console.log("PLAY CARGAR")

				setTimeout(() => {
					// Play sonido teletransportar
					console.log("PLAY TP")

					fadeIn({
						tiempo: 3000,
						color: colorFading,
						callback: () => {
							console.log("Cargando location final")
							GameState.locations.end.loadLocation()
							console.log("Carga completada")

							fadeOut({
								tiempo: 2000,
								color: colorFading
							})
						}
					})
				}, 2000) // TODO: DURACION DE LA CARGA
			})

			this.add(boton)
			GameState.systems.interaction.allInteractables.push(boton)
		}
	}
}

export {SalaFinal}
