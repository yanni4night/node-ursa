/**
 * deps.js
 *
 * changelog
 * 2013-11-23[18:53:42]:created
 *
 * @info yinyong,osx-x64,UTF-8,10.129.173.11,js,/Users/yinyong/work/node-ursa/lib/tool
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 * @since 0.0.1
 */

var config = require('../config');
var path = require('path');
var fs = require('fs');
var utils = require('../utils');


var history={};
/**
 * Get css&tpl deps of a tpl
 * @param  {String} tpl
 * @return {Map}
 */
function _get(tpl, map) {
  //rm \/ at starts
  tpl=tpl.replace(/^[\\\/]/,'');
  if(history[tpl]){//prevent circle including
    throw new Error(tpl+" includes itself");
  }
  history[tpl]=1;
  /*  try {*/
  var content = fs.readFileSync(path.join(config.templateDir, tpl), 'utf-8');
  var deps = content.match(/\{%\s*(include|extends)\s+(['"])[\w\/]+?\.tpl\2\s*%\}/img/*/@require\s+(['"])?[\w\/]+?\.tpl\1?/img*/);
  deps && deps.forEach(function(item) {
    item.match(/(['"])(.+?)\1/);
    var file=RegExp.$2;
    map.push(file);
    _get(file, map);
  });
  /* } catch (e) {console.log(e)}*/
  return map;
}

module.exports = {
  get: function(tpl, callback) {
    var ret = [],
      callback = ('function' == typeof callback) ? callback : function() {};
    try {
      history=[];
      _get(tpl, ret);
    } catch (e) {
      callback(e);
    }
    callback(null, utils.arrayUniq(ret));
  },
  getSync: function(tpl) {
    var ret = [];
    history=[];
    return utils.arrayUniq(_get(tpl, ret));
  }
};