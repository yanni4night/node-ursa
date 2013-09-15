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
   * [walkSync description]
   * @param  {[type]} path        [description]
   * @param  {[type]} collections [description]
   * @return {[type]}             [description]
   */
  walkSync: function(path, collections) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      var stats = fs.statSync(sysPath.join(path, item));
      if (stats.isDirectory()) {
        Util.walkSync(sysPath.join(path, item), collections);
      } else if (stats.isFile()) {
        collections.push(sysPath.join(path, item));
      }
    });
  }
};


module.exports = Util;