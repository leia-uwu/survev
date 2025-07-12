import {
    ApplicationCommandOptionType,
    type ChatInputCommandInteraction,
    type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import {
    zBanAccountParams,
    zBanIpParams,
    zSetAccountNameParams,
    zSetMatchDataNameParams,
    zUnbanAccountParams,
    zUnbanIpParams,
} from "../../../server/src/api/routes/private/ModerationRouter";
import { Command } from "../utils";
import { createCommand, createSlashCommand, genericExecute } from "./helpers";
import { searchPlayersHandler } from "./search-player";

/**
 * for generic commands that only makes an api call and return it's meessage
 */
const commands = {
    [Command.BanIp]: createCommand({
        name: Command.BanIp,
        description: "ban an IP",
        optionValidator: zBanIpParams,
        options: [
            {
                name: "ip",
                description: "The IP to ban",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "ban_reason",
                description: "The reason for the ban",
                required: false,
                type: ApplicationCommandOptionType.String,
            },
        ],
    }),
    [Command.BanAccount]: createCommand({
        name: Command.BanAccount,
        description: "ban an account",
        optionValidator: zBanAccountParams,
        options: [
            {
                name: "slug",
                description: "The account slug to ban",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "ban_reason",
                description: "The reason for the ban",
                required: false,
                type: ApplicationCommandOptionType.String,
            },
        ],
    }),
    [Command.UnbanAccount]: createCommand({
        name: Command.UnbanAccount,
        description: "unban an account",
        optionValidator: zUnbanAccountParams,
        options: [
            {
                name: "slug",
                description: "The account slug to unban",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    }),
    [Command.UnbanIp]: createCommand({
        name: Command.UnbanIp,
        description: "unban an ip",
        optionValidator: zUnbanIpParams,
        options: [
            {
                name: "ip",
                description: "The ip to unban",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    }),
    [Command.SetMatchDataName]: createCommand({
        name: Command.SetMatchDataName,
        description:
            "update the name of a player in a game, useful for purging bad names from leaderboards",
        optionValidator: zSetMatchDataNameParams,
        options: [
            {
                name: "current_name",
                description: "The current name of the player",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "new_name",
                description: "The new name of the player",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    }),
    [Command.SetAccountName]: createCommand({
        name: Command.SetAccountName,
        description: "update the username of an account",
        optionValidator: zSetAccountNameParams,
        options: [
            {
                name: "new_name",
                description: "The new name of the account",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "current_slug",
                description: "The current slug of the account",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    }),
};

export type CommandHandlers = {
    [key in Command]: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commandHandlers: CommandHandlers = (
    Object.keys(commands) as Array<keyof typeof commands>
).reduce(
    (obj, key) => {
        obj[key] = (interaction) =>
            genericExecute(key, interaction, commands[key].optionValidator);
        return obj;
    },
    {
        // add non generic commands here
        [Command.SearchPlayer]: searchPlayersHandler.execute,
    } as CommandHandlers,
);

export const commandsToRegister: SlashCommandOptionsOnlyBuilder[] = [
    ...Object.values(commands).map(createSlashCommand),
    // add non generic commands here
    searchPlayersHandler.command,
];
