/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from "../../libs/three.module.js"

class PrismGeometry extends THREE.ExtrudeGeometry
{
	constructor(vertices, height)
	{
		super(new THREE.Shape(vertices), {depth: height, bevelEnabled: false})

		// Centrarlo
		this.translate(0, 0, -height/2)

		// Como se extruye en Z+, lo rotamos -90deg en X
		this.rotateX(-Math.PI/2)
	}
}

class TriangularPrismGeometry extends PrismGeometry
{
	constructor(sideSize, height)
	{
		// T. Pitágoras
		let triangleHeight = sideSize * Math.sqrt(3) / 2

		super([
			new THREE.Vector2(sideSize/2, -triangleHeight/2),
			new THREE.Vector2(0, triangleHeight/2),
			new THREE.Vector2(-sideSize/2, -triangleHeight/2)
		], height)

		this.sideSize = sideSize
		this.triangleHeight = triangleHeight
		this.height = height
	}
}

export {PrismGeometry, TriangularPrismGeometry}
