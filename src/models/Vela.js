
import * as THREE from "../../libs/three.module.js"
import {CSG} from "../../libs/CSG-v2.js"
import {Shape} from "../../libs/three.module.js"

import {GameState} from "../GameState.js"

class Vela extends THREE.Object3D
{
	constructor(radio, altura, numPuntos)
	{
		super()

		this.radio = radio
		this.altura = altura
		this.numPuntos = numPuntos

		let loader = GameState.txLoader
		let texturaVela = loader.load("../../resources/textures/models/textura_vela.jpg")
		let material = new THREE.MeshBasicMaterial({map: texturaVela})

		let circulo = new shapeCirculo(this.radio, this.altura, this.numPuntos).toGeometry()

		this.add(new THREE.Mesh(circulo, material))
	}
}

class shapeCirculo
{
	constructor(radio, altura, numPuntos) {
		this.radio = radio
		this.altura = altura
		this.numPuntos = numPuntos
		let shapeCirculo = new Shape()


		shapeCirculo.moveTo(0, -this.radio)
		shapeCirculo.quadraticCurveTo(this.radio, -this.radio, this.radio, 0)
		shapeCirculo.quadraticCurveTo(this.radio, this.radio,0, this.radio)
		shapeCirculo.quadraticCurveTo(-this.radio, this.radio, -this.radio, 0)
		shapeCirculo.quadraticCurveTo(-this.radio, -this.radio,0, -this.radio)

		const points = []
		let radius =  this.radio
		let height = this.altura
		let numPoints = this.numPuntos

		for (let i = 0; i < numPoints; i++) {
			const angle = i * 0.05;
			const x = Math.cos(angle) * (radius + angle * 0.1);
			const z = Math.sin(angle) * (radius + angle * 0.1); // Cambiar el eje de giro a z
			const y = i * height / numPoints; // Utilizar i para incrementar la posición en el eje y
			points.push(new THREE.Vector3(x, y, z));
		}

		let path = new THREE.CatmullRomCurve3(points)

		let options = {bevelEnabled: false, depth: 2, steps: 100, curveSegments: 20,
			bevelThickness: 0.1, bevelSize: 0.2 , bevelSegements :2, extrudePath: path}

		this.geoShapeCirculo = new THREE.ExtrudeGeometry(shapeCirculo,options)

	}

	toGeometry()
	{
		return this.geoShapeCirculo.clone()
	}
}

export {Vela, shapeCirculo}
