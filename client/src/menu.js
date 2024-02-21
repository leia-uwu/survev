import $ from "jquery";
import device from "./device";
import helpers from "./helpers";
import firebaseManager from "./firebaseManager";
import MenuModal from "./menuModal";

function a(e, t, r, a) {
    const i = $("<div/>", {
        class: "copy-toast",
        html: e
    });
    t.append(i);
    i.css({
        left: a.pageX - parseInt(i.css("width")) / 2,
        top: r.offset().top
    });
    i.animate(
        {
            top: "-=25",
            opacity: 1
        },
        {
            queue: false,
            duration: 300,
            complete: function() {
                $(this).fadeOut(250, function() {
                    $(this).remove();
                });
            }
        }
    );
}
function setupModals(e, t) {
    const r = $("#start-menu");
    $("#btn-help").click(() => {
        const e = $("#start-help");
        r.addClass("display-help");
        e.position().top;
        const t = r.css("height");
        e.css("display", "block");
        r.animate(
            {
                scrollTop: t
            },
            1000
        );
        firebaseManager.storeGeneric("info", "help");
        return false;
    });
    const i = $("#team-mobile-link");
    const o = $("#team-mobile-link-desc");
    const s = $("#team-mobile-link-warning");
    const n = $("#team-link-input");
    const u = $("#social-share-block");
    const g = $("#news-block");
    $("#btn-join-team").click(() => {
        $("#server-warning").css("display", "none");
        n.val("");
        i.css("display", "block");
        o.css("display", "block");
        s.css("display", "none");
        r.css("display", "none");
        g.css("display", "none");
        u.css("display", "none");
        $("#right-column").css("display", "none");
        return false;
    });
    $("#btn-team-mobile-link-leave").click(() => {
        i.css("display", "none");
        n.val("");
        r.css("display", "block");
        g.css("display", "block");
        u.css("display", "block");
        $("#right-column").css("display", "block");
        return false;
    });
    $("#team-link-input").on("keypress", function(e) {
        if ((e.which || e.keyCode) === 13) {
            $("#btn-team-mobile-link-join").trigger("click");
            $(this).blur();
        }
    });
    $("#player-name-input-solo").on("keypress", function(e) {
        if ((e.which || e.keyCode) === 13) {
            $(this).blur();
        }
    });
    if (device.mobile && device.os != "ios") {
        $("#player-name-input-solo").on("focus", function() {
            if (device.isLandscape) {
                const e = device.screenHeight;
                const t = e <= 282 ? 18 : 36;
                document.body.scrollTop = $(this).offset().top - t;
            }
        });
        $("#player-name-input-solo").on("blur", () => {
            document.body.scrollTop = 0;
        });
    }
    const y = $("#start-bottom-right");
    const w = $("#start-top-left");
    const f = $("#start-top-right");
    const _ = new MenuModal($("#ui-modal-keybind"));
    _.onShow(() => {
        y.fadeOut(200);
        f.fadeOut(200);
        $("#ui-modal-keybind-share").css("display", "none");
        $("#keybind-warning").css("display", "none");
        $("#ui-modal-keybind-list").css("height", "420px");
        $("#keybind-code-input").html("");
        t.refresh();
    });
    _.onHide(() => {
        y.fadeIn(200);
        f.fadeIn(200);
        t.cancelBind();
    });
    $(".btn-keybind").click(() => {
        _.show();
        return false;
    });
    $(".js-btn-keybind-share").click(() => {
        if (
            $("#ui-modal-keybind-share").css("display") == "block"
        ) {
            $("#ui-modal-keybind-share").css("display", "none");
            $("#ui-modal-keybind-list").css("height", "420px");
        } else {
            $("#ui-modal-keybind-share").css("display", "block");
            $("#ui-modal-keybind-list").css("height", "275px");
        }
    });
    $("#keybind-link, #keybind-copy").click((e) => {
        a("Copied!", _.selector, $("#keybind-link"), e);
        const t = $("#keybind-link").html();
        helpers.copyTextToClipboard(t);
    });
    $("#btn-keybind-code-load").on("click", (r) => {
        const i = $("#keybind-code-input").val();
        $("#keybind-code-input").val("");
        const o = e.fromBase64(i);
        $("#keybind-warning").css("display", o ? "none" : "block");
        if (o) {
            a(
                "Loaded!",
                _.selector,
                $("#btn-keybind-code-load"),
                r
            );
            e.saveBinds();
        }
        t.refresh();
    });
    const b = new MenuModal($("#modal-settings"));
    b.onShow(() => {
        y.fadeOut(200);
        f.fadeOut(200);
    });
    b.onHide(() => {
        y.fadeIn(200);
        f.fadeIn(200);
    });
    $(".btn-settings").click(() => {
        b.show();
        return false;
    });
    $(".modal-settings-text").click(function(e) {
        const t = $(this).siblings("input:checkbox");
        t.prop("checked", !t.is(":checked"));
        t.trigger("change");
    });
    const x = new MenuModal($("#modal-hamburger"));
    x.onShow(() => {
        w.fadeOut(200);
    });
    x.onHide(() => {
        w.fadeIn(200);
    });
    $("#btn-hamburger").click(() => {
        x.show();
        return false;
    });
    $(".modal-body-text").click(function() {
        const e = $(this).siblings("input:checkbox");
        e.prop("checked", !e.is(":checked"));
        e.trigger("change");
    });
    $("#force-refresh").click(() => {
        window.location.href = `/?t=${Date.now()}`;
    });
    /* var S = new h(l("#modal-notification")),
  v = (function () {
      return "WebSocket" in window
          ? d.Y()
              ? "ie" == c.browser
                  ? 'Please use the <a href="https://www.google.com/chrome/browser/desktop/index.html" target="_blank">Chrome browser</a> for a better playing experience!<br><br>¡Usa el <a href="https://www.google.com/chrome/browser/desktop/index.html" target="_blank">navegador Chrome</a> para una mejor experiencia de juego!<br><br><a href="https://www.google.com/chrome/browser/desktop/index.html" target="_blank">구글 크롬</a> 브라우저로이 게임을 즐겨보세요.'
                  : void 0
              : 'Please use the <a href="https://surviv.io" target="_blank">official surviv.io site</a> for a better playing experience!'
          : 'WebSockets are required to play.<br><br>Please use the <a href="https://www.google.com/chrome/browser/desktop/index.html" target="_blank">Chrome browser</a> for a better playing experience!';
  })();
if (
  (v &&
      (S.selector.find(".modal-body-text").html(v),
      S.show()),
  m.Z(),
  window.adsBlocked)
) {
  var k = document.getElementById(
      "main-med-rect-blocked",
  );
  k && (k.style.display = "block");
  var z = document.getElementById(
      "survivio_300x250_main",
  );
  z && (z.style.display = "none");
  var I = document.getElementById("surviv-io_300x250");
  I && (I.style.display = "none");
}
window.aiptag &&
  ((window.aiptag.gdprConsent = window.cookiesConsented),
  (window.aiptag.consented = window.cookiesConsented)); */
}
function onResize() {
    if (device.os == "ios") {
        if (device.model == "iphonex") {
            if (device.isLandscape) {
                $(".main-volume-slider").css("width", "90%");
            } else {
                $(".main-volume-slider").css("width", "");
            }
        } else if (!window.navigator.standalone) {
            if (device.isLandscape) {
                $("#start-main-center").attr("style", "");
                $("#modal-customize .modal-content").attr(
                    "style",
                    ""
                );
            } else {
                $("#modal-customize .modal-content").css({
                    transform: "translate(-50%, -50%) scale(0.45)",
                    top: "38%"
                });
            }
        }
    }
    if (device.tablet) {
        $("#featured-youtuber").remove();
        $(".btn-youtube").remove();
    }
    if (device.touch) {
        $(".btn-start-fullscreen").css("display", "none");
    } else {
        $(".btn-start-fullscreen").css("display", "block");
    }
    $(".btn-keybind").css(
        "display",
        device.mobile ? "none" : "inline-block"
    );
}
function applyWebviewStyling(e) {
    const t = $("#modal-hamburger-bottom");
    t.children().slice(-3).remove();
    t.children().last().removeClass("footer-after");
    $("#invite-link-text").attr("data-l10n", "index-invite-code");
    $("#team-code-text").css("display", "none");
    $("#invite-code-text").css("display", "none");
    $("#team-hide-url").css("display", "none");
    $(".btn-download-ios").css("display", "none");
    $(".btn-download-android").css("display", "none");
    $("#mobile-download-app").css("display", "none");
    $("#start-bottom-middle").css("display", "none");
    if (!e) {
        $("#btn-help").css("display", "none");
        $("#news-block, #start-menu").css({
            height: 186
        });
        $("#team-menu").css({
            height: 186,
            padding: 10
        });
    }
}
function applyMobileBrowserStyling(e) {
    $("#team-hide-url").css("display", "none");
    if (e) {
        $("#start-bottom-middle").addClass(
            "start-bottom-middle-tablet"
        );
    }
    if (device.os == "android") {
        $(".btn-download-android").css("display", "block");
        $(".btn-download-ios").css("display", "none");
    } else if (device.os == "ios") {
        $(".btn-download-ios").css("display", "block");
        $(".btn-download-android").css("display", "none");
    }
    $("#mobile-download-app").css("display", "block");
}

export default {
    setupModals,
    onResize,
    applyWebviewStyling,
    applyMobileBrowserStyling
};
