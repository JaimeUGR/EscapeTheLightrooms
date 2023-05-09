
import * as THREE from '../../../libs/three.module.js'
import {MTLLoader} from "../../../libs/MTLLoader.js"
import {OBJLoader} from "../../../libs/OBJLoader.js"

class Destornillador extends THREE.Object3D
{
	constructor()
	{
		super()

		let materialLoader = new MTLLoader()
		let objectLoader = new OBJLoader()

		// TODO: Poner bien los paths y cargar la textura
		materialLoader.load('../../../resources/models/materials/screwdriver.mtl',
			(materials) => {
				objectLoader.setMaterials(materials);
				objectLoader.load('../../../resources/models/screwdriver.obj',
					(object) => {
						object.scale.set(100,100,100)
						this.add(object)
					}, null, null)

			})

		this.name = "Destornillador"
	}
}

export {Destornillador}
