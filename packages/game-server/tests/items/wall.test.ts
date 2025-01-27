import { Player } from "@/entities/player";
import { Wall } from "@/entities/items/wall";
import Positionable from "@/extensions/positionable";
import Destructible from "@/extensions/destructible";
import { GameManagers } from "@/managers/game-managers";
import { beforeEach, it, expect } from "vitest";
import { simpleTestSetup } from "@/tests/utils/setup";
import Vector2 from "@/util/vector2";

let player: Player;
let wall: Wall;
let gameManagers: GameManagers;

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

  // Simulate damage
  destructible?.setHealth(5);
  expect(destructible?.getHealth()).toBe(5);

  // Simulate destruction
  destructible?.setHealth(0);
  expect(gameManagers.getEntityManager().getEntities()).not.toContain(wall);
});

/*
it("should retain health state when picked up and placed", () => {
  const wall = new Wall(gameManagers);
  const destructible = wall.getExt(Destructible);

  // Verify that the wall has the destructible extension
  expect(destructible).toBeDefined();

  // Verify default health
  expect(destructible?.getHealth()).toBe(10);

  // Simulate damage
  destructible?.setHealth(5);
  expect(destructible?.getHealth()).toBe(5);

  // Simulate player picking up the wall
  player.setUseItem(true);
  gameManagers.getEntityManager().update(1);

  // Verify the wall is added to inventory with its current health
 // expect(player.getInventory()).toEqual([{ itemType: "wall", state: { health: 5 } }]);

  // Simulate player placing the wall
  player.selectInventoryItem(1);
  player.setUseItem(true);
  gameManagers.getEntityManager().update(1);

  // Verify the wall is placed in the game with the correct health
  const placedWall = gameManagers
    .getEntityManager()
    .getEntities()
    .find((entity) => entity instanceof Wall);

  expect(placedWall).toBeDefined();
  expect(placedWall?.getExt(Destructible)?.getHealth()).toBe(5);
});
*/
