/* global result */

function Tester() {
	this.request = new Request();

	this.stack = [];

	this.urlParams = "";

	this.stop = false;

	this.btnStart = document.getElementById('btnStart');
	this.btnStop = document.getElementById('btnStop');
	this.btnChunkSizeStart = document.getElementById('btnDetectSize');
	this.btnChunkSizeStop = document.getElementById('btnDetectSizeStop');

	this.lastCachedSize = 0;

	this.chunk_size_max = this.chunk_size_min = 1024 * 1024; // 1mb

	this.mode = 'limit';

	this.time = 0;

	this.init = function() {

		this.btnChunkSizeStart.addEventListener('click', this.chunkSizeStart.bind(this));
		this.btnChunkSizeStop.addEventListener('click', this.stopButton.bind(this));

		this.btnStart.addEventListener('click', this.startButton.bind(this));
		this.btnStop.addEventListener('click', this.stopButton.bind(this));
	};



	this.loadNew = function() {
		if(this.stop) {
			log("stopped", "info");
			return;
		}
		var url = this.urlParams + '_' + this.stack.length + '.json';

		var requestHeader = {
			'ac' : 'application/json'
		};
		if(this.mode == "chunk_size") {
			requestHeader['chunk_size_min']  = this.chunk_start_size;

			log("Loading a chunk with size of " + this.formatBytes(this.chunk_start_size), "info");
		} else {
			requestHeader['chunk_size_min']  = this.chunk_size_min;
			requestHeader['chunk_size_max'] = this.chunk_size_max;

			log("Load new piece " + this.stack.length, "info");
		}

		/**
		 * @param {xhr} XMLHttpRequest
		 */
		this.request.success = function(xhr) {
			var url = arguments[0];
			var requestHeader = arguments[1];
			var xhr = arguments[2];
			try {
				this.stack.push({
					'url' : url,
					'id' : xhr.getResponseHeader('X-Id'),
					'content-length' : xhr.getResponseHeader("Content-Length"),
					'requestHeader' : requestHeader
				});

				setTimeout(this.checkStack.bind(this), 10);
			} catch(e) {
				console.error(e);
			}
		}.bind(this, url, requestHeader);

		this.request.get(url, requestHeader);
	};

	/**
	 * Load an entry and check weather it's cached or not
	 */
	this.loadCached = function(entry) {
		/**
		 * @param {xhr} XMLHttpRequest
		 */
		this.request.success = function(xhr) {
			var entry = arguments[0];
			var xhr = arguments[1];
			try {
				
				if(this.mode === "chunk_size") {
					this.nextChunkSize(entry, xhr.getResponseHeader('X-Id') == entry.id ? true : false);
					return;
				}

				if(xhr.getResponseHeader('X-Id') == entry.id) {
					this.checkStack(entry);
				} else {
					this.finished();
				}
			} catch(e) {
				console.error(e);
			}
		}.bind(this, entry);

		this.request.get(entry.url, entry.requestHeader);
	};


	this.checkStack = function(entry) {

		// Chunk size: test only the last entry
		if(this.mode === "chunk_size") {
			return this.loadCached(this.stack[this.stack.length - 1]);
		}

		if(typeof(entry) === "undefined") {
			return this.loadCached(this.stack[0]);
		}
		
		for(var i = 0; i < this.stack.length; i++) {
			if(this.stack[i].url === entry.url && i+ 1 < this.stack.length ) {
				return this.loadCached(this.stack[i + 1]);
			}
		}
		this.lastCachedSize = this.getCachedSize();
		log("Cached-Size: " + this.formatBytes(this.lastCachedSize) + " (" + this.lastCachedSize + " b)")

		this.loadNew();
	};

	this.getCachedSize = function() {
		var s = 0;
		for(var i = 0; i < this.stack.length; i++) {
			s += parseInt(this.stack[i]['content-length']);
		}
		return s;
	};

	this.nextChunkSize = function(entry, cached) {
		if(cached) {
			log("Successfully cached chunk: " + this.formatBytes(this.chunk_start_size) + " (" + this.chunk_start_size + " b)", "success");
			this.stopTest();
			return;
		} else {
			log("Chunk not cached: " + this.formatBytes(this.chunk_start_size) + " (" + this.chunk_start_size + " b)", "danger");
		}

		if(this.stop) {
			log("stopped", "info");
			return;
		}
		
		this.chunk_start_size -= this.chunk_step;
		if(this.chunk_start_size <= 0) {
			log("Chunk size of 0 Bytes reached, stopping test", "danger");
			this.stopTest();
			return;
		}
		this.loadNew();
	};

	/**
	 * Test finish
	 */
	this.finished = function() {
		log("Finished Test after " + (this.stack.length - 1) + " cached parts", "success");
		log("###", "gray");
		this.stack = [];
		this.btnStop.style.display = 'none';
		this.btnStart.style.display = 'inline-block';
		
		log("The test runs for " + ((+new Date() - this.time) / 1000) + "s", "info");
	};

	/**
	 * Start chunk size detection
	 */
	this.chunkSizeStart = function() {
		this.chunk_start_size = this.unitToBytes(this.getInput('chunk_start_size'), this.getInput('chunk_start_unit'));
		this.chunk_step = this.unitToBytes(this.getInput('chunk_step_size'), this.getInput('chunk_step_unit'));

		if(this.chunk_start_size < 0 || this.chunk_start_size < this.chunk_step) {
			log("Step size has to be greater than start size!", "danger")
			return;
		}
		this.mode = 'chunk_size';
		this.prepareStart();

		log("##", "info");
		log("starting chunk size test. Starting from " + this.formatBytes(this.chunk_start_size) + " in " + this.formatBytes(this.chunk_step) + " steps.", "green");

		this.loadNew();

	};

	/**
	 * Start current test
	 */
	this.startButton = function() {
		// read inputs and convert size zu Bytes
		this.chunk_size_min = this.unitToBytes(this.getInput('min_size'), this.getInput('min_unit'));
		this.chunk_size_max = this.unitToBytes(this.getInput('max_size'), this.getInput('max_unit'));
		if(this.chunk_size_min < 0 || this.chunk_size_min > this.chunk_size_max) {
			log("Min and max size must be greater than 0 and max size have to be greater than min size.", "danger")
			return;
		}

		this.mode = 'limit';
		this.prepareStart();

		log("##", "info");
		log("starting cache limit test. Using sizes between " + this.formatBytes(this.chunk_size_min) + " and " + this.formatBytes(this.chunk_size_max) + ".", "green");

		this.loadNew();
	};

	this.prepareStart = function() {
		this.stack = [];
		this.stop = false;
		this.lastCachedSize = 0;
		this.time = +new Date();

		this.btnStart.style.display = 'none';
		this.btnChunkSizeStart.style.display = 'none';
		this.btnStop.style.display = 'inline-block';
		this.btnChunkSizeStop.style.display = 'inline-block';

		this.urlParams = "cachetest_" + +new Date();
	};

	this.unitToBytes = function(size, unit) {
		var size = parseFloat(size);
		switch(unit.toLocaleLowerCase()) {
			case 'mb':
				return size * 1024 * 1024;
			case 'kb':
				return size * 1024;
			default:
				return size;
		}
	};

	this.formatBytes = function(b) {
		if(b >= 1024 * 1024 * 1024) {
			return (b / 1024 / 1024 / 1024) + ' GB';
		}
		if(b >= 1024 * 1024) {
			return (b / 1024 / 1024) + ' MB';
		}
		if(b >= 1024) {
			return (b / 1024) + ' kB';
		}
		
		return b + ' b';	
	};

	this.stopTest = function() {
		this.stop = true;
		this.btnStop.style.display = 'none';
		this.btnStart.style.display = 'inline-block';
		this.btnChunkSizeStop.style.display = 'none';
		this.btnChunkSizeStart.style.display = 'inline-block';
		log("The test runs for " + ((+new Date() - this.time) / 1000) + "s", "info");
	};

	this.stopButton = function() {
		log("Stopping current test..", "danger");
		this.stopTest();
	};

	this.getInput = function(name) {
		var el = document.getElementById(name);
		return (!el) ? false : el.value;
	};
	
	this.init();

	return this;
};

var tester = new Tester();