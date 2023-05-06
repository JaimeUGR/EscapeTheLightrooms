
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

class Taquilla extends THREE.Object3D
{
	constructor(dimensiones = {
		taquillaX: 15, // x interna
		taquillaY: 20, // y interna
		taquillaZ: 15, // z interna
		taquillaBorde: 2,
		numEstantes: 1,
		estanteY: 1,
		separacionInferiorEstantes: 1,
		puertaZ: 1, // <= borde
		rejillaX: 10, // <= x interna
		rejillaY: 2,
		separacionRejillas: 1,
		separacionSuperiorRejillas: 1
	})
	{
		super()

		this.taquillaX = dimensiones.taquillaX
		this.taquillaY = dimensiones.taquillaY
		this.taquillaZ = dimensiones.taquillaZ
		this.puertaZ = dimensiones.puertaZ

		this.numEstantes = dimensiones.numEstantes
		this.estanteY = dimensiones.estanteY
		this.separacionInferiorEstantes = dimensiones.separacionInferiorEstantes

		this.taquillaBorde = dimensiones.taquillaBorde
		this.rejillaX = dimensiones.rejillaX
		this.rejillaY = dimensiones.rejillaY
		this.separacionRejillas = dimensiones.separacionRejillas
		this.separacionSuperiorRejillas = dimensiones.separacionSuperiorRejillas

		//
		this.estantes = []

		// TODO Material temporal. Luego será la textura de las paredes.
		this.taquillaMaterial = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})

		//
		//
		//

		// Crear la caja de la taquilla
		let geoTaquilla = new THREE.BoxGeometry(this.taquillaX + 2*this.taquillaBorde,
			this.taquillaY + 2*this.taquillaBorde, this.taquillaZ + 2*this.taquillaBorde)
		geoTaquilla.translate(0, this.taquillaY/2 + this.taquillaBorde, 0)

		// Recortar el hueco interno
		let geoHueco = new THREE.BoxGeometry(this.taquillaX, this.taquillaY, this.taquillaZ + this.taquillaBorde)
		geoHueco.translate(0, this.taquillaY/2 + this.taquillaBorde, this.taquillaBorde/2)

		geoTaquilla = new CSG()
			.union([new THREE.Mesh(geoTaquilla, this.taquillaMaterial)])
			.subtract([new THREE.Mesh(geoHueco, null)])
			.toGeometry()

		this.add(new THREE.Mesh(geoTaquilla, this.taquillaMaterial))

		//
		//
		//

		// Colocar la estantería base
		let estante = new THREE.Object3D()
		estante.translateY(this.taquillaBorde)

		this.estantes.push(estante)
		this.add(estante)

		// Colocar las estanterías
		if (this.numEstantes > 1)
		{
			// Calculamos la separación entre los estantes
			let separacionEstantes = (this.taquillaY - this.separacionInferiorEstantes - (this.numEstantes - 1)*this.estanteY)  / this.numEstantes

			// Creamos el estante (mesh)
			estante = this.crearEstante()
			estante.translateY(this.taquillaBorde + this.separacionInferiorEstantes)

			for (let i = 1; i < this.numEstantes; i++)
			{
				estante.translateY(separacionEstantes + this.estanteY)
				this.add(estante)
				this.estantes.push(estante)

				estante = estante.clone()
			}
		}

		//
		//
		//

		// Crear la puerta de la taquilla
		this.puerta = this.crearPuerta() // TODO: este es el mesh que recibe RY para abrir o cerrar

		// Crear el objeto con el mesh de la puerta y trasladarlo
		let puertaObject = new THREE.Object3D()
		puertaObject.add(this.puerta)

		puertaObject.translateX(-this.taquillaX/2)
		puertaObject.translateY(this.taquillaBorde)
		puertaObject.translateZ(-this.puertaZ/2 + this.taquillaZ/2 + this.taquillaBorde)

		this.add(puertaObject)

		//
		// Animación
		//

		this._crearAnimacion()

		//
		// Interacción
		//

		this.puerta.userData.interaction = {
			interact: this._interactuar.bind(this)
		}
	}

	crearEstante()
	{
		let geoEstante = new THREE.BoxGeometry(this.taquillaX, this.estanteY, this.taquillaZ)
		geoEstante.translate(0, -this.estanteY/2, this.taquillaBorde/2)

		return new THREE.Mesh(geoEstante, this.taquillaMaterial)
	}

	crearPuerta()
	{
		let geoPuerta = new THREE.BoxGeometry(this.taquillaX, this.taquillaY, this.puertaZ)
		geoPuerta.translate(0, this.taquillaY/2, 0)

		// Preparar el recorte de huecos
		let csg = new CSG().union([new THREE.Mesh(geoPuerta, this.taquillaMaterial)])

		let geoHueco = new THREE.BoxGeometry(this.rejillaX, this.rejillaY, this.puertaZ)
		geoHueco.translate(0, -this.rejillaY/2, 0)

		// Empezar desde arriba
		geoHueco.translate(0, this.taquillaY - this.separacionSuperiorRejillas, 0)
		csg.subtract([new THREE.Mesh(geoHueco, null)])

		for (let i = 1; i < 3; i++)
		{
			geoHueco.translate(0, -(this.separacionRejillas + this.rejillaY), 0)
			csg.subtract([new THREE.Mesh(geoHueco, null)])
		}

		geoPuerta = csg.toGeometry()
		geoPuerta.translate(this.taquillaX/2, 0, 0)

		return new THREE.Mesh(geoPuerta, this.taquillaMaterial)
	}

	_crearAnimacion()
	{
		this._animating = false
		this._estadoPuerta = 0 // 0 cerrada, 1 abierta

		let frameCerrada = {r: 0}
		let frameAbierta = {r: -Math.PI/2}

		this._animacionAbrir = new TWEEN.Tween(frameCerrada)
			.to(frameAbierta, 1500)
			.onStart(() => {
				this._animating = true
			})
			.onUpdate(() => {
				this.puerta.rotation.y = frameCerrada.r
			})
			.onComplete(() => {
				frameCerrada.r = 0
				this._estadoPuerta = 1
				this._animating = false
			})

		this._animacionCerrar = new TWEEN.Tween(frameAbierta)
			.to(frameCerrada, 1500)
			.onStart(() => {
				this._animating = true
			})
			.onUpdate(() => {
				this.puerta.rotation.y = frameAbierta.r
			})
			.onComplete(() => {
				frameAbierta.r = -Math.PI/2
				this._estadoPuerta = 0
				this._animating = false
			})
	}

	_interactuar(event)
	{
		if (this._animating)
			return

		if (this._estadoPuerta === 0) // Cerrada
			this.abrirPuerta()
		else
			this.cerrarPuerta()
	}

	abrirPuerta()
	{
		this._animacionAbrir.start()
	}

	cerrarPuerta()
	{
		this._animacionCerrar.start()
	}
}

export {Taquilla}
