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
 * @constructor nl.agentsatwork.badgerfish.XMLNS
 * 
 * This class provides Badgerfish representation of xmlns attributes inside XML
 * elements. Instances of this class are xmlns objects. According to the
 * Badgerfish convention, xmlns objects go in the "@xmlns" attributes of element
 * objects (see the Element class below). The xmlns objects themselves contain a
 * property for each namespace prefix; these properties are mapped into
 * namespace uri's.
 */

var self = this;

/**
 * Method for retrieving all prefixes in this xmlns object that map to a given
 * namespace.
 * 
 * @param uri
 *          {String} namespace uri
 * @returns {Array} all prefixes mapping to namespace uri
 */
function XMLNS$prefixesOf(uri) {
	var result = [];
	for ( var prefix in this) {
		if (this[prefix] === uri) {
			result.push(prefix);
		}
	}
	return result;
}

/**
 * Method for retrieving the default prefix of a name space. If the namespace is
 * a default namespace then '$' is the default prefix. If there is only one
 * prefix for the namespace then that one is the default. Otherwise, default
 * prefixes in XMLNS.defaults are used to determine the default prefix.
 * 
 * @param uri
 *          {String} namespace uri
 * @returns {String} default prefix that maps to namespace uri
 * 
 * @throws {Error}
 *           if no prefix exist for namespace uri or the prefix is not default.
 */
function XMLNS$prefixOf(uri) {
	var result = this.prefixesOf(uri);
	switch (result.length) {
	case 0:
		throw new Error(uri + ": no prefix exists for this namespace");
	case 1:
		return result[0];
	default:
		if (this.$ === uri) {
			return "$";
		}
		var defaults = XMLNS.defaults[uri];
		for ( var i = 0; i < defaults.length; ++i) {
			if (this[defaults[i]] === uri) {
				return defaults[i];
			}
		}
		throw new Error(uri + ": namespace has no default prefix");
	}
}

/**
 * Method returns the qualified name for a given prefix and element pair. If one
 * or more aliases (i.e., prefixes that map to the same namespace) exist, then
 * the default prefix for the namespace will be used to qualify the element. An
 * Error will be thrown if the prefix is not bound.
 * 
 * @param prefix
 *          {String} prefix of the element
 * @param elem
 *          {String} name of the element
 * @returns {String}
 */
function XMLNS$qualify(prefix, elem) {
	if (prefix) {
		var uri = self[prefix];
		if (!uri) {
			throw new Error("prefix '" + prefix + "' for element '" + prefix + ":"
					+ elem + "' is not bound");
		}
		if (this.prefixesOf(uri).length > 1) {
			return this.prefixOf(uri) + ":" + elem;
		} else {
			return prefix + ":" + elem;
		}
	} else {
		return elem;
	}
}
