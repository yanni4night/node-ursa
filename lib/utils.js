/**
 * utils.js
 * @author yinyong@sogou-inc.com
 * @version 0.0.1
 */

var colors = require('colors');
var fs = require('fs');
var swig = require('swig');
var systemPath = require('path');
var crypto = require('crypto');



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
  error: 'red'
});

//Important:禁止缓存
swig.setDefaults({ cache: false });

var Util = {
  renderFile: function(data, file) {
    var tpl = swig.compileFile(file);
    return tpl(data);
  },
  getTimeStamp: function(file) {
    try {
      var content = fs.readFileSync(file);
      var md5 = Util.md5(content);
      var ret=parseInt(md5.slice(0, 16), 16) % 997 + "" + parseInt(md5.slice(16), 16) % 997;
      if(ret.length<6){
        ret=String(Math.pow(10,(6-ret.length))|0).slice(1)+ret;
      }
      return ret;
    } catch (e) {
      return "";
    }
  },
  md5: function(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  },
  walkSync: function(path, collections) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      if (fs.statSync(systemPath.join(path, item)).isDirectory()) {
        Util.walkSync(systemPath.join(path, item), collections);
      } else {
        collections.push(systemPath.join(path, item));
      }
    });
  }
};


module.exports = Util;