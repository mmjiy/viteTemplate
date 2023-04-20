let ua = "";
try {
    ua = navigator.userAgent.toLowerCase();
} catch (e) {}


export function isMobile() {
    let sUserAgent = ua;
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    var safari = /safari/i.test(sUserAgent)
    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
        return true
    } else {
        return false;
    }
}
export function isSafari() {
    return /safari/i.test(ua) && !/chrome/.test(ua);
}

export function isMpAli() {
    return /alipayclient/i.test(ua);
}


export function isIPad() {
    let ret = false;
    try {
        ret = (ua.indexOf("ipad") > -1);
    } catch (e) {}
    return ret;
}

export function isIPhone() {
    let ret = false;
    try {
        ret = (ua.indexOf("iphone") > -1);
    } catch (e) {}
    return ret;
}

export function isIOS() {
    return isIPad() || isIPhone();
}

export function isAndroid(userAgent) {
    return !isIOS();
}

export function isWexin() {
    return ua.indexOf('micromessenger') != -1 && isMobile();
}

export function isQQ() {
    return ua.indexOf('QQ') != -1 && isMobile();
}

export function isSupportWebp() {
    try {
        return (
            document
            .createElement("canvas")
            .toDataURL("image/webp", 0.5)
            .indexOf("data:image/webp") === 0
        );
    } catch (err) {
        return false;
    }
}

export function isBaiduMp(){
    let ret = false;
    try {
        ret =  /swan\//.test(ua) || /^webswan-/.test(ua);
    } catch (e) {}
    return ret;
}
