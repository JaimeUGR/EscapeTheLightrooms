
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
	}

	onMouseClick(event, camera)
	{
		let mouse = this.cached.vect.set(0, 0)

		let width = window.innerWidth
		let height = window.innerHeight

		// Si estamos en modo bloqueado, se usan las coordenadas del ratón
		if (GameState.tmp.cameraLock)
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

		console.log("Busco interactuables")
		let interactables = this.rayCaster.intersectObjects(this.allInteractables, true)

		if (interactables.length > 0)
		{
			console.log("He encontrado interactuable")
			let interactable = interactables[0].object

			console.log(interactable.userData)

			if (interactable.userData && interactable.userData.interaction)
			{
				console.log(interactable.userData)
				console.log("Intento interactuar")
				interactable.userData.interaction.interact(event) // Para saber si es izda o dcha?
			}
		}
	}
}

export {SistemaInteraccion}
