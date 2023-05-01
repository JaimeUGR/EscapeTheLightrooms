
import * as THREE from '../../libs/three.module.js'
import {GameState} from "../GameState.js";
import {Rect} from "../structures/Rect.js";

class SistemaColisiones
{
	constructor()
	{
		this.colliders = []

		// Para hacer las traslaciones necesarias
		this.debugNode = new THREE.Object3D()
		this.debugNode.translateY(150)
		this.debugPlayerBB = null

		let geoPlano = new THREE.PlaneGeometry(GameState.player.rect.size.x, GameState.player.rect.size.y)

		geoPlano.rotateX(Math.PI/2)
		geoPlano.translate(-GameState.player.rect.size.x/2, 0, GameState.player.rect.size.y/2)
		geoPlano.translate(GameState.player.rect.pos.x, 0, GameState.player.rect.pos.y)

		this.debugPlayerBB = new THREE.LineSegments(new THREE.WireframeGeometry(geoPlano), new THREE.LineBasicMaterial({
			color: 0xffde2b
		}))
		this.debugNode.add(this.debugPlayerBB)

		// Para hacer debug
		this.aniadeBB(new Rect(new THREE.Vector2(-5, 5), new THREE.Vector2(20, 20)))
		this.aniadeBB(new Rect(new THREE.Vector2(15, 20), new THREE.Vector2(10, 30)))
		this.aniadeBB(new Rect(new THREE.Vector2(40, 50), new THREE.Vector2(30, 10)))
	}

	aniadeBB(rect)
	{
		this.colliders.push(rect)

		// Añadir el nodo para visualizarlo
		let geoPlano = new THREE.PlaneGeometry(rect.size.x, rect.size.y)

		geoPlano.rotateX(Math.PI/2)
		geoPlano.translate(-rect.size.x/2, 0, rect.size.y/2)
		geoPlano.translate(rect.pos.x, 0, rect.pos.y)

		this.debugNode.add(new THREE.LineSegments(new THREE.WireframeGeometry(geoPlano), new THREE.LineBasicMaterial({
			color: 0x33468f
		})))
	}

	_RayVSRect(rayOrigin, rayDir, targetRect)
	{
		let tNear = (targetRect.position - rayOrigin) / rayDir
		let tFar = (targetRect.position + targetRect.size - rayOrigin) / rayDir

		if (tNear.x > tFar.x) [tNear.x, tFar.x] = [tFar.x, tNear.x]
		if (tNear.y > tFar.y) [tNear.y, tFar.y] = [tFar.y, tNear.y]

		if (tNear.x > tFar.y || tNear.y > tFar.x) return false

		let tHitNear = Math.max(tNear.x, tNear.y)
		let tHitFar = Math.min(tFar.x, tFar.y)
	}

	// Procesar las colisiones según el movimiento del jugador
	update(movementVector)
	{
		let initialPosition = GameState.player.position
		let finalPosition = new THREE.Vector3().copy(initialPosition).add(movementVector)

		// Calcular colisiones

		GameState.player.position = finalPosition

		// Actualizar la posición de la BB del jugador
		this.debugPlayerBB.position.set(finalPosition.x, 0, finalPosition.z)
	}
}

export {SistemaColisiones}
