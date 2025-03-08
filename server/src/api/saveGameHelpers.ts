import { Config, type Region } from "../config";
import type { Game } from "../game/game";
import type { Player } from "../game/objects/player";
import { type MapDef, MapDefs } from "./../../../shared/defs/mapDefs";
import { db } from "./db";
import { type MatchDataTable, matchDataTable } from "./db/schema";
import Database from 'better-sqlite3';

const sqliteDb = new Database('lost_data.db');

sqliteDb.prepare(`
    CREATE TABLE IF NOT EXISTS lost_game_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

export async function saveGameInfoToDatabase(game: Game, players: Player[]) {
    const values: Omit<MatchDataTable, "slug" | "createdAt">[] = [];

    // !! TODO: for duos and squads rank needs to be the teamRank.
    const sortedPlayers = [...players].sort((a, b) => b.timeAlive - a.timeAlive);
    const mapId = (MapDefs[game.mapName as keyof typeof MapDefs] as MapDef).mapId;
    for (let i = 0; i < sortedPlayers.length; i++) {
      // deciding the rank based on the time alive; probably not ideal;
      const rank = i + 1;
      const player = sortedPlayers[i];
        /**
        * The total number of teams that started the match, i hope?
        */
      const teamTotal = new Set(sortedPlayers.map((player) => player.teamId)).size;
        const matchData = {
            // *NOTE: userId is optional; we save the game stats for non logged users too
            userId: player.authId,
            region: Config.thisRegion as Region,
            username: player.name,
            playerId: player.__id,
            teamMode: game.teamMode,
            teamTotal: teamTotal,
            teamId: player.teamId,
            timeAlive: player.timeAlive,
            died: player.dead,
            kills: player.kills,
            damageDealt: player.damageDealt,
            damageTaken: player.damageTaken,
            killerId: player.killedBy?.__id || 0,
            gameId: game.id,
            mapId: mapId,
            killedIds: player.killedIds,
            rank: rank,
        };
        values.push(matchData);
    }

    try {
        console.log(values)
        if (values.length) return;
        await insertWithRetry(values)
    } catch (err) {
        // we dump the stats to a local db if we failed to save; 
        sqliteDb.prepare('INSERT INTO lost_game_data (data) VALUES (?)').run(JSON.stringify(values));
        console.log("WE LOST GAME DATA, INVESTIGATE", { err });
    }
}



async function insertWithRetry(values: MatchDataTable[], retries = 2, delay = 500) {
    for (let i = 0; i < retries; i++) {
        try {
            await db.insert(matchDataTable).values(values);
            console.log("Data inserted successfully");
            return;
        } catch (err) {
            console.error(`Attempt ${i + 1} failed:`, err);
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, delay * (i + 1)));
        }
    }
}