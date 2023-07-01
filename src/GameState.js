/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

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
		// TODO: ALGUNOS ON TMP
		this.flags = {
			tieneDestornillador: true,
			tieneManecillaHora: false,
			tieneManecillaMinuto: false,
			tieneTarjeta: true,
			tienePrisma: false,
			tienePila: false,
			robotConPila: false
		}

		this.salas = {
			salaPrincipal: null
		}

		this.debug = {
			O3Player: new Object3D(),
			controlesVuelo: false
		}

		this.gameData = {
			interactionRangeEnabled: true,
			interactionRange: 50,
			cameraLock: false,
			colsEnabled: true,
			gameStarted: false,
			inputEnabled: true,
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
			cameras: null,
			messages: null,
			sound: null
		}
	}
}

export {GameState}
