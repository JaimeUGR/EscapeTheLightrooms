import {Sala} from "./models/Sala.js";

class SalaDerecha extends Sala
{
	constructor(largoParedX, largoParedZ, alturaPared, puertas = {
		"Down": false,
		"Up": false,
		"Left": false,
		"Right": false
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

	}
}

export {SalaDerecha}
