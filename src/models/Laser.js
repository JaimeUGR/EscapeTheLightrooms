
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"
import {GameState} from "../GameState.js"
import {SistemaColisiones} from "../systems/SistemaColisiones.js"

class Laser extends THREE.Object3D
{
	constructor(dimensiones = {
		radioSoporte: 5,
		radioLaser: 4,
		alturaSoporte: 20,
		alturaLaser: 10,
		radioHuecoLaser: 0.25, // NOTE: El hueco se abre hasta la mitad del radio del laser
		tiempoAnimacionActivacion: 5000,
	})
	{
		super()

		this.radioSoporte = dimensiones.radioSoporte
		this.radioLaser = dimensiones.radioLaser
		this.alturaSoporte = dimensiones.alturaSoporte
		this.alturaLaser = dimensiones.alturaLaser
		this.radioHuecoLaser = dimensiones.radioHuecoLaser

		this.tiempoActivacion = dimensiones.tiempoAnimacionActivacion
		this.activado = false

		this.baseCollider = null

		this.materialSoporte = new THREE.MeshNormalMaterial({opacity: 0.5, transparent: true})
		this.materialLaser = new THREE.MeshNormalMaterial({opacity: 0.5, transparent: true})
		this.materialHaz = new THREE.MeshBasicMaterial({color: 0xFFFFFF})

		this.haz = null
		this.callbackCambioColor = null

		//
		// Soporte
		//

		let geoSoporte = new THREE.CylinderGeometry(this.radioSoporte, this.radioSoporte, this.alturaSoporte)

		geoSoporte.translate(0, -(this.alturaSoporte/2 + this.alturaLaser/2), 0)
		this.add(new THREE.Mesh(geoSoporte.clone(), this.materialSoporte))

		geoSoporte.translate(0, this.alturaSoporte, 0)

		this.meshSoporteSuperior = new THREE.Mesh(geoSoporte, this.materialSoporte)
		this.add(this.meshSoporteSuperior)

		//
		// Láser
		//

		let geoLaser = new THREE.CylinderGeometry(this.radioLaser, this.radioLaser, this.alturaLaser)

		let geoRecorteLaser = new THREE.CylinderGeometry(this.radioHuecoLaser, this.radioHuecoLaser, this.radioLaser)
		geoRecorteLaser.rotateX(Math.PI/2)
		geoRecorteLaser.translate(0, 0, this.radioLaser/2)

		let csg = new CSG().union([new THREE.Mesh(geoLaser, this.materialLaser)])
			.subtract([new THREE.Mesh(geoRecorteLaser, null)])

		let meshRecorteLaser = csg.toMesh()

		let O3HazLaser = new THREE.Object3D() // NOTE: A este O3 se le engancha directamete el cilindro del haz
		meshRecorteLaser.add(O3HazLaser)

		this.add(meshRecorteLaser)

		//
		// Animaciones
		//

		this._crearAnimaciones()

		//
		// Colisiones
		//

		this._crearColliders()
	}

	_crearAnimaciones()
	{
		this.animaciones = {}
		this.animaciones.activacion = {
			animacion: null
		}

		let frameDesactivado = { tY: 0 }
		let frameActivado = { tY: this.alturaLaser }

		this.animaciones.activacion.animacion = new TWEEN.Tween(frameDesactivado).to(frameActivado, this.tiempoActivacion)
			.onUpdate(() => {
				this.meshSoporteSuperior.position.y = frameDesactivado.tY
			})
			.onComplete(() => {
				this.haz.visible = true
				this.activado = true

				// TODO: TMP
				if (this.callbackCambioColor !== null)
					this.callbackCambioColor()
			})
	}

	activarLaser()
	{
		if (this.activado)
		{
			console.error("El laser ya está activo")
			return
		}

		this.animaciones.activacion.animacion.start()
	}

	setHaz(largoHaz, visible = false)
	{
		if (this.haz !== null)
		{
			console.error("Has intentado setear un haz ya colocado")
			return
		}

		let geoHaz = new THREE.CylinderGeometry(this.radioHuecoLaser, this.radioHuecoLaser, largoHaz)
		geoHaz.rotateX(Math.PI/2)
		geoHaz.translate(0, 0, largoHaz/2)

		this.haz = new THREE.Mesh(geoHaz, this.materialHaz)
		this.haz.visible = visible

		this.add(this.haz)
	}

	setCallbackCambioColor(callback)
	{
		this.callbackCambioColor = callback
	}

	cambiarHaz(hexColor, visible = false)
	{
		if (this.haz === null)
		{
			console.error("Has intentado cambiar un haz antes de setearlo")
			return
		}

		this.materialHaz.color.setHex(hexColor)
		this.materialHaz.needsUpdate = true
		this.haz.visible = visible

		if (this.callbackCambioColor !== null)
			this.callbackCambioColor()
	}

	updateColliders()
	{
		let colSys = GameState.systems.collision

		// Añado mis colliders
		this.updateMatrixWorld(true)
		colSys.aniadeRectColliders(this.uuid,
			SistemaColisiones.Box3ArrayToRectArray([this.baseCollider], this.matrixWorld))
	}

	_crearColliders()
	{
		let tmpMin = new THREE.Vector3(-this.radioSoporte, 0, -this.radioSoporte)
		let tmpMax = new THREE.Vector3(this.radioSoporte, 0, this.radioSoporte)

		this.baseCollider = new THREE.Box3(tmpMin, tmpMax)
	}
}

export {Laser}
