function facebookLogin(e) {
    facebookConnectPlugin.login(
        ["public_profile"],
        (t) => {
            e(null, t);
        },
        (t) => {
            e(t);
        }
    );
}
function googleLogin(e) {
    window.plugins.googleplus.login(
        {},
        (t) => {
            e(null, t);
        },
        (t) => {
            e(t);
        }
    );
}
function getSystemMemoryInfo(e) {
    window.chrome.system.memory.getInfo(e);
}
function promptAppRate(e) {
    AppRate.preferences = {
        useLanguage: "en",
        displayAppName: "surviv.io",
        usesUntilPrompt: 1,
        promptAgainForEachNewVersion: true,
        inAppReview: true,
        storeAppURL: {
            ios: "1401727934",
            android:
                "market://details?id=io.surviv.surviv_io_mobile"
        },
        customLocale: {
            title: "Enjoying surviv.io?",
            message:
                "Thanks for playing! It would be a huge help if you rated us. We appreciate your support!",
            cancelButtonLabel: "No Thanks",
            laterButtonLabel: "Remind Me Later",
            rateButtonLabel: "Rate surviv.io"
        },
        callbacks: {
            handleNegativeFeedback: function() {
                window.open("mailto:admin@surviv.io", "_system");
            },
            onRateDialogShow: function(e) { },
            onButtonClicked: function(t) {
                e(t);
            }
        }
    };
    AppRate.preferences.simpleMode = true;
    AppRate.promptForRating();
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
    facebookLogin,
    getSystemMemoryInfo,
    googleLogin,
    promptAppRate,
    hasNativeStorage,
    storageGetItem,
    storageSetItem
};
