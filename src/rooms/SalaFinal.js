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
import {GameState} from "../GameState.js"

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
		txPared.repeat.set(1, 4)

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
	}
}

export {SalaFinal}
