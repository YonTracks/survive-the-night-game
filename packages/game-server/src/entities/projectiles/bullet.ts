import { ZombieHurtEvent } from "@/events/server-sent/zombie-hurt-event";
import Collidable from "@/extensions/collidable";
import Destructible from "@/extensions/destructible";
import Groupable from "@/extensions/groupable";
import Movable from "@/extensions/movable";
import Positionable from "@/extensions/positionable";
import Updatable from "@/extensions/updatable";
import { IGameManagers } from "@/managers/types";
import { Entities } from "@/constants";
import { Direction, normalizeDirection } from "@/util/direction";
import { Entity } from "@/entities/entity";
import { Hitbox } from "@/util/hitbox";
import { normalizeVector, distance } from "@/util/physics";
import { IEntity } from "@/entities/types";
import { RawEntity } from "@/types/entity";
import Vector2 from "@/util/vector2";
import { Rectangle } from "@/util/shape";

const MAX_TRAVEL_DISTANCE = 400;
export const BULLET_SPEED = 100;
export const HITBOX_RADIUS = 1;

export class Bullet extends Entity {
  private traveledDistance: number = 0;
  private static readonly BULLET_SPEED = 500;

  constructor(gameManagers: IGameManagers) {
    super(gameManagers, Entities.BULLET);

    this.extensions = [
      new Positionable(this),
      new Movable(this),
      new Updatable(this, this.updateBullet.bind(this)),
      new Collidable(this).setSize(new Vector2(1, 1)),
    ];
  }

  setDirection(direction: Direction) {
    const normalized = normalizeDirection(direction);
    this.getExt(Movable).setVelocity(
      new Vector2(normalized.x * Bullet.BULLET_SPEED, normalized.y * Bullet.BULLET_SPEED)
    );
  }

  setDirectionWithOffset(direction: Direction, offsetAngle: number) {
    const normalized = normalizeDirection(direction);

    // Convert offsetAngle from degrees to radians
    const radians = (offsetAngle * Math.PI) / 180;

    // Apply rotation to the normalized vector
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const rotatedX = normalized.x * cos - normalized.y * sin;
    const rotatedY = normalized.x * sin + normalized.y * cos;

    // Normalize the rotated vector
    const length = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY);

    this.getExt(Movable).setVelocity(
      new Vector2(
        (rotatedX / length) * Bullet.BULLET_SPEED,
        (rotatedY / length) * Bullet.BULLET_SPEED
      )
    );
  }

  getHitbox(): Rectangle {
    return this.getExt(Collidable).getHitBox();
  }

  setDirectionFromVelocity(velocity: Vector2) {
    if (velocity.x === 0 && velocity.y === 0) {
      // Default direction (right) if no velocity
      this.getExt(Movable).setVelocity(new Vector2(Bullet.BULLET_SPEED, 0));
      return;
    }

    const normalized = normalizeVector(velocity);
    this.getExt(Movable).setVelocity(
      new Vector2(normalized.x * Bullet.BULLET_SPEED, normalized.y * Bullet.BULLET_SPEED)
    );
  }

  private updateBullet(deltaTime: number) {
    const lastPosition = this.updatePositions(deltaTime);
    this.handleMaxDistanceLogic(lastPosition);
    this.handleIntersections();
  }

  private updatePositions(deltaTime: number) {
    const lastPosition = this.getPosition();
    const movable = this.getExt(Movable);
    const velocity = movable.getVelocity();
    const positionable = this.getExt(Positionable);

    positionable.setPosition(
      new Vector2(
        positionable.getPosition().x + velocity.x * deltaTime,
        positionable.getPosition().y + velocity.y * deltaTime
      )
    );
    return lastPosition;
  }

  private handleIntersections() {
    // TODO: find a helper function for this
    const isEnemy = (entity: IEntity) =>
      entity.hasExt(Groupable) && entity.getExt(Groupable).getGroup() === "enemy";

    const enemies = this.getEntityManager()
      .getNearbyIntersectingDestructableEntities(this, this.getHitbox())
      .filter(isEnemy);

    if (enemies.length > 0) {
      const firstEnemy = enemies[0];
      this.getEntityManager().markEntityForRemoval(this);
      const destructible = firstEnemy.getExt(Destructible);
      destructible.damage(1);

      if (firstEnemy.getType() === Entities.ZOMBIE) {
        this.getGameManagers()
          .getBroadcaster()
          .broadcastEvent(new ZombieHurtEvent(firstEnemy.getId()));
      }
    }
  }

  private handleMaxDistanceLogic(lastPosition: Vector2) {
    this.traveledDistance += distance(lastPosition, this.getPosition());

    if (this.traveledDistance > MAX_TRAVEL_DISTANCE) {
      this.getEntityManager().markEntityForRemoval(this);
    }
  }

  serialize(): RawEntity {
    return {
      ...super.serialize(),
      position: this.getPosition(),
      velocity: this.getVelocity(),
    };
  }

  getPosition(): Vector2 {
    return this.getExt(Positionable).getPosition();
  }

  setPosition(position: Vector2) {
    this.getExt(Positionable).setPosition(position);
  }

  getCenterPosition(): Vector2 {
    return this.getPosition();
  }

  getVelocity(): Vector2 {
    return this.getExt(Movable).getVelocity();
  }

  setVelocity(velocity: Vector2) {
    this.getExt(Movable).setVelocity(velocity);
  }
}
