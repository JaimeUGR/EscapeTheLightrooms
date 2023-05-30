
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"
import {TrapezoidGeometry} from "../geometry/TrapezoidGeometry.js"
import {GameState} from "../GameState.js"

class Reloj extends THREE.Object3D
{
	constructor(dimensiones = {
		// Dimensiones de la caja (sin los pilares)
		cajaX: 12,
		cajaY: 20,
		cajaZ: 10,

		// Dimensiones pilares
		pilarX: 2,
		pilarZ: 2,

		// Dimensiones de la parte interna
		cajaRelojX: 11, // < cajaX. El restante va para los marcos de los lados
		separacionPuertaReloj: 4, // < cajaZ. El restante es para colocar el reloj separado de la puerta
		profundidadPuertaReloj: 1, // < cajaZ - profReloj - cajaRelojZ

		// Dimensiones del reloj
		separacionSuperiorReloj: 2, // Separación de la zona superior de la caja
		radioReloj: 4,
		profundidadReloj: 1.5,

		radioPaloPendulo: 0.2,
		altoPaloPendulo: 6, // < que cajaY + 2*radioReloj o se verá mal

		radioPendulo: 2,
		profundidadPendulo: 0.75,

		tiempoPendulo: 1000, // Tiempo de la animación
		rotacionPendulo: Math.PI/11, // Máxima y mínima rotación del péndulo al girar

		// Bases
		// NOTE: La X y Z son sobresalientes de las dimensiones de la caja + 2*pilar
		trapecioSuperior: {
			XSup: 4,
			ZSup: 4,
			XInf: 2,
			ZInf: 2,
			Y: 2,
		},
		trapecioInferior: {
			XSup: 2,
			ZSup: 2,
			XInf: 10,
			ZInf: 10,
			Y: 20,
		},
	})
	{
		super()

		this.cajaX = dimensiones.cajaX
		this.cajaY = dimensiones.cajaY
		this.cajaZ = dimensiones.cajaZ

		this.pilarX = dimensiones.pilarX
		this.pilarZ = dimensiones.pilarZ

		this.cajaRelojX = dimensiones.cajaRelojX
		this.separacionPuertaReloj = dimensiones.separacionPuertaReloj
		this.profundidadPuertaReloj = dimensiones.profundidadPuertaReloj

		this.separacionSuperiorReloj = dimensiones.separacionSuperiorReloj
		this.radioReloj = dimensiones.radioReloj
		this.profundidadReloj = dimensiones.profundidadReloj

		this.radioPaloPendulo = dimensiones.radioPaloPendulo
		this.altoPaloPendulo = dimensiones.altoPaloPendulo

		this.radioPendulo = dimensiones.radioPendulo
		this.profundidadPendulo = dimensiones.profundidadPendulo

		this.tiempoPendulo = dimensiones.tiempoPendulo
		this.rotacionPendulo = dimensiones.rotacionPendulo

		this.trapSup = dimensiones.trapecioSuperior
		this.trapInf = dimensiones.trapecioInferior

		this.material = new THREE.MeshNormalMaterial({opacity: 0.5, transparent: true})

		this.tieneManecillaHora = false
		this.tieneManecillaMinuto = false

		//
		// Bases
		//

		let extraBaseTrapeciosX = this.cajaX + 2*this.pilarX
		let extraBaseTrapeciosZ = this.cajaZ + 2*this.pilarZ

		let geoTrapecioSuperior = new TrapezoidGeometry(this.trapSup.XInf + extraBaseTrapeciosX,
			this.trapSup.ZInf + extraBaseTrapeciosZ, this.trapSup.XSup + extraBaseTrapeciosX,
			this.trapSup.ZSup + extraBaseTrapeciosZ, this.trapSup.Y)
		geoTrapecioSuperior.translate(0, this.cajaY/2 + this.trapSup.Y/2, 0)

		let geoTrapecioInferior = new TrapezoidGeometry(this.trapInf.XInf + extraBaseTrapeciosX,
			this.trapInf.ZInf + extraBaseTrapeciosZ, this.trapInf.XSup + extraBaseTrapeciosX,
			this.trapInf.ZSup + extraBaseTrapeciosZ, this.trapInf.Y)
		geoTrapecioInferior.translate(0, -(this.cajaY/2 + this.trapInf.Y/2), 0)

		this.add(new THREE.Mesh(geoTrapecioSuperior, this.material))
		this.add(new THREE.Mesh(geoTrapecioInferior, this.material))

		//
		// Pilares
		//

		let geoPilar = new THREE.BoxGeometry(this.pilarX, this.cajaY, this.pilarZ)

		geoPilar.translate(-(this.cajaX/2 + this.pilarX/2), 0, this.cajaZ/2 + this.pilarZ/2)
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		geoPilar.translate(this.cajaX + this.pilarX, 0, 0)
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		geoPilar.translate(0, 0, -(this.cajaZ + this.pilarZ))
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		geoPilar.translate(-(this.cajaX + this.pilarX), 0, 0)
		this.add(new THREE.Mesh(geoPilar.clone(), this.material))

		//
		// Caja Interna
		//

		// Caja Interna del reloj
		let geoCajaReloj = new THREE.BoxGeometry(this.cajaRelojX, this.cajaY, this.cajaZ - this.separacionPuertaReloj)
		geoCajaReloj.translate(0, 0, -(this.separacionPuertaReloj/2))

		this.add(new THREE.Mesh(geoCajaReloj, this.material))

		// Cajas Laterales
		let geoCajaRelojLateral = new THREE.BoxGeometry((this.cajaX - this.cajaRelojX)/2, this.cajaY, this.cajaZ)

		geoCajaRelojLateral.translate(-(this.cajaRelojX/2 + (this.cajaX - this.cajaRelojX)/4), 0, 0)
		this.add(new THREE.Mesh(geoCajaRelojLateral.clone(), this.material))

		geoCajaRelojLateral.translate(this.cajaRelojX + (this.cajaX - this.cajaRelojX)/2, 0, 0)
		this.add(new THREE.Mesh(geoCajaRelojLateral.clone(), this.material))

		//
		// Péndulo
		//
		this._crearPendulo()

		//
		// Puerta reloj
		//
		this._crearPuertaReloj()


		//
		// Animación
		//

		this._crearAnimacion()

		//
		// Interacción
		//

		this.meshPuertaReloj.traverse((anyNode) => {
			anyNode.userData.interaction = {
				interact: this.interactuarPuerta.bind(this)
			}
		})

		this.meshReloj.userData.interaction = {
			interact: this.ponerManecillas.bind(this)
		}
	}

	_crearPendulo()
	{
		let geoReloj = new THREE.CylinderGeometry(this.radioReloj, this.radioReloj, this.profundidadReloj, 20)
		geoReloj.rotateX(Math.PI/2)
		geoReloj.translate(0, this.cajaY/2 - (this.radioReloj + this.separacionSuperiorReloj),
			this.cajaZ/2 - this.separacionPuertaReloj + this.profundidadReloj/2)

		let meshReloj = new THREE.Mesh(geoReloj, this.material)

		// NOTE: A este O3 se meten directamente las agujas
		this.O3Agujas = new THREE.Object3D()
		this.O3Agujas.translateZ(this.profundidadReloj/2)

		meshReloj.add(this.O3Agujas)

		this.meshReloj = meshReloj
		this.add(meshReloj)

		//
		// Péndulo
		//

		let O3Pendulo = new THREE.Object3D()

		let alturaPaloPendulo = this.altoPaloPendulo + this.radioPendulo + this.radioReloj
		let geoPaloPendulo = new THREE.CylinderGeometry(this.radioPaloPendulo, this.radioPaloPendulo,
			alturaPaloPendulo)

		geoPaloPendulo.translate(0, -alturaPaloPendulo/2, 0)

		let geoPendulo = new THREE.CylinderGeometry(this.radioPendulo, this.radioPendulo, this.profundidadPendulo, 15)
		geoPendulo.rotateX(Math.PI/2)
		geoPendulo.translate(0, -alturaPaloPendulo , 0)

		O3Pendulo.add(new THREE.Mesh(geoPaloPendulo, this.material))
		O3Pendulo.add(new THREE.Mesh(geoPendulo, this.material))

		O3Pendulo.translateY(alturaPaloPendulo/2 - this.separacionSuperiorReloj/2)
		O3Pendulo.translateZ(this.cajaZ/2 - this.separacionPuertaReloj + this.profundidadReloj/2)

		this.O3Pendulo = O3Pendulo
		this.add(O3Pendulo)
	}

	_crearPuertaReloj()
	{
		let geoPuertaReloj = new THREE.BoxGeometry(this.cajaRelojX, this.cajaY, this.profundidadPuertaReloj)
		geoPuertaReloj.translate(this.cajaRelojX/2, 0, 0)

		let geoRelojRecorte = new THREE.CylinderGeometry(this.radioReloj, this.radioReloj, this.profundidadPuertaReloj, 20)
		geoRelojRecorte.rotateX(Math.PI/2)
		geoRelojRecorte.translate(this.cajaRelojX/2, this.cajaY/2 - this.separacionSuperiorReloj - this.radioReloj, 0)

		let geoCajaRecorte = new THREE.BoxGeometry(2*this.radioPendulo, this.cajaY - (this.separacionSuperiorReloj + this.radioReloj) , this.profundidadPuertaReloj)
		geoCajaRecorte.translate(this.cajaRelojX/2, -(this.separacionSuperiorReloj/2 + this.radioReloj/2), 0)

		// Puerta
		let csg = new CSG().union([new THREE.Mesh(geoPuertaReloj, this.material)])
			.subtract([new THREE.Mesh(geoRelojRecorte, null), new THREE.Mesh(geoCajaRecorte, null)])

		let meshPuertaReloj = csg.toMesh()

		// TODO: Animación de rotación uwu
		meshPuertaReloj.rotation.y = 0

		meshPuertaReloj.translateX(-this.cajaRelojX/2)
		meshPuertaReloj.translateZ(this.cajaZ/2 - this.profundidadPuertaReloj/2)

		// Puerta Cristal
		csg = new CSG().union([new THREE.Mesh(geoRelojRecorte, this.material),
			new THREE.Mesh(geoCajaRecorte, this.material)])

		meshPuertaReloj.add(csg.toMesh())

		this.meshPuertaReloj = meshPuertaReloj
		this.add(meshPuertaReloj)
	}

	_crearAnimacion()
	{
		this._animating = false
		this.animaciones = {}

		this.animaciones.pendulo = {
			animacion: null
		}

		this.animaciones.puerta = {
			animacionAbrir: null,
			animacionCerrar: null,
			estadoPuerta: 1 // 1 cerrada, 0 abierta
		}

		this.animaciones.manecillas = {
			animacionManecillaHora: null,
			animacionManecillaMinuto: null
		}

		//
		// Péndulo
		//

		{
			let framePendulo_Izda = { rZ: -this.rotacionPendulo }
			let framePendulo_Dcha = { rZ: this.rotacionPendulo }

			let animacionIzdaDcha = new TWEEN.Tween(framePendulo_Izda).to(framePendulo_Dcha, this.tiempoPendulo)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onUpdate(() => {
					this.O3Pendulo.rotation.z = framePendulo_Izda.rZ
				})
				.onComplete(() => {
					framePendulo_Izda.rZ = -this.rotacionPendulo
				})

			let animacionDchaIzda = new TWEEN.Tween(framePendulo_Dcha).to(framePendulo_Izda, this.tiempoPendulo)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onUpdate(() => {
					this.O3Pendulo.rotation.z = framePendulo_Dcha.rZ
				})
				.onComplete(() => {
					framePendulo_Dcha.rZ = this.rotacionPendulo
				})

			animacionIzdaDcha.chain(animacionDchaIzda)
			animacionDchaIzda.chain(animacionIzdaDcha)

			this.animaciones.pendulo.animacion = animacionIzdaDcha
			animacionIzdaDcha.start()
		}

		//
		// Puerta
		//
		{
			let framePuertaCerrada = { rY: 0 }
			let framePuertaAbierta = { rY: -Math.PI/2 }

			let animacionAbrir = new TWEEN.Tween(framePuertaCerrada).to(framePuertaAbierta, 900)
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					this.meshPuertaReloj.rotation.y = framePuertaCerrada.rY
				})
				.onComplete(() => {
					this.animaciones.puerta.estadoPuerta = 0
					framePuertaCerrada.rY = 0
					this._animating = false
				})

			let animacionCerrar = new TWEEN.Tween(framePuertaAbierta).to(framePuertaCerrada, 800)
				.easing(TWEEN.Easing.Cubic.Out)
				.onUpdate(() => {
					this.meshPuertaReloj.rotation.y = framePuertaAbierta.rY
				})
				.onComplete(() => {
					this.animaciones.puerta.estadoPuerta = 1
					framePuertaAbierta.rY = -Math.PI/2
					this._animating = false
				})

			this.animaciones.puerta.animacionAbrir = animacionAbrir
			this.animaciones.puerta.animacionCerrar = animacionCerrar
		}
	}

	interactuarPuerta()
	{
		if (this._animating)
			return

		this._animating = true

		if (this.animaciones.puerta.estadoPuerta === 1) // Cerrada
			this.animaciones.puerta.animacionAbrir.start()
		else
			this.animaciones.puerta.animacionCerrar.start()
	}

	ponerManecillas()
	{
		if (this._animating)
			return

		if (GameState.flags.tieneManecillaHora)
		{
			GameState.flags.tieneManecillaHora = false
			this.tieneManecillaHora = true

			this._animating = true
		}
		else if (GameState.flags.tieneManecillaMinuto)
		{
			GameState.flags.tieneManecillaMinuto = false
			this.tieneManecillaMinuto = true

			this._animating = true
		}

		// Si están ambas manecillas
		if (this.tieneManecillaHora && this.tieneManecillaMinuto)
		{
			this.meshReloj.userData = {}

			console.log("Has completado el reloj")

			// Poner la animación de apartar el reloj para dejar ver la nota
		}
	}
}

class ManecillaHoras extends THREE.Object3D
{
	constructor(dimensiones = {
		separacion: 1
	})
	{
		super()

		this.separacion = dimensiones.separacion
		this.material = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		let formaManecillaHoras= new THREE.Shape()

		formaManecillaHoras.moveTo(1,0)
		formaManecillaHoras.lineTo(1,6)
		formaManecillaHoras.quadraticCurveTo(2,7,2,8)
		formaManecillaHoras.quadraticCurveTo(2,9, 1, 10)
		formaManecillaHoras.bezierCurveTo(0.5, 11.5, 0.5, 13.5,0.5, 14)
		formaManecillaHoras.quadraticCurveTo(0 ,15, -0.5, 14)
		formaManecillaHoras.bezierCurveTo(-0.5, 13.5, -0.5, 11.5,  -1,10)
		formaManecillaHoras.quadraticCurveTo(-2, 9, -2,8)
		formaManecillaHoras.quadraticCurveTo(-2, 7, -1, 6)
		formaManecillaHoras.lineTo(-1,0)

		const options = {bevelEnabled: false, depth: 2, steps: 1, curveSegments: 4,
			bevelThickness: 4, bevelSize: 2 , bevelSegements :2}

		let geoManecillaHoras = new THREE.ExtrudeGeometry(formaManecillaHoras,options)

		this.extruManecillaHoras = new THREE.Mesh(geoManecillaHoras, this.material)
		this.add(this.extruManecillaHoras)
	}
}

class ManecillaMinutos extends THREE.Object3D
{
	constructor(dimensiones = {
		separacion: 1
	})
	{
		super()

		this.separacion = dimensiones.separacion
		this.material = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		let formaManecillaMinutos = new THREE.Shape()

		formaManecillaMinutos.moveTo(1,0)
		formaManecillaMinutos.lineTo(1,6)
		formaManecillaMinutos.quadraticCurveTo(2,7,2,8)
		formaManecillaMinutos.quadraticCurveTo(2,9, 1, 10)
		formaManecillaMinutos.bezierCurveTo(0.5, 11.5 + this.separacion, 0.5, 13.5 + this.separacion,0.5, 14 + this.separacion)
		formaManecillaMinutos.quadraticCurveTo(0 ,15 + this.separacion, -0.5, 14 + this.separacion)
		formaManecillaMinutos.bezierCurveTo(-0.5, 13.5, -0.5, 11.5,  -1,10)
		formaManecillaMinutos.quadraticCurveTo(-2, 9, -2,8)
		formaManecillaMinutos.quadraticCurveTo(-2, 7, -1, 6)
		formaManecillaMinutos.lineTo(-1,0)

		const options = {bevelEnabled: false, depth: 2, steps: 1, curveSegments: 4,
			bevelThickness: 4, bevelSize: 2 , bevelSegements :2}

		let geoManecillaMinutos = new THREE.ExtrudeGeometry(formaManecillaMinutos, options)

		this.extruManecillaMinutos = new THREE.Mesh(geoManecillaMinutos, this.material)
		this.add(this.extruManecillaMinutos)
	}
}

export {Reloj, ManecillaHoras, ManecillaMinutos}
