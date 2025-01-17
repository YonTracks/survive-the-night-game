import { IEntity } from "@/entities/types";
import { Extension, ExtensionSerialized } from "@/extensions/types";
import Positionable from "@/extensions/positionable";
import { Rectangle } from "@/util/shape";
import Vector2 from "@/util/vector2";

type DestructibleDeathHandler = () => void;

export default class Destructible implements Extension {
  public static readonly type = "destructible";

  private self: IEntity;
  private health = 0;
  private maxHealth = 0;
  private deathHandler: DestructibleDeathHandler | null = null;

  public constructor(self: IEntity) {
    this.self = self;
  }

  public onDeath(deathHandler: DestructibleDeathHandler): this {
    this.deathHandler = deathHandler;
    return this;
  }

  public setHealth(health: number): this {
    this.health = health;
    return this;
  }

  public setMaxHealth(maxHealth: number): this {
    this.maxHealth = maxHealth;
    return this;
  }

  public damage(damage: number): void {
    if (this.isDead()) {
      return;
    }

    this.health -= damage;

    if (this.isDead()) {
      this.deathHandler?.();
    }
  }

  public getDamageBox(): Rectangle {
    const positionable = this.self.getExt(Positionable);
    const position = positionable.getPosition();
    const size = positionable.getSize();

    return new Rectangle(new Vector2(position.x, position.y), size);
  }

  public heal(amount: number): void {
    if (this.isDead()) {
      return;
    }
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  public isDead(): boolean {
    return this.health === 0;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public serialize(): ExtensionSerialized {
    return {
      type: Destructible.type,
      health: this.health,
      maxHealth: this.maxHealth,
    };
  }
}