import { Hono } from "hono";
import { GithubRouter } from "./auth/github";
import { GoogleRouter } from "./auth/google";
import { MockRouter } from "./auth/mock";

export const AuthRouter = new Hono();

AuthRouter.route("/github", GithubRouter);
AuthRouter.route("/google", GoogleRouter);
AuthRouter.route("/mock", MockRouter);
