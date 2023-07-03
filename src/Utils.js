/*
	Copyright (c) 2023 - Jaime Pérez García y Francisco Expósito Carmona

	Todos los derechos reservados.

	Los recursos externos utilizados han sido debidamente referenciados.
*/

function ShuffleArray(array)
{
	for (let i = array.length - 1; i > 0; i--)
	{
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function RandomInt(maximo)
{
	return Math.floor(Math.random() * (maximo + 1));
}

// NOTE: Se podría utilizar el método de abajo y redondear.
function RandomIntInRange(min, max) {
	if (min > max)
		[min, max] = [max, min]

	return Math.floor(Math.random() * (max - min + 1)) + min
}

function RandomFloatInRange(min, max) {
	if (min > max)
		[min, max] = [max, min]

	return Math.random() * (max - min + 1) + min
}

export {ShuffleArray, RandomInt, RandomIntInRange, RandomFloatInRange}
