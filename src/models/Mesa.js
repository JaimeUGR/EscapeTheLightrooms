
import * as THREE from "../../libs/three.module.js"

class Mesa extends THREE.Object3D
{
	constructor(dimensiones = {
		// Tablero
		tableroX: 80,
		tableroY: 1,
		tableroZ: 40,

		// Patas
		pataX: 4,
		pataY: 20,
		pataZ: 5,

		separacionPatasX: 38, // Separación desde la esquina de la pata (la que se vería) hasta el centro
		separacionPatasZ: 18 // Separación desde la esquina de la pata (la que se vería) hasta el centro
	})
	{
		super()

		this.tableroX = dimensiones.tableroX
		this.tableroY = dimensiones.tableroY
		this.tableroZ = dimensiones.tableroZ

		this.pataX = dimensiones.pataX
		this.pataY = dimensiones.pataY
		this.pataZ = dimensiones.pataZ

		this.separacionPatasX = dimensiones.separacionPatasX
		this.separacionPatasZ = dimensiones.separacionPatasZ

		this.materialTablero = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})
		this.materialPatas = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		// Crear el tablero
		let geoTablero = new THREE.BoxGeometry(this.tableroX, this.tableroY, this.tableroZ)
		geoTablero.translate(0, this.tableroY/2 + this.pataY, 0)

		this.add(new THREE.Mesh(geoTablero, this.materialTablero))

		let geoPata = new THREE.BoxGeometry(this.pataX, this.pataY, this.pataZ)
		geoPata.translate(-this.separacionPatasX + this.pataX/2, this.pataY/2, this.separacionPatasZ - this.pataZ/2)

		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))

		geoPata.translate(2*this.separacionPatasX - this.pataX, 0, 0)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))

		geoPata.translate(this.pataX - 2*this.separacionPatasX, 0, this.pataZ - 2*this.separacionPatasZ)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))

		geoPata.translate(2*this.separacionPatasX - this.pataX, 0, 0)
		this.add(new THREE.Mesh(geoPata.clone(), this.materialPatas))


		// Para poder poner objetos encima
		this.tableroO3D = new THREE.Object3D()
		this.tableroO3D.position.set(0, this.tableroY + this.pataY, 0)

		this.add(this.tableroO3D)
	}
}

export {Mesa}
