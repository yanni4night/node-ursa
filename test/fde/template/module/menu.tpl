<nav class="menu">
    <ul>
{%for menu in common_menu_items%}
<li class="{{menu.id}}"><a href="{{menu.link}}">{{menu.text}}</a></li>
{%endfor%}
</ul>
</nav>