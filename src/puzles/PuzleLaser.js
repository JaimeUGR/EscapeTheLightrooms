
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
			alturaSujetadorCristal: 3, // Se divide entre cada lado

			profundidadCristal: 0.2,

			cristalBevelSize: 0.5,
			cristalBevelThickness: 0.8
		})

		this.anilloVerde = new AnilloCristal({
			radioInterno: 8,
			radioTubo: 1.25,
			numCaras: 6, // No cambiar
			numRadios: 8,// Hacerlo más o menos redondeado
			profundidadSujetadorCristal: 0.4,
			alturaSujetadorCristal: 3, // Se divide entre cada lado

			profundidadCristal: 0.2,

			cristalBevelSize: 0.5,
			cristalBevelThickness: 0.8
		})

		this.anilloRojo = new AnilloCristal({
			radioInterno: 4,
			radioTubo: 1.25,
			numCaras: 6, // No cambiar
			numRadios: 8,// Hacerlo más o menos redondeado
			profundidadSujetadorCristal: 0.4,
			alturaSujetadorCristal: 3, // Se divide entre cada lado

			profundidadCristal: 0.2,

			cristalBevelSize: 0.5,
			cristalBevelThickness: 0.8
		})

		this.anilloAzul.rotateY(-Math.PI/2)
		this.anilloVerde.rotateY(Math.PI/2)
		this.anilloRojo.rotateY(Math.PI)

		this.O3Anillos = new THREE.Object3D()
		this.O3Anillos.add(this.anilloAzul)
		this.O3Anillos.add(this.anilloVerde)
		this.O3Anillos.add(this.anilloRojo)

		this.add(this.O3Anillos)
	}

	iniciarPuzle()
	{
		// Activar los lásers
		this.laserAzul.activarLaser()
		this.laserVerde.activarLaser()
		this.laserRojo.activarLaser()

		this.laserAzul.setCallbackCambioColor(this._comprobarColores.bind(this))
		this.laserVerde.setCallbackCambioColor(this._comprobarColores.bind(this))
		this.laserRojo.setCallbackCambioColor(this._comprobarColores.bind(this))
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
