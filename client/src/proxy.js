function getProxyDef() {
    const proxies = Object.keys(proxyDefs);

    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];

        if (window.location.hostname.includes(proxy)) {
            return {
                proxy,
                def: proxyDefs[proxy]
            };
        }
    }
    return null;
}

const proxyDefs = {
    "example1.io": {
        all: true
    },
    "example2.io": {
        google: true,
        discord: true
    }
};

export const proxy = {
    authLocation() {
        return !!getProxyDef();
    },
    loginSupported(loginType) {
        const proxyDef = getProxyDef();
        return !!proxyDef && (!!proxyDef[loginType] || !!proxyDef.all);
    }
};
