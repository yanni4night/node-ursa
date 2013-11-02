/**
 * ursa.js
 *
 * changelog
 * 2013/09/17:增加proxy匹配
 * 2013/11/02:重写proxy URL补全策略
 *
 * @author yinyong#sogou-inc.com
 * @version 0.0.2
 */

var sysUrl = require('url'),
    request = require('request'),
    server = require("./http/server"),
    handler = require("./handler"),
    utils = require("./utils"),
    util = require("util"),
    config = require("./config"),
    Request = require("./http/request"),
    Response = require("./http/response"),
    logger = require("./tool/logger"),
    proxys=require("./proxy").proxys;

var _ursa = {
    routers: [],
    /**
     * [listen description]
     * @param  {Number} httpPort 
     * @param  {Number} httpsPort
     */
    listen: function(httpPort,httpsPort) {
        var self = this;
        return server.run(httpPort, httpsPort,function(req, res) {
            if(config.get('enable_proxy'))
                !self._proxy.call(self, req, res) && !self._route.call(self, req, res);
            else
                self._route.call(self,req,res);
        });
    },
    /**
     * 从配置文件中获取proxy信息
     * @return {Object} 路径proxy对象
     */
    resolveProxy: function() {
        var proxy = config.get("proxy");
        if (typeof proxy !== 'object') return {};
        return proxy;
    },
    /**
     *
     * @param {Request}
     * @param {Response}
     */
    _proxy: function(req, res) {
        var proxy = this.resolveProxy();

        for (var e in proxy) {
            var directUrl = proxy[e];

            for (var i = 0; i < proxys.length; ++i) {
                var p = proxys[i];
                if (p.test(e, directUrl, req)) {
                    logger.logInfo("proxy:%s".info, req.path);
                    //Static resource
                    if (/\.(png|jpe?g|bmp|gif|swf|mp3|mp4|ico|css|js)$/i.test(req.pathname)) {
                        //静态资源直接302
                        res.redirect(directUrl);
                        return true;
                    }
                    directUrl = p.constructUrl(e, directUrl, req);
                    if (!/^\w+:\/\//.test(directUrl)) {
                        //带"//"的URL根据当前HTTP模式补协议
                        //deprecated
                        //support url starts with [://] or [//] or nothing
                        switch (true) {
                            case (/^\/\//.test(directUrl)):
                                directUrl = "http:" + directUrl;
                                break;
                            case (/^:\/\//.test(directUrl)):
                                directUrl = "http" + directUrl;
                                break;
                            default:
                                directUrl="http://"+directUrl;
                        }
                    }
                    return this._grap(req, res, directUrl);
                } // if (p.test(e))
            }
        }
        return false;
    },
    /**
     * Proxy grap resouce
     * @param  {Request} req
     * @param  {Response} res
     * @param  {String} url
     *
     * @todo PUT support
     */
    _grap: function(req, res, url) {
        request({
            url: url,
            encoding: null
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                return res.send(response.headers, body);
            } else {
                logger.logError("proxy:%s failed".error, url);
                return res.send(String(error));
            }
        });
        return true;
    },
    /**
     * 路径匹配
     *
     * 先进行proxy匹配，再进行route匹配
     * @param  {Request} req [description]
     * @param  {Response} res [description]
     */
    _route: function(req, res) {
        var pathname = req.pathname;

        var routersLen = this.routers.length;
        for (var i = 0; i < routersLen; ++i) {
            var router = this.routers[i];
            //忽略参数，直接比较pathname
            if (util.isRegExp(router.pattern)) {
                var tested = router.pattern.test(pathname);
            } else {
                var tested = (router.pattern === pathname);
            }

            if (tested) {
                //todo:仅支持单拦截器
                return router.handler(req, res);
            }
        }
        //未有任何拦截
        return handler.none(req, res);
    },
    /**
     * 注册路由回调，不区分GET和POST。
     * @param  {RegExp|String}   path    
     * @param  {Function} handler
     */
    register: function(path, handler) {
        if (!util.isRegExp(path)&&!utils.isString(path)){
            logger.logError("path must be a regexp or a string");
            return false;
        }
        this.routers.push({
            pattern: path,
            handler: handler
        });
        return true;
    }
};

//注册路由
_ursa.register('/', function(req,res){handler.index(req,res);});
_ursa.register(/\.ut$/, function(req,res){handler.tpl(req,res);});
_ursa.register(/\.m$/, function(req,res){handler.m(req,res);});
_ursa.register(/data\.so$/, function(req,res){handler.data_so(req,res);});

module.exports.getInstance = function() {
    return _ursa;
};