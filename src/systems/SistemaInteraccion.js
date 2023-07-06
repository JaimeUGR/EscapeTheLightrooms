/*
 * Copyright (c) 2023. Jaime P. and Francisco E.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import * as THREE from '../../libs/three.module.js'
import {GameState} from "../GameState.js"
import {QuadTreeContainer} from "../structures/QuadTree.js"
import {Rect} from "../structures/Rect.js"
import {Vector2} from "../../libs/three.module.js"

class SistemaInteraccion
{
	constructor()
	{
		this.allInteractables = []//new QuadTreeContainer(new Rect(qtInfo.startPos, qtInfo.size), qtInfo.maxDepth)
		this.rayCaster = new THREE.Raycaster()

		this.cached = {
			vect: new Vector2()
		}

		let geoPlano = new THREE.CircleGeometry(GameState.gameData.interactionRange)
		geoPlano.rotateX(Math.PI/2)

		this.debugPlayerBBInteraccion = new THREE.LineSegments(new THREE.WireframeGeometry(geoPlano), new THREE.LineBasicMaterial({
			color: 0xd66aafb
		}))

		GameState.debug.O3Player.add(this.debugPlayerBBInteraccion)
	}

	onMouseClick(event, camera)
	{
		let mouse = this.cached.vect.set(0, 0)

		let width = window.innerWidth
		let height = window.innerHeight

		// Si estamos en modo bloqueado, se usan las coordenadas del ratón
		if (GameState.gameData.cameraLock)
		{
			mouse.x = (event.clientX / width) * 2 - 1
			mouse.y = 1 - 2 * (event.clientY / height)
		}
		else
		{
			mouse.x = 0
			mouse.y = 0
		}

		this.rayCaster.setFromCamera(mouse, camera)

		let interactables = this.rayCaster.intersectObjects(this.allInteractables, true)

		if (interactables.length > 0)
		{
			let interactionResult = interactables[0]

			if (GameState.gameData.interactionRangeEnabled && interactionResult.distance >
				GameState.gameData.interactionRange)
			{
				console.log("Fuera del rango de interacción")
				return
			}

			let interactable = interactionResult.object

			if (interactable.userData && interactable.userData.interaction)
			{
				interactable.userData.interaction.interact(event) // Para saber si es izda o dcha?
			}
		}
	}
}

export {SistemaInteraccion}
