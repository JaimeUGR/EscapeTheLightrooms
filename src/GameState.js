
import {Vector2, Vector3, TextureLoader, Object3D} from "../libs/three.module.js"
import {Rect} from "./structures/Rect.js"

import {Tarjeta} from "./models/items/Tarjeta.js"
import {Prisma} from "./models/items/Prisma.js"
import {Pila} from "./models/Pila.js"

class GameState
{
	static Initialize(scene)
	{
		this.scene = scene
		this.txLoader = new TextureLoader()

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
			manecillaHora: null,
			pila: new Pila(0.5, 1.5, 0.1, 0.075)
		}

		// Flags del juego
		this.flags = {
			tieneDestornillador: false,
			tieneManecillaHora: false,
			tieneManecillaMinuto: false,
			tieneTarjeta: false,
			tienePrisma: true, // TODO: TMP
			tienePila: false,
			robotConPila: true // TODO: TMP
		}

		this.salas = {
			salaPrincipal: null
		}

		this.debug = {
			O3Player: new Object3D(),
			controlesVuelo: true // TODO: A FALSE
		}

		this.gameData = {
			interactionRangeEnabled: false, // TODO: A TRUE
			interactionRange: 50,
			cameraLock: false,
			colsEnabled: true,
			gameStarted: false,
			keypadCode: "6969"
		}

		this.luces = {
			luzAmbiente: null,
			luzSimon: null,
			luzSalaPrincipal: null,
			luzSalaIzquierda: null,
			luzSalaDerecha: null,
			luzSalaSuperior: null
		}

		this.systems = {
			collision: null,
			interaction: null,
			cameras: null
		}
	}
}

export {GameState}
