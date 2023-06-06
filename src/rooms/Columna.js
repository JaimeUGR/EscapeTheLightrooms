/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from "../../libs/three.module.js"
import {TrapezoidGeometry} from "../geometry/TrapezoidGeometry.js"

class Columna extends THREE.Object3D
{
	constructor(dimensiones = {
		// Dimensiones de la caja (sin los pilares)
		interiorX: 10,
		interiorY: 20,
		interiorZ: 10,

		// Bases
		// NOTE: La X y Z son sobresalientes de las dimensiones de la caja + 2*pilar
		trapecioSuperior: {
			XSup: 4,
			ZSup: 4,
			XInf: 2,
			ZInf: 2,
			Y: 2,
		},
		trapecioInferior: {
			XSup: 2,
			ZSup: 2,
			XInf: 4,
			ZInf: 4,
			Y: 2,
		},
	})
	{
		super()

		this.interiorX = dimensiones.interiorX
		this.interiorY = dimensiones.interiorY
		this.interiorZ = dimensiones.interiorZ

		this.pilarX = dimensiones.pilarX
		this.pilarZ = dimensiones.pilarZ

		this.trapSup = dimensiones.trapecioSuperior
		this.trapInf = dimensiones.trapecioInferior

		this.material = new THREE.MeshNormalMaterial({opacity: 0.5, trasparent: true})

		//
		// Bases
		//

		let extraBaseTrapeciosX = this.interiorX + this.pilarX
		let extraBaseTrapeciosZ = this.interiorZ + this.pilarZ

		let geoTrapecioSuperior = new TrapezoidGeometry(this.trapSup.XInf + extraBaseTrapeciosX,
			this.trapSup.ZInf + extraBaseTrapeciosZ, this.trapSup.XSup + extraBaseTrapeciosX,
			this.trapSup.ZSup + extraBaseTrapeciosZ, this.trapSup.Y)
		geoTrapecioSuperior.translate(0, this.interiorY/2 + this.trapSup.Y/2, 0)

		let geoTrapecioInferior = new TrapezoidGeometry(this.trapInf.XInf + extraBaseTrapeciosX,
			this.trapInf.ZInf + extraBaseTrapeciosZ, this.trapInf.XSup + extraBaseTrapeciosX,
			this.trapInf.ZSup + extraBaseTrapeciosZ, this.trapInf.Y)
		geoTrapecioInferior.translate(0, -(this.interiorY/2 + this.trapInf.Y/2), 0)

		let meshTrapecioSuperior = new THREE.Mesh(geoTrapecioSuperior, this.material)
		let meshTrapecioInferior = new THREE.Mesh(geoTrapecioInferior, this.material)

		this.add(meshTrapecioSuperior)
		this.add(meshTrapecioInferior)

		//
		// Pilares
		//

		let geoPilar = new THREE.BoxGeometry(this.pilarX, this.interiorY, this.pilarZ)

		geoPilar.translate(-this.interiorX/2, 0, this.interiorZ/2)
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		geoPilar.translate(this.interiorX, 0, 0)
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		geoPilar.translate(0, 0, -this.interiorZ)
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		geoPilar.translate(-this.interiorX, 0, 0)
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		//
		// Caja Externa
		//
	}
}

export {Columna}