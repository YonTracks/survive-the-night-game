import { MAX_INTERACT_RADIUS } from "@shared/constants/constants";
import { distance } from "../../../game-shared/src/util/physics";
import Vector2 from "@shared/util/vector2";

export function renderInteractionText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerPosition: Vector2,
  position: Vector2,
  playerPosition: Vector2
): void {
  if (distance(playerPosition, centerPosition) < MAX_INTERACT_RADIUS) {
    console.log('test')

    ctx.fillStyle = "white";
    ctx.font = "6px Arial";
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, centerPosition.x - textWidth / 2, position.y - 3);
  }
}
