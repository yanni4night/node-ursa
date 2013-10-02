<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>node-ursa Template Data Manager</title>
        <meta name="author" content="yinyong@sogou-inc.com"/>
        <style type="text/css" media="screen">
            *{margin:0;padding:0;}
            body{background:#333;color:#fff;font-size:14px;line-height:1.3;font-family:sans-serif;}
            .wrapper{width:940px;margin:0 auto;padding:20px 0;}
            h1{font-size:20px;}
            #data{width:700px;height:500px;background:#eee;}
            #submit{ margin-left:40px; }
            .desc{padding-bottom:10px;}
        </style>
        <script type="text/javascript">
        void function(){
            if(!String.prototype.trim){
            String.prototype.trim=function(){
                return this.replace(/^\s+|\s+$/g,'');
            };
        }
        }();

        function $(id){
            return document.querySelector?document.querySelector('#'+id):document.getElementById(id);
        }

        function $v(id){
            var t=$(id);
            if(!t)return null;
            if('input'===t.tagName.toLowerCase()){
                return t.value;
            }else if('textarea'===t.tagName.toLowerCase())
            {
                return String(t.innerText||t.textContent).trim();
            }else 
            return null;
        }
        function validate(){
            var json=$v('data').replace(/\/\*[\s\S]*?\*\//img.'');
            try{
                if('undefined'!==typeof JSON && JSON.parse){
                    JSON.parse(json);
                }else
                {
                    eval(json);
                }

                return true;
            }catch(e){
                alert("Invalid JSON");
                return false;
            }
        }
        </script>
    </head>
    <body>
        <div class="wrapper">
            <!--夸模板语法考虑，这里不再使用引擎渲染-->
            <h1>Data Manager for Tpl => {{name}}</h1>
            <form method="post" id="ursa" action="/data.so" onsubmit="return validate();">
                <p class="desc">
                    Paste or type json data in the textarea below.
                    <button id="submit" type="submit">Submit</button>
                </p>
                <input type="hidden" name="tpl" value="{{tpl}}" />
                <textarea name="data" id="data" >{{data}}</textarea>
            </form>
        </div>
    </body>
</html>
