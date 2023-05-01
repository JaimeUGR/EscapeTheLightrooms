
import * as THREE from "../../libs/three.module.js";
import {CSG} from "../../libs/CSG-v2.js";

class Cajonera extends THREE.Object3D
{
	constructor(dimensiones = {
		cajoneraX: 1, // x interna
		cajoneraY: 1, // y interna
		cajoneraZ: 1, // z interna
		cajoneraBorde: 1, // Borde en todos los lados

		numCajones: 1,

		cajonFrontalZ: 1,
		cajonSueloY: 0.125,
		cajonTraseraZ:1,
		cajonLateralX: 1,
		cajonLateralY: 1,

		cajonAsaX: 1,
		cajonAsaY: 1,
		cajonAsaZ: 1,
	})
	{
		//TODO: Añadir Mesh encima de la cajonera y añadir lista de Mesh de los cajones
		super()

		// Dimensiones
		this.cajoneraX = dimensiones.cajoneraX
		this.cajoneraY = dimensiones.cajoneraY
		this.cajoneraZ = dimensiones.cajoneraZ
		this.cajoneraBorde = dimensiones.cajoneraBorde

		this.separacionCajones = dimensiones.separacionCajones
		this.numCajones = dimensiones.numCajones

		this.cajonFrontalZ = dimensiones.cajonFrontalZ
		this.cajonSueloY = dimensiones.cajonSueloY
		this.cajonLateralX = dimensiones.cajonLateralX
		this.cajonLateralY = dimensiones.cajonLateralY
		this.cajonTraseraZ = dimensiones.cajonTraseraZ

		this.cajonAsaX = dimensiones.cajonAsaX
		this.cajonAsaY = dimensiones.cajonAsaY
		this.cajonAsaZ = dimensiones.cajonAsaZ

		// Dimensiones calculadas
		this.cajonSueloX = this.cajoneraX - 2*this.cajonLateralX
		this.cajonSueloZ = this.cajoneraZ + this.cajoneraBorde - (this.cajonFrontalZ + this.cajonTraseraZ)
		this.cajonFrontalY = this.cajoneraY / this.numCajones - this.cajoneraBorde + this.cajoneraBorde/this.numCajones

		// Otros
		this.cajonAperturaZ = this.cajoneraZ + this.cajoneraBorde - this.cajonTraseraZ
		this.cajones = []

		// Materiales
		this.cajoneraMaterial = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})//new THREE.MeshBasicMaterial({color: 0x349f21})
		this.cajonFrontalMaterial = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})//new THREE.MeshBasicMaterial({color: 0x825a65})
		this.cajonParedesMaterial = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})//new THREE.MeshBasicMaterial({color: 0x71989a})
		this.cajonSueloMaterial = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})//new THREE.MeshBasicMaterial({color: 0xaf94fa})
		this.cajonAsaMaterial = new THREE.MeshNormalMaterial({color: 0xf1f1f1, opacity: 0.5, transparent: true})//new THREE.MeshBasicMaterial({color: 0xaf94fa})

		//
		//
		//

		// Crear la cajonera
		let geoCajonera = new THREE.BoxGeometry(this.cajoneraX + 2*this.cajoneraBorde,
			this.cajoneraY + 2*this.cajoneraBorde, this.cajoneraZ + 2*this.cajoneraBorde)
		geoCajonera.translate(0, this.cajoneraY/2 + this.cajoneraBorde, 0)

		// Crear el hueco
		let geoHuecoCajon = new THREE.BoxGeometry(this.cajoneraX, this.cajonFrontalY, this.cajoneraZ + this.cajoneraBorde)
		geoHuecoCajon.translate(0, this.cajonFrontalY/2 + this.cajoneraBorde, this.cajoneraBorde/2)

		// Hacer los huecos y colocar los cajones
		let cajon = this.crearCajon()
		cajon.position.set(0, this.cajonSueloY/2 + this.cajoneraBorde, this.cajoneraBorde - this.cajonFrontalZ)

		let csg = new CSG().union([new THREE.Mesh(geoCajonera, this.cajoneraMaterial)])

		for (let i = 0; i < this.numCajones; i++)
		{
			csg.subtract([new THREE.Mesh(geoHuecoCajon, null)])
			geoHuecoCajon.translate(0, 0, 0)

			this.add(cajon)
			this.cajones.push(cajon)

			cajon = cajon.clone()
			geoHuecoCajon.translate(0, this.cajonFrontalY + this.cajoneraBorde, 0)
			cajon.translateY(this.cajonFrontalY + this.cajoneraBorde)
		}

		this.add(csg.toMesh())
	}

	// TODO: Animacion
	abrirCajon(numCajon)
	{
		this.cajones[numCajon].translateZ(this.cajonAperturaZ)
	}

	// TODO: Animacion
	cerrarCajon(numCajon)
	{
		this.cajones[numCajon].translateZ(-this.cajonAperturaZ)
	}

	// TODO: Para la interacción, probablemente necesitemos que sea su propia clase con una
	// NOTE: PRIMERO: Pensar si, con añadir una referencia al padre que tiene el objeto colocado
	// (pe destornillador) y  llamando a padre.remove(this) se puede hacer.
	// Entonces no sería necesaria una clase propia.
	crearCajon()
	{
		// Object cajón
		let cajon = new THREE.Object3D()

		// Crear el suelo
		let geoSuelo = new THREE.BoxGeometry(this.cajonSueloX, this.cajonSueloY, this.cajonSueloZ)
		geoSuelo.translate(0, -this.cajonSueloY/2, 0)

		cajon.add(new THREE.Mesh(geoSuelo, this.cajonSueloMaterial))

		// Crear los laterales del cajón
		let geoParedLateral = new THREE.BoxGeometry(this.cajonLateralX, this.cajonLateralY, this.cajonSueloZ)
		geoParedLateral.translate(-(this.cajonLateralX/2 + this.cajonSueloX/2) ,
			this.cajonLateralY/2 - this.cajonSueloY/2, 0)

		cajon.add(new THREE.Mesh(geoParedLateral.clone(), this.cajonParedesMaterial))

		geoParedLateral.translate(this.cajonSueloX + this.cajonLateralX, 0, 0)
		cajon.add(new THREE.Mesh(geoParedLateral, this.cajonParedesMaterial))

		// Crear la pared trasera del cajón
		let geoParedTrasera = new THREE.BoxGeometry(this.cajoneraX, this.cajonFrontalY, this.cajonTraseraZ)
		geoParedTrasera.translate(0, this.cajonFrontalY/2 - this.cajonSueloY/2, -(this.cajonTraseraZ/2 + this.cajonSueloZ/2))

		cajon.add(new THREE.Mesh(geoParedTrasera, this.cajonParedesMaterial))

		// Crear la pared frontal del cajón
		let geoParedFrontal = new THREE.BoxGeometry(this.cajoneraX, this.cajonFrontalY, this.cajonFrontalZ)
		geoParedFrontal.translate(0, this.cajonFrontalY/2 - this.cajonSueloY/2, this.cajonFrontalZ/2 + this.cajonSueloZ/2)

		cajon.add(new THREE.Mesh(geoParedFrontal, this.cajonFrontalMaterial))

		// Añadir el asa TODO

		return cajon
	}

	createAsa() {

		let asa = new THREE.Object3D();

		let asaFrontalGeometry = new THREE.BoxGeometry(this.cajonAsaX,this.cajonAsaY,this.cajonAsaZ);
		asaFrontalGeometry.translate(0,this.cajonAsaY/2 + this.altoCara/2,this.fondoSuelo/2 + 3*this.cajonAsaZ  + this.cajonFrontalZ );

		let asaFrontal = new THREE.Mesh(asaFrontalGeometry,this.cajonSueloMaterial);

		asa.add(asaFrontal)

		let asaIzqGeometry = new THREE.BoxGeometry(this.cajonAsaX/4,this.cajonAsaY,3*this.cajonAsaZ);
		asaIzqGeometry.translate(((-this.cajonAsaX/4)/2) - this.cajonAsaX/2,this.cajonAsaY/2 + this.altoCara/2,(3*this.cajonAsaZ)/2 + this.fondoSuelo/2  + this.cajonFrontalZ);

		let asaIzq = new THREE.Mesh(asaIzqGeometry,this.cajonSueloMaterial);

		asa.add(asaFrontal)

		let asaDchaGeometry = new THREE.BoxGeometry(this.cajonAsaX/4,this.cajonAsaY,3*this.cajonAsaZ);
		asaDchaGeometry.translate(((this.cajonAsaX/4)/2) + this.cajonAsaX/2,this.cajonAsaY/2 + this.altoCara/2,(3*this.cajonAsaZ)/2 + this.fondoSuelo/2 + this.cajonFrontalZ);

		let asaDcha = new THREE.Mesh(asaDchaGeometry,this.cajonSueloMaterial);

		asa.add(asaFrontal)
		asa.add(asaIzq)
		asa.add(asaDcha)

		return asa;
	}
}

export {Cajonera}
