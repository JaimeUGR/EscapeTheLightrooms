
import {Rect} from "./Rect.js"
import {Vector2} from "../../libs/three.module.js";

class QuadTree
{
	constructor(rect = new Rect(new Vector2(5, -5), new Vector2(10, 10))
				, maxDepth = 4, depth = 0)
	{
		this.rect = rect
		this.maxDepth = maxDepth
		this.depth = depth

		this.items = []
		this.quads = [null, null, null, null]

		let halfW = this.rect.size.x/2
		let halfH = this.rect.size.y/2

		this.quadAreas = [
			new Rect(new Vector2(this.rect.pos.x, this.rect.pos.y + halfH), new Vector2(halfW, halfH)), // Arriba Izda
			new Rect(new Vector2(this.rect.pos.x + halfW, this.rect.pos.y + halfH), new Vector2(halfW, halfH)), // Arriba Dcha
			new Rect(new Vector2(this.rect.pos.x, this.rect.pos.y), new Vector2(halfW, halfH)), // Abajo Izda
			new Rect(new Vector2(this.rect.pos.x + halfW, this.rect.pos.y), new Vector2(halfW, halfH)) // Abajo Dcha
		]
	}

	// Devuelve el par [índice local, quad contenedor]
	insert(rect, index)
	{
		if (this.depth + 1 < this.maxDepth)
		{
			for (let i = 0; i < 4; i++)
			{
				// Contiene completamente el rectángulo
				if (this.quadAreas[i].containsRectangle(rect))
				{
					if (this.quads[i] == null)
					{
						// Crear el quad
						this.quads[i] = new QuadTree(this.quadAreas[i], this.maxDepth, this.depth + 1)
					}

					return this.quads[i].insert(index)
				}
			}
		}

		// No debe ir en ningún hijo
		this.items.push(index)
		return [this.items.length - 1, this]
	}

	remove(index)
	{
		let replacedGlobalIndex = -1

		// Si no el último se elimina directamente
		if (index < this.items.length - 1)
		{
			replacedGlobalIndex = this.items[this.items.length - 1]
			this.items[index] = replacedGlobalIndex
		}

		this.items.pop()

		// Devuelve el índice global del objeto intercambiado (si ha ocurrido)
		return replacedGlobalIndex
	}

	searchArea(rect, resultItems)
	{
		// Comprobamos si mis items tienen overlap con el área
		for (let i = 0; i < this.items.length; i++)
		{
			if (this.items[i].overlapsRectangle(rect))
				resultItems.push(this.items[i])
		}

		// Comprobamos si mis hijos contienen completamente el área
		for (let i = 0; i < 4; i++)
		{
			if (this.quads[i] != null)
			{
				// Optimización: si mi hijo está contenido completamente añado todos sus objetos
				if (rect.containsRectangle(this.quadAreas[i]))
					this.quads[i].items(resultItems)

				// If child overlaps with search area then checks need
				// to be made
			else if (this.quadAreas[i].overlapsRectangle(rect))
				this.quads[i].searchArea(rect, resultItems);
			}
		}
	}

	items(resultList)
	{
		// Añade todos los items recursivamente a la lista dada
		for (let i = 0; i < this.items.length; i++)
		{
			resultList.push(this.items[i])
		}

		// Añade los objetos de los hijos recursivamente a la lista
		for (let i = 0; i < 4; i++)
		{
			if (this.quads[i] != null)
				this.quads[i].items(resultList)
		}
	}
}

class QuadTreeContainer
{
	constructor(rect = new Rect(new Vector2(5, -5), new Vector2(10, 10))
		, maxDepth = 4, depth = 0)
	{
		this.allObjects = []
		this.root = new QuadTree(rect, maxDepth, depth)
		this.rect = rect
	}

	// Devuelve el objInfo
	insert(obj, rect)
	{
		let objInfo = {
			obj: obj,
			rect: rect,
			globalIndex: this.allObjects.length,
			localIndex: -1,
			localQuad: null
		}

		let insertResult = this.root.insert(rect, objInfo.globalIndex)

		objInfo.localIndex = insertResult[0]
		objInfo.localQuad = insertResult[1]

		if (objInfo.localIndex < 0)
		{
			// Fallo durante la inserción
			return null
		}

		this.allObjects.push(objInfo)

		return objInfo
	}

	searchArea(rect)
	{
		// Devuelve la objInfo de todos los objetos del area
		let indexBuffer = []

		this.root.searchArea(rect, indexBuffer)

		let resultBuffer = new Array(indexBuffer.length)

		// Añadimos los objInfo
		for (let i = 0; i < indexBuffer.length; i++)
		{
			resultBuffer.push(this.allObjects[indexBuffer[i]])
		}

		return resultBuffer
	}

	// Elimina del índice global
	remove(index)
	{
		// Eliminamos el item de la lista local correspondiente

		let objInfo = this.allObjects[index]

		let replacedGlobalIndex  = objInfo.localQuad.remove(objInfo.localIndex)

		if (replacedGlobalIndex !== -1)
		{
			// Actualizamos el índice local de este objeto
			this.allObjects[replacedGlobalIndex].localIndex = objInfo.localIndex
		}

		// Ahora, para eliminar el item global, lo llevamos al final si su índice global no es el último

		if (index < this.allObjects.length - 1)
		{
			let replacedObjData = this.allObjects[this.allObjects.length - 1]
			replacedObjData.globalIndex = index
			replacedObjData.localQuad.items[replacedObjData.localIndex] = index
		}

		this.allObjects.pop()
	}
}

export {QuadTreeContainer}