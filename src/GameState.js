/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import {Vector2, Vector3, TextureLoader, Object3D} from "../libs/three.module.js"
import {FontLoader} from "../libs/FontLoader.js"

import {Rect} from "./structures/Rect.js"

import {Tarjeta} from "./models/items/Tarjeta.js"
import {Prisma} from "./models/items/Prisma.js"
import {Pila} from "./models/Pila.js"
import {EndLocation} from "./locations/EndLocation.js"

class GameState
{
	static Initialize(scene)
	{
		this.scene = scene
		this.txLoader = new TextureLoader()
		this.fontLoader = new FontLoader()

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
			pila: new Pila(0.5, 1.5, 0.1, 0.075),
			pickupSound: null
		}

		// Flags del juego
		// TODO: ALGUNOS ON TMP
		this.flags = {
			tieneDestornillador: true,
			tieneManecillaHora: true,
			tieneManecillaMinuto: true,
			tieneTarjeta: true,
			tienePrisma: true,
			tienePila: true,
			robotConPila: false,
			salidaAbierta: true
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
			keypadCode: "6969",
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

		this.locations = {
			end: new EndLocation(scene)
		}
	}
}

export {GameState}
