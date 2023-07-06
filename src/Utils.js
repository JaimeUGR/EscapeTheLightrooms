/*
 * Copyright (c) 2023. Jaime Pérez y Francisco Expósito.
 *
 * All rights reserved.
 *
 * Repository: https://github.com/JaimeUGR/EscapeTheLightrooms
 */

import {TextGeometry} from "../libs/TextGeometry.js"
import * as THREE from "../libs/three.module.js"

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

function RandomNumericString(digits)
{
	const numeroAleatorio = Math.floor(Math.random() * Math.pow(10, digits))

	console.log(numeroAleatorio)

	// Rellenar con 0's a la izquierda si es necesario
	return String(numeroAleatorio).padStart(digits, '0')
}

export {ShuffleArray, RandomInt, RandomIntInRange, RandomFloatInRange, RandomNumericString}

/*
	Gestión de textos
 */

// NOTE: Actualiza las separaciones por el tamaño + palabra
function TG_GetDimLetra(geoConfigDims)
{
	let tmpGeo = new TextGeometry("T", geoConfigDims)
	tmpGeo.computeBoundingBox()

	return new THREE.Vector3(
		tmpGeo.boundingBox.max.x - tmpGeo.boundingBox.min.x,
		tmpGeo.boundingBox.max.y - tmpGeo.boundingBox.min.y,
		tmpGeo.boundingBox.max.z - tmpGeo.boundingBox.min.z
	)
}

function TG_GetTamPalabra(palabra, dimensionesLetra, separacionLetras = 0)
{
	return palabra.length*(dimensionesLetra.x + separacionLetras) - separacionLetras
}

export {TG_GetDimLetra, TG_GetTamPalabra}
