
import * as THREE from '../../libs/three.module.js'
import {CSG} from "../../libs/CSG-v2.js";

const Sala_PuertaAncho = 20
const Sala_PuertaAlto = 30
const Sala_GrosorPared = 3

class Sala extends THREE.Object3D
{
	static AnchoPuerta()
	{
		return Sala_PuertaAncho
	}

	static AltoPuerta()
	{
		return Sala_PuertaAlto
	}

	static GrosorPared()
	{
		return Sala_GrosorPared
	}


	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		down: false,
		up: false,
		left: false,
		right: false
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
		if (puertas.down)
			paredAbajoGeo = this.recortarPuerta(paredAbajoGeo, materialPared, puerta)

		if (puertas.up)
			paredArribaGeo = this.recortarPuerta(paredArribaGeo, materialPared, puerta)

		if (puertas.left)
			paredIzdaGeo = this.recortarPuerta(paredIzdaGeo, materialPared, puerta)

		if (puertas.right)
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

const Pasillo_Cierre_Grosor = 5

class Pasillo extends THREE.Object3D
{
	constructor(largoPasillo, alturaPasillo, espacioInterno, orientacion = 0)
	{
		super()

		this.largoPasillo = largoPasillo
		this.alturaPasillo = alturaPasillo
		this.espacioInterno = espacioInterno
		this.orientacion = orientacion

		let materialSuelo = new THREE.MeshBasicMaterial({color: 0x852a3b})
		let materialCierre = new THREE.MeshBasicMaterial({color: 0x455382})
		let materialPared = new THREE.MeshBasicMaterial({color: 0x257355})
		let materialTecho = new THREE.MeshBasicMaterial({color: 0x35a78b})

		// Puerta
		let geoPuerta = new THREE.BoxGeometry(Sala_PuertaAncho, Sala_PuertaAlto, Sala_GrosorPared)
		geoPuerta.translate(0, Sala_PuertaAlto/2, 0)

		// Pared Superior e Inferior
		let geoParedFrontal = new THREE.BoxGeometry(espacioInterno, alturaPasillo, Sala_GrosorPared)
		geoParedFrontal.translate(0, alturaPasillo/2, 0)
		geoParedFrontal = new CSG()
			.union([new THREE.Mesh(geoParedFrontal, materialPared)])
			.subtract([new THREE.Mesh(geoPuerta, null)])
			.toGeometry()

		geoParedFrontal.translate(0, 0, Sala_GrosorPared/2 + largoPasillo/2)
		this.add(new THREE.Mesh(geoParedFrontal.clone(), materialPared))

		geoParedFrontal.translate(0, 0, -(largoPasillo + Sala_GrosorPared))
		this.add(new THREE.Mesh(geoParedFrontal, materialPared))

		// Pared Derecha
		let geoParedDcha = new THREE.BoxGeometry(Sala_GrosorPared, alturaPasillo, largoPasillo)
		geoParedDcha.translate(-(Sala_GrosorPared/2 + espacioInterno/2), alturaPasillo/2, 0)

		// Pared Izquierda
		let geoParedIzda = new THREE.BoxGeometry(Sala_GrosorPared, alturaPasillo, largoPasillo/2 - Pasillo_Cierre_Grosor/2)
		geoParedIzda.translate(Sala_GrosorPared/2 + espacioInterno/2, alturaPasillo/2, -(Pasillo_Cierre_Grosor/4 + largoPasillo/4))
		this.add(new THREE.Mesh(geoParedIzda.clone(), materialPared))

		geoParedIzda.translate(0, 0, largoPasillo/2 + Pasillo_Cierre_Grosor/2)

		this.add(new THREE.Mesh(geoParedDcha, materialPared))
		this.add(new THREE.Mesh(geoParedIzda.clone(), materialPared))

		// Cierre
		let geoCierre = new THREE.BoxGeometry(Sala_GrosorPared + espacioInterno, alturaPasillo, Pasillo_Cierre_Grosor)
		geoCierre.translate(Sala_GrosorPared/2, alturaPasillo/2, 0)

		this.meshCierre = new THREE.Mesh(geoCierre, materialCierre)

		this.add(this.meshCierre)

		// Añadir el suelo
		let sueloGeo = new THREE.BoxGeometry(espacioInterno, 1, largoPasillo)
		sueloGeo.translate(0, -0.5, 0)

		this.add(new THREE.Mesh(sueloGeo, materialSuelo))

		// Añadir el techo
		let techoGeo = sueloGeo.clone()
		techoGeo.translate(0, alturaPasillo + 1, 0)

		this.add(new THREE.Mesh(techoGeo, materialTecho))

		this.rotateY(orientacion)
	}

	bloquear()
	{

	}

	desbloquear()
	{

	}
}

export {Sala, Pasillo}
