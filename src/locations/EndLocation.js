/*
 * Copyright (c) 2023. Jaime Pérez García y Francisco Expósito Carmona.
 *
 * Escape The Lightrooms
 *
 * Todos los derechos reservados sobre la pertenencia del código, modelos y animaciones.
 * Las texturas están debidamente referenciadas a sus autores.
 */

import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'

import {GameState} from "../GameState.js"
import {RandomIntInRange, RandomFloatInRange} from "../Utils.js"
import {Vector3} from "../../libs/three.module.js"

const FLOATING_CUBES = 2500
const FLOATING_CUBES_SIZE_RANGE = [10, 50]
const FLOATING_CUBE_MIN_HEIGHT = 250
const AREA_SIZE = 25000

class EndLocation
{
	constructor(game)
	{
		this._mainGame = game

		this._position = new Vector3(0, 0, 0)
		this._location = new THREE.Object3D()
		this._location.position.copy(this._position)

		this._buildLocation()
	}

	loadLocation()
	{
		// Desenganchar las salas
		this._mainGame.remove(this._mainGame.salaPrincipal)
		this._mainGame.remove(this._mainGame.salaIzquierda)
		this._mainGame.remove(this._mainGame.salaDerecha)
		this._mainGame.remove(this._mainGame.salaSuperior)
		this._mainGame.remove(this._mainGame.salaFinal)

		// Añadir la nueva sala
		this._mainGame.add(this._location)

		// Teletransportar al jugador
		GameState.player.position.x = this._position.x
		GameState.player.position.z = this._position.z
		GameState.player.position.y += this._position.y
		GameState.player.initialPosition.copy(GameState.player.position)

		// Limpiar el árbol de colisiones
		GameState.systems.collision.clearAllColliders()

		// Hacer invisible la información debug
		GameState.debug.O3Player.visible = false
		GameState.systems.collision.debugNode.visible = false

		// Actualizar la distancia de la cámara
		GameState.systems.cameras.getCamaraActiva().far = AREA_SIZE + 1000
		GameState.systems.cameras.getCamaraActiva().updateProjectionMatrix()

		// Recolocar el interaction range por defecto
		GameState.gameData.interactionRange = 50

		// Añadir las colisiones nuevas del cubo
		// TODO: Método para crearlas, hacer el update colliders, etc

		// Cambiar el color de fondo de la escena para simular la skybox
		this._mainGame.background = new THREE.Color(0x121212)

		// Luces
		this._crearLuces()
	}

	getLocation()
	{
		return this._location
	}

	_buildLocation()
	{
		this._crearCuboSkybox()
		this._crearCubos()
		this._crearTexto()
	}

	_crearCuboSkybox()
	{
		/*let geoCubo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
		geoCubo.translate(0, CUBE_SIZE/2, 0)

		let meshCubo = new THREE.Mesh(geoCubo,
			new THREE.MeshLambertMaterial({color: 0x151515, side: THREE.BackSide}))

		this._location.add(meshCubo)*/
	}

	_crearCubos()
	{
		//
		// Materiales
		//

		const materialCubo = new THREE.MeshNormalMaterial()

		//
		// Modelado
		//

		let O3Contenedor = new THREE.Object3D()

		// Crear una lista de cubos posicionados aleatoriamente
		const listaCubosFlotantes = []
		const minPosition = new THREE.Vector3(-AREA_SIZE/2, FLOATING_CUBE_MIN_HEIGHT, -AREA_SIZE/2)

		for (let i = 0; i < FLOATING_CUBES; i++)
		{
			const dim = RandomFloatInRange(FLOATING_CUBES_SIZE_RANGE[0], FLOATING_CUBES_SIZE_RANGE[1])

			let geoCubo = new THREE.BoxGeometry(dim, dim, dim)
			geoCubo.translate(RandomFloatInRange(minPosition.x, -minPosition.x),
				RandomFloatInRange(minPosition.y, AREA_SIZE),
				RandomFloatInRange(minPosition.z, -minPosition.z))

			O3Contenedor.add(new THREE.Mesh(geoCubo, materialCubo))

			let meshInverso = new THREE.Mesh(geoCubo, materialCubo)
			meshInverso.scale.y = -1
			O3Contenedor.add(meshInverso)
		}

		this._location.add(O3Contenedor)
	}

	_crearTexto()
	{

	}

	_crearLuces()
	{
		// Luz texto
		{

		}
	}
}

export {EndLocation}
