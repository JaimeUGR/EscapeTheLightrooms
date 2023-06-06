/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/
class ControladorCamara
{
	constructor(camara)
	{
		this.camara = camara
		this.isSceneCamera = true
		this.enabled = false
	}

	update(deltaTime)
	{

	}

	onMouseMove(event)
	{

	}

	onKeyDown(event)
	{

	}

	onKeyUp(event)
	{

	}

	enableInput(event)
	{

	}

	disableInput(event)
	{

	}

	enable()
	{
		this.enabled = true
	}

	disable()
	{
		this.enabled = false
	}
}

export {ControladorCamara}
