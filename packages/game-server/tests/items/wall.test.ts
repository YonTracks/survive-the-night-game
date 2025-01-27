import { Player } from "@/entities/player";
import { Wall } from "@/entities/items/wall";
import Positionable from "@/extensions/positionable";
import Destructible from "@/extensions/destructible";
import { GameManagers } from "@/managers/game-managers";
import { beforeEach, it, test, expect, describe } from "vitest";
import { simpleTestSetup } from "@/tests/utils/setup";
import Vector2 from "@/util/vector2";

let player: Player;
let wall: Wall;
let gameManagers: GameManagers;

describe('Wall entity tests', () => {
  beforeEach(() => {
    gameManagers = simpleTestSetup();

    player = new Player(gameManagers);
    player.getExt(Positionable).setPosition(new Vector2(100, 100));
    gameManagers.getEntityManager().addEntity(player);

    wall = new Wall(gameManagers);
    gameManagers.getEntityManager().addEntity(wall);
  });

  it("should have a wall in inventory", () => {
      // Add a wall item to player's inventory
      player.getInventory().push({ itemType: "wall"});

      // Verify wall is in player's inventory
      expect(player.getInventory().some((item) => item.itemType === "wall")).toBe(true);
      expect(player.getInventory().length).toBe(1);
  });

  it("should be destructible", () => {
    const wall = new Wall(gameManagers);
    const destructible = wall.getExt(Destructible);

    // Verify that the wall has the destructible extension
    expect(destructible).toBeDefined();
    console.log("destructable before damage:", destructible)
    // Simulate damage
    destructible?.setHealth(5);
    console.log("destructable after damage:", destructible)
    expect(destructible?.getHealth()).toBe(5);

    // Simulate destruction
    destructible?.setHealth(0);
    expect(gameManagers.getEntityManager().getEntities()).not.toContain(wall);
  });


  it("should retain health state when picked up and placed", () => {
    const destructible = wall.getExt(Destructible);
  
    // Check initial health of the wall (undamaged)
    expect(destructible?.getHealth()).toBe(destructible?.getMaxHealth());
  
    // Damage the wall
    destructible?.setHealth(5);
    expect(destructible?.getHealth()).toBe(5);
  
    // Simulate player picking up the damaged wall
    player.getInventory().push({ itemType: "wall"}); // Add wall to inventory
    gameManagers.getEntityManager().removeEntity("wall"); // Remove wall from entity manager
  
    // Verify the wall is in the player's inventory and health remains correct
    expect(player.getInventory().some((item) => item.itemType === "wall")).toBe(true);
    expect(destructible?.getHealth()).toBe(5);
  
    // Simulate player placing the damaged wall
    gameManagers.getEntityManager().addEntity(wall); // Add wall back to entity manager
    player.getInventory().pop(); // Remove wall from inventory
  
    // Verify the wall is back in the entity manager and health remains correct
    expect(
      gameManagers.getEntityManager().getEntities().some((entity) => entity === wall)
    ).toBe(true);
    expect(destructible?.getHealth()).toBe(5);
  });
  
});
