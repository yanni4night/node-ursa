{% extends "page/parent.tpl" %}

{% block content %}
 <font size="28" color="#28b">This is ABOUT</font>


{% set rank=about_rank %}
{% include "module/rank.tpl" %}
{% include "module/tab.tpl" %}
{% include "module/tab.tpl" %}
{% endblock %}