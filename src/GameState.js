
import {Vector2, Vector3, TextureLoader} from "../libs/three.module.js"
import {Rect} from "./structures/Rect.js"

import {Destornillador} from "./models/items/Destornillador.js"
import {Tarjeta} from "./models/items/Tarjeta.js"
import {Prisma} from "./models/items/Prisma.js"

class GameState
{
	static Initialize(scene)
	{
		this.scene = scene

		this.player = {
			initialPosition: new Vector3(0, 25, 5),
			position: new Vector3(0, 25, 5),
			rect: new Rect(new Vector2(-2.5, -2.5), new Vector2(5, 5)),
			movementVector: new Vector3(0, 0, 0)
		}

		this.items = {
			destornillador: null,
			tarjeta: new Tarjeta(),
			prisma: new Prisma(),
			manecillaMinuto: null,
			manecillaHora: null
		}

		// Flags del juego
		this.flags = {
			tieneDestornillador: false,
			tieneManecillaHora: false,
			tieneManecillaMinuto: false,
			tieneTarjeta: false,
			tienePrisma: true
		}

		this.salas = {
			salaPrincipal: null
		}

		// Temporal
		this.tmp = {
			cameraLock: false,
			colsEnabled: true,
			gameStarted: false,
			keypadCode: "1234"
		}

		this.systems = {
			input: null,
			collision: null,
			interaction: null,
			cameras: null
		}

		this.txLoader = new TextureLoader()
	}
}

export {GameState}
