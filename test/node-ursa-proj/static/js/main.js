define('main', ["text!./tpl/list.tpl", "./test/index", './common/testsuit'], function(tpl, test_index, testsuit) {
	!window.console && (
		window.console = {
			log: function() {},
			debug: function() {},
			error: function() {},
			clear: function() {}
		}
	);


	return {
		common: function() {},
		test_index: function() {
			test_index && test_index.index && test_index.index();

			$("#requirejs-text-content").text(tpl);
			$("#protocol").text(location.protocol.match(/^https?/i)[0].toUpperCase());

			window.console.clear();
			testsuit.test(function(msg) {
				$("h1").text("Testing " + msg);
				window.console.log("Testing " + msg);
			}, function(total, passed, failed, ignored) {
				window.console.log('All Testing done');
				$("h1").text(total + "个测试项目," + passed + "项成功," + failed + "项失败," + ignored + "项未进行");
			});
		}
	};
});