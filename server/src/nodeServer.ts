import { Config } from "./config";

import {
    App,
    type HttpResponse,
    SSLApp,
    type WebSocket,
    type TemplatedApp
} from "uWebSockets.js";
import NanoTimer from "nanotimer";

import { URLSearchParams } from "node:url";
import { AbstractServer, type PlayerContainer, ServerSocket } from "./abstractServer";

/**
 * Apply CORS headers to a response.
 * @param res The response sent by the server.
 */
function cors(res: HttpResponse): void {
    res.writeHeader("Access-Control-Allow-Origin", "*")
        .writeHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        .writeHeader("Access-Control-Allow-Headers", "origin, content-type, accept, x-requested-with")
        .writeHeader("Access-Control-Max-Age", "3600");
}

function forbidden(res: HttpResponse): void {
    res.writeStatus("403 Forbidden").end("403 Forbidden");
}

/**
 * Read the body of a POST request.
 * @link https://github.com/uNetworking/uWebSockets.js/blob/master/examples/JsonPost.js
 * @param res The response from the client.
 * @param cb A callback containing the request body.
 * @param err A callback invoked whenever the request cannot be retrieved.
 */
function readPostedJSON<T>(
    res: HttpResponse,
    cb: (json: T) => void,
    err: () => void
): void {
    let buffer: Buffer | Uint8Array;
    /* Register data cb */
    res.onData((ab, isLast) => {
        const chunk = Buffer.from(ab);
        if (isLast) {
            let json: T;
            if (buffer) {
                try {
                    // @ts-expect-error JSON.parse can accept a Buffer as an argument
                    json = JSON.parse(Buffer.concat([buffer, chunk]));
                } catch (e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            } else {
                try {
                    // @ts-expect-error JSON.parse can accept a Buffer as an argument
                    json = JSON.parse(chunk);
                } catch (e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            }
        } else {
            if (buffer) {
                buffer = Buffer.concat([buffer, chunk]);
            } else {
                buffer = Buffer.concat([chunk]);
            }
        }
    });

    /* Register error cb */
    res.onAborted(err);
}

class UWSSocket extends ServerSocket {
    constructor(private readonly _socket: WebSocket<PlayerContainer>) {
        super();
    }

    send(message: ArrayBuffer): void {
        this._socket.send(message, true, false);
    }

    close(): void {
        this._socket.close();
    }

    get data() {
        return this._socket.getUserData();
    }
}

class UWSServer extends AbstractServer {
    app: TemplatedApp;

    uwsToSocket = new Map<WebSocket<PlayerContainer>, UWSSocket>();

    constructor() {
        super();
        const app = this.app = Config.ssl
            ? SSLApp({
                key_file_name: Config.ssl.keyFile,
                cert_file_name: Config.ssl.certFile
            })
            : App();

        app.get("/api/site_info", (res) => {
            let aborted = false;
            res.onAborted(() => { aborted = true; });
            cors(res);
            const data = this.getSiteInfo();
            if (!aborted) {
                res.cork(() => {
                    res.writeHeader("Content-Type", "application/json").end(JSON.stringify(data));
                });
            }
        });
        app.post("/api/user/profile", (res, _req) => {
            res.writeHeader("Content-Type", "application/json");
            res.end(JSON.stringify(this.getUserProfile()));
        });

        app.post("/api/find_game", async(res) => {
            readPostedJSON(res, (body: { region: string, zones: any[] }) => {
                const response = this.findGame(body.region);
                res.writeHeader("Content-Type", "application/json");
                res.end(JSON.stringify(response));
            }, () => {
                this.logger.warn("/api/find_game: Error retrieving body");
            });
        });
        app.post("/api/match_history", async(res) => {
            const matchHistory = Array.from({ length: 10}, (_, i) => ( {
                guid: "85d16fd3-be8f-913b-09ce-4ba5c86482aa",
                region: "na",
                map_id: 2,
                team_mode: 2,
                team_count: 1,
                team_total: 13,
                end_time: "2021-11-06T05:01:34.000Z",
                time_alive: 303,
                rank: 1,
                kills: 11,
                team_kills: 11,
                damage_dealt: 1264,
                damage_taken: 227
            }));
            res.writeHeader("Content-Type", "application/json");
            res.end(JSON.stringify(matchHistory));
        });

        app.post("/api/user_stats", async(res) => {
            res.writeHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
                slug: "olimpiq",
                username: "olimpiq",
                player_icon: "",
                banned: false,
                wins: 4994,
                kills: 92650,
                games: 9998,
                kpg: "9.3",
                modes: [
                    {
                        teamMode: 1,
                        games: 1190,
                        wins: 731,
                        kills: 10858,
                        winPct: "61.4",
                        mostKills: 25,
                        mostDamage: 2120,
                        kpg: "9.1",
                        avgDamage: 851,
                        avgTimeAlive: 258
                    },
                    {
                        teamMode: 2,
                        games: 2645,
                        wins: 1309,
                        kills: 21739,
                        winPct: "49.5",
                        mostKills: 24,
                        mostDamage: 2893,
                        kpg: "8.2",
                        avgDamage: 976,
                        avgTimeAlive: 233
                    },
                    {
                        teamMode: 4,
                        games: 6163,
                        wins: 2954,
                        kills: 60053,
                        winPct: "47.9",
                        mostKills: 30,
                        mostDamage: 4575,
                        kpg: "9.7",
                        avgDamage: 1373,
                        avgTimeAlive: 246
                    }
                ]
            }));
        });

        app.post("/api/leaderboard", async(res) => {
            res.writeHeader("Content-Type", "application/json");
            res.end(JSON.stringify(Array.from({ length: 100 }, (_, i) => ({
                    slug: "olimpiq",
                    username: "Olimpiq",
                    region: "eu",
                    games: 123,
                    val: 25,
                })))
            );
        });

        const This = this;

        app.ws("/play", {
            idleTimeout: 30,
            /**
            * Upgrade the connection to WebSocket.
            */
            upgrade(res, req, context) {
                /* eslint-disable-next-line @typescript-eslint/no-empty-function */
                res.onAborted((): void => { });

                const searchParams = new URLSearchParams(req.getQuery());
                const gameID = This.getGameId(searchParams);

                if (gameID !== false) {
                    res.upgrade(
                        {
                            gameID
                        },
                        req.getHeader("sec-websocket-key"),
                        req.getHeader("sec-websocket-protocol"),
                        req.getHeader("sec-websocket-extensions"),
                        context
                    );
                } else {
                    forbidden(res);
                }
            },

            /**
             * Handle opening of the socket.
             * @param socket The socket being opened.
             */
            open(s: WebSocket<PlayerContainer>) {
                const socket = new UWSSocket(s);
                This.uwsToSocket.set(s, socket);
                This.onOpen(socket);
            },

            /**
             * Handle messages coming from the socket.
             * @param socket The socket in question.
             * @param message The message to handle.
             */
            message(socket: WebSocket<PlayerContainer>, message) {
                This.onMessage(This.uwsToSocket.get(socket)!, message);
            },

            /**
             * Handle closing of the socket.
             * @param socket The socket being closed.
             */
            close(socket: WebSocket<PlayerContainer>) {
                This.onClose(This.uwsToSocket.get(socket)!);
            }

        });

        app.listen(Config.host, Config.port, (): void => {
            this.init();

            const timer = new NanoTimer();

            timer.setInterval(() => { this.tick(); }, "", `${1000 / Config.tps}m`);
        });
    }
}

new UWSServer();
