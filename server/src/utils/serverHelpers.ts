import { isIP } from "net";
import type { Context } from "hono";
import ProxyCheck, { type IPAddressInfo } from "proxycheck-ts";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";
import { Constants } from "../../../shared/net/net";
import { Config } from "../config";

/**
 * Apply CORS headers to a response.
 * @param res The response sent by the server.
 */
export function cors(res: HttpResponse): void {
    if (res.aborted) return;
    res.writeHeader("Access-Control-Allow-Origin", "*")
        .writeHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        .writeHeader(
            "Access-Control-Allow-Headers",
            "origin, content-type, accept, x-requested-with",
        )
        .writeHeader("Access-Control-Max-Age", "3600");
}

export function getHonoIp(c: Context, proxyHeader?: string): string | undefined {
    const ip = proxyHeader
        ? c.req.header(proxyHeader)
        : c.env?.incoming?.socket?.remoteAddress;

    if (!ip || isIP(ip) == 0) return undefined;
    return ip;
}

export function forbidden(res: HttpResponse): void {
    res.writeStatus("403 Forbidden").end("403 Forbidden");
}

export function returnJson(res: HttpResponse, data: Record<string, unknown>): void {
    res.cork(() => {
        if (res.aborted) return;
        res.writeHeader("Content-Type", "application/json").end(JSON.stringify(data));
    });
}

/**
 * Read the body of a POST request.
 * @link https://github.com/uNetworking/uWebSockets.js/blob/master/examples/JsonPost.js
 * @param res The response from the client.
 * @param cb A callback containing the request body.
 * @param err A callback invoked whenever the request cannot be retrieved.
 */
export function readPostedJSON<T>(
    res: HttpResponse,
    cb: (json: T) => void,
    err: () => void,
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
                } catch (_e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            } else {
                try {
                    // @ts-expect-error JSON.parse can accept a Buffer as an argument
                    json = JSON.parse(chunk);
                } catch (_e) {
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

// credits: https://github.com/Blank-Cheque/Slurs
const badWordsFilter = [
    /(s[a4]nd)?n[ila4o10íĩî|!][gq]{1,2}(l[e3]t|[e3]r|[a4]|n[o0]g)?s?/i,
    /f[a@4](g{1,2}|qq)([e3i1líĩî|!o0]t{1,2}(ry|r[i1líĩî|!]e)?)?/i,
    /k[il1y]k[e3](ry|rie)?s?/i,
    /tr[a4]n{1,2}([i1líĩî|!][e3]|y|[e3]r)s?/i,
    /c[o0]{2}ns?/i,
    /ch[i1líĩî|!]nks?/i,
];

export function checkForBadWords(name: string) {
    const santized = name.replace(/[^a-zA-Z0-9|$|@]|\^/g, "");

    for (const regex of badWordsFilter) {
        if (name.match(regex) || santized.match(regex)) {
            return true;
        }
    }
    return false;
}

export function validateUserName(name: string) {
    if (!name || typeof name !== "string") return "Player";

    name = name
        .trim()
        .substring(0, Constants.PlayerNameMaxLen)
        // remove extended ascii etc
        .replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, "");

    if (!name.length || checkForBadWords(name)) return "Player";

    return name;
}

const textDecoder = new TextDecoder();

/**
 * Get an IP from an uWebsockets HTTP response
 */
export function getIp(res: HttpResponse, req: HttpRequest, proxyHeader?: string) {
    const ip = proxyHeader
        ? req.getHeader(proxyHeader)
        : textDecoder.decode(res.getRemoteAddressAsText());

    if (!ip || isIP(ip) == 0) return undefined;
    return ip;
}

// modified version of https://github.com/uNetworking/uWebSockets.js/blob/master/examples/RateLimit.js
// also wraps simultaneous connections rate limit not just messages
export class WebSocketRateLimit {
    // for messages rate limit
    private _last = Symbol();
    private _count = Symbol();

    private _now = 0;
    private limit: number;

    // for simultaneous connections rate limit
    private _IPsData = new Map<
        string,
        {
            connections: number;
        }
    >();
    readonly maxConnections: number;

    constructor(limit: number, interval: number, maxConnections: number) {
        this.limit = limit;
        this.maxConnections = maxConnections;

        setInterval(() => ++this._now, interval);

        // clear ips every hour to not leak memory ig
        // probably not an issue but why not /shrug
        setInterval(
            () => {
                this._IPsData.clear();
            },
            1000 * 60 * 60,
        );
    }

    /**
     * Returns true if a websocket is being rate limited by sending too many messages
     */
    isRateLimited(wsData: Record<symbol, number>) {
        if (!Config.rateLimitsEnabled) return false;
        if (wsData[this._last] != this._now) {
            wsData[this._last] = this._now;
            wsData[this._count] = 1;
        } else {
            return ++wsData[this._count] > this.limit;
        }
    }

    /**
     * returns true if the IP has exceeded the max simultaneous connections
     * false otherwise
     */
    isIpRateLimited(ip: string): boolean {
        let data = this._IPsData.get(ip);
        if (!data) {
            data = {
                connections: 0,
            };
            this._IPsData.set(ip, data);
        }
        if (!Config.rateLimitsEnabled) return false;

        if (data.connections + 1 > this.maxConnections) {
            return true;
        }
        return false;
    }

    ipConnected(ip: string) {
        let data = this._IPsData.get(ip);
        if (!data) {
            data = {
                connections: 0,
            };
            this._IPsData.set(ip, data);
        }
        data.connections++;
    }

    ipDisconnected(ip: string) {
        const data = this._IPsData.get(ip);
        if (!data) return;
        data.connections--;
    }
}

export class HTTPRateLimit {
    private _IPsData = new Map<
        string,
        {
            last: number;
            count: number;
        }
    >();

    private _now = 0;

    limit: number;

    constructor(limit: number, interval: number) {
        this.limit = limit;
        setInterval(() => ++this._now, interval);

        // clear ips every hour to not leak memory ig
        // probably not an issue but why not /shrug
        setInterval(
            () => {
                this._IPsData.clear();
            },
            1000 * 60 * 60,
        );
    }

    /**
     * Checks if an IP is rate limited
     */
    isRateLimited(ip: string) {
        if (!Config.rateLimitsEnabled) return false;
        let ipData = this._IPsData.get(ip);
        if (!ipData) {
            ipData = { last: this._now, count: 0 };
            this._IPsData.set(ip, ipData);
        }

        if (ipData.last != this._now) {
            ipData.last = this._now;
            ipData.count = 1;
        } else {
            return ++ipData.count > this.limit;
        }
    }
}

const proxyCheck = Config.PROXYCHECK_KEY
    ? new ProxyCheck({
          api_key: Config.PROXYCHECK_KEY,
      })
    : undefined;

const proxyCheckCache = new Map<
    string,
    {
        info: IPAddressInfo;
        expiresAt: number;
    }
>();

export async function isBehindProxy(ip: string): Promise<boolean> {
    if (!proxyCheck) return false;

    let info: IPAddressInfo | undefined = undefined;
    const cached = proxyCheckCache.get(ip);
    if (cached && cached.expiresAt > Date.now()) {
        info = cached.info;
    }
    if (!info) {
        try {
            const proxyRes = await proxyCheck.checkIP(ip);
            switch (proxyRes.status) {
                case "ok":
                case "warning":
                    info = proxyRes[ip];
                    if (proxyRes.status === "warning") {
                        console.warn(`ProxyCheck warning, res:`, proxyRes);
                    }
                    break;
                case "denied":
                case "error":
                    console.error(`Failed to check for ip ${ip}:`, proxyRes);
                    break;
            }
        } catch (error) {
            console.error(`Proxycheck error:`, error);
            return true;
        }
    }
    if (!info) {
        return true;
    }
    proxyCheckCache.set(ip, {
        info,
        expiresAt: Date.now() + 60 * 60 * 24, // a day
    });

    return info.proxy === "yes" || info.vpn === "yes";
}
