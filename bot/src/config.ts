import { getConfig } from "../../config";

const isProd = process.env["NODE_ENV"] === "production";
export const serverConfigPath = isProd ? "../../" : "";
export const Config = getConfig(isProd, serverConfigPath);

const API_URL = `http://${Config.apiServer.host}:${Config.apiServer.port}/private`;
const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = Config.secrets;
const DISCORD_ROLE_ID = Config.discordRoleId;
const DISCORD_GUILD_ID = Config.discordGuildId;

// sanitiy check
if (!DISCORD_CLIENT_ID || !DISCORD_BOT_TOKEN || !DISCORD_ROLE_ID || !DISCORD_GUILD_ID) {
    throw new Error("Bot config not set up properly");
}

export {
    API_URL,
    DISCORD_BOT_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_ROLE_ID,
    DISCORD_GUILD_ID,
};
