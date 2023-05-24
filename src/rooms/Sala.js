
import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"
import {Rect} from "../structures/Rect.js";
import {Vector2} from "../../libs/three.module.js"
import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

const Sala_PuertaAncho = 24
const Sala_PuertaAlto = 38
const Sala_GrosorPared = 2

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
	}, pathTexturas = {
		suelo: "../../resources/textures/rooms/Madera.jpg",
		pared: "../../resources/textures/rooms/Papel.png",
		techo: "../../resources/textures/rooms/AluminioTecho.jpg"
	})
	{
		super()

		this.largoParedX = largoParedX
		this.largoParedZ = largoParedZ
		this.alturaPared = alturaPared

		this.pathTexturas = pathTexturas

		//
		let texturaSuelo = GameState.txLoader.load(this.pathTexturas.suelo)

		texturaSuelo.wrapS = THREE.RepeatWrapping
		texturaSuelo.wrapT = THREE.RepeatWrapping
		texturaSuelo.repeat.set(this.largoParedX/15, this.largoParedZ/15)

		this.materialSuelo = new THREE.MeshLambertMaterial({
			map: texturaSuelo,
			color: 0xffffff
		})

		let texturaParedX = GameState.txLoader.load(this.pathTexturas.pared)
		let texturaParedZ = GameState.txLoader.load(this.pathTexturas.pared)

		texturaParedX.wrapS = THREE.RepeatWrapping
		texturaParedZ.wrapS = THREE.RepeatWrapping

		texturaParedX.wrapT = THREE.MirroredRepeatWrapping
		texturaParedZ.wrapT = THREE.MirroredRepeatWrapping

		texturaParedX.repeat.set(this.largoParedX / 25, 2)
		texturaParedZ.repeat.set(this.largoParedZ / 25, 2)

		this.materialParedX = new THREE.MeshLambertMaterial({
			map: texturaParedX,
			color: 0xffffff
		})

		this.materialParedZ = new THREE.MeshLambertMaterial({
			map: texturaParedZ,
			color: 0xffffff
		})

		//
		let texturaTecho = GameState.txLoader.load(this.pathTexturas.techo)

		texturaTecho.wrapS = THREE.RepeatWrapping
		texturaTecho.wrapT = THREE.RepeatWrapping
		texturaTecho.repeat.set(this.largoParedX / 32, this.largoParedZ / 32)

		this.materialTecho = new THREE.MeshLambertMaterial({
			map: texturaTecho,
			color: 0xffffff
		})

		// Construir la puerta
		let geoPuerta = new THREE.BoxGeometry(Sala_PuertaAncho, Sala_PuertaAlto, Sala_GrosorPared)
		geoPuerta.translate(0, Sala_PuertaAlto/2, 0)
		let puerta = new THREE.Mesh(geoPuerta, null)

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
			paredAbajoGeo = this.recortarPuerta(paredAbajoGeo, this.materialParedX, puerta)

		if (puertas.up)
			paredArribaGeo = this.recortarPuerta(paredArribaGeo, this.materialParedX, puerta)

		if (puertas.left)
			paredIzdaGeo = this.recortarPuerta(paredIzdaGeo, this.materialParedZ, puerta)

		if (puertas.right)
			paredDchaGeo = this.recortarPuerta(paredDchaGeo, this.materialParedZ, puerta)

		// Colocar las paredes en su posición final
		paredIzdaGeo.rotateY(Math.PI/2)
		paredDchaGeo.rotateY(Math.PI/2)

		paredAbajoGeo.translate(largoParedX/2, 0, -Sala_GrosorPared/2)
		paredArribaGeo.translate(largoParedX/2, 0, Sala_GrosorPared/2 + largoParedZ)
		paredIzdaGeo.translate(Sala_GrosorPared/2 + largoParedX, 0, largoParedZ/2)
		paredDchaGeo.translate(-Sala_GrosorPared/2, 0, largoParedZ/2)

		// Añadir las paredes
		this.paredAbajo = new THREE.Mesh(paredAbajoGeo, this.materialParedX)
		this.paredArriba = new THREE.Mesh(paredArribaGeo, this.materialParedX)
		this.paredIzda = new THREE.Mesh(paredIzdaGeo, this.materialParedZ)
		this.paredDcha = new THREE.Mesh(paredDchaGeo, this.materialParedZ)

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

		this.add(new THREE.Mesh(sueloGeo, this.materialSuelo))

		// Añadir el techo
		let techoGeo = sueloGeo.clone()
		techoGeo.translate(0, alturaPared + 1, 0)

		this.add(new THREE.Mesh(techoGeo, this.materialTecho))
	}

	recortarPuerta(paredGeo, material, puerta)
	{
		return new CSG().union([new THREE.Mesh(paredGeo, material)]).subtract([puerta]).toGeometry()
	}

	// Devuelve los colliders
	getRectColliders()
	{
		this.updateMatrixWorld(true)
		return SistemaColisiones.Box3ArrayToRectArray(this.baseColliders, this.matrixWorld)
	}

	// Actualiza sus colliders en el sistema de colisiones
	updateColliders()
	{
		this.updateMatrixWorld(true)
		GameState.systems.collision.aniadeRectColliders(this.uuid, SistemaColisiones.Box3ArrayToRectArray(this.baseColliders, this.matrixWorld))
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

		this.baseColliders = []
		this.baseCierreCollider = null

		let materialSuelo = new THREE.MeshLambertMaterial({color: 0x852a3b})
		let materialCierre = new THREE.MeshLambertMaterial({color: 0x455382})
		let materialPared = new THREE.MeshLambertMaterial({color: 0x257355})
		let materialTecho = new THREE.MeshLambertMaterial({color: 0x35a78b})

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
		this.paredFrontal = new THREE.Mesh(geoParedFrontal.clone(), materialPared)
		this.add(this.paredFrontal)

		geoParedFrontal.translate(0, 0, -(largoPasillo + Sala_GrosorPared))
		this.paredTrasera = new THREE.Mesh(geoParedFrontal, materialPared)
		this.add(this.paredTrasera)

		// Pared Derecha
		let geoParedDcha = new THREE.BoxGeometry(Sala_GrosorPared, alturaPasillo, largoPasillo)
		geoParedDcha.translate(-(Sala_GrosorPared/2 + espacioInterno/2), alturaPasillo/2, 0)

		// Pared Izquierda
		let geoParedIzda = new THREE.BoxGeometry(Sala_GrosorPared, alturaPasillo, largoPasillo/2 - Pasillo_Cierre_Grosor/2)
		geoParedIzda.translate(Sala_GrosorPared/2 + espacioInterno/2, alturaPasillo/2, -(Pasillo_Cierre_Grosor/4 + largoPasillo/4))
		this.paredIzdaSup = new THREE.Mesh(geoParedIzda.clone(), materialPared)
		this.add(this.paredIzdaSup)

		geoParedIzda.translate(0, 0, largoPasillo/2 + Pasillo_Cierre_Grosor/2)

		this.paredDcha = new THREE.Mesh(geoParedDcha, materialPared)
		this.add(this.paredDcha)

		this.paredIzdaInf = new THREE.Mesh(geoParedIzda, materialPared)
		this.add(this.paredIzdaInf)

		// Cierre
		let geoCierre = new THREE.BoxGeometry(Sala_GrosorPared + espacioInterno, alturaPasillo, Pasillo_Cierre_Grosor)
		geoCierre.translate(Sala_GrosorPared/2, alturaPasillo/2, 0)

		this.cierre = new THREE.Mesh(geoCierre, materialCierre)
		this.add(this.cierre)

		//
		// Colliders
		//
		this._crearColliders()
		//
		//

		// Añadir el suelo
		let sueloGeo = new THREE.BoxGeometry(espacioInterno, 1, largoPasillo)
		sueloGeo.translate(0, -0.5, 0)

		this.add(new THREE.Mesh(sueloGeo, materialSuelo))

		// Añadir el techo
		let techoGeo = sueloGeo.clone()
		techoGeo.translate(0, alturaPasillo + 1, 0)

		this.add(new THREE.Mesh(techoGeo, materialTecho))

		this.rotateY(orientacion)

		this._crearAnimaciones()
	}

	_crearColliders()
	{
		// Calculamos los colliders de las paredes
		// Hay que partirlos en 2
		// Calcular un collider intermedio
		let tmpBox = new THREE.Box3()
		let tmpMin = null, tmpMax = null
		let tmpOffset = 0

		// Pared frontal y trasera
		tmpBox.setFromObject(this.paredFrontal)
		tmpMin = tmpBox.min
		tmpMax = tmpBox.max

		tmpOffset = this.espacioInterno/2 + Sala_PuertaAncho/2

		// Coger el collider izquierdo
		let ladoDerechaInf = new THREE.Box3(tmpMin.clone(), new THREE.Vector3(tmpMax.x - tmpOffset, tmpMax.y, tmpMax.z))
		let ladoDerechaSup = ladoDerechaInf.clone()
		ladoDerechaSup.min.z -= (this.largoPasillo + Sala_GrosorPared)
		ladoDerechaSup.max.z -= (this.largoPasillo + Sala_GrosorPared)

		// Coger el collider derecho
		let ladoIzquierdaInf = ladoDerechaInf.clone()
		ladoIzquierdaInf.max.x += tmpOffset
		ladoIzquierdaInf.min.x += tmpOffset

		let ladoIzquierdaSup = ladoIzquierdaInf.clone()
		ladoIzquierdaSup.min.z -= (this.largoPasillo + Sala_GrosorPared)
		ladoIzquierdaSup.max.z -= (this.largoPasillo + Sala_GrosorPared)

		this.baseColliders.push(ladoDerechaInf)
		this.baseColliders.push(ladoDerechaSup)
		this.baseColliders.push(ladoIzquierdaInf)
		this.baseColliders.push(ladoIzquierdaSup)

		// Se añaden directamente
		this.baseColliders.push(new THREE.Box3().setFromObject(this.paredIzdaSup))
		this.baseColliders.push(new THREE.Box3().setFromObject(this.paredIzdaInf))
		this.baseColliders.push(new THREE.Box3().setFromObject(this.paredDcha))

		// Collider de la puerta
		this.baseCierreCollider = new THREE.Box3().setFromObject(this.cierre)
	}

	_crearAnimaciones()
	{
		let frameCerrada = {pos: 0}
		let frameAbierta = {pos: this.espacioInterno}

		this._animacionApertura = new TWEEN.Tween(frameCerrada)
			.to(frameAbierta, 5000)
			.onUpdate(() => {
				this.cierre.position.set(frameCerrada.pos, 0, 0)

				// Recalcular el collider
				this._updateColliderPuerta()
			})
			.onComplete(() => {
				frameCerrada.pos = 0
			})

		this._animacionCierre = new TWEEN.Tween(frameAbierta)
			.to(frameCerrada, 2000)
			.onUpdate(() => {
				this.cierre.position.set(frameAbierta.pos, 0, 0)

				// Recalcular el collider
				this._updateColliderPuerta()
			})
			.onComplete(() => {
				frameAbierta.pos = this.espacioInterno
			})
	}

	updateColliders()
	{
		let colSys = GameState.systems.collision

		// Añado mis colliders
		this.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.uuid,
			SistemaColisiones.Box3ArrayToRectArray(this.baseColliders, this.matrixWorld))

		// Añado los colliders de la puerta
		this._updateColliderPuerta()
	}

	_updateColliderPuerta()
	{
		let colSys = GameState.systems.collision

		this.cierre.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.cierre.uuid,
			[SistemaColisiones.Box3ToRect(this.baseCierreCollider, this.cierre.matrixWorld)])
	}

	bloquear()
	{
		this._animacionCierre.start()
	}

	desbloquear()
	{
		this._animacionApertura.start()
	}
}

export {Sala, Pasillo}
