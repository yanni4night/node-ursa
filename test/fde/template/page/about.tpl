{% extends "page/parent.tpl" %}

{% block content %}
This is <font size="28" color="#28b">ABOUT</font>


{%set rank=about_rank%}
{%include "module/rank.tpl"%}
{% endblock %}