/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from "../../libs/three.module.js"

import {Sala} from "./Sala.js"
import {PuzleSimon} from "../puzles/PuzleSimon.js"
import {GameState} from "../GameState.js"

import {Silla} from "../models/Silla.js"
import {Tarta} from "../models/Tarta.js"

import {Vitrina} from "../models/Vitrina.js"

import {Laser} from "../models/Laser.js"
import {PalancaPared} from "../models/PalancaPared.js"
import {Lampara} from "../models/Lampara.js"
import {Taquilla} from "../models/Taquilla.js"
import {Cuadro} from "../models/Cuadro.js"

import {Config} from "../Config.js"

class SalaSuperior extends Sala
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
			pared: "../../resources/textures/rooms/PapelRojo.png",
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
		// Crear la lámpara
		{
			let lampara = new Lampara()
			lampara.rotateX(Math.PI)
			lampara.translateY(-this.alturaPared)
			lampara.translateX(this.largoParedX/2)
			lampara.translateZ(-this.largoParedZ/2)

			this.add(lampara)
			this.lampara = lampara
		}

		if (!Config.LIGHTS_ENABLED)
			return

		this.pointLight = new THREE.PointLight(0xffeeee,
			0.2, Math.max(this.largoParedZ, this.largoParedX)*0.8, 0.5)
		GameState.luces.luzSalaSuperior = this.pointLight

		// NOTE: se engancharía a la lámpara
		let targetTmp = new THREE.Object3D()
		targetTmp.name = "TargetLuz"
		targetTmp.position.set(this.largoParedX/2, 0, this.largoParedZ/2)

		// Posicionarla con la lámpara del techo
		const posicionBombillaLampara = this.lampara.altoBase + this.lampara.altoPilar + this.lampara.altoSoporteBombilla

		this.pointLight.position.set(this.largoParedX/2, this.alturaPared - posicionBombillaLampara, this.largoParedZ/2)
		this.pointLight.target = targetTmp

		//GameState.scene.add(new THREE.PointLightHelper(this.pointLight, 1, 0xffffff))

		this.add(targetTmp)
		this.add(this.pointLight)
	}

	colocarModelos()
	{
		// Vitrina con la tarjeta
		{
			let vitrina = new Vitrina({
				cajaX: 10,
				cajaY: 8,
				cajaZ: 8,
				bordeX: 1,
				bordeY: 1,
				bordeZ: 1
			})

			vitrina.rotateY(-Math.PI/2)
			vitrina.translateY(this.alturaPared/2 - vitrina.cajaY/2)
			vitrina.translateZ(-this.largoParedX)
			vitrina.translateX(this.largoParedZ/2)

			let prisma = GameState.items.prisma
			prisma.rotateX(-Math.PI/2)
			prisma.position.y = vitrina.bordeY
			vitrina.O3Vitrina.add(prisma)

			prisma.meshPrisma.userData.interaction = {
				interact: () => {
					if (!vitrina.puertaAbierta)
						return

					prisma.rotateX(Math.PI/2)
					prisma.position.y = 0

					GameState.flags.tienePrisma = true
					vitrina.O3Vitrina.remove(prisma)
					prisma.meshPrisma.userData = {}
				}
			}

			this.add(vitrina)
			this.vitrina = vitrina
			this.collidables.push(vitrina)

			GameState.systems.interaction.allInteractables.push(prisma)
		}

		// Silla y tarta
		{
			let silla = new Silla()
			silla.rotateY(Math.PI)

			silla.translateZ(silla.tableroZ/2 + silla.respaldoZ + 2*silla.radioBarra- this.largoParedZ)
			silla.translateX(-(this.largoParedX/4 - Sala.AnchoPuerta()/4))

			this.add(silla)

			let tarta = new Tarta(4, 5)
			silla.tableroO3D.add(tarta)

			this.collidables.push(silla)
		}

		// Taquilla
		{
			let taq = new Taquilla({
				taquillaX: 15, // x interna
				taquillaY: 35, // y interna
				taquillaZ: 12, // z interna
				taquillaBorde: 0.75,
				puertaZ: 0.5, // <= borde
				numEstantes: 5,
				estanteY: 0.2,
				separacionInferiorEstantes: 2,
				rejillaX: 10, // <= x interna
				rejillaY: 2,
				separacionRejillas: 2,
				separacionSuperiorRejillas: 5
			})

			taq.rotateY(Math.PI)
			taq.translateX((taq.taquillaX/2 + taq.taquillaBorde) - this.largoParedX + taq.taquillaX/2)
			taq.translateZ(taq.taquillaZ/2 + taq.taquillaBorde - this.largoParedZ)

			this.add(taq)
			this.collidables.push(taq)
			GameState.systems.interaction.allInteractables.push(taq)
		}

		// Cuadro
		{
			let cuadro = new Cuadro({
				baseX: 50,
				baseY: 30,
				baseZ: 0.5,

				borde: 2,
				huecoZ: 0.3
			}, undefined, "../../resources/textures/models/payasos_1.jpg")

			cuadro.rotateY(Math.PI/2)
			cuadro.translateX(-(this.largoParedZ/2 + cuadro.baseX/2))
			cuadro.translateY(this.alturaPared/2 - cuadro.baseY/2)

			this.add(cuadro)
		}
	}

	colocarPuzles()
	{
		let puzleSimon = new PuzleSimon()
		puzleSimon.rotateY(-Math.PI/2)
		puzleSimon.position.set(this.largoParedX - puzleSimon.simon.panelZ,
			this.alturaPared/2 - puzleSimon.simon.panelY + puzleSimon.simon.panelY/4, this.largoParedZ/4)

		this.add(puzleSimon)

		GameState.systems.interaction.allInteractables.push(puzleSimon)

		puzleSimon.setCallbackCompletado(this.vitrina.abrirPuerta.bind(this.vitrina))

		this.puzleSimon = puzleSimon

		//
		// Laser
		//
		{
			const sp = GameState.salas.salaPrincipal
			const puzleLaser = sp.puzleLaser

			let laserRojo = new Laser()

			// Posicionar el laser en la sala
			laserRojo.rotateY(Math.PI)
			laserRojo.translateY(laserRojo.alturaSoporte + laserRojo.alturaLaser/2)
			laserRojo.translateX(-this.largoParedX/2)
			laserRojo.translateZ(-this.largoParedZ + laserRojo.radioSoporte)

			let largoHaz = this.largoParedZ + 4*Sala.GrosorPared() + sp.pasilloSuperior.largoPasillo
				+ sp.largoParedZ/2 - (puzleLaser.anilloRojo.radioInterno + laserRojo.radioSoporte)

			laserRojo.name = "LaserRojo"
			puzleLaser.setLaser(laserRojo, largoHaz)

			this.add(laserRojo)
			this.collidables.push(laserRojo)

			//
			// Palanca del láser
			//

			let palancaLaser = new PalancaPared()

			palancaLaser.translateX((this.largoParedX/2 - Sala.AnchoPuerta()/2)/2)
			palancaLaser.translateY(Sala.AltoPuerta()/2 - (palancaLaser.soporteY/2 + palancaLaser.bordeSoporte))

			palancaLaser.setCallbackActivar(laserRojo.siguienteColorHaz.bind(laserRojo))

			this.add(palancaLaser)
			this.collidables.push(palancaLaser)

			GameState.systems.interaction.allInteractables.push(palancaLaser)
		}
	}
}

export {SalaSuperior}
