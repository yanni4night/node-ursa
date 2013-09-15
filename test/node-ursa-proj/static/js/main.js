define('main', ["text!./tpl/list.tpl","./test/index" ], function(tpl) {
	return {
		common: function() {
			window['console'] &&(undefined!==tpl)&& console.log("text loaded:\n[%s]",tpl);
		},
		index: function() {
			window['console'] && console.log("This is index module");
		},
		test_index: function() {
			window['console'] && console.log("This is test_index module");
		}
	};
});