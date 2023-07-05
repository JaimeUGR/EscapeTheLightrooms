/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

class Sofa extends THREE.Object3D
{
	constructor(dimensiones = {

		curvaX: 0.9,
		curvaY: 0.9,

		lateralX: 5,
		lateralY: 13,

		baseX: 30,
		baseY: 1.5,
		baseZ: 1,

		cojinY: 4,
		cojinZ: 15,

		respaldoY: 12,
		respaldoZ: 3,

		parteTraseraY : 20,
		parteTraseraZ : 2,

		numCojines: 4,

		separacionInteriorY: 0.3,

	}, curva = {
		infDcha: true,
		supDcha: true,

		supIzq: true,
		infIzq: true
	})
	{
		super()

		this.infDcha = curva.infDcha
		this.supDcha = curva.supDcha
		this.supIzq = curva.supIzq
		this.infIzq = curva.infIzq

		this.curvaX = dimensiones.curvaX
		this.curvaY = dimensiones.curvaY

		this.lateralX = dimensiones.lateralX
		this.lateralY = dimensiones.lateralY

		this.baseX = dimensiones.baseX
		this.baseY = dimensiones.baseY

		this.cojinY = dimensiones.cojinY
		this.cojinZ = dimensiones.cojinZ

		this.respaldoY = dimensiones.respaldoY
		this.respaldoZ = dimensiones.respaldoZ

		this.separacionInteriorY = dimensiones.separacionInteriorY

		this.numCojines = dimensiones.numCojines

		this.parteTraseraY = dimensiones.parteTraseraY
		this.parteTraseraZ = dimensiones.parteTraseraZ

		this.lateralZ = this.cojinZ + this.respaldoZ
		this.baseZ = this.lateralZ
		this.cojinX = this.baseX / this.numCojines
		this.respaldoX = this.cojinX
		this.respaldoY += this.cojinY

		this.parteTraseraX = 2*this.lateralX + this.baseX

		this.baseCollider = null

		let loader = GameState.txLoader
		let texturaSofa = loader.load("./resources/textures/models/textura_sofa.png")
		texturaSofa.wrapS = THREE.RepeatWrapping
		texturaSofa.wrapT = THREE.RepeatWrapping

		texturaSofa.repeat.set(this.baseX/5, this.baseY/5)

		this.materialSofa = new THREE.MeshLambertMaterial({map: texturaSofa})



		// Creacion de A
		let geoLateralIzq = new SoftBoxGeometry({
			curvaX: this.curvaX,
			curvaY: this.curvaY,

			shapeX: this.lateralX,
			shapeY: this.lateralY,
			extrusion: this.lateralZ,


			infDcha: true,
			supDcha: true,

			supIzq: true,
			infIzq: true


		}).toGeometry()

		geoLateralIzq.translate(-this.lateralX/2 - this.baseX/2, this.lateralY/2, 0)
		let lateralMesh = new THREE.Mesh(geoLateralIzq, this.materialSofa)

		let geoLateralDcha = geoLateralIzq.clone()
		geoLateralDcha.translate( 2*(this.lateralX/2 + this.baseX/2), 0, 0)
		this.add(new THREE.Mesh(geoLateralDcha, this.materialSofa))
		this.add(lateralMesh)

		// Creacion de B
		let geoBase = new SoftBoxGeometry({
			curvaX: this.curvaX,
			curvaY: this.curvaY,

			shapeX: this.baseX,
			shapeY: this.baseY,
			extrusion: this.baseZ,


			infDcha: true,
			supDcha: true,

			supIzq: true,
			infIzq: true

		}).toGeometry()

		geoBase.translate(0, this.baseY/2 , 0)

		let baseMesh = new THREE.Mesh(geoBase, this.materialSofa)

		//Creacion de D
		let geoCojin = new SoftBoxGeometry({
			curvaX: this.curvaX,
			curvaY: this.curvaY,

			shapeX: this.cojinX,
			shapeY: this.cojinY,
			extrusion: this.cojinZ,


			infDcha: true,
			supDcha: true,

			supIzq: true,
			infIzq: true


		}).toGeometry()

		geoCojin.translate(-this.cojinX/2 - (this.baseX/2 - this.cojinX), this.cojinY/2 + this.baseY, (this.baseZ - (this.cojinZ))/2)


		for(let i = 0; i < this.numCojines; i++){


			baseMesh.add(new THREE.Mesh(geoCojin, this.materialSofa))

			geoCojin = geoCojin.clone()
			geoCojin.translate(2*this.cojinX/2,0,0)


		}


		//Creacion de E
		let geoRespaldo = new SoftBoxGeometry({
			curvaX: this.curvaX,
			curvaY: this.curvaY,

			shapeX: this.respaldoX,
			shapeY: this.respaldoY,
			extrusion: this.respaldoZ,

			infDcha: true,
			supDcha: true,

			supIzq: true,
			infIzq: true


		}).toGeometry()

		geoRespaldo.translate(-this.respaldoX/2 - (this.baseX/2 - this.respaldoX), this.respaldoY/2 + this.baseY, -this.baseZ/2 + this.respaldoZ/2)

		for(let i = 0; i < this.numCojines; i++){

			baseMesh.add(new THREE.Mesh(geoRespaldo, this.materialSofa))
			geoRespaldo = geoRespaldo.clone()
			geoRespaldo.translate(2*this.respaldoX/2,0,0)


		}


		this.add(baseMesh)
		baseMesh.position.y = (this.lateralY - this.baseY/2) * this.separacionInteriorY

		//Creacion pieza C
		let geoParteTrasera = new SoftBoxGeometry({
			curvaX: this.curvaX,
			curvaY: this.curvaY,

			shapeX: this.parteTraseraX,
			shapeY: this.parteTraseraY,
			extrusion: this.parteTraseraZ,

			infDcha: false,
			supDcha: false,

			supIzq: false,
			infIzq: false

		}).toGeometry()

		geoParteTrasera.translate(0, this.parteTraseraY/2, -this.baseZ/2 - this.parteTraseraZ/2)

		let parteTraseraMesh = new THREE.Mesh(geoParteTrasera, this.materialSofa)
		this.add(parteTraseraMesh)

		//
		// Colisiones
		//

		this._crearColliders()
	}

	updateColliders()
	{
		let colSys = GameState.systems.collision

		// Añado mis colliders
		this.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.uuid,
			SistemaColisiones.Box3ArrayToRectArray([this.baseCollider], this.matrixWorld))
	}

	_crearColliders()
	{
		let tmpMin = new THREE.Vector3(-(this.baseX/2 + this.lateralX), 0, -(this.baseZ/2 + this.parteTraseraZ))
		let tmpMax = new THREE.Vector3(this.baseX/2 + this.lateralX, 0, this.baseZ/2)

		this.baseCollider = new THREE.Box3(tmpMin, tmpMax)
	}
}

// TODO: Hacerlo su propia geometría heredando de PrismGeometry
class SoftBoxGeometry
{
	constructor(dimensiones = {
		curvaY: 0.7,
		curvaX: 0.7,

		shapeX: 1,
		shapeY: 1,

		extrusion: 0.2,


	},curva ={
		infDcha: true,
		supDcha: true,

		supIzq: true,
		infIzq: true
	} )
	{
		this.infDcha = curva.infDcha
		this.supDcha = curva.supDcha
		this.supIzq = curva.supIzq
		this.infIzq = curva.infIzq

		this.curvaY = dimensiones.curvaY
		this.curvaX = dimensiones.curvaX

		this.shapeX = dimensiones.shapeX
		this.shapeY = dimensiones.shapeY

		this.extrusion = dimensiones.extrusion

		let shapeSofa = new THREE.Shape()

		if(this.infDcha) {
			shapeSofa.moveTo(this.shapeX / 2 * this.curvaX, -this.shapeY / 2)
			shapeSofa.quadraticCurveTo(this.shapeX / 2, -this.shapeY / 2, this.shapeX / 2, -this.shapeY / 2 * this.curvaY)
			shapeSofa.lineTo(this.shapeX/2, this.shapeY/2 * this.curvaY)
		}else{
			shapeSofa.moveTo(this.shapeX/2, -this.shapeY/2)

		}

			//shapeSofa.lineTo(this.shapeX/2, -this.shapeY/2)


		shapeSofa.quadraticCurveTo(this.shapeX / 2, this.shapeY / 2, this.shapeX / 2 * this.curvaX, this.shapeY / 2)

			//shapeSofa.lineTo(this.shapeX/2, this.shapeY/2)

		shapeSofa.lineTo(-this.shapeX/2*this.curvaX, this.shapeY/2)


		shapeSofa.quadraticCurveTo(-this.shapeX/2, this.shapeY/2,-this.shapeX/2, this.shapeY/2 * this.curvaY)

			//shapeSofa.lineTo(-this.shapeX/2, this.shapeY/2)

		shapeSofa.lineTo(-this.shapeX/2, -this.shapeY/2 * this.curvaY)


		shapeSofa.quadraticCurveTo(-this.shapeX / 2, -this.shapeY / 2, -this.shapeX / 2 * this.curvaX, -this.shapeY / 2)

			//shapeSofa.lineTo(-this.shapeX/2 , -this.shapeY/2)

		shapeSofa.lineTo(this.shapeX/2*this.curvaX, -this.shapeY/2)


		const options = {bevelEnabled: false, depth: this.extrusion, steps: 2, curveSegments: 2,
			bevelThickness: 0.1, bevelSize: 0.2 , bevelSegements :2}

		this.geoShapeSofa = new THREE.ExtrudeGeometry(shapeSofa,options)
		this.geoShapeSofa.translate(0, 0, -this.extrusion/2)
	}

	toGeometry()
	{
		return this.geoShapeSofa.clone()
	}
}

export {Sofa, SoftBoxGeometry}
