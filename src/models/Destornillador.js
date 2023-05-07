
import * as THREE from '../../libs/three.module.js'
import { MTLLoader} from "../../libs/MTLLoader.js"
import { OBJLoader} from "../../libs/OBJLoader.js"

class Destornillador extends THREE.Object3D {
	constructor(gui, titleGui) {
		super();

		// Se crea la parte de la interfaz que corresponde a la caja
		// Se crea primero porque otros métodos usan las variables que se definen para la interfaz


		var materialLoader = new MTLLoader();
		var objectLoader = new OBJLoader();

		materialLoader.load('../personal/src/objetoOBJ/screwdriver.mtl',
			(materials) => {
				objectLoader.setMaterials(materials);
				objectLoader.load('../personal/src/objetoOBJ/screwdriver.obj',
					(object) => {


						object.scale.set(100,100,100)
						this.add(object);

					}, null, null);

			});


	}
}export{Destornillador}