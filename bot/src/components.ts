import type { ButtonInteraction, Message } from "discord.js";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    MessageFlags,
    type RepliableInteraction,
    StringSelectMenuBuilder,
    type StringSelectMenuInteraction,
} from "discord.js";
import { BUTTON_PREFIXES, type SelectedPlayer } from "./commands/search-player";
import { honoClient } from "./utils";

const TIMEOUT_IN_SECONDS = 10;

export async function createDiscordDropdownUI(
    interaction: RepliableInteraction,
    matchingPlayers: SelectedPlayer[],
    searchName: string,
) {
    const originalUserId = interaction.user.id;
    const options = matchingPlayers.map((player, index) => {
        const slug = player.slug ? ` (slug: ${player.slug})` : "";

        return {
            label: `${player.region} - ${player.teamMode} - ${player.username} ${slug}`,
            description: `Played at: ${player.createdAt || "Unknown"}`,
            value: `ban_${index}`,
        };
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("player_ban_select")
        .setPlaceholder("Select a player to ban")
        .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Multiple Players Found")
        .setDescription(
            `Found ${matchingPlayers.length} players matching "${searchName}". Please select one to ban:`,
        )
        .setTimestamp();

    const response = await interaction.editReply({
        embeds: [embed],
        components: [row],
    });

    const collector = response.createMessageComponentCollector({
        filter: (i) => i.user.id === originalUserId,
        componentType: ComponentType.StringSelect,
        time: TIMEOUT_IN_SECONDS * 1000,
    });

    collector.on("collect", async (interaction: StringSelectMenuInteraction) => {
        await interaction.deferUpdate();
        const selectedValue = interaction.values[0];
        // fomrat: ban_<index>
        const playerIndex = parseInt(selectedValue.split("_")[1]);

        const selectedPlayer = matchingPlayers[playerIndex];

        await createDiscordPlayerInfoCardUI({
            interaction,
            selectedPlayer,
            playerIdx: playerIndex,
            originalUserId,
            matchingPlayers,
        });

        collector.stop("completed");
    });
    collector.on("ignore", onIgnore);
    collector.on("end", (_, reason) => onEnd(interaction, reason));
}

export async function createDiscordPlayerInfoCardUI({
    interaction,
    selectedPlayer,
    playerIdx,
    originalUserId,
    matchingPlayers,
}: {
    interaction: RepliableInteraction;
    selectedPlayer: SelectedPlayer;
    playerIdx: number;
    originalUserId: string;
    matchingPlayers: SelectedPlayer[];
}) {
    // is this jquery?
    const fields = [
        { name: "Player Name", value: selectedPlayer.username, inline: true },
        { name: "Team Mode", value: selectedPlayer.teamMode, inline: true },
        { name: "Map", value: selectedPlayer.mapId, inline: true },
        {
            name: "Region",
            value: `[${selectedPlayer.region.toUpperCase()}]`,
            inline: true,
        },
    ];

    if (selectedPlayer.slug) {
        fields.push({ name: "Slug", value: selectedPlayer.slug, inline: true });
    }
    if (selectedPlayer.linkedDiscord && selectedPlayer.authId) {
        fields.push({ name: "Discord ID", value: selectedPlayer.authId, inline: true });
    }

    if (
        selectedPlayer.findGameIp === undefined ||
        selectedPlayer.findGameIp === selectedPlayer.ip
    ) {
        fields.push({
            name: "IP Address (Find Game IP is the same)",
            value: selectedPlayer.ip,
            inline: false,
        });
    } else {
        fields.push(
            { name: "IP Address", value: selectedPlayer.ip, inline: false },
            { name: "Find Game IP", value: selectedPlayer.findGameIp, inline: false },
        );
    }

    fields.push({
        name: "Played at",
        value: selectedPlayer.createdAt
            ? new Date(selectedPlayer.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "Unknown",
        inline: false,
    });

    const embed = new EmbedBuilder()
        .setColor(0xff4500)
        .setTitle("Info")
        .addFields(fields)
        .setDescription("I'm a description, I should describe.")
        .setTimestamp()
        .setFooter({ text: "hammer time baby" });

    const banPlayerForCheating = new ButtonBuilder()
        .setCustomId(`${BUTTON_PREFIXES.BAN_FOR_CHEATING}${playerIdx}`)
        .setLabel("Ban For Cheating")
        .setStyle(ButtonStyle.Secondary);

    const banPlayerForBadName = new ButtonBuilder()
        .setCustomId(`${BUTTON_PREFIXES.BAN_FOR_BAD_NAME}${playerIdx}`)
        .setLabel("Ban For Bad Name")
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(banPlayerForCheating)
        .addComponents(banPlayerForBadName);

    const response = await interaction.editReply({
        embeds: [embed],
        components: [row],
    });

    const collector = response.createMessageComponentCollector({
        filter: (i) => i.user.id === originalUserId,
        componentType: ComponentType.Button,
        time: TIMEOUT_IN_SECONDS * 1000,
    });

    collector.on("collect", async (interaction: ButtonInteraction) => {
        await interaction.deferUpdate();

        const parts = interaction.customId.split("_");
        const playerIndex = parseInt(parts[parts.length - 1]);

        const selectedPlayer = matchingPlayers[playerIndex];
        const excutorId = interaction.user.id;

        const { ipBanDuration, banReason } = interaction.customId.startsWith(
            BUTTON_PREFIXES.BAN_FOR_CHEATING,
        )
            ? {
                  banReason: "Banned for cheating",
                  ipBanDuration: 30,
              }
            : {
                  banReason: "Banned for bad name",
                  ipBanDuration: 7,
              };

        let responseMessage: string;
        if (selectedPlayer.slug) {
            const res = await honoClient.moderation.ban_account.$post({
                json: {
                    slug: selectedPlayer.slug,
                    banReason,
                    ipBanDuration: ipBanDuration,
                    banAssociatedIps: true,
                    ipBanPermanent: false,
                    excutorId,
                },
            });
            if (!res.ok) {
                responseMessage = "Failed to ban account";
            } else {
                responseMessage = `Banned ${selectedPlayer.slug} account and all associated IPs for ${ipBanDuration} days.`;
            }
        } else {
            const res = await honoClient.moderation.ban_ip.$post({
                json: {
                    ip: selectedPlayer.ip,
                    ipBanDuration,
                    banReason,
                    excutorId,
                },
            });

            if (!res.ok) {
                responseMessage = "Failed to ban IP";
            } else {
                responseMessage = `Banned ${selectedPlayer.username}'s IP for ${ipBanDuration} days.`;
            }
        }

        await clearEmbedWithMessage(interaction, responseMessage);
        collector.stop("completed");
    });
    collector.on("ignore", onIgnore);
    collector.on("end", );
}

async function onIgnore(interaction: RepliableInteraction) {
    await interaction.followUp({
        content: "You are not the original creator. Please create a new command.",
        flags: MessageFlags.Ephemeral,
    });
}

async function onEnd(interaction: RepliableInteraction, reason: string) {
    if (reason === "time") {
        await interaction.editReply({
            content: "Timed out, please try again.",
            components: [],
            embeds: [],
        });
        return;
    }
}

export async function clearEmbedWithMessage(
    interaction: RepliableInteraction,
    content: string,
) {
    await interaction.editReply({
        content,
        components: [],
        embeds: [],
    });
}


function createCollector<T extends ButtonInteraction | StringSelectMenuInteraction>(
    response: Message,
    onCollect: (interaction: T) => Promise<void>,
    options: {
        originalUserId: string;
        componentType: ComponentType.Button | ComponentType.StringSelect;
    }
) {
    const collector = response.createMessageComponentCollector({
        filter: (i) => i.user.id === options.originalUserId,
        componentType: options.componentType,
        time: TIMEOUT_IN_SECONDS * 1000,
    });

    collector.on("collect", async (interaction: T) => {
        await onCollect(interaction);
        collector.stop("completed");
    });

    collector.on("ignore", async (interaction: RepliableInteraction) => {
        await interaction.followUp({
            content: "You are not the original creator. Please create a new command.",
            flags: MessageFlags.Ephemeral,
        });
    });

    collector.on("end", async (interaction: RepliableInteraction, reason) => {
        if (reason === "time") {
            await interaction.editReply({
                content: "Timed out, please try again.",
                components: [],
                embeds: [],
            });
            return;
        }
    });
}