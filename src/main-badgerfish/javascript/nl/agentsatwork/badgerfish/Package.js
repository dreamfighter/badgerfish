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
 * @class nl.agentsatwork.badgerfish.Package
 *
 * @param this {ComplexType}
 */

/**
 * @constructor nl.agentsatwork.badgerfish.Package
 */

/**
 * Check if element is a package or a class.
 * 
 * @param element
 *            {String} tagname of the element
 * @return {Boolean}
 */
function isPackage(element) {
	var head = element.charAt(0);
	return head.toLowerCase() === head;
}

/**
 * Create a new element.
 * 
 * @param parent
 *            {Type}
 * @param xmlns
 *            {XMLNS}
 * @param prefix
 *            {String}
 * @param element
 *            {String}
 * @param attr
 *            {Object}
 * @returns {Element}
 */
function Package$createChild(parent, xmlns, prefix, element, attr) {
	console.assert(prefix === null);
	var result = new Element(parent)['@'];
	if (!isPackage(element)) {
		console.assert(attr.constructor === Array);
		console.assert(attr.length === 1);
		var seqnr = attr[0];
		console.assert(seqnr.constructor === Array);
		console.assert(seqnr.length === 2);
		console.assert(seqnr[0] === "seqnr");
		var method = classes[seqnr[1]];
		console.assert(method);
		result._ = method[0];
		result['@'] = method[1];
	}
	return result;
}
