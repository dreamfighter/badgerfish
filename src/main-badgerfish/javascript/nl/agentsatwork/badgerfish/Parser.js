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
 * @constructor nl.agentsatwork.badgerfish.Parser
 */

var parser = null;

var onDocumentStart = null;
var onDocumentEnd = null;
var onElementStart = null;
var onElementEnd = null;
var onText = null;

var progress = 0;

function done() {
	switch (++progress) {
	case 3:
		initialize();
		break;
	}
}

/**
 * Set onDocumentStart callback
 * 
 * @param callback
 *          {Function}
 */
function Parser$onDocumentStart(callback) {
	onDocumentStart = callback;
	done();
}

/**
 * Set onDocumentEnd callback
 * 
 * @param callback
 *          {Function}
 */
function Parser$onDocumentEnd(callback) {
	onDocumentEnd = callback;
	done();
}

/**
 * Set onElementStart callback
 * 
 * @param callback
 *          {Function}
 */
function Parser$onElementStart(callback) {
	onElementStart = callback;
}

/**
 * Set onElementEnd callback
 * 
 * @param callback
 *          {Function}
 */
function Parser$onElementEnd(callback) {
	onElementEnd = callback;
	done();
}

function Parser$onText(callback) {
	onText = callback;
}
/**
 * Send a chunk of the XML document to the parser.
 * 
 * @param str
 *          {String} part of the document to be parsed
 */
function Parser$parseString(str) {
	logger.trace(str);
	parser.parseString(str);
}

function Parser$parseFile(file) {
	parser.parseFile(file);
}

function onStartElementNS(elem, attrs, prefix, uri, namespaces) {
	console.assert(namespaces.constructor === Array);
	console.assert(namespaces.length === 0);
	onElementStart(new XMLNS()['@'], prefix, elem, attrs);
}

function onCharacters(chars) {
	onText(chars, false);
}

function onCdata(cdata) {
	onText(cdata, true);
}

function onComment(msg) {
}

function onWarning(msg) {
	logger.warn(msg);
}

function onError(msg) {
	logger.error(msg);
}

function register(cb) {
	cb.onStartDocument(onDocumentStart);
	cb.onEndDocument(onDocumentEnd);
	cb.onStartElementNS(onStartElementNS);
	cb.onEndElementNS(onElementEnd);
	cb.onCharacters(onCharacters);
	cb.onCdata(onCdata);
	cb.onComment(onComment);
	cb.onWarning(onWarning);
	cb.onError(onError);
}

function initialize() {
	parser = new exports.SaxParser(register);
}
