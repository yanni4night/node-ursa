({
    appDir: "./static",
    baseUrl: "js",
    dir: "./build/static/",
    optimize: "uglify",
    // generateSourceMaps:true,
     removeCombined:true,
     preserveLicenseComments:false,
     keepBuildDir:false,
     //skipDirOptimize:true,
     optimizeCss:'standard',
     fileExclusionRegExp:/less/,
    modules: [
        {
            name: "main"
        }
    ]
})