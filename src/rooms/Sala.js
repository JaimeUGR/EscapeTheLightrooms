
import * as THREE from '../../libs/three.module.js'
import {CSG} from "../../libs/CSG-v2.js";
import {Rect} from "../structures/Rect.js";
import {Vector2} from "../../libs/three.module.js";
import {GameState} from "../GameState.js";
import {SistemaColisiones} from "../systems/SistemaColisiones.js";

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
		this.paredAbajo = new THREE.Mesh(paredAbajoGeo, materialPared)
		this.paredArriba = new THREE.Mesh(paredArribaGeo, materialPared)
		this.paredIzda = new THREE.Mesh(paredIzdaGeo, materialPared)
		this.paredDcha = new THREE.Mesh(paredDchaGeo, materialPared)

		// Calcular los colliders como box
		this.baseColliders = []

		let tmpBox = new THREE.Box3()
		let tmpMin = null
		let tmpMax = null
		let tmpOffset = 0

		// TODO: Limpiar esto

		// Pared abajo
		if (!puertas.down)
			this.baseColliders.push(new THREE.Box3().setFromObject(this.paredAbajo))
		else
		{
			// Calcular un collider intermedio
			tmpBox.setFromObject(this.paredAbajo)
			tmpMin = tmpBox.min
			tmpMax = tmpBox.max

			tmpOffset = largoParedX/2 + Sala_PuertaAncho/2

			// Coger el collider izquierdo
			let ladoDcha = new THREE.Box3(tmpMin.clone(), new THREE.Vector3(tmpMax.x - tmpOffset, tmpMax.y, tmpMax.z))

			// Coger el collider derecho
			let ladoIzda = ladoDcha.clone()
			ladoDcha.max.x += tmpOffset
			ladoDcha.min.x += tmpOffset

			this.baseColliders.push(ladoIzda)
			this.baseColliders.push(ladoDcha)
		}

		// Pared abajo
		if (!puertas.up)
			this.baseColliders.push(new THREE.Box3().setFromObject(this.paredArriba))
		else
		{
			// Calcular un collider intermedio
			tmpBox.setFromObject(this.paredArriba)
			tmpMin = tmpBox.min
			tmpMax = tmpBox.max

			tmpOffset = largoParedX/2 + Sala_PuertaAncho/2

			// Coger el collider izquierdo
			let ladoDcha = new THREE.Box3(tmpMin.clone(), new THREE.Vector3(tmpMax.x - tmpOffset, tmpMax.y, tmpMax.z))

			// Coger el collider derecho
			let ladoIzda = ladoDcha.clone()
			ladoDcha.max.x += tmpOffset
			ladoDcha.min.x += tmpOffset

			this.baseColliders.push(ladoIzda)
			this.baseColliders.push(ladoDcha)
		}

		// Pared izda
		if (!puertas.left)
			this.baseColliders.push(new THREE.Box3().setFromObject(this.paredIzda))
		else
		{
			// Calcular un collider intermedio
			tmpBox.setFromObject(this.paredIzda)
			tmpMin = tmpBox.min
			tmpMax = tmpBox.max

			tmpOffset = largoParedZ/2 + Sala_PuertaAncho/2

			// Coger el collider izquierdo
			let ladoAbajo = new THREE.Box3(tmpMin.clone(), new THREE.Vector3(tmpMax.x, tmpMax.y, tmpMax.z - tmpOffset))

			// Coger el collider derecho
			let ladoArriba = ladoAbajo.clone()
			ladoArriba.max.z += tmpOffset
			ladoArriba.min.z += tmpOffset

			this.baseColliders.push(ladoAbajo)
			this.baseColliders.push(ladoArriba)
		}

		// Pared dcha
		if (!puertas.right)
			this.baseColliders.push(new THREE.Box3().setFromObject(this.paredDcha))
		else
		{
			// Calcular un collider intermedio
			tmpBox.setFromObject(this.paredDcha)
			tmpMin = tmpBox.min
			tmpMax = tmpBox.max

			tmpOffset = largoParedZ/2 + Sala_PuertaAncho/2

			// Coger el collider izquierdo
			let ladoAbajo = new THREE.Box3(tmpMin.clone(), new THREE.Vector3(tmpMax.x, tmpMax.y, tmpMax.z - tmpOffset))

			// Coger el collider derecho
			let ladoArriba = ladoAbajo.clone()
			ladoArriba.max.z += tmpOffset
			ladoArriba.min.z += tmpOffset

			this.baseColliders.push(ladoAbajo)
			this.baseColliders.push(ladoArriba)
		}

		this.add(this.paredAbajo)
		this.add(this.paredArriba)
		this.add(this.paredIzda)
		this.add(this.paredDcha)

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

	getRectColliders()
	{
		this.updateMatrixWorld(true)

		/*for (let baseCollider of this.baseColliders)
		{
			let col = baseCollider.clone()
			col.applyMatrix4(this.matrixWorld)
			// Pared Inferior

			let colliderTest = baseCollider
			let colTestMin = colliderTest.min
			let colTestMax = colliderTest.max

			// Recalcular el collider con los tamaños
			let miRect = new Rect(new Vector2(colTestMin.x, colTestMin.z), new Vector2(colTestMax.x - colTestMin.x, colTestMax.z - colTestMin.z))

			GameState.systems.collision.aniadeBB(miRect)
		}*/

		// Devolver el array con los colliders
		return SistemaColisiones.Box3ArrayToRectArray(this.baseColliders, this.matrixWorld)
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

		// Se utilizará para eliminar el collider cuando se abra
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
		console.log("ME DESBLOQUEAN")
		this.meshCierre.translateX(this.espacioInterno)

		// TODO: Cuando se abra, eliminar el collider
	}
}

export {Sala, Pasillo}
