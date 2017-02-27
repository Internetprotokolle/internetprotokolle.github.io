var enableFastView = false;

if (enableFastView) {
    window.addEventListener("load", load);
    window.addEventListener("popstate", back);
}

function init() {
    if (!works()) return;
    load();
    window.history.state = {"html": document.getElementsByTagName("body")[0].innerHTML, "title": window.title};
}

function load() {
    if (!works()) return;
    for (var i = 0; i < document.links.length; i++) {
        var link = document.links[i];
        link.addEventListener("click", clickHref);
    }
}

function works() {
    var agent = window.navigator.userAgent.toLowerCase();

    if (agent.indexOf("edge") > -1 || agent.indexOf("chrome") > -1) {
        return window.location.protocol.indexOf("http") > -1;
    } else if (agent.indexOf(".net") > -1) {
        return false;
    } else if (agent.indexOf("firefox") > -1) {
        return true;
    }
}

function back() {
    var data = window.history.state;
    if (data == null) {
        window.history.go();
        return;
    }
    window.title = data.pageTitle;
    document.getElementsByTagName("body")[0].innerHTML = data.html;
    if (data.hash != undefined && data.hash.length > 1 && document.querySelector(data.hash) != undefined) {
        document.querySelector(data.hash).scrollIntoView();
    } else {
        window.scrollTo(0, 0);
    }
    load();
}

var domParser = new DOMParser();

function clickHref(ev) {
    var otherDomain = false;

    if (window.location.protocol != ev.target.protocol) otherDomain = true;
    if (window.location.host != ev.target.host) otherDomain = true;
    if (window.location.port != ev.target.port) otherDomain = true;

    if (otherDomain) return;

    ev.preventDefault();

    if (window.location.pathname == ev.target.pathname && ev.target.hash.length > 1) {
        document.querySelector(ev.target.hash).scrollIntoView();
        window.history.pushState({ "html": document.getElementsByTagName("body")[0].innerHTML, "hash": ev.target.hash, "pageTitle": document.title}, document.title, ev.target);
        return;
    }

    if (window.location.href == ev.target.href) return;

    var request = new XMLHttpRequest();

    request.onloadend = function (e) {
        try {
            var dom = domParser.parseFromString(e.target.response, "text/html");
            var title = dom.getElementsByTagName("title")[0].text;
            var html = dom.getElementsByTagName("body")[0].innerHTML;
            document.getElementsByTagName("body")[0].innerHTML = html;
            document.title = title;
            window.history.pushState({ "html": html, "hash": ev.target.hash, "pageTitle": title }, title, ev.target);
            load();
            if (ev.target.hash.length > 1) {
                document.querySelector(ev.target.hash).scrollIntoView();
            }
        } catch (e) {
            window.location = ev.target.href;
        }
    };
    request.overrideMimeType("text/html");
    request.open("GET", ev.target, true);
    request.send();
}