const o = [
    /* {
  region: "na",
  zone: "sfo",
  url: "na-sfo-p1.surviv.io",
},
{
  region: "na",
  zone: "mia",
  url: "na-mia-p1.surviv.io",
},
{
  region: "na",
  zone: "nyc",
  url: "na-nyc-p1.surviv.io",
},
{
  region: "na",
  zone: "chi",
  url: "na-chi-p1.surviv.io",
},
{
  region: "sa",
  zone: "sao",
  url: "sa-sao-p1.surviv.io",
},
{
  region: "eu",
  zone: "fra",
  url: "eu-fra-p1.surviv.io",
},
{
  region: "eu",
  zone: "waw",
  url: "eu-waw-p1.surviv.io",
},
{
  region: "as",
  zone: "sgp",
  url: "as-sgp-p1.surviv.io",
},
{
  region: "as",
  zone: "nrt",
  url: "as-nrt-p1.surviv.io",
},
{
  region: "as",
  zone: "hkg",
  url: "as-hkg-p1.surviv.io",
},
{
  region: "kr",
  zone: "sel",
  url: "kr-sel-p1.surviv.io",
}, */
];
class PingTest {
    constructor() {
        this.ptcDataBuf = new ArrayBuffer(1);
        this.tests = o.map((e) => {
            return {
                region: e.region,
                zone: e.zone,
                url: e.url,
                ping: 9999,
                active: false,
                complete: false,
                ws: null,
                sendDelay: 0,
                sendTime: 0,
                sendCount: 0,
                recvCount: 0,
                recvCountMax: 6,
                retryCount: 0,
                retryCountMax: 1
            };
        });
        this.testsStarted = 0;
        this.testsCompleted = 0;
        this.printSummary = true;
    }

    start(e) {
        if ("WebSocket" in window) {
            let t = 0;
            for (let r = 0; r < this.tests.length; r++) {
                const a = this.tests[r];
                if (
                    !a.active &&
                    !a.complete &&
                    e.indexOf(a.region) !== -1
                ) {
                    a.active = true;
                    this.testsStarted++;
                    t++;
                }
            }
            if (t > 0) {
                this.printSummary = true;
            }
        }
    }

    update(e) {
        const t = this;
        const r = function(e) {
            e.active = false;
            e.complete = true;
            t.testsCompleted++;
        };
        const a = function(e) {
            if (e.ws) {
                e.ws.close();
                e.ws = null;
            }
            if (!e.complete) {
                if (e.retryCount++ >= e.retryCountMax) {
                    r(e);
                }
            }
        };
        for (let i = 0; i < this.tests.length; i++) {
            const o = t.tests[i];
            if (!o.active) {
                return "continue";
            }
            if (!o.ws) {
                const s = new WebSocket(
                    `wss://${o.url}/ptc`
                );
                s.binaryType = "arraybuffer";
                s.onopen = function() { };
                s.onmessage = function(e) {
                    const t =
                        (Date.now() - o.sendTime) /
                        1000;
                    o.ping = Math.min(o.ping, t);
                    o.recvCount++;
                    o.sendDelay = 0.125;
                };
                s.onerror = function(e) {
                    a(o);
                };
                s.onclose = function() {
                    a(o);
                };
                o.ws = s;
                o.sendDelay = 0;
                o.sendCount = 0;
                o.recvCount = 0;
            }
            if (o.ws.readyState == o.ws.OPEN) {
                o.sendDelay -= e;
                if (
                    o.sendCount == o.recvCount &&
                    o.sendDelay < 0
                ) {
                    o.sendTime = Date.now();
                    o.sendCount++;
                    try {
                        o.ws.send(t.ptcDataBuf);
                    } catch (e) {
                        o.ws.close();
                    }
                }
                if (o.recvCount >= o.recvCountMax) {
                    r(o);
                    o.ws.close();
                }
            }
        }
        if (this.printSummary && this.isComplete()) {
            const o = this.tests.sort((e, t) => {
                return e.ping - t.ping;
            });
            console.log("Ping test results");
            console.log(
                "----------------------------------------"
            );
            for (let i = 0; i < o.length; i++) {
                const s = o[i];
                console.log(
                    "region",
                    s.region,
                    "zone  ",
                    s.zone,
                    "ping  ",
                    s.ping
                );
            }
            this.printSummary = false;
        }
    }

    isComplete() {
        return (
            this.testsCompleted == this.testsStarted &&
            this.testsStarted > 0
        );
    }

    getRegionList() {
        const e = [];
        for (let t = 0; t < o.length; t++) {
            const r = o[t].region;
            if (!e.includes(r)) {
                e.push(r);
            }
        }
        return e;
    }

    getRegion() {
        this.tests.sort((e, t) => {
            return e.ping - t.ping;
        });
        return this.tests[0].region;
    }

    getZones(region) {
        const sorted = this.tests.sort((a, b) => a.ping - b.ping);
        const zones = [];
        for (let i = 0; i < sorted.length; i++) {
            const s = sorted[i];
            if (s.region == region) {
                zones.push(s.zone);
            }
        }
        return zones;
    }
}
export default PingTest;
