/*
 * Copyright (c) 2023. Jaime Pérez García y Francisco Expósito Carmona.
 *
 * Escape The Lightrooms
 *
 * Todos los derechos reservados sobre la pertenencia del código, modelos y animaciones.
 * Las texturas están debidamente referenciadas a sus autores.
 */

import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'
import {Font} from "../../libs/FontLoader.js"
import {TextGeometry} from "../../libs/TextGeometry.js"


import {GameState} from "../GameState.js"
import {RandomIntInRange, RandomFloatInRange} from "../Utils.js"
import {Vector3} from "../../libs/three.module.js"

const FLOATING_CUBES = 2500
const FLOATING_CUBES_SIZE_RANGE = [10, 30]
const FLOATING_CUBE_MIN_HEIGHT = 250
const AREA_SIZE = 25000

class EndLocation
{
	constructor(game)
	{
		this._mainGame = game

		this._position = new Vector3(0, 0, 0)
		this._location = new THREE.Object3D()
		this._location.position.copy(this._position)

		this._animaciones = {}

		this._buildLocation()
		this._cargarSonido()
	}

	loadLocation()
	{
		// Desenganchar las salas
		this._mainGame.remove(this._mainGame.salaPrincipal)
		this._mainGame.remove(this._mainGame.salaIzquierda)
		this._mainGame.remove(this._mainGame.salaDerecha)
		this._mainGame.remove(this._mainGame.salaSuperior)
		this._mainGame.remove(this._mainGame.salaFinal)

		// Parar la animación del reloj (para que deje de sonar)
		// TODO: Fix temporal
		this._mainGame.salaDerecha.reloj.animaciones.pendulo.animacion.stop()

		// Añadir la nueva sala
		this._mainGame.add(this._location)

		// Teletransportar al jugador
		GameState.player.position.x = this._position.x
		GameState.player.position.z = this._position.z
		GameState.player.position.y += this._position.y
		GameState.player.initialPosition.copy(GameState.player.position)

		// Limpiar el árbol de colisiones
		GameState.systems.collision.clearAllColliders()

		// Hacer invisible la información debug
		GameState.debug.O3Player.visible = false
		GameState.systems.collision.debugNode.visible = false

		// Actualizar la distancia de la cámara
		GameState.systems.cameras.getCamaraActiva().far = AREA_SIZE + 1000
		GameState.systems.cameras.getCamaraActiva().updateProjectionMatrix()
		GameState.systems.cameras.getCamaraActiva().rotation.set(0, 0, 0)

		// Recolocar el interaction range por defecto
		GameState.gameData.interactionRange = 50

		// Cambiar el color de fondo de la escena para simular la skybox
		this._mainGame.background = new THREE.Color(0x121212)

		// Quitar la crosshair
		document.getElementById("crosshair").style.display = "none"

		// Luces
		this._crearLuces()
	}

	onLocationActive()
	{
		//
		// Iniciar la animación del texto
		//

		for (const animacion of this._animaciones.texto.letras)
			animacion.start()

		this._animaciones.texto.colores.animacion.start()

		//
		// Iniciar play del sonido
		//
		this._sonidos.endingSong.play()
	}

	getLocation()
	{
		return this._location
	}

	_cargarSonido()
	{
		this._sonidos = {}

		GameState.systems.sound.loadGlobalSound("../../resources/sounds/Hero_Infraction.mp3", (audio) => {
			this._sonidos.endingSong = audio

			audio.setVolume(0.12)
			audio.setLoop(true)
		})
	}

	_buildLocation()
	{
		this._crearCuboSkybox()
		this._crearCubos()
		this._crearTexto()
	}

	_crearCuboSkybox()
	{
		/*let geoCubo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
		geoCubo.translate(0, CUBE_SIZE/2, 0)

		let meshCubo = new THREE.Mesh(geoCubo,
			new THREE.MeshLambertMaterial({color: 0x151515, side: THREE.BackSide}))

		this._location.add(meshCubo)*/
	}

	_crearCubos()
	{
		//
		// Materiales
		//

		const materialCubo = new THREE.MeshNormalMaterial()

		//
		// Modelado
		//

		let O3Contenedor = new THREE.Object3D()

		// Crear una lista de cubos posicionados aleatoriamente
		const listaCubosFlotantes = []
		const minPosition = new THREE.Vector3(-AREA_SIZE/2, FLOATING_CUBE_MIN_HEIGHT, -AREA_SIZE/2)

		for (let i = 0; i < FLOATING_CUBES; i++)
		{
			const dim = RandomFloatInRange(FLOATING_CUBES_SIZE_RANGE[0], FLOATING_CUBES_SIZE_RANGE[1])

			let geoCubo = new THREE.BoxGeometry(dim, dim, dim)
			geoCubo.translate(RandomFloatInRange(minPosition.x, -minPosition.x),
				RandomFloatInRange(minPosition.y, AREA_SIZE),
				RandomFloatInRange(minPosition.z, -minPosition.z))

			O3Contenedor.add(new THREE.Mesh(geoCubo, materialCubo))

			let meshInverso = new THREE.Mesh(geoCubo, materialCubo)
			meshInverso.scale.y = -1
			O3Contenedor.add(meshInverso)
		}

		this._location.add(O3Contenedor)

		//
		// Animaciones cubos
		//

		let frameIni = {rY: 0}
		let frameFin = {rY: 2*Math.PI}

		this._animaciones.espacio = new TWEEN.Tween(frameIni).to(frameFin, 1800000)
			.onUpdate(() => {
				O3Contenedor.rotation.y = frameIni.rY
			})
			.repeat(Infinity)
	}

	_crearTexto()
	{
		const strings = {
			escape: "Escape",
			the: "The",
			lightrooms: "Lightrooms",
			a: "A",
			game: "game",
			by: "by",
			jaime: "Jaime",
			and: "&",
			francisco: "Fran"
		}

		this._listaLetras = []

		const materialTexto = new THREE.MeshBasicMaterial({color: 0xeaeaea})
		const materialTextoVerde = new THREE.MeshBasicMaterial({color: 0x84e15a})
		const materialTextoJaime = this._crearMaterialTextoJaime()
		const materialTextoFransico = new THREE.MeshBasicMaterial({color: 0xdd87f0})

		const O3TextoCompleto = new THREE.Object3D()

		// Cargar la fuente
		GameState.fontLoader.load("../../resources/fonts/RobotoMono/RobotoMono_Bold.json", (font) => {
			// Configuración de la geometría
			const geoConfig = {
				font: font,
				size: 100,
				height: 15,
				curveSegments: 25,
				bevelEnabled: false,
				bevelThickness: 2,
				bevelSize: 10,
				bevelOffset: 0,
				bevelSegments: 5
			}

			// Crear las letras y añadirlas a la lista
			const separacionLineas = 90
			const separacionPalabras = 50
			const separacionLetras = 6

			// NOTE: Actualiza las separaciones por el tamaño + palabra
			const crearPalabra = (palabra, separaciones, material = materialTexto) => {
				for (const caracter of palabra)
				{
					let geoLetra = new TextGeometry(caracter, geoConfig)
					geoLetra.translate(separaciones.horizontal, separaciones.vertical, 0)
					separaciones.horizontal += separaciones.dimensionesLetra.x + separacionLetras

					// Crear el mesh y añadirlo
					let meshLetra = new THREE.Mesh(geoLetra, material)
					this._listaLetras.push(meshLetra)
					O3TextoCompleto.add(meshLetra)
				}

				separaciones.horizontal += separacionPalabras
			}

			const calcularDimLetra = (geoConfigDims) => {
				let tmpGeo = new TextGeometry("T", geoConfigDims)
				tmpGeo.computeBoundingBox()

				return new THREE.Vector3(
					tmpGeo.boundingBox.max.x - tmpGeo.boundingBox.min.x,
					tmpGeo.boundingBox.max.y - tmpGeo.boundingBox.min.y,
					tmpGeo.boundingBox.max.z - tmpGeo.boundingBox.min.z
				)
			}

			const calcularTamPalabra = (palabra, dimensionesLetra) => {
				return palabra.length*(dimensionesLetra.x + separacionLetras) - separacionLetras
			}

			// Inicialización
			const separaciones = {
				dimensionesLetra: 0,
				horizontal: 0,
				vertical: 0
			}

			separaciones.dimensionesLetra = calcularDimLetra(geoConfig)
			separaciones.vertical = -separaciones.dimensionesLetra.y

			//
			// ESCAPE THE LIGHTROOMS
			//

			// Calcular la separación para que esté centrado
			separaciones.horizontal = -calcularTamPalabra(strings.escape, separaciones.dimensionesLetra)/2
			separaciones.horizontal += -(calcularTamPalabra(strings.the, separaciones.dimensionesLetra) + separacionPalabras)/2
			separaciones.horizontal += -(calcularTamPalabra(strings.lightrooms, separaciones.dimensionesLetra) + separacionPalabras)/2

			crearPalabra(strings.escape, separaciones)
			crearPalabra(strings.the, separaciones)
			crearPalabra(strings.lightrooms, separaciones)

			//
			// A GAME BY
			//
			geoConfig.size = 70

			separaciones.dimensionesLetra = calcularDimLetra(geoConfig)
			separaciones.vertical -= (separaciones.dimensionesLetra.y + separacionLineas)
			separaciones.horizontal = -(calcularTamPalabra(strings.a, separaciones.dimensionesLetra) +
				calcularTamPalabra(strings.game, separaciones.dimensionesLetra) +
				calcularTamPalabra(strings.by, separaciones.dimensionesLetra) + 2*separacionPalabras)/2

			crearPalabra(strings.a, separaciones, materialTextoVerde)
			crearPalabra(strings.game, separaciones, materialTextoVerde)
			crearPalabra(strings.by, separaciones, materialTextoVerde)

			//
			// JAIME & FRANCISCO
			//

			geoConfig.size = 80

			separaciones.dimensionesLetra = calcularDimLetra(geoConfig)
			separaciones.vertical -= (separaciones.dimensionesLetra.y + separacionLineas)
			separaciones.horizontal = -(calcularTamPalabra(strings.jaime, separaciones.dimensionesLetra) +
				calcularTamPalabra(strings.and, separaciones.dimensionesLetra) +
				calcularTamPalabra(strings.francisco, separaciones.dimensionesLetra) + 2*separacionPalabras)/2

			crearPalabra(strings.jaime, separaciones, materialTextoJaime)
			crearPalabra(strings.and, separaciones, materialTextoVerde)
			crearPalabra(strings.francisco, separaciones, materialTextoFransico)

			this._crearAnimacionTexto()
			this._animaciones.texto.colores.material = materialTextoJaime
		}, undefined, () => console.error("Error cargando fuente"))

		// El 0,0 del nodo se coloca en la posición final frontal del texto.
		O3TextoCompleto.translateZ(-2000)
		O3TextoCompleto.translateY(240)

		this._location.add(O3TextoCompleto)
	}

	_crearMaterialTextoJaime()
	{
		return new THREE.ShaderMaterial({
			vertexShader: `
				void main()
				{
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			  `,
			fragmentShader: `
				uniform float time;
				uniform vec3 colorA;
				uniform vec3 colorB;
				uniform vec3 colorC;
			
				void main()
				{
					vec3 gradientColor; 
					
					if (time < 0.33)
						gradientColor = mix(colorA, colorB, sin(3.0*time));
					else if (time < 0.66)
						gradientColor = mix(colorB, colorC, sin(3.0*(time - 0.33)));
					else
						gradientColor = mix(colorC, colorA, sin(3.0*(time - 0.66)));
						
					gl_FragColor = vec4(gradientColor, 1.0);
				}
			  `,
			uniforms: {
				time: { value: 0 },
				colorA: { value: new THREE.Vector3(1, 0, 0) },
				colorB: { value: new THREE.Vector3(0, 1, 0) },
				colorC: { value: new THREE.Vector3(0, 0, 1) }
			},
		})
	}

	_crearAnimacionTexto()
	{
		this._animaciones.texto = {
			letras: [],
			colores: {
				animacion: null,
				material: null
			}
		}

		//
		// Crear frames únicos con rotación y posiciones aleatorias
		//

		let frameFin = {pZ: 0, rY: 0}

		for (const mesh of this._listaLetras)
		{
			// Generar un frame inicial
			let frameIni = {
				pZ: RandomFloatInRange(-1.5*AREA_SIZE, -1.1*AREA_SIZE),
				rY: RandomFloatInRange(-4*Math.PI, 4*Math.PI),
			}

			// Posición inicial
			mesh.position.z = frameIni.pZ
			mesh.rotation.y = frameIni.rY

			// Crear la animación
			let animacion = new TWEEN.Tween(frameIni).to(frameFin, RandomIntInRange(5000, 6500))
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					mesh.position.z = frameIni.pZ
					mesh.rotation.y = frameIni.rY
				})

			this._animaciones.texto.letras.push(animacion)
		}

		// Restaurar el input cuando se complete esta animación
		this._animaciones.texto.letras[0].to(frameFin, 6500)
		this._animaciones.texto.letras[0].onComplete(() => {
			GameState.gameData.inputEnabled = true
			this._animaciones.espacio.start()
		})

		//
		// Animación colores
		//

		{
			let frameIni = {t: 0}
			let frameFin = {t: 1}

			this._animaciones.texto.colores.animacion = new TWEEN.Tween(frameIni).to(frameFin, 10000)
				.easing(TWEEN.Easing.Sinusoidal.InOut)
				.onStart(() => {
					frameFin.t = 1
				})
				.onUpdate(() => {
					this._animaciones.texto.colores.material.uniforms.time.value = frameIni.t
				})
				.onComplete(() => {
					frameIni.t = 0
				})
				.yoyo(true)
				.repeat(Infinity)
		}

		console.log("Animaciones finales cargadas")
	}

	_crearLuces()
	{
		// Luz texto
		{

		}
	}
}

export {EndLocation}
