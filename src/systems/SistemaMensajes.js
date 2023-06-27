/*
 * Copyright (c) 2023. Jaime Pérez García y Francisco Expósito Carmona.
 *
 * Escape The Lightrooms
 *
 * Todos los derechos reservados sobre la pertenencia del código, modelos y animaciones.
 * Las texturas están debidamente referenciadas a sus autores.
 */

import {GameState} from "../GameState.js"

class SistemaMensajes
{
	static idSiguienteMensaje = 0

	static _GetAndNextIDMensaje()
	{
		let idActual = this.idSiguienteMensaje

		this.idSiguienteMensaje++

		return idActual
	}

	constructor()
	{
		this.mensajes = []
		this.enProceso = false

		let divContenedorMensaje = document.getElementById("contenedorMensaje")
		divContenedorMensaje.style.display = "none"

		this.contenedorMensaje = {
			divContenedor: divContenedorMensaje,
			pTexto: document.getElementById("textoMensaje")
		}
	}

	mostrarMensaje(mensaje, tiempoEnPantalla = 10000)
	{
		const idMensaje = SistemaMensajes._GetAndNextIDMensaje()

		//
		// Crear el objeto con la información del mensaje
		//

		this.mensajes.push({
			id: idMensaje,
			mensaje: mensaje,
			tiempo: tiempoEnPantalla
		})

		// Solicitar el procesamiento de mensajes
		this._procesarMensajes()
	}

	_procesarMensajes()
	{
		if (this.enProceso)
			return

		this.enProceso = true
		this.contenedorMensaje.divContenedor.style.display = "block"
		this.contenedorMensaje.pTexto.innerHTML = this.mensajes[0].mensaje

		setTimeout(() => {
			// Rotar la cola de mensajes
			this.mensajes.shift()

			// Si quedan mensajes, repetimos
			this.enProceso = false
			this.contenedorMensaje.divContenedor.style.display = "none"

			if (this.mensajes.length !== 0)
				this._procesarMensajes()
		}, this.mensajes[0].tiempo)
	}
}

export {SistemaMensajes}
