import * as THREE from "../../libs/three.module.js";
import {CSG} from "../../libs/CSG-v2.js";


class Taquilla extends THREE.Object3D
{
	constructor(dimensiones = {
		anchoTaq: 1,
		altoTaq: 1,
		fondoTaq: 1,
		borde: 1,
		fondoPuerta: 1,
		anchoRejilla: 1,
		altoRejilla: 1,
		separacionRejillas: 1,
		separacionInicial: 1

	})
	{
		super()

		this.anchoTaq = dimensiones.anchoTaq
		this.altoTaq = dimensiones.altoTaq
		this.fondoTaq = dimensiones.fondoTaq
		this.fondoPuerta = dimensiones.fondoPuerta

		this.borde = dimensiones.borde
		this.anchoRejilla = dimensiones.anchoRejilla
		this.altoRejilla = dimensiones.altoRejilla
		this.separacionRejillas = dimensiones.separacionRejillas
		this.separacionInicial = dimensiones.separacionInicial



		// Material temporal. Luego será la textura de las paredes.
		this.taquillaMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})
		this.huecoMaterial2 = new THREE.MeshBasicMaterial( { color: 0x122345 } )
		this.huecoMaterial3 =  new THREE.MeshNormalMaterial({color: 0Xf1f1f1})

		let taquillaGeometry = new THREE.BoxGeometry(this.anchoTaq,this.altoTaq,this.fondoTaq)
		taquillaGeometry.translate(0,this.altoTaq/2,0)

		let taquilla = new THREE.Mesh(taquillaGeometry,this.taquillaMaterial)

		//this.add(taquilla)

		 this.anchoHueco= this.anchoTaq -2*this.borde
		 this.altoHueco =  this.altoTaq -2*this.borde
		 this.fondoHueco = this.fondoTaq -this.borde

		let huecoGeometry = new THREE.BoxGeometry(this.anchoHueco,this.altoHueco,this.fondoHueco)
		huecoGeometry.translate(0,this.altoHueco/2+this.borde,this.borde/2)

		let hueco = new THREE.Mesh(huecoGeometry,this.huecoMaterial3)

		//this.add(hueco)

		//this.add(hueco)

		let taquillaHueco = this.recortarCaja(taquilla,hueco)

		this.add(taquillaHueco)

		let estante1 = this.createEstante()

		this.add(estante1)

		estante1.position.y= 2* this.borde/2 + 2*this.borde

		let estante2 = this.createEstante()
		this.add(estante2)

		estante2.position.y=  4*(2* this.borde/2 + 2*this.borde)

		let estante3 = this.createEstante()
		estante3.position.y= 2.5*(2*this.borde/2 + 2*this.borde)

		this.add(estante3)


		let puertaGeometry = new THREE.BoxGeometry(this.anchoHueco,this.altoHueco,this.fondoPuerta)
		//puertaGeometry.translate(0,this.altoHueco/2+this.borde,/*this.fondoTaq/2-this.fondoPuerta*/this.fondoHueco-this.fondoPuerta/2-1.5*this.borde)
		puertaGeometry.translate(0,this.altoHueco/2+this.borde,0);
		puertaGeometry.translate(0,0,this.fondoPuerta/2 + this.fondoHueco/2+this.borde/4)


		this.puertaMesh = new THREE.Mesh(puertaGeometry,this.huecoMaterial3)


		//this.add(puerta)

		//puerta.position.x= -this.anchoHueco/2
		//puerta.position.z= this.fondoPuerta/2 + this.fondoHueco/2+this.borde/4


		//puerta.rotateY(-Math.PI/2)


		let geoRejilla = new THREE.BoxGeometry(this.anchoRejilla, this.altoRejilla, this.fondoPuerta)
		geoRejilla.translate(0,-this.altoRejilla/2 + this.altoTaq,this.fondoPuerta/2 + this.fondoHueco/2+this.borde/4 )
		geoRejilla.translate(0,-this.borde - this.separacionInicial,0)


		let csg = new CSG()

		csg.union([this.puertaMesh])
		csg.subtract([new THREE.Mesh(geoRejilla,null)])

		//this.add(new THREE.Mesh(geoRejilla.clone(),this.huecoMaterial3))
		//
		geoRejilla.translate(0,-this.separacionRejillas-this.altoRejilla,0)

		csg.subtract([new THREE.Mesh(geoRejilla,null)])

		//this.add(new THREE.Mesh(geoRejilla.clone(),this.huecoMaterial3))
		//
		geoRejilla.translate(0,-this.separacionRejillas-this.altoRejilla,0)

		csg.subtract([new THREE.Mesh(geoRejilla,null)])


		this.puertaMesh= csg.toMesh()
		this.puertaMesh.position.set(this.anchoHueco/2,0,-(this.fondoPuerta/2 + this.fondoHueco/2+this.borde/4))

		let puerta = new THREE.Object3D()
		puerta.position.set(-this.anchoHueco/2,0,(this.fondoPuerta/2 + this.fondoHueco/2+this.borde/4))
		puerta.rotateY(-Math.PI/2)
		puerta.add(this.puertaMesh)

		this.add(puerta)
		//this.add(new THREE.Mesh(geoRejilla,this.huecoMaterial3))





	}



	createEstante()
	{
		let estante = new THREE.Object3D()

		let boxGeometry = new THREE.BoxGeometry(this.anchoHueco,this.borde,this.fondoHueco-this.borde)
		boxGeometry.translate(0,0,this.borde/2)

		let box = new THREE.Mesh(boxGeometry,this.taquillaMaterial)

		estante.add(box)



		return estante
	}

	createRejilla(){
		let rejilla = new THREE.Object3D()

		let rejillaGeometry = new THREE.BoxGeometry(this.anchoRejilla,this.altoRejilla,this.fondoPuerta)
		rejillaGeometry.translate(0,this.altoRejilla/2 ,this.fondoPuerta/2)

		let rejillaMesh = new THREE.Mesh(rejillaGeometry,this.huecoMaterial3)
		rejilla.add(rejillaMesh)

		return rejilla
	}


	recortarCaja(caja, hueco)
	{
		let cajaHueco = new CSG();

		cajaHueco.union([caja])

		cajaHueco.subtract([hueco])

		return cajaHueco.toMesh()
	}



}

export {Taquilla}