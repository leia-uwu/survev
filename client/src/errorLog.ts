import $ from "jquery";

class ErrorLog {
    private requests = 0;
    private enabled = import.meta.env.PROD;
    private throttle = false;
    private throttleTimeout = 0;
    private errorLogCount = 0;

    update() {
        const time = new Date().getTime();
        if (this.throttle) {
            if (time > this.throttleTimeout) {
                this.throttle = false;
                this.requests = 0;
            }
        } else {
            this.requests = Math.max(this.requests - 1, 0);
        }
    }

    private sample() {
        return Math.random() <= 0.01;
    }

    private store(
        loc: string,
        data:
            | {
                  parent: string;
                  child: unknown;
              }
            | { error: string },
    ) {
        if (!this.enabled) return;

        this.requests++;

        if (this.requests > 5) {
            this.throttleTimeout = new Date().getTime() + 180 * 1000;
            this.throttle = true;
            return;
        }
        // TODO
        return;
        const url = `https://us-central1-survev.cloudfunctions.net/${loc}`;
        $.ajax({
            type: "POST",
            dataType: "html",
            url: url,
            data: data,
            timeout: 10 * 1000,
        });
    }

    storeGeneric(parent: string, child: unknown) {
        console.error(parent, child);
        if (this.sample()) {
            this.store("storeGeneric", {
                parent: parent,
                child: child,
            });
        }
    }

    logWindowOnError(error: string) {
        if (this.errorLogCount < 2) {
            this.store("windowOnError", { error });
            this.errorLogCount++;
        }
    }

    logError(error: string) {
        this.store("errorLog", { error });
    }
}

export const errorLogManager = new ErrorLog();
setInterval(() => {
    errorLogManager.update();
}, 1000);
