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
 * @constructor nl.agentsatwork.badgerfish.BadgerfishTest
 */

var badgerfish = null;
var parser = null;

function BadgerfishTest$setup() {
	badgerfish = new Badgerfish();
	parser = badgerfish.getParser();
}

function BadgerfishTest$firstExample(test) {
	parser.parseString("<alice />");
	test.assertEqual(badgerfish['@'], {
		alice : {}
	});
}

function BadgerfishTest$secondExample(test) {
	parser.parseString("<alice>bob</alice>");
	test.assertEqual(badgerfish['@'], {
		alice : {
			$ : "bob"
		}
	});
}

function BadgerfishTest$thirdExample(test) {
	parser.parseString("<alice><bob>charlie</bob><david>edgar</david></alice>");
	test.assertEqual(badgerfish['@'], {
		alice : {
			bob : {
				$ : "charlie"
			},
			david : {
				$ : "edgar"
			}
		}
	});
}

function BadgerfishTest$fourthExample(test) {
	parser.parseString("<alice><bob>charlie</bob><bob>david</bob></alice>");
	console.log(badgerfish['@'].alice.bob);
	test.assertEqual(badgerfish['@'], {
		alice : {
			bob : [ {
				$ : "charlie"
			}, {
				$ : "david"
			} ]
		}
	});
}

function BadgerfishTest$fifthExample(test) {
	parser.parseString("<alice charlie='david'>bob</alice>");
	test.assertEqual(badgerfish['@'], {
		alice : {
			$ : "bob",
			"@charlie" : "david"
		}
	});
}
