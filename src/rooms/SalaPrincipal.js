
import {Pasillo, Sala} from "./Sala.js"

import {Mesa, MesaCristal} from "../models/Mesa.js"
import {Cajonera} from "../models/Cajonera.js"
import {Taquilla} from "../models/Taquilla.js"
import {CuboCentral} from "../models/CuboCentral.js"
import {Robot} from "../models/Robot.js"

import {GameState} from "../GameState.js"
import {Rect} from "../structures/Rect.js"

class SalaPrincipal extends Sala
{
	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		down: false,
		up: false,
		left: false,
		right: false
	})
	{
		super(largoParedX, largoParedZ, alturaPared, puertas)

		this.crearPasillos()

		GameState.salas.salaPrincipal = this

		// Colocar los materiales
		this.colocarMateriales()

		// Añadir las luces
		this.colocarLuces()

		// Añadir los modelos
		this.colocarModelos()

		// Añadir los puzles
		this.colocarPuzles()
	}

	crearPasillos()
	{
		let pIzda = new Pasillo(90, 40, 30, -Math.PI/2)
		let pDcha = new Pasillo(80, 40, 30, -3*Math.PI/2)
		let pSup = new Pasillo(50, 40, 30, -Math.PI)

		this.pasilloIzquierda = pIzda
		this.pasilloDerecha = pDcha
		this.pasilloSuperior = pSup

		pIzda.position.set(
			this.largoParedX + 2*Sala.GrosorPared() + pIzda.largoPasillo/2
			, 0, this.largoParedZ/2)

		pDcha.position.set(
			-(2*Sala.GrosorPared() + pDcha.largoPasillo/2)
			, 0, this.largoParedZ/2)

		pSup.position.set(
			this.largoParedX/2
			, 0, this.largoParedZ + 2*Sala.GrosorPared() + pSup.largoPasillo/2)

		this.add(pIzda)
		this.add(pDcha)
		this.add(pSup)
	}

	updateColliders()
	{
		super.updateColliders()

		this.pasilloIzquierda.updateColliders()
		this.pasilloDerecha.updateColliders()
		this.pasilloSuperior.updateColliders()
	}

	colocarMateriales()
	{

	}

	colocarLuces()
	{

	}

	colocarModelos()
	{
		// Cajonera robot
		{
			let cajonera = new Cajonera({
				cajoneraX: 25, // x interna
				cajoneraY: 15, // y interna
				cajoneraZ: 8, // z interna
				cajoneraBorde: 1, // Borde en todos los lados (también es la separación entre cajones)

				numCajones: 3,

				cajonFrontalZ: 0.5,
				cajonSueloY: 0.01,
				cajonTraseraZ: 0.5,
				cajonLateralX: 0.5,
				cajonLateralY: 0.75,

				cajonAsaX: 1,
				cajonAsaY: 1,
				cajonAsaZ: 1,
			})

			cajonera.position.set(cajonera.cajoneraX/2 + cajonera.cajoneraBorde + this.largoParedX - this.largoParedX/4 - Sala.AnchoPuerta()/4,
				0,
				cajonera.cajoneraZ/2 + cajonera.cajoneraBorde)

			this.add(cajonera)
			this.collidables.push(cajonera)

			GameState.systems.interaction.allInteractables.push(cajonera)

			this.cajoneraRobot = cajonera
		}

		// Mesa cristal
		{
			let mesaCristal = new MesaCristal({
				// Tablero
				tableroX: 30,
				tableroY: 0.5,
				tableroZ: 18,

				// Patas
				pataX: 3,
				pataY: 10,
				pataZ: 3,

				separacionPatasX: 15, // Separación desde la esquina de la pata (la que se vería) hasta el centro
				separacionPatasZ: 9, // Separación desde la esquina de la pata (la que se vería) hasta el centro

				cristalX: 30 - 6,
				cristalZ: 18 - 6,
				cristalY: 1
			})

			mesaCristal.position.set(
				this.largoParedX/4 - Sala.AnchoPuerta()/4
				, 0, mesaCristal.tableroZ/2)

			this.add(mesaCristal)
			this.collidables.push(mesaCristal)
		}

		// Taquilla mesa
		{
			let taq = new Taquilla({
				taquillaX: 12, // x interna
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
			this.add(taq)
			this.collidables.push(taq)

			GameState.systems.interaction.allInteractables.push(taq)
		}

		//
		// Mesa y CuboPC
		//
		this.mesaPrincipal = new Mesa({
			// Tablero
			tableroX: 40,
			tableroY: 0.5,
			tableroZ: 24,

			// Patas
			pataX: 3,
			pataY: 15,
			pataZ: 3,

			separacionPatasX: 18, // Separación desde la esquina de la pata (la que se vería) hasta el centro
			separacionPatasZ: 10 // Separación desde la esquina de la pata (la que se vería) hasta el centro
		})

		this.mesaPrincipal.translateX(this.largoParedX - this.mesaPrincipal.tableroX/2)
		this.mesaPrincipal.translateZ(this.largoParedZ - this.mesaPrincipal.tableroZ/2)

		this.add(this.mesaPrincipal)
		this.collidables.push(this.mesaPrincipal)

		{
			this.robot = new Robot(GameState.scene.gui)
			this.robot.translateY(25)
			this.robot.translateZ(this.largoParedZ/2)
			this.robot.translateX(this.largoParedX/2)
			this.add(this.robot)
		}
	}

	colocarPuzles()
	{
		//
		// Cubo Central
		//
		this.cuboPC = new CuboCentral()

		this.cuboPC.translateY(this.cuboPC.ladoCubo/2 + this.cuboPC.bordeCubo)

		// TODO: Esta rotación es la que se cambiará para hacer la cámara
		// TODO: TMP QUITARLA
		this.cuboPC.rotateY(Math.PI)
		this.mesaPrincipal.tableroO3D.add(this.cuboPC)

		GameState.systems.interaction.allInteractables.push(this.cuboPC)

		//
		// Lasérs
		//
	}
}

export {SalaPrincipal}
