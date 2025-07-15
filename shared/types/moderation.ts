import { z } from "zod";

export const zGetPlayerIpParams = z.object({
    name: z.string(),
    useAccountSlug: z.boolean().default(false),
    gameId: z.string().optional(),
});
export const zBanIpParams = z.object({
    ip: z.string(),
    isEncoded: z.boolean().default(false),
    permanent: z.boolean().default(false),
    banAssociatedAccount: z.boolean().default(true),
    ipBanDuration: z.number().default(7),
    ban_reason: z.string().default("Cheating"),
    executorId: z.string().default("admin"),
});

export const zBanAccountParams = z.object({
    slug: z.string(),
    ban_reason: z.string().default("Cheating"),
    executorId: z.string().default("admin"),
    banAssociatedIps: z.boolean().default(true),
    ipBanDuration: z.number().default(7),
    ipBanPermanent: z.boolean().default(false),
});

export const zUnbanIpParams = z.object({
    ip: z.string(),
    isEncoded: z.boolean().default(true),
});

export const zUnbanAccountParams = z.object({
    slug: z.string(),
});

export const zSetMatchDataNameParams = z.object({
    current_name: z.string(),
    new_name: z.string(),
});

export const zSetAccountNameParams = z.object({
    new_name: z.string(),
    current_slug: z.string(),
});
