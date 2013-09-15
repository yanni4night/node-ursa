define('main', ["text!./tpl/list.tpl", "./test/index"], function(tpl, text_index) {
	return {
		common: function() {
			window['console'] && (undefined !== tpl) && console.log("text loaded:\n[%s]", tpl);
		},
		index: function() {
			window['console'] && console.log("This is index module");
			var target = document.getElementById("requirejs-text-content");
			if (target) {
				if (undefined !== target.innerText) {
					target.innerText = tpl;
				} else {
					target.textContent = tpl;
				}
			};

			if (location.protocol == 'https:') {
				document.getElementById("https").style.display = 'block';
			} else {
				document.getElementById("http").style.display = 'block';
			}
		},
		test_index: function() {
			text_index.index && text_index.index();
			window['console'] && console.log("This is test_index module");
		}
	};
});