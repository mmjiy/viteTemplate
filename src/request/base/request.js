import {base, toHumpObject} from "./base";
import {isString,cloneObject,jsonParse,isFunction,each}  from "@lib/common/lib/utils";
import mock from "./mock";
import platform from "yesaway_platform3";

let handleFn = {
    data: []
};
const mockAst = 1000;

const handleBeforeLoop = [];
const handleAfterLoop = [];

/**
 * 按照loop数组依次执行
 * @param loop
 * @param argA
 * @param argB
 * @return {{end(*=): void}}
 */
const deal = function (loop, argA, argB) {
    let endDeal = false;
    let isEnd = false;
    let ccEnd = function (error) {
        isEnd = true;
        endDeal && endDeal.call && endDeal(error);
    };
    if (loop && loop.length > 0) {
        let ccFn = function (index) {
            if (index < loop.length && loop[index] && loop[index].call) {
                let ccReturn = loop[index](argA, argB);
                if (ccReturn && ccReturn.then) {
                    ccReturn.then(data => {
                        ccFn(index + 1);
                    }, (error) => {
                        if (error === true) {
                            ccFn(index + 1);
                        } else {
                            ccEnd(error);
                        }
                    });
                } else {
                    ccFn(index + 1);
                }

            } else {
                ccEnd();
            }
        }
        ccFn(0)
    } else {
        ccEnd();
    }
    return {
        end(fn) {
            endDeal = fn && fn.call ? fn : false;
            if (isEnd) {
                ccEnd();
            }
        }
    }
}


export function destroy(){
    handleFn = {
        data: []
    }
    handleBeforeLoop.splice(0);
    handleAfterLoop.splice(0);
}


export function requestOn(event, fn) {
    handleFn[event] = handleFn[event] || [];
    handleFn[event].push(fn);
}

function emit(event, data, type) {
    let ret = data;
    if (handleFn[event]) {
        handleFn[event].forEach((item, i) => {
            ret = isFunction(item) ? (item(ret, type) || ret) : ret;
        });

    }
    return ret;
}

export const requestConfig = {
    mockFail: false,
    mock: false,
    getLang: false,
    errorSpecial: code => code == -101
};


export function beforeLoop(fn) {
    if (fn && fn.call) {
        handleBeforeLoop.push(fn);
    }
}

export function afterLoop(fn) {
    if (fn && fn.call) {
        handleAfterLoop.push(fn);
    }
}

/**
 *
 * @param {Object} opt 配置参数
 * @param {String} opt.url 请求路径
 * @param {Object} opt.data 传输的数据
 * @param {String} opt.type 请求方法
 * @param {Number} opt.timeout 设置本地的请求超时时间（以毫秒计）
 * @param {Object} opt.map 映射
 * @param {Object} opt.mock mock数据【暂不支持】
 * @return {Promise}
 * resolve res 数据
 * reject res {
 *     code:'',
 *     message:''
 * }
 *
 */
export function normal(opt) {
    opt = opt || {};
    opt.error = opt.error || {};
    if (this && this.getOpt) {
        if (opt.data) {
            opt.data = toHumpObject(opt.data)
        }
        return opt;
    }
    let out = new Promise((resolve, reject) => {
        //opt.url = resolveUrl(opt.url);
        let ccFn = function () {
            if (requestConfig.mockFail) {
                reject({
                    code: 404,
                    message: "请求失败"
                });
            }
            //是否使用mock生成数据
            else if (opt.mock && mock && ((requestConfig.mock && !opt.disMock) && !opt.focusDisMock || opt.focusMock)) {
                setTimeout(() => {
                    resolve(mock.mock(opt.mock));
                }, mockAst);
            }
            //请求数据
            else {
                console.log("beforeSend",opt);
                opt = emit("beforeSend", cloneObject(opt), "normal");
                if (opt.code && opt.message) {
                    reject(opt);
                } else {
                    emit("send", opt, "normal");
                    base(opt)
                        .then(res => {
                            //处理dataType= text,的类型
                            let origin = "";
                            if(opt.dataType == 'text'){
                                origin = res.data;
                                try {
                                    res.data = JSON.parse(res.data);
                                }catch(e){}
                            }
                            emit("afterSend", {
                                req: opt,
                                res: res
                            }, "normal");

                            if (res && res.data && res.data.code == 200) {
                                let ret = res.data.data || {};
                                if (isObject(opt.map)) {
                                    ret = map(ret, opt.map);
                                }
                                if(origin && ret){
                                    ret.__origin__ = origin;
                                }
                                resolve(ret);
                            } else if (res && res.data.code) {
                                let message = "";
                                if (isObject(opt.error)) {
                                    message = dealError(res.data, opt.error);
                                } else {
                                    message = "请求出错，请稍后再试"
                                }
                                reject({
                                    code: res.data.code,
                                    message: message,
                                    originMessage: res.data.message,
                                    originData: res.data
                                });
                            } else {
                                reject({
                                    code: -503,
                                    message: "网络错误，请稍后再试"
                                });
                            }
                        }, error => {
                            emit("error", {
                                req: opt,
                                res: {
                                    ...error

                                }
                            }, "normal");
                            reject({
                                code: -502,
                                message: "网络错误"
                            });
                        });
                }

            }
        }

        let ccResolve = resolve;
        let ccReject = reject;
        resolve = function (args) {
            //如果有开始函数，则所有都先执行前loop
            if (handleAfterLoop.length > 0) {
                deal(handleAfterLoop, opt, args).end(function () {
                    ccResolve(args);
                });
            } else {
                ccResolve(args);
            }

        }
        reject = function (args) {
            //如果有开始函数，则所有都先执行前loop
            if (handleAfterLoop.length > 0) {
                deal(handleAfterLoop, opt, args).end(function () {
                    ccReject(args);
                });
            } else {
                ccReject(args);
            }

        }

        //如果有开始函数，则所有都先执行前loop
        if (handleBeforeLoop.length > 0) {
            deal(handleBeforeLoop, opt).end(error=>{
                if(error){
                    return reject(error);
                }
                else{
                    ccFn();
                }
            });
        } else {
            ccFn();
        }

    });
    return out;
}


export function uploadFile(opt) {
    opt = opt || {};
    let retCache = [];
    let ret = new Promise((resolve, reject) => {
        //opt.url = resolveUrl(opt.url);
        if (requestConfig.mockFail) {
            reject({
                code: 404,
                message: "请求失败"
            });
        }
        //是否使用mock生成数据
        else if (opt.mock && mock && ((requestConfig.mock && !opt.disMock) && !opt.focusDisMock || opt.focusMock)) {
            let astTime = (count) => {
                count = count || 0;
                count++;
                if (count < 6) {
                    ((count) => {
                        setTimeout(() => {
                            let p = count * 20;
                            retCache.forEach(fn => {
                                fn && fn.call && fn(p);
                            })

                            astTime(count);
                        }, mockAst / 5);
                    })(count);

                }
            }
            astTime();
            setTimeout(() => {
                resolve(mock.mock(opt.mock));
            }, mockAst);
        }
        //请求数据
        else {
            opt = emit("beforeSend", opt, "file");
            if (opt.code && opt.message) {
                reject(opt);
            } else {
                try {
                    emit("send", opt, "file");
                    console.log(opt.data.fileType);
                    let handle = platform.uploadFile({
                        url: opt.url,
                        filePath: opt.filePath,
                        fileType: opt.data.fileType,
                        header: opt.header,
                        name: opt.fileName,
                        fileName: opt.fileName,
                        formData: opt.data,
                        success(res) {
                            emit("afterSend", {
                                req: opt,
                                res: res
                            }, "file");
                            if(isString(res.data)){
                                try {
                                    res.data = JSON.parse(res.data);
                                } catch (e) {
                                    res.data = {};
                                }
                            }


                            if (res.statusCode == 200 && res.data.code == 200) {
                                let ret = res.data.data || {};
                                if (isObject(opt.map)) {
                                    ret = map(ret, opt.map);
                                }
                                resolve(ret)
                            } else if (res.data.code) {
                                let message = "";
                                if (isObject(opt.error)) {
                                    message = dealError(res.data, opt.error);
                                } else {
                                    message = "请求出错，请稍后再试"
                                }
                                reject({
                                    code: res.data.code,
                                    message: message
                                });
                            } else {
                                reject({
                                    code: res.statusCode,
                                    message: "上传失败"
                                });
                            }
                        },
                        fail(error) {
                            emit("error", {
                                req: opt,
                                res: {
                                    ...error

                                }
                            }, "file");
                            reject({
                                code: -502,
                                message: "网络错误"
                            });
                        }
                    })
                    handle.onProgressUpdate(res => {
                        retCache.forEach(fn => {
                            fn && fn.call && fn(res.progress || res);
                        })
                    })
                } catch (e) {
                    console.log(e)
                }
            }

        }
    });
    ret.progress = (fn) => {
        if (fn && fn.call) {
            retCache.push(fn);
        }
        return ret;
    };
    return ret;
}

const mapFunc = {
    //强制转换字符串，如果是对象，则获取第一个字符串值，如果第一个字符串值也是对象，则将整个对象JSON
    forceString(str) {
        if (isString(str)) {
            return str;
        } else if (isObject(str)) {
            let ccFirst = "";
            let boolCheck = false;
            each(str, item => {
                if (boolCheck) return;
                if (isString(item)) {
                    ccFirst = item;
                }
                boolCheck = true;
            })
            if (ccFirst) {
                return ccFirst;
            }
            else{
                let ret = "";
                try{
                    ret = JSON.stringify(str);
                }catch(e){

                }
                return ret;
            }
        }
    },
    jsonParse(str){
        return jsonParse(str);
    },
    timeStamp(str) {
        return str * 1000;
    },
    parseInt: parseInt
}

/**
 * 根据映射map对data进行格式化，支持同级名字映射和下级名字链式映射
 * @param {Object} data 数据
 * @param {Object} map 映射表
 * @return {Object} ret
 */
export function map(data, maplist, origin) {
    let ret = data;
    //符合条件的进行映射，不符合条件的返回元数据
    if (isObject(data) && isObject(maplist)) {
        ret = {};

        //转驼峰
        if (isObject(data)) {
            data = toHumpObject(data);
        }

        if (isArray(data) && isArray(maplist) && maplist.length > 0) {
            ret = [];
            data.forEach((value, key) => {
                ret.push(map(value, maplist[0], data));
            });
        }

        //如果maplist拥有__root__ == array,且数据是数组类型，则将数据放进maplist里面的第一个key
        /* eg:
         *  {list:[map],__root__}
         *  data:[{},{},{}]
         * 会将data里面的每个数组元素按照list的map进行映射
          */
        else if (isArray(data) && maplist.__root__ == 'array') {
            let firstKey = Object.keys(maplist);
            if(firstKey.length>1){
                firstKey = firstKey[0] == "__root__" ? firstKey[1] : firstKey[0];
                ret[firstKey]=map(data,maplist[firstKey]);
            }
        }
        else {
            each(maplist, (value, key) => {
                //如果是数组，则按照数组初始化
                if (isArray(value)) {
                    let newKey = key;
                    //如果有__name__，则吧key映射成对应的name
                    if (value && value[0] && value[0].__name__) {
                        newKey = value[0].__name__;
                    }
                    if (isArray(data[newKey])) {
                        //data:[{},{}]方式，继续格式化
                        if (value.length > 0 && isObject(value[0])) {
                            ret[key] = [];
                            data[newKey].forEach((v, k) => {
                                ret[key].push(map(v, value[0], data));
                            });
                        }
                        //data:[1,2,3],直接输出
                        else {
                            ret[key] = data[newKey];
                        }
                    } else {
                        ret[key] = data[newKey];
                    }
                } else if (value && value.call) {
                    ret[key] = value(origin || data);
                }
                //如果是对象，则嵌套循环
                else if (isObject(value)) {
                    let newKey = key;
                    //如果有__name__，则吧key映射成对应的name
                    if (value.__name__) {
                        newKey = value.__name__;
                    }
                    //当第一层即为任意key时执行 
                    if(key == "__any__"){
                        ret= {};
                        each(data, (ccItem, ccKey) => {
                            ret[ccKey] = map(ccItem, value, data);
                        })
                    }
                    else if (isObject(data[newKey])) {

                        //存在any的时候，这一层不做映射，请所有下属元素，根据对应的对象映射
                        if (value.__any__) {
                            ret[key] = {};
                            each(data[newKey], (ccItem, ccKey) => {
                                ret[key][ccKey] = map(ccItem, value.__any__, data);
                            })
                        } else {
                            ret[key] = map(data[newKey], value, data);
                        }
                    } else {
                        ret[key] = {};
                    }

                } else if (isString(value) && value) {
                    let child_msg = value.split(".");
                    //使用工具转换函数
                    if (value.indexOf("*") > -1) {
                        let ccMatch = value.match(/([a-zA-Z]*?)\*([a-zA-Z]+)/);
                        let mapKey = ccMatch[1] || key;
                        let func = ccMatch[2];
                        if (mapFunc[func]) {
                            ret[key] = mapFunc[func](data[mapKey]);
                        }
                    }
                    //map:"a.b.c",方式，获取下级用法
                    else if (child_msg.length > 1 && isObject(data)) {
                        let this_level = data;
                        let step = this_level;
                        child_msg,find((v, i) => {
                            if (step[v] === undefined) {
                                step = "";
                                return true;
                            } else {
                                step = step[v];
                            }
                        });
                        ret[key] = step;
                    } else if (data[value] !== undefined) {
                        ret[key] = data[value];
                    } else if (data[key] !== undefined) {
                        ret[key] = data[key];
                    }
                } else {
                    ret[key] = data[key] !== undefined ? data[key] : "";
                }

            });
        }
    }
    return ret;
}

/**
 * 输出错误
 * @param code
 * @param message
 * @return {string}
 */
function dealError(data, messageObj) {
    let ret = "程序出错";

    let lang = requestConfig.getLang ? (requestConfig.getLang() || "zh_CN") : "zh_CN"

    //切换模块语言包

    if (data && data.data && data.data.error_message && data.data.error_message[lang]) {
        ret = data.data.error_message[lang];
    } else if (data && data.code && messageObj[data.code]) {
        ret = messageObj[data.code];
    } else if (data && data.code && data.message) {
        ret = data.message;
    }
    return ret;
}

/*
console.log(map({
    "id":"121",
    "type":"1212dfa",
    "user_id":"1212",
    "teacher":{
        "name":"dsfaf",
        "aid":"dsf",
        "sex":"sdfasdf",
        "a":{
            "b":"ok"
        }
    },
    "students":[
        {
            "name":"1212",
            "sid":"dafdsf",
            "sexa":"1212",
        },{
            "name":"dsafda",
            "sid":"dasf",
            "sexb":"dasfdf",
        }
    ]

},{
    "id":"",
    "type":"teacher.a.b",
    "user_id":"",
    "teacher":{
        "name":"",
        "tid":"aid",
        "sex":""
    },
    "students":[
        {
            "name":"",
            "sid":"",
            "sexb":"",
        }
    ]
}))
*/
