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
var filter = require('./filter');
var swig = require('swig');
var utils = require('./utils');
var execSync = require('exec-sync');


function walk(path, files) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
        if (fs.statSync(path + systemPath.sep + item).isDirectory()) {
            walk(path + systemPath.sep + item, files);
        } else {
            files.push(path + systemPath.sep + item);
        }
    });
}
//全部同步方法
module.exports = function(project, compress, html) {

    var noLackFile = ["./manifest.json", "./template/", "./static/", "./_data/"];
    for (var i = 0; i < noLackFile.length; ++i) {
        if (!fs.existsSync(noLackFile[i])) {
            console.error(noLackFile[i] + " does not exist! Build failed!".error);
            return;
        }
    }

    var YCPATH = systemPath.join(__dirname, "/../cli/yuicompressor.jar");
    var RJSPATH = systemPath.join(__dirname, "/../cli/r.js");
    var RPLJSPATH = systemPath.join(__dirname, "/../cli/rpl.js"); //@todo

    //@todo:MS Windows cannot work
    execSync("rm -rf ./build");
    execSync("mkdir ./build");
    execSync("cp -R ./static ./build");
    execSync("cp -R ./template ./build");
    execSync("mv ./build/template ./build/tpl");
    if (html) {
        execSync("cp -R ./template ./build");
        execSync("mv ./build/template ./build/html");
    }

    console.log("Handling css files...".info);
    var cssFiles = config.get('require_css_modules') || [];

    cssFiles.forEach(function(file, index) {
        file = "./build/static/css/" + file + ".css";
        execSync('node ' + RJSPATH + ' -o cssIn=' + file + ' out=' + file);
        var content = fs.readFileSync(file, 'utf-8');
        content = filter(content);

        content.replace(/url\(['"]?.*?['"]?\)/img, function(k) {
            return "CCC";
            var url = k.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
            if (/(^about:blank|^data:image|^http)/i.test(url)) {
                console.log(url + " won't add timeStamp".verbose);
                return k; //这3种不替换
            }
            var parsedUrl = sysUrl.parse(url, true);

            var timeStamp = "";
            if (fs.existsSync(systemPath.join('.', parsedUrl.pathname)))
                timeStamp = utils.getTimeStamp(systemPath.join('.', parsedUrl.pathname));
            else
                console.log(parsedUrl.pathname + " does not exist but has been added to css.".warn)

            if (undefined === parsedUrl.query.t) {
                if (parsedUrl.search) {
                    return "url(" + url + "&t=" + timeStamp + ")";
                } else {
                    return "url(" + url + "?t=" + timeStamp + ")";
                }
            } else {
                console.log(pathname + "may already have a timeStamp".warn);
            }
            return k;
        });

        fs.writeFileSync(file, content);
        if (compress) {
            execSync('java -jar ' + YCPATH + ' --type css --charset utf-8 ' + file + ' -o ' + file);
        }

    });
    console.log("css files done.".info);

    console.log("Handling javascript files...".info);
    var jsFiles = config.get('require_js_modules') || [];

    jsFiles.forEach(function(file, index) {
        execSync('node ' + RJSPATH + ' -o name=' + file + ' out=./build/static/js/' + file + '.js optimize=none baseUrl=./build/static/js');
        file = "./build/static/js/" + file + ".js";

        if (compress) {
            execSync('java -jar ' + YCPATH + ' --type js --charset utf-8 ' + file + ' -o ' + file);
        }
        var content = fs.readFileSync(file, 'utf-8');
        content = filter(content);

        fs.writeFileSync(file, content);

    });
    console.log("javascript files done.".info);


    if (html) {
        console.log("Handling html files...".info);
        var htmlFiles = config.get('require_html_modules') || [];
        htmlFiles.forEach(function(file, index) {
            try {
                var tplFile = "./build/html/" + file + ".tpl";
                var dataFile = "./_data/" + file + ".json";
                var tpl = swig.compileFile(tplFile);

                var data = {};
                try {
                    data = JSON.parse(fs.readFileSync(dataFile))
                } catch (e) {};
                fs.writeFileSync(tplFile, filter(tpl(data)));
                execSync("mv " + tplFile + " " + tplFile.replace(/tpl$/, 'html'));
            } catch (e) {
                if (!config.get('html_force_output')) {
                    throw e;
                }
            }

        });

        //删除无用tpl
        var tplsInHtml = [];
        walk("./build/html", tplsInHtml);
        tplsInHtml.forEach(function(file, index) {
            if (!/\.html$/g.test(file)) {
                execSync("rm " + file);
            }
        });
        console.log("html files done.".info);
    }

    console.log("All done".info);

};