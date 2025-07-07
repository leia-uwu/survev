import {
    type ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";
import { Command, honoClient } from "../utils";

export const banIpHandler = {
    command: new SlashCommandBuilder()
        .setName(Command.BanIp)
        .setDescription("ban an IP")
        .addStringOption((option) =>
            option.setName("ip").setDescription("The IP to ban").setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Reason for the ban")
                .setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString("ip")!;
        const reason = interaction.options.getString("reason") ?? undefined;
        const executorId = interaction.user.id;

        const res = await honoClient.moderation.ban_ip.$post({
            json: {
                ip,
                banReason: reason,
                executorId,
            },
        });

        if (!res.ok) {
            await interaction.reply("Failed to ban IP");
            return;
        }

        const { message } = await res.json();

        await interaction.reply(message);
    },
};

export const banAccountHandler = {
    command: new SlashCommandBuilder()
        .setName(Command.BanAccount)
        .setDescription("ban an account")
        .addStringOption((option) =>
            option
                .setName("slug")
                .setDescription("The account slug to ban")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Reason for the ban")
                .setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const slug = interaction.options.getString("slug")!;
        const reason = interaction.options.getString("reason") ?? undefined;
        const executorId = interaction.user.id;

        const res = await honoClient.moderation.ban_account.$post({
            json: {
                slug,
                banReason: reason,
                executorId,
            },
        });

        if (!res.ok) {
            await interaction.reply({
                content: "Failed to ban account",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const { message } = await res.json();
        await interaction.reply(message);
    },
};
