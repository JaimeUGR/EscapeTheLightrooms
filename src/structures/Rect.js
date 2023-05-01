
import {Vector2} from "../../libs/three.module.js"

class Rect
{
	/**
	 *
	 * @param position Vector(x, y) con la posición de la esquina inferior izquierda
	 * @param size Vector(x, y) con el tamaño
	 */
	constructor(position, size)
	{
		this.pos = position
		this.size = size
	}

	containsRectangle(r)
	{
		return (r.pos.x >= this.pos.x) && (r.pos.x + r.size.x < this.pos.x + this.size.x) &&
			(r.pos.y >= this.pos.y) && (r.pos.y + r.size.y < this.pos.y + this.size.y)
	}

	overlapsRectangle(r)
	{
		return (this.pos.x < r.pos.x + r.size.x && this.pos.x + this.size.x >= r.pos.x
			&& this.pos.y < r.pos.y + r.size.y && this.pos.y + this.size.y >= r.pos.y)
	}

	containsPoint(point)
	{
		return !(point.x < this.pos.x || point.y < this.pos.y || point.x >= (this.pos.x + this.size.x) || point.y >= (this.pos.y + this.size.y));
	}
}

export {Rect}
