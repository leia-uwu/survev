import {
    ApplicationCommandOptionType,
    type ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";
import type z from "zod";
import { type Command, honoClient } from "../utils";

export function createCommand<T extends z.ZodSchema>(config: {
    name: Command;
    description: string;
    optionValidator: T;
    options: {
        name: keyof z.input<T>;
        description: string;
        required: boolean;
        type: ApplicationCommandOptionType.String | ApplicationCommandOptionType.Integer;
    }[];
}) {
    return config;
}

export async function genericExecute<N extends Exclude<Command, "search_player">>(
    name: N,
    interaction: ChatInputCommandInteraction,
    validator: z.ZodTypeAny,
) {
    const options = interaction.options.data.reduce(
        (obj, { name, value }) => {
            obj[name] = value;
            return obj;
        },
        {} as Record<string, unknown>,
    );

    const args = validator.safeParse({
        ...options,
        executorId: interaction.user.id,
    });

    if (!args.success) {
        console.error("Failed to parse arguments", options, args.error);
        await interaction.reply({
            content: "Invalid arguments",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const res = await honoClient.moderation[name].$post({
        json: args.data as any,
    });

    const { message } = await res.json();
    await interaction.reply(message);
}

export function createSlashCommand(config: ReturnType<typeof createCommand>) {
    const builder = new SlashCommandBuilder()
        .setName(config.name)
        .setDescription(config.description);

    for (const option of config.options) {
        switch (option.type) {
            case ApplicationCommandOptionType.String:
                builder.addStringOption((stringOption) =>
                    stringOption
                        .setName(option.name as string)
                        .setDescription(option.description)
                        .setRequired(option.required),
                );
                break;
            case ApplicationCommandOptionType.Integer:
                builder.addIntegerOption((integerOption) =>
                    integerOption
                        .setName(option.name as string)
                        .setDescription(option.description)
                        .setRequired(option.required),
                );
                break;
            default:
                throw new Error(`Unsupported option type: ${option.type}, add it first.`);
        }
    }

    return builder;
}
