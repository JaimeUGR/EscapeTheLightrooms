
import * as THREE from '../../../libs/three.module.js'
import {TriangularPrismGeometry} from "../../geometry/PrismGeometry.js"

class Prisma extends THREE.Object3D
{
	constructor(dimensiones = {
		ladoPrisma: 5,
		altoPrisma: 5
	})
	{
		super()

		this.ladoPrisma = dimensiones.ladoPrisma
		this.altoPrisma = dimensiones.altoPrisma

		this.materialPrisma = new THREE.MeshPhysicalMaterial({
			color: 0xffffff, // Color cristal
			transparent: true,
			opacity: 0.7, // Opacidad
			roughness: 0, // Rugosidad
			metalness: 0, // Metalicidad
			clearcoat: 0.4, // Capa de recubrimiento clara
			clearcoatRoughness: 0.1, // Rugosidad de la capa de recubrimiento clara
		})

		let geoPrisma = new TriangularPrismGeometry(this.ladoPrisma, this.altoPrisma)
		geoPrisma.translate(0, this.altoPrisma/2, 0)
		geoPrisma.rotateX(Math.PI/2)

		this.meshPrisma = new THREE.Mesh(geoPrisma, this.materialPrisma)
		
		this.add(this.meshPrisma)
		this.name = "Prisma"
	}
}

export {Prisma}
