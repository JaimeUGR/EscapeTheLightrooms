
import * as THREE from '../../libs/three.module.js'
import {CSG} from '../../libs/CSG-v2.js'

class Robot extends THREE.Object3D
{
	constructor(gui, dimensiones = {
		cabeza: {
			cabezaX: 1,
			cabezaY: 1,
			cabezaZ: 1,

			radioCuello: 0.25,
			alturaCuello: 1
		},
		tronco: {
			troncoX: 10,
			troncoZ: 9,

			troncoSupY: 10,
			troncoInfY: 4,

			radioPila: 1,
			alturaPila: 2.5, // Menos que tronco Z
			radioZonaPila: 2,
			levantamientoZonaPila: 1, // Este levantamiento también se añade por dentro para que no se vea el fondo
			separacionYZonaPila: 0.5, // NO TOCAR
		},
		brazos: {
			hombroX: 6,
			hombroY: 3,
			hombroZ: 6,

			brazoX: 3,
			brazoZ: 3,

			brazoSupY: 8,
			brazoInfY: 6,

			// NOTA: Todas deben ser mayor que brazoXZ
			unionX: 5,
			unionY: 4,
			unionZ: 5,

			alturaBrazos: 0.8, // 0 a 1 en el tronco Y
		},
		piernas: {
			piernaX: 2,
			piernaZ: 2,
			piernaSupY: 6,
			piernaInfY: 6,

			separacionPiernas: 1, // 0 a 1, desde la mitad del tronco inferior

			// NOTA: Todas deben ser mayor que piernaXZ
			unionX: 2.5,
			unionY: 2.5,
			unionZ: 2.5
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

			brazoIzd_rXCodo: 0,
			brazoIzd_escSup: 1,
			brazoIzd_rYSup: 0,
			brazoIzd_rZSup: 0,
			brazoIzd_rXInf: 0,

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

			reset: () => {
				this.movilidad.cabeza_rX = 0
				this.movilidad.cabeza_rY = 0
				this.movilidad.cabeza_rZ = 0

				this.movilidad.troncoSup_rY = 0

				this.movilidad.brazoDer_rXCodo = 0
				this.movilidad.brazoDer_escSup = 1
				this.movilidad.brazoDer_rYSup = 0
				this.movilidad.brazoDer_rZSup = 0
				this.movilidad.brazoDer_rXIn = 0

				this.movilidad.brazoIzd_rXCodo = 0
				this.movilidad.brazoIzd_escSup = 1
				this.movilidad.brazoIzd_rYSup = 0
				this.movilidad.brazoIzd_rZSup = 0
				this.movilidad.brazoIzd_rXInf = 0

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

		this.material = new THREE.MeshNormalMaterial({opacity: 0.5, transparent: true})

		//
		// TRONCO INFERIOR
		//

		let geoTroncoInferior = new THREE.BoxGeometry(this.dimTronco.troncoX, this.dimTronco.troncoInfY, this.dimTronco.troncoZ)
		geoTroncoInferior.translate(0, -this.dimTronco.troncoInfY/2, 0)

		this.troncoInferior = new THREE.Mesh(geoTroncoInferior, this.material)

		// PIERNA
		{
			let O3Pierna = new THREE.Object3D()
			O3Pierna.name = "O3P"

			let geoPiernaSup = new THREE.BoxGeometry(this.dimPiernas.piernaX, this.dimPiernas.piernaSupY, this.dimPiernas.piernaZ)
			geoPiernaSup.translate(0, -this.dimPiernas.piernaSupY/2, 0)

			let meshPiernaSup = new THREE.Mesh(geoPiernaSup, this.material)
			meshPiernaSup.name = "MPS"
			// Libertad -> Escalado pierna superior
			// meshPiernaSup.scale.y = 1

			let geoUnion = new THREE.BoxGeometry(this.dimPiernas.unionX, this.dimPiernas.unionY, this.dimPiernas.unionZ)

			// TODO: Trasladar hacia abajo el escalado de la pierna
			let meshUnion = new THREE.Mesh(geoUnion, this.material)
			meshUnion.name = "MU"
			meshUnion.position.y = -meshPiernaSup.scale.y * this.dimPiernas.piernaSupY

			let geoPiernaInf = new THREE.BoxGeometry(this.dimPiernas.piernaX, this.dimPiernas.piernaInfY, this.dimPiernas.piernaZ)
			geoPiernaInf.translate(0, -this.dimPiernas.piernaInfY/2, 0)

			let meshPiernaInf = new THREE.Mesh(geoPiernaInf, this.material)
			meshPiernaInf.name = "MPI"
			// Libertad -> Escalado pierna inferior
			// Libertad -> Rotación XZ
			// meshPiernaInf.scale.y = 1
			// meshPiernaInf.rotation.x = 0
			// meshPiernaInf.rotation.z = 0

			meshUnion.add(meshPiernaInf)

			O3Pierna.add(meshPiernaSup)
			O3Pierna.add(meshUnion)
			// Libertad -> Rotación X Y de la pierna
			// O3Pierna.rotation.x = -Math.PI/2
			// O3Pierna.rotation.y = 0

			// TODO: Recordar que la unión no aporta altura (se suman las alturas de las piernas)
			// Añadir la pierna
			O3Pierna.position.y = -this.dimTronco.troncoInfY

			// Pierna derecha
			let separacionPiernas = (this.dimTronco.troncoZ/2 - this.dimPiernas.piernaZ/2)*this.dimPiernas.separacionPiernas
			O3Pierna.position.x += separacionPiernas

			this.piernaDerecha = O3Pierna
			this.troncoInferior.add(this.piernaDerecha)

			// Añadir los elementos para los grados de libertad
			this.elementos.piernaDerecha.O3P = this.piernaDerecha
			this.elementos.piernaDerecha.MPS = this.piernaDerecha.getObjectByName("MPS")
			this.elementos.piernaDerecha.MU = this.piernaDerecha.getObjectByName("MU")
			this.elementos.piernaDerecha.MPI = this.piernaDerecha.getObjectByName("MPI")

			// Pierna Izquierda
			this.piernaIzquierda = O3Pierna.clone(true)
			this.piernaIzquierda.position.x *= -1
			this.troncoInferior.add(this.piernaIzquierda)

			// Añadir los elementos para los grados de libertad
			this.elementos.piernaIzquierda.O3P = this.piernaIzquierda
			this.elementos.piernaIzquierda.MPS = this.piernaIzquierda.getObjectByName("MPS")
			this.elementos.piernaIzquierda.MU = this.piernaIzquierda.getObjectByName("MU")
			this.elementos.piernaIzquierda.MPI = this.piernaIzquierda.getObjectByName("MPI")
		}

		//
		// TRONCO SUPERIOR
		//

		let geoTroncoSuperior = new THREE.BoxGeometry(this.dimTronco.troncoX, this.dimTronco.troncoSupY, this.dimTronco.troncoZ)
		geoTroncoSuperior.translate(0, this.dimTronco.troncoSupY/2, 0)

		// Recorte de la zona de la pila
		let alturaZonaPila = (this.dimTronco.troncoSupY - 2*this.dimTronco.radioZonaPila)*this.dimTronco.separacionYZonaPila + this.dimTronco.radioZonaPila
		let geoZonaPila = new THREE.CylinderGeometry(this.dimTronco.radioZonaPila, this.dimTronco.radioZonaPila, 2*this.dimTronco.levantamientoZonaPila + this.dimTronco.alturaPila)

		geoZonaPila.rotateX(Math.PI/2)
		geoZonaPila.translate(0,
			alturaZonaPila,
			this.dimTronco.troncoZ/2 + this.dimTronco.levantamientoZonaPila/2 - (this.dimTronco.alturaPila/2 + this.dimTronco.separacionYZonaPila))

		let geoPilaRecorte = new THREE.CylinderGeometry(this.dimTronco.radioPila, this.dimTronco.radioPila, this.dimTronco.alturaPila + this.dimTronco.levantamientoZonaPila)
		geoPilaRecorte.rotateX(Math.PI/2)

		// NOTA: Luego hay que trasladarla en la Z el levantamiento de la zona y volver a recortar
		geoPilaRecorte.translate(0, alturaZonaPila, this.dimTronco.troncoZ/2 + this.dimTronco.levantamientoZonaPila/2 - this.dimTronco.alturaPila/2)

		// TODO: Poner el material del robot aquí
		let csg = new CSG().union([new THREE.Mesh(geoTroncoSuperior, this.material)])
			.subtract([new THREE.Mesh(geoZonaPila, null), new THREE.Mesh(geoPilaRecorte, null)])

		this.troncoSuperior = csg.toMesh()

		// TODO: Poner el material de la zona interna de la pila
		csg = new CSG().union([new THREE.Mesh(geoZonaPila, this.material)])
			.subtract([new THREE.Mesh(geoPilaRecorte, null)])

		this.zonaPila = csg.toMesh()

		let O3Pila = new THREE.Object3D()
		O3Pila.position.set(0, alturaZonaPila, this.dimTronco.troncoZ/2 - this.dimTronco.alturaPila/2)

		// TODO: A la hora de añadir la pila, meterla a este mesh. Tiene que estar centrada y rotada mirando para el eje X la cabeza
		let pilaTMP = new THREE.CylinderGeometry(this.dimTronco.radioPila, this.dimTronco.radioPila, this.dimTronco.alturaPila)
		pilaTMP.rotateX(Math.PI/2)

		O3Pila.add(new THREE.Mesh(pilaTMP, new THREE.MeshBasicMaterial()))

		this.zonaPila.add(O3Pila)
		this.troncoSuperior.add(this.zonaPila)

		// Brazos
		{
			let geoHombro = new THREE.BoxGeometry(this.dimBrazos.hombroX, this.dimBrazos.hombroY, this.dimBrazos.hombroZ)

			let O3Brazo = new THREE.Mesh(geoHombro, this.material)
			O3Brazo.name = "O3B"
			// Libertad -> Rotación codo
			// O3Brazo.rotation.x = 0

			let geoBrazoSup = new THREE.BoxGeometry(this.dimBrazos.brazoX, this.dimBrazos.brazoSupY, this.dimBrazos.brazoZ)
			geoBrazoSup.translate(0, -this.dimBrazos.brazoSupY/2, 0)

			let meshBrazoSup = new THREE.Mesh(geoBrazoSup, this.material)
			meshBrazoSup.name = "MBS"
			// Libertad -> Escalado brazo sup
			// meshBrazoSup.scale.y = 1
			meshBrazoSup.position.y = this.dimBrazos.brazoSupY/2

			let O3BrazoSup = new THREE.Object3D()
			O3BrazoSup.name = "O3BS"
			// Libertad -> Rotación en YZ del brazo sup
			// O3BrazoSup.rotation.y = 0
			// O3BrazoSup.rotation.z = 0
			O3BrazoSup.position.y += -this.dimBrazos.brazoSupY/2

			O3BrazoSup.add(meshBrazoSup)

			let geoUnion = new THREE.BoxGeometry(this.dimBrazos.unionX, this.dimBrazos.unionY, this.dimBrazos.unionZ)
			let meshUnion = new THREE.Mesh(geoUnion, this.material)
			meshUnion.name = "MU"
			// TODO: Libertad -> Traslación hacia abajo por el escalado
			meshUnion.position.y = -this.dimBrazos.brazoSupY*meshBrazoSup.scale.y + this.dimBrazos.brazoSupY/2

			O3BrazoSup.add(meshUnion)

			let geoBrazoInf = new THREE.BoxGeometry(this.dimBrazos.brazoX, this.dimBrazos.brazoInfY, this.dimBrazos.brazoZ)
			geoBrazoInf.translate(0, -this.dimBrazos.brazoInfY/2, 0)

			let meshBrazoInf = new THREE.Mesh(geoBrazoInf, this.material)
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
			O3Brazo.position.x += this.dimTronco.troncoX/2 + this.dimBrazos.hombroX/2

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
			let geoCuello = new THREE.CylinderGeometry(this.dimCabeza.radioCuello, this.dimCabeza.radioCuello, 2*this.dimCabeza.alturaCuello)
			geoCuello.translate(0, 0, 0)

			let geoCabeza = new THREE.BoxGeometry(this.dimCabeza.cabezaX, this.dimCabeza.cabezaY, this.dimCabeza.cabezaZ)
			geoCabeza.translate(0, this.dimCabeza.cabezaY/2 + this.dimCabeza.alturaCuello, 0)

			let meshCabeza = new THREE.Mesh(geoCabeza, this.material)
			let meshCuello = new THREE.Mesh(geoCuello, this.material)

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

		this.axis = new THREE.AxesHelper (10);
		this.add (this.axis)

		this.createGUI(gui)
	}

	createGUI(gui)
	{

		// Se crea una sección para los controles de la caja
		const folder = gui.addFolder ("Robot")

		folder.add(this.movilidad, 'cabeza_rX', -Math.PI, Math.PI, 0.1).name('cabeza_rX: ').listen()
		folder.add(this.movilidad, 'cabeza_rY', -Math.PI, Math.PI, 0.1).name('cabeza_rY: ').listen()
		folder.add(this.movilidad, 'cabeza_rZ', -Math.PI, Math.PI, 0.1).name('cabeza_rZ: ').listen()

		folder.add(this.movilidad, 'troncoSup_rY', -Math.PI, Math.PI, 0.1).name('troncoSup_rY: ').listen()

		folder.add(this.movilidad, 'brazoDer_rXCodo', -Math.PI, Math.PI, 0.1).name('brazoDer_rXCodo: ').listen()
		folder.add(this.movilidad, 'brazoDer_escSup', 0, 4, 0.1).name('brazoDer_escSup: ').listen()
		folder.add(this.movilidad, 'brazoDer_rYSup', -Math.PI, Math.PI, 0.1).name('brazoDer_rYSup: ').listen()
		folder.add(this.movilidad, 'brazoDer_rZSup', -Math.PI, Math.PI, 0.1).name('brazoDer_rZSup: ').listen()
		folder.add(this.movilidad, 'brazoDer_rXInf', -Math.PI, Math.PI, 0.1).name('brazoDer_rXInf: ').listen()

		folder.add(this.movilidad, 'brazoIzd_rXCodo', -Math.PI, Math.PI, 0.1).name('brazoIzd_rXCodo: ').listen()
		folder.add(this.movilidad, 'brazoIzd_escSup', 0, 4, 0.1).name('brazoIzd_escSup: ').listen()
		folder.add(this.movilidad, 'brazoIzd_rYSup', -Math.PI, Math.PI, 0.1).name('brazoIzd_rYSup: ').listen()
		folder.add(this.movilidad, 'brazoIzd_rZSup', -Math.PI, Math.PI, 0.1).name('brazoIzd_rZSup: ').listen()
		folder.add(this.movilidad, 'brazoIzd_rXInf', -Math.PI, Math.PI, 0.1).name('brazoIzd_rXInf: ').listen()

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

		folder.add (this.movilidad, 'reset').name ('[ Reset ]')
	}

	update()
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

		this.elementos.brazoDerecho.MU.position.y = -this.dimBrazos.brazoSupY*this.elementos.brazoDerecho.MBS.scale.y + this.dimBrazos.brazoSupY/2
		this.elementos.brazoIzquierdo.MU.position.y = -this.dimBrazos.brazoSupY*this.elementos.brazoIzquierdo.MBS.scale.y + this.dimBrazos.brazoSupY/2

		this.elementos.brazoDerecho.MBI.rotation.x = this.movilidad.brazoDer_rXInf
		this.elementos.brazoIzquierdo.MBI.rotation.x = this.movilidad.brazoIzd_rXInf

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

		this.elementos.piernaDerecha.MPI.rotation.x = this.movilidad.piernaDer_rXInf
		this.elementos.piernaIzquierda.MPI.rotation.x = this.movilidad.piernaIzd_rXInf

		this.elementos.piernaDerecha.MPI.rotation.z = this.movilidad.piernaDer_rZInf
		this.elementos.piernaIzquierda.MPI.rotation.z = this.movilidad.piernaIzd_rZInf
	}
}

export {Robot}
