/**
 * less.js
 *
 * @author yinyong@sogou-inc.com
 * @version 0.01
 */
var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    mkdirp = require('mkdirp'),
    less = require('less'),
    config = require('../config'),
    logger = require('./logger'),
    utils = require('../utils');


module.exports = {
    compileAll: function(callback) {
        var lessM = config.get('less') || {}, src, dest,files=lessM.files;
        if (utils.isString(lessM)) {
            src = less;
            dest = "./static/css"
        } else {
            src = lessM.src || "./static/less";
            dest = lessM.dest || "./static/css";
        }

        if(!util.isArray(files)){
            files=[];
        }

        if(!files.length){
            callback&&callback();
        }

        var lesses = files;

        var lessTotalCnt=lesses.length,lessCnt=0;
        lesses.forEach(function(item, index) {
            item=/\.less/.test(item)?item:item+".less";
            var source=path.join(src,item);
            var target = path.join(dest, item.replace(/\.less$/,'.css'));

            mkdirp.sync(path.dirname(target));

            var content = fs.readFileSync(source, 'utf-8');

            var parser = new(less.Parser)({
                paths: [src],
                filename: path.basename(source)
            });

            parser.parse(content, function(err, tree) {
                if (err) {
                    throw err;
                } else {
                    fs.writeFileSync(target, tree.toCSS());
                }
                if(++lessCnt===lessTotalCnt){
                    callback&&callback();
                }
            });
        });

    },
    /**
     * Try to compile less into css
     * @param  {String}   filepath dest css file path relative to .
     * @param  {Function} callback
     */
    compile: function(filepath, callback) {
        var lessM = config.get('less') || {}, src, dest,files=lessM.files, callback = ('function' === typeof callback) ? callback : function() {};
        if (utils.isString(lessM)) {
            src = less;
            dest = "./static/css"
        } else {
            src = lessM.src || "./static/less";
            dest = lessM.dest || "./static/css";
        }

        if(!util.isArray(files)){
            files=[];
        }

        if(!files.length){
            return callback();
        }

        files.forEach(function(lessFile,index){
            lessFile=/\.less$/.test(lessFile)?lessFile:(lessFile+".less");
            files[index]=path.join(lessFile);
        });
        var sub = path.relative(dest, filepath);
        var srcpath = path.join(src, sub).replace(/\.css$/, '.less');
        if (files.indexOf(sub.replace(/\.css$/,'.less'))>=0) {

            fs.exists(srcpath, function(exists) {
                if (exists) {
                    logger.logInfo("LESS:%s <= %s".info, filepath, srcpath);

                    fs.readFile(srcpath, 'utf-8', function(err, content) {
                        if (err) {
                            return callback(err);
                        }

                        var parser = new(less.Parser)({
                            paths: [src],
                            filename: path.basename(srcpath)
                        });

                        parser.parse(content, function(err, tree) {
                            if (err) {
                                return callback(err);
                            }

                            //At last
                            return mkdirp(path.dirname(filepath), function(err) {
                                return fs.writeFile(filepath, tree.toCSS(), function(err) {
                                    return callback(err);
                                });

                            });

                        });
                    });
                } else {
                    //Not a less target file
                    callback();
                }
            });
        } else {
            //Not at less dir
            callback();
        }
    }
};