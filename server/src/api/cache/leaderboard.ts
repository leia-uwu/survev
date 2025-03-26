import { CACHE_TTL, getRedisClient } from ".";
import type {
    LeaderboardRequest,
    LeaderboardResponse,
} from "../../../../shared/types/stats";
import { math } from "../../../../shared/utils/math";
import { Config } from "../../config";
import type { MatchDataTable } from "../db/schema";

/**
 * WE KEEP TRACK OF THE LOWEST VALUE IN THE LEADERBOARD
 * SO WE ONLY INVALIDATE THE CACHE IF THE GAME WE ARE SAVING
 * REQUIRES TO RECACLULATE THE LEADERBOARD
 */
export async function shouldUpdateLeaderboard(
    lowestScoreCacheKey: string,
    maxGameValue: number,
): Promise<boolean> {
    if (!Config.cachingEnabled) return true;

    const client = await getRedisClient();
    const lowestLeaderboardValue = await client.get(lowestScoreCacheKey);

    if (!lowestLeaderboardValue || maxGameValue <= parseInt(lowestLeaderboardValue))
        return false;

    await client.setEx(lowestScoreCacheKey, CACHE_TTL, maxGameValue.toString());

    return true;
}

export function getLowestScoreCacheKey(params: LeaderboardRequest) {
    const { teamMode, mapId, type, interval } = params;
    return `leaderboard:lowest:${teamMode}:${mapId}:${type}:${interval}`;
}
export function getLeaderboardCacheKey(params: LeaderboardRequest) {
    const { teamMode, mapId, type, interval } = params;
    return `leaderboard:${teamMode}:${mapId}:${type}:${interval}`;
}
export async function setLeaderboardCache({
    cacheKey,
    data,
}: {
    cacheKey: string;
    data: LeaderboardResponse[];
}) {
    if (!Config.cachingEnabled) return;
    const client = await getRedisClient();
    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
}

export async function getLeaderboardCache(cacheKey: string) {
    if (!Config.cachingEnabled) return;

    const client = await getRedisClient();
    const data = await client.get(cacheKey);
    return data ? JSON.parse(data) : null;
}

export async function invalidateLeaderboardCache(cacheKey: string) {
    if (!Config.cachingEnabled) return false;
    const client = await getRedisClient();
    await client.del(cacheKey);
    return true;
}

export async function invalidateLeaderboards(matchData: MatchDataTable[]) {
    if (!Config.cachingEnabled) return;
    if (!matchData.length) return;

    const maxValues = matchData.reduce(
        (obj, player) => {
            obj.most_kills = math.max(obj.most_kills, player.kills);
            obj.most_damage_dealt = math.max(obj.most_damage_dealt, player.damageDealt);
            return obj;
        },
        {
            most_kills: 0,
            most_damage_dealt: 0,
        } as Record<LeaderboardRequest["type"], number>,
    );

    for (const [type, maxGameValue] of Object.entries(maxValues) as [
        LeaderboardRequest["type"],
        number,
    ][]) {
        for (const interval of ["daily", "weekly", "alltime"] as const) {
            const gameData: LeaderboardRequest = {
                type,
                teamMode: matchData[0].teamMode,
                mapId: matchData[0].mapId,
                interval,
            };
            const lowestScoreCacheKey = getLowestScoreCacheKey(gameData);
            const shouldInvalidateLeaderboardCache = await shouldUpdateLeaderboard(
                lowestScoreCacheKey,
                maxGameValue,
            );

            if (!shouldInvalidateLeaderboardCache) continue;

            const leaderboardCacheKey = getLeaderboardCacheKey(gameData);
            invalidateLeaderboardCache(leaderboardCacheKey);
        }
    }
}
