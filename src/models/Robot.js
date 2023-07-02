/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from '../../libs/CSG-v2.js'

import {GameState} from "../GameState.js"

class Robot extends THREE.Object3D
{
	constructor(gui, dimensiones = {
		cabeza: {
			cabezaX: 4,
			cabezaY: 4,
			cabezaZ: 4,

			deformacionOjoY: 1.2,
			radioOjo: 0.65,
			alturaOjo: 0.2,

			bocaX: 3,
			bocaY: 1,
			bocaZ: 0.2,

			separacionOjos: 0.75,
			separacionBoca: 0.5, // Separación de la boca desde abajo y los ojos desde arriba

			radioCuello: 1.15,
			alturaCuello: 1.25
		},
		tronco: {
			troncoX: 7,
			troncoZ: 5,

			troncoSupY: 5,
			troncoInfY: 3,

			radioPila: GameState.items.pila.radioGrande,//1,
			alturaPila: GameState.items.pila.alturaGrande,//2.5, // Menos que tronco Z

			radioZonaPila: 1,
			levantamientoZonaPila: 0.5, // Este levantamiento también se añade por dentro para que no se vea el fondo
			separacionYZonaPila: 0.5, // NO TOCAR
		},
		brazos: {
			hombroX: 2.5,
			hombroY: 2,
			hombroZ: 3,

			brazoX: 1.5,
			brazoZ: 1.5,

			brazoSupY: 4,
			brazoInfY: 3,

			// NOTA: Todas deben ser mayor que brazoXZ
			unionX: 2,
			unionY: 2,
			unionZ: 2,

			alturaBrazos: 0.8, // 0 a 1 en el tronco Y
		},
		piernas: {
			piernaX: 1.5,
			piernaZ: 1.5,
			piernaSupY: 2,
			piernaInfY: 2,

			pieY: 0.8,
			pieZ: 2.5, // Extensión que incluye la piernaZ

			separacionPiernas: 1, // 0 a 1, desde la mitad del tronco inferior

			// NOTA: Todas deben ser mayor que piernaXZ
			unionX: 2,
			unionY: 2,
			unionZ: 2
		}
	})
	{
		super()

		this.dimCabeza = dimensiones.cabeza
		this.dimTronco = dimensiones.tronco
		this.dimBrazos = dimensiones.brazos
		this.dimPiernas = dimensiones.piernas

		this.elementos = {
			cabeza: {

			},
			troncoSuperior: {

			},
			brazoDerecho: {

			},
			brazoIzquierdo: {

			},
			troncoInferior: {

			},
			piernaDerecha: {

			},
			piernaIzquierda: {

			}
		}

		this.movilidad = {
			cabeza_rX: 0,
			cabeza_rY: 0,
			cabeza_rZ: 0,

			troncoSup_rY: 0,

			brazoDer_rXCodo: 0,
			brazoDer_escSup: 1,
			brazoDer_rYSup: 0,
			brazoDer_rZSup: 0,
			brazoDer_rXInf: 0,
			brazoDer_rZInf: 0,

			brazoIzd_rXCodo: 0,
			brazoIzd_escSup: 1,
			brazoIzd_rYSup: 0,
			brazoIzd_rZSup: 0,
			brazoIzd_rXInf: 0,
			brazoIzd_rZInf: 0,

			troncoInf_rY: 0,

			piernaDer_rXSup: 0,
			piernaDer_rYSup: 0,
			piernaDer_escSup: 1,
			piernaDer_escInf: 1,
			piernaDer_rXInf: 0,
			piernaDer_rZInf: 0,

			piernaIzd_rXSup: 0,
			piernaIzd_rYSup: 0,
			piernaIzd_escSup: 1,
			piernaIzd_escInf: 1,
			piernaIzd_rXInf: 0,
			piernaIzd_rZInf: 0,

			guiControlsEnabled: false,
			animacionContinuaActivada: true,

			reset: () => {
				this.movilidad.cabeza_rX = 0
				this.movilidad.cabeza_rY = 0
				this.movilidad.cabeza_rZ = 0

				this.movilidad.troncoSup_rY = 0

				this.movilidad.brazoDer_rXCodo = 0
				this.movilidad.brazoDer_escSup = 1
				this.movilidad.brazoDer_rYSup = 0
				this.movilidad.brazoDer_rZSup = 0
				this.movilidad.brazoDer_rXInf = 0
				this.movilidad.brazoDer_rZInf = 0

				this.movilidad.brazoIzd_rXCodo = 0
				this.movilidad.brazoIzd_escSup = 1
				this.movilidad.brazoIzd_rYSup = 0
				this.movilidad.brazoIzd_rZSup = 0
				this.movilidad.brazoIzd_rXInf = 0
				this.movilidad.brazoIzd_rZInf = 0

				this.movilidad.troncoInf_rY = 0

				this.movilidad.piernaDer_rXSup = 0
				this.movilidad.piernaDer_rYSup = 0
				this.movilidad.piernaDer_escSup = 1
				this.movilidad.piernaDer_escInf = 1
				this.movilidad.piernaDer_rXInf = 0
				this.movilidad.piernaDer_rZInf = 0

				this.movilidad.piernaIzd_rXSup = 0
				this.movilidad.piernaIzd_rYSup = 0
				this.movilidad.piernaIzd_escSup = 1
				this.movilidad.piernaIzd_escInf = 1
				this.movilidad.piernaIzd_rXInf = 0
				this.movilidad.piernaIzd_rZInf = 0
			}
		}

		// Animación
		this.animaciones = {}

		//
		// Materiales
		//

		const txLoader = GameState.txLoader

		let texturaPrincipal = txLoader.load("../../resources/textures/models/metal-gris.jpg")
		this.materialPrincipal = new THREE.MeshLambertMaterial({map: texturaPrincipal})

		let texturaSecundaria = txLoader.load("../../resources/textures/models/metal-negro.jpg")
		this.materialSecundario = new THREE.MeshLambertMaterial({map: texturaSecundaria})

		let texturaOjos = txLoader.load("../../resources/textures/models/plastico.jpg")
		this.materialOjos = new THREE.MeshLambertMaterial({map: texturaOjos, color: 0xe8583f})
		this.materialBoca = new THREE.MeshLambertMaterial({map: texturaSecundaria})

		//
		// Modelado
		//

		//
		// TRONCO INFERIOR
		//

		let geoTroncoInferior = new THREE.BoxGeometry(this.dimTronco.troncoX, this.dimTronco.troncoInfY, this.dimTronco.troncoZ)
		geoTroncoInferior.translate(0, -this.dimTronco.troncoInfY/2, 0)

		this.troncoInferior = new THREE.Mesh(geoTroncoInferior, this.materialPrincipal)

		// PIERNA
		{
			let O3Pierna = new THREE.Object3D()
			O3Pierna.name = "O3P"

			let geoPiernaSup = new THREE.BoxGeometry(this.dimPiernas.piernaX, this.dimPiernas.piernaSupY, this.dimPiernas.piernaZ)
			geoPiernaSup.translate(0, -this.dimPiernas.piernaSupY/2, 0)

			let meshPiernaSup = new THREE.Mesh(geoPiernaSup, this.materialPrincipal)
			meshPiernaSup.name = "MPS"
			// Libertad -> Escalado pierna superior
			// meshPiernaSup.scale.y = 1

			let geoUnion = new THREE.BoxGeometry(this.dimPiernas.unionX, this.dimPiernas.unionY, this.dimPiernas.unionZ)

			// NOTE: Trasladar hacia abajo el escalado de la pierna
			let meshUnion = new THREE.Mesh(geoUnion, this.materialSecundario)
			meshUnion.name = "MU"
			meshUnion.position.y = -meshPiernaSup.scale.y * this.dimPiernas.piernaSupY

			let O3PiernaInf = new THREE.Object3D()
			O3PiernaInf.name = "O3PI"
			// Libertad -> Rotación XZ
			// meshPiernaInf.rotation.x = 0
			// meshPiernaInf.rotation.z = 0

			let geoPiernaInf = new THREE.BoxGeometry(this.dimPiernas.piernaX, this.dimPiernas.piernaInfY, this.dimPiernas.piernaZ)
			geoPiernaInf.translate(0, -this.dimPiernas.piernaInfY/2, 0)

			let meshPiernaInf = new THREE.Mesh(geoPiernaInf, this.materialPrincipal)
			meshPiernaInf.name = "MPI"
			// Libertad -> Escalado pierna inferior
			// meshPiernaInf.scale.y = 1


			let geoPie = new THREE.BoxGeometry(this.dimPiernas.piernaX, this.dimPiernas.pieY, this.dimPiernas.pieZ)
			geoPie.translate(0, -this.dimPiernas.pieY/2, this.dimPiernas.pieZ/2 - this.dimPiernas.piernaZ/2)

			// NOTE: Trasladar el escalado del pie inferior
			let meshPie = new THREE.Mesh(geoPie, this.materialSecundario)
			meshPie.name = "MP"

			O3PiernaInf.add(meshPie)
			O3PiernaInf.add(meshPiernaInf)

			meshUnion.add(O3PiernaInf)

			O3Pierna.add(meshPiernaSup)
			O3Pierna.add(meshUnion)
			// Libertad -> Rotación X Y de la pierna
			// O3Pierna.rotation.x = -Math.PI/2
			// O3Pierna.rotation.y = 0

			// NOTE: Recordar que la unión no aporta altura (se suman las alturas de las piernas)
			// Añadir la pierna
			O3Pierna.position.y = -this.dimTronco.troncoInfY

			// Pierna derecha
			let separacionPiernas = (this.dimTronco.troncoZ/2 - this.dimPiernas.piernaZ/2)*this.dimPiernas.separacionPiernas
			O3Pierna.position.x += -separacionPiernas

			this.piernaDerecha = O3Pierna
			this.troncoInferior.add(this.piernaDerecha)

			// Añadir los elementos para los grados de libertad
			this.elementos.piernaDerecha.O3P = this.piernaDerecha
			this.elementos.piernaDerecha.MPS = this.piernaDerecha.getObjectByName("MPS")
			this.elementos.piernaDerecha.MU = this.piernaDerecha.getObjectByName("MU")
			this.elementos.piernaDerecha.O3PI = this.piernaDerecha.getObjectByName("O3PI")
			this.elementos.piernaDerecha.MPI = this.piernaDerecha.getObjectByName("MPI")
			this.elementos.piernaDerecha.MP = this.piernaDerecha.getObjectByName("MP")

			// Pierna Izquierda
			this.piernaIzquierda = O3Pierna.clone(true)
			this.piernaIzquierda.position.x *= -1
			this.troncoInferior.add(this.piernaIzquierda)

			// Añadir los elementos para los grados de libertad
			this.elementos.piernaIzquierda.O3P = this.piernaIzquierda
			this.elementos.piernaIzquierda.MPS = this.piernaIzquierda.getObjectByName("MPS")
			this.elementos.piernaIzquierda.MU = this.piernaIzquierda.getObjectByName("MU")
			this.elementos.piernaIzquierda.O3PI = this.piernaIzquierda.getObjectByName("O3PI")
			this.elementos.piernaIzquierda.MPI = this.piernaIzquierda.getObjectByName("MPI")
			this.elementos.piernaIzquierda.MP = this.piernaIzquierda.getObjectByName("MP")
		}

		//
		// TRONCO SUPERIOR
		//

		let geoTroncoSuperior = new THREE.BoxGeometry(this.dimTronco.troncoX, this.dimTronco.troncoSupY, this.dimTronco.troncoZ)
		geoTroncoSuperior.translate(0, this.dimTronco.troncoSupY/2, 0)

		// Recorte de la zona de la pila
		let alturaZonaPila = (this.dimTronco.troncoSupY - 2*this.dimTronco.radioZonaPila)*this.dimTronco.separacionYZonaPila + this.dimTronco.radioZonaPila
		let geoZonaPila = new THREE.CylinderGeometry(this.dimTronco.radioZonaPila, this.dimTronco.radioZonaPila, 2*this.dimTronco.levantamientoZonaPila + this.dimTronco.alturaPila, 15)

		geoZonaPila.rotateX(Math.PI/2)
		geoZonaPila.translate(0,
			alturaZonaPila,
			this.dimTronco.troncoZ/2 + this.dimTronco.levantamientoZonaPila/2 - (this.dimTronco.alturaPila/2 + this.dimTronco.separacionYZonaPila))

		let geoPilaRecorte = new THREE.CylinderGeometry(this.dimTronco.radioPila, this.dimTronco.radioPila, this.dimTronco.alturaPila + this.dimTronco.levantamientoZonaPila, 10)
		geoPilaRecorte.rotateX(Math.PI/2)

		// NOTA: Luego hay que trasladarla en la Z el levantamiento de la zona y volver a recortar
		geoPilaRecorte.translate(0, alturaZonaPila, this.dimTronco.troncoZ/2 + this.dimTronco.levantamientoZonaPila/2 - this.dimTronco.alturaPila/2)

		// TODO: Poner el material del robot aquí
		let csg = new CSG().union([new THREE.Mesh(geoTroncoSuperior, this.materialPrincipal)])
			.subtract([new THREE.Mesh(geoZonaPila, null), new THREE.Mesh(geoPilaRecorte, null)])

		this.troncoSuperior = csg.toMesh()

		// TODO: Poner el material de la zona interna de la pila
		csg = new CSG().union([new THREE.Mesh(geoZonaPila, this.materialSecundario)])
			.subtract([new THREE.Mesh(geoPilaRecorte, null)])

		this.zonaPila = csg.toMesh()

		let O3Pila = new THREE.Object3D()
		O3Pila.position.set(0, alturaZonaPila, this.dimTronco.troncoZ/2 - this.dimTronco.alturaPila/2)

		//
		// NOTE: AÑADIR PILA
		//
		// Note: A la hora de añadir la pila, meterla a este mesh. Tiene que estar centrada y rotada mirando para el eje Z la cabeza
		/*let pilaTMP = new THREE.CylinderGeometry(this.dimTronco.radioPila, this.dimTronco.radioPila, this.dimTronco.alturaPila)
		pilaTMP.rotateX(Math.PI/2)

		O3Pila.add(new THREE.Mesh(pilaTMP, new THREE.MeshBasicMaterial()))*/

		this.O3Pila = O3Pila
		this.zonaPila.add(O3Pila)
		this.troncoSuperior.add(this.zonaPila)

		// Brazos
		{
			let geoHombro = new THREE.BoxGeometry(this.dimBrazos.hombroX, this.dimBrazos.hombroY, this.dimBrazos.hombroZ)

			let O3Brazo = new THREE.Mesh(geoHombro, this.materialSecundario)
			O3Brazo.name = "O3B"
			// Libertad -> Rotación codo
			// O3Brazo.rotation.x = 0

			let geoBrazoSup = new THREE.BoxGeometry(this.dimBrazos.brazoX, this.dimBrazos.brazoSupY, this.dimBrazos.brazoZ)
			geoBrazoSup.translate(0, -this.dimBrazos.brazoSupY/2, 0)

			let meshBrazoSup = new THREE.Mesh(geoBrazoSup, this.materialPrincipal)
			meshBrazoSup.name = "MBS"
			// Libertad -> Escalado brazo sup
			// meshBrazoSup.scale.y = 1

			let O3BrazoSup = new THREE.Object3D()
			O3BrazoSup.name = "O3BS"
			// Libertad -> Rotación en YZ del brazo sup
			// O3BrazoSup.rotation.y = 0
			// O3BrazoSup.rotation.z = 0

			O3BrazoSup.add(meshBrazoSup)

			let geoUnion = new THREE.BoxGeometry(this.dimBrazos.unionX, this.dimBrazos.unionY, this.dimBrazos.unionZ)
			let meshUnion = new THREE.Mesh(geoUnion, this.materialSecundario)
			meshUnion.name = "MU"
			// TODO: Libertad -> Traslación hacia abajo por el escalado
			meshUnion.position.y = -this.dimBrazos.brazoSupY*meshBrazoSup.scale.y

			O3BrazoSup.add(meshUnion)

			let geoBrazoInf = new THREE.BoxGeometry(this.dimBrazos.brazoX, this.dimBrazos.brazoInfY, this.dimBrazos.brazoZ)
			geoBrazoInf.translate(0, -this.dimBrazos.brazoInfY/2, 0)

			let meshBrazoInf = new THREE.Mesh(geoBrazoInf, this.materialPrincipal)
			meshBrazoInf.name = "MBI"
			// Libertad -> Rotación X
			// meshBrazoInf.rotation.x = 0

			// TODO: GEOMANO

			meshUnion.add(meshBrazoInf)
			O3Brazo.add(O3BrazoSup)

			// Poner los brazos
			let alturaBrazo = (this.dimTronco.troncoSupY - this.dimBrazos.hombroY)*this.dimBrazos.alturaBrazos + this.dimBrazos.hombroY/2
			O3Brazo.position.y = alturaBrazo

			// Brazo Derecho
			O3Brazo.position.x = -(this.dimTronco.troncoX/2 + this.dimBrazos.hombroX/2)

			this.brazoDerecho = O3Brazo
			this.troncoSuperior.add(this.brazoDerecho)

			// Añadir los elementos para los grados de libertad
			this.elementos.brazoDerecho.O3B = this.brazoDerecho
			this.elementos.brazoDerecho.O3BS = this.brazoDerecho.getObjectByName("O3BS")
			this.elementos.brazoDerecho.MBS = this.brazoDerecho.getObjectByName("MBS")
			this.elementos.brazoDerecho.MU = this.brazoDerecho.getObjectByName("MU")
			this.elementos.brazoDerecho.MBI = this.brazoDerecho.getObjectByName("MBI")

			// Brazo Izquierdo
			this.brazoIzquierdo = O3Brazo.clone(true)
			this.brazoIzquierdo.position.x *= -1
			this.troncoSuperior.add(this.brazoIzquierdo)

			// Añadir los elementos para los grados de libertad
			this.elementos.brazoIzquierdo.O3B = this.brazoIzquierdo
			this.elementos.brazoIzquierdo.O3BS = this.brazoIzquierdo.getObjectByName("O3BS")
			this.elementos.brazoIzquierdo.MBS = this.brazoIzquierdo.getObjectByName("MBS")
			this.elementos.brazoIzquierdo.MU = this.brazoIzquierdo.getObjectByName("MU")
			this.elementos.brazoIzquierdo.MBI = this.brazoIzquierdo.getObjectByName("MBI")
		}

		// Cabeza
		{
			let geoCuello = new THREE.CylinderGeometry(this.dimCabeza.radioCuello, this.dimCabeza.radioCuello, 2*this.dimCabeza.alturaCuello, 20)
			geoCuello.translate(0, 0, 0)

			let geoCabeza = new THREE.BoxGeometry(this.dimCabeza.cabezaX, this.dimCabeza.cabezaY, this.dimCabeza.cabezaZ)
			geoCabeza.translate(0, this.dimCabeza.cabezaY/2 + this.dimCabeza.alturaCuello, 0)

			let geoBoca = new THREE.BoxGeometry(this.dimCabeza.bocaX, this.dimCabeza.bocaY, this.dimCabeza.bocaZ)
			geoBoca.translate(0, this.dimCabeza.bocaY/2 + this.dimCabeza.separacionBoca + this.dimCabeza.alturaCuello, this.dimCabeza.cabezaZ/2 + this.dimCabeza.bocaZ/2)

			let geoOjo = new THREE.CylinderGeometry(this.dimCabeza.radioOjo, this.dimCabeza.radioOjo, this.dimCabeza.alturaOjo, 25)
			geoOjo.rotateX(Math.PI/2)
			geoOjo.scale(1, this.dimCabeza.deformacionOjoY, 1)
			geoOjo.translate(0,
				-this.dimCabeza.radioOjo/2 - this.dimCabeza.separacionOjos + this.dimCabeza.alturaCuello
				+ this.dimCabeza.cabezaY,
				this.dimCabeza.cabezaZ/2 + this.dimCabeza.alturaOjo/2)

			let geoOjoIzda = geoOjo.clone()
			geoOjoIzda.translate(-this.dimCabeza.cabezaX/4, 0, 0)

			let geoOjoDcha = geoOjo.clone()
			geoOjoDcha.translate(this.dimCabeza.cabezaX/4, 0, 0)

			let meshCabeza = new THREE.Mesh(geoCabeza, this.materialPrincipal)
			meshCabeza.add(new THREE.Mesh(geoBoca, this.materialBoca))
			meshCabeza.add(new THREE.Mesh(geoOjoIzda, this.materialOjos))
			meshCabeza.add(new THREE.Mesh(geoOjoDcha, this.materialOjos))

			let meshCuello = new THREE.Mesh(geoCuello, this.materialSecundario)

			let O3Cabeza = new THREE.Object3D()
			// Libertad -> Rotación en Y X Z
			// O3Cabeza.rotation.x = 0
			// O3Cabeza.rotation.y = 0
			// O3Cabeza.rotation.z = 0

			O3Cabeza.add(meshCabeza)
			O3Cabeza.add(meshCuello)

			O3Cabeza.position.y = this.dimTronco.troncoSupY

			this.elementos.cabeza = O3Cabeza

			this.troncoSuperior.add(O3Cabeza)
		}

		//
		//
		//

		// Libertad -> Rotación Y
		// this.troncoSuperior.rotation.y = 0
		// this.troncoInferior.rotation.y = 0

		this.add(this.troncoSuperior)
		this.add(this.troncoInferior)

		this.elementos.troncoSuperior = this.troncoSuperior
		this.elementos.troncoInferior = this.troncoInferior

		// Subirlo los troncos por encima de los ejes
		let alturaTroncoInferior = this.dimTronco.troncoInfY + this.dimPiernas.piernaSupY
			+ this.dimPiernas.piernaInfY + this.dimPiernas.pieY

		this.troncoSuperior.translateY(alturaTroncoInferior)
		this.troncoInferior.translateY(alturaTroncoInferior)

		// Para que todos los elementos estén bien posicionados
		this._movementUpdate()

		//
		// Sonidos
		//

		this._crearSonidos()

		//
		// Animación
		//
		this._crearAnimacionContinua()

		this.animacionContinuaActivada = true
		this.enAnimacionContinua = false
		this.esperaAnimacion = 30000 // EN MS

		this._crearAnimacionPila()

		//
		// Interacción
		//

		let metodoInteraccion = (event) => {
			if (!GameState.flags.tienePila)
				return

			if (this.enAnimacionContinua)
				return

			// Mecanismo de seguridad
			this.animaciones.animacionContinua.stop()
			this.animacionContinuaActivada = false

			GameState.flags.tienePila = false

			this.O3Pila.add(GameState.items.pila)
			this.animaciones.colocarPila.start()
		}

		this.zonaPila.userData.interaction = {
			interact: metodoInteraccion
		}

		// DEBUG
		/*this.axis = new THREE.AxesHelper (10);
		this.add (this.axis)*/

		this.createGUI(gui)
	}

	_crearSonidos()
	{
		this._sonidos = {}

		GameState.systems.sound.loadGlobalSound("../../resources/sounds/doorUnlock.wav", (audio) => {
			this._sonidos.desbloquear = audio
			audio.setPlaybackRate(1.1)
			audio.setVolume(0.2)
		})
	}

	_crearAnimacionPila()
	{
		let frameInicio = { rX: 0 }
		let framePilaGirada = {
			rX: Math.PI/2,
			tZ: 2*this.dimTronco.alturaPila
		}
		let framePilaColocada = { tZ:  0 }

		let animacionGirarPila = new TWEEN.Tween(frameInicio).to(framePilaGirada, 600)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onStart(() => {
				GameState.items.pila.position.z = 2*this.dimTronco.alturaPila
			})
			.onUpdate(() => {
				GameState.items.pila.rotation.x = frameInicio.rX
			})

		let animacionMeterPila = new TWEEN.Tween(framePilaGirada).to(framePilaColocada, 1200)
			.onUpdate(() => {
				GameState.items.pila.position.z = framePilaGirada.tZ
			})
			.onComplete(() => {
				this.materialOjos.color.setHex(0x33aa33)
				console.log("El robot está feliz porque tiene la pila")
			})

		//
		// Animación indicación
		//

		let frameTroncoInf_I = {rY: 0}
		let frameTroncoInf_F = {rY: -Math.PI/2 + 0.02}

		let frameTroncoSup_I = {rY: 0}
		let frameTroncoSup_F = {rY: -Math.PI/2 + 0.02}

		let animacionGirarTroncoInf = new TWEEN.Tween(frameTroncoInf_I).to(frameTroncoInf_F, 1000)
			.onUpdate(() => {
				this.troncoInferior.rotation.y = frameTroncoInf_I.rY
			})

		let animacionGirarTroncoSup = new TWEEN.Tween(frameTroncoSup_I).to(frameTroncoSup_F, 1000)
			.onUpdate(() => {
				this.troncoSuperior.rotation.y = frameTroncoSup_I.rY
			})

		let frameBrazoAbajo = {rX: 0}
		let frameBrazoArriba = {rX: -76 / 180 * Math.PI}

		let animacionGirarBrazo = new TWEEN.Tween(frameBrazoAbajo).to(frameBrazoArriba, 1000)
			.onUpdate(() => {
				this.brazoDerecho.rotation.x = frameBrazoAbajo.rX
			})

		let frameBrazoAlargar_I = {sY: 1}
		let frameBrazoAlargar_F = {sY: 9.5}

		let animacionDesalargarBrazo = new TWEEN.Tween(frameBrazoAlargar_F).to(frameBrazoAlargar_I, 1000)
			.onUpdate(() => {
				this.elementos.brazoDerecho.MBS.scale.y = frameBrazoAlargar_F.sY
				this.elementos.brazoDerecho.MU.position.y = -this.dimBrazos.brazoSupY*frameBrazoAlargar_F.sY
			})

		let animacionAlargarBrazo = new TWEEN.Tween(frameBrazoAlargar_I).to(frameBrazoAlargar_F, 1000)
			.onUpdate(() => {
				this.elementos.brazoDerecho.MBS.scale.y = frameBrazoAlargar_I.sY
				this.elementos.brazoDerecho.MU.position.y = -this.dimBrazos.brazoSupY*frameBrazoAlargar_I.sY
			})
			.onComplete(() => {
				frameBrazoAlargar_I.sY = 1

				setTimeout(() => {
					animacionDesalargarBrazo.start()
				}, 1500)

				// NOTE: Desbloquear la puerta
				GameState.flags.robotConPila = true
				this._sonidos.desbloquear.play()
			})

		animacionGirarPila.chain(animacionMeterPila)
		animacionMeterPila.chain(animacionGirarTroncoInf)
		animacionGirarTroncoInf.chain(animacionGirarTroncoSup)
		animacionGirarTroncoSup.chain(animacionGirarBrazo)
		animacionGirarBrazo.chain(animacionAlargarBrazo)

		this.animaciones.colocarPila = animacionGirarPila
	}

	_crearAnimacionContinua()
	{
		let frameCabezaArriba = {rX: 0}
		let frameCabezaAbajo = {rX: Math.PI/6}

		let frameLevantarBrazo = {rX: 0}
		let frameBrazoLevantado = {rX: -Math.PI/2}

		let frameBrazoSupNoEscalado = {sY: 1}
		let frameBrazoSupEscalado = {sY: 1.75}

		let frameBrazoInfNoRotado = {rZ: 0}
		let frameBrazoInfRotado = {rZ: Math.PI/2}

		let frameBrazoDerechoArriba = {rZInf: Math.PI/2, rXSup: -Math.PI/2, sYSup: 1.75}
		let frameBrazoDerechoAbajo = {rZInf: 0, rXSup: 0, sYSup: 1}

		let frameBrazoIzquierdoAbajo = {rXBrazo: 0, rXPierna: 0}
		let frameBrazoIzquierdoArriba = {rXBrazo: -3*Math.PI/4, rXPierna: -Math.PI/3}

		let frameNoDecepcionado = {rXBrazo: -3*Math.PI/4, rXPierna: -Math.PI/3, rXCabeza: 0}
		let frameDecepcionado = {rXBrazo: 0, rXPierna: 0, rXCabeza: Math.PI/6}

		let animacionBajarCabeza = new TWEEN.Tween(frameCabezaArriba).to(frameCabezaAbajo, 1000)
			.onStart(() => {
				// POR SEGURIDAD
				this.movilidad.reset()
				this._movementUpdate()
			})
			.onUpdate(() => {
				this.elementos.cabeza.rotation.x = frameCabezaArriba.rX
			})
			.onComplete(() => {
				frameCabezaArriba.rX = 0
			})

		let animacionLevantarBrazo = new TWEEN.Tween(frameLevantarBrazo).to(frameBrazoLevantado, 1000)
			.onUpdate(() => {
				this.elementos.brazoDerecho.O3B.rotation.x = frameLevantarBrazo.rX
			})
			.onComplete(() => {
				frameLevantarBrazo.rX = 0
			})

		let animacionEscalarBrazoSup = new TWEEN.Tween(frameBrazoSupNoEscalado).to(frameBrazoSupEscalado, 800)
			.onUpdate(() => {
				this.elementos.brazoDerecho.MBS.scale.y = frameBrazoSupNoEscalado.sY
				this.elementos.brazoDerecho.MU.position.y = -this.dimBrazos.brazoSupY*this.elementos.brazoDerecho.MBS.scale.y
			})
			.onComplete(() => {
				frameBrazoSupNoEscalado.sY = 1
			})

		let animacionRotarBrazoInf = new TWEEN.Tween(frameBrazoInfNoRotado).to(frameBrazoInfRotado, 500)
			.onUpdate(() => {
				this.elementos.brazoDerecho.MBI.rotation.z = frameBrazoInfNoRotado.rZ
			})
			.onComplete(() => {
				frameBrazoInfNoRotado.rZ = 0
			})
			.yoyo(true)
			.repeat(4)

		let animacionSubirCabeza = new TWEEN.Tween(frameCabezaAbajo).to(frameCabezaArriba, 800)
			.onUpdate(() => {
				this.elementos.cabeza.rotation.x = frameCabezaAbajo.rX
			})
			.onComplete(() => {
				frameCabezaAbajo.rX = Math.PI/6
			})

		let animacionBajarBrazoDerecho = new TWEEN.Tween(frameBrazoDerechoArriba).to(frameBrazoDerechoAbajo, 900)
			.onUpdate(() => {
				this.elementos.brazoDerecho.O3B.rotation.x = frameBrazoDerechoArriba.rXSup

				this.elementos.brazoDerecho.MBS.scale.y = frameBrazoDerechoArriba.sYSup
				this.elementos.brazoDerecho.MU.position.y = -this.dimBrazos.brazoSupY*this.elementos.brazoDerecho.MBS.scale.y

				this.elementos.brazoDerecho.MBI.rotation.z = frameBrazoDerechoArriba.rZInf
			})
			.onComplete(() => {
				frameBrazoDerechoArriba.rZInf = Math.PI/2
				frameBrazoDerechoArriba.rXSup = -Math.PI/2
				frameBrazoDerechoArriba.sYSup = 1.75
			})

		let animacionMenearBrazoIzquierdo = new TWEEN.Tween(frameBrazoIzquierdoAbajo).to(frameBrazoIzquierdoArriba, 400)
			.onUpdate(() => {
				this.elementos.brazoIzquierdo.O3B.rotation.x = frameBrazoIzquierdoAbajo.rXBrazo
				this.elementos.piernaDerecha.O3P.rotation.x = frameBrazoIzquierdoAbajo.rXPierna
			})
			.onComplete(() => {
				frameBrazoIzquierdoAbajo.rXBrazo = 0
				frameBrazoIzquierdoAbajo.rXPierna = 0
			})
			.yoyo(true)
			.repeat(4)

		let animacionDecepcionarse = new TWEEN.Tween(frameNoDecepcionado).to(frameDecepcionado, 1250)
			.onUpdate(() => {
				this.elementos.brazoIzquierdo.O3B.rotation.x = frameNoDecepcionado.rXBrazo
				this.elementos.piernaDerecha.O3P.rotation.x = frameNoDecepcionado.rXPierna
				this.elementos.cabeza.rotation.x = frameNoDecepcionado.rXCabeza
			})
			.onComplete(() => {
				frameNoDecepcionado.rXBrazo = -3*Math.PI/4
				frameNoDecepcionado.rXPierna = -Math.PI/3
				frameNoDecepcionado.rXCabeza = 0
			})

		//
		let frameDepresionInicia_I = {rY: 0}
		let frameDepresionInicia_F = {rY: -Math.PI/6}
		let frameDepresion_I = {rY: -Math.PI/6}
		let frameDepresion_F = {rY: Math.PI/6}
		let frameDepresionTermina_I = {rY: Math.PI/6}
		let frameDepresionTermina_F = {rY: 0}
		let frameTerminar_I = {rX: Math.PI/6}
		let frameTerminar_F = {rX: 0}

		let animacionDepresionInicia = new TWEEN.Tween(frameDepresionInicia_I).to(frameDepresionInicia_F, 250)
			.onUpdate(() => {
				this.elementos.cabeza.rotation.y = frameDepresionInicia_I.rY
			})
			.onComplete(() => {
				frameDepresionInicia_I.rY = 0
			})

		let animacionDepresion = new TWEEN.Tween(frameDepresion_I).to(frameDepresion_F, 550)
			.onUpdate(() => {
				this.elementos.cabeza.rotation.y = frameDepresion_I.rY
			})
			.onComplete(() => {
				frameDepresion_I.rY = -Math.PI/6
			})
			.yoyo(true)
			.repeat(4)

		let animacionTerminarDepresion = new TWEEN.Tween(frameDepresionTermina_I).to(frameDepresionTermina_F, 250)
			.onUpdate(() => {
				this.elementos.cabeza.rotation.y = frameDepresionTermina_I.rY
			})
			.onComplete(() => {
				frameDepresionTermina_I.rY = Math.PI/6
			})

		let animacionTerminar = new TWEEN.Tween(frameTerminar_I).to(frameTerminar_F, 1000)
			.onUpdate(() => {
				this.elementos.cabeza.rotation.x = frameTerminar_I.rX
			})
			.onComplete(() => {
				frameTerminar_I.rX = Math.PI/6

				this._completarAnimacionContinua()
			})

		// CHAINS
		animacionBajarCabeza.chain(animacionLevantarBrazo)
		animacionLevantarBrazo.chain(animacionEscalarBrazoSup)
		animacionEscalarBrazoSup.chain(animacionRotarBrazoInf)
		animacionRotarBrazoInf.chain(animacionSubirCabeza)
		animacionSubirCabeza.chain(animacionBajarBrazoDerecho)
		animacionBajarBrazoDerecho.chain(animacionMenearBrazoIzquierdo)
		animacionMenearBrazoIzquierdo.chain(animacionDecepcionarse)
		animacionDecepcionarse.chain(animacionDepresionInicia)
		animacionDepresionInicia.chain(animacionDepresion)
		animacionDepresion.chain(animacionTerminarDepresion)
		animacionTerminarDepresion.chain(animacionTerminar)

		this.animaciones.animacionContinua = animacionBajarCabeza
	}

	// TODO: Debe ser llamado una vez para iniciar
	iniciaAnimacionContinua()
	{
		if (this.enAnimacionContinua || !this.animacionContinuaActivada)
			return

		this.enAnimacionContinua = true
		this.animaciones.animacionContinua.start()
	}

	_completarAnimacionContinua()
	{
		this.enAnimacionContinua = false

		if (this.animacionContinuaActivada)
			setTimeout(this.iniciaAnimacionContinua.bind(this), this.esperaAnimacion)
	}

	createGUI(gui)
	{
		// Se crea una sección para los controles de la caja
		const folder = gui.addFolder ("Robot")

		//
		// Control animación continua
		//
		folder.add(this.movilidad, 'animacionContinuaActivada').name('Animate: ').onChange((value) => {
			this.animacionContinuaActivada = this.movilidad.animacionContinuaActivada
		})

		this.movilidad.iniciarAnimacionContinua = () => this.iniciaAnimacionContinua()
		folder.add (this.movilidad, 'iniciarAnimacionContinua').name ('[ START ANIMATION ]')

		//
		// Control grados de libertad
		//
		folder.add(this.movilidad, 'guiControlsEnabled').name('Manual Control: ').listen()
		folder.add (this.movilidad, 'reset').name ('[ RESET ]')
		folder.add(this.movilidad, 'cabeza_rX', -Math.PI, Math.PI, 0.1).name('cabeza_rX: ').listen()
		folder.add(this.movilidad, 'cabeza_rY', -Math.PI, Math.PI, 0.1).name('cabeza_rY: ').listen()
		folder.add(this.movilidad, 'cabeza_rZ', -Math.PI, Math.PI, 0.1).name('cabeza_rZ: ').listen()

		folder.add(this.movilidad, 'troncoSup_rY', -Math.PI, Math.PI, 0.1).name('troncoSup_rY: ').listen()

		folder.add(this.movilidad, 'brazoDer_rXCodo', -Math.PI, Math.PI, 0.1).name('brazoDer_rXCodo: ').listen()
		folder.add(this.movilidad, 'brazoDer_escSup', 0, 4, 0.1).name('brazoDer_escSup: ').listen()
		folder.add(this.movilidad, 'brazoDer_rYSup', -Math.PI, Math.PI, 0.1).name('brazoDer_rYSup: ').listen()
		folder.add(this.movilidad, 'brazoDer_rZSup', -Math.PI, Math.PI, 0.1).name('brazoDer_rZSup: ').listen()
		folder.add(this.movilidad, 'brazoDer_rXInf', -Math.PI, Math.PI, 0.1).name('brazoDer_rXInf: ').listen()
		folder.add(this.movilidad, 'brazoDer_rZInf', -Math.PI, Math.PI, 0.1).name('brazoDer_rZInf: ').listen()

		folder.add(this.movilidad, 'brazoIzd_rXCodo', -Math.PI, Math.PI, 0.1).name('brazoIzd_rXCodo: ').listen()
		folder.add(this.movilidad, 'brazoIzd_escSup', 0, 4, 0.1).name('brazoIzd_escSup: ').listen()
		folder.add(this.movilidad, 'brazoIzd_rYSup', -Math.PI, Math.PI, 0.1).name('brazoIzd_rYSup: ').listen()
		folder.add(this.movilidad, 'brazoIzd_rZSup', -Math.PI, Math.PI, 0.1).name('brazoIzd_rZSup: ').listen()
		folder.add(this.movilidad, 'brazoIzd_rXInf', -Math.PI, Math.PI, 0.1).name('brazoIzd_rXInf: ').listen()
		folder.add(this.movilidad, 'brazoIzd_rZInf', -Math.PI, Math.PI, 0.1).name('brazoIzd_rZInf: ').listen()

		folder.add(this.movilidad, 'troncoInf_rY', -Math.PI, Math.PI, 0.1).name('troncoInf_rY: ').listen()

		folder.add(this.movilidad, 'piernaDer_rXSup', -Math.PI, Math.PI, 0.1).name('piernaDer_rXSup: ').listen()
		folder.add(this.movilidad, 'piernaDer_rYSup', -Math.PI, Math.PI, 0.1).name('piernaDer_rYSup: ').listen()
		folder.add(this.movilidad, 'piernaDer_escSup', 0, 4, 0.1).name('piernaDer_escSup: ').listen()
		folder.add(this.movilidad, 'piernaDer_escInf', 0, 4, 0.1).name('piernaDer_escInf: ').listen()
		folder.add(this.movilidad, 'piernaDer_rXInf', -Math.PI, Math.PI, 0.1).name('piernaDer_rXInf: ').listen()
		folder.add(this.movilidad, 'piernaDer_rZInf', -Math.PI, Math.PI, 0.1).name('piernaDer_rZInf: ').listen()

		folder.add(this.movilidad, 'piernaIzd_rXSup', -Math.PI, Math.PI, 0.1).name('piernaIzd_rXSup: ').listen()
		folder.add(this.movilidad, 'piernaIzd_rYSup', -Math.PI, Math.PI, 0.1).name('piernaIzd_rYSup: ').listen()
		folder.add(this.movilidad, 'piernaIzd_escSup', 0, 4, 0.1).name('piernaIzd_escSup: ').listen()
		folder.add(this.movilidad, 'piernaIzd_escInf', 0, 4, 0.1).name('piernaIzd_escInf: ').listen()
		folder.add(this.movilidad, 'piernaIzd_rXInf', -Math.PI, Math.PI, 0.1).name('piernaIzd_rXInf: ').listen()
		folder.add(this.movilidad, 'piernaIzd_rZInf', -Math.PI, Math.PI, 0.1).name('piernaIzd_rZInf: ').listen()
	}

	update()
	{
		// Ignorar el control manual si no estamos en modo gui o en animación
		// TODO: Si añadimos más animaciones incluir un estado animating
		if (!this.movilidad.guiControlsEnabled || this.enAnimacionContinua)
			return

		this._movementUpdate()
	}

	_movementUpdate()
	{
		this.elementos.cabeza.rotation.x = this.movilidad.cabeza_rX
		this.elementos.cabeza.rotation.y = this.movilidad.cabeza_rY
		this.elementos.cabeza.rotation.z = this.movilidad.cabeza_rZ

		this.troncoInferior.rotation.y = this.movilidad.troncoInf_rY
		this.troncoSuperior.rotation.y = this.movilidad.troncoSup_rY

		// BRAZOS
		this.elementos.brazoDerecho.O3B.rotation.x = this.movilidad.brazoDer_rXCodo
		this.elementos.brazoIzquierdo.O3B.rotation.x = this.movilidad.brazoIzd_rXCodo

		this.elementos.brazoDerecho.MBS.scale.y = this.movilidad.brazoDer_escSup
		this.elementos.brazoIzquierdo.MBS.scale.y = this.movilidad.brazoIzd_escSup

		this.elementos.brazoDerecho.O3BS.rotation.y = this.movilidad.brazoDer_rYSup
		this.elementos.brazoIzquierdo.O3BS.rotation.y = this.movilidad.brazoIzd_rYSup

		this.elementos.brazoDerecho.O3BS.rotation.z = this.movilidad.brazoDer_rZSup
		this.elementos.brazoIzquierdo.O3BS.rotation.z = this.movilidad.brazoIzd_rZSup

		this.elementos.brazoDerecho.MU.position.y = -this.dimBrazos.brazoSupY*this.elementos.brazoDerecho.MBS.scale.y
		this.elementos.brazoIzquierdo.MU.position.y = -this.dimBrazos.brazoSupY*this.elementos.brazoIzquierdo.MBS.scale.y

		this.elementos.brazoDerecho.MBI.rotation.x = this.movilidad.brazoDer_rXInf
		this.elementos.brazoIzquierdo.MBI.rotation.x = this.movilidad.brazoIzd_rXInf

		this.elementos.brazoDerecho.MBI.rotation.z = this.movilidad.brazoDer_rZInf
		this.elementos.brazoIzquierdo.MBI.rotation.z = this.movilidad.brazoIzd_rZInf

		// PIERNAS
		this.elementos.piernaDerecha.O3P.rotation.x = this.movilidad.piernaDer_rXSup
		this.elementos.piernaIzquierda.O3P.rotation.x = this.movilidad.piernaIzd_rXSup

		this.elementos.piernaDerecha.O3P.rotation.y = this.movilidad.piernaDer_rYSup
		this.elementos.piernaIzquierda.O3P.rotation.y = this.movilidad.piernaIzd_rYSup

		this.elementos.piernaDerecha.MPS.scale.y = this.movilidad.piernaDer_escSup
		this.elementos.piernaIzquierda.MPS.scale.y = this.movilidad.piernaIzd_escSup

		this.elementos.piernaDerecha.MU.position.y = -this.elementos.piernaDerecha.MPS.scale.y * this.dimPiernas.piernaSupY
		this.elementos.piernaIzquierda.MU.position.y = -this.elementos.piernaIzquierda.MPS.scale.y * this.dimPiernas.piernaSupY

		this.elementos.piernaDerecha.MPI.scale.y = this.movilidad.piernaDer_escInf
		this.elementos.piernaIzquierda.MPI.scale.y = this.movilidad.piernaIzd_escInf

		this.elementos.piernaDerecha.O3PI.rotation.x = this.movilidad.piernaDer_rXInf
		this.elementos.piernaIzquierda.O3PI.rotation.x = this.movilidad.piernaIzd_rXInf

		this.elementos.piernaDerecha.O3PI.rotation.z = this.movilidad.piernaDer_rZInf
		this.elementos.piernaIzquierda.O3PI.rotation.z = this.movilidad.piernaIzd_rZInf

		this.elementos.piernaDerecha.MP.position.y = -this.elementos.piernaDerecha.MPI.scale.y*this.dimPiernas.piernaInfY
		this.elementos.piernaIzquierda.MP.position.y = -this.elementos.piernaIzquierda.MPI.scale.y*this.dimPiernas.piernaInfY
	}
}

export {Robot}
