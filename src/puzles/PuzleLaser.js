
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

import {AnilloCristal} from "../models/AnilloCristal.js"
import {CristalContenedor} from "../models/CristalContenedor.js"
import {Pila} from "../models/Pila.js"

import {GameState} from "../GameState.js";
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

import {ShuffleArray} from "../Utils.js"

const COLOR_AZUL = 0x5555ff
const COLOR_VERDE = 0x55ff55
const COLOR_ROJO = 0xff5555

const COLOR_AMARILLO = 0xffc72b
const COLOR_MORADO = 0xae46eb
const COLOR_ROSA = 0xf19afc


class PuzleLaser extends THREE.Object3D
{
	constructor()
	{
		super()

		this.baseColliders = []
		this.coloresLaser = [COLOR_AZUL, COLOR_VERDE, COLOR_ROJO, COLOR_AMARILLO,
			COLOR_ROSA, COLOR_MORADO]

		this.estaResuelto = false

		this.laserAzul = null
		this.laserVerde = null
		this.laserRojo = null

		//
		// Modelado
		//

		this._crearAnillos()

		// Añadir el cristal
		this._crearCristalContenedor()

		//
		// Animación
		//

		this._crearAnimaciones()

		//
		// Colisión
		//

		this._crearColliders()

		//this.add(new THREE.AxesHelper(10))
	}

	_crearCristalContenedor()
	{
		let cristal = new CristalContenedor({
			numVertices: 8,
			sX: this.anilloRojo.radioInterno,
			sY: this.anilloRojo.radioInterno,
			sZ: this.anilloRojo.radioInterno
		})

		this.add(cristal)
		this.cristal = cristal

		//
		// Añadir la pila con su interacción bloqueada
		//
		let pila = GameState.items.pila

		this.add(pila)

		// Interacción de la pila

		let metodoInteraccionPila = (event) => {
			if (!cristal.estaRoto)
				return

			this.remove(pila)
			GameState.flags.tienePila = true

			pila.traverse((anyNode) => {
				anyNode.userData = {}
			})
		}

		pila.traverse((anyNode) => {
			anyNode.userData.interaction = {
				interact: metodoInteraccionPila
			}
		})

		GameState.systems.interaction.allInteractables.push(pila)
	}

	_crearAnillos()
	{
		this.anilloAzul = new AnilloCristal({
			radioInterno: 12,
			radioTubo: 1.25,
			numCaras: 6, // No cambiar
			numRadios: 8,// Hacerlo más o menos redondeado
			profundidadSujetadorCristal: 0.4,
			alturaSujetadorCristal: 4.4, // Se divide entre cada lado

			profundidadCristal: 0.35,

			cristalBevelSize: 0.8,
			cristalBevelThickness: 0.9
		}, COLOR_AZUL)

		this.anilloVerde = new AnilloCristal({
			radioInterno: 8,
			radioTubo: 1,
			numCaras: 6, // No cambiar
			numRadios: 8,// Hacerlo más o menos redondeado
			profundidadSujetadorCristal: 0.35,
			alturaSujetadorCristal: 3.2, // Se divide entre cada lado

			profundidadCristal: 0.2,

			cristalBevelSize: 0.5,
			cristalBevelThickness: 0.8
		}, COLOR_VERDE)

		this.anilloRojo = new AnilloCristal({
			radioInterno: 4,
			radioTubo: 0.75,
			numCaras: 6, // No cambiar
			numRadios: 8,// Hacerlo más o menos redondeado
			profundidadSujetadorCristal: 0.2,
			alturaSujetadorCristal: 2, // Se divide entre cada lado

			profundidadCristal: 0.2,

			cristalBevelSize: 0.3,
			cristalBevelThickness: 0.6
		}, COLOR_ROJO)

		this.O3Anillos = new THREE.Object3D()
		this.O3Anillos.add(this.anilloAzul)
		this.O3Anillos.add(this.anilloVerde)
		this.O3Anillos.add(this.anilloRojo)

		this.add(this.O3Anillos)
	}

	_crearAnimaciones()
	{
		this.animaciones = {}

		let frameInicio = {
			rXAzul: 0,
			rYAzul: Math.PI/2,
			rZAzul: 0,
			rXVerde: 0,
			rYVerde: -Math.PI/2,
			rZVerde: 0,
			rXRojo: Math.PI,
			rYRojo: Math.PI,
			rZRojo: 0
		}

		let frameActivado = {
			rXAzul: 0,
			rYAzul: -Math.PI/2,
			rZAzul: 0,
			rXVerde: Math.PI/2,
			rYVerde: Math.PI/2,
			rZVerde: 0,
			rXRojo: -Math.PI,
			rYRojo: 0,
			rZRojo: Math.PI/2
		}

		let frameCompletado = {
			rXAzul: -Math.PI/2,
			rYAzul: 0,
			rZAzul: 0,
			rXVerde: -Math.PI/2,
			rYVerde: 0,
			rZVerde: 0,
			rXRojo: -Math.PI/2,
			rYRojo: 0,
			rZRojo: 0
		}


		// Aplicamos las rotaciones iniciales a los anillos
		let aplicarRotacion = (frameR) => {
			this.anilloAzul.rotation.x = frameR.rXAzul
			this.anilloAzul.rotation.y = frameR.rYAzul
			this.anilloAzul.rotation.z = frameR.rZAzul
			this.anilloVerde.rotation.x = frameR.rXVerde
			this.anilloVerde.rotation.y = frameR.rYVerde
			this.anilloVerde.rotation.z = frameR.rZVerde
			this.anilloRojo.rotation.x = frameR.rXRojo
			this.anilloRojo.rotation.y = frameR.rYRojo
			this.anilloRojo.rotation.z = frameR.rZRojo
		}

		aplicarRotacion(frameInicio)

		this.animaciones.animacionInicio = new TWEEN.Tween(frameInicio).to(frameActivado, 4000)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onUpdate(() => {
				aplicarRotacion(frameInicio)
			})
			.onComplete(() => {
				// Activar los lásers
				this.laserAzul.activarLaser()
				this.laserVerde.activarLaser()
				this.laserRojo.activarLaser()

				this.laserAzul.setCallbackCambioColor(this._comprobarColores.bind(this))
				this.laserVerde.setCallbackCambioColor(this._comprobarColores.bind(this))
				this.laserRojo.setCallbackCambioColor(this._comprobarColores.bind(this))
			})

		this.animaciones.animacionCompletar = new TWEEN.Tween(frameActivado).to(frameCompletado, 4000)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onUpdate(() => {
				aplicarRotacion(frameActivado)
			})
			.onComplete(() => {
				// Invocar la callback de solucionado
				this._crearColliders(true)
				this.updateColliders()

				// Colocar los cilindros
				{
					let radioCA = this.anilloAzul.radioTubo/4
					let radioCV = this.anilloVerde.radioTubo/4
					let radioCR = this.anilloRojo.radioTubo/4

					let alturaCA = this.anilloAzul.radioTubo + this.anilloAzul.radioInterno
						- (this.anilloVerde.radioInterno + this.anilloVerde.radioTubo)
					let alturaCV = this.anilloVerde.radioTubo + this.anilloVerde.radioInterno
						- (this.anilloRojo.radioInterno + this.anilloRojo.radioTubo)
					let alturaCR = this.anilloRojo.radioTubo + this.anilloRojo.radioInterno


					let geoCilindroAzul = new THREE.CylinderGeometry(radioCA, radioCA, alturaCA, 15)
					geoCilindroAzul.translate(0, this.anilloAzul.radioInterno - alturaCA/2, 0)

					let geoCilindroVerde = new THREE.CylinderGeometry(radioCV, radioCV, alturaCV, 15)
					geoCilindroVerde.translate(0, this.anilloVerde.radioInterno - alturaCV/2, 0)

					let geoCilindroRojo = new THREE.CylinderGeometry(radioCR, radioCR, alturaCR, 15)
					geoCilindroRojo.translate(0, alturaCR/2, 0)

					const meshCA = new THREE.Mesh(geoCilindroAzul, new THREE.MeshBasicMaterial({color: COLOR_AZUL}))
					const meshCV = new THREE.Mesh(geoCilindroVerde, new THREE.MeshBasicMaterial({color: 0x55aaaa}))
					const meshCR = new THREE.Mesh(geoCilindroRojo, new THREE.MeshBasicMaterial({color: 0xFFFFFF}))

					this.add(meshCA)
					this.add(meshCV)
					this.add(meshCR)

					setTimeout(() => {
						this.remove(meshCA)
						this.remove(meshCV)
						this.remove(meshCR)
					}, 2000)
				}

				// Romper el cristal
				this.cristal.romper()
			})
	}

	iniciarPuzle()
	{
		// Comprobar los colores
		while (this.laserAzul.getColorHaz() === COLOR_AZUL
			&& this.laserVerde.getColorHaz() === COLOR_VERDE
			&& this.laserRojo.getColorHaz() === COLOR_ROJO)
		{
			console.log("Lásers resueltos. Reordenando")

			ShuffleArray(this.laserAzul.coloresLaser)
			ShuffleArray(this.laserVerde.coloresLaser)
			ShuffleArray(this.laserRojo.coloresLaser)
		}

		// Empezar la animación de inicio
		setTimeout(() => this.animaciones.animacionInicio.start(), 2500)
	}

	// NOTE: Llamado cada vez que cambia el color de un laser
	_comprobarColores()
	{
		if (this.laserAzul.getColorHaz() !== COLOR_AZUL
			|| this.laserVerde.getColorHaz() !== COLOR_VERDE
			|| this.laserRojo.getColorHaz() !== COLOR_ROJO)
			return

		if (this.estaResuelto)
			return

		this.estaResuelto = true

		console.log("Has resuelto el puzle de los lásers")

		this.laserAzul.desactivarLaser()
		this.laserVerde.desactivarLaser()
		this.laserRojo.desactivarLaser()

		setTimeout(() => this.animaciones.animacionCompletar.start(), 5000)
	}

	setLaser(laser, largoHaz)
	{
		laser.setHaz(largoHaz, [...this.coloresLaser], false)

		if (laser.name === "LaserAzul")
			this.laserAzul = laser
		else if (laser.name === "LaserVerde")
			this.laserVerde = laser
		else if (laser.name === "LaserRojo")
			this.laserRojo = laser
		else
			console.error("No has definido el nombre del láser / no es conocido")
	}

	updateColliders()
	{
		let colSys = GameState.systems.collision

		// Añado mis colliders
		this.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.uuid,
			SistemaColisiones.Box3ArrayToRectArray(this.baseColliders, this.matrixWorld))
	}

	_crearColliders(shortMode = false)
	{
		if (!shortMode)
		{
			let radioAnilloAzul = this.anilloAzul.radioInterno + 2*this.anilloAzul.radioTubo

			let tmpMin = new THREE.Vector3(-radioAnilloAzul, 0, -radioAnilloAzul)
			let tmpMax = new THREE.Vector3(radioAnilloAzul, 0, radioAnilloAzul)

			this.baseColliders.push(new THREE.Box3(tmpMin, tmpMax))
		}
		else
		{
			this.baseColliders = []

			let radioAnilloAzul = this.anilloAzul.radioInterno + 2*this.anilloAzul.radioTubo

			let tmpMin = new THREE.Vector3(-radioAnilloAzul, 0, -this.anilloAzul.radioTubo)
			let tmpMax = new THREE.Vector3(radioAnilloAzul, 0, this.anilloAzul.radioTubo)

			this.baseColliders.push(new THREE.Box3(tmpMin, tmpMax))
		}
	}
}

export {PuzleLaser}
