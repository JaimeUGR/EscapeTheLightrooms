
import {Vector2, Vector3} from "../libs/three.module.js"
import {Rect} from "./structures/Rect.js"

import {Destornillador} from "./models/items/Destornillador.js"
import {Tarjeta} from "./models/items/Tarjeta.js"
import {Prisma} from "./models/items/Prisma.js"


class GameState
{
	static Initialize()
	{
		this.player = {
			position: new Vector3(0, 20, 5),
			rect: new Rect(new Vector2(-2.5, -2.5), new Vector2(5, 5)),
			movementVector: new Vector3(0, 0, 0)
		}

		this.items = {
			destornillador: null,
			tarjeta: new Tarjeta()
		}

		// Flags del juego
		// TODO: TMP a true
		this.flags = {
			tieneDestornillador: true,
			tieneManecillaHora: true,
			tieneManecillaMinuto: true,
			tieneMangoPalanca: true,
			tienePaloPalanca: true,
			tieneTarjeta: true,
			tienePrisma: true
		}

		this.salas = {
			salaPrincipal: null
		}

		// Temporal
		this.tmp = {
			cameraLock: false,
			colsEnabled: true,
			gameStarted: false
		}

		this.systems = {
			input: null,
			collision: null,
			interaction: null,
			cameras: null
		}
	}
}

export {GameState}
