import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { InferResponseType } from "hono";
import { createDiscordDropdownUI } from "../components";
import { Command, honoClient } from "../utils";

export type SelectedPlayer = Extract<
    InferResponseType<typeof honoClient.moderation.get_player_ip.$post, 200>,
    any[]
>[number];

export const BUTTON_PREFIXES = {
    BAN_FOR_CHEATING: `search_player_ban_for_cheating_`,
    BAN_FOR_BAD_NAME: `search_player_ban_for_name_`,
} as const;

export const searchPlayersHandler = {
    command: new SlashCommandBuilder()
        .setName(Command.SearchPlayer)
        .setDescription("Search and ban a player by name")
        .addStringOption((option) =>
            option
                .setName("in-game-name")
                .setDescription("The name of the player to search for")
                .setRequired(true),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const searchName = interaction.options.getString("in-game-name")!;

        await interaction.deferReply();

        try {
            const res = await honoClient.moderation.get_player_ip.$post({
                json: {
                    name: searchName!,
                },
            });

            if (!res.ok) {
                await interaction.editReply({
                    content: "Failed to get player IP",
                });
                return;
            }

            const result = await res.json();

            // no player found, return message formatted by the api;
            if ("message" in result) {
                await interaction.editReply({
                    content: result.message,
                });
                return;
            }

            const matchingPlayers = result;

            await createDiscordDropdownUI(interaction, matchingPlayers, searchName);
        } catch (error) {
            console.error("Error in banplayer command:", error);
            await interaction.editReply({
                content: "An error occurred while searching for players.",
            });
        }
    },
};
