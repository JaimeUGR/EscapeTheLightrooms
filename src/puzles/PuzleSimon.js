
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {Simon} from "../models/Simon.js"

const NUM_NIVELES = 3

class PuzleSimon extends THREE.Object3D
{
	constructor(callbackCompletado)
	{
		super()

		// Callback
		this.callbackCompletado = callbackCompletado

		// Creamos el modelo
		this.simon = new Simon()
		this.add(this.simon)

		// Variables de control
		this.animaciones = {}
		this.secuenciaBotones = []
		this.indiceSecuencia = 0
		this.estaJugando = false
		this.nivel  = 0

		this.luzBotones = new THREE.SpotLight( 0xffffff, 0.5 )
		this.luzBotones.position.set(0, 0, this.simon.alturaBotonJuego + 20)
		this.luzBotones.name = "Luz"

		// Creación de las animaciones y adición de interacciones
		this._crearAnimacionInicio()
		this.simon.botonInicialMesh.userData.interaction = {
			interact: this._pulsarBotonInicio.bind(this)
		}

		this.crearAnimacionPulsacionBoton()
		let metodoInteraccion = this._pulsacionBoton.bind(this)

		for (let i = 0; i < this.simon.botones.length; i++) {
			this.simon.botones[i].userData.interaction = {
				interact: (event) => metodoInteraccion(i)
			}
		}

		this._crearAnimacionIluminacionBoton()
	}

	reset()
	{
		this.nivel = 0

		// Resetear indicadores
		for(let i= 0; i < this.simon.indicadores.length; i++)
			this.simon.indicadores[i].material.color.set(0x111111)

		// Generar secuencia
		setTimeout(() => this.generarSecuencia(), 500)
	}

	generarSecuencia()
	{
		this.secuenciaBotones.length = 0

		this.indiceSecuencia = 0

		for(let i = 0; i < 3 + this.nivel; i++ )
			this.secuenciaBotones.push(Math.floor(Math.random() * 4)) // TODO: Revisar porque puede generar un numero que no es

		console.log(this.secuenciaBotones)

		this.simon.indicadores[this.nivel].material.color.set(0xFFFF00)

		setTimeout(() => this._iluminarSecuencia(), 1000)
	}

	_crearAnimacionIluminacionBoton()
	{
		this.animaciones.iluminacionBoton = {
			boton: null,
			animacion: null,
			indiceSecuencia: null
		}

		let frameInicio = {t: 0}
		let frameFinal  = {t: 1}

		let animacionIluminarse = new TWEEN.Tween(frameInicio).to(frameFinal, 1000)
			.onStart(() =>{
				this.luzBotones.color.setHex(this.animaciones.iluminacionBoton.boton.material.color)
				this.animaciones.iluminacionBoton.boton.add(this.luzBotones)
			})
			.onUpdate(() => {

			})
			.onComplete(() =>
			{
				// Animación para que el botón recupere su forma incial
				this.animaciones.iluminacionBoton.boton.remove(this.luzBotones)
				this.animaciones.iluminacionBoton.indiceSecuencia++
				frameInicio.t = 0

				if(this.animaciones.iluminacionBoton.indiceSecuencia < this.secuenciaBotones.length){

					this.animaciones.iluminacionBoton.animacion.end()
					this.animaciones.iluminacionBoton.boton = this.simon.botones[this.secuenciaBotones[this.animaciones.iluminacionBoton.indiceSecuencia]]
					this.animaciones.iluminacionBoton.animacion.start()

				}
				else
				{
					this._animating = false

					setTimeout(() => this.estaJugando = true, 1000)
				}
			})

		this.animaciones.iluminacionBoton.animacion = animacionIluminarse
	}

	_iluminarSecuencia()
	{
		if(this._animating)
			return

		this._animating = true

		this.animaciones.iluminacionBoton.indiceSecuencia = 0

		this.animaciones.iluminacionBoton.boton = this.simon.botones[this.secuenciaBotones[0]]
		this.animaciones.iluminacionBoton.animacion.start()
	}

	crearAnimacionPulsacionBoton()
	{
		this.animaciones.pulsacionBoton = {
			boton: null,
			animacion: null,
			numBoton: null
		}

		let frameInicio = {z: 1}
		let frameFinal = {z: 0.5}

		let animacionEmpezarPulsar = new TWEEN.Tween(frameInicio).to(frameFinal, 100)
			.onStart(() =>
			{
				console.log("Me ilumino")
				//this.luzBotones.color.setHex(this.animaciones.pulsacionBoton.boton.material.color)
				//this.animaciones.pulsacionBoton.boton.add(this.luzBotones)
			})
			.onUpdate(() =>
			{
				this.animaciones.pulsacionBoton.boton.scale.set(1, 1, frameInicio.z )
			})
			.onComplete(() =>
			{
				// Animación para que el botón recupere su forma incial
				frameInicio.z = 1
			})


		let animacionTerminarPulsar =  new TWEEN.Tween(frameFinal).to(frameInicio, 100)
			.onStart(() =>
			{
				console.log("Me apago")
				//this.animaciones.pulsacionBoton.boton.remove(this.luzBotones)
			})
			.onUpdate(() =>
			{
				this.animaciones.pulsacionBoton.boton.scale.set(1, 1, frameFinal.z )
			})
			.onComplete(() =>
			{
				// Animación para que el botón recupere su forma incial
				frameFinal.z = 0.5
				this.comprobarSecuencia(this.animaciones.pulsacionBoton.numBoton)
				this._animating = false
			})

		animacionEmpezarPulsar.chain(animacionTerminarPulsar)
		this.animaciones.pulsacionBoton.animacion = animacionEmpezarPulsar
	}

	_pulsacionBoton(numBoton)
	{
		if(this._animating)
			return

		if(this.estaJugando === false)
			return

		this._animating = true

		this.animaciones.pulsacionBoton.numBoton = numBoton
		this.animaciones.pulsacionBoton.boton = this.simon.botones[numBoton]
		this.animaciones.pulsacionBoton.animacion.start()
	}

	comprobarSecuencia(numBoton)
	{
		if(this.secuenciaBotones[this.indiceSecuencia] === numBoton)
		{
			this.indiceSecuencia++

			if(this.indiceSecuencia < this.secuenciaBotones.length)
				return

			this.simon.indicadores[this.nivel].material.color.set(0x123456)
			this.nivel++

			if(this.nivel === NUM_NIVELES)
			{
				this.completarJuego()
				return
			}

			setTimeout(() => {
				this.generarSecuencia()
			}, 750)

			return
		}

		// Secuencia Errónea
		setTimeout(() => {
			console.log("Reiniciando")
			this.reset()
		}, 250)
	}


	completarJuego()
	{
		console.log("Completado Puzle Simón")

		if (this.callbackCompletado !== null)
			this.callbackCompletado()
	}

	_crearAnimacionInicio()
	{
		let frameInicial = {z: 1}
		let frameFinal = {z: 0.5}

		//Animación del inicio del juego
		this._animacionPulsarInicio = new TWEEN.Tween(frameInicial).to(frameFinal, 200)
			.onStart(() =>
			{
				this.estaJugando = false
			})
			.onUpdate(() =>
			{
				this.simon.botonInicialMesh.scale.set(1, 1, frameInicial.z )
			})
			.onComplete(() =>
			{
				// Animación para que el botón recupere su forma incial
				frameInicial.z = 1
			})

		this._animacionDespulsarInicio = new TWEEN.Tween(frameFinal).to(frameInicial, 200)
			.onUpdate(() =>
			{
				this.simon.botonInicialMesh.scale.set(1, 1, frameFinal.z )
			})
			.onComplete(() =>
			{
				frameFinal.z = 0.5

				this._animating = false // Para no poder activar la animacion varias veces
				this.reset()
			})

		this._animacionPulsarInicio.chain(this._animacionDespulsarInicio)
	}

	_pulsarBotonInicio(event)
	{
		if(this._animating)
			return

		this._animating = true
		this._animacionPulsarInicio.start()
	}
}

export {PuzleSimon}
