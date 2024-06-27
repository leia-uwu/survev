import { AbstractServer, type GameSocketData } from "./abstractServer";
import { Config } from "./config";

class BunServer extends AbstractServer {
    constructor() {
        super();

        const This = this;

        Bun.serve<GameSocketData>({
            port: Config.port,
            hostname: Config.host,
            tls: Config.ssl
                ? {
                    key: Bun.file(Config.ssl.keyFile),
                    cert: Bun.file(Config.ssl.certFile)
                }
                : undefined,

            async fetch(request, server) {
                const url = new URL(request.url);

                switch (url.pathname) {
                case "/api/site_info": {
                    return new Response(JSON.stringify(This.getSiteInfo()), {
                        headers: { "Content-Type": "application/json" }
                    });
                }
                case "/api/user/profile": {
                    return new Response(JSON.stringify(This.getUserProfile()), {
                        headers: { "Content-Type": "application/json" }
                    });
                }
                case "/api/find_game": {
                    try {
                        const body = await request.json();
                        return new Response(JSON.stringify(This.findGame(body)), {
                            headers: { "Content-Type": "application/json" }
                        });
                    } catch (error) {
                        This.logger.log("/api/find_game: Error: ");
                        console.error(error);
                        return new Response("Error finding game", {
                            status: 500
                        });
                    }
                }
                case "/play": {
                    const gameID = This.validateGameId(url.searchParams);
                    if (gameID !== false) {
                        const sucess = server.upgrade(request, {
                            data: {
                                gameID
                            }
                        });

                        if (sucess) return;
                        return new Response("Upgrade failed", { status: 500 });
                    } else {
                        return new Response("Error joining game", {
                            status: 500
                        });
                    }
                }
                }
            },
            websocket: {
                idleTimeout: 30,
                open(ws) {
                    ws.data.sendMsg = (data) => {
                        ws.sendBinary(data, false);
                    };
                    ws.data.closeSocket = () => {
                        ws.close();
                    };
                    This.onOpen(ws.data);
                },
                message(ws, message) {
                    This.onMessage(ws.data, message as Buffer);
                },
                close(ws) {
                    This.onClose(ws.data);
                }
            }
        });

        this.init();

        setInterval(() => {
            this.update();
        }, 1000 / Config.tps);
    }
}

new BunServer();
