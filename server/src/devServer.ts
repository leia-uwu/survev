import { App, SSLApp } from "uWebSockets.js";
import { version } from "../../package.json";
import { util } from "../../shared/utils/util";
import { ApiServer } from "./apiServer";
import { Config } from "./config";
import { type FindGameBody, GameServer } from "./gameServer";
import { GIT_VERSION } from "./utils/gitRevision";
import { Logger } from "./utils/logger";
import { readPostedJSON, returnJson } from "./utils/serverHelpers";

util.mergeDeep(Config, {
    regions: {
        local: {
            https: false,
            address: `${Config.devServer.host}:${Config.devServer.port}`,
            l10n: "index-local",
        },
    },
});

const logger = new Logger("Dev server");
const gameServer = new GameServer();
const apiServer = new ApiServer();

const app = Config.devServer.ssl
    ? SSLApp({
          key_file_name: Config.devServer.ssl.keyFile,
          cert_file_name: Config.devServer.ssl.certFile,
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
        },
    );
});

setInterval(() => {
    apiServer.updateRegion(gameServer.regionId, {
        playerCount: gameServer.manager.getPlayerCount(),
    });
}, 10 * 1000);

apiServer.init(app);

app.listen(Config.devServer.host, Config.devServer.port, (): void => {
    logger.log(`Survev Dev Server v${version} - GIT ${GIT_VERSION}`);
    logger.log(`Listening on ${Config.devServer.host}:${Config.devServer.port}`);
    logger.log("Press Ctrl+C to exit.");
    gameServer.init(app);
});
