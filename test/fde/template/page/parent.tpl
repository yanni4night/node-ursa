<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Auto Insert</title>
<script type="application/javascript" src="//code.jquery.com/jquery-1.10.2.min.js"></script>
<script type="application/javascript" src="http://p0.123.sogou.com/u/js/ursa.js"></script>
<link rel="stylesheet" href="/static/css/index.css"/>
<style type="text/css"></style>
</head>
<body>
    {% include "module/menu.tpl" %}
    {% block content %}

    {%endblock%}
</body>
<script>
 require.config({
        baseUrl:"/static/js"
    });
    require(["index"],function(index){
        index.init();
    });
</script>
</html>
