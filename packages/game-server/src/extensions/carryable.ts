import { Extension, ExtensionSerialized } from "@/extensions/types";
import { PlayerPickedUpItemEvent } from "@/events/server-sent/pickup-item-event";
import Inventory from "@/extensions/inventory";
import { ItemType } from "@/util/inventory";
import { IEntity } from "@/entities/types";
import { ItemState } from "@/types/entity";

interface PickupOptions {
  state?: ItemState;
  mergeStrategy?: (existingState: ItemState, pickupState: ItemState) => ItemState;
}

export default class Carryable implements Extension {
  public static readonly type = "carryable" as const;

  private self: IEntity;
  private itemType: ItemType;
  private state: ItemState = {};

  public constructor(self: IEntity, itemType: ItemType) {
    this.self = self;
    this.itemType = itemType;
    this.state = {};
  }

  public setItemState(state: ItemState): this {
    this.state = state;
    return this;
  }

  public getItemState(): ItemState {
    return this.state;
  }

  public pickup(entityId: string, options?: PickupOptions): boolean {
    console.log("[Carryable] Attempting to pick up entity", {
      entityId,
      itemType: this.itemType,
      currentState: this.state,
    });

    const entity = this.self.getEntityManager().getEntityById(entityId);
    if (!entity) {
      console.log("[Carryable] Entity with ID not found:", entityId);
      return false;
    }
    
    const inventory = entity.getExt(Inventory);

    if (!inventory) {
      console.log("[Carryable] Target entity does not have an Inventory extension:", entityId);
      return false;
    }

    if (inventory.isFull() && !options?.mergeStrategy) {
      console.log("[Carryable] Inventory is full, cannot pick up item.");
      return false;
    }
    // If we have a merge strategy and existing item, merge instead of adding new
    if (options?.mergeStrategy) {
      const existingItemIndex = inventory
        .getItems()
        .findIndex((item) => item.itemType === this.itemType);
      if (existingItemIndex >= 0) {
        const existingItem = inventory.getItems()[existingItemIndex];
        console.log("[Carryable] Found existing item in inventory:", existingItem);
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        // <<< ToDo: Bugfix, Seems issue with state >>>>>>>>>>>>>>>>>>>>
        if (existingItem.state !== undefined && options.state !== undefined) {
          const newState = options.mergeStrategy(existingItem.state, options.state);
          console.log("[Carryable] Merging item states:", { existingState: existingItem.state, newState });
          inventory.updateItemState(existingItemIndex, newState);
          this.self.getEntityManager().markEntityForRemoval(this.self);
          return true;
        }
      }
    }
    // Otherwise add as new item
    if (inventory.isFull()) {
      console.log("[Carryable] Inventory is still full after merge strategy check.");
      return false;
    }

    console.log("[Carryable] Adding new item to inventory:", {
      itemType: this.itemType,
      state: options?.state,
    });
    inventory.addItem({
      itemType: this.itemType,
      state: options?.state,
    });

    this.self.getEntityManager().markEntityForRemoval(this.self);

    this.self
      .getEntityManager()
      .getBroadcaster()
      .broadcastEvent(
        new PlayerPickedUpItemEvent({
          playerId: entityId,
          itemType: this.itemType,
        })
      );

    console.log("[Carryable] Successfully picked up item.");
    return true;
  }

  public serialize(): ExtensionSerialized {
    return {
      type: Carryable.type,
      itemType: this.itemType,
      state: this.state,
    };
  }
}
