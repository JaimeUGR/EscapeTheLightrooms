
import * as THREE from '../../libs/three.module.js'
import {GameState} from "../GameState.js"
import {Rect} from "../structures/Rect.js"
import {Vector2} from "../../libs/three.module.js"
import {QuadTreeContainer} from "../structures/QuadTree.js"

class SistemaColisiones
{
	// Variables para optimizar el proceso de conversión

	// PRE: Se ha actualizado la worldMatrix
	static Box3ToRect(baseCollider, worldMatrix)
	{
		return SistemaColisiones.Box3ArrayToRectArray([baseCollider], worldMatrix)[0]
	}

	// PRE: Se ha actualizado la worldMatrix
	static Box3ArrayToRectArrayBuffer(baseColliders, worldMatrix, outRects)
	{
		let colCpy = null

		for (let baseCol of baseColliders)
		{
			colCpy = baseCol.clone()
			colCpy.applyMatrix4(worldMatrix)
			outRects.push(new Rect(new Vector2(colCpy.min.x, colCpy.min.z),
				new Vector2(colCpy.max.x - colCpy.min.x, colCpy.max.z - colCpy.min.z)))
		}

		return outRects
	}

	static Box3ArrayToRectArray(baseColliders, worldMatrix)
	{
		let outRects = []
		return SistemaColisiones.Box3ArrayToRectArrayBuffer(baseColliders, worldMatrix, outRects)
	}

	constructor(qtInfo = {
		startPos: new Vector2(),
		size: new Vector2(),
		maxDepth: 4
	})
	{
		this.colliderTree = new QuadTreeContainer(new Rect(qtInfo.startPos, qtInfo.size), qtInfo.maxDepth)
		this.colObjectMap = new Map()

		//
		// Datos Cache
		//

		this.cached = {
			rayOrigin: new Vector2(),
			expandedTargetPos: new Vector2(),
			expandedTargetSize: new Vector2(),
			rect: new Rect(new Vector2(), new Vector2()),
			movV: new Vector2(),
			collResult: {
				contactPoint: new Vector2(),
				contactNormal: new Vector2(),
				tHitNear: 0
			}
		}

		//
		// DEBUG
		//
		this.debugObjectMap = new Map()
		this.debugNode = new THREE.Object3D()
		this.debugNode.translateY(50)
		this.debugPlayerBB = null

		let geoPlano = new THREE.PlaneGeometry(GameState.player.rect.size.x, GameState.player.rect.size.y)

		geoPlano.rotateX(Math.PI/2)

		this.debugPlayerBB = new THREE.LineSegments(new THREE.WireframeGeometry(geoPlano), new THREE.LineBasicMaterial({
			color: 0xffde2b
		}))
		this.debugNode.add(this.debugPlayerBB)

		// Para hacer debug
		this.aniadeRectColliders("test", [
			new Rect(new THREE.Vector2(10, 0), new THREE.Vector2(50, 20)),
			new Rect(new THREE.Vector2(15, 20), new THREE.Vector2(10, 30))
		])

		this.debugTimerStart = 0
		this.debugTimerEnd = 0
	}

	aniadeRectColliders(uuid, rects)
	{
		let arrayObjInfo = null

		// Comprobamos si esta uuid ya estaba registrada
		if (this.colObjectMap.has(uuid))
		{
			arrayObjInfo = this.colObjectMap.get(uuid)

			let objInfo = null

			// Se intercambian todos los colliders del árbol por los nuevos
			for (let i = 0; i < arrayObjInfo.length; i++)
			{
				objInfo = arrayObjInfo[i]
				objInfo = this.colliderTree.update(objInfo.globalIndex, rects[i])
			}

			// Si quedan más en los rects nuevos, se pushean
			for (let i = arrayObjInfo.length; i < rects.length; i++)
				arrayObjInfo.push(this.colliderTree.insert(rects[i]))

			this._debugUpdateRects(uuid, rects)

			return
		}

		// Registramos este objeto y reservamos para los índices
		arrayObjInfo = []
		this.colObjectMap.set(uuid, arrayObjInfo)

		// Añadimos los colliders al árbol
		for (let i = 0; i < rects.length; i++)
			arrayObjInfo.push(this.colliderTree.insert(rects[i]))

		// Solicitamos la debug update de los rect
		this._debugUpdateRects(uuid, rects)
	}

	_debugUpdateRects(uuid, newRects)
	{
		if (!this.debugObjectMap.has(uuid))
			this.debugObjectMap.set(uuid, [])

		let arrayMeshes = this.debugObjectMap.get(uuid)

		for (let i = 0; i < arrayMeshes.length; i++)
			this.debugNode.remove(arrayMeshes[i])

		for (let i = 0; i < newRects.length; i++)
		{
			let rect = newRects[i]

			let geoPlano = new THREE.PlaneGeometry(rect.size.x, rect.size.y)

			geoPlano.rotateX(Math.PI/2)

			geoPlano.translate(rect.size.x/2, 0, rect.size.y/2)
			geoPlano.translate(rect.pos.x, 0, rect.pos.y)

			let meshPlano = new THREE.LineSegments(new THREE.WireframeGeometry(geoPlano), new THREE.LineBasicMaterial({
				color: 0x36ff6b
			}))

			arrayMeshes.push(meshPlano)
			this.debugNode.add(meshPlano)
		}
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
		let expandedTargetRect = this.cached.rect

		expandedTargetRect.pos.set(target.pos.x - source.size.x/2, target.pos.y - source.size.y/2)
		expandedTargetRect.size.set(target.size.x + source.size.x, target.size.y + source.size.y)

		return this._RayVSRect(rayOrigin, movV, expandedTargetRect)
	}

	// Procesar las colisiones según el movimiento del jugador
	update(movementVector)
	{
		// Preparar los parámetros
		let playerPos = GameState.player.position
		let playerRect = GameState.player.rect
		let movV = this.cached.movV.set(movementVector.x, movementVector.z)
		let colRes = null

		// Obtener el rectángulo que contiene al jugador y al objetivo
		let searchRect = this.cached.rect

		// Sacar las esquinas
		searchRect.pos.x = Math.min(playerRect.pos.x, playerRect.pos.x + movV.x)
		searchRect.pos.y = Math.min(playerRect.pos.y, playerRect.pos.y + movV.y)
		searchRect.size.x = Math.max(playerRect.pos.x + playerRect.size.x, playerRect.pos.x + playerRect.size.x + movV.x) - searchRect.pos.x
		searchRect.size.y = Math.max(playerRect.pos.y + playerRect.size.y, playerRect.pos.y + playerRect.size.y + movV.y) - searchRect.pos.y

		let foundColliders = this.colliderTree.searchArea(searchRect)

		for (let i = 0; i < foundColliders.length; i++)
		{
			colRes = this._DynamicRectVSRect(playerRect, movV, foundColliders[i])

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

		// DEBUG: Actualizar la posición de la BB del jugador
		this.debugPlayerBB.position.set(playerPos.x, 0,
			playerPos.z)
	}
}

export {SistemaColisiones}
