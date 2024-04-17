import { AbstractServer, type PlayerContainer } from "./abstractServer";
import { Config } from "./config";

class BunServer extends AbstractServer {
    constructor() {
        super();

        const This = this;

        Bun.serve<PlayerContainer>({
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
                    const res = new Response(JSON.stringify(This.getSiteInfo()));
                    res.headers.set("Content-Type", "application/json");
                    return res;
                }
                case "/api/user/profile": {
                    const res = new Response(JSON.stringify(This.getUserProfile()));
                    res.headers.set("Content-Type", "application/json");
                    return res;
                }
                case "/api/find_game": {
                    const body = await request.json();
                    const res = new Response(JSON.stringify(This.findGame(body.region)));
                    res.headers.set("Content-Type", "application/json");
                    return res;
                }
                case "/play": {
                    const gameID = This.getGameId(url.searchParams);
                    server.upgrade(request, {
                        data: {
                            gameID
                        }
                    });
                    break;
                }
                }
            },
            websocket: {
                idleTimeout: 30,
                open(ws) {
                    This.onOpen(ws);
                },
                message(ws, message) {
                    This.onMessage(ws, message as Buffer);
                },
                close(ws) {
                    This.onClose(ws);
                }
            }
        });

        this.init();

        setInterval(() => {
            this.tick();
        }, 1000 / Config.tps);
    }
}

new BunServer();
