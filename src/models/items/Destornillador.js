/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from '../../../libs/three.module.js'
import {MTLLoader} from "../../../libs/MTLLoader.js"
import {OBJLoader} from "../../../libs/OBJLoader.js"
import {GameState} from "../../GameState.js"

class Destornillador extends THREE.Object3D
{
	constructor(escala = 50, onLoadCallback = null)
	{
		super()

		let materialLoader = new MTLLoader()
		let objectLoader = new OBJLoader()

		materialLoader.load('./resources/models/materials/screwdriver.mtl',
			(materials) => {
				objectLoader.setMaterials(materials);
				objectLoader.load('./resources/models/screwdriver.obj',
					(object) => {

						const textureLoader = GameState.txLoader
						const texture = textureLoader.load('./resources/models/textures/Screw_Base_Color.png');
						const roughnessTexture = textureLoader.load('./resources/models/textures/Screw_Roughness.png');

						for (let i = 0; i < object.children.length; i++)
						{
							let material = object.children[i].material

							material.map = texture;
							material.roughnessMap = roughnessTexture;
						}

						object.rotation.y = Math.PI/2
						object.scale.set(escala, escala, escala)

						this.add(object)

						if (onLoadCallback)
							onLoadCallback(this)

					}, null, null)
			})

		this.name = "Destornillador"
	}
}

export {Destornillador}
