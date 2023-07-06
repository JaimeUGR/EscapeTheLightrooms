/*
 * Copyright (c) 2023. Jaime P. and Francisco E.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
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
