/*
 * Copyright (c) 2023. Jaime Pérez García y Francisco Expósito Carmona.
 *
 * Escape The Lightrooms
 *
 * Todos los derechos reservados sobre la pertenencia del código, modelos y animaciones.
 * Las texturas están debidamente referenciadas a sus autores.
 */

import {AudioListener, AudioLoader, Audio, PositionalAudio} from "../../libs/three.module.js"
import {GameState} from "../GameState.js"

class SistemaSonidos
{
	constructor()
	{
		this._audioListener = new AudioListener()
		this._audioListener.name = "AListener"
		this._audioLoader = new AudioLoader()

		this._pendingLoads = 0

		//
		// Carga de sonidos globales compartidos
		//
		this.loadGlobalSound("../resources/sounds/pickup.wav", (audio) => {
			GameState.items.pickupSound = audio
			audio.setVolume(0.2)
		})
	}

	loadGlobalSound(path, loadCallback)
	{
		this._loadSound(path, loadCallback, new Audio(this._audioListener))
	}

	loadPositionalSound(path, loadCallback)
	{
		this._loadSound(path, loadCallback, new PositionalAudio(this._audioListener))
	}

	_loadSound(path, loadCallback, audioObject)
	{
		this._pendingLoads++

		this._audioLoader.load(path, (buffer) => {
			this._pendingLoads--
			audioObject.setBuffer(buffer)
			loadCallback(audioObject)
		}, null, () => {
			this._pendingLoads--
			console.error("Error cargando " + path)
		})
	}

	addListenerToCamera(camera)
	{
		// Ya estaba añadido
		if (this._audioListener.parent)
		{
			console.error("El audio listener ya está añadido a un objeto")
			return
		}

		camera.add(this._audioListener)
	}

	removeListenerFromCamera(camera)
	{
		camera.remove(this._audioListener)
	}

	getAudioListener()
	{
		return this._audioListener
	}

	hasPendingLoads()
	{
		return this._pendingLoads > 0
	}
}

export {SistemaSonidos}
