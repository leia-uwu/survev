import $ from "jquery";

class FireBaseManager {
    constructor() {
        this.requests = 0;
        this.enabled = true;
        this.throttle = false;
        this.throttleTimeout = 0;
        this.errorLogCount = 0;
        this.appErrorLogCount = 0;
    }
    update() {
        const e = new Date().getTime();
        if (this.throttle) {
            if (e > this.throttleTimeout) {
                this.throttle = false;
                this.requests = 0;
            }
        } else {
            this.requests = Math.max(this.requests - 1, 0);
        }
    }
    sample() {
        return Math.random() <= 0.01;
    }
    store(e, t) {
        /* if (this.enabled) {
  if (++this.requests > 5)
      return (
          (this.throttleTimeout =
              new Date().getTime() +
              18e4),
          void (this.throttle = !0)
      );
  var r =
      "https://us-central1-surviv-fa40f.cloudfunctions.net/" +
      e;
  (t.key =
      "AIzaSyCrPuZeAQ2-aXZdTwZNwQJdv4rvsTE-2i8"),
      o.ajax({
          type: "POST",
          dataType: "html",
          url: r,
          data: t,
          timeout: 1e4,
      });
} */
    }
    storeGeneric(e, t) {
        if (this.sample()) {
            this.store("storeGeneric", {
                parent: e,
                child: t
            });
        }
    }
    logWindowOnError(e) {
        if (this.errorLogCount < 2) {
            this.store("windowOnError", {
                error: e
            });
            this.errorLogCount++;
        }
    }
    logWindowOnAppError(e) {
        if (this.appErrorLogCount < 2) {
            this.store("windowOnAppError", {
                error: e
            });
            this.appErrorLogCount++;
        }
    }
    logError(e) {
        this.store("errorLog", {
            error: e
        });
    }
    logTest(e) {
        this.store("testLog", {
            error: e
        });
    }
    logProxy(e) {
        this.store("onProxy", {
            data: e
        });
    }
}

const firebaseManager = new FireBaseManager();
setInterval(() => {
    firebaseManager.update();
}, 1000);

export default firebaseManager;

