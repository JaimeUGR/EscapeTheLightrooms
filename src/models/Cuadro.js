
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"
import {Poster} from "./Poster.js"

import {GameState} from "../GameState.js"

class Cuadro extends THREE.Object3D
{
	constructor(dimensiones = {
		baseX: 5,
		baseY: 6,
		baseZ: 0.3,

		borde: 0.5,

		huecoX: 1,
		huecoY: 1,
		huecoZ: 0.1


	}, pathCuadro, pathPoster)
	{
		super()

		this.baseX = dimensiones.baseX
		this.baseY = dimensiones.baseY
		this.baseZ = dimensiones.baseZ

		this.borde = dimensiones.borde

		this.huecoX = this.baseX - 2*this.borde
		this.huecoY = this.baseY - 2*this.borde
		this.huecoZ = this.baseZ - dimensiones.huecoZ

		this.pathCuadro = pathCuadro
		this.pathPoster = pathPoster

		let loader = GameState.txLoader
		let texturaCuadro = loader.load(this.pathCuadro)

		this.materialCuadro = new THREE.MeshLambertMaterial({map: texturaCuadro})
		//this.material = new THREE.MeshBasicMaterial({color: 0x123456})

		// Creación de la base del cuadro
		let geoBase = new THREE.BoxGeometry(this.baseX, this.baseY, this.baseZ)
		geoBase.translate(0, 0, this.baseZ/2)

		let baseMesh = new THREE.Mesh(geoBase, this.materialCuadro)

		//this.add(baseMesh)

		let geoRecorte = new THREE.BoxGeometry(this.huecoX, this.huecoY, this.huecoZ)
		geoRecorte.translate(0, 0, this.huecoZ/2 + (this.baseZ - this.huecoZ) )

		let recorteMesh = new THREE.Mesh(geoRecorte, this.materialCuadro)
		//this.add(recorteMesh)

		let cuadroCSG = new CSG()

		cuadroCSG.union([baseMesh])
		cuadroCSG.subtract([recorteMesh])

		let cuadroMesh = cuadroCSG.toMesh()

		//this.add(cuadroMesh)

		let cuadro = new THREE.Object3D()
		cuadro.add(cuadroMesh)

		let poster = new Poster(this.huecoX, this.huecoY, this.pathPoster)
		poster.position.z = this.baseZ - this.huecoZ + 0.001

		cuadro.add(poster)

		// TODO: Rotar cuadro
		//cuadro.rotateY(Math.PI/2)
		//cuadro.position.x = -this.baseX/2

		this.add(cuadro)
	}
}

export {Cuadro}
