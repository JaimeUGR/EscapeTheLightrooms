
import * as THREE from "../../libs/three.module.js";
import {CSG} from "../../libs/CSG-v2.js";

class Cajonera extends THREE.Object3D
{
	constructor(dimensiones = {

		ancho: 1,
		alto: 1,
		fondo: 1,

		numCajones: 1,
		borde: 1,

		altoSuelo: 1,

		anchoCara: 1,
		fondoCara: 1,

		anchoPared: 1,
		altoPared: 1,


		anchoCaraTrasera: 1,
		fondoCaraTrasera:1,

		anchoAsa: 1,
		altoAsa: 1,
		fondoAsa: 1,

	})
	{
		//TODO: Añadir Mesh encima de la cajonera y añadir lista de Mesh de los cajones
		super()

		this.ancho = dimensiones.ancho
		this.alto = dimensiones.alto
		this.fondo = dimensiones.fondo

		this.borde= dimensiones.borde
		this.separacion = this.borde //TODO

		this.altoSuelo = dimensiones.altoSuelo

		this.anchoCara = dimensiones.anchoCara
		this.fondoCara = dimensiones.fondoCara

		this.anchoAsa = dimensiones.anchoAsa
		this.altoAsa = dimensiones.altoAsa
		this.fondoAsa = dimensiones.fondoAsa

		this.anchoCaraTrasera = dimensiones.anchoCara
		this.fondoCaraTrasera = dimensiones.fondoCaraTrasera

		this.anchoPared = dimensiones.anchoPared

		this.fondoSuelo = this.fondo - (this.borde + this.fondoCara + this.fondoCaraTrasera)
		this.anchoSuelo = this.anchoCara - 2*this.anchoPared

		this.numCajones = dimensiones.numCajones
		this.altoCara = ((this.alto - 2*this.borde) - ((this.numCajones -1) * this.separacion)) / this.numCajones

		this.altoPared = this.altoCara * dimensiones.altoPared


		// Materiales
		//this.cajonMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})
		this.cajonMaterial1 = new THREE.MeshBasicMaterial({color: 0x349f21})
		this.cajonMaterial2 = new THREE.MeshBasicMaterial({color: 0x825a65})
		this.cajonMaterial3 = new THREE.MeshBasicMaterial({color: 0x71989a})
		this.cajonMaterial4= new THREE.MeshBasicMaterial({color: 0xaf94fa})


		let cajoneraGeometry = new THREE.BoxGeometry(this.ancho, this.alto, this.fondo)
		cajoneraGeometry.translate(0, this.alto/2, 0)

		let cajonera = new THREE.Mesh(cajoneraGeometry, this.cajonMaterial1)

		let cajaTempGeometry = new THREE.BoxGeometry(this.anchoCara,this.altoCara,this.fondoCara+this.fondoSuelo+this.fondoCaraTrasera)

		cajaTempGeometry.translate(0,this.altoCara/2,this.borde/2)
		cajaTempGeometry.translate(0,this.borde,0)

		let csg = new CSG()
		csg.union([cajonera])

		for(let i= 0; i < this.numCajones; i++)
		{
			csg.subtract([new THREE.Mesh(cajaTempGeometry,null)])
			cajaTempGeometry.translate(0,this.altoCara+this.separacion,0)
		}

		cajonera= csg.toMesh()
		let cajon = this.createCajon()
		cajon.translateY(this.borde)
		cajon.translateZ(this.borde/2-this.fondoCara/2+this.fondoCaraTrasera/2)

		for(let i= 0; i < this.numCajones; i++)
		{
			this.add(cajon.clone())
			cajon.position.y += this.altoCara + this.separacion
		}

		this.add(cajonera)
		this.position.set(this.ancho/2, 0, this.fondo/2)
	}

	createCajon()
	{

		let cajon = new THREE.Object3D();

		let sueloGeometry = new THREE.BoxGeometry(this.anchoSuelo,this.altoSuelo,this.fondoSuelo)
		sueloGeometry.translate(0,-this.altoSuelo/2,0)
		let suelo = new THREE.Mesh(sueloGeometry, this.cajonMaterial4)

		let caraDelanteraGeometry = new THREE.BoxGeometry(this.anchoCara,this.altoCara,this.fondoCara)
		caraDelanteraGeometry.translate(0,this.altoCara/2-this.altoSuelo,this.fondoSuelo/2+this.fondoCara/2)
		let caraDelantera = new THREE.Mesh(caraDelanteraGeometry,this.cajonMaterial2)

		let caraTraseraGeometry = new THREE.BoxGeometry(this.anchoCaraTrasera,this.altoCara,this.fondoCaraTrasera)
		caraTraseraGeometry.translate(0,this.altoCara/2-this.altoSuelo,-this.fondoCaraTrasera/2-this.fondoSuelo/2)
		let caraTrasera = new THREE.Mesh(caraTraseraGeometry,this.cajonMaterial2)

		let paredIzqGeometry = new THREE.BoxGeometry(this.anchoPared,this.altoPared,this.fondoSuelo)
		paredIzqGeometry.translate(-this.anchoPared/2 -this.anchoSuelo/2,this.altoPared/2-this.altoSuelo,0)

		let paredIzq = new THREE.Mesh(paredIzqGeometry,this.cajonMaterial3)

		let paredDchaGeometry = new THREE.BoxGeometry(this.anchoPared,this.altoPared,this.fondoSuelo)
		paredDchaGeometry.translate(this.anchoPared/2 +this.anchoSuelo/2,this.altoPared/2-this.altoSuelo,0)

		let paredDcha = new THREE.Mesh(paredDchaGeometry,this.cajonMaterial3)

		this.asa = this.createAsa()

		cajon.add(suelo)
		cajon.add(caraDelantera)
		cajon.add(caraTrasera)
		cajon.add(paredIzq)
		cajon.add(paredDcha)
		cajon.add(this.asa)

		return cajon;
	}

	createAsa() {

		let asa = new THREE.Object3D();

		let asaFrontalGeometry = new THREE.BoxGeometry(this.anchoAsa,this.altoAsa,this.fondoAsa);
		asaFrontalGeometry.translate(0,this.altoAsa/2 + this.altoCara/2,this.fondoSuelo/2 + 3*this.fondoAsa  + this.fondoCara );

		let asaFrontal = new THREE.Mesh(asaFrontalGeometry,this.cajonMaterial4);

		asa.add(asaFrontal)

		let asaIzqGeometry = new THREE.BoxGeometry(this.anchoAsa/4,this.altoAsa,3*this.fondoAsa);
		asaIzqGeometry.translate(((-this.anchoAsa/4)/2) - this.anchoAsa/2,this.altoAsa/2 + this.altoCara/2,(3*this.fondoAsa)/2 + this.fondoSuelo/2  + this.fondoCara);

		let asaIzq = new THREE.Mesh(asaIzqGeometry,this.cajonMaterial4);

		asa.add(asaFrontal)

		let asaDchaGeometry = new THREE.BoxGeometry(this.anchoAsa/4,this.altoAsa,3*this.fondoAsa);
		asaDchaGeometry.translate(((this.anchoAsa/4)/2) + this.anchoAsa/2,this.altoAsa/2 + this.altoCara/2,(3*this.fondoAsa)/2 + this.fondoSuelo/2 + this.fondoCara);

		let asaDcha = new THREE.Mesh(asaDchaGeometry,this.cajonMaterial4);

		asa.add(asaFrontal)
		asa.add(asaIzq)
		asa.add(asaDcha)

		return asa;
	}
}

export {Cajonera}
