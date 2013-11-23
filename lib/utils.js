/**
 * utils.js
 *
 *common tools.
 *
 * changelog
 *  2013/09/14:remove getTimeStamp&renderFile functions.
 *  2013/09/15:fixed walkSync function to handle just files except directories;add 'cleanDir' function.
 *  2013/10/02:add 'rmComment' function.deprecated 'cleanDir' function.
 *  2013/10/11:add 'getTimeStamp' back.
 *  2013/11/02:add 'cloneIgnoreFunction' function
 *
 * @author yinyong@sogou-inc.com
 * @version 0.0.6
 */

var colors = require('colors'),
  fs = require('fs'),
  util = require('util'),
  sysPath = require('path'),
  crypto = require('crypto');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  cmd: 'magenta' //Show the exec results
});



var _Utils = {
  /**
   * 判断String类型
   * @param  {String}  str [description]
   * @return {Boolean}     [description]
   */
  isString: function(str) {
    return typeof str === 'string' || (str && str.constructor === String);
  },
  /**
   * 复制对象属性，不包括函数成员
   * @param  {Object} src      
   * @param  {Object} dest     
   * @param  {Object} override 
   * @return {Object}          
   */
  cloneIgnoreFunction: function(src, dest, override) {
    if(!src||!dest)return dest;

    for (var e in src) {
      if (typeof src[e] !== 'function' && src.hasOwnProperty(e)) {
        dest[e] = override ? src[e] : (dest[e] || src[e]);
      }
    }
    return dest;
  },
  /**
   * 获取文件时间戳，文件不存在或读取出错则返回空字符串。
   * Security
   * @param  {String} file 文件路径
   * @return {String}      时间戳
   */
  getTimeStamp: function(file) {

    try {
      var content = (undefined === file) ? Date.now() : fs.readFileSync(file);
      var md5 = _Utils.md5(content);
      var ret = parseInt(md5.slice(0, 16), 16) % 997 + "" + parseInt(md5.slice(16), 16) % 997;
      //保证六位时间戳
      if (ret.length < 6) {
        ret = String(Math.pow(10, (6 - ret.length)) | 0).slice(1) + ret;
      }
      return ret;
    } catch (e) {
      console.error("[FATAL]getTimeStamp failed:%s".error, e)
      return "";
    }
  },
  /**
   * 去除多行注释
   * @param  {String} content 要去除多行注释的字符串
   * @return {String}         去除多行注释之后的字符串
   */
  rmComment: function(content) {
    if (typeof content === 'string' || (content && content.constructor === String)) {
      return content.replace(/\/\*[\s\S]*?\*\//img, "");
    } else {
      console.error("content should be a string,but it's a %s".error, typeof content);
      return content;
    }
  },
  /**
   * [md5 description]
   * @param  {String} text [description]
   * @return {String}      [description]
   */
  md5: function(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  },
  /**
   * [cleanDir description]
   * @param  {String} dir Directory path.
   * @return {RegExp}reg      useless files pattern
   * @deprecated [description]
   */
  cleanDir: function(dir, reg) {

    if (typeof dir !== 'string' || (dir && dir.constructor != String)) {
      return console.error("%s MUST BE a string.".error, dir);
    } else if (!util.isRegExp(reg)) {
      if (typeof reg === 'string' || (typeof reg === 'object' && reg.constructor == String)) {
        reg = new RegExp(reg, ""); //Auto convert
      }
    }

    var self = this;

    var dirList = fs.readdirSync(dir);
    if (!dirList.length) {
      return fs.rmdirSync(dir);
    }
    dirList.forEach(function(item, index) {
      var real = sysPath.join(dir, item);
      if (fs.statSync(real).isDirectory()) {
        self.cleanDir(real, reg);
      } else if (fs.statSync(real).isFile()) {
        reg.test(item) && fs.unlinkSync(real);
      }
      if ((index === dirList.length - 1) && !fs.readdirSync(dir).length) {
        fs.rmdirSync(dir);
      }
    });
  },
  /**
   * 遍历一个目录下的所有符合条件的文件，并放在指定数组内。
   * @param  {String} path        要搜索的目录
   * @param  {Array} collections 文件名容器
   * @param  {RegExp} filter 文件名过滤规则
   */
  walkSync: function(path, collections, filter) {
    if(!fs.existsSync(path)){
      return;
    }
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      var stats = fs.statSync(sysPath.join(path, item));
      if (stats.isDirectory()) {
        _Utils.walkSync(sysPath.join(path, item), collections, filter);
      } else if (stats.isFile()) {
        //如果filter存在并为正则表达式，则过滤文件名
        if (util.isRegExp(filter) && !filter.test(item));
        else {
          collections.push(sysPath.join(path, item));
        }

      }
    });
  },
  /**
   * [arrayUniq description]
   * @return {[type]} [description]
   */
  arrayUniq: function(arr) {
    if (util.isArray(arr)) {
      var obj = {}, ret = [];
      arr.forEach(function(it, index) {
        obj[it] = 1;
      });
      for (var e in obj) ret.push(e);
      return ret;
    }
    return arr;
  }
};


module.exports = _Utils;