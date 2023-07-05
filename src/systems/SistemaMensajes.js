/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
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
		this.mensajeSeleccionado = 0

		this.timeoutProceso = null

		let divContenedorMensaje = document.getElementById("contenedorMensaje")
		divContenedorMensaje.style.display = "none"

		this.contenedorMensaje = {
			divContenedor: divContenedorMensaje,
			pTexto: document.getElementById("textoMensaje"),
			botonBorrar: document.getElementById("borraMensaje"),
			botonAvanzar: document.getElementById("avanzaMensaje"),
			botonRetroceder: document.getElementById("retrocedeMensaje")
		}

		// Añadir los listeners a los botones

		this.contenedorMensaje.botonBorrar.addEventListener("click", (event) => {
			event.stopPropagation()
			this._eliminarMensaje()
		})

		this.contenedorMensaje.botonRetroceder.addEventListener("click", (event) => {
			event.stopPropagation()
			this._pasarMensaje(true)
		})

		this.contenedorMensaje.botonAvanzar.addEventListener("click", (event) => {
			event.stopPropagation()
			this._pasarMensaje()
		})
	}

	_pasarMensaje(retroceder = false)
	{
		if (retroceder && this.mensajeSeleccionado > 0)
			this.mensajeSeleccionado--
		else if (this.mensajeSeleccionado < this.mensajes.length - 1)
			this.mensajeSeleccionado++

		this._procesarMensajes()
	}

	_eliminarMensaje()
	{
		// El primer mensaje se elimina directamente
		if (this.mensajeSeleccionado === 0)
		{
			if (this.timeoutProceso !== null)
				clearTimeout(this.timeoutProceso)

			this._rotarColaMensajes()
			return
		}

		// Eliminar el mensaje si no es el primero
		// TODO Optimización: Se podría cambiar con el último elemento. Provocaría desordenarlos
		this.mensajes.splice(this.mensajeSeleccionado, 1)
		this.mensajeSeleccionado--

		this._procesarMensajes()
	}

	mostrarMensaje(mensaje, tiempoEnPantalla = 10000)
	{
		//
		// Crear el objeto con la información del mensaje
		//

		this.mensajes.push({
			mensaje: mensaje,
			tiempo: tiempoEnPantalla
		})

		// Solicitar el procesamiento de mensajes
		this._procesarMensajes()
	}

	_procesarMensajes()
	{
		//
		// Actualización
		//

		// Actualizar el texto
		this.contenedorMensaje.pTexto.innerHTML = this.mensajes[this.mensajeSeleccionado].mensaje

		// Actualizar los botones
		this.contenedorMensaje.botonRetroceder.style.visibility =
			(this.mensajeSeleccionado === 0) ? "hidden" : "visible"
		this.contenedorMensaje.botonAvanzar.style.visibility =
			(this.mensajeSeleccionado === this.mensajes.length - 1) ? "hidden" : "visible"

		//
		// Procesamiento
		//
		if (this.timeoutProceso !== null)
			return

		this.contenedorMensaje.divContenedor.style.display = "block"

		this.timeoutProceso = setTimeout(() => {
			this._rotarColaMensajes()
		}, this.mensajes[0].tiempo)
	}

	_rotarColaMensajes()
	{
		// Rotar la cola de mensajes
		this.mensajes.shift()

		if (this.mensajeSeleccionado > 0)
			this.mensajeSeleccionado--

		// Si quedan mensajes, repetimos
		this.timeoutProceso = null
		this.contenedorMensaje.divContenedor.style.display = "none"

		if (this.mensajes.length !== 0)
			this._procesarMensajes()
	}
}

export {SistemaMensajes}
