node-ursa
=========

node-ursa是一个用nodejs开发的、可以模拟服务器环境的前端开发环境,是[ursa](https://github.com/sogou-ufo/ursa)的js版本。使用node-ursa可以实时调试HTML页面，并能最终生成经过优化的，可用于线上环境的javascript,css和HTML模板文件，从而提高前端开发效率，降低前后端工作的耦合度。

##主要功能
 - HTTP服务器，提供模拟线上环境的本地开发服务器;
 - 变量替换，特别为开发环境和线上环境提供不同的页面参数;
 - 文件时间戳，避免静态资源文件被缓存造成线上修改无效;
 - 多模板引擎支持，提高HTML开发效率;
 - 模拟服务器数据;
 - 基于require.js的js和css文件合并;
 - 基于YUI的js和css文件压缩；
 - 支持LESS。

##依赖

 - Linux & MAC OS X
 - Java 1.6+
 - node.js+npm

##使用方法

####安装node-ursa

安装node-ursa需要[npm](https://npmjs.org)的支持，并以全局方式安装：
	
	#npm install -g node-ursa

这可能需要root权限。

####创建node-ursa项目

使用node-ursa命令创建工作目录：

	#node-ursa --init [path]

或者

	#node-ursa -i [path]
	
该命令会向指定目录(未指定则为当前目录)下创建项目的必要文件和目录：
 - manifest.json：工程的唯一配置文件;
 - template：HTML模板目录;
 - static:包含js，css和img三个子目录，储存静态资源文件;
 - _data:对应HTML模板的数据文件目录。

####启动开发服务器

	#node-ursa --start [port]

或者

	#node-ursa -s [port]

端口未指定则默认为8899。

访问服务器:http://localhost:[port]。通过配置可以支持https形式的访问，但不能同时以HTTP和HTTPS的形式访问。

####开发

以ut后缀访问静态模板文件，路径为相对于./template。以m后缀访问则进入对应模板的数据文件编辑页，你也可以直接编辑对应的.json文件。

####生成线上静态文件

	#node-ursa --build [project] --html  --compress

或者

	#node-ursa -hcb [project]

project参数请查看manifest.json指南。
	
./build下即是可以部署到线上的静态文件和HTML模板。

doc
=========
 - [Manifest.json配置文件详解](https://github.com/yanni4night/node-ursa/wiki/manifest.json%E6%96%87%E4%BB%B6%E8%AF%A6%E8%A7%A3)
 - [代码处理工序](https://github.com/yanni4night/node-ursa/wiki/%E4%BB%A3%E7%A0%81%E5%A4%84%E7%90%86%E5%B7%A5%E5%BA%8F)
 - [插件书写规则](https://github.com/yanni4night/node-ursa/wiki/%E6%8F%92%E4%BB%B6%E4%B9%A6%E5%86%99%E8%A7%84%E5%88%99)
 - [时间戳策略](https://github.com/yanni4night/node-ursa/wiki/%E6%97%B6%E9%97%B4%E6%88%B3%E7%AD%96%E7%95%A5)
 - [特殊模板变量](https://github.com/yanni4night/node-ursa/wiki/%E7%89%B9%E6%AE%8A%E6%A8%A1%E6%9D%BF%E5%8F%98%E9%87%8F)

changelog
=========
 - 2013-10-30:使用[async](https://github.com/caolan/async)重建build代码风格，使用内置[yuicompressor](https://github.com/yui/yuicompressor)
 - 2013-10-11:增加@tm:@
 - 2013-10-06:增加LESS预处理
 - 2013-10-02:增加enable_proxy开关和template_dir配置项，不再支持jade引擎，支持插件
 - 2013-09-20:增加js_utf8_escape选项，用以支持js多字节转义；模板引擎去缓存化配置
 - 2013-09-18:复用模板引擎给[express](https://github.com/visionmedia/express)的接口，支持所有express支持的模板引擎，已适配twig、ejs、jade
 - 2013-09-17:支持三种proxy模式
 - 2013-09-15:支持HTTPS访问；支持always_add_timestamp选项；优化了build的日志显示和命令行HELP信息，增加server_add_timestamp选项，支持_ursa.json公共数据文件。
 - 2013-09-14:添加了_token/_sutoken/_folder三个内部变量；支持{num}随机参量；规范化测试页面；合并Server和build的公共处理模块。
 - 2013-09-10:修复了计算时间戳时没有引用生成后静态文件的bug，加入了test工程，加入了生成Tpl模板的支持。
 - 2013-09-09:首次提交，服务器和build基本功能完成，时间戳，压缩合并功能完成。

 support
 =========
  - [node](https://github.com/joyent/node)
  - [commander](https://github.com/visionmedia/commander.js)
  - [mkdirp](https://github.com/substack/node-mkdirp)
  - [twig](https://github.com/justjohn/twig.js)
  - [ejs](https://github.com/visionmedia/ejs)
  - [mime](https://github.com/broofa/node-mime)
  - [colors](https://github.com/Marak/colors.js)
  - [request](https://github.com/mikeal/request)
  - [less](https://github.com/less/less.js)
  - [async](https://github.com/caolan/async)
  - [yuicompressor](https://github.com/yui/yuicompressor)

todo
=========
 - velocity support
 - coffeescript support