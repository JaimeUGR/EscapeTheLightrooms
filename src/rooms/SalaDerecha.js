
import * as THREE from "../../libs/three.module.js"

import {Sala} from "./Sala.js"
import {Cajonera} from "../models/Cajonera.js"
import {Reloj, ManecillaHora, ManecillaMinuto} from "../models/Reloj.js"
import {Taquilla} from "../models/Taquilla.js"
import {Cuadro} from "../models/Cuadro.js"
import {Poster} from "../models/Poster.js"

import {Laser} from "../models/Laser.js"
import {PalancaPared} from "../models/PalancaPared.js"
import {Lampara} from "../models/Lampara.js"

import {GameState} from "../GameState.js"
import {RandomInt} from "../Utils.js"
import {Sofa} from "../models/Sofa.js"
import {MesaCristal} from "../models/Mesa.js"
import {Silla} from "../models/Silla.js"
import {Tarta} from "../models/Tarta.js"
import {Config} from "../Config.js"

class SalaDerecha extends Sala
{
	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		down: false,
		up: false,
		left: false,
		right: false
	})
	{
		super(largoParedX, largoParedZ, alturaPared, puertas, {
			suelo: "../../resources/textures/rooms/Madera.jpg",
			pared: "../../resources/textures/rooms/PapelVerde.png",
			techo: "../../resources/textures/rooms/AluminioTecho.jpg"
		})

		// Colocar los materiales
		this.colocarMateriales()

		// Añadir las luces
		this.colocarLuces()

		// Añadir los puzles
		this.colocarPuzles()

		// Añadir los modelos
		this.colocarModelos()

		// Añadir los items
		this.colocarItems()
	}

	colocarMateriales()
	{

	}

	colocarLuces()
	{
		// Crear la lámpara
		{
			let lampara = new Lampara()
			lampara.rotateX(Math.PI)
			lampara.translateY(-this.alturaPared)
			lampara.translateX(this.largoParedX/2)
			lampara.translateZ(-this.largoParedZ/2)

			this.add(lampara)
			this.lampara = lampara
		}

		if (!Config.LIGHTS_ENABLED)
			return

		this.pointLight = new THREE.PointLight(0xeeffee,
			0.4, Math.max(this.largoParedZ, this.largoParedX)*0.7, 0.5)
		GameState.luces.luzSalaDerecha = this.pointLight

		// NOTE: se engancharía a la lámpara
		let targetTmp = new THREE.Object3D()
		targetTmp.name = "TargetLuz"
		targetTmp.position.set(this.largoParedX/2, 0, this.largoParedZ/2)

		// Posicionarla con la lámpara del techo
		const posicionBombillaLampara = this.lampara.altoBase + this.lampara.altoPilar + this.lampara.altoSoporteBombilla

		this.pointLight.position.set(this.largoParedX/2, this.alturaPared - posicionBombillaLampara, this.largoParedZ/2)
		this.pointLight.target = targetTmp

		//GameState.scene.add(new THREE.PointLightHelper(this.pointLight, 1, 0xffffff))

		this.add(targetTmp)
		this.add(this.pointLight)
	}

	colocarModelos()
	{
		//
		// Cajonera y taquilla
		//
		{
			let taq = new Taquilla({
				taquillaX: 10, // x interna
				taquillaY: 25, // y interna
				taquillaZ: 10, // z interna
				taquillaBorde: 0.75,
				puertaZ: 0.5, // <= borde
				numEstantes: 3,
				estanteY: 1,
				separacionInferiorEstantes: 2,
				rejillaX: 6, // <= x interna
				rejillaY: 1.5,
				separacionRejillas: 1.5,
				separacionSuperiorRejillas: 4
			})


			taq.rotateY(Math.PI)
			taq.translateX(-(taq.taquillaX/2 + taq.taquillaBorde))
			taq.translateZ(taq.taquillaZ/2 + taq.taquillaBorde - this.largoParedZ)

			this.add(taq)
			this.collidables.push(taq)
			GameState.systems.interaction.allInteractables.push(taq)

			let cajonera = new Cajonera({
				cajoneraX: 15, // x interna
				cajoneraY: 20, // y interna
				cajoneraZ: 7, // z interna
				cajoneraBorde: 1, // Borde en todos los lados (también es la separación entre cajones)

				numCajones: 6,

				cajonFrontalZ: 0.5,
				cajonSueloY: 0.01,
				cajonTraseraZ: 0.5,
				cajonLateralX: 0.5,
				cajonLateralY: 0.75,

				cajonAsaX: 1,
				cajonAsaY: 1,
				cajonAsaZ: 1,
			})

			cajonera.rotateY(Math.PI)
			cajonera.translateX(-(cajonera.cajoneraX/2 + cajonera.cajoneraBorde + taq.taquillaX + 2*taq.taquillaBorde))
			cajonera.translateZ(cajonera.cajoneraZ/2 + cajonera.cajoneraBorde - this.largoParedZ)

			this.add(cajonera)
			this.collidables.push(cajonera)

			this.cajoneraReloj = cajonera
			GameState.systems.interaction.allInteractables.push(cajonera)

			// Silla y tarta
			let silla = new Silla()
			silla.rotateY(Math.PI)

			silla.translateZ(silla.tableroZ/2 + silla.respaldoZ + 2*silla.radioBarra - this.largoParedZ)
			silla.translateX(-(this.largoParedX/4 + cajonera.cajoneraX))

			this.add(silla)

			let tarta = new Tarta(4, 5)
			silla.tableroO3D.add(tarta)

			this.collidables.push(silla)
		}

		//
		// Cuadros
		//
		{
			let cuadroPaco = new Cuadro({
				baseX: 35,
				baseY: 30,
				baseZ: 0.5,

				borde: 2,
				huecoZ: 0.3
			})

			cuadroPaco.translateX(this.largoParedX/4 - cuadroPaco.baseX/2
				- (this.reloj.cajaX/2 + this.reloj.pilarX + this.reloj.trapSup.XSup)/2)
			cuadroPaco.translateY(this.alturaPared/2)

			this.add(cuadroPaco)


			let cuadroJaime = new Cuadro({
				baseX: 35,
				baseY: 60,
				baseZ: 0.5,

				borde: 2,
				huecoZ: 0.3
			}, undefined, "../../resources/textures/models/gigachad_2.jpg")

			cuadroJaime.translateX(this.largoParedX/2 + this.largoParedX/4 - cuadroJaime.baseX/2
				+ (this.reloj.cajaX/2 + this.reloj.pilarX + this.reloj.trapSup.XSup)/2)
			cuadroJaime.translateY(this.alturaPared/2 - cuadroJaime.baseY/2)

			this.add(cuadroJaime)
		}

		// Sofa, mesa y lámparita
		{
			let sofaSup = new Sofa()
			sofaSup.rotateY(Math.PI)

			sofaSup.translateZ(sofaSup.baseZ/2 + sofaSup.parteTraseraZ - this.largoParedZ)
			sofaSup.translateX(sofaSup.baseX/2 + sofaSup.lateralX -(this.largoParedX)
			+ sofaSup.baseZ + sofaSup.parteTraseraZ) // Este último sería la Z del sofa inferior

			this.add(sofaSup)
			this.collidables.push(sofaSup)

			let sofaInf = new Sofa()
			sofaInf.rotateY(-Math.PI/2)

			sofaInf.translateZ(sofaInf.baseZ/2 + sofaInf.parteTraseraZ - this.largoParedX)
			sofaInf.translateX(this.largoParedZ -
				(sofaInf.baseX/2 + sofaInf.lateralX + sofaSup.baseZ + sofaSup.parteTraseraZ))

			this.add(sofaInf)
			this.collidables.push(sofaInf)

			//
			// Lámpara
			//

			let lampara = new Lampara({
				radioBase: 3.5,
				altoBase: 1.25,

				radioPilar: 0.5,
				altoPilar: 30,

				radioEnvoltura: 3.5,
				altoEnvoltura: 8,

				radioHueco: 3.25,

				posicionEnvoltura: 1,
				posicionBarras: 0.5,

				radioSoporteBombilla: 0.1,
				altoSoporteBombilla: 0.5,

				radioBarra: 0.2,
			})

			lampara.translateZ(this.largoParedZ + this.lampara.radioBase/2 - (sofaSup.lateralZ/2 + sofaSup.parteTraseraZ))
			lampara.translateX(this.largoParedX + this.lampara.radioBase/2 - (sofaInf.lateralZ/2 + sofaInf.parteTraseraZ))

			this.add(lampara)

			// Mesa cristal

			let mesa = new MesaCristal({
				// Tablero
				tableroX: 30,
				tableroY: 0.5,
				tableroZ: 20,

				// Patas
				pataX: 3,
				pataY: 13,
				pataZ: 3,

				separacionPatasX: 15, // Separación desde la esquina de la pata (la que se vería) hasta el centro
				separacionPatasZ: 10, // Separación desde la esquina de la pata (la que se vería) hasta el centro

				cristalX: 30 - 6,
				cristalZ: 20 - 6,
				cristalY: 1
			})

			mesa.translateZ(this.largoParedZ -
				(sofaSup.lateralZ + sofaSup.parteTraseraZ + sofaInf.parteTraseraX/2))
			mesa.translateX(this.largoParedX -
				(sofaInf.lateralZ + sofaInf.parteTraseraZ + sofaSup.parteTraseraX/2))

			this.add(mesa)
			this.collidables.push(mesa)
		}

		{
			let cuadroGrande = new Cuadro({
				baseX: 70,
				baseY: 35,
				baseZ: 0.5,

				borde: 1.5,
				huecoZ: 0.3
			}, undefined, "../../resources/textures/models/CreacionAdan.jpg")

			cuadroGrande.rotateY(Math.PI)

			cuadroGrande.translateX(-(this.largoParedX/2 + cuadroGrande.baseX/2))
			cuadroGrande.translateZ(-this.largoParedZ)
			cuadroGrande.translateY(this.alturaPared/2 - 5)

			this.add(cuadroGrande)
		}
	}

	colocarItems()
	{
		//
		// Manecilla Hora
		//
		{
			let cajonSeleccionado = this.cajoneraReloj.cajones[RandomInt(this.cajoneraReloj.cajones.length - 1)]

			let manecillaHora = new ManecillaHora({
				separacion: 7,
				grosor: 0.5,
				escalado: 2,
				alturaCilindroContenedor: 0.75,
				radioCilindroRecortado: 0.1,
			})

			cajonSeleccionado.add(manecillaHora)

			manecillaHora.position.y = manecillaHora.grosor/2
			manecillaHora.rotation.x = Math.PI/2

			manecillaHora.children[0].userData.interaction = {
				interact: (event) => {
					GameState.flags.tieneManecillaHora = true
					manecillaHora.rotation.x = 0
					manecillaHora.position.y = 0

					cajonSeleccionado.remove(manecillaHora)

					manecillaHora.children[0].userData = {}
				}
			}

			GameState.items.manecillaHora = manecillaHora
			GameState.systems.interaction.allInteractables.push(manecillaHora)
		}

		/*{
			//
			// Manecilla Minuto
			//
			let cajonSeleccionado = this.cajoneraReloj.cajones[RandomInt(this.cajoneraReloj.cajones.length - 1)]

			let manecillaMinuto = new ManecillaMinuto({
				separacion: 7,
				grosor: 0.5,
				escalado: 1.2,
				alturaCilindroContenedor: 0.75,
				radioCilindroRecortado: 0.1,
			})

			cajonSeleccionado.add(manecillaMinuto)

			manecillaMinuto.position.y = manecillaMinuto.grosor/2
			manecillaMinuto.rotation.x = Math.PI/2

			manecillaMinuto.children[0].userData.interaction = {
				interact: (event) => {
					GameState.flags.tieneManecillaMinuto = true
					manecillaMinuto.rotation.x = 0
					manecillaMinuto.position.y = 0

					cajonSeleccionado.remove(manecillaMinuto)

					manecillaMinuto.children[0].userData = {}
				}
			}

			GameState.items.manecillaMinuto = manecillaMinuto
			GameState.systems.interaction.allInteractables.push(manecillaMinuto)
		}*/
	}

	colocarPuzles()
	{
		//
		// Reloj
		//

		let reloj = new Reloj()

		reloj.translateX(this.largoParedX/2)
		reloj.translateY((reloj.cajaY + reloj.trapSup.Y + reloj.trapInf.Y)/2)
		reloj.translateZ(reloj.cajaZ/2 + reloj.pilarZ)

		this.reloj = reloj
		this.add(reloj)

		// TODO: Poner el póster con el código detrás
		GameState.systems.interaction.allInteractables.push(reloj)
		this.collidables.push(reloj)

		// Poner el poster con el código detrás
		let poster = new Poster(10, 5, "../../resources/textures/models/Keypad/textura_codigo.png")
		poster.materialPoster.color.setHex(0x99e550)
		poster.translateX(this.largoParedX/2)
		poster.translateY(poster.altura/2 + reloj.cajaY)

		this.add(poster)

		//
		// Laser
		//
		{
			const sp = GameState.salas.salaPrincipal
			const puzleLaser = sp.puzleLaser

			let laserVerde = new Laser()

			// Posicionar el laser en la sala
			laserVerde.rotateY(Math.PI/2)
			laserVerde.translateY(laserVerde.alturaSoporte + laserVerde.alturaLaser/2)
			laserVerde.translateX(-this.largoParedZ/2)
			laserVerde.translateZ(this.largoParedX/2)

			let largoHaz = this.largoParedX/2 + 4*Sala.GrosorPared() + sp.pasilloDerecha.largoPasillo
				+ sp.largoParedX/2 - (puzleLaser.anilloVerde.radioInterno)

			laserVerde.name = "LaserVerde"
			puzleLaser.setLaser(laserVerde, largoHaz)

			this.add(laserVerde)
			this.collidables.push(laserVerde)

			//
			// Palanca del láser
			//

			let palancaLaser = new PalancaPared()

			palancaLaser.rotateY(Math.PI/2)
			palancaLaser.translateX(-this.largoParedZ/2)
			palancaLaser.translateY(this.alturaPared/4 - (palancaLaser.soporteY/2 + palancaLaser.bordeSoporte))

			palancaLaser.setCallbackActivar(laserVerde.siguienteColorHaz.bind(laserVerde))

			this.add(palancaLaser)
			this.collidables.push(palancaLaser)

			GameState.systems.interaction.allInteractables.push(palancaLaser)
		}
	}
}

export {SalaDerecha}
