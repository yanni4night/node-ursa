/**
 * ursa.js
 *
 * changelog
 * 2013/09/17:增加proxy匹配
 *
 * @author yinyong#sogou-inc.com
 * @version 0.0.2
 */

var systemUrl = require('url'),
    request = require('request'),
    server = require("./http/server"),
    handler = require("./handler"),
    utils = require("./utils"),
    config = require("./config"),
    Request = require("./http/request"),
    Response = require("./http/response");

var _ursa = {
    routers: [],
    /**
     * [listen description]
     * @param  {Integer} port TCP port
     */
    listen: function(port) {
        var self = this;
        //todo:ugly
        return server.run(port, function(req, res) {
            self._route.call(self, req, res)
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
     * 路径匹配
     *
     * 先进行proxy匹配，再进行route匹配
     * @param  {Request} req [description]
     * @param  {Response} res [description]
     */
    _route: function(req, res) {
        var pathname = req.pathname;

        var proxy = this.resolveProxy();

        for (var e in proxy) {
            var directUrl = proxy[e];
            if (/^regex:/i.test(e)) {
                try {
                    var reg = new RegExp(e.slice(6), 'i');

                    if (reg.exec(req.path)) {

                        var pas = {};
                        for (var i = 0; i < 10; ++i) {
                            pas["$" + i] = RegExp["$" + i];
                        }

                        directUrl = directUrl.replace(/(\$\d)/g, pas["$1"] || "");

                        if (/\.(png|jpe?g|bmp|gif|swf|mp3|mp4|ico|css|js)$/i.test(pathname)) {
                            //静态资源直接302
                            return res.redirect(directUrl);
                        }

                        var parsedReqUrl = systemUrl.parse(req.path, true);
                        var parsedDirUrl = systemUrl.parse(directUrl, true);

                        for (var e in parsedReqUrl.query) {
                            parsedDirUrl.query[e] = parsedReqUrl.query[e];
                        }
                        //以query组建
                        delete parsedDirUrl.search;
                        parsedDirUrl.protocol = parsedDirUrl.protocol || "http";
                        console.log(parsedDirUrl);
                        var constructedUrl = systemUrl.format(parsedDirUrl);

                        console.log("proxy:[%s] to [%s]".info, req.path, constructedUrl);
                        return request({
                            url: constructedUrl,
                            encoding: null
                        }, function(error, response, body) {
                            if (!error && response.statusCode == 200) {
                                return res.send(response.headers, body);
                            } else {
                                console.error("proxy:%s failed".error, constructedUrl);
                                return res.send(String(error));
                            }
                        });
                    }

                } catch (e) {
                    console.error("%s".error, e);
                }
            } else if (/^exact:/i.test(e)) {

                if (e.slice(6) == req.path) {
                    console.log("proxy:[%s] to [%s]".info, req.path, directUrl);
                    return request({
                        url: directUrl,
                        encoding: null
                    }, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            return res.send(response.headers, body);
                        } else {
                            console.error("proxy:%s failed".error, directUrl);
                            return res.send(String(error));
                        }
                    });
                }
            } else {
                if (req.path.indexOf(e) > 0) {
                    console.log("proxy:[%s] to [%s]".info, req.path, directUrl);
                    return request({
                        url: directUrl,
                        encoding: null
                    }, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            return res.send(response.headers, body);
                        } else {
                            console.error("proxy:%s failed".error, directUrl);
                            return res.send(String(error));
                        }
                    });
                }
            }
        }

        var routersLen = this.routers.length;
        for (var i = 0; i < routersLen; ++i) {
            var router = this.routers[i];
            //忽略参数，直接比较pathname
            if (router.pattern.constructor == RegExp) {
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
     * @param  {[RegExp|String]}   path     [description]
     * @param  {Function} handler [description]
     */
    register: function(path, handler) {
        if (!path || !(path.constructor == RegExp || typeof path === 'string' || path.constructor == String)) {
            console.error("path must be a regexp or a string");
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
_ursa.register('/', handler.index);
_ursa.register(/\.ut$/, handler.tpl);
_ursa.register(/\.m$/, handler.m);
_ursa.register(/data\.so$/, handler.data_so);

module.exports.getInstance = function() {
    return _ursa;
};