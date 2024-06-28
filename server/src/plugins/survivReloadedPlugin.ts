import { GunDefs } from "../../../shared/defs/gameObjects/gunDefs";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";
import { Events, Plugin } from "../PluginManager";

export class SurvivReloadedPlugin extends Plugin {
    protected override initListeners(): void {
        this.on(Events.Game_Created, data => {
            for (const gunData of Object.values(GunDefs)){
                gunData.switchDelay = 0.4;
            }
        })

        this.on(Events.Player_Kill, data => {
            if (data.source?.__type === ObjectType.Player){
                data.source.health += 20;
                data.source.boost += 25;
            }
        })
    }
}