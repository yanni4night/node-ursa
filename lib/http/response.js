/**
 * response.js
 * @author:yinyong@sogou-inc.com
 * @version 0.0.2
 */


var filter = require("../filter"),
    utils=require("../utils");

//should be const
var _default_headers = {
    "content-type": "text/html;charset=utf-8",
    "cache-control": "no-cache",
    "connection": "close",
    "server": "node-ursa"
};
/**
 * HTTP头信息重写
 * @param  {Object} parent [description]
 * @param  {Object} child  [description]
 */
var extendHeaders = function(parent, child) {
    for (var e in parent) {
        e=e.toLowerCase();
        child[e] = child[e] || parent[e];
    }
    return child;
}

var _response_proto = {
    /**
     * 发送数据。有三种参数形式，content为必选项：
     * [statusCode,headers,content]
     * [statusCode,content]
     * [headers,content]
     * content在发送二进制时必须为Buffer，否则可为字符串。
     *
     * @param  {Number} statusCode [HTTP响应码]
     * @param  {Object} headers    [HTTP响应头]
     * @param  {Buffer|String} content    [Buffer类型数据，可传字符串]
     */
    send: function(statusCode, headers, content) {
        if (1 === arguments.length) { //仅content一个参数
            content=statusCode;
            statusCode = 200;
            headers = extendHeaders(_default_headers, {});
        } else if (2 === arguments.length) {
            switch (true) {
                //statusCode&content
                case (typeof statusCode === 'number' || statusCode.constructor == Number):
                   content=headers;
                    headers = extendHeaders(_default_headers, {});
                    break;
                    //headers&content
                case (typeof statusCode === 'object' && statusCode.constructor != Number):
                    content=headers;
                    headers = extendHeaders(_default_headers, statusCode);
                    statusCode = 200;
                    break;
                default:
                    console.error("parameters error".error);
            }
        }

        if (utils.isString(content)){
            //非文本内容应该自带Content-Length报头
            headers['content-length'] = Buffer.byteLength(content);
        }

        this.response.writeHeader(statusCode, headers);

        return this.response.end(content);
    },
    /**
     * 重定向
     * @param  {String} url [description]
     */
    redirect: function(url) {
        url = url || '/';
        this.response.writeHeader(302, {
            'content-type': 'text/html',
            'location': url
        });
        return this.response.end('');
    }
};

var Response = function(response) {
    this.response = response;
};

Response.prototype = _response_proto;

module.exports = Response;