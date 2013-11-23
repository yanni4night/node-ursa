<div class="rank">
    <div class="caption">{{rank.caption|default("排行榜")}}</div>
    <div class="list">
        <ul>
            {%for item in rank.list%}
            <li>{{item}}</li>
            {%endfor%}
        </ul>
    </div>
</div>