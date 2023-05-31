
import * as THREE from "../../libs/three.module.js"
import * as TWEEN from '../../libs/tween.esm.js'
import {CSG} from "../../libs/CSG-v2.js"

import {Prisma} from "./Formas.js"

class AnilloCristal extends THREE.Object3D
{
	constructor(dimensiones = {
		radioInterno: 6, // TODO: Radio inicial del peque
		radioTubo: 1.25,
		numCaras: 6, // No cambiar
		numRadios: 8,// Hacerlo más o menos redondeado
		profundidadSujetadorCristal: 0.4,
		alturaSujetadorCristal: 3, // Se divide entre cada lado

		profundidadCristal: 0.2,

		cristalBevelSize: 0.5,
		cristalBevelThickness: 0.8
	})
	{
		super()

		this.radioInterno = dimensiones.radioInterno
		this.radioTubo = dimensiones.radioTubo
		this.numCaras = dimensiones.numCaras
		this.numRadios = dimensiones.numRadios
		this.profundidadSujetadorCristal = dimensiones.profundidadSujetadorCristal
		this.alturaSujetadorCristal = dimensiones.alturaSujetadorCristal

		this.profundidadCristal = dimensiones.profundidadCristal
		this.cristalBevel = {
			size: dimensiones.cristalBevelSize,
			thickness: dimensiones.cristalBevelThickness
		}

		this.material = new THREE.MeshNormalMaterial({opacity: 0.5, transparent: true, flatShading: true})

		let geoToroide = new THREE.TorusGeometry(this.radioInterno, this.radioTubo, this.numCaras, this.numRadios)
		geoToroide.rotateX(Math.PI/2)

		let alturaHexagonoBorde = 2*this.radioTubo + this.alturaSujetadorCristal

		let geoHexagonoBorde = new Prisma(2*this.radioTubo + this.profundidadSujetadorCristal, this.numCaras,
			{bevelEnabled: true, steps: 2, curveSegments: 4,
				bevelThickness: 0.1, bevelSize: 0.1 , bevelSegements: 2})
		geoHexagonoBorde.scale(alturaHexagonoBorde/2, alturaHexagonoBorde/2, 1)
		geoHexagonoBorde.translate(0, 0, this.radioInterno - this.profundidadSujetadorCristal)

		// NOTE: se suma otro radioTubo para quitar las posibles imperfecciones
		let geoHexagonoRecorte = new Prisma(2*this.radioTubo + this.profundidadSujetadorCristal + this.radioTubo, this.numCaras)
		geoHexagonoRecorte.scale(2*this.radioTubo, 2*this.radioTubo, 1)
		geoHexagonoRecorte.translate(0, 0, this.radioInterno)

		//
		// Recorte de los cristales
		//

		let csg = new CSG().union([new THREE.Mesh(geoToroide, this.material)])

		for (let i = 0; i < 4; i++)
		{
			csg.union([new THREE.Mesh(geoHexagonoBorde, null)])
			csg.subtract([new THREE.Mesh(geoHexagonoRecorte, null)])

			geoHexagonoBorde.rotateY(Math.PI/2)
			geoHexagonoRecorte.rotateY(Math.PI/2)
		}

		this.add(csg.toMesh())

		//
		// Colocar los cristales
		//

		let geoCristal = new Prisma(this.profundidadCristal, this.numCaras,
			{bevelEnabled: true, steps: 1, curveSegments: 8,
			bevelThickness: this.cristalBevel.thickness, bevelSize: this.cristalBevel.size , bevelSegements: 10})

		geoCristal.scale(2*this.radioTubo - 2*this.cristalBevel.size, 2*this.radioTubo - 2*this.cristalBevel.size, 1)
		geoCristal.translate(0, 0, this.radioInterno - this.profundidadSujetadorCristal)

		// NOTE: por ahora hay un solo cristal y no es parametrizable
		this.meshCristal = new THREE.Mesh(geoCristal, this.material)

		this.add(this.meshCristal)

		//this.add(new THREE.AxesHelper(10))
	}
}

export {AnilloCristal}
