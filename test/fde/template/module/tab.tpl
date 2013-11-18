<div class="tab">
    <div class="caption">
        {%for tab in tabs%}
        <a href="#" data-tabid="{{tab.id}}" class="item {%if not loop.first%}on{%endif%}">{{tab.name}}</a>
        {%endfor%}
    </div>
    <div class="content">
        {%for tab in tabs%}
        <div class="item" {%if not loop.first%}style="display:none;"{%endif%}>
            <iframe src="{{tab.url}}" frameborder="0" width="100%" height="100%"></iframe>
        </div>
        {%endfor%}
    </div>
</div>