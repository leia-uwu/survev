/**
 * @typedef {Object} ServerConfig
 * @property {string} region
 * @property {string} zone
 * @property {string} url
 */

/**
 * @type {ServerConfig[]}
 */
const testUrls = [
    {
        region: "na",
        zone: "sfo",
        url: "na-sfo-p1.example.com"
    }
];

export class PingTest {
    constructor() {
        this.ptcDataBuf = new ArrayBuffer(1);
        this.tests = testUrls.map((config) => {
            return {
                region: config.region,
                zone: config.zone,
                url: config.url,
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

    start(regions) {
        if ("WebSocket" in window) {
            let startCount = 0;
            for (let i = 0; i < this.tests.length; i++) {
                const test = this.tests[i];
                if (
                    !test.active &&
                    !test.complete &&
                    regions.indexOf(test.region) !== -1
                ) {
                    test.active = true;
                    this.testsStarted++;
                    startCount++;
                }
            }
            if (startCount > 0) {
                this.printSummary = true;
            }
        }
    }

    update(dt) {
        const completeTest = (test) => {
            test.active = false;
            test.complete = true;
            this.testsCompleted++;
        };

        const onClose = function(test) {
            if (test.ws) {
                test.ws.close();
                test.ws = null;
            }
            if (!test.complete) {
                if (test.retryCount++ >= test.retryCountMax) {
                    completeTest(test);
                }
            }
        };

        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            if (!test.active) {
                return "continue";
            }
            if (!test.ws) {
                const ws = new WebSocket(
                    `wss://${test.url}/ptc`
                );
                ws.binaryType = "arraybuffer";
                ws.onopen = function() { };
                ws.onmessage = function(msg) {
                    const elapsed =
                        (Date.now() - test.sendTime) /
                        1000;
                    test.ping = Math.min(test.ping, elapsed);
                    test.recvCount++;
                    test.sendDelay = 0.125;
                };
                ws.onerror = function(e) {
                    onClose(test);
                };
                ws.onclose = function() {
                    onClose(test);
                };
                test.ws = ws;
                test.sendDelay = 0;
                test.sendCount = 0;
                test.recvCount = 0;
            }
            if (test.ws.readyState == test.ws.OPEN) {
                test.sendDelay -= dt;
                if (
                    test.sendCount == test.recvCount &&
                    test.sendDelay < 0
                ) {
                    test.sendTime = Date.now();
                    test.sendCount++;
                    try {
                        test.ws.send(this.ptcDataBuf);
                    } catch (e) {
                        test.ws.close();
                    }
                }
                if (test.recvCount >= test.recvCountMax) {
                    completeTest(test);
                    test.ws.close();
                }
            }
        }
        if (this.printSummary && this.isComplete()) {
            const sorted = this.tests.sort((a, b) => {
                return a.ping - b.ping;
            });
            console.log("Ping test results");
            console.log(
                "----------------------------------------"
            );
            for (let i = 0; i < sorted.length; i++) {
                const test = sorted[i];
                console.log(
                    "region",
                    test.region,
                    "zone  ",
                    test.zone,
                    "ping  ",
                    test.ping
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
        const regions = [];
        for (let t = 0; t < testUrls.length; t++) {
            const region = testUrls[t].region;
            if (!regions.includes(region)) {
                regions.push(region);
            }
        }
        return regions;
    }

    getRegion() {
        this.tests.sort((a, b) => {
            return a.ping - b.ping;
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
