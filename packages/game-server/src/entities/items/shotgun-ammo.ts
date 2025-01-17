import Carryable from "@/extensions/carryable";
import Interactive from "@/extensions/interactive";
import Positionable from "@/extensions/positionable";
import { IGameManagers } from "@/managers/types";
import { Entities } from "@/constants";
import { Entity } from "@/entities/entity";
import Vector2 from "@/util/vector2";

export class ShotgunAmmo extends Entity {
  public static readonly Size = new Vector2(16, 16);
  public static readonly DEFAULT_AMMO_COUNT = 5;

  constructor(gameManagers: IGameManagers) {
    super(gameManagers, Entities.SHOTGUN_AMMO);

    this.extensions = [
      new Positionable(this).setSize(ShotgunAmmo.Size),
      new Interactive(this).onInteract(this.interact.bind(this)).setDisplayName("shotgun ammo"),
      new Carryable(this, "shotgun_ammo"),
    ];
  }

  private interact(entityId: string): void {
    const entity = this.getEntityManager().getEntityById(entityId);
    if (!entity) return;

    // When picking up ammo, merge it with existing ammo if present
    const carryable = this.getExt(Carryable);
    carryable.pickup(entityId, {
      state: { count: ShotgunAmmo.DEFAULT_AMMO_COUNT },
      mergeStrategy: (existing, pickup) => ({
        count: (existing?.count || 0) + (pickup?.count || ShotgunAmmo.DEFAULT_AMMO_COUNT),
      }),
    });
  }
}