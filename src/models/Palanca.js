
import * as THREE from "../../libs/three.module.js";

const SEGMENTOS_SOPORTE = 10;
class Palanca extends THREE.Object3D
{
	constructor(dimensiones = {
		radioSoporte: 1,
		alturaSoporte: 1,

		radioPalo: 1,
		alturaPalo: 1,

		radioMango: 1,
		alturaMango: 1



	})
	{
		super()

		this.palancaMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})

		this.radioSoporte = dimensiones.radioSoporte
		this.alturaSoporte = dimensiones.alturaSoporte

		this.radioPalo = dimensiones.radioPalo
		this.alturaPalo = dimensiones.alturaPalo

		this.radioMango = dimensiones.radioMango
		this.alturaMango = dimensiones.alturaMango

		// Crear soporte
		let geoSoporte = new THREE.CylinderGeometry(this.radioSoporte,this.radioSoporte,this.alturaSoporte,SEGMENTOS_SOPORTE, 2)
		let soporte = new THREE.Object3D()
		this.add(soporte.add(new THREE.Mesh(geoSoporte,this.palancaMaterial)).rotateZ(Math.PI/2))

		// Crear palo
		let geoPalo = new THREE.CylinderGeometry(this.radioPalo, this.radioPalo, this.alturaPalo + this.radioSoporte/2, SEGMENTOS_SOPORTE,2)
		geoPalo.translate(0,this.radioSoporte/4 + this.alturaPalo/2,0)

		let palo =  new THREE.Object3D()

		this.add(palo.add(new THREE.Mesh(geoPalo,this.palancaMaterial)))

		// Crear mango
		let geoMango = new THREE.CylinderGeometry(this.radioMango, this.radioMango, this.alturaMango, SEGMENTOS_SOPORTE, 2)
		geoMango.translate(0,this.alturaMango/2 + this.radioSoporte/2 + this.alturaPalo,0)
		let mango = new THREE.Object3D();

		palo.add(mango.add(new THREE.Mesh(geoMango,this.palancaMaterial)))

		this.add(palo)

		this.rotateX(-Math.PI/3)
		


	}




}

export {Palanca}