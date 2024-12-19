import Collidable from "./collidable";
import Consumable from "./consumable";
import Destructible from "./destructible";
import Interactive from "./interactive";
import Positionable from "./positionable";
import Triggerable from "./trigger";
import TriggerCooldownAttacker from "./trigger-cooldown-attacker";
import Updatable from "./updatable";

export const extensionsMap = {
  [Collidable.Name]: Collidable,
  [Consumable.Name]: Consumable,
  [Destructible.Name]: Destructible,
  [Interactive.Name]: Interactive,
  [Positionable.Name]: Positionable,
  [Triggerable.Name]: Triggerable,
  [Updatable.Name]: Updatable,
  [TriggerCooldownAttacker.Name]: TriggerCooldownAttacker,
} as const;

export {
  Collidable,
  Consumable,
  Destructible,
  Interactive,
  Positionable,
  Triggerable,
  Updatable,
  TriggerCooldownAttacker,
};
export * from "./types";