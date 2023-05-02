
import * as THREE from '../../libs/three.module.js'
import {GameState} from "../GameState.js";
import {Rect} from "../structures/Rect.js";
import {Vector2} from "../../libs/three.module.js";

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
		/*geoPlano.translate(GameState.player.rect.size.x/2, 0, GameState.player.rect.size.y/2)
		geoPlano.translate(GameState.player.rect.pos.x, 0, GameState.player.rect.pos.y)*/

		this.debugPlayerBB = new THREE.LineSegments(new THREE.WireframeGeometry(geoPlano), new THREE.LineBasicMaterial({
			color: 0xffde2b
		}))
		this.debugNode.add(this.debugPlayerBB)

		// Para hacer debug
		this.aniadeBB(new Rect(new THREE.Vector2(10, 0), new THREE.Vector2(50, 20)))
		//for (let i = 0; i < 200; i++)
		this.aniadeBB(new Rect(new THREE.Vector2(15, 20), new THREE.Vector2(10, 30)))
		//this.aniadeBB(new Rect(new THREE.Vector2(40, 50), new THREE.Vector2(30, 10)))

		this.debugTimerStart = 0
		this.debugTimerEnd = 0

		this.cached = {
			rayOrigin: new Vector2(),
			expandedTargetPos: new Vector2(),
			expandedTargetSize: new Vector2(),
			expandedRect: new Rect(),
			movV: new Vector2(),
			collResult: {
				contactPoint: new Vector2(),
				contactNormal: new Vector2(),
				tHitNear: 0
			}
		}
	}

	aniadeBB(rect)
	{
		this.colliders.push(rect)

		// Añadir el nodo para visualizarlo
		let geoPlano = new THREE.PlaneGeometry(rect.size.x, rect.size.y)

		geoPlano.rotateX(Math.PI/2)

		// Colocar en 0,0 la esquina inferior derecha
		geoPlano.translate(rect.size.x/2, 0, rect.size.y/2)
		geoPlano.translate(rect.pos.x, 0, rect.pos.y)

		this.debugNode.add(new THREE.LineSegments(new THREE.WireframeGeometry(geoPlano), new THREE.LineBasicMaterial({
			color: 0x33468f
		})))
	}

	_RayVSRect(rayOrigin, rayDir, targetRect)
	{
		let tNear = {
			x: (targetRect.pos.x - rayOrigin.x) / rayDir.x,
			y: (targetRect.pos.y - rayOrigin.y) / rayDir.y
		}

		let tFar = {
			x: (targetRect.pos.x + targetRect.size.x - rayOrigin.x) / rayDir.x,
			y: (targetRect.pos.y + targetRect.size.y - rayOrigin.y) / rayDir.y
		}

		if (isNaN(tNear.x) || isNaN(tNear.y)) return null
		if (isNaN(tFar.x) || isNaN(tFar.y)) return null

		if (tNear.x > tFar.x) [tNear.x, tFar.x] = [tFar.x, tNear.x]
		if (tNear.y > tFar.y) [tNear.y, tFar.y] = [tFar.y, tNear.y]

		if (tNear.x > tFar.y || tNear.y > tFar.x) return null

		let tHitNear = Math.max(tNear.x, tNear.y)
		let tHitFar = Math.min(tFar.x, tFar.y)

		if (tHitFar < 0) return null
		if (tHitNear > 1) return null
		if (tHitNear < 0) return null

		let collResult = this.cached.collResult
		let contactPoint = collResult.contactPoint.set(rayOrigin.x + tHitNear*rayDir.x, rayOrigin.y + tHitNear*rayDir.y)
		let contactNormal = collResult.contactNormal

		if (tNear.x > tNear.y)
		{
			if (rayDir.x < 0) contactNormal.set(1, 0)
			else contactNormal.set(-1, 0)
		}
		else if (tNear.x < tNear.y)
		{
			if (rayDir.y < 0) contactNormal.set(0, 1)
			else contactNormal.set(0, -1)
		}

		collResult.tHitNear = tHitNear

		return collResult
	}

	// PRE: movV está ajustado al frameRate
	_DynamicRectVSRect(source, movV, target)
	{
		if (movV.x === 0.0 && movV.y === 0.0)
			return null

		let rayOrigin = this.cached.rayOrigin.set(source.pos.x + source.size.x/2, source.pos.y + source.size.y/2)
		let expandedTargetPos = this.cached.expandedTargetPos.set(target.pos.x - source.size.x/2, target.pos.y - source.size.y/2)
		let expandedTargetSize = this.cached.expandedTargetSize.set(target.size.x + source.size.x, target.size.y + source.size.y)
		let expandedTarget = this.cached.expandedRect.set(expandedTargetPos, expandedTargetSize)

		return this._RayVSRect(rayOrigin, movV, expandedTarget)
	}

	// Procesar las colisiones según el movimiento del jugador
	update(movementVector)
	{
		// Calcular colisiones
		let playerPos = GameState.player.position
		let playerRect = GameState.player.rect
		let movV = this.cached.movV.set(movementVector.x, movementVector.z)
		let colRes = null

		for (let i = 0; i < this.colliders.length; i++)
		{
			colRes = this._DynamicRectVSRect(playerRect, movV, this.colliders[i])

			if (colRes != null)
			{
				movementVector.x += Math.abs(movementVector.x) * colRes.contactNormal.x * (1 - colRes.tHitNear)
				movementVector.z += Math.abs(movementVector.z) * colRes.contactNormal.y * (1 - colRes.tHitNear)
			}
		}

		// Mover al jugador
		playerPos.add(movementVector)

		// Mover la posición del rect
		playerRect.pos.x = playerPos.x - playerRect.size.x/2
		playerRect.pos.y = playerPos.z - playerRect.size.y/2

		//console.log("X: " + GameState.player.rect.pos.x + " PLAYER X: " + GameState.player.position.x)
		//console.log("Y: " + GameState.player.rect.pos.y + " PLAYER Y: " + GameState.player.position.z)


		// Actualizar la posición de la BB del jugador
		this.debugPlayerBB.position.set(playerPos.x, 0,
			playerPos.z)
	}
}

export {SistemaColisiones}
