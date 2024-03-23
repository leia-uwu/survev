import { device } from "./device";

export const api = {
    resolveUrl: function(e) {
        return e;
    },
    resolveRoomHost: function() {
        return window.location.hostname;
    }
};
