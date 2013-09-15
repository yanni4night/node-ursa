/**
 * handler.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
var fs = require("fs"),
    mime = require('mime'),
    sysPath = require('path'),
    config = require('./config'),
    utils = require('./utils'),
    filter = require('./filter'),
    Render = require('./tool/render'),
    Stamp = require('./tool/timestamp');


module.exports = {
    /**
     * 显示模板列表
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    index: function(req, res) {
        var htmlFiles = config.get('require_html_modules') || [];

        //Index page
        //  var indexFile=sysPath.join(__dirname,"../","template/index.tpl");


        htmlFiles.forEach(function(file, index) {
            var realPath = sysPath.join(config.templateDir, file + "." + config.templateSuffix);
            if (!fs.existsSync(realPath)) {
                console.warn("%s does not exist".warn, realPath);
                htmlFiles.splice(index, 1);
            } else {
                htmlFiles[index] = file; //realPath.replace(sysPath.join(".",config.templateDir),"");
            }
        });

        try {
            var render = new Render(sysPath.join(__dirname, "../", "template"));
            var content = render.render('index', {
                tpls: htmlFiles
            });
            content = filter(content, null, null);
            return res.send(content);
        } catch (e) {
            return res.send(500, String(e));
        }
    },

    /**
     * 处理后缀ut的请求，输出模板。
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    tpl: function(req, res) {
        var startTime = +new Date;
        var pathname = req.pathname || "";
        pathname = pathname.replace(/\.m|\.ut/ig, '');

        var render = new Render(config.templateDir);
        try {
            var content = render.render(pathname);
            content = filter(content, null, {
                //AOP
            });


            if (config.get("server_add_timestamp")) {
                var stamp = new Stamp(".");
                content = stamp.addToHtmlLink(content);
                content = stamp.addToHtmlScript(content);
                content = stamp.addToCssUrl(content, ".");
            }

            res.send(content);
            console.log("200 %s %dbytes %dms".info, pathname, content.length, new Date - startTime);
        } catch (e) {
            res.send(500, String(e));
        }
        return;
    },
    /**
     * 输出模板数据，以供修改.
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    m: function(req, res) {
        var pathname = req.pathname || "";
        //This template is not the app's but the node-ursa's.
        var render = new Render(sysPath.join(__dirname, "../", "template"));

        //要输出的json
        var dataFile = sysPath.join(config.dataDir, pathname.replace(/\.m$/i, '.json'));

        return fs.readFile(dataFile, function(err, json) {
            json = json || "";
            try {
                var content = render.render('mgr', {
                    data: json,
                    tpl: sysPath.join(".", pathname.replace(/\.m$/i, '.json'))
                });
                content = filter(content);
                return res.send(content);
            } catch (e) {
                return res.send(500, String(e));
            }
        });

    },
    /**
     * 保存提交来的json数据。
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    data_so: function(req, res) {
        if (req.method !== 'POST') {
            return res.send(405, "GET is not supported");
        }
        var tpl = req.body.tpl;
        var data = req.body.data;

        if (!tpl || !data) {
            return res.send("Lack of parameters!");
        }

        //校验格式
        try {
            JSON.parse(data)
        } catch (e) {
            return res.send("<pre>" + data + "</pre> JSON failure");
        };
        //写入文件
        return fs.writeFile(sysPath.join(config.dataDir, tpl), data, function(err) {
            if (err) {
                return res.send("Save failed");
            } else {
                return res.redirect('/');
            }
        });
    },
    /**
     * 处理其它请求，如图片、脚本、样式表
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    none: function(req, res) {
        var startTime = +new Date;
        var pathname = req.pathname || "";
        var file = sysPath.join(".", pathname);

        //Check exists
        return fs.exists(file, function(exists) {
            if (exists) {
                var contentType = mime.lookup(file);
                //Read file
                return fs.readFile(file, function(err, content) {
                    if (err) {
                        return res.send(500, file + " read failed:" + String(err));
                    } else {
                        try{
                        if (/text|javascript/ig.test(contentType)) {
                            content = content.toString(); //Buffer转String，不影响String自转。
                            content = filter(content, null);

                            if (config.get("server_add_timestamp") && /css|less/i.test(contentType)) {
                                var stamp = new Stamp(".");
                                content = stamp.addToCssUrl(content,sysPath.dirname(file));
                            }

                            //非文本内容应该自带Content-Length报头
                            //处理后必须再计算一次长度
                            //headers['Content-Length'] = Buffer.byteLength(content);
                        }
                        res.send({
                            'Content-Type': contentType,
                            'Content-Length': content.length
                        }, content);

                        console.log("200 %s %dbytes %dms".info, pathname, content.length, +new Date - startTime);
                        }catch(e){
                            console.error("%s".error,e)
                            res.send(500,String(e));
                        }
                        return;
                    }
                });
            } else {
                return res.send(404, file + ' not found!')
            }
        });
    }
};