
import {Pasillo, Sala} from "./Sala.js"

import {Mesa} from "../models/Mesa.js"
import {Cajonera} from "../models/Cajonera.js"
import {Taquilla} from "../models/Taquilla.js"

import {GameState} from "../GameState.js";
import {Box2, Box3, Vector2, Vector3} from "../../libs/three.module.js";
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

		// TODO TEMPORAL
		this.pasilloSuperior.desbloquear()

		// TODO TEMPORAL
		// Añadir un método para meter los colliders del pasillo, actualizando esta matriz de paso
	}

	colocarMateriales()
	{

	}

	colocarLuces()
	{

	}

	colocarModelos()
	{
		let taq = new Taquilla({
			taquillaX: 15, // x interna
			taquillaY: 25, // y interna
			taquillaZ: 15, // z interna
			taquillaBorde: 2,
			puertaZ: 1, // <= borde
			numEstantes: 4,
			estanteY: 2,
			separacionInferiorEstantes: 5,
			rejillaX: 10, // <= x interna
			rejillaY: 2,
			separacionRejillas: 3,
			separacionSuperiorRejillas: 5
		})
		//taq.position.set(taq.taquillaX/2 + taq.taquillaBorde, 0, taq.taquillaZ/2 + taq.taquillaBorde)
		taq.position.set(0, 100, 0)
		this.add(taq)

		let caj = new Cajonera({
			cajoneraX: 20, // x interna
			cajoneraY: 25, // y interna
			cajoneraZ: 40, // z interna
			cajoneraBorde: 1.5, // Borde en todos los lados (también es la separación entre cajones)

			numCajones: 6,

			cajonFrontalZ: 0.5,
			cajonSueloY: 0.01,
			cajonTraseraZ: 1,
			cajonLateralX: 2,
			cajonLateralY: 0.5,

			cajonAsaX: 1,
			cajonAsaY: 1,
			cajonAsaZ: 1,
		})

		caj.position.set(0, 50, 0)
		this.add(caj)
	}

	colocarPuzles()
	{

	}
}

export {SalaPrincipal}
