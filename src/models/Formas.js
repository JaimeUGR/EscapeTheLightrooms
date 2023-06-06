/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

class Estrella extends THREE.ExtrudeGeometry
{
	constructor(extrusion)
	{
		let shapeEstrella = new THREE.Shape()
		const radio = 0.5; // Radio de la estrella

		for (let i = 0; i < 10; i++)
		{
			const angle = (Math.PI * 2 * i) / 10 + Math.PI / 2;
			const innerRadius = i % 2 === 0 ? radio * 0.5 : radio; // Alternar el radio interno y externo

			const x = Math.cos(angle) * innerRadius;
			const y = Math.sin(angle) * innerRadius;

			if (i === 0) {
				shapeEstrella.moveTo(x, y);
			} else {
				shapeEstrella.lineTo(x, y);
			}
		}

		const options =  {bevelEnabled: false, depth: extrusion, steps: 2}

		super(shapeEstrella,options)

		this.extrusion = extrusion
		this.numVertices = 10

		this.rotateZ(Math.PI)
	    this.translate(0,0, -this.extrusion/2)
	}
}

class Pentagono extends THREE.ExtrudeGeometry
{
	constructor(extrusion)
	{
		let shapePentagono = new THREE.Shape()

		shapePentagono.moveTo(0, 0.5);
		shapePentagono.lineTo(-0.5, 0.1);
		shapePentagono.lineTo(-0.3, -0.5);
		shapePentagono.lineTo(0.3, -0.5);
		shapePentagono.lineTo(0.5, 0.1);
		shapePentagono.lineTo(0, 0.5);

		const options =  {bevelEnabled: false, depth: extrusion, steps: 2}

		super(shapePentagono,options)

		this.altura = extrusion
		this.numVertices = 5

		this.translate(0,0, -this.altura/2)
	}
}

class Prisma extends THREE.ExtrudeGeometry
{
	constructor(extrusion, numVertices, extrudeOptions = null)
	{
		let shapeFormaRandom = new THREE.Shape()
		const radius = 0.5; // Radio de la figura

		// Calcular los ángulos de los vértices
		const angleIncrement = (Math.PI * 2) / numVertices
		let currentAngle = Math.PI/2

		// Crear los vértices de la figura
		for (let i = 0; i < numVertices; i++)
		{
			const x = Math.cos(currentAngle) * radius
			const y = Math.sin(currentAngle) * radius

			if (i === 0)
				shapeFormaRandom.moveTo(x, y)
			else
				shapeFormaRandom.lineTo(x, y)

			currentAngle += angleIncrement
		}

		let options =  {bevelEnabled: false, depth: extrusion, steps: 2}

		if (extrudeOptions !== null)
		{
			options = extrudeOptions
			options.depth = extrusion
		}

		super(shapeFormaRandom, options)

		this.altura = extrusion
		this.numVertices = numVertices

		this.translate(0,0, -this.altura/2)
	}
}

export {Estrella, Pentagono, Prisma}
