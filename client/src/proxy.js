function a() {
    for (let e = Object.keys(i), t = 0; t < e.length; t++) {
        const r = e[t];
        if (window.location.hostname.includes(r)) {
            return i[r];
        }
    }
    return null;
}
var i = {
    "surviv.io": {
        all: true
    },
    "surviv2.io": {
        google: true,
        discord: true
    },
    "2dbattleroyale.com": {
        google: true,
        discord: true
    },
    "2dbattleroyale.org": {
        google: true,
        discord: true
    },
    "piearesquared.info": {
        google: true,
        discord: true
    },
    "thecircleisclosing.com": {
        google: true,
        discord: true
    },
    "secantsecant.com": {
        google: true,
        discord: true
    },
    "parmainitiative.com": {
        google: true,
        discord: true
    },
    "ot38.club": {
        google: true,
        discord: true
    },
    "drchandlertallow.com": {
        google: true,
        discord: true
    },
    "rarepotato.com": {
        discord: true
    },
    "archimedesofsyracuse.info": {
        discord: true
    },
    "nevelskoygroup.com": {
        discord: true
    },
    "kugahi.com": {
        discord: true
    },
    "kugaheavyindustry.com": {
        discord: true
    },
    "chandlertallowmd.com": {
        discord: true
    }
};
export default {
    Y: function() {
        return !!a();
    },
    loginSupported: function(e) {
        const t = a();
        return !!t && (!!t[e] || !!t.all);
    }
};
