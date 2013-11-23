/**
  * gallery.js
  *
  * changelog
  * 2013-11-18[19:15:43]:created
  *
  * @info yinyong,osx-x64,UTF-8,10.129.173.11,js,/Users/yinyong/work/node-ursa/test/fde/static/js/module/index
  * @author yanni4night@gmail.com
  * @version 0.0.1
  * @since 0.0.1
  */
define([],function() {
  var gallery=function(options){
    var self=this;
    var settings=self.settings={
      $container:$(".gallery-wrapper .gallery-slider"),
      $left:$(".gallery-wrapper .left"),
      $right:$(".gallery-wrapper .right"),
      width:800,
      height:320
    };

    self.index=0;
    self.cnt=self.settings.$container.find("a").length;
    $.extend(settings,options);


    self.left=function(){
      if(++self.index>self.cnt-1){self.index=0;}
        self.settings.$container.animate({'left':(-self.settings.width*self.index)+"px"});
    };

    self.right=function(){
      if(--self.index<0){
        self.index=self.cnt-1;
      }
        self.settings.$container.animate({'left':(-self.settings.width*self.index)+"px"});
    };


    self.settings.$left.click(function(e){
      self.left();
      console.log(self.index);
      e.preventDefault();
    });
    self.settings.$right.click(function(e){
      self.right();
      console.log(self.index);
      e.preventDefault();
    });

  };
    return {

        init:function(){
          new gallery();
        }

    };
});