module.exports={
    main:function (token,content) {
        return content.replace('__INSIGHT_PLUGIN__','<div class="row"><div class="caption">插件</div><div class="content">这里是插件将__INSIGHT_PLUGIN__替换掉后加入的内容，当前模板：'+token+'</div></div>');
    }
};