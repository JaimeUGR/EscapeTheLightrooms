
import * as THREE from '../../libs/three.module.js'
import {CSG} from "../../libs/CSG-v2.js"

import {Sala} from "./Sala.js"

const Marco_X = 1
const Maro_Z= 2

class Puerta extends THREE.Object3D
{
	constructor()
	{
		super()

		this.puertaMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})
		this.puertaGeo = new THREE.BoxGeometry(Sala.AnchoPuerta(),Sala.AltoPuerta(),Sala.GrosorPared())
		this.puertaGeo.translate(Sala.AnchoPuerta()/2,Sala.AltoPuerta()/2,0)

		this.puertaMesh = new THREE.Mesh(this.puertaGeo,this.puertaMaterial)
		this.puertaMesh.position.x= -Sala.AnchoPuerta()/2

		let pomo = this.createPomo()

		this.puertaMesh.add(pomo)

		this.add(this.puertaMesh)
		this.puertaMesh.rotateY(Math.PI/2)

	}

	createPomo(){
		let pomo = new THREE.Object3D()
		let points = []

		points.push(new THREE.Vector3(1,0,0))
		points.push(new THREE.Vector3(1,0.5,0))
		points.push(new THREE.Vector3(1.5,0.5,0))
		points.push(new THREE.Vector3(1.5,1,0))
		points.push(new THREE.Vector3(1,1,0))
		points.push(new THREE.Vector3(0,1,0))

		let pomoMesh = new THREE.Mesh( new THREE.LatheGeometry (points,50,0,Math.PI* 2),this.puertaMaterial)
		pomoMesh.rotateX(Math.PI/2)
		pomoMesh.position.set(Sala.AnchoPuerta()/2+Sala.AnchoPuerta()/4,Sala.AltoPuerta()/2,Sala.GrosorPared()/2)
		pomo.add(pomoMesh)

		return pomo
	}

}


class MarcoPasillo extends THREE.Object3D
{
	constructor() {
		super();

		this.marcoMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})
		this.geoMarco = new THREE.BoxGeometry(Sala.AnchoPuerta() + 2*Marco_X, Sala.AltoPuerta() + Marco_X, Sala.GrosorPared())
		this.geoMarco.translate(0,(Sala.AltoPuerta() + Marco_X)/2,0)

		// this.add(new THREE.Mesh(geoMarco,this.marcoMaterial))

		let geoPuerta = new THREE.BoxGeometry(Sala.AnchoPuerta(),Sala.AltoPuerta(),Sala.GrosorPared())
		geoPuerta.translate(0,Sala.AltoPuerta()/2,0)

		//this.add(new THREE.Mesh(geoPuerta,this.marcoMaterial))

		this.add(new CSG().union([new THREE.Mesh(this.geoMarco, this.marcoMaterial)]).subtract([new THREE.Mesh(geoPuerta, null)]).toMesh())
	}
}

class MarcoPuerta extends MarcoPasillo
{
	constructor(dimensiones = {
		soporteX: 1,
		soporteY: 1,
		soporteZ: 1

	})
	{
		super();
		this.soporteMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})

		let anchoSoporte= dimensiones.soporteX;
		let altoSoporte= dimensiones.soporteY;
		let grosorSoporte= dimensiones.soporteZ;

		let geoSoportes1 = new THREE.BoxGeometry(anchoSoporte,altoSoporte,grosorSoporte)
		geoSoportes1.translate(-(anchoSoporte/2)-Sala.AnchoPuerta()/2,altoSoporte/2,grosorSoporte/2+Sala.GrosorPared()/2)

		let geoSoportes2 = new THREE.BoxGeometry(anchoSoporte,altoSoporte,grosorSoporte)
		geoSoportes2.translate((anchoSoporte/2)+Sala.AnchoPuerta()/2,altoSoporte/2,grosorSoporte/2+Sala.GrosorPared()/2)



		this.add(new THREE.Mesh(geoSoportes1,this.soporteMaterial))
		this.add(new  THREE.Mesh(geoSoportes2,this.soporteMaterial))


	}






}


export {MarcoPasillo,Puerta,MarcoPuerta}
