
import {Sala} from "./Sala.js"

import {Reloj} from "../models/Reloj.js"

import {GameState} from "../GameState.js"


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
	}

	colocarMateriales()
	{

	}

	colocarLuces()
	{

	}

	colocarModelos()
	{

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
	}
}

export {SalaDerecha}
