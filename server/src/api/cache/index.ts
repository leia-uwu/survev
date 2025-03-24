import { createClient } from "redis";
import { Config } from "../../config";

export const CACHE_TTL = 3 * 24 * 60 * 60;

type RedisClientType = ReturnType<typeof createClient>;

let redisClient: RedisClientType;

export async function getRedisClient() {
    if (redisClient || !Config.cachingEnabled) {
        return redisClient;
    }
    const cacheInstance = createClient();

    cacheInstance.on("connect", () => console.log("Connected to redis"));
    process.on("exit", () => cleanupRedis);

    await cacheInstance.connect();
    redisClient = cacheInstance;
    return cacheInstance;
}

export async function cleanupRedis() {
    if (redisClient) {
        await redisClient
            .disconnect()
            .catch((err) =>
                console.log(
                    `CacheStore - Error while disconnecting from redis: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`,
                ),
            );
    }
}
