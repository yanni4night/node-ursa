{% extends "page/parent.tpl" %}

{% block content %}
{% include "module/index/gallery.tpl" %}

{% set tabs=index_tabs %}
{%include "module/tab.tpl"%}

{%set rank=index_rank%}
{%include "module/rank.tpl"%}
{% endblock %}