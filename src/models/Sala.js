
import * as THREE from '../../libs/three.module.js'
import {CSG} from "../../libs/CSG-v2.js";

const Sala_PuertaAncho = 20
const Sala_PuertaAlto = 30
const Sala_GrosorPared = 3

class Sala extends THREE.Object3D
{
	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		"Down": false,
		"Up": false,
		"Left": false,
		"Right": false
	})
	{
		super()

		this.largoParedX = largoParedX
		this.largoParedZ = largoParedZ
		this.alturaPared = alturaPared

		// Material temporal. Luego será la textura de las paredes.
		let materialSuelo = new THREE.MeshBasicMaterial({color: 0x852a3b})
		let materialPared = new THREE.MeshBasicMaterial({color: 0x154352})
		let materialTecho = new THREE.MeshBasicMaterial({color: 0x35a78b})

		// Construir la puerta
		let geoPuerta = new THREE.BoxGeometry(Sala_PuertaAncho, Sala_PuertaAlto, Sala_GrosorPared)
		geoPuerta.translate(0, Sala_PuertaAlto/2, 0)
		let puerta = new THREE.Mesh(geoPuerta, materialPared)

		// Construir las paredes
		let paredAbajoGeo = new THREE.BoxGeometry(largoParedX, alturaPared, Sala_GrosorPared)
		let paredArribaGeo = new THREE.BoxGeometry(largoParedX, alturaPared, Sala_GrosorPared)
		let paredIzdaGeo = new THREE.BoxGeometry(largoParedZ, alturaPared, Sala_GrosorPared)
		let paredDchaGeo = new THREE.BoxGeometry(largoParedZ, alturaPared, Sala_GrosorPared)

		paredAbajoGeo.translate(0, alturaPared/2, 0)
		paredArribaGeo.translate(0, alturaPared/2, 0)
		paredIzdaGeo.translate(0, alturaPared/2, 0)
		paredDchaGeo.translate(0, alturaPared/2, 0)

		// Se debería añadir un marquito a la puerta, por la zona interna de la sala
		if (puertas["Down"])
			paredAbajoGeo = this.recortarPuerta(paredAbajoGeo, materialPared, puerta)

		if (puertas["Up"])
			paredArribaGeo = this.recortarPuerta(paredArribaGeo, materialPared, puerta)

		if (puertas["Left"])
			paredIzdaGeo = this.recortarPuerta(paredIzdaGeo, materialPared, puerta)

		if (puertas["Right"])
			paredDchaGeo = this.recortarPuerta(paredDchaGeo, materialPared, puerta)

		// Colocar las paredes en su posición final
		paredIzdaGeo.rotateY(Math.PI/2)
		paredDchaGeo.rotateY(Math.PI/2)

		paredAbajoGeo.translate(largoParedX/2, 0, -Sala_GrosorPared/2)
		paredArribaGeo.translate(largoParedX/2, 0, Sala_GrosorPared/2 + largoParedZ)
		paredIzdaGeo.translate(Sala_GrosorPared/2 + largoParedX, 0, largoParedZ/2)
		paredDchaGeo.translate(-Sala_GrosorPared/2, 0, largoParedZ/2)

		// Añadir las paredes
		this.add(new THREE.Mesh(paredAbajoGeo, materialPared))
		this.add(new THREE.Mesh(paredArribaGeo, materialPared))
		this.add(new THREE.Mesh(paredIzdaGeo, materialPared))
		this.add(new THREE.Mesh(paredDchaGeo, materialPared))

		// Añadir el suelo
		let sueloGeo = new THREE.BoxGeometry(largoParedX, 1, largoParedZ)
		sueloGeo.translate(largoParedX/2, -0.5, largoParedZ/2)

		this.add(new THREE.Mesh(sueloGeo, materialSuelo))

		// Añadir el techo
		let techoGeo = sueloGeo.clone()
		techoGeo.translate(0, alturaPared + 1, 0)

		this.add(new THREE.Mesh(techoGeo, materialTecho))
	}

	recortarPuerta(paredGeo, material, puerta)
	{
		return new CSG().union([new THREE.Mesh(paredGeo, material)]).subtract([puerta]).toGeometry()
	}
}

export {Sala}
