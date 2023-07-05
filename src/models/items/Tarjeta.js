/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from "../../../libs/three.module.js"
import {GameState} from "../../GameState.js"

class Tarjeta extends THREE.Object3D
{
	constructor(dimensiones = {
		anchoTarjeta: 2.5,
		altoTarjeta: 1.5,
		profTarjeta: 0.08,
		altoBarraLectura: 0.4 // Cómo de baja está la barra que se lee (sirve para trasladar luego)
	})
	{
		super()

		this.anchoTarjeta = dimensiones.anchoTarjeta
		this.altoTarjeta = dimensiones.altoTarjeta
		this.profTarjeta = dimensiones.profTarjeta
		this.altoBarraLectura = dimensiones.altoBarraLectura

		//
		// Material
		//

		const txLoader = GameState.txLoader

		let texturaAdverso = txLoader.load("./resources/textures/models/adversoTarjeta.png")
		let texturaReverso = txLoader.load("./resources/textures/models/reversoTarjeta.png")

		this.materialTarjeta = [
			new THREE.MeshBasicMaterial({color: 0x121212}),
			new THREE.MeshBasicMaterial({color: 0x121212}),
			new THREE.MeshBasicMaterial({color: 0x121212}),
			new THREE.MeshBasicMaterial({color: 0x121212}),
			new THREE.MeshBasicMaterial({map: texturaAdverso}),
			new THREE.MeshBasicMaterial({map: texturaReverso})
		]

		//
		// Modelado
		//

		let geoTarjeta = new THREE.BoxGeometry(this.anchoTarjeta, this.altoTarjeta, this.profTarjeta)
		this.meshTarjeta = new THREE.Mesh(geoTarjeta, this.materialTarjeta)

		this.add(this.meshTarjeta)
		this.name = "Tarjeta"
	}
}

export {Tarjeta}
