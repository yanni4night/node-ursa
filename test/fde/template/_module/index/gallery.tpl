<!--
    @require _module/index/base.css
-->
<div class="re w-fil gallery-wrapper">
    <a href="#" class="ab h-fil direc left">&lt;</a>
    <div class="re gallery-slider">
        {%for item in gallery%}
        <a href="#"><img src="{{item.img}}" width="800" height="320"></a>
        {%endfor%}
    </div>
    <a href="#" class="ab h-fil direc right">&gt;</a>
</div>