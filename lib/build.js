    /**
     * build.js
     * This file MUST NOT be used in server.
     *
     * Call require('build')() is fine.
     *
     * changelog
     * 10/05:同步异步混合，加入LESS编译
     *
     * @author yinyong#sogou-inc.com
     * @version 0.0.3
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
        execSync = require('exec-sync');

    //依赖的外部命令文件：YUI&requirejs(+r.js)
    var YCPATH = sysPath.join(__dirname, "/../cli/yuicompressor.jar");
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
        if(!util.isArray(cssFiles)){
            cssFiles=['main'];
        }
/*        if (undefined === cssFiles) {
            console.warn("No require_css_modules defined,search all CSS files.".warn);
            cssFiles = [];
            //如果cssFiles未定义或不合法，搜索所有样式表文件。
            utils.walkSync("./static/css", cssFiles, /\.css$/);
            //为了统一处理，cssFiles为包含相对于./static/css目录的文件名，
            //可以包含也可以不包含CSS扩展名；
            //下面用于去掉./staitc/css。
            cssFiles.forEach(function(item, index) {
                cssFiles[index] = sysPath.relative("./static/css", item);
            });
        } else if (!util.isArray(cssFiles)) {
            throw new Error("require_css_modules MUST BE an array.");
        }
*/
        console.log("%d css files to handle".info, cssFiles.length);

        var buildCssPath = "./build/static/css/";

        var stamp = new Stamp("./build");

        cssFiles.forEach(function(file, index) {
            //配置文件中文件名相对于static/css/目录，并且不包括不包含
            //扩展名，这里要构建完整路径。
            var source = sysPath.join("./static/css", /\.css$/.test(file) ? file : (file + ".css"));

            console.log("Compiling %s".data, source);

            //不存在则跳过
            if (fs.existsSync(source)) {

                var target = sysPath.join(buildCssPath, /\.css$/.test(file) ? file : (file + ".css"));
                //仅创建必要目录
                if (!fs.existsSync(sysPath.dirname(target))) {
                    mkdirp.sync(sysPath.dirname(target));
                }
                //首先合并
                console.log("%s".cmd, execSync('node ' + RJSPATH + ' -o cssIn=' + source + ' out=' + target));
                //读取文件
                var content = fs.readFileSync(target, 'utf-8');
                //加时间戳
                content = stamp.addToCssUrl(content, sysPath.dirname(target));
                //替换/过滤处理
                content = filter(content, project);

                fs.writeFileSync(target, content);
                if (compress) {
                    //最后压缩
                    console.log("%s".cmd, execSync('java -jar ' + YCPATH + ' --type css --charset utf-8 ' + target + ' -o ' + target));
                }
            } else {
                throw new Error(source + ' does not exist');
            }
        });

        console.log("[INFO]CSS files done.".info);
        callback && callback();
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

        //检查是否是数组
  /*      if (undefined === jsFiles) {
            console.error("No require_modules or require_js_modules defined!".error);
            return;
        } else if (!util.isArray(jsFiles)) {
            throw new Error("require_modules or require_js_modules MUST BE an array.");
        }*/
        if(!util.isArray(jsFiles)){
            jsFiles=['main'];
        }

        console.log("%d javascript files to handle".info, jsFiles.length);

        var buildJsPath = "./build/static/js/";

        jsFiles.forEach(function(file, index) {
            //With ext
            var fileName = /\.js/.test(file) ? file : (file + ".js");
            var source = sysPath.join("./static/js/", fileName);

            console.log("Compiling %s".data, source);
            //不存在则跳过
            if (!fs.existsSync(source)) {
                throw new Error(source + " does not exist");
            }

            var target = sysPath.join(buildJsPath, fileName);
            //仅创建必要目录
            if (!fs.existsSync(sysPath.dirname(target))) {
                mkdirp.sync(sysPath.dirname(target));
            }
            //先合并
            var rjsCmd = ('node ' + RJSPATH + ' -o name=' + (sysPath.basename(source).replace(/\.js*?$/i, "")) + ' out=' + target + ' optimize=none baseUrl=' + sysPath.dirname(source));
            console.log("%s".cmd, execSync(rjsCmd));

            var content = fs.readFileSync(target, 'utf-8');
            content = filter(content, project);

            if (config.get("js_utf8_escape", project)) {
                content = content.replace(/[^\x00-\xff]/g, function(k) {
                    return escape(k).replace("%", "\\");
                });
            } //todo:js有其它过滤需求么
            fs.writeFileSync(target, content);

            if (compress) {
                console.log("%s".cmd, execSync('java -jar ' + YCPATH + ' --type js --charset utf-8 ' + target + ' -o ' + target));
            }
        });
        console.log("[INFO]JavaScript files done.".info);
        callback && callback();
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
        var htmlTotalCnt = htmlFiles.length,
            htmlCnt = 0;
        htmlFiles.forEach(function(file, index) {

            file = file.replace(/\.tpl$/i, "");
            var fileName = file + ".html";

            console.log("Compiling %s".data, fileName);

            var target = sysPath.join(buildHtmlPath, fileName);
            if (!fs.existsSync(sysPath.dirname(target))) {
                mkdirp.sync(sysPath.dirname(target));
            }

            var render = new Render(sourceTplPath);

            render.render(file, {}, function(err, content) {
                if (err) {
                    throw err;
                } else {
                    var stamp = new Stamp("./build");
                    content = stamp.addToHtmlLink(content);
                    content = stamp.addToHtmlScript(content);
                    content = stamp.addToCssUrl(content, ".");
                    content = filter(content, project);
                    fs.writeFileSync(target, content);
                }

                if (++htmlCnt === htmlTotalCnt) {
                    console.log("[INFO]Html files done.".info);
                    callback && callback();
                }
            });
            return;
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

        tpls.forEach(function(tpl, index) {
            console.log("Compiling %s".data, tpl);
            var content = fs.readFileSync(tpl, 'utf-8');
            content = stamp.addToHtmlLink(content);
            content = stamp.addToHtmlScript(content);
            content = stamp.addToCssUrl(content, ".");
            content = filter(content, project);
            fs.writeFileSync(tpl, content);
        });

        console.log("[INFO]Templates done.".info);
        callback && callback();
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
        var noLackFile = [config.manifestFile, config.templateDir, config.staticDir, config.dataDir, YCPATH, RJSPATH];
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
        console.log("----------------------------------------".debug);

        try {
            //首先预处理
            makeLess(function() {

                console.log("[INFO]Copy files.".info);
                execSync("rm -rf ./build");
                execSync("mkdir ./build");

                execSync("cp -R ./static ./build/"); //拷贝整个静态文件目录
                execSync("cp -R " + config.templateDir + " ./build/template"); //拷贝模板文件目录

                console.log("[INFO]Copy done.".info);
                console.log("----------------------------------------".debug);

                //顺序很重要：先处理静态文件
                //what the fuck
                makeCss(project, compress, function() {
                    makeJs(project, compress, function() {
                        makeTpl(project, function() {
                            if (html) {
                                makeHtml(project, function() {
                                    var diff = process.hrtime(startTime);
                                    console.log("[INFO]All done.Cost %ds.".info, (diff[0] + diff[1] / 1e9));
                                });
                            } //makeHtml
                            else {
                                var diff = process.hrtime(startTime);
                                console.log("[INFO]All done.Cost %ds.".info, (diff[0] + diff[1] / 1e9));
                            }
                        }); //makeTpl
                    }) //makeJs
                }); //makeCss
            }); //makeLess

        } catch (e) {
            console.log("%s".error, e)
        }

    };