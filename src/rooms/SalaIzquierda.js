
import {Sala} from "./Sala.js"
import {PuzleFormas} from "../puzles/PuzleFormas.js"
import {Laser} from "../models/Laser.js"
import {GameState} from "../GameState.js"

import {Vitrina} from "../models/Vitrina.js"

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
					tarjeta.position.y = 0
					vitrina.O3Vitrina.remove(tarjeta)
					tarjeta.meshTarjeta.userData = {}
				}
			}

			this.add(vitrina)
			this.vitrina = vitrina

			GameState.systems.interaction.allInteractables.push(tarjeta)
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

			puzleLaser.setLaserAzul(laserAzul, largoHaz)
			laserAzul.setHaz(largoHaz, false)

			// TODO Color Haz Inicial
			laserAzul.cambiarHaz(0x5555ff, false)

			this.add(laserAzul)
		}
	}
}

export {SalaIzquierda}
