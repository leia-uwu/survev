import { Hono } from "hono";
import { Config } from "../../../config";
import { databaseEnabledMiddleware } from "../../auth/middleware";
import { DiscordRouter } from "./auth/discord";
import { GoogleRouter } from "./auth/google";
import { MockRouter } from "./auth/mock";

export const AuthRouter = new Hono();

AuthRouter.use(databaseEnabledMiddleware);

AuthRouter.route("/discord", DiscordRouter);
AuthRouter.route("/google", GoogleRouter);

if (Config.debug.allowMockAccount) {
    AuthRouter.route("/mock", MockRouter);
}
