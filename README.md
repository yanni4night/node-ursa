node-ursa
=========

node-ursa是一个用nodejs开发的，可以模拟服务器环境的前端开发环境。使用它可以实时查看HTML页面样式，并能最终生成经过优化的，可用于线上环境的javascript,css和HTML模板文件，从而提高前端开发效率，降低前后端工作的耦合度。

##主要功能
 - HTTP服务器，提供模拟线上环境的本地开发服务器;
 - 变量替换，特别为开发环境和线上环境提供不同的页面参数;
 - 文件时间戳，避免静态资源文件被缓存造成线上修改无效;
 - 类twig模板引擎，提高HTML开发效率;
 - 模拟服务器数据;
 - 基于require.js的js和css文件合并;
 - 基于YUI的js和css文件压缩。

##使用方法

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

	#node-ursa --build [project] --html --compress

或者

	#node-ursa -hcb [project]

project参数请查看manifest.json指南。
	
./build下即是可以部署到线上的静态文件。

changelog
=========

2013-09-09:首次提交，服务器和build基本功能完成，时间戳，压缩合并功能完成。
