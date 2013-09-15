/**
 * utils.js
 *
 * changelog
 *  2013/09/14:remove getTimeStamp&renderFile functions.
 *  2013/09/15:fixed walkSync function to handle just files except directories.
 *
 * @author yinyong@sogou-inc.com
 * @version 0.0.3
 */

var colors = require('colors');
var fs = require('fs');
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
   * [walkSync description]
   * @param  {[type]} path        [description]
   * @param  {[type]} collections [description]
   * @return {[type]}             [description]
   */
  walkSync: function(path, collections) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      var stats = fs.statSync(systemPath.join(path, item));
      if (stats.isDirectory()) {
        Util.walkSync(systemPath.join(path, item), collections);
      } else if (stats.isFile()) {
        collections.push(systemPath.join(path, item));
      }
    });
  }
};


module.exports = Util;