import { Hono } from "hono";
import { Config } from "../../../config";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { DiscordRouter } from "./auth/discord";
import { GoogleRouter } from "./auth/google";
import { MockRouter } from "./auth/mock";

export const AuthRouter = new Hono();

AuthRouter.use(accountsEnabledMiddleware);

AuthRouter.route("/discord", DiscordRouter);
AuthRouter.route("/google", GoogleRouter);

if (Config.debug.allowMockAccount) {
    AuthRouter.route("/mock", MockRouter);
}
