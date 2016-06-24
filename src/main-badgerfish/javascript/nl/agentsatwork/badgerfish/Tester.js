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
 * @constructor nl.agentsatwork.badgerfish.Tester
 */

var tests = 0;
var failures = 0;

function initialize() {
	Tester$.ready = false;
	function recurse(pkg, pkgname) {
		for ( var name in pkg) {
			console.assert(name.charAt(0) !== '@');
			var element = pkg[name];
			if (element['@seqnr']) {
				var constr = element['@'];
				if (element._.ready === false) {
					logger.trace("skipping " + name);
				} else {
					if (!element._.ready) {
						console.assert(element._.ready === undefined);
						element._();
					}
					console.assert(element._.ready === true);
					element._.ready = false;
					logger.info("running tests on: " + pkgname + name);
					new constr(self());
					console.assert(element._.ready === true);
				}
			} else {
				recurse(element, pkgname + name + ".");
			}
		}
	}
	recurse(CPX['@'], "");
	if (failures > 0) {
		logger.fatal("FAILED: " + failures + " out of " + tests + " tests");
	}
}

function Tester$onTest(name) {
	++tests;
	logger.info("TEST: " + name);
}

function Tester$assertEqual(value, expected) {
	function recurse(source, target, path) {
		for ( var key in source) {
			if (target[key] === undefined) {
				++failures;
				logger.error("path " + path + "/" + key + " not expected");
			} else {
				if (key === "$" || key.charAt(0) === "@") {
					console.assert(typeof source[key] === "string");
					console.assert(typeof target[key] === "string");
					if (source[key] !== target[key]) {
						console.assert(typeof target[key] === "string");
						++failures;
						logger.error("value at " + path + "/" + key + " is "
								+ source[key] + ", but " + target[key]
								+ " expected");
					}
				} else {
					var src = source[key];
					var dst = target[key];
					if (typeof src === "function") {
						recurse(src, dst, path + "/" + key);
					} else {
						console.assert(src.constructor === Array);
						console.assert(dst.constructor === Array);
						var size = src.length;
						if (size === dst.length) {
							for ( var i = 0; i < size; ++i) {
								recurse(src[i], dst[i], path + "/" + key + "["
										+ i + "]");
							}
						} else {
							++failures;
							logger
									.error("size mismatch at " + path + "/"
											+ key);
						}
					}
				}
			}
		}
		for ( var key in target) {
			if (source[key] === undefined) {
				++failures;
				logger.error("path " + path + "/" + key + " expected");
			}
		}
	}
	if (typeof value === "function") {
		recurse(value, expected, "");
	} else {
		logger.error("badgerfish object expected");
	}
}
