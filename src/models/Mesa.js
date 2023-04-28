
import * as THREE from "../../libs/three.module.js";

class Mesa extends THREE.Object3D
{
	constructor(dimensiones = {
		 anchoSup: 1,
		 altoSup: 1,
		 fondoSup: 1,

		 anchoInf: 1,
		 altoInf: 1,
		 fondoInf: 1,

		separacion: 1
	})
	{
		super()

		this.anchoSup = dimensiones.anchoSup
		this.altoSup = dimensiones.altoSup
		this.fondoSup = dimensiones.fondoSup
		this.anchoInf = dimensiones.anchoInf
		this.altoInf = dimensiones.altoInf
		this.fondoInf = dimensiones.fondoInf

		this.separacion = dimensiones.separacion


		// Material temporal. Luego será la textura de las paredes.
		let mesaMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})

		// Crear la geometría de la mesa
		let mesaGeometry = new THREE.BoxGeometry( this.anchoSup, this.altoSup, this.fondoSup )
		let tablero = new THREE.Mesh( mesaGeometry, mesaMaterial )
		mesaGeometry.translate( this.anchoSup/2, this.altoSup/2 + this.altoInf, this.fondoSup/2)

		let pataGeometry1 = new THREE.BoxGeometry( this.anchoInf, this.altoInf, this.fondoInf )

		pataGeometry1.translate(this.anchoInf/2,this.altoInf/2,this.fondoInf/2)

		let pata1 = new THREE.Mesh( pataGeometry1, mesaMaterial )

		let pataGeometry2 = pataGeometry1.clone()
			pataGeometry2.translate( this.separacion, 0, 0)
		let pata2 = new THREE.Mesh( pataGeometry2, mesaMaterial )

		let pataGeometry3 = pataGeometry2.clone()
			pataGeometry3.translate( 0, 0, this.separacion )
		let pata3 = new THREE.Mesh( pataGeometry3, mesaMaterial )

		let pataGeometry4 =pataGeometry3.clone()
			pataGeometry4.translate( -this.separacion, 0, 0 )
		let pata4 = new THREE.Mesh( pataGeometry4, mesaMaterial )


		this.add(tablero)
		this.add(pata1)
		this.add(pata2)
		this.add(pata3)
		this.add(pata4)
	}
}

export {Mesa}
