
import * as THREE from '../../libs/three.module.js'
import {CSG} from "../../libs/CSG-v2.js";

const Sala_PuertaAncho = 12
const Sala_PuertaAlto = 20
const Sala_PuertaFondo = 1

class Sala extends THREE.Object3D
{
	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		"Down": null,
		"Up": null,
		"Left": null,
		"Right": null
	})
	{
		super()

		// Material temporal. Luego será la textura de las paredes.
		let material = new THREE.MeshBasicMaterial({color: 0x223322})

		// Construir la puerta
		let geoPuerta = new THREE.BoxGeometry(Sala_PuertaAncho, Sala_PuertaAlto, Sala_PuertaFondo)
		geoPuerta.translate(0, Sala_PuertaAncho/2, 0)
		let puerta = new THREE.Mesh(geoPuerta, material)

		// Construir las paredes
		let paredAbajoGeo = new THREE.BoxGeometry(largoParedX, alturaPared, 1)
		let paredArribaGeo = new THREE.BoxGeometry(largoParedX, alturaPared, 1)
		let paredIzdaGeo = new THREE.BoxGeometry(largoParedZ, alturaPared, 1)
		let paredDchaGeo = new THREE.BoxGeometry(largoParedZ, alturaPared, 1)

		paredAbajoGeo.translate(0, alturaPared/2, 0)
		paredArribaGeo.translate(0, alturaPared/2, 0)
		paredIzdaGeo.translate(0, alturaPared/2, 0)
		paredDchaGeo.translate(0, alturaPared/2, 0)

		// Se debería añadir un marquito a la puerta, por la zona interna de la sala
		if (puertas["Down"] != null)
			paredAbajoGeo = this.recortarPuerta(paredAbajoGeo, material, puerta)

		if (puertas["Up"] != null)
			paredArribaGeo = this.recortarPuerta(paredArribaGeo, material, puerta)

		if (puertas["Left"] != null)
			paredIzdaGeo = this.recortarPuerta(paredIzdaGeo, material, puerta)

		if (puertas["Right"] != null)
			paredDchaGeo = this.recortarPuerta(paredDchaGeo, material, puerta)

		// Colocar las paredes en su posición final
		paredIzdaGeo.rotateY(Math.PI/2)
		paredDchaGeo.rotateY(Math.PI/2)

		paredAbajoGeo.translate(largoParedX/2, 0, -0.5)
		paredArribaGeo.translate(largoParedX/2, 0, 0.5 + largoParedZ)
		paredIzdaGeo.translate(0.5 + largoParedX, 0, largoParedZ/2)
		paredDchaGeo.translate(-0.5, 0, largoParedZ/2)

		// Añadir las paredes
		this.add(new THREE.Mesh(paredAbajoGeo, material))
		this.add(new THREE.Mesh(paredArribaGeo, material))
		this.add(new THREE.Mesh(paredIzdaGeo, material))
		this.add(new THREE.Mesh(paredDchaGeo, material))
	}

	recortarPuerta(paredGeo, material, puerta)
	{
		return new CSG().union([new THREE.Mesh(paredGeo, material)]).subtract([puerta]).toGeometry()
	}
}

export {Sala}
