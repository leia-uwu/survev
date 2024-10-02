import { Hono } from "hono";
import { GithubRouter } from "./auth/github";
import { MockRouter } from "./auth/mock";
import { GoogleRouter } from "./auth/google";

export const AuthRouter = new Hono();

AuthRouter.route("/github", GithubRouter);
AuthRouter.route("/google", GoogleRouter);
AuthRouter.route("/mock", MockRouter);
