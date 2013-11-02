module.exports={
    main:function (token,content) {
        return content.replace('__INSIGHT_PLUGIN__',token);
    }
};