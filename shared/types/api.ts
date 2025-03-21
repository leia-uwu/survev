import { z } from "zod";

export const zFindGameBody = z.object({
    region: z.string(),
    zones: z.array(z.string()),
    version: z.number(),
    playerCount: z.number(),
    autoFill: z.boolean(),
    gameModeIdx: z.number(),
});

export type FindGameBody = (typeof zFindGameBody)["_type"];

export interface FindGameMatchData {
    zone: string;
    gameId: string;
    useHttps: boolean;
    hosts: string[];
    addrs: string[];
    data: string;
}

export type FindGameError =
    | "full"
    | "invalid_protocol"
    | "join_game_failed"
    | "rate-limited"
    | "banned";

export type FindGameResponse =
    | {
          res: FindGameMatchData[];
      }
    | {
          err: FindGameError;
          res?: undefined;
      };
