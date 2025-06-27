import { REST, Routes } from "discord.js";
import { banAccountHandler, banIpHandler } from "./commands";
import { searchPlayersHandler } from "./commands/search-player";
import { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } from "./config";
async function run() {
    const commands = [
        banIpHandler.command,
        banAccountHandler.command,
        searchPlayersHandler.command,
    ];
    async function registerCommands() {
        const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);
        try {
            console.log("Started refreshing application (/) commands.");
            await rest.put(
                Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID!),
                {
                    body: commands.map((command) => command.toJSON()),
                },
            );
            console.log("Successfully reloaded application (/) commands.");
        } catch (error) {
            console.error("Failed to refresh application commands:", error);
        }
    }

    await registerCommands();
}

run();
