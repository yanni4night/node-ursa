/**
 * server.js
 *
 * Http Server for ursa.
 *
 * changelog
 * 2013/11/02:https+http support;default ports supprt.
 *
 * @author yinyong#soguo-inc.com
 * @version 0.0.2
 */

var http = require("http"),
    https = require("https"),
    sysPath = require("path"),
    fs = require("fs"),
    url = require("url"),
    querystring = require("querystring"),
    async = require("async"),
    Request = require("./request"),
    Response = require("./response"),
    utils = require("../utils"),
    config = require("../config");
/*
var onRequest = function(req, res,handler) {
    //仅支持POST和GET
    switch (req.method.toLowerCase()) {
        case 'get':
            var request = new Request(req);
            var response = new Response(res);
            var parsedUrl = url.parse(req.url, true);

            utils.cloneIgnoreFunction(req, request);

            request.body = parsedUrl.query;
            request.path = parsedUrl.path;
            request.pathname = parsedUrl.pathname;
            request.search = parsedUrl.search;

            handler&&handler(request, response);
            break;
        case 'post':
            var request = new Request(req);
            var response = new Response(res);
            var info = "";
            var parsedUrl = url.parse(req.url, true);

            req.on('data', function(chunk) {
                info += chunk;
                if (info.length > 1e6) { //超过1MB的数据则丢弃
                    req.connection.destroy();
                }
            });

            req.on('end', function() {

                utils.cloneIgnoreFunction(req, request);
                console.log(info);
                request.body = querystring.parse(info);

                request.pathname = parsedUrl.pathname;
                request.path = parsedUrl.path;
                request.search = parsedUrl.search;
                handler&&handler(request, response);
            });
            break;
        default:
            res.writeHeader('405', req.method + 'is not supported')
            res.end('');
    }

}; //onRequest

var run = function(httpPort, httpsPort, handler) {
    var protocol = config.get("protocol");
    //validate protocol
    if (!~['http', 'https', 'both'].indexOf(protocol)) {
        protocol = "http";
    }

    if('https'===protocol){
        httpsPort=httpPort;
    }

    //validate
    isNaN(httpPort)&&(httpPort=+config.get("http_port")||config.defaultHttpPort);
    isNaN(httpsPort)&&(httpsPort=+config.get("https_port")||config.defaultHttpsPort);

    var options = {
        key: "",
        cert: ""
    };
    
    var task = [
        //read ssl key
        function(callback) {
            fs.readFile(sysPath.join(__dirname, "../../", '/cer/privatekey.pem'), function(err, data) {
                options.key = data;
                callback(err);
            });
        },
        //read ssl cert
        function(callback) {
            fs.readFile(sysPath.join(__dirname, "../../", '/cer/certificate.pem'), function(err, data) {
                options.cert = data;
                callback(err);
            });
        },
        //HTTPS
        function(callback) {
            //No idea whether it would throw exceptions
            try {
                var server = https.createServer(options, function(){onRequest(arguments[0],arguments[1],handler);});
                server.listen(httpsPort);
                callback();
            } catch (e) {
                callback(e);
            }
        },
        //HTTP
        function(callback) {
            //No idea whether it would throw exceptions
            try {
                var server = http.createServer(function(){onRequest(arguments[0],arguments[1],handler);});
                server.listen(httpPort);
                callback();
            } catch (e) {
                callback(e);
            }
        }
    ]; //task array

    if ("https" === protocol) {
        task.pop();
    } else if ("http" === protocol) {
        task.splice(0, 3);
    }

    //start task
    return async.series(
        task, function(err) {
            if (!err) {
                console.log("node-ursa is listening:".info);
                 (/^(both|http)$/.test(protocol)) && console.log("          at %d in HTTP.".info, httpPort);
                (/^(both|https)$/.test(protocol)) && console.log("          at %d in HTTPS.".info, httpsPort);
            }
        });
};
*/
var run=function(p,p2,handler){
    var connect=require('connect');
    var app = connect()
  .use(connect.logger('dev'))
  .use(connect.query())
  .use(connect.bodyParser())
  .use(function(req, res){
handler(req,new Response(res));
  });

http.createServer(app).listen(8899);
};
exports.run = run;