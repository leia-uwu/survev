import { z } from "zod";
import type { TeamMode } from "../gameConfig";

export const zFindGameBody = z.object({
    region: z.string(),
    zones: z.array(z.string()),
    version: z.number(),
    playerCount: z.number(),
    autoFill: z.boolean(),
    gameModeIdx: z.number(),
    turnstileToken: z.string().optional(),
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
    | "behind_proxy"
    | "invalid_captcha";

export type FindGameResponse =
    | {
          res: FindGameMatchData[];
          error?: undefined;

          banned?: undefined;
      }
    | {
          error: FindGameError;

          res?: undefined;
          banned?: undefined;
      }
    | {
          banned: true;
          reason: string;
          permanent: boolean;
          expiresIn: Date | string;

          res?: undefined;
          error?: undefined;
      };

export interface Info {
    country: string;
    gitRevision: string;
    captchaEnabled: boolean;
    modes: Array<{
        mapName: string;
        teamMode: TeamMode;
        enabled: boolean;
    }>;
    pops: Record<
        string,
        {
            playerCount: number;
            l10n: string;
        }
    >;
    youtube: {
        name: string;
        link: string;
    };
    twitch: Array<{
        name: string;
        viewers: number;
        url: string;
        img: string;
    }>;
}

export interface ProxyDef {
    apiUrl?: string;
    google?: boolean;
    discord?: boolean;
    mock?: boolean;
    all?: boolean;
}
