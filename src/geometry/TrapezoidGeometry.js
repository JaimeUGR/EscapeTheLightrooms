
import * as THREE from "../../libs/three.module.js"

class TrapezoidGeometry extends THREE.BufferGeometry
{
	constructor(widthBottom, depthBottom, widthTop, depthTop, height, indexed = false)
	{
		super()

		let halfH = height/2
		let halfWB = widthBottom/2
		let halfWT = widthTop/2
		let halfDB = depthBottom/2
		let halfDT = depthTop/2

		// Indexada
		if (indexed)
		{
			const vertices = new Float32Array([
				// 3 2
				// 0 1
				// Base inferior
				-halfWB, -halfH, halfDB,
				halfWB, -halfH, halfDB,
				halfWB, -halfH, -halfDB,
				-halfWB, -halfH, -halfDB,

				// 7 6
				// 4 5
				// Base superior
				-halfWT, halfH, halfDT,
				halfWT, halfH, halfDT,
				halfWT, halfH, -halfDT,
				-halfWT, halfH, -halfDT,
			])

			const faces = [
				// Base inferior
				3, 2, 0,
				2, 1, 0,

				// Frontal
				0, 1, 5,
				5, 4, 0,

				// Lateral Dcha
				1, 2, 6,
				6, 5, 1,

				// Trasera
				2, 3, 7,
				7, 6, 2,

				// Lateral Izda
				3, 0, 4,
				4, 7, 3,

				// Base superior
				4, 5, 6,
				6, 7, 4
			]

			const uvs = new Float32Array([
				0, 0,
				1, 0,
				1, 1,
				0, 1,
				0, 0,
				1, 0,
				1, 1,
				0, 1
			])

			this.setIndex(faces)
			this.setAttribute( 'position', new THREE.BufferAttribute(vertices, 3))
			this.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
		}
		else
		{
			const verticesNoIdx = new Float32Array([
				// Cara Inferior
				-halfWB, -halfH, -halfDB, halfWB, -halfH, -halfDB, -halfWB, -halfH, halfDB,
				halfWB, -halfH, -halfDB, halfWB, -halfH, halfDB, -halfWB, -halfH, halfDB,

				// Cara Frontal
				-halfWB, -halfH, halfDB, halfWB, -halfH, halfDB, halfWT, halfH, halfDT,
				halfWT, halfH, halfDT, -halfWT, halfH, halfDT, -halfWB, -halfH, halfDB,

				// Cara Dcha
				halfWB, -halfH, halfDB, halfWB, -halfH, -halfDB, halfWT, halfH, -halfDT,
				halfWT, halfH, -halfDT, halfWT, halfH, halfDT, halfWB, -halfH, halfDB,

				// Cara Trasera
				halfWB, -halfH, -halfDB, -halfWB, -halfH, -halfDB, -halfWT, halfH, -halfDT,
				-halfWT, halfH, -halfDT, halfWT, halfH, -halfDT, halfWB, -halfH, -halfDB,

				// Cara Izda
				-halfWB, -halfH, -halfDB, -halfWB, -halfH, halfDB, -halfWT, halfH, halfDT,
				-halfWT, halfH, halfDT, -halfWT, halfH, -halfDT, -halfWB, -halfH, -halfDB,

				// Cara Superior
				-halfWT, halfH, halfDT, halfWT, halfH, halfDT, halfWT, halfH, -halfDT,
				halfWT, halfH, -halfDT, -halfWT, halfH, -halfDT, -halfWT, halfH, halfDT
			])

			const uvs = new Float32Array([
				// Base inferior
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// Frontal
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// Lateral Dcha
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// Trasera
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// Lateral Izda
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// Base superior
				0, 0,
				1, 0,
				1, 1,
				0, 1,
			])

			this.setAttribute( 'position', new THREE.BufferAttribute(verticesNoIdx, 3))
			this.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
		}

		// Grupos para los materiales
		this.addGroup(0, 6, 0)
		this.addGroup(6, 6, 1)
		this.addGroup(12, 6, 2)
		this.addGroup(18, 6, 3)
		this.addGroup(24, 6, 4)
		this.addGroup(30, 6, 5)

		this.computeVertexNormals()
	}
}

export {TrapezoidGeometry}
