

export function each(obj,fn){
    if(isObject(obj)) {
        Object.keys(obj).forEach(key=>{
            let item = obj[key];
            fn && fn.call && fn(item,key)
        })
    }
}

/**
 * 兼容newDate部分手机不兼容得问题
 * @param str
 * @returns {Date}
 */
export function newDate(str){
    let ret = "";
    if(str &&str.indexOf && str.indexOf("-")>-1){
        str = str.replace(/-/g,"/");

    }
    //YYYY-mm-ddThh:ii修复中间带T的时候苹果会默认为0时区的时间
    if(str.indexOf("T">-1)){
        str = str.replace("T"," ");
    }
    ret = new Date(str);
    if(isNaN(ret.getTime())){
        if(str &&str.indexOf && str.indexOf("-")>-1){
            console.log(str +":" +  str.replace("-","/"));
            ret = new Date(str.replace(/-/g,"/"))
        }

    }
    return ret;
}

/**
 * 通过时间戳获取时间格式
 * @param str
 * @constructor
 * @param format
 * @return {string}
 */
export function getTime(str, format) {
    str = parseInt(str);
    var D = false;
    if (isNaN(str)) {
        D = new Date();
    } else {
        D = new Date(str);
    }
    var ret = "";
    if (D && !isNaN(D.getTime())) {
        var fullyear = D.getFullYear();
        var month = D.getMonth() + 1;
        var date = D.getDate();
        var hours = D.getHours();
        var minute = D.getMinutes();
        var second = D.getSeconds();
        var doublemonth = month > 9 ? month : "0" + month;
        var doubledate = date > 9 ? date : "0" + date;
        var doubleyear = fullyear.toString().substr(2);
        var doublehours = hours > 9 ? hours : "0" + hours;
        var doubleminues = minute > 9 ? minute : "0" + minute;
        var doublesecond = second > 9 ? second : "0" + second;
        ret = format;
        ret = ret.replace(/YYYY/g, fullyear);
        ret = ret.replace(/YY/g, doubleyear);
        ret = ret.replace(/mm/g, doublemonth);
        ret = ret.replace(/m/g, month);
        ret = ret.replace(/dd/g, doubledate);
        ret = ret.replace(/d/g, date);
        ret = ret.replace(/hh/g, doublehours);
        ret = ret.replace(/h/g, hours);
        ret = ret.replace(/ii/g, doubleminues);
        ret = ret.replace(/i/g, minute);
        ret = ret.replace(/ss/g, doublesecond);
        ret = ret.replace(/s/g, second);
    }
    return ret;
}

export function getRequest() {
    var url = location.search; //获取url中"?"符后的字串
    let theRequest = {};
    if (url.indexOf("?") != -1) {
        let str = url.substr(1);
        let strs = str.split("&");
        strs.forEach(item=>{
            theRequest[item.split("=")[0]]=unescape(item.split("=")[1]);
        })
    }
    return theRequest;
}

export function dateStrFormat(str,format){
    str = str || "";
    let fullyear,month,date,hours,minute,second,ret;
    let a = str.match(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})/i);
    let b = str.match(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/i);
    if(b && b.length>6){
        fullyear = b[1];
        month = b[2];
        date = b[3];
        hours = b[4];
        minute = b[5];
        second = b[6];
    }
    else if(a && a.length>5){
        fullyear = a[1];
        month = a[2];
        date = a[3];
        hours = a[4];
        minute = a[5];
        second = "00";
    }
    ret = format;
    ret = ret.replace(/YYYY/g, fullyear);
    ret = ret.replace(/mm/g, month);
    ret = ret.replace(/dd/g, date);
    ret = ret.replace(/hh/g, hours);
    ret = ret.replace(/ii/g, minute);
    ret = ret.replace(/ss/g, second);
    return ret;
}


/**
 * 将obj2 覆盖 obj1
 * @param obj1
 * @param obj2
 * @returns {*}返回一个新对象
 */
export function merageObj(obj1, obj2, options) {
    options = options || {};
    each(obj2, (iten, p) => {
        try {
            if (typeof (obj2[p]) == "object" && obj2[p] !== null && !options.disDeep) {
                if(!obj1[p] && options.disCheckOrigin){
                    obj1[p] = cloneObject(obj2[p])
                }
                else {
                    obj1[p] = merageObj(obj1[p], obj2[p], options);
                }
            } else if(obj1) {
                //如果忽略""，则""或者null的时候不予替换
                if (options.ignoreNull) {
                    if (obj2[p] !== "" && obj2[p] !== null&& obj2[p] !== undefined) {
                        obj1[p]=obj2[p]
                    }
                }
                //如果忽略undefined
                else if (options.ignoreUndefined) {
                    if (obj2[p] !== undefined) {
                        obj1[p]=obj2[p]
                    }
                }
                else {
                    if (obj1[p] !== obj2[p]) {
                        obj1[p]=obj2[p]
                    }
                }
            }
        } catch (e) {
            if(!options.ignoreNull && obj1) {

                obj1[p]=obj2[p]
            }
        }
    });

    if (options.compareArray && isArray(obj1)) {
        each(obj1, (item, p) => {
            if (obj2[p] === undefined) {
                obj1.splice(p,1);
            }
        });
    }
    return obj1;
}


/**
 * 将obj2 覆盖 obj1
 * @param obj1
 * @param obj2
 * @returns {*}返回一个新对象
 */
export function cloneObject(obj2, options) {
    options = options || {};
    if(options.mode == 'json'){
        return jsonParse(jsonString(obj2));
    }
    let obj1 = {};
    if(isArray(obj2)){
        obj1 = [];
    }
    each(obj2, (item, p) => {
        if (typeof (item) == "object") {
            obj1[p] = cloneObject(item);
        } else {
            obj1[p] = item;
        }
    });
    return obj1;
}


export function clearObj(obj) {
    each(obj, (item, index) => {
        if (isObject(item)) {
            clearObj(item);
        } else {
            obj[index]="";
            Vue.set(obj, index, "");
        }
    });
}

/**
 * 判断两个对象是否相等
 * @param obja
 * @param objb
 * @return {boolean}
 */
export function equals(obja, objb) {
    let ret = true;
    if (isObject(obja) && isObject(objb)) {
        //查询A对象拥有的值，b对象是否用
        each(obja, (item, i) => {
            if (objb[i] != item) {
                ret = false;
                return false;
            }
        });
        if (ret) {
            //查询B对象拥有的值，A对象是否用
            each(objb, (item, i) => {
                if (obja[i] != item) {
                    ret = false;
                    return false;
                }
            });
        }
    }

    return ret;
}


export function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }

    return 0
}

export function isArray(o){
    return Object.prototype.toString.call(o) === '[object Array]';
}

export function isFunction (arg) {
    return typeof arg === 'function';
}

export function isString(arg) {
    return typeof arg === 'string';
}

export function isNumber(arg) {
    return typeof arg === 'number';
}

export function isObject(arg){
    return typeof arg === 'object' && arg !== null;
}

export function parsePrice(amount){
    let ret = "";
    amount = amount ? amount.toString() : "0";
    let arr = amount.split(".");
    if(arr.length>1){
        ret = arr[1]
        ret = ret.substr(0,2);
        if(ret.length<2){
            ret = ret + "0";
        }
        ret = arr[0] + "." + ret;
    }
    else{
        ret = amount + ".00";
    }
    return ret;
}


export function jsonString(obj) {
    let ret = obj;
    if(isObject(obj)){
        try{
            ret = JSON.stringify(obj);
        }
        catch (e) {

        }
    }
    return ret;
}


export function jsonParse(content){
    try{
        content = JSON.parse(content);
    }
    catch (e) {
        content = {};
    }
    return content;
}

export function jsonStringify(content){
    try{
        content = JSON.stringify(content);
    }
    catch (e) {
        content = "{}";
    }
    return content;
}


export function arrayHas(arrA,arrB){
    let ret = false;
    if(isArray(arrA) && isArray(arrB) && arrA.length>0 && arrB.length>0){
        arrA.every(item=>{
            if(arrB.indexOf(item)>-1){
                ret = true;
                return false;
            }
            return true;
        })
    }
    return ret;
}

/**
 * 版本号判断
 * @param v1
 * @param v2
 * @param disEqual(判断是否等于,不穿)
 * @returns {boolean}  disEqual ？ （v2>v1 ? true : false） ： （v2>=v1 ? true : false）
 */
export function versionCompare(v1,v2,disEqual){
    if(v1 == v2 && !disEqual){
        return true;
    }
    else if(v1 && v2 && v1.split && v2.split){
        let v1A = v1.split(".");
        let v2A = v2.split(".");
        let ret = false;
        for(var n=0;n<v1A.length;n++){
            if(v2A[n] > v1A[n]){
                ret = true;
            }else if(v2A[n] < v1A[n]){
                break;
            }

        }
        return ret;
    }
    else{
        return false;
    }
}

/**
 * 对象排序
 * @param obj
 * @returns {{}}
 */
export function objKeySort(obj) {//排序的函数
    let newkey = Object.keys(obj).sort();
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newObj = {};//创建一个新的对象，用于存放排好序的键值对
    newkey.forEach(key=>{
        let item = obj[key];
        newObj[key] = item//向新创建的对象中按照排好的顺序依次增加键值对
    })
    return newObj;//返回排好序的新对象
}

/**
 * 根据对象生成一个key，排序了对象
 * @param obj
 * @returns {boolean}
 */
export function objToString(obj,options){
    options = options || {};
    let ret = false;
    if(isObject(obj)){
        obj = cloneObject(obj);
        obj = objKeySort(obj);
        if(options.filter){
            options.filter.forEach(filterKey=>{
                if(obj[filterKey]){
                    delete obj[filterKey];
                }
            })
        }
        ret = jsonString(obj);
    }

    return ret
}


/**
 * 随机数组其中一个元素
 * @param arr
 * @returns {*}
 */
export function randomArr(arr){
    return arr[Math.round(Math.random()*(arr.length-1))];
}

export function formatPresetData(data){
    if (data){
        let now = new Date().getTime();
        let interval = 60 * 60 * 24 * 1000 * data.interval;
        let index = 0;
        if (now<=data.startTime){
            if (data.data[0].length){
                return data.data[0];
            } else {
                return false;
            }
        } else {
            let gap = now - data.startTime;
            index = Math.ceil(gap/interval);
            console.log(data)
            let list = data.data[index-1] || data.data[0];
            if (list.length){
                return list;
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}
