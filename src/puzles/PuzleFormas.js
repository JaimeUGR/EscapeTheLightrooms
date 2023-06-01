
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from '../../libs/CSG-v2.js'

import * as FORMAS from '../models/Formas.js'
import {TriangularPrismGeometry} from "../geometry/PrismGeometry.js"
import {Palanca} from "../models/Palanca.js"

import {RandomInt, ShuffleArray} from "../Utils.js"
import {GameState} from "../GameState.js"

const COLOR_FORMA = 0xbd8642
const COLOR_FORMA_SELECCIONADA = 0x42bd61

class PuzleFormas extends THREE.Object3D
{
	constructor(dimensiones = {
		radioContenedor: 4, // Radio del contenedor de la forma
		alturaContenedor: 1,
		radioForma: 0.55, // De 0 a 1. 1 significa mismo radio que el contenedor
		alturaForma: 0.5,

		dimensionesRail: {},
		separacionComplejosRail: 10,

		operadoresX: 5,
		operadoresY: 5,
		operadoresZ: 2,

		dimensionesPalancas: {},

		// La palanca está colocada justo en el centro del raíl (en Z positiva)
		offsetZPalancas: 30,
		offsetYPalancas: 0

		// X TOTAL -> 2*railGrosor + interiorX ...
	})
	{
		super()

		this.radioContenedor = dimensiones.radioContenedor
		this.alturaContenedor = dimensiones.alturaContenedor

		this.radioForma = dimensiones.radioForma
		this.alturaForma = dimensiones.alturaForma

		this.separacionComplejosRail = dimensiones.separacionComplejosRail

		this.operadoresX = dimensiones.operadoresX
		this.operadoresY = dimensiones.operadoresY
		this.operadoresZ = dimensiones.operadoresZ

		this.offsetYPalancas = dimensiones.offsetYPalancas
		this.offsetZPalancas = dimensiones.offsetZPalancas

		this.callbackCompletar = null

		//
		// Material
		//

		const txLoader = GameState.txLoader

		let texturaContenedor = txLoader.load("../../resources/textures/models/madera-oscura.jpg")

		this.materialContenedor = new THREE.MeshLambertMaterial({map: texturaContenedor})
		this.materialForma = new THREE.MeshBasicMaterial({color: COLOR_FORMA})
		this.materialOperador = new THREE.MeshBasicMaterial({color: 0x30359c})

		//
		// Modelado
		//

		this.formasBase = this._crearFormas()
		this.formasOperadores = this._crearFormasOperadores()

		this.railes = []
		this.operadores = [
			this.formasOperadores.suma,
			this.formasOperadores.resta,
			this.formasOperadores.igual
		]
		this.palancas = []

		const idxFormaSeleccionada = RandomInt(this.formasBase.length - 1)
		this.formaObjetivo = this.formasBase[idxFormaSeleccionada].clone(true)
		this.formaObjetivo.children[0].material = this.formasBase[idxFormaSeleccionada].children[0].material.clone(true)
		this.formaObjetivo.children[0].material.color.setHex(COLOR_FORMA_SELECCIONADA)

		//
		// Crear los raíles y palancas
		//

		this.add(this.formaObjetivo)

		for (let i = 0; i < 3; i++)
		{
			// TODO: Si es la última iteración hacer el shuffle si la fórmula da terminado
			ShuffleArray(this.formasBase)

			let rail = new Rail()
			rail.setFormas(this.formasBase)

			let palanca = new Palanca()
			rail.add(palanca)

			palanca.setCallbackActivar(rail.rotarFormas.bind(rail))
			rail.setCallbackRotacion(this.comprobarCompletado.bind(this))

			// TODO: TMP Añadir un método que meta todas las palancas y cosas interactuables
			GameState.systems.interaction.allInteractables.push(palanca)

			this.railes.push(rail)
			this.palancas.push(palanca)

			this.add(rail)
			this.add(this.operadores[i])
		}

		// Comprobación de la autocompletación del juego debido a la aleatoriedad
		while (this._comprobarFormas())
		{
			console.log("El puzle se ha creado resuelto. Rehaciendo el shuffle")

			for (let i = 0; i < this.railes.length; i++)
				this.railes[i].reordenarFormas()
		}

		//
		// Posicionar los raíles, palancas y la forma objetivo
		//

		let mitadAnchoRail = this.railes[0].interiorRailX + this.railes[0].grosorRail
		let offsetInicial = -(this.separacionComplejosRail/2 + 2*mitadAnchoRail + this.separacionComplejosRail + mitadAnchoRail)

		// Posicionar los railes, palancas y operadores
		for (let i = 0; i < this.railes.length; i++)
		{
			let rail = this.railes[i]
			rail.position.x = offsetInicial

			let palanca = this.palancas[i]
			palanca.position.y = this.offsetYPalancas
			palanca.position.z = this.offsetZPalancas

			let operador = this.operadores[i]
			operador.position.x = offsetInicial + mitadAnchoRail + this.separacionComplejosRail/2

			offsetInicial += 2*mitadAnchoRail + this.separacionComplejosRail

			// Seleccionamos la forma inicial
			rail.getFormaSeleccionada().children[0].material.color.setHex(COLOR_FORMA_SELECCIONADA)
		}

		// Posicionar la forma objetivo
		this.formaObjetivo.position.x = offsetInicial

		// DEBUG
		this.axis = new THREE.AxesHelper (10);
		this.add (this.axis)
	}

	// NOTE: si cambiamos el número de railes hay que cambiar esto

	comprobarCompletado()
	{
		if (!this._comprobarFormas())
			return

		console.log("Has completado el puzle de las formas!")

		if (this.callbackCompletar === null)
			return

		this.callbackCompletar()

		// NOTE: Para ignorar siguientes completaciones
		this.callbackCompletar = null
	}

	setCallbackCompletar(callback)
	{
		this.callbackCompletar = callback
	}

	// Devuelve true si está completado el puzle
	_comprobarFormas()
	{
		let vForma0 = this.railes[0].getFormaSeleccionada().userData.vertices
		let vForma1 = this.railes[1].getFormaSeleccionada().userData.vertices
		let vForma2 = this.railes[2].getFormaSeleccionada().userData.vertices
		let vFormaObjetivo = this.formaObjetivo.userData.vertices

		return vForma0 + vForma1 - vForma2 === vFormaObjetivo
	}

	_crearFormas()
	{
		let geoBaseForma = new THREE.CylinderGeometry(this.radioContenedor, this.radioContenedor, this.alturaContenedor, 20)
		geoBaseForma.rotateX(Math.PI/2)
		geoBaseForma.translate(0, 0, this.alturaContenedor/2)

		// TODO: Aplicar los materiales del cilindro contenedor
		let meshBaseForma = new THREE.Mesh(geoBaseForma, [this.materialContenedor, this.materialContenedor])

		const radioForma = this.radioForma * this.radioContenedor
		const levantamientoContenedor = this.alturaForma/2 + this.alturaContenedor

		// Círculo
		let geoCirculo = new THREE.CylinderGeometry(radioForma, radioForma, this.alturaForma, 30)
		geoCirculo.rotateX(Math.PI/2)
		geoCirculo.translate(0, 0, levantamientoContenedor)

		// Triángulo
		let geoTriangulo = new TriangularPrismGeometry(2*radioForma, this.alturaForma)
		geoTriangulo.rotateX(Math.PI/2)
		geoTriangulo.translate(0, 0, levantamientoContenedor)

		// Cuadrado
		let geoCuadrado = new THREE.BoxGeometry(2*radioForma, 2*radioForma, this.alturaForma)
		geoCuadrado.translate(0, 0, levantamientoContenedor)

		// Pentágono
		let geoPentagono = new FORMAS.Pentagono(this.alturaForma)
		geoPentagono.scale(2*radioForma, 2*radioForma, 1)
		geoPentagono.translate(0, 0, levantamientoContenedor)

		// Hexágono
		let geoHexagono = new FORMAS.Prisma(this.alturaForma, 6)
		geoHexagono.scale(2*radioForma, 2*radioForma, 1)
		geoHexagono.translate(0, 0, levantamientoContenedor)

		// Heptágono
		let geoHeptagono = new FORMAS.Prisma(this.alturaForma, 7)
		geoHeptagono.scale(2*radioForma, 2*radioForma, 1)
		geoHeptagono.translate(0, 0, levantamientoContenedor)

		// Octágono
		let geoOctagono = new FORMAS.Prisma(this.alturaForma, 8)
		geoOctagono.scale(2*radioForma, 2*radioForma, 1)
		geoOctagono.translate(0, 0, levantamientoContenedor)

		// Estrella
		let geoEstrella = new FORMAS.Estrella(this.alturaForma)
		geoEstrella.scale(2*radioForma, 2*radioForma, 1)
		geoEstrella.translate(0, 0, levantamientoContenedor)

		//
		// Crear los meshes
		//
		let meshContenedorCirculo = meshBaseForma.clone()

		meshContenedorCirculo.add(new THREE.Mesh(geoCirculo, this.materialForma))
		meshContenedorCirculo.userData = {
			vertices: 0
		}

		let meshContenedorTriangulo = meshBaseForma.clone()
		meshContenedorTriangulo.add(new THREE.Mesh(geoTriangulo, this.materialForma))
		meshContenedorTriangulo.userData = {
			vertices: 3
		}

		let meshContenedorCuadrado = meshBaseForma.clone()
		meshContenedorCuadrado.add(new THREE.Mesh(geoCuadrado, this.materialForma))
		meshContenedorCuadrado.userData = {
			vertices: 4
		}

		let meshContenedorPentagono = meshBaseForma.clone()
		meshContenedorPentagono.add(new THREE.Mesh(geoPentagono, this.materialForma))
		meshContenedorPentagono.userData = {
			vertices: 5
		}

		let meshContenedorHexagono = meshBaseForma.clone()
		meshContenedorHexagono.add(new THREE.Mesh(geoHexagono, this.materialForma))
		meshContenedorHexagono.userData = {
			vertices: 6
		}

		let meshContenedorHeptagono = meshBaseForma.clone()
		meshContenedorHeptagono.add(new THREE.Mesh(geoHeptagono, this.materialForma))
		meshContenedorHeptagono.userData = {
			vertices: 7
		}

		let meshContenedorOctagono = meshBaseForma.clone()
		meshContenedorOctagono.add(new THREE.Mesh(geoOctagono, this.materialForma))
		meshContenedorOctagono.userData = {
			vertices: 8
		}

		let meshContenedorEstrella = meshBaseForma.clone()
		meshContenedorEstrella.add(new THREE.Mesh(geoEstrella, this.materialForma))
		meshContenedorEstrella.userData = {
			vertices: 10
		}

		let formas = []

		formas.push(meshContenedorCirculo)
		formas.push(meshContenedorTriangulo)
		formas.push(meshContenedorCuadrado)
		formas.push(meshContenedorPentagono)
		formas.push(meshContenedorHexagono)
		formas.push(meshContenedorHeptagono)
		formas.push(meshContenedorOctagono)
		formas.push(meshContenedorEstrella)

		return formas
	}

	_crearFormasOperadores()
	{
		//
		// SUMA
		//

		let geoOperadorSuma = new THREE.BoxGeometry(this.operadoresX, this.operadoresY/3, this.operadoresZ)
		geoOperadorSuma.translate(0, 0, this.operadoresZ/2)

		let geoOperadorSumaV = geoOperadorSuma.clone()
		geoOperadorSumaV.rotateZ(Math.PI/2)

		let csgSuma = new CSG().union([new THREE.Mesh(geoOperadorSuma, this.materialOperador), new THREE.Mesh(geoOperadorSumaV, this.materialOperador)])
		let meshOperadorSuma = csgSuma.toMesh()


		//
		// Resta
		//

		let geoOperadorResta = geoOperadorSuma.clone()
		let meshOperadorResta = new THREE.Mesh(geoOperadorResta, this.materialOperador)

		//
		// Igual
		//

		let O3OperadorIgual = new THREE.Object3D()

		let geoOperadorIgual = new THREE.BoxGeometry(this.operadoresX, this.operadoresY/3, this.operadoresZ)
		geoOperadorIgual.translate(0, -this.operadoresY/3, this.operadoresZ/2)

		O3OperadorIgual.add(new THREE.Mesh(geoOperadorIgual, this.materialOperador))
		geoOperadorIgual = geoOperadorIgual.clone()
		geoOperadorIgual.translate(0, 2*this.operadoresY/3, 0)
		O3OperadorIgual.add(new THREE.Mesh(geoOperadorIgual, this.materialOperador))

		return {
			suma: meshOperadorSuma,
			resta: meshOperadorResta,
			igual: O3OperadorIgual
		}
	}
}

class Rail extends THREE.Object3D
{
	constructor(dimensiones = {
		interiorRailX: 20, // Espacio interno creado por el rail (debe ser igual a Y)
		interiorRailY: 20, // Espacio interno creado por el rail (debe ser igual a X)
		grosorRail: 2, // Grosor en Y X del rail (sumado al espacio interno)
		alturaRail: 0.5 // Altura del propio rail
	}, formasBase = null)
	{
		super()

		this.interiorRailX = dimensiones.interiorRailX
		this.interiorRailY = dimensiones.interiorRailY
		this.interiorRailZ = dimensiones.interiorRailZ

		this.grosorRail = dimensiones.grosorRail
		this.alturaRail = dimensiones.alturaRail

		this.indiceFormaSeleccionada = 0
		this.formas = []

		this.callbackRotacion = null

		this.materialRail = new THREE.MeshBasicMaterial({ color: 0x222222 })

		//
		// Crear el Spline
		//

		// El spline está centrado en el rail
		const posMitadRailX = this.interiorRailX/2 + this.grosorRail/2
		const posMitadRailY = this.interiorRailY/2 + this.grosorRail/2

		this.spline = new THREE.CatmullRomCurve3([
			new THREE.Vector3(posMitadRailX, 0, 0),
			new THREE.Vector3(posMitadRailX, -posMitadRailY, 0),
			new THREE.Vector3(0, -posMitadRailY, 0),
			new THREE.Vector3(-posMitadRailX, -posMitadRailY, 0),
			new THREE.Vector3(-posMitadRailX, 0, 0),
			new THREE.Vector3(-posMitadRailX, posMitadRailY, 0),
			new THREE.Vector3(0, posMitadRailY, 0),
			new THREE.Vector3(posMitadRailX, posMitadRailY, 0)
		], true)

		//
		// Crear el raíl
		//

		let geoRail = new THREE.BoxGeometry(this.interiorRailX + 2*this.grosorRail,
			this.interiorRailY + 2*this.grosorRail, this.alturaRail)
		geoRail.translate(0, 0, this.alturaRail/2)

		let geoRecorteRail = new THREE.BoxGeometry(this.interiorRailX, this.interiorRailY, this.alturaRail)
		geoRecorteRail.translate(0, 0, this.alturaRail/2)

		let csg = new CSG().union([new THREE.Mesh(geoRail, this.materialRail)])
			.subtract([new THREE.Mesh(geoRecorteRail, null)])

		this.add(csg.toMesh())

		// DEBUG
		//let splineGeometryLine = new THREE.BufferGeometry()
		//splineGeometryLine.setFromPoints(this.spline.getPoints(8))
		//this.add(new THREE.Line(splineGeometryLine, new THREE.LineBasicMaterial({color: 0x1a129a, lineWidth: 4})))

		//
		// FormasBase
		//

		if (formasBase != null)
			this.setFormas(formasBase)

		//
		// Animación
		//

		this._crearAnimacion()
	}

	setFormas(formasBase)
	{
		this.formas = []
		const incrementoPosicionamiento = 1.0 / formasBase.length
		let posicionamiento = 0.0

		for (let i = 0; i < formasBase.length; i++)
		{
			let forma = formasBase[i].clone(true)
			forma.children[0].material = formasBase[i].children[0].material.clone()
			forma.children[0].material.needsUpdate = true
			forma.position.copy(this.spline.getPointAt(posicionamiento))

			this.formas.push(forma)
			this.add(forma)

			posicionamiento += incrementoPosicionamiento
		}
	}

	reordenarFormas()
	{
		if (this.formas.length === 0)
			return

		ShuffleArray(this.formas)

		const incrementoPosicionamiento = 1.0 / this.formas.length
		let posicionamiento = 0.0

		for (let i = 0; i < this.formas.length; i++)
		{
			this.formas[i].position.copy(this.spline.getPointAt(posicionamiento))
			posicionamiento += incrementoPosicionamiento
		}
	}

	getFormaSeleccionada()
	{
		return this.formas[this.indiceFormaSeleccionada]
	}

	rotarFormas()
	{
		if (this._animating)
			return

		this._animating = true
		this.animacion.rotacion.animacion.start()
	}

	setCallbackRotacion(callback)
	{
		this.callbackRotacion = callback
	}

	_crearAnimacion()
	{
		this._animating = false
		this.animacion = {
			rotacion: {
				offsetActual: 0.0,
				incrementoActual: 0.0,
				animacion: null
			}
		}

		let frameInicio = { p: 0 }
		let frameFin = { p: 1 }

		this.animacion.rotacion.animacion = new TWEEN.Tween(frameInicio).to(frameFin, 1500)
			.onStart(() => {
				this.getFormaSeleccionada().children[0].material.color.setHex(COLOR_FORMA)
				frameFin.p = 1.0 / this.formas.length
			})
			.onUpdate(() => {
				for (let i = 0; i < this.formas.length; i++) {
					let forma = this.formas[i]
					let offsetActual = this.animacion.rotacion.offsetActual + frameFin.p * i + frameInicio.p

					while (offsetActual >= 1.0)
						offsetActual -= 1.0

					forma.position.copy(this.spline.getPointAt(offsetActual))
				}
			})
			.onComplete(() => {
				this.animacion.rotacion.offsetActual += frameFin.p
				this.indiceFormaSeleccionada = (this.indiceFormaSeleccionada - 1)

				if (this.indiceFormaSeleccionada < 0)
					this.indiceFormaSeleccionada = this.formas.length - 1
				else
					this.indiceFormaSeleccionada %= this.formas.length

				this.getFormaSeleccionada().children[0].material.color.setHex(COLOR_FORMA_SELECCIONADA)

				frameInicio.p = 0
				frameFin.p = 1

				if (this.callbackRotacion != null)
					this.callbackRotacion()

				this._animating = false
			})
	}
}

export {PuzleFormas}
