
import {Sala} from "./Sala.js"
import {PuzleSimon} from "../puzles/PuzleSimon.js"
import {GameState} from "../GameState.js"

import {Laser} from "../models/Laser.js"
import {Vitrina} from "../models/Vitrina.js"

class SalaSuperior extends Sala
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
			pared: "../../resources/textures/rooms/PapelRojo.png",
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
				cajaZ: 8,
				bordeX: 1,
				bordeY: 1,
				bordeZ: 1
			})

			vitrina.rotateY(-Math.PI/2)
			vitrina.translateY(this.alturaPared/2 - vitrina.cajaY/2)
			vitrina.translateZ(-this.largoParedX)
			vitrina.translateX(this.largoParedZ/2)

			let prisma = GameState.items.prisma
			prisma.rotateX(-Math.PI/2)
			vitrina.O3Vitrina.add(prisma)

			prisma.meshPrisma.userData.interaction = {
				interact: () => {
					if (!vitrina.puertaAbierta)
						return

					prisma.rotateX(Math.PI/2)

					GameState.flags.tienePrisma = true
					vitrina.O3Vitrina.remove(prisma)
					prisma.meshPrisma.userData = {}
				}
			}

			this.add(vitrina)
			this.vitrina = vitrina

			GameState.systems.interaction.allInteractables.push(prisma)
		}
	}

	colocarPuzles()
	{
		let puzleSimon = new PuzleSimon()
		puzleSimon.rotateY(-Math.PI/2)
		puzleSimon.position.set(this.largoParedX - puzleSimon.simon.panelZ,
			this.alturaPared/2 - puzleSimon.simon.panelY, this.largoParedZ/4)

		this.add(puzleSimon)

		GameState.systems.interaction.allInteractables.push(puzleSimon)

		puzleSimon.setCallbackCompletado(this.vitrina.abrirPuerta.bind(this.vitrina))

		this.puzleSimon = puzleSimon

		//
		// Laser
		//
		{
			const sp = GameState.salas.salaPrincipal
			const puzleLaser = sp.puzleLaser

			let laserRojo = new Laser()

			// Posicionar el laser en la sala
			laserRojo.rotateY(Math.PI)
			laserRojo.translateY(laserRojo.alturaSoporte + laserRojo.alturaLaser/2)
			laserRojo.translateX(-this.largoParedX/2)
			laserRojo.translateZ(-this.largoParedZ + laserRojo.radioSoporte)

			let largoHaz = this.largoParedZ + 4*Sala.GrosorPared() + sp.pasilloSuperior.largoPasillo
				+ sp.largoParedZ/2 - (puzleLaser.anilloRojo.radioInterno + laserRojo.radioSoporte)

			puzleLaser.setLaserRojo(laserRojo, largoHaz)
			laserRojo.setHaz(largoHaz, false)

			// TODO Color Haz Inicial
			laserRojo.cambiarHaz(0xff5555, false)

			this.add(laserRojo)
		}
	}
}

export {SalaSuperior}
