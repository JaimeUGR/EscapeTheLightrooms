
import * as THREE from '../../../libs/three.module.js'
import {TriangularPrismGeometry} from "../../geometry/PrismGeometry.js"

class Prisma extends THREE.Object3D
{
	constructor(dimensiones = {
		ladoPrisma: 5,
		altoPrisma: 10
	})
	{
		super()

		this.ladoPrisma = dimensiones.ladoPrisma
		this.altoPrisma = dimensiones.altoPrisma
		this.materialPrisma = new THREE.MeshBasicMaterial({color: 0xffeeff})

		let geoPrisma = new TriangularPrismGeometry(this.ladoPrisma, this.altoPrisma)
		geoPrisma.translate(0, this.altoPrisma/2, 0)

		this.meshPrisma = new THREE.Mesh(geoPrisma, this.materialPrisma)
		
		this.add(this.meshPrisma)
		this.name = "Prisma"
	}
}

export {Prisma}
