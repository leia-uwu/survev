import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { commandHandlers } from "./commands";
import { DISCORD_BOT_TOKEN } from "./config";
import { type Command, hasPermission } from "./utils";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function setupInteractionHandlers() {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!hasPermission(interaction)) {
            if (interaction.isRepliable()) {
                await interaction.reply({
                    content: "You do not have permission to use this command",
                    flags: MessageFlags.Ephemeral,
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
                flags: MessageFlags.Ephemeral,
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
