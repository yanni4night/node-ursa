/**
 * render.js
 * Render the template files.
 *
 * changelog
 * 2013/09/18:add engine setting.
 * 
 * @author yinyong#sogou-inc.com
 * @version 0.0.2
 */
var config=require('../config');
var utils=require('../utils');
var sysPath=require('path');
var fs=require('fs');

var _g_engine=undefined;

var _proto_ = {
	/**
	 * [getEngine description]
	 * @return {[type]} [description]
	 */
	_getEngine:function(){
		if (_g_engine) {
			return _g_engine;
		}
		var engineName=config.get("engine")||"twig";

		if(typeof engineName!=='string'&&engineName.constructor!=String){
			throw new Error("engine name muse be a string!");
		}

		var _engine = require(engineName)&&require(engineName).__express;
		if(!_engine||!typeof _engine==='function'){
			throw new Error(engineName+"is not a valid engine!");
		}
		return _g_engine=_engine;
	},
	/**
	 * [_renderFile description]
	 * @param  {[type]}   data     [description]
	 * @param  {[type]}   file     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	_renderFile: function(file,data,callback) {
		data.settings={"views":"."};
		return this._getEngine()(file,data,function(err,content){
			callback(err,content);
		});
	},
	/**
	 * [render description]
	 * @param  {[type]}   token    [description]
	 * @param  {[type]}   data     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	render: function(token,data,callback) {
		//remove . / beside token
		token=(token||"").replace(/(^\.?\/*|[\.\/]+$)/g, "");
		var source = sysPath.join(this.sourceDir, token + "." + config.templateSuffix);
		
		if (!fs.existsSync(source)) {
			return callback(new Error(source+" does not exist"),null);
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

		var _token = token;
		var tokens = _token.split(/\//);
		var _folder = tokens[0];
		var _subtoken = tokens.length > 0 ? tokens[1] : "";

		data._token = data._token || _token.replace(/\//g,'_');
		data._folder = data._folder || _folder;
		data._subtoken = data._subtoken || _subtoken;

		return this._renderFile(source,data,callback);
	}
};

var Render = function(sourceDir) {
	this.sourceDir=sourceDir;
};
Render.prototype = _proto_;
module.exports = Render;