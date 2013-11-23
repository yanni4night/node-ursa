<div class="gallery-wrapper">
    <a href="#" class="direc left">&lt;</a>
    <div class="gallery-slider">
        {%for item in gallery%}
        <a href="#"><img src="{{item.img}}" alt="" width="800" height="320"></a>
        {%endfor%}
    </div>
    <a href="" class="direc right">&gt;</a>
</div>