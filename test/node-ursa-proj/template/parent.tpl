<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>{% block page_title %}{% endblock %}</title>
        <link rel="stylesheet" href="@static_prefix@/static/css/main.css" type="text/css" />
    </head>
    <body {% block body_class %}{% endblock %}>
        {% block content %}{% endblock %}
        {%include "common/foot.tpl"%}
    </body>
    <script type="text/javascript" src="//lib.sinaapp.com/js/jquery/1.10.2/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="@static_prefix@/static/js/require.min.js"></script>
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
