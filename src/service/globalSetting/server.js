import {
    requestOn,
    requestConfig,
    beforeLoop
} from "@lib/request/base/request";
import config from "@lib/config"


function resolveUrlBase(path,type) {
    type = type || "api"
    let configApi = config[type];
    if (config.env == 'release') {
        configApi = config[`${type}Release`];
    }
    configApi = configApi;
    let host = configApi.host;
    let port = configApi.port || "";
    let protocol = configApi.protocol;
    let subpath = configApi.path || "";

    return protocol + host + port + subpath + path;
}

export default async function(options={}){
    return new Promise((resolve, reject) => {
        requestOn("beforeSend", (opt, type) => {
            if (type == "normal" || type == "file") {

                opt.url = resolveUrlBase(opt.url,opt.serverType);

                opt.header = opt.header || {};
                opt.data = opt.data || {};
                opt.data["client_id"] = options.clientId || ""

            }
            return opt;
        })

        requestOn("error", (error) => {
            let url = "";
            let res = "";
            //未登录
            if(error?.res?.response?.status == 401){

                Toast("请先登录")
                return;

            }
            if (error && error.req && error.req.url) {
                url = error.req.url;
            }
            if (error && error.res) {
                try {
                    res = error.res.status + "[" + error.res.status + "]" + error.res.statusText;
                    if (error && error.req && error.req.data) {
                        res = JSON.stringify(error.req.data);
                    }
                } catch (e) {
                    res = "网络错误";
                }
            }
        })
        requestOn("afterSend", data => {
            console.error("afterSend",data)

        })
        resolve();
    })
}