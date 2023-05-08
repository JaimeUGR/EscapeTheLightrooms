
import * as THREE from '../../libs/three.module.js'
import { MTLLoader} from "../../libs/MTLLoader.js"
import { OBJLoader} from "../../libs/OBJLoader.js"

class Destornillador extends THREE.Object3D
{
	constructor()
	{
		super()

		let materialLoader = new MTLLoader()
		let objectLoader = new OBJLoader()

		// TODO: Poner bien los paths
		materialLoader.load('../personal/src/objetoOBJ/screwdriver.mtl',
			(materials) => {
				objectLoader.setMaterials(materials);
				objectLoader.load('../personal/src/objetoOBJ/screwdriver.obj',
					(object) => {
						object.scale.set(100,100,100)
						this.add(object)
					}, null, null)

			})
	}
}

export {Destornillador}
