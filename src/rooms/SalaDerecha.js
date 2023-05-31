
import {Sala} from "./Sala.js"

import {Cajonera} from "../models/Cajonera.js"

import {Reloj, ManecillaHora, ManecillaMinuto} from "../models/Reloj.js"

import {GameState} from "../GameState.js"
import {Taquilla} from "../models/Taquilla.js"

import {Laser} from "../models/Laser.js"

import {RandomInt} from "../Utils.js"


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

		// Añadir los modelos
		this.colocarModelos()

		// Añadir los puzles
		this.colocarPuzles()

		// Añadir los items
		this.colocarItems()
	}

	colocarMateriales()
	{

	}

	colocarLuces()
	{

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

		{
			// TODO: Esto va en otra sala
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
		}
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

			puzleLaser.setLaserVerde(laserVerde, largoHaz)
			laserVerde.setHaz(largoHaz, false)

			// TODO Color Haz Inicial
			laserVerde.cambiarHaz(0x55ff55, false)

			this.add(laserVerde)
		}
	}
}

export {SalaDerecha}
