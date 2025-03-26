import { z } from "zod";

export const zFindGameBody = z.object({
    region: z.string(),
    zones: z.array(z.string()),
    version: z.number(),
    playerCount: z.number(),
    autoFill: z.boolean(),
    gameModeIdx: z.number(),
});

export type FindGameBody = z.infer<typeof zFindGameBody>;

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
    | "rate_limited"
    | "banned"
    | "behind_proxy";

export type FindGameResponse =
    | {
          res: FindGameMatchData[];
      }
    | {
          err: FindGameError;
          res?: undefined;
      };
