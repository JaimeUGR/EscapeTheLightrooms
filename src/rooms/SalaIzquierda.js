
import {Sala} from "./Sala.js"
import {PuzleFormas} from "../puzles/PuzleFormas.js"

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

		this.add(puzleFormas)

		this.puzleFormas = puzleFormas
	}
}

export {SalaIzquierda}
