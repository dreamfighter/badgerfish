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
 * @class nl.agentsatwork.badgerfish.Type
 * 
 * This is the base class for all XML elements. It provides methods to deal with
 * the complex type of the element as defined in the schema (XSD).
 */

argv.push(null);
argv.push(null);

/** 
 * @constructor nl.agentsatwork.badgerfish.Type
 * 
 * @param uri
 *            {String} namespace uri for the element
 * @param name
 *            {String} element name
 */

var theType = null;

/**
 * @returns {String} name of the element that extends this class
 */
function Type$getName() {
	return name;
}

/**
 * @returns {String} namespace uri in which the element name and complex type
 *          are defined
 */
function Type$getURI() {
	return uri;
}

/**
 * Note that this method does not return the complex type of the extending
 * element, but the type of one of its childs.
 * 
 * @param child {Element} child to validate at the complex type
 * @returns {ComplexType+null} complex type of the child (if validated)
 */
function Type$getType(child) {
	if (theType) {
		return theType().validate(child);
	}
}

/**
 * Sets the complex type for the extending element.
 * 
 * @param type {ComplexType} complex type to be set
 */
function Type$setType(type) {
	theType = type;
}
