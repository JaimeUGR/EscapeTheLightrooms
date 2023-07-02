/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from "../../libs/three.module.js"

import {Sala} from "./Sala.js"
import {PuzleFormas} from "../puzles/PuzleFormas.js"
import {Laser} from "../models/Laser.js"
import {GameState} from "../GameState.js"

import {Taquilla} from "../models/Taquilla.js"
import {Cajonera} from "../models/Cajonera.js"

import {PalancaPared} from "../models/PalancaPared.js"
import {Vitrina} from "../models/Vitrina.js"

import {Lampara} from "../models/Lampara.js"
import {ManecillaMinuto} from "../models/Reloj.js"
import {MSG_COGER_TARJETA, MSG_COGER_MANECILLA_MINUTO} from "../messages/messages.js"
import {Config} from "../Config.js"
import {RandomInt} from "../Utils.js"


class SalaIzquierda extends Sala
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
			pared: "../../resources/textures/rooms/PapelAzul.png",
			techo: "../../resources/textures/rooms/AluminioTecho.jpg"
		})

		// Colocar los materiales
		this.colocarMateriales()

		// Añadir las luces
		this.colocarLuces()

		// Añadir los modelos
		this.colocarModelos()

		// Añadir los puzles
		this.colocarPuzles()
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

		this.pointLight = new THREE.PointLight(0xeeeeff,
			0.5, Math.max(this.largoParedZ, this.largoParedX)*0.75, 0.5)
		GameState.luces.luzSalaIzquierda = this.pointLight

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
		// Vitrina con la tarjeta
		{
			let vitrina = new Vitrina({
				cajaX: 10,
				cajaY: 8,
				cajaZ: 6,
				bordeX: 1,
				bordeY: 1,
				bordeZ: 1
			})

			vitrina.rotateY(Math.PI/2)
			vitrina.translateX( this.largoParedZ/4 - (this.largoParedZ + Sala.AnchoPuerta()/4))
			vitrina.translateY(this.alturaPared/2)

			let tarjeta = GameState.items.tarjeta
			tarjeta.position.y = vitrina.cajaY/2
			vitrina.O3Vitrina.add(tarjeta)

			tarjeta.meshTarjeta.userData.interaction = {
				interact: () => {
					if (!vitrina.puertaAbierta)
						return

					GameState.flags.tieneTarjeta = true
					GameState.systems.messages.mostrarMensaje(MSG_COGER_TARJETA, 10000)

					tarjeta.position.y = 0
					vitrina.O3Vitrina.remove(tarjeta)
					tarjeta.meshTarjeta.userData = {}

					GameState.items.pickupSound.play()
				}
			}

			this.add(vitrina)
			this.vitrina = vitrina
			this.collidables.push(vitrina)

			GameState.systems.interaction.allInteractables.push(tarjeta)
		}

		// Taquillero
		{
			const numTaquillas = 15
			const espacioPorTaquilla = this.largoParedX/numTaquillas

			let taquillas = []

			let taq = new Taquilla({
				taquillaX: espacioPorTaquilla - 2*0.75, // x interna
				taquillaY: 35, // y interna
				taquillaZ: 10, // z interna
				taquillaBorde: 0.75,
				puertaZ: 0.5, // <= borde
				numEstantes: 5,
				estanteY: 1,
				separacionInferiorEstantes: 2,
				rejillaX: 8, // <= x interna
				rejillaY: 1.5,
				separacionRejillas: 1.5,
				separacionSuperiorRejillas: 4
			})

			taq.position.set(taq.taquillaX/2 + taq.taquillaBorde, 0, taq.taquillaZ/2 + taq.taquillaBorde)

			for (let i = 0; i < numTaquillas; i++)
			{
				taquillas.push(taq)
				this.add(taq)
				this.collidables.push(taq)
				GameState.systems.interaction.allInteractables.push(taq)

				let taqNueva = new Taquilla({
					taquillaX: espacioPorTaquilla - 2*0.75, // x interna
					taquillaY: 35, // y interna
					taquillaZ: 10, // z interna
					taquillaBorde: 0.75,
					puertaZ: 0.5, // <= borde
					numEstantes: 5,
					estanteY: 1,
					separacionInferiorEstantes: 2,
					rejillaX: 8, // <= x interna
					rejillaY: 1.5,
					separacionRejillas: 1.5,
					separacionSuperiorRejillas: 4
				})

				taqNueva.position.set(taq.position.x, 0, taq.position.z)
				taqNueva.position.x += taq.taquillaX + 2*taq.taquillaBorde
				taq = taqNueva
			}

			// Colocar la aguja del reloj en una
			{
				//
				// Manecilla Minuto
				//
				let taquillaSeleccionada = taquillas[RandomInt(taquillas.length - 1)]

				let manecillaMinuto = new ManecillaMinuto({
					separacion: 7,
					grosor: 0.5,
					escalado: 1.2,
					alturaCilindroContenedor: 0.75,
					radioCilindroRecortado: 0.1,
				})

				taquillaSeleccionada.estantes[1].add(manecillaMinuto)

				//manecillaMinuto.position.y = manecillaMinuto.grosor/2

				manecillaMinuto.children[0].userData.interaction = {
					interact: (event) => {
						GameState.flags.tieneManecillaMinuto = true
						GameState.systems.messages.mostrarMensaje(MSG_COGER_MANECILLA_MINUTO, 10000)

						manecillaMinuto.rotation.x = 0
						manecillaMinuto.position.y = 0

						taquillaSeleccionada.estantes[1].remove(manecillaMinuto)
						manecillaMinuto.children[0].userData = {}

						GameState.items.pickupSound.play()
					}
				}

				GameState.items.manecillaMinuto = manecillaMinuto
				GameState.systems.interaction.allInteractables.push(manecillaMinuto)
			}
		}
	}

	colocarPuzles()
	{
		// Puzle de las formas
		let puzleFormas = new PuzleFormas({
			radioContenedor: 4, // Radio del contenedor de la forma
			alturaContenedor: 1,
			radioForma: 0.55, // De 0 a 1. 1 significa mismo radio que el contenedor
			alturaForma: 0.5,

			dimensionesRail: {},
			separacionComplejosRail: 6,

			operadoresX: 5,
			operadoresY: 5,
			operadoresZ: 2,

			dimensionesPalancas: {},

			// La palanca está colocada justo en el centro del raíl (en Z positiva)
			offsetZPalancas: 35,
			offsetYPalancas: -this.alturaPared/2

			// X TOTAL -> 2*railGrosor + interiorX ...
		})

		puzleFormas.rotateY(Math.PI)

		// Truco temporal debido a la rotación prematura
		puzleFormas.translateX(-this.largoParedX/2)
		puzleFormas.translateZ(-this.largoParedZ)
		puzleFormas.translateY(this.alturaPared/2)

		puzleFormas.setCallbackCompletar(this.vitrina.abrirPuerta.bind(this.vitrina))

		this.add(puzleFormas)
		this.puzleFormas = puzleFormas

		//
		// Laser
		//
		{
			const sp = GameState.salas.salaPrincipal
			const puzleLaser = sp.puzleLaser

			let laserAzul = new Laser()

			// Posicionar el laser en la sala
			laserAzul.rotateY(-Math.PI/2)
			laserAzul.translateY(laserAzul.alturaSoporte + laserAzul.alturaLaser/2)
			laserAzul.translateX(this.largoParedZ/2)
			laserAzul.translateZ(-this.largoParedX + laserAzul.radioSoporte)

			let largoHaz = this.largoParedX + 4*Sala.GrosorPared() + sp.pasilloIzquierda.largoPasillo
				+ sp.largoParedX/2 - (laserAzul.radioSoporte + puzleLaser.anilloAzul.radioInterno)

			laserAzul.name = "LaserAzul"
			puzleLaser.setLaser(laserAzul, largoHaz)

			this.add(laserAzul)
			this.collidables.push(laserAzul)

			//
			// Palanca del láser
			//

			let palancaLaser = new PalancaPared()

			palancaLaser.rotateY(-Math.PI/2)
			palancaLaser.translateZ(-this.largoParedX)
			palancaLaser.translateX(this.largoParedZ/4)
			palancaLaser.translateY(this.alturaPared/2 - (palancaLaser.soporteY/2 + palancaLaser.bordeSoporte))

			palancaLaser.setCallbackActivar(laserAzul.siguienteColorHaz.bind(laserAzul))

			this.add(palancaLaser)
			this.collidables.push(palancaLaser)

			GameState.systems.interaction.allInteractables.push(palancaLaser)
		}
	}
}

export {SalaIzquierda}
