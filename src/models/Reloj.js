
import * as THREE from "../../libs/three.module.js";


class Reloj extends THREE.Object3D{

	constructor(dimensiones = {

		radioBase: 1,
		altoBase: 1,

		radioPalo: 1,
		altoPalo: 1,

		radioPendulo: 1,
		altoPendulo: 1,

		radioSuperiorPrismaSuperior: 1,
		radioInferiorPrismaSuperior: 1,
		alturaPrismaSuperior: 1,

		radioSuperiorPrismaInferior: 1,
		radioInferiorPrismaInferior: 1,
		alturaPrismaInferior: 1,

		anchoLateral: 1,
		altoLateral: 1,

		anchoPilar: 1,
		grosorPilar: 1,

		anchoCajaReloj: 1,
		altoCajaReloj: 1,
		grosorCajaReloj: 1,

		interiorReloj: 1,
		relojPuerta: 1

	})
	{
		super();

		this.radioBase = dimensiones.radioBase
		this.altoBase = dimensiones.altoBase

		this.radioPalo = dimensiones.radioPalo
		this.altoPalo = dimensiones.altoPalo

		this.radioPendulo = dimensiones.radioPendulo
		this.altoPendulo = dimensiones.altoPendulo

		this.radioSuperiorPrismaSuperior = dimensiones.radioSuperiorPrismaSuperior
		this.radioInferiorPrismaSuperior = dimensiones.radioInferiorPrismaSuperior
		this.alturaPrismaSuperior = dimensiones.alturaPrismaSuperior

		this.radioSuperiorPrismaInferior = dimensiones.radioSuperiorPrismaInferior
		this.radioInferiorPrismaInferior = dimensiones.radioInferiorPrismaInferior
		this.alturaPrismaInferior = dimensiones.alturaPrismaInferior

		this.anchoLateral = dimensiones.anchoLateral
		this.altoLateral = dimensiones.altoLateral

		this.anchoPilar = dimensiones.anchoPilar
		this.grosorPilar = dimensiones.grosorPilar

		this.anchoCajaReloj = dimensiones.anchoCajaReloj
		this.altoCajaReloj = dimensiones.altoCajaReloj
		this.grosorCajaReloj = dimensiones.grosorCajaReloj

		this.inferiorReloj = dimensiones.interiorReloj
		this.relojPuerta = dimensiones.relojPuerta


		let relojMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})


		// Creación de la base del reloj


		let geoBase = new THREE.CylinderGeometry(this.radioBase,this.radioBase,this.altoBase,12)
		geoBase.rotateX(Math.PI/2)
		this.baseMesh = new THREE.Mesh(geoBase,relojMaterial)
		this.baseMesh.position.z = (this.grosorCajaReloj-(this.inferiorReloj + this.relojPuerta))/2 + this.altoBase/2
		this.baseMesh.position.y = this.altoPalo/2



		// Creación del péndulo
		let geoPalo = new THREE.CylinderGeometry(this.radioPalo, this.radioPalo, this.altoPalo + this.radioBase, 12)
		geoPalo.translate(0,-this.altoPalo/2 + this.radioBase/2,0)

		this.palo = new THREE.Mesh(geoPalo, relojMaterial)
		this.palo.position.y += -this.radioBase

		let geoPendulo = new THREE.CylinderGeometry(this.radioPendulo,this.radioPendulo,this.altoPendulo,12)
		geoPendulo.rotateX(Math.PI/2)
		//geoPendulo.translate(0,-this.radioPendulo,0)

		this.pendulo = new THREE.Mesh(geoPendulo,relojMaterial)
		this.pendulo.position.y =  -this.altoPalo - this.radioPendulo

		this.palo.add(this.pendulo)
		this.baseMesh.add(this.palo)


		//this.palo.rotateZ(Math.PI/4)
		this.add(this.baseMesh)

		//	Creacion del prisma superior
		let geoPrismaSuperior = new THREE.CylinderGeometry(this.radioSuperiorPrismaSuperior,this.radioInferiorPrismaSuperior,this.alturaPrismaSuperior,4)
		geoPrismaSuperior.rotateY(Math.PI/4)
		geoPrismaSuperior.translate(0,this.alturaPrismaSuperior/2 + this.altoCajaReloj/2,0)
		this.add(new THREE.Mesh(geoPrismaSuperior, relojMaterial))


		//	Creacion del prisma inferior
		let geoPrismaInferior = new THREE.CylinderGeometry(this.radioSuperiorPrismaInferior, this.radioInferiorPrismaInferior, this.alturaPrismaInferior, 4)
		geoPrismaInferior.rotateY(Math.PI/4)
		geoPrismaInferior.translate(0,-this.alturaPrismaInferior/2 - this.altoCajaReloj/2,0)
		this.add(new THREE.Mesh(geoPrismaInferior, relojMaterial))

		// Creacion del fondo
		let geoRelleno = new THREE.BoxGeometry(this.anchoCajaReloj- 2*this.anchoLateral, this.altoCajaReloj, this.grosorCajaReloj-(this.inferiorReloj + this.relojPuerta))
		geoRelleno.translate(0, 0,-(this.inferiorReloj/2+this.relojPuerta/2))

		this.add(new THREE.Mesh(geoRelleno, relojMaterial))

		//	Creacion partes laterales
		let geoLateral1 = new THREE.BoxGeometry(this.anchoLateral, this.altoCajaReloj, this.grosorCajaReloj)
		geoLateral1.translate( this.anchoLateral/2 + (this.anchoCajaReloj-2*this.anchoLateral)/2,0 ,0)

		this.add(new THREE.Mesh(geoLateral1,relojMaterial))

		let geoLateral2 = new THREE.BoxGeometry(this.anchoLateral, this.altoCajaReloj, this.grosorCajaReloj)
		geoLateral2.translate(-(this.anchoLateral/2 + (this.anchoCajaReloj-2*this.anchoLateral)/2), 0,0)

		this.add(new THREE.Mesh(geoLateral2, relojMaterial))

		// Creacion pilares
		let geoPilar1 = new THREE.BoxGeometry(this.anchoPilar, this.altoCajaReloj, this.grosorPilar)
		geoPilar1.translate(this.anchoPilar/2 + this.anchoCajaReloj/2,0,this.grosorPilar/2 + this.grosorCajaReloj/2)

		this.pilarMesh1 = new THREE.Mesh(geoPilar1, relojMaterial)

		let geoPilar2 = geoPilar1.clone()
		geoPilar2.translate(0,0,-2*(this.grosorPilar/2 + this.grosorCajaReloj/2))
		this.pilarMesh2 = new THREE.Mesh(geoPilar2, relojMaterial)

		let geoPilar3 = geoPilar2.clone()
		geoPilar3.translate(-2*(this.anchoPilar/2 + this.anchoCajaReloj/2),0,0)
		this.pilarMesh3 = new THREE.Mesh(geoPilar3, relojMaterial)

		let geoPilar4 = geoPilar3.clone()
		geoPilar4.translate(0,0,2*(this.grosorPilar/2 + this.grosorCajaReloj/2))
		this.pilarMesh4 = new THREE.Mesh(geoPilar4, relojMaterial)





		this.add(this.pilarMesh1)
		this.add(this.pilarMesh2)
		this.add(this.pilarMesh3)
		this.add(this.pilarMesh4)


		// Creacion de la puerta
		/*
		let geoPuerta = new THREE.BoxGeometry(this.anchoCajaReloj- 2*this.anchoLateral, this.altoCajaReloj, this.relojPuerta)
		geoPuerta.translate((this.anchoCajaReloj- 2*this.anchoLateral)/2,0,0)

		this.puertaMesh = new THREE.Mesh(geoPuerta, relojMaterial)

		this.add(this.puertaMesh)

		 */


	}
}

class Manecillas extends THREE.Object3D{
	constructor( dimensiones ={
		separacion: 1

	})
	{
		super()

		this.separacion= dimensiones.separacion

		let relojMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})



		let formaManecillaHoras= new THREE.Shape()

		formaManecillaHoras.moveTo(1,0)
		formaManecillaHoras.lineTo(1,6)
		formaManecillaHoras.quadraticCurveTo(2,7,2,8)
		formaManecillaHoras.quadraticCurveTo(2,9, 1, 10)
		formaManecillaHoras.bezierCurveTo(0.5, 11.5, 0.5, 13.5,0.5, 14)
		formaManecillaHoras.quadraticCurveTo(0 ,15, -0.5, 14)
		formaManecillaHoras.bezierCurveTo(-0.5, 13.5, -0.5, 11.5,  -1,10)
		formaManecillaHoras.quadraticCurveTo(-2, 9, -2,8)
		formaManecillaHoras.quadraticCurveTo(-2, 7, -1, 6)
		formaManecillaHoras.lineTo(-1,0)

		var options =  {bevelEnabled: false, depth: 2, steps: 1, curveSegments: 4,
			bevelThickness: 4, bevelSize: 2 , bevelSegements :2};

		var geoManecillaHoras= new THREE.ExtrudeGeometry(formaManecillaHoras,options);

		this.extruManecillaHoras = new THREE.Mesh (geoManecillaHoras,relojMaterial);

		this.add(this.extruManecillaHoras);
		this.extruManecillaHoras.position.x= -5




		let formaManecillaMinutos= new THREE.Shape()

		formaManecillaMinutos.moveTo(1,0)
		formaManecillaMinutos.lineTo(1,6)
		formaManecillaMinutos.quadraticCurveTo(2,7,2,8)
		formaManecillaMinutos.quadraticCurveTo(2,9, 1, 10)
		formaManecillaMinutos.bezierCurveTo(0.5, 11.5 + this.separacion, 0.5, 13.5 + this.separacion,0.5, 14 + this.separacion)
		formaManecillaMinutos.quadraticCurveTo(0 ,15 + this.separacion, -0.5, 14 + this.separacion)
		formaManecillaMinutos.bezierCurveTo(-0.5, 13.5, -0.5, 11.5,  -1,10)
		formaManecillaMinutos.quadraticCurveTo(-2, 9, -2,8)
		formaManecillaMinutos.quadraticCurveTo(-2, 7, -1, 6)
		formaManecillaMinutos.lineTo(-1,0)

		var options =  {bevelEnabled: false, depth: 2, steps: 1, curveSegments: 4,
			bevelThickness: 4, bevelSize: 2 , bevelSegements :2};

		var geoManecillaMinutos = new THREE.ExtrudeGeometry(formaManecillaMinutos,options);

		this.extruManecillaMinutos = new THREE.Mesh (geoManecillaMinutos,relojMaterial);

		this.add(this.extruManecillaMinutos);

		this.extruManecillaMinutos.position.x = 5





		let contornoGeometry = new THREE.BufferGeometry()
		contornoGeometry.setFromPoints(formaManecillaMinutos.getPoints())
		this.add(new THREE.Line(contornoGeometry, new THREE.LineBasicMaterial({color: 0x585858})))




	}


}

export{Reloj, Manecillas}