
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"
import {TrapezoidGeometry} from "../geometry/TrapezoidGeometry.js"
import {TriangularPrismGeometry} from "../geometry/PrismGeometry.js"
import {BoxGeometry} from "../../libs/three.module.js"

class CuboCentral extends THREE.Object3D
{
	constructor(dimensiones = {
		// Parte interna
		ladoCubo: 15,
		bordeCubo: 1, // Borde por todos los lados. Además, es el grueso del panel

		separacionPanelPalanca: 2, // Hueco entre el panel y la palanca
		anchoPalanca: 6,
		altoPalanca: 2,
		profPalanca: 1,
		separacionTirPalanca: 1, // Separación desde la derecha
		anchoTirPalanca: 1,
		altoTirPalanca: 1.5,
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

		this.material = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialBordesCubo = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialPanel = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialCuboInterno = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})
		this.materialPalanca = new THREE.MeshBasicMaterial({color: 0x334455})

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

		// La palanca se rotará 45º y se centrará por el mesh que la tenga. Se enganchará al
		// mesh del panel para que esté bien colocada
		geoPalanca.translate(this.anchoPalanca/2 - this.separacionGiroPalanca, 0, 0)

		/*geoPalanca.rotateY(Math.PI/4)
		this.add(new THREE.Mesh(geoPalanca, this.materialPalanca))
		return*/
		let csgRecorteCuboInterno = new CSG().union([new THREE.Mesh(geoCuboInterno, this.materialCuboInterno)])

		//
		// FRONTAL (Sólo recortamos el panel al externo)
		//
		this.panelFrontal = meshPanelBase.clone()
		this.panelFrontal.position.z = this.ladoCubo/2 + this.bordeCubo

		csgRecorteCuboExterno.subtract([this.panelFrontal])

		//
		// Panel Derecha
		//

		this.panelDerechoO3D = new THREE.Object3D()
		this.panelDerechoO3D.add(meshPanelBase.clone())
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
		this.panelTraseroO3D.add(meshPanelBase.clone())
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
		this.panelIzquierdoO3D.add(meshPanelBase.clone())
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
		this.panelSuperiorO3D.add(meshPanelBase.clone())
		this.panelSuperiorO3D.rotateX(-Math.PI/2)
		this.panelSuperiorO3D.translateZ(this.ladoCubo/2 + this.bordeCubo)

		meshPanelRecorte.rotation.y = 0
		meshPanelRecorte.rotateX(Math.PI/2)
		meshPanelRecorte.position.y = this.ladoCubo/2

		csgRecorteCuboExterno.subtract([meshPanelRecorte])

		let geoPrisma = new TriangularPrismGeometry(5, 10)
		geoPrisma.rotateX(Math.PI/2)
		geoPrisma.translate(0, 0, geoPrisma.height/2)

		this.panelSuperiorO3D.add(new THREE.Mesh(geoPrisma, this.materialPalanca))

		// Creamos el panel superior (será un mesh totalmente diferente)

		this.add(csgRecorteCuboExterno.toMesh())
		this.add(csgRecorteCuboInterno.toMesh())

		this.add(this.panelSuperiorO3D)

		/*this.add(this.panelDerechoO3D)
		this.add(this.panelTraseroO3D)
		this.add(this.panelIzquierdoO3D)*/
	}

	aplicarPalancas(geoCuboInterno, meshPalanca)
	{
		let csg = new CSG().union[new THREE.Mesh(geoCuboInterno, this.material)]
	}

	crearPanelTornillos()
	{

	}

	crearPanelTarjeta()
	{

	}

	crearPanelCodigo()
	{

	}

	crearPanelPrisma()
	{

	}

	crearPanelOrdenador()
	{

	}
}

export {CuboCentral}
