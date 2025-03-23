import { Hono } from "hono";
import { DiscordRouter } from "./auth/discord";
import { GoogleRouter } from "./auth/google";
import { MockRouter } from "./auth/mock";
import { accountsEnabledMiddleware } from "../../auth/middleware";

export const AuthRouter = new Hono();

AuthRouter.use(accountsEnabledMiddleware)

AuthRouter.route("/discord", DiscordRouter);
AuthRouter.route("/google", GoogleRouter);
AuthRouter.route("/mock", MockRouter);
