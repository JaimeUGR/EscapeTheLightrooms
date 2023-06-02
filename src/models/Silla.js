
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

class Silla extends THREE.Object3D
{
	constructor(dimensiones = {
		// Tablero
		tableroX: 12,
		tableroY: 2,
		tableroZ: 10,

		// Patas
		pataX: 3,
		pataY: 10,
		pataZ: 3,

		separacionPatasX: 6, // Separación desde la esquina de la pata (la que se vería) hasta el centro
		separacionPatasZ: 5, // Separación desde la esquina de la pata (la que se vería) hasta el centro

		respaldoX: 12,
		respaldoY: 6,
		respaldoZ: 2,

		radioBarra: 1,
		altoBarra: 10,

		separacionUniones:0.5
	})
	{
		super()

		this.tableroX = dimensiones.tableroX
		this.tableroY = dimensiones.tableroY
		this.tableroZ = dimensiones.tableroZ

		this.pataX = dimensiones.pataX
		this.pataY = dimensiones.pataY
		this.pataZ = dimensiones.pataZ

		this.separacionPatasX = dimensiones.separacionPatasX
		this.separacionPatasZ = dimensiones.separacionPatasZ

		this.respaldoX = dimensiones.respaldoX
		this.respaldoY = dimensiones.respaldoY
		this.respaldoZ = dimensiones.respaldoZ

		this.radioBarra = dimensiones.radioBarra
		this.altoBarra = dimensiones.altoBarra

		this.separacionUniones = dimensiones.separacionUniones

		this.baseCollider = null

		//
		// Material
		//

		const loader = GameState.txLoader

		let texturaMadera = loader.load("../../resources/textures/models/fondo-madera-natural.jpg")
		let texturaMetal = loader.load("../../resources/textures/models/textura_metalica.jpg")

		this.materialMadera = new THREE.MeshLambertMaterial({map: texturaMadera})
		this.materialMetal = new THREE.MeshPhongMaterial({map: texturaMetal})

		//
		// Modelado
		//

		// Crear el tablero
		let geoTablero = new THREE.BoxGeometry(this.tableroX, this.tableroY, this.tableroZ)
		geoTablero.translate(0, this.tableroY/2 + this.pataY, 0)

		this.add(new THREE.Mesh(geoTablero, this.materialMadera))

		let geoPata = new THREE.BoxGeometry(this.pataX, this.pataY, this.pataZ)
		geoPata.translate(-this.separacionPatasX + this.pataX/2, this.pataY/2, this.separacionPatasZ - this.pataZ/2)

		this.add(new THREE.Mesh(geoPata.clone(), this.materialMadera))

		geoPata.translate(2*this.separacionPatasX - this.pataX, 0, 0)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialMadera))

		geoPata.translate(this.pataX - 2*this.separacionPatasX, 0, this.pataZ - 2*this.separacionPatasZ)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialMadera))

		geoPata.translate(2*this.separacionPatasX - this.pataX, 0, 0)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialMadera))

		// Para poder poner objetos encima
		this.tableroO3D = new THREE.Object3D()
		this.tableroO3D.position.set(0, this.tableroY + this.pataY, 0)

		this.add(this.tableroO3D)


		// Barras
		let altoBarraTotal = this.altoBarra + 2*this.radioBarra

		let barraRespaldo1 = new CSG()
		let barraRespaldo2 = new CSG()

		let geoBarraIzq = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.altoBarra, 30, 30)
		geoBarraIzq.translate(this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.altoBarra/2 + this.pataY + this.tableroY/2 ,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		barraRespaldo1.union([(new THREE.Mesh(geoBarraIzq.clone(), this.materialMetal))])

		let geoBarraDcha = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.altoBarra, 30, 30)
		geoBarraDcha.translate(this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.altoBarra/2 + this.pataY + this.tableroY/2 ,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		barraRespaldo2.union([new THREE.Mesh(geoBarraDcha.clone(), this.materialMetal)])

		//Creación esferas para union
		let geoUnionInfIzq = new THREE.SphereGeometry(this.radioBarra, 20, 20)
		geoUnionInfIzq.translate( this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		barraRespaldo1.union([new THREE.Mesh(geoUnionInfIzq.clone(), this.materialMetal)])

		let geoUnionInfDcha = new THREE.SphereGeometry(this.radioBarra, 20, 20)
		geoUnionInfDcha.translate(this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		barraRespaldo2.union([new THREE.Mesh(geoUnionInfDcha.clone(), this.materialMetal)])

		// UnionSupIzq
		geoUnionInfIzq.translate(0,this.altoBarra,0)
		barraRespaldo1.union([new THREE.Mesh(geoUnionInfIzq.clone(), this.materialMetal)])

		//UnionSupDcha
		geoUnionInfDcha.translate(0,this.altoBarra, 0)
		barraRespaldo2.union([new THREE.Mesh(geoUnionInfDcha.clone(), this.materialMetal)])

		//Conector

		let geoConectorInfIzq = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra + this.respaldoZ, 10)
		geoConectorInfIzq.rotateX(-Math.PI/2)
		geoConectorInfIzq.translate(0, 0, this.radioBarra/2 - this.respaldoZ/2)
		geoConectorInfIzq.translate( this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra)

		barraRespaldo1.union([new THREE.Mesh(geoConectorInfIzq.clone(), this.materialMetal)])

		let geoConectorInfDcha = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra + this.respaldoZ, 10)
		geoConectorInfDcha.rotateX(-Math.PI/2)
		geoConectorInfDcha.translate(0, 0, this.radioBarra/2 - this.respaldoZ/2)
		geoConectorInfDcha.translate( this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra)

		barraRespaldo2.union([new THREE.Mesh(geoConectorInfDcha.clone(), this.materialMetal)])

		// UnionSupIzq
		let geoConectorSupIzq = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra, 10)
		geoConectorSupIzq.rotateX(-Math.PI/2)
		geoConectorSupIzq.translate( this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)
		geoConectorSupIzq.translate(0,this.altoBarra,0)
		geoConectorSupIzq.translate(0,0, this.radioBarra/2)

		barraRespaldo1.union([new THREE.Mesh(geoConectorSupIzq, this.materialMetal)])

		//UnionSupDcha
		let geoConectorSupDcha = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra, 10)
		geoConectorSupDcha.rotateX(-Math.PI/2)
		geoConectorSupDcha.translate(this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)
		geoConectorSupDcha.translate(0,this.altoBarra, 0)
		geoConectorSupDcha.translate(0,0, this.radioBarra/2)


		barraRespaldo2.union([new THREE.Mesh(geoConectorSupDcha, this.materialMetal)])

		//Respaldo
		let geoRespaldo = new THREE.BoxGeometry(this.respaldoX, this.respaldoY, this.respaldoZ)
		geoRespaldo.translate(0, this.respaldoY/2 + this.pataY + altoBarraTotal - this.respaldoY/2 , (-this.respaldoZ/2 - (this.tableroZ/2)))

		let respaldoMesh = new THREE.Mesh(geoRespaldo, this.materialMadera)

		this.add(respaldoMesh)
		this.add(barraRespaldo1.toMesh())
		this.add(barraRespaldo2.toMesh())

		//
		// Colisiones
		//

		this._crearColliders()
	}

	// TODO: Revisar
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
		let tmpMin = new THREE.Vector3(-this.tableroX/2, 0, -(this.tableroZ/2 + this.respaldoZ + 2*this.radioBarra))
		let tmpMax = new THREE.Vector3(this.tableroX/2, 0, this.tableroZ/2)

		this.baseCollider = new THREE.Box3(tmpMin, tmpMax)
	}
}

export {Silla}
