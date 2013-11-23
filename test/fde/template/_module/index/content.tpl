{% include "_module/index/gallery.tpl" %}

<p>这里使用Tab模块的数据</p>
{%include "_common/tab.tpl"%}
{%set rank=index_rank%}
<p>这里Index的数据覆盖了rank模块的数据</p>
{%include "_common/rank.tpl"%}

{{content}}