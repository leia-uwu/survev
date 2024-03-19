function getSystemMemoryInfo(e) {
    window.chrome.system.memory.getInfo(e);
}

function hasNativeStorage() {
    return window.NativeStorage !== undefined;
}
function storageGetItem(e, t) {
    NativeStorage.getItem(
        e,
        (e) => {
            t(null, e);
        },
        (e) => {
            t(e);
        }
    );
}
function storageSetItem(e, t, r) {
    NativeStorage.setItem(
        e,
        t,
        (e) => {
            r(null, e);
        },
        (e) => {
            r(e);
        }
    );
}
export default {
    getSystemMemoryInfo,
    hasNativeStorage,
    storageGetItem,
    storageSetItem
};
