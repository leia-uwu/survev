import { type ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import type { GuildMember } from "discord.js";
import type { Interaction } from "discord.js";
import { hc } from "hono/client";
import type { PrivateRouteApp } from "../../server/src/api/routes/private/private";
import { API_URL, Config, DISCORD_ROLE_ID } from "./config";

// we love enums
export const enum Command {
    BanIp = "ban_ip",
    BanAccount = "ban_account",
    SearchPlayer = "search_player",
}

export type CommandHandlers = {
    [key in Command]: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const honoClient = hc<PrivateRouteApp>(API_URL, {
    headers: {
        "survev-api-key": Config.secrets.SURVEV_API_KEY,
    },
});

export function hasPermission(interaction: Interaction): boolean {
    if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return true;
    }

    const member = interaction.member as GuildMember;

    if (member && "roles" in member) {
        return member.roles.cache.has(DISCORD_ROLE_ID);
    }

    return false;
}
