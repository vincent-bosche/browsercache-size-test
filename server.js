const http		= require("http");

const config	= require(__dirname + "/config.json");

var {SizeTester} 	= require(__dirname + "/SizeTester.js");

// Set process name
process.title = "Cache Size Tester";

const server = new SizeTester();

const webServer = http.createServer(app).listen(config.httpPort, function() {
	console.log("HTTP server on Port " + config.httpPort);
});

function app(req, res) {
	server.start(req, res);
};
