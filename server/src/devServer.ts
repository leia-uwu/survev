import { App, SSLApp } from "uWebSockets.js";
import { version } from "../../package.json";
import { ApiServer } from "./apiServer";
import { Config } from "./config";
import { type FindGameBody, GameServer } from "./gameServer";
import { Logger } from "./utils/logger";
import { readPostedJSON, returnJson } from "./utils/serverHelpers";

const logger = new Logger("Dev server");
const gameServer = new GameServer();
const apiServer = new ApiServer();

const app = Config.devServer.ssl
    ? SSLApp({
          key_file_name: Config.devServer.ssl.keyFile,
          cert_file_name: Config.devServer.ssl.certFile
      })
    : App();

app.post("/api/find_game", async (res) => {
    readPostedJSON(
        res,
        async (body: FindGameBody) => {
            const data = await gameServer.findGame(body);
            res.cork(() => {
                returnJson(res, data);
            });
        },
        () => {
            logger.warn("/api/find_game: Error retrieving body");
            returnJson(res, {
                res: [
                    {
                        err: "Error retriving body"
                    }
                ]
            });
        }
    );
});

apiServer.init(app);

app.listen(Config.devServer.host, Config.devServer.port, (): void => {
    logger.log(`Resurviv Dev Server v${version}`);
    logger.log(`Listening on ${Config.devServer.host}:${Config.devServer.port}`);
    logger.log("Press Ctrl+C to exit.");
    gameServer.init(app);
});
