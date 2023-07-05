/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"
import {Rect} from "../structures/Rect.js"
import {Vector2} from "../../libs/three.module.js"
import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

const Sala_PuertaAncho = 24
const Sala_PuertaAlto = 38
const Sala_GrosorPared = 2
const Marcos_GrosorInterior = 1

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
		suelo: "./resources/textures/rooms/Madera.jpg",
		pared: "./resources/textures/rooms/Papel.png",
		techo: "./resources/textures/rooms/AluminioTecho.jpg"
	})
	{
		super()

		this.largoParedX = largoParedX
		this.largoParedZ = largoParedZ
		this.alturaPared = alturaPared

		this.pathTexturas = pathTexturas

		//
		// Colisionables en la sala e interactuables
		//
		this.collidables = []
		this.interactables = []

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
		let texturaParedXGris = GameState.txLoader.load("./resources/textures/rooms/gris_gotele.jpg")
		let texturaParedZGris = GameState.txLoader.load("./resources/textures/rooms/gris_gotele.jpg")

		texturaParedX.wrapS = THREE.RepeatWrapping
		texturaParedZ.wrapS = THREE.RepeatWrapping
		texturaParedXGris.wrapS = THREE.RepeatWrapping
		texturaParedZGris.wrapS = THREE.RepeatWrapping

		texturaParedX.wrapT = THREE.MirroredRepeatWrapping
		texturaParedZ.wrapT = THREE.MirroredRepeatWrapping
		texturaParedXGris.wrapT = THREE.MirroredRepeatWrapping
		texturaParedZGris.wrapT = THREE.MirroredRepeatWrapping

		texturaParedX.repeat.set(this.largoParedX / 25, 2)
		texturaParedZ.repeat.set(this.largoParedZ / 25, 2)
		texturaParedXGris.repeat.set(this.largoParedX / 25, 2)
		texturaParedZGris.repeat.set(this.largoParedZ / 25, 2)

		this.materialParedX = new THREE.MeshLambertMaterial({
			map: texturaParedX,
			bumpMap: texturaParedXGris,
			bumpScale: 0.2,
			color: 0xffffff
		})

		this.materialParedZ = new THREE.MeshLambertMaterial({
			map: texturaParedZ,
			bumpMap: texturaParedZGris,
			bumpScale: 0.2,
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
		{
			paredAbajoGeo = this.recortarPuerta(paredAbajoGeo, this.materialParedX, puerta)

			// Añadir marco
			let marco = new Marcos()
			marco.translateX(this.largoParedX/2)

			this.add(marco)
		}

		if (puertas.up)
		{
			paredArribaGeo = this.recortarPuerta(paredArribaGeo, this.materialParedX, puerta)

			// Añadir marco
			let marco = new Marcos()
			marco.rotateY(Math.PI)
			marco.translateX(-this.largoParedX/2)
			marco.translateZ(-this.largoParedZ)

			this.add(marco)
		}

		if (puertas.left)
		{
			paredIzdaGeo = this.recortarPuerta(paredIzdaGeo, this.materialParedZ, puerta)

			// Añadir marco
			let marco = new Marcos()
			marco.rotateY(-Math.PI/2)
			marco.translateX(this.largoParedZ/2)
			marco.translateZ(-this.largoParedX)

			this.add(marco)
		}


		if (puertas.right)
		{
			paredDchaGeo = this.recortarPuerta(paredDchaGeo, this.materialParedZ, puerta)

			// Añadir marco
			let marco = new Marcos()
			marco.rotateY(Math.PI/2)
			marco.translateX(-this.largoParedZ/2)

			this.add(marco)
		}

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

		// Además, actualizamos todos los colliders de los modelos
		for (let i = 0; i < this.collidables.length; i++)
			if (this.collidables[i].updateColliders)
				this.collidables[i].updateColliders()
	}
}

const Pasillo_Cierre_Grosor = 5

class Pasillo extends THREE.Object3D
{
	constructor(largoPasillo, alturaPasillo, espacioInterno, orientacion = 0
	, pathTexturas = {
		suelo: "./resources/textures/rooms/Madera.jpg",
		pared: "./resources/textures/rooms/PapelMorado.png",
		techo: "./resources/textures/rooms/AluminioTecho.jpg"
	})
	{
		super()

		this.largoPasillo = largoPasillo
		this.alturaPasillo = alturaPasillo
		this.espacioInterno = espacioInterno
		this.orientacion = orientacion

		this.baseColliders = []
		this.baseCierreCollider = null

		this.pathTexturas = pathTexturas

		// Texturas

		let texturaSuelo = GameState.txLoader.load(this.pathTexturas.suelo)

		texturaSuelo.wrapS = THREE.RepeatWrapping
		texturaSuelo.wrapT = THREE.RepeatWrapping
		texturaSuelo.repeat.set(this.espacioInterno/15, this.largoPasillo/15)

		this.materialSuelo = new THREE.MeshLambertMaterial({color: 0xffffff, map: texturaSuelo})

		//
		let texturaParedX = GameState.txLoader.load(this.pathTexturas.pared)
		let texturaParedZ = GameState.txLoader.load(this.pathTexturas.pared)

		texturaParedX.wrapS = THREE.RepeatWrapping
		texturaParedZ.wrapS = THREE.RepeatWrapping

		texturaParedX.wrapT = THREE.MirroredRepeatWrapping
		texturaParedZ.wrapT = THREE.MirroredRepeatWrapping

		texturaParedX.repeat.set(this.espacioInterno / 25, 2)
		texturaParedZ.repeat.set(this.largoPasillo / 25, 2)

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
		texturaTecho.repeat.set(this.espacioInterno / 32, this.largoPasillo / 32)

		this.materialTecho = new THREE.MeshLambertMaterial({
			map: texturaTecho,
			color: 0xffffff
		})

		//

		let texturaCierre = GameState.txLoader.load(this.pathTexturas.pared)

		texturaCierre.wrapS = THREE.RepeatWrapping
		texturaCierre.wrapT = THREE.MirroredRepeatWrapping
		texturaCierre.repeat.set(1, 2)

		this.materialCierre = new THREE.MeshLambertMaterial({
			map: texturaCierre,
			color: 0xffffff
		})

		//
		// Modelado
		//

		// Puerta
		let geoPuerta = new THREE.BoxGeometry(Sala_PuertaAncho, Sala_PuertaAlto, Sala_GrosorPared)
		geoPuerta.translate(0, Sala_PuertaAlto/2, 0)

		// Pared Superior e Inferior
		let geoParedFrontal = new THREE.BoxGeometry(espacioInterno, alturaPasillo, Sala_GrosorPared)
		geoParedFrontal.translate(0, alturaPasillo/2, 0)
		geoParedFrontal = new CSG()
			.union([new THREE.Mesh(geoParedFrontal, this.materialParedX)])
			.subtract([new THREE.Mesh(geoPuerta, null)])
			.toGeometry()

		geoParedFrontal.translate(0, 0, Sala_GrosorPared/2 + largoPasillo/2)
		this.paredFrontal = new THREE.Mesh(geoParedFrontal.clone(), this.materialParedX)
		this.add(this.paredFrontal)

		geoParedFrontal.translate(0, 0, -(largoPasillo + Sala_GrosorPared))
		this.paredTrasera = new THREE.Mesh(geoParedFrontal, this.materialParedX)
		this.add(this.paredTrasera)

		// Pared Derecha
		let geoParedDcha = new THREE.BoxGeometry(Sala_GrosorPared, alturaPasillo, largoPasillo)
		geoParedDcha.translate(-(Sala_GrosorPared/2 + espacioInterno/2), alturaPasillo/2, 0)

		// Pared Izquierda
		let geoParedIzda = new THREE.BoxGeometry(Sala_GrosorPared, alturaPasillo, largoPasillo/2 - Pasillo_Cierre_Grosor/2)
		geoParedIzda.translate(Sala_GrosorPared/2 + espacioInterno/2, alturaPasillo/2, -(Pasillo_Cierre_Grosor/4 + largoPasillo/4))
		this.paredIzdaSup = new THREE.Mesh(geoParedIzda.clone(), this.materialParedZ)
		this.add(this.paredIzdaSup)

		geoParedIzda.translate(0, 0, largoPasillo/2 + Pasillo_Cierre_Grosor/2)

		this.paredDcha = new THREE.Mesh(geoParedDcha, this.materialParedZ)
		this.add(this.paredDcha)

		this.paredIzdaInf = new THREE.Mesh(geoParedIzda, this.materialParedZ)
		this.add(this.paredIzdaInf)

		// Cierre
		let geoCierre = new THREE.BoxGeometry(Sala_GrosorPared + espacioInterno, alturaPasillo, Pasillo_Cierre_Grosor)
		geoCierre.translate(Sala_GrosorPared/2, alturaPasillo/2, 0)

		this.cierre = new THREE.Mesh(geoCierre, this.materialCierre)
		this.add(this.cierre)

		// Marcos
		let marcoTrasero = new Marcos()
		marcoTrasero.translateZ(-this.largoPasillo/2)

		this.add(marcoTrasero)

		let marcoFrontal = new Marcos()
		marcoFrontal.rotateY(Math.PI)
		marcoFrontal.translateZ(-this.largoPasillo/2)

		this.add(marcoFrontal)

		//
		// Colliders
		//
		this._crearColliders()
		//
		//

		// Añadir el suelo
		let sueloGeo = new THREE.BoxGeometry(espacioInterno, 1, largoPasillo)
		sueloGeo.translate(0, -0.5, 0)

		this.add(new THREE.Mesh(sueloGeo, this.materialSuelo))

		// Añadir el techo
		let techoGeo = sueloGeo.clone()
		techoGeo.translate(0, alturaPasillo + 1, 0)

		this.add(new THREE.Mesh(techoGeo, this.materialTecho))

		this.rotateY(orientacion)

		this._crearSonidos()

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

	_crearSonidos()
	{
		this._sonidos = {}

		// Sonido de abrir la puerta
		GameState.systems.sound.loadPositionalSound("./resources/sounds/garageDoor.m4a", (audio) => {
			this._sonidos.puerta = audio

			// Configuración
			audio.setVolume(0.2)

			audio.setDistanceModel('linear')
			audio.setRefDistance(20)
			audio.setMaxDistance(190)
			audio.setRolloffFactor(0.9)

			// Posicionamiento en el cierre
			audio.translateX(-this.espacioInterno/2)
			audio.translateY(this.alturaPasillo/2)

			// Añadirlo
			this.cierre.add(audio)
		})
	}

	_crearAnimaciones()
	{
		let frameCerrada = {pos: 0}
		let frameAbierta = {pos: this.espacioInterno}

		this._animacionApertura = new TWEEN.Tween(frameCerrada)
			.to(frameAbierta, 12500)
			.onStart(() => {
				if (this._sonidos.puerta)
					this._sonidos.puerta.play()
			})
			.onUpdate(() => {
				this.cierre.position.set(frameCerrada.pos, 0, 0)

				// Recalcular el collider
				this._updateColliderPuerta()
			})
			.onComplete(() => {
				frameCerrada.pos = 0
			})

		this._animacionCierre = new TWEEN.Tween(frameAbierta)
			.to(frameCerrada, 12500)
			.onStart(() => {
				if (this._sonidos.puerta)
					this._sonidos.puerta.play()
			})
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

class Marcos extends THREE.Object3D
{
	static GrosorInterior()
	{
		return Marcos_GrosorInterior
	}

	constructor(dimensiones = {
		xColumna: 2,
		zColumna: 1
	})
	{
		super()

		this.marcoExteriorX = dimensiones.xColumna
		this.marcoExteriorZ = dimensiones.zColumna

		//
		// Materiales
		//

		this.materialMarcosExteriores = new THREE.MeshBasicMaterial({color: 0x181818})
		this.materialMarcosInteriores = new THREE.MeshBasicMaterial({color: 0x181818})
		this.materialMarcoInteriorInferior = new THREE.MeshBasicMaterial({color: 0x181818})

		//
		// Modelado
		//

		//
		// Marcos Exteriores
		//

		// NOTE: El marco es lo único delante de los ejes XY (en Z+)

		const altoPuerta = Sala.AltoPuerta()
		const anchoPuerta = Sala.AnchoPuerta()

		// Laterales
		let geoMarcoLateralExterior = new THREE.BoxGeometry(this.marcoExteriorX, altoPuerta, this.marcoExteriorZ)
		geoMarcoLateralExterior.translate(0, altoPuerta/2, this.marcoExteriorZ/2)

		// Izquierdo
		let geoMarcoLateralExteriorIzd = geoMarcoLateralExterior.clone()
		geoMarcoLateralExteriorIzd.translate(-(this.marcoExteriorX/2 + anchoPuerta/2), 0, 0)

		// Derecho
		let geoMarcoLateralExteriorDcha = geoMarcoLateralExterior
		geoMarcoLateralExteriorDcha.translate(this.marcoExteriorX/2 + anchoPuerta/2, 0, 0)

		// Superior
		let geoMarcoSuperiorExterior = new THREE.BoxGeometry(anchoPuerta + 2*this.marcoExteriorX, this.marcoExteriorX, this.marcoExteriorZ)
		geoMarcoSuperiorExterior.translate(0, this.marcoExteriorX/2 + altoPuerta, this.marcoExteriorZ/2)

		// Unir todos los materiales
		let csg = new CSG().union([new THREE.Mesh(geoMarcoLateralExteriorIzd, this.materialMarcosExteriores),
		new THREE.Mesh(geoMarcoSuperiorExterior, null), new THREE.Mesh(geoMarcoLateralExteriorDcha, null)])

		this.meshMarcosExteriores = csg.toMesh()
		this.add(this.meshMarcosExteriores)

		//
		// Marcos interiores
		//

		const grosorMarcoInterior = Marcos.GrosorInterior()
		const grosorPared = Sala.GrosorPared()

		// Lateral
		let geoMarcoLateralInterior = new THREE.BoxGeometry(grosorMarcoInterior, altoPuerta, grosorPared)
		geoMarcoLateralInterior.translate(0, altoPuerta/2, -grosorPared/2)

		// Izquierda
		let geoMarcoLateralInteriorIzda = geoMarcoLateralInterior.clone()
		geoMarcoLateralInteriorIzda.translate(grosorMarcoInterior/2 - anchoPuerta/2, 0, 0)

		// Derecha
		let geoMarcoLateralInteriorDcha = geoMarcoLateralInterior
		geoMarcoLateralInteriorDcha.translate(anchoPuerta/2 - grosorMarcoInterior/2, 0, 0)

		// Superior
		let geoMarcoSuperiorInterior = new THREE.BoxGeometry(anchoPuerta, grosorMarcoInterior, grosorPared)
		geoMarcoSuperiorInterior.translate(0, altoPuerta - grosorMarcoInterior/2, -grosorPared/2)

		csg = new CSG().union([new THREE.Mesh(geoMarcoLateralInteriorIzda, this.materialMarcosInteriores),
		new THREE.Mesh(geoMarcoSuperiorInterior, null), new THREE.Mesh(geoMarcoLateralInteriorDcha, null)])

		this.meshMarcosInteriores = csg.toMesh()
		this.add(this.meshMarcosInteriores)

		// Inferior
		let geoMarcoInferiorInterior = new THREE.BoxGeometry(anchoPuerta, 1, grosorPared)
		geoMarcoInferiorInterior.translate(0, -0.5, -grosorPared/2)

		this.add(new THREE.Mesh(geoMarcoInferiorInterior, this.materialMarcoInteriorInferior))
	}
}

export {Sala, Pasillo, Marcos}
