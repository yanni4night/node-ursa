<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>{%block title%}FDE{%endblock%}</title>
<script type="text/javascript" src="//code.jquery.com/jquery-1.10.2.min.js"></script>
<script type="text/javascript" src="http://p0.123.sogou.com/u/js/ursa.js"></script>
<link rel="stylesheet" href="/static/css/index.css"/>
<style type="text/css"></style>
</head>
<body>
    <p>这里是parent引用的menu模块数据</p>
    {% include "_common/menu.tpl" %}
    {% block content %}

    {%endblock%}
    <p>这里是parent引用的footer模块数据</p>
    {% include "_common/footer.tpl" %}
</body>
<script>
 require.config({
        baseUrl:"/static/js"
    });
    require(["{{_token}}"],function(index){
        index.init();
    });
</script>
</html>
