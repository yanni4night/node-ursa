<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Module[{{name}}]</title>
<script type="application/javascript" src="//code.jquery.com/jquery-1.10.2.min.js"></script>
<script type="application/javascript" src="http://p0.123.sogou.com/u/js/ursa.js"></script>
<style>
    html,body{padding: 0;margin: 0;}
</style>
<link rel="stylesheet" href="/static/css/{{name}}.css">
</head>
<body>
    {{content}}
</body>
<script>
     require.config({
        baseUrl:"/static/js/"
    });
     var name="{{name}}".replace(/^\//,'');
     
    require([name],function(index){
        index.init();
    });
</script>
</html>
