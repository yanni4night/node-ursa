/**
 * timestamp.js
 *
 * changelog
 * 2013/10/11:remove getTimeStamp
 * 
 * @author yinyong#sogou-inc.com
 * @version 0.0.2
 */

var config = require("../config");
var filter = require("../filter");
var utils = require("../utils");
var sysUrl = require("url");
var sysPath = require("path");
var fs = require("fs");
var logger = require("./logger");


/**
 * 各种替换,do this after merge css/js and render html.
 */
var _proto_ = {
    /**
     * 从配置文件中获取时间戳字段名并使其合法化，默认为字母't'.
     * @return {String} 合法化的时间戳字段名.
     */
    _getTimeStampName: function() {
        var timeStampName = config.get("timestamp_name") || "t";
        //含空格问号为非法
        if (/([&\?\s])|(^\d+$)/.test(timeStampName)) {
            logger.logError("Invalid timestamp_name:%s,\"t\" is used instead.".error, timeStampName);
            return 't';
        }else if(!/^\w+$/.test(timeStampName))
        {
            logger.logWarn("A better timestamp name should be constructed of \"a-z0-9_\".".warn);
        }
        return timeStampName;
    },
    /**
     * 替换HTML文件中的相对链接
     * @param  {String} content [description]
     * @param  {String} reg     [description]
     * @return {String}         [description]
     */
    _addToHtmlCommon: function(content, reg) {
        if (!utils.isString(content)) {
            logger.logError("HTML content MUST BE a non-empty string,but it's a '%s';contact author.".error,typeof content);
            return content;
        }
        var self = this;
        var timeStampName = self._getTimeStampName();//Get once,use more

        return content.replace(reg, function(k) {
            //取出文件路径
            var urlBeforeReplace = RegExp.$2;

            var url = filter(urlBeforeReplace); //This url is relative to /

            var parsedUrl = sysUrl.parse(url, true);

            var forceAddTimestamp=config.get("always_add_timestamp");
            var hasProtocol= parsedUrl.protocol || /^\/\//.test(url);

            //有协议的或//开头的(相当于有协议)的不添加时间戳
            if (! forceAddTimestamp&&hasProtocol) {
                logger.logWarn("[NOTIMESTAMP]%s is not a relative path file.".warn, url);
                return k;
            }

            //以t做参数，已存在则不添加
            if (undefined === parsedUrl.query[timeStampName]) {
                var timeStamp = "";
                if (hasProtocol) {
                    timeStamp = +new Date;
                } else {
                    //从build里获取静态资源，因为这里的静态资源是生成好的，时间戳准确
                    var filePath = sysPath.join(self.staticResDir, parsedUrl.pathname || parsedUrl.pathname);
                    timeStamp = utils.getTimeStamp(filePath);
                }
                //判断是否已经有GET参数
                if (parsedUrl.search) {
                    return k.replace(urlBeforeReplace, urlBeforeReplace + "&" + timeStampName + "=" + timeStamp);
                } else {
                    return k.replace(urlBeforeReplace, urlBeforeReplace + "?" + timeStampName + "=" + timeStamp);
                }
            } else {
               logger.logWarn("[DUMPLICATE]%s may already have a timeStamp".warn, url);
            }
            return k;

        });
    },
    /**
     * 向HTML代码中的link添加时间戳。
     * @param {String} content HTML代码
     * @return {String} 添加完时间戳后的代码
     */
    addToHtmlLink: function(content) {
        var linkReg = /<link.* href=(['"])(.*?\.css.*?)\1/img;
        return this._addToHtmlCommon(content, linkReg);
    },
    /**
     * 向HTML代码中的script添加时间戳。
     * @param {String} content HTML代码
     * @return {String} 添加完时间戳后的代码
     */
    addToHtmlScript: function(content) {
        var scriptReg = /<script.* src=(['"])(.*?\.js.*?)\1/img;
        return this._addToHtmlCommon(content, scriptReg);
    },
    /**
     * 向CSS代码中的图片URL添加链接。
     * @param {String} content CSS代码内容
     * @param {String} baseDir CSS的目录，因为图片资源的路径是相对于CSS文件的。
     * @return {String} 添加完时间戳后的代码
     */
    addToCssUrl: function(content, baseDir) {
        var self = this;

        var timeStampName = self._getTimeStampName();
        if (!utils.isString(content)) {
            logger.logError("[FATAL]CSS content MUST bE a non-empty string,but it's a '%s';contact author.".error,typeof content);
            return content;
        }
        return content.replace(/url\(['"]?(.*?)['"]?\)/img, function(k) {
            //取出url
            var urlBeforeReplace = RegExp.$1;
            //重要：
            //类似@img_prefix@/static/img/s.png之类的
            //路径在替换前后都可能找不到因而不能计算时间戳，
            //但是应用无project的filter是利用manifest.json中
            //对象的直接变量进行替换，应该可能找到源文件。
            var url = filter(urlBeforeReplace);

            //解析URL获取GET参数
            var parsedUrl = sysUrl.parse(url, true);

            //#,about:blank或者是图片base64的均不加时间戳
            if (/(^about:blank|^data:|^#$|^\s*$)/i.test(url)) {
                logger.logWarn("[WARN]%s is not a valid URL.".warn,url);
                return k;
            }

            var forceAddTimestamp=config.get("always_add_timestamp") ;
            var hasProtocol= parsedUrl.protocol||/^\/\//.test(url);

            if (!forceAddTimestamp &&hasProtocol) {
               logger.logWarn("[NOTIMESTAMP]%s is not a relative path file.".warn, url);
                return k;
            }

            //以t做参数，已存在则不添加
            if (undefined === parsedUrl.query[timeStampName]) {
                 var timeStamp="";
                if (hasProtocol) {
                    timeStamp = +new Date;
                } else {
                    //图片途径相对于CSS文件
                    var imgFilePath = sysPath.join(baseDir, parsedUrl.pathname || parsedUrl.path || "");
                    //计算时间戳，文件不存在则置空
                    timeStamp = utils.getTimeStamp(imgFilePath);
                }

                //判断是否已经有GET参数
                if (parsedUrl.search) {
                    return "url(" + urlBeforeReplace + "&" + timeStampName + "=" + timeStamp + ")";
                } else {
                    return "url(" + urlBeforeReplace + "?" + timeStampName + "=" + timeStamp + ")";
                }
            } else {
                logger.logWarn("[DUMPLICATE]%s may already have a timeStamp".warn, url);
            }
            return k;
        });
    }
};

//staticResDir should be ./statis or ./build/.static etc. without css/js or img.
var Stamp = function(staticResDir) {
    this.staticResDir = staticResDir || ".";
};

Stamp.prototype = _proto_;

module.exports = Stamp;