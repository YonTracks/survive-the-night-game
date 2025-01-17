import { ExtensionTypes } from "../../../game-shared/src/util/extension-types";
import { ClientExtension, ClientExtensionSerialized } from "@/extensions/types";

type UpdateFunction = (deltaTime: number) => void;

export class ClientUpdatable implements ClientExtension {
  public static readonly type = ExtensionTypes.UPDATABLE;

  private updateFunction: UpdateFunction = () => {};

  public setUpdateFunction(cb: UpdateFunction): this {
    this.updateFunction = cb;
    return this;
  }

  public update(deltaTime: number): void {
    this.updateFunction(deltaTime);
  }

  public deserialize(data: ClientExtensionSerialized): this {
    return this;
  }
}