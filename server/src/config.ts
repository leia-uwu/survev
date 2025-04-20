import { getConfig } from "../../config";

const isProd = process.env["NODE_ENV"] === "production";
// to remove "server/dist" from the path to load the config from...
export const Config = getConfig(isProd, isProd ? "../../" : "");
