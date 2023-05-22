
import {Sala} from "./Sala.js"
import {PuzleSimon} from "../puzles/PuzleSimon.js"
import {GameState} from "../GameState.js"

class SalaSuperior extends Sala
{
	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		down: false,
		up: false,
		left: false,
		right: false
	})
	{
		super(largoParedX, largoParedZ, alturaPared, puertas)

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
		let puzleSimon = new PuzleSimon(null) // TODO: Añadir la callback para abrir el contenedor del prisma
		puzleSimon.rotateY(-Math.PI/2)
		puzleSimon.position.set(this.largoParedX - puzleSimon.simon.panelZ,
			this.alturaPared/2 - puzleSimon.simon.panelY, this.largoParedZ/4)

		this.add(puzleSimon)

		GameState.systems.interaction.allInteractables.push(puzleSimon)

		this.puzleSimon = puzleSimon
	}
}

export {SalaSuperior}
