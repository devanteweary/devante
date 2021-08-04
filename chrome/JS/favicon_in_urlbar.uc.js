// 'Favicon in urlbars identity box' script for Firefox 60+ by Aris
//
// This script restores current pages favicon inside urlbar (aka location bar, address bar or awesome bar).
// [!] If a page does not offer a favicon, browser branches default icon is shown.
// [!] In a multi-window environment pages without favicons might show wrong icons.
// option: set icon for pages without favicon
// Fx 70+: add favicon item to identiy box without replacing connection or tracking protection icons

var i_icon = "chrome://browser/skin/identity-icon.svg";
var sheet = "chrome://global/skin/icons/Portrait.png";
var brand = "chrome://branding/content/identity-icons-brand.svg";
var globe = "chrome://mozapps/skin/places/defaultFavicon.svg";

var icon_for_pages_without_favicon = brand; // i_icon, sheet, globe or brand (colorized Fx channel icon)

var favicon_click_opens_page_info_window = false;

var appversion = parseInt(Services.appinfo.version);

var FaviconInUrlbar = {
    init: function () {
        try {
            // on Fx 70+: add favicon to identity box without replacing existing icons
            if (appversion >= 70) {
                let favcontainer = document.createXULElement("box");
                favcontainer.setAttribute("id", "urlbar-favicon-container");
                var favimginurlbar = favcontainer.appendChild(document.createXULElement("image"));
                favimginurlbar.setAttribute("id", "favimginurlbar");

                if (favicon_click_opens_page_info_window)
                    favcontainer.setAttribute(
                        "onclick",
                        "gIdentityHandler.handleMoreInfoClick(event);"
                    );

                favimginurlbar.style.width = "16px";
                favimginurlbar.style.height = "16px";
                favcontainer.style.cssText =
                    "margin-right: 4px; -moz-box-align: center; -moz-box-pack: center;";

                if (appversion >= 86) {
                    favcontainer.style.marginLeft = "4px";
                    favcontainer.style.marginRight = "4px";
                    favcontainer.style.marginTop = "4px";
                    favcontainer.style.marginBottom = "4px";
                }

                if (appversion >= 89 && Services.prefs.getBoolPref("browser.proton.enabled")) {
                    favcontainer.style.marginLeft = "3px";
                    favcontainer.style.marginRight = "3px";
                    favcontainer.style.marginTop = "3px";
                    favcontainer.style.marginBottom = "3px";
                }

                document
                    .getElementById("identity-box")
                    .insertBefore(favcontainer, document.getElementById("identity-box").firstChild);
            } else {
                if (favicon_click_opens_page_info_window)
                    document
                        .querySelector("#identity-icon")
                        .setAttribute("onclick", "gIdentityHandler.handleMoreInfoClick(event);");
            }

            // update script every time tab attributes get modified (switch/open tabs/windows)
            document.addEventListener("TabAttrModified", this, false);
            document.addEventListener("TabSelect", this, false);
            document.addEventListener("TabOpen", this, false);
            document.addEventListener("TabClose", this, false);
            document.addEventListener("load", this, false);
            document.addEventListener("DOMContentLoaded", this, false);

            /* restore icon badge for websites with granted permissions */
            var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(
                Components.interfaces.nsIStyleSheetService
            );
            var uri = Services.io.newURI(
                "data:text/css;charset=utf-8," +
                    encodeURIComponent(
                        ' \
        \
        .grantedPermissions::before { \
          content: "" !important; \
          display: block !important; \
          width: 6px !important; \
          height: 6px !important; \
          position: absolute !important; \
          -moz-margin-start: 11px !important; \
          margin-top:-8px !important; \
          background: Highlight !important; \
          border-radius: 100px !important; \
        } \
        \
    '
                    ),
                null,
                null
            );

            // remove old style sheet
            if (sss.sheetRegistered(uri, sss.AGENT_SHEET))
                sss.unregisterSheet(uri, sss.AGENT_SHEET);

            sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
        } catch (e) {}

        gBrowser.addTabsProgressListener(this);
    },

    updateIcon() {
        // get current tabs favicon
        var favicon_in_urlbar = gBrowser.selectedTab.image;

        // if current tab offers no icon, use selected icon (icon_for_pages_without_favicon)
        if (!gBrowser.selectedTab.image || gBrowser.selectedTab.image == null)
            if (!icon_for_pages_without_favicon) favicon_in_urlbar = brand;
            else favicon_in_urlbar = icon_for_pages_without_favicon;

        document.querySelector(
            appversion >= 70 ? "#favimginurlbar" : "#identity-icon"
        ).style.listStyleImage = "url(" + favicon_in_urlbar + ")";
    },

    handleEvent(e) {
        setTimeout(() => {
            this.updateIcon();
        }, 100);
    },

    onLocationChange(browser, _prog, _req, _location, _flags) {
        if (browser !== gBrowser.selectedBrowser) return;
        this.updateIcon();
    },

    onStateChange(browser, _prog, _req, _flags, _status) {
        if (browser !== gBrowser.selectedBrowser) return;
        this.updateIcon();
    },
};

// initiate script after DOM/browser content is loaded
document.addEventListener("DOMContentLoaded", FaviconInUrlbar.init(), false);
