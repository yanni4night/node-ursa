/**
 * build.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
/**
 * 生成工程
 * @param  {[String|null]} project  定义在manifest.json中的项目
 * @param  {[Boolean]} compress 是否压缩js和css
 * @param  {[Boolean]} html     是否生成html
 */
var fs = require('fs');
var config = require('./config');
var systemPath = require('path');
var sysUrl = require('url');
var mkdirp = require('mkdirp');
var filter = require('./filter');
var swig = require('swig');
var utils = require('./utils');
var execSync = require('exec-sync');


var YCPATH = systemPath.join(__dirname, "/../cli/yuicompressor.jar");
var RJSPATH = systemPath.join(__dirname, "/../cli/r.js");
var RPLJSPATH = systemPath.join(__dirname, "/../cli/rpl.js"); //@todo
/**
 * [makeCss description]
 */
function makeCss(compress) {
    console.log("Handling css files...".info);
    var cssFiles = config.get('require_css_modules') || [];
    var buildCssPath = "./build/static/css/";

    //@todo紧输出配置的文件
    cssFiles.forEach(function(file, index) {
        //配置文件中文件名相对于static/css/目录，并且不包括不包含
        //扩展名，这里要构建完整路径。
        var source = systemPath.join("./static/css", file + ".css");

        //不存在则跳过
        if (!fs.existsSync(source)) {
            console.error(source + ' does not exist'.error);
            return;
        }
        //仅创建必要目录
        if (!fs.existsSync(buildCssPath)) {
            mkdirp.sync(buildCssPath);
        }
        var target = systemPath.join(buildCssPath, file + ".css");
        //首先合并
        execSync('node ' + RJSPATH + ' -o cssIn=' + source + ' out=' + target);
        //读取文件过滤处理
        var content = fs.readFileSync(target, 'utf-8');
        content = filter(content).replace(/url\(['"]?.*?['"]?\)/img, function(k) {
            //取出url
            var url = k.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
            //这3种不替换
            if (/(^about:blank|^data:image|^http)/i.test(url)) {
                console.log(url + " won't add timeStamp".verbose);
                return k;
            }
            //解析URL获取GET参数
            var parsedUrl = sysUrl.parse(url, true);

            //图片途径相对于CSS文件
            var imgFilePath=systemPath.join(systemPath.dirname(target), parsedUrl.pathname);

            //计算时间戳，文件不存在则置空
            var timeStamp = "";
            if (fs.existsSync(imgFilePath))
                timeStamp = utils.getTimeStamp(imgFilePath);
            else
                console.log("%s does not exist but has been added to css.".warn,imgFilePath)
                //以t做参数，已存在则不添加
            if (undefined === parsedUrl.query.t) {
                //判断是否已经有GET参数
                if (parsedUrl.search) {
                    return "url(" + url + "&"+(config.get("timeStampName")||"t")+"=" + timeStamp + ")";
                } else {
                    return "url(" + url + "?"+(config.get("timeStampName")||"t")+"=" + timeStamp + ")";
                }
            } else {
                console.log(parsedUrl.pathname + " may already have a timeStamp".warn);
            }
            return k;
        });

        fs.writeFileSync(target, content);
        if (compress) {
            //最后压缩
            execSync('java -jar ' + YCPATH + ' --type css --charset utf-8 ' + target + ' -o ' + target);
        }

    });
    console.log("css files done.".info);
}

/**
 * [makeJs description]
 */
function makeJs(compress) {

    console.log("Handling javascript files...".info);

    var jsFiles = config.get('require_js_modules') || [];
    var buildJsPath = "./build/static/js/";

    jsFiles.forEach(function(file, index) {

        var source = systemPath.join("./static/js/", file + ".js");
        //不存在则跳过
        if (!fs.existsSync(source)) {
            console.error(source + ' does not exist'.error);
            return;
        }

        //仅创建必要目录
        if (!fs.existsSync(buildJsPath)) {
            mkdirp.sync(buildJsPath);
        }
        var target = systemPath.join(buildJsPath, file + ".js");
        //先合并
        execSync('node ' + RJSPATH + ' -o name=' + source + ' out=' + target + ' optimize=none');

        if (compress) {
            execSync('java -jar ' + YCPATH + ' --type js --charset utf-8 ' + target + ' -o ' + target);
        }
        var content = fs.readFileSync(target, 'utf-8');
        content = filter(content);
        //@todo:js有其它过滤需求么
        fs.writeFileSync(target, content);

    });
    console.log("javascript files done.".info);

}

/**
 * [makeHtml description]
 */
function makeHtml() {
    console.log("Handling html files...".info);
    var htmlFiles = config.get('require_html_modules') || [];
    var buildHtmlPath="./build/html/"

    htmlFiles.forEach(function(file, index) {

        var source =systemPath.join( "./template/" ,file + "."+config.templateSuffix);
        if(!fs.existsSync(source)){
            console.error(source +"does not exist".error);
            return;
        }
        if(!fs.existsSync(buildHtmlPath))
        {
            mkdirp.sync(buildHtmlPath);
        }
        var target =systemPath.join( buildHtmlPath ,file + ".html");
        var dataFile =systemPath.join(config.dataDir, file + ".json");

        var data = {};
        try {
            data = JSON.parse(fs.readFileSync(dataFile))
        } catch (e) {};
        var content=filter(utils.renderFile(data,source)).replace();
        //todo repalce
        /<link.* href=[\'"](.*?\.css)[\'"]/
        fs.writeFileSync(target, content);
    });

    console.log("html files done.".info);
}

//全部使用 同步方法
module.exports = function(project, compress, html) {

    var noLackFile = [config.manifestFile, config.templateDir, config.staticDir, config.dataDir];
    for (var i = 0; i < noLackFile.length; ++i) {
        if (!fs.existsSync(noLackFile[i])) {
            console.error(noLackFile[i] + " does not exist! Build failed!".error);
            return;
        }
    }

    //@todo:MS Windows cannot work
    execSync("rm -rf ./build");
    execSync("mkdir ./build");
    execSync("cp -R ./static ./build");
    execSync("cp -R ./template ./build/tpl");

    makeCss(compress);
    makeJs(compress);

    if (html) {
        makeHtml();
    }

    console.log("All done".info);

};