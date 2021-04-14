import { StartGameScreenData } from "@polusgg/plugin-polusgg-api/src/services/roleManager/roleManagerService";
import { EdgeAlignments } from "@polusgg/plugin-polusgg-api/src/types/enums/edgeAlignment";
import { BaseManager } from "@polusgg/plugin-polusgg-api/src/baseManager/baseManager";
import { RoleMetadata } from "@polusgg/plugin-polusgg-api/src/baseRole/baseRole";
import { GameDataPacket } from "@nodepolus/framework/src/protocol/packets/root";
import { Button } from "@polusgg/plugin-polusgg-api/src/services/buttonManager";
import { ServiceType } from "@polusgg/plugin-polusgg-api/src/types/enums";
import { EntityImage } from "@polusgg/plugin-polusgg-api/src/entities";
import { PlayerInstance } from "@nodepolus/framework/src/api/player";
import { BaseRole } from "@polusgg/plugin-polusgg-api/src/baseRole";
import { Services } from "@polusgg/plugin-polusgg-api/src/services";
import { PlayerRole } from "@nodepolus/framework/src/types/enums";
import { Player } from "@nodepolus/framework/src/player";
import { Server } from "@nodepolus/framework/src/server";
import { assetBundle } from ".";

declare const server: Server;

export class HotPotatoRole extends BaseRole {
  protected readonly metadata: RoleMetadata = {
    name: "HotPotato",
  };

  protected button!: Button;
  protected potatoAttachedTo: PlayerInstance | undefined;
  protected potatoImage?: EntityImage;

  constructor(owner: PlayerInstance) {
    super(owner);

    this.load();
  }

  getManagerType(): typeof BaseManager {
    return class extends BaseManager {
      getId(): string {
        return "HotPotatoManager";
      }

      getTypeName(): string {
        return "HotPotato";
      }
    };
  }

  getAssignmentScreen(_player: PlayerInstance): StartGameScreenData {
    return {
      title: "[FF1919FF]Impostor",
      subtitle: "[FF1919FF]Blow up the crew!",
      color: [255, 25, 25, 255],
    };
  }

  protected attachPotato(): void {
    this.potatoAttachedTo = this.owner.getLobby().getPlayers().find(player => player.getPosition().distance(this.owner.getPosition()) < 2);

    if (!this.potatoAttachedTo) {
      server.getLogger("PotatoPlugin").debug("cannot attach potato without a target");

      return;
    }

    this.potatoImage = new EntityImage(this.owner.getLobby(), assetBundle.getSafeAsset(POTATO_ASSET).getId(), this.potatoAttachedTo.getPosition());
  }

  protected blowUpPotato(): void {
    if (this.potatoAttachedTo === undefined) {
      server.getLogger("PotatoPlugin").error("Attempted to blow up player without target player");

      return;
    }

    const blowUpPosition = this.potatoAttachedTo.getPosition();

    // spawn blow up animation

    const playersToBlowUp = this.potatoAttachedTo.getLobby().getPlayers().filter(p => p.getPosition().distance(blowUpPosition) <= 2);

    for (let i = 0; i < playersToBlowUp.length; i++) {
      playersToBlowUp[i].kill();
    }
  }

  private async load(): Promise<void> {
    Services.get(ServiceType.RoleManager).setBaseRole(this.owner as Player, PlayerRole.Impostor);

    this.button = await Services.get(ServiceType.Button).spawnButton(this.owner.getConnection()!, {
      asset: assetBundle.getSafeAsset(ASSET_NAME),
      position: EdgeAlignments.LeftBottom,
      maxTimer: 15,
    });

    this.button.on("clicked", () => {
      if (this.potatoAttachedTo === undefined) {
        this.attachPotato();
      } else {
        this.blowUpPotato();
      }
    });

    setInterval(() => {
      if (this.potatoAttachedTo !== undefined && this.potatoImage !== undefined) {
        const oldPosition = this.potatoImage.getCustomNetworkTransform().getPosition();

        this.potatoImage.getCustomNetworkTransform().setPosition(this.potatoAttachedTo.getPosition());

        if (!oldPosition.equals(this.potatoImage.getCustomNetworkTransform().getPosition())) {
          this.owner.getLobby().sendRootGamePacket(new GameDataPacket([
            this.potatoImage.getCustomNetworkTransform().serializeData(),
          ], this.owner.getLobby().getCode()));
        }
      }
    });
  }
}
