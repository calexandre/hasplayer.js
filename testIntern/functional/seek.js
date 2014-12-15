/*
	http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.0.jar
	http://chromedriver.storage.googleapis.com/2.9/chromedriver_win32.zip
	http://selenium-release.storage.googleapis.com/2.43/IEDriverServer_x64_2.43.0.zip
	*/

//java -jar selenium-server-standalone-2.43.0.jar -Dwebdriver.ie.driver=D:\selenium\IEDriverServer.exe -Dwebdriver.chrome.driver=D:\selenium\chromedriver.exe

// D:\FTRD\workspace\dash-js>node node_modules/intern/runner.js config=testIntern/intern

define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!leadfoot/helpers/pollUntil',
	'require',
	'testIntern/config'
	], function(registerSuite, assert, pollUntil, require, config) {

		var command = null;
		var videoCurrentTime = 0;

		var getVideoCurrentTime = function () {
			return document.querySelector("video").currentTime;
		};

		var seek = function (time) {
			document.querySelector("video").currentTime = time;
		};

		var tests = function(stream) {

			var url = config.testPage + "?url=" + stream;

			registerSuite({
				name: 'Test seeking functionnality',

				'Initialize the test': function() {
					console.log("[TEST_SEEK] stream: " + stream);

					command = this.remote.get(require.toUrl(url));
					
					return command.execute(getVideoCurrentTime)
					.then(function(time) {
						videoCurrentTime = time;
						console.log("[TEST_SEEK] current time = " + videoCurrentTime);
					});
				},

				'Check if playing': function() {
					console.log('[TEST_SEEK] Wait 5s ...');

					return command.sleep(5000)
					.execute(getVideoCurrentTime)
					.then(function (time) {
						console.log("[TEST_SEEK] current time = " + time);
						assert.ok(time > videoCurrentTime);
						videoCurrentTime = time;
					});
				},

				'Do seek': function() {
					console.log('[TEST_SEEK] Seek to 30s...');

					return command.execute(seek, [30])
					// Wait for current time > 30, i.e. seek has been done and video is playing
					.then(pollUntil(
						function () {
							var time = document.querySelector("video").currentTime;
							return (time > 30) ? true : null;
						}, null, 10000))
					.then(function () {
						return command.execute(getVideoCurrentTime)
						.then(function (time) {
							console.log("[TEST_SEEK] current time = " + time);
							videoCurrentTime = time;
						});
					}, function (error) {
						assert.ok(false, "[TEST_SEEK] Failed to seek");
					});
				},

				'Check playing time after 10 sec.': function() {
					console.log('[TEST_SEEK] Wait 10s ...');

					return command.sleep(10000)
					.execute(getVideoCurrentTime)
					.then(function (time) {
						var delay = time - videoCurrentTime;
						console.log("[TEST_SEEK] current time = " + time + " (" + Math.round(delay*100)/100 + ")");
						assert.ok(delay >= 9); // 9 for sleep precision
					});
				}
			});
		};

		var i = 0,
			len = config.seek.length;

		for(i; i < len; i++) {
			tests(config.seek[i].stream);
		}
});