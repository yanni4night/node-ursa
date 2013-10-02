<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Welcome to node-ursa</title>
        <meta name="author" content="yinyong@sogou-inc.com"/>
        <style type="text/css" media="screen">
            *{margin:0;padding:0;}
            body{background:#333;color:#fff;font-size:14px;line-height:1.3;font-family:sans-serif;}
            .wrapper{width:940px;margin:0 auto;padding:20px 0;}
            h1{font-size:20px;}
            .tlist{
                padding:30px 0 0 40px;
            }
            .tlist li{
                margin:10px 0;
            }
            .tlist a{
                color:#fff;
                text-decoration:none;
                border-bottom:1px #efefef dotted;
            }
            .tlist .title{
                margin-right:20px;
                font-size:16px;
            }
            .tlist .mgr{font-size:11px;}
        </style>
    </head>
    <body>
        <div class="wrapper">
            
            <h1>Template List</h1>
            <ul class="tlist">
                <!--字符串替换，不再使用模板引擎渲染，这样可以夸引擎-->
               __TPL_HTML_STR__
            </ul>
        </div>
    </body>
</html>
