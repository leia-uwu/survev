function a(e) {
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
function i(e) {
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
function o(e) {
    window.chrome.system.memory.getInfo(e);
}
function s(e) {
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
function n() {
    return window.NativeStorage !== undefined;
}
function l(e, t) {
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
function c(e, t, r) {
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
    facebookLogin: a,
    getSystemMemoryInfo: o,
    googleLogin: i,
    promptAppRate: s,
    hasNativeStorage: n,
    storageGetItem: l,
    storageSetItem: c
};
