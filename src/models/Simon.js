/*
 * Copyright (c) 2023. Jaime P. and Francisco E.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from "../../libs/three.module.js"
import {TrapezoidGeometry} from "../geometry/TrapezoidGeometry.js"

import {GameState} from "../GameState.js"

class Simon extends THREE.Object3D
{
	constructor(dimensiones = {
		panelX: 16,
		panelY: 27,
		panelZ: 1,

		alturaBotonJuego : 0.75,

		borde: 1,
		radioIndicador: 2,
		alturaIndicador: 0.5,
		altoBotonInicial: 0.5,
		profundidadBotonInicial: 3,
		anchoBotonSuperior: 0.5,
		profBotonSuperior: 0.5
	})
	{
		super()

		this.panelX = dimensiones.panelX
		this.panelY = dimensiones.panelY
		this.panelZ = dimensiones.panelZ

		this.alturaBotonJuego = dimensiones.alturaBotonJuego

		this.borde = dimensiones.borde
		this.radioIndicador = dimensiones.radioIndicador
		this.alturaIndicador = dimensiones.alturaIndicador

		this.altoBotonInicial = dimensiones.altoBotonInicial
		this.profundidadBotonInicial = dimensiones.profundidadBotonInicial

		this.anchoBotonInicial = (this.panelX - 2*this.borde)

		this.botonAnchoInferior = (this.panelX - 3*this.borde)/2
		this.botonAnchoSuperior = this.botonAnchoInferior * dimensiones.anchoBotonSuperior
		this.botonProfInferior = (this.panelY - (5*this.borde + this.profundidadBotonInicial + 2*this.radioIndicador))/2
		this.botonProfSuperior = this.botonProfInferior * dimensiones.profBotonSuperior

		this.separacionCentral = (this.panelY - (5*this.borde + this.profundidadBotonInicial + 2*this.radioIndicador + 2*this.botonProfInferior))/2
		this.separacionIndicadores = (this.panelX - (2*this.borde + 3*2*this.radioIndicador))/2

		// 2 3
		// 0 1
		this.botones = []
		this.indicadores = [] // 0 1 2

		//
		// Materiales
		//

		let simonMaterial = new THREE.MeshNormalMaterial({opacity: 0.8, transparent: true})

		const txLoader = GameState.txLoader

		let texturaStart = txLoader.load("./resources/textures/models/texto_start.jpeg")

		let materialBase = new THREE.MeshBasicMaterial({color: 0xae46eb})

		this.materialStart = [
			materialBase,
			materialBase,
			new THREE.MeshLambertMaterial({map: texturaStart, color: 0xae46eb}),
			materialBase,
			materialBase,
			materialBase
		]

		//
		// Modelado
		//

		// Crear panel de soporte
		let geoPanel = new THREE.BoxGeometry(this.panelX,this.panelY,this.panelZ)
		geoPanel.translate(0,this.panelY/2,-this.panelZ/2)
		this.add(new THREE.Mesh(geoPanel, simonMaterial))

		//Crear boton inicial
		let geoBotonInicial = new THREE.BoxGeometry(this.anchoBotonInicial, this.altoBotonInicial, this.profundidadBotonInicial)
		geoBotonInicial.rotateX(Math.PI/2)
		geoBotonInicial.translate(0, this.borde + this.profundidadBotonInicial/2, this.altoBotonInicial/2)

		this.botonInicialMesh = new THREE.Mesh(geoBotonInicial, this.materialStart)

		this.add(this.botonInicialMesh)

		this.materialesBotonesJuego = [
			new THREE.MeshLambertMaterial({color: 0x32a852 }),
			new THREE.MeshLambertMaterial({color: 0x32a0a8 }),
			new THREE.MeshLambertMaterial({color: 0x9aa832 }),
			new THREE.MeshLambertMaterial({color: 0xa83232 })
		]

		// Crear botones de juego
		let geoBotonJuego = new TrapezoidGeometry(this.botonAnchoInferior, this.botonProfInferior, this.botonAnchoSuperior, this.botonProfSuperior, this.alturaBotonJuego)
		geoBotonJuego.rotateX(Math.PI/2)
		geoBotonJuego.translate(0,0,this.alturaBotonJuego/2)

		let botonJuego = new THREE.Mesh(geoBotonJuego, this.materialesBotonesJuego[0])
		botonJuego.position.set(this.botonAnchoInferior/2 + this.borde - this.panelX/2,
			2*this.borde + this.profundidadBotonInicial + this.separacionCentral + this.botonProfInferior/2, 0)

		this.botones.push(botonJuego)

		botonJuego = botonJuego.clone()
		botonJuego.material = this.materialesBotonesJuego[1]
		botonJuego.position.x += this.borde + this.botonAnchoInferior

		this.botones.push(botonJuego)

		botonJuego = botonJuego.clone()
		botonJuego.material = this.materialesBotonesJuego[2]
		botonJuego.position.x -= (this.borde + this.botonAnchoInferior)
		botonJuego.position.y += this.borde + this.botonProfInferior

		this.botones.push(botonJuego)

		botonJuego = botonJuego.clone()
		botonJuego.material = this.materialesBotonesJuego[3]

		this.botones.push(botonJuego)
		botonJuego.position.x += this.borde + this.botonAnchoInferior

		for (let i = 0; i < this.botones.length; i++)
			this.add(this.botones[i])

		let geoIndicador = new THREE.CylinderGeometry(this.radioIndicador, this.radioIndicador, this.alturaIndicador, 15)
		geoIndicador.rotateX(Math.PI/2)
		geoIndicador.translate(-this.panelX/2, this.panelY, this.alturaIndicador/2) // Esquina sup izquierda centrado

		// Colocarlos en su posición
		geoIndicador.translate(this.radioIndicador + this.borde, -(this.radioIndicador + this.borde), 0)
		this.indicadores.push(new THREE.Mesh(geoIndicador.clone(), new THREE.MeshBasicMaterial({color: 0x111111})))

		geoIndicador.translate(2*this.radioIndicador + this.separacionIndicadores, 0, 0)
		this.indicadores.push(new THREE.Mesh(geoIndicador.clone(), new THREE.MeshBasicMaterial({color: 0x111111})))

		geoIndicador.translate(2*this.radioIndicador + this.separacionIndicadores, 0, 0)
		this.indicadores.push(new THREE.Mesh(geoIndicador.clone(), new THREE.MeshBasicMaterial({color: 0x111111})))

		for (let i = 0; i < this.indicadores.length; i++)
			this.add(this.indicadores[i])
	}
}

export {Simon}
