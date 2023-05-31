
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

import {AnilloCristal} from "../models/AnilloCristal.js"

class PuzleLaser extends THREE.Object3D
{
	constructor(dimensiones = {
		distanciaLaserAzul: 10,
		distanciaLaserVerde: 10,
		distanciaLaserRojo: 10,
	})
	{
		super()

		this.distanciaLaserAzul = dimensiones.distanciaLaserAzul
		this.distanciaLaserVerde = dimensiones.distanciaLaserVerde
		this.distanciaLaserRojo = dimensiones.distanciaLaserRojo

		this.laserAzul = null
		this.laserVerde = null
		this.laserRojo = null

		this._crearAnillos()

		//this._crearLasers()

		//
		// Animación
		//

		this._crearAnimaciones()

		this.add(new THREE.AxesHelper(10))
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
		})

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
		})

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
		})

		// Rotaciones finales
		/*this.anilloAzul.rotateY(-Math.PI/2)
		this.anilloVerde.rotateY(Math.PI/2)
		this.anilloRojo.rotateY(Math.PI)*/

		this.O3Anillos = new THREE.Object3D()
		this.O3Anillos.add(this.anilloAzul)
		this.O3Anillos.add(this.anilloVerde)
		this.O3Anillos.add(this.anilloRojo)

		this.add(this.O3Anillos)
	}

	_crearAnimaciones()
	{
		let frameInicio = {
			rXAzul: 0,
			rYAzul: Math.PI/2,
			rZAzul: 0,
			rXVerde: 0,
			rYVerde: Math.PI/2,
			rZVerde: 0,
			rXRojo: Math.PI,
			rYRojo: Math.PI,
			rZRojo: 0
		}

		let frameFin = {
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

		this.animacionInicio = new TWEEN.Tween(frameInicio).to(frameFin, 3000)
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
	}

	iniciarPuzle()
	{
		// Empezar la animación de inicio
		this.animacionInicio.start()
	}

	// NOTE: Llamado cada vez que cambia el color de un laser
	_comprobarColores()
	{
		console.log("HOLA")
		console.log(this.laserAzul.haz.material.color.getHex())
		console.log(this.laserVerde.haz.material.color.getHex())
		console.log(this.laserRojo.haz.material.color.getHex())
	}

	setLaserAzul(laser)
	{
		this.laserAzul = laser
	}

	setLaserVerde(laser)
	{
		this.laserVerde = laser
	}

	setLaserRojo(laser)
	{
		this.laserRojo = laser
	}
}

export {PuzleLaser}
