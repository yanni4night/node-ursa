/**
 * utils.js
 *
 * changelog
 *  2013/09/14:remove getTimeStamp&renderFile functions.
 *  2013/09/15:fixed walkSync function to handle just files except directories;add 'cleanDir' function.
 *
 * @author yinyong@sogou-inc.com
 * @version 0.0.3
 */

var colors = require('colors')
,fs = require('fs')
,util = require('util')
,sysPath = require('path')
,crypto = require('crypto');

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
  cmd:'magenta'//Show the exec results
});



var Util = {
  /**
   * 判断String类型
   * @param  {[type]}  str [description]
   * @return {Boolean}     [description]
   */
  isString:function(str){
    return typeof str==='string'||(str&&str.constructor===String);
  },
  /**
   * [md5 description]
   * @param  {[type]} text [description]
   * @return {[type]}      [description]
   */
  md5: function(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  },
    /**
   * [cleanDir description]
   * @param  {String} dir Directory path.
   * @return {RegExp}reg      useless files pattern
   */
  cleanDir:function(dir, reg) {

    if(typeof dir!=='string'||(dir&&dir.constructor!=String)){
      return console.error("%s MUST BE a string.".error,dir);
    }else if(!util.isRegExp(reg)){
        if(typeof reg==='string'||(typeof reg==='object'&&reg.constructor==String))
        {
            reg=new RegExp(reg,"");//Auto convert
        }
    }

    var self=this;

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
  walkSync: function(path, collections,filter) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      var stats = fs.statSync(sysPath.join(path, item));
      if (stats.isDirectory()) {
        Util.walkSync(sysPath.join(path, item), collections,filter);
      } else if (stats.isFile()) {
        if(util.isRegExp(filter)&&!filter.test(item));
        else {collections.push(sysPath.join(path, item));}

      }
    });
  }
};


module.exports = Util;