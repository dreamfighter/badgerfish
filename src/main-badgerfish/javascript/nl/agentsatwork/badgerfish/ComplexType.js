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
 * @constructor nl.agentsatwork.badgerfish.ComplexType
 */

/**
 * Create a new element.
 * 
 * @param parent
 *            {Type}
 * @param xmlns
 *            {XMLNS}
 * @param prefix
 *            {String}
 * @returns {Element}
 */
function ComplexType$createChild(parent, xmlns, prefix) {
	console.assert(prefix === null);
	return new Element(parent)['@'];
}

/**
 * Validates a child and returns the type to which it validates.
 * 
 * @param element
 *            {Element}
 * @returns {Boolean}
 */
function ComplexType$validate(element) {
	return self;
}