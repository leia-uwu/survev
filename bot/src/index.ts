import { Client, Events, GatewayIntentBits } from "discord.js";
import { banAccountHandler, banIpHandler } from "./commands";
import { searchPlayersHandler } from "./commands/search-player";
import { DISCORD_BOT_TOKEN } from "./config";
import { Command, type CommandHandlers, hasPermission } from "./utils";

export const commandHandlers: CommandHandlers = {
    [Command.BanIp]: banIpHandler.execute,
    [Command.BanAccount]: banAccountHandler.execute,
    [Command.SearchPlayer]: searchPlayersHandler.execute,
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function setupInteractionHandlers() {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!hasPermission(interaction)) {
            if (interaction.isRepliable()) {
                await interaction.reply({
                    content: "You do not have permission to use this command",
                    ephemeral: true,
                });
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const commandName = interaction.commandName as Command;
        if (!commandHandlers[commandName]) {
            console.warn(`Unknown command: ${commandName}`);
            return;
        }
        try {
            await commandHandlers[commandName](interaction);
        } catch (error) {
            console.error(`Error executing command "${commandName}":`, error);
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    });
}

async function startBot() {
    try {
        client.once(Events.ClientReady, (readyClient) => {
            console.log(`Logged in as ${readyClient.user.tag}!`);
        });
        setupInteractionHandlers();
        await client.login(DISCORD_BOT_TOKEN);
    } catch (error) {
        console.error("Failed to start the bot:", error);
        process.exit(1);
    }
}
startBot();
