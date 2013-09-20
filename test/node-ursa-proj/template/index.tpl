{% extends "./parent.tpl" %}

{% block content %}
<h1>Test suit</h1>
<div class="row">
	<div class="caption">Tempalte engine output variable</div>
	<div class="content"><var class="imp">{{name}}</var> is defined in _data/index.tpl.You can go to <a href="index.m">here</a> to change it.</div>
</div>
<div class="row">
	<div class="caption">Tempalte engine output object</div>
	<div class="content">My computer has a <var class="imp">{{computer.Display}}</var> display,a <var class="imp">{{computer.CPU}}</var> CPU,a <var class="imp">{{computer.Keybord}}</var> keybord and a <var class="imp">{{computer.Disk}}</var> disk.</div>
</div>

<div class="row">
	<div class="caption">Tempalte engine output array</div>
	<div class="content">
	<ul>
		{%for e in famous%}
		<li><var class="imp">{{e}}</var></li>
		{%endfor%}
	</ul>
	</div>
</div>
<div class="row">
	<div class="caption">@ date @:UNIX timestamp auto replace</div>
	<div class="content">The current UNIX timestamp is <var class="imp">@date@</var>.</div>
</div>
<div class="row">
	<div class="caption">@variable replace</div>
	<div class="content">Github: <var class="imp">@github@</var>.This is defined in manifest.json.</div>
</div>
<div class="row">
	<div class="caption">Inner variable test</div>
	<div class="content">
		_folder=<var class="imp">{{_folder}}</var>,
		_token=<var class="imp">{{_token}}</var>,
		_subtoken=<var class="imp">{{_subtoken}}</var>
	</div>
</div>
<div class="row">
	<div class="caption">Random number test</div>
	<div class="content"><var class="imp">@number@</var> should be a random number.If you <a href="#" onclick="javascript:window.location.reload();">refresh</a> the page,it'll change.The number starts at 0 and ends at 'num' which defined in <em>manifest.json</em>.</div>
</div>
<div class="row">
	<div class="caption">Common simulate data</div>
	<div class="content">The <var class="imp">{{project}}</var> is not defined in _data/index.json but _data/_ursa.json.Click <a href="_ursa.m">here</a> to change it.</div>
</div>
<div class="row">
	<div class="caption">Requirejs text plugin</div>
	<div class="content">
		The following content is merged into the js file by requriejs text plugin:
	<pre id="requirejs-text-content" class="imp">	
	</pre>
	</div>
</div>
<div class="row">
	<div class="caption">HTTPS support</div>
	<div class="content">
		<p id="https" style="display:none;">You are in <span class="imp">HTTPS</span> mode,you can modify <em>https</em> to 0 in manifest.json to switch to HTTP mode.</p>		
		<p id="http" style="display:none;">You are in <span class="imp">HTTP</span> mode,you can modify <em>https</em> to 1 in manifest.json to switch to HTTPS mode.</p>
	</div>
</div>
<div class="row">
	<div class="caption">url() timestamp</div>
	<div class="content">
		You will see a <var class="imp">@timestamp_name@</var> timestamp will be append to each valid url.
		<pre>
            background: url();
            background: url(    );
            background: url(#);
            background: url(about:blank);
            background: url("about:blank");
            background: url("data:image/png;base64:");
            background:url(@static_prefix@/static/img/p.gif);
            background: url(//account.sogou.com/static/img/index/loginbtn.png?u=index);
            background: url("//account.sogou.com/static/img/index/loginbtn.png");
		</pre>
		If you open the <a href="@static_prefix@/static/css/page.css">page.css</a>,you'll still find url timestamps.These kinds of timestamp will prevent caching.
	</div>
</div>

<div class="row">
	<div class="caption">Script&amp;Link timestamp</div>
	<div class="content">
		You will find a <var class="imp">@timestamp_name@</var> timestamp will append to each script&amp;link element.
		<textarea disabled>
<script type="text/javascript" src="@static_prefix@/static/js/require.min.js"></script>
<script type="text/javascript" src="http://codeorigin.jquery.com/ui/1.10.3/jquery-ui.min.js"></script>
<link rel="stylesheet" href="@static_prefix@/static/css/main.css?y=0" type="text/css"/>
		</textarea>
	</div>
</div>

{% endblock %}
