<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>{% block page_title %}{% endblock %}</title>
        <link rel="stylesheet" href="@static_prefix@/static/css/main.css" type="text/css" />
        <style type="text/css">

        .blank{
            background: url(about:blank);
        }

        .p{
            background: url(@static_prefix@/static/img/p.gif) repeat;
            position: absolute;
            width: 100px;
            height: 100px;
            left: 400px;
            top: 200px;
        }

        </style>
    </head>
    <body {% block body_class %}{% endblock %}>
        {% block content %}{% endblock %}
    </body>
    <script type="text/javascript" src="http://p0.123.sogou.com/u/js/mursa.js"></script>
    <script type="text/javascript" src="@static_prefix@/static/js/main.js"></script>
    {% block script_module %}{% endblock %}
    <script type="text/javascript">
        
require.config({
    baseUrl:"@static_prefix@/static/js"
});

{% block script_main %}
require(['main'] , function(main){
    main.common && main.common();
    main['{{_token}}'] && main['{{_token}}']();
});
{% endblock %}

    </script>
</html>
