_common{% extends "parent.tpl" %}

{% block content %}
 <font size="28" color="#28b">This is ABOUT</font>


{% set rank=about_rank %}
{% include "_common/rank.tpl" %}
{% include "_common/tab.tpl" %}
{% include "_common/tab.tpl" %}
{% endblock %}