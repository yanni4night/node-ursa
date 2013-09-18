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
 - 基于YUI的js和css文件压缩。

##使用方法

####安装node-ursa

在node-ursa目录下执行npm命令安装依赖即可：
	
	#npm install

####创建node-ursa项目

使用node-ursa命令创建：

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

访问服务器:http://localhost:[port]。暂时不支持https形式访问。

####开发

以ut后缀访问静态模板文件，路径为相对于./template。以m后缀访问则进入对应模板的数据文件编辑页，你也可以直接编辑对应的.json文件。

####生成线上静态文件

	#node-ursa --build [project] --html  --compress

或者

	#node-ursa -hcb [project]

project参数请查看manifest.json指南。
	
./build下即是可以部署到线上的静态文件。

changelog
=========
 - 2013-09-18:复用模板引擎给[express](https://github.com/visionmedia/express)的接口，支持所有express支持的模板引擎，现阶段加入twig、ejs、jade
 - 2013-09-17:支持三种proxy模式
 - 2013-09-15:支持HTTPS访问；修复了一些bug；支持always_add_timestamp选项；优化了build的日志显示和命令行HELP信息，增加server_add_timestamp选项，支持_ursa.json公共数据文件。
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
  - [jade](https://github.com/visionmedia/jade)
  - [mime](https://github.com/broofa/node-mime)
  - [exec](sync:https://github.com/jeremyfa/node-exec-sync)
  - [colors](https://github.com/Marak/colors.js)
  - [request](https://github.com/mikeal/request)
