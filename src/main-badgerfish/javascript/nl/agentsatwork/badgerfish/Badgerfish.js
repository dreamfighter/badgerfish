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
 * @class nl.agentsatwork.badgerfish.Badgerfish
 * 
 * This is the main class for Badgerfish representations of XML documents.
 * Creating an instance of this class will give you a new empty XML document
 * according to the Badgerfish convention.
 *
 * @param this
 *            {Type} extends Type
 */

//argv.push(null);

/**
 * @constructor nl.agentsatwork.badgerfish.Badgerfish
 * 
 * @param type
 *            {Object}
 */
var ancestor = null;
var theParser = null;
var continuation = null;

function initialize() {
	if (!type) {
		type = new ComplexType()['@'];
	}
	self().setType(type);
}

/**
 * onDocumentStart event during SAX parsing
 */
function onDocumentStart() {
	logger.debug("onDocumentStart");
	console.assert(!ancestor);
	ancestor = [];
	console.assert(continuation === null);
	continuation = new Array();
}

/**
 * onElementStart event during SAX parsing
 * 
 * @param xmlns
 *            {XMLNS} XML namespace object mapping prefixes into namespace uri's
 *            or null when there are no namespaces at all
 * @param prefix
 *            {String} namespace prefix of the element; empty string means
 *            default namespace and null means no namespace
 * @param elem
 *            {String} tagname of the element
 * @param attr
 *            {Array} attributes as an array of ordered pairs (ordered pair is
 *            an array of length two)
 */
function onElementStart(xmlns, prefix, elem, attr) {
	logger.trace("<"+elem+">");
	console.assert(prefix === null || typeof prefix === "string");
	console.assert(ancestor);
	var element = ancestor.pop();
	if (element) {
		var child = element().onChild(xmlns, prefix, elem, attr);
		console.assert(child);
		ancestor.push(element);
		ancestor.push(child);
	} else {
		element = type().createChild(self, xmlns, prefix, elem, attr);
		self[xmlns().qualify(prefix, elem)] = element;
		element().onStart(xmlns[prefix], xmlns, attr);
		ancestor.push(element);
	}
}

/**
 * onElementEnd event during SAX parsing
 */
function onElementEnd() {
	var element = ancestor.pop();
	logger.trace("</"+element().getName()+">");
	element().onEnd();
}

/**
 * onDocumentEnd event during SAX parsing
 */
function onDocumentEnd() {
	logger.debug("onDocumentEnd");
	console.assert(ancestor);
	console.assert(ancestor.length === 0);
	ancestor = null;
	var callback;
	while (callback = continuation.shift()) {
		callback();
	}
	continuation = null;
}

/**
 * onText event during SAX parsing; originates from either textnodes or CDATA
 * sections.
 * 
 * @param text {String} the text as a string
 * @param cdata {Boolean} whether origin is CDATA or not
 */
function onText(text, cdata) {
	console.assert(typeof text === "string");
	var element = ancestor.pop();
	element().onText(text, cdata ? true : false);
	ancestor.push(element);
}

/**
 * Register a SAX parser that allows us to set event handlers for at least
 * document- and element events.
 * 
 * @param parser
 *            {Parser}
 */
function Badgerfish$registerSAXParser(parser) {
	if (typeof parser === "function") {
		parser = parser();
	}
	parser.onText(onText);
	parser.onDocumentStart(onDocumentStart);
	parser.onElementStart(onElementStart);
	parser.onElementEnd(onElementEnd);
	parser.onDocumentEnd(onDocumentEnd);
	theParser = parser;
}

function Badgerfish$getParser() {
	if (!theParser) {
		Badgerfish$registerSAXParser(new Parser());
	}
	return theParser;
}

function Badgerfish$ready(callback) {
	if (continuation === null) {
		callback();
	} else {
		continuation.push(callback);
	}
}
