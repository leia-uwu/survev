import { Hono } from "hono";
import { GithubRouter } from "./auth/github";

export const AuthRouter = new Hono();

AuthRouter.route("/github", GithubRouter);
