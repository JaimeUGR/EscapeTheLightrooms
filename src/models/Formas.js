
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

class Estrella extends THREE.Object3D
{
	constructor(extrusion)
	{
		super()

		this.extrusion = extrusion
		let shapeEstrella = new THREE.Shape()
		this.materialSofa = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

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


		var options =  {bevelEnabled: false, depth: 2, steps: this.extrusion, curveSegments: 2,
			bevelThickness: 0.1, bevelSize: 0.2 , bevelSegements :2};

		var geoshapeEstrella= new THREE.ExtrudeGeometry(shapeEstrella,options);
		geoshapeEstrella.rotateZ(Math.PI)
	    geoshapeEstrella.translate(0,0, -this.extrusion/2)


		let shapeEstrellaMesh = new THREE.Mesh(geoshapeEstrella,this.materialSofa )

		this.add(shapeEstrellaMesh)


	}
}

class Pentagono extends  THREE.Object3D
{
	constructor(extrusion)
	{
		super()
		this.extrusion = extrusion
		this.materialSofa = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})
		let shapePentagono = new THREE.Shape()


		shapePentagono.moveTo(0, 0.5);
		shapePentagono.lineTo(-0.5, 0.1);
		shapePentagono.lineTo(-0.3, -0.5);
		shapePentagono.lineTo(0.3, -0.5);
		shapePentagono.lineTo(0.5, 0.1);
		shapePentagono.lineTo(0, 0.5);


		var options =  {bevelEnabled: true, depth: 2, steps: this.extrusion, curveSegments: 2,
			bevelThickness: 0.1, bevelSize: 0.2 , bevelSegements :2};

		var geoshapePentagono= new THREE.ExtrudeGeometry(shapePentagono,options);
		geoshapePentagono.translate(0, 0, -this.extrusion/2)


		let shapePentagonoMesh = new THREE.Mesh(geoshapePentagono,this.materialSofa )

		this.add(shapePentagonoMesh)

	}
}

class Prisma extends THREE.Object3D
{
	constructor(extrusion, numVertices) {
		super()
		this.extrusion = extrusion
		let shapeFormaRandom = new THREE.Shape()
		this.materialSofa = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		this.numVertices = numVertices;
		const radius = 0.5; // Radio de la figura

		// Calcular los ángulos de los vértices
		const angleIncrement = (Math.PI * 2) / this.numVertices;
		let currentAngle = Math.PI/2;

		// Crear los vértices de la figura
		for (let i = 0; i < this.numVertices; i++) {
			const x = Math.cos(currentAngle) * radius;
			const y = Math.sin(currentAngle) * radius;

			if (i === 0) {
				shapeFormaRandom.moveTo(x, y);
			} else {
				shapeFormaRandom.lineTo(x, y);
			}

			currentAngle += angleIncrement;
		}

		var options =  {bevelEnabled: false, depth: this.extrusion, steps: 2, curveSegments: 2,
			bevelThickness: 0.1, bevelSize: 0.2 , bevelSegements :2};

		var geoshapeFormaRandom= new THREE.ExtrudeGeometry(shapeFormaRandom,options);
		geoshapeFormaRandom.translate(0,0,-this.extrusion/2)

		let shapeFormaRandomMesh = new THREE.Mesh(geoshapeFormaRandom, this.materialSofa)

		this.add(shapeFormaRandomMesh)
	}
}

export {Estrella, Pentagono, Prisma}
