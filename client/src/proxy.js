function getProxyDef() {
    var proxies = Object.keys(proxyDefs);

    for (var i = 0; i < proxies.length; i++) {
      var proxy = proxies[i];

      if (window.location.hostname.indexOf(proxy) !== -1) {
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

export default {
    authLocation: function() {
        return !!getProxyDef();
    },
    loginSupported: function(loginType) {
        const proxyDef = getProxyDef();
        return !!proxyDef && (!!proxyDef[loginType] || !!proxyDef.all);
    }
};
