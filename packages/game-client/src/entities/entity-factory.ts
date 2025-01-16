import { RawEntity } from "@shared/types/entity";
import { Entities } from "@shared/constants";
import { AssetManager } from "@/managers/asset";
import { IClientEntity } from "@/entities/util";
import { BulletClient } from "@/entities/bullet";
import { ZombieClient } from "@/entities/zombie";
import { WallClient } from "@/entities/items/wall";
import { ClothClient } from "@/entities/items/cloth";
import { PlayerClient } from "@/entities/player";
import { TreeClient } from "@/entities/items/tree";
import { BandageClient } from "@/entities/items/bandage";
import { SpikesClient } from "@/entities/items/spikes";
import { FireClient } from "@/entities/environment/fire";
import { TorchClient } from "@/entities/items/torch";
import { GasolineClient } from "@/entities/items/gasoline";
import { PistolClient } from "@/entities/weapons/pistol";
import { ShotgunClient } from "@/entities/weapons/shotgun";
import { KnifeClient } from "@/entities/weapons/knife";
import { PistolAmmoClient } from "@/entities/weapons/pistol-ammo";
import { ShotgunAmmoClient } from "@/entities/weapons/shotgun-ammo";
import { LandmineClient } from "@/entities/items/landmine";

export const entityMap = {
  [Entities.PLAYER]: PlayerClient,
  [Entities.TREE]: TreeClient,
  [Entities.BULLET]: BulletClient,
  [Entities.WALL]: WallClient,
  [Entities.PISTOL]: PistolClient,
  [Entities.PISTOL_AMMO]: PistolAmmoClient,
  [Entities.SHOTGUN]: ShotgunClient,
  [Entities.SHOTGUN_AMMO]: ShotgunAmmoClient,
  [Entities.KNIFE]: KnifeClient,
  [Entities.BANDAGE]: BandageClient,
  [Entities.CLOTH]: ClothClient,
  [Entities.SPIKES]: SpikesClient,
  [Entities.FIRE]: FireClient,
  [Entities.TORCH]: TorchClient,
  [Entities.GASOLINE]: GasolineClient,
  [Entities.ZOMBIE]: ZombieClient,
  [Entities.LANDMINE]: LandmineClient,
} as const;

export class EntityFactory {
  private assetManager: AssetManager;

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
  }

  public createEntity(data: RawEntity): IClientEntity {
    if (!data || !data.type) {
      throw new Error(`Invalid entity data: ${JSON.stringify(data)}`);
    }

    const EntityClass = (entityMap as any)[data.type];
    if (!EntityClass) {
      throw new Error(`Unknown entity type: ${data.type}`);
    }

    return new EntityClass(data, this.assetManager);
  }
}
