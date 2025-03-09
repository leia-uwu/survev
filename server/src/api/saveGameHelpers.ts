import { Config, type Region } from "../config";
import type { Game } from "../game/game";
import type { Player } from "../game/objects/player";
import { type MapDef, MapDefs } from "./../../../shared/defs/mapDefs";
import { db } from "./db";
import { type MatchDataTable, matchDataTable } from "./db/schema";

export async function saveGameInfoToDatabase(game: Game, players: Player[]) {
    const values: Omit<MatchDataTable, "slug" | "createdAt">[] = [];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        // !! TODO: handle disconnected players, players who leave too quickly
        if (player.disconnected) continue;
        const matchData = {
            // *NOTE: optional; we save the game stats for non logged users too
            userId: player.authId,
            region: Config.thisRegion as Region,
            username: player.name,
            playerId: player.__id,
            teamMode: game.teamMode,
            teamTotal: player.teamId,
            teamId: player.teamId,
            timeAlive: player.timeAlive,
            died: player.dead,
            kills: player.kills,
            damageDealt: player.damageDealt,
            damageTaken: player.damageTaken,
            killerId: player.killedBy?.__id || 0,
            gameId: game.id,
            mapId: (MapDefs[game.mapName as keyof typeof MapDefs] as MapDef).mapId,
            killedIds: player.killedIds,
            // TODO: figure out this
            rank: game.aliveCount,
        };
        values.push(matchData);
    }

    try {
        if (values.length) await db.insert(matchDataTable).values(values);
    } catch (err) {
        console.log("WE LOST GAME DATA, INVESTIGATE", { err });
        console.error(err);
    }
}
