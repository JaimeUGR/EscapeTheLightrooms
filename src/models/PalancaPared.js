
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

import {GameState} from "../GameState.js"

class PalancaPared extends THREE.Object3D
{
	constructor(dimensiones = {
		soporteX: 50,
		soporteY: 60,
		soporteZ: 20,

		bordeSoporte: 5,
		separacionRailes: 5,

		railX: 5,
		railY: 1,
		railZ: 1,

		barraX: 1,
		barraY: 5,
		barraZ: 40,

		radioMango: 5,
		alturaMango: 10,

		posicionPalanca: 1

	}){

		super()
		this.soporteX = dimensiones.soporteX
		this.soporteY = dimensiones.soporteY
		this.soporteZ = dimensiones.soporteZ

		this.bordeSoporte = dimensiones.bordeSoporte


		this.railX = this.soporteX - 2*this.bordeSoporte - (this.soporteX/2 - this.bordeSoporte) - this.soporteX/4
		this.railY = this.soporteY - 2*this.bordeSoporte
		this.railZ = this.soporteZ - this.bordeSoporte
		console.log(this.railX)

		this.barraX = this.railX
		console.log(this.barraX)
		this.barraY = dimensiones.barraY
		this.barraZ = dimensiones.barraZ

		this.radioMango = dimensiones.radioMango
		this.alturaMango = this.soporteX - 2*this.bordeSoporte + dimensiones.alturaMango
		this.posicionPalanca = dimensiones.posicionPalanca

		//
		// Material
		//

		const txLoader = GameState.txLoader
		let texturaSoporte = txLoader.load("../../resources/textures/models/textura_soporte.png")
		let texturaBarras = txLoader.load("../../resources/textures/models/textura_barras.png")
		let texturaMango = txLoader.load("../../resources/textures/models/textura_mango.png")

		this.materialSoporte = new THREE.MeshLambertMaterial({map: texturaSoporte})
		this.materialBarras = new THREE.MeshLambertMaterial({map: texturaBarras})
		this.materialMango = new THREE.MeshLambertMaterial({map: texturaMango})

		//
		// Modelado
		//

		let geoSoporte = new THREE.BoxGeometry(this.soporteX, this.soporteY, this.soporteZ)
		geoSoporte.translate(0, this.soporteY/2, this.soporteZ/2)

		let soporteMesh = new THREE.Mesh(geoSoporte, this.materialSoporte)
		//this.add(soporteMesh)

		let geoRail = new THREE.BoxGeometry(this.railX, this.railY, this.railZ)
		geoRail.translate(0,this.railY/2 + this.bordeSoporte, this.railZ/2)
		geoRail.translate( this.soporteX/2 - this.bordeSoporte - this.railX/2 ,0,this.soporteZ - this.railZ )


		let railMesh1 = new THREE.Mesh(geoRail.clone(), this.materialSoporte)
		//this.add(railMesh1)


		geoRail.translate(-2 * (this.soporteX/2 - this.bordeSoporte - this.railX/2), 0, 0)
		let railMesh2 = new THREE.Mesh(geoRail.clone(), this.materialSoporte)
		//this.add(railMesh2)

		let recorte = new CSG();

		recorte.union([soporteMesh])
		recorte.subtract([railMesh1, railMesh2])

		let recorteMesh = recorte.toMesh()
		this.add(recorteMesh)

		//Creacion de la palanca

		let palanca = new THREE.Object3D()

		//Creacion de los enganches

		let geoUnion = new THREE.BoxGeometry(this.barraX, this.barraY, this.barraZ)
		geoUnion.translate(this.soporteX/2 - this.bordeSoporte - this.railX/2, this.barraY/2 + this.bordeSoporte + (this.railY - this.barraY), this.barraZ/2 + this.soporteZ- this.railZ);

		let unionMesh1 = new THREE.Mesh(geoUnion.clone(), this.materialBarras)

		palanca.add(unionMesh1)

		geoUnion.translate(-2*(this.soporteX/2 - this.bordeSoporte - this.railX/2), 0, 0)
		let unionMesh2 = new THREE.Mesh(geoUnion, this.materialBarras)

		palanca.add(unionMesh2)



		let geoMango = new THREE.CylinderGeometry(this.radioMango, this.radioMango, this.alturaMango, 20)
		geoMango.rotateX(Math.PI/2)
		geoMango.rotateY(Math.PI/2)
		geoMango.translate(0, this.barraY/2 + this.bordeSoporte + (this.railY - this.barraY), this.soporteZ + this.barraZ - this.railZ )

		let mangoMesh = new THREE.Mesh(geoMango, this.materialMango)
		palanca.add(mangoMesh)

		//palanca.position.y = - this.railY + this.barraY // Palanca abajo


		this.add(palanca)
	}
}

export {PalancaPared}
