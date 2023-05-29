
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

class Silla extends THREE.Object3D
{
	constructor(dimensiones = {
		// Tablero
		tableroX: 20,
		tableroY: 5,
		tableroZ: 20,

		// Patas
		pataX: 4,
		pataY: 20,
		pataZ: 5,

		separacionPatasX: 10, // Separación desde la esquina de la pata (la que se vería) hasta el centro
		separacionPatasZ: 10, // Separación desde la esquina de la pata (la que se vería) hasta el centro

		respaldoX: 20,
		respaldoY: 10,
		respaldoZ: 1,

		radioBarra: 2,
		altoBarra: 20,

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

		this.radioBarra= dimensiones.radioBarra
		this.altoBarra = dimensiones.altoBarra

		this.separacionUniones = dimensiones.separacionUniones

		this.materialTablero = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})
		this.materialPatas = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		// Crear el tablero
		let geoTablero = new THREE.BoxGeometry(this.tableroX, this.tableroY, this.tableroZ)
		geoTablero.translate(0, this.tableroY/2 + this.pataY, 0)

		this.add(new THREE.Mesh(geoTablero, this.materialTablero))

		let geoPata = new THREE.BoxGeometry(this.pataX, this.pataY, this.pataZ)
		geoPata.translate(-this.separacionPatasX + this.pataX/2, this.pataY/2, this.separacionPatasZ - this.pataZ/2)

		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))

		geoPata.translate(2*this.separacionPatasX - this.pataX, 0, 0)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))

		geoPata.translate(this.pataX - 2*this.separacionPatasX, 0, this.pataZ - 2*this.separacionPatasZ)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))

		geoPata.translate(2*this.separacionPatasX - this.pataX, 0, 0)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))

		// Para poder poner objetos encima
		this.tableroO3D = new THREE.Object3D()
		this.tableroO3D.position.set(0, this.tableroY + this.pataY, 0)

		this.add(this.tableroO3D)

		let altoBarraTotal = this.altoBarra + 2*this.radioBarra

		// Barras
		let geoBarraIzq = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.altoBarra, 30, 30)
		geoBarraIzq.translate(this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.altoBarra/2 + this.pataY + this.tableroY/2 ,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		this.add(new THREE.Mesh(geoBarraIzq.clone(), this.materialTablero))

		let geoBarraDcha = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.altoBarra, 30, 30)
		geoBarraDcha.translate(this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.altoBarra/2 + this.pataY + this.tableroY/2 ,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		this.add(new THREE.Mesh(geoBarraDcha.clone(), this.materialTablero))

		//Creación esferas para union
		let geoUnionInfIzq = new THREE.SphereGeometry(this.radioBarra, 20, 20)
		console.log(this.separacionUniones * (this.respaldoX/2 - this.radioBarra ))
		geoUnionInfIzq.translate( this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		this.add(new THREE.Mesh(geoUnionInfIzq.clone(), this.materialTablero))

		let geoUnionInfDcha = new THREE.SphereGeometry(this.radioBarra, 20, 20)
		geoUnionInfDcha.translate(this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)

		this.add(new THREE.Mesh(geoUnionInfDcha.clone(), this.materialTablero))

		// UnionSupIzq
		geoUnionInfIzq.translate(0,this.altoBarra,0)
		this.add(new THREE.Mesh(geoUnionInfIzq.clone(), this.materialTablero))

		//UnionSupDcha
		geoUnionInfDcha.translate(0,this.altoBarra, 0)
		this.add(new THREE.Mesh(geoUnionInfDcha.clone(), this.materialTablero))

		//Conector

		let geoConectorInfIzq = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra + this.respaldoZ, 10)
		geoConectorInfIzq.rotateX(-Math.PI/2)
		geoConectorInfIzq.translate(0, 0, this.radioBarra/2 - this.respaldoZ/2)
		geoConectorInfIzq.translate( this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra)

		this.add(new THREE.Mesh(geoConectorInfIzq.clone(), this.materialTablero))

		let geoConectorInfDcha = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra + this.respaldoZ, 10)
		geoConectorInfDcha.rotateX(-Math.PI/2)
		geoConectorInfDcha.translate(0, 0, this.radioBarra/2 - this.respaldoZ/2)
		geoConectorInfDcha.translate( this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra)

		this.add(new THREE.Mesh(geoConectorInfDcha.clone(), this.materialTablero))

		// UnionSupIzq
		let geoConectorSupIzq = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra, 10)
		geoConectorSupIzq.rotateX(-Math.PI/2)
		geoConectorSupIzq.translate( this.separacionUniones * (this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)
		geoConectorSupIzq.translate(0,this.altoBarra,0)
		geoConectorSupIzq.translate(0,0, this.radioBarra/2)

		this.add(new THREE.Mesh(geoConectorSupIzq, this.materialTablero))

		//UnionSupDcha
		let geoConectorSupDcha = new THREE.CylinderGeometry(this.radioBarra, this.radioBarra, this.radioBarra, 10)
		geoConectorSupDcha.rotateX(-Math.PI/2)
		geoConectorSupDcha.translate(this.separacionUniones * -(this.respaldoX/2 - this.radioBarra ), this.pataY + this.tableroY/2,-this.tableroZ/2 - this.radioBarra - this.respaldoZ)
		geoConectorSupDcha.translate(0,this.altoBarra, 0)
		geoConectorSupDcha.translate(0,0, this.radioBarra/2)

		this.add(new THREE.Mesh(geoConectorSupDcha, this.materialTablero))


		//Respaldo
		let geoRespaldo = new THREE.BoxGeometry(this.respaldoX, this.respaldoY, this.respaldoZ)
		geoRespaldo.translate(0, this.respaldoY/2 + this.pataY + altoBarraTotal - this.respaldoY/2 , (-this.respaldoZ/2 - (this.tableroZ/2)))

		let respaldoMesh = new THREE.Mesh(geoRespaldo, this.materialTablero)

		this.add(respaldoMesh)
	}
}

export {Silla}
