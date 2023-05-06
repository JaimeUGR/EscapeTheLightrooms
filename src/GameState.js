
import {Vector2, Vector3} from "../libs/three.module.js"
import {Rect} from "./structures/Rect.js";


class GameState
{
	static Initialize()
	{
		this.player = {
			position: new Vector3(0, 20, 5),
			rect: new Rect(new Vector2(-2.5, -2.5), new Vector2(5, 5)),
			movementVector: new Vector3(0, 0, 0)
		}

		this.tmp = {
			cameraLock: false,
			colsEnabled: true,
			gameStarted: false
		}

		this.systems = {
			input: null,
			collision: null,
			interaction: null,
			cameras: null
		}
	}
}

export {GameState}
