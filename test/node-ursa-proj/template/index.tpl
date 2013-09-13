{% extends "parent.tpl" %}

{% block content %}
<h1>Test suit</h1>
<div class="row">
	<div class="caption">Tempalte engine output variable test</div>
	<div class="content"><span class="imp">{{name}}</span> should be printed.You can go to <a href="index.m">here</a> to change it.</div>
</div>
<div class="row">
	<div class="caption">Tempalte engine output object test</div>
	<div class="content">My computer has a <span class="imp">{{computer.Display}}</span> display,a <span class="imp">{{computer.CPU}}</span> CPU,a <span class="imp">{{computer.Keybord}}</span> keybord and a <span class="imp">{{computer.Disk}}</span> disk.</div>
</div>

<div class="row">
	<div class="caption">Tempalte engine output array test</div>
	<div class="content">
	<ul>
		{%for e in famous%}
		<li><span class="imp">{{e}}</span></li>
		{%endfor%}
	</ul>
	</div>
</div>
<div class="row">
	<div class="caption">@ date @:UNIX timestamp auto replace test</div>
	<div class="content">The current UNIX timestamp is <span class="imp">@date@</span>.</div>
</div>
<div class="row">
	<div class="caption">Inner variable test</div>
	<div class="content">
		_folder=<span class="imp">{{_folder}}</span>,
		_token=<span class="imp">{{_token}}</span>,
		_subtoken=<span class="imp">{{_subtoken}}</span>
	</div>
</div>
<div class="row">
	<div class="caption">Random number test</div>
	<div class="content"><span class="imp">@number@</span> should be a random number.If you <a href="#" onclick="javascript:window.location.reload();">refresh</a> the page,it'll change.The number starts at 0 and ends at 'num' which defined in <i>manifest.json</i>.</div>
</div>


{% endblock %}
