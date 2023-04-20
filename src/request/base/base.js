import platform from "yesaway_platform";


import {isObject,isArray,each} from "@lib/common/lib/utils.js"

let isNode = false;
try{
    if(process && !process.browser && process.kill){
        isNode = true;
    }
}catch(e){}

/**
 *
 * @param {Object} opt 配置参数node 开启es6 参数
 * @param {String} opt.url 请求路径
 * @param {Object} opt.data 传输的数据
 * @param {String} opt.type 请求方法
 * @param {Object} opt.header 发送头部“
 * @param {Number} opt.timeout 设置本地的请求超时时间（以毫秒计）
 * @param {Object} opt.xhrFields 传输的头部
 * @param {String} opt.dataType 返回数据的类型 [Jsonp,Json,XML] 默认JSON
 * @param {String} opt.responseType 响应的数据类型
 * @return {Promise}
 * resolve res
 * {
 *     data
 *     origin
 * }
 * reject res
 * {
 *     code 404|405
 *     message
 * }
 *
 */

export function base(opt){
    opt = opt || {};
    opt.type = opt.type || "get";

    return new Promise((resolve, reject) => {
        if(!opt.url){
            reject({
                code:-1,
                message:"没有URL"
            });
            return;
        }
        const header = {
            //"Content-Type":"application/x-www-form-urlencoded"
            "Content-Type":"application/json"
        };
        if(isObject(opt.header)){
            each(opt.header,(item,i)=>{
                header[i]=item || "";
            })
        }
        const wx_method = {
            "get":"GET",
            "post":"POST"
        }
        if(opt.data &&isObject(opt.data)){
            each(opt.data,(item,i)=>{
                if(item === undefined){
                    opt.data[i] = "";
                }
            })
        }
        let sendConfig = {
            url:opt.url,
            data:opt.data,
            method:wx_method[opt.type] || "GET",
            dataType:opt.dataType || "json",
            header:header,
            responseType:opt.responseType ,
            withCredentials:opt.withCredentials,
            success:res=>{
                resolve(res)
            },
            fail:res=>{
                reject(res)
            }
        }
        platform.request(sendConfig)
    })
}

/**
 * zh_CN en_US zh_HK 不做转义
 * @param name
 * @return {void | string}
 */
export function toHump(name) {
    return name && name.replace && ["zh_CN","zh_HK","en_US"].indexOf(name)<0 ? name.replace(/\_(\w)/g, function(all, letter){
        return letter.toUpperCase();
    }):name;
}

export function toHumpObject(object){
    let result = {};
    if(isObject(object)){
        if(isArray(object)){
            result=[];
        }
        each(object,(item,key)=>{
            if(isObject(item)){
                result[toHump(key)] = toHumpObject(item);
            }
            else{
                result[toHump(key)] = item;
            }
        })
    }
    else{
        result = object;
    }
    return result;
}
