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
 * @class nl.agentsatwork.badgerfish.Root
 * 
 * @param conf
 */

Root$.ready = true;

var cpx = new Badgerfish(new Package()['@'])['@'];

function ready() {
	CPX.ROOT = new Root(cpx.cpx);
}

cpx().getParser().parseString(new Buffer(CPX.XML, "base64").toString('utf8'));
cpx().ready(ready);

/**
 * @constructor nl.agentsatwork.badgerfish.Root
 * 
 * @param cpx
 *            {Element} the root (default) package
 */

function initialize() {
	CPX['@'] = cpx;
	var config = new Badgerfish()['@'];
	config().getParser().parseString(
			new Buffer(CPX.CONF, 'base64').toString('utf8'));
	if (!config.config) {
		logger.error("<config/> not found");
	} else {
		var mainclass = config.config["@mainclass"];
		if (typeof mainclass === "string") {
			new Root$import(mainclass)();
		} else {
			logger.error("attribute 'mainclass' not found on <config/>");
		}
	}
}

function Root$import(classname) {
	var path = classname.split('.');
	var result = cpx;
	for ( var i = 0; i < path.length; ++i) {
		result = result[path[i]];
		if (!result) {
			logger.error(classname + ": not found");
			return null;
		}
	}
	return result['@'];
}
