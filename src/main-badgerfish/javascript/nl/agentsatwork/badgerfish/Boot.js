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
 * @constructor nl.agentsatwork.badgerfish.Boot
 * 
 * This is the startup code for the AAW classloader framework. Classes in this
 * framework are packaged as XML documents. The startup code is responsible for
 * converting classes on the filesystem into XML structures.
 * 
 * For more information on AAW's classloader see:
 * {@link http://www.agentsatwork.nl/classloader/}
 * {@link http://code.google.com/p/badgerfish/}
 */
var path = null;
var fs = null;
var vm = null;

var todo = 0;
var continuation = new Array();
var stream = null;
var output = null;

function Boot$setJavascriptStream(newstream) {
	stream = newstream;
}

function Boot$setXMLStream(stream) {
	output = stream;
}

function Boot$ready(callback) {
	if (todo === 0) {
		callback();
	} else {
		console.assert(todo > 0);
		continuation.push(callback);
	}
}

function onStart() {
	stream.write("CPX.OFFSET = CPX.CLASSES.length;");
	output.write("<cpx>");
}

/**
 * 
 * @param filename
 */
function onPackageStart(name) {
	output.write("<" + name + ">");
	stream.write("(function () { // " + name + "\n");
}

function onPackageEnd(name) {
	output.write("</" + name + ">");
	stream.write("})();");
}

function onClass(seqnr, namespace, classname, result) {
	var fullname = namespace + "." + classname;
	var constrname = classname + "$" + classname;
	var staticname = classname + "$";
	var readyname = staticname + ".ready";
	var supername = staticname + ".superclass";
	function check(argv, type) {
		for ( var i = 0; i < argv.length; ++i) {
			console.assert(typeof argv[i] === "string");
			var datatype = type[argv[i]];
			console.assert(typeof datatype === "string");
			var phi = false;
			switch (datatype) {
			case "number":
			case "Number":
				phi = "!" + argv[i] + " || typeof " + argv[i] + " === 'number'";
				break;
			case "string":
			case "String":
				phi = "!" + argv[i] + " || typeof " + argv[i] + " === 'string'";
				break;
			case "array":
			case "Array":
				phi = "!" + argv[i] + " || " + argv[i]
						+ ".constructor === Array";
				break;
			case "function":
			case "Function":
				phi = "typeof " + argv[i] + " === 'function'";
				break;
			case "object":
			case "Object":
				phi = "!" + argv[i] + " || typeof " + argv[i]
						+ " === 'object' || typeof " + argv[i]
						+ " === 'function'";
				break;
			default:
				phi = argv[i] + "() && " + argv[i] + "()." + datatype;
				break;
			}
			stream.write("\tif(!(" + phi
					+ ")) { logger.error('cannot assign {'+" + argv[i]
					+ ".constructor.name+'} to: " + argv[i] + " {" + datatype
					+ "}'); }");
		}
	}

	stream.write("var " + classname + "=null;");
	stream.write("(function(){var argv = new Array(); // " + classname + "\n");

	var argv = result.block[0].argv;
	var type = result.block[0].type;
	var hasLogger = false;
	for ( var i = 0; i < argv.length; ++i) {
		if (argv[i] === "logger") {
			hasLogger = true;
		}
		stream.write("\tvar " + argv[i] + " = null;\n");
	}
	if (!hasLogger) {
		stream.write("\tvar logger = null;\n");
	}
	stream.write("function " + staticname + "() {if(" + readyname
			+ "===undefined){" + readyname + "=null;\n");
	if (!hasLogger) {
		stream.write("\tlogger = new Logger('" + fullname + "');\n");
		stream.write("\tlogger.trace('initializing class...');\n");
	}
	stream.write(supername + ".push(");
	if (type["this"]) {
		stream.write(type["this"]);
	} else {
		stream.write("Object");
	}
	stream.write(");\n");
	stream.write(result.block[0].source);
	check(argv, type);
	stream
			.write(readyname
					+ "=true;logger.trace('class initialized');}else if("
					+ readyname
					+ "===null){throw new Error('cyclic static dependencies not allowed');}}\n");

	argv = result.block[1].argv;
	type = result.block[1].type;
	stream.write("function " + constrname + "(" + argv.join(",") + "){if("
			+ readyname + "){logger.trace('creating instance...');\n");
	stream.write(result.block[1].source);
	stream.write("var self=this['@'];if(!self){self=CPX.CLOSURE(this);this['@']=self;};"
			+ supername
			+ "[0].apply(this,Array.prototype.slice.call(arguments,"
			+ argv.length + "));\n");
	check(argv, type);
	var methods = result.methods;
	for ( var method in methods) {
		var label = methods[method];
		for ( var i = 0; i < label.length; ++i) {
			if (label[i] === "public") {
				stream.write("this." + method + " = " + classname + "$"
						+ method + ";\n");
			}
		}
	}
	stream.write("this." + classname + " = " + constrname + ";\n");
	if (methods.initialize) {
		stream
				.write("logger.trace('initializing instance...');initialize();logger.trace('instance creation completed');");
	}
	stream.write("}else if(" + readyname + "===false){\n");
	stream.write(readyname + "=true;" + "if(argv.length<" + argv.length
			+ "){logger.warn('too few default arguments');}else{" + constrname
			+ ".apply(this,argv);\n");
	for ( var method in methods) {
		var label = methods[method];
		for ( var i = 0; i < label.length; ++i) {
			if (label[i] === "test") {
				if (methods.setup) {
					stream.write("arguments[0].onTest('"+method+"');this.setup();");
				}
				console.assert(methods.setup);
				stream.write("this." + method + "(arguments[0]);");
				if (methods.teardown) {
					stream.write("this.teardown();");
				}
			}
		}
	}
	stream.write("}}else{" + staticname + "();" + constrname
			+ ".apply(this,Array.prototype.slice.call(arguments));}}\n");

	output.write("<" + classname + " seqnr='" + seqnr + "'><![CDATA["
			+ result.$ + "]]" + "></" + classname + ">");
	stream.write("\t" + classname + " = " + constrname + ";\n");
	stream.write("\t" + supername + "=new Array();\n");
	stream.write("\tCPX.CLASSES.push([" + staticname + "," + classname + "]);\n");
	stream.write("})(); // " + classname + "\n");
}

function onEnd() {
	output.write("</cpx>");
	var buffer = output.getCache();
	stream.write("CPX.XML='" + buffer.toString("base64")
			+ "';var classes=CPX.CLASSES;for(var i=0;i<classes.length;++i){classes[i][0]();}\n");
}

/**
 * This method is called once booting a subtree in the filesystem into a JSON
 * object is complete.
 * 
 * @param result
 *            {Object} the complete JSON object from the boot process
 */
function Boot$continuation(result) {
	var check = true;
	for ( var name in result) {
		console.assert(check);
		console.assert(name === ".");
		check = false;
	}
	var seqnr = 0;
	function walk(result, namespace) {
		console.assert(typeof result === "object");
		for ( var name in result) {
			var head = name.charAt(0);
			if (head.toLowerCase() !== head) {
				onClass(seqnr++, namespace, name, result[name]);
			}
		}
		for ( var name in result) {
			var head = name.charAt(0);
			if (head.toLowerCase() === head) {
				onPackageStart(name);
				walk(result[name], namespace + "." + name);
				onPackageEnd(name);
			}
		}
	}
	onStart();
	walk(result["."], "");
	onEnd();
}

function Lines(content) {
	var lines = content.split("\n");
	var line = 0;
	var position = 0;

	function Lines$loc(pos) {
		if (pos > position) {
			var offset = pos - position;
			var size = lines[line].length;
			while (offset >= size) {
				offset -= size;
				position += size;
				size = lines[++line].length;
			}
			console.assert(offset < size);
			return line + ":" + offset;
		} else {
			console.assert(false);
		}
	}

	this.loc = Lines$loc;

	console.assert(lines.constructor === Array);
	console.assert(line === 0);
	console.assert(position === 0);
}

/**
 * Parse the source code of a class.
 * 
 * @param namespace
 *            {String} namespace of the class; e.g.,
 *            'nl.agentsatwork.badgerfish'
 * @param classname
 *            {String} name of the class; e.g., 'Badgerfish'
 * @param content
 *            {String} content of the Javascript source file
 * @param result
 *            {Object} output of the parsing process
 */
function parse(namespace, classname, content, result) {
	var error = new Array();
	var block = new Array();
	var methods = new Object();
	result.error = error;
	result.block = [ {
		comment : "",
		source : "",
		argv : new Array(),
		type : new Object()
	}, {
		comment : "",
		source : "",
		argv : new Array(),
		type : new Object()
	} ];
	result.methods = methods;

	var lines = new Lines(content);

	var fullname = namespace + "." + classname;
	var part = content.split(/^\/\*/m);
	console.assert(part.length > 0);
	if (part.length === 1) {
		error.push(fullname
				+ ": source code requires comment with JSDoc annotations");
		return;
	}

	var index = part[0].length;
	if (!/^\s*$/.exec(part.shift())) {
		error.push(fullname + ":" + lines.loc(index)
				+ ": source must start with a '/* ... */' comment");
	}

	var comment = "";

	function parseComment() {
		var result = new Object();
		var type = new Object();
		var argv = new Array();
		result.type = type;
		result.argv = argv;

		var annotation = comment.split("@");
		var pos = annotation.shift().length;
		for ( var i = 0; i < annotation.length; ++i) {
			match = /^param[*\s]+([^*\s]+)[*\s]+{([^}]+)}/m.exec(annotation[i]);
			if (match) {
				if (/[\/\.]/.test(match[2])) {
					error.push(fullname + ":" + lines.loc(index + pos)
							+ ": syntax error");
				} else {
					if (match[1] !== "this") {
						argv.push(match[1]);
					}
					type[match[1]] = match[2];
				}
			} else {
				match = /^constructor/.exec(annotation[i]);
				if (match) {
					var loc = lines.loc(index + pos);
					console.assert(loc);
					result["@constructor"] = loc;
				}
				match = /^class/.exec(annotation[i]);
				if (match) {
					var loc = lines.loc(index + pos);
					console.assert(loc);
					result["@class"] = loc;
				}
			}
			pos += annotation[i].length;
			++pos;
		}
		return result;
	}

	for ( var i = 0; i < part.length; ++i) {
		comment += "/*";
		var source = part[i].split("*/");
		comment += source[0];
		switch (source.length) {
		case 0:
			console.assert(false);
			break;
		case 1:
			break;
		case 2:
			comment += "*/";
			var aux = parseComment();
			aux.comment = comment;
			aux.source = source[1];
			block.push(aux);
			index += comment.length;
			index += source[1].length;
			comment = "";
			break;
		default:
			error.push(fullname
					+ lines.loc(index + comment.length + source[1].length)
					+ ": syntax error");
			return;
		}
	}
	var match = /^\s*\/\*[*\s]*([^*\s\/]+)\s/m.exec(block[0].comment);
	if (!match) {
		error
				.push(fullname
						+ ": first comment must contain the full classname");
	}
	if (match[1] !== fullname) {
		error.push(fullname
				+ ": no match with classname specified in first comment: "
				+ match[1]);
	}

	function mixin(target, source) {
		var base = source.type["this"];
		if (base) {
			target.type["this"] = base;
		}
		target.comment += source.comment;
		target.source += source.source;
		for ( var i = 0; i < source.argv.length; ++i) {
			var name = source.argv[i];
			if (target.type[name]) {
				error.push(fullname + ": variable '" + name
						+ "' already declared");
			} else {
				target.argv.push(name);
				target.type[name] = source.type[name];
			}
		}
	}

	var isStatic = null;
	for ( var i = 0; i < block.length; ++i) {
		if (block[i]["@constructor"]) {
			if (block[i]["@class"]) {
				error
						.push(fullname
								+ ":"
								+ block[i]["@class"]
								+ ": @class not allowed in combination with @constructor");
			}
			mixin(result.block[1], block[i]);
			isStatic = false;
		} else if (block[i]["@class"]) {
			mixin(result.block[0], block[i]);
			isStatic = true;
		} else {
			if (isStatic === null) {
				error
						.push(fullname
								+ ": first comment must contain either @constructor or @class");
			}
			if (isStatic) {
				result.block[0].source += block[i].source;
			} else {
				result.block[1].source += block[i].source;
			}
		}
	}

	var context = {
		require : function() {
		}
	};
	vm.runInNewContext(result.block[1].source, context, classname);
	for ( var variable in context) {
		if (typeof context[variable] === "function") {
			var qname = variable.split("$", 2);
			if (qname[0] === classname) {
				if (qname.length === 2) {
					var labels = [ "public" ];
					if (/Test$/.test(classname) && qname[1] !== "setup" && qname[1] !== "teardown") {
						labels.push("test");
					}
					methods[qname[1]] = labels;
				} else {
					error.push(fullname + ": function name '" + classname
							+ "' reserved for the constructor");
				}
			} else {
				if (qname.length === 2) {
					error.push(fullname + ": function '" + variable
							+ "' does not match class '" + classname + "'");
				} else {
					switch (qname[0]) {
					case "initialize":
					case "setup":
					case "teardown":
						methods[qname[0]] = [ "private" ];
						break;
					default:
						break;
					}
				}
			}
		}
	}
}

/**
 * Called when work on bootstrapping from the filesystem has been done. If all
 * work has been done this function will invoke the registered continuations.
 */
function done() {
	if (--todo === 0) {
		var size = continuation.length;
		for ( var i = 0; i < size; ++i) {
			continuation.shift()();
		}
	}
}

/**
 * Boots files from a subtree in the filesystem into a JSON object. Once the
 * asynchronous construction of this JSON object is complete, the Done method
 * has been called a sufficient amount of times to make the todo variable zero.
 * 
 * @param prefix
 *            {String} prefix at which the subtree in the filesystem starts
 * @param {Object}
 *            the JSON object in which the result is stored
 */
function Boot$boot(prefix, result) {
	function recurse(filename, files, result) {
		todo += files.length;

		function process() {
			var file = files.shift();
			function stat(err, stats) {
				function onDirectory(err, files) {
					if (!result[file]) {
						result[file] = new Object();
					}
					recurse(path.join(filename, file), files, result[file]);
					done();
				}

				function onContent(err, content) {
					console.assert(file.substr(-3) === ".js");
					var classname = file.substr(0, file.length - 3);
					console.assert(!result[classname]);
					result[classname] = new Object();
					parse(filename.split("/").join("."), classname, content,
							result[classname]);
					done();
				}

				if (stats.isDirectory()) {
					fs.readdir(path.resolve(prefix, filename, file),
							onDirectory);
				} else {
					fs.readFile(path.resolve(prefix, filename, file), "utf-8",
							onContent);
				}
			}
			if (file) {
				fs.stat(path.resolve(prefix, filename, file), stat);
				process();
			}
		}
		process();
	}

	recurse(".", [ "." ], result);
}

/**
 * Constructor for creating streams for writing to a file. This is used only by
 * the boot function (do not confuse with the Boot$boot function).
 * 
 * @param filename
 *            {String} name of the file to write to
 * @param done
 *            {Function} function to call when creation has been done
 * @constructor
 */
function OutputStream(filename, done, cache) {
	var fd = -1;
	var indent = 0;
	var content = "";

	function callback(err, newfd) {
		console.assert(fd < 0);
		if (err) {
			console.log(err);
		}
		fd = newfd;
		if (done) {
			done();
		}
		console.assert(fd >= 0);
	}

	function OutputStream$getCache() {
		return new Buffer(content);
	}

	function OutputStream$indent() {
		++indent;
	}

	function OutputStream$unindent() {
		--indent;
	}

	function OutputStream$write(str) {
		if (indent > 0) {
			var subst = "\n";
			for ( var i = 0; i < indent; ++i) {
				subst += "\t";
			}
			str = str.replace(/\n/g, subst);
		}
		if (cache) {
			content += str;
		}
		if (filename) {
			console.assert(fd >= 0);
			fs.write(fd, str);
		}
	}

	this.write = OutputStream$write;
	this.getCache = OutputStream$getCache;

	if (filename) {
		fs.open(filename, "w", callback);
	}
	console.assert(fd < 0);
	console.assert(content === "");
}

/**
 * This function is called only if this script is run directly on NodeJS;
 * execution is skipped if a new instance is created.
 */
function boot(stdin) {
	path = require("path");
	fs = require("fs");
	vm = require("vm");

	Boot$setJavascriptStream(new OutputStream(null, null, true));
	Boot$setXMLStream(new OutputStream(null, null, true));

	console.assert(todo === 0);
	todo = 1;
	var nodexml = null;

	var result = new Object();

	function callback() {
		Boot$continuation(result);
		process.stdout.write("<badgerfish>");
		var buffer = output.getCache();
		process.stdout.write(buffer.toString("utf8"));
		process.stdout.write("<script>");
		buffer = stream.getCache();
		process.stdout.write(buffer.toString("base64"));
		process.stdout.write("</script></badgerfish>");
	}

	Boot$ready(callback);

	function search(dir) {
		var prefix = dir;
		dir = path.resolve(prefix, "..");

		function callback(err, stats) {
			var exists = stats ? true : false;
			if (exists) {
				if (!nodexml) {
					nodexml = path.resolve(prefix, "target", "dependency",
							"node-xml", "lib", "node-xml.js");
					stream.write(fs.readFileSync(nodexml, 'utf8'));
				}
				Boot$boot(path.resolve(prefix, "src", "main", "javascript"),
						result);
				Boot$boot(path.resolve(prefix, "src", "test", "javascript"),
						result);
			}
			if (prefix === dir) {
				done();
			} else {
				search(dir);
			}
		}

		fs.stat(path.resolve(prefix, "pom.xml"), callback);
	}

	search(".");
}

if (this.constructor.name === "Object") {
	if (typeof process !== "undefined") {
		var buffer = new Buffer(CPX.CONF, "base64");
		boot(buffer.toString("utf8"));
	}
}
