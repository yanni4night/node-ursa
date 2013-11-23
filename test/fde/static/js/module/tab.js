/**
  * tab.js
  *
  * changelog
  * 2013-11-18[21:14:01]:created
  *
  * @info yinyong,osx-x64,Undefined,10.129.173.11,js,/Users/yinyong/work/node-ursa/test/fde/static/js/module
  * @author yanni4night@gmail.com
  * @version 0.0.1
  * @since 0.0.1
  */
(function(window,document,$,undefined){
    function Tab(ele,options){
        var self=this;
        self.$container=$(ele);
        var settings=self.settings={
            $captionItem:self.$container.find('.caption .item'),
            $contentItem:self.$container.find('.content .item'),
            selectedItemClass:"on"
        };

        $.extend(settings,options);

        for(var i=0,len=self.settings.$captionItem.length;i<len;++i){
            self.settings.$captionItem.eq(i).attr('data-index',i);
        }

        self.settings.$captionItem.click(function(e){
                var index=$(this).attr('data-index')|0;
                   self.settings.$contentItem.hide();
                   self.settings.$contentItem.eq(index).show();
                   e.preventDefault();
                   self.settings.$captionItem.removeClass(settings.selectedItemClass);
                   $(this).addClass(settings.selectedItemClass);
        });
    }


    $.fn.tab=function(options){
        $.each($(this),function(i,ele){
            new Tab(ele,options);
        });
    };
})(window,document,jQuery);