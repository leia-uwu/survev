import { Hono } from "hono";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { DiscordRouter } from "./auth/discord";
import { GoogleRouter } from "./auth/google";
import { MockRouter } from "./auth/mock";

export const AuthRouter = new Hono();

AuthRouter.use(accountsEnabledMiddleware);

AuthRouter.route("/discord", DiscordRouter);
AuthRouter.route("/google", GoogleRouter);
AuthRouter.route("/mock", MockRouter);
