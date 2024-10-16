import type { HttpResponse } from "uWebSockets.js";

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
    /(s[a4]nd)?n[ila4o10íĩî|!][gq]{1,2}(l[e3]t|[e3]r|[a4]|n[o0]g)?s?/,
    /f[a@4](g{1,2}|qq)([e3i1líĩî|!o0]t{1,2}(ry|r[i1líĩî|!]e)?)?/,
    /k[il1y]k[e3](ry|rie)?s?/,
    /tr[a4]n{1,2}([i1líĩî|!][e3]|y|[e3]r)s?/,
    /c[o0]{2}ns?/,
    /ch[i1líĩî|!]nks?/,
];

export function checkForBadWords(name: string) {
    name = name.toLowerCase();
    for (const regex of badWordsFilter) {
        if (name.match(regex)) return true;
    }
    return false;
}
