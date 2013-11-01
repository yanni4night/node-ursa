    /**
     * build.js
     * This file MUST NOT be used in server.
     *
     * Call require('build')() is fine.
     *
     * changelog
     * 2013/10/05:同步异步混合，加入LESS编译
     * 2013/10/30:使用async.js重写代码风格，使用内置YUICompressor压缩
     *
     * @author yinyong#sogou-inc.com
     * @version 0.0.4
     */

    var fs = require('fs'),
        config = require('./config'),
        sysPath = require('path'),
        sysUrl = require('url'),
        mkdirp = require('mkdirp'),
        filter = require('./filter'),
        utils = require('./utils'),
        util = require('util'),
        Stamp = require('./tool/timestamp'),
        Render = require('./tool/render'),
        less = require('./tool/less'),
        exec = require('child_process').exec,
        async = require('async'),
        yuicompressor = require('yuicompressor'),
        uglifyJS = require('uglify-js');

    //依赖的外部命令文件：requirejs(+r.js)
    var RJSPATH = sysPath.join(__dirname, "/../cli/r.js");

    //cache name
    var timeStampName;

    /**
     * 处理CSS的流程是：
     *
     * 取得CSS文件列表：
     * 1.如果manifest.json中有合法的require_css_modules定义，则使用该定义；
     * 2.否则搜索所有CSS文件。
     *
     * 对每一个要处理的CSS文件做如下处理：
     * 1.requirejs合并，并直接输出到目标目录./build；
     * 2.向url()加时间戳；
     * 3.替换变量；
     * 4.根据需要，压缩。
     */

    function makeCss(project, compress, callback) {
        console.log("[INFO]Handling CSS files.".info);
        var cssFiles = config.get('require_css_modules');
        if (!util.isArray(cssFiles)) {
            cssFiles = ['main'];
        }

        console.log("%d css files to handle".info, cssFiles.length);

        var buildCssPath = "./build/static/css/";

        var stamp = new Stamp("./build");

        //rewrite using async
        async.each(cssFiles, function(file, callback) {
            //配置文件中文件名相对于static/css/目录，并且不包括不包含
            //扩展名，这里要构建完整路径。
            var source = sysPath.join("./static/css", /\.css$/.test(file) ? file : (file + ".css"));

            console.log("Compiling %s".data, source);

            var target, content;

            return async.series([
                //必须存在
                function(callback) {
                    fs.exists(source, function(exists) {
                        exists ? callback() : callback(new Error(source + " does not exists"));
                    });
                },
                //构建目标文件路径
                function(callback) {
                    target = sysPath.join(buildCssPath, /\.css$/.test(file) ? file : (file + ".css"));
                    callback();
                },
                //生成目标文件路径
                function(callback) {
                    if (!fs.existsSync(sysPath.dirname(target))) {
                        mkdirp(sysPath.dirname(target), callback);
                    } else callback();
                },
                //合并
                function(callback) {
                    exec('node ' + RJSPATH + ' -o cssIn=' + source + ' out=' + target, callback);
                },
                //读取合并后文件
                function(callback) {
                    fs.readFile(target, 'utf-8', function(err, data) {
                        content = data;
                        callback(err);
                    });
                },
                //处理合并后文件
                function(callback) {
                    content = stamp.addToCssUrl(content, sysPath.dirname(target));
                    //替换/过滤处理
                    content = filter(content, project);
                    callback();
                },
                //根据需要，压缩
                function(callback) {
                    if (compress) {
                        yuicompressor.compress(content, {
                            charset: 'utf8',
                            type: 'css',
                            nomunge: true/*,
                            'line-break': 1024*/
                        }, function(err, data, extra) {
                            content = data;
                            callback(err);
                        });

                    } else callback();
                },
                //如果是压缩过的，则需要重新写入
                function(callback) {
                        fs.writeFile(target, content, callback);
                }
            ], callback) //series;
        }, function(err) {
            console.log("[INFO]CSS files done%s.".info, err ? (":" + err) : "");
            callback(err);
        });

    }

    /**
     *处理JS的流程是：
     *
     * 取得JS文件列表：
     * 1.如果manifest.json中有合法的require_modules或者require_js_modules定义，则使用该定义；
     * 2.否则不处理。
     *
     * 对每一个要处理的JS文件做如下处理：
     * 1.requirejs合并，并直接输出到目标目录./build；
     * 2.替换变量；
     * 3.根据需要，转义多字节字符到UTF-8；
     * 4.根据需要，压缩。
     */

    function makeJs(project, compress, callback) {

        console.log("[INFO]Handling javascript files.".info);

        //require_modules 用于兼容 https://github.com/sogou-ufo/ursa 工程
        if (undefined !== config.get('require_modules')) {
            console.warn("[DEPRECATED]you should use require_js_modules instead of require_modules.".warn);
        }

        var jsFiles = config.get('require_modules') || config.get('require_js_modules');

        if (!util.isArray(jsFiles)) {
            jsFiles = ['main'];
        }

        console.log("%d javascript files to handle".info, jsFiles.length);

        var buildJsPath = "./build/static/js/";

        async.each(jsFiles, function(file, callback) {
            //With ext
            var fileName = /\.js/.test(file) ? file : (file + ".js");
            var source = sysPath.join("./static/js/", fileName);

            console.log("Compiling %s".data, source);

            var target, content;

            async.series([
                //必须存在
                function(callback) {
                    fs.exists(source, function(exists) {
                        exists ? callback() : callback(new Error(source + " does not exists"));
                    });
                },
                //构建目标文件路径
                function(callback) {
                    target = sysPath.join(buildJsPath, fileName);
                    callback();
                },
                //建立目标文件目录
                function(callback) {
                    if (!fs.existsSync(sysPath.dirname(target))) {
                        mkdirp(sysPath.dirname(target), callback);
                    } else callback();
                },
                //合并
                function(callback) {
                    exec('node ' + RJSPATH + ' -o name=' + (sysPath.basename(source).replace(/\.js*?$/i, "")) + ' out=' + target + ' optimize=none baseUrl=' + sysPath.dirname(source), callback);
                },
                //读取合并后文件
                function(callback) {
                    fs.readFile(target, 'utf-8', function(err, data) {
                        content = data;
                        callback(err);
                    });
                },
                //处理合并后文件
                function(callback) {
                    content = filter(content, project);
                    if (config.get("js_utf8_escape", project)) {
                        content = content.replace(/[^\x00-\xff]/g, function(k) {
                            return escape(k).replace("%", "\\");
                        });
                    }
                    callback();
                },
                //根据需要，压缩
                function(callback) {
                    if (compress) {
                switch (true) {
                    case /uglify/i.test(config.get('js_compressor')):
                       try{
                         var result=uglifyJS.minify(content,{fromString:true});
                         content=result.code;
                         callback();
                     }catch(e){
                        callback(e);
                     }
                        break;
                    default:
                    //default using yuicompressor
                        yuicompressor.compress(content, {
                            charset: 'utf8',
                            type: 'js',
                            nomunge: true
                            /*,'line-break': 1024*/
                        }, function(err, data, extra) {
                            content = data;
                            callback(err);
                        });
                }

                    } else {
                        callback();
                    }
                },
                //如果压缩，则需要重新写入一次
                function(callback) {
                        fs.writeFile(target, content, callback);
                }

            ], callback);
        }, function(err) {
            console.log("[INFO]JavaScript files done%s.".info, err ? (":" + err) : "");
            callback(err);
        });

    }

    /**
     * 生成HTML的流程是：
     *
     * 取得HTML文件列表：
     * 1.如果manifest.json中有合法的require_html_modules定义，则使用该定义；
     * 2.否则搜索所有tpl文件。
     *
     * 以build/template下tpl文件为源文件，对每一个要处理的TPL文件做如下处理：
     * 1.调用模板引擎输出文件
     */

    function makeHtml(project, callback) {
        console.log("[INFO]Handling html files.".info);

        var htmlFiles = config.get('require_html_modules');

        var buildHtmlPath = "./build/html/";
        //{_token}类变量依赖于源文件的路径，因此这里还是从./template里获取
        //源tpl文件，而不是已经处理好的的./build/template目录
        var sourceTplPath = config.templateDir; //"./template/";

        if (undefined === htmlFiles) {
            console.warn("No require_html_modules defined,search all tpl files.".warn);
            //如果htmlFiles未定义或不合法，搜索所有模板。
            htmlFiles = [];
            utils.walkSync(sourceTplPath, htmlFiles, /\.tpl$/);

            htmlFiles.forEach(function(item, index) {
                htmlFiles[index] = sysPath.relative(sourceTplPath, item);
            });
        } else if (!util.isArray(htmlFiles)) {
            throw new Error("require_html_modules MUST BE an array.");
        }

        console.log("%d html files to handle".info, htmlFiles.length);

        //内部有异步方法，这里通过回调计数来判断完成
        //
        var render = new Render(sourceTplPath);
        var stamp = new Stamp("./build");

        async.each(htmlFiles, function(file, callback) {

            file = file.replace(/\.tpl$/i, "");
            var fileName = file + ".html",
                target, content;

            console.log("Compiling %s".data, fileName);

            target = sysPath.join(buildHtmlPath, fileName);

            async.series([
                //必须存在
                function(callback) {
                    if (!fs.existsSync(sysPath.dirname(target))) {
                        mkdirp(sysPath.dirname(target), callback);
                    } else {
                        callback();
                    }
                },
                //渲染
                function(callback) {
                    render.render(file, {}, function(err, data) {
                        content = data;
                        callback(err);
                    });
                },
                //处理
                function(callback) {
                    content = stamp.addToHtmlLink(content);
                    content = stamp.addToHtmlScript(content);
                    content = stamp.addToCssUrl(content, ".");
                    content = filter(content, project);
                    callback();
                },
                //写入文件
                function(callback) {
                    fs.writeFile(target, content, callback);
                }

            ], callback);
        }, function(err) {
            console.log("[INFO]Html files done%s.".info, err ? (":" + err) : "");
            callback();
        });
    }

    /**
     * 处理TPL的流程是：
     *
     * 取得TPL文件列表：
     * 1.搜索所有TPL文件。
     *
     * 对每一个要处理的TPL文件做如下处理：
     * 1.向link标签加时间戳；
     * 2.向script标签加时间戳；
     * 3.向url()加时间戳；
     * 4.替换变量
     */

    function makeTpl(project, callback) {
        console.log("[INFO]Handling templates.".info);
        var tplBuildDir = "./build/template/"
        var tpls = [];
        var stamp = new Stamp("./build");

        //处理所有TPL文件
        utils.walkSync(tplBuildDir, tpls, /\.tpl$/);

        console.log("%d tpl files to handle".info, tpls.length);

        async.each(tpls, function(tpl, callback) {
            console.log("Compiling %s".data, tpl);
            var content;
            async.series([

                function(callback) {
                    fs.readFile(tpl, 'utf-8', function(err, data) {
                        content = data;
                        callback(err);
                    });
                },
                function(callback) {
                    content = stamp.addToHtmlLink(content);
                    content = stamp.addToHtmlScript(content);
                    content = stamp.addToCssUrl(content, ".");
                    content = filter(content, project);
                    callback();
                },
                function(callback) {
                    fs.writeFile(tpl, content, callback);
                }

            ], callback);
        }, function(err) {
            console.log("[INFO]Templates done%s.".info, err ? (":" + err) : "");
            callback(err);
        });
    }

    /**
     * 按照manifest.json的配置处理对应LESS文件
     * @param  {Function} callback [description]
     */

    function makeLess(callback) {
        less.compileAll(callback);
    }
    /**
     * 生成工程。全部使用了阻塞/同步方法。
     *
     * 在工程的根目录下调用。
     *
     * @param  {String|null} project  定义在manifest.json中的项目
     * @param  {Boolean} compress 是否压缩js和css
     * @param  {Boolean} html     是否生成html
     */
    module.exports = function(project, compress, html) {
        //下面的文件或目录必须存在！
        var noLackFile = [config.manifestFile, config.templateDir, config.staticDir, config.dataDir, RJSPATH];
        for (var i = 0; i < noLackFile.length; ++i) {
            if (!fs.existsSync(noLackFile[i])) {
                console.error("[FATAL]%s does not exist! Be sure node-ursa is installed and " +
                    "you're in a node-ursa working dir.".error, noLackFile[i]);
                return;
            }
        }
        timeStampName = config.get("timestamp_name") || "t";
        //精确计算处理时间
        var startTime = process.hrtime();

        config.get("always_add_timestamp") && console.warn("[WARN]You set always_add_timestamp to TRUE.".warn);
        console.log("[INFO]Compress=%s.".info, compress ? "YES" : "NO");
        console.log("[INFO]Generate HTML=%s.".info, html ? "YES" : "NO");
        console.log("[INFO]JS Compressor=%s".info,config.get("js_compressor")||"yui");
        console.log("----------------------------------------".debug);

        //序列任务
        async.series([
            //处理LESS
            function(callback) {
                makeLess(callback);
            },
            //处理静态资源目录
            function(callback) {
                async.series([
                    function(callback) {
                        fs.rmdir("./build", function() {
                            callback();
                        }); //忽略失败
                    },
                    function(callback) {
                        fs.mkdir("./build", function() {
                            callback();
                        }); //忽略失败
                    },
                    function(callback) {
                        exec("cp -R ./static ./build/", callback);
                    },
                    function(callback) {
                        exec("cp -R " + config.templateDir + " ./build/template", callback);
                    }
                ], callback);
            },
            //处理CSS
            function(callback) {
                makeCss(project, compress, callback)
            },
            //处理JS
            function(callback) {
                makeJs(project, compress, callback)
            },
            //处理模板
            function(callback) {
                makeTpl(project, callback)
            },
            //按需生成HTML
            function(callback) {
                if (html) {
                    makeHtml(project, callback);
                } else callback();
            }
        ], function(err) {
            var diff = process.hrtime(startTime);
            console.log("[INFO]All done.Cost %ds.".info, (diff[0] + diff[1] / 1e9));
        });

    };