define([],function () {
    return {
        /**
         * [test description]
         * @param  {Function}   testing
         * @param  {Function} done   
         */
        test:function(testing,done){
            var self=this;
            $.each($(".row"),function(index,row){
                var failed=false;
                var ie=$(row).find("[data-expect]");
                testing($(row).find(".caption").text());
                if(!ie.length){
                    self.none(row);
                    return true;
                }
                $.each(ie,function(i,item){
                    var pattern=$(item).attr('data-expect');
                    if(/^regex:/.test(pattern)){
                        var regexp=new RegExp(pattern.slice("regex:".length),"");
                        if(!regexp.test($.trim($(item).text()))){
                             return !(failed=true);
                        }
                    }else if(/^func:/.test(pattern)){
                        var fun=pattern.slice("func:".length);
                        if(!self[fun]($(item))){
                            return !(failed=true);
                        }
                    }
                    else{
                        if(pattern!==$.trim($(item).text()))
                            return !(failed=true);
                    }
                });
                failed&&(self.error(row));
                !failed&&(self.pass(row));
            });
            done($(".row").length,$(".row.pass").length,$(".row.error").length,$(".row.none").length);
        },
        error:function(ele){
            $(ele).addClass('error').find(".caption").append($("<span/>",{'class':""}).text("--[failed]"));
        }, 
        pass:function(ele){
            $(ele).addClass('pass').find(".caption").append($("<span/>",{'class':""}).text("--[passed]"));;
        },
        none:function(ele){
            $(ele).addClass('none').find(".caption").append($("<span/>",{'class':""}).text("--[ignored]"));;
        },
        validateImgLoaded:function(ele){
            return 690===$(ele).width();
        },
        validateLess:function(ele){
            return "800"==$(ele).css('font-weight');
        },
        validateFor:function(ele){
            var lis=$(ele).find('li'),failed=false;;
            $.each(lis,function(i,item){
                if(!$(item).text()){
                    return !(failed=true);
                }
            });
            return lis.length>0&&!failed;
        },
        validateProxyIframe:function(ele){
            var proxyEnabled=!!$("#enable_proxy").val().match(/^true|1$/);
            var eles=$(window[$(ele).attr('name')].document.body).find('*');
            return (proxyEnabled&&eles.length>0)||(!proxyEnabled&&!eles.length);
        }
    };
});