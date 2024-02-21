import device from "./device";
export default {
    resolveUrl: function(e) {
        if (device.webview && device.version < "1.0.8") {
            return `${window.location.protocol}https://surviv.io/${e[0] == "/" ? e.substring(1) : e
            }`;
        } else {
            return e;
        }
    },
    resolveRoomHost: function() {
        let e = window.location.hostname;
        if (device.webview && device.version < "1.0.8") {
            e = "surviv.io";
        }
        return e;
    }
};
