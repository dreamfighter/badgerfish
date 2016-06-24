/**
 * Copyright © 2012, 2013 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software:
 * you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version. Badgerfish
 * CPX is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details. You
 * should have received a copy of the GNU Lesser General Public License along
 * with Badgerfish CPX. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @constructor nl.agentsatwork.server.Server
 * 
 * @param port
 *            {Number} port to listen for HTTP request
 * @param catalog
 *            {Catalog} XML catalog to use
 * @param mime
 *            {Badgerfish} badgerfish document of the mimetype mapping
 */

var http = null;
var fs = null;
var server = null;

function initialize() {
	http = require("http");
	fs = require("fs");
	server = http.createServer(Server$connect);
}

function Server$start() {
	server.listen(port);
}

function Server$stop() {
	server.close();
}

function Server$mimetype(url) {
	var match = /\.(.+)$/.exec(url);
	return mime.extension[match[1]].$;
}

function Server$forward(input, output) {
	function onData(buffer) {
		if (!output.write(buffer)) {
			throw new Error("write error");
		}
		;
	}

	function onEnd() {
		output.end();
	}

	input.on("data", onData);
	input.on("end", onEnd);
}

function Server$fileProtocolTransfer(url, response) {
	var match = /^file:\/\/(localhost)?\/(.*)$/.exec(url);
	var stream = fs.createReadStream(match[2]);
	this.forward(stream, response);
}

function Server$connect(request, response) {
	var url = catalog.resolve(request.url);
	if (/^file:/.test(url)) {
		response.writeHead(200, {
			"Content-Type" : mimetype(url)
		});
		self().fileProtocolTransfer(url, response);
	} else if (/^http:/.test(url)) {

	} else {

	}
}
