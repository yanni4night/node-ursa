({
    //详见https://github.com/jrburke/r.js/blob/master/build/example.build.js
    appDir: "./static",
    baseUrl: "js",
    dir: "./build/static/",
    optimize: "uglify2",
    generateSourceMaps:true,
     removeCombined:true,
     preserveLicenseComments:false,
     keepBuildDir:false,
     skipDirOptimize:true,
     optimizeCss:'standard',
     fileExclusionRegExp:/less/,
    modules: [
        {
            name: "main"
        }
    ]
})