/**
  * content.js
  *
  * changelog
  * 2013-11-23[20:27:37]:created
  *
  * @info yinyong,osx-x64,Undefined,10.129.173.11,js,/Users/yinyong/work/node-ursa/test/fde/static/js/_module/index
  * @author yinyong#sogou-inc.com
  * @version 0.0.1
  * @since 0.0.1
  */
define(['_module/index/gallery','_common/tab'],function(gallery) {
    return {
      init:function(){
        gallery.init();
        $('.tab').tab();
      }
    };
});