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

const FLOATING_CUBES = 100
const FLOATING_CUBES_SIZE_RANGE = [10, 40]
const FLOATING_CUBE_MIN_HEIGHT = 50
const CUBE_SIZE = 600

class EndLocation
{
	constructor()
	{
		this._location = new THREE.Object3D()
		this._location.position.set(0, 2000, 0)

		this._buildLocation()
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
		let geoCubo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
		geoCubo.translate(0, CUBE_SIZE/2, 0)

		let meshCubo = new THREE.Mesh(geoCubo, [
			new THREE.MeshBasicMaterial({color: 0x333333, side: THREE.BackSide}),
			new THREE.MeshBasicMaterial({color: 0x353535, side: THREE.BackSide}),
			new THREE.MeshBasicMaterial({color: 0x373737, side: THREE.BackSide}),
			new THREE.MeshBasicMaterial({color: 0x393939, side: THREE.BackSide}),
			new THREE.MeshBasicMaterial({color: 0x3B3B3B, side: THREE.BackSide}),
			new THREE.MeshBasicMaterial({color: 0x3D3D3D, side: THREE.BackSide})
		])

		this._location.add(meshCubo)
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
		const minPosition = new THREE.Vector3(-CUBE_SIZE/2, FLOATING_CUBE_MIN_HEIGHT, -CUBE_SIZE/2)

		for (let i = 0; i < FLOATING_CUBES; i++)
		{
			const dim = RandomFloatInRange(FLOATING_CUBES_SIZE_RANGE[0], FLOATING_CUBES_SIZE_RANGE[1])

			let geoCubo = new THREE.BoxGeometry(dim, dim, dim)
			geoCubo.translate(RandomFloatInRange(minPosition.x, -minPosition.x),
				RandomFloatInRange(minPosition.y, CUBE_SIZE),
				RandomFloatInRange(minPosition.z, -minPosition.z))

			O3Contenedor.add(new THREE.Mesh(geoCubo, materialCubo))
		}

		this._location.add(O3Contenedor)
	}

	_crearTexto()
	{

	}
}

export {EndLocation}
