<div class="tab">
    <div class="caption">
        {%for tab in tabs%}
        <a href="#" data-tabid="{{tab.id}}" class="item {%if loop.first%}on{%endif%}"><img src="{{tab.url}}/favicon.ico" width="16" height="16"/>{{tab.name}}</a>
        {%endfor%}
    </div>
    <div class="content">
        {%for tab in tabs%}
        <div class="item" {%if not loop.first%}style="display:none;"{%endif%}>
            <a href="{{tab.url}}" target="_blank">{{tab.url}}</a>
        </div>
        {%endfor%}
    </div>
</div>