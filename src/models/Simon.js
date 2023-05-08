import * as THREE from "../../libs/three.module.js";

class Simon extends THREE.Object3D
{
	constructor(dimensiones = {

		panelX: 1,
		panelY: 1,
		panelZ: 1,

		radioBotonTop: 1,
		radioBotonDown: 1,
		alturaBoton :1,

		borde: 1,
		radioIndicador: 1,
		alturaIndicador: 1,
		separacionBotones: 1



	})
	{
		super();

		this.panelX = dimensiones.panelX
		this.panelY = dimensiones.panelY
		this.panelZ = dimensiones.panelZ

		this.radioBotonTop = dimensiones.radioBotonTop
		this.radioBotonDown = dimensiones.radioBotonDown
		this.alturaBoton = dimensiones.alturaBoton

		this.borde = dimensiones.borde
		this.radioIndicador = dimensiones.radioIndicador
		this.alturaIndicador = dimensiones.alturaIndicador

		this.separacionBotones = dimensiones.separacionBotones

		let simonMaterial = new THREE.MeshNormalMaterial({color: 0Xf1f1f1,opacity: 0.5,transparent: true})

		// Crear panel de soporte
		let geoPanel = new THREE.BoxGeometry(this.panelX,this.panelY,this.panelZ)
		geoPanel.translate(0,this.panelY/2,this.panelZ/2)
		this.add(new THREE.Mesh(geoPanel,simonMaterial))


		// Crear indicador
		let geoIndicador1 = new THREE.CylinderGeometry(this.radioIndicador,this.radioIndicador,this.alturaIndicador,12)
		geoIndicador1.rotateX(-Math.PI/2)
		geoIndicador1.translate(0,this.alturaIndicador/2 + (this.panelY-this.borde) ,this.panelZ)

		let geoIndicador2 = geoIndicador1.clone()
		geoIndicador2.translate(-this.borde,0,0)

		let geoIndicador3 = geoIndicador1.clone()
		geoIndicador3.translate(this.borde,0,0)


		this.add(new THREE.Mesh(geoIndicador1,simonMaterial))
		this.add(new THREE.Mesh(geoIndicador2,simonMaterial))
		this.add(new THREE.Mesh(geoIndicador3,simonMaterial))



		// Crear botones
		let geoBoton1 = new THREE.CylinderGeometry(this.radioBotonTop,this.radioBotonDown,this.alturaBoton,4)
		geoBoton1.rotateY(Math.PI/4)
		geoBoton1.rotateX(Math.PI/2)
		geoBoton1.translate(0,0,this.alturaBoton/2)
		//geoBoton1.scale(1,1,0.5)


		let geoBoton2 = new THREE.CylinderGeometry(this.radioBotonTop,this.radioBotonDown,this.alturaBoton,4)
		geoBoton2.rotateY(Math.PI/4)
		geoBoton2.rotateX(Math.PI/2)
		geoBoton2.translate(0,0,this.alturaBoton/2)



		let geoBoton3 = new THREE.CylinderGeometry(this.radioBotonTop,this.radioBotonDown,this.alturaBoton,4)

		geoBoton3.rotateY(Math.PI/4)
		geoBoton3.rotateX(Math.PI/2)
		geoBoton3.translate(0,0,this.alturaBoton/2)



		let geoBoton4 = new THREE.CylinderGeometry(this.radioBotonTop,this.radioBotonDown,this.alturaBoton,4)
		geoBoton4.rotateY(Math.PI/4)
		geoBoton4.rotateX(Math.PI/2)
		geoBoton4.translate(0,0,this.alturaBoton/2)


		this.botonMesh1 = new THREE.Mesh(geoBoton1, simonMaterial)
	    this.botonMesh1.position.set(-this.radioBotonDown/2 - this.radioBotonTop, this.radioBotonTop/2 + this.radioBotonDown/2 + 2*this.borde, this.panelZ)
		this.botonMesh1.scale.set(1,1,0.5)

		this.botonMesh2 = new THREE.Mesh(geoBoton2, simonMaterial)
		this.botonMesh2.position.set(this.radioBotonDown/2 + this.radioBotonTop, this.radioBotonDown/2+this.radioBotonTop/2 + 2* this.borde, this.panelZ)

		this.botonMesh3 = new THREE.Mesh(geoBoton3, simonMaterial)
		this.botonMesh3.position.set(this.radioBotonDown/2 + this.radioBotonTop, this.radioBotonDown/2+this.radioBotonTop/2 + this.borde, this.panelZ)

		this.botonMesh4 = new THREE.Mesh(geoBoton4, simonMaterial)
		this.botonMesh4.position.set(-this.radioBotonDown/2 - this.radioBotonTop, this.radioBotonDown/2+this.radioBotonTop/2 + this.borde, this.panelZ)




		this.add(this.botonMesh1)
		this.add(this.botonMesh2)
		this.add(this.botonMesh3)
		this.add(this.botonMesh4)






	}
}export {Simon}