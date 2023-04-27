
class ControladorCamara
{
	constructor(camara)
	{
		this.camara = camara
		this.enabled = false
	}

	update(deltaTime)
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
