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
 * @class nl.agentsatwork.badgerfish.Element
 * 
 * This class represents XML element in the Badgerfish convention. Instances are
 * element objects that represent XML element nodes. Nested elements become
 * properties on the element object; attributes become properties starting with
 * the "@"-symbol; and xmlns objects go into the "@xmlns" property.
 * 
 * @param this
 *            {Type} extends Type
 */

argv.push(new Type()['@']);

/**
 * @constructor nl.agentsatwork.badgerfish.Element
 * 
 * @param parent
 *            {Type} parent element of this node; in case of a root element
 *            parent is an instance of Badgerfish
 * @constructor
 */

var index = null;
var type = null;

function Element$select(query, unique) {
	return query.select(this, unique);
}

function Element$foreach(qname, callback) {
	var value = self[qname];
	if (value) {
		if (value.constructor === Array) {
			for ( var i = 0; i < value.length; ++i) {
				callback(value[i]);
			}
		} else {
			callback(value);
		}
	}
}

/**
 * Called when parsing of this element is started.
 * 
 * @param tns
 *            {String}
 * @param xmlns
 *            {XMLNS}
 * @param attr
 *            {Array}
 */
function Element$onStart(tns, xmlns, attr) {
	var uri = self().getURI();
	if (tns !== uri) {
		console.assert(false);
	}
	self().updateXMLNS(xmlns);
	self().updateAttributes(attr);

	console.assert(!index);
	index = {};
	type = parent().getType(self);
	self().setType(type);
}

/**
 * Called when text is parsed; either textnode or CDATA.
 * 
 * @param text
 *            {String} text of the node
 * @param cdata
 *            {Boolean} whether or not origin is CDATA
 */
function Element$onText(text, cdata) {
	var dollar = self.$;
	if (dollar) {
		if (dollar.constructor === Array) {
			dollar.push(text);
		} else {
			if (typeof dollar !== "string") {
				logger.debug("element with non-string text");
			}
			self.$ = [ dollar, text ];
		}
	} else {
		self.$ = text;
	}
}

/**
 * Called when, during parsing, a child element is found.
 * 
 * @param xmlns
 *            {XMLNS}
 * @param prefix
 *            {String}
 * @param elem
 *            {String}
 * @param attr
 *            {Array}
 * @returns
 */
function Element$onChild(xmlns, prefix, elem, attr) {
	var qualified = self().qualify(prefix, elem);
	var i = index[qualified];
	if (typeof i === "number") {
		++i;
	} else {
		i = 0;
	}
	index[qualified] = i;

	var node = self[qualified];
	switch (i) {
	case 0:
		if (node) {
			if (node.constructor === Array) {
				console.assert(node.length > 0);
				node = node[0];
			}
		} else {
			node = self().createChild(xmlns, prefix, elem, attr);
			self[qualified] = node;
		}
		break;
	case 1:
		console.assert(node);
		if (node.constructor === Array) {
			console.assert(node.length > 0);
			if (node.length === 1) {
				node.push(self().createChild(xmlns, prefix, elem, attr));
			}
		} else {
			node = [ node, self().createChild(xmlns, prefix, elem, attr) ];
			self[qualified] = node;
		}
		node = node[1];
		break;
	default:
		console.assert(node);
		console.assert(node.constructor === Array);
		console.assert(node.length >= i);
		if (node.length === i) {
			node.push(self().createChild(xmlns, prefix, elem, attr));
		}
		node = node[i];
		break;
	}
	node().onStart(xmlns[prefix], xmlns, attr, i);
	return node;
}

/**
 * Called when, during parsing, no more child elements are found. The index
 * variable contains the last index for each qualified tag name; elements that
 * exceed the index are removed.
 */
function Element$onEnd() {
	console.assert(index);
	for ( var qualified in index) {
		var i = index[qualified];
		var node = self[qualified];
		switch (i) {
		case 0:
			if (node.constructor === Array) {
				console.assert(node.length > 0);
				self[qualified] = node[0];
			}
			break;
		default:
			console.assert(node.constructor === Array);
			for ( var j = ++i; j < node.length; ++j) {
				node.pop();
			}
			break;
		}
	}
	index = null;
}

function Element$qualify(prefix, element) {
	var xmlns = self["@xmlns"];
	if (xmlns) {
		return xmlns().qualify(prefix, element);
	} else {
		return element;
	}
}

function Element$mixinXMLNS(xmlns) {
	var check = false;
	for ( var prefix in xmlns) {
		if (!self["@xmlns"]) {
			self["@xmlns"] = new XMLNS()['@'];
		}
		var uri = self["@xmlns"][prefix];
		if (uri) {
			if (uri !== xmlns[prefix]) {
				throw new Exception("prefix '" + prefix + "' already bound");
			}
		} else {
			check = true;
		}
	}
	if (check) {
		for ( var prefix in self["@xmlns"]) {
			xmlns[prefix] = self["@xmlns"][prefix];
		}
		return xmlns;
	} else {
		return self["@xmlns"];
	}
}

function Element$updateXMLNS(xmlns) {
	// return self().mixinXMLNS(xmlns);
}

function Element$updateAttributes(attr) {
	if (attr && attr.constructor === Array) {
		for ( var i = 0; i < attr.length; ++i) {
			console.assert(typeof attr[i][0] === "string");
			if (attr[i][0].charAt(0) === "@") {
				self[attr[i][0]] = attr[i][1];
			} else {
				self["@" + attr[i][0]] = attr[i][1];
			}
		}
	} else {
		for ( var name in attr) {
			if (name.charAt(0) === "@") {
				self[name] = attr[name];
			} else {
				self["@" + name] = attr[name];
			}
		}
	}
}

function Element$createChild(xmlns, prefix, elem, attr) {
	var result = type().createChild(self, xmlns, prefix, elem, attr);
	console.assert(result);
	return result;
}
