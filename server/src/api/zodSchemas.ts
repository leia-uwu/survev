import { z } from "zod";
import { Constants } from "../../../shared/net/net";
import { zValidator } from "@hono/zod-validator";

export const loadoutSchema = z.object({
    outfit: z.string(),
    melee: z.string(),
    heal: z.string(),
    boost: z.string(),
    player_icon: z.string(),
    crosshair: z.object({
        type: z.string(),
        color: z.number(),
        size: z.string(),
        stroke: z.string(),
    }),
    emotes: z.array(z.string()).length(6),
});

export type Loadout = z.infer<typeof loadoutSchema>;

export const usernameSchema = z.object({
    username: z.string().trim().min(1).max(Constants.PlayerNameMaxLen),
});

/**
 * middleware for validating JSON request parameters against a Zod schema.
*/
export function validateParams<Schema extends z.ZodSchema>(schema: Schema) {
    return zValidator("json", schema, (result, c) => {
        if (!result.success) {
            return c.json(
                {
                    message: "Invalid params",
                },
                400,
            );
        }
    });
}