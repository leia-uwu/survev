import { REST, Routes } from "discord.js";
import { commandsToRegister } from "./commands";
import { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } from "./config";

async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);
    try {
        console.log("Started refreshing application (/) commands.");
        await rest.put(
            Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID!),
            {
                body: commandsToRegister.map((command) => command.toJSON()),
            },
        );
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error("Failed to refresh application commands:", error);
    }
}

await registerCommands();
