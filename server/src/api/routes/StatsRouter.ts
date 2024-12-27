import { Hono } from "hono";
import { UserStatsRouter } from "./stats/userStats";

export const StatsRouter = new Hono();

StatsRouter.route("/user_stats", UserStatsRouter);
