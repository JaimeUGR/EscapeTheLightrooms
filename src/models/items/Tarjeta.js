
import * as THREE from "../../../libs/three.module.js"

class Tarjeta extends THREE.Object3D
{
	constructor(dimensiones = {
		anchoTarjeta: 2.5,
		altoTarjeta: 1.5,
		profTarjeta: 0.08,
		altoBarraLectura: 0.4 // Cómo de baja está la barra que se lee (sirve para trasladar luego)
	})
	{
		super()

		this.anchoTarjeta = dimensiones.anchoTarjeta
		this.altoTarjeta = dimensiones.altoTarjeta
		this.profTarjeta = dimensiones.profTarjeta
		this.altoBarraLectura = dimensiones.altoBarraLectura

		this.materialTarjeta = new THREE.MeshNormalMaterial({opacity: 0.5, transparent: true})

		let geoTarjeta = new THREE.BoxGeometry(this.anchoTarjeta, this.altoTarjeta, this.profTarjeta)

		this.meshTarjeta = new THREE.Mesh(geoTarjeta, this.materialTarjeta)

		this.add(this.meshTarjeta)
		this.name = "Tarjeta"
	}
}

export {Tarjeta}
