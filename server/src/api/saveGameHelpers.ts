import Database from "better-sqlite3";
import { Config, type Region } from "../config";
import type { Game } from "../game/game";
import type { Player } from "../game/objects/player";
import { type MapDef, MapDefs } from "./../../../shared/defs/mapDefs";
import { db } from "./db";
import { type MatchDataTable, matchDataTable } from "./db/schema";
import { invalidateLeaderboards } from "./routes/stats/leaderboard";
import { invalidateUserStatsCache } from "./routes/stats/user_stats";

export async function saveGameInfoToDatabase(game: Game, players: Player[]) {
    const values: Omit<MatchDataTable, "slug" | "createdAt">[] = [];
    // * NOTE: find a better way to get the player rank. @leia HELP!!!!!!!
    // !! TODO: for duos and squads rank needs to be the teamRank.
    const sortedPlayers = [...players].sort((a, b) => b.timeAlive - a.timeAlive);
    const mapId = (MapDefs[game.mapName as keyof typeof MapDefs] as MapDef).mapId;

    await invalidateLeaderboards(sortedPlayers, mapId, game.teamMode);

    for (let i = 0; i < sortedPlayers.length; i++) {
        const player = sortedPlayers[i];

        if (player.authId) {
            invalidateUserStatsCache(player.authId, mapId.toString());
        }

        // deciding the rank based on the time alive; probably not ideal;
        const rank = i + 1;
        /**
         * teamTotal is for total teams that started the match, i hope?
         */
        const teamTotal = new Set(sortedPlayers.map((player) => player.teamId)).size;
        const matchData = {
            // *NOTE: userId is optional; we save the game stats for non logged users too
            userId: player.authId,
            region: Config.thisRegion as Region,
            username: player.name,
            playerId: player.__id,
            teamMode: game.teamMode,
            teamCount: player.group?.totalCount ?? 1,
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

    if (!values.length) return;
    try {
        await db.insert(matchDataTable).values(values);
        console.log("Data inserted successfully");
    } catch (err) {
        console.error(`Failed to save game data for game ID ${game.id}, saving locally instead`, err);
        saveGameDataToLocalDB(values);
    }
}

// we dump the game  to a local db if we failed to save;
const sqliteDb = new Database("lost_game_data.db");

sqliteDb
    .prepare(`
    CREATE TABLE IF NOT EXISTS lost_game_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`)
    .run();
function saveGameDataToLocalDB(values: unknown[]) {
    sqliteDb
    .prepare("INSERT INTO lost_game_data (data) VALUES (?)")
    .run(JSON.stringify(values));
}