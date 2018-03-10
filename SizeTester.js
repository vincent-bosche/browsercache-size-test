const fs		= require('fs');
const path 		= require("path");
const config	= require(__dirname + "/config.json");

class SizeTester {
	constructor() {
	};

	start (req, res) {
		this.req = req;
		this.res = res;
        
		if(this.req.url.indexOf("cachetest_") !== -1) {
			this.response();
		} else {
			this.showFile(this.req.url);
		}
	};

    /**
     * Response static files
     * @param {string} url
     */
	showFile(url) {
		if(url === "/") {
			url = "/index.html";
		}
		var file = __dirname + '/static' + url;

		try {
			fs.accessSync(file, fs.F_OK);
			this.res.writeHead(200, {'Content-Type' : config.mimeTypes[path.extname(file).split(".")[1]]});
			fs.createReadStream(file).pipe(this.res);
		} catch(e) {
			console.dir(e);
			console.log('File not exists: ' + file);
			this.res.writeHead(404, {'Content-Type' : 'text/plain'});
			this.res.write('404 Not Found\n');
			this.res.end();
		}
	};

	/**
	 *
	 * @return 
	 */
	response() {
		let id = new Date().getTime();

		this.res.setHeader("X-Id", id);
		this.res.setHeader("Date", new Date(Date.now()).toUTCString());
		this.res.setHeader("ETag", id);

		// Expires 1h
		var expires = new Date(Date.now() + 60*60 * 1000).toUTCString();
		this.res.setHeader("Expires", expires);

		this.res.setHeader("Content-Type", this.req.headers["accept"]);
		
		let min = 1024 * 1024; // 1 MB
		if(this.req.headers["x-chunk-size-min"]) {
			min = parseInt(this.req.headers["x-chunk-size-min"]);
		}
		let size = min;
		if(this.req.headers["x-chunk-size-max"]) {
			let max = parseInt(this.req.headers["x-chunk-size-max"]);
			size = Math.random() * (max - min) + min;
		}
		console.log("Target size: " + (size / 1024 / 1024) + " MB");

		// Size limit in nodejs (256MB, leave 1 MB tolerance)
		let limit = 255 * 1024 * 1024;
		if(size > limit) {
			let count = Math.floor(size / limit) + 1;
			let chunk_size = size / count;
			console.log("Size of " + Math.floor(limit / 1024 / 1024) + "MB exceedet, splitting into " + count + " chunks with a size of: " + (chunk_size / 1024 / 1024) + "MB each");

			// this.res.write sets no content-length, cause it's a buffer
			this.res.setHeader('Content-Length', size);

			for(let i = 0; i < count; i++) {
				console.log("write chhunk " + i)
				this.res.write(this.generateString(chunk_size));
			}
			return this.res.end();
			
		} else {
			return this.res.end(this.generateString(size));
		}
	};

    /**
     * generate a random string
     * @param {int} size
     * @returns {SizeTester.generateString.string|String} random String with target size
     */
	generateString(size) {
		let chunk = (size > 1024) ? 1024 : size; // kB
		let string = "";
		while (size > 0) {
			// use crypto to receive a random pool
			var pool = require('crypto').randomBytes(48).toString('hex');
			string += str_pad("", Math.min(chunk, size), pool);
			size -= chunk;
		}
		return string;
	};
}

/**
 * PHP str_pad for Javascript
 * http://locutus.io/php/strings/str_pad/
 */
function str_pad (input, padLength, padString, padType) { 
	var half = '';
	var padToGo;

	var _strPadRepeater = function (s, len) {
		var collect = '';
		while (collect.length < len) {
			collect += s;
		}
		return collect.substr(0, len);
	}

	input += '';
	padString = padString !== undefined ? padString : ' ';

	if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH') {
		padType = 'STR_PAD_RIGHT';
	}
	if ((padToGo = padLength - input.length) > 0) {
		if (padType === 'STR_PAD_LEFT') {
			input = _strPadRepeater(padString, padToGo) + input;
		} else if (padType === 'STR_PAD_RIGHT') {
			input = input + _strPadRepeater(padString, padToGo);
		} else if (padType === 'STR_PAD_BOTH') {
			half = _strPadRepeater(padString, Math.ceil(padToGo / 2));
			input = half + input + half;
			input = input.substr(0, padLength);
		}
	}
	return input;
}

exports.SizeTester = SizeTester;