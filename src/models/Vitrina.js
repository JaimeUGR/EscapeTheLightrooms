
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

import {GameState} from "../GameState.js"

class Vitrina extends THREE.Object3D
{
	constructor(dimensiones = {
		cajaX: 10,
		cajaY: 10,
		cajaZ: 10,

		/*huecoLateralX: 1,
		huecoLateralY: 1,
		huecoLateralZ: 1,

		huecoFrontalX: 1,
		huecoFrontalY: 1,
		huecoFrontalZ: 1,*/

		bordeX: 1,
		bordeY: 1,
		bordeZ: 1
	})
	{
		super()

		this.cajaX = dimensiones.cajaX
		this.cajaY = dimensiones.cajaY
		this.cajaZ = dimensiones.cajaZ

		this.bordeX = dimensiones.bordeX
		this.bordeY = dimensiones.bordeY
		this.bordeZ = dimensiones.bordeZ

		this.huecoLateralX = this.cajaX
		this.huecoLateralY = this.cajaY - 2*this.bordeY
		this.huecoLateralZ = this.cajaZ - 2*this.bordeZ

		this.huecoFrontalX = this.cajaX - 2*this.bordeX
		this.huecoFrontalY = this.cajaY - 2*this.bordeY
		this.huecoFrontalZ = this.cajaZ - this.bordeZ

		let loader = GameState.txLoader

		let texturaParedes = loader.load("../../resources/textures/models/textura_pared.png")
		let texturaPuerta = loader.load("../../resources/textures/models/textura_puerta.png")

		this.materialVitrina = new THREE.MeshLambertMaterial({map: texturaParedes})
		this.materialCristal = new THREE.MeshPhysicalMaterial({
			color: 0xc1dffc, // Color cristal
			transparent: true,
			opacity: 0.3, // Opacidad
			roughness: 0.1, // Rugosidad
			metalness: 0.0, // Metalicidad
			clearcoat: 1.0, // Capa de recubrimiento clara
			clearcoatRoughness: 0.1, // Rugosidad de la capa de recubrimiento clara
		})
		this.materialPuerta = new THREE.MeshLambertMaterial({map: texturaPuerta})

		let geoCaja = new THREE.BoxGeometry(this.cajaX, this.cajaY, this.cajaZ)
		geoCaja.translate(0, 0, this.cajaZ/2)

		let cajaMesh = new THREE.Mesh(geoCaja, this.materialVitrina)

		//this.add(cajaMesh)

		let geoHueco1 = new THREE.BoxGeometry(this.huecoLateralX, this.huecoLateralY, this.huecoLateralZ)
		geoHueco1.translate(0, 0, this.huecoLateralZ/2 + this.bordeZ)

		let hueco1Mesh = new THREE.Mesh(geoHueco1, this.materialVitrina)

		//this.add(hueco1Mesh)

		let geoHueco2 = new THREE.BoxGeometry(this.huecoFrontalX, this.huecoFrontalY, this.huecoFrontalZ)
		geoHueco2.translate(0,0, this.huecoFrontalZ/2 + this.bordeZ)

		let hueco2Mesh = new THREE.Mesh(geoHueco2, this.materialVitrina)
		//this.add(hueco2Mesh)

		let recorteCSG = new CSG()
		recorteCSG.union([cajaMesh])
		recorteCSG.subtract([hueco2Mesh])
		recorteCSG.subtract([hueco1Mesh])

		let vitrina = recorteCSG.toMesh()
		this.add(vitrina)

		let geoPuerta = new THREE.BoxGeometry(this.huecoFrontalX, this.huecoFrontalY, this.bordeZ)
		geoPuerta.translate(0, -this.huecoFrontalY/2, this.bordeZ/2 + this.cajaZ - this.bordeZ)

		let puertaMesh = new THREE.Mesh(geoPuerta, this.materialPuerta)
		puertaMesh.position.y = this.huecoFrontalY/2
		//puertaMesh.scale.y = 0.3

		this.meshPuerta = puertaMesh
		this.add(puertaMesh)

		let geoLateralIzq = new THREE.BoxGeometry(this.bordeX, this.huecoFrontalY, this.huecoLateralZ)
		geoLateralIzq.translate(-this.bordeX/2 - this.cajaX/2 + this.bordeX , 0, this.huecoLateralZ/2 + this.bordeZ)

		let lateralIzqMesh = new THREE.Mesh(geoLateralIzq, this.materialCristal)
		this.add(lateralIzqMesh)

		let geoLateralDcha = new THREE.BoxGeometry(this.bordeX, this.huecoFrontalY, this.huecoLateralZ)
		geoLateralDcha.translate(this.bordeX/2 + this.cajaX/2 - this.bordeX, 0, this.huecoLateralZ/2 + this.bordeZ)

		let lateralDchaMesh = new THREE.Mesh(geoLateralDcha, this.materialCristal)
		this.add(lateralDchaMesh)

		//
		// Animación
		//
	}

	_crearAnimacion()
	{
		this.animaciones = {}

		let frameCerrada = {sY: 1}
		let frameAbierta = {sY: 0.3}

		this.animaciones.abrirPuerta = new TWEEN.Tween(frameCerrada).to(frameAbierta, 2000)
			.onUpdate(() => {
				this.meshPuerta.scale.y = frameCerrada.sY
			})
	}

	abrirPuerta()
	{
		this.animaciones.abrirPuerta.start()
	}
}

export {Vitrina}
