/*
 * Copyright (c) 2023. Jaime Pérez García y Francisco Expósito Carmona.
 *
 * Escape The Lightrooms
 *
 * Todos los derechos reservados sobre la pertenencia del código, modelos y animaciones.
 * Las texturas están debidamente referenciadas a sus autores.
 */

const fadingScreen = document.getElementById("fadingScreen")

function fadeIn({tiempo, color, alpha = 1, callback})
{
	fadingScreen.style.transition = `background-color ${tiempo}ms`
	fadingScreen.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`

	if (callback)
		setTimeout(callback, tiempo)
}

function fadeOut({tiempo, color, alpha = 0, callback})
{
	fadingScreen.style.transition = `background-color ${tiempo}ms`
	fadingScreen.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`

	if (callback)
		setTimeout(callback, tiempo)
}

export {fadeIn, fadeOut}
