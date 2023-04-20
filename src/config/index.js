let out = {
    "lang": "zh_CN",
    "platform": "h5",
    //"env":"release",
    "env": "prod",
    "wxEnv": "prod",
    "ims": {
        //域名
        "host": "ims.yesaway.cn",
        //协议
        "protocol": "http://",
        //端口
        "port": "",
        //路径
        "path": "",
        //mock数据是否返回false
        "mockFail": false,
        //是否使用mock
        "mock": true,
    },
    "imsRelease": {
        //域名
        "host": "ims-release.yesaway.cn",
        //协议
        "protocol": "https://",
        //端口
        "port": "",
        //路径
        "path": "",
        //mock数据是否返回false
        "mockFail": false,
        //是否使用mock
        "mock": false,
    }
}

export default out;