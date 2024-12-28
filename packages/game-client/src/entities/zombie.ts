import {
  PositionableTrait,
  determineDirection,
  roundVector2,
  Vector2,
  Player,
  distance,
  GenericEntity,
  RawEntity,
  Destructible,
  Positionable,
  Collidable,
  Ignitable,
} from "@survive-the-night/game-server";
import { AssetManager } from "@/managers/asset";
import { drawHealthBar, getFrameIndex, IClientEntity, Renderable } from "./util";
import { GameState, getEntityById } from "../state";
import { debugDrawHitbox } from "../util/debug";
import { Z_INDEX } from "@survive-the-night/game-server/src/managers/map-manager";
import Movable from "@survive-the-night/game-server/src/shared/extensions/movable";

const flashCanvas = document.createElement("canvas");
const flashCtx = flashCanvas.getContext("2d")!;

function createFlashEffect(
  image: HTMLImageElement,
  color: string = "rgba(255, 0, 0, 0.5)"
): HTMLCanvasElement {
  // Resize canvas if needed
  if (flashCanvas.width !== image.width || flashCanvas.height !== image.height) {
    flashCanvas.width = image.width;
    flashCanvas.height = image.height;
  }

  // Clear previous content
  flashCtx.clearRect(0, 0, flashCanvas.width, flashCanvas.height);

  // Draw colored rectangle
  flashCtx.fillStyle = color;
  flashCtx.fillRect(0, 0, image.width, image.height);

  // Use sprite as mask
  flashCtx.globalCompositeOperation = "destination-in";
  flashCtx.drawImage(image, 0, 0);

  // Reset composite operation
  flashCtx.globalCompositeOperation = "source-over";

  return flashCanvas;
}

export class ZombieClient extends GenericEntity implements IClientEntity, Renderable {
  private assetManager: AssetManager;
  private lastRenderPosition = { x: 0, y: 0 };
  private readonly LERP_FACTOR = 0.1;
  private previousHealth: number | undefined;
  private damageFlashUntil: number = 0;

  constructor(data: RawEntity, assetManager: AssetManager) {
    super(data);
    this.assetManager = assetManager;
  }

  public getZIndex(): number {
    return Z_INDEX.PLAYERS;
  }

  private getPosition(): Vector2 {
    const positionable = this.getExt(Positionable);
    const position = positionable.getPosition();
    return position;
  }

  getCenterPosition(): Vector2 {
    const positionable = this.getExt(Positionable);
    return positionable.getCenterPosition();
  }

  setVelocity(velocity: Vector2): void {
    const movable = this.getExt(Movable);
    movable.setVelocity(velocity);
  }

  getVelocity(): Vector2 {
    const movable = this.getExt(Movable);
    return movable.getVelocity();
  }

  getMaxHealth(): number {
    const destructible = this.getExt(Destructible);
    return destructible.getMaxHealth();
  }

  getHealth(): number {
    const destructible = this.getExt(Destructible);
    return destructible.getHealth();
  }

  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const currentHealth = this.getHealth();

    if (this.previousHealth !== undefined && currentHealth < this.previousHealth) {
      this.damageFlashUntil = Date.now() + 250;
    }
    this.previousHealth = currentHealth;

    const targetPosition = this.getPosition();

    this.lastRenderPosition.x += (targetPosition.x - this.lastRenderPosition.x) * this.LERP_FACTOR;
    this.lastRenderPosition.y += (targetPosition.y - this.lastRenderPosition.y) * this.LERP_FACTOR;

    const renderPosition = roundVector2(this.lastRenderPosition);
    const facing = determineDirection(this.getVelocity());

    const frameIndex = getFrameIndex(gameState.startedAt, {
      duration: 500,
      frames: 3,
    });

    const destructible = this.getExt(Destructible);
    const isDead = destructible.isDead();

    const image = isDead
      ? this.assetManager.get("ZombieDead")
      : this.assetManager.getFrameWithDirection("Zombie", facing, frameIndex);

    ctx.drawImage(image, renderPosition.x, renderPosition.y);

    if (this.hasExt(Ignitable) && !isDead) {
      const fireImg = this.assetManager.get("Fire");
      ctx.drawImage(fireImg, renderPosition.x, renderPosition.y);
    }

    if (isDead) {
      const myPlayer = getEntityById(gameState, gameState.playerId) as
        | PositionableTrait
        | undefined;

      if (
        myPlayer !== undefined &&
        distance(myPlayer.getPosition(), this.getPosition()) < Player.MAX_INTERACT_RADIUS
      ) {
        ctx.fillStyle = "white";
        ctx.font = "6px Arial";
        const text = "loot (e)";
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, this.getCenterPosition().x - textWidth / 2, this.getPosition().y - 3);
      }
    } else {
      const collidable = this.getExt(Collidable);
      drawHealthBar(ctx, renderPosition, this.getHealth(), this.getMaxHealth());
      debugDrawHitbox(ctx, collidable.getHitBox());
      debugDrawHitbox(ctx, destructible.getDamageBox(), "red");
    }

    if (Date.now() < this.damageFlashUntil) {
      const flashEffect = createFlashEffect(image);
      ctx.drawImage(flashEffect, renderPosition.x, renderPosition.y);
    }
  }
}
