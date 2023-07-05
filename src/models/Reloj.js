/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

import {TrapezoidGeometry} from "../geometry/TrapezoidGeometry.js"

import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

class Reloj extends THREE.Object3D
{
	constructor(dimensiones = {
		// Dimensiones de la caja (sin los pilares)
		cajaX: 12,
		cajaY: 20,
		cajaZ: 10,

		// Dimensiones pilares
		pilarX: 2,
		pilarZ: 2,

		// Dimensiones de la parte interna
		cajaRelojX: 11, // < cajaX. El restante va para los marcos de los lados
		separacionPuertaReloj: 4, // < cajaZ. El restante es para colocar el reloj separado de la puerta
		profundidadPuertaReloj: 1, // < cajaZ - profReloj - cajaRelojZ

		// Dimensiones del reloj
		separacionSuperiorReloj: 2, // Separación de la zona superior de la caja
		radioReloj: 4,
		profundidadReloj: 1.5,

		radioPaloPendulo: 0.2,
		altoPaloPendulo: 6, // < que cajaY + 2*radioReloj o se verá mal

		radioPendulo: 2,
		profundidadPendulo: 0.75,

		tiempoPendulo: 1000, // Tiempo de la animación
		rotacionPendulo: Math.PI/11, // Máxima y mínima rotación del péndulo al girar

		// Bases
		// NOTE: La X y Z son sobresalientes de las dimensiones de la caja + 2*pilar
		trapecioSuperior: {
			XSup: 4,
			ZSup: 4,
			XInf: 2,
			ZInf: 2,
			Y: 2,
		},
		trapecioInferior: {
			XSup: 2,
			ZSup: 2,
			XInf: 10,
			ZInf: 10,
			Y: 20,
		},
	})
	{
		super()

		this.cajaX = dimensiones.cajaX
		this.cajaY = dimensiones.cajaY
		this.cajaZ = dimensiones.cajaZ

		this.pilarX = dimensiones.pilarX
		this.pilarZ = dimensiones.pilarZ

		this.cajaRelojX = dimensiones.cajaRelojX
		this.separacionPuertaReloj = dimensiones.separacionPuertaReloj
		this.profundidadPuertaReloj = dimensiones.profundidadPuertaReloj

		this.separacionSuperiorReloj = dimensiones.separacionSuperiorReloj
		this.radioReloj = dimensiones.radioReloj
		this.profundidadReloj = dimensiones.profundidadReloj

		this.radioPaloPendulo = dimensiones.radioPaloPendulo
		this.altoPaloPendulo = dimensiones.altoPaloPendulo

		this.radioPendulo = dimensiones.radioPendulo
		this.profundidadPendulo = dimensiones.profundidadPendulo

		this.tiempoPendulo = dimensiones.tiempoPendulo
		this.rotacionPendulo = dimensiones.rotacionPendulo

		this.trapSup = dimensiones.trapecioSuperior
		this.trapInf = dimensiones.trapecioInferior

		this.material = new THREE.MeshNormalMaterial({opacity: 0.5, transparent: true})

		this.tieneManecillaHora = false
		this.tieneManecillaMinuto = false

		this.baseCollider = null

		//
		// Materiales
		//

		let texturaBases = GameState.txLoader.load("./resources/textures/models/textura_bases_reloj.jpg")
		let texturaPilares = GameState.txLoader.load("./resources/textures/models/textura_pilares_reloj.jpg")
		let texturaCajaInterior = GameState.txLoader.load("./resources/textures/models/textura_caja_reloj.jpg")
		let texturaCajaExterior = GameState.txLoader.load("./resources/textures/models/textura_bases_reloj.jpg")

		let texturaPendulo = GameState.txLoader.load("./resources/textures/models/oro1.jpeg")

		let texturaReloj = GameState.txLoader.load("./resources/textures/models/textura_reloj_circulo.png")
		texturaReloj.center.set(0.5, 0.5)
		texturaReloj.rotation = Math.PI/2

		this.materialBases = new THREE.MeshLambertMaterial({map: texturaBases})
		this.materialPilares = new THREE.MeshLambertMaterial({map: texturaPilares})
		this.materialCajaInterior = new THREE.MeshLambertMaterial({map: texturaCajaInterior})
		this.materialCajaExterior = new THREE.MeshLambertMaterial({map: texturaCajaExterior})
		this.materialPendulo = new THREE.MeshLambertMaterial({map: texturaPendulo})
		this.materialReloj = new THREE.MeshBasicMaterial({map: texturaReloj})
		this.materialCristal = new THREE.MeshPhysicalMaterial({
			color: 0x999994,
			transparent: true,
			opacity: 1,
			roughness: 0.1,
			metalness: 0,
			transmission: 0.9,
			clearcoat: 0.2,
			clearcoatRoughness: 0.5
		})

		//
		// Modelado
		//

		//
		// Bases
		//

		let extraBaseTrapeciosX = this.cajaX + 2*this.pilarX
		let extraBaseTrapeciosZ = this.cajaZ + 2*this.pilarZ

		// TODO: Se ha puesto en modo no indexada para solucionar un problema con las texturas
		let geoTrapecioSuperior = new TrapezoidGeometry(this.trapSup.XInf + extraBaseTrapeciosX,
			this.trapSup.ZInf + extraBaseTrapeciosZ, this.trapSup.XSup + extraBaseTrapeciosX,
			this.trapSup.ZSup + extraBaseTrapeciosZ, this.trapSup.Y, false)
		geoTrapecioSuperior.translate(0, this.cajaY/2 + this.trapSup.Y/2, 0)

		let geoTrapecioInferior = new TrapezoidGeometry(this.trapInf.XInf + extraBaseTrapeciosX,
			this.trapInf.ZInf + extraBaseTrapeciosZ, this.trapInf.XSup + extraBaseTrapeciosX,
			this.trapInf.ZSup + extraBaseTrapeciosZ, this.trapInf.Y, false)
		geoTrapecioInferior.translate(0, -(this.cajaY/2 + this.trapInf.Y/2), 0)

		this.add(new THREE.Mesh(geoTrapecioSuperior, this.materialBases))
		this.add(new THREE.Mesh(geoTrapecioInferior, this.materialBases))

		//
		// Pilares
		//

		let geoPilar = new THREE.BoxGeometry(this.pilarX, this.cajaY, this.pilarZ)

		geoPilar.translate(-(this.cajaX/2 + this.pilarX/2), 0, this.cajaZ/2 + this.pilarZ/2)
		this.add(new THREE.Mesh(geoPilar.clone(), this.materialPilares))

		geoPilar.translate(this.cajaX + this.pilarX, 0, 0)
		this.add(new THREE.Mesh(geoPilar.clone(), this.materialPilares))

		geoPilar.translate(0, 0, -(this.cajaZ + this.pilarZ))
		this.add(new THREE.Mesh(geoPilar.clone(), this.materialPilares))

		geoPilar.translate(-(this.cajaX + this.pilarX), 0, 0)
		this.add(new THREE.Mesh(geoPilar.clone(), this.materialPilares))

		//
		// Caja Interna
		//

		// Caja Interna del reloj
		let geoCajaReloj = new THREE.BoxGeometry(this.cajaRelojX, this.cajaY, this.cajaZ - this.separacionPuertaReloj)
		geoCajaReloj.translate(0, 0, -(this.separacionPuertaReloj/2))

		this.add(new THREE.Mesh(geoCajaReloj, this.materialCajaInterior))

		// Cajas Laterales
		let geoCajaRelojLateral = new THREE.BoxGeometry((this.cajaX - this.cajaRelojX)/2, this.cajaY, this.cajaZ)

		geoCajaRelojLateral.translate(-(this.cajaRelojX/2 + (this.cajaX - this.cajaRelojX)/4), 0, 0)
		this.add(new THREE.Mesh(geoCajaRelojLateral.clone(), this.materialCajaExterior))

		geoCajaRelojLateral.translate(this.cajaRelojX + (this.cajaX - this.cajaRelojX)/2, 0, 0)
		this.add(new THREE.Mesh(geoCajaRelojLateral.clone(), this.materialCajaExterior))

		//
		// Péndulo
		//
		this._crearPendulo()

		//
		// Puerta reloj
		//
		this._crearPuertaReloj()


		//
		// Sonidos
		//

		this._crearSonidos()

		//
		// Animación
		//

		this._crearAnimacion()

		//
		// Colisión
		//

		this._crearColliders()

		//
		// Interacción
		//

		this.meshPuertaReloj.traverse((anyNode) => {
			anyNode.userData.interaction = {
				interact: this.interactuarPuerta.bind(this)
			}
		})

		this.meshReloj.userData.interaction = {
			interact: this.ponerManecillas.bind(this)
		}
	}

	_crearPendulo()
	{
		let geoReloj = new THREE.CylinderGeometry(this.radioReloj, this.radioReloj, this.profundidadReloj, 20)
		geoReloj.rotateX(Math.PI/2)
		geoReloj.translate(0, this.cajaY/2 - (this.radioReloj + this.separacionSuperiorReloj),
			this.cajaZ/2 - this.separacionPuertaReloj + this.profundidadReloj/2)

		let meshReloj = new THREE.Mesh(geoReloj, this.materialReloj)

		// NOTE: A este O3 se meten directamente las agujas
		this.O3Agujas = new THREE.Object3D()
		this.O3Agujas.translateY(this.cajaY/2 - (this.radioReloj + this.separacionSuperiorReloj))
		this.O3Agujas.translateZ(this.cajaZ/2 - this.separacionPuertaReloj + this.profundidadReloj)

		meshReloj.add(this.O3Agujas)

		this.meshReloj = meshReloj
		this.add(meshReloj)

		//
		// Péndulo
		//

		let O3Pendulo = new THREE.Object3D()

		let alturaPaloPendulo = this.altoPaloPendulo + this.radioPendulo + this.radioReloj
		let geoPaloPendulo = new THREE.CylinderGeometry(this.radioPaloPendulo, this.radioPaloPendulo,
			alturaPaloPendulo)

		geoPaloPendulo.translate(0, -alturaPaloPendulo/2, 0)

		let geoPendulo = new THREE.CylinderGeometry(this.radioPendulo, this.radioPendulo, this.profundidadPendulo, 15)
		geoPendulo.rotateX(Math.PI/2)
		geoPendulo.translate(0, -alturaPaloPendulo , 0)

		O3Pendulo.add(new THREE.Mesh(geoPaloPendulo, this.materialPendulo))
		O3Pendulo.add(new THREE.Mesh(geoPendulo, this.materialPendulo))

		O3Pendulo.translateY(alturaPaloPendulo/2 - this.separacionSuperiorReloj/2)
		O3Pendulo.translateZ(this.cajaZ/2 - this.separacionPuertaReloj + this.profundidadReloj/2)

		this.O3Pendulo = O3Pendulo
		this.add(O3Pendulo)
	}

	_crearPuertaReloj()
	{
		let geoPuertaReloj = new THREE.BoxGeometry(this.cajaRelojX, this.cajaY, this.profundidadPuertaReloj)
		geoPuertaReloj.translate(this.cajaRelojX/2, 0, 0)

		let geoRelojRecorte = new THREE.CylinderGeometry(this.radioReloj, this.radioReloj, this.profundidadPuertaReloj, 20)
		geoRelojRecorte.rotateX(Math.PI/2)
		geoRelojRecorte.translate(this.cajaRelojX/2, this.cajaY/2 - this.separacionSuperiorReloj - this.radioReloj, 0)

		let geoCajaRecorte = new THREE.BoxGeometry(2*this.radioPendulo, this.cajaY - (this.separacionSuperiorReloj + this.radioReloj) , this.profundidadPuertaReloj)
		geoCajaRecorte.translate(this.cajaRelojX/2, -(this.separacionSuperiorReloj/2 + this.radioReloj/2), 0)

		// Puerta
		let csg = new CSG().union([new THREE.Mesh(geoPuertaReloj, this.materialCajaExterior)])
			.subtract([new THREE.Mesh(geoRelojRecorte, null), new THREE.Mesh(geoCajaRecorte, null)])

		let meshPuertaReloj = csg.toMesh()

		// TODO: Animación de rotación uwu
		meshPuertaReloj.rotation.y = 0

		meshPuertaReloj.translateX(-this.cajaRelojX/2)
		meshPuertaReloj.translateZ(this.cajaZ/2 - this.profundidadPuertaReloj/2)

		// Puerta Cristal
		csg = new CSG().union([new THREE.Mesh(geoRelojRecorte, this.materialCristal),
			new THREE.Mesh(geoCajaRecorte, this.materialCristal)])

		meshPuertaReloj.add(csg.toMesh())

		this.meshPuertaReloj = meshPuertaReloj
		this.add(meshPuertaReloj)
	}

	_crearSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadPositionalSound("./resources/sounds/clockTick.mp3", (audio) => {
			this._sonidos.tick = audio

			audio.setVolume(0.5)
			audio.duration = 0.2

			audio.setDistanceModel('exponential')
			audio.setRefDistance(25)
			audio.setMaxDistance(100)
			audio.setRolloffFactor(1.4)

			this.O3Pendulo.add(audio)
		})

		GameState.systems.sound.loadPositionalSound("./resources/sounds/spin.mp3", (audio) => {
			this._sonidos.resolver = audio

			audio.setVolume(0.1)
			audio.setPlaybackRate(0.4)

			audio.setDistanceModel('linear')
			audio.setRefDistance(10)
			audio.setMaxDistance(150)
			audio.setRolloffFactor(0.7)

			this.O3Agujas.add(audio)
		})
	}

	_crearAnimacion()
	{
		this._animating = false
		this.animaciones = {}

		this.animaciones.pendulo = {
			animacion: null
		}

		this.animaciones.puerta = {
			animacionAbrir: null,
			animacionCerrar: null,
			estadoPuerta: 1 // 1 cerrada, 0 abierta
		}

		this.animaciones.manecillas = {
			animacionPonerManecillaHora: null,
			animacionPonerManecillaMinuto: null,
			animacionManecillaHora: null,
			animacionManecillaMinuto: null
		}

		this.animaciones.resolver = {
			animacion: null,
			posicionXInicio: 0
		}

		//
		// Péndulo
		//

		{
			let framePendulo_Izda = { rZ: -this.rotacionPendulo }
			let framePendulo_Dcha = { rZ: this.rotacionPendulo }

			// NOTE: Establecer una rotación inicial
			this.O3Pendulo.rotation.z = -this.rotacionPendulo

			let animacionIzdaDcha = new TWEEN.Tween(framePendulo_Izda).to(framePendulo_Dcha, this.tiempoPendulo)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onUpdate(() => {
					this.O3Pendulo.rotation.z = framePendulo_Izda.rZ
				})
				.onComplete(() => {
					framePendulo_Izda.rZ = -this.rotacionPendulo

					if (!this._sonidos.tick.isPlaying)
					{
						this._sonidos.tick.offset = 1.05
						this._sonidos.tick.play()
					}
				})

			let animacionDchaIzda = new TWEEN.Tween(framePendulo_Dcha).to(framePendulo_Izda, this.tiempoPendulo)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onUpdate(() => {
					this.O3Pendulo.rotation.z = framePendulo_Dcha.rZ
				})
				.onComplete(() => {
					framePendulo_Dcha.rZ = this.rotacionPendulo

					if (!this._sonidos.tick.isPlaying)
					{
						this._sonidos.tick.offset = 0.12
						this._sonidos.tick.play()
					}
				})

			animacionIzdaDcha.chain(animacionDchaIzda)
			animacionDchaIzda.chain(animacionIzdaDcha)

			this.animaciones.pendulo.animacion = animacionIzdaDcha
		}

		//
		// Puerta
		//
		{
			let framePuertaCerrada = { rY: 0 }
			let framePuertaAbierta = { rY: -Math.PI/2 }

			let animacionAbrir = new TWEEN.Tween(framePuertaCerrada).to(framePuertaAbierta, 750)
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					this.meshPuertaReloj.rotation.y = framePuertaCerrada.rY
				})
				.onComplete(() => {
					this.animaciones.puerta.estadoPuerta = 0
					framePuertaCerrada.rY = 0
					this._animating = false
				})

			let animacionCerrar = new TWEEN.Tween(framePuertaAbierta).to(framePuertaCerrada, 650)
				.easing(TWEEN.Easing.Cubic.Out)
				.onUpdate(() => {
					this.meshPuertaReloj.rotation.y = framePuertaAbierta.rY
				})
				.onComplete(() => {
					this.animaciones.puerta.estadoPuerta = 1
					framePuertaAbierta.rY = -Math.PI/2
					this._animating = false
				})

			this.animaciones.puerta.animacionAbrir = animacionAbrir
			this.animaciones.puerta.animacionCerrar = animacionCerrar
		}

		//
		// Colocación de manecillas
		//
		{
			// Horas

			let frameMH_I = { pZ: 4 }
			let frameMH_F = { pZ: 0 }

			this.animaciones.manecillas.animacionPonerManecillaHora = new TWEEN.Tween(frameMH_I).to(frameMH_F, 1000)
				.onStart(() => {
					GameState.flags.tieneManecillaHora = false

					// Añadir la manecilla al reloj
					this.O3Agujas.add(GameState.items.manecillaHora)
				})
				.onUpdate(() => {
					GameState.items.manecillaHora.position.z = frameMH_I.pZ
				})
				.onComplete(() => {
					this._animating = false
					this.tieneManecillaHora = true

					this.ponerManecillas()
				})

			// Minutos
			let frameMM_I = { pZ: 4 }
			let frameMM_M = { pZ: 0, rZ: 0 }
			let frameMM_F = { rZ: -Math.PI/2}

			let animacionPonerMinuto = new TWEEN.Tween(frameMM_I).to(frameMM_M, 1000)
				.onStart(() => {
					GameState.flags.tieneManecillaMinuto = false

					// Añadir la manecilla al reloj
					this.O3Agujas.add(GameState.items.manecillaMinuto)
				})
				.onUpdate(() => {
					GameState.items.manecillaMinuto.position.z = frameMM_I.pZ
				})

			let animacionGirarMinuto = new TWEEN.Tween(frameMM_M).to(frameMM_F, 1000)
				.easing(TWEEN.Easing.Sinusoidal.InOut)
				.onStart(() => {
					GameState.flags.tieneManecillaMinuto = false

					// Añadir la manecilla al reloj
					this.O3Agujas.add(GameState.items.manecillaMinuto)
				})
				.onUpdate(() => {
					GameState.items.manecillaMinuto.rotation.z = frameMM_M.rZ
				})
				.onComplete(() => {
					// Si tiene la del minuto la enganchamos
					this._animating = false
					this.tieneManecillaMinuto = true

					this.ponerManecillas()
				})

			animacionPonerMinuto.chain(animacionGirarMinuto)

			this.animaciones.manecillas.animacionPonerManecillaMinuto = animacionPonerMinuto
		}

		//
		// Completar el puzle
		//
		{
			let frameInicio = { rZ: 0, tX: 0}
			let frameFin = { rZ: -Math.PI, tX: -(this.cajaRelojX + 2*this.pilarX + 2*this.trapSup.XInf) }

			this.animaciones.resolver.animacion = new TWEEN.Tween(frameInicio).to(frameFin, 5000)
				.onStart(() => {
					this._sonidos.resolver.play()
					this.animaciones.resolver.posicionXInicio = this.position.x
				})
				.onUpdate(() => {
					this.O3Agujas.rotation.z = frameInicio.rZ
					this.position.x = this.animaciones.resolver.posicionXInicio + frameInicio.tX
					this.updateColliders()
				})
				.onComplete(() => {
					this.animaciones.pendulo.animacion.start()
				})
		}
	}

	interactuarPuerta()
	{
		if (this._animating)
			return

		this._animating = true

		if (this.animaciones.puerta.estadoPuerta === 1) // Cerrada
			this.animaciones.puerta.animacionAbrir.start()
		else
			this.animaciones.puerta.animacionCerrar.start()
	}

	ponerManecillas()
	{
		if (this._animating)
			return

		if (GameState.flags.tieneManecillaHora)
		{
			this._animating = true
			this.animaciones.manecillas.animacionPonerManecillaHora.start()
		}
		else if (GameState.flags.tieneManecillaMinuto)
		{
			this._animating = true
			this.animaciones.manecillas.animacionPonerManecillaMinuto.start()
		}

		// Si están ambas manecillas
		if (this.tieneManecillaHora && this.tieneManecillaMinuto)
		{
			this.meshReloj.userData = {}

			console.log("Has completado el reloj")

			this.animaciones.resolver.animacion.start()
		}
	}

	updateColliders()
	{
		let colSys = GameState.systems.collision

		// Añado mis colliders
		this.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.uuid,
			SistemaColisiones.Box3ArrayToRectArray([this.baseCollider], this.matrixWorld))
	}

	_crearColliders()
	{
		// NOTE: Se hace con el superior porque el reloj estará un poco metido en el suelo
		let radioX = this.trapSup.XSup + this.cajaX/2 + this.pilarX
		let radioZ = this.trapSup.ZSup + this.cajaZ/2 + this.pilarZ

		let tmpMin = new THREE.Vector3(-radioX, 0, -radioZ)
		let tmpMax = new THREE.Vector3(radioX, 0, radioZ)

		this.baseCollider = new THREE.Box3(tmpMin, tmpMax)
	}
}

class ManecillaHora extends THREE.Object3D
{
	constructor(dimensiones = {
		separacion: 1,
		grosor: 0.5,
		escalado: 1,
		alturaCilindroContenedor: 0.75,
		radioCilindroRecortado: 0.75
	})
	{
		super()


		this.separacion = dimensiones.separacion
		this.grosor = dimensiones.grosor
		this.escalado = dimensiones.escalado / 10
		this.radioCilindroRecorte = dimensiones.radioCilindroRecortado

		this.material = new THREE.MeshBasicMaterial({color: 0x222222})

		let formaManecillaHoras= new THREE.Shape()

		formaManecillaHoras.moveTo(1,0)
		formaManecillaHoras.lineTo(1,6)
		formaManecillaHoras.quadraticCurveTo(2,7,2,8)
		formaManecillaHoras.quadraticCurveTo(2,9, 1, 10)
		formaManecillaHoras.bezierCurveTo(0.5, 11.5, 0.5, 13.5,0.5, 14)
		formaManecillaHoras.quadraticCurveTo(0 ,15, -0.5, 14)
		formaManecillaHoras.bezierCurveTo(-0.5, 13.5, -0.5, 11.5,  -1,10)
		formaManecillaHoras.quadraticCurveTo(-2, 9, -2,8)
		formaManecillaHoras.quadraticCurveTo(-2, 7, -1, 6)
		formaManecillaHoras.lineTo(-1,0)

		const options = {bevelEnabled: false, depth: this.grosor, steps: 1, curveSegments: 4,
			bevelThickness: 4, bevelSize: 2 , bevelSegements :2}

		let geoManecillaHoras = new THREE.ExtrudeGeometry(formaManecillaHoras,options)
		geoManecillaHoras.translate(0, 0, -this.grosor/2 + 0.5)
		geoManecillaHoras.scale(this.escalado, this.escalado, this.escalado)

		// Hacer el cilindro contenedor
		let geoCilindro = new THREE.CylinderGeometry(1.2, 1.2,
			dimensiones.alturaCilindroContenedor, 15)
		geoCilindro.rotateX(Math.PI/2)
		geoCilindro.translate(0, 0, 0.5)
		geoCilindro.scale(this.escalado, this.escalado, this.escalado)

		let geoCilindroRecorte = new THREE.CylinderGeometry(this.radioCilindroRecorte, this.radioCilindroRecorte,
			dimensiones.alturaCilindroContenedor*this.escalado, 15)
		geoCilindroRecorte.rotateX(Math.PI/2)
		geoCilindroRecorte.translate(0, 0, 0.5*this.escalado)

		let csg = new CSG().union([new THREE.Mesh(geoManecillaHoras, this.material),
			new THREE.Mesh(geoCilindro, null)])
			.subtract([new THREE.Mesh(geoCilindroRecorte, null)])

		this.add(csg.toMesh())
	}
}

class ManecillaMinuto extends THREE.Object3D
{
	constructor(dimensiones = {
		separacion: 1,
		grosor: 0.5,
		escalado: 1,
		alturaCilindroContenedor: 0.75,
		radioCilindroRecortado: 0.75
	})
	{
		super()

		this.separacion = dimensiones.separacion
		this.grosor = dimensiones.grosor
		this.escalado = dimensiones.escalado / 10
		this.radioCilindroRecorte = dimensiones.radioCilindroRecortado

		this.material = new THREE.MeshBasicMaterial({color: 0x222222})

		let formaManecillaMinutos = new THREE.Shape()

		formaManecillaMinutos.moveTo(1,0)
		formaManecillaMinutos.lineTo(1,6)
		formaManecillaMinutos.quadraticCurveTo(2,7,2,8)
		formaManecillaMinutos.quadraticCurveTo(2,9, 1, 10)
		formaManecillaMinutos.bezierCurveTo(0.5, 11.5 + this.separacion, 0.5, 13.5 + this.separacion,0.5, 14 + this.separacion)
		formaManecillaMinutos.quadraticCurveTo(0 ,15 + this.separacion, -0.5, 14 + this.separacion)
		formaManecillaMinutos.bezierCurveTo(-0.5, 13.5, -0.5, 11.5,  -1,10)
		formaManecillaMinutos.quadraticCurveTo(-2, 9, -2,8)
		formaManecillaMinutos.quadraticCurveTo(-2, 7, -1, 6)
		formaManecillaMinutos.lineTo(-1,0)

		const options = {bevelEnabled: false, depth: this.grosor, steps: 1, curveSegments: 4,
			bevelThickness: 4, bevelSize: 2 , bevelSegements :2}

		let geoManecillaMinutos = new THREE.ExtrudeGeometry(formaManecillaMinutos, options)
		geoManecillaMinutos.translate(0, 0, -this.grosor/2 + 0.5)
		geoManecillaMinutos.scale(this.escalado, this.escalado, this.escalado)

		// Hacer el cilindro contenedor
		let geoCilindro = new THREE.CylinderGeometry(1.2, 1.2,
			dimensiones.alturaCilindroContenedor, 15)
		geoCilindro.rotateX(Math.PI/2)
		geoCilindro.translate(0, 0, 0.5)
		geoCilindro.scale(this.escalado, this.escalado, this.escalado)

		let geoCilindroRecorte = new THREE.CylinderGeometry(this.radioCilindroRecorte, this.radioCilindroRecorte,
			dimensiones.alturaCilindroContenedor*this.escalado, 15)
		geoCilindroRecorte.rotateX(Math.PI/2)
		geoCilindroRecorte.translate(0, 0, 0.5*this.escalado)

		let csg = new CSG().union([new THREE.Mesh(geoManecillaMinutos, this.material),
			new THREE.Mesh(geoCilindro, null)])
			.subtract([new THREE.Mesh(geoCilindroRecorte, null)])

		this.add(csg.toMesh())
	}
}

export {Reloj, ManecillaHora, ManecillaMinuto}
