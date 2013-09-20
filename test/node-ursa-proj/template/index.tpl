{% extends "./parent.tpl" %}

{% block content %}
<h1>测试示例</h1>
<div class="row">
	<div class="caption">模板引擎简单变量的输出</div>
	<div class="content"><var class="imp">{{name}}</var>定义在in _data/index.tpl中.你可以点击<a href="index.m">这里</a>修改参数.</div>
</div>
<div class="row">
	<div class="caption">模板引擎对象变量的输出</div>
	<div class="content">我的电脑有一个<var class="imp">{{computer.Display}}</var>显示器,一个<var class="imp">{{computer.CPU}}</var>的CPU,一部<var class="imp">{{computer.Keybord}}</var>键盘和一个<var class="imp">{{computer.Disk}}</var>硬盘.</div>
</div>

<div class="row">
	<div class="caption">模板引擎输出数组</div>
	<div class="content">
		<p>名人堂：</p>
	<ul>
		{%for e in famous%}
		<li><var class="imp">{{e}}</var></li>
		{%endfor%}
	</ul>
	</div>
</div>
<div class="row">
	<div class="caption">@ date @:UNIX时间戳输出</div>
	<div class="content">#date#(将‘#’替换成‘@’)代表当前的UNIX时间戳，例如：当前的UNIX时间戳是<var class="imp">@date@</var>.</div>
</div>
<div class="row">
	<div class="caption">‘@’变量替换</div>
	<div class="content">本项目的Github: <var class="imp">@github@</var>.‘@’变量定义在manifest.json中.</div>
</div>
<div class="row">
	<div class="caption">特殊变量</div>
	<div class="content">
		<p>_folder=<var class="imp">{{_folder}}</var>,代表模板相对于./template路径的第一个目录名，或者就是该文件名（不含后缀）</p>
		<p>_token=<var class="imp">{{_token}}</var>,代表该模板文件名（不含后缀）</p>
		<p>
			_subtoken=<var class="imp">{{_subtoken}}</var> ，代表模板相对于./template路径的第二个目录名，或者为空
		</p>
	</div>
</div>
<div class="row">
	<div class="caption">随机数输出</div>
	<div class="content"><var class="imp">@number@</var> 是一个随机数.你可以<a href="#" onclick="javascript:window.location.reload();">刷新</a>页面,可以看到它的值会随机变化.该值变化于0和定义<em>manifest.json</em>文件中的‘num’变量.</div>
</div>
<div class="row">
	<div class="caption">_ursa.json公共数据</div>
	<div class="content"><var class="imp">{{project}}</var>没有定义在 _data/index.json 中，而是 _data/_ursa.json.点击<a href="_ursa.m">这里</a>修改数据.</div>
</div>
<div class="row">
	<div class="caption">Requirejs text 插件</div>
	<div class="content">
		下面的内容通过 requriejs text 插件可以优化在js文件中：
	<pre id="requirejs-text-content" class="imp">	
	</pre>
	</div>
</div>
<div class="row">
	<div class="caption">HTTPS 支持</div>
	<div class="content">
		<p id="https" style="display:none;">目前处于<span class="imp">HTTPS</span>模式，你可以修改 manifest.json文件中<em>https</em>的值为0来切换为HTTP模式（重启有效）.</p>		
		<p id="http" style="display:none;">目前处于<span class="imp">HTTP</span>模式，你可以修改 manifest.json文件中<em>https</em>的值为1来切换为HTTPS模式（重启有效）.</p>
	</div>
</div>
<div class="row">
	<div class="caption">url() 格式时间戳</div>
	<div class="content">
		你可以再下面的url格式路径中看到带有<var class="imp">@timestamp_name@</var>标记的时间戳追加到URL末尾：
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
		点击<a href="@static_prefix@/static/css/page.css">page.css</a>,你仍然可以看到追加到CSS文件中的ur()格式时间戳。
	</div>
</div>

<div class="row">
	<div class="caption">Script&amp;Link标签时间戳</div>
	<div class="content">
		可以看见<var class="imp">@timestamp_name@</var>时间戳会被追加到script&amp;link 元素中，同样，无效的URL、已有时间戳的不会再追加时间戳.
		<textarea disabled>
<script type="text/javascript" src="@static_prefix@/static/js/require.min.js"></script>
<script type="text/javascript" src="http://codeorigin.jquery.com/ui/1.10.3/jquery-ui.min.js"></script>
<link rel="stylesheet" href="@static_prefix@/static/css/main.css?t=2013" type="text/css"/>
<link rel="stylesheet" href="@static_prefix@/static/css/main.css?y=0" type="text/css"/>
		</textarea>
	</div>
</div>

{% endblock %}
