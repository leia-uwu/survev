import { Config } from "./config";
import { URLSearchParams, parse } from "node:url";
import { AbstractServer, type PlayerContainer, ServerSocket } from "./abstractServer";
import type WebSocket from "ws";
import { WebSocketServer } from "ws";
import { createServer as CreateHTTPSServer } from "https";
import { createServer as CreateHTTPServer } from "http";
import { readFileSync } from "node:fs";

class WSSocket extends ServerSocket {
    constructor(
        private readonly _socket: WebSocket,
        private readonly _data: PlayerContainer
    ) {
        super();
    }

    send(message: ArrayBuffer): void {
        this._socket.send(message);
    }

    close(): void {
        this._socket.close();
    }

    getData() {
        return this._data;
    }
}

class WSServer extends AbstractServer {
    readonly app: WebSocketServer;

    socketToServerSocket = new Map<WebSocket, WSSocket>();

    constructor() {
        super();

        const server = Config.ssl
            ? CreateHTTPSServer({
                cert: readFileSync(Config.ssl.certFile),
                key: readFileSync(Config.ssl.keyFile)
            })
            : CreateHTTPServer();

        this.app = new WebSocketServer({ noServer: true });

        server.listen(Config.port, Config.host, () => {
            this.init();
        });

        this.app.on("connection", (s) => {
            const socket = this.socketToServerSocket.get(s)!;

            this.onOpen(socket);

            s.on("message", (message: ArrayBuffer) => {
                this.onMessage(socket, message);
            });

            s.on("close", () => {
                this.onClose(socket);
            });
        });

        server.on("upgrade", (request, socket, head) => {
            const { pathname } = parse(request.url ?? "");

            if (pathname === "/play") {
                this.app.handleUpgrade(request, socket, head, (s) => {
                    s.binaryType = "arraybuffer";

                    const gameID = this.onUpgrade(new URLSearchParams(request.url));

                    if (gameID !== false) {
                        const socket = new WSSocket(s, {
                            gameID
                        });

                        this.socketToServerSocket.set(s, socket);
                        this.app.emit("connection", s, request);
                    }
                });
            }
        });

        server.on("request", (request, response) => {
            const { pathname } = parse(request.url ?? "");

            switch (pathname) {
            case "/api/site_info": {
                response.writeHead(200, {
                    "Content-Type": "application/json"
                });
                response.end(JSON.stringify(this.getSiteInfo()));
                break;
            }
            case "/api/user/profile": {
                response.writeHead(200, {
                    "Content-Type": "application/json"
                });
                response.end(JSON.stringify(this.getUserProfile()));
                break;
            }
            case "/api/find_game": {
                let data = "";
                request.on("data", (chunck) => {
                    data += chunck;
                });
                request.on("end", () => {
                    const body = JSON.parse(data);
                    response.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    response.end(JSON.stringify(this.findGame(body.region)));
                });
            }
            }
        });
    }
}

new WSServer();
