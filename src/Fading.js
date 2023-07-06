/*
 * Copyright (c) 2023. Jaime P. and Francisco E.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
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
