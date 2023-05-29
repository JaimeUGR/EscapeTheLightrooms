
import * as THREE from '../../libs/three.module.js'
import {CSG} from '../../libs/CSG-v2.js'
import {Bombilla} from "./Bombilla.js"

class Lampara extends THREE.Object3D
{
	constructor(dimensiones = {
		radioBase: 3.5,
		altoBase: 1.25,

		radioPilar: 0.5,
		altoPilar: 20,

		radioEnvoltura: 3.5,
		altoEnvoltura: 8,

		radioHueco: 3.25,

		posicionEnvoltura: 1,
		posicionBarras: 0.5,

		radioSoporteBombilla: 0.1,
		altoSoporteBombilla: 0.5,

		radioBarra: 0.2,
	})
	{
		super()
		this.radioBase = dimensiones.radioBase
		this.altoBase = dimensiones.altoBase

		this.radioPilar = dimensiones.radioPilar
		this.altoPilar = dimensiones.altoPilar

		this.radioSoporteBombilla = dimensiones.radioSoporteBombilla
		this.altoSoporteBombilla = dimensiones.altoSoporteBombilla

		this.radioEnvoltura = dimensiones.radioEnvoltura
		this.altoEnvoltura = dimensiones.altoEnvoltura

		this.radioHueco = dimensiones.radioHueco
		this.altoHueco = this.altoEnvoltura

		this.radioBarra = dimensiones.radioBarra
		this.altoBarra = this.radioHueco

		this.posicionEnvoltura = dimensiones.posicionEnvoltura
		this.posicionBarras = dimensiones.posicionBarras


		this.materialLampara = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})

		// TODO: Cargar textura
		/*let loader = new THREE.TextureLoader()

		let texturaLampara = loader.load("texturaEnvoltura.jpg")
		texturaLampara.wrapS = THREE.RepeatWrapping //Indica cómo se repite en la X
		texturaLampara.wrapT = THREE.RepeatWrapping //Indica cómo se repiten en la Y
		texturaLampara.repeat.set(2, 1)*/

		//let material = new THREE.MeshLambertMaterial({map: texturaLampara})

		// Base de la lampara
		let geoBase = new THREE.CylinderGeometry(this.radioBase, this.radioBase, this.altoBase, 30, 30)
		geoBase.translate(0,this.altoBase/2, 0)

		let baseMesh = new THREE.Mesh(geoBase, this.materialLampara)

		this.add(baseMesh);

		// Pilar de la lampara
		let geoPilar = new THREE.CylinderGeometry(this.radioPilar, this.radioPilar, this.altoPilar, 30, 30)
		geoPilar.translate(0, this.altoBase + this.altoPilar/2 , 0)

		let pilarMesh = new THREE.Mesh(geoPilar, this.materialLampara)
		this.add(pilarMesh);

		// Envoltura
		let geoEnvoltura = new THREE.CylinderGeometry(this.radioEnvoltura, this.radioEnvoltura, this.altoEnvoltura, 30, 30)
		geoEnvoltura.translate(0, this.altoEnvoltura/2 + this.altoBase,0)

		let envolturaMesh = new THREE.Mesh(geoEnvoltura, this.materialLampara)

		let geoHueco = new THREE.CylinderGeometry(this.radioHueco, this.radioHueco, this.altoEnvoltura, 30, 30)
		geoHueco.translate(0, this.altoEnvoltura/2 + this.altoBase, 0)

		let huecoMesh = new THREE.Mesh(geoHueco, this.materialLampara)

		let envoltura = new CSG()

		envoltura.union([envolturaMesh])
		envoltura.subtract([huecoMesh])

		let resultadoEnvoltura = envoltura.toMesh()


		// Barras
		let geoBarra1 = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.altoBarra, 30, 30)
		geoBarra1.rotateX(Math.PI/2)
		geoBarra1.translate(0, this.altoBase + this.altoSoporteBombilla + (this.altoEnvoltura - 2*this.radioBarra) * this.posicionBarras , 0)
		geoBarra1.translate(0, 0, this.altoBarra/2)

		let barraMesh1 = new THREE.Mesh(geoBarra1, this.materialLampara)

		let barraMesh2 = barraMesh1.clone()
		barraMesh2.rotateY(Math.PI/2)

		let barraMesh3 = barraMesh2.clone()
		barraMesh3.rotateY(Math.PI/2)

		let barraMesh4 = barraMesh3.clone()
		barraMesh4.rotateY(Math.PI/2)

		resultadoEnvoltura.add(barraMesh1)
		resultadoEnvoltura.add(barraMesh2)
		resultadoEnvoltura.add(barraMesh3)
		resultadoEnvoltura.add(barraMesh4)

		this.add(resultadoEnvoltura);
		resultadoEnvoltura.position.y = (this.posicionEnvoltura * this.altoPilar) - this.altoEnvoltura/2

		// Union barras
		let geoUnion = new THREE.BoxGeometry(2*this.radioPilar, this.altoSoporteBombilla, 2*this.radioPilar)
		geoUnion.translate(0,this.altoSoporteBombilla/2 + this.altoPilar + this.altoBase,0)

		let unionMesh = new THREE.Mesh(geoUnion, this.materialLampara)

		this.add(unionMesh)

		//Bombilla
		let bombilla = new Bombilla({
			radioBombillaBajo: 0.4,
			altoBombillaBajo: 0.6,
			radioBombillaAlto: 0.6
		})

		this.add(bombilla)
		bombilla.position.y = this.altoPilar + this.altoBase + this.altoSoporteBombilla
	}
}

export {Lampara}
