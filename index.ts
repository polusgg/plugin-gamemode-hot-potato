import { BaseMod } from "@polusgg/plugin-polusgg-api/src/baseMod/baseMod";
import { PluginMetadata } from "@nodepolus/framework/src/api/plugin";
import { LobbyInstance } from "@nodepolus/framework/src/api/lobby";
import { AssetBundle } from "@polusgg/plugin-polusgg-api/src/assets";
import { HotPotatoRole } from "./hotPotatoRole";
import { RoleAssignmentData } from "@polusgg/plugin-polusgg-api/src/services/roleManager/roleManagerService";

const pluginMetadata: PluginMetadata = {
  name: "Hot Potato",
  version: [1, 0, 0],
  authors: [
    {
      name: "Polus.gg",
      email: "contact@polus.gg",
      website: "https://polus.gg",
    },
    {
      name: "Rose Hall",
      email: "rose@polus.gg",
      website: "https://polus.gg",
    },
  ],
  description: "Hot potato plugin for polus.gg",
  website: "https://polus.gg",
};

export let assetBundle;

(async (): Promise<void> => {
  assetBundle = await AssetBundle.load("HotPotato");
})();

export default class HotPotato extends BaseMod {
  public assetBundle!: AssetBundle;
  protected lobbyManagers: Map<LobbyInstance, HotPotatoRole> = new Map();

  constructor() {
    super(pluginMetadata);
  }

  getRoles(lobby: LobbyInstance): RoleAssignmentData[] {
    return [
      {
        role: HotPotatoRole,
        playerCount: lobby.getOptions().getImpostorCount(),
      },
    ];
  }

  getEnabled(): boolean {
    return true;
  }
}
