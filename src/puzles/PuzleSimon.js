
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {Simon} from "../models/Simon.js"
import {GameState} from "../GameState.js"

const NUM_NIVELES = 3

class PuzleSimon extends THREE.Object3D
{
	constructor()
	{
		super()

		// Callback
		this.callbackCompletado = null

		// Creamos el modelo
		this.simon = new Simon()
		this.add(this.simon)

		// Variables de control
		this.animaciones = {}
		this.secuenciaBotones = []
		this.indiceSecuencia = 0
		this.estaJugando = false
		this.nivel  = 0

		this.luzBotones = new THREE.SpotLight( 0xffffff, 1, 15, Math.PI/4, 0.1, 0.02)
		this.luzBotones.position.set(0, 0, this.simon.alturaBotonJuego + 4)
		this.luzBotones.name = "Luz"

		//this.simon.add(this.luzBotones)
		//this.luzBotones.target = this.simon.botones[0]

		//this.simon.botones[0].add(this.luzBotones)

		let targetLuz = new THREE.Object3D()
		targetLuz.name = "TargetLuz"
		targetLuz.position.set(0, 0, -(this.simon.alturaBotonJuego + 4))

		this.luzBotones.add(targetLuz)
		this.luzBotones.target = targetLuz

		/*let lightHelper = new THREE.SpotLightHelper(this.luzBotones, 0xffffff)
		GameState.scene.add(lightHelper)*/

		//this.simon.botones[0].add(this.luzBotones)

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
		this.estaJugando = false
		this.nivel = 0

		// Resetear indicadores
		for(let i= 0; i < this.simon.indicadores.length; i++)
			this.simon.indicadores[i].material.color.set(0x111111)

		// Generar secuencia
		setTimeout(() => this.generarSecuencia(), 800)
	}

	generarSecuencia()
	{
		this.secuenciaBotones.length = 0

		this.indiceSecuencia = 0

		for(let i = 0; i < 3 + this.nivel; i++ )
			this.secuenciaBotones.push(Math.floor(Math.random() * 4)) // TODO: Revisar porque puede generar un numero que no es

		this.simon.indicadores[this.nivel].material.color.set(0xFFFF00)

		setTimeout(() => this._iluminarSecuencia(), 500)
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

		let animacionIluminarse = new TWEEN.Tween(frameInicio).to(frameFinal, 250)
			.onStart(() =>{
				this.luzBotones.color = this.animaciones.iluminacionBoton.boton.material.color.clone()
				this.animaciones.iluminacionBoton.boton.add(this.luzBotones)
			})
			.onUpdate(() => {

			})
			.onComplete(() =>
			{
				this.animaciones.iluminacionBoton.boton.remove(this.luzBotones)

				this.animaciones.iluminacionBoton.indiceSecuencia++
				frameInicio.t = 0

				if(this.animaciones.iluminacionBoton.indiceSecuencia < this.secuenciaBotones.length)
				{
					this.animaciones.iluminacionBoton.boton = this.simon.botones[this.secuenciaBotones[this.animaciones.iluminacionBoton.indiceSecuencia]]
					setTimeout(() => this.animaciones.iluminacionBoton.animacion.start(), 325)
				}
				else
				{
					this._animating = false
					setTimeout(() => this.estaJugando = true, 200)
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
		this.animaciones.iluminacionBoton.animacion.repeat(this.secuenciaBotones.length)
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

		let animacionEmpezarPulsar = new TWEEN.Tween(frameInicio).to(frameFinal, 350)
			.onStart(() =>
			{
				this.luzBotones.color = this.animaciones.pulsacionBoton.boton.material.color
				this.animaciones.pulsacionBoton.boton.add(this.luzBotones)
			})
			.onUpdate(() =>
			{
				// TODO: Hay que modificar la escala de un botón hijo
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
				this.animaciones.pulsacionBoton.boton.remove(this.luzBotones)
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

	setCallbackCompletado(callback)
	{
		this.callbackCompletado = callback
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

			this.estaJugando = false

			if(this.nivel === NUM_NIVELES)
			{
				this.completarJuego()
				return
			}

			setTimeout(() => {
				this.generarSecuencia()
			}, 1000)

			return
		}

		// Secuencia Errónea
		this.reset()
	}


	completarJuego()
	{
		console.log("Completado Puzle Simón")

		if (this.callbackCompletado === null)
			return

		this.callbackCompletado()
		this.callbackCompletado = null
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
