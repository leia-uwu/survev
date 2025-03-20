import Database from "better-sqlite3";
import { Config, type Region } from "../config";
import type { Game } from "../game/game";
import { type MapDef, MapDefs } from "./../../../shared/defs/mapDefs";
import { db } from "./db";
import { type MatchDataTable, matchDataTable } from "./db/schema";
import { invalidateLeaderboards } from "./routes/stats/leaderboard";
import { invalidateUserStatsCache } from "./routes/stats/user_stats";

// @leia HELP!!!!!!!
export async function saveGameInfoToDatabase(game: Game) {
    const players = [...game.playerBarn.allPlayers];
    const values: Omit<MatchDataTable, "slug" | "createdAt">[] = [];
    const mapId = (MapDefs[game.mapName as keyof typeof MapDefs] as MapDef).mapId;

    await invalidateLeaderboards(players, mapId, game.teamMode);

    // allPlayers has duplicates for some fucking reason :sob:
    const processedPlayers = new Set();

    for (let i = 0; i < players.length; i++) {
        const player = players[i];

        if (processedPlayers.has(player.__id)) continue;
        processedPlayers.add(player.__id);

        if (player.authId) {
            invalidateUserStatsCache(player.authId, mapId.toString());
        }
        /**
         * teamTotal is for total teams that started the match, i hope?
         */
        const teamTotal = new Set(players.map((player) => player.teamId)).size;
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
            timeAlive: Math.round(player.timeAlive),
            died: player.dead,
            kills: player.kills,
            damageDealt: Math.round(player.damageDealt),
            damageTaken: Math.round(player.damageTaken),
            killerId: player.killedBy?.__id || 0,
            gameId: game.id,
            mapId: mapId,
            mapSeed: game.map.seed,
            killedIds: player.killedIds,
            rank: player.rank,
        };
        values.push(matchData);
    }

    if (!values.length) return;
    
    try {
        await db.insert(matchDataTable).values(values);
        console.log(`Saved game data for ${game.id}`);
    } catch (err) {
        console.error(
            `Failed to save game data for ${game.id}, saving locally instead`,
            err,
        );
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
