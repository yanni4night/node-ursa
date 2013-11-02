/**
 * handler.js
 *
 * changelog
 * 2013/11/03:replace request to connect's,response reserved.
 * 
 * @author yinyong#sogou-inc.com
 * @version 0.0.2
 */
var fs = require("fs"),
    mime = require('mime'),
    sysPath = require('path'),
    sysUrl= require('url'),
    config = require('./config'),
    utils = require('./utils'),
    util = require('util'),
    filter = require('./filter'),
    Render = require('./tool/render'),
    plugin = require('./tool/plugin'),
    Stamp = require('./tool/timestamp'),
    less = require('./tool/less'),
    logger = require("./tool/logger");


module.exports = {
    /**
     * 显示模板列表
     * @param  {Request] req [description]
     * @param  {Response} res [description]
     * @see ./http/Response
     */
    index: function(req, res) {
        var htmlFiles = config.get('require_html_modules');
        if (!util.isArray(htmlFiles)) {
            logger.logError("require_html_modules MUST BE an array,but it is a %s".error, typeof htmlFiles);
            htmlFiles = [];
            utils.walkSync(config.templateDir, htmlFiles, /\.tpl$/i);
            htmlFiles.forEach(function(tpl, index) {
                htmlFiles[index] = sysPath.relative(config.templateDir, tpl);
            });
        }
        //遍历构建模板的完整路径
        htmlFiles.forEach(function(file, index) {
            //file可能带.tpl后缀也可能不带
            var realPath = sysPath.join(config.templateDir, file + (/\.tpl$/i.test(file) ? "" : ".tpl"));
            if (!fs.existsSync(realPath)) {
                logger.logWarn("%s does not exist".warn, realPath);
                htmlFiles.splice(index, 1);
            } else {
                htmlFiles[index] = file;
            }
        });

        //不使用模板达到夸模板引擎的目的
        var tplHtmlStr = "";
        htmlFiles.forEach(function(tpl, index) {
            tplHtmlStr += '<li><a class="title" href="{{tpl}}.ut">{{tpl}}</a><a class="mgr" href="{{tpl}}.m">mgr</a></li>'.replace(/\{\{tpl\}\}/g, tpl.replace(/\.tpl$/i, "")); //可能需要去掉.tpl后缀
        });

        fs.readFile(sysPath.join(__dirname, "../template/index.tpl"), 'utf-8', function(err, content) {
            if (err) {
                return res.send(500, String(err));
            }
            content = content.replace('__TPL_HTML_STR__', tplHtmlStr);
            return res.send(content);
        });
    },

    /**
     * 处理后缀ut的请求，输出模板。
     * @param  {Request} req
     * @param  {Response} res
     * @see ./http/Response
     */
    tpl: function(req, res) {
        var startTime = Date.now();
        var pathname =sysUrl.parse(req.url).pathname || "";
        pathname = pathname.replace(/\.ut$/i, '');

        var render = new Render(config.templateDir);

        return render.render(pathname, {
            //AOP
        }, function(err, content) {
            if (err) {
                logger.logError("%s".error, err);
                return res.send(500, String(err));
            }
            content = filter(content);
            //服务器输出时间戳
            if (config.get("server_add_timestamp")) {
                var stamp = new Stamp(".");
                content = stamp.addToHtmlLink(content);
                content = stamp.addToHtmlScript(content);
                content = stamp.addToCssUrl(content, ".");
            }

            content = plugin.compilePlugins(pathname, content);

            res.send(content);
            logger.logInfo("200 %s %dbytes %dms".info, pathname, content.length, new Date - startTime);
        });
    },
    /**
     * 输出模板数据，以供修改.
     * @param  {Request} req [description]
     * @param  {Response} res [description]
     * @see ./http/Response
     */
    m: function(req, res) {
        var pathname =sysUrl.parse(req.url).pathname || "";
        //This template is not the app's but the node-ursa's.
        var render = new Render(sysPath.join(__dirname, "../", config.templateDir));

        //要输出的json
        var dataFile = sysPath.join(config.dataDir, pathname.replace(/\.m$/i, '.json'));

        return fs.readFile(dataFile, function(err, json) {
            json = json || "";

            fs.readFile(sysPath.join(__dirname, "../template/mgr.tpl"), "utf-8", function(err, content) {
                if (err) {
                    return res.send(500, String(err));
                }

                var data = {
                    name: pathname.replace(/\.m$/i, ''),
                    data: json,
                    tpl: sysPath.join(".", pathname.replace(/\.m$/i, '.json'))
                };
                content = content.replace(/\{\{(name|data|tpl)\}\}/g, function(k) {
                    return data[RegExp.$1];
                });
                return res.send(content);
            });
        });
    },
    /**
     * 保存提交来的json数据。
     * @param  {Request} req [description]
     * @param  {Response} res [description]
     * @see ./http/Response
     */
    data_so: function(req, res) {
        if (req.method !== 'POST') {
            return res.send(405, "GET is not supported");
        }
        var tpl = req.body.tpl;
        var data = req.body.data;

        if (!tpl || !data) {
            logger.logError("has tpl:%s;has data:%s".error, !! tpl, !! data);
            return res.send("Lack of parameters!");
        }

        //校验格式
        try {
            JSON.parse(utils.rmComment(data))
        } catch (e) {
            return res.send("<pre>" + data + "</pre> JSON failure");
        };
        //写入文件
        return fs.writeFile(sysPath.join(config.dataDir, tpl), data, function(err) {
            if (err) {
                logger.logError("%s".error, err);
                return res.send("Save failed");
            } else {
                return res.redirect('/');
            }
        });
    },
    /**
     * 静态资源
     * @param  {Request} req [description]
     * @param  {Response} res [description]
     */
    _static: function(req, res) {
          //var startTime = Date.now();
        var pathname = sysUrl.parse(req.url).pathname;
        var file = sysPath.join(".", pathname);
        return fs.exists(file, function(exists) {
            if (exists) {
                var contentType = mime.lookup(file);
                //Read file
                return fs.readFile(file, function(err, content) {
                    if (err) {
                        logger.logError("%s".error, err);
                        return res.send(500, file + " read failed:" + String(err));
                    } else {
                        try {
                            //期望文本文件内存在替换变量
                            if (/text|javascript/ig.test(contentType)) {
                                content = content.toString(); //Buffer转String，不影响String自转。
                                content = filter(content, null);
                                //服务器模式输出时间戳
                                if (config.get("server_add_timestamp") && /css|less|styl/i.test(contentType)) {
                                    var stamp = new Stamp(".");
                                    content = stamp.addToCssUrl(content, sysPath.dirname(file));
                                }
                            }
                            res.send({
                                'content-type': contentType,
                                'content-length': content.length
                            }, content);

                          //  logger.logInfo("200 %s %dbytes %dms".info, pathname, content.length, Date.now() - startTime);
                        } catch (e) {
                            logger.logError("%s".error, e);
                            res.send(500, String(e));
                        }
                        return;
                    }
                });
            } else {
                return res.send(404, file + ' not found!')
            }
        });

    },
    /**
     * 处理其它请求，如图片、脚本、样式表
     * @param  {Request} req
     * @param  {Response} res
     * @see ./http/Response
     */
    none: function(req, res) {
        var pathname = sysUrl.parse(req.url).pathname || "";
        var file = sysPath.join(".", pathname);

        var self=this;

        if (/\.css$/i.test(file)) {
            less.compile(file, function(err) {
                if (err)
                    logger.logError("%s".error, err)
                self._static(req,res);
            });
        } else {
            self._static(req,res);
        }
    }
};