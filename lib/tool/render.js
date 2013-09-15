/**
 * render.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
var config=require('../config');
var utils=require('../utils');
var sysPath=require('path');
var fs=require('fs');
var swig = require('swig');

//Important:禁止缓存
swig.setDefaults({
  cache: false
});

var _proto_ = {
	renderFile: function(data, file) {

		var tpl = swig.compileFile(file);
		return tpl(data);
	},
	render: function(token,data) {
		//remove . / beside token
		token=(token||"").replace(/(^\.?\/*|[\.\/]+$)/g, "");
		var source = sysPath.join(this.sourceDir, token + "." + config.templateSuffix);
		
		if (!fs.existsSync(source)) {
			throw source+"does not exist";
		}

		var commonDataFile=sysPath.join(config.dataDir,"_ursa.json");

		var commonData={};
		try {
			commonData = JSON.parse(fs.readFileSync(commonDataFile, "utf-8").replace(/\/\*[\S\s]*?\*\//g, ''));
		} catch (e) {
			console.warn("Common data file %s read failed:%s".warn, dataFile, e);
		} finally {
			commonData = commonData || {};
		}

		var dataFile = sysPath.join(config.dataDir, token + ".json");

		//未给定data参数则去json文件查找
		if (!data) {
			try {
				data = JSON.parse(fs.readFileSync(dataFile, "utf-8").replace(/\/\*[\S\s]*?\*\//g, ''));
			} catch (e) {
				console.warn("%s read failed:%s".warn, dataFile, e);
			}finally{
				data=data||{};
			}
		}

		//Extends data from common
		for(var e in commonData)
		{
			data[e]=data[e]||commonData[e];
		}

		//token应该是像index或common/menu之类的相对于template目录的无后缀文件路径，
		//以防万一，也支持像./index、/index和index.xxx之类的路径
		var _token = token;//.replace(/\//g, '_');
		var tokens = _token.split(/\//);
		var _folder = tokens[0];
		var _subtoken = tokens.length > 0 ? tokens[1] : "";

		data._token = data._token || _token.replace(/\//g,'_');
		data._folder = data._folder || _folder;
		data._subtoken = data._subtoken || _subtoken;

		var content = this.renderFile(data, source);
		return content;
	}
};

var Render = function(sourceDir) {
	this.sourceDir=sourceDir;
};
Render.prototype = _proto_;
module.exports = Render;