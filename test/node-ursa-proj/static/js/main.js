define('main', ["text!./tpl/list.tpl"] , function(tpl){
    return{
        common: function(){},
        index: function(){
        	window['console']&&console.log(tpl);
        }
    };
});

