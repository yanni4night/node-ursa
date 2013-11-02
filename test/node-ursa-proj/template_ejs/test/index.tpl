<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Node-ursa Test Suit</title>
	<link rel="stylesheet" href="@static_prefix@/static/css/main.css" type="text/css" />
</head>
<body>
	<h1>测试示例-@engine@</h1>
	<div class="row">
		<div class="caption">模板引擎简单变量的输出</div>
		<div class="content">
			<var class="imp">
				<%=name%></var>
			定义在in _data/test/index.tpl中.你可以点击
			<a href="/test/index.m">这里</a>
			修改参数.
		</div>
	</div>
	<div class="row">
		<div class="caption">模板引擎对象变量的输出</div>
		<div class="content">
			我的电脑有一个
			<var class="imp">
				<%=computer.Display %></var>
			显示器,一个
			<var class="imp">
				<%=computer.CPU %></var>
			的CPU,一部
			<var class="imp">
				<%=computer.Keybord %></var>
			键盘和一个
			<var class="imp">
				<%=computer.Disk %></var>
			硬盘.
		</div>
	</div>

	<div class="row">
		<div class="caption">模板引擎输出数组</div>
		<div class="content">
			<p>名人堂：</p>
			<ul>
				<%for (var e in famous){ %>
				<li>
					<var class="imp">
						<%=famous[e]%></var>
				</li>
				<%}%></ul>
		</div>
	</div>
	<div class="row">
		<div class="caption">#date#:UNIX时间戳输出</div>
		<div class="content">
			#date#
			<span class="weak">(将‘#’替换成‘@’)</span>
			代表当前的UNIX时间戳，例如：当前的UNIX时间戳是
			<var class="imp">@date@</var>
			.
		</div>
	</div>
	<div class="row">
		<div class="caption">‘@’变量替换</div>
		<div class="content">
			本项目的Github:
			<var class="imp">@github@</var>
			.‘@’变量定义在manifest.json中.
		</div>
	</div>
	<div class="row">
		<div class="caption">特殊变量</div>
		<div class="content">
			<p>
				_folder=
				<var class="imp">
					<%=_folder%></var>
				,代表模板相对于./template路径的第一个目录名，或者就是该文件名（不含后缀）
			</p>
			<p>
				_token=
				<var class="imp">
					<%=_token%></var>
				,代表该模板的唯一标识，有相对于./template的路径构成，以"_"分隔目录和文件名（不含后缀）
			</p>
			<p>
				_subtoken=
				<var class="imp">
					<%=_subtoken%></var>
				，代表模板相对于./template路径的第二个目录名，或者为空
			</p>
		</div>
	</div>
	<div class="row">
		<div class="caption">随机数输出</div>
		<div class="content">
			<var class="imp">@number@</var>
			是一个随机数.你可以
			<a href="#" onclick="javascript:window.location.reload();">刷新</a>
			页面,可以看到它的值会随机变化.该值变化于0和定义 <em>manifest.json</em>
			文件中的‘num’变量.
		</div>
	</div>
	<div class="row">
		<div class="caption">_ursa.json公共数据</div>
		<div class="content">
			<var class="imp">
				<%=project%></var>
			没有定义在 _data/index.json 中，而是 _data/_ursa.json.点击
			<a href="/_ursa.m">这里</a>
			修改数据.
		</div>
	</div>
	<div class="row">
		<div class="caption">Requirejs text 插件</div>
		<div class="content">
			下面的内容通过 requriejs text 插件可以优化在js文件中：
			<pre id="requirejs-text-content" class="imp"></pre>
		</div>
	</div>
	<div class="row">
		<div class="caption">HTTPS 支持</div>
		<div class="content">
			<p id="https" style="display:none;">
				目前处于
				<span class="imp">HTTPS</span>
				模式，你可以修改 manifest.json文件中 <em>protocol</em>
				的值来使用HTTP、HTTPS或同时使用两种协议（重启有效）.
			</p>
			<p id="http" style="display:none;">
				目前处于
				<span class="imp">HTTP</span>
				模式，你可以修改 manifest.json文件中
				<em>https</em>
				的值为1来切换为HTTPS模式（重启有效）.
			</p>
		</div>
	</div>
	<div class="row">
		<div class="caption">url() 格式时间戳</div>
		<div class="content">
			你可以再下面的url格式路径中看到带有
			<var class="imp">@timestamp_name@</var>
			标记的时间戳追加到URL末尾：
			<pre>
            background: url();
            background: url(    );
            background: url(#);
            background: url(about:blank);
            background: url("about:blank");
            background: url("data:image/png;base64:");
            background:url(@static_prefix@/static/img/p.gif);
            background: url(//account.sogou.com/static/img/index/loginbtn.png?u=index);
            background: url("//account.sogou.com/static/img/index/loginbtn.png?t=2013");
            background: url("//account.sogou.com/static/img/index/loginbtn.png");
		</pre>
			<p>可以看见，无效的URL不会追加时间戳，已经有时间戳的也不会再追加</p>
			点击
			<a href="@static_prefix@/static/css/page.css">page.css</a>
			,你仍然可以看到追加到CSS文件中的ur()格式时间戳。
		</div>
	</div>

	<div class="row">
		<div class="caption">Script&amp;Link标签时间戳</div>
		<div class="content">
			可以看见
			<var class="imp">@timestamp_name@</var>
			时间戳会被追加到script&amp;link 元素中，同样，无效的URL、已有时间戳的不会再追加时间戳.
			<textarea disabled>
				<script type="text/javascript" src="@static_prefix@/static/js/require.min.js"></script>
				<script type="text/javascript" src="http://codeorigin.jquery.com/ui/1.10.3/jquery-ui.min.js"></script>
				<link rel="stylesheet" href="@static_prefix@/static/css/main.css?t=2013" type="text/css"/>
				<link rel="stylesheet" href="@static_prefix@/static/css/main.css?y=0" type="text/css"/>
			</textarea>
		</div>
	</div>
	__INSIGHT_PLUGIN__
	<div class="row">
		<div class="caption">LESS</div>
		<div class="content">
			<span class="less">你可以修改/static/less/sub/sub.less的内容来改版这里的样式。</span>
		</div>
	</div>
	<div class="row">
		<div class="caption">@tm:@ 指定文件时间戳</div>
		<div class="content">#tm:/static/css/main.css#=@tm:/static/css/main.css@</div>
	</div>
	<div class="row">
		<div class="caption">图片</div>
		<div class="content">
			<img src="@static_prefix@/static/img/protocol.png" alt=""></div>
	</div>
	<div class="row">
		<div class="caption">proxy正则匹配</div>
		<div class="content">
			<p>
				下面iframe的src为/dgtle/，实际通过正则表达式
				<span class="imp">regex:/dgtle/(.*)</span>
				代理到指向http://www.dgtle.com
			</p>
			<iframe width="100%" height="300px" src="/dgtle/"></iframe>
			<p>代理仅支持使用UTF-8编码的页面</p>
		</div>
	</div>
	<div class="row">
		<div class="caption">proxy精确匹配</div>
		<div class="content">
			<p>
				下面iframe的src为/baidu/，实际通过精确表达式
				<span class="imp">exact:/baidu/</span>
				代理到指向http://www.baidu.com
			</p>
			<iframe width="100%" height="300px" src="/baidu/"></iframe>
			<p>代理仅支持使用UTF-8编码的页面</p>
		</div>
	</div>
	<div class="row">
		<div class="caption">proxy子串匹配</div>
		<div class="content">
			<p>
				下面iframe的src为/test/xxx/aaa/bing，实际通过子串表达式
				<span class="imp">bing</span>
				代理到指向http://www.bing.com
			</p>
			<iframe width="100%" height="300px" src="/test/xxx/aaa/bing"></iframe>
			<p>代理仅支持使用UTF-8编码的页面</p>
		</div>
	</div>
	<%include ../common/foot.tpl %></body>
	<script type="text/javascript" src="@static_prefix@/static/js/require.min.js"></script>
	<script type="text/javascript" src="@static_prefix@/static/js/main.js"></script>

	<script type="text/javascript">
        
require.config({
    baseUrl:"@static_prefix@/static/js"
});


require(['main'] , function(main){
    main.common && main.common();
    main['<%=_token%>'] && main['<%=_token%>']();
});


    </script>
</html>