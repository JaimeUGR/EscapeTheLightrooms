/*
 * Copyright (c) 2023. Jaime P. and Francisco E.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

import {GameState} from "../GameState.js"

class Pila extends THREE.Object3D
{
	constructor(radioGrande, alturaGrande, radioChico, alturaChico)
	{
		super()
		this.radioGrande = radioGrande
		this.alturaGrande = alturaGrande

		this.radioChico = radioChico
		this.alturaChico = alturaChico

		let loader = GameState.txLoader

		let texturaBase = loader.load("./resources/textures/models/base_pila.png")
		let texturaLateral = loader.load("./resources/textures/models/lateral_pila.png")

		let baseMaterial = new THREE.MeshLambertMaterial({map: texturaBase})
		let lateralMaterial = new THREE.MeshLambertMaterial({ map: texturaLateral})

		let geoPila = new THREE.CylinderGeometry(this.radioGrande, this.radioGrande, this.alturaGrande, 20)

		//geoPila.groups.push({ start: 0, count: 40, materialIndex: 0 }); // Grupo para el lateral
		//geoPila.groups.push({ start: 20 * 2, count: 60, materialIndex: 1 }); // Grupo para la base

		let pilaMesh = new THREE.Mesh(geoPila, [lateralMaterial, baseMaterial,baseMaterial])

		let geoCirculoSuperior = new THREE.CylinderGeometry(this.radioChico, this.radioChico, this.alturaChico, 20)
		geoCirculoSuperior.translate(0,this.alturaGrande/2 + this.alturaChico/2, 0)

		let circuloSuperiorMesh = new THREE.Mesh( geoCirculoSuperior, baseMaterial)
		this.add(circuloSuperiorMesh)

		this.add(pilaMesh)
	}
}

export {Pila}
