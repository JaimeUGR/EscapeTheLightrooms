/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from '../../libs/three.module.js'
import {CSG} from '../../libs/CSG-v2.js'

class Bombilla extends THREE.Object3D {
	constructor(dimensiones = {
		radioBombillaBajo: 0.2,
		altoBombillaBajo: 0.2,
		radioBombillaAlto: 0.3
	})
	{
		super()

		this.radioBombillaAlto = dimensiones.radioBombillaAlto
		this.radioBombillaBajo = dimensiones.radioBombillaBajo
		this.altoBombillaBajo = dimensiones.altoBombillaBajo

		this.materialBombilla = new THREE.MeshBasicMaterial({color: 0xe8ed53})

		let shapeBombilla =  new THREE.Shape()

		shapeBombilla.moveTo(-this.radioBombillaBajo, 0)
		shapeBombilla.lineTo(-this.radioBombillaBajo, this.altoBombillaBajo)
		shapeBombilla.quadraticCurveTo(-this.radioBombillaAlto, this.altoBombillaBajo, -this.radioBombillaAlto, this.altoBombillaBajo + this.radioBombillaAlto)
		shapeBombilla.quadraticCurveTo(-this.radioBombillaAlto, this.altoBombillaBajo + 2*this.radioBombillaAlto, 0, this.altoBombillaBajo + 2*this.radioBombillaAlto)

		let points = shapeBombilla.extractPoints(6).shape
		let bombilla = new THREE.Mesh(new THREE.LatheGeometry (points, 12, 0, Math.PI* 2), this.materialBombilla)

		this.add(bombilla)

		/*this.material = new THREE.LineBasicMaterial({color: 0xCF0000, linewidth: 2})

		//Creacion de una linea visible
		let lineGeometry = new THREE.BufferGeometry()
		lineGeometry.setFromPoints(points)
		let line = new THREE.Line(lineGeometry,this.material)*/
	}
}

export {Bombilla}
