
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"

import {GameState} from "../GameState.js"

class Poster extends THREE.Object3D
{
	constructor(ancho, alto, path)
	{
		super()
		this.ancho = ancho
		this.altura = alto
		this.path = path

		//this.materialSofa = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		let loader = GameState.txLoader

		let texturaPoster = loader.load(this.path)

		let materialPoster = new THREE.MeshLambertMaterial({map: texturaPoster})

		let planeGeometry = new THREE.PlaneGeometry(this.ancho, this.altura);
		planeGeometry.translate(0,0, 0)

		let planoMesh = new THREE.Mesh(planeGeometry, materialPoster)

		this.add(planoMesh)
	}
}

export {Poster}
