
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"
import {TrapezoidGeometry} from "../geometry/TrapezoidGeometry.js"
import {TriangularPrismGeometry} from "../geometry/PrismGeometry.js"
import {BoxGeometry} from "../../libs/three.module.js"
import {GameState} from "../GameState.js"

class CuboCentral extends THREE.Object3D
{
	constructor(dimensiones = {
		// Parte interna
		ladoCubo: 11,
		bordeCubo: 0.5, // Borde por todos los lados. Además, es el grueso del panel

		separacionPanelPalanca: 1, // Hueco entre el panel y la palanca
		anchoPalanca: 5,
		altoPalanca: 1.5,
		profPalanca: 0.5,
		separacionTirPalanca: 1, // Separación desde la derecha
		anchoTirPalanca: 1,
		altoTirPalanca: 1,

		infoPanSup: {
			ladoPrisma: 5,
		},
		infoPanDer: {
			radioTornillo: 0.25,
			alturaTornillo: 0.1,
		},
		infoPanIzd: {
			anchoLector: 8,
			altoLector: 1,
			profLector: 0.5
		},
		infoPanTras: {
			anchoTeclado: 5,
			altoTeclado: 6,
			profTeclado: 0.2,
			bordeTeclado: 0.5,
			altoPantalla: 1,
			profPantalla: 0.1,
			profBoton: 0.25,
			numBotones: 12
		},
	})
	{
		super()

		this.ladoCubo = dimensiones.ladoCubo
		this.bordeCubo = dimensiones.bordeCubo

		this.anchoPalanca = dimensiones.anchoPalanca
		this.altoPalanca = dimensiones.altoPalanca
		this.profPalanca = dimensiones.profPalanca

		this.separacionTirPalanca = dimensiones.separacionTirPalanca
		this.anchoTirPalanca = dimensiones.anchoTirPalanca
		this.altoTirPalanca = dimensiones.altoTirPalanca

		this.separacionPanelPalanca = dimensiones.separacionPanelPalanca
		this.separacionGiroPalanca = dimensiones.profPalanca/2

		this.infoPanSup = dimensiones.infoPanSup
		this.infoPanDer = dimensiones.infoPanDer
		this.infoPanIzd = dimensiones.infoPanIzd
		this.infoPanTras = dimensiones.infoPanTras

		// TODO: TMP
		this.ladoPrisma = dimensiones.infoPanSup.ladoPrisma

		this.material = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialBordesCubo = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialPanel = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialCuboInterno = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialPalanca = new THREE.MeshBasicMaterial({color: 0x334455})

		this.materialTornillo = new THREE.MeshBasicMaterial({color: 0x222222})

		this.materialLectorTarjetas = new THREE.MeshBasicMaterial({color: 0x222222})

		this.materialKeypad = new THREE.MeshBasicMaterial({color: 0x343434})
		// TODO: Este material será una textura que se cambiará por los * cada vez que se pulse
		this.materialKeypadPant = new THREE.MeshBasicMaterial({color: 0x111111})

		// Diferente por cada tecla
		this.materialKeypadTeclas = [
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55}),
			new THREE.MeshBasicMaterial({color: 0x55ff55})
		]

		this.materialFondoPrisma = new THREE.MeshBasicMaterial({color: 0x222222})
		this.materialLatPrismaVerde = new THREE.MeshBasicMaterial({color: 0x55ff55})
		this.materialLatPrismaRojo = new THREE.MeshBasicMaterial({color: 0xff5555})
		this.materialLatPrismaAzul = new THREE.MeshBasicMaterial({color: 0x5555ff})

		// Declarar los meshes para guardar los datos
		this.elementosPS = {}
		this.elementosPT = {}
		this.elementosPI = {}
		this.elementosPD = {}

		this.animaciones = {}
		this._animating = false

		//
		// Cubo Interno (el que tendrá las palancas)
		//

		// Geometría del cubo
		let geoCuboExterno = new THREE.BoxGeometry(this.ladoCubo + 2*this.bordeCubo,
			this.ladoCubo + 2*this.bordeCubo, this.ladoCubo + 2*this.bordeCubo)
		let geoCuboInterno = new THREE.BoxGeometry(this.ladoCubo, this.ladoCubo, this.ladoCubo)

		// Recortamos el cubo interno
		let csgRecorteCuboExterno = new CSG().union([new THREE.Mesh(geoCuboExterno, this.materialBordesCubo)])
			.subtract([new THREE.Mesh(geoCuboInterno, null)])

		//
		// Figuras para empezar el recortado
		//
		let geoPanel = new BoxGeometry(this.ladoCubo, this.ladoCubo, this.bordeCubo)
		geoPanel.translate(0, 0, -this.bordeCubo/2)

		let geoFormaPalanca = new BoxGeometry(this.anchoPalanca, this.altoPalanca, this.profPalanca)
		let geoFormaManilla = new BoxGeometry(this.anchoTirPalanca, this.altoTirPalanca, this.profPalanca)

		geoFormaManilla.translate(this.anchoPalanca/2 - (this.anchoTirPalanca/2 + this.separacionTirPalanca), 0, 0)

		// Obtener la geometría de la palanca
		// TODO: Revisar si esto luego dará algún problema con el material. Si lo da, sacar el mesh aquí y posicionarlo
		// TODO: en la posición que le corresponda
		let geoPalanca = new CSG().union([new THREE.Mesh(geoFormaPalanca, this.materialPalanca)])
			.subtract([new THREE.Mesh(geoFormaManilla, null)]).toGeometry()

		let geoTrapecioRecorte = new TrapezoidGeometry(this.ladoCubo, this.ladoCubo, this.anchoPalanca,
			this.altoPalanca, this.separacionPanelPalanca)
		geoTrapecioRecorte.rotateX(-Math.PI/2)

		//
		// Colocar las figuras para empezar el recortado
		//

		// NOTA: Este mesh se rotará siempre en Y y luego se trasladará (esta traslación tendrá que tener en cuenta
		// a dónde se hizo la rotación)
		let meshPanelBase = new THREE.Mesh(geoPanel, this.materialPanel)
		meshPanelBase.name = "Panel" // TODO: Usar este nombre para eliminar el panel cuando se resuelva

		let meshPanelRecorte = new THREE.Mesh(geoPanel, null)

		geoTrapecioRecorte.translate(0, 0, this.ladoCubo/2 - this.separacionPanelPalanca/2)
		geoFormaPalanca.translate(0, 0, this.ladoCubo/2 - this.separacionPanelPalanca - this.profPalanca/2)
		geoPalanca.translate(this.anchoPalanca/2 - this.separacionGiroPalanca, 0, 0)

		let csgRecorteCuboInterno = new CSG().union([new THREE.Mesh(geoCuboInterno, this.materialCuboInterno)])

		//
		// FRONTAL (Sólo recortamos el panel al externo)
		//
		this.panelFrontal = this.crearPanelOrdenador(geoPanel.clone())
		this.panelFrontal.position.z = this.ladoCubo/2 + this.bordeCubo

		csgRecorteCuboExterno.subtract([this.panelFrontal])

		//
		// Panel Derecha
		//

		this.panelDerechoO3D = new THREE.Object3D()
		this.panelDerechoO3D.add(this.crearPanelTornillos(meshPanelBase.clone()))
		this.panelDerechoO3D.rotateY(Math.PI/2)
		this.panelDerechoO3D.position.x = this.ladoCubo/2 + this.bordeCubo

		meshPanelRecorte.rotateY(Math.PI/2)
		meshPanelRecorte.position.x = this.ladoCubo/2 + this.bordeCubo

		geoTrapecioRecorte.rotateY(Math.PI/2)
		geoFormaPalanca.rotateY(Math.PI/2)

		csgRecorteCuboExterno.subtract([meshPanelRecorte])
		csgRecorteCuboInterno.subtract([new THREE.Mesh(geoTrapecioRecorte, null),
			new THREE.Mesh(geoFormaPalanca, null)])

		meshPanelRecorte.position.x = 0 // Reset del panel de recorte

		// Añadir y posicionar la palanca
		this.palancaDerechaO3D = new THREE.Object3D()
		this.palancaDerecha = new THREE.Mesh(geoPalanca, this.materialPalanca)
		this.palancaDerechaO3D.add(this.palancaDerecha)

		this.palancaDerecha.rotateY(0) // TODO ANIMACION De 0 a -Math.PI/2
		this.palancaDerechaO3D.translateX(-(this.anchoPalanca/2 - this.separacionGiroPalanca))
		this.palancaDerechaO3D.translateZ(-(this.profPalanca/2 + this.bordeCubo + this.separacionPanelPalanca)) // Trasladarla detrás del panel

		this.panelDerechoO3D.add(this.palancaDerechaO3D)

		//
		// Panel Trasero
		//

		this.panelTraseroO3D = new THREE.Object3D()
		this.panelTraseroO3D.add(this.crearPanelCodigo(meshPanelBase.clone()))
		this.panelTraseroO3D.rotateY(Math.PI)
		this.panelTraseroO3D.position.z = -(this.ladoCubo/2 + this.bordeCubo)

		meshPanelRecorte.rotateY(Math.PI/2)
		meshPanelRecorte.position.z = -(this.ladoCubo/2 + this.bordeCubo)

		geoTrapecioRecorte.rotateY(Math.PI/2)
		geoFormaPalanca.rotateY(Math.PI/2)

		csgRecorteCuboExterno.subtract([meshPanelRecorte])
		csgRecorteCuboInterno.subtract([new THREE.Mesh(geoTrapecioRecorte, null),
			new THREE.Mesh(geoFormaPalanca, null)])

		meshPanelRecorte.position.z = 0 // Reset del panel de recorte

		// Añadir y posicionar la palanca
		this.palancaTraseraO3D = new THREE.Object3D()
		this.palancaTrasera = new THREE.Mesh(geoPalanca, this.materialPalanca)
		this.palancaTraseraO3D.add(this.palancaTrasera)

		this.palancaTrasera.rotateY(0) // TODO ANIMACION De 0 a -Math.PI/2
		this.palancaTraseraO3D.translateX(-(this.anchoPalanca/2 - this.separacionGiroPalanca))
		this.palancaTraseraO3D.translateZ(-(this.profPalanca/2 + this.bordeCubo + this.separacionPanelPalanca)) // Trasladarla detrás del panel

		this.panelTraseroO3D.add(this.palancaTraseraO3D)

		//
		// Panel Izquierda
		//

		this.panelIzquierdoO3D = new THREE.Object3D()
		this.panelIzquierdoO3D.add(this.crearPanelTarjeta(meshPanelBase.clone()))
		this.panelIzquierdoO3D.rotateY(-Math.PI/2)
		this.panelIzquierdoO3D.position.x = -(this.ladoCubo/2 + this.bordeCubo)

		meshPanelRecorte.rotateY(Math.PI/2)
		meshPanelRecorte.position.x = -(this.ladoCubo/2 + this.bordeCubo)

		geoTrapecioRecorte.rotateY(Math.PI/2)
		geoFormaPalanca.rotateY(Math.PI/2)

		csgRecorteCuboExterno.subtract([meshPanelRecorte])
		csgRecorteCuboInterno.subtract([new THREE.Mesh(geoTrapecioRecorte, null),
			new THREE.Mesh(geoFormaPalanca, null)])

		meshPanelRecorte.position.x = 0 // Reset del panel de recorte

		// Añadir y posicionar la palanca
		this.palancaIzquierdaO3D = new THREE.Object3D()
		this.palancaIzquierda = new THREE.Mesh(geoPalanca, this.materialPalanca)
		this.palancaIzquierdaO3D.add(this.palancaIzquierda)

		this.palancaIzquierda.rotateY(0) // TODO ANIMACION De 0 a -Math.PI/2
		this.palancaIzquierdaO3D.translateX(-(this.anchoPalanca/2 - this.separacionGiroPalanca))
		this.palancaIzquierdaO3D.translateZ(-(this.profPalanca/2 + this.bordeCubo + this.separacionPanelPalanca)) // Trasladarla detrás del panel

		this.panelIzquierdoO3D.add(this.palancaIzquierdaO3D)

		//
		// Panel Superior
		//

		this.panelSuperiorO3D = new THREE.Object3D()
		this.panelSuperiorO3D.add(this.crearPanelPrisma(meshPanelBase.clone()))
		this.panelSuperiorO3D.rotateX(-Math.PI/2)
		this.panelSuperiorO3D.translateZ(this.ladoCubo/2 + this.bordeCubo)

		meshPanelRecorte.rotation.y = 0
		meshPanelRecorte.rotateX(Math.PI/2)
		meshPanelRecorte.position.y = this.ladoCubo/2

		// Recortar el fondo prisma negro de la caja interna
		let geoPrismaRecorte = new TriangularPrismGeometry(this.ladoPrisma, this.bordeCubo)
		geoPrismaRecorte.translate(0, this.ladoCubo/2 - this.bordeCubo/2, 0)

		csgRecorteCuboExterno.subtract([meshPanelRecorte])
		csgRecorteCuboInterno.subtract([new THREE.Mesh(geoPrismaRecorte, null)])

		this.meshCuboExterno = csgRecorteCuboExterno.toMesh()
		this.meshCuboInterno = csgRecorteCuboInterno.toMesh()

		//
		// Animación
		//
		this._crearAnimacionQuitarPanel()
		this._crearAnimacionTirarPalanca()

		this.add(this.meshCuboExterno)
		this.add(this.meshCuboInterno)
		this.add(this.panelSuperiorO3D)
		this.add(this.panelDerechoO3D)
		this.add(this.panelTraseroO3D)
		this.add(this.panelIzquierdoO3D)
		this.add(this.panelFrontal)
	}

	crearPanelPrisma(meshPanelBase)
	{
		let csg = new CSG().union([meshPanelBase])

		// Crear el prisma y los rectángulos laterales
		let geoPrisma = new TriangularPrismGeometry(this.ladoPrisma, this.bordeCubo)
		geoPrisma.rotateX(Math.PI/2)
		geoPrisma.translate(0, 0, -this.bordeCubo/2)

		csg.subtract([new THREE.Mesh(geoPrisma, null)])

		// Crear los rectángulos de recorte
		let geoRectRecorteRojo = new BoxGeometry(this.ladoPrisma, this.bordeCubo, this.bordeCubo)
		geoRectRecorteRojo.translate(0, 0, -this.bordeCubo/2)

		let geoRectRecorteVerde = geoRectRecorteRojo.clone()
		let geoRectRecorteAzul = geoRectRecorteRojo.clone()

		geoRectRecorteRojo.translate(0, -(geoPrisma.triangleHeight/2 + this.bordeCubo/2), 0)

		geoRectRecorteAzul.translate(this.ladoPrisma/2, this.bordeCubo/2, 0)
		geoRectRecorteVerde.translate(-this.ladoPrisma/2, this.bordeCubo/2, 0)

		// Rotar los rectángulos
		geoRectRecorteAzul.rotateZ(-Math.PI/3)
		geoRectRecorteVerde.rotateZ(Math.PI/3)

		// Colocarlos
		geoRectRecorteAzul.translate(0, geoPrisma.triangleHeight/2, 0)
		geoRectRecorteVerde.translate(0, geoPrisma.triangleHeight/2, 0)

		this.prismaLatRojo = new THREE.Mesh(geoRectRecorteRojo, this.materialLatPrismaRojo)
		this.prismaLatVerde = new THREE.Mesh(geoRectRecorteVerde, this.materialLatPrismaVerde)
		this.prismaLatAzul = new THREE.Mesh(geoRectRecorteAzul, this.materialLatPrismaAzul)

		csg.subtract([this.prismaLatRojo, this.prismaLatVerde, this.prismaLatAzul])

		let meshPanelSuperior = csg.toMesh()

		meshPanelSuperior.add(this.prismaLatRojo)
		meshPanelSuperior.add(this.prismaLatVerde)
		meshPanelSuperior.add(this.prismaLatAzul)

		// Añadir el fondo negro del prisma
		geoPrisma = geoPrisma.clone()
		geoPrisma.translate(0, 0, -this.bordeCubo)

		this.prismaFondo = new THREE.Mesh(geoPrisma, this.materialFondoPrisma)
		meshPanelSuperior.add(this.prismaFondo)

		//
		// Animación
		//

		//
		// Interacción
		//

		return meshPanelSuperior
	}

	crearPanelTornillos(meshPanelBase)
	{
		let dims = this.infoPanDer

		// 2 3
		// 0 1
		let tornillos = []

		let geoTornillo = new THREE.CylinderGeometry(dims.radioTornillo, dims.radioTornillo, dims.alturaTornillo)
		geoTornillo.translate(0, dims.alturaTornillo/2, 0)
		geoTornillo.rotateX(Math.PI/2)

		// Creamos el mesh // TODO: para la animación se rota este mesh
		let meshTornillo = new THREE.Mesh(geoTornillo, this.materialTornillo)

		meshTornillo.position.set(-this.ladoCubo/2 + dims.radioTornillo, -this.ladoCubo/2 + dims.radioTornillo, 0)
		tornillos.push(meshTornillo)

		meshTornillo = meshTornillo.clone()
		meshTornillo.translateX(this.ladoCubo - dims.radioTornillo*2)
		tornillos.push(meshTornillo)

		meshTornillo = meshTornillo.clone()
		meshTornillo.translateX(-(this.ladoCubo - dims.radioTornillo*2))
		meshTornillo.translateY(this.ladoCubo - dims.radioTornillo*2)
		tornillos.push(meshTornillo)

		meshTornillo = meshTornillo.clone()
		meshTornillo.translateX(this.ladoCubo - dims.radioTornillo*2)
		tornillos.push(meshTornillo)

		for (let i = 0; i < tornillos.length; i++)
			meshPanelBase.add(tornillos[i])

		this.elementosPD.tornillos = tornillos
		this.elementosPD.tornillosRestantes = tornillos.length

		//
		// Animación
		//
		this._crearAnimacionPanelTornillos(meshPanelBase)

		//
		// Interacción
		//
		let metodoInteraccion = this._desatornillar.bind(this)

		for (let i = 0; i < tornillos.length; i++)
			tornillos[i].userData.interaction = {
				interact: (event) => metodoInteraccion(event, i)
			}

		return meshPanelBase
	}

	_crearAnimacionPanelTornillos(meshPanel)
	{
		this.elementosPD.animacion = {
			animacion: null,
			tornillo: null
		}

		let frameInicio = {
			r: 0,
			p: 0,
			zInicio: 0
		}

		let frameFin = {
			r: 2*Math.PI,
			p: this.infoPanDer.alturaTornillo*2 // TODO: Esta cantidad debería ser el fondo del tornillo
		}

		this.elementosPD.animacion.desatornillar = new TWEEN.Tween(frameInicio).to(frameFin, 1000)
			.onStart(() => {
				this._animating = true
				frameInicio.zInicio = this.elementosPD.animacion.tornillo.position.z

				// TODO: Añadir el destornillador como hijo de este mesh
			})
			.onUpdate(() => {
				this.elementosPD.animacion.tornillo.rotation.z = frameInicio.r
				this.elementosPD.animacion.tornillo.position.z = frameInicio.zInicio + frameInicio.p
			})
			.onComplete(() => {
				frameInicio.r = 0
				frameInicio.p = 0

				// TODO: Sacar el destornillador como hijo de este mesh

				meshPanel.remove(this.elementosPD.animacion.tornillo)
				this.elementosPD.tornillosRestantes--

				if (this.elementosPD.tornillosRestantes <= 0)
				{
					console.log("Panel Tornillos Resuelto")
					this._quitarPanel(0)
				}
				else
				{
					this._animating = false

					// TODO: Desbloquear el input
				}
			})
	}

	crearPanelTarjeta(meshPanelBase)
	{
		let geoLectorTarjeta = new THREE.BoxGeometry(this.infoPanIzd.anchoLector,
			this.infoPanIzd.altoLector, this.infoPanIzd.profLector)

		let meshLectorTarjeta = new THREE.Mesh(geoLectorTarjeta, this.materialLectorTarjetas)
		meshLectorTarjeta.position.z = this.infoPanIzd.profLector/2

		meshPanelBase.add(meshLectorTarjeta)

		let O3DTarjeta = new THREE.Object3D()
		O3DTarjeta.translateY(this.infoPanIzd.altoLector/2)

		meshLectorTarjeta.add(O3DTarjeta)

		//
		// Animación
		//

		this._crearAnimacionPanelTarjeta(meshPanelBase, O3DTarjeta)

		//
		// Interacción
		//
		let metodoInteraccion = this._pasarTarjeta.bind(this)

		meshPanelBase.userData.interaction = {
			interact: metodoInteraccion
		}

		meshLectorTarjeta.userData.interaction = {
			interact: metodoInteraccion
		}

		return meshPanelBase
	}

	_crearAnimacionPanelTarjeta(meshPanelBase, O3DTarjeta)
	{
		this.animaciones.pasarTarjeta = {
			animacion: null,
			O3DTarjeta: O3DTarjeta
		}

		let tarjeta = GameState.items.tarjeta

		O3DTarjeta.position.y += tarjeta.altoTarjeta/2 - tarjeta.altoBarraLectura

		let frameInicio = {p: -this.infoPanIzd.anchoLector/2}
		let frameFin = {p: this.infoPanIzd.anchoLector/2}

		this.animaciones.pasarTarjeta.animacion = new TWEEN.Tween(frameInicio).to(frameFin, 1000)
			.easing(TWEEN.Easing.Cubic.In)
			.onStart(() => {
				// Añadir la tarjeta como hija
				O3DTarjeta.add(tarjeta)
			})
			.onUpdate(() => {
				O3DTarjeta.position.x = frameInicio.p
			})
			.onComplete(() => {
				console.log("Panel Tarjeta Resuelto")

				// Ordenar quitar el panel
				this._quitarPanel(1)
			})
	}

	crearPanelCodigo(meshPanelBase)
	{
		let dims = this.infoPanTras

		let geoKeypad = new THREE.BoxGeometry(dims.anchoTeclado + 2*dims.bordeTeclado,
			dims.altoTeclado + 2*dims.bordeTeclado, dims.profTeclado)
		geoKeypad.translate(0, 0, dims.profTeclado/2)

		meshPanelBase.add(new THREE.Mesh(geoKeypad, this.materialKeypad))

		// Añadir la pantalla del keypad

		// Calcular la dimensión de los botones
		// Los botones se separan la mitad del borde entre ellos
		let anchoBoton = (dims.anchoTeclado - dims.bordeTeclado)/3
		let altoBoton = (dims.altoTeclado - (dims.altoPantalla + dims.bordeTeclado + 3*dims.bordeTeclado/2))/4

		let geoBoton = new THREE.BoxGeometry(anchoBoton, altoBoton, dims.profBoton)
		geoBoton.translate(0, 0, dims.profBoton/2)

		// TODO: El material luego habrá que ponerlo a su correspondiente
		let botonMesh = new THREE.Mesh(geoBoton, null)
		botonMesh.position.z += dims.profTeclado
		botonMesh.position.x += anchoBoton/2 - dims.anchoTeclado/2
		botonMesh.position.y += altoBoton/2 - dims.altoTeclado/2

		//	7	8	9		// 9 10 11
		//	4	5	6		// 6 7 8
		//	1	2	3		// 3 4 5
		// 	OK	0	C		// 0 1 2

		this.elementosPT.botones = []
		let nombreBotones = ["OK", "0", "C", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

		const botonPosXInicial = botonMesh.position.x

		for (let i = 1; i <= dims.numBotones; i++)
		{
			botonMesh.name = nombreBotones[i-1]
			botonMesh.material = this.materialKeypadTeclas[i-1]
			botonMesh.material.needsUpdate = true

			meshPanelBase.add(botonMesh)
			this.elementosPT.botones.push(botonMesh)

			// Preparar el siguiente
			botonMesh = botonMesh.clone()
			botonMesh.material = null
			botonMesh.position.x += anchoBoton + dims.bordeTeclado/2

			if (i%3 === 0)
			{
				botonMesh.position.x = botonPosXInicial
				botonMesh.position.y += altoBoton + dims.bordeTeclado/2
			}
		}

		// Crear el panel
		let geoPantalla = new THREE.BoxGeometry(dims.anchoTeclado, dims.altoPantalla, dims.profPantalla)
		geoPantalla.translate(0, dims.altoTeclado/2 - dims.altoPantalla/2, dims.profTeclado)

		let meshPantalla = new THREE.Mesh(geoPantalla, this.materialKeypadPant)

		meshPanelBase.add(meshPantalla)

		//
		// Animación
		//
		this._crearAnimacionPanelCodigo(meshPanelBase)

		//
		// Interacción
		//

		let metodoInteraccion = this._pulsarTeclaKeypad.bind(this)

		for (let i = 0; i < dims.numBotones; i++)
		{
			let boton = this.elementosPT.botones[i]

			boton.userData.interaction = {
				interact: (event) => metodoInteraccion(event, i)
			}
		}

		return meshPanelBase
	}

	_crearAnimacionPanelCodigo(meshPanelBase)
	{
		this.animaciones.keypad = {
			boton: null,
			codigoActual: "",
			animacion: null
		}

		let frameEmpiezaPulsar = {sZ: 1} // Oscurecer el color
		let framePulsado = {sZ: 0.5} // Restaurar el color

		let animacionPulsar = new TWEEN.Tween(frameEmpiezaPulsar).to(framePulsado, 250)
			.onStart(() => {
				// Oscurecer el material
				this.animaciones.keypad.boton.material.color.set(0x88ff88) // TODO: El original será blanco y este gris
			})
			.onUpdate(() => {
				this.animaciones.keypad.boton.scale.z = frameEmpiezaPulsar.sZ
			})
			.onComplete(() => {
				frameEmpiezaPulsar.sZ = 1

				// Comprobaciones sobre el botón pulsado
				switch (this.animaciones.keypad.boton.name)
				{
					case "OK":
						if (this.animaciones.keypad.codigoActual === GameState.tmp.keypadCode)
						{
							this._quitarPanel(2)
						}
						else
						{
							// Limpiar la pantalla y actualizar la textura haciendo una animación
							this.animaciones.keypad.codigoActual = ""
							console.log("Codigo erroneo")
						}
						break;
					case "C":
						// Limpiar la pantalla y actualizar la textura haciendo una animación
						this.animaciones.keypad.codigoActual = ""
						console.log("Limpio pantalla")
						break;
					default:
						this.animaciones.keypad.codigoActual += this.animaciones.keypad.boton.name

						if (this.animaciones.keypad.codigoActual.length > GameState.tmp.keypadCode.length)
						{
							// Limpiar la pantalla y actualizar la textura haciendo una animación
							this.animaciones.keypad.codigoActual = ""
							console.log("Codigo erroneo")
						}

						console.log("Actualizo la pantalla")

						break;
				}
			})

		let animacionDespulsar = new TWEEN.Tween(framePulsado).to(frameEmpiezaPulsar, 150)
			.onStart(() => {
				//console.log(this.animaciones.keypad.boton.material)
				this.animaciones.keypad.boton.material.color.set(0x55ff55)
			})
			.onUpdate(() => {
				this.animaciones.keypad.boton.scale.z = framePulsado.sZ
			})
			.onComplete(() => {
				framePulsado.sZ = 0.5
				this._animating = false
			})

		animacionPulsar.chain(animacionDespulsar)
		this.animaciones.keypad.animacion = animacionPulsar
	}

	crearPanelOrdenador(geoPanel)
	{
		//
		// Animación
		//

		//
		// Interacción
		//

		return new THREE.Mesh(geoPanel, this.material)
	}

	_crearAnimacionQuitarPanel()
	{
		this.animaciones.quitarPanel = {
			panel: null,
			animacion: null
		}

		let frameInicio = {
			pZ: 0,
			miPosZ: 0
		}

		let frameFuera = {
			pZ: 3*this.bordeCubo, // TODO: Asegurar que no se meta en la cámara
			pX: 0,
			miPosX: 0
		}

		let frameMover = {
			pX: 3*this.ladoCubo // TODO: Asegurar que está fuera de la cámara
		}

		let animacionSacar = new TWEEN.Tween(frameInicio).to(frameFuera, 1000)
			.onStart(() => {
				frameInicio.miPosZ = this.animaciones.quitarPanel.panel.position.z
			})
			.onUpdate(() => {
				this.animaciones.quitarPanel.panel.position.z = frameInicio.miPosZ + frameInicio.pZ
			})
			.onComplete(() => {
				frameInicio.pz = 0
			})

		let animacionMover = new TWEEN.Tween(frameFuera).to(frameMover, 1000)
			.onStart(() => {
				frameFuera.miPosX = this.animaciones.quitarPanel.panel.position.x
			})
			.onUpdate(() => {
				this.animaciones.quitarPanel.panel.position.x = frameFuera.miPosX + frameFuera.pX
			})
			.onComplete(() => {
				frameFuera.pX = 0
				this.animaciones.quitarPanel.panel.parent.remove(this.animaciones.quitarPanel.panel)

				// TODO: Desbloquear el input
				this._animating = false
			})

		animacionSacar.chain(animacionMover)

		this.animaciones.quitarPanel.animacion = animacionSacar
	}

	_crearAnimacionTirarPalanca()
	{
		this.animaciones.palancas = {
			palanca: null,
			pasillo: null,
			animacion: null
		}

		let frameInicio = {r: 0}
		let frameFin = {r: -Math.PI/2}

		let animacionTirar = new TWEEN.Tween(frameInicio).to(frameFin, 750)
			.easing(TWEEN.Easing.Cubic.In)
			.onUpdate(() => {
				this.animaciones.palancas.palanca.rotation.y = frameInicio.r
			})
			.onComplete(() => {
				frameInicio.r = 0

				// TODO: Desbloquear el input

				// Iniciar la animación de abrir la puerta
				this.animaciones.palancas.pasillo.desbloquear()
			})

		let animacionSoltar = new TWEEN.Tween(frameFin).to(frameInicio, 1500)
			.easing(TWEEN.Easing.Cubic.In)
			.onUpdate(() => {
				this.animaciones.palancas.palanca.rotation.y = frameFin.r
			})
			.onComplete(() => {
				frameFin.r = -Math.PI/2

				// Ya no se podrá interactuar con esta palanca
				this.animaciones.palancas.palanca.userData = {}

				this._animating = false
			})

		animacionTirar.chain(animacionSoltar)

		this.animaciones.palancas.animacion = animacionTirar

		//
		// Interacción de las palantas
		//

		let metodoInteraccion = this._tirarPalanca.bind(this)

		this.palancaDerecha.userData.interaction = {
			interact: (event) => { metodoInteraccion(this.palancaDerecha, GameState.salas.salaPrincipal.pasilloIzquierda) }
		}

		this.palancaIzquierda.userData.interaction = {
			interact: (event) => { metodoInteraccion(this.palancaIzquierda, GameState.salas.salaPrincipal.pasilloDerecha) }
		}

		this.palancaTrasera.userData.interaction = {
			interact: (event) => { metodoInteraccion(this.palancaTrasera, GameState.salas.salaPrincipal.pasilloSuperior) }
		}
	}

	_desatornillar(event, numTornillo)
	{
		if (GameState.flags.tieneDestornillador === false)
			return

		// TODO
		if (this._animating)
			return

		// TODO: Bloquear el input

		this.elementosPD.animacion.tornillo = this.elementosPD.tornillos[numTornillo]
		this.elementosPD.animacion.desatornillar.start()
	}

	_pasarTarjeta(event)
	{
		if (GameState.flags.tieneTarjeta === false)
			return

		if (this._animating)
			return

		this._animating = true

		// TODO: Bloquear el input
		this.animaciones.pasarTarjeta.animacion.start()
	}

	_pulsarTeclaKeypad(event, numBoton)
	{
		if (this._animating)
			return

		this._animating = true

		// TODO: Bloquear el input
		this.animaciones.keypad.boton = this.elementosPT.botones[numBoton]
		this.animaciones.keypad.animacion.start()
	}

	// PRE: Si se llama varias veces dará resultados inesperados
	_quitarPanel(numPanel) // 0 derecha, 1 izda, 2 sup
	{
		// TODO: Bloquear el input

		let meshPadre = null

		switch (numPanel)
		{
			case 0:
				meshPadre = this.panelDerechoO3D
				break
			case 1:
				meshPadre = this.panelIzquierdoO3D
				break
			case 2:
				meshPadre = this.panelTraseroO3D
				break
			default:
				return
		}

		this.animaciones.quitarPanel.panel = meshPadre.getObjectByName("Panel")
		this.animaciones.quitarPanel.animacion.start()
	}

	_tirarPalanca(meshPalanca, pasillo)
	{
		if (this._animating)
			return

		this._animating = true

		this.animaciones.palancas.palanca = meshPalanca
		this.animaciones.palancas.pasillo = pasillo
		this.animaciones.palancas.animacion.start()
	}
}

export {CuboCentral}
