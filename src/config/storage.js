import config from "@/config";

const storage = function (key, data, options) {
    options = options || {};
    if (options.lang === false) {

        key = key;
    } else {

        key = config.lang + ":" + key;
        if(config.env != 'prod'){
            key = config.lang + `(${config.env})` + ":" + key;
        }
    }
    let expires = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
    let ret = false;
    if (options.forever) {
        expires += (10000 * 24 * 60 * 60 * 1000);
    }
    if (options.expires) {
        expires = options.expires;
    }
    if (options.later) {
        expires = new Date().getTime() + options.later;
    }
    if (options.clear) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            ret = false;
        }
        return;
    }
    if (data === undefined || data === false) {
        ret = localStorage.getItem(key);
        try{
            ret = JSON.parse(ret);
        }catch (e){}
        let now = new Date().getTime();
        if (ret && ret.expires && ret.expires < now) {
            localStorage.removeItem(key);
            ret = false;
        } else {
            ret = ret ? ret.data : false;
        }

    } else {
        try {
            localStorage.setItem(key, JSON.stringify({
                data: data,
                expires: expires
            }))
        } catch (e) {}
    }
    return ret;
}

const out = {};

/**
 * 基础函数
 * @param key
 * @return {boolean}
 */
out.base = function (key,opt) {
    if(out[key])return;
    out[key] =function(value,options){
        options = options || {};
        options.lang = false;
        let ret = storage(key, value, options);
        if (ret) {
            try {
                ret = JSON.parse(ret);
            } catch (e) {}
        }
        return ret;
    }

}


export default out
