
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"
import {Vela} from "./Vela.js"

import {GameState} from "../GameState.js"

class Tarta extends THREE.Object3D
{
	constructor(radio, altura)
	{
		super()

		this.radio = radio
		this.altura = altura

		//this.materialSofa = new THREE.MeshNormalMaterial({opacity: 0.5,transparent: true})

		let loader = GameState.txLoader

		let texturaTarta = loader.load("../../resources/textures/models/textura_chocolate.jpg")
		//texturaTarta.wrapS = THREE.RepeatWrapping //Indica cómo se repite en la X
		//texturaTarta.wrapT = THREE.RepeatWrapping //Indica cómo se repiten en la Y
		//texturaTarta.repeat.set(2, 1)

		let material = new THREE.MeshLambertMaterial({map: texturaTarta})

		let geoTarta = new THREE.CylinderGeometry(this.radio, this.radio, this.altura, 20)
		geoTarta.translate(0, this.altura/2, 0)

		let tartaMesh = new THREE.Mesh(geoTarta, material)

		this.add(tartaMesh)

		let vela1 = new Vela(0.1, 1, 100)
		vela1.position.y = this.altura
		vela1.position.x = -this.radio/2

		tartaMesh.add(vela1)

		let vela2 = new Vela(0.1, 1, 100)
		vela2.position.y = this.altura
		vela2.position.x = this.radio/2
		tartaMesh.add(vela2)
	}
}

export {Tarta}