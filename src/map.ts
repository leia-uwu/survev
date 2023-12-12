import { MapObjectDefs } from "./defs/mapObjectDefs";
import { ModeDefinitions } from "./defs/modes/modes";
import { type Game } from "./game";
import { MapMsg } from "./net/mapMsg";
import { MsgStream, MsgType } from "./net/net";
import { Obstacle } from "./objects/obstacle";
import { util } from "./utils/util";
import { v2 } from "./utils/v2";

export class GameMap {
    game: Game;

    width: number;
    height: number;

    msg = new MapMsg();
    mapStream = new MsgStream(new ArrayBuffer(65536));
    seed = util.randomInt(0, 2 ** 31);

    constructor(game: Game) {
        this.game = game;

        const modeDef = ModeDefinitions[game.config.mode];
        if (modeDef === undefined) {
            throw new Error(`Invalid map name: ${game.config.mode}`);
        }
        const mapDef = modeDef.mapGen.map;
        this.width = (mapDef.baseWidth * mapDef.scale.small) + mapDef.extension;
        this.height = (mapDef.baseHeight * mapDef.scale.small) + mapDef.extension;

        this.msg.mapName = game.config.mode;
        this.msg.seed = this.seed;
        this.msg.width = this.width;
        this.msg.height = this.height;
        this.msg.grassInset = mapDef.grassInset;
        this.msg.shoreInset = mapDef.shoreInset;

        for (const densitySpawns of modeDef.mapGen.densitySpawns) {
            for (const type in densitySpawns) {
                const count = densitySpawns[type];

                const def = MapObjectDefs[type];
                if (def.type !== "obstacle") continue;

                for (let i = 0; i < count; i++) {
                    const obstacle = new Obstacle(
                        this.game,
                        v2.create(
                            util.random(mapDef.shoreInset, this.width - mapDef.shoreInset),
                            util.random(mapDef.shoreInset, this.height - mapDef.shoreInset)
                        ),
                        type,
                        0
                    );
                    this.game.grid.addObject(obstacle);
                    this.msg.objects.push(obstacle);
                }
            }
        }

        this.mapStream.serializeMsg(MsgType.Map, this.msg);
    }
}
